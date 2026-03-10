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
      <h1 className="text-2xl font-bold mb-2">Where Can I Go With My Points?</h1>
      <p className="text-gray-600 mb-6">
        Enter your points balance and see every destination you can book.
      </p>

      <form onSubmit={handleSearch} className="bg-white rounded-lg border border-gray-200 p-6 mb-8">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Home Airport *
            </label>
            <input
              type="text"
              placeholder="BOS"
              value={origin}
              onChange={(e) => setOrigin(e.target.value.toUpperCase())}
              maxLength={3}
              className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Points Balance *
            </label>
            <input
              type="number"
              placeholder="60000"
              value={points}
              onChange={(e) => setPoints(e.target.value)}
              className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Points Program *
            </label>
            <select
              value={program}
              onChange={(e) => setProgram(e.target.value)}
              className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
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
              Travel Month
            </label>
            <input
              type="month"
              value={month}
              onChange={(e) => setMonth(e.target.value)}
              className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="mt-4 bg-emerald-600 text-white rounded px-6 py-2 text-sm font-medium hover:bg-emerald-700 disabled:opacity-50"
        >
          {loading ? "Searching..." : "Find Destinations"}
        </button>
      </form>

      {loading ? (
        <p className="text-gray-500">Searching...</p>
      ) : searched && deals.length === 0 ? (
        <p className="text-gray-500">
          No destinations found within your points balance. Try a different program or increase your balance.
        </p>
      ) : (
        <>
          {searched && (
            <p className="text-sm text-gray-500 mb-4">
              {deals.length} destination{deals.length !== 1 ? "s" : ""} found within{" "}
              {parseInt(points).toLocaleString()} points
            </p>
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
