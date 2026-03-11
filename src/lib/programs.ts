/**
 * Maps credit card programs to airline transfer partners.
 * When a user searches with "Chase", we also search for deals
 * on any airline program Chase transfers to.
 */
export const TRANSFER_PARTNERS: Record<string, string[]> = {
  "Chase Ultimate Rewards": [
    "United MileagePlus",
    "Flying Blue",
    "British Airways Avios",
    "Southwest Rapid Rewards",
    "Singapore KrisFlyer",
    "Hyatt", // hotel but useful reference
  ],
  "Amex Membership Rewards": [
    "Delta SkyMiles",
    "Flying Blue",
    "British Airways Avios",
    "ANA Mileage Club",
    "Singapore KrisFlyer",
    "Aeroplan",
  ],
  "Capital One Miles": [
    "Flying Blue",
    "British Airways Avios",
    "Turkish Miles&Smiles",
    "Avianca LifeMiles",
    "Singapore KrisFlyer",
  ],
};

/**
 * Get all airline programs a card program can transfer to.
 * If the program is already an airline program, return it as-is.
 */
export function getAirlinePrograms(program: string): string[] {
  const partners = TRANSFER_PARTNERS[program];
  if (partners) return partners;
  // Assume it's a direct airline program
  return [program];
}

/**
 * Reverse lookup: given an airline program, return which card programs transfer to it.
 * e.g. "ANA Mileage Club" → ["Amex Membership Rewards"]
 */
export function getCardPrograms(airlineProgram: string): string[] {
  const cards: string[] = [];
  for (const [card, partners] of Object.entries(TRANSFER_PARTNERS)) {
    if (partners.includes(airlineProgram)) {
      cards.push(card);
    }
  }
  return cards;
}

/** Short display names for card programs */
const CARD_SHORT_NAMES: Record<string, string> = {
  "Chase Ultimate Rewards": "Chase",
  "Amex Membership Rewards": "Amex",
  "Capital One Miles": "Capital One",
};

export function getCardShortName(cardProgram: string): string {
  return CARD_SHORT_NAMES[cardProgram] || cardProgram;
}

export const ALL_PROGRAMS = [
  "Chase Ultimate Rewards",
  "Amex Membership Rewards",
  "Capital One Miles",
  "United MileagePlus",
  "Flying Blue",
  "British Airways Avios",
  "Delta SkyMiles",
  "ANA Mileage Club",
  "Aeroplan",
];
