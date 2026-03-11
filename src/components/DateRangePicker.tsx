"use client";

import { useState } from "react";

interface DateRangePickerProps {
  label: string;
  startDate: string;
  endDate: string;
  onStartChange: (date: string) => void;
  onEndChange: (date: string) => void;
  accent?: string;
  required?: boolean;
}

// Quick-select presets
const PRESETS = [
  { label: "This month", getRange: () => getCurrentMonthRange() },
  { label: "Next month", getRange: () => getOffsetMonthRange(1) },
  { label: "+2 months", getRange: () => getOffsetMonthRange(2) },
  { label: "+3 months", getRange: () => getOffsetMonthRange(3) },
  { label: "Next 3 months", getRange: () => getMultiMonthRange(3) },
  { label: "Next 6 months", getRange: () => getMultiMonthRange(6) },
];

function getCurrentMonthRange(): [string, string] {
  const now = new Date();
  const start = formatDate(now);
  const end = formatDate(lastDayOfMonth(now.getFullYear(), now.getMonth()));
  return [start, end];
}

function getOffsetMonthRange(offset: number): [string, string] {
  const now = new Date();
  const m = now.getMonth() + offset;
  const y = now.getFullYear() + Math.floor(m / 12);
  const month = m % 12;
  const start = formatDate(new Date(y, month, 1));
  const end = formatDate(lastDayOfMonth(y, month));
  return [start, end];
}

function getMultiMonthRange(months: number): [string, string] {
  const now = new Date();
  const start = formatDate(now);
  const m = now.getMonth() + months;
  const y = now.getFullYear() + Math.floor(m / 12);
  const month = m % 12;
  const end = formatDate(lastDayOfMonth(y, month));
  return [start, end];
}

function lastDayOfMonth(year: number, month: number): Date {
  return new Date(year, month + 1, 0);
}

function formatDate(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function DateRangePicker({
  label,
  startDate,
  endDate,
  onStartChange,
  onEndChange,
  accent = "indigo",
  required = false,
}: DateRangePickerProps) {
  const [showPresets, setShowPresets] = useState(false);

  const ringColor = accent === "emerald" ? "focus:ring-emerald-500" : "focus:ring-indigo-500";
  const btnColor = accent === "emerald" ? "text-emerald-600 hover:bg-emerald-50" : "text-indigo-600 hover:bg-indigo-50";
  const activeBg = accent === "emerald" ? "bg-emerald-600" : "bg-indigo-600";

  const today = formatDate(new Date());

  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <label className="block text-sm font-medium text-gray-700">
          {label}
          {required && <span className="text-red-400 ml-0.5">*</span>}
        </label>
        <button
          type="button"
          className={`text-xs font-medium ${btnColor} px-1.5 py-0.5 rounded`}
          onClick={() => setShowPresets(!showPresets)}
        >
          {showPresets ? "Hide" : "Quick select"}
        </button>
      </div>

      {showPresets && (
        <div className="flex flex-wrap gap-1.5 mb-2">
          {PRESETS.map((p) => (
            <button
              key={p.label}
              type="button"
              className={`text-xs px-2.5 py-1 rounded-full border border-gray-200 hover:border-gray-300 transition-colors ${
                isPresetActive(p.getRange(), startDate, endDate)
                  ? `${activeBg} text-white border-transparent`
                  : "text-gray-600 bg-white"
              }`}
              onClick={() => {
                const [s, e] = p.getRange();
                onStartChange(s);
                onEndChange(e);
              }}
            >
              {p.label}
            </button>
          ))}
        </div>
      )}

      <div className="grid grid-cols-2 gap-2">
        <div>
          <span className="text-xs text-gray-400 mb-0.5 block">From</span>
          <input
            type="date"
            value={startDate}
            min={today}
            onChange={(e) => onStartChange(e.target.value)}
            className={`w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 ${ringColor} focus:border-transparent`}
          />
        </div>
        <div>
          <span className="text-xs text-gray-400 mb-0.5 block">To</span>
          <input
            type="date"
            value={endDate}
            min={startDate || today}
            onChange={(e) => onEndChange(e.target.value)}
            className={`w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 ${ringColor} focus:border-transparent`}
          />
        </div>
      </div>
    </div>
  );
}

function isPresetActive(range: [string, string], start: string, end: string): boolean {
  return range[0] === start && range[1] === end;
}
