"use client";

import React, { useState } from "react";
import Image from "next/image";
import BookingWidget from "@/components/shared/booking-widget";
import { JsonLd } from "@/components/shared/json-ld";
import Header from "@/components/shared/header";
import Footer from "@/components/shared/footer";
import {
  Building2,
  Car,
  ShieldCheck,
  MapPin,
  Phone,
  Mail,
  Star,
  Award,
  Clock,
  Users,
  ArrowUpRight,
  ChevronRight,
  ChevronLeft,
  Quote,
  ThumbsUp,
  Sparkles,
  CheckCircle2,
  ChevronDown,
  Shield
} from "lucide-react";

export default function Homepage() {
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [activeReviewIndex, setActiveReviewIndex] = useState(0);
  const [isReviewHovered, setIsReviewHovered] = useState(false);

  const [featuredVehicles, setFeaturedVehicles] = useState<any[]>([
    { id: "1", name: "Maruti Suzuki Swift Dzire", category: "Compact Sedan", seats: "4 Passengers", rate: "₹12/km", img: "/images/fleet-suv.png" },
    { id: "2", name: "Honda City / Hyundai Verna", category: "Executive Sedan", seats: "4 Passengers", rate: "₹18/km", img: "/images/hero-cover.png" },
    { id: "3", name: "Mercedes-Benz E-Class", category: "Luxury Sedan", seats: "4 Passengers", rate: "₹65/km", img: "/images/hero-cover.png" }
  ]);

  const [googleData, setGoogleData] = useState<{
    rating: number;
    userRatingCount: number;
    googleMapsUri: string;
    reviews: any[];
  }>({
    rating: 5.0,
    userRatingCount: 120,
    googleMapsUri: "https://www.google.com/maps/place/?q=place_id:ChIJ5Zoykd0bDTkRc8tFlL_O6rY",
    reviews: [
      {
        id: "rev-1",
        authorName: "Abhinandan Kumar Kundan",
        authorPhoto: "https://lh3.googleusercontent.com/a-/ALV-UjWoZsUu95OwRf4JSLmmN74OFaM-rT_pK8Wnio3mBotwezngxaGy=s128-c0x00000000-cc-rp-mo",
        rating: 5,
        relativeTime: "a month ago",
        text: "Excellent outstation taxi service. I used them for a long-distance business trip across cities and was highly impressed. The chauffeur was experienced, professional, and knew the highway routes and best rest stops perfectly.",
        tripType: "Outstation Business Trip"
      },
      {
        id: "rev-2",
        authorName: "Kartik Arora",
        authorPhoto: "https://lh3.googleusercontent.com/a/ACg8ocK3XXgJBeEMktlBHrtUh-7aPvCOKQM-Z07oVnaarwQno2QEuA=s128-c0x00000000-cc-rp-mo",
        rating: 5,
        relativeTime: "a month ago",
        text: "Best corporate cab service we’ve partnered with so far. Punctual drivers, pristine cars, and smooth coordination. Their corporate account management team makes booking and invoicing incredibly easy. Five stars for reliability and professionalism!",
        tripType: "Corporate Employee Commute"
      },
      {
        id: "rev-3",
        authorName: "Lokesh Nath Jha",
        authorPhoto: "https://lh3.googleusercontent.com/a/ACg8ocJJgrasr6Il7qed2ia885ZDgrtOLL7iNEncvNASggWwowjx4Q=s128-c0x00000000-cc-rp-mo",
        rating: 5,
        relativeTime: "a month ago",
        text: "Exceptional service from Intercity Taxi Service! Booking was seamless, and the customer support was very helpful. The driver was punctual, extremely courteous, and focused on safety throughout the highway journey.",
        tripType: "Intercity Highway Rental"
      },
      {
        id: "rev-4",
        authorName: "Priya Sharma",
        authorPhoto: "",
        rating: 5,
        relativeTime: "2 weeks ago",
        text: "Booked an Innova Crysta for a family weekend trip. The car was spotless and smelled fresh. Driver was very polite, drove smoothly, and was very patient during all our sightseeing stops.",
        tripType: "Family Outstation Tour"
      },
      {
        id: "rev-5",
        authorName: "Rajesh Malhotra",
        authorPhoto: "",
        rating: 5,
        relativeTime: "3 weeks ago",
        text: "Outstanding airport transfer experience. Received driver details and live GPS link 30 minutes prior to pickup. Car arrived 10 minutes early. Premium executive feel all the way!",
        tripType: "Airport Transfer"
      },
      {
        id: "rev-6",
        authorName: "Vikramaditya Singh",
        authorPhoto: "",
        rating: 5,
        relativeTime: "a month ago",
        text: "We hired multiple luxury sedans for our corporate VIP delegates. Flawless execution, zero delay, and top-tier hospitality. Highly recommended for corporate events!",
        tripType: "VIP Event Fleet"
      }
    ]
  });

  // Auto-play reviews carousel every 4.5 seconds unless hovered
  React.useEffect(() => {
    if (isReviewHovered) return;
    const interval = setInterval(() => {
      setActiveReviewIndex((prev) => (prev + 1) % Math.max(1, googleData.reviews.length));
    }, 4500);
    return () => clearInterval(interval);
  }, [googleData.reviews.length, isReviewHovered]);

  React.useEffect(() => {
    fetch("/api/google-reviews")
      .then((res) => {
        if (res.ok) return res.json();
        throw new Error("Failed to fetch reviews");
      })
      .then((data) => {
        if (data?.reviews && Array.isArray(data.reviews) && data.reviews.length > 0) {
          setGoogleData(prev => ({
            ...prev,
            ...data,
            reviews: data.reviews.map((r: any, idx: number) => ({
              ...r,
              tripType: prev.reviews[idx]?.tripType || "Verified Customer Review"
            }))
          }));
        }
      })
      .catch((err) => {
        console.error("Google reviews load error:", err);
      });

    // Fetch featured homepage fleet vehicles selected in Admin Panel
    fetch("/api/fleet?limit=30")
      .then((res) => {
        if (res.ok) return res.json();
        throw new Error("Failed to fetch fleet");
      })
      .then((data) => {
        const vehicles = Array.isArray(data) ? data : (data.vehicles || []);
        if (vehicles.length > 0) {
          let selected = vehicles.filter((v: any) => v.isFeatured);
          if (selected.length < 3) {
            const unselected = vehicles.filter((v: any) => !selected.some((s: any) => s.id === v.id));
            selected = [...selected, ...unselected].slice(0, 3);
          } else {
            selected = selected.slice(0, 3);
          }

          if (selected.length > 0) {
            setFeaturedVehicles(selected.map((v: any) => ({
              id: v.id,
              name: `${v.make} ${v.model}`,
              category: v.subCategory || v.category?.name || "Executive Fleet",
              seats: `${v.capacity} Passengers`,
              rate: v.perKmRate ? `₹${Number(v.perKmRate)}/km` : v.baseDailyRate ? `₹${Number(v.baseDailyRate)}/day` : "On Request",
              img: v.imageUrl || "/images/fleet-suv.png"
            })));
          }
        }
      })
      .catch((err) => {
        console.error("Featured vehicles load error:", err);
      });
  }, []);

  const businessSchema = {
    "@context": "https://schema.org",
    "@type": "CarRental",
    "name": "TEMP TRAVEL CAR RENTALS PVT LTD",
    "image": "https://temptravels.com/images/hero-cover.png",
    "address": {
      "@type": "PostalAddress",
      "streetAddress": "Flat No C-102, Shanti Vihar, Lokhandwala Complex",
      "addressLocality": "Mumbai",
      "addressRegion": "MH",
      "postalCode": "400101",
      "addressCountry": "IN"
    },
    "url": "https://temptravels.com",
    "telephone": "+91-9999999999",
    "priceRange": "₹₹",
    "areaServed": ["Mumbai", "Pune", "Nashik", "Goa", "Bangalore", "Delhi NCR"]
  };

  const fleetData = {
    sedan: [
      { name: "Maruti Suzuki Swift Dzire", category: "Compact Sedan", seats: "4 Passengers", rate: "₹12/km", img: "/images/fleet-suv.png" },
      { name: "Honda City / Hyundai Verna", category: "Executive Sedan", seats: "4 Passengers", rate: "₹18/km", img: "/images/hero-cover.png" },
      { name: "Mercedes-Benz E-Class", category: "Luxury Sedan", seats: "4 Passengers", rate: "₹65/km", img: "/images/hero-cover.png" }
    ],
    suv: [
      { name: "Ertiga / XL6 / Carens", category: "Subcompact SUV / MUV", seats: "6-7 Passengers", rate: "₹16/km", img: "/images/fleet-suv.png" },
      { name: "Innova Crysta Premium", category: "Mid-Premium SUV", seats: "6-7 Passengers", rate: "₹22/km", img: "/images/fleet-suv.png" },
      { name: "Toyota Fortuner 4x4", category: "Luxury SUV", seats: "7 Passengers", rate: "₹45/km", img: "/images/fleet-suv.png" }
    ],
    luxury: [
      { name: "BMW 5 Series / 7 Series", category: "Ultra Luxury", seats: "4 Passengers", rate: "₹85/km", img: "/images/hero-cover.png" },
      { name: "Audi A6 / Q7", category: "Luxury Executive", seats: "4-7 Passengers", rate: "₹75/km", img: "/images/hero-cover.png" },
      { name: "Tempo Traveller Executive", category: "Group Luxury Minibus", seats: "13-26 Passengers", rate: "₹32/km", img: "/images/fleet-suv.png" }
    ]
  };

  const faqs = [
    {
      q: "How does TEMP TRAVEL manage corporate employee transit rosters?",
      a: "We provide automated roster parsing tools that ingest shift Excel files directly. Our system auto-groups employees by route optimization to minimize vehicle deployment costs while maintaining strict arrival windows."
    },
    {
      q: "Are drivers background verified and trained for compliance?",
      a: "Yes. All chauffeurs undergo criminal background checks, local police verification, defensive driving training, and protocol orientation for corporate & executive passengers."
    },
    {
      q: "What is included in Outstation & Local Hourly Rental packages?",
      a: "Local hourly packages include dedicated vehicle and chauffeur for fixed hour/km slabs (e.g., 8 Hrs/80 Kms). Outstation fares cover agreed point-to-point route distances with transparent per-km overage rules."
    },
    {
      q: "Do you offer automated billing and GST compliant invoices?",
      a: "Absolutely. Corporate accounts receive automated monthly consolidated billing, detailed trip logs, live GPS proof-of-transit, and instant tax-compliant GST invoices."
    }
  ];

  return (
    <div className="bg-slate-950 text-slate-100 min-h-screen font-sans selection:bg-amber-500 selection:text-slate-950">
      <JsonLd data={businessSchema} />

      {/* Header */}
      <Header />

      {/* Hero Section */}
      <section className="relative min-h-[92vh] flex flex-col justify-center items-center py-20 px-4 md:px-8 overflow-hidden bg-slate-950">
        {/* Ambient Glowing Background Orbs */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[500px] bg-gradient-to-tr from-amber-500/20 via-blue-600/15 to-transparent rounded-full blur-[140px] pointer-events-none z-0" />
        <div className="absolute bottom-10 right-10 w-96 h-96 bg-primary/10 rounded-full blur-3xl pointer-events-none z-0" />

        {/* Hero Background Image */}
        <div className="absolute inset-0 z-0">
          <Image
            src="/images/hero-cover.png"
            alt="Ultra Luxury Executive Fleet"
            fill
            priority
            className="object-cover opacity-25"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/85 to-slate-950/60" />
        </div>

        {/* Hero Content */}
        <div className="relative z-10 w-full max-w-7xl mx-auto text-center space-y-6 mb-12">
          {/* Floating Luxury Tag */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-amber-500/10 border border-amber-500/30 rounded-full text-amber-400 text-xs font-extrabold uppercase tracking-widest backdrop-blur-md shadow-lg shadow-amber-500/5">
            <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
            <span>India's Premier Chauffeur Fleet & Transit Management</span>
          </div>

          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black text-slate-50 tracking-tight leading-[1.1] max-w-5xl mx-auto">
            Executive Corporate Transit <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-amber-400 to-amber-500 drop-shadow-sm">
              & Luxury Fleet Rentals
            </span>
          </h1>

          <p className="text-base sm:text-lg md:text-xl text-slate-300 max-w-3xl mx-auto font-normal leading-relaxed">
            Delivering ISO-certified employee mobility rosters, executive airport chauffeuring, and seamless outstation travel across India with 24/7 live dispatch controls.
          </p>

          {/* Quick Metrics Pills */}
          <div className="flex flex-wrap justify-center items-center gap-6 pt-2 text-xs font-semibold text-slate-400">
            <div className="flex items-center gap-2 bg-slate-900/80 px-4 py-2 rounded-lg border border-white/10">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>500K+ Completed Rides</span>
            </div>
            <div className="flex items-center gap-2 bg-slate-900/80 px-4 py-2 rounded-lg border border-white/10">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>99.8% On-Time SLA Guarantee</span>
            </div>
            <div className="flex items-center gap-2 bg-slate-900/80 px-4 py-2 rounded-lg border border-white/10">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Pan-India Metropolitan Coverage</span>
            </div>
          </div>
        </div>

        {/* Booking Widget Wrapper */}
        <div id="book-widget" className="relative z-10 w-full max-w-5xl mx-auto scroll-mt-24">
          <BookingWidget />
        </div>
      </section>

      {/* Floating High-Contrast Stats Banner */}
      <section className="relative z-20 py-12 bg-slate-900/90 border-y border-white/10 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {[
            { metric: "90,000+", label: "Verified Passengers Transported" },
            { metric: "99.85%", label: "Corporate On-Time Arrival Ratio" },
            { metric: "121+", label: "Satisfied clients" },
            { metric: "24/7", label: "Dedicated SPOC Command Center" }
          ].map((stat, idx) => (
            <div key={idx} className="space-y-1">
              <div className="text-3xl sm:text-4xl lg:text-5xl font-black text-amber-400 tracking-tight">{stat.metric}</div>
              <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Premium Corporate Logistics Section */}
      <section id="corporate" className="py-24 bg-slate-950 text-slate-100 px-4 sm:px-6 lg:px-8 border-b border-white/5">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-16 items-center">
          <div className="lg:col-span-6 space-y-6">
            <div className="inline-flex items-center gap-2 text-xs font-bold text-amber-400 bg-amber-500/10 px-3 py-1.5 rounded-md border border-amber-500/20 uppercase tracking-wider">
              <Building2 className="w-4 h-4 text-amber-400" />
              <span>Enterprise Transit Management</span>
            </div>

            <h2 className="text-3xl sm:text-5xl font-black text-slate-50 tracking-tight leading-snug">
              Automated Corporate Commute & Executive Fleet Dispatch
            </h2>

            <p className="text-slate-300 leading-relaxed text-base">
              Engineered specifically for corporate HR, admin, and travel desks. We replace manual dispatch chaos with structured employee shift rosters, automated billing verification, and 100% compliant vehicles.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              {[
                { title: "Roster Parsing Engine", desc: "Automated route grouping from shift schedules." },
                { title: "Live GPS Command Desk", desc: "Real-time passenger location & SOS monitoring." },
                { title: "Standardized Billing", desc: "Instant transparent invoices with full GST compliance." },
                { title: "Chauffeur Auditing", desc: "Rigorous background checks & etiquette training." }
              ].map((feat, i) => (
                <div key={i} className="p-4 bg-slate-900/60 border border-white/10 rounded-xl space-y-1 hover:border-amber-400/40 transition-colors">
                  <div className="font-bold text-slate-100 text-sm flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0" />
                    <span>{feat.title}</span>
                  </div>
                  <div className="text-xs text-slate-400 pl-6">{feat.desc}</div>
                </div>
              ))}
            </div>

            <div className="pt-4">
              <a href="#contact" className="inline-flex items-center gap-3 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-extrabold py-3.5 px-8 rounded-xl tracking-wider transition-all shadow-xl shadow-amber-500/10">
                <span>Request Corporate Contract Proposal</span>
                <ArrowUpRight className="w-5 h-5 text-slate-950" />
              </a>
            </div>
          </div>

          {/* Interactive Corporate Live Dashboard Card */}
          <div className="lg:col-span-6 bg-gradient-to-b from-slate-900 to-slate-950 border border-white/10 rounded-2xl p-6 md:p-8 space-y-6 relative overflow-hidden shadow-2xl">
            <div className="absolute top-0 right-0 w-48 h-48 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
            <div className="flex justify-between items-center border-b border-white/10 pb-4">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-emerald-400 rounded-full animate-ping" />
                <span className="text-sm font-bold text-slate-100">Live SPOC Command Dashboard</span>
              </div>
              <span className="text-[10px] font-bold text-amber-400 uppercase tracking-widest bg-amber-500/10 px-2.5 py-1 rounded">Active Shift Log</span>
            </div>

            <div className="space-y-3 font-mono text-xs">
              {[
                { route: "Route 01 (BKC to Thane Campus)", driver: "Ramesh Sharma (Innova Hycross)", status: "ON SCHEDULE", time: "18:30 PM" },
                { route: "Route 04 (Gurugram CyberHub)", driver: "Sunil Verma (Swift Dzire)", status: "BOARDING COMPLETE", time: "18:45 PM" },
                { route: "Route 12 (Bengaluru Whitefield)", driver: "Pravin Patil (Ertiga)", status: "DISPATCHED", time: "19:00 PM" }
              ].map((log, index) => (
                <div key={index} className="p-3 bg-slate-950/80 border border-white/5 rounded-lg space-y-1">
                  <div className="flex justify-between font-bold text-slate-200">
                    <span>{log.route}</span>
                    <span className="text-emerald-400">{log.status}</span>
                  </div>
                  <div className="flex justify-between text-[11px] text-slate-400 font-sans">
                    <span>{log.driver}</span>
                    <span>Expected: {log.time}</span>
                  </div>
                </div>
              ))}
            </div>

            <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-xl text-xs text-amber-300 leading-relaxed flex items-center gap-3">
              <Award className="w-5 h-5 text-amber-400 shrink-0" />
              <span>Full SLA accountability backed by real-time GPS coordinates and driver status alerts.</span>
            </div>
          </div>
        </div>
      </section>


      {/* Fleet Showcase Interactive Section */}
      <section id="fleet" className="py-24 bg-slate-900/60 px-4 sm:px-6 lg:px-8 border-b border-white/5">
        <div className="max-w-7xl mx-auto space-y-12">
          <div className="text-center space-y-4">
            <span className="text-xs font-bold text-amber-400 uppercase tracking-wider block">Our Luxury & Commercial Fleet</span>
            <h2 className="text-3xl sm:text-5xl font-black text-slate-50 tracking-tight">Immaculate Vehicles For Every Journey</h2>
            <p className="text-slate-300 max-w-2xl mx-auto text-sm">
              All vehicles are thoroughly sanitized, equipped with GPS trackers, emergency SOS buttons, and driven by certified chauffeurs.
            </p>
          </div>

          {/* Vehicle Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {featuredVehicles.map((vehicle, idx) => (
              <div key={vehicle.id || idx} className="bg-slate-950 border border-white/10 rounded-2xl overflow-hidden hover:border-amber-400/50 transition-all duration-300 group shadow-xl flex flex-col">
                <div className="relative h-48 bg-slate-900 overflow-hidden">
                  <Image
                    src={vehicle.img}
                    alt={vehicle.name}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute top-3 right-3 bg-slate-950/80 backdrop-blur-md px-3 py-1 rounded-full border border-white/10 text-[10px] font-bold text-amber-400">
                    {vehicle.category}
                  </div>
                </div>

                <div className="p-6 space-y-4 flex-1 flex flex-col justify-between">
                  <div className="space-y-2">
                    <h3 className="text-lg font-bold text-slate-100 group-hover:text-amber-400 transition-colors">{vehicle.name}</h3>
                    <div className="flex items-center gap-4 text-xs text-slate-400">
                      <span className="flex items-center gap-1">
                        <Users className="w-3.5 h-3.5 text-amber-400" />
                        {vehicle.seats}
                      </span>
                      <span className="flex items-center gap-1">
                        <Shield className="w-3.5 h-3.5 text-emerald-400" />
                        GPS Enabled
                      </span>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-white/10 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] text-slate-400 block uppercase font-bold">Base Tariff</span>
                      <span className="text-base font-black text-amber-400">{vehicle.rate}</span>
                    </div>
                    <a
                      href="#book-widget"
                      className="inline-flex items-center gap-1 text-xs font-extrabold text-slate-100 bg-white/5 hover:bg-amber-500 hover:text-slate-950 px-4 py-2 rounded-lg transition-all border border-white/10"
                    >
                      <span>Book Now</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Safety & Quality Guarantee Banner */}
      <section className="py-20 bg-slate-950 px-4 sm:px-6 lg:px-8 border-b border-white/5">
        <div className="max-w-7xl mx-auto bg-gradient-to-r from-slate-900 via-slate-900/90 to-slate-950 border border-white/10 rounded-3xl p-8 md:p-12 relative overflow-hidden">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-center">
            <div className="space-y-3">
              <div className="w-12 h-12 bg-amber-500/10 border border-amber-500/20 rounded-2xl flex items-center justify-center">
                <ShieldCheck className="w-6 h-6 text-amber-400" />
              </div>
              <h3 className="text-xl font-bold text-slate-50">100% Police Verified Chauffeurs</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Background credentials, driving license history, and address records are verified before driver onboarding.
              </p>
            </div>

            <div className="space-y-3">
              <div className="w-12 h-12 bg-amber-500/10 border border-amber-500/20 rounded-2xl flex items-center justify-center">
                <Clock className="w-6 h-6 text-amber-400" />
              </div>
              <h3 className="text-xl font-bold text-slate-50">Guaranteed On-Time Pickup</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Automated driver dispatch alerts ensure cab placement at pickup location at least 10 minutes prior to scheduled time.
              </p>
            </div>

            <div className="space-y-3">
              <div className="w-12 h-12 bg-amber-500/10 border border-amber-500/20 rounded-2xl flex items-center justify-center">
                <Award className="w-6 h-6 text-amber-400" />
              </div>
              <h3 className="text-xl font-bold text-slate-50">Zero Cancellation Assurance</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Once confirmed, your ride is guaranteed. In the rare event of vehicle breakdown, a replacement is dispatched instantly.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Google Business Profile Verified Reviews Section */}
      <section className="py-24 bg-slate-900/40 px-4 sm:px-6 lg:px-8 border-b border-white/5 overflow-hidden">
        <div className="max-w-7xl mx-auto space-y-12">
          {/* Section Header with Carousel Navigation Controls */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div className="space-y-4 max-w-2xl">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-white/5 border border-white/10 rounded-full text-xs font-bold text-slate-200 backdrop-blur-md">
                <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                </svg>
                <span>Google Business Profile Verified Reviews</span>
              </div>
              <h2 className="text-3xl sm:text-5xl font-black text-slate-50 tracking-tight">
                {googleData.rating} ★★★★★ Rating on Google Maps
              </h2>
            </div>

            {/* Interactive Slide Controls & Navigation */}
            <div className="flex items-center gap-3 self-start md:self-auto">
              <button
                type="button"
                onClick={() => setActiveReviewIndex((prev) => (prev === 0 ? googleData.reviews.length - 1 : prev - 1))}
                className="w-11 h-11 rounded-xl bg-slate-950 border border-white/10 hover:border-amber-400/50 hover:bg-amber-500/10 text-slate-300 hover:text-amber-400 flex items-center justify-center transition-all shadow-lg active:scale-95 cursor-pointer"
                aria-label="Previous Review"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>

              <button
                type="button"
                onClick={() => setActiveReviewIndex((prev) => (prev + 1) % googleData.reviews.length)}
                className="w-11 h-11 rounded-xl bg-slate-950 border border-white/10 hover:border-amber-400/50 hover:bg-amber-500/10 text-slate-300 hover:text-amber-400 flex items-center justify-center transition-all shadow-lg active:scale-95 cursor-pointer"
                aria-label="Next Review"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Dynamic Interactive Cards Grid with Hover Animation */}
          <div 
            onMouseEnter={() => setIsReviewHovered(true)}
            onMouseLeave={() => setIsReviewHovered(false)}
            className="grid grid-cols-1 md:grid-cols-3 gap-8"
          >
            {Array.from({ length: Math.min(3, googleData.reviews.length) }, (_, i) => 
              googleData.reviews[(activeReviewIndex + i) % googleData.reviews.length]
            ).map((t, idx) => (
              <div 
                key={t.id || idx}
                className="bg-slate-950/90 border border-white/10 p-7 rounded-2xl space-y-6 hover:border-amber-400/50 hover:-translate-y-3 hover:shadow-2xl hover:shadow-amber-500/15 transition-all duration-500 group relative overflow-hidden flex flex-col justify-between"
              >
                {/* Glowing Top-Right Background Glow & Floating Quote Watermark */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 rounded-full blur-2xl group-hover:bg-amber-500/15 transition-all duration-500 pointer-events-none" />
                <Quote className="w-16 h-16 absolute -top-2 -right-2 text-white/5 group-hover:text-amber-400/20 group-hover:scale-125 group-hover:rotate-12 transition-all duration-500 pointer-events-none" />

                <div className="space-y-4 relative z-10">
                  {/* Rating Stars & Timestamp */}
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-1 bg-amber-500/10 border border-amber-500/20 px-2.5 py-1 rounded-full">
                      {[...Array(t.rating || 5)].map((_, i) => (
                        <Star key={i} className="w-3.5 h-3.5 fill-amber-400 text-amber-400 group-hover:scale-110 transition-transform duration-300" />
                      ))}
                      <span className="text-[10px] font-black text-amber-400 ml-1">5.0</span>
                    </div>

                    <span className="text-[10px] font-extrabold text-slate-400 bg-slate-900 border border-white/10 px-2.5 py-1 rounded-full font-mono">
                      {t.relativeTime}
                    </span>
                  </div>

                  {/* Review Text */}
                  <p className="text-slate-200 text-xs sm:text-sm leading-relaxed font-sans font-medium group-hover:text-slate-50 transition-colors duration-300">
                    "{t.text}"
                  </p>
                </div>

                {/* Author Info & Interactive Links */}
                <div className="border-t border-white/10 pt-5 space-y-3 relative z-10">
                  {t.tripType && (
                    <div className="inline-flex items-center gap-1.5 text-[9px] font-extrabold uppercase tracking-widest text-amber-400 bg-amber-500/10 px-2.5 py-0.5 rounded border border-amber-500/20">
                      <Sparkles className="w-2.5 h-2.5 text-amber-400" />
                      <span>{t.tripType}</span>
                    </div>
                  )}

                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      {t.authorPhoto ? (
                        <img
                          src={t.authorPhoto}
                          alt={t.authorName}
                          className="w-10 h-10 rounded-full object-cover border-2 border-amber-400/40 group-hover:border-amber-400 transition-colors shrink-0 shadow-md"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-500 to-amber-700 text-slate-950 font-black flex items-center justify-center text-sm border-2 border-amber-400/40 group-hover:border-amber-400 shrink-0 shadow-md">
                          {t.authorName?.charAt(0) || "G"}
                        </div>
                      )}

                      <div className="min-w-0 flex-1">
                        <div className="font-extrabold text-slate-100 text-xs sm:text-sm flex items-center gap-1.5 group-hover:text-amber-300 transition-colors">
                          <span className="truncate" title={t.authorName}>{t.authorName}</span>
                          <CheckCircle2 className="w-4 h-4 text-blue-400 shrink-0" />
                        </div>
                        <div className="text-[10px] text-slate-400 truncate flex items-center gap-1">
                          <ThumbsUp className="w-2.5 h-2.5 text-emerald-400" />
                          <span>Google Verified Customer</span>
                        </div>
                      </div>
                    </div>

                    <a
                      href={googleData.googleMapsUri}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 text-[10px] font-extrabold text-amber-400 hover:text-amber-300 bg-amber-500/10 hover:bg-amber-500/20 px-3 py-1.5 rounded-lg border border-amber-500/30 transition-all shrink-0 group/link"
                    >
                      <span>Maps</span>
                      <ArrowUpRight className="w-3 h-3 group-hover/link:translate-x-0.5 group-hover/link:-translate-y-0.5 transition-transform" />
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Interactive Pagination Indicators & Maps Link Button */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-6 pt-4 border-t border-white/5">
            {/* Pagination Dots */}
            <div className="flex items-center gap-2">
              {googleData.reviews.map((_, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setActiveReviewIndex(i)}
                  className={`h-2 rounded-full transition-all duration-300 cursor-pointer ${
                    i === activeReviewIndex 
                      ? "w-8 bg-amber-400 shadow-md shadow-amber-400/30" 
                      : "w-2 bg-white/20 hover:bg-white/40"
                  }`}
                  aria-label={`Go to slide ${i + 1}`}
                />
              ))}
            </div>

            {/* Read All Reviews Button */}
            <a
              href={googleData.googleMapsUri}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2.5 text-xs font-extrabold text-slate-950 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 px-7 py-3.5 rounded-xl transition-all shadow-xl shadow-amber-500/15 uppercase tracking-wider font-mono hover:scale-105 active:scale-95"
            >
              <span>Explore All Verified Google Reviews ({googleData.userRatingCount}+)</span>
              <ArrowUpRight className="w-4 h-4 text-slate-950" />
            </a>
          </div>
        </div>
      </section>

      {/* FAQ Accordion Section */}
      <section className="py-24 bg-slate-900/40 px-4 sm:px-6 lg:px-8 border-b border-white/5">
        <div className="max-w-4xl mx-auto space-y-12">
          <div className="text-center space-y-4">
            <span className="text-xs font-bold text-amber-400 uppercase tracking-wider block">Frequently Asked Questions</span>
            <h2 className="text-3xl sm:text-4xl font-black text-slate-50 tracking-tight">Got Questions? We Have Answers.</h2>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, idx) => (
              <div
                key={idx}
                className="bg-slate-950 border border-white/10 rounded-2xl overflow-hidden transition-all"
              >
                <button
                  type="button"
                  onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                  className="w-full text-left p-6 flex justify-between items-center font-bold text-slate-100 hover:text-amber-400 transition-colors"
                >
                  <span className="text-base">{faq.q}</span>
                  <ChevronDown className={`w-5 h-5 text-amber-400 transition-transform duration-300 ${openFaq === idx ? "rotate-180" : ""}`} />
                </button>
                {openFaq === idx && (
                  <div className="px-6 pb-6 text-sm text-slate-300 leading-relaxed border-t border-white/5 pt-4">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-20 bg-slate-950 text-slate-100 px-4 sm:px-6 lg:px-8 border-t border-white/5">
        <div className="max-w-5xl mx-auto space-y-8 text-center">
          <div className="space-y-3">
            <span className="text-xs font-bold text-amber-400 uppercase tracking-wider block">Get In Touch</span>
            <h2 className="text-3xl sm:text-4xl font-black text-slate-50 tracking-tight">
              Discuss Your Executive Transport & Fleet Requirements
            </h2>
            <p className="text-slate-300 text-sm leading-relaxed max-w-2xl mx-auto">
              Looking for a custom corporate fleet quote or employee logistics management? Reach out to our team directly.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
            <div className="bg-slate-900/60 border border-white/10 p-6 rounded-2xl space-y-3 flex flex-col items-center text-center">
              <div className="bg-white/5 p-3 rounded-xl text-amber-400">
                <Phone className="w-6 h-6" />
              </div>
              <div className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Call Support</div>
              <a href="tel:+919999999999" className="text-slate-200 font-bold hover:underline text-base">+91 99999 99999</a>
            </div>

            <div className="bg-slate-900/60 border border-white/10 p-6 rounded-2xl space-y-3 flex flex-col items-center text-center">
              <div className="bg-white/5 p-3 rounded-xl text-amber-400">
                <Mail className="w-6 h-6" />
              </div>
              <div className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Email Sales</div>
              <a href="mailto:info@temptravels.com" className="text-slate-200 font-bold hover:underline text-base">info@temptravels.com</a>
            </div>

            <div className="bg-slate-900/60 border border-white/10 p-6 rounded-2xl space-y-3 flex flex-col items-center text-center">
              <div className="bg-white/5 p-3 rounded-xl text-amber-400">
                <MapPin className="w-6 h-6" />
              </div>
              <div className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Corporate Office</div>
              <div className="text-slate-300 text-xs leading-relaxed">
                Flat No C-102, Shanti Vihar, Lokhandwala Complex, Kandivali East, Mumbai, MH 400101
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <Footer />
    </div>
  );
}
