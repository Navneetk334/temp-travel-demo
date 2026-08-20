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
  ChevronRight,
  ShieldCheck,
  CheckCircle2
} from "lucide-react";

export default function ServicesStyle4Page() {
  const [selectedService, setSelectedService] = useState<number>(0);

  const breadcrumbsList = [
    { label: "Services Preview 4 (Interactive Portal)", path: "/services4" },
  ];

  const services = [
    {
      title: "Corporate Transportation",
      category: "B2B Transit & Roster Planning",
      image: "/images/services/corporate-transportation.jpg",
      icon: Building2,
      description: "End-to-end employee transit roster planning, executive rides, and custom logistics solutions for enterprise clients.",
      features: ["24/7 Command Center support", "ISO 9001:2015 compliant fleet", "Automated monthly invoice audits"],
      ctaText: "Setup Corporate Account",
      ctaLink: "/corporate-inquiry"
    },
    {
      title: "Pickup & Drop",
      category: "Shift Commute & Cabs",
      image: "/images/services/employee-commutes.jpg",
      icon: Clock,
      description: "Optimized route planning, bulk shift schedules, and safety-audited cab operations for individual and corporate staff commutes.",
      features: ["Real-time GPS tracking logs", "Late-night security escort protocols", "Roster optimization & fuel savings"],
      ctaText: "Book Pickup & Drop",
      ctaLink: "/book"
    },
    {
      title: "Airport Transfer",
      category: "Metropolitan Terminal Transit",
      image: "/images/services/airport-transfers.jpg",
      icon: Plane,
      description: "Timely airport pick-ups and drops at major metropolitan terminals with flight delay monitoring systems.",
      features: ["Complimentary flight tracking adjust", "Paging/meet-and-greet on request", "Fixed, transparent pricing models"],
      ctaText: "Book Airport Transfer",
      ctaLink: "/book"
    },
    {
      title: "Local Car Rentals",
      category: "Chauffeur Hourly Packages",
      image: "/images/services/local-rentals.jpg",
      icon: Clock,
      description: "Chauffeur-driven local hourly packages (e.g. 8 Hrs / 80 Kms) for city shopping, business meetings, and event travels.",
      features: ["Choose hatchbacks, sedans, or SUVs", "Professional driver navigations", "Flexible extra hour/km billing"],
      ctaText: "Rent Local Cab",
      ctaLink: "/book"
    },
    {
      title: "Outstation Car Rentals",
      tagline: "Intercity Highway Trips",
      category: "One-Way & Round Trips",
      image: "/images/services/outstation-cabs.jpg",
      icon: MapPin,
      description: "Comfortable commercial vehicles with outstation licenses for intercity business trips, family trips, and weekend getaways.",
      features: ["One-way and round-trip routes", "Verified highway-trained drivers", "Toll/permit inclusive options"],
      ctaText: "Book Outstation Trip",
      ctaLink: "/book"
    },
    {
      title: "Domestic Tour Packages",
      category: "Indian Destinations & Trails",
      image: "/images/services/domestic-tours.jpg",
      icon: Compass,
      description: "Curated domestic holiday itineraries covering hill stations, beaches, heritage spots, and pilgrimage trails across India.",
      features: ["Includes transport, stay, and breakfast", "Flexible itinerary alterations", "Local sightseeing guides included"],
      ctaText: "Browse Domestic Packages",
      ctaLink: "/tours?category=domestic"
    },
    {
      title: "International Tour Packages",
      category: "Global Destinations & Flights",
      image: "/images/services/international-tours.jpg",
      icon: Globe,
      description: "Premium international tour itineraries covering popular destinations with flights, luxury hotels, and local ground transfers.",
      features: ["Visa and insurance documentation assist", "Handpicked 4-star and 5-star hotels", "Bilingual tour guides"],
      ctaText: "Browse International Packages",
      ctaLink: "/tours?category=international"
    },
    {
      title: "Customized Travel Solution",
      category: "VIP & Group Bus Hire",
      image: "/images/services/customized-travel.jpg",
      icon: Settings,
      description: "Tailor-made itineraries, VIP event fleets, and bespoke transport packages designed to meet your specific travel ideas.",
      features: ["Dedicated tour desk counselor", "Custom hotel and transport configs", "Group travel and bus coach hires"],
      ctaText: "Discuss Your Plan",
      ctaLink: "/contact"
    }
  ];

  const active = services[selectedService];
  const ActiveIcon = active.icon;

  return (
    <div className="bg-slate-950 text-slate-100 min-h-screen">
      <Breadcrumbs items={breadcrumbsList} />

      {/* Header Banner */}
      <section className="py-12 px-4 sm:px-8 lg:px-12 xl:px-16 max-w-[1750px] mx-auto text-center space-y-4">
        <span className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-[0.3em] text-amber-400 bg-amber-500/10 border border-amber-500/20 px-4 py-1.5 rounded-full">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Style Option 3: Interactive Master Portal</span>
        </span>
        <h1 className="text-4xl sm:text-6xl font-black text-slate-50 tracking-tight">
          Interactive Service <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-amber-200 to-amber-500">Command Portal</span>
        </h1>
        <p className="text-slate-400 text-sm sm:text-base max-w-2xl mx-auto">
          Select any service category from the left navigation index to instantly switch the active showcase canvas on the right.
        </p>
      </section>

      {/* Master Interactive Portal Section */}
      <section className="pb-24 px-4 sm:px-8 lg:px-12 xl:px-16 max-w-[1750px] mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Side: Navigation List */}
        <div className="lg:col-span-4 bg-slate-900/60 border border-white/10 rounded-3xl p-4 space-y-2 shadow-2xl">
          <div className="text-xs font-bold text-slate-400 uppercase tracking-widest px-4 py-2 border-b border-white/5">
            Service Index ({services.length})
          </div>
          {services.map((item, idx) => {
            const Icon = item.icon;
            const isSelected = selectedService === idx;
            return (
              <button
                key={idx}
                onClick={() => setSelectedService(idx)}
                className={`w-full text-left p-4 rounded-2xl flex items-center justify-between transition-all duration-300 ${
                  isSelected
                    ? "bg-amber-400 text-slate-950 shadow-lg shadow-amber-400/20 font-black scale-[1.02]"
                    : "hover:bg-white/5 text-slate-300 hover:text-white"
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-5 h-5 ${isSelected ? "text-slate-950" : "text-amber-400"}`} />
                  <div>
                    <div className="text-sm font-bold">{item.title}</div>
                    <div className={`text-[10px] uppercase font-bold tracking-wider ${isSelected ? "text-slate-900" : "text-slate-500"}`}>
                      {item.category}
                    </div>
                  </div>
                </div>
                <ChevronRight className={`w-4 h-4 ${isSelected ? "text-slate-950" : "text-slate-500"}`} />
              </button>
            );
          })}
        </div>

        {/* Right Side: Active Showcase Canvas */}
        <div className="lg:col-span-8 bg-slate-900/60 border border-white/10 rounded-3xl p-6 sm:p-10 space-y-8 shadow-2xl relative overflow-hidden">
          {/* Top Banner Image */}
          <div className="relative h-80 sm:h-96 w-full rounded-2xl overflow-hidden border border-white/10">
            <Image
              src={active.image}
              alt={active.title}
              fill
              className="object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/30 to-transparent" />
            <div className="absolute bottom-6 left-6 space-y-2">
              <span className="bg-amber-400 text-slate-950 font-black text-xs px-3 py-1 rounded-full uppercase tracking-wider">
                {active.category}
              </span>
              <h2 className="text-3xl sm:text-5xl font-black text-slate-50 tracking-tight">
                {active.title}
              </h2>
            </div>
          </div>

          {/* Description & Features */}
          <div className="space-y-6">
            <p className="text-base text-slate-300 leading-relaxed font-medium">
              {active.description}
            </p>

            <div className="space-y-3">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Included Service Specs</h4>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {active.features.map((feat, fIdx) => (
                  <div key={fIdx} className="bg-slate-950 p-4 rounded-xl border border-white/10 flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                    <span className="text-xs font-bold text-slate-200">{feat}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-4 flex flex-col sm:flex-row gap-4">
              <Link
                href={active.ctaLink}
                className="inline-flex items-center justify-center gap-2 bg-amber-400 hover:bg-amber-500 text-slate-950 font-black px-8 py-4 rounded-xl text-xs uppercase tracking-wider transition-all shadow-xl shadow-amber-400/10"
              >
                <span>{active.ctaText}</span>
                <ChevronRight className="w-4 h-4 text-slate-950" />
              </Link>
            </div>
          </div>
        </div>

      </section>
    </div>
  );
}
