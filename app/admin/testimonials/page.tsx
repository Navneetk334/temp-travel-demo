"use client";

import React, { useState, useEffect } from "react";
import { 
  MessageSquare, 
  Star, 
  Trash2, 
  CheckCircle2, 
  XCircle, 
  Award,
  Plus,
  Edit,
  X,
  Search,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
  User,
  Building
} from "lucide-react";
import Portal from "@/components/shared/portal";

export type TestimonialStatus = "APPROVED" | "PENDING" | "REJECTED";

interface Testimonial {
  id: string;
  authorName: string;
  authorRole?: string | null;
  companyName?: string | null;
  content: string;
  rating: number;
  avatarUrl?: string | null;
  isFeatured: boolean;
  status: TestimonialStatus;
  createdAt: string;
}

interface Stats {
  total: number;
  APPROVED: number;
  PENDING: number;
  REJECTED: number;
  FEATURED: number;
}

export default function AdminTestimonialsPage() {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Testimonial | null>(null);

  // Filters & Pagination State
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [sortBy, setSortBy] = useState("createdAt");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [stats, setStats] = useState<Stats>({
    total: 0,
    APPROVED: 0,
    PENDING: 0,
    REJECTED: 0,
    FEATURED: 0,
  });

  // Form State
  const [formData, setFormData] = useState({
    authorName: "",
    authorRole: "",
    companyName: "",
    content: "",
    rating: 5,
    avatarUrl: "",
    isFeatured: false,
    status: "APPROVED" as TestimonialStatus,
  });

  const [formError, setFormError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const loadTestimonials = async () => {
    setLoading(true);
    try {
      const queryParams = new URLSearchParams({
        admin: "true",
        search,
        status: statusFilter,
        sortBy,
        sortOrder,
        page: currentPage.toString(),
        limit: pageSize.toString(),
      });

      const res = await fetch(`/api/testimonials?${queryParams.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setTestimonials(data.testimonials || []);
        setTotalCount(data.pagination?.totalCount || 0);
        setTotalPages(data.pagination?.totalPages || 1);
        if (data.stats) {
          setStats(data.stats);
        }
      }
    } catch (err) {
      console.error("Failed to load testimonials:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTestimonials();
  }, [search, statusFilter, sortBy, sortOrder, currentPage, pageSize]);

  const openModal = (item: Testimonial | null = null) => {
    setFormError("");
    if (item) {
      setEditingItem(item);
      setFormData({
        authorName: item.authorName,
        authorRole: item.authorRole || "",
        companyName: item.companyName || "",
        content: item.content,
        rating: item.rating,
        avatarUrl: item.avatarUrl || "",
        isFeatured: item.isFeatured,
        status: item.status,
      });
    } else {
      setEditingItem(null);
      setFormData({
        authorName: "",
        authorRole: "Traveler",
        companyName: "",
        content: "",
        rating: 5,
        avatarUrl: "",
        isFeatured: false,
        status: "APPROVED",
      });
    }
    setIsModalOpen(true);
  };

  const handleSaveTestimonial = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");
    setIsSubmitting(true);

    try {
      const payload: any = {
        authorName: formData.authorName,
        authorRole: formData.authorRole || null,
        companyName: formData.companyName || null,
        content: formData.content,
        rating: Number(formData.rating),
        avatarUrl: formData.avatarUrl.trim() || null,
        isFeatured: formData.isFeatured,
        status: formData.status,
      };

      const url = editingItem ? `/api/testimonials/${editingItem.id}` : "/api/testimonials";
      const method = editingItem ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        setFormError(data.error || "Failed to save testimonial");
        return;
      }

      setIsModalOpen(false);
      loadTestimonials();
    } catch (err) {
      setFormError("Server connection error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleStatusChange = async (id: string, newStatus: TestimonialStatus) => {
    try {
      const res = await fetch(`/api/testimonials/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        loadTestimonials();
      }
    } catch (err) {
      console.error("Failed to update status:", err);
    }
  };

  const handleToggleFeatured = async (id: string, currentFeatured: boolean) => {
    try {
      const res = await fetch(`/api/testimonials/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isFeatured: !currentFeatured }),
      });
      if (res.ok) {
        loadTestimonials();
      }
    } catch (err) {
      console.error("Failed to toggle featured status:", err);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this customer testimonial?")) return;
    try {
      const res = await fetch(`/api/testimonials/${id}`, { method: "DELETE" });
      if (res.ok) {
        loadTestimonials();
      } else {
        alert("Failed to delete testimonial");
      }
    } catch (e) {
      console.error("Failed to delete testimonial:", e);
    }
  };

  return (
    <div className="bg-slate-950 min-h-screen text-slate-100 p-8 space-y-8">
      
      {/* Title Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-white/5 pb-6 gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-50 tracking-tight flex items-center gap-2.5">
            <MessageSquare className="w-8 h-8 text-accent" />
            <span>Testimonials & Review Moderation Log</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Audit customer reviews, approve ratings, assign 1-5 star ratings, and pin featured customer stories to the homepage.
          </p>
        </div>
        <button
          onClick={() => openModal()}
          className="flex items-center gap-1.5 bg-accent hover:bg-yellow-500 text-slate-950 font-extrabold py-2.5 px-6 rounded-lg text-xs tracking-wider uppercase transition-all shadow-lg"
        >
          <Plus className="w-4 h-4" />
          <span>Add Testimonial</span>
        </button>
      </div>

      {/* Review Status Counters Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <div 
          onClick={() => { setStatusFilter(""); setCurrentPage(1); }}
          className={`glassmorphism p-3 rounded-xl border cursor-pointer transition-all ${
            statusFilter === "" ? "border-accent bg-accent/10" : "border-white/5 hover:border-white/20"
          }`}
        >
          <div className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Total Reviews</div>
          <div className="text-xl font-black text-slate-50 mt-1">{stats.total}</div>
        </div>

        <div 
          onClick={() => { setStatusFilter("APPROVED"); setCurrentPage(1); }}
          className={`glassmorphism p-3 rounded-xl border cursor-pointer transition-all ${
            statusFilter === "APPROVED" ? "border-emerald-400 bg-emerald-500/10" : "border-white/5 hover:border-white/20"
          }`}
        >
          <div className="text-[10px] text-emerald-400 uppercase font-bold tracking-wider">APPROVED</div>
          <div className="text-xl font-black text-emerald-400 mt-1">{stats.APPROVED}</div>
        </div>

        <div 
          onClick={() => { setStatusFilter("PENDING"); setCurrentPage(1); }}
          className={`glassmorphism p-3 rounded-xl border cursor-pointer transition-all ${
            statusFilter === "PENDING" ? "border-yellow-400 bg-yellow-500/10" : "border-white/5 hover:border-white/20"
          }`}
        >
          <div className="text-[10px] text-yellow-400 uppercase font-bold tracking-wider">PENDING REVIEW</div>
          <div className="text-xl font-black text-yellow-400 mt-1">{stats.PENDING}</div>
        </div>

        <div 
          onClick={() => { setStatusFilter("REJECTED"); setCurrentPage(1); }}
          className={`glassmorphism p-3 rounded-xl border cursor-pointer transition-all ${
            statusFilter === "REJECTED" ? "border-rose-400 bg-rose-500/10" : "border-white/5 hover:border-white/20"
          }`}
        >
          <div className="text-[10px] text-rose-400 uppercase font-bold tracking-wider">REJECTED</div>
          <div className="text-xl font-black text-rose-400 mt-1">{stats.REJECTED}</div>
        </div>

        <div 
          onClick={() => { setStatusFilter("FEATURED"); setCurrentPage(1); }}
          className={`glassmorphism p-3 rounded-xl border cursor-pointer transition-all ${
            statusFilter === "FEATURED" ? "border-amber-400 bg-amber-500/10" : "border-white/5 hover:border-white/20"
          }`}
        >
          <div className="text-[10px] text-amber-400 uppercase font-bold tracking-wider flex items-center gap-1">
            <Award className="w-3 h-3 text-amber-400" />
            <span>FEATURED PINNED</span>
          </div>
          <div className="text-xl font-black text-amber-400 mt-1">{stats.FEATURED}</div>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="glassmorphism p-6 rounded-xl border border-white/5 flex flex-col md:flex-row gap-4 items-center justify-between">
        
        {/* Search */}
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search author, company, content..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
            className="w-full bg-slate-950/60 border border-white/10 rounded-lg py-2 pl-10 pr-4 text-xs text-slate-100 focus:outline-none focus:border-accent transition-all"
          />
        </div>

        {/* Filter Dropdowns */}
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          <select
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1); }}
            className="bg-slate-950/60 border border-white/10 rounded-lg py-2 px-3 text-xs text-slate-100 focus:outline-none focus:border-accent"
          >
            <option value="" className="bg-slate-900">All Review Statuses</option>
            <option value="APPROVED" className="bg-slate-900 text-emerald-400">APPROVED</option>
            <option value="PENDING" className="bg-slate-900 text-yellow-400">PENDING</option>
            <option value="REJECTED" className="bg-slate-900 text-rose-400">REJECTED</option>
          </select>

          <select
            value={sortBy}
            onChange={(e) => { setSortBy(e.target.value); setCurrentPage(1); }}
            className="bg-slate-950/60 border border-white/10 rounded-lg py-2 px-3 text-xs text-slate-100 focus:outline-none focus:border-accent"
          >
            <option value="createdAt" className="bg-slate-900">Sort by Date</option>
            <option value="rating" className="bg-slate-900">Sort by Rating</option>
          </select>
        </div>

      </div>

      {/* Testimonials Cards Grid */}
      {loading ? (
        <div className="text-center py-20 text-slate-400 text-xs">Loading customer reviews...</div>
      ) : testimonials.length === 0 ? (
        <div className="glassmorphism p-16 text-center rounded-xl border border-white/5 text-slate-500 italic text-xs">
          No customer testimonials found matching selected criteria.
        </div>
      ) : (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials.map((t) => (
              <div 
                key={t.id} 
                className="bg-slate-900 border border-white/5 p-6 rounded-xl space-y-4 hover:border-accent/40 transition-all flex flex-col justify-between"
              >
                
                <div className="space-y-3">
                  {/* Rating & Featured Pin */}
                  <div className="flex justify-between items-center">
                    <div className="flex gap-0.5">
                      {[...Array(5)].map((_, idx) => (
                        <Star 
                          key={idx} 
                          className={`w-3.5 h-3.5 ${
                            idx < t.rating ? "fill-amber-400 text-amber-400" : "text-slate-700 fill-slate-800"
                          }`} 
                        />
                      ))}
                    </div>
                    <button
                      onClick={() => handleToggleFeatured(t.id, t.isFeatured)}
                      className={`flex items-center gap-1 text-[9px] font-bold py-0.5 px-2 rounded-full border transition-colors ${
                        t.isFeatured
                          ? "bg-amber-500/10 text-amber-400 border-amber-500/30 font-black"
                          : "bg-slate-950 text-slate-500 border-white/5 hover:text-slate-300"
                      }`}
                    >
                      <Award className="w-3 h-3" />
                      <span>{t.isFeatured ? "FEATURED" : "PIN TO HOME"}</span>
                    </button>
                  </div>

                  {/* Content */}
                  <p className="text-slate-200 text-xs italic leading-relaxed font-serif">"{t.content}"</p>
                  
                  {/* Author details */}
                  <div className="pt-3 border-t border-white/5 flex items-center gap-3">
                    {t.avatarUrl ? (
                      <img 
                        src={t.avatarUrl} 
                        alt={t.authorName} 
                        className="w-8 h-8 rounded-full object-cover border border-white/10"
                        onError={(e) => { (e.target as HTMLElement).style.display = 'none'; }}
                      />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-slate-950 border border-white/10 flex items-center justify-center text-slate-400 font-bold text-xs">
                        {t.authorName.charAt(0)}
                      </div>
                    )}
                    <div>
                      <div className="font-bold text-slate-100 text-xs">{t.authorName}</div>
                      <div className="text-[10px] text-slate-400 mt-0.5 font-medium">
                        {t.authorRole || "Customer"} {t.companyName ? `at ${t.companyName}` : ""}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Status and Action Buttons */}
                <div className="flex justify-between items-center pt-4 border-t border-white/5">
                  <span className={`text-[9px] font-black py-0.5 px-2.5 rounded-full border uppercase ${
                    t.status === "APPROVED"
                      ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                      : t.status === "PENDING"
                      ? "bg-yellow-500/10 text-yellow-400 border-yellow-500/20"
                      : "bg-rose-500/10 text-rose-400 border-rose-500/20"
                  }`}>
                    {t.status}
                  </span>

                  <div className="flex gap-1.5">
                    <button
                      onClick={() => openModal(t)}
                      className="p-1.5 bg-slate-950 border border-white/5 rounded-lg text-slate-400 hover:text-accent transition-colors"
                      title="Edit Review"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleStatusChange(t.id, "APPROVED")}
                      className="p-1.5 bg-slate-950 border border-white/5 rounded-lg text-slate-400 hover:text-emerald-400 transition-colors"
                      title="Approve Testimonial"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleStatusChange(t.id, "REJECTED")}
                      className="p-1.5 bg-slate-950 border border-white/5 rounded-lg text-slate-400 hover:text-rose-400 transition-colors"
                      title="Reject Testimonial"
                    >
                      <XCircle className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(t.id)}
                      className="p-1.5 bg-slate-950 border border-white/5 rounded-lg text-slate-400 hover:text-rose-400 transition-colors"
                      title="Delete Testimonial"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

              </div>
            ))}
          </div>

          {/* Pagination Bar */}
          <div className="p-4 bg-slate-900/60 rounded-xl border border-white/5 flex items-center justify-between text-xs text-slate-400">
            <div>
              Showing <span className="font-bold text-slate-200">{totalCount > 0 ? (currentPage - 1) * pageSize + 1 : 0}</span> to <span className="font-bold text-slate-200">{Math.min(currentPage * pageSize, totalCount)}</span> of <span className="font-bold text-slate-200">{totalCount}</span> reviews
            </div>

            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1">
                <span>Per page:</span>
                <select
                  value={pageSize}
                  onChange={(e) => { setPageSize(parseInt(e.target.value)); setCurrentPage(1); }}
                  className="bg-slate-950 border border-white/10 rounded px-2 py-1 text-slate-200"
                >
                  <option value="5">5</option>
                  <option value="10">10</option>
                  <option value="25">25</option>
                  <option value="50">50</option>
                </select>
              </div>

              <div className="flex items-center gap-1">
                <button
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage(currentPage - 1)}
                  className="p-1 bg-slate-950 border border-white/10 rounded text-slate-300 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-slate-800"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <span className="px-2 font-mono font-bold text-slate-200">{currentPage} / {totalPages}</span>
                <button
                  disabled={currentPage >= totalPages}
                  onClick={() => setCurrentPage(currentPage + 1)}
                  className="p-1 bg-slate-950 border border-white/10 rounded text-slate-300 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-slate-800"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add / Edit Testimonial Modal */}
      {isModalOpen && (
        <Portal>
          <div className="fixed inset-0 bg-black/85 backdrop-blur-md z-[99999] flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-white/10 rounded-2xl max-w-lg w-full p-6 space-y-6 shadow-2xl">
            
            <div className="flex justify-between items-center border-b border-white/5 pb-4">
              <div>
                <h3 className="text-lg font-bold text-slate-50">
                  {editingItem ? "Edit Customer Review" : "Add Customer Testimonial"}
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">Moderate customer feedback, star rating, author details, and homepage pin.</p>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-white p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            {formError && (
              <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleSaveTestimonial} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1">Author Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Ramesh K."
                    value={formData.authorName}
                    onChange={(e) => setFormData({ ...formData, authorName: e.target.value })}
                    className="w-full bg-slate-950 border border-white/10 rounded-lg p-2.5 text-xs text-slate-100 focus:outline-none focus:border-accent"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1">Author Role / Title</label>
                  <input
                    type="text"
                    placeholder="e.g. Travel Manager / Tourist"
                    value={formData.authorRole}
                    onChange={(e) => setFormData({ ...formData, authorRole: e.target.value })}
                    className="w-full bg-slate-950 border border-white/10 rounded-lg p-2.5 text-xs text-slate-100 focus:outline-none focus:border-accent"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">Company / Location</label>
                <input
                  type="text"
                  placeholder="e.g. TCS Mumbai or Pune"
                  value={formData.companyName}
                  onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                  className="w-full bg-slate-950 border border-white/10 rounded-lg p-2.5 text-xs text-slate-100 focus:outline-none focus:border-accent"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">Review Content *</label>
                <textarea
                  rows={4}
                  required
                  placeholder="Customer feedback and review text..."
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  className="w-full bg-slate-950 border border-white/10 rounded-lg p-2.5 text-xs text-slate-100 focus:outline-none focus:border-accent resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1">Star Rating (1-5) *</label>
                  <select
                    value={formData.rating}
                    onChange={(e) => setFormData({ ...formData, rating: parseInt(e.target.value, 10) || 5 })}
                    className="w-full bg-slate-950 border border-white/10 rounded-lg p-2.5 text-xs text-slate-100 focus:outline-none focus:border-accent"
                  >
                    <option value="5">5 Stars (Excellent)</option>
                    <option value="4">4 Stars (Very Good)</option>
                    <option value="3">3 Stars (Average)</option>
                    <option value="2">2 Stars (Poor)</option>
                    <option value="1">1 Star (Terrible)</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1">Review Status *</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as TestimonialStatus })}
                    className="w-full bg-slate-950 border border-white/10 rounded-lg p-2.5 text-xs text-slate-100 focus:outline-none focus:border-accent"
                  >
                    <option value="APPROVED" className="bg-slate-900 text-emerald-400">APPROVED</option>
                    <option value="PENDING" className="bg-slate-900 text-yellow-400">PENDING</option>
                    <option value="REJECTED" className="bg-slate-900 text-rose-400">REJECTED</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">Avatar Image URL</label>
                <input
                  type="url"
                  placeholder="https://images.unsplash.com/photo-..."
                  value={formData.avatarUrl}
                  onChange={(e) => setFormData({ ...formData, avatarUrl: e.target.value })}
                  className="w-full bg-slate-950 border border-white/10 rounded-lg p-2.5 text-xs text-slate-100 font-mono focus:outline-none focus:border-accent"
                />
              </div>

              <div className="pt-2">
                <label className="flex items-center gap-2 text-xs font-bold text-slate-200 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.isFeatured}
                    onChange={(e) => setFormData({ ...formData, isFeatured: e.target.checked })}
                    className="w-4 h-4 rounded text-accent focus:ring-0 bg-slate-950 border-white/20"
                  />
                  <span className="flex items-center gap-1">
                    <Award className="w-3.5 h-3.5 text-amber-400" />
                    <span>Pin to Homepage Featured Testimonials</span>
                  </span>
                </label>
              </div>

              <div className="flex gap-3 pt-4 border-t border-white/5">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold py-2.5 rounded-lg text-xs tracking-wider uppercase"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 bg-accent hover:bg-yellow-500 text-slate-950 font-black py-2.5 rounded-lg text-xs tracking-wider uppercase shadow-lg disabled:opacity-50"
                >
                  {isSubmitting ? "Saving..." : editingItem ? "Update Review" : "Add Review"}
                </button>
              </div>

            </form>
          </div>
        </div>
        </Portal>
      )}

    </div>
  );
}
