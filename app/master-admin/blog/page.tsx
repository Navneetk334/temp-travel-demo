"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  FileText,
  Plus,
  Search,
  Sparkles,
  CheckCircle2,
  Globe,
  Tag,
  Calendar,
  X,
  Upload,
  ExternalLink,
  Eye,
  Edit2,
  Trash2
} from "lucide-react";

export default function MasterBlogCMSPage() {
  const [search, setSearch] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedArticle, setSelectedArticle] = useState<any | null>(null);

  const [articles, setArticles] = useState([
    {
      id: "art-1",
      title: "Top 10 Outstation Cab Travel Routes from Mumbai to Pune & Mahabaleshwar",
      slug: "top-10-outstation-cab-routes-mumbai-pune",
      category: "Outstation Trips",
      seoKeywords: "Mumbai Pune Cab, Outstation Taxi, Innova Crysta",
      author: "TEMP TRAVEL Editorial Team",
      date: "2026-08-20",
      status: "PUBLISHED",
      views: 1420,
      coverImage: "/images/hero-car.png",
      content: "Exploring the lush green Western Ghats between Mumbai and Pune requires a reliable, comfortable chauffeur-driven car rental. In this comprehensive guide, we cover the top routes, toll plaza advice, and why booking an Innova Crysta with TEMP TRAVEL CAR RENTALS PVT LTD ensures a stress-free trip."
    },
    {
      id: "art-2",
      title: "Corporate Employee Transit Solutions: Maximizing Productivity in BKC & Powai",
      slug: "corporate-employee-transit-solutions-mumbai",
      category: "Corporate Travel",
      seoKeywords: "Corporate Cabs BKC, Employee Transit Roster, Executive Shuttle",
      author: "Navneet Kumar (Operations HQ)",
      date: "2026-08-18",
      status: "PUBLISHED",
      views: 2890,
      coverImage: "/images/hero-car.png",
      content: "Corporate logistics in Mumbai's business hubs require punctual, ISO 9001-certified chauffeur services. TEMP TRAVEL delivers automated roster management and real-time GPS telematics for multinational firms."
    },
    {
      id: "art-3",
      title: "Complete Guide to Airport Transfer Rentals at Chhatrapati Shivaji Maharaj Intl T2",
      slug: "airport-transfer-rental-guide-mumbai-t2",
      category: "Airport Transfers",
      seoKeywords: "Mumbai Airport T2 Cab, Pickup Drop Cabs, Sahar Hub Shuttle",
      author: "TEMP TRAVEL Editorial Team",
      date: "2026-08-15",
      status: "PUBLISHED",
      views: 3100,
      coverImage: "/images/hero-car.png",
      content: "Avoid airport pickup hassles with TEMP TRAVEL's 24/7 dedicated airport transfer shuttle. Learn about pickup points, transparent billing, and flight tracking integration."
    }
  ]);

  const [newArticle, setNewArticle] = useState({
    title: "",
    slug: "",
    category: "Outstation Trips",
    seoKeywords: "",
    metaDescription: "",
    content: "",
    coverFileName: ""
  });

  const handleCreateArticleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const slug = newArticle.slug || newArticle.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)+/g, "");
    const created = {
      id: `art-${articles.length + 1}`,
      title: newArticle.title,
      slug,
      category: newArticle.category,
      seoKeywords: newArticle.seoKeywords || "Car Rental Mumbai",
      author: "Master HQ Admin",
      date: new Date().toISOString().slice(0, 10),
      status: "PUBLISHED",
      views: 1,
      coverImage: "/images/hero-car.png",
      content: newArticle.content || "Content published via Master HQ CMS."
    };
    setArticles([created, ...articles]);
    setShowAddModal(false);
    setNewArticle({ title: "", slug: "", category: "Outstation Trips", seoKeywords: "", metaDescription: "", content: "", coverFileName: "" });
  };

  const toggleStatus = (id: string) => {
    setArticles(prev => prev.map(a => a.id === id ? { ...a, status: a.status === "PUBLISHED" ? "DRAFT" : "PUBLISHED" } : a));
  };

  const filteredArticles = articles.filter(a =>
    a.title.toLowerCase().includes(search.toLowerCase()) ||
    a.category.toLowerCase().includes(search.toLowerCase()) ||
    a.seoKeywords.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-amber-500/20 pb-6">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-3xl font-black tracking-tight text-slate-50">
              Master Blog CMS & SEO Growth Content Engine
            </h1>
            <span className="bg-amber-500/10 text-amber-400 border border-amber-500/30 text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-widest">
              Digital SEO HQ
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Publish SEO articles, target high-volume search keywords, and rank #1 on Google for company cab services.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 px-4 py-2 rounded-xl text-xs font-black tracking-wider uppercase transition-all shadow-lg shadow-amber-500/20 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Create New Article</span>
          </button>
        </div>
      </div>

      {/* SEO Content Performance Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-slate-900/80 backdrop-blur-xl border border-amber-500/30 rounded-2xl p-6 shadow-xl">
          <div className="flex justify-between items-center mb-2">
            <span className="text-xs text-slate-400 font-bold uppercase">Published SEO Articles</span>
            <FileText className="w-5 h-5 text-amber-400" />
          </div>
          <div className="text-3xl font-black text-slate-50 font-mono">{articles.filter(a => a.status === "PUBLISHED").length} Articles</div>
          <div className="text-[11px] text-emerald-400 mt-1">100% Schema.org BlogPosting Indexed</div>
        </div>

        <div className="bg-slate-900/80 backdrop-blur-xl border border-blue-500/30 rounded-2xl p-6 shadow-xl">
          <div className="flex justify-between items-center mb-2">
            <span className="text-xs text-slate-400 font-bold uppercase">Organic Blog Traffic</span>
            <Globe className="w-5 h-5 text-blue-400" />
          </div>
          <div className="text-3xl font-black text-slate-50 font-mono">7,410 Reads</div>
          <div className="text-[11px] text-blue-400 mt-1">Driving Qualified Leads to Booking Widget</div>
        </div>

        <div className="bg-slate-900/80 backdrop-blur-xl border border-purple-500/30 rounded-2xl p-6 shadow-xl">
          <div className="flex justify-between items-center mb-2">
            <span className="text-xs text-slate-400 font-bold uppercase">Google Organic Ranking</span>
            <Sparkles className="w-5 h-5 text-purple-400" />
          </div>
          <div className="text-3xl font-black text-slate-50 font-mono">Top 3 Rank</div>
          <div className="text-[11px] text-purple-400 mt-1">Outstation & Airport Cab Search</div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-slate-900/60 p-4 rounded-2xl border border-white/10">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search article title, keyword or category..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-950 border border-white/10 rounded-xl pl-9 pr-4 py-2 text-xs text-slate-100 focus:outline-none focus:border-amber-400"
          />
        </div>
      </div>

      {/* Articles Table */}
      <div className="bg-slate-900/80 backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-2xl space-y-4">
        <div className="flex justify-between items-center pb-4 border-b border-white/10">
          <h3 className="text-base font-bold text-slate-100">Live Blog Publications & SEO Index</h3>
          <span className="text-xs font-mono text-slate-400">Total: {filteredArticles.length} Posts</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950 text-slate-400 font-extrabold uppercase text-[10px] tracking-wider border-b border-white/10">
              <tr>
                <th className="py-3 px-4">Article Title & Slug</th>
                <th className="py-3 px-4">Category & Keywords</th>
                <th className="py-3 px-4">Published Date</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredArticles.map((art) => (
                <tr key={art.id} className="hover:bg-white/5 transition-colors">
                  <td className="py-4 px-4">
                    <div className="font-bold text-slate-100">{art.title}</div>
                    <div className="text-[10px] font-mono text-amber-400">/blog/{art.slug}</div>
                  </td>
                  <td className="py-4 px-4">
                    <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-amber-500/10 text-amber-400 border border-amber-500/20 mb-1">
                      {art.category}
                    </span>
                    <div className="text-[10px] text-slate-400 font-mono">Keywords: {art.seoKeywords}</div>
                  </td>
                  <td className="py-4 px-4 font-mono text-slate-400">{art.date}</td>
                  <td className="py-4 px-4">
                    <button
                      onClick={() => toggleStatus(art.id)}
                      className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase border cursor-pointer ${
                        art.status === "PUBLISHED"
                          ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                          : "bg-slate-950 text-slate-400 border-white/10"
                      }`}
                    >
                      {art.status}
                    </button>
                  </td>
                  <td className="py-4 px-4 text-right space-x-2">
                    <button
                      onClick={() => setSelectedArticle(art)}
                      className="inline-flex items-center gap-1 bg-slate-950 text-slate-300 hover:text-white border border-white/10 px-3 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer"
                    >
                      <Eye className="w-3 h-3 text-amber-400" /> Read
                    </button>
                    <a
                      href={`/blog/${art.slug}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 bg-amber-500/10 text-amber-400 border border-amber-500/30 px-3 py-1 rounded-lg hover:bg-amber-500 hover:text-slate-950 text-[11px] font-bold transition-all"
                    >
                      Live <ExternalLink className="w-3 h-3" />
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create Blog Article Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-amber-500/30 rounded-3xl p-6 sm:p-8 w-full max-w-2xl shadow-2xl space-y-4 relative text-slate-100 max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setShowAddModal(false)}
              className="absolute top-5 right-5 text-slate-400 hover:text-white cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="space-y-1 border-b border-white/10 pb-3">
              <span className="text-[10px] font-bold uppercase text-amber-400 tracking-wider">Master Content Engine</span>
              <h3 className="text-2xl font-black text-slate-50">Publish New Blog Article</h3>
            </div>

            <form onSubmit={handleCreateArticleSubmit} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="text-slate-300 font-bold">Article Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Complete Guide to Renting Innova Crysta for Mumbai to Goa Outstation"
                  value={newArticle.title}
                  onChange={(e) => setNewArticle({ ...newArticle, title: e.target.value })}
                  className="w-full bg-slate-950 border border-white/10 rounded-xl px-3.5 py-2.5 text-slate-100 focus:outline-none focus:border-amber-400 font-semibold"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-slate-300 font-bold">Blog Category</label>
                  <select
                    value={newArticle.category}
                    onChange={(e) => setNewArticle({ ...newArticle, category: e.target.value })}
                    className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-slate-100 focus:outline-none focus:border-amber-400"
                  >
                    <option value="Outstation Trips">Outstation Trips</option>
                    <option value="Corporate Travel">Corporate Travel</option>
                    <option value="Airport Transfers">Airport Transfers</option>
                    <option value="Local City Guides">Local City Guides</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-slate-300 font-bold">Target SEO Keywords *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Innova Crysta Rental, Mumbai Goa Cab"
                    value={newArticle.seoKeywords}
                    onChange={(e) => setNewArticle({ ...newArticle, seoKeywords: e.target.value })}
                    className="w-full bg-slate-950 border border-white/10 rounded-xl px-3.5 py-2 text-slate-100 focus:outline-none focus:border-amber-400 font-mono"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-slate-300 font-bold">Article Body Content *</label>
                <textarea
                  required
                  rows={6}
                  placeholder="Write complete blog content with headings, travel tips, and call-to-actions..."
                  value={newArticle.content}
                  onChange={(e) => setNewArticle({ ...newArticle, content: e.target.value })}
                  className="w-full bg-slate-950 border border-white/10 rounded-xl px-3.5 py-2.5 text-slate-100 focus:outline-none focus:border-amber-400 font-sans leading-relaxed"
                />
              </div>

              <div className="space-y-1">
                <label className="text-slate-300 font-bold">Cover Image Upload from Device</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setNewArticle({ ...newArticle, coverFileName: e.target.files?.[0]?.name || "" })}
                  className="w-full bg-slate-950 border border-white/10 rounded-xl px-3.5 py-2 text-slate-300 text-xs file:mr-4 file:py-1 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-amber-500 file:text-slate-950"
                />
              </div>

              <div className="pt-3 border-t border-white/10 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-5 py-2.5 bg-slate-950 text-slate-400 hover:text-white rounded-xl text-xs font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-black rounded-xl text-xs uppercase tracking-wider shadow-lg shadow-amber-500/20 cursor-pointer"
                >
                  Publish Article
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Article Inspector Modal */}
      {selectedArticle && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-amber-500/30 rounded-2xl p-6 w-full max-w-lg shadow-2xl space-y-4 relative text-slate-100">
            <button
              onClick={() => setSelectedArticle(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="space-y-1">
              <span className="text-[10px] font-bold uppercase text-amber-400 tracking-wider">CMS Article Inspector</span>
              <h3 className="text-xl font-bold text-slate-50">{selectedArticle.title}</h3>
            </div>

            <div className="space-y-2 bg-slate-950 p-4 rounded-xl border border-white/10 text-xs">
              <div className="font-mono text-amber-400 font-bold">Category: {selectedArticle.category}</div>
              <div className="font-mono text-slate-300">Keywords: {selectedArticle.seoKeywords}</div>
              <p className="text-slate-300 leading-relaxed font-sans pt-2 border-t border-white/5">{selectedArticle.content}</p>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setSelectedArticle(null)}
                className="px-4 py-2 bg-amber-500 text-slate-950 font-bold rounded-xl text-xs cursor-pointer"
              >
                Close Article
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
