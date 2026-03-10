"use client";

import { useState } from "react";
import { DealCard } from "@/components/DealCard";
import { ALL_PROGRAMS } from "@/lib/programs";

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

export default function DestinationsPage() {
  const [origin, setOrigin] = useState("");
  const [points, setPoints] = useState("");
  const [program, setProgram] = useState(ALL_PROGRAMS[0]);
  const [month, setMonth] = useState("");
  const [deals, setDeals] = useState<Deal[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (!origin || !points) return;

    setLoading(true);
    setSearched(true);

    const params = new URLSearchParams({ origin, points, program });
    if (month) params.set("month", month);

    try {
      const res = await fetch(`/api/destinations?${params}`);
      const data = await res.json();
      setDeals(data.deals);
    } catch {
      setDeals([]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Where Can I Go With My Points?</h1>
        <p className="text-sm text-gray-500">
          Enter your balance and see every destination you can book, ranked by value.
        </p>
      </div>

      <form onSubmit={handleSearch} className="bg-white rounded-xl border border-gray-200 p-6 mb-8">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Home Airport
            </label>
            <input
              type="text"
              placeholder="BOS"
              value={origin}
              onChange={(e) => setOrigin(e.target.value.toUpperCase())}
              maxLength={3}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Points Balance
            </label>
            <input
              type="number"
              placeholder="60,000"
              value={points}
              onChange={(e) => setPoints(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Points Program
            </label>
            <select
              value={program}
              onChange={(e) => setProgram(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
            >
              {ALL_PROGRAMS.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Travel Month <span className="text-gray-400">(optional)</span>
            </label>
            <input
              type="month"
              value={month}
              onChange={(e) => setMonth(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="mt-4 bg-emerald-600 text-white rounded-lg px-6 py-2 text-sm font-semibold hover:bg-emerald-700 disabled:opacity-50 transition-colors"
        >
          {loading ? "Searching..." : "Find Destinations"}
        </button>
      </form>

      {loading ? (
        <p className="text-gray-500">Searching...</p>
      ) : searched && deals.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-400 text-lg mb-1">No destinations found</p>
          <p className="text-gray-400 text-sm">
            Try a different program or increase your points balance.
          </p>
        </div>
      ) : (
        <>
          {searched && (
            <div className="mb-4 flex items-center gap-2">
              <span className="text-sm font-semibold text-gray-700">
                {deals.length} destination{deals.length !== 1 ? "s" : ""}
              </span>
              <span className="text-sm text-gray-400">
                within {parseInt(points).toLocaleString()} points
              </span>
            </div>
          )}
          <div className="grid gap-4 md:grid-cols-2">
            {deals.map((deal) => (
              <DealCard key={deal.id} {...deal} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
