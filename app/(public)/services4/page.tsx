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
  Layers 
} from "lucide-react";

export default function ServicesStyle4Page() {
  const [activeCategory, setActiveCategory] = useState<string>("ALL");

  const breadcrumbsList = [
    { label: "Services Preview 4 (Futuristic Glass Cards)", path: "/services4" },
  ];

  const services = [
    {
      id: "1",
      cat: "CORPORATE",
      title: "Corporate Transportation",
      subTitle: "Enterprise Fleet & Executive Commutes",
      image: "/images/services/corporate-transportation.jpg",
      icon: Building2,
      description: "End-to-end employee transit roster planning, executive rides, and custom logistics solutions for enterprise clients.",
      features: ["24/7 Command Center support", "ISO 9001:2015 compliant fleet", "Automated monthly invoice audits"],
      ctaText: "Setup Corporate Account",
      ctaLink: "/corporate-inquiry"
    },
    {
      id: "2",
      cat: "COMMUTE",
      title: "Pickup & Drop",
      subTitle: "Point-to-Point & Shift Commute Cabs",
      image: "/images/services/employee-commutes.jpg",
      icon: Clock,
      description: "Optimized route planning, bulk shift schedules, and safety-audited cab operations for individual and corporate staff commutes.",
      features: ["Real-time GPS tracking logs", "Late-night security escort protocols", "Roster optimization & fuel savings"],
      ctaText: "Book Pickup & Drop",
      ctaLink: "/book"
    },
    {
      id: "3",
      cat: "COMMUTE",
      title: "Airport Transfer",
      subTitle: "Metropolitan Airport Terminals",
      image: "/images/services/airport-transfers.jpg",
      icon: Plane,
      description: "Timely airport pick-ups and drops at major metropolitan terminals with flight delay monitoring systems.",
      features: ["Complimentary flight tracking adjust", "Paging/meet-and-greet on request", "Fixed, transparent pricing models"],
      ctaText: "Book Airport Transfer",
      ctaLink: "/book"
    },
    {
      id: "4",
      cat: "RENTALS",
      title: "Local Car Rentals",
      subTitle: "Chauffeur-Driven Hourly Slabs",
      image: "/images/services/local-rentals.jpg",
      icon: Clock,
      description: "Chauffeur-driven local hourly packages (e.g. 8 Hrs / 80 Kms) for city shopping, business meetings, and event travels.",
      features: ["Choose hatchbacks, sedans, or SUVs", "Professional driver navigations", "Flexible extra hour/km billing"],
      ctaText: "Rent Local Cab",
      ctaLink: "/book"
    },
    {
      id: "5",
      cat: "RENTALS",
      title: "Outstation Car Rentals",
      subTitle: "Intercity Highway Trips",
      image: "/images/services/outstation-cabs.jpg",
      icon: MapPin,
      description: "Comfortable commercial vehicles with outstation licenses for intercity business trips, family trips, and weekend getaways.",
      features: ["One-way and round-trip routes", "Verified highway-trained drivers", "Toll/permit inclusive options"],
      ctaText: "Book Outstation Trip",
      ctaLink: "/book"
    },
    {
      id: "6",
      cat: "TOURS",
      title: "Domestic Tour Packages",
      subTitle: "Indian Destinations & Heritage",
      image: "/images/services/domestic-tours.jpg",
      icon: Compass,
      description: "Curated domestic holiday itineraries covering hill stations, beaches, heritage spots, and pilgrimage trails across India.",
      features: ["Includes transport, stay, and breakfast", "Flexible itinerary alterations", "Local sightseeing guides included"],
      ctaText: "Browse Domestic Packages",
      ctaLink: "/tours?category=domestic"
    },
    {
      id: "7",
      cat: "TOURS",
      title: "International Tour Packages",
      subTitle: "Global Destinations & Luxury Stays",
      image: "/images/services/international-tours.jpg",
      icon: Globe,
      description: "Premium international tour itineraries covering popular destinations with flights, luxury hotels, and local ground transfers.",
      features: ["Visa and insurance documentation assist", "Handpicked 4-star and 5-star hotels", "Bilingual tour guides"],
      ctaText: "Browse International Packages",
      ctaLink: "/tours?category=international"
    },
    {
      id: "8",
      cat: "CUSTOM",
      title: "Customized Travel Solution",
      subTitle: "VIP Delegations & Event Bus Fleets",
      image: "/images/services/customized-travel.jpg",
      icon: Settings,
      description: "Tailor-made itineraries, VIP event fleets, and bespoke transport packages designed to meet your specific travel ideas.",
      features: ["Dedicated tour desk counselor", "Custom hotel and transport configs", "Group travel and bus coach hires"],
      ctaText: "Discuss Your Plan",
      ctaLink: "/contact"
    }
  ];

  const filtered = services.filter((s) => activeCategory === "ALL" || s.cat === activeCategory);

  return (
    <div className="bg-slate-950 text-slate-100 min-h-screen">
      <Breadcrumbs items={breadcrumbsList} />

      {/* Header Banner */}
      <section className="py-12 px-4 sm:px-8 lg:px-12 xl:px-16 max-w-[1750px] mx-auto text-center space-y-4">
        <span className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-[0.3em] text-amber-400 bg-amber-500/10 border border-amber-500/20 px-4 py-1.5 rounded-full">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Style Option 3: Futuristic Glass Cards</span>
        </span>
        <h1 className="text-4xl sm:text-6xl font-black text-slate-50 tracking-tight">
          Next-Gen Mobility <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-amber-200 to-amber-500">Service Modules</span>
        </h1>
        <p className="text-slate-400 text-sm sm:text-base max-w-2xl mx-auto">
          Ultra-clean frosted glass tiles with glowing category filters, full-width card headers, and modern typography.
        </p>

        {/* Category Pill Filters */}
        <div className="pt-6 flex flex-wrap items-center justify-center gap-2">
          {[
            { id: "ALL", name: "All Offerings (8)" },
            { id: "CORPORATE", name: "Corporate B2B" },
            { id: "COMMUTE", name: "Commute & Airport" },
            { id: "RENTALS", name: "Car Rentals" },
            { id: "TOURS", name: "Holiday Tours" },
            { id: "CUSTOM", name: "Bespoke" },
          ].map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all duration-300 ${
                activeCategory === cat.id
                  ? "bg-amber-400 text-slate-950 shadow-lg shadow-amber-400/20"
                  : "bg-slate-900 border border-white/10 text-slate-400 hover:text-white"
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>
      </section>

      {/* Grid of Glass Cards */}
      <section className="pb-24 px-4 sm:px-8 lg:px-12 xl:px-16 max-w-[1750px] mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {filtered.map((item) => {
          const Icon = item.icon;
          return (
            <div
              key={item.id}
              className="bg-slate-900/40 backdrop-blur-xl border border-white/10 rounded-2xl p-5 flex flex-col justify-between hover:border-amber-400/50 transition-all duration-300 hover:-translate-y-1.5 shadow-2xl group"
            >
              <div className="space-y-4">
                <div className="relative h-44 w-full rounded-xl overflow-hidden border border-white/10">
                  <Image
                    src={item.image}
                    alt={item.title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent" />
                  <div className="absolute top-2.5 left-2.5 bg-slate-950/90 border border-white/10 px-2.5 py-1 rounded-md text-[9px] font-black uppercase tracking-widest text-amber-400 flex items-center gap-1">
                    <Icon className="w-3 h-3" />
                    <span>{item.cat}</span>
                  </div>
                </div>

                <div>
                  <h3 className="text-xl font-black text-slate-50 group-hover:text-amber-400 transition-colors">
                    {item.title}
                  </h3>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mt-0.5">
                    {item.subTitle}
                  </span>
                  <p className="text-xs text-slate-300 mt-2 leading-relaxed font-medium">
                    {item.description}
                  </p>
                </div>

                <div className="space-y-1.5 pt-2 border-t border-white/5">
                  {item.features.map((feat, fIdx) => (
                    <div key={fIdx} className="flex items-center gap-2 text-[11px] text-slate-300">
                      <CheckCircle2 className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                      <span>{feat}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-5">
                <Link
                  href={item.ctaLink}
                  className="flex items-center justify-between w-full bg-slate-950 hover:bg-amber-400 hover:text-slate-950 border border-white/10 px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all duration-300 group/btn"
                >
                  <span>{item.ctaText}</span>
                  <ArrowRight className="w-4 h-4 text-amber-400 group-hover/btn:text-slate-950 transition-colors" />
                </Link>
              </div>
            </div>
          );
        })}
      </section>
    </div>
  );
}
