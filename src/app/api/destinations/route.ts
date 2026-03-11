import { NextRequest, NextResponse } from "next/server";
import { getSQL } from "@/lib/db";
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

  // 1. Query Postgres
  const sql = getSQL();
  const dbRows = await sql`
    SELECT * FROM award_deals
    WHERE origin = ANY(${origins})
    AND points_required <= ${points}
    AND airline_program = ANY(${airlinePrograms})
    AND (${!startDate}::boolean OR departure_date >= ${startDate || ''})
    AND (${!endDate}::boolean OR departure_date <= ${endDate || ''})
    ORDER BY cents_per_point DESC
  `;

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
  const allDeals = [...(dbRows as any[]), ...liveDeals];
  const deals = rankDeals(filterByBalance(allDeals, points));

  return NextResponse.json({
    deals,
    count: deals.length,
    points_balance: points,
    programs_searched: airlinePrograms,
    live_data: useLiveApi,
  });
}
