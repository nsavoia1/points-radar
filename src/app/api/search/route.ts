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
 *   origin       — IATA code(s), comma-separated (required)
 *   destination  — IATA code(s), comma-separated (optional)
 *   program      — points program name (required)
 *   startDate    — YYYY-MM-DD (optional)
 *   endDate      — YYYY-MM-DD (optional)
 *   cabin        — economy | business | first (optional)
 */
export async function GET(req: NextRequest) {
  const originRaw = req.nextUrl.searchParams.get("origin")?.toUpperCase();
  const destRaw = req.nextUrl.searchParams.get("destination")?.toUpperCase();
  const program = req.nextUrl.searchParams.get("program");
  const startDate = req.nextUrl.searchParams.get("startDate");
  const endDate = req.nextUrl.searchParams.get("endDate");
  const cabin = req.nextUrl.searchParams.get("cabin");

  if (!originRaw || !program) {
    return NextResponse.json(
      { error: "origin and program are required" },
      { status: 400 }
    );
  }

  const origins = originRaw.split(",").map((s) => s.trim()).filter(Boolean);
  const destinations = destRaw ? destRaw.split(",").map((s) => s.trim()).filter(Boolean) : [];
  const airlinePrograms = getAirlinePrograms(program);

  // 1. Query local DB
  const db = getDb();
  const conditions: string[] = [];
  const params: (string | number)[] = [];

  // Origin(s)
  const originPh = origins.map(() => "?").join(", ");
  conditions.push(`origin IN (${originPh})`);
  params.push(...origins);

  // Destination(s)
  if (destinations.length > 0) {
    const destPh = destinations.map(() => "?").join(", ");
    conditions.push(`destination IN (${destPh})`);
    params.push(...destinations);
  }

  // Programs
  const progPh = airlinePrograms.map(() => "?").join(", ");
  conditions.push(`airline_program IN (${progPh})`);
  params.push(...airlinePrograms);

  // Date range
  if (startDate) {
    conditions.push("departure_date >= ?");
    params.push(startDate);
  }
  if (endDate) {
    conditions.push("departure_date <= ?");
    params.push(endDate);
  }

  if (cabin) {
    conditions.push("cabin_class = ?");
    params.push(cabin);
  }

  const sql = `SELECT * FROM award_deals WHERE ${conditions.join(" AND ")} ORDER BY cents_per_point DESC`;
  const dbRows = db.prepare(sql).all(...params) as any[];

  // 2. Fetch live data if API key is set
  let liveDeals: any[] = [];
  const useLiveApi = hasApiKey();

  if (useLiveApi) {
    // seats.aero accepts comma-separated origins
    const results = await searchMultiplePrograms({
      origin: origins.join(","),
      destination: destinations.length > 0 ? destinations.join(",") : undefined,
      startDate: startDate || undefined,
      endDate: endDate || undefined,
      cabin: cabin || undefined,
      programs: airlinePrograms,
    });

    liveDeals = results.map((r) => {
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
  const deals = rankDeals(allDeals);

  return NextResponse.json({
    deals,
    count: deals.length,
    programs_searched: airlinePrograms,
    live_data: useLiveApi,
  });
}
