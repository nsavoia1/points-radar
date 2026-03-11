/**
 * Airport database with city names, codes, and metro area groupings.
 * Covers major US + international airports that matter for award travel.
 */

export interface Airport {
  iata: string;
  name: string;
  city: string;
  country: string;
  metro?: string; // metro area key, e.g. "NYC"
}

export interface MetroArea {
  key: string;
  label: string;
  airports: string[]; // IATA codes
}

export const METRO_AREAS: MetroArea[] = [
  { key: "NYC", label: "New York Area", airports: ["JFK", "EWR", "LGA"] },
  { key: "WAS", label: "Washington DC Area", airports: ["IAD", "DCA", "BWI"] },
  { key: "CHI", label: "Chicago Area", airports: ["ORD", "MDW"] },
  { key: "LAX", label: "Los Angeles Area", airports: ["LAX", "SNA", "BUR", "ONT"] },
  { key: "SFO", label: "San Francisco Bay Area", airports: ["SFO", "OAK", "SJC"] },
  { key: "MIA", label: "Miami / South Florida", airports: ["MIA", "FLL", "PBI"] },
  { key: "LON", label: "London Area", airports: ["LHR", "LGW", "STN", "LTN"] },
  { key: "PAR", label: "Paris Area", airports: ["CDG", "ORY"] },
  { key: "TYO", label: "Tokyo Area", airports: ["NRT", "HND"] },
  { key: "SEL", label: "Seoul Area", airports: ["ICN", "GMP"] },
  { key: "SHA", label: "Shanghai Area", airports: ["PVG", "SHA"] },
  { key: "BJS", label: "Beijing Area", airports: ["PEK", "PKX"] },
  { key: "MIL", label: "Milan Area", airports: ["MXP", "LIN"] },
  { key: "ROM", label: "Rome Area", airports: ["FCO", "CIA"] },
  { key: "HOU", label: "Houston Area", airports: ["IAH", "HOU"] },
  { key: "DFW", label: "Dallas Area", airports: ["DFW", "DAL"] },
];

export const AIRPORTS: Airport[] = [
  // ---- United States ----
  { iata: "JFK", name: "John F. Kennedy International", city: "New York", country: "US", metro: "NYC" },
  { iata: "EWR", name: "Newark Liberty International", city: "Newark", country: "US", metro: "NYC" },
  { iata: "LGA", name: "LaGuardia", city: "New York", country: "US", metro: "NYC" },
  { iata: "LAX", name: "Los Angeles International", city: "Los Angeles", country: "US", metro: "LAX" },
  { iata: "SFO", name: "San Francisco International", city: "San Francisco", country: "US", metro: "SFO" },
  { iata: "OAK", name: "Oakland International", city: "Oakland", country: "US", metro: "SFO" },
  { iata: "SJC", name: "San Jose International", city: "San Jose", country: "US", metro: "SFO" },
  { iata: "ORD", name: "O'Hare International", city: "Chicago", country: "US", metro: "CHI" },
  { iata: "MDW", name: "Midway International", city: "Chicago", country: "US", metro: "CHI" },
  { iata: "BOS", name: "Logan International", city: "Boston", country: "US" },
  { iata: "SEA", name: "Seattle-Tacoma International", city: "Seattle", country: "US" },
  { iata: "MIA", name: "Miami International", city: "Miami", country: "US", metro: "MIA" },
  { iata: "FLL", name: "Fort Lauderdale-Hollywood International", city: "Fort Lauderdale", country: "US", metro: "MIA" },
  { iata: "ATL", name: "Hartsfield-Jackson International", city: "Atlanta", country: "US" },
  { iata: "DFW", name: "Dallas/Fort Worth International", city: "Dallas", country: "US", metro: "DFW" },
  { iata: "DAL", name: "Dallas Love Field", city: "Dallas", country: "US", metro: "DFW" },
  { iata: "IAD", name: "Dulles International", city: "Washington DC", country: "US", metro: "WAS" },
  { iata: "DCA", name: "Ronald Reagan National", city: "Washington DC", country: "US", metro: "WAS" },
  { iata: "BWI", name: "Baltimore/Washington International", city: "Baltimore", country: "US", metro: "WAS" },
  { iata: "IAH", name: "George Bush Intercontinental", city: "Houston", country: "US", metro: "HOU" },
  { iata: "HOU", name: "William P. Hobby", city: "Houston", country: "US", metro: "HOU" },
  { iata: "DEN", name: "Denver International", city: "Denver", country: "US" },
  { iata: "PHX", name: "Phoenix Sky Harbor", city: "Phoenix", country: "US" },
  { iata: "MSP", name: "Minneapolis-Saint Paul International", city: "Minneapolis", country: "US" },
  { iata: "DTW", name: "Detroit Metropolitan", city: "Detroit", country: "US" },
  { iata: "CLT", name: "Charlotte Douglas International", city: "Charlotte", country: "US" },
  { iata: "PHL", name: "Philadelphia International", city: "Philadelphia", country: "US" },
  { iata: "SNA", name: "John Wayne Airport", city: "Orange County", country: "US", metro: "LAX" },
  { iata: "BUR", name: "Hollywood Burbank Airport", city: "Burbank", country: "US", metro: "LAX" },
  { iata: "SAN", name: "San Diego International", city: "San Diego", country: "US" },
  { iata: "TPA", name: "Tampa International", city: "Tampa", country: "US" },
  { iata: "MCO", name: "Orlando International", city: "Orlando", country: "US" },
  { iata: "PDX", name: "Portland International", city: "Portland", country: "US" },
  { iata: "SLC", name: "Salt Lake City International", city: "Salt Lake City", country: "US" },
  { iata: "RDU", name: "Raleigh-Durham International", city: "Raleigh", country: "US" },
  { iata: "AUS", name: "Austin-Bergstrom International", city: "Austin", country: "US" },
  { iata: "BNA", name: "Nashville International", city: "Nashville", country: "US" },
  { iata: "STL", name: "St. Louis Lambert International", city: "St. Louis", country: "US" },
  { iata: "PIT", name: "Pittsburgh International", city: "Pittsburgh", country: "US" },
  { iata: "IND", name: "Indianapolis International", city: "Indianapolis", country: "US" },
  { iata: "CMH", name: "John Glenn Columbus International", city: "Columbus", country: "US" },
  { iata: "MCI", name: "Kansas City International", city: "Kansas City", country: "US" },
  { iata: "HNL", name: "Daniel K. Inouye International", city: "Honolulu", country: "US" },
  { iata: "OGG", name: "Kahului Airport", city: "Maui", country: "US" },
  { iata: "SJU", name: "Luis Muñoz Marín International", city: "San Juan", country: "US" },
  { iata: "ANC", name: "Ted Stevens Anchorage International", city: "Anchorage", country: "US" },

  // ---- Canada ----
  { iata: "YYZ", name: "Toronto Pearson International", city: "Toronto", country: "CA" },
  { iata: "YVR", name: "Vancouver International", city: "Vancouver", country: "CA" },
  { iata: "YUL", name: "Montréal-Trudeau International", city: "Montreal", country: "CA" },
  { iata: "YOW", name: "Ottawa Macdonald-Cartier International", city: "Ottawa", country: "CA" },
  { iata: "YYC", name: "Calgary International", city: "Calgary", country: "CA" },

  // ---- Europe ----
  { iata: "LHR", name: "Heathrow", city: "London", country: "GB", metro: "LON" },
  { iata: "LGW", name: "Gatwick", city: "London", country: "GB", metro: "LON" },
  { iata: "STN", name: "Stansted", city: "London", country: "GB", metro: "LON" },
  { iata: "CDG", name: "Charles de Gaulle", city: "Paris", country: "FR", metro: "PAR" },
  { iata: "ORY", name: "Orly", city: "Paris", country: "FR", metro: "PAR" },
  { iata: "FRA", name: "Frankfurt Airport", city: "Frankfurt", country: "DE" },
  { iata: "MUC", name: "Munich Airport", city: "Munich", country: "DE" },
  { iata: "AMS", name: "Amsterdam Schiphol", city: "Amsterdam", country: "NL" },
  { iata: "MAD", name: "Adolfo Suárez Madrid–Barajas", city: "Madrid", country: "ES" },
  { iata: "BCN", name: "Barcelona–El Prat", city: "Barcelona", country: "ES" },
  { iata: "FCO", name: "Leonardo da Vinci–Fiumicino", city: "Rome", country: "IT", metro: "ROM" },
  { iata: "MXP", name: "Milan Malpensa", city: "Milan", country: "IT", metro: "MIL" },
  { iata: "LIS", name: "Humberto Delgado Airport", city: "Lisbon", country: "PT" },
  { iata: "DUB", name: "Dublin Airport", city: "Dublin", country: "IE" },
  { iata: "ZRH", name: "Zürich Airport", city: "Zurich", country: "CH" },
  { iata: "VIE", name: "Vienna International", city: "Vienna", country: "AT" },
  { iata: "BRU", name: "Brussels Airport", city: "Brussels", country: "BE" },
  { iata: "CPH", name: "Copenhagen Airport", city: "Copenhagen", country: "DK" },
  { iata: "OSL", name: "Oslo Gardermoen", city: "Oslo", country: "NO" },
  { iata: "ARN", name: "Stockholm Arlanda", city: "Stockholm", country: "SE" },
  { iata: "HEL", name: "Helsinki-Vantaa", city: "Helsinki", country: "FI" },
  { iata: "WAW", name: "Warsaw Chopin", city: "Warsaw", country: "PL" },
  { iata: "PRG", name: "Václav Havel Airport", city: "Prague", country: "CZ" },
  { iata: "BUD", name: "Budapest Ferenc Liszt", city: "Budapest", country: "HU" },
  { iata: "ATH", name: "Athens International", city: "Athens", country: "GR" },
  { iata: "IST", name: "Istanbul Airport", city: "Istanbul", country: "TR" },
  { iata: "KEF", name: "Keflavík International", city: "Reykjavik", country: "IS" },
  { iata: "EDI", name: "Edinburgh Airport", city: "Edinburgh", country: "GB" },

  // ---- Asia ----
  { iata: "NRT", name: "Narita International", city: "Tokyo", country: "JP", metro: "TYO" },
  { iata: "HND", name: "Haneda Airport", city: "Tokyo", country: "JP", metro: "TYO" },
  { iata: "ICN", name: "Incheon International", city: "Seoul", country: "KR", metro: "SEL" },
  { iata: "PVG", name: "Shanghai Pudong", city: "Shanghai", country: "CN", metro: "SHA" },
  { iata: "PEK", name: "Beijing Capital International", city: "Beijing", country: "CN", metro: "BJS" },
  { iata: "HKG", name: "Hong Kong International", city: "Hong Kong", country: "HK" },
  { iata: "SIN", name: "Changi Airport", city: "Singapore", country: "SG" },
  { iata: "BKK", name: "Suvarnabhumi Airport", city: "Bangkok", country: "TH" },
  { iata: "DEL", name: "Indira Gandhi International", city: "Delhi", country: "IN" },
  { iata: "BOM", name: "Chhatrapati Shivaji Maharaj International", city: "Mumbai", country: "IN" },
  { iata: "KUL", name: "Kuala Lumpur International", city: "Kuala Lumpur", country: "MY" },
  { iata: "MNL", name: "Ninoy Aquino International", city: "Manila", country: "PH" },
  { iata: "TPE", name: "Taiwan Taoyuan International", city: "Taipei", country: "TW" },
  { iata: "CGK", name: "Soekarno-Hatta International", city: "Jakarta", country: "ID" },

  // ---- Oceania ----
  { iata: "SYD", name: "Sydney Kingsford Smith", city: "Sydney", country: "AU" },
  { iata: "MEL", name: "Melbourne Airport", city: "Melbourne", country: "AU" },
  { iata: "AKL", name: "Auckland Airport", city: "Auckland", country: "NZ" },
  { iata: "BNE", name: "Brisbane Airport", city: "Brisbane", country: "AU" },

  // ---- Middle East ----
  { iata: "DXB", name: "Dubai International", city: "Dubai", country: "AE" },
  { iata: "DOH", name: "Hamad International", city: "Doha", country: "QA" },
  { iata: "AUH", name: "Abu Dhabi International", city: "Abu Dhabi", country: "AE" },
  { iata: "TLV", name: "Ben Gurion Airport", city: "Tel Aviv", country: "IL" },
  { iata: "JED", name: "King Abdulaziz International", city: "Jeddah", country: "SA" },
  { iata: "AMM", name: "Queen Alia International", city: "Amman", country: "JO" },

  // ---- Latin America / Caribbean ----
  { iata: "MEX", name: "Mexico City International", city: "Mexico City", country: "MX" },
  { iata: "CUN", name: "Cancún International", city: "Cancun", country: "MX" },
  { iata: "GRU", name: "São Paulo–Guarulhos", city: "São Paulo", country: "BR" },
  { iata: "EZE", name: "Ministro Pistarini International", city: "Buenos Aires", country: "AR" },
  { iata: "BOG", name: "El Dorado International", city: "Bogota", country: "CO" },
  { iata: "SCL", name: "Santiago International", city: "Santiago", country: "CL" },
  { iata: "LIM", name: "Jorge Chávez International", city: "Lima", country: "PE" },
  { iata: "PTY", name: "Tocumen International", city: "Panama City", country: "PA" },
  { iata: "SJO", name: "Juan Santamaría International", city: "San Jose", country: "CR" },
  { iata: "NAS", name: "Lynden Pindling International", city: "Nassau", country: "BS" },
  { iata: "PUJ", name: "Punta Cana International", city: "Punta Cana", country: "DO" },
  { iata: "MBJ", name: "Sangster International", city: "Montego Bay", country: "JM" },

  // ---- Africa ----
  { iata: "JNB", name: "O.R. Tambo International", city: "Johannesburg", country: "ZA" },
  { iata: "CPT", name: "Cape Town International", city: "Cape Town", country: "ZA" },
  { iata: "NBO", name: "Jomo Kenyatta International", city: "Nairobi", country: "KE" },
  { iata: "ADD", name: "Bole International", city: "Addis Ababa", country: "ET" },
  { iata: "CMN", name: "Mohammed V International", city: "Casablanca", country: "MA" },
  { iata: "CAI", name: "Cairo International", city: "Cairo", country: "EG" },
];

/**
 * Search airports by query string. Matches city name, airport name, or IATA code.
 * Returns metro area suggestions when a city matches multiple airports.
 */
export interface SearchResult {
  type: "airport" | "metro";
  label: string;
  subtitle: string;
  value: string; // IATA code or metro key
  codes: string[]; // all IATA codes this represents
}

export function searchAirports(query: string, limit: number = 8): SearchResult[] {
  if (!query || query.length < 1) return [];

  const q = query.toLowerCase().trim();
  const results: SearchResult[] = [];
  const seenMetros = new Set<string>();

  // First, check if query exactly matches a metro area or city with multiple airports
  for (const metro of METRO_AREAS) {
    const matchesMetro =
      metro.label.toLowerCase().includes(q) ||
      metro.key.toLowerCase() === q;

    // Also check if any airport city in this metro matches
    const metroAirports = AIRPORTS.filter((a) => a.metro === metro.key);
    const cityMatch = metroAirports.some((a) => a.city.toLowerCase().includes(q));

    if (matchesMetro || cityMatch) {
      if (!seenMetros.has(metro.key)) {
        seenMetros.add(metro.key);
        results.push({
          type: "metro",
          label: metro.label,
          subtitle: metro.airports.join(", "),
          value: metro.key,
          codes: metro.airports,
        });
      }
    }
  }

  // Then add individual airport matches
  for (const airport of AIRPORTS) {
    const matches =
      airport.iata.toLowerCase().includes(q) ||
      airport.city.toLowerCase().includes(q) ||
      airport.name.toLowerCase().includes(q);

    if (matches) {
      results.push({
        type: "airport",
        label: `${airport.city} (${airport.iata})`,
        subtitle: airport.name,
        value: airport.iata,
        codes: [airport.iata],
      });
    }
  }

  return results.slice(0, limit);
}

/**
 * Get the city name for an IATA code.
 */
export function getCityName(iata: string): string {
  const airport = AIRPORTS.find((a) => a.iata === iata);
  return airport?.city || iata;
}
