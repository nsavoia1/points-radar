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

  const cppColor =
    cents_per_point >= 3
      ? "text-green-700 bg-green-50"
      : cents_per_point >= 2
        ? "text-indigo-700 bg-indigo-50"
        : "text-gray-700 bg-gray-100";

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-5 hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start mb-3">
        <div>
          <h3 className="font-semibold text-lg">
            {origin_city} → {destination_city}
          </h3>
          <p className="text-sm text-gray-500">
            {origin} → {destination}
          </p>
        </div>
        <span
          className={`text-sm font-bold px-2 py-1 rounded ${cppColor}`}
        >
          {cents_per_point} cpp
        </span>
      </div>

      <div className="grid grid-cols-2 gap-3 text-sm">
        <div>
          <p className="text-gray-500">Program</p>
          <p className="font-medium">{airline_program}</p>
        </div>
        <div>
          <p className="text-gray-500">Cabin</p>
          <p className="font-medium capitalize">{cabin_class}</p>
        </div>
        <div>
          <p className="text-gray-500">Points Required</p>
          <p className="font-medium">{points_required.toLocaleString()}</p>
        </div>
        <div>
          <p className="text-gray-500">Cash Price</p>
          <p className="font-medium">${cash_price_usd.toLocaleString()}</p>
        </div>
        <div>
          <p className="text-gray-500">Depart</p>
          <p className="font-medium">{departure_date}</p>
        </div>
        {return_date && (
          <div>
            <p className="text-gray-500">Return</p>
            <p className="font-medium">{return_date}</p>
          </div>
        )}
      </div>
    </div>
  );
}
