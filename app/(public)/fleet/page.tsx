"use client";

import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Car, Users, ArrowRight, ShieldCheck, Star, Sparkles, Fuel, Gauge, CheckCircle2 } from "lucide-react";

interface FleetVehicle {
  id: string;
  make: string;
  model: string;
  registrationNumber?: string;
  categoryName: string;
  vehicleClass: string;
  subCategory?: string;
  capacity: number;
  fuelType?: string;
  transmission?: string;
  perKmRate?: number;
  perHourRate?: number;
  baseDailyRate?: number;
  driverAllowance?: number;
  nightAllowance?: number;
  imageUrl?: string;
  isFeatured?: boolean;
  status?: string;
}

function FleetContent() {
  const searchParams = useSearchParams();
  const initialCategory = searchParams.get("category") || "ALL";

  const [selectedCategory, setSelectedCategory] = useState(initialCategory.toUpperCase());
  const [vehicles, setVehicles] = useState<FleetVehicle[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 1. Instant local hydration from user uploaded fleet in Master Admin
    const saved = localStorage.getItem("user_uploaded_fleet");
    if (saved) {
      try {
        const localList = JSON.parse(saved);
        if (Array.isArray(localList)) {
          setVehicles(localList);
          setLoading(false);
        }
      } catch (e) {
        console.error(e);
      }
    }

    // 2. Fetch from API fallback / sync
    fetch("/api/fleet?limit=100")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data) {
          const apiList = Array.isArray(data) ? data : (data.vehicles || []);
          if (apiList.length > 0) {
            setVehicles((prev) => (prev.length > 0 ? prev : apiList));
          }
        }
      })
      .catch((err) => console.error("Fleet API fetch error:", err))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    const cat = searchParams.get("category");
    if (cat) {
      setSelectedCategory(cat.toUpperCase());
    }
  }, [searchParams]);

  const filteredVehicles = vehicles.filter((v) => {
    if (selectedCategory === "ALL" || !selectedCategory) return true;
    const cat = (v.categoryName || "").toUpperCase();
    return cat.includes(selectedCategory);
  });

  return (
    <div className="bg-slate-950 min-h-screen text-slate-100 pt-32 sm:pt-36 lg:pt-40 pb-20 px-4 sm:px-8 lg:px-12 xl:px-16">
      <div className="max-w-[1750px] mx-auto space-y-12">
        {/* Header Title */}
        <div className="text-center space-y-4 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 bg-amber-500/10 border border-amber-500/30 px-3.5 py-1 rounded-full text-amber-400 text-xs font-bold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5" />
            <span>ISO 9001:2015 Verified Commercial Fleet</span>
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-slate-50">
            Our Commercial Fleet Showcase
          </h1>
          <p className="text-slate-400 text-xs sm:text-sm">
            Explore our curated fleet of executive Sedans and spacious SUVs, meticulously maintained with commercial permits and trained chauffeurs.
          </p>
        </div>

        {/* Category Filter Tabs */}
        <div className="flex justify-center items-center gap-2 sm:gap-3 flex-wrap">
          {[
            { label: "All Vehicles", value: "ALL" },
            { label: "Executive Sedans", value: "SEDAN" },
            { label: "Premium SUVs", value: "SUV" },
          ].map((tab) => {
            const isActive = selectedCategory === tab.value;
            return (
              <button
                key={tab.value}
                onClick={() => setSelectedCategory(tab.value)}
                className={`px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer ${
                  isActive
                    ? "bg-amber-400 text-slate-950 shadow-lg shadow-amber-400/20"
                    : "bg-slate-900 border border-white/10 text-slate-400 hover:text-white hover:border-amber-500/30"
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Loading State */}
        {loading ? (
          <div className="text-center py-20 text-slate-400 text-xs font-mono">
            Loading vehicle fleet roster...
          </div>
        ) : filteredVehicles.length === 0 ? (
          /* Empty State */
          <div className="bg-slate-900/60 border border-white/10 rounded-3xl p-12 text-center max-w-xl mx-auto space-y-4">
            <Car className="w-12 h-12 text-amber-400/50 mx-auto" />
            <h3 className="text-lg font-bold text-slate-200">No Vehicles Found</h3>
            <p className="text-xs text-slate-400">
              {selectedCategory !== "ALL"
                ? `No vehicles found in category "${selectedCategory}". Try switching to All Vehicles.`
                : "No commercial vehicles are currently listed. Please check back shortly."}
            </p>
            {selectedCategory !== "ALL" && (
              <button
                onClick={() => setSelectedCategory("ALL")}
                className="text-xs font-bold text-amber-400 hover:underline cursor-pointer"
              >
                View All Vehicles
              </button>
            )}
          </div>
        ) : (
          /* Vehicles Grid */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredVehicles.map((v) => (
              <div
                key={v.id}
                className="bg-slate-900/90 border border-white/10 hover:border-amber-500/40 rounded-3xl p-6 shadow-2xl flex flex-col justify-between transition-all group relative overflow-hidden"
              >
                {/* Featured Badge */}
                {v.isFeatured && (
                  <div className="absolute top-3 right-3 z-10 flex items-center gap-1 bg-amber-500 text-slate-950 text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full shadow-md">
                    <Star className="w-3 h-3 fill-slate-950" />
                    <span>Featured</span>
                  </div>
                )}

                <div className="space-y-4">
                  <div className="flex justify-between items-center pr-20">
                    <span className="bg-amber-500/10 text-amber-400 border border-amber-500/20 text-xs font-mono font-bold px-3 py-1 rounded-full uppercase">
                      {v.categoryName || "Sedan"} &bull; {v.vehicleClass || v.subCategory || "Executive"}
                    </span>
                  </div>

                  {/* Vehicle Image Banner */}
                  <div className="relative h-44 bg-slate-950 rounded-2xl overflow-hidden border border-white/5">
                    <img
                      src={v.imageUrl || "/images/hero-car.png"}
                      alt={`${v.make} ${v.model}`}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      onError={(e) => {
                        (e.target as HTMLElement).setAttribute("src", "/images/hero-car.png");
                      }}
                    />
                  </div>

                  <div>
                    <h3 className="text-xl font-extrabold text-slate-50 group-hover:text-amber-400 transition-colors">
                      {v.make} {v.model}
                    </h3>
                    {v.registrationNumber && (
                      <div className="text-xs font-mono text-slate-400 mt-1">
                        Reg #: {v.registrationNumber}
                      </div>
                    )}
                  </div>

                  {/* Specs Matrix */}
                  <div className="bg-slate-950 p-4 rounded-2xl border border-white/5 space-y-2 text-xs font-mono">
                    <div className="flex justify-between text-slate-300">
                      <span className="text-slate-400 font-sans flex items-center gap-1.5">
                        <Users className="w-3.5 h-3.5 text-amber-400" /> Seating:
                      </span>
                      <strong className="text-slate-100">{v.capacity || 4} Passengers</strong>
                    </div>
                    <div className="flex justify-between text-slate-300">
                      <span className="text-slate-400 font-sans flex items-center gap-1.5">
                        <Fuel className="w-3.5 h-3.5 text-amber-400" /> Fuel & Gearbox:
                      </span>
                      <strong className="text-slate-100">{v.fuelType || "Diesel"} ({v.transmission || "Manual"})</strong>
                    </div>
                    <div className="flex justify-between text-slate-300">
                      <span className="text-slate-400 font-sans flex items-center gap-1.5">
                        <Gauge className="w-3.5 h-3.5 text-amber-400" /> Tariff:
                      </span>
                      <strong className="text-amber-400">
                        ₹{v.perKmRate || 15}/km &bull; ₹{v.perHourRate || 150}/hr
                      </strong>
                    </div>
                    {v.driverAllowance && (
                      <div className="flex justify-between text-slate-300 text-[11px]">
                        <span className="text-slate-500 font-sans">Driver Day/Night Allowance:</span>
                        <strong className="text-slate-300">₹{v.driverAllowance} / ₹{v.nightAllowance || 300}</strong>
                      </div>
                    )}
                  </div>
                </div>

                <div className="pt-6 border-t border-white/10 flex items-center justify-between mt-6">
                  <Link
                    href="/#booking-widget"
                    className="w-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black py-3 rounded-xl text-center text-xs uppercase tracking-wider transition-all shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <span>Book This Vehicle</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default function FleetPage() {
  return (
    <Suspense fallback={<div className="bg-slate-950 min-h-screen text-slate-100 pt-32 text-center text-xs">Loading Fleet Showcase...</div>}>
      <FleetContent />
    </Suspense>
  );
}
