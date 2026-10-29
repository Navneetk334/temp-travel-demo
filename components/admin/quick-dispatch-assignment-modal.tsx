"use client";

import React, { useState, useEffect } from "react";
import {
  X,
  Car,
  UserCheck,
  MapPin,
  Navigation,
  CheckCircle2,
  Calendar,
  IndianRupee,
  ShieldCheck,
  Phone,
  Sparkles,
  AlertCircle,
  Trash2
} from "lucide-react";
import Portal from "@/components/shared/portal";

export interface QuickDispatchAssignmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  dispatchItem: any | null;
  fleetVehicles: any[];
  drivers: any[];
  onSave: (updatedDispatch: any) => void;
  onDelete?: (id: string) => void;
}

export default function QuickDispatchAssignmentModal({
  isOpen,
  onClose,
  dispatchItem,
  fleetVehicles,
  drivers,
  onSave,
  onDelete,
}: QuickDispatchAssignmentModalProps) {
  const [selectedVehicleId, setSelectedVehicleId] = useState("");
  const [selectedDriverId, setSelectedDriverId] = useState("");
  const [tripStatus, setTripStatus] = useState("ASSIGNED");
  const [fare, setFare] = useState("2800");
  const [advance, setAdvance] = useState("500");
  const [notes, setNotes] = useState("");
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    if (dispatchItem) {
      setSelectedVehicleId(dispatchItem.vehicleId || "");
      setSelectedDriverId(dispatchItem.driverId || "");
      setTripStatus(dispatchItem.status || "ASSIGNED");
      setFare(String(dispatchItem.fare || "2800"));
      setAdvance(String(dispatchItem.advance || "500"));
      setNotes(dispatchItem.notes || "");
      setIsSaved(false);
    }
  }, [dispatchItem, isOpen]);

  if (!isOpen || !dispatchItem) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const assignedVehicle = fleetVehicles.find(
      (v) => v.id === selectedVehicleId || v.registrationNumber === selectedVehicleId
    );
    const assignedDriver = drivers.find(
      (d) => d.id === selectedDriverId || d.phone === selectedDriverId
    );

    const updated = {
      ...dispatchItem,
      vehicleId: assignedVehicle?.id || selectedVehicleId || "",
      regNumber: assignedVehicle?.registrationNumber || dispatchItem.regNumber || (selectedVehicleId ? "Assigned" : "Pending Vehicle"),
      vehicleModel: assignedVehicle ? `${assignedVehicle.make} ${assignedVehicle.model}` : dispatchItem.vehicleModel,
      vehicleCategory: assignedVehicle?.categoryName || dispatchItem.vehicleCategory || "Sedan",
      vehicleClass: assignedVehicle?.vehicleClass || dispatchItem.vehicleClass || "Executive",
      driverId: assignedDriver?.id || selectedDriverId || "",
      driverName: assignedDriver?.name || dispatchItem.driverName || (selectedDriverId ? "Assigned" : "Pending Chauffeur"),
      driverPhone: assignedDriver?.phone || dispatchItem.driverPhone || "",
      status: tripStatus,
      fare,
      advance,
      notes,
      updatedAt: new Date().toISOString()
    };

    onSave(updated);
    setIsSaved(true);

    setTimeout(() => {
      setIsSaved(false);
      onClose();
    }, 900);
  };

  return (
    <Portal>
      <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
        <div className="bg-surface border border-amber-500/40 rounded-3xl p-6 sm:p-8 w-full max-w-xl shadow-2xl space-y-5 relative text-slate-100 max-h-[90vh] overflow-y-auto">
          <button
            onClick={onClose}
            className="absolute top-5 right-5 text-slate-400 hover:text-white cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Modal Header */}
          <div className="space-y-1 border-b border-border pb-3">
            <div className="flex items-center gap-2 text-amber-400 text-xs font-black uppercase tracking-wider">
              <UserCheck className="w-4 h-4" />
              <span>Chauffeur & Fleet Allocation Desk</span>
            </div>
            <h3 className="text-xl sm:text-2xl font-black text-slate-50">
              Assign Vehicle & Chauffeur
            </h3>
            <div className="text-xs text-slate-400 flex items-center gap-2 font-mono">
              <span>Ref ID: <strong className="text-amber-400">{dispatchItem.id}</strong></span>
              <span>&bull;</span>
              <span className="text-slate-300">{dispatchItem.tripType || "Quick Dispatch"}</span>
            </div>
          </div>

          {isSaved ? (
            <div className="py-10 text-center space-y-3 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl">
              <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto animate-bounce" />
              <div className="text-base font-bold text-emerald-400">
                Assignment Successfully Saved & Synced!
              </div>
              <div className="text-xs text-slate-400">
                Chauffeur roster and live telematics updated across Master Admin.
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              {/* Passenger & Route Summary Card */}
              <div className="bg-background/80 p-3.5 rounded-2xl border border-border space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-400">Passenger:</span>
                  <strong className="text-slate-100 font-bold">
                    {dispatchItem.customerName} &bull; {dispatchItem.phone}
                  </strong>
                </div>
                <div className="flex items-start gap-2 pt-1 border-t border-white/5 text-[11px]">
                  <MapPin className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                  <div className="line-clamp-1">
                    <span className="text-slate-500 font-bold uppercase text-[9px]">Pickup: </span>
                    <span className="text-slate-300">{dispatchItem.pickupLocation}</span>
                  </div>
                </div>
                {dispatchItem.dropLocation && (
                  <div className="flex items-start gap-2 text-[11px]">
                    <Navigation className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                    <div className="line-clamp-1">
                      <span className="text-slate-500 font-bold uppercase text-[9px]">Drop: </span>
                      <span className="text-slate-300">{dispatchItem.dropLocation}</span>
                    </div>
                  </div>
                )}
                <div className="flex justify-between items-center pt-1 border-t border-white/5 text-[10px] font-mono text-slate-400">
                  <span>Target Class: <strong className="text-amber-400">{dispatchItem.vehicleCategory || "Sedan"} &bull; {dispatchItem.vehicleClass || "Executive"}</strong></span>
                  <span>Model: <strong className="text-slate-200">{dispatchItem.vehicleModel || "Any"}</strong></span>
                </div>
              </div>

              {/* Assignment Selectors */}
              <div className="space-y-3">
                {/* 1. Commercial Vehicle Selection */}
                <div className="space-y-1.5">
                  <label className="text-slate-300 font-bold uppercase text-[10px] flex items-center justify-between">
                    <span className="flex items-center gap-1.5">
                      <Car className="w-3.5 h-3.5 text-amber-400" />
                      1. Assign Commercial Vehicle *
                    </span>
                    <span className="text-[10px] font-mono text-slate-500">
                      {fleetVehicles.length} Registered Cars
                    </span>
                  </label>
                  <select
                    value={selectedVehicleId}
                    onChange={(e) => setSelectedVehicleId(e.target.value)}
                    className="w-full bg-background border border-border rounded-xl px-3.5 py-2.5 text-slate-100 text-xs focus:outline-none focus:border-amber-400 font-semibold cursor-pointer"
                  >
                    <option value="">-- Keep Pending / Auto-Allocate Later --</option>
                    {fleetVehicles.map((v) => (
                      <option key={v.id} value={v.id}>
                        {v.make} {v.model} ({v.registrationNumber}) &bull; {v.categoryName || v.category?.name || "Sedan"} ({v.vehicleClass || v.subCategory || "Executive"})
                      </option>
                    ))}
                  </select>
                </div>

                {/* 2. Chauffeur / Driver Selection */}
                <div className="space-y-1.5">
                  <label className="text-slate-300 font-bold uppercase text-[10px] flex items-center justify-between">
                    <span className="flex items-center gap-1.5">
                      <UserCheck className="w-3.5 h-3.5 text-amber-400" />
                      2. Assign Trained Chauffeur *
                    </span>
                    <span className="text-[10px] font-mono text-slate-500">
                      {drivers.length} Verified Drivers
                    </span>
                  </label>
                  <select
                    value={selectedDriverId}
                    onChange={(e) => setSelectedDriverId(e.target.value)}
                    className="w-full bg-background border border-border rounded-xl px-3.5 py-2.5 text-slate-100 text-xs focus:outline-none focus:border-amber-400 font-semibold cursor-pointer"
                  >
                    <option value="">-- Keep Pending / Auto-Allocate Later --</option>
                    {drivers.map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.name} &bull; {d.phone} {d.licenseNumber ? `(${d.licenseNumber})` : ""}
                      </option>
                    ))}
                  </select>
                </div>

                {/* 3. Trip Status & Billing */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="space-y-1.5">
                    <label className="text-slate-300 font-bold uppercase text-[10px]">Trip Status</label>
                    <select
                      value={tripStatus}
                      onChange={(e) => setTripStatus(e.target.value)}
                      className="w-full bg-background border border-border rounded-xl px-3 py-2 text-slate-100 text-xs focus:outline-none focus:border-amber-400 font-bold cursor-pointer"
                    >
                      <option value="ASSIGNED">ASSIGNED</option>
                      <option value="IN_TRANSIT">IN TRANSIT (LIVE)</option>
                      <option value="COMPLETED">COMPLETED</option>
                      <option value="UNASSIGNED">UNASSIGNED / PENDING</option>
                      <option value="CANCELLED">CANCELLED</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-slate-300 font-bold uppercase text-[10px]">Agreed Fare (₹)</label>
                    <input
                      type="number"
                      value={fare}
                      onChange={(e) => setFare(e.target.value)}
                      className="w-full bg-background border border-border rounded-xl px-3 py-2 text-slate-100 text-xs focus:outline-none focus:border-amber-400 font-mono"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-slate-300 font-bold uppercase text-[10px]">Advance (₹)</label>
                    <input
                      type="number"
                      value={advance}
                      onChange={(e) => setAdvance(e.target.value)}
                      className="w-full bg-background border border-border rounded-xl px-3 py-2 text-slate-100 text-xs focus:outline-none focus:border-amber-400 font-mono"
                    />
                  </div>
                </div>

                {/* Dispatch Notes */}
                <div className="space-y-1.5">
                  <label className="text-slate-300 font-bold uppercase text-[10px]">Dispatch Notes / SLA Instructions</label>
                  <input
                    type="text"
                    placeholder="e.g. Flight AI-860 arrival pickup, placard required, AC on high"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="w-full bg-background border border-border rounded-xl px-3.5 py-2 text-slate-100 text-xs focus:outline-none focus:border-amber-400"
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-3 border-t border-border flex items-center justify-between gap-3">
                {onDelete ? (
                  <button
                    type="button"
                    onClick={() => {
                      if (window.confirm("Are you sure you want to permanently delete this quick dispatch entry?")) {
                        onDelete(dispatchItem.id);
                        onClose();
                      }
                    }}
                    className="px-4 py-2.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 rounded-xl text-xs font-bold cursor-pointer transition-all flex items-center gap-1.5"
                    title="Delete this dispatch entry"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Delete Dispatch</span>
                  </button>
                ) : (
                  <div />
                )}

                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-5 py-2.5 bg-background text-slate-400 hover:text-white rounded-xl text-xs font-bold cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black rounded-xl text-xs uppercase tracking-wider shadow-lg shadow-amber-500/20 cursor-pointer transition-all flex items-center gap-1.5"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Confirm Assignment</span>
                  </button>
                </div>
              </div>
            </form>
          )}
        </div>
      </div>
    </Portal>
  );
}

