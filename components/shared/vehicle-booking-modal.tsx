"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  X,
  Car,
  Users,
  Fuel,
  Gauge,
  Calendar,
  Clock,
  MapPin,
  User,
  Phone,
  Mail,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Share2,
  ArrowRight,
  ShieldCheck,
  IndianRupee,
  Compass,
  Building2,
  Check
} from "lucide-react";
import LocationInput from "./location-input";

export interface FleetVehicle {
  id: string;
  make: string;
  model: string;
  registrationNumber?: string;
  categoryName: string;
  vehicleClass: string;
  subCategory?: string;
  capacity: number;
  fuelType?: string;
  transmission?: string;
  perKmRate?: number;
  perHourRate?: number;
  baseDailyRate?: number;
  driverAllowance?: number;
  nightAllowance?: number;
  imageUrl?: string;
  isFeatured?: boolean;
}

export interface VehicleBookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  vehicle: FleetVehicle | null;
  onSuccess?: (bookingRef: string) => void;
}

type TripType = "local" | "outstation" | "airport" | "corporate";

const LOCAL_PACKAGES = [
  { label: "4 Hours / 40 Kms", hours: 4, kms: 40, multiplier: 0.6 },
  { label: "8 Hours / 80 Kms (Full Day)", hours: 8, kms: 80, multiplier: 1.0 },
  { label: "12 Hours / 120 Kms (Extended)", hours: 12, kms: 120, multiplier: 1.4 },
];

export default function VehicleBookingModal({
  isOpen,
  onClose,
  vehicle,
  onSuccess
}: VehicleBookingModalProps) {
  const [tripType, setTripType] = useState<TripType>("local");
  const [outstationTripMode, setOutstationTripMode] = useState<"one-way" | "round-trip">("round-trip");
  const [localPackage, setLocalPackage] = useState(LOCAL_PACKAGES[1].label);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    passengers: "1",
    companyName: "",
    pickupLocation: "",
    dropLocation: "",
    pickupDate: "",
    pickupTimeHour: "09",
    pickupTimeMinute: "00",
    pickupTimeAmPm: "AM",
    returnDate: "",
    specialNotes: ""
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirmation, setConfirmation] = useState<any | null>(null);

  // Initialize date defaults when opened
  useEffect(() => {
    if (isOpen) {
      setError(null);
      setConfirmation(null);
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      const dateStr = tomorrow.toISOString().slice(0, 10);
      
      const dayAfter = new Date();
      dayAfter.setDate(dayAfter.getDate() + 2);
      const returnDateStr = dayAfter.toISOString().slice(0, 10);

      setFormData(prev => ({
        ...prev,
        pickupDate: prev.pickupDate || dateStr,
        returnDate: prev.returnDate || returnDateStr,
        passengers: vehicle?.capacity ? Math.min(2, vehicle.capacity).toString() : "1"
      }));
    }
  }, [isOpen, vehicle]);

  // Estimated Tariff Computation
  const estimatedFare = useMemo(() => {
    if (!vehicle) return 2500;
    const baseDaily = vehicle.baseDailyRate || 2800;
    const perKm = vehicle.perKmRate || 16;
    const driverDay = vehicle.driverAllowance || 400;

    if (tripType === "local") {
      const pkg = LOCAL_PACKAGES.find(p => p.label === localPackage) || LOCAL_PACKAGES[1];
      return Math.round(baseDaily * pkg.multiplier);
    } else if (tripType === "outstation") {
      const minKms = outstationTripMode === "round-trip" ? 500 : 250;
      return Math.round((minKms * perKm) + driverDay);
    } else if (tripType === "airport") {
      return Math.round(baseDaily * 0.55);
    } else {
      return baseDaily;
    }
  }, [vehicle, tripType, localPackage, outstationTripMode]);

  if (!isOpen || !vehicle) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const nameClean = formData.name.trim();
    if (!nameClean || !/^[a-zA-Z\s.-]+$/.test(nameClean)) {
      setError("Please enter a valid full name.");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email.trim())) {
      setError("Please enter a valid email address.");
      return;
    }

    const phoneClean = formData.phone.replace(/\D/g, "");
    if (phoneClean.length !== 10 || !/^[6-9]/.test(phoneClean)) {
      setError("Please enter a valid 10-digit Indian mobile number (e.g. 9820112233).");
      return;
    }

    if (!formData.pickupLocation.trim()) {
      setError("Please specify a pickup location.");
      return;
    }

    if (tripType !== "local" && !formData.dropLocation.trim()) {
      setError("Please specify a drop location or destination.");
      return;
    }

    if (!formData.pickupDate) {
      setError("Please select a pickup date.");
      return;
    }

    setLoading(true);

    const pickupTimeStr = `${formData.pickupTimeHour}:${formData.pickupTimeMinute} ${formData.pickupTimeAmPm}`;
    const pickupDateTime = `${formData.pickupDate}T${formData.pickupTimeHour}:${formData.pickupTimeMinute}:00`;
    const bookingRef = `TT-${Date.now().toString().slice(-6)}`;

    let tripTypeFormatted = "";
    if (tripType === "local") {
      tripTypeFormatted = `Local Hourly Rental (${localPackage}) - ${vehicle.categoryName} (${vehicle.vehicleClass}), Model: ${vehicle.make} ${vehicle.model}`;
    } else if (tripType === "outstation") {
      tripTypeFormatted = `Outstation (${outstationTripMode === "round-trip" ? "Round Trip" : "One Way"}) - ${vehicle.categoryName} (${vehicle.vehicleClass}), Model: ${vehicle.make} ${vehicle.model}`;
    } else if (tripType === "airport") {
      tripTypeFormatted = `Airport / City Transfer - ${vehicle.categoryName} (${vehicle.vehicleClass}), Model: ${vehicle.make} ${vehicle.model}`;
    } else {
      tripTypeFormatted = `Corporate Executive Rental (${formData.companyName || "Corporate"}) - ${vehicle.categoryName} (${vehicle.vehicleClass}), Model: ${vehicle.make} ${vehicle.model}`;
    }

    const leadPayload = {
      id: `lead_${Date.now()}`,
      bookingRef,
      bookingNumber: bookingRef,
      customerName: nameClean,
      name: nameClean,
      email: formData.email.trim(),
      phone: phoneClean,
      companyName: formData.companyName.trim() || undefined,
      pickupLocation: formData.pickupLocation.trim(),
      dropLocation: formData.dropLocation.trim() || undefined,
      pickupDateTime,
      tripType: tripTypeFormatted,
      category: vehicle.categoryName,
      categoryName: vehicle.categoryName,
      vehicleClass: vehicle.vehicleClass,
      model: `${vehicle.make} ${vehicle.model}`,
      modelName: `${vehicle.make} ${vehicle.model}`,
      passengers: parseInt(formData.passengers, 10) || 1,
      estimatedFare,
      notes: formData.specialNotes.trim() || `Booked via Fleet Showcase for ${vehicle.make} ${vehicle.model}`,
      status: "NEW",
      createdAt: new Date().toISOString()
    };

    // 1. Save to local storage CRM leads for instant admin visibility
    try {
      const storedCRM = localStorage.getItem("user_uploaded_crm_leads");
      const list = storedCRM ? JSON.parse(storedCRM) : [];
      list.unshift(leadPayload);
      localStorage.setItem("user_uploaded_crm_leads", JSON.stringify(list));
    } catch (e) {
      console.error(e);
    }

    // 2. Transmit to rental lead API
    try {
      await fetch("/api/rental/lead", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(leadPayload)
      });
    } catch (err) {
      console.error("API booking dispatch error:", err);
    }

    setLoading(false);
    setConfirmation({
      bookingRef,
      customerName: nameClean,
      phone: phoneClean,
      vehicle: `${vehicle.make} ${vehicle.model}`,
      category: vehicle.categoryName,
      vehicleClass: vehicle.vehicleClass,
      tripType: tripTypeFormatted,
      pickupLocation: formData.pickupLocation,
      dropLocation: formData.dropLocation || (tripType === "local" ? "City Local Usage" : "As per route"),
      pickupDate: formData.pickupDate,
      pickupTime: pickupTimeStr,
      estimatedFare
    });

    if (onSuccess) onSuccess(bookingRef);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md">
      <div className="bg-slate-900 border border-amber-500/40 rounded-3xl p-5 sm:p-8 w-full max-w-3xl shadow-2xl space-y-6 relative text-slate-100 max-h-[92vh] overflow-y-auto">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-slate-400 hover:text-white cursor-pointer z-20 bg-slate-950 p-2 rounded-full border border-white/10 hover:border-amber-400 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {confirmation ? (
          /* ================= Booking Success Ticket ================= */
          <div className="space-y-6 text-center py-4">
            <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center mx-auto">
              <Check className="w-8 h-8" />
            </div>

            <div className="space-y-1">
              <span className="text-[10px] font-bold uppercase text-emerald-400 tracking-wider">
                Booking Request Ingested
              </span>
              <h3 className="text-2xl sm:text-3xl font-black text-slate-50">
                Vehicle Booking Confirmed!
              </h3>
              <p className="text-xs text-slate-400 max-w-md mx-auto">
                Thank you, <strong className="text-slate-200">{confirmation.customerName}</strong>! Our 24/7 Operations Desk has received your request for the <strong>{confirmation.vehicle}</strong>.
              </p>
            </div>

            {/* Official Booking PNR Ticket Banner */}
            <div className="bg-slate-950 p-5 rounded-2xl border border-amber-500/30 space-y-4 text-left shadow-xl">
              <div className="flex justify-between items-center border-b border-white/10 pb-3">
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Official Booking PNR</span>
                  <span className="text-2xl font-black font-mono text-amber-400">{confirmation.bookingRef}</span>
                </div>
                <div className="text-right">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Estimated Tariff</span>
                  <span className="text-xl font-black font-mono text-emerald-400">₹{confirmation.estimatedFare}</span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Selected Vehicle</span>
                  <span className="font-bold text-slate-100 text-sm">{confirmation.vehicle}</span>
                  <div className="text-[11px] text-amber-400">{confirmation.category} &bull; {confirmation.vehicleClass}</div>
                </div>

                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Pickup Schedule</span>
                  <span className="font-bold text-slate-100">{confirmation.pickupDate}</span>
                  <div className="text-[11px] text-slate-300 font-mono">at {confirmation.pickupTime}</div>
                </div>

                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Pickup Address</span>
                  <span className="text-slate-200 font-medium">{confirmation.pickupLocation}</span>
                </div>

                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Destination / Route</span>
                  <span className="text-slate-200 font-medium">{confirmation.dropLocation}</span>
                </div>
              </div>

              <div className="pt-2 border-t border-white/5 flex items-center justify-between text-[11px] text-slate-400">
                <span className="flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                  <span>ISO 9001:2015 Chauffeur & Sanitized Fleet Guaranteed</span>
                </span>
                <span className="font-mono text-slate-400">📞 +91 {confirmation.phone}</span>
              </div>
            </div>

            {/* 1-Click Action Buttons: WhatsApp Share & Done */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <a
                href={`https://wa.me/91${confirmation.phone.replace(/\D/g, "").slice(-10)}?text=${encodeURIComponent(
                  `*TEMP TRAVEL CAR RENTALS - BOOKING REQUEST*\n\nDear ${confirmation.customerName},\nWe have received your booking request.\n\n*PNR Ref:* ${confirmation.bookingRef}\n*Vehicle:* ${confirmation.vehicle} (${confirmation.category} - ${confirmation.vehicleClass})\n*Pickup Date & Time:* ${confirmation.pickupDate} at ${confirmation.pickupTime}\n*Pickup Location:* ${confirmation.pickupLocation}\n*Destination:* ${confirmation.dropLocation}\n*Estimated Tariff:* ₹${confirmation.estimatedFare}\n\nOur reservation team will assign a verified chauffeur shortly. Support: +91-9999999999.`
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white font-black py-3 px-4 rounded-xl text-xs uppercase tracking-wider shadow-lg transition-all"
              >
                <Share2 className="w-4 h-4" />
                <span>Share On WhatsApp</span>
              </a>

              <button
                type="button"
                onClick={onClose}
                className="flex items-center justify-center gap-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black py-3 px-4 rounded-xl text-xs uppercase tracking-wider shadow-lg transition-all cursor-pointer"
              >
                <span>Done & Return to Fleet</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        ) : (
          /* ================= Vehicle Booking Form ================= */
          <>
            {/* Modal Header & Prefilled Vehicle Showcase Banner */}
            <div className="space-y-4 border-b border-white/10 pb-4">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold uppercase text-amber-400 tracking-wider">
                  Vehicle Reservation Desk
                </span>
                <span className="text-[10px] font-mono text-slate-400 bg-slate-950 px-2 py-0.5 rounded border border-white/10 font-bold">
                  {vehicle.registrationNumber || "FLEET-ROSTER"}
                </span>
              </div>

              {/* Prefilled Vehicle Hero Card */}
              <div className="bg-slate-950 p-4 rounded-2xl border border-amber-500/30 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-20 h-14 bg-slate-900 rounded-xl overflow-hidden border border-white/10 shrink-0">
                    <img
                      src={vehicle.imageUrl || "/images/hero-car.png"}
                      alt={`${vehicle.make} ${vehicle.model}`}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLElement).setAttribute("src", "/images/hero-car.png");
                      }}
                    />
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider block">
                      {vehicle.categoryName} &bull; {vehicle.vehicleClass || "Executive"}
                    </span>
                    <h3 className="text-lg font-black text-slate-50">
                      {vehicle.make} {vehicle.model}
                    </h3>
                    <div className="flex items-center gap-3 text-[11px] text-slate-400 font-mono mt-0.5">
                      <span className="flex items-center gap-1">
                        <Users className="w-3 h-3 text-amber-400" /> {vehicle.capacity || 4} Seats
                      </span>
                      <span>&bull;</span>
                      <span className="flex items-center gap-1">
                        <Fuel className="w-3 h-3 text-amber-400" /> {vehicle.fuelType || "Diesel"}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="text-right shrink-0 bg-slate-900/80 px-4 py-2 rounded-xl border border-white/5">
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">Tariff Rate</span>
                  <div className="text-base font-black font-mono text-amber-400">
                    ₹{vehicle.perKmRate || 16}/km &bull; ₹{vehicle.perHourRate || 160}/hr
                  </div>
                  {vehicle.baseDailyRate && (
                    <div className="text-[10px] text-slate-400 font-mono">
                      Daily Base: ₹{vehicle.baseDailyRate}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {error && (
              <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Trip Type Selector Tabs */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  Select Trip Mode
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {[
                    { id: "local", label: "Local Rental", icon: Clock },
                    { id: "outstation", label: "Outstation", icon: Compass },
                    { id: "airport", label: "Airport Transfer", icon: MapPin },
                    { id: "corporate", label: "Corporate", icon: Building2 },
                  ].map((t) => {
                    const Icon = t.icon;
                    const isActive = tripType === t.id;
                    return (
                      <button
                        key={t.id}
                        type="button"
                        onClick={() => setTripType(t.id as TripType)}
                        className={`py-2 px-3 rounded-xl text-xs font-bold transition-all border flex items-center justify-center gap-1.5 cursor-pointer ${
                          isActive
                            ? "bg-amber-500 text-slate-950 border-amber-400 font-black shadow-lg shadow-amber-500/10"
                            : "bg-slate-950 text-slate-400 border-white/10 hover:text-white"
                        }`}
                      >
                        <Icon className="w-3.5 h-3.5" />
                        <span>{t.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Local Package / Outstation Sub-options */}
              {tripType === "local" && (
                <div className="space-y-1.5 bg-slate-950/60 p-3 rounded-xl border border-white/5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    Select Local Rental Duration Package
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    {LOCAL_PACKAGES.map((pkg) => (
                      <button
                        key={pkg.label}
                        type="button"
                        onClick={() => setLocalPackage(pkg.label)}
                        className={`py-2 px-2.5 rounded-lg text-xs font-bold transition-all border text-center cursor-pointer ${
                          localPackage === pkg.label
                            ? "bg-amber-500/20 text-amber-300 border-amber-500/50 font-black"
                            : "bg-slate-900 text-slate-400 border-white/5 hover:text-slate-200"
                        }`}
                      >
                        {pkg.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {tripType === "outstation" && (
                <div className="space-y-1.5 bg-slate-950/60 p-3 rounded-xl border border-white/5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    Outstation Trip Direction
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { id: "round-trip", label: "Round Trip (Return)" },
                      { id: "one-way", label: "One-Way Drop" },
                    ].map((mode) => (
                      <button
                        key={mode.id}
                        type="button"
                        onClick={() => setOutstationTripMode(mode.id as any)}
                        className={`py-2 px-3 rounded-lg text-xs font-bold transition-all border text-center cursor-pointer ${
                          outstationTripMode === mode.id
                            ? "bg-amber-500/20 text-amber-300 border-amber-500/50 font-black"
                            : "bg-slate-900 text-slate-400 border-white/5 hover:text-slate-200"
                        }`}
                      >
                        {mode.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Route & Schedule Confirmation with Live Location Search */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-300 flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-amber-400" />
                    <span>Pickup Location *</span>
                  </label>
                  <LocationInput
                    value={formData.pickupLocation}
                    onChange={(val) => setFormData(prev => ({ ...prev, pickupLocation: val }))}
                    placeholder="Search pickup location, airport, landmark..."
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-300 flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-amber-400" />
                    <span>Drop Location / Destination {tripType !== "local" && "*"}</span>
                  </label>
                  <LocationInput
                    value={formData.dropLocation}
                    onChange={(val) => setFormData(prev => ({ ...prev, dropLocation: val }))}
                    placeholder={tripType === "local" ? "Optional for local rentals" : "Drop location or destination..."}
                    required={tripType !== "local"}
                  />
                </div>
              </div>

              {/* Date & Time Selectors */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-300 flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-amber-400" />
                    <span>Pickup Date *</span>
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.pickupDate}
                    onChange={(e) => setFormData({ ...formData, pickupDate: e.target.value })}
                    className="w-full bg-slate-950 border border-white/10 rounded-xl p-2.5 text-xs text-slate-100 focus:outline-none focus:border-amber-400 font-mono"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-300 flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-amber-400" />
                    <span>Pickup Time *</span>
                  </label>
                  <div className="grid grid-cols-3 gap-1">
                    <select
                      value={formData.pickupTimeHour}
                      onChange={(e) => setFormData({ ...formData, pickupTimeHour: e.target.value })}
                      className="bg-slate-950 border border-white/10 rounded-xl p-2.5 text-xs text-slate-100 font-mono focus:outline-none focus:border-amber-400"
                    >
                      {Array.from({ length: 12 }, (_, i) => (i + 1).toString().padStart(2, "0")).map(h => (
                        <option key={h} value={h}>{h}</option>
                      ))}
                    </select>
                    <select
                      value={formData.pickupTimeMinute}
                      onChange={(e) => setFormData({ ...formData, pickupTimeMinute: e.target.value })}
                      className="bg-slate-950 border border-white/10 rounded-xl p-2.5 text-xs text-slate-100 font-mono focus:outline-none focus:border-amber-400"
                    >
                      {["00", "15", "30", "45"].map(m => (
                        <option key={m} value={m}>{m}</option>
                      ))}
                    </select>
                    <select
                      value={formData.pickupTimeAmPm}
                      onChange={(e) => setFormData({ ...formData, pickupTimeAmPm: e.target.value })}
                      className="bg-slate-950 border border-white/10 rounded-xl p-2.5 text-xs text-slate-100 font-bold focus:outline-none focus:border-amber-400"
                    >
                      <option value="AM">AM</option>
                      <option value="PM">PM</option>
                    </select>
                  </div>
                </div>

                {tripType === "outstation" && outstationTripMode === "round-trip" ? (
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-300 flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-amber-400" />
                      <span>Return Date *</span>
                    </label>
                    <input
                      type="date"
                      required
                      value={formData.returnDate}
                      onChange={(e) => setFormData({ ...formData, returnDate: e.target.value })}
                      className="w-full bg-slate-950 border border-white/10 rounded-xl p-2.5 text-xs text-slate-100 focus:outline-none focus:border-amber-400 font-mono"
                    />
                  </div>
                ) : (
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-300 flex items-center gap-1">
                      <Users className="w-3.5 h-3.5 text-amber-400" />
                      <span>Passengers Count</span>
                    </label>
                    <select
                      value={formData.passengers}
                      onChange={(e) => setFormData({ ...formData, passengers: e.target.value })}
                      className="w-full bg-slate-950 border border-white/10 rounded-xl p-2.5 text-xs text-slate-100 focus:outline-none focus:border-amber-400 font-mono"
                    >
                      {Array.from({ length: vehicle.capacity || 4 }, (_, i) => i + 1).map(num => (
                        <option key={num} value={num.toString()}>
                          {num} Passenger{num > 1 ? "s" : ""}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </div>

              {/* Passenger Contact Information */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2 border-t border-white/5">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-300 flex items-center gap-1">
                    <User className="w-3.5 h-3.5 text-amber-400" />
                    <span>Full Name *</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Rajesh Sharma"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full bg-slate-950 border border-white/10 rounded-xl p-2.5 text-xs text-slate-100 focus:outline-none focus:border-amber-400"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-300 flex items-center gap-1">
                    <Phone className="w-3.5 h-3.5 text-amber-400" />
                    <span>Mobile Number *</span>
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="10-digit mobile (e.g. 9820112233)"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full bg-slate-950 border border-white/10 rounded-xl p-2.5 text-xs text-slate-100 focus:outline-none focus:border-amber-400 font-mono"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-300 flex items-center gap-1">
                    <Mail className="w-3.5 h-3.5 text-amber-400" />
                    <span>Email Address *</span>
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="email@example.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full bg-slate-950 border border-white/10 rounded-xl p-2.5 text-xs text-slate-100 focus:outline-none focus:border-amber-400"
                  />
                </div>
              </div>

              {tripType === "corporate" && (
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-300 flex items-center gap-1">
                    <Building2 className="w-3.5 h-3.5 text-amber-400" />
                    <span>Company / Corporate Entity Name</span>
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Tata Consultancy Services, HDFC Bank, etc."
                    value={formData.companyName}
                    onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                    className="w-full bg-slate-950 border border-white/10 rounded-xl p-2.5 text-xs text-slate-100 focus:outline-none focus:border-amber-400"
                  />
                </div>
              )}

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300">Special Instructions / Flight Details</label>
                <textarea
                  rows={2}
                  value={formData.specialNotes}
                  onChange={(e) => setFormData({ ...formData, specialNotes: e.target.value })}
                  placeholder="e.g. Flight arrival at Pillar 4, child seat needed, extra luggage space, etc."
                  className="w-full bg-slate-950 border border-white/10 rounded-xl p-2.5 text-xs text-slate-100 focus:outline-none focus:border-amber-400 resize-none"
                />
              </div>

              {/* Tariff Estimation Summary & Submission */}
              <div className="bg-slate-950 p-4 rounded-2xl border border-amber-500/20 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">Estimated Base Tariff</span>
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl font-black font-mono text-emerald-400">₹{estimatedFare}</span>
                    <span className="text-[10px] text-slate-400">+ Tolls & GST as applicable</span>
                  </div>
                </div>

                <div className="flex items-center gap-3 w-full sm:w-auto">
                  <button
                    type="button"
                    onClick={onClose}
                    className="flex-1 sm:flex-none px-4 py-3 bg-slate-900 hover:bg-slate-800 border border-white/10 text-slate-300 font-bold rounded-xl text-xs uppercase tracking-wider transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black px-6 py-3 rounded-xl text-xs uppercase tracking-wider shadow-lg shadow-amber-500/20 transition-all cursor-pointer disabled:opacity-50"
                  >
                    {loading ? (
                      <span>Processing Reservation...</span>
                    ) : (
                      <>
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Confirm Vehicle Booking</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
