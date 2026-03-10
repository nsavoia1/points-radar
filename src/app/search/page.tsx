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

export default function SearchPage() {
  const [origin, setOrigin] = useState("");
  const [destination, setDestination] = useState("");
  const [program, setProgram] = useState(ALL_PROGRAMS[0]);
  const [month, setMonth] = useState("");
  const [cabin, setCabin] = useState("");
  const [deals, setDeals] = useState<Deal[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [programsSearched, setProgramsSearched] = useState<string[]>([]);

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (!origin) return;

    setLoading(true);
    setSearched(true);

    const params = new URLSearchParams({ origin, program });
    if (destination) params.set("destination", destination);
    if (month) params.set("month", month);
    if (cabin) params.set("cabin", cabin);

    try {
      const res = await fetch(`/api/search?${params}`);
      const data = await res.json();
      setDeals(data.deals);
      setProgramsSearched(data.programs_searched || []);
    } catch {
      setDeals([]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Award Deal Radar</h1>

      <form onSubmit={handleSearch} className="bg-white rounded-lg border border-gray-200 p-6 mb-8">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Departure Airport *
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
              Destination (optional)
            </label>
            <input
              type="text"
              placeholder="MAD"
              value={destination}
              onChange={(e) => setDestination(e.target.value.toUpperCase())}
              maxLength={3}
              className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
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

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Cabin Class
            </label>
            <select
              value={cabin}
              onChange={(e) => setCabin(e.target.value)}
              className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
            >
              <option value="">Any</option>
              <option value="economy">Economy</option>
              <option value="business">Business</option>
            </select>
          </div>

          <div className="flex items-end">
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-indigo-600 text-white rounded px-4 py-2 text-sm font-medium hover:bg-indigo-700 disabled:opacity-50"
            >
              {loading ? "Searching..." : "Search Deals"}
            </button>
          </div>
        </div>
      </form>

      {searched && programsSearched.length > 0 && (
        <p className="text-sm text-gray-500 mb-4">
          Searching across: {programsSearched.join(", ")}
        </p>
      )}

      {loading ? (
        <p className="text-gray-500">Searching...</p>
      ) : searched && deals.length === 0 ? (
        <p className="text-gray-500">
          No deals found above 1.8 cpp for this search. Try broadening your search.
        </p>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {deals.map((deal) => (
            <DealCard key={deal.id} {...deal} />
          ))}
        </div>
      )}
    </div>
  );
}
