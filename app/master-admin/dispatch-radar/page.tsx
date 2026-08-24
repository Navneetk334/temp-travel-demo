"use client";

import React, { useState, useEffect, useRef } from "react";
import Script from "next/script";
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
  Activity,
  Sun,
  Moon,
  Layers,
  Maximize2
} from "lucide-react";

declare global {
  interface Window {
    L: any;
  }
}

export default function MasterDispatchRadarPage() {
  const mapRef = useRef<HTMLDivElement>(null);
  const leafletInstanceRef = useRef<any>(null);
  const tileLayerRef = useRef<any>(null);
  const markersRef = useRef<any[]>([]);

  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("ALL");
  const [mapMode, setMapMode] = useState<"DAY" | "NIGHT">("DAY"); // Google Maps Day / Night mode
  const [selectedDriver, setSelectedDriver] = useState<any | null>(null);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [assignSuccess, setAssignSuccess] = useState(false);
  const [mapLoaded, setMapLoaded] = useState(false);

  const [assignForm, setAssignForm] = useState({
    driverName: "Rajesh Kumar",
    vehicleModel: "Maruti Suzuki Dzire",
    customerName: "",
    pickupLocation: "",
    destination: "",
    tripType: "Airport Transfer"
  });

  const [drivers, setDrivers] = useState<any[]>([]);

  // Load saved dispatches from localStorage
  useEffect(() => {
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

  // Real Google Maps Tile URL (mt0, mt1, mt2, mt3)
  const getGoogleMapsTileUrl = () => {
    return "https://{s}.google.com/vt/lyrs=m&x={x}&y={y}&z={z}";
  };

  // Initialize Real Leaflet Map with Google Maps Day/Night Toggle
  const initLeafletMap = () => {
    if (!window.L || !mapRef.current) return;

    if (leafletInstanceRef.current) {
      leafletInstanceRef.current.remove();
      leafletInstanceRef.current = null;
    }

    try {
      const map = window.L.map(mapRef.current, {
        center: [28.5910, 77.0250],
        zoom: 14,
        zoomControl: true,
        attributionControl: false
      });

      const tileLayer = window.L.tileLayer(getGoogleMapsTileUrl(), {
        maxZoom: 20,
        subdomains: ["mt0", "mt1", "mt2", "mt3"]
      }).addTo(map);

      tileLayerRef.current = tileLayer;
      leafletInstanceRef.current = map;
      setMapLoaded(true);

      renderMapMarkers(map, drivers);
    } catch (e) {
      console.error("Leaflet map initialization error:", e);
    }
  };

  const renderMapMarkers = (map: any, driverList: any[]) => {
    if (!window.L || !map) return;

    markersRef.current.forEach(m => map.removeLayer(m));
    markersRef.current = [];

    driverList.forEach(drv => {
      const lat = drv.lat || 28.5910 + (Math.random() - 0.5) * 0.05;
      const lng = drv.lng || 77.0250 + (Math.random() - 0.5) * 0.05;

      const customIcon = window.L.divIcon({
        className: "custom-leaflet-marker",
        html: `
          <div class="relative group cursor-pointer">
            <div class="w-9 h-9 rounded-full bg-slate-900 border-2 border-amber-400 shadow-2xl flex items-center justify-center text-amber-400 font-bold hover:scale-125 transition-transform">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9l-1.4 2.9A3.7 3.7 0 0 0 2 12v4c0 .6.4 1 1 1h2"/><circle cx="7" cy="17" r="2"/><path d="M9 17h6"/><circle cx="17" cy="17" r="2"/></svg>
            </div>
            <div class="absolute top-full left-1/2 -translate-x-1/2 mt-1 bg-slate-950/95 border border-amber-500/40 text-amber-400 text-[10px] font-mono font-bold px-2 py-0.5 rounded shadow-2xl whitespace-nowrap z-50">
              ${drv.driverName} (${drv.regNumber})
            </div>
          </div>
        `,
        iconSize: [36, 36],
        iconAnchor: [18, 18]
      });

      const marker = window.L.marker([lat, lng], { icon: customIcon }).addTo(map);
      marker.on("click", () => setSelectedDriver(drv));
      markersRef.current.push(marker);
    });
  };

  useEffect(() => {
    if (leafletInstanceRef.current) {
      renderMapMarkers(leafletInstanceRef.current, drivers);
    }
  }, [drivers]);

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
      lat: 28.5910 + (Math.random() - 0.5) * 0.04,
      lng: 77.0250 + (Math.random() - 0.5) * 0.04
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
      {/* Leaflet CSS Inject */}
      <link
        rel="stylesheet"
        href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
      />

      {/* Leaflet JS Script Load */}
      <Script
        src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"
        strategy="afterInteractive"
        onLoad={initLeafletMap}
      />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-amber-500/20 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-black tracking-tight text-slate-50">
              Live Dispatch Radar & GPS Telematics Map
            </h1>
            <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
              LIVE TELEMATICS STREAM
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Real-time Google Maps style GPS tracking, Day/Night mode toggles, and live ETAs.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowAssignModal(true)}
            className="flex items-center gap-1.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 px-3.5 py-1.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all shadow-md shadow-amber-500/20 cursor-pointer"
          >
            <UserCheck className="w-3.5 h-3.5" />
            <span>Assign Duty Roster</span>
          </button>
        </div>
      </div>

      {/* Real Interactive Google Maps Style Map Window */}
      <div className="bg-slate-900/90 backdrop-blur-2xl border border-amber-500/30 rounded-2xl p-4 sm:p-5 shadow-xl relative overflow-hidden space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-3">
          <div className="flex items-center gap-2 text-amber-400 font-bold text-xs uppercase tracking-wider">
            <Radio className="w-3.5 h-3.5 animate-pulse" />
            <span>Interactive Google Maps Telematics View (HQ: Temp Travel Car Rentals Pvt Ltd)</span>
          </div>

          {/* Google Maps Day / Night Mode Toggle Switch */}
          <div className="flex items-center gap-3">
            <span className="text-xs text-slate-400 font-mono">Map Style Mode:</span>
            <div className="flex bg-slate-950 p-1 rounded-xl border border-white/10">
              <button
                onClick={() => setMapMode("DAY")}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${mapMode === "DAY"
                    ? "bg-amber-500 text-slate-950 font-black shadow-md"
                    : "text-slate-400 hover:text-white"
                  }`}
              >
                <Sun className="w-3.5 h-3.5" />
                <span>☀️ Day Mode</span>
              </button>
              <button
                onClick={() => setMapMode("NIGHT")}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${mapMode === "NIGHT"
                    ? "bg-amber-500 text-slate-950 font-black shadow-md"
                    : "text-slate-400 hover:text-white"
                  }`}
              >
                <Moon className="w-3.5 h-3.5" />
                <span>🌙 Night Mode</span>
              </button>
            </div>
          </div>
        </div>

        {/* Real Leaflet Map Render Container */}
        <div className={`relative h-80 sm:h-[350px] w-full rounded-xl overflow-hidden border border-amber-500/30 shadow-xl bg-slate-950 ${mapMode === "NIGHT" ? "google-maps-night-mode" : "google-maps-day-mode"}`}>
          <div ref={mapRef} className="w-full h-full z-10" />

          {!mapLoaded && (
            <div className="absolute inset-0 z-20 bg-slate-950 flex flex-col items-center justify-center space-y-3">
              <RefreshCw className="w-8 h-8 text-amber-400 animate-spin" />
              <div className="text-xs font-mono text-amber-400 font-bold">Loading Google Maps Vector Tiles...</div>
            </div>
          )}
        </div>

        <style jsx global>{`
          .google-maps-night-mode .leaflet-tile-pane {
            filter: invert(100%) hue-rotate(180deg) brightness(92%) contrast(90%) saturate(110%) !important;
          }
          .google-maps-day-mode .leaflet-tile-pane {
            filter: none !important;
          }
        `}</style>
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

        <div className="flex items-center gap-2">
          {["ALL", "IN_TRANSIT", "ASSIGNED", "AVAILABLE"].map((status) => (
            <button
              key={status}
              onClick={() => setFilterStatus(status)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${filterStatus === status
                  ? "bg-amber-500 text-slate-950 font-black"
                  : "bg-slate-950 text-slate-400 hover:text-white border border-white/5"
                }`}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      {/* Driver Roster Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {filtered.map((drv) => (
          <div
            key={drv.id}
            className="bg-slate-900/80 backdrop-blur-xl border border-white/10 hover:border-amber-500/40 rounded-2xl p-5 shadow-xl space-y-4 transition-all flex flex-col justify-between"
          >
            <div className="space-y-3">
              <div className="flex justify-between items-start">
                <span
                  className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${drv.status === "IN_TRANSIT"
                      ? "bg-amber-500/10 text-amber-400 border-amber-500/30"
                      : drv.status === "ASSIGNED"
                        ? "bg-blue-500/10 text-blue-400 border-blue-500/30"
                        : "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                    }`}
                >
                  {drv.status.replace("_", " ")}
                </span>
                <span className="text-[11px] font-mono text-slate-400 font-bold">{drv.speed}</span>
              </div>

              <div>
                <h3 className="font-extrabold text-slate-100 text-sm">{drv.driverName}</h3>
                <div className="text-xs text-amber-400/90 font-semibold">{drv.vehicleModel}</div>
                <div className="text-[10px] font-mono text-slate-400 mt-0.5">{drv.regNumber}</div>
              </div>

              <div className="space-y-2 bg-slate-950 p-3 rounded-xl border border-white/5 text-[11px]">
                <div className="flex items-start gap-2 text-slate-300">
                  <MapPin className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                  <div>
                    <div className="text-[9px] text-slate-500 uppercase font-bold">Pickup / Location</div>
                    <div className="font-medium text-slate-200 line-clamp-1">{drv.currentLocation}</div>
                  </div>
                </div>
                <div className="flex items-start gap-2 text-slate-300">
                  <Navigation className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                  <div>
                    <div className="text-[9px] text-slate-500 uppercase font-bold">Destination</div>
                    <div className="font-medium text-slate-200 line-clamp-1">{drv.destination}</div>
                  </div>
                </div>
              </div>

              <div className="flex justify-between items-center text-xs pt-1">
                <span className="text-slate-400">ETA: <strong className="text-slate-200">{drv.eta}</strong></span>
                <span className="text-slate-400">Pax: <strong className="text-slate-200">{drv.customerName}</strong></span>
              </div>
            </div>

            <div className="pt-3 border-t border-white/5 flex items-center justify-between gap-2">
              <button
                onClick={() => setSelectedDriver(drv)}
                className="w-full bg-slate-950 hover:bg-white/5 text-amber-400 border border-amber-500/30 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Activity className="w-3.5 h-3.5" /> Inspect GPS Ping
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Assign Duty Roster Modal */}
      {showAssignModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-amber-500/30 rounded-3xl p-6 sm:p-8 w-full max-w-lg shadow-2xl space-y-4 relative text-slate-100 max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setShowAssignModal(false)}
              className="absolute top-5 right-5 text-slate-400 hover:text-white cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="space-y-1 border-b border-white/10 pb-3">
              <span className="text-[10px] font-bold uppercase text-amber-400 tracking-wider">Master Duty Roster</span>
              <h3 className="text-2xl font-black text-slate-50">Assign Chauffeur Duty</h3>
            </div>

            {assignSuccess ? (
              <div className="p-8 text-center space-y-3">
                <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto animate-bounce" />
                <h4 className="text-lg font-bold text-slate-100">Duty Assigned & Dispatched!</h4>
                <p className="text-xs text-slate-400">Driver app notified. GPS radar tracking active.</p>
              </div>
            ) : (
              <form onSubmit={handleAssignSubmit} className="space-y-4 text-xs">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-slate-300 font-bold">Select Driver *</label>
                    <select
                      value={assignForm.driverName}
                      onChange={(e) => setAssignForm({ ...assignForm, driverName: e.target.value })}
                      className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2.5 text-slate-100 focus:outline-none focus:border-amber-400"
                    >
                      <option value="Rajesh Kumar">Rajesh Kumar (Swift Dzire)</option>
                      <option value="Suresh Patil">Suresh Patil (Innova Crysta)</option>
                      <option value="Vikram Singh">Vikram Singh (Honda City)</option>
                      <option value="Mahesh Yadav">Mahesh Yadav (Fortuner)</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-slate-300 font-bold">Trip Type</label>
                    <select
                      value={assignForm.tripType}
                      onChange={(e) => setAssignForm({ ...assignForm, tripType: e.target.value })}
                      className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2.5 text-slate-100 focus:outline-none focus:border-amber-400"
                    >
                      <option value="Airport Transfer">Airport Transfer</option>
                      <option value="Local Rental">Local Rental (8hr / 80km)</option>
                      <option value="Outstation Trip">Outstation Trip</option>
                      <option value="Corporate Transit">Corporate Transit</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-slate-300 font-bold">Passenger Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Vikram Malhotra"
                    value={assignForm.customerName}
                    onChange={(e) => setAssignForm({ ...assignForm, customerName: e.target.value })}
                    className="w-full bg-slate-950 border border-white/10 rounded-xl px-3.5 py-2.5 text-slate-100 focus:outline-none focus:border-amber-400"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-slate-300 font-bold">Pickup Location *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Chhatrapati Shivaji Maharaj Intl Airport (T2)"
                    value={assignForm.pickupLocation}
                    onChange={(e) => setAssignForm({ ...assignForm, pickupLocation: e.target.value })}
                    className="w-full bg-slate-950 border border-white/10 rounded-xl px-3.5 py-2.5 text-slate-100 focus:outline-none focus:border-amber-400"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-slate-300 font-bold">Destination Drop Location</label>
                  <input
                    type="text"
                    placeholder="e.g. BKC G-Block, Bandra East, Mumbai"
                    value={assignForm.destination}
                    onChange={(e) => setAssignForm({ ...assignForm, destination: e.target.value })}
                    className="w-full bg-slate-950 border border-white/10 rounded-xl px-3.5 py-2.5 text-slate-100 focus:outline-none focus:border-amber-400"
                  />
                </div>

                <div className="pt-3 border-t border-white/10 flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setShowAssignModal(false)}
                    className="px-5 py-2.5 bg-slate-950 text-slate-400 hover:text-white rounded-xl text-xs font-bold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-black rounded-xl text-xs uppercase tracking-wider shadow-lg shadow-amber-500/20 cursor-pointer"
                  >
                    Dispatch Duty Now
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Driver Telematics Drawer */}
      {selectedDriver && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-amber-500/30 rounded-3xl p-6 w-full max-w-md shadow-2xl space-y-4 relative text-slate-100">
            <button
              onClick={() => setSelectedDriver(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="space-y-1">
              <span className="text-[10px] font-bold uppercase text-amber-400 tracking-wider">Live GPS Telematics Telemetry</span>
              <h3 className="text-xl font-bold text-slate-50">{selectedDriver.driverName}</h3>
              <div className="text-xs text-amber-400 font-mono font-bold">{selectedDriver.vehicleModel} &bull; {selectedDriver.regNumber}</div>
            </div>

            <div className="space-y-2 bg-slate-950 p-4 rounded-xl border border-white/10 text-xs font-mono">
              <div className="flex justify-between">
                <span className="text-slate-400">Current Speed:</span>
                <strong className="text-emerald-400">{selectedDriver.speed}</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Estimated ETA:</span>
                <strong className="text-amber-400">{selectedDriver.eta}</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Passenger Name:</span>
                <strong className="text-slate-100">{selectedDriver.customerName}</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Current Location:</span>
                <strong className="text-slate-200 truncate max-w-[180px]">{selectedDriver.currentLocation}</strong>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setSelectedDriver(null)}
                className="px-4 py-2 bg-amber-500 text-slate-950 font-bold rounded-xl text-xs cursor-pointer"
              >
                Close Inspector
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
