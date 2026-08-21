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
  Clock,
  X,
  Edit2
} from "lucide-react";

export default function MasterFleetRosterPage() {
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [newVehicle, setNewVehicle] = useState({
    make: "",
    model: "",
    registrationNumber: "",
    capacity: "4",
    categoryName: "Sedan",
    perKmRate: "14",
    baseDailyRate: "3500",
    insuranceExpiry: "2027-06-30"
  });

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

  useEffect(() => {
    fetch("/api/fleet")
      .then((res) => res.ok ? res.json() : [])
      .then((data) => {
        const list = Array.isArray(data) ? data : (data.vehicles || []);
        if (list.length > 0) setVehicles(list);
        else setVehicles(defaultFleetList);
      })
      .catch((err) => {
        console.error(err);
        setVehicles(defaultFleetList);
      });
  }, []);

  const handleAddVehicleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const created = {
      id: `v-${Date.now()}`,
      make: newVehicle.make,
      model: newVehicle.model,
      registrationNumber: newVehicle.registrationNumber || "MH 02 XX 9999",
      capacity: parseInt(newVehicle.capacity, 10),
      categoryName: newVehicle.categoryName,
      perKmRate: parseFloat(newVehicle.perKmRate),
      baseDailyRate: parseFloat(newVehicle.baseDailyRate),
      isAvailable: true,
      insuranceExpiry: newVehicle.insuranceExpiry
    };
    setVehicles(prev => [created, ...prev]);
    setShowModal(false);
    setNewVehicle({ make: "", model: "", registrationNumber: "", capacity: "4", categoryName: "Sedan", perKmRate: "14", baseDailyRate: "3500", insuranceExpiry: "2027-06-30" });
  };

  const toggleAvailability = (id: string) => {
    setVehicles(prev => prev.map(v => v.id === id ? { ...v, isAvailable: !v.isAvailable } : v));
  };

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
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 px-4 py-2 rounded-xl text-xs font-black tracking-wider uppercase transition-all shadow-lg shadow-amber-500/20"
          >
            <Plus className="w-4 h-4" />
            <span>Add Vehicle</span>
          </button>
        </div>
      </div>

      {/* Fleet Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {vehicles.map((v) => (
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
                <div className="text-[11px] font-mono text-slate-400">{v.registrationNumber}</div>
              </div>
              <button
                onClick={() => toggleAvailability(v.id)}
                className={`flex items-center gap-1 text-[10px] font-bold px-2.5 py-1 rounded-full border cursor-pointer ${
                  v.isAvailable !== false
                    ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                    : "bg-red-500/10 text-red-400 border-red-500/20"
                }`}
              >
                <CheckCircle2 className="w-3 h-3" /> {v.isAvailable !== false ? "Available" : "Maintenance"}
              </button>
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

      {/* Add Vehicle Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-amber-500/30 rounded-2xl p-6 w-full max-w-lg shadow-2xl space-y-4 relative text-slate-100">
            <button
              onClick={() => setShowModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="space-y-1">
              <span className="text-[10px] font-bold uppercase text-amber-400 tracking-wider">Master Fleet Catalogue</span>
              <h3 className="text-xl font-bold text-slate-50">Add Commercial Vehicle</h3>
            </div>

            <form onSubmit={handleAddVehicleSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-slate-400 font-bold">Vehicle Make *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Toyota"
                    value={newVehicle.make}
                    onChange={(e) => setNewVehicle({ ...newVehicle, make: e.target.value })}
                    className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-slate-100 focus:outline-none focus:border-amber-400"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-slate-400 font-bold">Model Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Innova Crysta"
                    value={newVehicle.model}
                    onChange={(e) => setNewVehicle({ ...newVehicle, model: e.target.value })}
                    className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-slate-100 focus:outline-none focus:border-amber-400"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-slate-400 font-bold">Registration Number *</label>
                  <input
                    type="text"
                    required
                    placeholder="MH 02 AB 1234"
                    value={newVehicle.registrationNumber}
                    onChange={(e) => setNewVehicle({ ...newVehicle, registrationNumber: e.target.value })}
                    className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-slate-100 focus:outline-none focus:border-amber-400"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-slate-400 font-bold">Category</label>
                  <select
                    value={newVehicle.categoryName}
                    onChange={(e) => setNewVehicle({ ...newVehicle, categoryName: e.target.value })}
                    className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-slate-100 focus:outline-none focus:border-amber-400"
                  >
                    <option value="Sedan">Sedan</option>
                    <option value="SUV">SUV</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-slate-400 font-bold">Per Km Rate (₹)</label>
                  <input
                    type="number"
                    value={newVehicle.perKmRate}
                    onChange={(e) => setNewVehicle({ ...newVehicle, perKmRate: e.target.value })}
                    className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-slate-100 focus:outline-none focus:border-amber-400"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-slate-400 font-bold">Base Daily Slab (₹)</label>
                  <input
                    type="number"
                    value={newVehicle.baseDailyRate}
                    onChange={(e) => setNewVehicle({ ...newVehicle, baseDailyRate: e.target.value })}
                    className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-slate-100 focus:outline-none focus:border-amber-400"
                  />
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 bg-slate-950 text-slate-400 hover:text-white rounded-xl text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-amber-500 text-slate-950 font-bold rounded-xl text-xs uppercase"
                >
                  Save Vehicle
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
