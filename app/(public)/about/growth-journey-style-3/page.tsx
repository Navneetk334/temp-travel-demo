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
  TrendingUp,
  ShieldCheck,
  CheckCircle2,
  Car,
  Users,
  Calendar
} from "lucide-react";

export const metadata = {
  title: "Growth Journey - Style 3 (Bento Metric Grid)",
};

const bentoItems = [
  {
    year: "2012",
    title: "Inception & Founding",
    desc: "Started operations in New Delhi with 5 premium sedans targeting airport transfers and corporate rentals.",
    metric: "5 Cabs",
    badge: "Founding",
    colSpan: "col-span-1 lg:col-span-4",
    bgGradient: "from-blue-500/10 to-purple-500/5",
    borderColor: "border-blue-500/20",
    icon: Building2,
  },
  {
    year: "2015",
    title: "B2B Enterprise Contracts",
    desc: "Partnered with IT tech parks in Gurgaon & Noida for employee daily commute shuttles.",
    metric: "15+ B2B SLA Contracts",
    badge: "Scaling",
    colSpan: "col-span-1 lg:col-span-8",
    bgGradient: "from-amber-500/10 to-amber-500/5",
    borderColor: "border-amber-500/20",
    icon: Award,
  },
  {
    year: "2018",
    title: "Multi-City Metro Expansion",
    desc: "Full operations in Mumbai Metro and Pune City with 100+ commercial vehicles.",
    metric: "100+ Commercial Units",
    badge: "Pan-India",
    colSpan: "col-span-1 lg:col-span-8",
    bgGradient: "from-emerald-500/10 to-teal-500/5",
    borderColor: "border-emerald-500/20",
    icon: MapPin,
  },
  {
    year: "2021",
    title: "Smart Dispatch & GPS",
    desc: "Automated roster routing engine & live client tracking dashboard.",
    metric: "100% Automated Roster",
    badge: "Tech Launch",
    colSpan: "col-span-1 lg:col-span-4",
    bgGradient: "from-purple-500/10 to-indigo-500/5",
    borderColor: "border-purple-500/20",
    icon: Cpu,
  },
  {
    year: "2024",
    title: "Enterprise Market Dominance",
    desc: "30+ regional hubs serving 120+ active enterprise clients & 500K+ passenger rides.",
    metric: "30+ Regional Hubs",
    badge: "Market Leader",
    colSpan: "col-span-1 lg:col-span-6",
    bgGradient: "from-cyan-500/10 to-blue-500/5",
    borderColor: "border-cyan-500/20",
    icon: Globe,
  },
  {
    year: "2026",
    title: "Green EV Transit Era",
    desc: "Deployment of commercial Electric Vehicles (EVs) for zero-emission corporate commutes.",
    metric: "Zero Emission Target",
    badge: "Sustainability",
    colSpan: "col-span-1 lg:col-span-6",
    bgGradient: "from-green-500/10 to-emerald-500/5",
    borderColor: "border-green-500/20",
    icon: Zap,
  },
];

export default function GrowthJourneyStyle3() {
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
            className="py-1.5 px-4 rounded-full font-bold bg-accent text-slate-950 border border-accent shadow-md"
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
            Design Style 3 &bull; Bento Metric Grid
          </span>
          <h1 className="text-4xl sm:text-5xl font-extrabold text-slate-50 tracking-tight">
            Our Growth Bento Grid
          </h1>
          <p className="text-slate-400 text-sm sm:text-base leading-relaxed">
            A modern asymmetric Bento layout showcasing key milestones, metrics, and technical evolutions.
          </p>
        </div>

        {/* Style 3: Bento Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {bentoItems.map((item, idx) => {
            const Icon = item.icon;

            return (
              <div
                key={idx}
                className={`${item.colSpan} bg-gradient-to-br ${item.bgGradient} bg-slate-900/60 border ${item.borderColor} hover:border-accent/40 rounded-3xl p-8 space-y-6 glassmorphism transition-all hover:-translate-y-1 group flex flex-col justify-between shadow-lg`}
              >
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-2xl font-black font-mono text-accent">
                      {item.year}
                    </span>
                    <span className="text-[10px] font-bold py-1 px-3 rounded-full bg-white/5 border border-white/10 text-slate-300 uppercase tracking-widest">
                      {item.badge}
                    </span>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-white/5 border border-white/10 rounded-xl text-accent group-hover:scale-110 transition-transform">
                      <Icon className="w-6 h-6" />
                    </div>
                    <h3 className="text-xl font-bold text-slate-50 group-hover:text-amber-400 transition-colors">
                      {item.title}
                    </h3>
                  </div>

                  <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                    {item.desc}
                  </p>
                </div>

                <div className="pt-4 border-t border-white/10 flex items-center justify-between mt-auto">
                  <span className="text-xs font-extrabold text-emerald-400 flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>{item.metric}</span>
                  </span>
                  <span className="text-[10px] text-slate-500 font-mono">TEMP TRAVEL SLA</span>
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </div>
  );
}
