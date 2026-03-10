import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { rankDeals, filterByBalance } from "@/lib/ranking";
import { getAirlinePrograms } from "@/lib/programs";

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
  const rows = db.prepare(sql).all(...params);

  const deals = rankDeals(filterByBalance(rows as any[], points));

  return NextResponse.json({
    deals,
    count: deals.length,
    points_balance: points,
    programs_searched: airlinePrograms,
  });
}
