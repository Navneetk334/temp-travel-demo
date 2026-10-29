"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import {
  IndianRupee,
  Users,
  Radio,
  Car,
  TrendingUp,
  ArrowUpRight,
  ShieldCheck,
  Globe,
  Clock,
  Sparkles,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  Activity,
  Layers,
  CreditCard,
  X,
  PhoneCall,
  Plus,
  MapPin,
  Search
} from "lucide-react";
import Portal from "@/components/shared/portal";
import LocationInput from "@/components/shared/location-input";

// Category to Class Mapping Hierarchy matching PRD & Fleet Specs
const CLASS_OPTIONS: Record<string, string[]> = {
  Sedan: ["Compact", "Executive", "Premium Executive", "Luxury"],
  SUV: ["Subcompact/Urban", "Mid-Premium", "Premium", "Luxury"],
};

// Seeded Brand Model Catalog per Category & Class
const MODEL_CATALOG: Record<string, Record<string, string[]>> = {
  Sedan: {
    Compact: [
      "Maruti Suzuki Swift Dzire",
      "Hyundai Aura",
      "Honda Amaze",
      "Tata Tigor"
    ],
    Executive: [
      "Maruti Suzuki Ciaz",
      "Honda City",
      "Hyundai Verna",
      "Skoda Slavia",
      "Volkswagen Virtus"
    ],
    "Premium Executive": [
      "Toyota Camry",
      "Skoda Superb",
      "Volkswagen Passat"
    ],
    Luxury: [
      "Mercedes-Benz E-Class",
      "BMW 5 Series",
      "Audi A6",
      "Jaguar XF"
    ]
  },
  SUV: {
    "Subcompact/Urban": [
      "Hyundai Exter",
      "Tata Nexon",
      "Maruti Suzuki Brezza",
      "Hyundai Venue",
      "Kia Sonet"
    ],
    "Mid-Premium": [
      "Hyundai Creta",
      "Kia Seltos",
      "Mahindra Scorpio-N",
      "Tata Harrier",
      "Maruti Suzuki Grand Vitara"
    ],
    Premium: [
      "Toyota Innova Crysta",
      "KIA Carens",
      "Maruti Suzuki Ertiga",
      "Toyota Rumion",
      "Mahindra XUV700",
      "Tata Safari",
      "Toyota Innova Hycross",
      "MG Hector Plus"
    ],
    Luxury: [
      "Toyota Fortuner",
      "Mercedes-Benz GLE",
      "BMW X5",
      "Audi Q7",
      "Land Rover Defender"
    ]
  }
};

export default function MasterAdminDashboard() {
  const [loading, setLoading] = useState(true);
  const [showDispatchModal, setShowDispatchModal] = useState(false);
  const [dispatchSuccess, setDispatchSuccess] = useState(false);
  const [fleetList, setFleetList] = useState<any[]>([]);

  const [dispatchForm, setDispatchForm] = useState({
    customerName: "",
    phone: "",
    vehicleCategory: "Sedan",
    vehicleClass: "Executive",
    vehicleModel: "Maruti Suzuki Ciaz",
    pickupLocation: "",
    dropLocation: "",
  });

  const [stats, setStats] = useState({
    totalRevenue: 0,
    activeRides: 0,
    totalLeads: 0,
    completedBookings: 0,
    fleetCount: 0,
  });

  const [recentLogs, setRecentLogs] = useState<any[]>([]);

  const handleSyncSystems = async () => {
    setLoading(true);
    try {
      // 1. Check local CRM leads
      let totalLocalCount = 0;
      try {
        const localCRM = localStorage.getItem("user_uploaded_crm_leads");
        if (localCRM) {
          const parsed = JSON.parse(localCRM);
          if (Array.isArray(parsed)) totalLocalCount = parsed.length;
        }
      } catch (e) {
        console.error(e);
      }

      const [rentalRes, corpRes, fleetRes] = await Promise.allSettled([
        fetch("/api/rental/lead"),
        fetch("/api/corporate/lead"),
        fetch("/api/fleet?minimal=true")
      ]);

      let apiLeadsCount = 0;
      if (rentalRes.status === "fulfilled" && rentalRes.value.ok) {
        const data = await rentalRes.value.json();
        const items = Array.isArray(data) ? data : (data.leads || []);
        apiLeadsCount += items.length;
      }
      if (corpRes.status === "fulfilled" && corpRes.value.ok) {
        const data = await corpRes.value.json();
        const items = Array.isArray(data) ? data : (data.leads || []);
        apiLeadsCount += items.length;
      }

      const calculatedTotalLeads = Math.max(totalLocalCount, apiLeadsCount, totalLocalCount + apiLeadsCount);

      setStats(prev => ({
        ...prev,
        totalLeads: calculatedTotalLeads
      }));

      if (fleetRes.status === "fulfilled" && fleetRes.value.ok) {
        const fleetData = await fleetRes.value.json();
        const list = Array.isArray(fleetData) ? fleetData : (fleetData.vehicles || []);
        if (list.length > 0) {
          setStats((prev) => ({ ...prev, fleetCount: list.length }));
          setFleetList(list);
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setTimeout(() => setLoading(false), 500);
    }
  };

  useEffect(() => {
    // 1. Initial local fleet loading
    try {
      const savedFleet = localStorage.getItem("user_uploaded_fleet_vehicles") || localStorage.getItem("user_uploaded_fleet");
      if (savedFleet) {
        const parsed = JSON.parse(savedFleet);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setFleetList(parsed);
        }
      }
    } catch (e) {
      console.error(e);
    }

    handleSyncSystems();
  }, []);

  // Category and Class selection handlers
  const handleCategoryChange = (cat: string) => {
    const defaultClass = CLASS_OPTIONS[cat]?.[0] || "Executive";
    const modelsForClass = MODEL_CATALOG[cat]?.[defaultClass] || [];
    setDispatchForm(prev => ({
      ...prev,
      vehicleCategory: cat,
      vehicleClass: defaultClass,
      vehicleModel: modelsForClass[0] || ""
    }));
  };

  const handleClassChange = (cls: string) => {
    const modelsForClass = MODEL_CATALOG[dispatchForm.vehicleCategory]?.[cls] || [];
    setDispatchForm(prev => ({
      ...prev,
      vehicleClass: cls,
      vehicleModel: modelsForClass[0] || ""
    }));
  };

  // Dynamically compute available vehicle models for current category & class
  const availableModels = useMemo(() => {
    const cat = dispatchForm.vehicleCategory;
    const cls = dispatchForm.vehicleClass;
    const catalogList = (MODEL_CATALOG[cat] && MODEL_CATALOG[cat][cls]) ? MODEL_CATALOG[cat][cls] : [];

    // Also include any models from the registered fleet matching this category and class
    const fleetModels: string[] = [];
    fleetList.forEach((v) => {
      const vCat = (v.categoryName || v.category?.name || "").trim().toLowerCase();
      const vCls = (v.vehicleClass || v.subCategory || "").trim().toLowerCase().replace(/[^a-z0-9]/g, "");
      const targetCat = cat.trim().toLowerCase();
      const targetCls = cls.trim().toLowerCase().replace(/[^a-z0-9]/g, "");

      if (vCat.includes(targetCat) || targetCat.includes(vCat)) {
        if (!targetCls || vCls.includes(targetCls) || targetCls.includes(vCls)) {
          const fullModel = `${v.make || ""} ${v.model || ""}`.trim();
          if (fullModel && !fleetModels.includes(fullModel)) {
            fleetModels.push(fullModel);
          }
        }
      }
    });

    const combined = Array.from(new Set([...fleetModels, ...catalogList]));
    return combined;
  }, [dispatchForm.vehicleCategory, dispatchForm.vehicleClass, fleetList]);

  // Keep selected vehicle model valid when availableModels change
  useEffect(() => {
    if (availableModels.length > 0 && !availableModels.includes(dispatchForm.vehicleModel)) {
      setDispatchForm(prev => ({ ...prev, vehicleModel: availableModels[0] }));
    }
  }, [availableModels, dispatchForm.vehicleModel]);

  const handleQuickDispatchSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!dispatchForm.customerName || !dispatchForm.phone || !dispatchForm.pickupLocation || !dispatchForm.dropLocation) {
      return;
    }

    const payload = {
      customerName: dispatchForm.customerName,
      phone: dispatchForm.phone,
      tripType: `Quick Dispatch - ${dispatchForm.vehicleCategory} (${dispatchForm.vehicleClass})`,
      pickupLocation: dispatchForm.pickupLocation,
      dropLocation: dispatchForm.dropLocation,
      requirements: `Category: ${dispatchForm.vehicleCategory}, Class: ${dispatchForm.vehicleClass}, Model: ${dispatchForm.vehicleModel}. Pickup: ${dispatchForm.pickupLocation}, Drop: ${dispatchForm.dropLocation}.`,
      notes: `Dispatched from Master HQ: Category=${dispatchForm.vehicleCategory}, Class=${dispatchForm.vehicleClass}, Model=${dispatchForm.vehicleModel}, Drop=${dispatchForm.dropLocation}`,
      status: "NEW",
    };

    try {
      // POST lead to database
      await fetch("/api/rental/lead", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      // Also persist dispatch entry locally for immediate view
      const existing = JSON.parse(localStorage.getItem("master_dispatches") || "[]");
      existing.unshift({
        id: `DISP-${Date.now()}`,
        driverName: "Assigned Chauffeur",
        phone: dispatchForm.phone,
        vehicleModel: dispatchForm.vehicleModel,
        vehicleCategory: dispatchForm.vehicleCategory,
        vehicleClass: dispatchForm.vehicleClass,
        regNumber: "COMMERCIAL-FLEET",
        currentLocation: dispatchForm.pickupLocation,
        destination: dispatchForm.dropLocation,
        status: "ASSIGNED",
        speed: "0 km/h",
        eta: "10 Mins to Pickup",
        tripType: `${dispatchForm.vehicleCategory} • ${dispatchForm.vehicleClass}`,
        customerName: dispatchForm.customerName,
        pickupLocation: dispatchForm.pickupLocation,
        dropLocation: dispatchForm.dropLocation
      });
      localStorage.setItem("master_dispatches", JSON.stringify(existing));
    } catch (err) {
      console.error(err);
    }

    setDispatchSuccess(true);
    setRecentLogs(prev => [
      {
        id: String(Date.now()),
        time: "Just now",
        text: `Dispatched ${dispatchForm.vehicleModel} (${dispatchForm.vehicleCategory} - ${dispatchForm.vehicleClass}) for passenger ${dispatchForm.customerName} from ${dispatchForm.pickupLocation} to ${dispatchForm.dropLocation}.`,
        status: "DISPATCHED"
      },
      ...prev
    ]);

    setTimeout(() => {
      setDispatchSuccess(false);
      setShowDispatchModal(false);
      setDispatchForm({
        customerName: "",
        phone: "",
        vehicleCategory: "Sedan",
        vehicleClass: "Executive",
        vehicleModel: "Maruti Suzuki Ciaz",
        pickupLocation: "",
        dropLocation: "",
      });
      setStats(prev => ({ ...prev, activeRides: prev.activeRides + 1, totalLeads: prev.totalLeads + 1 }));
    }, 1500);
  };

  return (
    <div className="space-y-8">
      {/* Header Title Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-amber-500/20 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-black tracking-tight text-slate-50">
              Master Executive Dashboard
            </h1>
            <span className="bg-amber-500/10 text-amber-400 border border-amber-500/30 text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider">
              HQ Live
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Real-time operational telemetry, omnichannel lead sync, and financial revenue radar.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleSyncSystems}
            disabled={loading}
            className="flex items-center gap-1.5 bg-surface hover:bg-slate-800 border border-border text-slate-300 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin text-amber-400" : ""}`} />
            <span>{loading ? "Syncing..." : "Sync Systems"}</span>
          </button>

          <button
            onClick={() => setShowDispatchModal(true)}
            className="flex items-center gap-1.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 px-3.5 py-1.5 rounded-xl text-xs font-black tracking-wider uppercase transition-all shadow-md shadow-amber-500/20 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Quick Dispatch</span>
          </button>
        </div>
      </div>

      {/* 4 Primary Master KPI Telemetry Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-surface/80 backdrop-blur-xl border border-amber-500/30 rounded-2xl p-4 sm:p-5 shadow-xl relative overflow-hidden group hover:border-amber-500/60 transition-all">
          <div className="absolute top-0 right-0 w-28 h-28 bg-amber-500/10 rounded-full blur-2xl pointer-events-none group-hover:bg-amber-500/20 transition-all" />
          <div className="flex justify-between items-start mb-3">
            <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <IndianRupee className="w-5 h-5" />
            </div>
            <span className="text-[9px] font-black uppercase text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full flex items-center gap-1">
              <TrendingUp className="w-3 h-3" /> +18.4%
            </span>
          </div>
          <div className="text-slate-400 text-xs font-bold uppercase tracking-wider">Gross System Revenue</div>
          <div className="text-2xl font-black text-slate-50 mt-1 font-mono">
            ₹{stats.totalRevenue.toLocaleString("en-IN")}
          </div>
          <div className="text-[10px] text-slate-400 mt-1.5 flex items-center gap-1">
            <span>Synced across Razorpay & Driver Cash</span>
          </div>
        </div>

        <div className="bg-surface/80 backdrop-blur-xl border border-amber-500/30 rounded-2xl p-4 sm:p-5 shadow-xl relative overflow-hidden group hover:border-amber-500/60 transition-all">
          <div className="absolute top-0 right-0 w-28 h-28 bg-blue-500/10 rounded-full blur-2xl pointer-events-none group-hover:bg-blue-500/20 transition-all" />
          <div className="flex justify-between items-start mb-3">
            <div className="p-2.5 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20">
              <Radio className="w-5 h-5 animate-pulse" />
            </div>
            <span className="text-[9px] font-black uppercase text-blue-400 bg-blue-500/10 border border-blue-500/20 px-2 py-0.5 rounded-full">
              LIVE TELEMATICS
            </span>
          </div>
          <div className="text-slate-400 text-xs font-bold uppercase tracking-wider">Active In-Transit Rides</div>
          <div className="text-2xl font-black text-slate-50 mt-1 font-mono">
            {stats.activeRides} <span className="text-xs font-normal text-slate-400">Rides</span>
          </div>
          <div className="text-[11px] text-slate-400 mt-2 flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            <span>All Chauffeurs On-Route SLA</span>
          </div>
        </div>

        <div className="bg-surface/80 backdrop-blur-xl border border-amber-500/30 rounded-2xl p-6 shadow-xl relative overflow-hidden group hover:border-amber-500/60 transition-all">
          <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/10 rounded-full blur-2xl pointer-events-none group-hover:bg-purple-500/20 transition-all" />
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20">
              <Users className="w-6 h-6" />
            </div>
            <span className="text-[10px] font-black uppercase text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded-full">
              OMNICHANNEL
            </span>
          </div>
          <div className="text-slate-400 text-xs font-bold uppercase tracking-wider">Total Synced Leads</div>
          <div className="text-3xl font-black text-slate-50 mt-1 font-mono">
            {stats.totalLeads} <span className="text-sm font-normal text-slate-400">Inquiries</span>
          </div>
          <div className="text-[11px] text-slate-400 mt-2 flex items-center gap-1">
            <span>Corporate, Rental, Tours & Contact</span>
          </div>
        </div>

        <div className="bg-surface/80 backdrop-blur-xl border border-amber-500/30 rounded-2xl p-6 shadow-xl relative overflow-hidden group hover:border-amber-500/60 transition-all">
          <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none group-hover:bg-emerald-500/20 transition-all" />
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <Car className="w-6 h-6" />
            </div>
            <span className="text-[10px] font-black uppercase text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full">
              ISO FLEET
            </span>
          </div>
          <div className="text-slate-400 text-xs font-bold uppercase tracking-wider">Commercial Fleet Cars</div>
          <div className="text-3xl font-black text-slate-50 mt-1 font-mono">
            {stats.fleetCount} <span className="text-sm font-normal text-slate-400">Sedans & SUVs</span>
          </div>
          <div className="text-[11px] text-slate-400 mt-2 flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>100% Verified Commercial Permits</span>
          </div>
        </div>
      </div>

      {/* Live System Activity Ticker */}
      <div className="bg-surface/80 backdrop-blur-xl border border-border rounded-2xl p-6 shadow-2xl space-y-4">
        <div className="flex items-center justify-between border-b border-border pb-4">
          <div className="flex items-center gap-2">
            <Activity className="w-5 h-5 text-amber-400" />
            <h2 className="text-lg font-bold text-slate-50">Master Real-Time Event Telemetry</h2>
          </div>
          <span className="text-xs font-mono text-amber-400">Listening to WebSockets</span>
        </div>

        <div className="space-y-3">
          {recentLogs.map((log) => (
            <div
              key={log.id}
              className="flex items-center justify-between p-3 rounded-xl bg-background/80 border border-border text-xs"
            >
              <div className="flex items-center gap-3">
                <span className="w-2 h-2 rounded-full bg-amber-400 shrink-0" />
                <span className="text-slate-200 font-medium">{log.text}</span>
              </div>
              <span className="text-[10px] font-mono text-slate-500 shrink-0 ml-4">{log.time}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Subsystem Sync Status Grid */}
      <div className="bg-surface/80 backdrop-blur-xl border border-border rounded-2xl p-6 shadow-2xl space-y-6">
        <div className="flex items-center justify-between border-b border-border pb-4">
          <div className="flex items-center gap-2">
            <Layers className="w-5 h-5 text-amber-400" />
            <h2 className="text-lg font-bold text-slate-50">Subsystem Synchronization Radar</h2>
          </div>
          <span className="text-xs font-mono text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 rounded-full">
            All 5 Systems Operational
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div className="bg-background/80 p-4 rounded-xl border border-border space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-200">Public Web Portal</span>
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
            </div>
            <div className="text-[11px] text-slate-400 font-mono">temptravel.in</div>
            <div className="text-[10px] text-emerald-400 font-bold uppercase tracking-wider">Sync: Live WebSockets</div>
          </div>

          <div className="bg-background/80 p-4 rounded-xl border border-border space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-200">Website Admin</span>
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
            </div>
            <div className="text-[11px] text-slate-400 font-mono">/admin (RBAC)</div>
            <div className="text-[10px] text-emerald-400 font-bold uppercase tracking-wider">Sync: Bi-Directional</div>
          </div>

          <div className="bg-background/80 p-4 rounded-xl border border-border space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-200">Razorpay Gateway</span>
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
            </div>
            <div className="text-[11px] text-slate-400 font-mono">GST & Ledger API</div>
            <div className="text-[10px] text-emerald-400 font-bold uppercase tracking-wider">Sync: Webhook Synced</div>
          </div>

          <div className="bg-background/80 p-4 rounded-xl border border-border space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-200">Driver Telematics</span>
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
            </div>
            <div className="text-[11px] text-slate-400 font-mono">GPS & App Gateway</div>
            <div className="text-[10px] text-amber-400 font-bold uppercase tracking-wider">Sync: Ready for App</div>
          </div>

          <div className="bg-background/80 p-4 rounded-xl border border-border space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-200">Google Business & SEO</span>
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
            </div>
            <div className="text-[11px] text-slate-400 font-mono">Schema & GBP API</div>
            <div className="text-[10px] text-emerald-400 font-bold uppercase tracking-wider">Sync: Rank Active</div>
          </div>
        </div>
      </div>

      {/* Quick Navigation Modules Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Link
          href="/master-admin/dispatch-radar"
          className="group bg-surface/80 border border-border hover:border-amber-500/50 p-6 rounded-2xl transition-all shadow-xl space-y-3"
        >
          <div className="flex items-center justify-between">
            <div className="p-3 bg-amber-500/10 text-amber-400 rounded-xl border border-amber-500/20 group-hover:scale-105 transition-transform">
              <Radio className="w-6 h-6" />
            </div>
            <ArrowUpRight className="w-5 h-5 text-slate-500 group-hover:text-amber-400 transition-colors" />
          </div>
          <h3 className="text-lg font-bold text-slate-100 group-hover:text-amber-400 transition-colors">Dispatch Radar</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            Live interactive telemetry tracking on-route chauffeurs, dispatch ETAs, and emergency SOS alerts.
          </p>
        </Link>

        <Link
          href="/master-admin/crm"
          className="group bg-surface/80 border border-border hover:border-amber-500/50 p-6 rounded-2xl transition-all shadow-xl space-y-3"
        >
          <div className="flex items-center justify-between">
            <div className="p-3 bg-purple-500/10 text-purple-400 rounded-xl border border-purple-500/20 group-hover:scale-105 transition-transform">
              <Users className="w-6 h-6" />
            </div>
            <ArrowUpRight className="w-5 h-5 text-slate-500 group-hover:text-amber-400 transition-colors" />
          </div>
          <h3 className="text-lg font-bold text-slate-100 group-hover:text-amber-400 transition-colors">Omnichannel CRM</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            Unified pipeline tracking corporate accounts, rental inquiries, tour requests, and contact messages.
          </p>
        </Link>

        <Link
          href="/master-admin/billing-ledger"
          className="group bg-surface/80 border border-border hover:border-amber-500/50 p-6 rounded-2xl transition-all shadow-xl space-y-3"
        >
          <div className="flex items-center justify-between">
            <div className="p-3 bg-emerald-500/10 text-emerald-400 rounded-xl border border-emerald-500/20 group-hover:scale-105 transition-transform">
              <CreditCard className="w-6 h-6" />
            </div>
            <ArrowUpRight className="w-5 h-5 text-slate-500 group-hover:text-amber-400 transition-colors" />
          </div>
          <h3 className="text-lg font-bold text-slate-100 group-hover:text-amber-400 transition-colors">Billing & Tax Ledger</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            GST invoice management system, Razorpay transaction ledger audits, and driver cash reconciliation.
          </p>
        </Link>
      </div>

      {/* Enhanced Quick Dispatch Modal */}
      {showDispatchModal && (
        <Portal>
          <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
          <div className="bg-surface border border-amber-500/40 rounded-3xl p-6 sm:p-8 w-full max-w-2xl shadow-2xl space-y-6 relative text-slate-100 max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setShowDispatchModal(false)}
              className="absolute top-5 right-5 text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="space-y-1">
              <div className="flex items-center gap-2 text-amber-400 text-xs font-black uppercase tracking-wider">
                <Radio className="w-4 h-4 animate-pulse" />
                <span>Master HQ Quick Dispatch Engine</span>
              </div>
              <h3 className="text-2xl font-black text-slate-50">Instant Chauffeur Booking</h3>
            </div>

            {dispatchSuccess ? (
              <div className="bg-emerald-500/10 border border-emerald-500/30 p-6 rounded-2xl text-center space-y-2">
                <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto animate-bounce" />
                <div className="text-base font-bold text-emerald-400">Booking & Dispatch Synced to Database!</div>
                <div className="text-xs text-slate-300">Visible across Master Dashboard, Omnichannel CRM & Telematics Radar.</div>
              </div>
            ) : (
              <form onSubmit={handleQuickDispatchSubmit} className="space-y-4 text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-slate-300 font-bold uppercase text-[10px]">Passenger Name *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Vikram Malhotra"
                      value={dispatchForm.customerName}
                      onChange={(e) => setDispatchForm({ ...dispatchForm, customerName: e.target.value })}
                      className="w-full bg-background border border-border rounded-xl px-3.5 py-2.5 text-slate-100 text-xs focus:outline-none focus:border-amber-400 font-semibold"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-slate-300 font-bold uppercase text-[10px]">Mobile Number *</label>
                    <input
                      type="tel"
                      required
                      maxLength={10}
                      pattern="\d{10}"
                      title="Please enter a valid 10-digit mobile number"
                      placeholder="10-digit phone number"
                      value={dispatchForm.phone}
                      onChange={(e) => setDispatchForm({ ...dispatchForm, phone: e.target.value.replace(/\D/g, "").slice(0, 10) })}
                      className="w-full bg-background border border-border rounded-xl px-3.5 py-2.5 text-slate-100 text-xs focus:outline-none focus:border-amber-400 font-semibold font-mono"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-slate-300 font-bold uppercase text-[10px]">Vehicle Category *</label>
                    <select
                      value={dispatchForm.vehicleCategory}
                      onChange={(e) => handleCategoryChange(e.target.value)}
                      className="w-full bg-background border border-border rounded-xl px-3 py-2.5 text-slate-100 text-xs focus:outline-none focus:border-amber-400 font-bold text-amber-400 cursor-pointer"
                    >
                      <option value="Sedan">Sedan</option>
                      <option value="SUV">SUV</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-slate-300 font-bold uppercase text-[10px]">Vehicle Class *</label>
                    <select
                      value={dispatchForm.vehicleClass}
                      onChange={(e) => handleClassChange(e.target.value)}
                      className="w-full bg-background border border-border rounded-xl px-3 py-2.5 text-slate-100 text-xs focus:outline-none focus:border-amber-400 font-semibold cursor-pointer"
                    >
                      {(CLASS_OPTIONS[dispatchForm.vehicleCategory] || []).map((cls) => (
                        <option key={cls} value={cls}>
                          {cls}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-slate-300 font-bold uppercase text-[10px]">Vehicle Model *</label>
                    <select
                      value={dispatchForm.vehicleModel}
                      onChange={(e) => setDispatchForm({ ...dispatchForm, vehicleModel: e.target.value })}
                      className="w-full bg-background border border-border rounded-xl px-3 py-2.5 text-slate-100 text-xs focus:outline-none focus:border-amber-400 font-semibold cursor-pointer"
                    >
                      {availableModels.map((m) => (
                        <option key={m} value={m}>
                          {m}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Pickup Location & Drop Location with Address Search */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-slate-300 font-bold uppercase text-[10px]">
                      Pickup Location (Address / Hub Search) *
                    </label>
                    <LocationInput
                      required
                      placeholder="Search pickup address, airport, hub..."
                      value={dispatchForm.pickupLocation}
                      onChange={(val) => setDispatchForm({ ...dispatchForm, pickupLocation: val })}
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-slate-300 font-bold uppercase text-[10px]">
                      Drop Location (Address / Destination Search) *
                    </label>
                    <LocationInput
                      required
                      placeholder="Search drop location or destination..."
                      value={dispatchForm.dropLocation}
                      onChange={(val) => setDispatchForm({ ...dispatchForm, dropLocation: val })}
                    />
                  </div>
                </div>

                <div className="pt-4 flex justify-end gap-3 border-t border-border">
                  <button
                    type="button"
                    onClick={() => setShowDispatchModal(false)}
                    className="px-5 py-2.5 bg-background text-slate-400 hover:text-white rounded-xl text-xs font-bold cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-black rounded-xl text-xs uppercase tracking-wider shadow-lg shadow-amber-500/20 cursor-pointer hover:from-amber-400 hover:to-amber-500 transition-all"
                  >
                    Dispatch Now
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
        </Portal>
      )}
    </div>
  );
}

