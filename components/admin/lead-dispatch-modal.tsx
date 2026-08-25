"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  X,
  Truck,
  Car,
  UserCheck,
  IndianRupee,
  CheckCircle2,
  Check,
  Share2,
  ArrowRight,
  Filter,
  Sparkles,
  MapPin
} from "lucide-react";
import LocationInput from "@/components/shared/location-input";
import Portal from "@/components/shared/portal";

export interface LeadDispatchModalProps {
  isOpen: boolean;
  onClose: () => void;
  lead: any;
  onSuccess?: (dispatchedBooking: any) => void;
}

// Vehicle Class options matching mandatory PRD specs
const SEDAN_CLASSES = ["Compact", "Executive", "Premium Executive", "Luxury"];
const SUV_CLASSES = ["Subcompact/Urban", "Mid-Premium", "Premium", "Luxury"];

export function extractLeadVehicleRequirements(lead: any): {
  category: string;
  vehicleClass: string;
  model: string;
  isVehiclePreSelected: boolean;
} {
  if (!lead) return { category: "", vehicleClass: "", model: "", isVehiclePreSelected: false };

  let category = lead.category || lead.vehicleCategory?.name || lead.categoryName || "";
  let vehicleClass = lead.vehicleClass || lead.subCategory || "";
  let model = lead.model || lead.vehicleModel || lead.modelName || "";

  const trip = (lead.tripType || "") + " " + (lead.notes || "") + " " + (lead.requirements || "");

  // If not explicitly set, try extracting from tripType string
  if (!category) {
    if (/\bSUV\b/i.test(trip)) category = "SUV";
    else if (/\bSedan\b/i.test(trip)) category = "Sedan";
  }

  if (!vehicleClass) {
    const classMatch = trip.match(/\((Compact|Executive|Premium Executive|Luxury|Subcompact\/Urban|Mid-Premium|Premium)\)/i);
    if (classMatch) vehicleClass = classMatch[1];
  }

  if (!model) {
    const modelMatch = trip.match(/Model:\s*([^,\)\n]+)/i);
    if (modelMatch) model = modelMatch[1].trim();
  }

  const isVehiclePreSelected = Boolean(category || vehicleClass || model);

  return { category, vehicleClass, model, isVehiclePreSelected };
}

export default function LeadDispatchModal({
  isOpen,
  onClose,
  lead,
  onSuccess
}: LeadDispatchModalProps) {
  const [availableVehicles, setAvailableVehicles] = useState<any[]>([]);
  const [availableDrivers, setAvailableDrivers] = useState<any[]>([]);
  const [dispatchedSuccess, setDispatchedSuccess] = useState<any | null>(null);

  // Vehicle Category & Class Filter States for Dispatch Desk
  const [categoryFilter, setCategoryFilter] = useState<string>("ALL");
  const [classFilter, setClassFilter] = useState<string>("ALL");

  const [dispatchForm, setDispatchForm] = useState({
    vehicleId: "",
    driverId: "",
    fare: "2800",
    advance: "500",
    paymentMode: "Cash Collection",
    pickupLocation: "",
    dropLocation: "",
    pickupDateTime: "",
    notes: ""
  });

  // Extract lead vehicle specs
  const leadVehReq = useMemo(() => extractLeadVehicleRequirements(lead), [lead]);

  // Load registered fleet vehicles and drivers for assignment
  useEffect(() => {
    if (!isOpen) return;

    // 1. Initial Load from Local Storage
    let vList: any[] = [];
    try {
      const storedVehicles = localStorage.getItem("user_uploaded_fleet_vehicles") || localStorage.getItem("user_uploaded_fleet");
      if (storedVehicles) {
        const parsed = JSON.parse(storedVehicles);
        if (Array.isArray(parsed) && parsed.length > 0) vList = parsed;
      }
    } catch (e) {
      console.error(e);
    }
    if (vList.length === 0) {
      vList = [
        { id: "v-1", make: "Toyota", model: "Innova Hycross", registrationNumber: "DL 01 AB 1234", categoryName: "SUV", vehicleClass: "Mid-Premium" },
        { id: "v-2", make: "Maruti Suzuki", model: "Dzire", registrationNumber: "DL 01 CD 5678", categoryName: "Sedan", vehicleClass: "Compact" },
        { id: "v-3", make: "Honda", model: "City", registrationNumber: "HR 26 EF 9012", categoryName: "Sedan", vehicleClass: "Executive" },
        { id: "v-4", make: "BMW", model: "X5", registrationNumber: "DL 01 LM 4321", categoryName: "SUV", vehicleClass: "Luxury" }
      ];
    }
    setAvailableVehicles(vList);

    // 2. Initial Load Drivers from Local Storage
    let dList: any[] = [];
    try {
      const storedDrivers = localStorage.getItem("user_uploaded_drivers");
      if (storedDrivers) {
        const parsed = JSON.parse(storedDrivers);
        if (Array.isArray(parsed) && parsed.length > 0) dList = parsed;
      }
    } catch (e) {
      console.error(e);
    }
    if (dList.length === 0) {
      dList = [
        { id: "d-1", name: "Ramesh Sharma", phone: "9876543210", licenseNumber: "DL-042021008765" },
        { id: "d-2", name: "Vikram Singh", phone: "9811223344", licenseNumber: "HR-262022001122" },
        { id: "d-3", name: "Amit Kumar Verma", phone: "9988776655", licenseNumber: "DL-012020009988" }
      ];
    }
    setAvailableDrivers(dList);

    // 3. Live Sync from API
    const syncLiveSources = async () => {
      try {
        const [fleetRes, drvRes] = await Promise.allSettled([
          fetch("/api/fleet"),
          fetch("/api/admin/drivers")
        ]);

        if (fleetRes.status === "fulfilled" && fleetRes.value.ok) {
          const fleetData = await fleetRes.value.json();
          const apiVehicles = Array.isArray(fleetData) ? fleetData : (fleetData.vehicles || []);
          if (apiVehicles.length > 0) {
            const vMap = new Map();
            vList.forEach(v => vMap.set(v.id || v.registrationNumber, v));
            apiVehicles.forEach((v: any) => {
              if (!vMap.has(v.id || v.registrationNumber)) {
                vMap.set(v.id || v.registrationNumber, v);
              }
            });
            setAvailableVehicles(Array.from(vMap.values()));
          }
        }

        if (drvRes.status === "fulfilled" && drvRes.value.ok) {
          const apiDrivers = await drvRes.value.json();
          if (Array.isArray(apiDrivers) && apiDrivers.length > 0) {
            const dMap = new Map();
            dList.forEach(d => dMap.set(d.id || d.phone, d));
            apiDrivers.forEach((d: any) => {
              if (!dMap.has(d.id || d.phone)) {
                dMap.set(d.id || d.phone, d);
              }
            });
            setAvailableDrivers(Array.from(dMap.values()));
          }
        }
      } catch (err) {
        console.error("Live dispatch sync error:", err);
      }
    };

    syncLiveSources();

    // 4. Configure Filter & Vehicle defaults based on lead type
    if (lead) {
      setDispatchedSuccess(null);

      const req = extractLeadVehicleRequirements(lead);

      let initialCat = "ALL";
      let initialClass = "ALL";
      let preMatchedVehicle = null;

      if (req.isVehiclePreSelected) {
        if (req.category) initialCat = req.category;
        if (req.vehicleClass) initialClass = req.vehicleClass;

        preMatchedVehicle = vList.find((v) => {
          const catMatches = !req.category || (v.categoryName || "").toUpperCase() === req.category.toUpperCase();
          const classMatches = !req.vehicleClass || (v.vehicleClass || "").toLowerCase() === req.vehicleClass.toLowerCase();
          const modelMatches = !req.model || `${v.make} ${v.model}`.toLowerCase().includes(req.model.toLowerCase());
          return catMatches && (classMatches || modelMatches);
        });
      }

      setCategoryFilter(initialCat);
      setClassFilter(initialClass);

      const chosenVehId = preMatchedVehicle?.id || vList[0]?.id || "";

      setDispatchForm({
        vehicleId: chosenVehId,
        driverId: dList[0]?.id || "",
        fare: "2800",
        advance: "500",
        paymentMode: "Cash Collection",
        pickupLocation: lead.pickupLocation || lead.pickup || "",
        dropLocation: lead.dropLocation || lead.drop || "",
        pickupDateTime: lead.pickupDateTime || new Date().toISOString().slice(0, 16),
        notes: lead.notes || `Dispatched via Website Admin for ${lead.customerName || lead.name || "Customer"}`
      });
    }
  }, [isOpen, lead]);

  const filteredVehicles = useMemo(() => {
    return availableVehicles.filter((v) => {
      const matchesCat =
        categoryFilter === "ALL" ||
        (v.categoryName || "").toUpperCase() === categoryFilter.toUpperCase();

      const matchesClass =
        classFilter === "ALL" ||
        (v.vehicleClass || "").toLowerCase() === classFilter.toLowerCase();

      return matchesCat && matchesClass;
    });
  }, [availableVehicles, categoryFilter, classFilter]);

  const availableClassOptions = useMemo(() => {
    if (categoryFilter === "Sedan") return SEDAN_CLASSES;
    if (categoryFilter === "SUV") return SUV_CLASSES;
    return Array.from(new Set([...SEDAN_CLASSES, ...SUV_CLASSES]));
  }, [categoryFilter]);

  if (!isOpen || !lead) return null;

  const handleConfirmDispatch = async (e: React.FormEvent) => {
    e.preventDefault();

    const assignedVeh = availableVehicles.find(v => v.id === dispatchForm.vehicleId) || filteredVehicles[0] || availableVehicles[0];
    const assignedDrv = availableDrivers.find(d => d.id === dispatchForm.driverId) || availableDrivers[0];
    const finalBookingRef = lead.bookingRef || lead.bookingNumber || `TT-${Date.now().toString().slice(-6)}`;
    
    const dispatchedBooking = {
      id: `booking_${Date.now()}`,
      bookingNumber: finalBookingRef,
      type: lead.tripType || "Dispatched Ride",
      status: "CONFIRMED",
      pickupLocation: dispatchForm.pickupLocation,
      dropLocation: dispatchForm.dropLocation,
      pickupDateTime: dispatchForm.pickupDateTime,
      netAmount: dispatchForm.fare,
      totalAmount: dispatchForm.fare,
      advanceAmount: dispatchForm.advance,
      paymentMode: dispatchForm.paymentMode,
      notes: dispatchForm.notes,
      createdAt: new Date().toISOString(),
      customer: {
        name: lead.customerName || lead.name || "Customer Lead",
        phone: lead.phone || "",
        email: lead.email || ""
      },
      vehicleCategory: {
        name: assignedVeh?.categoryName || "Premium Fleet"
      },
      vehicle: {
        id: assignedVeh?.id,
        registrationNumber: assignedVeh?.registrationNumber,
        model: `${assignedVeh?.make || ""} ${assignedVeh?.model || ""}`.trim(),
        driver: {
          name: assignedDrv?.name,
          phone: assignedDrv?.phone
        }
      },
      payments: [
        {
          id: `pay_${Date.now()}`,
          status: Number(dispatchForm.advance) > 0 ? "SUCCESS" : "PENDING",
          gateway: dispatchForm.paymentMode,
          amount: dispatchForm.advance || "0"
        }
      ]
    };

    try {
      const stored = localStorage.getItem("user_uploaded_dispatched_bookings");
      const list = stored ? JSON.parse(stored) : [];
      list.unshift(dispatchedBooking);
      localStorage.setItem("user_uploaded_dispatched_bookings", JSON.stringify(list));
    } catch (err) {
      console.error(err);
    }

    try {
      const crmStored = localStorage.getItem("user_uploaded_crm_leads");
      if (crmStored) {
        const crmList = JSON.parse(crmStored);
        if (Array.isArray(crmList)) {
          const updatedCRM = crmList.map((l: any) => l.id === lead.id ? { ...l, status: "CONVERTED" } : l);
          localStorage.setItem("user_uploaded_crm_leads", JSON.stringify(updatedCRM));
        }
      }
    } catch (e) {
      console.error(e);
    }

    try {
      await fetch(`/api/rental/lead`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: lead.id, status: "CONVERTED" }),
      });
    } catch (e) {
      console.error(e);
    }

    if (onSuccess) onSuccess(dispatchedBooking);

    setDispatchedSuccess({
      bookingRef: finalBookingRef,
      lead: lead,
      vehicle: assignedVeh,
      driver: assignedDrv,
      fare: dispatchForm.fare,
      advance: dispatchForm.advance,
      paymentMode: dispatchForm.paymentMode,
      pickupLocation: dispatchForm.pickupLocation,
      dropLocation: dispatchForm.dropLocation,
      pickupDateTime: dispatchForm.pickupDateTime
    });
  };

  return (
    <Portal>
      <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
      <div className="bg-slate-900 border border-amber-500/40 rounded-3xl p-6 sm:p-8 w-full max-w-2xl shadow-2xl space-y-6 relative text-slate-100 max-h-[92vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-slate-400 hover:text-white cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {dispatchedSuccess ? (
          <div className="space-y-6 text-center py-2">
            <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center mx-auto">
              <Check className="w-8 h-8" />
            </div>
            <div>
              <h3 className="text-2xl font-black text-slate-50">Ride Dispatched Successfully!</h3>
              <p className="text-xs text-slate-400 mt-1">
                The lead is now confirmed and logged as an active booking in the dispatch network.
              </p>
            </div>

            {/* Official Booking PNR Ticket Banner */}
            <div className="bg-slate-950 p-5 rounded-2xl border border-amber-500/30 space-y-3 text-left">
              <div className="flex justify-between items-center border-b border-white/10 pb-3">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Official Booking PNR</span>
                <span className="text-xl font-black font-mono text-amber-400">{dispatchedSuccess.bookingRef}</span>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Customer</span>
                  <span className="font-bold text-slate-100">{dispatchedSuccess.lead?.customerName || dispatchedSuccess.lead?.name}</span>
                  <div className="text-[11px] font-mono text-slate-400">{dispatchedSuccess.lead?.phone}</div>
                </div>

                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Assigned Vehicle</span>
                  <span className="font-bold text-amber-400 font-mono">{dispatchedSuccess.vehicle?.registrationNumber}</span>
                  <div className="text-[11px] text-slate-300">{dispatchedSuccess.vehicle?.make} {dispatchedSuccess.vehicle?.model}</div>
                </div>

                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Chauffeur</span>
                  <span className="font-bold text-slate-100">{dispatchedSuccess.driver?.name}</span>
                  <div className="text-[11px] font-mono text-slate-400">+91 {dispatchedSuccess.driver?.phone}</div>
                </div>

                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Total Fare / Mode</span>
                  <span className="font-black text-emerald-400 font-mono text-sm">₹{dispatchedSuccess.fare}</span>
                  <div className="text-[10px] text-slate-400">{dispatchedSuccess.paymentMode}</div>
                </div>
              </div>
            </div>

            {/* 1-Click Action Buttons: WhatsApp Share & Dispatch View */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <a
                href={`https://wa.me/91${(dispatchedSuccess.lead?.phone || "").replace(/\D/g, "").slice(-10)}?text=${encodeURIComponent(
                  `*TEMP TRAVEL CAR RENTALS - RIDE CONFIRMATION*\n\nDear ${dispatchedSuccess.lead?.customerName || dispatchedSuccess.lead?.name},\nYour cab has been confirmed and dispatched.\n\n*Booking Number (PNR):* ${dispatchedSuccess.bookingRef}\n*Vehicle:* ${dispatchedSuccess.vehicle?.make} ${dispatchedSuccess.vehicle?.model} (${dispatchedSuccess.vehicle?.registrationNumber})\n*Driver / Chauffeur:* ${dispatchedSuccess.driver?.name} (📞 +91-${dispatchedSuccess.driver?.phone})\n*Pickup Location:* ${dispatchedSuccess.pickupLocation}\n*Agreed Fare:* ₹${dispatchedSuccess.fare}\n\nThank you for choosing Temp Travel! For assistance call +91-9999999999.`
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white font-black py-2.5 px-4 rounded-xl text-xs uppercase tracking-wider shadow-lg transition-all"
              >
                <Share2 className="w-4 h-4" />
                <span>Share On WhatsApp</span>
              </a>

              <button
                type="button"
                onClick={onClose}
                className="flex items-center justify-center gap-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black py-2.5 px-4 rounded-xl text-xs uppercase tracking-wider shadow-lg transition-all cursor-pointer"
              >
                <span>Done & Return to Leads</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        ) : (
          <>
            <div className="space-y-1 border-b border-white/10 pb-4">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold uppercase text-amber-400 tracking-wider">
                  Website Admin Dispatch Desk
                </span>
                <span className="text-[10px] font-mono text-slate-400 bg-slate-950 px-2 py-0.5 rounded border border-white/10 font-bold">
                  {lead.bookingRef || lead.bookingNumber || "NEW-LEAD"}
                </span>
              </div>
              <h3 className="text-xl sm:text-2xl font-black text-slate-50">
                Dispatch Ride & Assign Chauffeur
              </h3>
              <p className="text-xs text-slate-400">
                Assign an active vehicle from your Fleet Roster and a Chauffeur to confirm this customer booking.
              </p>
            </div>

            <form onSubmit={handleConfirmDispatch} className="space-y-5">
              {/* Customer Lead Summary */}
              <div className="bg-slate-950 p-4 rounded-2xl border border-white/10 space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                  <div>
                    <span className="text-[10px] text-slate-400 block uppercase font-bold">Customer</span>
                    <span className="font-bold text-slate-100 text-sm">{lead.customerName || lead.name}</span>
                    <div className="text-slate-400 font-mono text-[11px]">{lead.phone}</div>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block uppercase font-bold">Trip Type</span>
                    <span className="font-bold text-amber-400">{lead.tripType || "Rental Lead"}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block uppercase font-bold">Lead Ingested</span>
                    <span className="text-slate-300 font-mono">{lead.createdAt?.slice(0, 10) || "Today"}</span>
                  </div>
                </div>

                {/* Show Vehicle Requirement Badge ONLY if specified in lead (Local Rental / Outstation) */}
                {leadVehReq.isVehiclePreSelected ? (
                  <div className="pt-2 border-t border-white/5 flex flex-wrap items-center gap-2 text-xs">
                    <span className="text-[10px] font-bold uppercase text-amber-400 tracking-wider flex items-center gap-1">
                      <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                      <span>Customer Selected Vehicle:</span>
                    </span>
                    {leadVehReq.category && (
                      <span className="px-2 py-0.5 rounded-md bg-amber-500/10 border border-amber-500/30 text-amber-300 font-bold text-[11px]">
                        Category: {leadVehReq.category}
                      </span>
                    )}
                    {leadVehReq.vehicleClass && (
                      <span className="px-2 py-0.5 rounded-md bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 font-bold text-[11px]">
                        Class: {leadVehReq.vehicleClass}
                      </span>
                    )}
                    {leadVehReq.model && (
                      <span className="px-2 py-0.5 rounded-md bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 font-bold text-[11px]">
                        Model: {leadVehReq.model}
                      </span>
                    )}
                  </div>
                ) : null}
              </div>

              {/* Assignment Controls: Vehicle Filter (Category & Class) & Chauffeur */}
              <div className="space-y-3 bg-slate-950/60 p-4 rounded-2xl border border-white/5">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                  <span className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                    <Filter className="w-4 h-4 text-amber-400" />
                    <span>Filter Fleet for Dispatch</span>
                  </span>
                  <span className="text-[11px] text-slate-400">
                    Available: <strong className="text-amber-400">{filteredVehicles.length}</strong> vehicle(s)
                  </span>
                </div>

                {/* Category & Class Selection Buttons */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      Vehicle Category
                    </label>
                    <div className="grid grid-cols-3 gap-1.5">
                      {["ALL", "Sedan", "SUV"].map((cat) => (
                        <button
                          key={cat}
                          type="button"
                          onClick={() => {
                            setCategoryFilter(cat);
                            setClassFilter("ALL");
                          }}
                          className={`py-1.5 px-2 rounded-lg text-xs font-bold transition-all cursor-pointer border ${
                            categoryFilter.toUpperCase() === cat.toUpperCase()
                              ? "bg-amber-500 text-slate-950 border-amber-400 font-black shadow-md shadow-amber-500/10"
                              : "bg-slate-900 text-slate-400 border-white/10 hover:text-slate-200"
                          }`}
                        >
                          {cat}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      Vehicle Class
                    </label>
                    <select
                      value={classFilter}
                      onChange={(e) => setClassFilter(e.target.value)}
                      className="w-full bg-slate-900 border border-white/10 rounded-lg p-2 text-xs text-slate-100 focus:outline-none focus:border-amber-400 cursor-pointer"
                    >
                      <option value="ALL">All Vehicle Classes</option>
                      {availableClassOptions.map((cls) => (
                        <option key={cls} value={cls}>
                          {cls}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Vehicle & Chauffeur Dropdowns */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-white/5">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                      <Car className="w-4 h-4 text-amber-400" />
                      <span>Select Fleet Vehicle *</span>
                    </label>
                    <select
                      value={dispatchForm.vehicleId}
                      onChange={(e) => setDispatchForm({ ...dispatchForm, vehicleId: e.target.value })}
                      required
                      className="w-full bg-slate-950 border border-white/10 rounded-xl p-3 text-xs text-slate-100 focus:outline-none focus:border-amber-400 font-mono cursor-pointer"
                    >
                      <option value="" disabled>- Select Fleet Vehicle -</option>
                      {filteredVehicles.map((veh) => (
                        <option key={veh.id} value={veh.id} className="bg-slate-900">
                          {veh.make} {veh.model} ({veh.registrationNumber}) • {veh.categoryName || "Sedan"} - {veh.vehicleClass || "Executive"}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                      <UserCheck className="w-4 h-4 text-amber-400" />
                      <span>Select Chauffeur / Driver *</span>
                    </label>
                    <select
                      value={dispatchForm.driverId}
                      onChange={(e) => setDispatchForm({ ...dispatchForm, driverId: e.target.value })}
                      required
                      className="w-full bg-slate-950 border border-white/10 rounded-xl p-3 text-xs text-slate-100 focus:outline-none focus:border-amber-400 font-mono cursor-pointer"
                    >
                      <option value="" disabled>- Select Assigned Chauffeur -</option>
                      {availableDrivers.map((drv) => (
                        <option key={drv.id} value={drv.id} className="bg-slate-900">
                          {drv.name} (+91 {drv.phone})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Commercials: Fare & Payment */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-300">Agreed Trip Fare (₹) *</label>
                  <div className="relative">
                    <IndianRupee className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="number"
                      required
                      value={dispatchForm.fare}
                      onChange={(e) => setDispatchForm({ ...dispatchForm, fare: e.target.value })}
                      className="w-full bg-slate-950 border border-white/10 rounded-xl pl-8 pr-3 py-2.5 text-xs text-slate-100 focus:outline-none focus:border-amber-400 font-mono font-bold"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-300">Advance Collected (₹)</label>
                  <div className="relative">
                    <IndianRupee className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="number"
                      value={dispatchForm.advance}
                      onChange={(e) => setDispatchForm({ ...dispatchForm, advance: e.target.value })}
                      className="w-full bg-slate-950 border border-white/10 rounded-xl pl-8 pr-3 py-2.5 text-xs text-slate-100 focus:outline-none focus:border-amber-400 font-mono"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-300">Payment Collection Mode</label>
                  <select
                    value={dispatchForm.paymentMode}
                    onChange={(e) => setDispatchForm({ ...dispatchForm, paymentMode: e.target.value })}
                    className="w-full bg-slate-950 border border-white/10 rounded-xl p-2.5 text-xs text-slate-100 focus:outline-none focus:border-amber-400 cursor-pointer"
                  >
                    <option value="Cash Collection">Driver Cash Collection</option>
                    <option value="UPI / QR Code">UPI / QR Code Scan</option>
                    <option value="Razorpay Online Link">Razorpay Payment Link</option>
                    <option value="NEFT / Bank Transfer">Bank NEFT Transfer</option>
                    <option value="Post-Trip Bill">Corporate Billing / Post-Trip</option>
                  </select>
                </div>
              </div>

              {/* Route & Schedule Confirmation with Live Location Search */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-300 flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-amber-400" />
                    <span>Pickup Location *</span>
                  </label>
                  <LocationInput
                    value={dispatchForm.pickupLocation}
                    onChange={(val) => setDispatchForm(prev => ({ ...prev, pickupLocation: val }))}
                    placeholder="Search pickup location, airport, landmark..."
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-300 flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-amber-400" />
                    <span>Drop Location / Destination</span>
                  </label>
                  <LocationInput
                    value={dispatchForm.dropLocation}
                    onChange={(val) => setDispatchForm(prev => ({ ...prev, dropLocation: val }))}
                    placeholder="Search drop location or transit hub..."
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300">Special Dispatcher Instructions</label>
                <textarea
                  rows={2}
                  value={dispatchForm.notes}
                  onChange={(e) => setDispatchForm({ ...dispatchForm, notes: e.target.value })}
                  placeholder="e.g. Provide bottle water, verify flight timing, etc."
                  className="w-full bg-slate-950 border border-white/10 rounded-xl p-2.5 text-xs text-slate-100 focus:outline-none focus:border-amber-400 resize-none"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-white/10">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 bg-slate-950 border border-white/10 text-slate-400 hover:text-white rounded-xl text-xs font-bold transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex items-center gap-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black px-6 py-2.5 rounded-xl text-xs uppercase tracking-wider shadow-lg shadow-amber-500/20 cursor-pointer"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Confirm Dispatch & Generate PNR</span>
                </button>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
    </Portal>
  );
}
