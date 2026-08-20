"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
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
  Sparkles,
  CheckCircle2,
  ChevronDown,
  Shield,
  RotateCcw,
  Sparkle
} from "lucide-react";

export default function Home2Page() {
  const [loading, setLoading] = useState(true);
  const [progress, setProgress] = useState(0);
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  // Counter timer logic
  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setTimeout(() => setLoading(false), 300);
          return 100;
        }
        return prev + 4;
      });
    }, 40);
    return () => clearInterval(interval);
  }, []);

  const replayAnimation = () => {
    setProgress(0);
    setLoading(true);
  };

  const DEFAULT_FEATURED = [
    { id: "1", name: "Maruti Suzuki Swift Dzire", category: "Compact Sedan", seats: "4 Passengers", rate: "₹12/km", img: "/images/fleet-suv.png" },
    { id: "2", name: "Honda City / Hyundai Verna", category: "Executive Sedan", seats: "4 Passengers", rate: "₹18/km", img: "/images/hero-cover.png" },
    { id: "3", name: "Mercedes-Benz E-Class", category: "Luxury Sedan", seats: "4 Passengers", rate: "₹65/km", img: "/images/hero-cover.png" }
  ];

  const [featuredVehicles, setFeaturedVehicles] = useState<any[]>([]);
  const [vehiclesLoading, setVehiclesLoading] = useState<boolean>(true);

  const [googleData] = useState<{
    rating: number;
    userRatingCount: number;
    googleMapsUri: string;
    reviews: any[];
  }>({
    rating: 5.0,
    userRatingCount: 120,
    googleMapsUri: "https://www.google.com/maps/place/?q=place_id:ChIJ5Zoykd0bDTkRc8tFlL_O6rY",
    reviews: [
      { authorAttribution: { displayName: "Rohan Malhotra" }, rating: 5, relativePublishTimeDescription: "2 weeks ago", text: { text: "Outstanding executive car service in Delhi NCR. Always on time, spotless vehicles, and professional drivers." } },
      { authorAttribution: { displayName: "Priya Sharma" }, rating: 5, relativePublishTimeDescription: "1 month ago", text: { text: "Booked an Innova Crysta for outstation travel. Impeccable service, automated billing, and transparent pricing." } },
      { authorAttribution: { displayName: "Vikram Sengupta" }, rating: 5, relativePublishTimeDescription: "3 weeks ago", text: { text: "Temp Travel manages our daily corporate mobility roster. Highly reliable SLA compliance and 24/7 support." } }
    ]
  });

  useEffect(() => {
    async function fetchFeaturedVehicles() {
      try {
        const res = await fetch("/api/vehicles/featured");
        if (res.ok) {
          const data = await res.json();
          if (data && data.length > 0) {
            setFeaturedVehicles(data);
          } else {
            setFeaturedVehicles(DEFAULT_FEATURED);
          }
        } else {
          setFeaturedVehicles(DEFAULT_FEATURED);
        }
      } catch (err) {
        setFeaturedVehicles(DEFAULT_FEATURED);
      } finally {
        setVehiclesLoading(false);
      }
    }
    fetchFeaturedVehicles();
  }, []);

  const businessSchema = {
    "@context": "https://schema.org",
    "@type": "CarRental",
    "name": "TEMP TRAVEL CAR RENTALS PVT LTD",
    "url": "https://temptravels.com",
    "logo": "https://temptravels.com/images/logo.png",
    "description": "Premier corporate transit, daily employee shuttles, airport transfers, and outstation luxury car rentals across India.",
    "telephone": "+919999999111",
    "address": {
      "@type": "PostalAddress",
      "streetAddress": "Plot No. 183, Kh No. 16/2, A-Block, Qutub Vihar PH-I",
      "addressLocality": "New Delhi",
      "postalCode": "110071",
      "addressCountry": "IN"
    }
  };

  const faqItems = [
    { q: "How do I book an executive car with Temp Travel?", a: "You can instantly book via our 24/7 web booking widget above, or call our corporate helpdesk at +91 99999 99111." },
    { q: "Are drivers background verified and trained for compliance?", a: "Yes. All chauffeurs undergo criminal background checks, local police verification, defensive driving training, and protocol orientation." },
    { q: "What is included in Outstation & Local Hourly Rental packages?", a: "Local packages include dedicated vehicle and chauffeur for fixed hour/km slabs (e.g. 8 Hrs/80 Kms). Outstation fares cover point-to-point route distances." },
    { q: "Do you offer automated billing and GST compliant invoices?", a: "Corporate accounts receive automated monthly consolidated billing, detailed trip logs, live GPS proof-of-transit, and instant tax-compliant GST invoices." }
  ];

  return (
    <div className="bg-slate-950 text-slate-100 min-h-screen font-sans selection:bg-amber-500 selection:text-slate-950 relative overflow-hidden">
      <JsonLd data={businessSchema} />

      {/* Floating Demo Switcher Ribbon */}
      <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 bg-slate-900/90 border border-amber-400/40 p-2 rounded-full shadow-2xl backdrop-blur-xl text-xs font-bold text-slate-200">
        <span className="px-2 text-amber-400 font-extrabold uppercase text-[10px] tracking-wider">STYLE 1: SPLIT SHUTTER</span>
        <button onClick={replayAnimation} className="p-1.5 bg-amber-400 text-slate-950 rounded-full hover:scale-105 transition-transform" title="Replay Animation">
          <RotateCcw className="w-3.5 h-3.5" />
        </button>
        <div className="h-4 w-px bg-white/20 mx-1" />
        <Link href="/home2" className="px-2.5 py-1 bg-amber-400 text-slate-950 rounded-full font-bold">1</Link>
        <Link href="/home3" className="px-2.5 py-1 bg-white/10 hover:bg-white/20 text-slate-200 rounded-full font-bold">2</Link>
        <Link href="/home4" className="px-2.5 py-1 bg-white/10 hover:bg-white/20 text-slate-200 rounded-full font-bold">3</Link>
        <Link href="/home5" className="px-2.5 py-1 bg-white/10 hover:bg-white/20 text-slate-200 rounded-full font-bold">4</Link>
      </div>

      {/* ENTRANCE ANIMATION STYLE 1: SPLIT CURTAIN SHUTTER + DIGITAL COUNTER */}
      <AnimatePresence>
        {loading && (
          <div className="fixed inset-0 z-[100] flex flex-col justify-between pointer-events-auto">
            {/* Top Shutter */}
            <motion.div
              initial={{ y: 0 }}
              exit={{ y: "-100%" }}
              transition={{ duration: 0.8, ease: [0.77, 0, 0.175, 1] }}
              className="w-full h-1/2 bg-slate-950 border-b border-amber-500/20 flex flex-col items-center justify-end pb-8 relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-radial from-amber-500/10 via-transparent to-transparent opacity-60 pointer-events-none" />
              <div className="flex items-center gap-3">
                <Car className="w-8 h-8 text-amber-400 animate-bounce" />
                <span className="text-2xl font-black tracking-tight uppercase text-slate-50">TEMP TRAVEL</span>
              </div>
              <span className="text-[10px] font-black uppercase tracking-[0.3em] text-amber-400 mt-1">Car Rentals Pvt Ltd</span>
            </motion.div>

            {/* Middle Progress Counter Badge */}
            <motion.div
              exit={{ scale: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20 bg-slate-900 border border-amber-400/40 rounded-full px-8 py-3 shadow-2xl flex items-center gap-4 backdrop-blur-xl"
            >
              <Sparkle className="w-4 h-4 text-amber-400 animate-spin" />
              <span className="text-2xl font-black font-mono text-amber-400">{progress}%</span>
              <span className="text-xs uppercase font-extrabold tracking-widest text-slate-400">Initializing Fleet</span>
            </motion.div>

            {/* Bottom Shutter */}
            <motion.div
              initial={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ duration: 0.8, ease: [0.77, 0, 0.175, 1] }}
              className="w-full h-1/2 bg-slate-950 border-t border-amber-500/20 flex flex-col items-center justify-start pt-8"
            >
              <div className="w-48 h-1 bg-white/10 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-amber-400 to-amber-500 transition-all duration-75" style={{ width: `${progress}%` }} />
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Header */}
      <Header />

      {/* Hero Section */}
      <section className="relative min-h-[92vh] flex flex-col justify-center items-center pt-32 sm:pt-36 lg:pt-40 pb-20 px-4 md:px-8 overflow-hidden bg-slate-950">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[500px] bg-gradient-to-tr from-amber-500/20 via-blue-600/15 to-transparent rounded-full blur-[140px] pointer-events-none z-0" />
        
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

        {/* Animated Hero Content */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={!loading ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="relative z-10 w-full max-w-[1750px] mx-auto px-4 sm:px-8 lg:px-12 xl:px-16 text-center space-y-6 mb-12"
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-amber-500/10 border border-amber-500/30 rounded-full text-amber-400 text-xs font-extrabold uppercase tracking-widest backdrop-blur-md shadow-lg">
            <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
            <span>India's Premier Chauffeur Fleet & Transit Management</span>
          </div>

          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black text-slate-50 tracking-tight leading-[1.1] max-w-5xl mx-auto">
            Executive Corporate Transit <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-amber-400 to-amber-500 drop-shadow-sm">
              & Luxury Fleet Rentals
            </span>
          </h1>

          <p className="text-slate-300 max-w-3xl mx-auto text-base sm:text-lg leading-relaxed font-medium">
            Delivering ISO-certified employee mobility rosters, executive airport chauffeuring, and seamless outstation travel across India with 24/7 live dispatch controls.
          </p>

          <div className="flex flex-wrap justify-center gap-4 sm:gap-6 pt-2 text-xs sm:text-sm font-semibold text-slate-300">
            <div className="flex items-center gap-2 bg-white/5 border border-white/10 px-4 py-2 rounded-full backdrop-blur-md">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>90,000+ Verified Passengers Transported</span>
            </div>
            <div className="flex items-center gap-2 bg-white/5 border border-white/10 px-4 py-2 rounded-full backdrop-blur-md">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>99.0% On-Time SLA Guarantee</span>
            </div>
            <div className="flex items-center gap-2 bg-white/5 border border-white/10 px-4 py-2 rounded-full backdrop-blur-md">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Pan-India Metropolitan Coverage</span>
            </div>
          </div>
        </motion.div>

        {/* Animated Booking Widget */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={!loading ? { opacity: 1, scale: 1, y: 0 } : {}}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="relative z-10 w-full max-w-[1750px] mx-auto"
        >
          <BookingWidget />
        </motion.div>
      </section>

      {/* Corporate Commute Banner */}
      <section className="py-20 bg-slate-950 border-t border-white/5 relative z-10">
        <div className="max-w-[1750px] mx-auto px-4 sm:px-8 lg:px-12 xl:px-16">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            <div className="lg:col-span-6 space-y-6">
              <span className="text-xs font-extrabold text-amber-400 uppercase tracking-widest bg-amber-500/10 border border-amber-500/20 px-3.5 py-1.5 rounded-full inline-block">
                Corporate Mobility Roster
              </span>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-50 tracking-tight leading-tight">
                Enterprise Commute & Executive Mobility Solved
              </h2>
              <p className="text-slate-300 text-base leading-relaxed">
                Temp Travel provides custom corporate transit fleets, daily employee pick-and-drop rosters, executive airport transfers, and long-term lease vehicles for multinational enterprises across India.
              </p>
              <div className="grid grid-cols-2 gap-4 pt-2">
                <div className="bg-slate-900/60 border border-white/5 p-4 rounded-xl space-y-1">
                  <ShieldCheck className="w-6 h-6 text-amber-400" />
                  <div className="font-extrabold text-slate-100">Verified Chauffeurs</div>
                  <div className="text-xs text-slate-400">Strict background checks & protocol orientation.</div>
                </div>
                <div className="bg-slate-900/60 border border-white/5 p-4 rounded-xl space-y-1">
                  <Clock className="w-6 h-6 text-amber-400" />
                  <div className="font-extrabold text-slate-100">24/7 Live Desk</div>
                  <div className="text-xs text-slate-400">Real-time GPS tracking & SLA monitoring.</div>
                </div>
              </div>
            </div>
            <div className="lg:col-span-6">
              <div className="relative rounded-2xl overflow-hidden border border-white/10 shadow-2xl bg-slate-900 h-[400px]">
                <Image src="/images/hero-cover.png" alt="Corporate Fleet Transit" fill className="object-cover opacity-80" />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent" />
                <div className="absolute bottom-6 left-6 right-6 bg-slate-950/85 backdrop-blur-md p-6 rounded-xl border border-white/10 space-y-2">
                  <div className="text-xs font-bold text-amber-400 uppercase tracking-widest">ISO 9001:2015 Compliant Fleet</div>
                  <div className="text-lg font-bold text-slate-50">121+ Satisfied Corporate Clients</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
