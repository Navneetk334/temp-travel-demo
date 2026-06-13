"use client";

import React, { useState } from "react";
import { Building2, User, Mail, Phone, Users, MapPin, Layers, Send, CheckCircle2 } from "lucide-react";

export default function CorporateInquiryPage() {
  const [formData, setFormData] = useState({
    companyName: "",
    contactName: "",
    email: "",
    phone: "",
    employeeCount: "",
    pickupLocations: "",
    serviceType: "Employee Transportation Shuttle",
    requirements: "",
  });

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const payload = {
      ...formData,
      employeeCount: formData.employeeCount ? Number(formData.employeeCount) : null,
      pickupLocations: formData.pickupLocations || null,
      requirements: formData.requirements || null,
    };

    try {
      const res = await fetch("/api/corporate/lead", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        setSuccess(true);
        setFormData({
          companyName: "",
          contactName: "",
          email: "",
          phone: "",
          employeeCount: "",
          pickupLocations: "",
          serviceType: "Employee Transportation Shuttle",
          requirements: "",
        });
      } else {
        const data = await res.json();
        setError(data.error?.message || "Failed to submit corporate inquiry. Please check your inputs.");
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
        {/* Intro Head */}
        <div className="text-center space-y-4">
          <span className="text-xs font-bold text-accent uppercase tracking-widest block">Corporate B2B Logistics</span>
          <h1 className="text-4xl sm:text-5xl font-extrabold text-slate-50 tracking-tight leading-tight">
            Corporate Travel & Employee Shuttle Contract Inquiries
          </h1>
          <p className="text-slate-400 max-w-2xl mx-auto text-sm">
            Optimize your daily employee routes and executive transits. Submit your corporate requirements below and our logistic team will design a custom proposal.
          </p>
        </div>

        {success ? (
          <div className="glassmorphism p-8 rounded-2xl border border-green-500/20 text-center space-y-6 max-w-xl mx-auto">
            <CheckCircle2 className="w-16 h-16 text-green-400 mx-auto animate-bounce" />
            <h2 className="text-2xl font-bold text-slate-50">Inquiry Submitted Successfully</h2>
            <p className="text-slate-300 text-sm leading-relaxed">
              Thank you for connecting with TEMP TRAVEL. Our corporate logistics manager has received your submission and will contact you via email or phone within 12 hours with a preliminary routing draft.
            </p>
            <button
              onClick={() => setSuccess(false)}
              className="bg-primary hover:bg-blue-700 text-white font-bold py-2 px-6 rounded-lg text-xs tracking-wider uppercase transition-all"
            >
              Submit Another Request
            </button>
          </div>
        ) : (
          <div className="glassmorphism rounded-2xl border border-white/5 overflow-hidden shadow-2xl p-6 md:p-10 max-w-3xl mx-auto">
            <h2 className="text-xl font-bold text-slate-50 border-b border-white/5 pb-4 mb-6">
              Corporate Requirement Capture Form
            </h2>

            {error && (
              <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-xs py-2 px-4 rounded-lg mb-6">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Row 1: Company & Contact */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Company Name</label>
                  <div className="relative">
                    <Building2 className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                    <input
                      type="text"
                      required
                      placeholder="e.g. Acme Tech Private Ltd"
                      value={formData.companyName}
                      onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                      className="w-full bg-slate-950/60 border border-white/10 rounded-lg py-2.5 pl-10 pr-4 text-sm text-slate-100 focus:outline-none focus:border-primary transition-all"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Contact Person</label>
                  <div className="relative">
                    <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                    <input
                      type="text"
                      required
                      placeholder="e.g. John Doe (HR Manager)"
                      value={formData.contactName}
                      onChange={(e) => setFormData({ ...formData, contactName: e.target.value })}
                      className="w-full bg-slate-950/60 border border-white/10 rounded-lg py-2.5 pl-10 pr-4 text-sm text-slate-100 focus:outline-none focus:border-primary transition-all"
                    />
                  </div>
                </div>
              </div>

              {/* Row 2: Email & Phone */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Work Email Address</label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                    <input
                      type="email"
                      required
                      placeholder="e.g. hr@acmetech.com"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full bg-slate-950/60 border border-white/10 rounded-lg py-2.5 pl-10 pr-4 text-sm text-slate-100 focus:outline-none focus:border-primary transition-all"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Mobile Number</label>
                  <div className="relative">
                    <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                    <input
                      type="tel"
                      required
                      placeholder="e.g. +919999999999"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full bg-slate-950/60 border border-white/10 rounded-lg py-2.5 pl-10 pr-4 text-sm text-slate-100 focus:outline-none focus:border-primary transition-all"
                    />
                  </div>
                </div>
              </div>

              {/* Row 3: Employee Count & Service Type */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Approx Employee Count</label>
                  <div className="relative">
                    <Users className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                    <input
                      type="number"
                      placeholder="e.g. 150"
                      value={formData.employeeCount}
                      onChange={(e) => setFormData({ ...formData, employeeCount: e.target.value })}
                      className="w-full bg-slate-950/60 border border-white/10 rounded-lg py-2.5 pl-10 pr-4 text-sm text-slate-100 focus:outline-none focus:border-primary transition-all"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Select Service Type</label>
                  <div className="relative">
                    <Layers className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                    <select
                      value={formData.serviceType}
                      onChange={(e) => setFormData({ ...formData, serviceType: e.target.value })}
                      className="w-full bg-slate-950/60 border border-white/10 rounded-lg py-2.5 pl-10 pr-4 text-sm text-slate-100 focus:outline-none focus:border-primary transition-all appearance-none"
                    >
                      <option value="Employee Transportation Shuttle" className="bg-slate-900">Employee Transportation Shuttle</option>
                      <option value="Executive Monthly Cabs" className="bg-slate-900">Executive Monthly Cabs</option>
                      <option value="Event Logistics Support" className="bg-slate-900">Event Logistics Support</option>
                      <option value="Airport VIP Transfers" className="bg-slate-900">Airport VIP Transfers</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Pickup locations */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Primary Pickup / Drop Locations</label>
                <div className="relative">
                  <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <input
                    type="text"
                    required
                    placeholder="e.g. Kandivali East, Andheri West, Thane, Vashi"
                    value={formData.pickupLocations}
                    onChange={(e) => setFormData({ ...formData, pickupLocations: e.target.value })}
                    className="w-full bg-slate-950/60 border border-white/10 rounded-lg py-2.5 pl-10 pr-4 text-sm text-slate-100 focus:outline-none focus:border-primary transition-all"
                  />
                </div>
              </div>

              {/* Requirements details */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Custom Requirements / Notes</label>
                <textarea
                  rows={4}
                  placeholder="Detail preferred shift hours (In/Out timings), route distances, or vehicle model expectations (e.g. sedans, travellers)..."
                  value={formData.requirements}
                  onChange={(e) => setFormData({ ...formData, requirements: e.target.value })}
                  className="w-full bg-slate-950/60 border border-white/10 rounded-lg py-2.5 px-4 text-sm text-slate-100 focus:outline-none focus:border-primary transition-all resize-none"
                />
              </div>

              {/* Submit button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 bg-primary hover:bg-blue-700 text-white font-bold py-3.5 rounded-lg tracking-wider uppercase transition-all shadow-lg hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50"
              >
                {loading ? (
                  <span>Submitting Inquiry...</span>
                ) : (
                  <>
                    <span>Send Proposal Request</span>
                    <Send className="w-4.5 h-4.5" />
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
