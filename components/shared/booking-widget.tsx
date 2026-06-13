"use client";

import React, { useState, useEffect } from "react";
import { 
  Building2, 
  Clock, 
  MapPin, 
  Calendar, 
  Compass, 
  ArrowRight, 
  Users, 
  ChevronRight,
  CheckCircle2,
  AlertCircle,
  Loader2
} from "lucide-react";

type BookingTab = "corporate" | "local" | "outstation" | "tours";

export default function BookingWidget() {
  const [activeTab, setActiveTab] = useState<BookingTab>("corporate");

  // Dynamic lists from DB
  const [categories, setCategories] = useState<any[]>([]);
  const [tours, setTours] = useState<any[]>([]);

  // State for forms
  const [corpData, setCorpData] = useState({ 
    company: "", 
    contactName: "",
    email: "",
    phone: "",
    employeeId: "", 
    shift: "08:30 AM", 
    pickup: "", 
    drop: "" 
  });

  const [localData, setLocalData] = useState({ 
    name: "",
    email: "",
    phone: "",
    pickupLocation: "",
    vehicleCategoryId: "", 
    duration: "8hr_80km", 
    pickupDate: "", 
    pickupTime: "" 
  });

  const [outstationData, setOutstationData] = useState({ 
    type: "ONE_WAY", 
    name: "",
    email: "",
    phone: "",
    pickup: "", 
    drop: "", 
    date: "", 
    returnDate: "",
    vehicleCategoryId: ""
  });

  const [tourData, setTourData] = useState({ 
    tourPackageId: "", 
    guests: "1", 
    date: "", 
    name: "", 
    email: "", 
    phone: "" 
  });

  // UI status states
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [bookingRef, setBookingRef] = useState<string | null>(null);

  // Fetch dynamic categories and tour packages
  useEffect(() => {
    async function loadData() {
      try {
        const [catsRes, toursRes] = await Promise.all([
          fetch("/api/fleet/categories"),
          fetch("/api/tours")
        ]);
        
        if (catsRes.ok) {
          const catsData = await catsRes.json();
          setCategories(catsData);
          if (catsData.length > 0) {
            setLocalData(prev => ({ ...prev, vehicleCategoryId: catsData[0].id }));
            setOutstationData(prev => ({ ...prev, vehicleCategoryId: catsData[0].id }));
          }
        }

        if (toursRes.ok) {
          const toursData = await toursRes.json();
          setTours(toursData);
          if (toursData.length > 0) {
            setTourData(prev => ({ ...prev, tourPackageId: toursData[0].id }));
          }
        }
      } catch (err) {
        console.error("Failed to load booking widget dependencies:", err);
      }
    }
    loadData();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);
    setBookingRef(null);

    let url = "";
    let payload: any = {};

    try {
      if (activeTab === "corporate") {
        url = "/api/corporate/lead";
        const rawPhone = corpData.phone.trim();
        const formattedPhone = rawPhone.startsWith("+") ? rawPhone : `+91${rawPhone}`;
        
        payload = {
          companyName: corpData.company.trim(),
          contactName: corpData.contactName.trim(),
          email: corpData.email.trim(),
          phone: formattedPhone,
          employeeCount: 1,
          pickupLocations: corpData.pickup.trim(),
          serviceType: `Corporate Cab (Shift: ${corpData.shift})`,
          requirements: `Employee ID: ${corpData.employeeId.trim()}. Drop Address: ${corpData.drop.trim()}`
        };
      } else if (activeTab === "local") {
        url = "/api/rental/lead";
        const rawPhone = localData.phone.trim();
        const formattedPhone = rawPhone.startsWith("+") ? rawPhone : `+91${rawPhone}`;
        
        payload = {
          customerName: localData.name.trim(),
          email: localData.email.trim(),
          phone: formattedPhone,
          pickupLocation: localData.pickupLocation.trim(),
          dropLocation: null,
          pickupDateTime: new Date(`${localData.pickupDate}T${localData.pickupTime}`).toISOString(),
          returnDateTime: null,
          vehicleCategoryId: localData.vehicleCategoryId,
          tripType: `Local Hourly Rental (${localData.duration})`
        };
      } else if (activeTab === "outstation") {
        url = "/api/rental/lead";
        const rawPhone = outstationData.phone.trim();
        const formattedPhone = rawPhone.startsWith("+") ? rawPhone : `+91${rawPhone}`;
        
        payload = {
          customerName: outstationData.name.trim(),
          email: outstationData.email.trim(),
          phone: formattedPhone,
          pickupLocation: outstationData.pickup.trim(),
          dropLocation: outstationData.drop.trim(),
          pickupDateTime: new Date(`${outstationData.date}T06:00:00`).toISOString(),
          returnDateTime: outstationData.type === "ROUND_TRIP" && outstationData.returnDate 
            ? new Date(`${outstationData.returnDate}T23:59:00`).toISOString() 
            : null,
          vehicleCategoryId: outstationData.vehicleCategoryId,
          tripType: `Outstation ${outstationData.type === "ROUND_TRIP" ? "Round Trip" : "One Way"}`
        };
      } else if (activeTab === "tours") {
        url = "/api/bookings";
        const rawPhone = tourData.phone.trim();
        const formattedPhone = rawPhone.startsWith("+") ? rawPhone : `+91${rawPhone}`;
        
        payload = {
          name: tourData.name.trim(),
          email: tourData.email.trim(),
          phone: formattedPhone,
          travelDate: new Date(`${tourData.date}T10:00:00`).toISOString(),
          numPassengers: Number(tourData.guests),
          details: `Booking requested for Tour Package ID: ${tourData.tourPackageId}`,
          tourPackageId: tourData.tourPackageId
        };
      }

      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      const data = await response.json();

      if (!response.ok) {
        if (data.error && typeof data.error === "object") {
          const fieldErrors = Object.values(data.error).flat().join(", ");
          throw new Error(fieldErrors || "Submission failed. Please check inputs.");
        }
        throw new Error(data.error || "Submission failed.");
      }

      setSuccess(true);
      if (data.bookingNumber) {
        setBookingRef(data.bookingNumber);
      }
      
      // Reset forms
      setCorpData({ company: "", contactName: "", email: "", phone: "", employeeId: "", shift: "08:30 AM", pickup: "", drop: "" });
      setLocalData(prev => ({ ...prev, name: "", email: "", phone: "", pickupLocation: "", pickupDate: "", pickupTime: "" }));
      setOutstationData(prev => ({ ...prev, name: "", email: "", phone: "", pickup: "", drop: "", date: "", returnDate: "" }));
      setTourData(prev => ({ ...prev, name: "", email: "", phone: "", date: "", guests: "1" }));

    } catch (err: any) {
      setError(err.message || "An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-5xl mx-auto glassmorphism rounded-2xl shadow-2xl border border-white/10 overflow-hidden text-slate-100">
      {/* Tabs */}
      <div className="grid grid-cols-2 md:grid-cols-4 bg-slate-950/80 border-b border-white/5">
        <button
          onClick={() => { setActiveTab("corporate"); setError(null); setSuccess(false); }}
          className={`flex items-center justify-center gap-2 py-4 px-3 text-sm font-semibold tracking-wide transition-all ${
            activeTab === "corporate"
              ? "bg-primary text-primary-foreground border-b-2 border-accent"
              : "text-slate-400 hover:text-slate-200 hover:bg-white/5"
          }`}
        >
          <Building2 className="w-4 h-4" />
          <span>Corporate Cab</span>
        </button>

        <button
          onClick={() => { setActiveTab("local"); setError(null); setSuccess(false); }}
          className={`flex items-center justify-center gap-2 py-4 px-3 text-sm font-semibold tracking-wide transition-all ${
            activeTab === "local"
              ? "bg-primary text-primary-foreground border-b-2 border-accent"
              : "text-slate-400 hover:text-slate-200 hover:bg-white/5"
          }`}
        >
          <Clock className="w-4 h-4" />
          <span>Local Rentals</span>
        </button>

        <button
          onClick={() => { setActiveTab("outstation"); setError(null); setSuccess(false); }}
          className={`flex items-center justify-center gap-2 py-4 px-3 text-sm font-semibold tracking-wide transition-all ${
            activeTab === "outstation"
              ? "bg-primary text-primary-foreground border-b-2 border-accent"
              : "text-slate-400 hover:text-slate-200 hover:bg-white/5"
          }`}
        >
          <Compass className="w-4 h-4" />
          <span>Outstation</span>
        </button>

        <button
          onClick={() => { setActiveTab("tours"); setError(null); setSuccess(false); }}
          className={`flex items-center justify-center gap-2 py-4 px-3 text-sm font-semibold tracking-wide transition-all ${
            activeTab === "tours"
              ? "bg-primary text-primary-foreground border-b-2 border-accent"
              : "text-slate-400 hover:text-slate-200 hover:bg-white/5"
          }`}
        >
          <Compass className="w-4 h-4" />
          <span>Tour Packages</span>
        </button>
      </div>

      {success ? (
        <div className="bg-slate-900/60 p-8 text-center space-y-4 flex flex-col items-center justify-center min-h-[350px]">
          <div className="bg-emerald-500/10 p-4 rounded-full text-emerald-400 border border-emerald-500/20">
            <CheckCircle2 className="w-12 h-12 animate-pulse" />
          </div>
          <h3 className="text-xl font-bold text-slate-50">Request Submitted Successfully!</h3>
          <p className="text-sm text-slate-300 max-w-md mx-auto leading-relaxed">
            {activeTab === "tours" && bookingRef ? (
              <>Your tour booking request has been logged. Your Booking Reference number is <span className="text-accent font-extrabold font-mono">{bookingRef}</span>. Our coordinators will contact you shortly.</>
            ) : (
              <>Your transit inquiry request has been successfully logged. Our logistics team will review availability and contact you within 15 minutes.</>
            )}
          </p>
          <button
            type="button"
            onClick={() => setSuccess(false)}
            className="bg-accent hover:bg-amber-600 text-slate-950 font-bold py-2.5 px-6 rounded-lg text-xs tracking-wider uppercase transition-all"
          >
            Submit Another Request
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="p-6 md:p-8 space-y-6 bg-slate-900/60">
          {error && (
            <div className="bg-rose-500/10 border border-rose-500/30 rounded-lg p-4 flex gap-3 text-xs text-rose-300 items-start">
              <AlertCircle className="w-5 h-5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Corporate Cab Tab */}
          {activeTab === "corporate" && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Company Name *</label>
                <div className="relative">
                  <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <input
                    type="text"
                    required
                    placeholder="e.g. Google India"
                    value={corpData.company}
                    onChange={(e) => setCorpData({ ...corpData, company: e.target.value })}
                    className="w-full bg-slate-950/50 border border-white/10 rounded-lg py-2.5 pl-10 pr-4 text-sm text-slate-100 focus:outline-none focus:border-primary transition-all"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Shift Timing *</label>
                <div className="relative">
                  <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <select
                    value={corpData.shift}
                    onChange={(e) => setCorpData({ ...corpData, shift: e.target.value })}
                    className="w-full bg-slate-950/50 border border-white/10 rounded-lg py-2.5 pl-10 pr-4 text-sm text-slate-100 focus:outline-none focus:border-primary transition-all appearance-none"
                  >
                    <option value="08:30 AM" className="bg-slate-900">08:30 AM (Shift In)</option>
                    <option value="05:30 PM" className="bg-slate-900">05:30 PM (Shift Out)</option>
                    <option value="10:00 PM" className="bg-slate-900">10:00 PM (Night Shift)</option>
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Employee ID *</label>
                <div className="relative">
                  <Users className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <input
                    type="text"
                    required
                    placeholder="EMP-8973"
                    value={corpData.employeeId}
                    onChange={(e) => setCorpData({ ...corpData, employeeId: e.target.value })}
                    className="w-full bg-slate-950/50 border border-white/10 rounded-lg py-2.5 pl-10 pr-4 text-sm text-slate-100 focus:outline-none focus:border-primary transition-all"
                  />
                </div>
              </div>

              <div className="md:col-span-3 grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Pickup Address *</label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                    <input
                      type="text"
                      required
                      placeholder="Enter pickup location"
                      value={corpData.pickup}
                      onChange={(e) => setCorpData({ ...corpData, pickup: e.target.value })}
                      className="w-full bg-slate-950/50 border border-white/10 rounded-lg py-2.5 pl-10 pr-4 text-sm text-slate-100 focus:outline-none focus:border-primary transition-all"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Drop Address *</label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                    <input
                      type="text"
                      required
                      placeholder="Enter drop location"
                      value={corpData.drop}
                      onChange={(e) => setCorpData({ ...corpData, drop: e.target.value })}
                      className="w-full bg-slate-950/50 border border-white/10 rounded-lg py-2.5 pl-10 pr-4 text-sm text-slate-100 focus:outline-none focus:border-primary transition-all"
                    />
                  </div>
                </div>
              </div>

              {/* Contact Information Row */}
              <div className="md:col-span-3 grid grid-cols-1 md:grid-cols-3 gap-6 pt-2 border-t border-white/5">
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Contact Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Amit Sharma"
                    value={corpData.contactName}
                    onChange={(e) => setCorpData({ ...corpData, contactName: e.target.value })}
                    className="w-full bg-slate-950/50 border border-white/10 rounded-lg py-2.5 px-4 text-sm text-slate-100 focus:outline-none focus:border-primary transition-all"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Work Email *</label>
                  <input
                    type="email"
                    required
                    placeholder="e.g. amit@company.com"
                    value={corpData.email}
                    onChange={(e) => setCorpData({ ...corpData, email: e.target.value })}
                    className="w-full bg-slate-950/50 border border-white/10 rounded-lg py-2.5 px-4 text-sm text-slate-100 focus:outline-none focus:border-primary transition-all"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Mobile Number *</label>
                  <input
                    type="tel"
                    required
                    placeholder="e.g. 9999999999"
                    value={corpData.phone}
                    onChange={(e) => setCorpData({ ...corpData, phone: e.target.value })}
                    className="w-full bg-slate-950/50 border border-white/10 rounded-lg py-2.5 px-4 text-sm text-slate-100 focus:outline-none focus:border-primary transition-all"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Local Rentals Tab */}
          {activeTab === "local" && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Car Category *</label>
                <select
                  value={localData.vehicleCategoryId}
                  onChange={(e) => setLocalData({ ...localData, vehicleCategoryId: e.target.value })}
                  className="w-full bg-slate-950/50 border border-white/10 rounded-lg py-2.5 px-4 text-sm text-slate-100 focus:outline-none focus:border-primary transition-all appearance-none"
                >
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id} className="bg-slate-900">{cat.name}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Rental Package *</label>
                <select
                  value={localData.duration}
                  onChange={(e) => setLocalData({ ...localData, duration: e.target.value })}
                  className="w-full bg-slate-950/50 border border-white/10 rounded-lg py-2.5 px-4 text-sm text-slate-100 focus:outline-none focus:border-primary transition-all appearance-none"
                >
                  <option value="8hr_80km" className="bg-slate-900">8 Hrs / 80 Kms</option>
                  <option value="12hr_120km" className="bg-slate-900">12 Hrs / 120 Kms</option>
                  <option value="4hr_40km" className="bg-slate-900">4 Hrs / 40 Kms</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Pickup Date *</label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <input
                    type="date"
                    required
                    value={localData.pickupDate}
                    onChange={(e) => setLocalData({ ...localData, pickupDate: e.target.value })}
                    className="w-full bg-slate-950/50 border border-white/10 rounded-lg py-2.5 pl-10 pr-4 text-sm text-slate-100 focus:outline-none focus:border-primary transition-all"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Pickup Time *</label>
                <div className="relative">
                  <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <input
                    type="time"
                    required
                    value={localData.pickupTime}
                    onChange={(e) => setLocalData({ ...localData, pickupTime: e.target.value })}
                    className="w-full bg-slate-950/50 border border-white/10 rounded-lg py-2.5 pl-10 pr-4 text-sm text-slate-100 focus:outline-none focus:border-primary transition-all"
                  />
                </div>
              </div>

              {/* Customer Contact & Pickup address row */}
              <div className="md:col-span-4 grid grid-cols-1 md:grid-cols-4 gap-6 pt-2 border-t border-white/5">
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Full Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="John Doe"
                    value={localData.name}
                    onChange={(e) => setLocalData({ ...localData, name: e.target.value })}
                    className="w-full bg-slate-950/50 border border-white/10 rounded-lg py-2.5 px-4 text-sm text-slate-100 focus:outline-none focus:border-primary transition-all"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Email Address *</label>
                  <input
                    type="email"
                    required
                    placeholder="john@example.com"
                    value={localData.email}
                    onChange={(e) => setLocalData({ ...localData, email: e.target.value })}
                    className="w-full bg-slate-950/50 border border-white/10 rounded-lg py-2.5 px-4 text-sm text-slate-100 focus:outline-none focus:border-primary transition-all"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Mobile Number *</label>
                  <input
                    type="tel"
                    required
                    placeholder="e.g. 9999999999"
                    value={localData.phone}
                    onChange={(e) => setLocalData({ ...localData, phone: e.target.value })}
                    className="w-full bg-slate-950/50 border border-white/10 rounded-lg py-2.5 px-4 text-sm text-slate-100 focus:outline-none focus:border-primary transition-all"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Pickup Address *</label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                    <input
                      type="text"
                      required
                      placeholder="Enter pickup address"
                      value={localData.pickupLocation}
                      onChange={(e) => setLocalData({ ...localData, pickupLocation: e.target.value })}
                      className="w-full bg-slate-950/50 border border-white/10 rounded-lg py-2.5 pl-10 pr-4 text-sm text-slate-100 focus:outline-none focus:border-primary transition-all"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Outstation Tab */}
          {activeTab === "outstation" && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Trip Type *</label>
                <div className="flex gap-4 mt-2">
                  <label className="flex items-center gap-2 cursor-pointer text-sm">
                    <input
                      type="radio"
                      name="outstationType"
                      checked={outstationData.type === "ONE_WAY"}
                      onChange={() => setOutstationData({ ...outstationData, type: "ONE_WAY" })}
                      className="accent-accent text-slate-900 border-white/15 bg-slate-950"
                    />
                    <span>One Way</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer text-sm">
                    <input
                      type="radio"
                      name="outstationType"
                      checked={outstationData.type === "ROUND_TRIP"}
                      onChange={() => setOutstationData({ ...outstationData, type: "ROUND_TRIP" })}
                      className="accent-accent text-slate-900 border-white/15 bg-slate-950"
                    />
                    <span>Round Trip</span>
                  </label>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Car Category *</label>
                <select
                  value={outstationData.vehicleCategoryId}
                  onChange={(e) => setOutstationData({ ...outstationData, vehicleCategoryId: e.target.value })}
                  className="w-full bg-slate-950/50 border border-white/10 rounded-lg py-2.5 px-4 text-sm text-slate-100 focus:outline-none focus:border-primary transition-all appearance-none"
                >
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id} className="bg-slate-900">{cat.name}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Outstation Date *</label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <input
                    type="date"
                    required
                    value={outstationData.date}
                    onChange={(e) => setOutstationData({ ...outstationData, date: e.target.value })}
                    className="w-full bg-slate-950/50 border border-white/10 rounded-lg py-2.5 pl-10 pr-4 text-sm text-slate-100 focus:outline-none focus:border-primary transition-all"
                  />
                </div>
              </div>

              {outstationData.type === "ROUND_TRIP" && (
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Return Date *</label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                    <input
                      type="date"
                      required
                      value={outstationData.returnDate}
                      onChange={(e) => setOutstationData({ ...outstationData, returnDate: e.target.value })}
                      className="w-full bg-slate-950/50 border border-white/10 rounded-lg py-2.5 pl-10 pr-4 text-sm text-slate-100 focus:outline-none focus:border-primary transition-all"
                    />
                  </div>
                </div>
              )}

              <div className="md:col-span-3 grid grid-cols-1 md:grid-cols-2 gap-6 pt-2 border-t border-white/5">
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">From City *</label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                    <input
                      type="text"
                      required
                      placeholder="Pickup City (e.g. Mumbai)"
                      value={outstationData.pickup}
                      onChange={(e) => setOutstationData({ ...outstationData, pickup: e.target.value })}
                      className="w-full bg-slate-950/50 border border-white/10 rounded-lg py-2.5 pl-10 pr-4 text-sm text-slate-100 focus:outline-none focus:border-primary transition-all"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">To City *</label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                    <input
                      type="text"
                      required
                      placeholder="Drop City (e.g. Pune)"
                      value={outstationData.drop}
                      onChange={(e) => setOutstationData({ ...outstationData, drop: e.target.value })}
                      className="w-full bg-slate-950/50 border border-white/10 rounded-lg py-2.5 pl-10 pr-4 text-sm text-slate-100 focus:outline-none focus:border-primary transition-all"
                    />
                  </div>
                </div>
              </div>

              {/* Customer Contact Row */}
              <div className="md:col-span-3 grid grid-cols-1 md:grid-cols-3 gap-6 pt-2 border-t border-white/5">
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Full Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="John Doe"
                    value={outstationData.name}
                    onChange={(e) => setOutstationData({ ...outstationData, name: e.target.value })}
                    className="w-full bg-slate-950/50 border border-white/10 rounded-lg py-2.5 px-4 text-sm text-slate-100 focus:outline-none focus:border-primary transition-all"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Email Address *</label>
                  <input
                    type="email"
                    required
                    placeholder="john@example.com"
                    value={outstationData.email}
                    onChange={(e) => setOutstationData({ ...outstationData, email: e.target.value })}
                    className="w-full bg-slate-950/50 border border-white/10 rounded-lg py-2.5 px-4 text-sm text-slate-100 focus:outline-none focus:border-primary transition-all"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Mobile Number *</label>
                  <input
                    type="tel"
                    required
                    placeholder="e.g. 9999999999"
                    value={outstationData.phone}
                    onChange={(e) => setOutstationData({ ...outstationData, phone: e.target.value })}
                    className="w-full bg-slate-950/50 border border-white/10 rounded-lg py-2.5 px-4 text-sm text-slate-100 focus:outline-none focus:border-primary transition-all"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Tour Package Tab */}
          {activeTab === "tours" && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Select Package *</label>
                <select
                  value={tourData.tourPackageId}
                  onChange={(e) => setTourData({ ...tourData, tourPackageId: e.target.value })}
                  className="w-full bg-slate-950/50 border border-white/10 rounded-lg py-2.5 px-4 text-sm text-slate-100 focus:outline-none focus:border-primary transition-all appearance-none"
                >
                  {tours.map((tour) => (
                    <option key={tour.id} value={tour.id} className="bg-slate-900">{tour.title} ({tour.durationDays}D/{tour.durationNights}N)</option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Travel Date *</label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <input
                    type="date"
                    required
                    value={tourData.date}
                    onChange={(e) => setTourData({ ...tourData, date: e.target.value })}
                    className="w-full bg-slate-950/50 border border-white/10 rounded-lg py-2.5 pl-10 pr-4 text-sm text-slate-100 focus:outline-none focus:border-primary transition-all"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Guests / Passengers *</label>
                <input
                  type="number"
                  min="1"
                  required
                  value={tourData.guests}
                  onChange={(e) => setTourData({ ...tourData, guests: e.target.value })}
                  className="w-full bg-slate-950/50 border border-white/10 rounded-lg py-2.5 px-4 text-sm text-slate-100 focus:outline-none focus:border-primary transition-all"
                />
              </div>

              <div className="md:col-span-3 grid grid-cols-1 md:grid-cols-3 gap-6 pt-2 border-t border-white/5">
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Full Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="John Doe"
                    value={tourData.name}
                    onChange={(e) => setTourData({ ...tourData, name: e.target.value })}
                    className="w-full bg-slate-950/50 border border-white/10 rounded-lg py-2.5 px-4 text-sm text-slate-100 focus:outline-none focus:border-primary transition-all"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Email Address *</label>
                  <input
                    type="email"
                    required
                    placeholder="john@example.com"
                    value={tourData.email}
                    onChange={(e) => setTourData({ ...tourData, email: e.target.value })}
                    className="w-full bg-slate-950/50 border border-white/10 rounded-lg py-2.5 px-4 text-sm text-slate-100 focus:outline-none focus:border-primary transition-all"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Mobile Number *</label>
                  <input
                    type="tel"
                    required
                    placeholder="e.g. 9999999999"
                    value={tourData.phone}
                    onChange={(e) => setTourData({ ...tourData, phone: e.target.value })}
                    className="w-full bg-slate-950/50 border border-white/10 rounded-lg py-2.5 px-4 text-sm text-slate-100 focus:outline-none focus:border-primary transition-all"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Submit Button */}
          <div className="flex justify-end pt-4 border-t border-white/5">
            <button
              type="submit"
              disabled={loading}
              className="flex items-center gap-2 bg-accent hover:bg-amber-600 disabled:bg-accent/50 text-slate-950 font-bold py-3 px-8 rounded-lg shadow-lg tracking-wider transition-all transform hover:-translate-y-0.5 active:translate-y-0 text-sm uppercase"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Processing...</span>
                </>
              ) : (
                <>
                  <span>Proceed Booking</span>
                  <ChevronRight className="w-5 h-5" />
                </>
              )}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
