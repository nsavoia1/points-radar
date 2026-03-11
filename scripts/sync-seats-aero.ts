/**
 * Sync script: pulls award availability from seats.aero and upserts into Neon Postgres.
 *
 * Usage:
 *   npx tsx scripts/sync-seats-aero.ts
 *
 * Run on a cron (e.g. every 4-6 hours) to keep data fresh.
 * At ~154 routes and 1000 calls/day, you can refresh ~6x per day.
 */

import { neon } from "@neondatabase/serverless";
import * as dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

import { getCityName } from "../src/lib/airports";

const sql = neon(process.env.DATABASE_URL!);

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
  // Ensure table exists
  await sql`
    CREATE TABLE IF NOT EXISTS award_deals (
      id SERIAL PRIMARY KEY,
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
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `;

  let totalDeals = 0;
  let apiCalls = 0;

  const tasks: { origin: string; source: string }[] = [];
  for (const origin of ORIGINS) {
    for (const source of SOURCES) {
      tasks.push({ origin, source });
    }
  }

  console.log(`Starting sync: ${tasks.length} origin/source pairs\n`);

  for (const { origin, source } of tasks) {
    apiCalls++;
    process.stdout.write(`[${apiCalls}/${tasks.length}] ${origin} / ${source}...`);

    const results = await fetchAvailability(origin, source);
    const programName = SOURCE_TO_PROGRAM[source] || source;

    // Clear old data for this origin/program
    await sql`DELETE FROM award_deals WHERE source = 'seats.aero' AND origin = ${origin} AND airline_program = ${programName}`;

    let count = 0;
    for (const avail of results) {
      const cabins = [
        { letter: "Y", available: avail.YAvailable, cost: avail.YMileageCost },
        { letter: "W", available: avail.WAvailable, cost: avail.WMileageCost },
        { letter: "J", available: avail.JAvailable, cost: avail.JMileageCost },
        { letter: "F", available: avail.FAvailable, cost: avail.FMileageCost },
      ];

      for (const cabin of cabins) {
        if (!cabin.available) continue;
        const points = parseMileageCost(cabin.cost);
        if (!points) continue;

        const cabinClass = CABIN_LETTER[cabin.letter] || "economy";
        const dest = avail.Route.DestinationAirport;
        const cashPrice = estimateCashPrice(origin, dest, cabinClass);
        const cpp = Math.round(((cashPrice * 100) / points) * 100) / 100;

        await sql`
          INSERT INTO award_deals (origin, destination, origin_city, destination_city, airline_program, cabin_class, points_required, cash_price_usd, cents_per_point, departure_date, is_round_trip, source)
          VALUES (${origin}, ${dest}, ${getCityName(origin)}, ${getCityName(dest)}, ${programName}, ${cabinClass}, ${points}, ${cashPrice}, ${cpp}, ${avail.Date}, 0, 'seats.aero')
        `;
        count++;
      }
    }

    totalDeals += count;
    console.log(` ${count} deals`);

    // Small delay to be nice to the API
    await new Promise((r) => setTimeout(r, 200));
  }

  // Clean up expired deals
  const deleted = await sql`DELETE FROM award_deals WHERE departure_date < CURRENT_DATE`;

  console.log(`\nSync complete:`);
  console.log(`  API calls: ${apiCalls}`);
  console.log(`  Deals synced: ${totalDeals}`);
  console.log(`  Expired deals cleaned: ${deleted.length || 0}`);
}

main().catch((err) => {
  console.error("Sync failed:", err);
  process.exit(1);
});
