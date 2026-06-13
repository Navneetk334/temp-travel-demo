"use client";

import React, { useState } from "react";
import { ArrowRight, Loader2, CheckCircle2, AlertCircle } from "lucide-react";

interface TourInquiryFormProps {
  tourId: string;
}

export default function TourInquiryForm({ tourId }: TourInquiryFormProps) {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    travelDate: "",
    numPassengers: 1,
    details: "",
  });

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "numPassengers" ? parseInt(value) || 1 : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    const payload = {
      ...formData,
      tourPackageId: tourId,
    };

    try {
      const response = await fetch("/api/bookings", {
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
          throw new Error(fieldErrors || "Failed to submit booking inquiry.");
        }
        throw new Error(data.error || "Failed to submit booking inquiry.");
      }

      setSuccess(true);
      setFormData({
        name: "",
        email: "",
        phone: "",
        travelDate: "",
        numPassengers: 1,
        details: "",
      });
    } catch (err: any) {
      setError(err.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="bg-slate-900/40 border border-emerald-500/30 rounded-xl p-6 text-center space-y-4 glassmorphism flex flex-col items-center justify-center min-h-[300px]">
        <div className="bg-emerald-500/10 p-3 rounded-full text-emerald-400 border border-emerald-500/20">
          <CheckCircle2 className="w-10 h-10" />
        </div>
        <h3 className="text-lg font-bold text-slate-50">Booking Requested!</h3>
        <p className="text-xs text-slate-300 max-w-sm mx-auto leading-relaxed">
          Your tour package booking request has been successfully submitted and saved in our dispatch panel. Our tour coordinators will contact you shortly with a confirmed quote.
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
    <div className="space-y-4">
      {error && (
        <div className="bg-rose-500/10 border border-rose-500/30 rounded-lg p-3 flex gap-2 text-xs text-rose-300 items-start">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      <form className="space-y-4" onSubmit={handleSubmit}>
        <div className="space-y-1">
          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Your Name *</label>
          <input
            type="text"
            required
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="John Doe"
            className="w-full bg-slate-950/60 border border-white/10 rounded-lg py-2 px-3.5 text-xs text-slate-100 focus:outline-none focus:border-primary transition-all"
          />
        </div>

        <div className="space-y-1">
          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Email Address *</label>
          <input
            type="email"
            required
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="john@example.com"
            className="w-full bg-slate-950/60 border border-white/10 rounded-lg py-2 px-3.5 text-xs text-slate-100 focus:outline-none focus:border-primary transition-all"
          />
        </div>

        <div className="space-y-1">
          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Phone Number *</label>
          <input
            type="tel"
            required
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            placeholder="+919999999999"
            className="w-full bg-slate-950/60 border border-white/10 rounded-lg py-2 px-3.5 text-xs text-slate-100 focus:outline-none focus:border-primary transition-all"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Date *</label>
            <input
              type="date"
              required
              name="travelDate"
              value={formData.travelDate}
              onChange={handleChange}
              className="w-full bg-slate-950/60 border border-white/10 rounded-lg py-2 px-3.5 text-xs text-slate-100 focus:outline-none focus:border-primary transition-all"
            />
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Passengers *</label>
            <input
              type="number"
              min="1"
              required
              name="numPassengers"
              value={formData.numPassengers}
              onChange={handleChange}
              className="w-full bg-slate-950/60 border border-white/10 rounded-lg py-2 px-3.5 text-xs text-slate-100 focus:outline-none focus:border-primary transition-all"
            />
          </div>
        </div>

        <div className="space-y-1">
          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Comments</label>
          <textarea
            rows={3}
            name="details"
            value={formData.details}
            onChange={handleChange}
            placeholder="Dietary requests, hotel grade choice, etc."
            className="w-full bg-slate-950/60 border border-white/10 rounded-lg py-2 px-3.5 text-xs text-slate-100 focus:outline-none focus:border-primary transition-all resize-none"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full flex items-center justify-center gap-1.5 bg-accent hover:bg-amber-600 disabled:bg-accent/50 text-slate-950 font-bold py-2.5 rounded-lg text-xs tracking-wider uppercase shadow-lg transition-all"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Submitting Request...</span>
            </>
          ) : (
            <>
              <span>Request Booking Quote</span>
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </form>
    </div>
  );
}
