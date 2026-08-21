"use client";

import React, { useState } from "react";
import {
  Radio,
  Car,
  MapPin,
  ShieldCheck,
  Search,
  Filter,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Navigation,
  RefreshCw,
  PhoneCall,
  X,
  UserCheck,
  Plus
} from "lucide-react";

export default function MasterDispatchRadarPage() {
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("ALL");
  const [selectedDriver, setSelectedDriver] = useState<any | null>(null);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [assignSuccess, setAssignSuccess] = useState(false);

  const [drivers, setDrivers] = useState([
    {
      id: "DRV-101",
      driverName: "Rajesh Kumar",
      phone: "+91-9820112233",
      vehicleModel: "Maruti Suzuki Dzire",
      vehicleCategory: "Sedan",
      regNumber: "MH 02 CZ 4421",
      currentLocation: "Bandra Kurla Complex (BKC), Mumbai",
      destination: "Chhatrapati Shivaji Maharaj Intl Airport Terminal 2",
      status: "IN_TRANSIT",
      speed: "42 km/h",
      eta: "14 Mins",
      tripType: "Airport Transfer",
      customerName: "Ananya Sharma"
    },
    {
      id: "DRV-102",
      driverName: "Suresh Patil",
      phone: "+91-9833445566",
      vehicleModel: "Toyota Innova Crysta",
      vehicleCategory: "SUV",
      regNumber: "MH 04 ER 8890",
      currentLocation: "Lower Parel, Mumbai",
      destination: "Koregaon Park, Pune",
      status: "IN_TRANSIT",
      speed: "78 km/h",
      eta: "1 Hr 40 Mins",
      tripType: "Outstation Trip",
      customerName: "Karan Malhotra"
    },
    {
      id: "DRV-103",
      driverName: "Vikram Singh",
      phone: "+91-9899112244",
      vehicleModel: "Honda City",
      vehicleCategory: "Sedan",
      regNumber: "MH 01 AB 1234",
      currentLocation: "Andheri East, Mumbai",
      destination: "Standby Hub - Sahar",
      status: "AVAILABLE",
      speed: "0 km/h",
      eta: "Ready for Dispatch",
      tripType: "Corporate Standby",
      customerName: "N/A"
    },
    {
      id: "DRV-104",
      driverName: "Mahesh Yadav",
      phone: "+91-9766554433",
      vehicleModel: "Toyota Fortuner 4x4",
      vehicleCategory: "SUV",
      regNumber: "MH 02 FG 9900",
      currentLocation: "Worli Sea Link Entrance",
      destination: "Taj Mahal Palace, Colaba",
      status: "ASSIGNED",
      speed: "25 km/h",
      eta: "8 Mins to Pickup",
      tripType: "VIP Delegation",
      customerName: "Dr. Aris Thorne"
    }
  ]);

  const toggleDriverStatus = (id: string, newStatus: string) => {
    setDrivers(prev => prev.map(d => d.id === id ? { ...d, status: newStatus } : d));
  };

  const filtered = drivers.filter((drv) => {
    const matchesSearch =
      drv.driverName.toLowerCase().includes(search.toLowerCase()) ||
      drv.vehicleModel.toLowerCase().includes(search.toLowerCase()) ||
      drv.currentLocation.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = filterStatus === "ALL" || drv.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-amber-500/20 pb-6">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-3xl font-black tracking-tight text-slate-50">
              Live Dispatch Radar & Telematics
            </h1>
            <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-widest flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              LIVE TELEMATICS STREAM
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Real-time GPS telemetry radar, on-route chauffeur dispatch logs, and live ETAs.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowAssignModal(true)}
            className="flex items-center gap-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all shadow-lg shadow-amber-500/20"
          >
            <UserCheck className="w-4 h-4" />
            <span>Assign Duty Roster</span>
          </button>
        </div>
      </div>

      {/* Simulated Live Radar Visualizer */}
      <div className="bg-slate-900/90 backdrop-blur-2xl border border-amber-500/30 rounded-3xl p-6 shadow-2xl relative overflow-hidden space-y-4">
        <div className="flex justify-between items-center border-b border-white/10 pb-4">
          <div className="flex items-center gap-2 text-amber-400 font-bold text-xs uppercase tracking-wider">
            <Radio className="w-4 h-4 animate-pulse" />
            <span>Pan-India Chauffeur Telematics Grid</span>
          </div>
          <span className="text-xs font-mono text-slate-400">
            Active Vehicles: <span className="text-amber-400 font-bold">{drivers.length}</span>
          </span>
        </div>

        <div className="relative h-64 w-full bg-slate-950/90 rounded-2xl border border-amber-500/20 overflow-hidden flex items-center justify-center">
          <div className="absolute w-96 h-96 rounded-full border border-amber-500/10 animate-ping" />
          <div className="absolute w-64 h-64 rounded-full border border-amber-500/20" />
          <div className="absolute w-32 h-32 rounded-full border border-amber-500/30" />
          
          <div className="relative z-10 text-center space-y-2">
            <Navigation className="w-10 h-10 text-amber-400 mx-auto animate-bounce" />
            <h4 className="text-sm font-black text-slate-100 uppercase tracking-widest">Mumbai & Pan-India Metropolitan Hub Radar</h4>
            <p className="text-xs text-slate-400 max-w-md mx-auto">
              Real-time driver app telemetry connected. Active GPS ping interval: <span className="text-emerald-400 font-mono font-bold">5 Seconds</span>.
            </p>
          </div>
        </div>
      </div>

      {/* Search & Filter Toolbar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-slate-900/60 p-4 rounded-2xl border border-white/10">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search driver, vehicle or location..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-950 border border-white/10 rounded-xl pl-9 pr-4 py-2 text-xs text-slate-100 focus:outline-none focus:border-amber-400"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter className="w-4 h-4 text-slate-400" />
          <span className="text-xs text-slate-400 font-bold uppercase">Status:</span>
          {["ALL", "IN_TRANSIT", "ASSIGNED", "AVAILABLE"].map((st) => (
            <button
              key={st}
              onClick={() => setFilterStatus(st)}
              className={`px-3 py-1.5 rounded-lg text-[11px] font-bold uppercase transition-all ${
                filterStatus === st
                  ? "bg-amber-500 text-slate-950 font-black"
                  : "bg-slate-950 text-slate-400 hover:text-white"
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Drivers Telematics List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filtered.map((drv) => (
          <div
            key={drv.id}
            className="bg-slate-900/80 backdrop-blur-xl border border-white/10 hover:border-amber-500/40 rounded-2xl p-6 shadow-xl space-y-4 transition-all"
          >
            <div className="flex justify-between items-start">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 font-bold">
                  <Car className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-100 text-sm">{drv.driverName}</h3>
                  <div className="text-[11px] text-slate-400 font-mono">{drv.vehicleModel} &bull; {drv.regNumber}</div>
                </div>
              </div>

              <select
                value={drv.status}
                onChange={(e) => toggleDriverStatus(drv.id, e.target.value)}
                className={`text-[10px] font-black uppercase px-2.5 py-1 rounded-full border focus:outline-none cursor-pointer bg-slate-950 ${
                  drv.status === "IN_TRANSIT"
                    ? "text-emerald-400 border-emerald-500/30"
                    : drv.status === "ASSIGNED"
                    ? "text-blue-400 border-blue-500/30"
                    : "text-amber-400 border-amber-500/30"
                }`}
              >
                <option value="IN_TRANSIT">IN TRANSIT</option>
                <option value="ASSIGNED">ASSIGNED</option>
                <option value="AVAILABLE">AVAILABLE</option>
              </select>
            </div>

            <div className="space-y-2 bg-slate-950/80 p-3 rounded-xl border border-white/5 text-xs">
              <div className="flex items-center justify-between text-slate-300">
                <span className="text-slate-400 font-semibold">Current Location:</span>
                <span className="font-bold text-slate-200 truncate max-w-[200px]">{drv.currentLocation}</span>
              </div>
              <div className="flex items-center justify-between text-slate-300">
                <span className="text-slate-400 font-semibold">Destination:</span>
                <span className="font-bold text-amber-400 truncate max-w-[200px]">{drv.destination}</span>
              </div>
              <div className="flex items-center justify-between text-slate-300">
                <span className="text-slate-400 font-semibold">Passenger:</span>
                <span className="font-bold text-slate-200">{drv.customerName}</span>
              </div>
            </div>

            <div className="flex items-center justify-between pt-2 text-xs font-mono">
              <span className="text-slate-400">Speed: <strong className="text-slate-200">{drv.speed}</strong></span>
              <span className="text-slate-400">ETA: <strong className="text-emerald-400">{drv.eta}</strong></span>
              <a
                href={`tel:${drv.phone}`}
                className="flex items-center gap-1 text-amber-400 hover:underline font-bold"
              >
                <PhoneCall className="w-3.5 h-3.5" /> Call Driver
              </a>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
