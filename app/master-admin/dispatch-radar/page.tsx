"use client";

import React, { useState, useEffect } from "react";
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
  Plus,
  Compass,
  Activity
} from "lucide-react";

export default function MasterDispatchRadarPage() {
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("ALL");
  const [selectedDriver, setSelectedDriver] = useState<any | null>(null);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [assignSuccess, setAssignSuccess] = useState(false);

  const [assignForm, setAssignForm] = useState({
    driverName: "Rajesh Kumar",
    vehicleModel: "Maruti Suzuki Dzire",
    customerName: "",
    pickupLocation: "",
    destination: "",
    tripType: "Airport Transfer"
  });

  const [drivers, setDrivers] = useState([
    {
      id: "DRV-101",
      driverName: "Rajesh Kumar",
      phone: "+91-9820112233",
      vehicleModel: "Maruti Suzuki Dzire",
      vehicleCategory: "Sedan",
      regNumber: "MH 02 CZ 4421",
      currentLocation: "Bandra Kurla Complex (BKC), Mumbai",
      destination: "Chhatrapati Shivaji Maharaj Intl Airport T2",
      status: "IN_TRANSIT",
      speed: "42 km/h",
      eta: "14 Mins",
      tripType: "Airport Transfer",
      customerName: "Ananya Sharma",
      coords: { x: "30%", y: "45%" }
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
      customerName: "Karan Malhotra",
      coords: { x: "65%", y: "30%" }
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
      customerName: "N/A",
      coords: { x: "48%", y: "60%" }
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
      customerName: "Dr. Aris Thorne",
      coords: { x: "75%", y: "70%" }
    }
  ]);

  useEffect(() => {
    // Read persisted dispatches from localStorage
    const saved = localStorage.getItem("master_dispatches");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setDrivers(prev => [...parsed, ...prev]);
        }
      } catch (e) {
        console.error(e);
      }
    }
  }, []);

  const toggleDriverStatus = (id: string, newStatus: string) => {
    setDrivers(prev => prev.map(d => d.id === id ? { ...d, status: newStatus } : d));
  };

  const handleAssignSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!assignForm.customerName || !assignForm.pickupLocation) return;

    const newDuty = {
      id: `DRV-${Date.now()}`,
      driverName: assignForm.driverName,
      phone: "+91-9820112233",
      vehicleModel: assignForm.vehicleModel,
      vehicleCategory: "Executive",
      regNumber: "MH 02 AB 9988",
      currentLocation: assignForm.pickupLocation,
      destination: assignForm.destination || "Destination Hub",
      status: "ASSIGNED",
      speed: "0 km/h",
      eta: "15 Mins",
      tripType: assignForm.tripType,
      customerName: assignForm.customerName,
      coords: { x: "50%", y: "50%" }
    };

    setDrivers([newDuty, ...drivers]);
    setAssignSuccess(true);
    setTimeout(() => {
      setAssignSuccess(false);
      setShowAssignModal(false);
      setAssignForm({
        driverName: "Rajesh Kumar",
        vehicleModel: "Maruti Suzuki Dzire",
        customerName: "",
        pickupLocation: "",
        destination: "",
        tripType: "Airport Transfer"
      });
    }, 1500);
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
            className="flex items-center gap-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all shadow-lg shadow-amber-500/20 cursor-pointer"
          >
            <UserCheck className="w-4 h-4" />
            <span>Assign Duty Roster</span>
          </button>
        </div>
      </div>

      {/* Interactive Telematics Radar Visualizer */}
      <div className="bg-slate-900/90 backdrop-blur-2xl border border-amber-500/30 rounded-3xl p-6 shadow-2xl relative overflow-hidden space-y-4">
        <div className="flex justify-between items-center border-b border-white/10 pb-4">
          <div className="flex items-center gap-2 text-amber-400 font-bold text-xs uppercase tracking-wider">
            <Radio className="w-4 h-4 animate-pulse" />
            <span>Interactive Pan-India Chauffeur Telematics Grid Map</span>
          </div>
          <span className="text-xs font-mono text-slate-400">
            Active GPS Pins: <span className="text-amber-400 font-bold">{drivers.length}</span>
          </span>
        </div>

        <div className="relative h-72 w-full bg-slate-950/90 rounded-2xl border border-amber-500/20 overflow-hidden flex items-center justify-center">
          {/* Radar Scanning Ring Animations */}
          <div className="absolute w-96 h-96 rounded-full border border-amber-500/10 animate-ping pointer-events-none" />
          <div className="absolute w-64 h-64 rounded-full border border-amber-500/20 pointer-events-none" />
          <div className="absolute w-32 h-32 rounded-full border border-amber-500/30 pointer-events-none" />
          
          {/* Radar Grid Crosshair Lines */}
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:32px_32px] pointer-events-none" />

          {/* Interactive Vehicle Radar Pin Dots */}
          {drivers.map((drv, idx) => (
            <div
              key={drv.id || idx}
              onClick={() => setSelectedDriver(drv)}
              style={{ left: drv.coords?.x || `${20 + idx * 18}%`, top: drv.coords?.y || `${30 + idx * 12}%` }}
              className="absolute -translate-x-1/2 -translate-y-1/2 z-20 cursor-pointer group"
              title={`Click to inspect ${drv.driverName} (${drv.vehicleModel})`}
            >
              <div className="relative flex items-center justify-center">
                <span className="w-4 h-4 rounded-full bg-amber-400 animate-ping absolute opacity-75" />
                <div className="w-6 h-6 rounded-full bg-amber-500 border-2 border-slate-950 flex items-center justify-center text-slate-950 font-black text-[10px] shadow-lg group-hover:scale-125 transition-transform">
                  <Car className="w-3.5 h-3.5" />
                </div>
              </div>
              <div className="absolute top-full left-1/2 -translate-x-1/2 mt-1 bg-slate-900/90 border border-amber-500/40 text-slate-100 text-[10px] font-mono font-bold px-2 py-0.5 rounded shadow-xl whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                {drv.driverName} ({drv.speed})
              </div>
            </div>
          ))}

          <div className="relative z-10 text-center space-y-2 pointer-events-none">
            <Navigation className="w-10 h-10 text-amber-400 mx-auto animate-bounce" />
            <h4 className="text-sm font-black text-slate-100 uppercase tracking-widest">Mumbai & Pan-India Metropolitan Hub Telematics Radar</h4>
            <p className="text-xs text-slate-400 max-w-md mx-auto">
              Live chauffeur app GPS connected. Click any pulsing radar dot above to inspect real-time vehicle telemetry.
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

      {/* Assign Duty Roster Modal */}
      {showAssignModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-amber-500/30 rounded-2xl p-6 w-full max-w-lg shadow-2xl space-y-4 relative text-slate-100">
            <button
              onClick={() => setShowAssignModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="space-y-1">
              <span className="text-[10px] font-bold uppercase text-amber-400 tracking-wider">Telematics Dispatch Command</span>
              <h3 className="text-xl font-bold text-slate-50">Assign Chauffeur Duty Roster</h3>
            </div>

            {assignSuccess ? (
              <div className="bg-emerald-500/10 border border-emerald-500/30 p-6 rounded-xl text-center space-y-2">
                <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto animate-bounce" />
                <div className="text-sm font-bold text-emerald-400">Duty Roster Assigned Successfully!</div>
                <div className="text-xs text-slate-300">Driver notified on GPS Telematics App.</div>
              </div>
            ) : (
              <form onSubmit={handleAssignSubmit} className="space-y-4 text-xs">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-slate-400 font-bold">Select Driver *</label>
                    <select
                      value={assignForm.driverName}
                      onChange={(e) => setAssignForm({ ...assignForm, driverName: e.target.value })}
                      className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-slate-100"
                    >
                      <option value="Rajesh Kumar">Rajesh Kumar (Swift Dzire)</option>
                      <option value="Suresh Patil">Suresh Patil (Innova Crysta)</option>
                      <option value="Vikram Singh">Vikram Singh (Honda City)</option>
                      <option value="Mahesh Yadav">Mahesh Yadav (Fortuner 4x4)</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-slate-400 font-bold">Passenger Name *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Ananya Sharma"
                      value={assignForm.customerName}
                      onChange={(e) => setAssignForm({ ...assignForm, customerName: e.target.value })}
                      className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-slate-100"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-slate-400 font-bold">Pickup Point *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. BKC Complex"
                      value={assignForm.pickupLocation}
                      onChange={(e) => setAssignForm({ ...assignForm, pickupLocation: e.target.value })}
                      className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-slate-100"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-slate-400 font-bold">Destination</label>
                    <input
                      type="text"
                      placeholder="e.g. Airport Terminal 2"
                      value={assignForm.destination}
                      onChange={(e) => setAssignForm({ ...assignForm, destination: e.target.value })}
                      className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-slate-100"
                    />
                  </div>
                </div>

                <div className="pt-2 flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setShowAssignModal(false)}
                    className="px-4 py-2 bg-slate-950 text-slate-400 hover:text-white rounded-xl text-xs"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-amber-500 text-slate-950 font-bold rounded-xl text-xs uppercase"
                  >
                    Confirm Duty Assignment
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Driver Telematics File Inspector Modal */}
      {selectedDriver && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-amber-500/30 rounded-2xl p-6 w-full max-w-md shadow-2xl space-y-4 relative text-slate-100">
            <button
              onClick={() => setSelectedDriver(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="space-y-1">
              <span className="text-[10px] font-bold uppercase text-amber-400 tracking-wider">Live GPS Telematics Ping</span>
              <h3 className="text-xl font-bold text-slate-50">{selectedDriver.driverName}</h3>
            </div>

            <div className="space-y-2 bg-slate-950 p-4 rounded-xl border border-white/10 text-xs font-mono">
              <div>Phone: <strong className="text-amber-400">{selectedDriver.phone}</strong></div>
              <div>Assigned Cab: <strong className="text-slate-200">{selectedDriver.vehicleModel} ({selectedDriver.regNumber})</strong></div>
              <div>Current Location: <strong className="text-slate-200">{selectedDriver.currentLocation}</strong></div>
              <div>Destination: <strong className="text-amber-400">{selectedDriver.destination}</strong></div>
              <div>Passenger: <strong className="text-slate-200">{selectedDriver.customerName}</strong></div>
              <div>Live Speed: <strong className="text-emerald-400">{selectedDriver.speed}</strong></div>
              <div>ETA: <strong className="text-emerald-400">{selectedDriver.eta}</strong></div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setSelectedDriver(null)}
                className="px-4 py-2 bg-amber-500 text-slate-950 font-bold rounded-xl text-xs"
              >
                Close Radar Ping
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
