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
  Phone,
  PhoneCall,
  Plus,
  MapPin,
  Search,
  UserCheck,
  Navigation,
  FileText,
  Trash2
} from "lucide-react";
import Portal from "@/components/shared/portal";
import LocationInput from "@/components/shared/location-input";
import QuickDispatchAssignmentModal from "@/components/admin/quick-dispatch-assignment-modal";
import { syncDispatchToLeads, removeDispatchFromLeads, syncExistingDispatchesToLeads } from "@/lib/lead-sync";

// Trip Types matching the website's booking engine
const TRIP_TYPES = [
  "Airport Transfer / Pickup & Drop",
  "Local Rental (4hr / 40km)",
  "Local Rental (8hr / 80km)",
  "Local Rental (12hr / 120km)",
  "Outstation (One Way)",
  "Outstation (Round Trip)",
  "Corporate Employee Transit"
];

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
  const [driversList, setDriversList] = useState<any[]>([]);
  const [dispatches, setDispatches] = useState<any[]>([]);
  const [assigningDispatch, setAssigningDispatch] = useState<any | null>(null);

  const [dispatchForm, setDispatchForm] = useState({
    customerName: "",
    phone: "",
    tripType: "Airport Transfer / Pickup & Drop",
    vehicleCategory: "Sedan",
    vehicleClass: "Executive",
    vehicleModel: "Maruti Suzuki Ciaz",
    pickupLocation: "",
    dropLocation: "",
    assignedVehicleId: "",
    assignedDriverId: "",
    fare: "2800",
    advance: "500"
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

      const [rentalRes, corpRes, fleetRes, drvRes] = await Promise.allSettled([
        fetch("/api/rental/lead"),
        fetch("/api/corporate/lead"),
        fetch("/api/fleet?minimal=true"),
        fetch("/api/admin/drivers")
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

      if (drvRes.status === "fulfilled" && drvRes.value.ok) {
        const drvData = await drvRes.value.json();
        if (Array.isArray(drvData) && drvData.length > 0) {
          setDriversList(drvData);
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

    // 2. Initial local drivers loading
    try {
      const savedDrivers = localStorage.getItem("user_uploaded_drivers");
      if (savedDrivers) {
        const parsed = JSON.parse(savedDrivers);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setDriversList(parsed);
        }
      }
    } catch (e) {
      console.error(e);
    }

    // 3. Initial dispatches loading
    try {
      const savedDispatches = localStorage.getItem("master_dispatches");
      if (savedDispatches) {
        const parsed = JSON.parse(savedDispatches);
        if (Array.isArray(parsed)) {
          setDispatches(parsed);
          const activeCount = parsed.filter((d: any) => d.status === "IN_TRANSIT" || d.status === "ASSIGNED").length;
          setStats(prev => ({ ...prev, activeRides: activeCount }));
        }
      }
    } catch (e) {
      console.error(e);
    }

    handleSyncSystems();
    syncExistingDispatchesToLeads();
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

    const assignedVeh = fleetList.find(
      (v) => v.id === dispatchForm.assignedVehicleId || v.registrationNumber === dispatchForm.assignedVehicleId
    );
    const assignedDrv = driversList.find(
      (d) => d.id === dispatchForm.assignedDriverId || d.phone === dispatchForm.assignedDriverId
    );

    const hasFullAssignment = Boolean(assignedVeh && assignedDrv);
    const dispatchStatus = hasFullAssignment ? "ASSIGNED" : "UNASSIGNED";

    const newDispatchItem = {
      id: `DISP-${Date.now()}`,
      tripType: dispatchForm.tripType,
      customerName: dispatchForm.customerName,
      phone: dispatchForm.phone,
      pickupLocation: dispatchForm.pickupLocation,
      dropLocation: dispatchForm.dropLocation,
      vehicleCategory: dispatchForm.vehicleCategory,
      vehicleClass: dispatchForm.vehicleClass,
      vehicleModel: assignedVeh ? `${assignedVeh.make} ${assignedVeh.model}` : dispatchForm.vehicleModel,
      vehicleId: assignedVeh?.id || "",
      regNumber: assignedVeh?.registrationNumber || "Pending Vehicle Allocation",
      driverId: assignedDrv?.id || "",
      driverName: assignedDrv?.name || "Pending Chauffeur Allocation",
      driverPhone: assignedDrv?.phone || "",
      status: dispatchStatus,
      fare: dispatchForm.fare || "2800",
      advance: dispatchForm.advance || "500",
      speed: "0 km/h",
      eta: "15 Mins to Pickup",
      currentLocation: dispatchForm.pickupLocation,
      destination: dispatchForm.dropLocation,
      createdAt: new Date().toISOString()
    };

    try {
      // Sync dispatch into omnichannel CRM leads as per trip type and persist to DB
      await syncDispatchToLeads(newDispatchItem);

      // Persist dispatch entry locally for live telematics
      const existing = JSON.parse(localStorage.getItem("master_dispatches") || "[]");
      const updatedList = [newDispatchItem, ...existing];
      setDispatches(updatedList);
      localStorage.setItem("master_dispatches", JSON.stringify(updatedList));
    } catch (err) {
      console.error(err);
    }

    setDispatchSuccess(true);
    setRecentLogs(prev => [
      {
        id: String(Date.now()),
        time: "Just now",
        text: `Dispatched [${dispatchForm.tripType}] ${dispatchForm.vehicleModel} for passenger ${dispatchForm.customerName} (${assignedVeh ? assignedVeh.registrationNumber : 'Awaiting Car'} / ${assignedDrv ? assignedDrv.name : 'Awaiting Driver'}).`,
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
        tripType: "Airport Transfer / Pickup & Drop",
        vehicleCategory: "Sedan",
        vehicleClass: "Executive",
        vehicleModel: "Maruti Suzuki Ciaz",
        pickupLocation: "",
        dropLocation: "",
        assignedVehicleId: "",
        assignedDriverId: "",
        fare: "2800",
        advance: "500"
      });
      setStats(prev => ({ ...prev, activeRides: prev.activeRides + 1, totalLeads: prev.totalLeads + 1 }));
    }, 1500);
  };

  const handleSaveAssignment = (updatedItem: any) => {
    setDispatches(prev => {
      const next = prev.map(d => d.id === updatedItem.id ? updatedItem : d);
      localStorage.setItem("master_dispatches", JSON.stringify(next));
      const activeCount = next.filter((d: any) => d.status === "IN_TRANSIT" || d.status === "ASSIGNED").length;
      setStats(s => ({ ...s, activeRides: activeCount }));
      return next;
    });
    syncDispatchToLeads(updatedItem);
    setRecentLogs(prev => [
      {
        id: String(Date.now()),
        time: "Just now",
        text: `Allocated ${updatedItem.regNumber} & Chauffeur ${updatedItem.driverName} to dispatch #${updatedItem.id}.`,
        status: updatedItem.status
      },
      ...prev
    ]);
  };

  const handleQuickStatusChange = (id: string, newStatus: string) => {
    let updatedDispatch: any = null;
    setDispatches(prev => {
      const next = prev.map(d => {
        if (d.id === id) {
          updatedDispatch = { ...d, status: newStatus };
          return updatedDispatch;
        }
        return d;
      });
      localStorage.setItem("master_dispatches", JSON.stringify(next));
      const activeCount = next.filter((d: any) => d.status === "IN_TRANSIT" || d.status === "ASSIGNED").length;
      setStats(s => ({ ...s, activeRides: activeCount }));
      return next;
    });
    if (updatedDispatch) {
      syncDispatchToLeads(updatedDispatch);
    }
  };

  const handleDeleteDispatch = (id: string) => {
    if (!window.confirm("Are you sure you want to permanently delete this quick dispatch entry?")) return;
    setDispatches(prev => {
      const next = prev.filter(d => d.id !== id);
      localStorage.setItem("master_dispatches", JSON.stringify(next));
      const activeCount = next.filter((d: any) => d.status === "IN_TRANSIT" || d.status === "ASSIGNED").length;
      setStats(s => ({ ...s, activeRides: activeCount }));
      return next;
    });
    removeDispatchFromLeads(id);
    setRecentLogs(prev => [
      {
        id: String(Date.now()),
        time: "Just now",
        text: `Permanently removed dispatch entry #${id} from the active dispatch desk.`,
        status: "CANCELLED"
      },
      ...prev
    ]);
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

      {/* Live Master Dispatch & Telematics Queue */}
      <div className="bg-surface/80 backdrop-blur-xl border border-amber-500/30 rounded-2xl p-6 shadow-2xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border pb-4">
          <div>
            <div className="flex items-center gap-2">
              <Radio className="w-5 h-5 text-amber-400 animate-pulse" />
              <h2 className="text-lg font-bold text-slate-50">Live Master Dispatch & Telematics Queue</h2>
              <span className="bg-amber-500/10 text-amber-400 border border-amber-500/30 text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider font-mono">
                {dispatches.length} Active Bookings
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Real-time chauffeur allocation, live route telematics, and vehicle dispatch assignments.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href="/master-admin/dispatch-radar"
              className="flex items-center gap-1.5 bg-background hover:bg-slate-800 border border-amber-500/30 text-amber-400 px-3 py-1.5 rounded-xl text-xs font-bold transition-all"
            >
              <Navigation className="w-3.5 h-3.5" />
              <span>Full Radar Map</span>
            </Link>
            <button
              onClick={() => setShowDispatchModal(true)}
              className="flex items-center gap-1.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 px-3 py-1.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all shadow-md shadow-amber-500/20 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>New Dispatch</span>
            </button>
          </div>
        </div>

        {dispatches.length === 0 ? (
          <div className="py-12 text-center space-y-3 bg-background/50 border border-border rounded-xl">
            <Car className="w-10 h-10 text-slate-500 mx-auto" />
            <div className="text-sm font-bold text-slate-300">No Active Dispatches in Queue</div>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Click Quick Dispatch to create a chauffeur booking and assign commercial vehicles from your fleet.
            </p>
            <button
              onClick={() => setShowDispatchModal(true)}
              className="text-xs text-amber-400 font-bold hover:underline cursor-pointer"
            >
              + Create Instant Dispatch
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {dispatches.map((item) => {
              const isAssigned = item.status === "ASSIGNED" || item.status === "IN_TRANSIT" || item.status === "COMPLETED";
              const hasChauffeur = item.driverName && !item.driverName.includes("Pending");
              const hasCar = item.regNumber && !item.regNumber.includes("Pending");

              return (
                <div
                  key={item.id}
                  className="bg-background/90 border border-border hover:border-amber-500/40 rounded-2xl p-4 shadow-xl flex flex-col justify-between space-y-3 transition-all relative overflow-hidden"
                >
                  <div className="space-y-2.5">
                    {/* Header: Status & Trip Type */}
                    <div className="flex justify-between items-start gap-2">
                      <span
                        className={`text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full border ${
                          item.status === "IN_TRANSIT"
                            ? "bg-amber-500/10 text-amber-400 border-amber-500/30 animate-pulse"
                            : item.status === "ASSIGNED"
                            ? "bg-blue-500/10 text-blue-400 border-blue-500/30"
                            : item.status === "COMPLETED"
                            ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                            : "bg-rose-500/10 text-rose-400 border-rose-500/30"
                        }`}
                      >
                        {item.status.replace("_", " ")}
                      </span>
                      <span className="text-[10px] font-mono text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20 font-bold">
                        {item.tripType || "Quick Dispatch"}
                      </span>
                    </div>

                    {/* Passenger & Vehicle Target */}
                    <div>
                      <h4 className="font-extrabold text-slate-100 text-sm">{item.customerName}</h4>
                      <div className="text-[11px] text-slate-400 font-mono flex items-center gap-2 mt-0.5">
                        <Phone className="w-3 h-3 text-slate-500" />
                        <span>{item.phone}</span>
                      </div>
                      <div className="text-xs text-amber-400/90 font-semibold mt-1">
                        {item.vehicleCategory || "Sedan"} &bull; {item.vehicleClass || "Executive"} &bull; {item.vehicleModel || "Any"}
                      </div>
                    </div>

                    {/* Route Details */}
                    <div className="bg-surface/80 p-2.5 rounded-xl border border-white/5 space-y-1.5 text-[11px]">
                      <div className="flex items-start gap-1.5 text-slate-300">
                        <MapPin className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                        <span className="line-clamp-1">{item.pickupLocation}</span>
                      </div>
                      {item.dropLocation && (
                        <div className="flex items-start gap-1.5 text-slate-300">
                          <Navigation className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                          <span className="line-clamp-1">{item.dropLocation}</span>
                        </div>
                      )}
                    </div>

                    {/* Assigned Vehicle & Driver Status */}
                    <div className="p-2.5 rounded-xl bg-surface/50 border border-white/5 space-y-1 text-[11px]">
                      <div className="flex justify-between items-center">
                        <span className="text-slate-400 flex items-center gap-1">
                          <Car className="w-3 h-3 text-amber-400" /> Car:
                        </span>
                        <strong className={hasCar ? "text-slate-100 font-mono" : "text-amber-400/80 font-mono italic text-[10px]"}>
                          {item.regNumber || "Pending Allocation"}
                        </strong>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-slate-400 flex items-center gap-1">
                          <UserCheck className="w-3 h-3 text-emerald-400" /> Chauffeur:
                        </span>
                        <strong className={hasChauffeur ? "text-slate-100" : "text-amber-400/80 italic text-[10px]"}>
                          {item.driverName || "Pending Allocation"}
                        </strong>
                      </div>
                    </div>
                  </div>

                  {/* Actions Bar */}
                  <div className="pt-2 border-t border-border flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setAssigningDispatch(item)}
                      className="flex-1 bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/30 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <UserCheck className="w-3.5 h-3.5" />
                      <span>{hasChauffeur && hasCar ? "Reassign" : "Assign Car & Chauffeur"}</span>
                    </button>

                    <select
                      value={item.status}
                      onChange={(e) => handleQuickStatusChange(item.id, e.target.value)}
                      className="bg-background border border-border text-[10px] font-bold text-slate-300 rounded-xl px-2 py-2 focus:outline-none focus:border-amber-400 cursor-pointer"
                    >
                      <option value="ASSIGNED">Assigned</option>
                      <option value="IN_TRANSIT">In Transit</option>
                      <option value="COMPLETED">Completed</option>
                      <option value="CANCELLED">Cancel</option>
                    </select>

                    <button
                      type="button"
                      onClick={() => handleDeleteDispatch(item.id)}
                      className="p-2 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 rounded-xl text-xs font-bold transition-all flex items-center justify-center cursor-pointer"
                      title="Permanently Delete Dispatch"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
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
                {/* Row 1: Passenger Name, Mobile Number, Trip Type */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
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

                  <div className="space-y-1.5">
                    <label className="text-slate-300 font-bold uppercase text-[10px]">Trip Type *</label>
                    <select
                      value={dispatchForm.tripType}
                      onChange={(e) => setDispatchForm({ ...dispatchForm, tripType: e.target.value })}
                      className="w-full bg-background border border-border rounded-xl px-3 py-2.5 text-slate-100 text-xs focus:outline-none focus:border-amber-400 font-bold text-amber-400 cursor-pointer"
                    >
                      {TRIP_TYPES.map((t) => (
                        <option key={t} value={t}>
                          {t}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Row 2: Category, Class, Model */}
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

                {/* Row 3: Vehicle Allocation & Chauffeur Assignment */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-background/60 p-3.5 rounded-2xl border border-border">
                  <div className="space-y-1.5">
                    <label className="text-slate-300 font-bold uppercase text-[10px] flex items-center justify-between">
                      <span className="flex items-center gap-1.5">
                        <Car className="w-3.5 h-3.5 text-amber-400" />
                        Assign Commercial Vehicle
                      </span>
                      <span className="text-[9px] text-slate-500 font-mono">Optional</span>
                    </label>
                    <select
                      value={dispatchForm.assignedVehicleId}
                      onChange={(e) => setDispatchForm({ ...dispatchForm, assignedVehicleId: e.target.value })}
                      className="w-full bg-background border border-border rounded-xl px-3 py-2 text-slate-100 text-xs focus:outline-none focus:border-amber-400 cursor-pointer"
                    >
                      <option value="">-- Assign Later / Auto-Allocate --</option>
                      {fleetList.map((v) => (
                        <option key={v.id} value={v.id}>
                          {v.make} {v.model} ({v.registrationNumber}) &bull; {v.categoryName || v.category?.name || "Sedan"}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-slate-300 font-bold uppercase text-[10px] flex items-center justify-between">
                      <span className="flex items-center gap-1.5">
                        <UserCheck className="w-3.5 h-3.5 text-amber-400" />
                        Assign Chauffeur
                      </span>
                      <span className="text-[9px] text-slate-500 font-mono">Optional</span>
                    </label>
                    <select
                      value={dispatchForm.assignedDriverId}
                      onChange={(e) => setDispatchForm({ ...dispatchForm, assignedDriverId: e.target.value })}
                      className="w-full bg-background border border-border rounded-xl px-3 py-2 text-slate-100 text-xs focus:outline-none focus:border-amber-400 cursor-pointer"
                    >
                      <option value="">-- Assign Later / Auto-Allocate --</option>
                      {driversList.map((d) => (
                        <option key={d.id} value={d.id}>
                          {d.name} &bull; {d.phone} {d.licenseNumber ? `(${d.licenseNumber})` : ""}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Row 4: Pickup Location & Drop Location with Address Search */}
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

                {/* Row 5: Agreed Fare & Advance */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-slate-300 font-bold uppercase text-[10px]">Agreed Fare (₹)</label>
                    <input
                      type="number"
                      placeholder="e.g. 2800"
                      value={dispatchForm.fare}
                      onChange={(e) => setDispatchForm({ ...dispatchForm, fare: e.target.value })}
                      className="w-full bg-background border border-border rounded-xl px-3.5 py-2 text-slate-100 text-xs focus:outline-none focus:border-amber-400 font-mono"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-slate-300 font-bold uppercase text-[10px]">Advance Collected (₹)</label>
                    <input
                      type="number"
                      placeholder="e.g. 500"
                      value={dispatchForm.advance}
                      onChange={(e) => setDispatchForm({ ...dispatchForm, advance: e.target.value })}
                      className="w-full bg-background border border-border rounded-xl px-3.5 py-2 text-slate-100 text-xs focus:outline-none focus:border-amber-400 font-mono"
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
                    className="px-6 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-black rounded-xl text-xs uppercase tracking-wider shadow-lg shadow-amber-500/20 cursor-pointer hover:from-amber-400 hover:to-amber-500 transition-all flex items-center gap-1.5"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Dispatch Now</span>
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
        </Portal>
      )}

      {/* Assignment & Chauffeur Allocation Modal */}
      <QuickDispatchAssignmentModal
        isOpen={!!assigningDispatch}
        onClose={() => setAssigningDispatch(null)}
        dispatchItem={assigningDispatch}
        fleetVehicles={fleetList}
        drivers={driversList}
        onSave={handleSaveAssignment}
        onDelete={handleDeleteDispatch}
      />
    </div>
  );
}

