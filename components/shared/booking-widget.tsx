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
  User,
  ChevronRight,
  CheckCircle2,
  AlertCircle,
  Loader2
} from "lucide-react";

import LocationInput from "./location-input";

type BookingTab = "corporate" | "local" | "outstation" | "tours";

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

function validatePhone(phone: string): boolean {
  const digitsOnly = phone.replace(/\D/g, "");
  return digitsOnly.length === 10;
}

const VEHICLE_DATA: Record<string, Record<string, string[]>> = {
  Sedan: {
    "Compact": ["Maruti Swift Dzire", "Hyundai Aura", "Honda Amaze", "Tata Tigor"],
    "Executive": ["Honda City", "Hyundai Verna", "Maruti Ciaz", "Skoda Slavia"],
    "Premium Executive": ["Toyota Camry", "Skoda Superb", "Volkswagen Passat"],
    "Luxury": ["Mercedes-Benz E-Class", "BMW 5 Series", "Audi A6", "Jaguar XF"]
  },
  SUV: {
    "Subcompact/Urban": ["Tata Nexon", "Maruti Brezza", "Hyundai Venue", "Kia Sonet"],
    "Mid-Premium": ["Hyundai Creta", "Kia Seltos", "Mahindra Scorpio-N", "Tata Harrier"],
    "Premium": ["Mahindra XUV700", "Tata Safari", "MG Hector Plus", "Jeep Compass"],
    "Luxury": ["Toyota Fortuner", "MG Gloster", "BMW X3/X5", "Mercedes-Benz GLE"]
  },
  "MPV/MUV": {
    "Value/Family": ["Maruti Triber", "Maruti Ertiga", "Renault Triber"],
    "Business": ["Kia Carens", "Toyota Rumion", "Mahindra Marazzo"],
    "Premium": ["Toyota Innova Crysta", "Toyota Innova Hycross"],
    "Luxury": ["Kia Carnival", "Toyota Vellfire", "Mercedes-Benz V-Class"]
  }
};

function getSubcategoriesForCategory(catNameOrSlug: string): Record<string, string[]> {
  const upper = (catNameOrSlug || "").toUpperCase();
  if (upper.includes("MPV") || upper.includes("MUV") || upper.includes("BUS") || upper.includes("TEMPO")) {
    return VEHICLE_DATA["MPV/MUV"];
  }
  if (upper.includes("SUV")) {
    return VEHICLE_DATA["SUV"];
  }
  return VEHICLE_DATA["Sedan"];
}

function formatCategorySeating(catName: string): string {
  const lower = catName.toLowerCase();
  if (lower.includes("suv") || lower.includes("innova") || lower.includes("ertiga")) {
    return `${catName} (7-Seater: 5-7 Persons)`;
  }
  if (lower.includes("sedan") || lower.includes("hatchback") || lower.includes("dzire") || lower.includes("etios") || lower.includes("premium")) {
    return `${catName} (5-Seater: 1-4 Persons)`;
  }
  if (lower.includes("bus") || lower.includes("tempo") || lower.includes("traveller")) {
    return `${catName} (13-26 Seater: 8+ Persons)`;
  }
  return `${catName} (5-Seater: 1-4 Persons)`;
}

export default function BookingWidget() {
  const [activeTab, setActiveTab] = useState<BookingTab>("corporate");

  // Dynamic lists from DB
  const [categories, setCategories] = useState<any[]>([]);
  const [tours, setTours] = useState<any[]>([]);

  // State for Pickup & Drop Category (Individual vs Working)
  const [bookingCategory, setBookingCategory] = useState<"individual" | "working">("individual");

  // State for forms
  const [corpData, setCorpData] = useState({ 
    company: "", 
    contactName: "",
    email: "",
    phone: "",
    shiftStartHour: "09",
    shiftStartMinute: "00",
    shiftStartAmpm: "AM",
    shiftEndHour: "06",
    shiftEndMinute: "00",
    shiftEndAmpm: "PM",
    pickup: "", 
    drop: "" 
  });

  const [localData, setLocalData] = useState({ 
    name: "",
    email: "",
    phone: "",
    pickupLocation: "",
    vehicleCategoryId: "", 
    selectedCatName: "Sedan",
    subCategory: "Compact",
    vehicleModel: "Maruti Swift Dzire",
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

        // 1. Working Company Validation
        if (bookingCategory === "working" && !corpData.company.trim()) {
          throw new Error("Please enter your Company Name.");
        }

        // 2. Time Validation
        const startMins = timeToMinutes(corpData.shiftStartHour, corpData.shiftStartMinute, corpData.shiftStartAmpm);
        const endMins = timeToMinutes(corpData.shiftEndHour, corpData.shiftEndMinute, corpData.shiftEndAmpm);
        if (startMins === endMins) {
          throw new Error("Drop Off Time cannot be equal to Pickup Time.");
        }
        if (startMins > endMins) {
          throw new Error("Drop Off Time must be after Pickup Time.");
        }

        // 3. Contact Name Validation
        if (!validateName(corpData.contactName)) {
          throw new Error("Contact Name can only contain alphabetic characters.");
        }

        // 4. Email Validation
        if (!validateEmail(corpData.email)) {
          throw new Error(`Please enter a valid ${bookingCategory === "working" ? "work email" : "email"} address.`);
        }

        // 5. Mobile Number Validation
        const digitsPhone = corpData.phone.replace(/\D/g, "");
        if (digitsPhone.length !== 10) {
          throw new Error("Mobile number must be exactly 10 digits.");
        }
        const formattedPhone = `+91${digitsPhone}`;
        const shiftIn = `${corpData.shiftStartHour}:${corpData.shiftStartMinute} ${corpData.shiftStartAmpm}`;
        const shiftOut = `${corpData.shiftEndHour}:${corpData.shiftEndMinute} ${corpData.shiftEndAmpm}`;
        const companyNameVal = bookingCategory === "working" ? corpData.company.trim() : "Individual Passenger";

        payload = {
          companyName: companyNameVal,
          contactName: corpData.contactName.trim(),
          email: corpData.email.trim(),
          phone: formattedPhone,
          employeeCount: 1,
          pickupLocations: corpData.pickup.trim(),
          serviceType: `Pickup & Drop (${bookingCategory === "working" ? "Working" : "Individual"} | Pickup: ${shiftIn} | Drop Off: ${shiftOut})`,
          requirements: `Category: ${bookingCategory === "working" ? `Working (${companyNameVal})` : "Individual"}. Drop Address: ${corpData.drop.trim()}. Pickup Time: ${shiftIn}, Drop Off Time: ${shiftOut}.`
        };
      } else if (activeTab === "local") {
        url = "/api/rental/lead";
        
        if (!validateName(localData.name)) {
          throw new Error("Contact Name can only contain alphabetic characters.");
        }
        if (!validateEmail(localData.email)) {
          throw new Error("Please enter a valid email address.");
        }
        const digitsPhone = localData.phone.replace(/\D/g, "");
        if (digitsPhone.length !== 10) {
          throw new Error("Mobile number must be exactly 10 digits.");
        }
        const formattedPhone = `+91${digitsPhone}`;
        
        const catName = localData.selectedCatName || "Sedan";
        const targetCat = categories.find(c => {
          const cn = c.name.toLowerCase();
          if (catName === "MPV/MUV") return cn.includes("mpv") || cn.includes("muv") || cn.includes("bus") || cn.includes("tempo") || cn.includes("suv");
          if (catName === "SUV") return cn.includes("suv");
          if (catName === "Sedan") return cn.includes("sedan") || cn.includes("hatchback") || cn.includes("premium");
          return false;
        });
        const vCatId = targetCat ? targetCat.id : (localData.vehicleCategoryId || categories[0]?.id || "");

        const subcatMap = getSubcategoriesForCategory(catName);
        const availSubcats = Object.keys(subcatMap);
        const subCatVal = availSubcats.includes(localData.subCategory) ? localData.subCategory : (availSubcats[0] || "");
        const availModels = subcatMap[subCatVal] || [];
        const modelVal = availModels.includes(localData.vehicleModel) ? localData.vehicleModel : (availModels[0] || "");

        payload = {
          customerName: localData.name.trim(),
          email: localData.email.trim(),
          phone: formattedPhone,
          pickupLocation: localData.pickupLocation.trim(),
          dropLocation: null,
          pickupDateTime: new Date(`${localData.pickupDate}T${localData.pickupTime}`).toISOString(),
          returnDateTime: null,
          vehicleCategoryId: vCatId,
          tripType: `Local Hourly Rental (${localData.duration}) - ${catName} ${subCatVal} [${modelVal}]`,
          notes: `Vehicle Category: ${catName}. Subcategory: ${subCatVal}. Vehicle Model: ${modelVal}. Package: ${localData.duration}.`
        };
      } else if (activeTab === "outstation") {
        url = "/api/rental/lead";

        if (!validateName(outstationData.name)) {
          throw new Error("Contact Name can only contain alphabetic characters.");
        }
        if (!validateEmail(outstationData.email)) {
          throw new Error("Please enter a valid email address.");
        }
        const digitsPhone = outstationData.phone.replace(/\D/g, "");
        if (digitsPhone.length !== 10) {
          throw new Error("Mobile number must be exactly 10 digits.");
        }
        const formattedPhone = `+91${digitsPhone}`;
        
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

        if (!validateName(tourData.name)) {
          throw new Error("Contact Name can only contain alphabetic characters.");
        }
        if (!validateEmail(tourData.email)) {
          throw new Error("Please enter a valid email address.");
        }
        const digitsPhone = tourData.phone.replace(/\D/g, "");
        if (digitsPhone.length !== 10) {
          throw new Error("Mobile number must be exactly 10 digits.");
        }
        const formattedPhone = `+91${digitsPhone}`;
        
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
      setCorpData({ company: "", contactName: "", email: "", phone: "", shiftStartHour: "09", shiftStartMinute: "00", shiftStartAmpm: "AM", shiftEndHour: "06", shiftEndMinute: "00", shiftEndAmpm: "PM", pickup: "", drop: "" });
      setLocalData(prev => ({ ...prev, name: "", email: "", phone: "", pickupLocation: "", subCategory: "", vehicleModel: "", pickupDate: "", pickupTime: "" }));
      setOutstationData(prev => ({ ...prev, name: "", email: "", phone: "", pickup: "", drop: "", date: "", returnDate: "" }));
      setTourData(prev => ({ ...prev, name: "", email: "", phone: "", date: "", guests: "1" }));

    } catch (err: any) {
      setError(err.message || "An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-5xl mx-auto glassmorphism rounded-2xl shadow-2xl border border-white/10 text-slate-100 relative">
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
          <span>Pickup & Drop</span>
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
              <>Your transit inquiry request has been successfully logged. Our team will review availability and contact you within 24 Hours.</>
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

          {/* Pickup & Drop Tab */}
          {activeTab === "corporate" && (
            <div className="space-y-6">
              {/* Row 0: Category Selector (Individual vs Working) */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">Booking Category *</label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setBookingCategory("individual")}
                    className={`py-2.5 px-4 rounded-lg text-xs font-bold transition-all border flex items-center justify-center gap-2 ${
                      bookingCategory === "individual"
                        ? "bg-primary text-white border-primary shadow-md"
                        : "bg-slate-950/50 text-slate-400 border-white/10 hover:border-white/20"
                    }`}
                  >
                    <User className="w-4 h-4" />
                    <span>Individual</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setBookingCategory("working")}
                    className={`py-2.5 px-4 rounded-lg text-xs font-bold transition-all border flex items-center justify-center gap-2 ${
                      bookingCategory === "working"
                        ? "bg-primary text-white border-primary shadow-md"
                        : "bg-slate-950/50 text-slate-400 border-white/10 hover:border-white/20"
                    }`}
                  >
                    <Building2 className="w-4 h-4" />
                    <span>Working</span>
                  </button>
                </div>
              </div>

              {/* Company Name (Shown first only if Working is selected) */}
              {bookingCategory === "working" && (
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Company Name *</label>
                  <div className="relative">
                    <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                    <input
                      type="text"
                      required
                      placeholder="e.g. Google India / TCS / Wipro"
                      value={corpData.company}
                      onChange={(e) => setCorpData({ ...corpData, company: e.target.value })}
                      className="w-full bg-slate-950/50 border border-white/10 rounded-lg py-2.5 pl-10 pr-4 text-sm text-slate-100 focus:outline-none focus:border-primary transition-all"
                    />
                  </div>
                </div>
              )}

              {/* Row 2: Pickup Time & Drop Off Time */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">Pickup Time *</label>
                  <div className="flex gap-2">
                    <select
                      value={corpData.shiftStartHour}
                      onChange={(e) => setCorpData({ ...corpData, shiftStartHour: e.target.value })}
                      className="flex-1 bg-slate-950/50 border border-white/10 rounded-lg py-2.5 px-3 text-sm text-slate-100 focus:outline-none focus:border-primary font-mono"
                    >
                      {["01","02","03","04","05","06","07","08","09","10","11","12"].map(h => (
                        <option key={h} value={h} className="bg-slate-900">{h}</option>
                      ))}
                    </select>
                    <select
                      value={corpData.shiftStartMinute}
                      onChange={(e) => setCorpData({ ...corpData, shiftStartMinute: e.target.value })}
                      className="flex-1 bg-slate-950/50 border border-white/10 rounded-lg py-2.5 px-3 text-sm text-slate-100 focus:outline-none focus:border-primary font-mono"
                    >
                      {["00","15","30","45"].map(m => (
                        <option key={m} value={m} className="bg-slate-900">{m}</option>
                      ))}
                    </select>
                    <select
                      value={corpData.shiftStartAmpm}
                      onChange={(e) => setCorpData({ ...corpData, shiftStartAmpm: e.target.value })}
                      className="bg-slate-950/50 border border-white/10 rounded-lg py-2.5 px-3 text-sm text-slate-100 focus:outline-none focus:border-primary font-bold"
                    >
                      <option value="AM" className="bg-slate-900">AM</option>
                      <option value="PM" className="bg-slate-900">PM</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">Drop Off Time *</label>
                  <div className="flex gap-2">
                    <select
                      value={corpData.shiftEndHour}
                      onChange={(e) => setCorpData({ ...corpData, shiftEndHour: e.target.value })}
                      className="flex-1 bg-slate-950/50 border border-white/10 rounded-lg py-2.5 px-3 text-sm text-slate-100 focus:outline-none focus:border-primary font-mono"
                    >
                      {["01","02","03","04","05","06","07","08","09","10","11","12"].map(h => (
                        <option key={h} value={h} className="bg-slate-900">{h}</option>
                      ))}
                    </select>
                    <select
                      value={corpData.shiftEndMinute}
                      onChange={(e) => setCorpData({ ...corpData, shiftEndMinute: e.target.value })}
                      className="flex-1 bg-slate-950/50 border border-white/10 rounded-lg py-2.5 px-3 text-sm text-slate-100 focus:outline-none focus:border-primary font-mono"
                    >
                      {["00","15","30","45"].map(m => (
                        <option key={m} value={m} className="bg-slate-900">{m}</option>
                      ))}
                    </select>
                    <select
                      value={corpData.shiftEndAmpm}
                      onChange={(e) => setCorpData({ ...corpData, shiftEndAmpm: e.target.value })}
                      className="bg-slate-950/50 border border-white/10 rounded-lg py-2.5 px-3 text-sm text-slate-100 focus:outline-none focus:border-primary font-bold"
                    >
                      <option value="AM" className="bg-slate-900">AM</option>
                      <option value="PM" className="bg-slate-900">PM</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Row 3: Pickup & Drop Address */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Pickup Address *</label>
                  <LocationInput
                    required
                    placeholder="Enter pickup location (e.g. Airport, Hinjewadi, BKC)"
                    value={corpData.pickup}
                    onChange={(val) => setCorpData({ ...corpData, pickup: val })}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Drop Address *</label>
                  <LocationInput
                    required
                    placeholder="Enter drop location (e.g. Airport, Hinjewadi, BKC)"
                    value={corpData.drop}
                    onChange={(val) => setCorpData({ ...corpData, drop: val })}
                  />
                </div>
              </div>

              {/* Row 4: Contact Information */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2 border-t border-white/5">
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Contact Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Amit Sharma"
                    value={corpData.contactName}
                    onChange={(e) => setCorpData({ ...corpData, contactName: e.target.value.replace(/[^a-zA-Z\s.-]/g, "") })}
                    className="w-full bg-slate-950/50 border border-white/10 rounded-lg py-2.5 px-4 text-sm text-slate-100 focus:outline-none focus:border-primary transition-all"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                    {bookingCategory === "working" ? "Work Email *" : "Email *"}
                  </label>
                  <input
                    type="email"
                    required
                    placeholder={bookingCategory === "working" ? "e.g. amit@company.com" : "e.g. amit@gmail.com"}
                    value={corpData.email}
                    onChange={(e) => setCorpData({ ...corpData, email: e.target.value })}
                    className="w-full bg-slate-950/50 border border-white/10 rounded-lg py-2.5 px-4 text-sm text-slate-100 focus:outline-none focus:border-primary transition-all"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Mobile Number (10 Digits) *</label>
                  <input
                    type="tel"
                    required
                    maxLength={10}
                    placeholder="e.g. 9999999999"
                    value={corpData.phone}
                    onChange={(e) => setCorpData({ ...corpData, phone: e.target.value.replace(/\D/g, "").slice(0, 10) })}
                    className="w-full bg-slate-950/50 border border-white/10 rounded-lg py-2.5 px-4 text-sm text-slate-100 focus:outline-none focus:border-primary transition-all font-mono"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Local Rentals Tab */}
          {activeTab === "local" && (() => {
            const currentCatName = localData.selectedCatName || "Sedan";
            const subcatMap = getSubcategoriesForCategory(currentCatName);
            const availableSubcats = Object.keys(subcatMap);

            const selectedSubcat = availableSubcats.includes(localData.subCategory) 
              ? localData.subCategory 
              : (availableSubcats[0] || "");

            const availableModels = subcatMap[selectedSubcat] || [];
            const selectedModel = availableModels.includes(localData.vehicleModel) 
              ? localData.vehicleModel 
              : (availableModels[0] || "");

            return (
              <div className="space-y-6">
                {/* Row 1: Vehicle Category, Vehicle Subcategory, Vehicle Model */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Vehicle Category *</label>
                    <select
                      value={currentCatName}
                      onChange={(e) => {
                        const newCatName = e.target.value;
                        const targetCat = categories.find(c => {
                          const cn = c.name.toLowerCase();
                          if (newCatName === "MPV/MUV") return cn.includes("mpv") || cn.includes("muv") || cn.includes("bus") || cn.includes("tempo") || cn.includes("suv");
                          if (newCatName === "SUV") return cn.includes("suv");
                          if (newCatName === "Sedan") return cn.includes("sedan") || cn.includes("hatchback") || cn.includes("premium");
                          return false;
                        });
                        const catId = targetCat ? targetCat.id : (categories[0]?.id || "");
                        const newSubmap = getSubcategoriesForCategory(newCatName);
                        const firstSub = Object.keys(newSubmap)[0] || "";
                        const firstModel = newSubmap[firstSub]?.[0] || "";
                        setLocalData({ 
                          ...localData, 
                          selectedCatName: newCatName,
                          vehicleCategoryId: catId,
                          subCategory: firstSub,
                          vehicleModel: firstModel
                        });
                      }}
                      className="w-full bg-slate-950/50 border border-white/10 rounded-lg py-2.5 px-4 text-sm text-slate-100 focus:outline-none focus:border-primary transition-all appearance-none"
                    >
                      <option value="Sedan" className="bg-slate-900">Sedan</option>
                      <option value="SUV" className="bg-slate-900">SUV</option>
                      <option value="MPV/MUV" className="bg-slate-900">MPV/MUV</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Vehicle Subcategory *</label>
                    <select
                      value={selectedSubcat}
                      onChange={(e) => {
                        const newSub = e.target.value;
                        const newModels = subcatMap[newSub] || [];
                        setLocalData({
                          ...localData,
                          subCategory: newSub,
                          vehicleModel: newModels[0] || ""
                        });
                      }}
                      className="w-full bg-slate-950/50 border border-white/10 rounded-lg py-2.5 px-4 text-sm text-slate-100 focus:outline-none focus:border-primary transition-all appearance-none"
                    >
                      {availableSubcats.map((sub) => (
                        <option key={sub} value={sub} className="bg-slate-900">{sub}</option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Vehicle Model *</label>
                    <select
                      value={selectedModel}
                      onChange={(e) => setLocalData({ ...localData, vehicleModel: e.target.value })}
                      className="w-full bg-slate-950/50 border border-white/10 rounded-lg py-2.5 px-4 text-sm text-slate-100 focus:outline-none focus:border-primary transition-all appearance-none"
                    >
                      {availableModels.map((mod) => (
                        <option key={mod} value={mod} className="bg-slate-900">{mod}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Row 2: Rental Package, Pickup Date, Pickup Time */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
                </div>

                {/* Customer Contact & Pickup address row */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 pt-2 border-t border-white/5">
                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Full Name *</label>
                    <input
                      type="text"
                      required
                      placeholder="John Doe"
                      value={localData.name}
                      onChange={(e) => setLocalData({ ...localData, name: e.target.value.replace(/[^a-zA-Z\s.-]/g, "") })}
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
                    <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Mobile Number (10 Digits) *</label>
                    <input
                      type="tel"
                      required
                      maxLength={10}
                      placeholder="e.g. 9999999999"
                      value={localData.phone}
                      onChange={(e) => setLocalData({ ...localData, phone: e.target.value.replace(/\D/g, "").slice(0, 10) })}
                      className="w-full bg-slate-950/50 border border-white/10 rounded-lg py-2.5 px-4 text-sm text-slate-100 focus:outline-none focus:border-primary transition-all font-mono"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Pickup Address *</label>
                    <LocationInput
                      required
                      placeholder="Enter pickup location (e.g. Airport, Hinjewadi, BKC)"
                      value={localData.pickupLocation}
                      onChange={(val) => setLocalData({ ...localData, pickupLocation: val })}
                    />
                  </div>
                </div>
              </div>
            );
          })()}

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
                    <option key={cat.id} value={cat.id} className="bg-slate-900">{formatCategorySeating(cat.name)}</option>
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
                  <LocationInput
                    required
                    placeholder="Pickup City (e.g. Mumbai, Pune, Delhi)"
                    value={outstationData.pickup}
                    onChange={(val) => setOutstationData({ ...outstationData, pickup: val })}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">To City *</label>
                  <LocationInput
                    required
                    placeholder="Drop City (e.g. Pune, Lonavala, Mahabaleshwar)"
                    value={outstationData.drop}
                    onChange={(val) => setOutstationData({ ...outstationData, drop: val })}
                  />
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
                    onChange={(e) => setOutstationData({ ...outstationData, name: e.target.value.replace(/[^a-zA-Z\s.-]/g, "") })}
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
                  <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Mobile Number (10 Digits) *</label>
                  <input
                    type="tel"
                    required
                    maxLength={10}
                    placeholder="e.g. 9999999999"
                    value={outstationData.phone}
                    onChange={(e) => setOutstationData({ ...outstationData, phone: e.target.value.replace(/\D/g, "").slice(0, 10) })}
                    className="w-full bg-slate-950/50 border border-white/10 rounded-lg py-2.5 px-4 text-sm text-slate-100 focus:outline-none focus:border-primary transition-all font-mono"
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
