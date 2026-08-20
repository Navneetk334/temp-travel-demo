import React from "react";
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
  ShieldCheck,
  CheckCircle2,
  Terminal,
  Activity
} from "lucide-react";

export const metadata = {
  title: "Growth Journey - Style 4 (Futuristic Tech Railway)",
};

const techMilestones = [
  {
    year: "2012",
    version: "v1.0 Operational Launch",
    title: "Founding & Fleet Setup",
    desc: "Started operations in New Delhi with 5 premium sedans targeting airport transfers and corporate rentals.",
    metric: "5 Cabs in Service",
    status: "ESTABLISHED",
    icon: Building2,
  },
  {
    year: "2015",
    version: "v2.0 Enterprise Scaling",
    title: "B2B Commute Logistics",
    desc: "Partnered with IT tech parks in Gurgaon & Noida for daily employee commute shuttles.",
    metric: "15+ Enterprise Contracts",
    status: "EXPANDED",
    icon: Award,
  },
  {
    year: "2018",
    version: "v3.0 Multi-City Network",
    title: "Metro Hubs Expansion",
    desc: "Full operations in Mumbai Metro and Pune City with 100+ commercial vehicles.",
    metric: "100+ Commercial Vehicles",
    status: "DEPLOYED",
    icon: MapPin,
  },
  {
    year: "2021",
    version: "v4.0 Smart Dispatch Portal",
    title: "Automated Fleet Engine",
    desc: "Automated roster routing engine & live client tracking dashboard.",
    metric: "GPS Tracking Engine",
    status: "AUTOMATED",
    icon: Cpu,
  },
  {
    year: "2024",
    version: "v5.0 Enterprise Leadership",
    title: "Pan-India Reach",
    desc: "30+ regional hubs serving 120+ active enterprise clients & 500K+ passenger rides.",
    metric: "30+ Active Hubs",
    status: "DOMINANT",
    icon: Globe,
  },
  {
    year: "2026",
    version: "v6.0 Green Fleet Eco-System",
    title: "Electric Vehicle Transit",
    desc: "Deployment of commercial Electric Vehicles (EVs) for zero-emission corporate commutes.",
    metric: "Zero-Emission Fleet",
    status: "IN PROGRESS",
    icon: Zap,
  },
];

export default function GrowthJourneyStyle4() {
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
            className="py-1.5 px-4 rounded-full font-bold bg-accent text-slate-950 border border-accent shadow-md"
          >
            Style 4: Futuristic Tech Railway
          </Link>
        </div>

        {/* Section Header */}
        <div className="text-center space-y-4 max-w-3xl mx-auto">
          <span className="text-xs font-bold text-accent uppercase tracking-widest bg-amber-500/10 border border-amber-500/20 px-3.5 py-1 rounded-full inline-block">
            Design Style 4 &bull; Futuristic Tech Railway
          </span>
          <h1 className="text-4xl sm:text-5xl font-extrabold text-slate-50 tracking-tight font-mono">
            // GROWTH LOGS
          </h1>
          <p className="text-slate-400 text-sm sm:text-base leading-relaxed">
            High-tech linear log cards with status badges, version control tags, and milestone markers.
          </p>
        </div>

        {/* Style 4: Futuristic Tech Railway */}
        <div className="relative space-y-6">

          {/* Left Vertical Railway Line */}
          <div className="absolute left-6 top-8 bottom-8 w-1 bg-gradient-to-b from-accent via-blue-500 to-emerald-400 rounded-full opacity-30 hidden sm:block" />

          {techMilestones.map((item, idx) => {
            const Icon = item.icon;

            return (
              <div
                key={idx}
                className="relative sm:pl-16 flex flex-col space-y-3 group"
              >
                {/* Node Pill on Railway */}
                <div className="absolute left-3 top-6 -translate-x-1/2 w-7 h-7 rounded-full bg-slate-950 border-2 border-accent hidden sm:flex items-center justify-center text-[10px] font-mono font-bold text-accent group-hover:scale-125 transition-transform z-10">
                  {idx + 1}
                </div>

                <div className="bg-slate-900/60 border border-white/10 hover:border-amber-500/40 rounded-2xl p-6 sm:p-8 space-y-4 glassmorphism transition-all hover:bg-slate-900/80 shadow-lg">
                  
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 border-b border-white/5 pb-4">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl font-black font-mono text-accent">
                        {item.year}
                      </span>
                      <span className="text-[10px] font-mono text-slate-400 bg-white/5 border border-white/10 px-2.5 py-0.5 rounded">
                        {item.version}
                      </span>
                    </div>

                    <span className="text-[10px] font-mono font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 rounded-full uppercase tracking-wider">
                      STATUS: {item.status}
                    </span>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="p-3 bg-white/5 border border-white/10 rounded-xl text-accent group-hover:text-amber-400 transition-colors shrink-0">
                      <Icon className="w-6 h-6" />
                    </div>
                    <div className="space-y-1.5 flex-1">
                      <h3 className="text-xl font-bold text-slate-50 group-hover:text-amber-400 transition-colors">
                        {item.title}
                      </h3>
                      <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                        {item.desc}
                      </p>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-white/5 flex items-center justify-between text-xs text-slate-400">
                    <div className="flex items-center gap-2">
                      <Activity className="w-3.5 h-3.5 text-accent" />
                      <span className="font-bold text-slate-200">{item.metric}</span>
                    </div>
                    <span className="text-[10px] font-mono text-slate-500">SYSTEM ID: TT-LOG-0{idx + 1}</span>
                  </div>

                </div>
              </div>
            );
          })}

        </div>

      </div>
    </div>
  );
}
