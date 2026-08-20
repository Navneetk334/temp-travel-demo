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
  ArrowUpRight, 
  Sparkles, 
  ChevronDown, 
  ShieldCheck, 
  CheckCircle2 
} from "lucide-react";

export default function ServicesStyle4Page() {
  const [expandedId, setExpandedId] = useState<string | null>("1");

  const breadcrumbsList = [
    { label: "Services Preview 4 (Stitch Dual-Tone Bento + Spec Drawer)", path: "/services4" },
  ];

  const services = [
    {
      id: "1",
      title: "Corporate Transportation",
      category: "B2B Transit & Roster Planning",
      image: "/images/services/corporate-transportation.jpg",
      icon: Building2,
      accentBorder: "border-amber-400/40 hover:border-amber-400",
      accentGlow: "from-amber-500/20 to-transparent",
      badge: "ISO 9001 COMPLIANT",
      description: "End-to-end employee transit roster planning, executive rides, and custom logistics solutions for enterprise clients.",
      features: ["24/7 Command Center support", "ISO 9001:2015 compliant fleet", "Automated monthly invoice audits"],
      ctaText: "Setup Corporate Account",
      ctaLink: "/corporate-inquiry"
    },
    {
      id: "2",
      title: "Pickup & Drop",
      category: "Shift Commute & Cabs",
      image: "/images/services/employee-commutes.jpg",
      icon: Clock,
      accentBorder: "border-blue-400/40 hover:border-blue-400",
      accentGlow: "from-blue-500/20 to-transparent",
      badge: "24/7 SHIFT DISPATCH",
      description: "Optimized route planning, bulk shift schedules, and safety-audited cab operations for individual and corporate staff commutes.",
      features: ["Real-time GPS tracking logs", "Late-night security escort protocols", "Roster optimization & fuel savings"],
      ctaText: "Book Pickup & Drop",
      ctaLink: "/book"
    },
    {
      id: "3",
      title: "Airport Transfer",
      category: "Metropolitan Terminal Transit",
      image: "/images/services/airport-transfers.jpg",
      icon: Plane,
      accentBorder: "border-cyan-400/40 hover:border-cyan-400",
      accentGlow: "from-cyan-500/20 to-transparent",
      badge: "FLIGHT SYNCED",
      description: "Timely airport pick-ups and drops at major metropolitan terminals with flight delay monitoring systems.",
      features: ["Complimentary flight tracking adjust", "Paging/meet-and-greet on request", "Fixed, transparent pricing models"],
      ctaText: "Book Airport Transfer",
      ctaLink: "/book"
    },
    {
      id: "4",
      title: "Local Car Rentals",
      category: "Chauffeur Hourly Packages",
      image: "/images/services/local-rentals.jpg",
      icon: Clock,
      accentBorder: "border-emerald-400/40 hover:border-emerald-400",
      accentGlow: "from-emerald-500/20 to-transparent",
      badge: "HOURLY SLABS",
      description: "Chauffeur-driven local hourly packages (e.g. 8 Hrs / 80 Kms) for city shopping, business meetings, and event travels.",
      features: ["Choose hatchbacks, sedans, or SUVs", "Professional driver navigations", "Flexible extra hour/km billing"],
      ctaText: "Rent Local Cab",
      ctaLink: "/book"
    },
    {
      id: "5",
      title: "Outstation Car Rentals",
      category: "One-Way & Round Trips",
      image: "/images/services/outstation-cabs.jpg",
      icon: MapPin,
      accentBorder: "border-purple-400/40 hover:border-purple-400",
      accentGlow: "from-purple-500/20 to-transparent",
      badge: "STATE PERMIT INCLUDED",
      description: "Comfortable commercial vehicles with outstation licenses for intercity business trips, family trips, and weekend getaways.",
      features: ["One-way and round-trip routes", "Verified highway-trained drivers", "Toll/permit inclusive options"],
      ctaText: "Book Outstation Trip",
      ctaLink: "/book"
    },
    {
      id: "6",
      title: "Domestic Tour Packages",
      category: "Indian Destinations & Trails",
      image: "/images/services/domestic-tours.jpg",
      icon: Compass,
      accentBorder: "border-rose-400/40 hover:border-rose-400",
      accentGlow: "from-rose-500/20 to-transparent",
      badge: "CURATED TOURS",
      description: "Curated domestic holiday itineraries covering hill stations, beaches, heritage spots, and pilgrimage trails across India.",
      features: ["Includes transport, stay, and breakfast", "Flexible itinerary alterations", "Local sightseeing guides included"],
      ctaText: "Browse Domestic Packages",
      ctaLink: "/tours?category=domestic"
    },
    {
      id: "7",
      title: "International Tour Packages",
      category: "Global Destinations & Flights",
      image: "/images/services/international-tours.jpg",
      icon: Globe,
      accentBorder: "border-indigo-400/40 hover:border-indigo-400",
      accentGlow: "from-indigo-500/20 to-transparent",
      badge: "FLIGHTS & HOTELS",
      description: "Premium international tour itineraries covering popular destinations with flights, luxury hotels, and local ground transfers.",
      features: ["Visa and insurance documentation assist", "Handpicked 4-star and 5-star hotels", "Bilingual tour guides"],
      ctaText: "Browse International Packages",
      ctaLink: "/tours?category=international"
    },
    {
      id: "8",
      title: "Customized Travel Solution",
      category: "VIP & Group Bus Hire",
      image: "/images/services/customized-travel.jpg",
      icon: Settings,
      accentBorder: "border-amber-300/40 hover:border-amber-300",
      accentGlow: "from-amber-400/20 to-transparent",
      badge: "BESPOKE FLEET",
      description: "Tailor-made itineraries, VIP event fleets, and bespoke transport packages designed to meet your specific travel ideas.",
      features: ["Dedicated tour desk counselor", "Custom hotel and transport configs", "Group travel and bus coach hires"],
      ctaText: "Discuss Your Plan",
      ctaLink: "/contact"
    }
  ];

  const toggleDrawer = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  return (
    <div className="bg-slate-950 text-slate-100 min-h-screen">
      <Breadcrumbs items={breadcrumbsList} />

      {/* Header Banner */}
      <section className="py-12 px-4 sm:px-8 lg:px-12 xl:px-16 max-w-[1750px] mx-auto text-center space-y-4">
        <span className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-[0.3em] text-amber-400 bg-amber-500/10 border border-amber-500/20 px-4 py-1.5 rounded-full">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Stitch Design System: Dual-Tone Bento & Spec Drawer</span>
        </span>
        <h1 className="text-4xl sm:text-6xl font-black text-slate-50 tracking-tight">
          Stitch Executive <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-amber-200 to-amber-500">Mobility Bento</span>
        </h1>
        <p className="text-slate-400 text-sm sm:text-base max-w-2xl mx-auto">
          Tactile dark bento cards with inline expandable specification drawers and glowing ghost borders.
        </p>
      </section>

      {/* Bento Grid with Expandable Drawers */}
      <section className="pb-24 px-4 sm:px-8 lg:px-12 xl:px-16 max-w-[1750px] mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 items-start">
        {services.map((item) => {
          const Icon = item.icon;
          const isExpanded = expandedId === item.id;

          return (
            <div
              key={item.id}
              className={`bg-slate-900/60 backdrop-blur-xl border rounded-3xl p-6 transition-all duration-300 shadow-2xl relative overflow-hidden flex flex-col justify-between ${item.accentBorder}`}
            >
              {/* Radial Accent Glow */}
              <div className={`absolute top-0 right-0 w-48 h-48 bg-gradient-to-bl ${item.accentGlow} rounded-full blur-3xl pointer-events-none`} />

              <div className="space-y-4 relative z-10">
                {/* Header Badge */}
                <div className="flex justify-between items-center">
                  <div className="p-2.5 rounded-xl bg-slate-950 border border-white/10 text-amber-400">
                    <Icon className="w-5 h-5" />
                  </div>
                  <span className="text-[9px] font-black uppercase tracking-widest text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2.5 py-1 rounded-full">
                    {item.badge}
                  </span>
                </div>

                {/* Service Image Banner */}
                <div className="relative h-44 w-full rounded-2xl overflow-hidden border border-white/10 my-2">
                  <Image
                    src={item.image}
                    alt={item.title}
                    fill
                    className="object-cover hover:scale-105 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent" />
                  <span className="absolute bottom-2 left-3 text-[10px] font-mono text-slate-300 uppercase tracking-widest">
                    {item.category}
                  </span>
                </div>

                <div>
                  <h3 className="text-xl font-black text-slate-50">{item.title}</h3>
                  <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">
                    {item.description}
                  </p>
                </div>

                {/* Expandable Spec Drawer Trigger */}
                <button
                  onClick={() => toggleDrawer(item.id)}
                  className="w-full py-2 bg-slate-950/80 hover:bg-slate-950 border border-white/10 rounded-xl text-[10px] font-black uppercase tracking-wider text-slate-300 flex items-center justify-center gap-1.5 transition-all"
                >
                  <span>{isExpanded ? "Hide Included Specs" : "View Included Specs"}</span>
                  <ChevronDown className={`w-3.5 h-3.5 text-amber-400 transition-transform duration-300 ${isExpanded ? "rotate-180" : ""}`} />
                </button>

                {/* Expanded Specifications Drawer */}
                {isExpanded && (
                  <div className="space-y-2 pt-2 border-t border-white/10 animate-fadeIn">
                    {item.features.map((feat, fIdx) => (
                      <div key={fIdx} className="flex items-center gap-2 text-[11px] text-slate-200 bg-slate-950/90 p-2.5 rounded-lg border border-white/5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                        <span>{feat}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Action Button */}
              <div className="pt-6 relative z-10">
                <Link
                  href={item.ctaLink}
                  className="flex items-center justify-between w-full bg-amber-400 hover:bg-amber-500 text-slate-950 font-black px-4 py-3 rounded-xl text-xs uppercase tracking-wider transition-all duration-300 shadow-lg shadow-amber-400/10"
                >
                  <span>{item.ctaText}</span>
                  <ArrowUpRight className="w-4 h-4 text-slate-950" />
                </Link>
              </div>
            </div>
          );
        })}
      </section>
    </div>
  );
}
