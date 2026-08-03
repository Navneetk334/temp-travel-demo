"use client";

import React, { useState, useRef, useEffect } from "react";
import { MapPin, Loader2 } from "lucide-react";

export const POPULAR_LOCATIONS = [
  "Mumbai Airport (BOM T2 / T1)",
  "Pune International Airport (PNQ)",
  "Delhi Indira Gandhi Airport (DEL T3)",
  "Kempegowda Airport (BLR), Bangalore",
  "Lokhandwala Complex, Andheri West, Mumbai",
  "Andheri East MIDC, Mumbai",
  "Malad West, Link Road, Mumbai",
  "Goregaon East, Western Express Highway, Mumbai",
  "Kandivali East, Thakur Village, Mumbai",
  "Borivali West, IC Colony, Mumbai",
  "Bandra Kurla Complex (BKC), Mumbai",
  "Bandra West, Hill Road, Mumbai",
  "Powai, Hiranandani Gardens, Mumbai",
  "Thane West, Ghodbunder Road, Thane",
  "Vashi Sector 17, Navi Mumbai",
  "Nerul LP, Navi Mumbai",
  "Kharghar Sector 12, Navi Mumbai",
  "Hinjewadi Phase 1, IT Park, Pune",
  "Hinjewadi Phase 2 & 3, Pune",
  "Baner, High Street, Pune",
  "Wakad, Dange Chowk, Pune",
  "Viman Nagar, Phoenix Mall Road, Pune",
  "Kharadi, EON Free Zone, Pune",
  "Hadapsar, Magarpatta City, Pune",
  "Kothrud, Paud Road, Pune",
  "Connaught Place (CP), New Delhi",
  "Cyber City, DLF Phase 2, Gurugram",
  "Golf Course Road, Sector 54, Gurugram",
  "Noida Sector 18 / Atta Market, Noida",
  "Noida Sector 62, Electronic City, Noida",
  "Dwarka Sector 21, New Delhi",
  "Rohini Sector 7, New Delhi",
  "Janakpuri District Centre, New Delhi",
  "Indiranagar, 100 Feet Road, Bangalore",
  "Koramangala 5th Block, Bangalore",
  "Whitefield, ITPL Main Road, Bangalore",
  "Electronic City Phase 1, Bangalore",
  "HSR Layout Sector 1, Bangalore",
  "Bellandur, Outer Ring Road, Bangalore",
  "BTM Layout 2nd Stage, Bangalore",
  "Jayanagar 4th Block, Bangalore",
  "Hebbal Flyover Area, Bangalore",
];

interface LocationInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  required?: boolean;
  className?: string;
  name?: string;
}

export default function LocationInput({
  value,
  onChange,
  placeholder = "Enter location...",
  required = false,
  className = "",
  name,
}: LocationInputProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [filteredLocations, setFilteredLocations] = useState<string[]>([]);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const query = value.trim();
    if (query.length < 2) {
      setFilteredLocations([]);
      setLoading(false);
      return;
    }

    // 1. Instant local match
    const localMatches = POPULAR_LOCATIONS.filter((loc) =>
      loc.toLowerCase().includes(query.toLowerCase())
    );
    setFilteredLocations(localMatches.slice(0, 5));

    // 2. Fetch live places from proxy endpoint (/api/places/autocomplete)
    setLoading(true);
    const controller = new AbortController();
    const timer = setTimeout(async () => {
      try {
        const res = await fetch(
          `/api/places/autocomplete?q=${encodeURIComponent(query)}`,
          { signal: controller.signal }
        );
        if (res.ok) {
          const data = await res.json();
          if (data.suggestions && Array.isArray(data.suggestions)) {
            const combined = Array.from(
              new Set([...data.suggestions, ...localMatches])
            ).slice(0, 7);
            if (combined.length > 0) {
              setFilteredLocations(combined);
            }
          }
        }
      } catch (err: any) {
        if (err.name !== "AbortError") {
          // Keep localMatches on fetch error
        }
      } finally {
        setLoading(false);
      }
    }, 250);

    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [value]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div ref={wrapperRef} className="relative w-full">
      <div className="relative">
        <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
        <input
          type="text"
          name={name}
          required={required}
          placeholder={placeholder}
          value={value}
          onFocus={() => {
            if (value.trim().length >= 2) setIsOpen(true);
          }}
          onChange={(e) => {
            onChange(e.target.value);
            setIsOpen(true);
          }}
          className={`w-full bg-slate-950/50 border border-white/10 rounded-lg py-2.5 pl-10 pr-9 text-sm text-slate-100 focus:outline-none focus:border-primary transition-all ${className}`}
        />
        {loading && (
          <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-accent animate-spin pointer-events-none" />
        )}
      </div>

      {isOpen && value.trim().length >= 2 && filteredLocations.length > 0 && (
        <div className="absolute z-50 left-0 right-0 mt-1 bg-slate-900 border border-white/10 rounded-lg shadow-2xl overflow-hidden max-h-60 overflow-y-auto divide-y divide-white/5">
          <div className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-accent bg-slate-950/80 flex items-center justify-between">
            <span>Location Suggestions</span>
            {loading && <span className="text-[9px] text-slate-400 font-normal">Searching live places...</span>}
          </div>
          {filteredLocations.map((loc, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => {
                onChange(loc);
                setIsOpen(false);
              }}
              className="w-full text-left px-3.5 py-2.5 text-xs text-slate-200 hover:bg-primary/20 hover:text-white flex items-center gap-2 transition-all"
            >
              <MapPin className="w-3.5 h-3.5 text-primary shrink-0" />
              <span className="truncate">{loc}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
