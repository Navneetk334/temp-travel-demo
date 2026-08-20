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
  CheckCircle2, 
  Sparkles, 
  Shield, 
  Zap 
} from "lucide-react";

export default function ServicesStyle2Page() {
  const [activeHover, setActiveHover] = useState<number | null>(null);

  const breadcrumbsList = [
    { label: "Services Preview 2 (Bento Glow)", path: "/services2" },
  ];

  const services = [
    {
      id: "1",
      title: "Corporate Transportation",
      tagline: "Enterprise Fleet Operations & Executive Transit",
      image: "/images/services/corporate-transportation.jpg",
      icon: Building2,
      accent: "from-amber-500/20 to-amber-500/0",
      border: "hover:border-amber-400/50",
      badgeColor: "bg-amber-500/10 text-amber-400 border-amber-500/30",
      description: "End-to-end employee transit roster planning, executive rides, and custom logistics solutions for enterprise clients.",
      features: ["24/7 Command Center Support", "ISO 9001:2015 Compliant Fleet", "Automated Monthly Invoicing"],
      ctaText: "Setup Corporate Account",
      ctaLink: "/corporate-inquiry"
    },
    {
      id: "2",
      title: "Pickup & Drop",
      tagline: "Point-to-Point & Shift Commute Cab Operations",
      image: "/images/services/employee-commutes.jpg",
      icon: Clock,
      accent: "from-blue-500/20 to-blue-500/0",
      border: "hover:border-blue-400/50",
      badgeColor: "bg-blue-500/10 text-blue-400 border-blue-500/30",
      description: "Optimized route planning, bulk shift schedules, and safety-audited cab operations for individual and corporate staff commutes.",
      features: ["Real-Time GPS Tracking Logs", "Late-Night Escort Security", "Shift Roster Fuel Optimization"],
      ctaText: "Book Pickup & Drop",
      ctaLink: "/book"
    },
    {
      id: "3",
      title: "Airport Transfer",
      tagline: "Metropolitan Terminal Pickups & Flight Sync",
      image: "/images/services/airport-transfers.jpg",
      icon: Plane,
      accent: "from-cyan-500/20 to-cyan-500/0",
      border: "hover:border-cyan-400/50",
      badgeColor: "bg-cyan-500/10 text-cyan-400 border-cyan-500/30",
      description: "Timely airport pick-ups and drops at major metropolitan terminals with flight delay monitoring systems.",
      features: ["Complimentary Flight Tracking", "VIP Paging & Meet-and-Greet", "Fixed Transparent Toll Fares"],
      ctaText: "Book Airport Transfer",
      ctaLink: "/book"
    },
    {
      id: "4",
      title: "Local Car Rentals",
      tagline: "Hourly Chauffeur Slabs & City Mobility",
      image: "/images/services/local-rentals.jpg",
      icon: Clock,
      accent: "from-emerald-500/20 to-emerald-500/0",
      border: "hover:border-emerald-400/50",
      badgeColor: "bg-emerald-500/10 text-emerald-400 border-emerald-500/30",
      description: "Chauffeur-driven local hourly packages (e.g. 8 Hrs / 80 Kms) for city shopping, business meetings, and event travels.",
      features: ["Hatchbacks, Sedans & Luxury SUVs", "Verified Driver Navigations", "Flexible Extra Hour Slabs"],
      ctaText: "Rent Local Cab",
      ctaLink: "/book"
    },
    {
      id: "5",
      title: "Outstation Car Rentals",
      tagline: "Intercity Highway Rides & Weekend Trips",
      image: "/images/services/outstation-cabs.jpg",
      icon: MapPin,
      accent: "from-purple-500/20 to-purple-500/0",
      border: "hover:border-purple-400/50",
      badgeColor: "bg-purple-500/10 text-purple-400 border-purple-500/30",
      description: "Comfortable commercial vehicles with outstation licenses for intercity business trips, family trips, and weekend getaways.",
      features: ["One-Way & Round-Trip Routes", "Highway Trained Chauffeurs", "Toll & State Permit Inclusive"],
      ctaText: "Book Outstation Trip",
      ctaLink: "/book"
    },
    {
      id: "6",
      title: "Domestic Tour Packages",
      tagline: "Curated Indian Destinations & Pilgrimages",
      image: "/images/services/domestic-tours.jpg",
      icon: Compass,
      accent: "from-rose-500/20 to-rose-500/0",
      border: "hover:border-rose-400/50",
      badgeColor: "bg-rose-500/10 text-rose-400 border-rose-500/30",
      description: "Curated domestic holiday itineraries covering hill stations, beaches, heritage spots, and pilgrimage trails across India.",
      features: ["Transport + Hotel + Meals Included", "Custom Itinerary Flexibility", "Local Sightseeing Guides"],
      ctaText: "Browse Domestic Packages",
      ctaLink: "/tours?category=domestic"
    },
    {
      id: "7",
      title: "International Tour Packages",
      tagline: "Global Holiday Destinations & Ground Logistics",
      image: "/images/services/international-tours.jpg",
      icon: Globe,
      accent: "from-indigo-500/20 to-indigo-500/0",
      border: "hover:border-indigo-400/50",
      badgeColor: "bg-indigo-500/10 text-indigo-400 border-indigo-500/30",
      description: "Premium international tour itineraries covering popular destinations with flights, luxury hotels, and local ground transfers.",
      features: ["Visa & Insurance Guidance", "4-Star & 5-Star Hotel Partners", "Bilingual Sightseeing Escorts"],
      ctaText: "Browse International Packages",
      ctaLink: "/tours?category=international"
    },
    {
      id: "8",
      title: "Customized Travel Solution",
      tagline: "Bespoke VIP Event & Group Transport Planning",
      image: "/images/services/customized-travel.jpg",
      icon: Settings,
      accent: "from-amber-400/20 to-amber-400/0",
      border: "hover:border-amber-300/50",
      badgeColor: "bg-amber-400/10 text-amber-300 border-amber-400/30",
      description: "Tailor-made itineraries, VIP event fleets, and bespoke transport packages designed to meet your specific travel ideas.",
      features: ["Dedicated Tour Desk Manager", "Custom Hotel & Vehicle Configs", "Group Bus & Luxury Coach Hire"],
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
          <span>Style Option 1: Cyber-Glass Bento Grid</span>
        </span>
        <h1 className="text-4xl sm:text-6xl font-black text-slate-50 tracking-tight">
          Modern Chauffeur & <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-amber-200 to-amber-500">Travel Solutions</span>
        </h1>
        <p className="text-slate-400 text-sm sm:text-base max-w-2xl mx-auto">
          Hover over each service card to see glowing bento card effects, key features, and instant action triggers.
        </p>
      </section>

      {/* Style 1 Grid: Bento Cyber Cards */}
      <section className="pb-24 px-4 sm:px-8 lg:px-12 xl:px-16 max-w-[1750px] mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {services.map((item, index) => {
          const IconComponent = item.icon;
          return (
            <div
              key={item.id}
              onMouseEnter={() => setActiveHover(index)}
              onMouseLeave={() => setActiveHover(null)}
              className={`group relative bg-slate-900/60 border border-white/10 rounded-2xl p-6 transition-all duration-300 flex flex-col justify-between overflow-hidden shadow-2xl ${item.border} hover:-translate-y-1.5`}
            >
              {/* Radial Glow Highlight */}
              <div className={`absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl ${item.accent} rounded-full blur-3xl pointer-events-none transition-opacity duration-500 ${activeHover === index ? "opacity-100" : "opacity-40"}`} />

              <div className="space-y-4 relative z-10">
                {/* Header Badge */}
                <div className="flex justify-between items-start">
                  <div className={`p-3 rounded-xl border ${item.badgeColor}`}>
                    <IconComponent className="w-6 h-6" />
                  </div>
                  <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest">0{index + 1}</span>
                </div>

                {/* Service Image Preview Banner */}
                <div className="relative h-40 w-full rounded-xl overflow-hidden border border-white/10 my-3">
                  <Image
                    src={item.image}
                    alt={item.title}
                    fill
                    className="object-cover group-hover:scale-110 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />
                  <span className="absolute bottom-2 left-3 text-[10px] font-bold text-amber-300 uppercase tracking-widest">
                    {item.tagline}
                  </span>
                </div>

                {/* Title & Description */}
                <div>
                  <h3 className="text-xl font-black text-slate-50 group-hover:text-amber-400 transition-colors">
                    {item.title}
                  </h3>
                  <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                    {item.description}
                  </p>
                </div>

                {/* Features List */}
                <div className="space-y-2 pt-2 border-t border-white/5">
                  {item.features.map((feat, fIdx) => (
                    <div key={fIdx} className="flex items-center gap-2 text-[11px] text-slate-300">
                      <CheckCircle2 className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                      <span>{feat}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action Button */}
              <div className="pt-6 relative z-10">
                <Link
                  href={item.ctaLink}
                  className="flex items-center justify-between w-full bg-slate-950 hover:bg-amber-400 hover:text-slate-950 border border-white/10 px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all duration-300 group/btn"
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
