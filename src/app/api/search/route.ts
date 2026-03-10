import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { rankDeals } from "@/lib/ranking";
import { getAirlinePrograms } from "@/lib/programs";

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

  const db = getDb();

  // Build query dynamically
  const conditions: string[] = ["origin = ?"];
  const params: (string | number)[] = [origin];

  if (destination) {
    conditions.push("destination = ?");
    params.push(destination);
  }

  // Match any of the airline programs this card transfers to
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
  const rows = db.prepare(sql).all(...params);

  const deals = rankDeals(rows as any[]);

  return NextResponse.json({
    deals,
    count: deals.length,
    programs_searched: airlinePrograms,
  });
}
