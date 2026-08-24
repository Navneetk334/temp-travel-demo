"use client";

import React, { useState, useEffect } from "react";
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
  const [editingArticle, setEditingArticle] = useState<any | null>(null);
  const [selectedArticle, setSelectedArticle] = useState<any | null>(null);

  const [articles, setArticles] = useState<any[]>([]);
  const [categories, setCategories] = useState<string[]>([
    "Outstation Trips",
    "Corporate Travel",
    "Airport Transfers",
    "Local City Guides"
  ]);

  // Local storage hydration and initialization
  useEffect(() => {
    const savedCategories = localStorage.getItem("user_uploaded_blog_categories");
    if (savedCategories) {
      try {
        const parsedCats = JSON.parse(savedCategories);
        if (Array.isArray(parsedCats) && parsedCats.length > 0) {
          setCategories(parsedCats.map((c: any) => c.name));
        }
      } catch (e) {
        console.error(e);
      }
    }

    const saved = localStorage.getItem("user_uploaded_blogs");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setArticles(parsed);
          return;
        }
      } catch (e) {
        console.error(e);
      }
    }

    const defaultBlogs = [
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
    ];
    setArticles(defaultBlogs);
  }, []);

  const [newArticle, setNewArticle] = useState({
    title: "",
    slug: "",
    category: "Outstation Trips",
    seoKeywords: "",
    metaDescription: "",
    content: "",
    coverFileName: ""
  });

  const openAddModal = () => {
    setEditingArticle(null);
    setNewArticle({
      title: "",
      slug: "",
      category: "Outstation Trips",
      seoKeywords: "",
      metaDescription: "",
      content: "",
      coverFileName: ""
    });
    setShowAddModal(true);
  };

  const openEditModal = (art: any) => {
    setEditingArticle(art);
    setNewArticle({
      title: art.title,
      slug: art.slug,
      category: art.category,
      seoKeywords: art.seoKeywords || "",
      metaDescription: art.metaDescription || "",
      content: art.content || "",
      coverFileName: art.coverFileName || art.coverImage || ""
    });
    setShowAddModal(true);
  };

  const handleSaveArticleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const slug = newArticle.slug || newArticle.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)+/g, "");

    let updatedArticles: any[] = [];
    if (editingArticle) {
      updatedArticles = articles.map(a => a.id === editingArticle.id ? {
        ...a,
        title: newArticle.title,
        slug,
        category: newArticle.category,
        seoKeywords: newArticle.seoKeywords || "Car Rental",
        content: newArticle.content,
        coverImage: newArticle.coverFileName || a.coverImage
      } : a);
    } else {
      const created = {
        id: `art-${Date.now()}`,
        title: newArticle.title,
        slug,
        category: newArticle.category,
        seoKeywords: newArticle.seoKeywords || "Car Rental",
        author: "Master HQ Admin",
        date: new Date().toISOString().slice(0, 10),
        status: "PUBLISHED",
        views: 1,
        coverImage: newArticle.coverFileName || "/images/hero-car.png",
        content: newArticle.content || "Content published via Master HQ CMS."
      };
      updatedArticles = [created, ...articles];
    }

    setArticles(updatedArticles);
    localStorage.setItem("user_uploaded_blogs", JSON.stringify(updatedArticles));
    setShowAddModal(false);
    setEditingArticle(null);
  };

  const handleDeleteArticle = (id: string) => {
    if (confirm("Are you sure you want to delete this blog article?")) {
      const updated = articles.filter(a => a.id !== id);
      setArticles(updated);
      localStorage.setItem("user_uploaded_blogs", JSON.stringify(updated));
    }
  };

  const toggleStatus = (id: string) => {
    const updated = articles.map(a => a.id === id ? { ...a, status: a.status === "PUBLISHED" ? "DRAFT" : "PUBLISHED" } : a);
    setArticles(updated);
    localStorage.setItem("user_uploaded_blogs", JSON.stringify(updated));
  };

  const filteredArticles = articles.filter(a =>
    a.title.toLowerCase().includes(search.toLowerCase()) ||
    a.category.toLowerCase().includes(search.toLowerCase()) ||
    (a.seoKeywords && a.seoKeywords.toLowerCase().includes(search.toLowerCase()))
  );

  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const handleSelectAll = () => {
    if (selectedIds.length === filteredArticles.length && filteredArticles.length > 0) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredArticles.map(a => a.id));
    }
  };

  const handleToggleSelect = (id: string) => {
    setSelectedIds(prev =>
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const handleBulkDelete = () => {
    if (selectedIds.length === 0) return;
    if (confirm(`Are you sure you want to delete ${selectedIds.length} selected blog article(s)?`)) {
      const updated = articles.filter(a => !selectedIds.includes(a.id));
      setArticles(updated);
      setSelectedIds([]);
      localStorage.setItem("user_uploaded_blogs", JSON.stringify(updated));
    }
  };

  const handleBulkStatusChange = (status: "PUBLISHED" | "DRAFT") => {
    if (selectedIds.length === 0) return;
    const updated = articles.map(a => selectedIds.includes(a.id) ? { ...a, status } : a);
    setArticles(updated);
    localStorage.setItem("user_uploaded_blogs", JSON.stringify(updated));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-amber-500/20 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-black tracking-tight text-slate-50">
              Master Blog CMS & SEO Growth Content Engine
            </h1>
            <span className="bg-amber-500/10 text-amber-400 border border-amber-500/30 text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider">
              Digital SEO HQ
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Publish and edit SEO articles, target high-volume search keywords, and rank #1 on Google for cab services.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/master-admin/blog/categories"
            className="flex items-center gap-1.5 bg-slate-900 border border-white/10 hover:border-amber-400/40 text-slate-300 px-3 py-1.5 rounded-xl text-xs font-bold transition-all"
          >
            <Tag className="w-3.5 h-3.5 text-amber-400" />
            <span>Blog Categories</span>
          </Link>
          <button
            onClick={openAddModal}
            className="flex items-center gap-1.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 px-3.5 py-1.5 rounded-xl text-xs font-black tracking-wider uppercase transition-all shadow-md shadow-amber-500/20 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
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

        <div className="bg-slate-900/80 backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-xl">
          <div className="flex justify-between items-center mb-2">
            <span className="text-xs text-slate-400 font-bold uppercase">Organic Search Focus</span>
            <Globe className="w-5 h-5 text-amber-400" />
          </div>
          <div className="text-3xl font-black text-slate-50 font-mono">India-Wide</div>
          <div className="text-[11px] text-slate-400 mt-1">Delhi, Mumbai, Goa, Bangalore, Pune</div>
        </div>

        <div className="bg-slate-900/80 backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-xl">
          <div className="flex justify-between items-center mb-2">
            <span className="text-xs text-slate-400 font-bold uppercase">Active Categories</span>
            <Tag className="w-5 h-5 text-amber-400" />
          </div>
          <div className="text-3xl font-black text-slate-50 font-mono">{categories.length} Topics</div>
          <div className="text-[11px] text-slate-400 mt-1">High-Intent Commercial Keyword Clusters</div>
        </div>
      </div>

      {/* Articles Management Table */}
      <div className="bg-slate-900/80 backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pb-4 border-b border-white/10">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search articles by title, keywords or category..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-slate-950 border border-white/10 rounded-xl pl-9 pr-4 py-2 text-xs text-slate-100 focus:outline-none focus:border-amber-400"
            />
          </div>
        </div>

        {/* Multi-Select Bulk Actions Bar */}
        {selectedIds.length > 0 && (
          <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl animate-in fade-in slide-in-from-top-2">
            <div className="flex items-center gap-2">
              <span className="bg-amber-500 text-slate-950 text-xs font-black px-2.5 py-0.5 rounded-md font-mono">
                {selectedIds.length} Selected
              </span>
              <span className="text-xs text-slate-300 font-medium">Bulk Blog Operations</span>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <button
                onClick={() => handleBulkStatusChange("PUBLISHED")}
                className="bg-slate-950 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer"
              >
                Publish All
              </button>
              <button
                onClick={() => handleBulkStatusChange("DRAFT")}
                className="bg-slate-950 hover:bg-white/10 text-slate-300 border border-white/10 px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer"
              >
                Set to Draft
              </button>
              <button
                onClick={handleBulkDelete}
                className="bg-rose-500/10 hover:bg-rose-500 text-rose-400 hover:text-white border border-rose-500/30 px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer"
              >
                Delete Selected
              </button>
              <button
                onClick={() => setSelectedIds([])}
                className="text-xs text-slate-400 hover:text-white font-bold underline px-2 py-1 cursor-pointer"
              >
                Deselect All
              </button>
            </div>
          </div>
        )}

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950 text-slate-400 font-extrabold uppercase text-[10px] tracking-wider border-b border-white/10">
              <tr>
                <th className="py-3 px-3 w-10 text-center">
                  <input
                    type="checkbox"
                    checked={filteredArticles.length > 0 && selectedIds.length === filteredArticles.length}
                    onChange={handleSelectAll}
                    className="w-4 h-4 rounded border-white/20 bg-slate-900 text-amber-500 focus:ring-amber-400 cursor-pointer accent-amber-500"
                    title="Select All Blogs"
                  />
                </th>
                <th className="py-3 px-4">Article Title & Path</th>
                <th className="py-3 px-4">Category & Keywords</th>
                <th className="py-3 px-4">Published Date</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredArticles.map((art) => {
                const isSelected = selectedIds.includes(art.id);
                return (
                  <tr
                    key={art.id}
                    className={`transition-colors ${
                      isSelected ? "bg-amber-500/10" : "hover:bg-white/5"
                    }`}
                  >
                    <td className="py-4 px-3 text-center">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => handleToggleSelect(art.id)}
                        className="w-4 h-4 rounded border-white/20 bg-slate-900 text-amber-500 focus:ring-amber-400 cursor-pointer accent-amber-500"
                      />
                    </td>
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
                    <td className="py-3 px-3 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => openEditModal(art)}
                          className="inline-flex items-center gap-1 bg-slate-950 text-slate-300 hover:text-white border border-white/10 hover:border-amber-400/40 px-2.5 py-1.5 rounded-lg text-[10px] font-bold transition-all cursor-pointer shadow-sm"
                        >
                          <Edit2 className="w-3 h-3 text-amber-400" />
                          <span>Edit</span>
                        </button>
                        <button
                          onClick={() => setSelectedArticle(art)}
                          className="inline-flex items-center gap-1 bg-slate-950 text-slate-300 hover:text-white border border-white/10 px-2.5 py-1.5 rounded-lg text-[10px] font-bold transition-all cursor-pointer shadow-sm"
                        >
                          <Eye className="w-3 h-3 text-amber-400" />
                          <span>Read</span>
                        </button>
                        <a
                          href={`/blog/${art.slug}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 bg-amber-500/10 text-amber-400 border border-amber-500/30 px-2.5 py-1.5 rounded-lg hover:bg-amber-500 hover:text-slate-950 text-[10px] font-bold transition-all shadow-sm"
                        >
                          <span>Live</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                        <button
                          onClick={() => handleDeleteArticle(art.id)}
                          className="inline-flex items-center p-1.5 bg-slate-950 text-slate-400 hover:text-rose-400 border border-white/10 hover:border-rose-400/40 rounded-lg text-[10px] font-bold transition-all cursor-pointer shadow-sm"
                          title="Delete Article"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create / Edit Blog Article Modal */}
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
              <span className="text-[10px] font-bold uppercase text-amber-400 tracking-wider">
                {editingArticle ? "Update Existing Post" : "Master Content Engine"}
              </span>
              <h3 className="text-xl sm:text-2xl font-black text-slate-50">
                {editingArticle ? "Edit Blog Article" : "Publish New Blog Article"}
              </h3>
            </div>

            <form onSubmit={handleSaveArticleSubmit} className="space-y-4 text-xs">
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
                    {categories.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
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
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      const reader = new FileReader();
                      reader.onload = (re) => {
                        setNewArticle(prev => ({
                          ...prev,
                          coverFileName: re.target?.result as string || file.name
                        }));
                      };
                      reader.readAsDataURL(file);
                    }
                  }}
                  className="w-full bg-slate-950 border border-white/10 rounded-xl px-3.5 py-2 text-slate-300 text-xs file:mr-4 file:py-1 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-amber-500 file:text-slate-950"
                />
              </div>

              <div className="pt-3 border-t border-white/10 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-5 py-2.5 bg-slate-950 text-slate-400 hover:text-white rounded-xl text-xs font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-black rounded-xl text-xs uppercase tracking-wider shadow-lg shadow-amber-500/20 cursor-pointer"
                >
                  {editingArticle ? "Save Changes" : "Publish Article"}
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
