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
  Sparkles, 
  ArrowUpRight,
  ShieldCheck
} from "lucide-react";

export default function ServicesStyle5Page() {
  const [activeTab, setActiveTab] = useState<string>("ALL");

  const breadcrumbsList = [
    { label: "Services Preview 5 (Category Matrix)", path: "/services5" },
  ];

  const services = [
    {
      id: "1",
      categoryType: "CORPORATE",
      title: "Corporate Transportation",
      tag: "B2B Transit Accounts",
      image: "/images/services/corporate-transportation.jpg",
      icon: Building2,
      description: "End-to-end employee transit roster planning, executive rides, and custom logistics solutions for enterprise clients.",
      features: ["24/7 Command Center support", "ISO 9001:2015 compliant fleet", "Automated monthly invoice audits"],
      ctaText: "Setup Corporate Account",
      ctaLink: "/corporate-inquiry"
    },
    {
      id: "2",
      categoryType: "COMMUTE",
      title: "Pickup & Drop",
      tag: "Point-to-Point Cabs",
      image: "/images/services/employee-commutes.jpg",
      icon: Clock,
      description: "Optimized route planning, bulk shift schedules, and safety-audited cab operations for individual and corporate staff commutes.",
      features: ["Real-time GPS tracking logs", "Late-night security escort protocols", "Roster optimization & fuel savings"],
      ctaText: "Book Pickup & Drop",
      ctaLink: "/book"
    },
    {
      id: "3",
      categoryType: "COMMUTE",
      title: "Airport Transfer",
      tag: "Metropolitan Terminal Transit",
      image: "/images/services/airport-transfers.jpg",
      icon: Plane,
      description: "Timely airport pick-ups and drops at major metropolitan terminals with flight delay monitoring systems.",
      features: ["Complimentary flight tracking adjust", "Paging/meet-and-greet on request", "Fixed, transparent pricing models"],
      ctaText: "Book Airport Transfer",
      ctaLink: "/book"
    },
    {
      id: "4",
      categoryType: "RENTALS",
      title: "Local Car Rentals",
      tag: "Hourly Chauffeur Slabs",
      image: "/images/services/local-rentals.jpg",
      icon: Clock,
      description: "Chauffeur-driven local hourly packages (e.g. 8 Hrs / 80 Kms) for city shopping, business meetings, and event travels.",
      features: ["Choose hatchbacks, sedans, or SUVs", "Professional driver navigations", "Flexible extra hour/km billing"],
      ctaText: "Rent Local Cab",
      ctaLink: "/book"
    },
    {
      id: "5",
      categoryType: "RENTALS",
      title: "Outstation Car Rentals",
      tag: "Intercity Highway Trips",
      image: "/images/services/outstation-cabs.jpg",
      icon: MapPin,
      description: "Comfortable commercial vehicles with outstation licenses for intercity business trips, family trips, and weekend getaways.",
      features: ["One-way and round-trip routes", "Verified highway-trained drivers", "Toll/permit inclusive options"],
      ctaText: "Book Outstation Trip",
      ctaLink: "/book"
    },
    {
      id: "6",
      categoryType: "TOURS",
      title: "Domestic Tour Packages",
      tag: "Indian Holiday Trails",
      image: "/images/services/domestic-tours.jpg",
      icon: Compass,
      description: "Curated domestic holiday itineraries covering hill stations, beaches, heritage spots, and pilgrimage trails across India.",
      features: ["Includes transport, stay, and breakfast", "Flexible itinerary alterations", "Local sightseeing guides included"],
      ctaText: "Browse Domestic Packages",
      ctaLink: "/tours?category=domestic"
    },
    {
      id: "7",
      categoryType: "TOURS",
      title: "International Tour Packages",
      tag: "Global Holidays & Flights",
      image: "/images/services/international-tours.jpg",
      icon: Globe,
      description: "Premium international tour itineraries covering popular destinations with flights, luxury hotels, and local ground transfers.",
      features: ["Visa and insurance documentation assist", "Handpicked 4-star and 5-star hotels", "Bilingual tour guides"],
      ctaText: "Browse International Packages",
      ctaLink: "/tours?category=international"
    },
    {
      id: "8",
      categoryType: "CUSTOM",
      title: "Customized Travel Solution",
      tag: "Bespoke VIP & Group Bus Hire",
      image: "/images/services/customized-travel.jpg",
      icon: Settings,
      description: "Tailor-made itineraries, VIP event fleets, and bespoke transport packages designed to meet your specific travel ideas.",
      features: ["Dedicated tour desk counselor", "Custom hotel and transport configs", "Group travel and bus coach hires"],
      ctaText: "Discuss Your Plan",
      ctaLink: "/contact"
    }
  ];

  const filteredServices = services.filter((s) => activeTab === "ALL" || s.categoryType === activeTab);

  return (
    <div className="bg-slate-950 text-slate-100 min-h-screen">
      <Breadcrumbs items={breadcrumbsList} />

      {/* Header Banner */}
      <section className="py-12 px-4 sm:px-8 lg:px-12 xl:px-16 max-w-[1750px] mx-auto text-center space-y-4">
        <span className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-[0.3em] text-amber-400 bg-amber-500/10 border border-amber-500/20 px-4 py-1.5 rounded-full">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Style Option 4: Tabbed Category Matrix</span>
        </span>
        <h1 className="text-4xl sm:text-6xl font-black text-slate-50 tracking-tight">
          Executive Operations <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-amber-200 to-amber-500">Service Matrix</span>
        </h1>
        <p className="text-slate-400 text-sm sm:text-base max-w-2xl mx-auto">
          Filter by category tabs below to instantly view specialized transit modules.
        </p>

        {/* Category Tabs Bar */}
        <div className="pt-6 flex flex-wrap items-center justify-center gap-2">
          {[
            { key: "ALL", label: "All Services (8)" },
            { key: "CORPORATE", label: "Corporate & B2B" },
            { key: "COMMUTE", label: "Commute & Airport" },
            { key: "RENTALS", label: "Local & Outstation" },
            { key: "TOURS", label: "Holiday Tours" },
            { key: "CUSTOM", label: "Bespoke Solutions" },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all duration-300 ${
                activeTab === tab.key
                  ? "bg-amber-400 text-slate-950 shadow-lg shadow-amber-400/20 scale-105"
                  : "bg-slate-900 border border-white/10 text-slate-400 hover:text-slate-100 hover:border-white/20"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </section>

      {/* Service Matrix Grid */}
      <section className="pb-24 px-4 sm:px-8 lg:px-12 xl:px-16 max-w-[1750px] mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {filteredServices.map((item) => {
          const Icon = item.icon;
          return (
            <div
              key={item.id}
              className="bg-slate-900/60 border border-white/10 rounded-3xl p-6 flex flex-col justify-between hover:border-amber-400/50 transition-all duration-300 hover:-translate-y-1.5 shadow-2xl group"
            >
              <div className="space-y-4">
                <div className="relative h-48 w-full rounded-2xl overflow-hidden border border-white/10">
                  <Image
                    src={item.image}
                    alt={item.title}
                    fill
                    className="object-cover group-hover:scale-110 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent" />
                  <div className="absolute top-3 left-3 bg-slate-950/80 backdrop-blur-md px-3 py-1 rounded-full border border-white/10 text-[10px] font-black uppercase tracking-widest text-amber-400">
                    {item.tag}
                  </div>
                </div>

                <div className="flex items-center gap-3 pt-2">
                  <div className="p-2.5 rounded-xl bg-amber-400/10 border border-amber-400/20 text-amber-400">
                    <Icon className="w-5 h-5" />
                  </div>
                  <h3 className="text-2xl font-black text-slate-50 group-hover:text-amber-400 transition-colors">
                    {item.title}
                  </h3>
                </div>

                <p className="text-xs text-slate-300 leading-relaxed font-medium">
                  {item.description}
                </p>

                <div className="space-y-2 pt-2 border-t border-white/5">
                  {item.features.map((feat, fIdx) => (
                    <div key={fIdx} className="flex items-center gap-2 text-[11px] text-slate-400">
                      <ShieldCheck className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                      <span>{feat}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-6">
                <Link
                  href={item.ctaLink}
                  className="flex items-center justify-between w-full bg-slate-950 hover:bg-amber-400 hover:text-slate-950 border border-white/10 px-4 py-3 rounded-xl text-xs font-black uppercase tracking-wider transition-all duration-300 group/btn"
                >
                  <span>{item.ctaText}</span>
                  <ArrowUpRight className="w-4 h-4 text-amber-400 group-hover/btn:text-slate-950 transition-colors" />
                </Link>
              </div>
            </div>
          );
        })}
      </section>
    </div>
  );
}
