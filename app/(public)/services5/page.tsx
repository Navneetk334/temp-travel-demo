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
  ShieldCheck,
  UserCheck
} from "lucide-react";

export default function ServicesStyle5Page() {
  const [selectedFilter, setSelectedFilter] = useState<string>("ALL");

  const breadcrumbsList = [
    { label: "Services Preview 5 (Stitch Concierge Deck)", path: "/services5" },
  ];

  const services = [
    {
      id: "1",
      catGroup: "CORPORATE",
      title: "Corporate Transportation",
      tagline: "Enterprise Commute & Roster Planning",
      image: "/images/services/corporate-transportation.jpg",
      icon: Building2,
      priceBadge: "Enterprise Contract Tariffs",
      fleetTypes: "Sedans, SUVs, Buses",
      description: "End-to-end employee transit roster planning, executive rides, and custom logistics solutions for enterprise clients.",
      features: ["24/7 Command Center support", "ISO 9001:2015 compliant fleet", "Automated monthly invoice audits"],
      ctaText: "Setup Corporate Account",
      ctaLink: "/corporate-inquiry"
    },
    {
      id: "2",
      catGroup: "COMMUTE",
      title: "Pickup & Drop",
      tagline: "Shift Commute & Doorstep Pickups",
      image: "/images/services/employee-commutes.jpg",
      icon: Clock,
      priceBadge: "Flexible Shift Slabs",
      fleetTypes: "Dzire, Innova, Tempo",
      description: "Optimized route planning, bulk shift schedules, and safety-audited cab operations for individual and corporate staff commutes.",
      features: ["Real-time GPS tracking logs", "Late-night security escort protocols", "Roster optimization & fuel savings"],
      ctaText: "Book Pickup & Drop",
      ctaLink: "/book"
    },
    {
      id: "3",
      catGroup: "COMMUTE",
      title: "Airport Transfer",
      tagline: "Punctual Terminal Pickups & Flight Sync",
      image: "/images/services/airport-transfers.jpg",
      icon: Plane,
      priceBadge: "Fixed Flat Terminal Fare",
      fleetTypes: "Exec Sedans & SUVs",
      description: "Timely airport pick-ups and drops at major metropolitan terminals with flight delay monitoring systems.",
      features: ["Complimentary flight tracking adjust", "Paging/meet-and-greet on request", "Fixed, transparent pricing models"],
      ctaText: "Book Airport Transfer",
      ctaLink: "/book"
    },
    {
      id: "4",
      catGroup: "RENTALS",
      title: "Local Car Rentals",
      tagline: "Chauffeur Packages for City Travel",
      image: "/images/services/local-rentals.jpg",
      icon: Clock,
      priceBadge: "8 Hrs / 80 Km Slabs (₹12/km)",
      fleetTypes: "Compact to Luxury",
      description: "Chauffeur-driven local hourly packages (e.g. 8 Hrs / 80 Kms) for city shopping, business meetings, and event travels.",
      features: ["Choose hatchbacks, sedans, or SUVs", "Professional driver navigations", "Flexible extra hour/km billing"],
      ctaText: "Rent Local Cab",
      ctaLink: "/book"
    },
    {
      id: "5",
      catGroup: "RENTALS",
      title: "Outstation Car Rentals",
      tagline: "Highway Intercity Trips & Permits",
      image: "/images/services/outstation-cabs.jpg",
      icon: MapPin,
      priceBadge: "From ₹16/km (Tolls Incl.)",
      fleetTypes: "Innova, Fortuner, SUV",
      description: "Comfortable commercial vehicles with outstation licenses for intercity business trips, family trips, and weekend getaways.",
      features: ["One-way and round-trip routes", "Verified highway-trained drivers", "Toll/permit inclusive options"],
      ctaText: "Book Outstation Trip",
      ctaLink: "/book"
    },
    {
      id: "6",
      catGroup: "TOURS",
      title: "Domestic Tour Packages",
      tagline: "Curated Indian Destinations & Stay",
      image: "/images/services/domestic-tours.jpg",
      icon: Compass,
      priceBadge: "Cab + Hotel + Meals",
      fleetTypes: "Dedicated Chauffeur",
      description: "Curated domestic holiday itineraries covering hill stations, beaches, heritage spots, and pilgrimage trails across India.",
      features: ["Includes transport, stay, and breakfast", "Flexible itinerary alterations", "Local sightseeing guides included"],
      ctaText: "Browse Domestic Packages",
      ctaLink: "/tours?category=domestic"
    },
    {
      id: "7",
      catGroup: "TOURS",
      title: "International Tour Packages",
      tagline: "Global Holidays, Visa & Flights",
      image: "/images/services/international-tours.jpg",
      icon: Globe,
      priceBadge: "4-Star / 5-Star Resorts",
      fleetTypes: "Bilingual Sightseeing",
      description: "Premium international tour itineraries covering popular destinations with flights, luxury hotels, and local ground transfers.",
      features: ["Visa and insurance documentation assist", "Handpicked 4-star and 5-star hotels", "Bilingual tour guides"],
      ctaText: "Browse International Packages",
      ctaLink: "/tours?category=international"
    },
    {
      id: "8",
      catGroup: "CUSTOM",
      title: "Customized Travel Solution",
      tagline: "Bespoke VIP Delegations & Bus Fleets",
      image: "/images/services/customized-travel.jpg",
      icon: Settings,
      priceBadge: "Bespoke Quotations",
      fleetTypes: "Luxury Coaches & VIP",
      description: "Tailor-made itineraries, VIP event fleets, and bespoke transport packages designed to meet your specific travel ideas.",
      features: ["Dedicated tour desk counselor", "Custom hotel and transport configs", "Group travel and bus coach hires"],
      ctaText: "Discuss Your Plan",
      ctaLink: "/contact"
    }
  ];

  const filtered = services.filter((s) => selectedFilter === "ALL" || s.catGroup === selectedFilter);

  return (
    <div className="bg-slate-950 text-slate-100 min-h-screen">
      <Breadcrumbs items={breadcrumbsList} />

      {/* Header Banner */}
      <section className="py-12 px-4 sm:px-8 lg:px-12 xl:px-16 max-w-[1750px] mx-auto text-center space-y-4">
        <span className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-[0.3em] text-amber-400 bg-amber-500/10 border border-amber-500/20 px-4 py-1.5 rounded-full">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Stitch Design System: Chauffeur Concierge Deck</span>
        </span>
        <h1 className="text-4xl sm:text-6xl font-black text-slate-50 tracking-tight">
          Stitch Luxury <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-amber-200 to-amber-500">Concierge Deck</span>
        </h1>
        <p className="text-slate-400 text-sm sm:text-base max-w-2xl mx-auto">
          Horizontal luxury concierge cards with pricing badges, fleet type tags, and direct dispatch triggers.
        </p>

        {/* Filter Bar */}
        <div className="pt-6 flex flex-wrap items-center justify-center gap-2">
          {[
            { id: "ALL", name: "All Modules (8)" },
            { id: "CORPORATE", name: "Corporate B2B" },
            { id: "COMMUTE", name: "Commute & Airport" },
            { id: "RENTALS", name: "Car Rentals" },
            { id: "TOURS", name: "Holiday Tours" },
            { id: "CUSTOM", name: "Bespoke" },
          ].map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedFilter(cat.id)}
              className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all duration-300 ${
                selectedFilter === cat.id
                  ? "bg-amber-400 text-slate-950 shadow-lg shadow-amber-400/20 scale-105"
                  : "bg-slate-900 border border-white/10 text-slate-400 hover:text-white"
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>
      </section>

      {/* Concierge Deck Grid */}
      <section className="pb-24 px-4 sm:px-8 lg:px-12 xl:px-16 max-w-[1750px] mx-auto space-y-6">
        {filtered.map((item) => {
          const Icon = item.icon;
          return (
            <div
              key={item.id}
              className="bg-slate-900/60 backdrop-blur-xl border border-white/10 rounded-3xl p-6 sm:p-8 flex flex-col lg:flex-row items-center justify-between gap-6 hover:border-amber-400/50 transition-all duration-300 shadow-2xl group"
            >
              {/* Left Photo & Title */}
              <div className="flex flex-col sm:flex-row items-center gap-6 w-full lg:w-7/12">
                <div className="relative h-44 w-full sm:w-56 rounded-2xl overflow-hidden border border-white/10 shrink-0">
                  <Image
                    src={item.image}
                    alt={item.title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent" />
                  <span className="absolute top-2 left-2 bg-slate-950/90 text-amber-400 border border-amber-400/30 text-[9px] font-black uppercase px-2.5 py-1 rounded-md">
                    {item.fleetTypes}
                  </span>
                </div>

                <div className="space-y-2 text-center sm:text-left">
                  <div className="flex items-center justify-center sm:justify-start gap-2">
                    <Icon className="w-5 h-5 text-amber-400" />
                    <span className="text-xs font-mono font-bold text-amber-400 uppercase tracking-widest">{item.tagline}</span>
                  </div>
                  <h3 className="text-2xl font-black text-slate-50 group-hover:text-amber-400 transition-colors">
                    {item.title}
                  </h3>
                  <p className="text-xs text-slate-300 leading-relaxed font-medium">
                    {item.description}
                  </p>
                </div>
              </div>

              {/* Middle Features Badge */}
              <div className="w-full lg:w-3/12 space-y-2 bg-slate-950/80 p-4 rounded-2xl border border-white/5">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Tariff & Rate Class</span>
                <span className="text-xs font-black text-amber-300 block">{item.priceBadge}</span>
                <div className="space-y-1.5 pt-2 border-t border-white/5">
                  {item.features.map((feat, fIdx) => (
                    <div key={fIdx} className="flex items-center gap-2 text-[11px] text-slate-300">
                      <ShieldCheck className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                      <span>{feat}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Right CTA */}
              <div className="w-full lg:w-2/12 shrink-0">
                <Link
                  href={item.ctaLink}
                  className="flex items-center justify-center gap-2 w-full bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 text-slate-950 font-black py-4 px-6 rounded-2xl text-xs uppercase tracking-wider transition-all shadow-xl shadow-amber-400/10"
                >
                  <span>{item.ctaText}</span>
                  <ArrowRight className="w-4 h-4 text-slate-950" />
                </Link>
              </div>
            </div>
          );
        })}
      </section>
    </div>
  );
}
