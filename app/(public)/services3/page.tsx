"use client";

import React from "react";
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
  CheckCircle2, 
  Sparkles, 
  ShieldCheck 
} from "lucide-react";

export default function ServicesStyle3Page() {
  const breadcrumbsList = [
    { label: "Services Preview 3 (VIP Luxury Split)", path: "/services3" },
  ];

  const services = [
    {
      title: "Corporate Transportation",
      tagline: "EXECUTIVE TRANSIT & COMMUTE LOGISTICS",
      image: "/images/services/corporate-transportation.jpg",
      icon: Building2,
      description: "End-to-end employee transit roster planning, executive rides, and custom logistics solutions for enterprise clients.",
      features: ["24/7 Command Center support", "ISO 9001:2015 compliant fleet", "Automated monthly invoice audits"],
      ctaText: "Setup Corporate Account",
      ctaLink: "/corporate-inquiry"
    },
    {
      title: "Pickup & Drop",
      tagline: "POINT-TO-POINT & SHIFT COMMUTE CABS",
      image: "/images/services/employee-commutes.jpg",
      icon: Clock,
      description: "Optimized route planning, bulk shift schedules, and safety-audited cab operations for individual and corporate staff commutes.",
      features: ["Real-time GPS tracking logs", "Late-night security escort protocols", "Roster optimization & fuel savings"],
      ctaText: "Book Pickup & Drop",
      ctaLink: "/book"
    },
    {
      title: "Airport Transfer",
      tagline: "GUARANTEED PUNCTUALITY AT METRO TERMINALS",
      image: "/images/services/airport-transfers.jpg",
      icon: Plane,
      description: "Timely airport pick-ups and drops at major metropolitan terminals with flight delay monitoring systems.",
      features: ["Complimentary flight tracking adjust", "Paging/meet-and-greet on request", "Fixed, transparent pricing models"],
      ctaText: "Book Airport Transfer",
      ctaLink: "/book"
    },
    {
      title: "Local Car Rentals",
      tagline: "HOURLY SLABS FOR BUSINESS & SHOPPING",
      image: "/images/services/local-rentals.jpg",
      icon: Clock,
      description: "Chauffeur-driven local hourly packages (e.g. 8 Hrs / 80 Kms) for city shopping, business meetings, and event travels.",
      features: ["Choose hatchbacks, sedans, or SUVs", "Professional driver navigations", "Flexible extra hour/km billing"],
      ctaText: "Rent Local Cab",
      ctaLink: "/book"
    },
    {
      title: "Outstation Car Rentals",
      tagline: "INTERCITY HIGHWAY COMFORT & PERMITS INCLUDED",
      image: "/images/services/outstation-cabs.jpg",
      icon: MapPin,
      description: "Comfortable commercial vehicles with outstation licenses for intercity business trips, family trips, and weekend getaways.",
      features: ["One-way and round-trip routes", "Verified highway-trained drivers", "Toll/permit inclusive options"],
      ctaText: "Book Outstation Trip",
      ctaLink: "/book"
    },
    {
      title: "Domestic Tour Packages",
      tagline: "EXPLORE HERITAGE & SCENIC TRAILS ACROSS INDIA",
      image: "/images/services/domestic-tours.jpg",
      icon: Compass,
      description: "Curated domestic holiday itineraries covering hill stations, beaches, heritage spots, and pilgrimage trails across India.",
      features: ["Includes transport, stay, and breakfast", "Flexible itinerary alterations", "Local sightseeing guides included"],
      ctaText: "Browse Domestic Packages",
      ctaLink: "/tours?category=domestic"
    },
    {
      title: "International Tour Packages",
      tagline: "GLOBAL DESTINATIONS & BESPOKE FLIGHTS",
      image: "/images/services/international-tours.jpg",
      icon: Globe,
      description: "Premium international tour itineraries covering popular destinations with flights, luxury hotels, and local ground transfers.",
      features: ["Visa and insurance documentation assist", "Handpicked 4-star and 5-star hotels", "Bilingual tour guides"],
      ctaText: "Browse International Packages",
      ctaLink: "/tours?category=international"
    },
    {
      title: "Customized Travel Solution",
      tagline: "VIP DELEGATION & WEDDING BUS FLEETS",
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
          <span>Style Option 2: Luxury Split Showcase</span>
        </span>
        <h1 className="text-4xl sm:text-6xl font-black text-slate-50 tracking-tight">
          Pinnacle Mobility & <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-amber-200 to-amber-500">Concierge Services</span>
        </h1>
        <p className="text-slate-400 text-sm sm:text-base max-w-2xl mx-auto">
          An alternating split layout designed for maximum reading clarity, featuring full-width visual banners and verified service highlights.
        </p>
      </section>

      {/* Alternating Split Cards */}
      <section className="pb-24 px-4 sm:px-8 lg:px-12 xl:px-16 max-w-[1750px] mx-auto space-y-16">
        {services.map((item, index) => {
          const IconComponent = item.icon;
          const isEven = index % 2 === 0;

          return (
            <div
              key={index}
              className={`bg-slate-900/40 border border-white/10 rounded-3xl p-6 sm:p-10 flex flex-col ${
                isEven ? "lg:flex-row" : "lg:flex-row-reverse"
              } gap-8 items-center shadow-2xl hover:border-amber-400/40 transition-all duration-500`}
            >
              {/* Image Banner */}
              <div className="w-full lg:w-1/2 relative h-72 sm:h-96 rounded-2xl overflow-hidden border border-white/10 shrink-0">
                <Image
                  src={item.image}
                  alt={item.title}
                  fill
                  className="object-cover hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent" />
                <div className="absolute top-4 left-4 bg-slate-950/80 backdrop-blur-md border border-white/10 p-3 rounded-xl flex items-center gap-2">
                  <IconComponent className="w-5 h-5 text-amber-400" />
                  <span className="text-xs font-black uppercase tracking-wider text-slate-200">TEMP TRAVEL EXCELLENCE</span>
                </div>
              </div>

              {/* Text Info */}
              <div className="w-full lg:w-1/2 space-y-6">
                <span className="text-xs font-extrabold uppercase tracking-[0.3em] text-amber-400 block">
                  {item.tagline}
                </span>

                <h3 className="text-3xl sm:text-4xl font-black text-slate-50">
                  {item.title}
                </h3>

                <p className="text-sm text-slate-300 leading-relaxed">
                  {item.description}
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                  {item.features.map((feat, fIdx) => (
                    <div key={fIdx} className="flex items-center gap-2 text-xs font-semibold text-slate-200 bg-white/5 p-3 rounded-xl border border-white/5">
                      <ShieldCheck className="w-4 h-4 text-amber-400 shrink-0" />
                      <span>{feat}</span>
                    </div>
                  ))}
                </div>

                <div className="pt-4">
                  <Link
                    href={item.ctaLink}
                    className="inline-flex items-center gap-3 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-black px-8 py-3.5 rounded-xl text-xs uppercase tracking-wider transition-all shadow-lg shadow-amber-500/10"
                  >
                    <span>{item.ctaText}</span>
                    <ArrowRight className="w-4 h-4 text-slate-950" />
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
