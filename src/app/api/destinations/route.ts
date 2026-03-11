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
 *   origin   — IATA code (required)
 *   points   — points balance (required)
 *   program  — points program name (required)
 *   month    — YYYY-MM (optional)
 */
export async function GET(req: NextRequest) {
  const origin = req.nextUrl.searchParams.get("origin")?.toUpperCase();
  const points = parseInt(req.nextUrl.searchParams.get("points") || "0");
  const program = req.nextUrl.searchParams.get("program");
  const month = req.nextUrl.searchParams.get("month");

  if (!origin || !points || !program) {
    return NextResponse.json(
      { error: "origin, points, and program are required" },
      { status: 400 }
    );
  }

  const airlinePrograms = getAirlinePrograms(program);

  // 1. Query local DB
  const db = getDb();
  const conditions: string[] = ["origin = ?", "points_required <= ?"];
  const params: (string | number)[] = [origin, points];

  const placeholders = airlinePrograms.map(() => "?").join(", ");
  conditions.push(`airline_program IN (${placeholders})`);
  params.push(...airlinePrograms);

  if (month) {
    conditions.push("departure_date LIKE ?");
    params.push(`${month}%`);
  }

  const sql = `SELECT * FROM award_deals WHERE ${conditions.join(" AND ")} ORDER BY cents_per_point DESC`;
  const dbRows = db.prepare(sql).all(...params) as any[];

  // 2. Fetch live data if available
  let liveDeals: any[] = [];
  const useLiveApi = hasApiKey();

  if (useLiveApi) {
    const startDate = month ? `${month}-01` : undefined;
    const endDate = month ? `${month}-28` : undefined;

    const results = await searchMultiplePrograms({
      origin,
      startDate,
      endDate,
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
