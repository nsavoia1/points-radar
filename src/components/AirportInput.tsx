"use client";

import { useState, useRef, useEffect } from "react";
import { searchAirports, SearchResult } from "@/lib/airports";

interface AirportInputProps {
  label: string;
  placeholder?: string;
  required?: boolean;
  value: string[];
  onChange: (codes: string[], display: string) => void;
  accent?: string; // tailwind color like "indigo" or "emerald"
}

export function AirportInput({
  label,
  placeholder = "City or airport code",
  required = false,
  value,
  onChange,
  accent = "indigo",
}: AirportInputProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedLabel, setSelectedLabel] = useState("");
  const [highlightIndex, setHighlightIndex] = useState(-1);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Sync display when value changes externally
  useEffect(() => {
    if (value.length === 0) {
      setSelectedLabel("");
      setQuery("");
    }
  }, [value]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  function handleInput(text: string) {
    setQuery(text);
    setSelectedLabel("");
    setHighlightIndex(-1);

    if (text.length >= 1) {
      const matches = searchAirports(text);
      setResults(matches);
      setIsOpen(matches.length > 0);
    } else {
      setResults([]);
      setIsOpen(false);
      onChange([], "");
    }
  }

  function selectResult(result: SearchResult) {
    setSelectedLabel(result.label);
    setQuery("");
    setIsOpen(false);
    setHighlightIndex(-1);
    onChange(result.codes, result.label);
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (!isOpen) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlightIndex((i) => Math.min(i + 1, results.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlightIndex((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter" && highlightIndex >= 0) {
      e.preventDefault();
      selectResult(results[highlightIndex]);
    } else if (e.key === "Escape") {
      setIsOpen(false);
    }
  }

  function clearSelection() {
    setSelectedLabel("");
    setQuery("");
    setResults([]);
    onChange([], "");
    inputRef.current?.focus();
  }

  const ringColor = accent === "emerald" ? "focus:ring-emerald-500" : "focus:ring-indigo-500";

  return (
    <div ref={wrapperRef} className="relative">
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label}
        {required && <span className="text-red-400 ml-0.5">*</span>}
      </label>

      {selectedLabel ? (
        <div
          className={`flex items-center justify-between w-full border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white cursor-pointer hover:border-gray-400`}
          onClick={clearSelection}
        >
          <span className="font-medium text-gray-900">{selectedLabel}</span>
          <span className="text-gray-400 hover:text-gray-600 text-xs ml-2">&times;</span>
        </div>
      ) : (
        <input
          ref={inputRef}
          type="text"
          placeholder={placeholder}
          value={query}
          onChange={(e) => handleInput(e.target.value)}
          onFocus={() => query.length >= 1 && results.length > 0 && setIsOpen(true)}
          onKeyDown={handleKeyDown}
          className={`w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 ${ringColor} focus:border-transparent`}
          autoComplete="off"
        />
      )}

      {isOpen && results.length > 0 && (
        <div className="absolute z-50 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg max-h-64 overflow-y-auto">
          {results.map((r, i) => (
            <button
              key={`${r.type}-${r.value}`}
              type="button"
              className={`w-full text-left px-3 py-2.5 text-sm hover:bg-gray-50 transition-colors ${
                i === highlightIndex ? "bg-gray-50" : ""
              } ${i > 0 ? "border-t border-gray-100" : ""}`}
              onClick={() => selectResult(r)}
              onMouseEnter={() => setHighlightIndex(i)}
            >
              <div className="flex items-center gap-2">
                {r.type === "metro" ? (
                  <span className="inline-flex items-center justify-center w-5 h-5 rounded bg-indigo-100 text-indigo-600 text-[10px] font-bold flex-shrink-0">
                    +{r.codes.length}
                  </span>
                ) : (
                  <span className="inline-flex items-center justify-center w-5 h-5 rounded bg-gray-100 text-gray-500 text-[10px] font-bold flex-shrink-0">
                    {r.value}
                  </span>
                )}
                <div className="min-w-0">
                  <div className="font-medium text-gray-900 truncate">{r.label}</div>
                  <div className="text-xs text-gray-400 truncate">{r.subtitle}</div>
                </div>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
