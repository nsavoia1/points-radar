"use client";

import { useState } from "react";
import { getCardPrograms, getCardShortName } from "@/lib/programs";

interface DealCardProps {
  origin_city: string;
  destination_city: string;
  origin: string;
  destination: string;
  airline_program: string;
  operating_airline?: string | null;
  cabin_class: string;
  points_required: number;
  cash_price_usd: number;
  cents_per_point: number;
  departure_date: string;
  return_date: string | null;
  departure_time?: string | null;
  arrival_time?: string | null;
  duration_minutes?: number | null;
  stops?: number | null;
  layover_airports?: string | null;
  is_round_trip?: number;
  return_departure_time?: string | null;
  return_arrival_time?: string | null;
  return_duration_minutes?: number | null;
  return_stops?: number | null;
  return_layover_airports?: string | null;
  return_operating_airline?: string | null;
}

export function DealCard(props: DealCardProps) {
  const {
    origin_city,
    destination_city,
    origin,
    destination,
    airline_program,
    operating_airline,
    cabin_class,
    points_required,
    cash_price_usd,
    cents_per_point,
    departure_date,
    return_date,
    departure_time,
    arrival_time,
    duration_minutes,
    stops,
    layover_airports,
    is_round_trip,
    return_departure_time,
    return_arrival_time,
    return_duration_minutes,
    return_stops,
    return_layover_airports,
    return_operating_airline,
  } = props;

  const [expanded, setExpanded] = useState(false);
  const hasReturnDetails = is_round_trip && return_departure_time;

  const cppBadge =
    cents_per_point >= 5
      ? "text-amber-800 bg-amber-100 border-amber-200"
      : cents_per_point >= 3
        ? "text-green-800 bg-green-100 border-green-200"
        : cents_per_point >= 2
          ? "text-indigo-800 bg-indigo-100 border-indigo-200"
          : "text-gray-700 bg-gray-100 border-gray-200";

  const cppLabel =
    cents_per_point >= 5
      ? "Incredible"
      : cents_per_point >= 3
        ? "Great"
        : cents_per_point >= 2
          ? "Good"
          : "Fair";

  function formatDate(d: string) {
    return new Date(d + "T00:00:00").toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
  }

  function formatDuration(mins: number) {
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    return m > 0 ? `${h}h ${m}m` : `${h}h`;
  }

  function stopsLabel(s: number | null | undefined, layovers: string | null | undefined) {
    return s === 0 || s == null
      ? "Nonstop"
      : s === 1
        ? `1 stop${layovers ? ` (${layovers})` : ""}`
        : `${s} stops${layovers ? ` (${layovers})` : ""}`;
  }

  const tripType = is_round_trip ? "Round trip" : "One way";

  function FlightLeg({
    fromCode, fromCity, toCode, toCity,
    depTime, arrTime, dur, numStops, layovers, airline, label,
  }: {
    fromCode: string; fromCity: string; toCode: string; toCity: string;
    depTime?: string | null; arrTime?: string | null;
    dur?: number | null; numStops?: number | null;
    layovers?: string | null; airline?: string | null; label: string;
  }) {
    return (
      <div>
        <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-2">{label}</p>
        <div className="flex items-center gap-3">
          <div className="text-center min-w-[60px]">
            {depTime && (
              <p className="text-lg font-bold text-gray-900 leading-tight">{depTime}</p>
            )}
            <p className="text-sm font-semibold text-gray-700">{fromCode}</p>
            <p className="text-xs text-gray-400">{fromCity}</p>
          </div>

          <div className="flex-1 flex flex-col items-center">
            {dur != null && (
              <p className="text-xs text-gray-400 mb-1">{formatDuration(dur)}</p>
            )}
            <div className="w-full flex items-center">
              <div className="w-2 h-2 rounded-full bg-gray-300" />
              <div className="flex-1 border-t border-dashed border-gray-300 relative">
                {numStops != null && numStops > 0 && (
                  <span className="absolute left-1/2 -translate-x-1/2 -top-0.5 w-1.5 h-1.5 rounded-full bg-gray-400" />
                )}
              </div>
              <div className="w-0 h-0 border-t-[5px] border-t-transparent border-b-[5px] border-b-transparent border-l-[8px] border-l-gray-300" />
            </div>
            <p className="text-xs text-gray-400 mt-1">{stopsLabel(numStops, layovers)}</p>
          </div>

          <div className="text-center min-w-[60px]">
            {arrTime && (
              <p className="text-lg font-bold text-gray-900 leading-tight">{arrTime}</p>
            )}
            <p className="text-sm font-semibold text-gray-700">{toCode}</p>
            <p className="text-xs text-gray-400">{toCity}</p>
          </div>
        </div>
        {airline && (
          <p className="text-xs text-gray-500 mt-1.5">{airline}</p>
        )}
      </div>
    );
  }

  return (
    <div
      className={`bg-white rounded-xl border border-gray-200 p-5 hover:shadow-lg hover:border-gray-300 transition-all ${hasReturnDetails ? "cursor-pointer" : ""}`}
      onClick={() => hasReturnDetails && setExpanded(!expanded)}
    >
      {/* Top row: CPP badge + trip type */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span
            className={`inline-block text-sm font-bold px-2.5 py-1 rounded-lg border ${cppBadge}`}
          >
            {cents_per_point}&#162;/pt &middot; {cppLabel}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-gray-400 uppercase tracking-wide">
            {tripType}
          </span>
          {hasReturnDetails && (
            <span className={`text-gray-400 text-xs transition-transform ${expanded ? "rotate-180" : ""}`}>
              &#9660;
            </span>
          )}
        </div>
      </div>

      {/* Outbound flight route */}
      <div className="flex items-center gap-3 mb-3">
        <div className="text-center min-w-[60px]">
          {departure_time && (
            <p className="text-lg font-bold text-gray-900 leading-tight">{departure_time}</p>
          )}
          <p className="text-sm font-semibold text-gray-700">{origin}</p>
          <p className="text-xs text-gray-400">{origin_city}</p>
        </div>

        <div className="flex-1 flex flex-col items-center">
          {duration_minutes != null && (
            <p className="text-xs text-gray-400 mb-1">{formatDuration(duration_minutes)}</p>
          )}
          <div className="w-full flex items-center">
            <div className="w-2 h-2 rounded-full bg-gray-300" />
            <div className="flex-1 border-t border-dashed border-gray-300 relative">
              {stops != null && stops > 0 && (
                <span className="absolute left-1/2 -translate-x-1/2 -top-0.5 w-1.5 h-1.5 rounded-full bg-gray-400" />
              )}
            </div>
            <div className="w-0 h-0 border-t-[5px] border-t-transparent border-b-[5px] border-b-transparent border-l-[8px] border-l-gray-300" />
          </div>
          <p className="text-xs text-gray-400 mt-1">{stopsLabel(stops, layover_airports)}</p>
        </div>

        <div className="text-center min-w-[60px]">
          {arrival_time && (
            <p className="text-lg font-bold text-gray-900 leading-tight">{arrival_time}</p>
          )}
          <p className="text-sm font-semibold text-gray-700">{destination}</p>
          <p className="text-xs text-gray-400">{destination_city}</p>
        </div>
      </div>

      {/* Airline + cabin */}
      <div className="flex items-center gap-2 mb-1 text-xs">
        {operating_airline && (
          <span className="font-medium text-gray-700">{operating_airline}</span>
        )}
        {operating_airline && <span className="text-gray-300">&middot;</span>}
        <span className="capitalize text-gray-500">{cabin_class}</span>
        <span className="text-gray-300">&middot;</span>
        <span className="text-gray-500">{airline_program}</span>
      </div>

      {/* Transfer path */}
      {(() => {
        const cards = getCardPrograms(airline_program);
        if (cards.length === 0) return null;
        return (
          <div className="flex items-center gap-1 mb-3 text-xs text-indigo-500">
            <span className="font-medium">
              {cards.map(getCardShortName).join(", ")}
            </span>
            <span>&rarr;</span>
            <span>{airline_program}</span>
          </div>
        );
      })()}

      {/* Dates */}
      <div className="flex items-center gap-1 text-xs text-gray-400 mb-4">
        <span>{formatDate(departure_date)}</span>
        {return_date && (
          <>
            <span>&ndash;</span>
            <span>{formatDate(return_date)}</span>
          </>
        )}
      </div>

      {/* Expanded: Return flight details */}
      {expanded && hasReturnDetails && (
        <div className="border-t border-gray-100 pt-4 mb-4">
          <FlightLeg
            label="Return flight"
            fromCode={destination}
            fromCity={destination_city}
            toCode={origin}
            toCity={origin_city}
            depTime={return_departure_time}
            arrTime={return_arrival_time}
            dur={return_duration_minutes}
            numStops={return_stops}
            layovers={return_layover_airports}
            airline={return_operating_airline !== operating_airline ? return_operating_airline : null}
          />
        </div>
      )}

      {/* Click hint for round trips */}
      {hasReturnDetails && !expanded && (
        <p className="text-[10px] text-gray-300 mb-3">Tap to see return flight</p>
      )}

      {/* Price comparison */}
      <div className="flex items-center gap-3">
        <div className="flex-1 bg-indigo-50 rounded-lg px-3 py-2 text-center">
          <p className="text-xs text-indigo-500">Points</p>
          <p className="font-bold text-sm text-indigo-700">{points_required.toLocaleString()}</p>
        </div>
        <div className="flex-1 bg-gray-50 rounded-lg px-3 py-2 text-center">
          <p className="text-xs text-gray-500">Cash Price</p>
          <p className="font-bold text-sm text-gray-600">${cash_price_usd.toLocaleString()}</p>
        </div>
      </div>
    </div>
  );
}
