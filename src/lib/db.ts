import Database from "better-sqlite3";
import path from "path";

const DB_PATH = path.join(process.cwd(), "points-radar.db");

let _db: Database.Database | null = null;

export function getDb(): Database.Database {
  if (!_db) {
    _db = new Database(DB_PATH);
    _db.pragma("journal_mode = WAL");
    _db.pragma("foreign_keys = ON");
    initSchema(_db);
  }
  return _db;
}

function initSchema(db: Database.Database) {
  db.exec(`
    CREATE TABLE IF NOT EXISTS award_deals (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      origin TEXT NOT NULL,
      destination TEXT NOT NULL,
      origin_city TEXT NOT NULL,
      destination_city TEXT NOT NULL,
      airline_program TEXT NOT NULL,
      cabin_class TEXT NOT NULL DEFAULT 'economy',
      points_required INTEGER NOT NULL,
      cash_price_usd INTEGER NOT NULL,
      cents_per_point REAL NOT NULL,
      departure_date TEXT NOT NULL,
      return_date TEXT,
      is_round_trip INTEGER NOT NULL DEFAULT 0,
      source TEXT NOT NULL DEFAULT 'mock',
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE INDEX IF NOT EXISTS idx_deals_origin ON award_deals(origin);
    CREATE INDEX IF NOT EXISTS idx_deals_destination ON award_deals(destination);
    CREATE INDEX IF NOT EXISTS idx_deals_program ON award_deals(airline_program);
    CREATE INDEX IF NOT EXISTS idx_deals_cpp ON award_deals(cents_per_point);
    CREATE INDEX IF NOT EXISTS idx_deals_date ON award_deals(departure_date);
    CREATE INDEX IF NOT EXISTS idx_deals_created ON award_deals(created_at);

    CREATE TABLE IF NOT EXISTS points_programs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL UNIQUE,
      transfer_partners TEXT NOT NULL DEFAULT '[]'
    );
  `);
}
