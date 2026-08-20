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
  ChevronDown, 
  ArrowUpRight, 
  CheckCircle2, 
  Sparkles, 
  ShieldCheck,
  Activity
} from "lucide-react";

export default function ServicesStyle5Page() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const breadcrumbsList = [
    { label: "Services Preview 5 (Executive Command Accordion)", path: "/services5" },
  ];

  const services = [
    {
      id: "01",
      title: "Corporate Transportation",
      status: "24/7 ACTIVE",
      statusColor: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
      image: "/images/services/corporate-transportation.jpg",
      icon: Building2,
      description: "End-to-end employee transit roster planning, executive rides, and custom logistics solutions for enterprise clients.",
      features: ["24/7 Command Center support", "ISO 9001:2015 compliant fleet", "Automated monthly invoice audits"],
      ctaText: "Setup Corporate Account",
      ctaLink: "/corporate-inquiry"
    },
    {
      id: "02",
      title: "Pickup & Drop",
      status: "SHIFT DISPATCH",
      statusColor: "bg-blue-500/10 text-blue-400 border-blue-500/20",
      image: "/images/services/employee-commutes.jpg",
      icon: Clock,
      description: "Optimized route planning, bulk shift schedules, and safety-audited cab operations for individual and corporate staff commutes.",
      features: ["Real-time GPS tracking logs", "Late-night security escort protocols", "Roster optimization & fuel savings"],
      ctaText: "Book Pickup & Drop",
      ctaLink: "/book"
    },
    {
      id: "03",
      title: "Airport Transfer",
      status: "FLIGHT SYNCED",
      statusColor: "bg-amber-500/10 text-amber-400 border-amber-500/20",
      image: "/images/services/airport-transfers.jpg",
      icon: Plane,
      description: "Timely airport pick-ups and drops at major metropolitan terminals with flight delay monitoring systems.",
      features: ["Complimentary flight tracking adjust", "Paging/meet-and-greet on request", "Fixed, transparent pricing models"],
      ctaText: "Book Airport Transfer",
      ctaLink: "/book"
    },
    {
      id: "04",
      title: "Local Car Rentals",
      status: "HOURLY SLABS",
      statusColor: "bg-purple-500/10 text-purple-400 border-purple-500/20",
      image: "/images/services/local-rentals.jpg",
      icon: Clock,
      description: "Chauffeur-driven local hourly packages (e.g. 8 Hrs / 80 Kms) for city shopping, business meetings, and event travels.",
      features: ["Choose hatchbacks, sedans, or SUVs", "Professional driver navigations", "Flexible extra hour/km billing"],
      ctaText: "Rent Local Cab",
      ctaLink: "/book"
    },
    {
      id: "05",
      title: "Outstation Car Rentals",
      status: "HIGHWAY READY",
      statusColor: "bg-rose-500/10 text-rose-400 border-rose-500/20",
      image: "/images/services/outstation-cabs.jpg",
      icon: MapPin,
      description: "Comfortable commercial vehicles with outstation licenses for intercity business trips, family trips, and weekend getaways.",
      features: ["One-way and round-trip routes", "Verified highway-trained drivers", "Toll/permit inclusive options"],
      ctaText: "Book Outstation Trip",
      ctaLink: "/book"
    },
    {
      id: "06",
      title: "Domestic Tour Packages",
      status: "CURATED TOURS",
      statusColor: "bg-cyan-500/10 text-cyan-400 border-cyan-500/20",
      image: "/images/services/domestic-tours.jpg",
      icon: Compass,
      description: "Curated domestic holiday itineraries covering hill stations, beaches, heritage spots, and pilgrimage trails across India.",
      features: ["Includes transport, stay, and breakfast", "Flexible itinerary alterations", "Local sightseeing guides included"],
      ctaText: "Browse Domestic Packages",
      ctaLink: "/tours?category=domestic"
    },
    {
      id: "07",
      title: "International Tour Packages",
      status: "GLOBAL TRANSIT",
      statusColor: "bg-indigo-500/10 text-indigo-400 border-indigo-500/20",
      image: "/images/services/international-tours.jpg",
      icon: Globe,
      description: "Premium international tour itineraries covering popular destinations with flights, luxury hotels, and local ground transfers.",
      features: ["Visa and insurance documentation assist", "Handpicked 4-star and 5-star hotels", "Bilingual tour guides"],
      ctaText: "Browse International Packages",
      ctaLink: "/tours?category=international"
    },
    {
      id: "08",
      title: "Customized Travel Solution",
      status: "BESPOKE FLEET",
      statusColor: "bg-amber-400/10 text-amber-300 border-amber-400/20",
      image: "/images/services/customized-travel.jpg",
      icon: Settings,
      description: "Tailor-made itineraries, VIP event fleets, and bespoke transport packages designed to meet your specific travel ideas.",
      features: ["Dedicated tour desk counselor", "Custom hotel and transport configs", "Group travel and bus coach hires"],
      ctaText: "Discuss Your Plan",
      ctaLink: "/contact"
    }
  ];

  return (
    <div className="bg-slate-950 text-slate-100 min-h-screen">
      <Breadcrumbs items={breadcrumbsList} />

      {/* Header Banner */}
      <section className="py-12 px-4 sm:px-8 lg:px-12 xl:px-16 max-w-[1750px] mx-auto text-center space-y-4">
        <span className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-[0.3em] text-amber-400 bg-amber-500/10 border border-amber-500/20 px-4 py-1.5 rounded-full">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Style Option 4: Executive Command Accordion</span>
        </span>
        <h1 className="text-4xl sm:text-6xl font-black text-slate-50 tracking-tight">
          Executive Operations <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-amber-200 to-amber-500">Service Roster</span>
        </h1>
        <p className="text-slate-400 text-sm sm:text-base max-w-2xl mx-auto">
          Interactive expandable service rows with live status badges, image banners, and integrated booking triggers.
        </p>
      </section>

      {/* Expandable Accordion Rows */}
      <section className="pb-24 px-4 sm:px-8 lg:px-12 xl:px-16 max-w-[1750px] mx-auto space-y-4">
        {services.map((item, idx) => {
          const Icon = item.icon;
          const isOpen = openIndex === idx;

          return (
            <div
              key={item.id}
              className={`bg-slate-900/60 border rounded-2xl overflow-hidden transition-all duration-300 shadow-xl ${
                isOpen ? "border-amber-400 bg-slate-900/90" : "border-white/10 hover:border-white/20"
              }`}
            >
              {/* Accordion Row Bar */}
              <button
                onClick={() => setOpenIndex(isOpen ? null : idx)}
                className="w-full p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-left cursor-pointer"
              >
                <div className="flex items-center gap-4">
                  <span className="text-xl font-black font-mono text-amber-400/80">{item.id}</span>
                  <div className="p-2.5 rounded-xl bg-slate-950 border border-white/10 text-amber-400">
                    <Icon className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-xl font-black text-slate-50">{item.title}</h3>
                  </div>
                </div>

                <div className="flex items-center gap-4 shrink-0">
                  <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${item.statusColor}`}>
                    {item.status}
                  </span>
                  <div className={`p-2 rounded-full border border-white/10 bg-slate-950 transition-transform duration-300 ${isOpen ? "rotate-180 text-amber-400" : "text-slate-400"}`}>
                    <ChevronDown className="w-4 h-4" />
                  </div>
                </div>
              </button>

              {/* Expanded Body Content */}
              {isOpen && (
                <div className="p-6 sm:p-8 border-t border-white/5 bg-slate-950/60 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center animate-fadeIn">
                  <div className="lg:col-span-5 relative h-56 sm:h-64 w-full rounded-xl overflow-hidden border border-white/10">
                    <Image
                      src={item.image}
                      alt={item.title}
                      fill
                      className="object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent" />
                  </div>

                  <div className="lg:col-span-7 space-y-5">
                    <p className="text-sm text-slate-300 leading-relaxed font-medium">
                      {item.description}
                    </p>

                    <div className="space-y-2">
                      <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Included Highlights</h4>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        {item.features.map((feat, fIdx) => (
                          <div key={fIdx} className="bg-slate-900 p-3 rounded-xl border border-white/5 flex items-center gap-2">
                            <ShieldCheck className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                            <span className="text-xs text-slate-200">{feat}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="pt-2">
                      <Link
                        href={item.ctaLink}
                        className="inline-flex items-center gap-2 bg-amber-400 hover:bg-amber-500 text-slate-950 font-black px-6 py-3 rounded-xl text-xs uppercase tracking-wider transition-all"
                      >
                        <span>{item.ctaText}</span>
                        <ArrowUpRight className="w-4 h-4 text-slate-950" />
                      </Link>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </section>
    </div>
  );
}
