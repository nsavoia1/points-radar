/**
 * Sync script: pulls award availability from seats.aero and upserts into local DB.
 *
 * Usage:
 *   npx tsx scripts/sync-seats-aero.ts
 *
 * Run on a cron (e.g. every 4-6 hours) to keep data fresh.
 * At ~200 routes and 1000 calls/day, you can refresh 4-5x per day.
 */

import Database from "better-sqlite3";
import path from "path";
import { getCityName } from "../src/lib/airports";

const DB_PATH = path.join(process.cwd(), "points-radar.db");
const BASE_URL = "https://seats.aero/partnerapi";

const API_KEY = process.env.SEATS_AERO_API_KEY;
if (!API_KEY) {
  console.error("SEATS_AERO_API_KEY is not set. Add it to .env.local");
  process.exit(1);
}

// Popular origin airports to sync
const ORIGINS = [
  "JFK", "EWR", "BOS", "LAX", "SFO", "ORD", "IAD", "DCA",
  "MIA", "ATL", "DFW", "SEA", "DEN", "IAH", "PHX", "MSP",
  "DTW", "CLT", "PHL", "YYZ", "YVR", "YUL",
];

// Popular long-haul destinations (where award value is highest)
const DESTINATIONS = [
  "LHR", "CDG", "AMS", "FRA", "MAD", "BCN", "FCO", "LIS",
  "DUB", "NRT", "HND", "ICN", "SIN", "HKG", "BKK", "SYD",
  "DOH", "DXB", "GRU", "EZE", "BOG", "CPT", "NBO",
];

// seats.aero source IDs we care about
const SOURCES = [
  "united", "aeroplan", "flyingblue", "delta",
  "singapore", "turkish", "lifemiles",
];

const SOURCE_TO_PROGRAM: Record<string, string> = {
  united: "United MileagePlus",
  aeroplan: "Aeroplan",
  flyingblue: "Flying Blue",
  delta: "Delta SkyMiles",
  singapore: "Singapore KrisFlyer",
  turkish: "Turkish Miles&Smiles",
  lifemiles: "Avianca LifeMiles",
};

const CABIN_LETTER: Record<string, string> = {
  Y: "economy",
  W: "premium",
  J: "business",
  F: "first",
};

// Region-based cash estimates (same as cash-estimates.ts)
function estimateCashPrice(origin: string, dest: string, cabin: string): number {
  const regionMap: Record<string, string> = {
    JFK: "NA", EWR: "NA", LGA: "NA", BOS: "NA", ORD: "NA", LAX: "NA", SFO: "NA",
    SEA: "NA", MIA: "NA", ATL: "NA", DFW: "NA", IAD: "NA", DCA: "NA", IAH: "NA",
    DEN: "NA", PHX: "NA", MSP: "NA", DTW: "NA", CLT: "NA", PHL: "NA", YYZ: "NA",
    YVR: "NA", YUL: "NA",
    LHR: "EU", CDG: "EU", FRA: "EU", AMS: "EU", MAD: "EU", BCN: "EU", FCO: "EU",
    LIS: "EU", DUB: "EU", ZRH: "EU", VIE: "EU", BRU: "EU", CPH: "EU", ARN: "EU",
    NRT: "AS", HND: "AS", ICN: "AS", SIN: "AS", HKG: "AS", BKK: "AS", TPE: "AS",
    SYD: "OC", MEL: "OC", AKL: "OC",
    GRU: "SA", EZE: "SA", BOG: "SA", SCL: "SA", LIM: "SA",
    DOH: "ME", DXB: "ME", AUH: "ME",
    CPT: "AF", JNB: "AF", NBO: "AF",
  };

  const prices: Record<string, Record<string, number>> = {
    "NA-EU": { economy: 800, business: 4000, first: 8000 },
    "NA-AS": { economy: 1100, business: 6000, first: 12000 },
    "NA-OC": { economy: 1200, business: 7000, first: 14000 },
    "NA-SA": { economy: 600, business: 2500, first: 5000 },
    "NA-ME": { economy: 900, business: 4500, first: 9000 },
    "NA-AF": { economy: 1000, business: 5000, first: 10000 },
    "EU-AS": { economy: 700, business: 3500, first: 7000 },
  };

  const oReg = regionMap[origin] || "NA";
  const dReg = regionMap[dest] || "NA";

  if (oReg === dReg) {
    return cabin === "business" ? 1200 : cabin === "first" ? 2500 : 300;
  }

  const key = `${oReg}-${dReg}`;
  const rev = `${dReg}-${oReg}`;
  const p = prices[key] || prices[rev] || { economy: 700, business: 3500, first: 7000 };
  const cabinKey = cabin === "premium" ? "economy" : cabin;
  return p[cabinKey] || p.economy;
}

interface SeatsAeroAvailability {
  Route: { OriginAirport: string; DestinationAirport: string; Source: string };
  Date: string;
  YAvailable: boolean; WAvailable: boolean; JAvailable: boolean; FAvailable: boolean;
  YMileageCost: string; WMileageCost: string; JMileageCost: string; FMileageCost: string;
  YRemainingSeats: number; WRemainingSeats: number; JRemainingSeats: number; FRemainingSeats: number;
  Source: string;
}

async function fetchAvailability(origin: string, source: string): Promise<SeatsAeroAvailability[]> {
  const query = new URLSearchParams({
    origin_airport: origin,
    source,
    take: "200",
  });

  // Only look 90 days ahead
  const start = new Date();
  const end = new Date();
  end.setDate(end.getDate() + 90);
  query.set("start_date", start.toISOString().split("T")[0]);
  query.set("end_date", end.toISOString().split("T")[0]);

  const res = await fetch(`${BASE_URL}/search?${query}`, {
    headers: {
      accept: "application/json",
      "Partner-Authorization": API_KEY!,
    },
  });

  if (!res.ok) {
    if (res.status === 429) {
      console.warn(`  Rate limited on ${origin}/${source}, skipping`);
      return [];
    }
    console.error(`  API error ${res.status} for ${origin}/${source}`);
    return [];
  }

  const data = await res.json();
  return data.data || [];
}

function parseMileageCost(cost: string): number {
  if (!cost) return 0;
  return parseInt(cost.replace(/,/g, ""), 10) || 0;
}

async function main() {
  const db = new Database(DB_PATH);
  db.pragma("journal_mode = WAL");

  // Ensure table exists
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
  `);

  const upsert = db.prepare(`
    INSERT INTO award_deals (origin, destination, origin_city, destination_city,
      airline_program, cabin_class, points_required, cash_price_usd, cents_per_point,
      departure_date, is_round_trip, source, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0, 'seats.aero', datetime('now'))
    ON CONFLICT(id) DO UPDATE SET
      points_required = excluded.points_required,
      cash_price_usd = excluded.cash_price_usd,
      cents_per_point = excluded.cents_per_point,
      updated_at = datetime('now')
  `);

  // Dedup: delete old seats.aero data before inserting fresh
  const deleteOld = db.prepare(
    `DELETE FROM award_deals WHERE source = 'seats.aero' AND origin = ? AND airline_program = ?`
  );

  let totalDeals = 0;
  let apiCalls = 0;

  // Build route/source pairs, prioritizing high-value combos
  const tasks: { origin: string; source: string }[] = [];
  for (const origin of ORIGINS) {
    for (const source of SOURCES) {
      tasks.push({ origin, source });
    }
  }

  console.log(`Starting sync: ${tasks.length} origin/source pairs`);
  console.log(`API budget: ~1000 calls/day, using ${tasks.length} calls this run\n`);

  if (tasks.length > 900) {
    console.warn(`WARNING: ${tasks.length} calls is close to the 1000/day limit.`);
    console.warn(`Consider reducing ORIGINS or SOURCES.\n`);
  }

  for (const { origin, source } of tasks) {
    apiCalls++;
    process.stdout.write(`[${apiCalls}/${tasks.length}] ${origin} / ${source}...`);

    const results = await fetchAvailability(origin, source);
    const programName = SOURCE_TO_PROGRAM[source] || source;

    // Clear old data for this origin/program
    deleteOld.run(origin, programName);

    let count = 0;
    const insertBatch = db.transaction((rows: any[]) => {
      for (const row of rows) {
        upsert.run(
          row.origin, row.destination, row.origin_city, row.destination_city,
          row.airline_program, row.cabin_class, row.points_required,
          row.cash_price_usd, row.cents_per_point, row.departure_date
        );
      }
    });

    const rows: any[] = [];
    for (const avail of results) {
      const cabins = [
        { letter: "Y", available: avail.YAvailable, cost: avail.YMileageCost, seats: avail.YRemainingSeats },
        { letter: "W", available: avail.WAvailable, cost: avail.WMileageCost, seats: avail.WRemainingSeats },
        { letter: "J", available: avail.JAvailable, cost: avail.JMileageCost, seats: avail.JRemainingSeats },
        { letter: "F", available: avail.FAvailable, cost: avail.FMileageCost, seats: avail.FRemainingSeats },
      ];

      for (const cabin of cabins) {
        if (!cabin.available) continue;
        const points = parseMileageCost(cabin.cost);
        if (!points) continue;

        const cabinClass = CABIN_LETTER[cabin.letter] || "economy";
        const dest = avail.Route.DestinationAirport;
        const cashPrice = estimateCashPrice(origin, dest, cabinClass);
        const cpp = Math.round(((cashPrice * 100) / points) * 100) / 100;

        rows.push({
          origin,
          destination: dest,
          origin_city: getCityName(origin),
          destination_city: getCityName(dest),
          airline_program: programName,
          cabin_class: cabinClass,
          points_required: points,
          cash_price_usd: cashPrice,
          cents_per_point: cpp,
          departure_date: avail.Date,
        });
        count++;
      }
    }

    insertBatch(rows);
    totalDeals += count;
    console.log(` ${count} deals`);

    // Small delay to be nice to the API
    await new Promise((r) => setTimeout(r, 200));
  }

  // Clean up expired deals
  const deleted = db.prepare(
    `DELETE FROM award_deals WHERE departure_date < date('now')`
  ).run();

  console.log(`\nSync complete:`);
  console.log(`  API calls: ${apiCalls}`);
  console.log(`  Deals synced: ${totalDeals}`);
  console.log(`  Expired deals cleaned: ${deleted.changes}`);

  db.close();
}

main().catch((err) => {
  console.error("Sync failed:", err);
  process.exit(1);
});
