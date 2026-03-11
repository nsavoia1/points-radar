/**
 * Seats.aero API client
 *
 * Uses the Partner API (cached search endpoint) to find award availability.
 * Requires a SEATS_AERO_API_KEY environment variable.
 *
 * API docs: https://developers.seats.aero/reference
 */

const BASE_URL = "https://seats.aero/partnerapi";

// Maps our program names → seats.aero "source" identifiers
const PROGRAM_TO_SOURCE: Record<string, string> = {
  "United MileagePlus": "united",
  "Flying Blue": "flyingblue",
  "British Airways Avios": "ba", // not available on seats.aero — will skip
  "Delta SkyMiles": "delta",
  "ANA Mileage Club": "ana", // not available — skip
  "Aeroplan": "aeroplan",
  "Singapore KrisFlyer": "singapore",
  "Southwest Rapid Rewards": "", // not on seats.aero
  "Turkish Miles&Smiles": "turkish",
  "Avianca LifeMiles": "lifemiles",
};

// seats.aero cabin codes
type CabinCode = "economy" | "premium" | "business" | "first";

const CABIN_MAP: Record<string, CabinCode> = {
  economy: "economy",
  business: "business",
  first: "first",
  premium: "premium",
};

// Cabin letter → our label
const CABIN_LETTER: Record<string, string> = {
  Y: "economy",
  W: "premium",
  J: "business",
  F: "first",
};

export interface SeatsAeroResult {
  origin: string;
  destination: string;
  airline_program: string;
  cabin_class: string;
  points_required: number;
  departure_date: string;
  source: string;
  remaining_seats: number;
}

interface SeatsAeroAvailability {
  ID: string;
  Route: {
    OriginAirport: string;
    DestinationAirport: string;
    OriginRegion: string;
    DestinationRegion: string;
    Source: string;
  };
  Date: string;
  YAvailable: boolean;
  WAvailable: boolean;
  JAvailable: boolean;
  FAvailable: boolean;
  YMileageCost: string;
  WMileageCost: string;
  JMileageCost: string;
  FMileageCost: string;
  YRemainingSeats: number;
  WRemainingSeats: number;
  JRemainingSeats: number;
  FRemainingSeats: number;
  Source: string;
  UpdatedAt: string;
}

interface SearchResponse {
  data: SeatsAeroAvailability[];
  count: number;
  hasMore: boolean;
  cursor: number;
}

/**
 * Check if the seats.aero API key is configured.
 */
export function hasApiKey(): boolean {
  return !!process.env.SEATS_AERO_API_KEY;
}

/**
 * Get the seats.aero source ID for a program name.
 * Returns null if the program isn't supported on seats.aero.
 */
export function getSourceForProgram(program: string): string | null {
  const source = PROGRAM_TO_SOURCE[program];
  return source || null;
}

/**
 * Search seats.aero cached availability.
 */
export async function searchAvailability(params: {
  origin: string;
  destination?: string;
  startDate?: string;
  endDate?: string;
  cabin?: string;
  source?: string;
}): Promise<SeatsAeroResult[]> {
  const apiKey = process.env.SEATS_AERO_API_KEY;
  if (!apiKey) return [];

  const query = new URLSearchParams();
  query.set("origin_airport", params.origin);
  if (params.destination) query.set("destination_airport", params.destination);
  if (params.startDate) query.set("start_date", params.startDate);
  if (params.endDate) query.set("end_date", params.endDate);
  if (params.cabin) {
    const mapped = CABIN_MAP[params.cabin];
    if (mapped) query.set("cabin", mapped);
  }
  if (params.source) query.set("source", params.source);
  query.set("take", "200");

  const url = `${BASE_URL}/search?${query.toString()}`;

  try {
    const res = await fetch(url, {
      headers: {
        accept: "application/json",
        "Partner-Authorization": apiKey,
      },
    });

    if (!res.ok) {
      console.error(`seats.aero API error: ${res.status} ${res.statusText}`);
      return [];
    }

    const data: SearchResponse = await res.json();
    return parseResults(data.data);
  } catch (err) {
    console.error("seats.aero API request failed:", err);
    return [];
  }
}

/**
 * Search across multiple airline programs (transfer partners).
 */
export async function searchMultiplePrograms(params: {
  origin: string;
  destination?: string;
  startDate?: string;
  endDate?: string;
  cabin?: string;
  programs: string[];
}): Promise<SeatsAeroResult[]> {
  if (!hasApiKey()) return [];

  // Get unique sources for all programs
  const sources = new Set<string>();
  for (const prog of params.programs) {
    const source = getSourceForProgram(prog);
    if (source) sources.add(source);
  }

  if (sources.size === 0) return [];

  // Search all sources in parallel
  const promises = Array.from(sources).map((source) =>
    searchAvailability({ ...params, source })
  );

  const results = await Promise.all(promises);
  return results.flat();
}

/**
 * Parse raw seats.aero response into our standardized format.
 * Each availability row can have multiple cabins available.
 */
function parseResults(data: SeatsAeroAvailability[]): SeatsAeroResult[] {
  if (!data) return [];

  const results: SeatsAeroResult[] = [];

  for (const row of data) {
    const cabins: { letter: string; available: boolean; cost: string; seats: number }[] = [
      { letter: "Y", available: row.YAvailable, cost: row.YMileageCost, seats: row.YRemainingSeats },
      { letter: "W", available: row.WAvailable, cost: row.WMileageCost, seats: row.WRemainingSeats },
      { letter: "J", available: row.JAvailable, cost: row.JMileageCost, seats: row.JRemainingSeats },
      { letter: "F", available: row.FAvailable, cost: row.FMileageCost, seats: row.FRemainingSeats },
    ];

    for (const cabin of cabins) {
      if (!cabin.available) continue;

      const points = parseMileageCost(cabin.cost);
      if (!points || points === 0) continue;

      results.push({
        origin: row.Route.OriginAirport,
        destination: row.Route.DestinationAirport,
        airline_program: sourceToProgram(row.Source),
        cabin_class: CABIN_LETTER[cabin.letter] || "economy",
        points_required: points,
        departure_date: row.Date,
        source: "seats.aero",
        remaining_seats: cabin.seats,
      });
    }
  }

  return results;
}

/**
 * Parse mileage cost string like "50,000" or "50000" to number.
 */
function parseMileageCost(cost: string): number {
  if (!cost) return 0;
  return parseInt(cost.replace(/,/g, ""), 10) || 0;
}

/**
 * Map seats.aero source back to our program name.
 */
function sourceToProgram(source: string): string {
  for (const [program, src] of Object.entries(PROGRAM_TO_SOURCE)) {
    if (src === source) return program;
  }
  return source;
}
