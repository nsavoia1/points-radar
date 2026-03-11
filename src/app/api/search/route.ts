import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { rankDeals, computeCpp } from "@/lib/ranking";
import { getAirlinePrograms } from "@/lib/programs";
import { searchMultiplePrograms, hasApiKey } from "@/lib/seats-aero";
import { estimateCashPriceByAirport } from "@/lib/cash-estimates";

/**
 * GET /api/search — Award Deal Radar (Feature 1)
 *
 * Query params:
 *   origin       — IATA code (required)
 *   destination  — IATA code (optional)
 *   program      — points program name (required)
 *   month        — YYYY-MM (optional)
 *   cabin        — economy | business (optional)
 */
export async function GET(req: NextRequest) {
  const origin = req.nextUrl.searchParams.get("origin")?.toUpperCase();
  const destination = req.nextUrl.searchParams.get("destination")?.toUpperCase();
  const program = req.nextUrl.searchParams.get("program");
  const month = req.nextUrl.searchParams.get("month");
  const cabin = req.nextUrl.searchParams.get("cabin");

  if (!origin || !program) {
    return NextResponse.json(
      { error: "origin and program are required" },
      { status: 400 }
    );
  }

  const airlinePrograms = getAirlinePrograms(program);

  // 1. Query local DB (mock / cached data)
  const db = getDb();
  const conditions: string[] = ["origin = ?"];
  const params: (string | number)[] = [origin];

  if (destination) {
    conditions.push("destination = ?");
    params.push(destination);
  }

  const placeholders = airlinePrograms.map(() => "?").join(", ");
  conditions.push(`airline_program IN (${placeholders})`);
  params.push(...airlinePrograms);

  if (month) {
    conditions.push("departure_date LIKE ?");
    params.push(`${month}%`);
  }

  if (cabin) {
    conditions.push("cabin_class = ?");
    params.push(cabin);
  }

  const sql = `SELECT * FROM award_deals WHERE ${conditions.join(" AND ")} ORDER BY cents_per_point DESC`;
  const dbRows = db.prepare(sql).all(...params) as any[];

  // 2. If seats.aero API key is configured, fetch live data too
  let liveDeals: any[] = [];
  const useLiveApi = hasApiKey();

  if (useLiveApi) {
    const startDate = month ? `${month}-01` : undefined;
    const endDate = month ? `${month}-28` : undefined;

    const results = await searchMultiplePrograms({
      origin,
      destination,
      startDate,
      endDate,
      cabin: cabin || undefined,
      programs: airlinePrograms,
    });

    // Convert seats.aero results to our deal format
    liveDeals = results.map((r) => {
      const cashPrice = estimateCashPriceByAirport(r.origin, r.destination, r.cabin_class);
      const cpp = computeCpp(cashPrice, r.points_required);
      return {
        id: 0,
        origin: r.origin,
        destination: r.destination,
        origin_city: r.origin, // will show IATA code
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
  const deals = rankDeals(allDeals);

  return NextResponse.json({
    deals,
    count: deals.length,
    programs_searched: airlinePrograms,
    live_data: useLiveApi,
  });
}
