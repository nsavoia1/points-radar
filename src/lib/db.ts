import { neon, NeonQueryFunction } from "@neondatabase/serverless";

let _sql: NeonQueryFunction<false, false> | null = null;

export function getSQL() {
  if (!_sql) {
    _sql = neon(process.env.DATABASE_URL!);
  }
  return _sql;
}

export { getSQL as sql };

export async function initSchema() {
  const sql = getSQL();

  await sql`
    CREATE TABLE IF NOT EXISTS award_deals (
      id SERIAL PRIMARY KEY,
      origin TEXT NOT NULL,
      destination TEXT NOT NULL,
      origin_city TEXT NOT NULL,
      destination_city TEXT NOT NULL,
      airline_program TEXT NOT NULL,
      operating_airline TEXT,
      cabin_class TEXT NOT NULL DEFAULT 'economy',
      points_required INTEGER NOT NULL,
      cash_price_usd INTEGER NOT NULL,
      cents_per_point REAL NOT NULL,
      departure_date TEXT NOT NULL,
      return_date TEXT,
      departure_time TEXT,
      arrival_time TEXT,
      duration_minutes INTEGER,
      stops INTEGER NOT NULL DEFAULT 0,
      layover_airports TEXT,
      is_round_trip INTEGER NOT NULL DEFAULT 0,
      return_departure_time TEXT,
      return_arrival_time TEXT,
      return_duration_minutes INTEGER,
      return_stops INTEGER,
      return_layover_airports TEXT,
      return_operating_airline TEXT,
      source TEXT NOT NULL DEFAULT 'mock',
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `;

  await sql`CREATE INDEX IF NOT EXISTS idx_deals_origin ON award_deals(origin)`;
  await sql`CREATE INDEX IF NOT EXISTS idx_deals_destination ON award_deals(destination)`;
  await sql`CREATE INDEX IF NOT EXISTS idx_deals_program ON award_deals(airline_program)`;
  await sql`CREATE INDEX IF NOT EXISTS idx_deals_cpp ON award_deals(cents_per_point)`;
  await sql`CREATE INDEX IF NOT EXISTS idx_deals_date ON award_deals(departure_date)`;

  await sql`
    CREATE TABLE IF NOT EXISTS points_programs (
      id SERIAL PRIMARY KEY,
      name TEXT NOT NULL UNIQUE,
      transfer_partners TEXT NOT NULL DEFAULT '[]'
    )
  `;
}
