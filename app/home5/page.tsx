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
  Gauge,
  Activity
} from "lucide-react";

export default function Home5Page() {
  const [loading, setLoading] = useState(true);
  const [headlightsOn, setHeadlightsOn] = useState(false);

  useEffect(() => {
    const timer1 = setTimeout(() => setHeadlightsOn(true), 600);
    const timer2 = setTimeout(() => setLoading(false), 1500);
    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
    };
  }, []);

  const replayAnimation = () => {
    setHeadlightsOn(false);
    setLoading(true);
    setTimeout(() => setHeadlightsOn(true), 600);
    setTimeout(() => setLoading(false), 1500);
  };

  const businessSchema = {
    "@context": "https://schema.org",
    "@type": "CarRental",
    "name": "TEMP TRAVEL CAR RENTALS PVT LTD",
    "url": "https://temptravels.com"
  };

  return (
    <div className="bg-slate-950 text-slate-100 min-h-screen font-sans selection:bg-amber-500 selection:text-slate-950 relative overflow-hidden">
      <JsonLd data={businessSchema} />

      {/* Floating Demo Switcher Ribbon */}
      <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 bg-slate-900/90 border border-amber-400/40 p-2 rounded-full shadow-2xl backdrop-blur-xl text-xs font-bold text-slate-200">
        <span className="px-2 text-amber-400 font-extrabold uppercase text-[10px] tracking-wider">STYLE 4: HEADLIGHT MOTION ZOOM</span>
        <button onClick={replayAnimation} className="p-1.5 bg-amber-400 text-slate-950 rounded-full hover:scale-105 transition-transform" title="Replay Animation">
          <RotateCcw className="w-3.5 h-3.5" />
        </button>
        <div className="h-4 w-px bg-white/20 mx-1" />
        <Link href="/home2" className="px-2.5 py-1 bg-white/10 hover:bg-white/20 text-slate-200 rounded-full font-bold">1</Link>
        <Link href="/home3" className="px-2.5 py-1 bg-white/10 hover:bg-white/20 text-slate-200 rounded-full font-bold">2</Link>
        <Link href="/home4" className="px-2.5 py-1 bg-white/10 hover:bg-white/20 text-slate-200 rounded-full font-bold">3</Link>
        <Link href="/home5" className="px-2.5 py-1 bg-amber-400 text-slate-950 rounded-full font-bold">4</Link>
      </div>

      {/* ENTRANCE ANIMATION STYLE 4: DYNAMIC 3D HEADLIGHT BEAM & MOTION ZOOM */}
      <AnimatePresence>
        {loading && (
          <motion.div
            initial={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.35, filter: "blur(20px)" }}
            transition={{ duration: 0.8, ease: [0.7, 0, 0.3, 1] }}
            className="fixed inset-0 z-[100] bg-slate-950 flex flex-col items-center justify-center pointer-events-auto overflow-hidden"
          >
            {/* Fog & Headlight Beams */}
            <div className="relative w-80 h-40 flex items-center justify-between px-8">
              {/* Left Headlight */}
              <motion.div
                animate={headlightsOn ? { scale: [1, 1.4, 1.2], opacity: [0.3, 1, 0.9] } : { opacity: 0.2 }}
                transition={{ duration: 0.6 }}
                className="w-12 h-12 rounded-full bg-amber-400 shadow-[0_0_80px_40px_rgba(245,158,11,0.9)] flex items-center justify-center"
              >
                <Gauge className="w-6 h-6 text-slate-950 animate-pulse" />
              </motion.div>

              {/* Center Vehicle Grille Silhouette */}
              <div className="flex flex-col items-center space-y-1">
                <Car className="w-12 h-12 text-slate-400 opacity-60" />
                <span className="text-[10px] font-extrabold uppercase tracking-[0.3em] text-amber-400">ENGINE READY</span>
              </div>

              {/* Right Headlight */}
              <motion.div
                animate={headlightsOn ? { scale: [1, 1.4, 1.2], opacity: [0.3, 1, 0.9] } : { opacity: 0.2 }}
                transition={{ duration: 0.6 }}
                className="w-12 h-12 rounded-full bg-amber-400 shadow-[0_0_80px_40px_rgba(245,158,11,0.9)] flex items-center justify-center"
              >
                <Gauge className="w-6 h-6 text-slate-950 animate-pulse" />
              </motion.div>
            </div>

            <div className="mt-8 text-center space-y-2">
              <div className="flex items-center gap-1 justify-center text-emerald-400 text-xs font-mono">
                <Activity className="w-4 h-4 animate-pulse" />
                <span>IGNITION VERIFIED • TEMP TRAVEL</span>
              </div>
              <h2 className="text-2xl font-black uppercase tracking-tight text-slate-50">Welcome to Executive Mobility</h2>
            </div>
          </motion.div>
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

        {/* Motion Zoomed Hero Content */}
        <motion.div
          initial={{ opacity: 0, scale: 1.15, filter: "blur(10px)" }}
          animate={!loading ? { opacity: 1, scale: 1, filter: "blur(0px)" } : {}}
          transition={{ duration: 0.9, delay: 0.1 }}
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
          initial={{ opacity: 0, y: 30 }}
          animate={!loading ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="relative z-10 w-full max-w-[1750px] mx-auto"
        >
          <BookingWidget />
        </motion.div>
      </section>

      <Footer />
    </div>
  );
}
