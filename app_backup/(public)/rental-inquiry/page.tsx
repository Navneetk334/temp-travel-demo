"use client";

import React, { useState, useEffect } from "react";
import { User, Mail, Phone, MapPin, Calendar, Clock, Car, Compass, Send, CheckCircle2 } from "lucide-react";

interface Category {
  id: string;
  name: string;
}

export default function RentalInquiryPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [formData, setFormData] = useState({
    customerName: "",
    email: "",
    phone: "",
    pickupLocation: "",
    dropLocation: "",
    pickupDate: "",
    pickupTime: "",
    returnDateTime: "",
    vehicleCategoryId: "",
    tripType: "Local Hourly Rental",
  });

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadCategories() {
      try {
        const res = await fetch("/api/fleet/categories");
        if (res.ok) {
          const data = await res.json();
          setCategories(data);
          if (data.length > 0) {
            setFormData(prev => ({ ...prev, vehicleCategoryId: data[0].id }));
          }
        }
      } catch (err) {
        console.error("Failed to load vehicle categories", err);
      }
    }
    loadCategories();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    // Combine Date and Time
    const pickupDateTime = new Date(`${formData.pickupDate}T${formData.pickupTime}`).toISOString();

    const payload = {
      customerName: formData.customerName,
      email: formData.email,
      phone: formData.phone,
      pickupLocation: formData.pickupLocation,
      dropLocation: formData.dropLocation || null,
      pickupDateTime,
      returnDateTime: formData.returnDateTime ? new Date(formData.returnDateTime).toISOString() : null,
      vehicleCategoryId: formData.vehicleCategoryId,
      tripType: formData.tripType,
    };

    try {
      const res = await fetch("/api/rental/lead", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        setSuccess(true);
        setFormData(prev => ({
          ...prev,
          customerName: "",
          email: "",
          phone: "",
          pickupLocation: "",
          dropLocation: "",
          pickupDate: "",
          pickupTime: "",
          returnDateTime: "",
        }));
      } else {
        const data = await res.json();
        setError(data.error?.message || "Failed to submit inquiry. Please check your inputs.");
      }
    } catch (err) {
      console.error(err);
      setError("An unexpected network error occurred.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-slate-950 min-h-screen text-slate-100 py-16 px-4 sm:px-6 lg:px-8 flex flex-col justify-center">
      <div className="max-w-4xl mx-auto w-full space-y-12">
        {/* Intro */}
        <div className="text-center space-y-4">
          <span className="text-xs font-bold text-accent uppercase tracking-widest block">B2C Vehicle Booking</span>
          <h1 className="text-4xl sm:text-5xl font-extrabold text-slate-50 tracking-tight leading-tight">
            Book Premium Cabs & Rentals
          </h1>
          <p className="text-slate-400 max-w-2xl mx-auto text-sm">
            Airport transits, local city rides, or custom outstation packages. Complete your route inquiries below for instant dispatch verification.
          </p>
        </div>

        {success ? (
          <div className="glassmorphism p-8 rounded-2xl border border-green-500/20 text-center space-y-6 max-w-xl mx-auto">
            <CheckCircle2 className="w-16 h-16 text-green-400 mx-auto animate-bounce" />
            <h2 className="text-2xl font-bold text-slate-50">Inquiry Received</h2>
            <p className="text-slate-300 text-sm leading-relaxed">
              Thank you for choosing TEMP TRAVEL. Our dispatch operator will review vehicle availability and email/call you with a verified quote and booking reference details within 15 minutes.
            </p>
            <button
              onClick={() => setSuccess(false)}
              className="bg-primary hover:bg-blue-700 text-white font-bold py-2 px-6 rounded-lg text-xs tracking-wider uppercase transition-all"
            >
              Submit Another Inquiry
            </button>
          </div>
        ) : (
          <div className="glassmorphism rounded-2xl border border-white/5 overflow-hidden shadow-2xl p-6 md:p-10 max-w-3xl mx-auto">
            <h2 className="text-xl font-bold text-slate-50 border-b border-white/5 pb-4 mb-6 flex items-center gap-2">
              <Car className="w-5 h-5 text-accent" />
              <span>Cab Rental Inquiry Form</span>
            </h2>

            {error && (
              <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-xs py-2 px-4 rounded-lg mb-6">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Contact Information */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Your Name</label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                    <input
                      type="text"
                      required
                      placeholder="John Doe"
                      value={formData.customerName}
                      onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
                      className="w-full bg-slate-950/60 border border-white/10 rounded-lg py-2 pl-9 pr-4 text-xs text-slate-100 focus:outline-none focus:border-primary"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Email Address</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                    <input
                      type="email"
                      required
                      placeholder="john@example.com"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full bg-slate-950/60 border border-white/10 rounded-lg py-2 pl-9 pr-4 text-xs text-slate-100 focus:outline-none focus:border-primary"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Mobile Number</label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                    <input
                      type="tel"
                      required
                      placeholder="+919999999999"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full bg-slate-950/60 border border-white/10 rounded-lg py-2 pl-9 pr-4 text-xs text-slate-100 focus:outline-none focus:border-primary"
                    />
                  </div>
                </div>
              </div>

              {/* Trip Types & Vehicle Category Selection */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Trip Type</label>
                  <div className="relative">
                    <Compass className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                    <select
                      value={formData.tripType}
                      onChange={(e) => setFormData({ ...formData, tripType: e.target.value })}
                      className="w-full bg-slate-950/60 border border-white/10 rounded-lg py-2 pl-9 pr-4 text-xs text-slate-100 focus:outline-none focus:border-primary appearance-none"
                    >
                      <option value="Local Hourly Rental" className="bg-slate-900">Local Hourly Rental</option>
                      <option value="Outstation One-Way" className="bg-slate-900">Outstation One-Way</option>
                      <option value="Outstation Round-Trip" className="bg-slate-900">Outstation Round-Trip</option>
                      <option value="Airport Transfer Drop/Pickup" className="bg-slate-900">Airport Transfer Drop/Pickup</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Vehicle Type Preferred</label>
                  <div className="relative">
                    <Car className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                    <select
                      value={formData.vehicleCategoryId}
                      onChange={(e) => setFormData({ ...formData, vehicleCategoryId: e.target.value })}
                      className="w-full bg-slate-950/60 border border-white/10 rounded-lg py-2 pl-9 pr-4 text-xs text-slate-100 focus:outline-none focus:border-primary appearance-none"
                    >
                      {categories.map((c) => (
                        <option key={c.id} value={c.id} className="bg-slate-900">{c.name}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Route specifications */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Pickup Location</label>
                  <div className="relative">
                    <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                    <input
                      type="text"
                      required
                      placeholder="Pickup address or Airport Terminal"
                      value={formData.pickupLocation}
                      onChange={(e) => setFormData({ ...formData, pickupLocation: e.target.value })}
                      className="w-full bg-slate-950/60 border border-white/10 rounded-lg py-2.5 pl-10 pr-4 text-xs text-slate-100 focus:outline-none focus:border-primary"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Drop Location (If applicable)</label>
                  <div className="relative">
                    <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                    <input
                      type="text"
                      placeholder="Drop address or destination city"
                      value={formData.dropLocation}
                      onChange={(e) => setFormData({ ...formData, dropLocation: e.target.value })}
                      className="w-full bg-slate-950/60 border border-white/10 rounded-lg py-2.5 pl-10 pr-4 text-xs text-slate-100 focus:outline-none focus:border-primary"
                    />
                  </div>
                </div>
              </div>

              {/* Pickup timing */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Pickup Date</label>
                  <div className="relative">
                    <Calendar className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                    <input
                      type="date"
                      required
                      value={formData.pickupDate}
                      onChange={(e) => setFormData({ ...formData, pickupDate: e.target.value })}
                      className="w-full bg-slate-950/60 border border-white/10 rounded-lg py-2.5 pl-10 pr-4 text-xs text-slate-100 focus:outline-none focus:border-primary"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Pickup Time</label>
                  <div className="relative">
                    <Clock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                    <input
                      type="time"
                      required
                      value={formData.pickupTime}
                      onChange={(e) => setFormData({ ...formData, pickupTime: e.target.value })}
                      className="w-full bg-slate-950/60 border border-white/10 rounded-lg py-2.5 pl-10 pr-4 text-xs text-slate-100 focus:outline-none focus:border-primary"
                    />
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 bg-primary hover:bg-blue-700 text-white font-bold py-3 rounded-lg tracking-wider uppercase transition-all shadow-lg hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50 text-xs"
              >
                {loading ? (
                  <span>Submitting Inquiry...</span>
                ) : (
                  <>
                    <span>Submit Cab Inquiry</span>
                    <Send className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
