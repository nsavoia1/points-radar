"use client";

interface DealCardProps {
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

export function DealCard(props: DealCardProps) {
  const {
    origin_city,
    destination_city,
    origin,
    destination,
    airline_program,
    cabin_class,
    points_required,
    cash_price_usd,
    cents_per_point,
    departure_date,
    return_date,
  } = props;

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

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-lg hover:border-gray-300 transition-all">
      {/* Route header */}
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="font-bold text-lg leading-tight">
            {origin_city} &rarr; {destination_city}
          </h3>
          <p className="text-xs text-gray-400 mt-0.5">
            {origin} &rarr; {destination}
          </p>
        </div>
        <div className={`text-right`}>
          <span
            className={`inline-block text-sm font-bold px-2.5 py-1 rounded-lg border ${cppBadge}`}
          >
            {cents_per_point}&#162;/pt
          </span>
          <p className={`text-xs mt-1 ${cents_per_point >= 3 ? "text-green-600" : "text-gray-400"}`}>
            {cppLabel}
          </p>
        </div>
      </div>

      {/* Key stats */}
      <div className="flex items-center gap-3 mb-4">
        <div className="flex-1 bg-gray-50 rounded-lg px-3 py-2 text-center">
          <p className="text-xs text-gray-500">Points</p>
          <p className="font-bold text-sm">{points_required.toLocaleString()}</p>
        </div>
        <div className="flex-1 bg-gray-50 rounded-lg px-3 py-2 text-center">
          <p className="text-xs text-gray-500">Cash Price</p>
          <p className="font-bold text-sm">${cash_price_usd.toLocaleString()}</p>
        </div>
      </div>

      {/* Meta row */}
      <div className="flex items-center justify-between text-xs text-gray-500">
        <span className="font-medium text-gray-700">{airline_program}</span>
        <span className="capitalize">{cabin_class}</span>
        <span>
          {formatDate(departure_date)}
          {return_date ? ` – ${formatDate(return_date)}` : ""}
        </span>
      </div>
    </div>
  );
}
