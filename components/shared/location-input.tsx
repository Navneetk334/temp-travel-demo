"use client";

import React, { useState, useRef, useEffect } from "react";
import { MapPin, Navigation, Loader2, Check } from "lucide-react";

export const POPULAR_LOCATIONS = [
  { mainText: "Mumbai Airport (BOM T2 / T1)", secondaryText: "Andheri East, Mumbai, Maharashtra", fullText: "Mumbai Airport (BOM T2 / T1), Andheri East, Mumbai" },
  { mainText: "Pune International Airport (PNQ)", secondaryText: "Lohegaon, Pune, Maharashtra", fullText: "Pune International Airport (PNQ), Lohegaon, Pune" },
  { mainText: "Delhi Indira Gandhi Airport (DEL T3)", secondaryText: "Palam, New Delhi, Delhi", fullText: "Delhi Indira Gandhi Airport (DEL T3), New Delhi" },
  { mainText: "Kempegowda Airport (BLR)", secondaryText: "Devanahalli, Bangalore, Karnataka", fullText: "Kempegowda Airport (BLR), Bangalore" },
  { mainText: "Bandra Kurla Complex (BKC)", secondaryText: "Bandra East, Mumbai, Maharashtra", fullText: "Bandra Kurla Complex (BKC), Mumbai" },
  { mainText: "Hinjewadi IT Park Phase 1", secondaryText: "Hinjewadi, Pune, Maharashtra", fullText: "Hinjewadi IT Park Phase 1, Pune" },
  { mainText: "Cyber City DLF Phase 2", secondaryText: "Gurugram, Haryana", fullText: "Cyber City DLF Phase 2, Gurugram" },
  { mainText: "Connaught Place (CP)", secondaryText: "New Delhi, Delhi", fullText: "Connaught Place (CP), New Delhi" },
  { mainText: "Whitefield ITPL Main Road", secondaryText: "Bangalore, Karnataka", fullText: "Whitefield ITPL Main Road, Bangalore" },
];

export interface PlaceItem {
  mainText: string;
  secondaryText: string;
  fullText: string;
}

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
  const wrapperRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [locating, setLocating] = useState(false);
  const [suggestions, setSuggestions] = useState<PlaceItem[]>([]);
  const [selectedIndex, setSelectedIndex] = useState<number>(-1);

  // Debounced search trigger
  useEffect(() => {
    const query = value.trim();
    if (query.length < 2) {
      setSuggestions([]);
      setLoading(false);
      return;
    }

    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/places/autocomplete?q=${encodeURIComponent(query)}`);
        if (res.ok) {
          const data = await res.json();
          if (data.suggestions && Array.isArray(data.suggestions)) {
            setSuggestions(data.suggestions);
          }
        }
      } catch (err) {
        console.error("Location search error:", err);
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [value]);

  // Handle click outside dropdown
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Use current GPS location
  const handleUseCurrentLocation = () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser.");
      return;
    }

    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        try {
          const res = await fetch(`/api/places/reverse-geocode?lat=${latitude}&lng=${longitude}`);
          if (res.ok) {
            const data = await res.json();
            if (data.address) {
              onChange(data.address);
              setIsOpen(false);
            }
          }
        } catch (err) {
          console.error("Failed to reverse geocode location:", err);
        } finally {
          setLocating(false);
        }
      },
      (error) => {
        setLocating(false);
        console.warn("Geolocation permission error:", error.message);
        alert("Unable to retrieve your location. Please type your location manually.");
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  // Keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!isOpen) {
      if (e.key === "ArrowDown" || e.key === "ArrowUp") {
        setIsOpen(true);
      }
      return;
    }

    const maxIdx = suggestions.length - 1;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev < maxIdx ? prev + 1 : 0));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev > 0 ? prev - 1 : maxIdx));
    } else if (e.key === "Enter") {
      if (selectedIndex >= 0 && selectedIndex <= maxIdx) {
        e.preventDefault();
        const selected = suggestions[selectedIndex];
        onChange(selected.fullText);
        setIsOpen(false);
      }
    } else if (e.key === "Escape") {
      setIsOpen(false);
    }
  };

  const displayList = value.trim().length >= 2 ? suggestions : POPULAR_LOCATIONS;

  return (
    <div ref={wrapperRef} className="relative w-full">
      <div className="relative">
        <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
        <input
          ref={inputRef}
          type="text"
          name={name}
          required={required}
          placeholder={placeholder}
          value={value}
          onFocus={() => setIsOpen(true)}
          onKeyDown={handleKeyDown}
          onChange={(e) => {
            onChange(e.target.value);
            setIsOpen(true);
            setSelectedIndex(-1);
          }}
          className={`w-full bg-slate-950/60 border border-white/10 rounded-lg py-2.5 pl-10 pr-9 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/40 transition-all ${className}`}
        />
        {(loading || locating) && (
          <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-accent animate-spin pointer-events-none" />
        )}
      </div>

      {isOpen && (
        <div className="absolute z-[100] left-0 right-0 mt-1.5 bg-slate-900 border border-white/15 rounded-xl shadow-2xl overflow-hidden max-h-64 overflow-y-auto divide-y divide-white/5 backdrop-blur-md">
          {/* Header & Use Current Location Button */}
          <div className="p-2 bg-slate-950/90 sticky top-0 z-10 border-b border-white/5 space-y-1">
            <button
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onClick={handleUseCurrentLocation}
              disabled={locating}
              className="w-full text-left px-3 py-2 rounded-lg text-xs font-semibold text-accent hover:bg-accent/10 flex items-center justify-between transition-colors"
            >
              <div className="flex items-center gap-2">
                {locating ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Navigation className="w-3.5 h-3.5 fill-accent/20" />
                )}
                <span>{locating ? "Detecting location..." : "Use Current Location (GPS)"}</span>
              </div>
              <span className="text-[9px] uppercase tracking-wider bg-accent/20 px-1.5 py-0.5 rounded text-accent font-bold">
                Auto
              </span>
            </button>
          </div>

          {/* Suggestions Header */}
          <div className="px-3 py-1.5 text-[9px] font-bold uppercase tracking-wider text-slate-400 bg-slate-950/40 flex items-center justify-between">
            <span>{value.trim().length >= 2 ? "Search Results" : "Popular Locations"}</span>
            {loading && <span className="text-[8px] text-accent animate-pulse">Updating...</span>}
          </div>

          {/* Location Suggestions List */}
          {displayList.length === 0 ? (
            <div className="px-4 py-3 text-xs text-slate-400 italic text-center">
              Type place name (e.g. Goldy Footwear, Mall Road, Airport...)
            </div>
          ) : (
            displayList.map((item, idx) => {
              const isSelected = selectedIndex === idx;
              const isExactValue = item.fullText.toLowerCase() === value.trim().toLowerCase();

              return (
                <button
                  key={idx}
                  type="button"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => {
                    onChange(item.fullText);
                    setIsOpen(false);
                  }}
                  onMouseEnter={() => setSelectedIndex(idx)}
                  className={`w-full text-left px-3.5 py-2.5 text-xs flex items-start gap-2.5 transition-all ${
                    isSelected || isExactValue
                      ? "bg-primary/25 text-white font-medium"
                      : "text-slate-200 hover:bg-white/5"
                  }`}
                >
                  <MapPin className={`w-4 h-4 shrink-0 mt-0.5 ${isSelected || isExactValue ? "text-accent" : "text-primary"}`} />
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-slate-100 truncate flex items-center gap-1.5">
                      <span>{item.mainText}</span>
                      {isExactValue && <Check className="w-3 h-3 text-emerald-400 shrink-0" />}
                    </div>
                    {item.secondaryText && (
                      <div className="text-[11px] text-slate-400 truncate mt-0.5">
                        {item.secondaryText}
                      </div>
                    )}
                  </div>
                </button>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}
