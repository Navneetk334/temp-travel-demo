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
  ShieldCheck, 
  Star 
} from "lucide-react";

export default function ServicesStyle3Page() {
  const [activeHover, setActiveHover] = useState<number | null>(null);

  const breadcrumbsList = [
    { label: "Services Preview 3 (Cinematic Parallax Showcase)", path: "/services3" },
  ];

  const services = [
    {
      id: "01",
      title: "Corporate Transportation",
      category: "Enterprise Fleet & Executive Commutes",
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
      category: "Point-to-Point & Shift Commute Cabs",
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
      category: "Metropolitan Airport Terminals",
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
      category: "Chauffeur-Driven Hourly Slabs",
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
      category: "Intercity Highway Trips",
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
      category: "Heritage & Pilgrimage Trails Across India",
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
      category: "Global Destinations & Luxury Stays",
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
      category: "VIP Delegations & Event Fleet Hires",
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
          <span>Style Option 2: Cinematic Parallax Cards</span>
        </span>
        <h1 className="text-4xl sm:text-6xl font-black text-slate-50 tracking-tight">
          Cinematic Chauffeur <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-amber-200 to-amber-500">& Travel Showcase</span>
        </h1>
        <p className="text-slate-400 text-sm sm:text-base max-w-2xl mx-auto">
          Immersive wide cards featuring dynamic backdrop zooms, gold-trimmed typography, and sleek feature badges.
        </p>
      </section>

      {/* Cinematic Cards Grid */}
      <section className="pb-24 px-4 sm:px-8 lg:px-12 xl:px-16 max-w-[1750px] mx-auto grid grid-cols-1 md:grid-cols-2 gap-8">
        {services.map((item, index) => {
          const Icon = item.icon;
          return (
            <div
              key={item.id}
              onMouseEnter={() => setActiveHover(index)}
              onMouseLeave={() => setActiveHover(null)}
              className="group relative bg-slate-900/80 border border-white/10 rounded-3xl overflow-hidden shadow-2xl transition-all duration-500 hover:border-amber-400/60 hover:-translate-y-2 flex flex-col justify-between"
            >
              {/* Background Photo with Gradient Fade */}
              <div className="relative h-64 sm:h-72 w-full overflow-hidden">
                <Image
                  src={item.image}
                  alt={item.title}
                  fill
                  className="object-cover group-hover:scale-110 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/60 to-transparent" />
                
                {/* Top Badge Overlay */}
                <div className="absolute top-4 left-4 right-4 flex justify-between items-center z-10">
                  <span className="bg-slate-950/80 backdrop-blur-md border border-white/10 px-3.5 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest text-amber-400 flex items-center gap-1.5">
                    <Icon className="w-3.5 h-3.5" />
                    <span>{item.category}</span>
                  </span>
                  <span className="text-2xl font-black font-mono text-amber-400/80 drop-shadow-md">
                    {item.id}
                  </span>
                </div>

                {/* Card Title on Image */}
                <div className="absolute bottom-4 left-6 right-6 z-10">
                  <h3 className="text-2xl sm:text-3xl font-black text-slate-50 group-hover:text-amber-400 transition-colors">
                    {item.title}
                  </h3>
                </div>
              </div>

              {/* Card Body & Features */}
              <div className="p-6 sm:p-8 space-y-6 flex-1 flex flex-col justify-between">
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-medium">
                  {item.description}
                </p>

                <div className="space-y-2.5 pt-2 border-t border-white/5">
                  {item.features.map((feat, fIdx) => (
                    <div key={fIdx} className="flex items-center gap-2.5 text-xs text-slate-300">
                      <ShieldCheck className="w-4 h-4 text-amber-400 shrink-0" />
                      <span>{feat}</span>
                    </div>
                  ))}
                </div>

                <div className="pt-4">
                  <Link
                    href={item.ctaLink}
                    className="flex items-center justify-between w-full bg-slate-950 hover:bg-amber-400 hover:text-slate-950 border border-white/10 px-6 py-3.5 rounded-2xl text-xs font-black uppercase tracking-wider transition-all duration-300 group/btn shadow-lg"
                  >
                    <span>{item.ctaText}</span>
                    <ArrowUpRight className="w-4 h-4 text-amber-400 group-hover/btn:text-slate-950 transition-colors" />
                  </Link>
                </div>
              </div>
            </div>
          );
        })}
      </section>
    </div>
  );
}
