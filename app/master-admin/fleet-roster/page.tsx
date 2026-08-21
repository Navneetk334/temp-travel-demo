"use client";

import React, { useState, useEffect } from "react";
import {
  Car,
  ShieldCheck,
  Plus,
  Search,
  IndianRupee,
  Users,
  CheckCircle2,
  AlertCircle,
  FileText,
  Clock
} from "lucide-react";

export default function MasterFleetRosterPage() {
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/fleet")
      .then((res) => res.ok ? res.json() : [])
      .then((data) => {
        const list = Array.isArray(data) ? data : (data.vehicles || []);
        setVehicles(list);
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  const defaultFleetList = [
    {
      id: "v-1",
      make: "Maruti Suzuki",
      model: "Swift Dzire",
      registrationNumber: "MH 02 CZ 4421",
      capacity: 4,
      categoryName: "Sedan",
      perKmRate: 12,
      baseDailyRate: 2200,
      isAvailable: true,
      permitStatus: "VALID",
      insuranceExpiry: "2027-03-15"
    },
    {
      id: "v-2",
      make: "Honda",
      model: "City / Verna",
      registrationNumber: "MH 01 AB 1234",
      capacity: 4,
      categoryName: "Sedan",
      perKmRate: 18,
      baseDailyRate: 3500,
      isAvailable: true,
      permitStatus: "VALID",
      insuranceExpiry: "2026-11-20"
    },
    {
      id: "v-3",
      make: "Toyota",
      model: "Innova Crysta",
      registrationNumber: "MH 04 ER 8890",
      capacity: 7,
      categoryName: "SUV",
      perKmRate: 22,
      baseDailyRate: 4800,
      isAvailable: true,
      permitStatus: "VALID",
      insuranceExpiry: "2027-01-10"
    },
    {
      id: "v-4",
      make: "Toyota",
      model: "Fortuner 4x4",
      registrationNumber: "MH 02 FG 9900",
      capacity: 7,
      categoryName: "SUV",
      perKmRate: 45,
      baseDailyRate: 9500,
      isAvailable: true,
      permitStatus: "VALID",
      insuranceExpiry: "2026-12-05"
    }
  ];

  const displayList = vehicles.length > 0 ? vehicles : defaultFleetList;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-amber-500/20 pb-6">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-3xl font-black tracking-tight text-slate-50">
              Master Fleet & Chauffeur Roster
            </h1>
            <span className="bg-amber-500/10 text-amber-400 border border-amber-500/30 text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-widest">
              Commercial Fleet HQ
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Commercial vehicle inventory, tariff management, and driver compliance monitoring.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 px-4 py-2 rounded-xl text-xs font-black tracking-wider uppercase transition-all shadow-lg shadow-amber-500/20">
            <Plus className="w-4 h-4" />
            <span>Add Vehicle</span>
          </button>
        </div>
      </div>

      {/* Fleet Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {displayList.map((v) => (
          <div
            key={v.id}
            className="bg-slate-900/80 backdrop-blur-xl border border-white/10 hover:border-amber-500/40 rounded-2xl p-6 shadow-xl space-y-4 transition-all"
          >
            <div className="flex justify-between items-start">
              <div>
                <span className="text-[10px] font-mono uppercase tracking-widest text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20">
                  {v.categoryName || v.category?.name || "Executive"}
                </span>
                <h3 className="text-lg font-bold text-slate-100 mt-1">{v.make} {v.model}</h3>
              </div>
              <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-full">
                <CheckCircle2 className="w-3 h-3" /> Available
              </span>
            </div>

            <div className="space-y-2 bg-slate-950/80 p-3.5 rounded-xl border border-white/5 text-xs font-mono">
              <div className="flex justify-between text-slate-300">
                <span className="text-slate-400 font-sans">Per Km Rate:</span>
                <span className="font-bold text-amber-400">₹{v.perKmRate || 18}/km</span>
              </div>
              <div className="flex justify-between text-slate-300">
                <span className="text-slate-400 font-sans">Daily Base Slab:</span>
                <span className="font-bold text-slate-200">₹{v.baseDailyRate || 3500}/day</span>
              </div>
              <div className="flex justify-between text-slate-300">
                <span className="text-slate-400 font-sans">Seating Capacity:</span>
                <span className="font-bold text-slate-200">{v.capacity} Passengers</span>
              </div>
            </div>

            <div className="flex items-center justify-between pt-2 text-[11px] text-slate-400">
              <span className="flex items-center gap-1 text-emerald-400 font-semibold">
                <ShieldCheck className="w-3.5 h-3.5" /> ISO Commercial Audit
              </span>
              <span className="font-mono text-slate-500">Exp: {v.insuranceExpiry || "2027-01-01"}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
