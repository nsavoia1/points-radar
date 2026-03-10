"use client";

import { useEffect, useState } from "react";
import { DealCard } from "@/components/DealCard";

interface Deal {
  id: number;
  origin_city: string;
  destination_city: string;
  origin: string;
  destination: string;
  airline_program: string;
  cabin_class: string;
  points_required: number;
  cash_price_usd: number;
  cents_per_point: number;
  departure_date: string;
  return_date: string | null;
}

export default function HomePage() {
  const [deals, setDeals] = useState<Deal[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/deals?limit=12")
      .then((r) => r.json())
      .then((data) => {
        setDeals(data.deals);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Best Award Deals Right Now</h1>
        <p className="text-gray-600">
          High-value points redemptions discovered recently. Only showing deals
          above 1.8 cents per point.
        </p>
      </div>

      {loading ? (
        <p className="text-gray-500">Loading deals...</p>
      ) : deals.length === 0 ? (
        <p className="text-gray-500">No deals found.</p>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {deals.map((deal) => (
            <DealCard key={deal.id} {...deal} />
          ))}
        </div>
      )}

      <div className="mt-12 grid gap-4 md:grid-cols-2">
        <a
          href="/search"
          className="block p-6 bg-indigo-50 rounded-lg border border-indigo-100 hover:bg-indigo-100 transition-colors"
        >
          <h2 className="font-semibold text-lg text-indigo-900 mb-1">
            Award Deal Radar
          </h2>
          <p className="text-sm text-indigo-700">
            Search for the best points redemptions from your airport.
          </p>
        </a>
        <a
          href="/destinations"
          className="block p-6 bg-emerald-50 rounded-lg border border-emerald-100 hover:bg-emerald-100 transition-colors"
        >
          <h2 className="font-semibold text-lg text-emerald-900 mb-1">
            Where Can I Go?
          </h2>
          <p className="text-sm text-emerald-700">
            Enter your points balance and see where you can fly.
          </p>
        </a>
      </div>
    </div>
  );
}
