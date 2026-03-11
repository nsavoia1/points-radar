"use client";

import { useState } from "react";
import { DealCard } from "@/components/DealCard";
import { AirportInput } from "@/components/AirportInput";
import { DateRangePicker } from "@/components/DateRangePicker";
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
  const [originCodes, setOriginCodes] = useState<string[]>([]);
  const [originDisplay, setOriginDisplay] = useState("");
  const [destCodes, setDestCodes] = useState<string[]>([]);
  const [destDisplay, setDestDisplay] = useState("");
  const [program, setProgram] = useState(ALL_PROGRAMS[0]);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [cabin, setCabin] = useState("");
  const [deals, setDeals] = useState<Deal[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [programsSearched, setProgramsSearched] = useState<string[]>([]);

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (originCodes.length === 0) return;

    setLoading(true);
    setSearched(true);

    const params = new URLSearchParams({
      origin: originCodes.join(","),
      program,
    });
    if (destCodes.length > 0) params.set("destination", destCodes.join(","));
    if (startDate) params.set("startDate", startDate);
    if (endDate) params.set("endDate", endDate);
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
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Award Deal Radar</h1>
        <p className="text-sm text-gray-500">
          Find the best points redemptions. We check all transfer partners automatically.
        </p>
      </div>

      <form onSubmit={handleSearch} className="bg-white rounded-xl border border-gray-200 p-6 mb-8">
        <div className="grid gap-4 md:grid-cols-2">
          <AirportInput
            label="From"
            placeholder="Type a city — e.g. Boston, New York"
            required
            value={originCodes}
            onChange={(codes, display) => { setOriginCodes(codes); setOriginDisplay(display); }}
          />

          <AirportInput
            label="To"
            placeholder="Anywhere (or type a city)"
            value={destCodes}
            onChange={(codes, display) => { setDestCodes(codes); setDestDisplay(display); }}
          />
        </div>

        <div className="grid gap-4 md:grid-cols-3 mt-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Points Program<span className="text-red-400 ml-0.5">*</span>
            </label>
            <select
              value={program}
              onChange={(e) => setProgram(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            >
              {ALL_PROGRAMS.map((p) => (
                <option key={p} value={p}>{p}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Cabin Class
            </label>
            <select
              value={cabin}
              onChange={(e) => setCabin(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            >
              <option value="">Any cabin</option>
              <option value="economy">Economy</option>
              <option value="premium">Premium Economy</option>
              <option value="business">Business</option>
              <option value="first">First</option>
            </select>
          </div>

          <div className="flex items-end">
            <button
              type="submit"
              disabled={loading || originCodes.length === 0}
              className="w-full bg-indigo-600 text-white rounded-lg px-4 py-2 text-sm font-semibold hover:bg-indigo-700 disabled:opacity-50 transition-colors"
            >
              {loading ? "Searching..." : "Search Deals"}
            </button>
          </div>
        </div>

        <div className="mt-4">
          <DateRangePicker
            label="Travel Dates"
            startDate={startDate}
            endDate={endDate}
            onStartChange={setStartDate}
            onEndChange={setEndDate}
          />
        </div>
      </form>

      {searched && programsSearched.length > 0 && (
        <p className="text-xs text-gray-400 mb-4">
          Searched: {programsSearched.join(", ")}
          {originDisplay && ` from ${originDisplay}`}
          {destDisplay && ` to ${destDisplay}`}
        </p>
      )}

      {loading ? (
        <div className="grid gap-4 md:grid-cols-2">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-white rounded-xl border border-gray-200 p-5 animate-pulse">
              <div className="h-5 bg-gray-200 rounded w-3/4 mb-3" />
              <div className="h-4 bg-gray-100 rounded w-1/2 mb-4" />
              <div className="grid grid-cols-2 gap-3">
                <div className="h-4 bg-gray-100 rounded" />
                <div className="h-4 bg-gray-100 rounded" />
              </div>
            </div>
          ))}
        </div>
      ) : searched && deals.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-400 text-lg mb-1">No deals found</p>
          <p className="text-gray-400 text-sm">
            Try a different airport, program, or broaden your dates.
          </p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {deals.map((deal, i) => (
            <DealCard key={`${deal.id}-${i}`} {...deal} />
          ))}
        </div>
      )}
    </div>
  );
}
