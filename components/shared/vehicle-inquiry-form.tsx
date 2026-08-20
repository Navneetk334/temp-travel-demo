"use client";

import React, { useState } from "react";
import { User, Mail, Phone, Calendar, Clock, ArrowRight, CheckCircle2, AlertCircle, ShieldCheck } from "lucide-react";
import LocationInput from "./location-input";

interface VehicleInquiryFormProps {
  vehicleId: string;
  vehicleName: string;
  categoryId: string;
  categoryName: string;
}

export default function VehicleInquiryForm({
  vehicleId,
  vehicleName,
  categoryId,
  categoryName,
}: VehicleInquiryFormProps) {
  const [formData, setFormData] = useState({
    customerName: "",
    email: "",
    phone: "",
    pickupLocation: "",
    dropLocation: "",
    pickupDate: "",
    pickupTime: "",
  });

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validation
    const nameClean = formData.customerName.trim();
    if (!nameClean) {
      setError("Please enter your full name.");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email.trim())) {
      setError("Please enter a valid email address.");
      return;
    }

    const phoneClean = formData.phone.replace(/\D/g, "");
    if (phoneClean.length !== 10 || !/^[6-9]/.test(phoneClean)) {
      setError("Please enter a valid 10-digit Indian mobile number starting with 6, 7, 8, or 9.");
      return;
    }

    if (!formData.pickupLocation.trim()) {
      setError("Please enter a pickup location.");
      return;
    }

    if (!formData.pickupDate || !formData.pickupTime) {
      setError("Please select both pickup date and pickup time.");
      return;
    }

    setLoading(true);

    try {
      const pickupDateTime = new Date(`${formData.pickupDate}T${formData.pickupTime}`).toISOString();

      const payload = {
        customerName: nameClean,
        email: formData.email.trim(),
        phone: phoneClean,
        pickupLocation: formData.pickupLocation.trim(),
        dropLocation: formData.dropLocation.trim() || null,
        pickupDateTime,
        vehicleCategoryId: categoryId,
        tripType: `Direct Inquiry: ${vehicleName} (${categoryName})`,
        notes: `Direct inquiry requested for vehicle: ${vehicleName} (ID: ${vehicleId})`,
      };

      const res = await fetch("/api/rental/lead", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error?.message || data.error || "Failed to submit inquiry. Please try again.");
      }

      setSuccess(true);
      setFormData({
        customerName: "",
        email: "",
        phone: "",
        pickupLocation: "",
        dropLocation: "",
        pickupDate: "",
        pickupTime: "",
      });
    } catch (err: any) {
      console.error("Vehicle inquiry error:", err);
      setError(err.message || "An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-slate-900 border border-white/5 p-6 rounded-2xl space-y-6 sticky top-24 glassmorphism">
      <div className="space-y-1">
        <h3 className="text-xl font-bold text-slate-50">Inquire Cab Booking</h3>
        <p className="text-xs text-slate-400">Request pricing details and availability for {vehicleName}.</p>
      </div>

      {error && (
        <div className="bg-rose-500/10 border border-rose-500/30 rounded-lg p-3 flex gap-2.5 text-xs text-rose-300 items-start">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {success ? (
        <div className="bg-slate-950/80 p-6 rounded-xl border border-emerald-500/30 text-center space-y-3 flex flex-col items-center justify-center">
          <div className="bg-emerald-500/10 p-3 rounded-full text-emerald-400 border border-emerald-500/20">
            <CheckCircle2 className="w-10 h-10 animate-bounce" />
          </div>
          <h4 className="text-base font-bold text-slate-50">Quote Request Submitted!</h4>
          <p className="text-xs text-slate-300 leading-relaxed">
            Your inquiry for <strong className="text-amber-400">{vehicleName}</strong> has been logged. Our dispatch desk will contact you within 15 minutes.
          </p>
          <button
            type="button"
            onClick={() => setSuccess(false)}
            className="mt-2 bg-accent hover:bg-amber-600 text-slate-950 font-bold py-2 px-5 rounded-lg text-xs tracking-wider uppercase transition-all"
          >
            Submit Another Request
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Customer Name */}
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Your Full Name *</label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
              <input
                type="text"
                required
                placeholder="e.g. Amit Sharma"
                value={formData.customerName}
                onChange={(e) => setFormData({ ...formData, customerName: e.target.value.replace(/[^a-zA-Z\s.-]/g, "") })}
                className="w-full bg-slate-950/60 border border-white/10 rounded-lg py-2.5 pl-9 pr-3 text-xs text-slate-100 focus:outline-none focus:border-primary transition-all"
              />
            </div>
          </div>

          {/* Email Address */}
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Email Address *</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
              <input
                type="email"
                required
                placeholder="e.g. john@example.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full bg-slate-950/60 border border-white/10 rounded-lg py-2.5 pl-9 pr-3 text-xs text-slate-100 focus:outline-none focus:border-primary transition-all"
              />
            </div>
          </div>

          {/* Mobile Phone (10 Digits Max) */}
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Mobile Phone (10 Digits) *</label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
              <input
                type="tel"
                required
                maxLength={10}
                placeholder="e.g. 9999999999"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value.replace(/\D/g, "").slice(0, 10) })}
                className="w-full bg-slate-950/60 border border-white/10 rounded-lg py-2.5 pl-9 pr-3 text-xs text-slate-100 focus:outline-none focus:border-primary transition-all font-mono"
              />
            </div>
          </div>

          {/* Location Autocomplete: Pickup Location */}
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Pickup Location *</label>
            <LocationInput
              required
              placeholder="Enter pickup location (e.g. Delhi Airport)"
              value={formData.pickupLocation}
              onChange={(val) => setFormData({ ...formData, pickupLocation: val })}
            />
          </div>

          {/* Location Autocomplete: Drop Location */}
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Drop Location (Optional)</label>
            <LocationInput
              placeholder="Enter drop location (e.g. Agra)"
              value={formData.dropLocation}
              onChange={(val) => setFormData({ ...formData, dropLocation: val })}
            />
          </div>

          {/* Pickup Date & Pickup Time */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Pickup Date *</label>
              <div 
                onClick={(e) => {
                  const input = e.currentTarget.querySelector('input');
                  if (input) input.showPicker?.();
                }}
                className="relative h-[42px] cursor-pointer"
              >
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white pointer-events-none z-10" />
                <input
                  type="date"
                  required
                  value={formData.pickupDate}
                  onChange={(e) => setFormData({ ...formData, pickupDate: e.target.value })}
                  className="w-full h-full bg-slate-950/60 border border-white/10 rounded-lg py-2 pl-9 pr-2 text-xs text-slate-100 focus:outline-none focus:border-primary transition-all cursor-pointer [color-scheme:dark]"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Pickup Time *</label>
              <div 
                onClick={(e) => {
                  const input = e.currentTarget.querySelector('input');
                  if (input) input.showPicker?.();
                }}
                className="relative h-[42px] cursor-pointer"
              >
                <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white pointer-events-none z-10" />
                <input
                  type="time"
                  required
                  value={formData.pickupTime}
                  onChange={(e) => setFormData({ ...formData, pickupTime: e.target.value })}
                  className="w-full h-full bg-slate-950/60 border border-white/10 rounded-lg py-2 pl-9 pr-2 text-xs text-slate-100 focus:outline-none focus:border-primary transition-all cursor-pointer [color-scheme:dark]"
                />
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-1.5 bg-accent hover:bg-amber-600 text-slate-950 font-bold py-2.5 rounded-lg text-xs tracking-wider uppercase shadow-lg transition-all disabled:opacity-50"
          >
            <span>{loading ? "Submitting Request..." : "Request Rental Quote"}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>
      )}

      <div className="flex gap-2.5 text-[10px] text-slate-400 items-start border-t border-white/5 pt-4">
        <ShieldCheck className="w-4 h-4 text-accent shrink-0" />
        <span>Our dispatch operators will check availability and verify pricing details within 15 minutes of submission.</span>
      </div>
    </div>
  );
}
