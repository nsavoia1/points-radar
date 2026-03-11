/**
 * Rough cash price estimates for flights by region pair and cabin.
 * Used to calculate cents-per-point when seats.aero doesn't provide cash prices.
 *
 * These are ballpark round-trip USD prices. In production you'd use a
 * flight pricing API (Google Flights, Amadeus, etc.) for real prices.
 */

const REGION_PRICES: Record<string, Record<string, number>> = {
  // "originRegion-destRegion": { economy, business, first }
  "North America-Europe": { economy: 800, business: 4000, first: 8000 },
  "Europe-North America": { economy: 800, business: 4000, first: 8000 },
  "North America-Asia": { economy: 1100, business: 6000, first: 12000 },
  "Asia-North America": { economy: 1100, business: 6000, first: 12000 },
  "North America-South America": { economy: 600, business: 2500, first: 5000 },
  "South America-North America": { economy: 600, business: 2500, first: 5000 },
  "North America-Oceania": { economy: 1200, business: 7000, first: 14000 },
  "Oceania-North America": { economy: 1200, business: 7000, first: 14000 },
  "North America-Africa": { economy: 1000, business: 5000, first: 10000 },
  "Africa-North America": { economy: 1000, business: 5000, first: 10000 },
  "North America-Middle East": { economy: 900, business: 4500, first: 9000 },
  "Middle East-North America": { economy: 900, business: 4500, first: 9000 },
  "Europe-Asia": { economy: 700, business: 3500, first: 7000 },
  "Asia-Europe": { economy: 700, business: 3500, first: 7000 },
  "Europe-Africa": { economy: 500, business: 2500, first: 5000 },
  "Africa-Europe": { economy: 500, business: 2500, first: 5000 },
  "North America-Central America": { economy: 400, business: 1500, first: 3000 },
  "Central America-North America": { economy: 400, business: 1500, first: 3000 },
  "North America-Caribbean": { economy: 350, business: 1200, first: 2500 },
  "Caribbean-North America": { economy: 350, business: 1200, first: 2500 },
};

// Domestic / same-region fallback
const SAME_REGION_PRICES: Record<string, number> = {
  economy: 300,
  business: 1200,
  first: 2500,
};

// Default fallback for unknown region pairs
const DEFAULT_PRICES: Record<string, number> = {
  economy: 700,
  business: 3500,
  first: 7000,
};

/**
 * Estimate a cash price for a route based on origin/destination regions and cabin.
 */
export function estimateCashPrice(
  originRegion: string | undefined,
  destRegion: string | undefined,
  cabin: string
): number {
  const cabinKey = cabin === "premium" ? "economy" : cabin; // premium ≈ economy pricing

  if (originRegion && destRegion) {
    if (originRegion === destRegion) {
      return SAME_REGION_PRICES[cabinKey] || SAME_REGION_PRICES.economy;
    }
    const key = `${originRegion}-${destRegion}`;
    const prices = REGION_PRICES[key];
    if (prices) {
      return prices[cabinKey] || prices.economy;
    }
  }

  return DEFAULT_PRICES[cabinKey] || DEFAULT_PRICES.economy;
}

/**
 * Estimate cash price from airport codes when regions aren't available.
 */
export function estimateCashPriceByAirport(
  origin: string,
  destination: string,
  cabin: string
): number {
  const originRegion = airportToRegion(origin);
  const destRegion = airportToRegion(destination);
  return estimateCashPrice(originRegion, destRegion, cabin);
}

/**
 * Rough mapping of common airport codes to regions.
 */
function airportToRegion(iata: string): string {
  const NA = "North America";
  const EU = "Europe";
  const AS = "Asia";
  const OC = "Oceania";
  const SA = "South America";
  const AF = "Africa";
  const ME = "Middle East";
  const CA = "Central America";
  const CB = "Caribbean";

  const map: Record<string, string> = {
    // North America
    JFK: NA, EWR: NA, LGA: NA, BOS: NA, ORD: NA, LAX: NA, SFO: NA, SEA: NA,
    MIA: NA, ATL: NA, DFW: NA, IAD: NA, DCA: NA, IAH: NA, DEN: NA, PHX: NA,
    MSP: NA, DTW: NA, CLT: NA, PHL: NA, YYZ: NA, YVR: NA, YUL: NA,
    // Europe
    LHR: EU, CDG: EU, FRA: EU, AMS: EU, MAD: EU, BCN: EU, FCO: EU, MXP: EU,
    LIS: EU, DUB: EU, ZRH: EU, VIE: EU, BRU: EU, CPH: EU, OSL: EU, ARN: EU,
    HEL: EU, WAW: EU, PRG: EU, BUD: EU, ATH: EU, IST: EU,
    // Asia
    NRT: AS, HND: AS, ICN: AS, PVG: AS, PEK: AS, HKG: AS, SIN: AS, BKK: AS,
    DEL: AS, BOM: AS, KUL: AS, MNL: AS, TPE: AS, CGK: AS,
    // Oceania
    SYD: OC, MEL: OC, AKL: OC, BNE: OC,
    // South America
    GRU: SA, EZE: SA, BOG: SA, SCL: SA, LIM: SA,
    // Africa
    JNB: AF, CPT: AF, NBO: AF, ADD: AF, CMN: AF, CAI: AF,
    // Middle East
    DXB: ME, DOH: ME, AUH: ME, AMM: ME, TLV: ME, JED: ME,
    // Central America
    MEX: CA, PTY: CA, SJO: CA, GUA: CA,
    // Caribbean
    NAS: CB, CUN: CB, SJU: CB, PUJ: CB, MBJ: CB,
  };

  return map[iata] || NA; // default to NA
}
