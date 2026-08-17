"use client";

import React, { useState } from "react";
import { ChevronRight, CheckCircle2, AlertCircle, Loader2, Building2, User, Mail, Phone, Users, MapPin, Clock } from "lucide-react";
import LocationInput from "@/components/shared/location-input";

interface CorporateLeadFormProps {
  cityFormatted: string;
  defaultServiceType: string;
}

function timeToMinutes(hourStr: string, minStr: string, ampm: string): number {
  let hour = parseInt(hourStr, 10);
  const min = parseInt(minStr, 10);
  if (ampm === "PM" && hour !== 12) hour += 12;
  if (ampm === "AM" && hour === 12) hour = 0;
  return hour * 60 + min;
}

function validateName(name: string): boolean {
  return /^[a-zA-Z\s.-]+$/.test(name.trim());
}

function validateEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}

export default function CorporateLeadForm({ cityFormatted, defaultServiceType }: CorporateLeadFormProps) {
  const [formData, setFormData] = useState({
    companyName: "",
    contactName: "",
    email: "",
    phone: "",
    employeeCount: "",
    pickupLocations: "",
    gender: "Male",
    shiftStartHour: "09",
    shiftStartMinute: "00",
    shiftStartAmpm: "AM",
    shiftEndHour: "06",
    shiftEndMinute: "00",
    shiftEndAmpm: "PM",
    requirements: "",
  });

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    // 1. Shift Time Validation
    const startMins = timeToMinutes(formData.shiftStartHour, formData.shiftStartMinute, formData.shiftStartAmpm);
    const endMins = timeToMinutes(formData.shiftEndHour, formData.shiftEndMinute, formData.shiftEndAmpm);
    if (startMins === endMins) {
      setError("Shift End Time cannot be equal to Shift Start Time.");
      setLoading(false);
      return;
    }
    if (startMins > endMins) {
      setError("Shift End Time must be after Shift Start Time.");
      setLoading(false);
      return;
    }

    // 2. Contact Name Validation
    if (!validateName(formData.contactName)) {
      setError("Contact Person Name can only contain alphabetic characters.");
      setLoading(false);
      return;
    }

    // 3. Email Validation
    if (!validateEmail(formData.email)) {
      setError("Please enter a valid work email address.");
      setLoading(false);
      return;
    }

    // 4. Mobile Number Validation
    const digitsPhone = formData.phone.replace(/\D/g, "");
    if (digitsPhone.length !== 10) {
      setError("Mobile number must be exactly 10 digits.");
      setLoading(false);
      return;
    }

    const shiftIn = `${formData.shiftStartHour}:${formData.shiftStartMinute} ${formData.shiftStartAmpm}`;
    const shiftOut = `${formData.shiftEndHour}:${formData.shiftEndMinute} ${formData.shiftEndAmpm}`;
    const formattedReqs = `Gender: ${formData.gender}. Shift Timings: In at ${shiftIn}, Out at ${shiftOut}.${formData.requirements ? ` Notes: ${formData.requirements}` : ""}`;

    const payload = {
      companyName: formData.companyName.trim(),
      contactName: formData.contactName.trim(),
      email: formData.email.trim(),
      phone: `+91${digitsPhone}`,
      employeeCount: formData.employeeCount ? parseInt(formData.employeeCount) : null,
      pickupLocations: formData.pickupLocations.trim() || null,
      serviceType: defaultServiceType,
      requirements: formattedReqs,
    };

    try {
      const response = await fetch("/api/corporate/lead", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        if (data.error && typeof data.error === "object") {
          const fieldErrors = Object.values(data.error).flat().join(", ");
          throw new Error(fieldErrors || "Failed to submit inquiry.");
        }
        throw new Error(data.error || "Failed to submit inquiry.");
      }

      setSuccess(true);
      setFormData({
        companyName: "",
        contactName: "",
        email: "",
        phone: "",
        employeeCount: "",
        pickupLocations: "",
        gender: "Male",
        shiftStartHour: "09",
        shiftStartMinute: "00",
        shiftStartAmpm: "AM",
        shiftEndHour: "06",
        shiftEndMinute: "00",
        shiftEndAmpm: "PM",
        requirements: "",
      });
    } catch (err: any) {
      setError(err.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="bg-slate-900/40 border border-emerald-500/30 rounded-2xl p-8 text-center space-y-4 glassmorphism flex flex-col items-center justify-center min-h-[350px]">
        <div className="bg-emerald-500/10 p-4 rounded-full text-emerald-400 border border-emerald-500/20">
          <CheckCircle2 className="w-12 h-12" />
        </div>
        <h3 className="text-xl font-bold text-slate-50">Corporate Inquiry Received!</h3>
        <p className="text-sm text-slate-300 max-w-md mx-auto">
          Thank you for reaching out. Our team will review availability and contact you within <strong>24 Hours</strong>.
        </p>
        <button
          onClick={() => setSuccess(false)}
          className="mt-2 text-xs font-semibold text-accent hover:underline"
        >
          Submit another request
        </button>
      </div>
    );
  }

  return (
    <div className="bg-slate-900/40 border border-white/5 rounded-2xl p-6 md:p-8 space-y-6 glassmorphism">
      <h3 className="text-xl font-bold text-slate-50">Local B2B Inquiry Form ({cityFormatted})</h3>
      
      {error && (
        <div className="bg-rose-500/10 border border-rose-500/30 rounded-lg p-4 flex gap-3 text-xs text-rose-300 items-start">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <form className="space-y-4" onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Company Name *</label>
            <input
              type="text"
              required
              value={formData.companyName}
              onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
              placeholder="e.g. Google India"
              className="w-full bg-slate-950/50 border border-white/10 rounded-lg py-2 px-4 text-sm text-slate-100 focus:outline-none focus:border-primary transition-all"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Employee Count (Optional)</label>
            <input
              type="number"
              min="1"
              value={formData.employeeCount}
              onChange={(e) => setFormData({ ...formData, employeeCount: e.target.value })}
              placeholder="e.g. 150"
              className="w-full bg-slate-950/50 border border-white/10 rounded-lg py-2 px-4 text-sm text-slate-100 focus:outline-none focus:border-primary transition-all"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Passenger Gender *</label>
            <select
              value={formData.gender}
              onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
              className="w-full bg-slate-950/50 border border-white/10 rounded-lg py-2 px-4 text-sm text-slate-100 focus:outline-none focus:border-primary transition-all appearance-none"
            >
              <option value="Male" className="bg-slate-900">Male</option>
              <option value="Female" className="bg-slate-900">Female</option>
              <option value="Other" className="bg-slate-900">Other</option>
            </select>
          </div>
        </div>

        {/* Shift Timings */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-accent" />
              <span>Shift Start Time (Shift In) *</span>
            </label>
            <div className="grid grid-cols-3 gap-2">
              <select
                value={formData.shiftStartHour}
                onChange={(e) => setFormData({ ...formData, shiftStartHour: e.target.value })}
                className="bg-slate-950/50 border border-white/10 rounded-lg py-2 px-2 text-xs text-slate-100 focus:outline-none focus:border-primary text-center font-mono"
              >
                {["01", "02", "03", "04", "05", "06", "07", "08", "09", "10", "11", "12"].map((h) => (
                  <option key={h} value={h} className="bg-slate-900">{h}</option>
                ))}
              </select>

              <select
                value={formData.shiftStartMinute}
                onChange={(e) => setFormData({ ...formData, shiftStartMinute: e.target.value })}
                className="bg-slate-950/50 border border-white/10 rounded-lg py-2 px-2 text-xs text-slate-100 focus:outline-none focus:border-primary text-center font-mono"
              >
                {["00", "15", "30", "45"].map((m) => (
                  <option key={m} value={m} className="bg-slate-900">{m}</option>
                ))}
              </select>

              <select
                value={formData.shiftStartAmpm}
                onChange={(e) => setFormData({ ...formData, shiftStartAmpm: e.target.value })}
                className="bg-slate-950/50 border border-white/10 rounded-lg py-2 px-2 text-xs text-slate-100 focus:outline-none focus:border-primary text-center font-bold"
              >
                <option value="AM" className="bg-slate-900">AM</option>
                <option value="PM" className="bg-slate-900">PM</option>
              </select>
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-accent" />
              <span>Shift End Time (Shift Out) *</span>
            </label>
            <div className="grid grid-cols-3 gap-2">
              <select
                value={formData.shiftEndHour}
                onChange={(e) => setFormData({ ...formData, shiftEndHour: e.target.value })}
                className="bg-slate-950/50 border border-white/10 rounded-lg py-2 px-2 text-xs text-slate-100 focus:outline-none focus:border-primary text-center font-mono"
              >
                {["01", "02", "03", "04", "05", "06", "07", "08", "09", "10", "11", "12"].map((h) => (
                  <option key={h} value={h} className="bg-slate-900">{h}</option>
                ))}
              </select>

              <select
                value={formData.shiftEndMinute}
                onChange={(e) => setFormData({ ...formData, shiftEndMinute: e.target.value })}
                className="bg-slate-950/50 border border-white/10 rounded-lg py-2 px-2 text-xs text-slate-100 focus:outline-none focus:border-primary text-center font-mono"
              >
                {["00", "15", "30", "45"].map((m) => (
                  <option key={m} value={m} className="bg-slate-900">{m}</option>
                ))}
              </select>

              <select
                value={formData.shiftEndAmpm}
                onChange={(e) => setFormData({ ...formData, shiftEndAmpm: e.target.value })}
                className="bg-slate-950/50 border border-white/10 rounded-lg py-2 px-2 text-xs text-slate-100 focus:outline-none focus:border-primary text-center font-bold"
              >
                <option value="AM" className="bg-slate-900">AM</option>
                <option value="PM" className="bg-slate-900">PM</option>
              </select>
            </div>
          </div>
        </div>

        {/* Location & Contact Info */}
        <div className="space-y-1">
          <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Pickup Address / Area *</label>
          <LocationInput
            placeholder="Search pickup location (e.g. Goldy Footwear Corner, Airport, BKC)"
            value={formData.pickupLocations}
            onChange={(val) => setFormData({ ...formData, pickupLocations: val })}
            required
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Contact Person Name *</label>
            <input
              type="text"
              required
              value={formData.contactName}
              onChange={(e) => setFormData({ ...formData, contactName: e.target.value.replace(/[^a-zA-Z\s.-]/g, "") })}
              placeholder="e.g. Amit Sharma"
              className="w-full bg-slate-950/50 border border-white/10 rounded-lg py-2 px-4 text-sm text-slate-100 focus:outline-none focus:border-primary transition-all"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Corporate Email *</label>
            <input
              type="email"
              required
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="amit@company.com"
              className="w-full bg-slate-950/50 border border-white/10 rounded-lg py-2 px-4 text-sm text-slate-100 focus:outline-none focus:border-primary transition-all"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Mobile Number (10 digits) *</label>
            <input
              type="tel"
              required
              maxLength={10}
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value.replace(/\D/g, "").slice(0, 10) })}
              placeholder="e.g. 9999999999"
              className="w-full bg-slate-950/50 border border-white/10 rounded-lg py-2 px-4 text-sm text-slate-100 focus:outline-none focus:border-primary transition-all font-mono"
            />
          </div>
        </div>

        <div className="space-y-1">
          <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Roster Requirements / Notes (Optional)</label>
          <textarea
            rows={3}
            value={formData.requirements}
            onChange={(e) => setFormData({ ...formData, requirements: e.target.value })}
            placeholder={`Describe your specific corporate shift times or vehicle preferences in ${cityFormatted}...`}
            className="w-full bg-slate-950/50 border border-white/10 rounded-lg py-2.5 px-4 text-sm text-slate-100 focus:outline-none focus:border-primary transition-all resize-none"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full flex items-center justify-center gap-2 bg-primary hover:bg-blue-700 disabled:bg-primary/50 text-white font-bold py-3 rounded-lg shadow-lg tracking-wider transition-all"
        >
          {loading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>Submitting Proposal...</span>
            </>
          ) : (
            <>
              <span>Submit Corporate Request</span>
              <ChevronRight className="w-5 h-5" />
            </>
          )}
        </button>
      </form>
    </div>
  );
}
