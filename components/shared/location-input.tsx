"use client";

import React, { useState, useRef, useEffect } from "react";
import { MapPin } from "lucide-react";

export const POPULAR_LOCATIONS = [
  "Mumbai Airport (BOM T2 / T1)",
  "Pune International Airport (PNQ)",
  "Delhi Indira Gandhi Airport (DEL T3)",
  "Kempegowda Airport (BLR), Bangalore",
  "Hinjewadi Phase 1, IT Park, Pune",
  "Hinjewadi Phase 2 & 3, Pune",
  "Bandra Kurla Complex (BKC), Mumbai",
  "Cyber City, DLF Phase 2, Gurugram",
  "Connaught Place (CP), New Delhi",
  "Electronic City Phase 1, Bangalore",
  "Manyata Tech Park, Nagavara, Bangalore",
  "Vashi Sector 17, Navi Mumbai",
  "Thane West Railway Station Area",
  "Chhatrapati Shivaji Maharaj Terminus (CSMT), Mumbai",
  "Pune Central Railway Station",
  "New Delhi Central Railway Station",
  "Lonavala Center & Expressway Exit",
  "Mahabaleshwar Main Market Point",
  "Magarpatta Cybercity, Hadapsar, Pune",
  "Kharadi EON IT Park, Pune",
  "Andheri East, MIDC, Mumbai",
  "Kandivali East, WE Highway, Mumbai",
  "Whitefield, ITPL Main Road, Bangalore",
  "Noida Sector 62, Electronic City",
  "Powai Hiranandani Gardens, Mumbai",
  "Baner - Balewadi High Street, Pune",
  "Wakad Dange Chowk, Pune",
  "Aerocity Hospitality District, New Delhi",
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
  const [filteredLocations, setFilteredLocations] = useState<string[]>([]);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const query = value.trim().toLowerCase();
    if (query.length >= 2) {
      const matches = POPULAR_LOCATIONS.filter((loc) =>
        loc.toLowerCase().includes(query)
      );
      setFilteredLocations(matches.slice(0, 5));
    } else {
      setFilteredLocations([]);
    }
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
          className={`w-full bg-slate-950/50 border border-white/10 rounded-lg py-2.5 pl-10 pr-4 text-sm text-slate-100 focus:outline-none focus:border-primary transition-all ${className}`}
        />
      </div>

      {isOpen && value.trim().length >= 2 && filteredLocations.length > 0 && (
        <div className="absolute z-50 left-0 right-0 mt-1 bg-slate-900 border border-white/10 rounded-lg shadow-2xl overflow-hidden max-h-56 overflow-y-auto divide-y divide-white/5">
          <div className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-accent bg-slate-950/80">
            Landmark Suggestions
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
