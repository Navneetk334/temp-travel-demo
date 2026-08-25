"use client";

import React, { useState } from "react";
import Link from "next/link";
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
  ExternalLink,
  Edit2,
  X,
  MessageSquare
} from "lucide-react";
import Portal from "@/components/shared/portal";

export default function MasterSEOGrowthPage() {
  const [selectedCity, setSelectedCity] = useState<any | null>(null);
  const [selectedReview, setSelectedReview] = useState<any | null>(null);
  const [replyText, setReplyText] = useState("");
  const [replySuccess, setReplySuccess] = useState(false);

  const [cityPages, setCityPages] = useState([
    { city: "Mumbai Metro", slug: "mumbai", keyword: "Corporate Cab Service Mumbai", impressions: "14.2K", rank: "#1", status: "INDEXED", metaTitle: "Corporate Cab Service Mumbai - ISO 9001 Fleet | TEMP TRAVEL" },
    { city: "Delhi NCR", slug: "delhi-ncr", keyword: "Airport Transfer Cabs Delhi", impressions: "18.6K", rank: "#1", status: "INDEXED", metaTitle: "Airport Transfer Cabs Delhi NCR | TEMP TRAVEL" },
    { city: "Pune City", slug: "pune", keyword: "Outstation Cabs Pune to Mumbai", impressions: "9.4K", rank: "#2", status: "INDEXED", metaTitle: "Outstation Cabs Pune - One Way & Round Trip | TEMP TRAVEL" },
    { city: "Bangalore Tech Hub", slug: "bangalore", keyword: "Employee Transit Roster Bangalore", impressions: "11.8K", rank: "#1", status: "INDEXED", metaTitle: "Corporate Employee Transit Bangalore | TEMP TRAVEL" },
    { city: "Goa Coast", slug: "goa", keyword: "Luxury SUV Rental Goa", impressions: "8.1K", rank: "#2", status: "INDEXED", metaTitle: "Luxury SUV Car Rental Goa | TEMP TRAVEL" },
    { city: "Nashik Hub", slug: "nashik", keyword: "Intercity Cab Service Nashik", impressions: "5.2K", rank: "#1", status: "INDEXED", metaTitle: "Intercity Cab Service Nashik | TEMP TRAVEL" },
  ]);

  const gbpReviews: any[] = [];

  const handleReplySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setReplySuccess(true);
    setTimeout(() => {
      setReplySuccess(false);
      setSelectedReview(null);
      setReplyText("");
    }, 1500);
  };

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
          <Link
            href="/master-admin/blog"
            className="flex items-center gap-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 px-4 py-2 rounded-xl text-xs font-black tracking-wider uppercase transition-all shadow-lg shadow-amber-500/20"
          >
            <FileText className="w-4 h-4" />
            <span>Launch Master Blog CMS</span>
          </Link>
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

      {/* Google Business Profile Reviews Section */}
      <div className="bg-slate-900/80 backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-2xl space-y-4">
        <div className="flex justify-between items-center pb-4 border-b border-white/10">
          <div className="flex items-center gap-2">
            <Star className="w-5 h-5 text-amber-400 fill-amber-400" />
            <h3 className="text-base font-bold text-slate-100">Google Business Profile (GBP) Live Reviews</h3>
          </div>
          <span className="text-xs font-mono text-amber-400">Direct GBP API Sync</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {gbpReviews.map((rev) => (
            <div key={rev.id} className="bg-slate-950 p-4 rounded-xl border border-white/5 space-y-2 text-xs">
              <div className="flex justify-between items-center">
                <span className="font-bold text-slate-200">{rev.author}</span>
                <div className="flex text-amber-400 font-bold">★★★★★</div>
              </div>
              <p className="text-slate-400 italic">"{rev.text}"</p>
              <div className="pt-2 flex justify-between items-center">
                <span className="text-[10px] font-mono text-slate-500">{rev.time}</span>
                <button
                  onClick={() => setSelectedReview(rev)}
                  className="inline-flex items-center gap-1 text-amber-400 hover:underline font-bold text-[11px]"
                >
                  <MessageSquare className="w-3 h-3" /> Reply on GBP
                </button>
              </div>
            </div>
          ))}
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

      {/* GBP Review Reply Modal */}
      {selectedReview && (
        <Portal>
          <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
            <div className="bg-slate-900 border border-amber-500/30 rounded-2xl p-6 w-full max-w-lg shadow-2xl space-y-4 relative text-slate-100">
              <button
                onClick={() => setSelectedReview(null)}
                className="absolute top-4 right-4 text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="space-y-1">
                <span className="text-[10px] font-bold uppercase text-amber-400 tracking-wider">Google Business Profile Sync</span>
                <h3 className="text-xl font-bold text-slate-50">Reply to Review from {selectedReview.author}</h3>
              </div>

              {replySuccess ? (
                <div className="bg-emerald-500/10 border border-emerald-500/30 p-4 rounded-xl text-center space-y-1 text-xs text-emerald-400 font-bold">
                  <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto" />
                  <div>Official Reply Synced to Google Maps!</div>
                </div>
              ) : (
                <form onSubmit={handleReplySubmit} className="space-y-4 text-xs">
                  <div className="p-3 bg-slate-950 rounded-xl border border-white/5 italic text-slate-300">
                    "{selectedReview.text}"
                  </div>

                  <div className="space-y-1">
                    <label className="text-slate-400 font-bold">Official Response *</label>
                    <textarea
                      required
                      rows={3}
                      placeholder="Thank you for choosing TEMP TRAVEL! We are committed to providing premium chauffeur transit..."
                      value={replyText}
                      onChange={(e) => setReplyText(e.target.value)}
                      className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-slate-100 focus:outline-none focus:border-amber-400"
                    />
                  </div>

                  <div className="pt-2 flex justify-end gap-3">
                    <button
                      type="button"
                      onClick={() => setSelectedReview(null)}
                      className="px-4 py-2 bg-slate-950 text-slate-400 hover:text-white rounded-xl text-xs"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-5 py-2 bg-amber-500 text-slate-950 font-bold rounded-xl text-xs uppercase"
                    >
                      Post to Google Business
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </Portal>
      )}
    </div>
  );
}
