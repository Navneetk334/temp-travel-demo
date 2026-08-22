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

// Full List of 9 Uploaded Fleet Vehicles
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
    driverAllowance: 400,
    nightAllowance: 250,
    fuelType: "CNG / Petrol",
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
    driverAllowance: 500,
    nightAllowance: 300,
    fuelType: "Petrol",
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
    driverAllowance: 600,
    nightAllowance: 400,
    fuelType: "Diesel",
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
    driverAllowance: 1000,
    nightAllowance: 600,
    fuelType: "Diesel",
    isAvailable: true,
    permitStatus: "VALID",
    insuranceExpiry: "2026-12-05"
  },
  {
    id: "v-5",
    make: "Mahindra",
    model: "XUV700 AX7",
    registrationNumber: "MH 03 EY 7711",
    capacity: 7,
    categoryName: "SUV",
    perKmRate: 26,
    baseDailyRate: 5200,
    driverAllowance: 650,
    nightAllowance: 450,
    fuelType: "Diesel",
    isAvailable: true,
    permitStatus: "VALID",
    insuranceExpiry: "2027-08-14"
  },
  {
    id: "v-6",
    make: "Hyundai",
    model: "Creta / Alcazar",
    registrationNumber: "MH 02 DF 5544",
    capacity: 6,
    categoryName: "SUV",
    perKmRate: 20,
    baseDailyRate: 4200,
    driverAllowance: 550,
    nightAllowance: 350,
    fuelType: "Petrol / Diesel",
    isAvailable: true,
    permitStatus: "VALID",
    insuranceExpiry: "2027-04-18"
  },
  {
    id: "v-7",
    make: "Mercedes-Benz",
    model: "E-Class Luxury",
    registrationNumber: "MH 01 CC 9000",
    capacity: 4,
    categoryName: "Sedan",
    perKmRate: 75,
    baseDailyRate: 16000,
    driverAllowance: 1500,
    nightAllowance: 1000,
    fuelType: "Diesel",
    isAvailable: true,
    permitStatus: "VALID",
    insuranceExpiry: "2027-10-30"
  },
  {
    id: "v-8",
    make: "BMW",
    model: "5 Series Executive",
    registrationNumber: "MH 01 DD 8000",
    capacity: 4,
    categoryName: "Sedan",
    perKmRate: 80,
    baseDailyRate: 17500,
    driverAllowance: 1500,
    nightAllowance: 1000,
    fuelType: "Petrol",
    isAvailable: true,
    permitStatus: "VALID",
    insuranceExpiry: "2027-11-25"
  },
  {
    id: "v-9",
    make: "Force Motors",
    model: "Traveller Executive 17S",
    registrationNumber: "MH 04 TT 1717",
    capacity: 17,
    categoryName: "SUV",
    perKmRate: 32,
    baseDailyRate: 7500,
    driverAllowance: 800,
    nightAllowance: 500,
    fuelType: "Diesel",
    isAvailable: true,
    permitStatus: "VALID",
    insuranceExpiry: "2027-09-12"
  }
];

export default function MasterFleetRosterPage() {
  const [vehicles, setVehicles] = useState<any[]>(defaultFleetList);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("ALL");
  const [showModal, setShowModal] = useState(false);

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

  useEffect(() => {
    // Fetch live items from API and merge with uploaded 9 vehicles for instant sub-50ms speed
    fetch("/api/fleet")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data) {
          const apiList = Array.isArray(data) ? data : data.vehicles || [];
          if (apiList.length > 0) {
            // Merge unique vehicles
            const existingRegs = new Set(defaultFleetList.map((v) => v.registrationNumber));
            const fresh = apiList.filter((v: any) => !existingRegs.has(v.registrationNumber));
            setVehicles([...defaultFleetList, ...fresh]);
          }
        }
      })
      .catch((err) => console.error(err));
  }, []);

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const created = {
      id: `v-${Date.now()}`,
      make: newVehicle.make || "Commercial Make",
      model: newVehicle.model || "Commercial Vehicle",
      registrationNumber: newVehicle.registrationNumber || "MH 04 XX 9900",
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

    setVehicles([created, ...vehicles]);
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
              {vehicles.length} Vehicles Managed
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
              <span>Insurance: <strong className="text-slate-200">{v.insuranceExpiry}</strong></span>
            </div>
          </div>
        ))}
      </div>

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
