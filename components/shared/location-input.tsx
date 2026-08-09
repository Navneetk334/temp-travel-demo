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
  "Hinjewadi Phase 1, IT Park, Pune",
  "Baner, High Street, Pune",
  "Wakad, Dange Chowk, Pune",
  "Viman Nagar, Phoenix Mall Road, Pune",
  "Connaught Place (CP), New Delhi",
  "Cyber City, DLF Phase 2, Gurugram",
  "Noida Sector 18 / Atta Market, Noida",
  "Indiranagar, 100 Feet Road, Bangalore",
  "Koramangala 5th Block, Bangalore",
  "Whitefield, ITPL Main Road, Bangalore",
];

interface LocationInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  required?: boolean;
  className?: string;
  name?: string;
}

declare global {
  interface Window {
    google?: any;
  }
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
  const autocompleteServiceRef = useRef<any>(null);

  // Load Google Maps JS SDK dynamically on mount if API key exists
  useEffect(() => {
    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "AIzaSyBFu4RlB5ontZR997X45chVlauhB_i9sSI";
    if (!apiKey) return;

    if (window.google && window.google.maps && window.google.maps.places) {
      autocompleteServiceRef.current = new window.google.maps.places.AutocompleteService();
      return;
    }

    if (!document.getElementById("google-maps-sdk")) {
      const script = document.createElement("script");
      script.id = "google-maps-sdk";
      script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`;
      script.async = true;
      script.onload = () => {
        if (window.google && window.google.maps && window.google.maps.places) {
          autocompleteServiceRef.current = new window.google.maps.places.AutocompleteService();
        }
      };
      document.body.appendChild(script);
    }
  }, []);

  useEffect(() => {
    const query = value.trim();
    if (query.length < 2) {
      setFilteredLocations([]);
      setLoading(false);
      return;
    }

    const localMatches = POPULAR_LOCATIONS.filter((loc) =>
      loc.toLowerCase().includes(query.toLowerCase())
    );

    // Initial fallback state
    setFilteredLocations(Array.from(new Set([query, ...localMatches])).slice(0, 7));

    setLoading(true);
    let isCancelled = false;

    // 1. Try Google Maps JS SDK Autocomplete Service (Direct Client Side Google Maps Search)
    if (window.google && window.google.maps && window.google.maps.places) {
      if (!autocompleteServiceRef.current) {
        autocompleteServiceRef.current = new window.google.maps.places.AutocompleteService();
      }

      autocompleteServiceRef.current.getPlacePredictions(
        {
          input: query,
          componentRestrictions: { country: "in" },
        },
        (predictions: any[], status: string) => {
          if (isCancelled) return;
          setLoading(false);

          if (
            status === window.google.maps.places.PlacesServiceStatus.OK &&
            predictions &&
            predictions.length > 0
          ) {
            const gResults = predictions.map((p) => p.description);
            const combined = Array.from(new Set([query, ...gResults])).slice(0, 8);
            setFilteredLocations(combined);
            return;
          }
          // If Google Places status is not OK (e.g. API key not enabled for Places API yet), fallback to backend proxy API
          fetchProxyApi(query, localMatches);
        }
      );
    } else {
      // 2. Proxy API fallback
      fetchProxyApi(query, localMatches);
    }

    async function fetchProxyApi(q: string, fallbackMatches: string[]) {
      try {
        const res = await fetch(`/api/places/autocomplete?q=${encodeURIComponent(q)}`);
        if (res.ok && !isCancelled) {
          const data = await res.json();
          if (data.suggestions && Array.isArray(data.suggestions)) {
            const combined = Array.from(new Set([...data.suggestions, ...fallbackMatches])).slice(0, 8);
            setFilteredLocations(combined);
          }
        }
      } catch (err) {
        // Keep initial matches
      } finally {
        if (!isCancelled) setLoading(false);
      }
    }

    return () => {
      isCancelled = true;
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
        <div className="absolute z-[100] left-0 right-0 mt-1.5 bg-slate-900 border border-white/15 rounded-xl shadow-2xl overflow-hidden max-h-52 overflow-y-auto divide-y divide-white/5 backdrop-blur-md">
          <div className="px-3.5 py-2 text-[10px] font-bold uppercase tracking-wider text-accent bg-slate-950/90 flex items-center justify-between sticky top-0 z-10 border-b border-white/5">
            <span>Location Suggestions</span>
            {loading && <span className="text-[9px] text-slate-400 font-normal">Searching places...</span>}
          </div>
          {filteredLocations.map((loc, idx) => {
            const isExactTyped = loc.toLowerCase() === value.trim().toLowerCase();
            return (
              <button
                key={idx}
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => {
                  onChange(loc);
                  setIsOpen(false);
                }}
                className={`w-full text-left px-3.5 py-2.5 text-xs flex items-center gap-2.5 transition-all ${
                  isExactTyped
                    ? "bg-primary/30 text-white font-semibold"
                    : "text-slate-200 hover:bg-primary/20 hover:text-white"
                }`}
              >
                <MapPin className={`w-3.5 h-3.5 shrink-0 ${isExactTyped ? "text-accent" : "text-primary"}`} />
                <span className="truncate">
                  {loc}
                  {isExactTyped && <span className="ml-2 text-[9px] text-accent font-normal italic">(Use Typed Location)</span>}
                </span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
