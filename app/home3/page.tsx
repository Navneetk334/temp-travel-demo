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
  Aperture,
  Compass
} from "lucide-react";

export default function Home3Page() {
  const [loading, setLoading] = useState(true);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setTimeout(() => setLoading(false), 400);
          return 100;
        }
        return prev + 5;
      });
    }, 45);
    return () => clearInterval(interval);
  }, []);

  const replayAnimation = () => {
    setProgress(0);
    setLoading(true);
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
        <span className="px-2 text-amber-400 font-extrabold uppercase text-[10px] tracking-wider">STYLE 2: APERTURE IRIS</span>
        <button onClick={replayAnimation} className="p-1.5 bg-amber-400 text-slate-950 rounded-full hover:scale-105 transition-transform" title="Replay Animation">
          <RotateCcw className="w-3.5 h-3.5" />
        </button>
        <div className="h-4 w-px bg-white/20 mx-1" />
        <Link href="/home2" className="px-2.5 py-1 bg-white/10 hover:bg-white/20 text-slate-200 rounded-full font-bold">1</Link>
        <Link href="/home3" className="px-2.5 py-1 bg-amber-400 text-slate-950 rounded-full font-bold">2</Link>
        <Link href="/home4" className="px-2.5 py-1 bg-white/10 hover:bg-white/20 text-slate-200 rounded-full font-bold">3</Link>
        <Link href="/home5" className="px-2.5 py-1 bg-white/10 hover:bg-white/20 text-slate-200 rounded-full font-bold">4</Link>
      </div>

      {/* ENTRANCE ANIMATION STYLE 2: APERTURE IRIS LENS WIPE */}
      <AnimatePresence>
        {loading && (
          <motion.div
            initial={{ clipPath: "circle(150% at 50% 50%)" }}
            exit={{ clipPath: "circle(0% at 50% 50%)" }}
            transition={{ duration: 0.9, ease: [0.87, 0, 0.13, 1] }}
            className="fixed inset-0 z-[100] bg-slate-950 flex flex-col items-center justify-center pointer-events-auto"
          >
            {/* Outer Spinning Lens Ring */}
            <div className="relative flex items-center justify-center">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                className="w-44 h-44 rounded-full border-2 border-dashed border-amber-400/40 absolute"
              />
              <motion.div
                animate={{ rotate: -360 }}
                transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
                className="w-56 h-56 rounded-full border border-white/10 absolute"
              />

              {/* Central Glowing Icon */}
              <div className="bg-slate-900 border border-amber-400/50 p-6 rounded-full shadow-2xl shadow-amber-400/20 flex flex-col items-center justify-center text-center">
                <Aperture className="w-10 h-10 text-amber-400 animate-pulse" />
                <span className="text-xl font-black font-mono text-amber-400 mt-2">{progress}%</span>
              </div>
            </div>

            <div className="mt-8 text-center space-y-1">
              <span className="text-sm font-extrabold uppercase tracking-[0.3em] text-slate-200 block">Chauffeur Mobility Hub</span>
              <span className="text-[10px] font-mono text-amber-400 uppercase tracking-widest block">TEMP TRAVEL DISPATCH ENGINE</span>
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

        {/* Animated Hero Content with 3D Lens Reveal */}
        <motion.div
          initial={{ opacity: 0, scale: 0.85, rotateX: 15 }}
          animate={!loading ? { opacity: 1, scale: 1, rotateX: 0 } : {}}
          transition={{ duration: 0.9, ease: "easeOut", delay: 0.1 }}
          style={{ perspective: 1000 }}
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
