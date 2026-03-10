import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { rankDeals } from "@/lib/ranking";

/**
 * GET /api/deals
 * Returns the best recent deals (deal feed for homepage).
 * Query params: limit (default 20)
 */
export async function GET(req: NextRequest) {
  const limit = parseInt(req.nextUrl.searchParams.get("limit") || "20");

  const db = getDb();
  const rows = db
    .prepare(
      `SELECT * FROM award_deals
       WHERE cents_per_point >= 1.8
       ORDER BY cents_per_point DESC
       LIMIT ?`
    )
    .all(limit);

  const deals = rankDeals(rows as any[]);

  return NextResponse.json({ deals, count: deals.length });
}
