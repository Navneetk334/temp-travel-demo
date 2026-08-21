"use client";

import React, { useState } from "react";
import {
  Globe,
  Star,
  Search,
  CheckCircle2,
  TrendingUp,
  MapPin,
  FileText,
  Sparkles,
  RefreshCw,
  ExternalLink
} from "lucide-react";

export default function MasterSEOGrowthPage() {
  const cityPages = [
    { city: "Mumbai Metro", slug: "mumbai", keyword: "Corporate Cab Service Mumbai", impressions: "14.2K", rank: "#1", status: "INDEXED" },
    { city: "Delhi NCR", slug: "delhi-ncr", keyword: "Airport Transfer Cabs Delhi", impressions: "18.6K", rank: "#1", status: "INDEXED" },
    { city: "Pune City", slug: "pune", keyword: "Outstation Cabs Pune to Mumbai", impressions: "9.4K", rank: "#2", status: "INDEXED" },
    { city: "Bangalore Tech Hub", slug: "bangalore", keyword: "Employee Transit Roster Bangalore", impressions: "11.8K", rank: "#1", status: "INDEXED" },
    { city: "Goa Coast", slug: "goa", keyword: "Luxury SUV Rental Goa", impressions: "8.1K", rank: "#2", status: "INDEXED" },
    { city: "Nashik Hub", slug: "nashik", keyword: "Intercity Cab Service Nashik", impressions: "5.2K", rank: "#1", status: "INDEXED" },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-amber-500/20 pb-6">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-3xl font-black tracking-tight text-slate-50">
              SEO & Google Business Profile (GBP) Engine
            </h1>
            <span className="bg-amber-500/10 text-amber-400 border border-amber-500/30 text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-widest">
              Digital Growth Package
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Google Business Profile ranking sync, city landing pages, schema markup, and search engine optimization.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 bg-slate-900 hover:bg-slate-800 border border-white/10 text-slate-300 px-4 py-2 rounded-xl text-xs font-bold transition-all">
            <RefreshCw className="w-3.5 h-3.5 text-amber-400" />
            <span>Sync GBP API</span>
          </button>
        </div>
      </div>

      {/* GBP Performance Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-slate-900/80 backdrop-blur-xl border border-amber-500/30 rounded-2xl p-6 shadow-xl">
          <div className="flex justify-between items-center mb-2">
            <span className="text-xs text-slate-400 font-bold uppercase">Google Rating</span>
            <Star className="w-5 h-5 text-amber-400 fill-amber-400" />
          </div>
          <div className="text-3xl font-black text-slate-50 font-mono">4.9 / 5.0</div>
          <div className="text-[11px] text-emerald-400 mt-1">Synced across 120+ Verified Reviews</div>
        </div>

        <div className="bg-slate-900/80 backdrop-blur-xl border border-blue-500/30 rounded-2xl p-6 shadow-xl">
          <div className="flex justify-between items-center mb-2">
            <span className="text-xs text-slate-400 font-bold uppercase">Monthly Search Impressions</span>
            <Search className="w-5 h-5 text-blue-400" />
          </div>
          <div className="text-3xl font-black text-slate-50 font-mono">67.3K</div>
          <div className="text-[11px] text-blue-400 mt-1">Organic Search & Maps Views</div>
        </div>

        <div className="bg-slate-900/80 backdrop-blur-xl border border-purple-500/30 rounded-2xl p-6 shadow-xl">
          <div className="flex justify-between items-center mb-2">
            <span className="text-xs text-slate-400 font-bold uppercase">City SEO Landing Pages</span>
            <MapPin className="w-5 h-5 text-purple-400" />
          </div>
          <div className="text-3xl font-black text-slate-50 font-mono">30+ Cities</div>
          <div className="text-[11px] text-purple-400 mt-1">Dynamic Schema & Local Content</div>
        </div>

        <div className="bg-slate-900/80 backdrop-blur-xl border border-emerald-500/30 rounded-2xl p-6 shadow-xl">
          <div className="flex justify-between items-center mb-2">
            <span className="text-xs text-slate-400 font-bold uppercase">Schema.org Compliance</span>
            <CheckCircle2 className="w-5 h-5 text-emerald-400" />
          </div>
          <div className="text-3xl font-black text-slate-50 font-mono">100% Valid</div>
          <div className="text-[11px] text-emerald-400 mt-1">CarRental, LocalBusiness & Tours</div>
        </div>
      </div>

      {/* City Landing Pages Manager Table */}
      <div className="bg-slate-900/80 backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-2xl space-y-4">
        <div className="flex justify-between items-center pb-4 border-b border-white/10">
          <div className="flex items-center gap-2">
            <Globe className="w-5 h-5 text-amber-400" />
            <h3 className="text-base font-bold text-slate-100">City Landing Pages & Organic Search Rankings</h3>
          </div>
          <span className="text-xs font-mono text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 rounded-full">
            All Pages Live & Indexed
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950 text-slate-400 font-extrabold uppercase text-[10px] tracking-wider border-b border-white/10">
              <tr>
                <th className="py-3 px-4">Metropolitan Region</th>
                <th className="py-3 px-4">Target Search Keyword</th>
                <th className="py-3 px-4">Search Impressions</th>
                <th className="py-3 px-4">Google Map Pack Rank</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">View Landing Page</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {cityPages.map((cp) => (
                <tr key={cp.slug} className="hover:bg-white/5 transition-colors">
                  <td className="py-4 px-4 font-bold text-slate-100">{cp.city}</td>
                  <td className="py-4 px-4 font-mono text-amber-400">"{cp.keyword}"</td>
                  <td className="py-4 px-4 font-mono text-slate-200">{cp.impressions}</td>
                  <td className="py-4 px-4 font-mono font-bold text-emerald-400">{cp.rank}</td>
                  <td className="py-4 px-4">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                      {cp.status}
                    </span>
                  </td>
                  <td className="py-4 px-4 text-right">
                    <a
                      href={`/car-rental/${cp.slug}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 bg-slate-950 text-amber-400 hover:text-white border border-amber-500/30 px-3 py-1 rounded-lg text-[11px] font-bold transition-all"
                    >
                      View Live Page <ExternalLink className="w-3 h-3" />
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
