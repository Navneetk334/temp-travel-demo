"use client";

import React, { useState } from "react";
import Breadcrumbs from "@/components/shared/breadcrumbs";
import Link from "next/link";
import Image from "next/image";
import { 
  Building2, 
  Clock, 
  Plane, 
  MapPin, 
  Compass, 
  Globe, 
  Settings, 
  ArrowRight, 
  Sparkles, 
  CheckCircle2, 
  Star,
  ChevronRight,
  ShieldCheck
} from "lucide-react";

export default function ServicesStyle3Page() {
  const [activeIndex, setActiveIndex] = useState<number>(0);

  const breadcrumbsList = [
    { label: "Services Preview 3 (Stitch Spotlight Stage)", path: "/services3" },
  ];

  const services = [
    {
      id: "01",
      title: "Corporate Transportation",
      category: "Enterprise Fleet & Executive Commutes",
      image: "/images/services/corporate-transportation.jpg",
      icon: Building2,
      tag: "ISO 9001 CERTIFIED",
      rateBadge: "Custom B2B Tariffs",
      description: "End-to-end employee transit roster planning, executive rides, and custom logistics solutions for enterprise clients.",
      features: ["24/7 Command Center support", "ISO 9001:2015 compliant fleet", "Automated monthly invoice audits"],
      ctaText: "Setup Corporate Account",
      ctaLink: "/corporate-inquiry"
    },
    {
      id: "02",
      title: "Pickup & Drop",
      category: "Point-to-Point & Shift Commute Cabs",
      image: "/images/services/employee-commutes.jpg",
      icon: Clock,
      tag: "24/7 DISPATCH",
      rateBadge: "Shift Roster Rates",
      description: "Optimized route planning, bulk shift schedules, and safety-audited cab operations for individual and corporate staff commutes.",
      features: ["Real-time GPS tracking logs", "Late-night security escort protocols", "Roster optimization & fuel savings"],
      ctaText: "Book Pickup & Drop",
      ctaLink: "/book"
    },
    {
      id: "03",
      title: "Airport Transfer",
      category: "Metropolitan Airport Terminals",
      image: "/images/services/airport-transfers.jpg",
      icon: Plane,
      tag: "FLIGHT SYNCED",
      rateBadge: "Fixed Terminal Fare",
      description: "Timely airport pick-ups and drops at major metropolitan terminals with flight delay monitoring systems.",
      features: ["Complimentary flight tracking adjust", "Paging/meet-and-greet on request", "Fixed, transparent pricing models"],
      ctaText: "Book Airport Transfer",
      ctaLink: "/book"
    },
    {
      id: "04",
      title: "Local Car Rentals",
      category: "Chauffeur-Driven Hourly Slabs",
      image: "/images/services/local-rentals.jpg",
      icon: Clock,
      tag: "8 HR / 80 KM SLABS",
      rateBadge: "From ₹12/km",
      description: "Chauffeur-driven local hourly packages (e.g. 8 Hrs / 80 Kms) for city shopping, business meetings, and event travels.",
      features: ["Choose hatchbacks, sedans, or SUVs", "Professional driver navigations", "Flexible extra hour/km billing"],
      ctaText: "Rent Local Cab",
      ctaLink: "/book"
    },
    {
      id: "05",
      title: "Outstation Car Rentals",
      category: "Intercity Highway Trips",
      image: "/images/services/outstation-cabs.jpg",
      icon: MapPin,
      tag: "STATE PERMIT INCLUDED",
      rateBadge: "From ₹16/km",
      description: "Comfortable commercial vehicles with outstation licenses for intercity business trips, family trips, and weekend getaways.",
      features: ["One-way and round-trip routes", "Verified highway-trained drivers", "Toll/permit inclusive options"],
      ctaText: "Book Outstation Trip",
      ctaLink: "/book"
    },
    {
      id: "06",
      title: "Domestic Tour Packages",
      category: "Indian Destinations & Heritage",
      image: "/images/services/domestic-tours.jpg",
      icon: Compass,
      tag: "CURATED HOLIDAYS",
      rateBadge: "All Inclusive Stay + Cab",
      description: "Curated domestic holiday itineraries covering hill stations, beaches, heritage spots, and pilgrimage trails across India.",
      features: ["Includes transport, stay, and breakfast", "Flexible itinerary alterations", "Local sightseeing guides included"],
      ctaText: "Browse Domestic Packages",
      ctaLink: "/tours?category=domestic"
    },
    {
      id: "07",
      title: "International Tour Packages",
      category: "Global Destinations & Luxury Stays",
      image: "/images/services/international-tours.jpg",
      icon: Globe,
      tag: "FLIGHTS & HOTELS",
      rateBadge: "Bespoke Packages",
      description: "Premium international tour itineraries covering popular destinations with flights, luxury hotels, and local ground transfers.",
      features: ["Visa and insurance documentation assist", "Handpicked 4-star and 5-star hotels", "Bilingual tour guides"],
      ctaText: "Browse International Packages",
      ctaLink: "/tours?category=international"
    },
    {
      id: "08",
      title: "Customized Travel Solution",
      category: "VIP Delegations & Event Bus Fleets",
      image: "/images/services/customized-travel.jpg",
      icon: Settings,
      tag: "BESPOKE PLANNING",
      rateBadge: "Custom Quotes",
      description: "Tailor-made itineraries, VIP event fleets, and bespoke transport packages designed to meet your specific travel ideas.",
      features: ["Dedicated tour desk counselor", "Custom hotel and transport configs", "Group travel and bus coach hires"],
      ctaText: "Discuss Your Plan",
      ctaLink: "/contact"
    }
  ];

  const activeService = services[activeIndex];
  const ActiveIcon = activeService.icon;

  return (
    <div className="bg-slate-950 text-slate-100 min-h-screen">
      <Breadcrumbs items={breadcrumbsList} />

      {/* Header Banner */}
      <section className="py-12 px-4 sm:px-8 lg:px-12 xl:px-16 max-w-[1750px] mx-auto text-center space-y-4">
        <span className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-[0.3em] text-amber-400 bg-amber-500/10 border border-amber-500/20 px-4 py-1.5 rounded-full">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Stitch Design System: Floating Spotlight Stage</span>
        </span>
        <h1 className="text-4xl sm:text-6xl font-black text-slate-50 tracking-tight">
          Stitch Interactive <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-amber-200 to-amber-500">Service Stage</span>
        </h1>
        <p className="text-slate-400 text-sm sm:text-base max-w-2xl mx-auto">
          Click any service card in the horizontal track below to elevate it to the central Luminescent Spotlight Canvas.
        </p>
      </section>

      {/* MAIN SPOTLIGHT STAGE */}
      <section className="px-4 sm:px-8 lg:px-12 xl:px-16 max-w-[1750px] mx-auto pb-12">
        <div className="bg-slate-900/80 border border-amber-400/40 rounded-3xl p-6 sm:p-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center shadow-2xl relative overflow-hidden backdrop-blur-xl">
          {/* Ambient Glow Orb */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl from-amber-500/20 to-transparent rounded-full blur-3xl pointer-events-none" />

          {/* Left: Active Service Image */}
          <div className="lg:col-span-6 relative h-80 sm:h-[420px] w-full rounded-2xl overflow-hidden border border-white/10 shrink-0">
            <Image
              src={activeService.image}
              alt={activeService.title}
              fill
              className="object-cover transition-transform duration-700"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/30 to-transparent" />
            
            <div className="absolute top-4 left-4 flex gap-2">
              <span className="bg-slate-950/90 border border-amber-400/40 px-3 py-1 rounded-full text-[10px] font-black text-amber-400 uppercase tracking-widest flex items-center gap-1.5">
                <ActiveIcon className="w-3.5 h-3.5" />
                <span>{activeService.tag}</span>
              </span>
            </div>

            <div className="absolute bottom-6 left-6 right-6">
              <span className="text-xs font-mono text-amber-400 uppercase tracking-widest block">{activeService.category}</span>
              <h2 className="text-3xl sm:text-4xl font-black text-slate-50 mt-1">{activeService.title}</h2>
            </div>
          </div>

          {/* Right: Detailed Content & Features */}
          <div className="lg:col-span-6 space-y-6 relative z-10">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <span className="text-2xl font-black font-mono text-amber-400">{activeService.id} / 08</span>
              <span className="bg-amber-400/10 text-amber-300 border border-amber-400/30 px-3 py-1 rounded-full text-xs font-extrabold">
                {activeService.rateBadge}
              </span>
            </div>

            <p className="text-sm sm:text-base text-slate-300 leading-relaxed font-medium">
              {activeService.description}
            </p>

            <div className="space-y-3">
              <span className="text-xs font-extrabold uppercase tracking-widest text-slate-400 block">Service Inclusions & Guarantees</span>
              <div className="space-y-2">
                {activeService.features.map((feat, fIdx) => (
                  <div key={fIdx} className="flex items-center gap-3 bg-slate-950 p-3 rounded-xl border border-white/10 text-xs font-bold text-slate-200">
                    <ShieldCheck className="w-4 h-4 text-amber-400 shrink-0" />
                    <span>{feat}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-2">
              <Link
                href={activeService.ctaLink}
                className="inline-flex items-center gap-3 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 text-slate-950 font-black px-8 py-4 rounded-xl text-xs uppercase tracking-wider transition-all shadow-xl shadow-amber-400/20"
              >
                <span>{activeService.ctaText}</span>
                <ArrowRight className="w-4 h-4 text-slate-950" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* HORIZONTAL CAROUSEL SELECTOR TRACK */}
      <section className="pb-24 px-4 sm:px-8 lg:px-12 xl:px-16 max-w-[1750px] mx-auto">
        <div className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4 flex items-center justify-between">
          <span>Select Service Module to Preview ({services.length})</span>
          <span className="text-amber-400">Click card to switch stage</span>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3">
          {services.map((item, idx) => {
            const Icon = item.icon;
            const isSelected = activeIndex === idx;

            return (
              <button
                key={item.id}
                onClick={() => setActiveIndex(idx)}
                className={`p-4 rounded-2xl border text-left transition-all duration-300 cursor-pointer flex flex-col justify-between h-36 ${
                  isSelected
                    ? "bg-amber-400 text-slate-950 border-amber-400 shadow-xl shadow-amber-400/20 scale-105"
                    : "bg-slate-900/60 border-white/10 hover:border-white/30 text-slate-300 hover:text-white"
                }`}
              >
                <div className="flex justify-between items-start">
                  <Icon className={`w-5 h-5 ${isSelected ? "text-slate-950" : "text-amber-400"}`} />
                  <span className={`text-[10px] font-mono font-bold ${isSelected ? "text-slate-900" : "text-slate-500"}`}>
                    {item.id}
                  </span>
                </div>

                <div>
                  <h4 className={`text-xs font-black leading-tight line-clamp-2 ${isSelected ? "text-slate-950" : "text-slate-100"}`}>
                    {item.title}
                  </h4>
                </div>
              </button>
            );
          })}
        </div>
      </section>
    </div>
  );
}
