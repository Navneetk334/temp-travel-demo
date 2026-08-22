"use client";

import React, { useState } from "react";
import {
  UserCheck,
  Plus,
  Search,
  Filter,
  PhoneCall,
  ShieldCheck,
  Car,
  Clock,
  AlertTriangle,
  CheckCircle2,
  X,
  FileText,
  BadgeCheck
} from "lucide-react";

export default function MasterDriversPage() {
  const [search, setSearch] = useState("");
  const [filterDuty, setFilterDuty] = useState("ALL");
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedDriver, setSelectedDriver] = useState<any | null>(null);

  const [drivers, setDrivers] = useState([
    {
      id: "DRV-101",
      name: "Rajesh Kumar",
      phone: "9820112233",
      licenseNumber: "MH-0220190045123",
      licenseExpiry: "2029-08-15",
      vehicleCategory: "Pickup & Drop / Airport Transfer",
      vehicleClass: "Sedan",
      vehicleModel: "Maruti Suzuki Dzire",
      assignedVehicle: "MH 02 CZ 4421 (Swift Dzire)",
      policeVerification: "VERIFIED",
      status: "ON_DUTY",
      experienceYears: 8,
      address: "Andheri West, Mumbai",
      emergencyContact: "9820119900 (Wife)"
    },
    {
      id: "DRV-102",
      name: "Suresh Patil",
      phone: "9833445566",
      licenseNumber: "MH-0420180098765",
      licenseExpiry: "2028-12-01",
      vehicleCategory: "Outstation Trip",
      vehicleClass: "SUV",
      vehicleModel: "Toyota Innova Crysta",
      assignedVehicle: "MH 04 ER 8890 (Innova Crysta)",
      policeVerification: "VERIFIED",
      status: "ON_DUTY",
      experienceYears: 12,
      address: "Thane West, Mumbai",
      emergencyContact: "9833441122 (Brother)"
    },
    {
      id: "DRV-103",
      name: "Vikram Singh",
      phone: "9899112244",
      licenseNumber: "MH-0120200033445",
      licenseExpiry: "2030-05-10",
      vehicleCategory: "Corporate Transit",
      vehicleClass: "Sedan",
      vehicleModel: "Honda City",
      assignedVehicle: "MH 01 AB 1234 (Honda City)",
      policeVerification: "VERIFIED",
      status: "STANDBY",
      experienceYears: 6,
      address: "Powai, Mumbai",
      emergencyContact: "9899110099 (Father)"
    },
    {
      id: "DRV-104",
      name: "Mahesh Yadav",
      phone: "9766554433",
      licenseNumber: "MH-0220170077889",
      licenseExpiry: "2027-02-18",
      vehicleCategory: "VIP Delegation",
      vehicleClass: "Luxury SUV",
      vehicleModel: "Toyota Fortuner 4x4",
      assignedVehicle: "MH 02 FG 9900 (Fortuner 4x4)",
      policeVerification: "VERIFIED",
      status: "ON_DUTY",
      experienceYears: 10,
      address: "Bandra East, Mumbai",
      emergencyContact: "9766550011 (Wife)"
    }
  ]);

  const [newDriver, setNewDriver] = useState({
    name: "",
    phone: "",
    licenseNumber: "",
    address: "",
    vehicleCategory: "Pickup & Drop / Airport Transfer",
    vehicleClass: "Sedan",
    vehicleModel: "Maruti Suzuki Dzire",
    licenseExpiry: "2029-12-31",
    policeVerification: "VERIFIED"
  });

  const handleAddDriverSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const created = {
      id: `DRV-${101 + drivers.length}`,
      name: newDriver.name,
      phone: newDriver.phone,
      licenseNumber: newDriver.licenseNumber || "MH-0220220011223",
      licenseExpiry: newDriver.licenseExpiry,
      vehicleCategory: newDriver.vehicleCategory,
      vehicleClass: newDriver.vehicleClass,
      vehicleModel: newDriver.vehicleModel,
      assignedVehicle: `${newDriver.vehicleClass} - ${newDriver.vehicleModel}`,
      policeVerification: newDriver.policeVerification,
      status: "STANDBY",
      experienceYears: 5,
      address: newDriver.address || "Mumbai Hub",
      emergencyContact: "On Record"
    };
    setDrivers([created, ...drivers]);
    setShowAddModal(false);
    setNewDriver({
      name: "",
      phone: "",
      licenseNumber: "",
      address: "",
      vehicleCategory: "Pickup & Drop / Airport Transfer",
      vehicleClass: "Sedan",
      vehicleModel: "Maruti Suzuki Dzire",
      licenseExpiry: "2029-12-31",
      policeVerification: "VERIFIED"
    });
  };

  const filtered = drivers.filter(d => {
    const matchesSearch = d.name.toLowerCase().includes(search.toLowerCase()) || d.phone.includes(search) || d.licenseNumber.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = filterDuty === "ALL" || d.status === filterDuty;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-amber-500/20 pb-6">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-3xl font-black tracking-tight text-slate-50">
              Master Driver & Chauffeur Roster
            </h1>
            <span className="bg-amber-500/10 text-amber-400 border border-amber-500/30 text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-widest">
              Vetted Chauffeurs HQ
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Add chauffeurs, verify commercial driving licenses, police background records, and assigned vehicle specs.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 px-4 py-2 rounded-xl text-xs font-black tracking-wider uppercase transition-all shadow-lg shadow-amber-500/20 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Driver</span>
          </button>
        </div>
      </div>

      {/* Driver Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {filtered.map((drv) => (
          <div
            key={drv.id}
            className="bg-slate-900/80 backdrop-blur-xl border border-white/10 hover:border-amber-500/40 rounded-2xl p-6 shadow-xl space-y-4 transition-all flex flex-col justify-between"
          >
            <div className="space-y-3">
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 font-black text-sm">
                    {drv.name.charAt(0)}
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-100 text-sm">{drv.name}</h3>
                    <div className="text-[11px] font-mono text-slate-400">+91-{drv.phone}</div>
                  </div>
                </div>
                <span
                  className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full border ${
                    drv.status === "ON_DUTY"
                      ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                      : "bg-amber-500/10 text-amber-400 border-amber-500/20"
                  }`}
                >
                  {drv.status.replace("_", " ")}
                </span>
              </div>

              <div className="space-y-1.5 bg-slate-950 p-3 rounded-xl border border-white/5 text-xs font-mono">
                <div className="flex justify-between">
                  <span className="text-slate-400 font-sans">License #:</span>
                  <span className="text-amber-400 font-bold truncate max-w-[120px]">{drv.licenseNumber}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400 font-sans">Assigned Model:</span>
                  <span className="text-slate-200 font-bold truncate max-w-[120px]">{drv.vehicleModel}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400 font-sans">Class / Duty:</span>
                  <span className="text-slate-200">{drv.vehicleClass}</span>
                </div>
              </div>

              <div className="flex items-center justify-between text-[10px] font-bold">
                <span className="flex items-center gap-1 text-emerald-400">
                  <BadgeCheck className="w-3.5 h-3.5" /> Police Verified
                </span>
                <span className="text-slate-500 font-mono">Lic Exp: {drv.licenseExpiry}</span>
              </div>
            </div>

            <div className="pt-2 border-t border-white/5 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setSelectedDriver(drv)}
                  className="text-[11px] font-bold text-slate-300 hover:text-amber-400 transition-colors cursor-pointer"
                >
                  Inspect File
                </button>
                <button
                  onClick={() => {
                    const confirmDel = confirm(`Are you sure you want to remove driver ${drv.name}?`);
                    if (confirmDel) {
                      setDrivers(drivers.filter(d => d.id !== drv.id));
                    }
                  }}
                  className="text-[10px] font-bold text-rose-400 hover:text-rose-300 transition-colors cursor-pointer"
                >
                  Delete
                </button>
              </div>
              <a
                href={`tel:${drv.phone}`}
                className="flex items-center gap-1 bg-amber-500/10 text-amber-400 border border-amber-500/30 px-3 py-1 rounded-lg hover:bg-amber-500 hover:text-slate-950 text-[11px] font-bold transition-all"
              >
                <PhoneCall className="w-3 h-3" /> Call
              </a>
            </div>
          </div>
        ))}
      </div>

      {/* Add Driver Modal with Structured Vehicle Assignment */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-amber-500/30 rounded-3xl p-6 sm:p-8 w-full max-w-xl shadow-2xl space-y-6 relative text-slate-100 max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setShowAddModal(false)}
              className="absolute top-5 right-5 text-slate-400 hover:text-white cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="space-y-1 border-b border-white/10 pb-3">
              <span className="text-[10px] font-bold uppercase text-amber-400 tracking-wider">Master Chauffeur Roster</span>
              <h3 className="text-2xl font-black text-slate-50">Register New Driver</h3>
            </div>

            <form onSubmit={handleAddDriverSubmit} className="space-y-5 text-xs">
              {/* Top Section: Personal Details */}
              <div className="space-y-3">
                <h4 className="text-amber-400 font-extrabold uppercase text-[11px] tracking-wider flex items-center gap-1.5">
                  <UserCheck className="w-4 h-4" /> Personal & Driving License Details
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-slate-300 font-bold">Driver Name *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Ramesh Pawar"
                      value={newDriver.name}
                      onChange={(e) => setNewDriver({ ...newDriver, name: e.target.value })}
                      className="w-full bg-slate-950 border border-white/10 rounded-xl px-3.5 py-2.5 text-slate-100 focus:outline-none focus:border-amber-400 font-semibold"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-slate-300 font-bold">Mobile Number *</label>
                    <input
                      type="tel"
                      required
                      maxLength={10}
                      placeholder="10-digit mobile number"
                      value={newDriver.phone}
                      onChange={(e) => setNewDriver({ ...newDriver, phone: e.target.value.replace(/\D/g, "") })}
                      className="w-full bg-slate-950 border border-white/10 rounded-xl px-3.5 py-2.5 text-slate-100 focus:outline-none focus:border-amber-400 font-semibold font-mono"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-slate-300 font-bold">Driver License Number *</label>
                    <input
                      type="text"
                      required
                      placeholder="MH-0220200012345"
                      value={newDriver.licenseNumber}
                      onChange={(e) => setNewDriver({ ...newDriver, licenseNumber: e.target.value })}
                      className="w-full bg-slate-950 border border-white/10 rounded-xl px-3.5 py-2.5 text-slate-100 focus:outline-none focus:border-amber-400 font-mono"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-slate-300 font-bold">Current Residential Address *</label>
                    <input
                      type="text"
                      required
                      placeholder="Street, Area, City"
                      value={newDriver.address}
                      onChange={(e) => setNewDriver({ ...newDriver, address: e.target.value })}
                      className="w-full bg-slate-950 border border-white/10 rounded-xl px-3.5 py-2.5 text-slate-100 focus:outline-none focus:border-amber-400"
                    />
                  </div>
                </div>
              </div>

              {/* Separate Section Below: Assigned Vehicle Selection */}
              <div className="space-y-3 p-4 bg-slate-950 rounded-2xl border border-amber-500/20">
                <h4 className="text-amber-400 font-extrabold uppercase text-[11px] tracking-wider flex items-center gap-1.5">
                  <Car className="w-4 h-4" /> Assigned Vehicle Specs
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="space-y-1">
                    <label className="text-slate-300 font-bold">Vehicle Category</label>
                    <select
                      value={newDriver.vehicleCategory}
                      onChange={(e) => setNewDriver({ ...newDriver, vehicleCategory: e.target.value })}
                      className="w-full bg-slate-900 border border-white/10 rounded-xl px-3 py-2 text-slate-100 focus:outline-none focus:border-amber-400"
                    >
                      <option value="Pickup & Drop / Airport Transfer">Airport / Transfer</option>
                      <option value="Local Rental">Local Rental</option>
                      <option value="Outstation Trip">Outstation Trip</option>
                      <option value="Corporate Transit">Corporate Transit</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-slate-300 font-bold">Vehicle Class</label>
                    <select
                      value={newDriver.vehicleClass}
                      onChange={(e) => setNewDriver({ ...newDriver, vehicleClass: e.target.value })}
                      className="w-full bg-slate-900 border border-white/10 rounded-xl px-3 py-2 text-slate-100 focus:outline-none focus:border-amber-400"
                    >
                      <option value="Sedan">Sedan</option>
                      <option value="SUV">SUV</option>
                      <option value="Luxury SUV">Luxury SUV</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-slate-300 font-bold">Vehicle Model</label>
                    <select
                      value={newDriver.vehicleModel}
                      onChange={(e) => setNewDriver({ ...newDriver, vehicleModel: e.target.value })}
                      className="w-full bg-slate-900 border border-white/10 rounded-xl px-3 py-2 text-slate-100 focus:outline-none focus:border-amber-400"
                    >
                      <option value="Maruti Suzuki Dzire">Maruti Swift Dzire</option>
                      <option value="Honda City">Honda City</option>
                      <option value="Toyota Innova Crysta">Toyota Innova Crysta</option>
                      <option value="Toyota Fortuner 4x4">Toyota Fortuner 4x4</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-3 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-5 py-2.5 bg-slate-950 text-slate-400 hover:text-white rounded-xl text-xs font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-black rounded-xl text-xs uppercase tracking-wider shadow-lg shadow-amber-500/20 cursor-pointer"
                >
                  Save Chauffeur Profile
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Driver Inspector Modal */}
      {selectedDriver && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-amber-500/30 rounded-2xl p-6 w-full max-w-md shadow-2xl space-y-4 relative text-slate-100">
            <button
              onClick={() => setSelectedDriver(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="space-y-1">
              <span className="text-[10px] font-bold uppercase text-amber-400 tracking-wider">Driver File Inspector</span>
              <h3 className="text-xl font-bold text-slate-50">{selectedDriver.name}</h3>
            </div>

            <div className="space-y-2 bg-slate-950 p-4 rounded-xl border border-white/10 text-xs font-mono">
              <div>Phone: <strong className="text-amber-400">+91-{selectedDriver.phone}</strong></div>
              <div>License #: <strong className="text-slate-200">{selectedDriver.licenseNumber}</strong></div>
              <div>Assigned Class: <strong className="text-slate-200">{selectedDriver.vehicleClass || "Sedan"}</strong></div>
              <div>Assigned Model: <strong className="text-amber-400">{selectedDriver.vehicleModel || selectedDriver.assignedVehicle}</strong></div>
              <div>Police Clearance: <strong className="text-emerald-400">{selectedDriver.policeVerification}</strong></div>
              <div>Address: <p className="text-slate-400 font-sans mt-1">{selectedDriver.address}</p></div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setSelectedDriver(null)}
                className="px-4 py-2 bg-amber-500 text-slate-950 font-bold rounded-xl text-xs cursor-pointer"
              >
                Close File
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
