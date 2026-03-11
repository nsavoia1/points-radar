export interface Deal {
  id: number;
  origin: string;
  destination: string;
  origin_city: string;
  destination_city: string;
  airline_program: string;
  cabin_class: string;
  points_required: number;
  cash_price_usd: number;
  cents_per_point: number;
  departure_date: string;
  return_date: string | null;
  is_round_trip: number;
  source: string;
  created_at: string;
}

const MIN_CPP = 1.5;

/**
 * Compute cents-per-point value.
 * cpp = (cash_price_cents) / points_required
 */
export function computeCpp(cashPriceUsd: number, pointsRequired: number): number {
  if (pointsRequired <= 0) return 0;
  return Math.round(((cashPriceUsd * 100) / pointsRequired) * 100) / 100;
}

/**
 * Filter deals to only those above the minimum cpp threshold,
 * then sort by cpp descending (best value first).
 */
export function rankDeals(deals: Deal[], minCpp: number = MIN_CPP): Deal[] {
  return deals
    .filter((d) => d.cents_per_point >= minCpp)
    .sort((a, b) => b.cents_per_point - a.cents_per_point);
}

/**
 * Given a points balance, filter to deals the user can actually book.
 */
export function filterByBalance(deals: Deal[], pointsBalance: number): Deal[] {
  return deals.filter((d) => d.points_required <= pointsBalance);
}
