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
  operating_airline: string | null;
  cabin_class: string;
  points_required: number;
  cash_price_usd: number;
  cents_per_point: number;
  departure_date: string;
  return_date: string | null;
  departure_time: string | null;
  arrival_time: string | null;
  duration_minutes: number | null;
  stops: number | null;
  layover_airports: string | null;
  is_round_trip: number;
}

export default function DestinationsPage() {
  const [originCodes, setOriginCodes] = useState<string[]>([]);
  const [points, setPoints] = useState("");
  const [program, setProgram] = useState(ALL_PROGRAMS[0]);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [deals, setDeals] = useState<Deal[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (originCodes.length === 0 || !points) return;

    setLoading(true);
    setSearched(true);

    const params = new URLSearchParams({
      origin: originCodes.join(","),
      points,
      program,
    });
    if (startDate) params.set("startDate", startDate);
    if (endDate) params.set("endDate", endDate);

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
        <div className="grid gap-4 md:grid-cols-2">
          <AirportInput
            label="Home Airport"
            placeholder="Type your city — e.g. Boston, Chicago"
            required
            value={originCodes}
            onChange={(codes) => setOriginCodes(codes)}
            accent="emerald"
          />

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Points Balance<span className="text-red-400 ml-0.5">*</span>
            </label>
            <input
              type="text"
              inputMode="numeric"
              placeholder="e.g. 60,000"
              value={points ? parseInt(points).toLocaleString() : ""}
              onChange={(e) => setPoints(e.target.value.replace(/[^0-9]/g, ""))}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              required
            />
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2 mt-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Points Program<span className="text-red-400 ml-0.5">*</span>
            </label>
            <select
              value={program}
              onChange={(e) => setProgram(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
            >
              {ALL_PROGRAMS.map((p) => (
                <option key={p} value={p}>{p}</option>
              ))}
            </select>
          </div>

          <div className="flex items-end">
            <button
              type="submit"
              disabled={loading || originCodes.length === 0 || !points}
              className="w-full bg-emerald-600 text-white rounded-lg px-4 py-2 text-sm font-semibold hover:bg-emerald-700 disabled:opacity-50 transition-colors"
            >
              {loading ? "Searching..." : "Find Destinations"}
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
            accent="emerald"
          />
        </div>
      </form>

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
            {deals.map((deal, i) => (
              <DealCard key={`${deal.id}-${i}`} {...deal} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
