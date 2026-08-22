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
  Edit2,
  Upload
} from "lucide-react";

export default function MasterFleetRosterPage() {
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("ALL");
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(true);

  const [newVehicle, setNewVehicle] = useState({
    make: "",
    model: "",
    registrationNumber: "",
    categoryName: "Sedan",
    transmission: "Manual",
    fuelType: "Diesel",
    capacity: "4",
    perKmRate: "14",
    baseDailyRate: "3500",
    driverAllowance: "500",
    nightAllowance: "300",
    insuranceExpiry: "2027-06-30",
    fitnessExpiry: "2027-12-31",
    permitExpiry: "2028-03-15",
    imageName: ""
  });

  // Load User Uploaded Fleet Vehicles
  useEffect(() => {
    const loadFleet = async () => {
      setLoading(true);
      let localList: any[] = [];
      const saved = localStorage.getItem("user_uploaded_fleet");
      if (saved) {
        try {
          localList = JSON.parse(saved);
        } catch (e) {
          console.error(e);
        }
      }

      try {
        const res = await fetch("/api/fleet");
        if (res.ok) {
          const data = await res.json();
          const apiList = data.vehicles || [];
          // Combine API & Local persistent vehicles by reg number
          const regMap = new Map();
          localList.forEach(v => regMap.set(v.registrationNumber, v));
          apiList.forEach((v: any) => regMap.set(v.registrationNumber, v));
          setVehicles(Array.from(regMap.values()));
        } else {
          setVehicles(localList);
        }
      } catch (e) {
        setVehicles(localList);
      } finally {
        setLoading(false);
      }
    };

    loadFleet();
  }, []);

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const created = {
      id: `v-${Date.now()}`,
      make: newVehicle.make || "Commercial Make",
      model: newVehicle.model || "Commercial Vehicle",
      registrationNumber: newVehicle.registrationNumber || `MH 04 XX ${Math.floor(1000 + Math.random() * 9000)}`,
      capacity: parseInt(newVehicle.capacity) || 4,
      categoryName: newVehicle.categoryName,
      perKmRate: parseFloat(newVehicle.perKmRate) || 15,
      baseDailyRate: parseFloat(newVehicle.baseDailyRate) || 3000,
      driverAllowance: parseFloat(newVehicle.driverAllowance) || 500,
      nightAllowance: parseFloat(newVehicle.nightAllowance) || 300,
      fuelType: newVehicle.fuelType,
      isAvailable: true,
      permitStatus: "VALID",
      insuranceExpiry: newVehicle.insuranceExpiry
    };

    const updated = [created, ...vehicles];
    setVehicles(updated);
    localStorage.setItem("user_uploaded_fleet", JSON.stringify(updated));

    // Save to Database
    try {
      await fetch("/api/fleet", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(created)
      });
    } catch (err) {
      console.error("Save vehicle error:", err);
    }

    setShowModal(false);
    setNewVehicle({
      make: "",
      model: "",
      registrationNumber: "",
      categoryName: "Sedan",
      transmission: "Manual",
      fuelType: "Diesel",
      capacity: "4",
      perKmRate: "14",
      baseDailyRate: "3500",
      driverAllowance: "500",
      nightAllowance: "300",
      insuranceExpiry: "2027-06-30",
      fitnessExpiry: "2027-12-31",
      permitExpiry: "2028-03-15",
      imageName: ""
    });
  };

  const filteredVehicles = vehicles.filter((v) => {
    const matchesSearch =
      v.model.toLowerCase().includes(search.toLowerCase()) ||
      v.make.toLowerCase().includes(search.toLowerCase()) ||
      v.registrationNumber.toLowerCase().includes(search.toLowerCase());
    const matchesCat = categoryFilter === "ALL" || v.categoryName.toUpperCase() === categoryFilter.toUpperCase();
    return matchesSearch && matchesCat;
  });

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-amber-500/20 pb-6">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-3xl font-black tracking-tight text-slate-50">
              Commercial Fleet Vehicles & Tariff Roster
            </h1>
            <span className="bg-amber-500/10 text-amber-400 border border-amber-500/30 text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-widest">
              {vehicles.length} Uploaded Vehicles
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Complete vehicle fleet specs, commercial tariffs, driver allowances, and permit expiry tracking.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all shadow-lg shadow-amber-500/20 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add Vehicle</span>
          </button>
        </div>
      </div>

      {/* Search & Category Filter */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-slate-900/60 p-4 rounded-2xl border border-white/10">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by make, model or reg number..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-950 border border-white/10 rounded-xl pl-9 pr-4 py-2 text-xs text-slate-100 focus:outline-none focus:border-amber-400"
          />
        </div>

        <div className="flex items-center gap-2">
          {["ALL", "SEDAN", "SUV"].map((cat) => (
            <button
              key={cat}
              onClick={() => setCategoryFilter(cat)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                categoryFilter === cat
                  ? "bg-amber-500 text-slate-950 font-black"
                  : "bg-slate-950 text-slate-400 hover:text-white border border-white/5"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Fleet Vehicles Grid */}
      {filteredVehicles.length === 0 ? (
        <div className="bg-slate-900/60 border border-white/10 rounded-3xl p-12 text-center space-y-4">
          <Car className="w-12 h-12 text-amber-400 mx-auto opacity-80" />
          <div className="space-y-1">
            <h3 className="text-xl font-bold text-slate-100">No Uploaded Vehicles Found</h3>
            <p className="text-xs text-slate-400 max-w-md mx-auto">
              You haven't uploaded any fleet vehicles yet. Click "Add Vehicle" above to upload your 9 fleet vehicles.
            </p>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="px-6 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-black rounded-xl text-xs uppercase tracking-wider shadow-lg shadow-amber-500/20 cursor-pointer"
          >
            + Upload Vehicle Now
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredVehicles.map((v) => (
            <div
              key={v.id}
              className="bg-slate-900/80 backdrop-blur-xl border border-white/10 hover:border-amber-500/40 rounded-2xl p-6 shadow-xl space-y-4 transition-all flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex justify-between items-start">
                  <span className="text-[10px] font-mono text-amber-400 font-bold uppercase tracking-wider bg-amber-500/10 px-2.5 py-0.5 rounded-full border border-amber-500/20">
                    {v.categoryName || "Commercial"}
                  </span>
                  <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-0.5 rounded-full">
                    {v.isAvailable ? "READY FOR DUTY" : "ON ASSIGNMENT"}
                  </span>
                </div>

                <div>
                  <h3 className="font-extrabold text-slate-100 text-lg leading-tight">
                    {v.make} {v.model}
                  </h3>
                  <div className="text-xs font-mono text-amber-400 font-bold mt-0.5">{v.registrationNumber}</div>
                </div>

                {/* Specs & Tariffs Grid */}
                <div className="grid grid-cols-2 gap-2 bg-slate-950 p-3 rounded-xl border border-white/5 text-xs font-mono">
                  <div>
                    <span className="text-slate-500 text-[10px] block font-sans">Seating Capacity</span>
                    <span className="font-bold text-slate-200">{v.capacity} Passengers</span>
                  </div>
                  <div>
                    <span className="text-slate-500 text-[10px] block font-sans">Fuel Type</span>
                    <span className="font-bold text-slate-200">{v.fuelType || "Diesel"}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 text-[10px] block font-sans">Per Km Rate</span>
                    <span className="font-bold text-amber-400">₹{v.perKmRate} / Km</span>
                  </div>
                  <div>
                    <span className="text-slate-500 text-[10px] block font-sans">Base Daily Rate</span>
                    <span className="font-bold text-amber-400">₹{v.baseDailyRate} / Day</span>
                  </div>
                  <div>
                    <span className="text-slate-500 text-[10px] block font-sans">Driver Day Allowance</span>
                    <span className="font-bold text-slate-300">₹{v.driverAllowance}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 text-[10px] block font-sans">Night Halt Allowance</span>
                    <span className="font-bold text-slate-300">₹{v.nightAllowance}</span>
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-white/5 flex items-center justify-between text-[11px] font-mono text-slate-400">
                <span>Permit: <strong className="text-emerald-400">{v.permitStatus || "VALID"}</strong></span>
                <span>Insurance: <strong className="text-slate-200">{v.insuranceExpiry || "2027-12-31"}</strong></span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Commercial Vehicle Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-amber-500/30 rounded-3xl p-6 sm:p-8 w-full max-w-2xl shadow-2xl space-y-4 relative text-slate-100 max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setShowModal(false)}
              className="absolute top-5 right-5 text-slate-400 hover:text-white cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="space-y-1 border-b border-white/10 pb-3">
              <span className="text-[10px] font-bold uppercase text-amber-400 tracking-wider">Commercial Fleet Entry</span>
              <h3 className="text-2xl font-black text-slate-50">Add Commercial Vehicle</h3>
            </div>

            <form onSubmit={handleAddSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-slate-300 font-bold">Vehicle Brand / Make *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Toyota / Maruti Suzuki"
                    value={newVehicle.make}
                    onChange={(e) => setNewVehicle({ ...newVehicle, make: e.target.value })}
                    className="w-full bg-slate-950 border border-white/10 rounded-xl px-3.5 py-2.5 text-slate-100 focus:outline-none focus:border-amber-400 font-semibold"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-slate-300 font-bold">Model Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Innova Crysta / Dzire"
                    value={newVehicle.model}
                    onChange={(e) => setNewVehicle({ ...newVehicle, model: e.target.value })}
                    className="w-full bg-slate-950 border border-white/10 rounded-xl px-3.5 py-2.5 text-slate-100 focus:outline-none focus:border-amber-400 font-semibold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-1">
                  <label className="text-slate-300 font-bold">Registration Number *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. MH 04 ER 8890"
                    value={newVehicle.registrationNumber}
                    onChange={(e) => setNewVehicle({ ...newVehicle, registrationNumber: e.target.value })}
                    className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-slate-100 focus:outline-none focus:border-amber-400 font-mono"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-slate-300 font-bold">Vehicle Category *</label>
                  <select
                    value={newVehicle.categoryName}
                    onChange={(e) => setNewVehicle({ ...newVehicle, categoryName: e.target.value })}
                    className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-slate-100 focus:outline-none focus:border-amber-400"
                  >
                    <option value="Sedan">Sedan</option>
                    <option value="SUV">SUV</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-slate-300 font-bold">Fuel Type</label>
                  <select
                    value={newVehicle.fuelType}
                    onChange={(e) => setNewVehicle({ ...newVehicle, fuelType: e.target.value })}
                    className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-slate-100 focus:outline-none focus:border-amber-400"
                  >
                    <option value="Diesel">Diesel</option>
                    <option value="Petrol">Petrol</option>
                    <option value="CNG">CNG</option>
                    <option value="Electric">Electric (EV)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-1">
                  <label className="text-slate-300 font-bold">Seating Capacity</label>
                  <input
                    type="number"
                    value={newVehicle.capacity}
                    onChange={(e) => setNewVehicle({ ...newVehicle, capacity: e.target.value })}
                    className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-slate-100 focus:outline-none focus:border-amber-400"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-slate-300 font-bold">Per Km Rate (₹) *</label>
                  <input
                    type="number"
                    required
                    value={newVehicle.perKmRate}
                    onChange={(e) => setNewVehicle({ ...newVehicle, perKmRate: e.target.value })}
                    className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-slate-100 focus:outline-none focus:border-amber-400 font-bold text-amber-400"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-slate-300 font-bold">Base Daily Rate (₹)</label>
                  <input
                    type="number"
                    value={newVehicle.baseDailyRate}
                    onChange={(e) => setNewVehicle({ ...newVehicle, baseDailyRate: e.target.value })}
                    className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-slate-100 focus:outline-none focus:border-amber-400 font-bold text-amber-400"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-slate-300 font-bold">Driver Allowance (₹/Day)</label>
                  <input
                    type="number"
                    value={newVehicle.driverAllowance}
                    onChange={(e) => setNewVehicle({ ...newVehicle, driverAllowance: e.target.value })}
                    className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-slate-100 focus:outline-none focus:border-amber-400"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-slate-300 font-bold">Night Halt Allowance (₹)</label>
                  <input
                    type="number"
                    value={newVehicle.nightAllowance}
                    onChange={(e) => setNewVehicle({ ...newVehicle, nightAllowance: e.target.value })}
                    className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-slate-100 focus:outline-none focus:border-amber-400"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-slate-300 font-bold">Vehicle Image Upload from Device</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setNewVehicle({ ...newVehicle, imageName: e.target.files?.[0]?.name || "" })}
                  className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-slate-300 text-xs file:mr-4 file:py-1 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-amber-500 file:text-slate-950"
                />
              </div>

              <div className="pt-3 border-t border-white/10 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-5 py-2.5 bg-slate-950 text-slate-400 hover:text-white rounded-xl text-xs font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-black rounded-xl text-xs uppercase tracking-wider shadow-lg shadow-amber-500/20 cursor-pointer"
                >
                  Save Commercial Vehicle
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
