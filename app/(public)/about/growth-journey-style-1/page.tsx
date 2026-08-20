import React from "react";
import Link from "next/link";
import { 
  Building2, 
  Award, 
  MapPin, 
  Cpu, 
  Globe, 
  Zap, 
  ArrowRight,
  Sparkles,
  ShieldCheck,
  TrendingUp,
  CheckCircle2
} from "lucide-react";

export const metadata = {
  title: "Growth Journey - Style 1 (Alternating Timeline)",
};

const timelineMilestones = [
  {
    year: "2012",
    title: "Company Founding & Fleet Launch",
    desc: "Started operations in New Delhi with a modest fleet of 5 premium sedans targeting executive airport transfers and local corporate rentals.",
    metric: "5 Initial Vehicles",
    icon: Building2,
  },
  {
    year: "2015",
    title: "Enterprise B2B Expansion",
    desc: "Contracted with top IT hubs in Gurgaon and Noida to deliver daily employee shuttle logistics with guaranteed zero-downtime SLAs.",
    metric: "15+ B2B Contracts",
    icon: Award,
  },
  {
    year: "2018",
    title: "Multi-City Metro Hubs",
    desc: "Launched full regional operations in Mumbai Metro and Pune City, expanding commercial fleet size past 100+ commercial units.",
    metric: "100+ Commercial Units",
    icon: MapPin,
  },
  {
    year: "2021",
    title: "Smart Commute & Dispatch Engine",
    desc: "Integrated real-time GPS fleet tracking, automated roster parsing, and digital billing ledgers into our client admin dispatch portal.",
    metric: "100% Automated Roster",
    icon: Cpu,
  },
  {
    year: "2024",
    title: "Pan-India Enterprise Reach",
    desc: "Scaled active operations across 30+ regional hubs, serving 120+ active enterprise clients and 500K+ completed passenger rides.",
    metric: "30+ Regional Hubs",
    icon: Globe,
  },
  {
    year: "2026",
    title: "Carbon-Neutral EV Transit",
    desc: "Commenced rapid rollout of commercial Electric Vehicles (EVs) and hybrid fleets for eco-friendly corporate employee commutes.",
    metric: "Zero-Emission Fleet",
    icon: Zap,
  },
];

export default function GrowthJourneyStyle1() {
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
            className="py-1.5 px-4 rounded-full font-bold bg-accent text-slate-950 border border-accent shadow-md"
          >
            Style 1: Alternating Timeline
          </Link>
          <Link
            href="/about/growth-journey-style-2"
            className="py-1.5 px-4 rounded-full font-bold bg-white/5 text-slate-300 border border-white/10 hover:border-slate-400"
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
            Design Style 1 &bull; Alternating Glowing Timeline
          </span>
          <h1 className="text-4xl sm:text-5xl font-extrabold text-slate-50 tracking-tight">
            Our Growth Journey
          </h1>
          <p className="text-slate-400 text-sm sm:text-base leading-relaxed">
            How TEMP TRAVEL evolved from a local rental startup into India's leading ISO-compliant corporate transit & tour management partner.
          </p>
        </div>

        {/* Style 1: Vertical Alternating Zig-Zag Timeline */}
        <div className="relative pt-8 pb-12">

          {/* Central Glowing Vertical Line */}
          <div className="absolute left-1/2 top-12 bottom-12 w-0.5 -translate-x-1/2 bg-gradient-to-b from-accent via-blue-500 to-emerald-400 hidden md:block opacity-40" />

          <div className="space-y-12 relative">
            {timelineMilestones.map((item, idx) => {
              const isEven = idx % 2 === 0;
              const Icon = item.icon;

              return (
                <div
                  key={idx}
                  className={`flex flex-col md:flex-row items-center ${
                    isEven ? "md:flex-row-reverse" : ""
                  }`}
                >
                  {/* Left or Right Card Content */}
                  <div className="w-full md:w-1/2 p-4">
                    <div className="bg-slate-900/60 border border-white/10 hover:border-accent/40 rounded-2xl p-6 sm:p-8 space-y-4 shadow-xl transition-all group glassmorphism hover:-translate-y-1">
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="p-2.5 bg-accent/10 border border-accent/20 rounded-xl text-accent group-hover:scale-110 transition-transform">
                            <Icon className="w-5 h-5" />
                          </div>
                          <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                            Phase 0{idx + 1}
                          </span>
                        </div>
                        <span className="text-2xl font-black font-mono text-accent">
                          {item.year}
                        </span>
                      </div>

                      <div className="space-y-2">
                        <h3 className="text-xl font-bold text-slate-50 group-hover:text-amber-400 transition-colors">
                          {item.title}
                        </h3>
                        <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                          {item.desc}
                        </p>
                      </div>

                      <div className="pt-3 border-t border-white/5 flex items-center justify-between">
                        <span className="inline-flex items-center gap-1.5 text-[11px] font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 py-1 px-3 rounded-full">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>{item.metric}</span>
                        </span>
                        <span className="text-[10px] text-slate-500 font-mono">Verified Milestone</span>
                      </div>

                    </div>
                  </div>

                  {/* Central Node Badge */}
                  <div className="relative z-10 my-4 md:my-0 flex items-center justify-center">
                    <div className="w-12 h-12 rounded-full bg-slate-950 border-2 border-accent flex items-center justify-center font-mono font-bold text-xs text-accent shadow-lg shadow-amber-500/10 group-hover:scale-125 transition-transform">
                      {item.year.slice(2)}
                    </div>
                  </div>

                  {/* Spacer for opposite side */}
                  <div className="w-full md:w-1/2 p-4 hidden md:block" />
                </div>
              );
            })}
          </div>

        </div>

      </div>
    </div>
  );
}
