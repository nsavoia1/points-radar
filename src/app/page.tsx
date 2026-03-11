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
      {/* Hero */}
      <div className="bg-gradient-to-br from-indigo-600 to-purple-700 rounded-2xl p-8 md:p-12 mb-10 text-white">
        <h1 className="text-3xl md:text-4xl font-bold mb-3">
          Stop overpaying with your points.
        </h1>
        <p className="text-indigo-100 text-lg max-w-2xl mb-6">
          Points Radar finds the highest-value award flights so you get the most
          out of every point. We surface deals above 1.5 cents per point — the
          threshold where points beat paying cash.
        </p>
        <div className="flex flex-wrap gap-3">
          <a
            href="/search"
            className="inline-block bg-white text-indigo-700 font-semibold px-5 py-2.5 rounded-lg text-sm hover:bg-indigo-50 transition-colors"
          >
            Search Deals
          </a>
          <a
            href="/destinations"
            className="inline-block bg-indigo-500 text-white font-semibold px-5 py-2.5 rounded-lg text-sm hover:bg-indigo-400 transition-colors"
          >
            Where Can I Go?
          </a>
        </div>
      </div>

      {/* Feature cards */}
      <div className="grid gap-4 md:grid-cols-2 mb-10">
        <a
          href="/search"
          className="group block p-6 bg-white rounded-xl border border-gray-200 hover:border-indigo-300 hover:shadow-md transition-all"
        >
          <div className="text-2xl mb-2">&#x1F50D;</div>
          <h2 className="font-semibold text-lg text-gray-900 mb-1 group-hover:text-indigo-600">
            Award Deal Radar
          </h2>
          <p className="text-sm text-gray-600">
            Search by airport, program, date, and cabin class. We check all
            transfer partners automatically.
          </p>
        </a>
        <a
          href="/destinations"
          className="group block p-6 bg-white rounded-xl border border-gray-200 hover:border-emerald-300 hover:shadow-md transition-all"
        >
          <div className="text-2xl mb-2">&#x1F30D;</div>
          <h2 className="font-semibold text-lg text-gray-900 mb-1 group-hover:text-emerald-600">
            Where Can I Go?
          </h2>
          <p className="text-sm text-gray-600">
            Enter your points balance and see every destination you can book,
            ranked by value.
          </p>
        </a>
      </div>

      {/* Deal Feed */}
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Best Deals Right Now</h2>
          <p className="text-sm text-gray-500">
            Top award redemptions discovered recently
          </p>
        </div>
        <span className="text-xs text-gray-400 bg-gray-100 px-2 py-1 rounded">
          Updated every 24h
        </span>
      </div>

      {loading ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className="bg-white rounded-xl border border-gray-200 p-5 animate-pulse"
            >
              <div className="h-5 bg-gray-200 rounded w-3/4 mb-3" />
              <div className="h-4 bg-gray-100 rounded w-1/2 mb-4" />
              <div className="grid grid-cols-2 gap-3">
                <div className="h-4 bg-gray-100 rounded" />
                <div className="h-4 bg-gray-100 rounded" />
                <div className="h-4 bg-gray-100 rounded" />
                <div className="h-4 bg-gray-100 rounded" />
              </div>
            </div>
          ))}
        </div>
      ) : deals.length === 0 ? (
        <p className="text-gray-500">No deals found.</p>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {deals.map((deal) => (
            <DealCard key={deal.id} {...deal} />
          ))}
        </div>
      )}
    </div>
  );
}
