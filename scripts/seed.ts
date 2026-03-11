import { neon } from "@neondatabase/serverless";
import * as dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

const sql = neon(process.env.DATABASE_URL!);

async function main() {
  // Create tables
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

  await sql`
    CREATE TABLE IF NOT EXISTS points_programs (
      id SERIAL PRIMARY KEY,
      name TEXT NOT NULL UNIQUE,
      transfer_partners TEXT NOT NULL DEFAULT '[]'
    )
  `;

  // Clear existing seed data
  await sql`DELETE FROM award_deals WHERE source = 'mock'`;
  await sql`DELETE FROM points_programs`;

  // Seed programs
  await sql`INSERT INTO points_programs (name, transfer_partners) VALUES
    ('Chase Ultimate Rewards', ${JSON.stringify(["United MileagePlus", "Flying Blue", "British Airways Avios", "Southwest Rapid Rewards", "Singapore KrisFlyer"])}),
    ('Amex Membership Rewards', ${JSON.stringify(["Delta SkyMiles", "Flying Blue", "British Airways Avios", "ANA Mileage Club", "Singapore KrisFlyer", "Aeroplan"])}),
    ('Capital One Miles', ${JSON.stringify(["Flying Blue", "British Airways Avios", "Turkish Miles&Smiles", "Avianca LifeMiles", "Singapore KrisFlyer"])})
  `;

  // Seed award deals
  interface DealSeed {
    origin: string; destination: string; origin_city: string; destination_city: string;
    airline_program: string; cabin_class: string; points_required: number;
    cash_price_usd: number; departure_date: string; return_date: string | null; is_round_trip: number;
  }

  const deals: DealSeed[] = [
    { origin: "BOS", destination: "MAD", origin_city: "Boston", destination_city: "Madrid", airline_program: "Flying Blue", cabin_class: "economy", points_required: 34000, cash_price_usd: 850, departure_date: "2026-06-15", return_date: "2026-06-29", is_round_trip: 1 },
    { origin: "BOS", destination: "LIS", origin_city: "Boston", destination_city: "Lisbon", airline_program: "Flying Blue", cabin_class: "economy", points_required: 34000, cash_price_usd: 880, departure_date: "2026-06-10", return_date: "2026-06-24", is_round_trip: 1 },
    { origin: "JFK", destination: "CDG", origin_city: "New York", destination_city: "Paris", airline_program: "Flying Blue", cabin_class: "economy", points_required: 30000, cash_price_usd: 720, departure_date: "2026-07-01", return_date: "2026-07-15", is_round_trip: 1 },
    { origin: "JFK", destination: "CDG", origin_city: "New York", destination_city: "Paris", airline_program: "Flying Blue", cabin_class: "business", points_required: 72000, cash_price_usd: 4200, departure_date: "2026-07-01", return_date: "2026-07-15", is_round_trip: 1 },
    { origin: "LAX", destination: "CDG", origin_city: "Los Angeles", destination_city: "Paris", airline_program: "Flying Blue", cabin_class: "economy", points_required: 38000, cash_price_usd: 780, departure_date: "2026-06-20", return_date: "2026-07-04", is_round_trip: 1 },
    { origin: "ORD", destination: "AMS", origin_city: "Chicago", destination_city: "Amsterdam", airline_program: "Flying Blue", cabin_class: "economy", points_required: 32000, cash_price_usd: 690, departure_date: "2026-06-12", return_date: "2026-06-26", is_round_trip: 1 },
    { origin: "BOS", destination: "NRT", origin_city: "Boston", destination_city: "Tokyo", airline_program: "United MileagePlus", cabin_class: "economy", points_required: 60000, cash_price_usd: 1200, departure_date: "2026-09-01", return_date: "2026-09-15", is_round_trip: 1 },
    { origin: "SFO", destination: "NRT", origin_city: "San Francisco", destination_city: "Tokyo", airline_program: "United MileagePlus", cabin_class: "economy", points_required: 50000, cash_price_usd: 950, departure_date: "2026-08-15", return_date: "2026-08-29", is_round_trip: 1 },
    { origin: "EWR", destination: "LHR", origin_city: "Newark", destination_city: "London", airline_program: "United MileagePlus", cabin_class: "economy", points_required: 45000, cash_price_usd: 820, departure_date: "2026-07-10", return_date: "2026-07-24", is_round_trip: 1 },
    { origin: "IAD", destination: "FRA", origin_city: "Washington DC", destination_city: "Frankfurt", airline_program: "United MileagePlus", cabin_class: "business", points_required: 88000, cash_price_usd: 5100, departure_date: "2026-09-05", return_date: "2026-09-19", is_round_trip: 1 },
    { origin: "BOS", destination: "DUB", origin_city: "Boston", destination_city: "Dublin", airline_program: "British Airways Avios", cabin_class: "economy", points_required: 26000, cash_price_usd: 580, departure_date: "2026-06-20", return_date: "2026-07-04", is_round_trip: 1 },
    { origin: "JFK", destination: "LHR", origin_city: "New York", destination_city: "London", airline_program: "British Airways Avios", cabin_class: "economy", points_required: 26000, cash_price_usd: 650, departure_date: "2026-07-05", return_date: "2026-07-19", is_round_trip: 1 },
    { origin: "MIA", destination: "NAS", origin_city: "Miami", destination_city: "Nassau", airline_program: "British Airways Avios", cabin_class: "economy", points_required: 9000, cash_price_usd: 320, departure_date: "2026-06-08", return_date: null, is_round_trip: 0 },
    { origin: "ATL", destination: "FCO", origin_city: "Atlanta", destination_city: "Rome", airline_program: "Delta SkyMiles", cabin_class: "economy", points_required: 48000, cash_price_usd: 920, departure_date: "2026-06-18", return_date: "2026-07-02", is_round_trip: 1 },
    { origin: "JFK", destination: "BCN", origin_city: "New York", destination_city: "Barcelona", airline_program: "Delta SkyMiles", cabin_class: "economy", points_required: 42000, cash_price_usd: 780, departure_date: "2026-07-15", return_date: "2026-07-29", is_round_trip: 1 },
    { origin: "SEA", destination: "HND", origin_city: "Seattle", destination_city: "Tokyo", airline_program: "Delta SkyMiles", cabin_class: "business", points_required: 120000, cash_price_usd: 6800, departure_date: "2026-08-01", return_date: "2026-08-15", is_round_trip: 1 },
    { origin: "JFK", destination: "NRT", origin_city: "New York", destination_city: "Tokyo", airline_program: "ANA Mileage Club", cabin_class: "business", points_required: 85000, cash_price_usd: 7500, departure_date: "2026-10-01", return_date: "2026-10-15", is_round_trip: 1 },
    { origin: "LAX", destination: "NRT", origin_city: "Los Angeles", destination_city: "Tokyo", airline_program: "ANA Mileage Club", cabin_class: "business", points_required: 85000, cash_price_usd: 7200, departure_date: "2026-09-15", return_date: "2026-09-29", is_round_trip: 1 },
    { origin: "YYZ", destination: "LIS", origin_city: "Toronto", destination_city: "Lisbon", airline_program: "Aeroplan", cabin_class: "economy", points_required: 40000, cash_price_usd: 820, departure_date: "2026-07-20", return_date: "2026-08-03", is_round_trip: 1 },
    { origin: "BOS", destination: "FCO", origin_city: "Boston", destination_city: "Rome", airline_program: "Aeroplan", cabin_class: "economy", points_required: 48000, cash_price_usd: 1050, departure_date: "2026-06-25", return_date: "2026-07-09", is_round_trip: 1 },
    { origin: "BOS", destination: "BCN", origin_city: "Boston", destination_city: "Barcelona", airline_program: "Flying Blue", cabin_class: "economy", points_required: 36000, cash_price_usd: 820, departure_date: "2026-06-22", return_date: "2026-07-06", is_round_trip: 1 },
    { origin: "BOS", destination: "FCO", origin_city: "Boston", destination_city: "Rome", airline_program: "United MileagePlus", cabin_class: "economy", points_required: 55000, cash_price_usd: 1100, departure_date: "2026-07-05", return_date: "2026-07-19", is_round_trip: 1 },
    { origin: "BOS", destination: "LHR", origin_city: "Boston", destination_city: "London", airline_program: "British Airways Avios", cabin_class: "economy", points_required: 26000, cash_price_usd: 620, departure_date: "2026-06-18", return_date: "2026-07-02", is_round_trip: 1 },
    { origin: "LAX", destination: "CUN", origin_city: "Los Angeles", destination_city: "Cancun", airline_program: "Delta SkyMiles", cabin_class: "economy", points_required: 25000, cash_price_usd: 350, departure_date: "2026-06-20", return_date: "2026-06-27", is_round_trip: 1 },
    { origin: "ORD", destination: "MIA", origin_city: "Chicago", destination_city: "Miami", airline_program: "United MileagePlus", cabin_class: "economy", points_required: 15000, cash_price_usd: 180, departure_date: "2026-06-14", return_date: null, is_round_trip: 0 },
  ];

  for (const d of deals) {
    const cpp = Math.round(((d.cash_price_usd * 100) / d.points_required) * 100) / 100;
    await sql`
      INSERT INTO award_deals (origin, destination, origin_city, destination_city, airline_program, cabin_class, points_required, cash_price_usd, cents_per_point, departure_date, return_date, is_round_trip, source)
      VALUES (${d.origin}, ${d.destination}, ${d.origin_city}, ${d.destination_city}, ${d.airline_program}, ${d.cabin_class}, ${d.points_required}, ${d.cash_price_usd}, ${cpp}, ${d.departure_date}, ${d.return_date}, ${d.is_round_trip}, 'mock')
    `;
  }

  console.log(`Seeded ${deals.length} award deals.`);
}

main().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
