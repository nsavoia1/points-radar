import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { rankDeals, filterByBalance, computeCpp } from "@/lib/ranking";
import { getAirlinePrograms } from "@/lib/programs";
import { searchMultiplePrograms, hasApiKey } from "@/lib/seats-aero";
import { estimateCashPriceByAirport } from "@/lib/cash-estimates";

/**
 * GET /api/destinations — "Where Can I Go?" (Feature 2)
 *
 * Query params:
 *   origin    — IATA code(s), comma-separated (required)
 *   points    — points balance (required)
 *   program   — points program name (required)
 *   startDate — YYYY-MM-DD (optional)
 *   endDate   — YYYY-MM-DD (optional)
 */
export async function GET(req: NextRequest) {
  const originRaw = req.nextUrl.searchParams.get("origin")?.toUpperCase();
  const points = parseInt(req.nextUrl.searchParams.get("points") || "0");
  const program = req.nextUrl.searchParams.get("program");
  const startDate = req.nextUrl.searchParams.get("startDate");
  const endDate = req.nextUrl.searchParams.get("endDate");

  if (!originRaw || !points || !program) {
    return NextResponse.json(
      { error: "origin, points, and program are required" },
      { status: 400 }
    );
  }

  const origins = originRaw.split(",").map((s) => s.trim()).filter(Boolean);
  const airlinePrograms = getAirlinePrograms(program);

  // 1. Query local DB
  const db = getDb();
  const conditions: string[] = [];
  const params: (string | number)[] = [];

  const originPh = origins.map(() => "?").join(", ");
  conditions.push(`origin IN (${originPh})`);
  params.push(...origins);

  conditions.push("points_required <= ?");
  params.push(points);

  const progPh = airlinePrograms.map(() => "?").join(", ");
  conditions.push(`airline_program IN (${progPh})`);
  params.push(...airlinePrograms);

  if (startDate) {
    conditions.push("departure_date >= ?");
    params.push(startDate);
  }
  if (endDate) {
    conditions.push("departure_date <= ?");
    params.push(endDate);
  }

  const sql = `SELECT * FROM award_deals WHERE ${conditions.join(" AND ")} ORDER BY cents_per_point DESC`;
  const dbRows = db.prepare(sql).all(...params) as any[];

  // 2. Fetch live data if available
  let liveDeals: any[] = [];
  const useLiveApi = hasApiKey();

  if (useLiveApi) {
    const results = await searchMultiplePrograms({
      origin: origins.join(","),
      startDate: startDate || undefined,
      endDate: endDate || undefined,
      programs: airlinePrograms,
    });

    liveDeals = results
      .filter((r) => r.points_required <= points)
      .map((r) => {
        const cashPrice = estimateCashPriceByAirport(r.origin, r.destination, r.cabin_class);
        const cpp = computeCpp(cashPrice, r.points_required);
        return {
          id: 0,
          origin: r.origin,
          destination: r.destination,
          origin_city: r.origin,
          destination_city: r.destination,
          airline_program: r.airline_program,
          cabin_class: r.cabin_class,
          points_required: r.points_required,
          cash_price_usd: cashPrice,
          cents_per_point: cpp,
          departure_date: r.departure_date,
          return_date: null,
          is_round_trip: 0,
          source: "seats.aero",
          created_at: new Date().toISOString(),
        };
      });
  }

  // 3. Merge and rank
  const allDeals = [...dbRows, ...liveDeals];
  const deals = rankDeals(filterByBalance(allDeals, points));

  return NextResponse.json({
    deals,
    count: deals.length,
    points_balance: points,
    programs_searched: airlinePrograms,
    live_data: useLiveApi,
  });
}
