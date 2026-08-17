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

const POPULAR_COMPANIES = [
  "Accenture",
  "Acme Solutions",
  "Adobe",
  "Aegis Global",
  "Airbus",
  "Airtel",
  "Alkem Laboratories",
  "Amazon",
  "AMD",
  "Amul",
  "Apex Tech Solutions",
  "Apollo Hospitals",
  "Apple",
  "Asian Paints",
  "AstraZeneca",
  "Astral Pipes",
  "Ather Energy",
  "Axis Bank",
  "Bain & Company",
  "Bajaj Auto",
  "Bajaj Finserv",
  "Bank of Baroda",
  "Barclays",
  "BharatPe",
  "BEL (Bharat Electronics)",
  "BHEL",
  "Biocon",
  "Blinkit",
  "Birlasoft",
  "Blue Star",
  "BluSmart",
  "Boeing",
  "Bosch",
  "Boston Consulting Group (BCG)",
  "BPCL",
  "BrowserStack",
  "Canara Bank",
  "Capgemini",
  "CarDekho",
  "Cars24",
  "Cipla",
  "Cisco",
  "Citigroup",
  "Classplus",
  "ClearTax",
  "Coal India",
  "Coca-Cola",
  "Cognizant",
  "CoinDCX",
  "Concentrix",
  "Cred",
  "Crompton Greaves",
  "Cybage Software",
  "Dabur",
  "Darwinbox",
  "Delhivery",
  "Deloitte",
  "Deutsche Bank",
  "DHL Express",
  "DLF Limited",
  "Dr. Reddy's Laboratories",
  "Dream11",
  "Dunzo",
  "ElasticRun",
  "EY (Ernst & Young)",
  "Federal Bank",
  "FedEx",
  "Firstsource",
  "Flipkart",
  "Fortis Healthcare",
  "Freshworks",
  "GAIL India",
  "General Electric (GE)",
  "Genpact",
  "Godrej Group",
  "Goldman Sachs",
  "Google",
  "Groww",
  "Gupshup",
  "HAL (Hindustan Aeronautics)",
  "Happiest Minds",
  "Hasura",
  "Havells",
  "HCLTech",
  "HDFC Bank",
  "Hero MotoCorp",
  "Hexaware Technologies",
  "Hindalco",
  "Hinduja Global Solutions",
  "Hindustan Unilever (HUL)",
  "Hiranandani Group",
  "Honda",
  "HPCL",
  "HSBC",
  "Hyundai",
  "IBM",
  "ICICI Bank",
  "IKEA",
  "Indian Oil (IOCL)",
  "IndusInd Bank",
  "Infra.Market",
  "Infosys",
  "InMobi",
  "Intel",
  "ISRO",
  "ITC Limited",
  "Jio",
  "JK Tyre",
  "Johnson & Johnson",
  "JPMorgan Chase & Co.",
  "Jubilant FoodWorks",
  "Justdial",
  "KPMG",
  "KPIT Technologies",
  "Kotak Mahindra Bank",
  "L&T (Larsen & Toubro)",
  "LeadSquared",
  "Lenskart",
  "LIC India",
  "Licious",
  "LG Electronics",
  "Lodha (Macrotech)",
  "LTI Mindtree",
  "Lupin Pharmaceuticals",
  "Mahindra & Mahindra",
  "Mahindra Logistics",
  "MakeMyTrip",
  "Mamaearth",
  "Mankind Pharma",
  "Marico",
  "Maruti Suzuki",
  "Max Healthcare",
  "McKinsey & Company",
  "Meesho",
  "Meta",
  "Mphasis",
  "Microsoft",
  "Moglix",
  "Morgan Stanley",
  "Nestlé",
  "NHPC",
  "NTPC",
  "Novartis",
  "NVIDIA",
  "Nykaa",
  "Oberoi Realty",
  "OfBusiness",
  "Ola Cabs",
  "Ola Electric",
  "ONGC",
  "Oracle",
  "Page Industries",
  "Paytm",
  "PepsiCo",
  "Persistent Systems",
  "Pfizer",
  "Philips",
  "PhonePe",
  "PhysicsWallah",
  "Pidilite Industries",
  "PolicyBazaar",
  "Polycab",
  "Porter",
  "Postman",
  "Pristyn Care",
  "Procter & Gamble (P&G)",
  "PwC (PricewaterhouseCoopers)",
  "Quess Corp",
  "Rapido",
  "Razorpay",
  "Rebel Foods",
  "Reliance Industries",
  "SAIL",
  "Salesforce",
  "Samsung",
  "SAP",
  "Sasken Technologies",
  "Schbang",
  "SBI (State Bank of India)",
  "ShareChat",
  "Shiprocket",
  "Siemens",
  "Simplilearn",
  "Sobha Limited",
  "Sonata Software",
  "Sony",
  "Spinny",
  "Sun Pharma",
  "Swiggy",
  "Tata Consultancy Services (TCS)",
  "Tata Motors",
  "Tata Steel",
  "Tata Power",
  "TeamLease",
  "Tech Mahindra",
  "Torrent Pharma",
  "Toyota",
  "Trent (Westside)",
  "TVS Motor",
  "Uber",
  "UltraTech Cement",
  "Unacademy",
  "Unilever",
  "Union Bank",
  "UpGrad",
  "Urban Company",
  "Vodafone Idea",
  "Voltas",
  "Walmart",
  "Wipro",
  "WNS Global",
  "Zepto",
  "Zensar Technologies",
  "Zerodha",
  "Zomato"
];

export default function BookingWidget() {
  const [activeTab, setActiveTab] = useState<BookingTab>("corporate");
  const [pickupDropSubTab, setPickupDropSubTab] = useState<"individual" | "working">("individual");
  const [showCompanySuggestions, setShowCompanySuggestions] = useState(false);
  const [companyGoogleSuggestions, setCompanyGoogleSuggestions] = useState<any[]>([]);
  const [companyLoading, setCompanyLoading] = useState(false);

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
    gender: "",
    shiftStartHour: "",
    shiftStartMinute: "",
    shiftStartAmpm: "AM",
    shiftEndHour: "",
    shiftEndMinute: "",
    shiftEndAmpm: "PM",
    pickup: "",
    drop: ""
  });

  // Debounced search for Company Name via Google Places & Business DB
  useEffect(() => {
    const query = corpData.company.trim();
    if (query.length < 2) {
      setCompanyGoogleSuggestions([]);
      setCompanyLoading(false);
      return;
    }

    const timer = setTimeout(async () => {
      setCompanyLoading(true);
      try {
        const res = await fetch(`/api/places/autocomplete?q=${encodeURIComponent(query)}`);
        if (res.ok) {
          const data = await res.json();
          if (data.suggestions && Array.isArray(data.suggestions)) {
            setCompanyGoogleSuggestions(data.suggestions);
          }
        }
      } catch (err) {
        console.error("Company Places autocomplete error:", err);
      } finally {
        setCompanyLoading(false);
      }
    }, 200);

    return () => clearTimeout(timer);
  }, [corpData.company]);

  const [localData, setLocalData] = useState({
    name: "",
    email: "",
    phone: "",
    pickupLocation: "",
    vehicleCategoryId: "",
    duration: "",
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
        }

        if (toursRes.ok) {
          const toursData = await toursRes.json();
          setTours(toursData);
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

        if (pickupDropSubTab === "working" && !corpData.company.trim()) {
          throw new Error("Please enter your Company Name.");
        }

        // 1. Pickup/Drop Time Validation
        const startMins = timeToMinutes(corpData.shiftStartHour, corpData.shiftStartMinute, corpData.shiftStartAmpm);
        const endMins = timeToMinutes(corpData.shiftEndHour, corpData.shiftEndMinute, corpData.shiftEndAmpm);
        if (startMins === endMins) {
          throw new Error("Drop Time cannot be equal to Pickup Time.");
        }
        if (startMins > endMins) {
          throw new Error("Drop Time must be after Pickup Time.");
        }

        // 2. Contact Name Validation
        if (!validateName(corpData.contactName)) {
          throw new Error("Contact Name can only contain alphabetic characters.");
        }

        // 3. Email Validation
        if (!validateEmail(corpData.email)) {
          throw new Error("Please enter a valid email address.");
        }

        // 4. Mobile Number Validation
        const digitsPhone = corpData.phone.replace(/\D/g, "");
        if (digitsPhone.length !== 10) {
          throw new Error("Mobile number must be exactly 10 digits.");
        }
        const formattedPhone = `+91${digitsPhone}`;
        const pickupTimeStr = `${corpData.shiftStartHour}:${corpData.shiftStartMinute} ${corpData.shiftStartAmpm}`;
        const dropTimeStr = `${corpData.shiftEndHour}:${corpData.shiftEndMinute} ${corpData.shiftEndAmpm}`;

        payload = {
          companyName: pickupDropSubTab === "working" ? corpData.company.trim() : "Individual",
          contactName: corpData.contactName.trim(),
          email: corpData.email.trim(),
          phone: formattedPhone,
          employeeCount: 1,
          pickupLocations: corpData.pickup.trim(),
          serviceType: `Pickup & Drop (${pickupDropSubTab === "working" ? `Working - ${corpData.company.trim()}` : "Individual"})`,
          requirements: `Booking Type: ${pickupDropSubTab === "working" ? "Working" : "Individual"}.${pickupDropSubTab === "working" ? ` Company: ${corpData.company.trim()}.` : ""} Gender: ${corpData.gender}. Pickup Address: ${corpData.pickup.trim()}. Drop Address: ${corpData.drop.trim()}. Pickup Time: ${pickupTimeStr}, Drop Time: ${dropTimeStr}.`
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
      setCorpData({ company: "", contactName: "", email: "", phone: "", employeeId: "", gender: "Male", shiftStartHour: "09", shiftStartMinute: "00", shiftStartAmpm: "AM", shiftEndHour: "06", shiftEndMinute: "00", shiftEndAmpm: "PM", pickup: "", drop: "" });
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
    <div className="w-full max-w-5xl mx-auto glassmorphism rounded-2xl shadow-2xl border border-white/10 text-slate-100 relative">
      {/* Tabs */}
      <div className="grid grid-cols-1 md:grid-cols-3 bg-slate-950/80 border-b border-white/5">
        <button
          onClick={() => { setActiveTab("corporate"); setError(null); setSuccess(false); }}
          className={`flex items-center justify-center gap-2 py-4 px-3 text-sm font-semibold tracking-wide transition-all ${activeTab === "corporate"
            ? "bg-primary text-primary-foreground border-b-2 border-accent"
            : "text-slate-400 hover:text-slate-200 hover:bg-white/5"
            }`}
        >
          <Building2 className="w-4 h-4" />
          <span>Pickup & Drop</span>
        </button>

        <button
          onClick={() => { setActiveTab("local"); setError(null); setSuccess(false); }}
          className={`flex items-center justify-center gap-2 py-4 px-3 text-sm font-semibold tracking-wide transition-all ${activeTab === "local"
            ? "bg-primary text-primary-foreground border-b-2 border-accent"
            : "text-slate-400 hover:text-slate-200 hover:bg-white/5"
            }`}
        >
          <Clock className="w-4 h-4" />
          <span>Local Rentals</span>
        </button>

        <button
          onClick={() => { setActiveTab("outstation"); setError(null); setSuccess(false); }}
          className={`flex items-center justify-center gap-2 py-4 px-3 text-sm font-semibold tracking-wide transition-all ${activeTab === "outstation"
            ? "bg-primary text-primary-foreground border-b-2 border-accent"
            : "text-slate-400 hover:text-slate-200 hover:bg-white/5"
            }`}
        >
          <Compass className="w-4 h-4" />
          <span>Outstation</span>
        </button>

        {/* Tour Packages tab hidden via comment
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
        */}
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

          {/* Pickup & Drop Tab (Sub-tabs: Individual vs Working) */}
          {activeTab === "corporate" && (
            <div className="space-y-6">
              {/* Sub-Tabs Selector */}
              <div className="flex items-center gap-3 p-1.5 bg-slate-950/80 rounded-xl border border-white/10 w-fit">
                <button
                  type="button"
                  onClick={() => setPickupDropSubTab("individual")}
                  className={`flex items-center gap-2 px-5 py-2 rounded-lg text-xs font-bold tracking-wider uppercase transition-all ${
                    pickupDropSubTab === "individual"
                      ? "bg-accent text-slate-950 shadow-lg scale-105"
                      : "text-slate-400 hover:text-slate-200 hover:bg-white/5"
                  }`}
                >
                  <User className="w-3.5 h-3.5" />
                  <span>Individual</span>
                </button>
                <button
                  type="button"
                  onClick={() => setPickupDropSubTab("working")}
                  className={`flex items-center gap-2 px-5 py-2 rounded-lg text-xs font-bold tracking-wider uppercase transition-all ${
                    pickupDropSubTab === "working"
                      ? "bg-accent text-slate-950 shadow-lg scale-105"
                      : "text-slate-400 hover:text-slate-200 hover:bg-white/5"
                  }`}
                >
                  <Building2 className="w-3.5 h-3.5" />
                  <span>Working</span>
                </button>
              </div>

              {/* Working Sub-Tab: Company Name in Center */}
              {pickupDropSubTab === "working" && (
                <div className="flex justify-center w-full">
                  <div className="space-y-2 relative w-full max-w-xl">
                    <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block h-4 leading-4">Company Name *</label>
                    <div className="relative h-[42px]">
                      <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
                      <input
                        type="text"
                        required
                        placeholder="Enter Company Name"
                        value={corpData.company}
                        onFocus={() => setShowCompanySuggestions(true)}
                        onBlur={() => setTimeout(() => setShowCompanySuggestions(false), 200)}
                        onChange={(e) => {
                          setCorpData({ ...corpData, company: e.target.value });
                          setShowCompanySuggestions(true);
                        }}
                        className="w-full h-full bg-slate-950/50 border border-white/10 rounded-lg pl-10 pr-4 text-sm text-slate-100 focus:outline-none focus:border-primary transition-all text-center placeholder:text-left md:placeholder:text-center"
                      />
                      {showCompanySuggestions && (
                        <div className="absolute left-0 right-0 top-full mt-1 max-h-64 overflow-y-auto bg-slate-900 border border-white/15 rounded-lg shadow-2xl z-50 py-1 divide-y divide-white/5 text-left">
                          {corpData.company.trim().length > 0 && (
                            <button
                              type="button"
                              onMouseDown={() => {
                                setShowCompanySuggestions(false);
                              }}
                              className="w-full text-left px-4 py-2.5 text-xs text-amber-400 bg-amber-500/10 hover:bg-amber-500/20 font-semibold transition-colors flex items-center gap-2"
                            >
                              <CheckCircle2 className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                              <span>Use entered company: <strong className="text-white font-bold">&quot;{corpData.company}&quot;</strong></span>
                            </button>
                          )}

                          {/* Google Maps Real-time Places API Business Results */}
                          {companyGoogleSuggestions.length > 0 && (
                            <div>
                              <div className="px-4 py-1.5 text-[10px] font-bold text-accent uppercase tracking-wider bg-slate-950/40 flex items-center gap-1.5">
                                <MapPin className="w-3 h-3 text-accent" />
                                <span>Google Maps Places & Registered Businesses</span>
                              </div>
                              {companyGoogleSuggestions.map((place, idx) => (
                                <button
                                  key={idx}
                                  type="button"
                                  onMouseDown={() => {
                                    setCorpData({ ...corpData, company: place.mainText || place.fullText });
                                    setShowCompanySuggestions(false);
                                  }}
                                  className="w-full text-left px-4 py-2 text-xs text-slate-200 hover:bg-primary/30 hover:text-white transition-colors flex items-start gap-2"
                                >
                                  <Building2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                                  <div className="truncate">
                                    <span className="font-semibold text-slate-100">{place.mainText}</span>
                                    {place.secondaryText && (
                                      <span className="text-[11px] text-slate-400 block truncate">{place.secondaryText}</span>
                                    )}
                                  </div>
                                </button>
                              ))}
                            </div>
                          )}

                          {/* Preset Business Dictionary Results */}
                          <div>
                            {companyGoogleSuggestions.length > 0 && (
                              <div className="px-4 py-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider bg-slate-950/40">
                                Popular Corporate Directory
                              </div>
                            )}
                            {POPULAR_COMPANIES.filter(c => c.toLowerCase().includes((corpData.company || "").toLowerCase())).slice(0, 12).map(company => (
                              <button
                                key={company}
                                type="button"
                                onMouseDown={() => {
                                  setCorpData({ ...corpData, company });
                                  setShowCompanySuggestions(false);
                                }}
                                className="w-full text-left px-4 py-2 text-xs text-slate-200 hover:bg-primary/30 hover:text-white transition-colors flex items-center gap-2"
                              >
                                <Building2 className="w-3.5 h-3.5 text-accent shrink-0" />
                                <span>{company}</span>
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Section Divider with Centered Title "Passenger Details" (Only shown for Working sub-tab to separate Company Name) */}
              {pickupDropSubTab === "working" && (
                <div className="relative py-2">
                  <div className="absolute inset-0 flex items-center" aria-hidden="true">
                    <div className="w-full border-t border-white/10" />
                  </div>
                  <div className="relative flex justify-center">
                    <span className="bg-slate-900 px-4 text-xs font-bold uppercase tracking-wider text-amber-400 border border-white/10 rounded-full py-1 flex items-center gap-1.5 shadow-md">
                      <User className="w-3.5 h-3.5" />
                      Passenger Details
                    </span>
                  </div>
                </div>
              )}

              {/* Row 1: Contact Name, Email Address, Mobile Number in 1 line */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
                  <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Email Address *</label>
                  <input
                    type="email"
                    required
                    placeholder={pickupDropSubTab === "working" ? "e.g. corporate@company.com" : "e.g. john@example.com"}
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

              {/* Row 2: Gender, Pickup Time, Drop Time in 1 line */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
                {/* Column 1: Passenger Gender */}
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block h-4 leading-4">Passenger Gender *</label>
                  <div className="relative h-[42px]">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
                    <select
                      value={corpData.gender}
                      onChange={(e) => setCorpData({ ...corpData, gender: e.target.value })}
                      className="w-full h-full bg-slate-950/50 border border-white/10 rounded-lg pl-10 pr-4 text-sm text-slate-100 focus:outline-none focus:border-primary transition-all appearance-none cursor-pointer"
                    >
                      <option value="" disabled className="bg-slate-900">- Please Select -</option>
                      <option value="Male" className="bg-slate-900">Male</option>
                      <option value="Female" className="bg-slate-900">Female</option>
                      <option value="Other" className="bg-slate-900">Other</option>
                    </select>
                  </div>
                </div>

                {/* Column 2: Pickup Time */}
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block h-4 leading-4">Pickup Time *</label>
                  <div className="flex gap-1.5 items-center h-[42px]">
                    <select
                      value={corpData.shiftStartHour}
                      onChange={(e) => setCorpData({ ...corpData, shiftStartHour: e.target.value })}
                      className="flex-1 h-full bg-slate-950/50 border border-white/10 rounded-lg px-2 text-xs text-slate-100 focus:outline-none focus:border-primary font-mono cursor-pointer"
                    >
                      <option value="" disabled className="bg-slate-900">Hour</option>
                      {["01", "02", "03", "04", "05", "06", "07", "08", "09", "10", "11", "12"].map(h => (
                        <option key={h} value={h} className="bg-slate-900">{h}</option>
                      ))}
                    </select>

                    <select
                      value={corpData.shiftStartMinute}
                      onChange={(e) => setCorpData({ ...corpData, shiftStartMinute: e.target.value })}
                      className="flex-1 h-full bg-slate-950/50 border border-white/10 rounded-lg px-2 text-xs text-slate-100 focus:outline-none focus:border-primary font-mono cursor-pointer"
                    >
                      <option value="" disabled className="bg-slate-900">Minutes</option>
                      {["00", "15", "30", "45"].map(m => (
                        <option key={m} value={m} className="bg-slate-900">{m}</option>
                      ))}
                    </select>

                    {/* AM / PM Segmented Tab Control */}
                    <div className="flex h-full bg-slate-950/80 p-1 border border-white/10 rounded-lg shrink-0 items-center">
                      <button
                        type="button"
                        onClick={() => setCorpData({ ...corpData, shiftStartAmpm: "AM" })}
                        className={`h-full px-2.5 text-xs font-bold rounded-md transition-all flex items-center justify-center ${
                          corpData.shiftStartAmpm === "AM"
                            ? "bg-amber-500 text-slate-950 shadow-md"
                            : "text-slate-400 hover:text-slate-200"
                        }`}
                      >
                        AM
                      </button>
                      <button
                        type="button"
                        onClick={() => setCorpData({ ...corpData, shiftStartAmpm: "PM" })}
                        className={`h-full px-2.5 text-xs font-bold rounded-md transition-all flex items-center justify-center ${
                          corpData.shiftStartAmpm === "PM"
                            ? "bg-amber-500 text-slate-950 shadow-md"
                            : "text-slate-400 hover:text-slate-200"
                        }`}
                      >
                        PM
                      </button>
                    </div>
                  </div>
                </div>

                {/* Column 3: Drop Time */}
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block h-4 leading-4">Drop Time *</label>
                  <div className="flex gap-1.5 items-center h-[42px]">
                    <select
                      value={corpData.shiftEndHour}
                      onChange={(e) => setCorpData({ ...corpData, shiftEndHour: e.target.value })}
                      className="flex-1 h-full bg-slate-950/50 border border-white/10 rounded-lg px-2 text-xs text-slate-100 focus:outline-none focus:border-primary font-mono cursor-pointer"
                    >
                      <option value="" disabled className="bg-slate-900">Hour</option>
                      {["01", "02", "03", "04", "05", "06", "07", "08", "09", "10", "11", "12"].map(h => (
                        <option key={h} value={h} className="bg-slate-900">{h}</option>
                      ))}
                    </select>

                    <select
                      value={corpData.shiftEndMinute}
                      onChange={(e) => setCorpData({ ...corpData, shiftEndMinute: e.target.value })}
                      className="flex-1 h-full bg-slate-950/50 border border-white/10 rounded-lg px-2 text-xs text-slate-100 focus:outline-none focus:border-primary font-mono cursor-pointer"
                    >
                      <option value="" disabled className="bg-slate-900">Minutes</option>
                      {["00", "15", "30", "45"].map(m => (
                        <option key={m} value={m} className="bg-slate-900">{m}</option>
                      ))}
                    </select>

                    {/* AM / PM Segmented Tab Control */}
                    <div className="flex h-full bg-slate-950/80 p-1 border border-white/10 rounded-lg shrink-0 items-center">
                      <button
                        type="button"
                        onClick={() => setCorpData({ ...corpData, shiftEndAmpm: "AM" })}
                        className={`h-full px-2.5 text-xs font-bold rounded-md transition-all flex items-center justify-center ${
                          corpData.shiftEndAmpm === "AM"
                            ? "bg-amber-500 text-slate-950 shadow-md"
                            : "text-slate-400 hover:text-slate-200"
                        }`}
                      >
                        AM
                      </button>
                      <button
                        type="button"
                        onClick={() => setCorpData({ ...corpData, shiftEndAmpm: "PM" })}
                        className={`h-full px-2.5 text-xs font-bold rounded-md transition-all flex items-center justify-center ${
                          corpData.shiftEndAmpm === "PM"
                            ? "bg-amber-500 text-slate-950 shadow-md"
                            : "text-slate-400 hover:text-slate-200"
                        }`}
                      >
                        PM
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Row 3: Pickup Address & Drop Address in 1 line */}
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
                  <option value="" disabled className="bg-slate-900">- Please Select -</option>
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
                  <option value="" disabled className="bg-slate-900">- Please Select -</option>
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
                    placeholder="Enter pickup location"
                    value={localData.pickupLocation}
                    onChange={(val) => setLocalData({ ...localData, pickupLocation: val })}
                  />
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
                  <option value="" disabled className="bg-slate-900">- Please Select -</option>
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

          {/* Tour Package Tab hidden via comment */}
          {/*
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
          */}

          {/* Extra Distance & Waiting Time Fare Rules Notice */}
          <div className="bg-slate-900/90 border border-amber-500/20 p-4 rounded-xl space-y-1">
            <div className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-2">
              <Clock className="w-4 h-4 text-amber-400" />
              <span>Overage & Extra Usage Fare Rules:</span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Base quotes include the agreed route distance and pickup-to-drop timeframe. Extra distance beyond agreed km limits is billed per additional km, and waiting time beyond finalized drop time is billed per additional hour. Tolls and parking are charged at actuals.
            </p>
          </div>

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
                  <span>Proceed</span>
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
