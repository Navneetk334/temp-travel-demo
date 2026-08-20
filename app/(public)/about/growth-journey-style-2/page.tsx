"use client";

import React, { useState } from "react";
import Link from "next/link";
import { 
  Sparkles, 
  Building2, 
  Award, 
  MapPin, 
  Cpu, 
  Globe, 
  Zap, 
  ChevronRight, 
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  TrendingUp
} from "lucide-react";

const timelineMilestones = [
  {
    id: "2012",
    year: "2012",
    title: "Company Founding & Fleet Launch",
    subtitle: "Inception Phase",
    desc: "Started operations in New Delhi with a modest fleet of 5 premium sedans targeting executive airport transfers and local corporate rentals.",
    metric: "5 Commercial Sedans",
    highlights: ["Incorporated as Temp Travel Car Rentals Pvt Ltd", "ISO-aligned chauffeur training", "First 5 corporate commuter contracts"],
    icon: Building2,
  },
  {
    id: "2015",
    year: "2015",
    title: "Enterprise B2B Expansion",
    subtitle: "Commercial Scaling",
    desc: "Contracted with top IT hubs in Gurgaon and Noida to deliver daily employee shuttle logistics with guaranteed zero-downtime SLAs.",
    metric: "15+ Enterprise Clients",
    highlights: ["Dedicated 24/7 client dispatch desks", "Fixed billing transparency model", "GPS speed limiter integration"],
    icon: Award,
  },
  {
    id: "2018",
    year: "2018",
    title: "Multi-City Metro Hubs",
    subtitle: "Pan-India Footprint",
    desc: "Launched full regional operations in Mumbai Metro and Pune City, expanding commercial fleet size past 100+ commercial units.",
    metric: "100+ Commercial Units",
    highlights: ["West India regional dispatch center", "Executive SUV fleet acquisition", "Zero-accident compliance award"],
    icon: MapPin,
  },
  {
    id: "2021",
    year: "2021",
    title: "Smart Commute & Dispatch Engine",
    subtitle: "Digital Automation",
    desc: "Integrated real-time GPS fleet tracking, automated roster parsing, and digital billing ledgers into our client admin dispatch portal.",
    metric: "100% Automated Roster",
    highlights: ["Automated route optimization engine", "Digital chauffeur mobile app", "Real-time client tracking dashboard"],
    icon: Cpu,
  },
  {
    id: "2024",
    year: "2024",
    title: "Pan-India Enterprise Reach",
    subtitle: "Industry Leadership",
    desc: "Scaled active operations across 30+ regional hubs, serving 120+ active enterprise clients and 500K+ completed passenger rides.",
    metric: "30+ Regional Hubs",
    highlights: ["500,000+ completed passenger rides", "120+ active MNC corporate accounts", "South India tech hub expansion"],
    icon: Globe,
  },
  {
    id: "2026",
    year: "2026",
    title: "Carbon-Neutral EV Transit",
    subtitle: "Green Future Standard",
    desc: "Commenced rapid rollout of commercial Electric Vehicles (EVs) and hybrid fleets for eco-friendly corporate employee commutes.",
    metric: "Zero-Emission Target",
    highlights: ["EV fleet deployment across Delhi NCR & Banglore", "Carbon neutral ride certificate option", "Solar charging hub setup"],
    icon: Zap,
  },
];

export default function GrowthJourneyStyle2() {
  const [activeTab, setActiveTab] = useState(timelineMilestones[0].id);

  const activeMilestone = timelineMilestones.find((m) => m.id === activeTab) || timelineMilestones[0];
  const Icon = activeMilestone.icon;

  return (
    <div className="bg-slate-950 text-slate-100 min-h-screen pt-32 sm:pt-36 lg:pt-40 pb-24 px-4 sm:px-8 lg:px-12">
      <div className="max-w-6xl mx-auto space-y-12">

        {/* Style Switcher Bar */}
        <div className="glassmorphism p-4 rounded-2xl border border-white/10 flex flex-wrap gap-2 justify-center items-center text-xs">
          <span className="font-bold text-slate-400 uppercase tracking-widest mr-2 flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5 text-accent" />
            <span>Select Design Style:</span>
          </span>
          <Link
            href="/about/growth-journey-style-1"
            className="py-1.5 px-4 rounded-full font-bold bg-white/5 text-slate-300 border border-white/10 hover:border-slate-400"
          >
            Style 1: Alternating Timeline
          </Link>
          <Link
            href="/about/growth-journey-style-2"
            className="py-1.5 px-4 rounded-full font-bold bg-accent text-slate-950 border border-accent shadow-md"
          >
            Style 2: Interactive Roadmap Track
          </Link>
          <Link
            href="/about/growth-journey-style-3"
            className="py-1.5 px-4 rounded-full font-bold bg-white/5 text-slate-300 border border-white/10 hover:border-slate-400"
          >
            Style 3: Bento Metric Grid
          </Link>
          <Link
            href="/about/growth-journey-style-4"
            className="py-1.5 px-4 rounded-full font-bold bg-white/5 text-slate-300 border border-white/10 hover:border-slate-400"
          >
            Style 4: Futuristic Tech Railway
          </Link>
        </div>

        {/* Section Header */}
        <div className="text-center space-y-4 max-w-3xl mx-auto">
          <span className="text-xs font-bold text-accent uppercase tracking-widest bg-amber-500/10 border border-amber-500/20 px-3.5 py-1 rounded-full inline-block">
            Design Style 2 &bull; Interactive Stepper Roadmap
          </span>
          <h1 className="text-4xl sm:text-5xl font-extrabold text-slate-50 tracking-tight">
            Our Growth Roadmap
          </h1>
          <p className="text-slate-400 text-sm sm:text-base leading-relaxed">
            Click on any milestone year below to inspect our key achievements, fleet expansion data, and operational breakthroughs.
          </p>
        </div>

        {/* Style 2: Interactive Stepper Track */}
        <div className="space-y-8">
          
          {/* Stepper Navigation Track */}
          <div className="glassmorphism p-3 rounded-2xl border border-white/10 flex flex-nowrap overflow-x-auto justify-between gap-2 scrollbar-none">
            {timelineMilestones.map((m) => {
              const isActive = m.id === activeTab;
              return (
                <button
                  key={m.id}
                  onClick={() => setActiveTab(m.id)}
                  className={`py-3 px-6 rounded-xl font-mono text-sm font-black transition-all flex flex-col items-center gap-1 shrink-0 ${
                    isActive
                      ? "bg-accent text-slate-950 shadow-lg scale-105"
                      : "bg-slate-900/60 text-slate-400 border border-white/5 hover:border-white/20 hover:text-slate-200"
                  }`}
                >
                  <span className="text-[10px] font-sans uppercase font-extrabold opacity-80">{m.subtitle}</span>
                  <span className="text-base">{m.year}</span>
                </button>
              );
            })}
          </div>

          {/* Active Milestone Spotlight Card */}
          <div className="bg-slate-900/70 border border-white/10 rounded-3xl p-8 sm:p-12 glassmorphism space-y-8 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-96 h-96 bg-accent/5 rounded-full blur-3xl pointer-events-none" />

            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 border-b border-white/5 pb-8">
              <div className="flex items-center gap-4">
                <div className="p-4 bg-accent/10 border border-accent/20 rounded-2xl text-accent">
                  <Icon className="w-8 h-8" />
                </div>
                <div>
                  <span className="text-xs font-bold text-accent uppercase tracking-widest font-mono">
                    Year {activeMilestone.year} Milestone
                  </span>
                  <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-50 mt-1">
                    {activeMilestone.title}
                  </h2>
                </div>
              </div>

              <div className="bg-emerald-500/10 border border-emerald-500/20 py-2 px-5 rounded-full text-emerald-400 font-bold text-xs uppercase tracking-wider flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4" />
                <span>{activeMilestone.metric}</span>
              </div>
            </div>

            <p className="text-slate-300 text-sm sm:text-base leading-relaxed max-w-4xl">
              {activeMilestone.desc}
            </p>

            {/* Key Deliverable Highlights */}
            <div className="space-y-3 pt-4 border-t border-white/5">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                Key Accomplishments & Infrastructure:
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {activeMilestone.highlights.map((item, idx) => (
                  <div key={idx} className="bg-slate-950/60 p-4 rounded-xl border border-white/5 flex items-start gap-3 text-xs text-slate-200">
                    <ShieldCheck className="w-4 h-4 text-accent shrink-0 mt-0.5" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
}
