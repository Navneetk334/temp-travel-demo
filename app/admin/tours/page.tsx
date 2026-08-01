"use client";

import React, { useState, useEffect } from "react";
import { 
  Plus, 
  Trash2, 
  Edit, 
  Save, 
  X, 
  Calendar, 
  Tag, 
  Compass, 
  Eye, 
  Globe, 
  CheckCircle, 
  AlertTriangle,
  Search,
  ChevronLeft,
  ChevronRight,
  Star,
  MapPin,
  Clock,
  Layers,
  Image as ImageIcon,
  Check,
  Slash
} from "lucide-react";

export type TourStatus = "DRAFT" | "PUBLISHED" | "ACTIVE" | "ARCHIVED";

interface ItineraryDay {
  day: number;
  title: string;
  description: string;
}

interface Tour {
  id: string;
  title: string;
  slug: string;
  description: string;
  destination?: string | null;
  durationDays: number;
  durationNights: number;
  basePrice: number | string;
  offerPrice?: number | string | null;
  inclusions: string[];
  exclusions: string[];
  images: string[];
  isFeatured?: boolean;
  status: TourStatus;
  categoryId: string;
  category?: {
    id: string;
    name: string;
    slug?: string;
  } | null;
  seoTitle?: string | null;
  seoDescription?: string | null;
  seoKeywords?: string | null;
  itinerary: ItineraryDay[];
  createdAt: string;
}

interface Category {
  id: string;
  name: string;
}

interface Stats {
  total: number;
  PUBLISHED: number;
  DRAFT: number;
  FEATURED: number;
}

export default function AdminToursPage() {
  const [tours, setTours] = useState<Tour[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTour, setEditingTour] = useState<Tour | null>(null);

  // Filters & Pagination State
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [sortBy, setSortBy] = useState("createdAt");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [stats, setStats] = useState<Stats>({
    total: 0,
    PUBLISHED: 0,
    DRAFT: 0,
    FEATURED: 0,
  });

  // Form states
  const [formData, setFormData] = useState({
    title: "",
    slug: "",
    destination: "",
    description: "",
    durationDays: 3,
    durationNights: 2,
    basePrice: "12500",
    offerPrice: "",
    isFeatured: false,
    status: "PUBLISHED" as TourStatus,
    categoryId: "",
    seoTitle: "",
    seoDescription: "",
    seoKeywords: "",
    inclusionsText: "",
    exclusionsText: "",
    imagesText: "",
  });

  const [itinerary, setItinerary] = useState<ItineraryDay[]>([
    { day: 1, title: "Arrival & Sightseeing", description: "Pickup from airport/station and check-in at hotel. Evening local sightseeing tour." },
    { day: 2, title: "Full Day Excursion", description: "Visit major heritage monuments and local culture spots." },
    { day: 3, title: "Departure", description: "Breakfast at hotel, shopping, and transfer to airport/station for departure." }
  ]);

  const [formError, setFormError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const loadData = async () => {
    setLoading(true);
    try {
      const queryParams = new URLSearchParams({
        search,
        categoryId: categoryFilter,
        status: statusFilter,
        sortBy,
        sortOrder,
        page: currentPage.toString(),
        limit: pageSize.toString(),
      });

      const [toursRes, catsRes] = await Promise.all([
        fetch(`/api/tours?${queryParams.toString()}`),
        fetch("/api/tours/categories")
      ]);
      
      if (toursRes.ok && catsRes.ok) {
        const toursData = await toursRes.json();
        const catsData = await catsRes.json();

        if (Array.isArray(toursData)) {
          setTours(toursData);
          setTotalCount(toursData.length);
          setTotalPages(1);
        } else {
          setTours(toursData.tours || []);
          setTotalCount(toursData.pagination?.totalCount || 0);
          setTotalPages(toursData.pagination?.totalPages || 1);
          if (toursData.stats) {
            setStats(toursData.stats);
          }
        }

        setCategories(catsData);
        if (catsData.length > 0 && !formData.categoryId) {
          setFormData(prev => ({ ...prev, categoryId: catsData[0].id }));
        }
      }
    } catch (err) {
      console.error("Failed to load admin tour packages:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [search, categoryFilter, statusFilter, sortBy, sortOrder, currentPage, pageSize]);

  // Auto-generate slug from title
  const generateSlug = (text: string) => {
    return text
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-");
  };

  const handleTitleChange = (title: string) => {
    setFormData(prev => ({
      ...prev,
      title,
      slug: editingTour ? prev.slug : generateSlug(title)
    }));
  };

  const openModal = (tour: Tour | null = null) => {
    setFormError("");
    if (tour) {
      setEditingTour(tour);
      setFormData({
        title: tour.title,
        slug: tour.slug,
        destination: tour.destination || "",
        description: tour.description,
        durationDays: tour.durationDays,
        durationNights: tour.durationNights,
        basePrice: String(tour.basePrice),
        offerPrice: tour.offerPrice ? String(tour.offerPrice) : "",
        isFeatured: tour.isFeatured || false,
        status: tour.status,
        categoryId: tour.categoryId,
        seoTitle: tour.seoTitle || "",
        seoDescription: tour.seoDescription || "",
        seoKeywords: tour.seoKeywords || "",
        inclusionsText: (tour.inclusions || []).join("\n"),
        exclusionsText: (tour.exclusions || []).join("\n"),
        imagesText: (tour.images || []).join("\n"),
      });
      setItinerary(tour.itinerary || []);
    } else {
      setEditingTour(null);
      setFormData({
        title: "",
        slug: "",
        destination: "",
        description: "",
        durationDays: 3,
        durationNights: 2,
        basePrice: "12500",
        offerPrice: "",
        isFeatured: false,
        status: "PUBLISHED",
        categoryId: categories.length > 0 ? categories[0].id : "",
        seoTitle: "",
        seoDescription: "",
        seoKeywords: "",
        inclusionsText: "Private AC Vehicle\nHotel Accommodation (3-Star)\nDaily Breakfast\nDriver Allowance & Toll Tax",
        exclusionsText: "Airfare / Train fare\nMonument Entry Fees\nPersonal Expenses & Tips",
        imagesText: "https://images.unsplash.com/photo-1548013146-72479768bada\nhttps://images.unsplash.com/photo-1524492412937-b28074a5d7da",
      });
      setItinerary([
        { day: 1, title: "Arrival & Sightseeing", description: "Pickup from airport/station and check-in at hotel." },
        { day: 2, title: "Excursion Tour", description: "Explore major monuments, heritage sites, and markets." },
        { day: 3, title: "Departure", description: "Breakfast, hotel check-out, and transfer to airport/station." }
      ]);
    }
    setIsModalOpen(true);
  };

  const handleAddItineraryDay = () => {
    const nextDay = itinerary.length + 1;
    setItinerary([
      ...itinerary,
      { day: nextDay, title: `Day ${nextDay} Tour`, description: "Detailed day itinerary description." }
    ]);
  };

  const handleRemoveItineraryDay = (index: number) => {
    const updated = itinerary.filter((_, i) => i !== index).map((item, idx) => ({
      ...item,
      day: idx + 1
    }));
    setItinerary(updated);
  };

  const handleItineraryChange = (index: number, field: "title" | "description", value: string) => {
    const updated = [...itinerary];
    updated[index][field] = value;
    setItinerary(updated);
  };

  const handleSaveTour = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");
    setIsSubmitting(true);

    try {
      const inclusions = formData.inclusionsText.split("\n").map(s => s.trim()).filter(Boolean);
      const exclusions = formData.exclusionsText.split("\n").map(s => s.trim()).filter(Boolean);
      const images = formData.imagesText.split("\n").map(s => s.trim()).filter(Boolean);

      const payload: any = {
        title: formData.title,
        slug: formData.slug || generateSlug(formData.title),
        description: formData.description,
        destination: formData.destination || null,
        durationDays: Number(formData.durationDays),
        durationNights: Number(formData.durationNights),
        basePrice: Number(formData.basePrice),
        offerPrice: formData.offerPrice ? Number(formData.offerPrice) : null,
        inclusions: inclusions.length > 0 ? inclusions : ["Standard Inclusions"],
        exclusions: exclusions.length > 0 ? exclusions : ["Personal Expenses"],
        images: images.length > 0 ? images : ["https://images.unsplash.com/photo-1548013146-72479768bada"],
        isFeatured: formData.isFeatured,
        status: formData.status,
        categoryId: formData.categoryId,
        seoTitle: formData.seoTitle || null,
        seoDescription: formData.seoDescription || null,
        seoKeywords: formData.seoKeywords || null,
        itinerary: itinerary.length > 0 ? itinerary : [{ day: 1, title: "Day 1", description: "Arrival & Sightseeing" }],
      };

      const url = editingTour ? `/api/tours/${editingTour.id}` : "/api/tours";
      const method = editingTour ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        if (data.error && typeof data.error === "object") {
          setFormError(JSON.stringify(data.error));
        } else {
          setFormError(data.error || "Failed to save tour package");
        }
        return;
      }

      setIsModalOpen(false);
      loadData();
    } catch (err) {
      console.error("Save tour error:", err);
      setFormError("Server connection error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this tour package?")) return;
    try {
      const res = await fetch(`/api/tours/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) {
        alert(data.error || "Failed to delete tour package");
        return;
      }
      loadData();
    } catch (e) {
      console.error("Failed to delete tour:", e);
    }
  };

  const getStatusBadge = (status: TourStatus) => {
    switch (status) {
      case "PUBLISHED":
      case "ACTIVE":
        return "bg-emerald-500/20 text-emerald-300 border-emerald-500/40 font-black shadow-sm";
      case "DRAFT":
        return "bg-yellow-500/10 text-yellow-400 border-yellow-500/20 font-bold";
      case "ARCHIVED":
        return "bg-slate-500/10 text-slate-400 border-slate-500/20";
      default:
        return "bg-slate-500/10 text-slate-400 border-slate-500/20";
    }
  };

  return (
    <div className="bg-slate-950 min-h-screen text-slate-100 p-8 space-y-8">
      
      {/* Title Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-white/5 pb-6 gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-50 tracking-tight flex items-center gap-2.5">
            <Compass className="w-8 h-8 text-accent" />
            <span>Tour Package CMS & Itinerary Builder</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Manage domestic & international tour packages, day-wise itineraries, pricing offers, multi-image galleries, and SEO meta tags.
          </p>
        </div>
        <button
          onClick={() => openModal()}
          className="flex items-center gap-1.5 bg-accent hover:bg-yellow-500 text-slate-950 font-extrabold py-2.5 px-6 rounded-lg text-xs tracking-wider uppercase transition-all shadow-lg"
        >
          <Plus className="w-4 h-4" />
          <span>Create New Tour Package</span>
        </button>
      </div>

      {/* Tour Status Pipeline Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div 
          onClick={() => { setStatusFilter(""); setCurrentPage(1); }}
          className={`glassmorphism p-4 rounded-xl border cursor-pointer transition-all ${
            statusFilter === "" ? "border-accent bg-accent/10" : "border-white/5 hover:border-white/20"
          }`}
        >
          <div className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Total Packages</div>
          <div className="text-2xl font-black text-slate-50 mt-1">{stats.total}</div>
        </div>

        <div 
          onClick={() => { setStatusFilter("PUBLISHED"); setCurrentPage(1); }}
          className={`glassmorphism p-4 rounded-xl border cursor-pointer transition-all ${
            statusFilter === "PUBLISHED" ? "border-emerald-400 bg-emerald-500/10" : "border-white/5 hover:border-white/20"
          }`}
        >
          <div className="text-[10px] text-emerald-400 uppercase font-bold tracking-wider">PUBLISHED / LIVE</div>
          <div className="text-2xl font-black text-emerald-400 mt-1">{stats.PUBLISHED}</div>
        </div>

        <div 
          onClick={() => { setStatusFilter("DRAFT"); setCurrentPage(1); }}
          className={`glassmorphism p-4 rounded-xl border cursor-pointer transition-all ${
            statusFilter === "DRAFT" ? "border-yellow-400 bg-yellow-500/10" : "border-white/5 hover:border-white/20"
          }`}
        >
          <div className="text-[10px] text-yellow-400 uppercase font-bold tracking-wider">DRAFT</div>
          <div className="text-2xl font-black text-yellow-400 mt-1">{stats.DRAFT}</div>
        </div>

        <div 
          onClick={() => { setStatusFilter("FEATURED"); setCurrentPage(1); }}
          className={`glassmorphism p-4 rounded-xl border cursor-pointer transition-all ${
            statusFilter === "FEATURED" ? "border-amber-400 bg-amber-500/10" : "border-white/5 hover:border-white/20"
          }`}
        >
          <div className="text-[10px] text-amber-400 uppercase font-bold tracking-wider flex items-center gap-1">
            <Star className="w-3 h-3 fill-amber-400" />
            <span>FEATURED PACKAGES</span>
          </div>
          <div className="text-2xl font-black text-amber-400 mt-1">{stats.FEATURED}</div>
        </div>
      </div>

      {/* Filter & Control Toolbar */}
      <div className="glassmorphism p-6 rounded-xl border border-white/5 flex flex-col md:flex-row gap-4 items-center justify-between">
        
        {/* Search */}
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search tour title, destination, category..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
            className="w-full bg-slate-950/60 border border-white/10 rounded-lg py-2 pl-10 pr-4 text-xs text-slate-100 focus:outline-none focus:border-accent transition-all"
          />
        </div>

        {/* Filter Dropdowns */}
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          
          {/* Category Filter */}
          <select
            value={categoryFilter}
            onChange={(e) => { setCategoryFilter(e.target.value); setCurrentPage(1); }}
            className="bg-slate-950/60 border border-white/10 rounded-lg py-2 px-3 text-xs text-slate-100 focus:outline-none focus:border-accent"
          >
            <option value="" className="bg-slate-900">All Categories</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id} className="bg-slate-900">{c.name}</option>
            ))}
          </select>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1); }}
            className="bg-slate-950/60 border border-white/10 rounded-lg py-2 px-3 text-xs text-slate-100 focus:outline-none focus:border-accent"
          >
            <option value="" className="bg-slate-900">All Package Statuses</option>
            <option value="PUBLISHED" className="bg-slate-900 text-emerald-400">PUBLISHED</option>
            <option value="DRAFT" className="bg-slate-900 text-yellow-400">DRAFT</option>
            <option value="FEATURED" className="bg-slate-900 text-amber-400">FEATURED ONLY</option>
          </select>

          {/* Sort By */}
          <select
            value={sortBy}
            onChange={(e) => { setSortBy(e.target.value); setCurrentPage(1); }}
            className="bg-slate-950/60 border border-white/10 rounded-lg py-2 px-3 text-xs text-slate-100 focus:outline-none focus:border-accent"
          >
            <option value="createdAt" className="bg-slate-900">Sort by Date</option>
            <option value="title" className="bg-slate-900">Sort by Title</option>
            <option value="basePrice" className="bg-slate-900">Sort by Price</option>
            <option value="durationDays" className="bg-slate-900">Sort by Duration</option>
          </select>

          {/* Sort Order */}
          <button
            onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
            className="bg-slate-950/60 border border-white/10 rounded-lg py-2 px-3 text-xs font-semibold text-slate-300 hover:text-slate-100 transition-colors"
          >
            {sortOrder === "desc" ? "↓ Newest / High" : "↑ Oldest / Low"}
          </button>
        </div>

      </div>

      {/* Tour Packages Table Grid */}
      <div className="glassmorphism rounded-xl border border-white/5 overflow-hidden flex flex-col">
        {loading ? (
          <div className="text-center py-16 text-slate-400 text-xs">Loading tour package CMS...</div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-900 border-b border-white/5 text-slate-400 font-semibold uppercase tracking-wider">
                    <th className="p-4">Tour Package & Destination</th>
                    <th className="p-4">Category & Duration</th>
                    <th className="p-4">Pricing & Offer</th>
                    <th className="p-4">Status & Featured</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {tours.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="text-center py-16 text-slate-500 italic">
                        No tour packages matching selected criteria found.
                      </td>
                    </tr>
                  ) : (
                    tours.map((tour) => (
                      <tr key={tour.id} className="hover:bg-white/5 transition-colors">
                        <td className="p-4">
                          <div className="font-bold text-slate-100 text-sm flex items-center gap-2">
                            <span>{tour.title}</span>
                            {tour.isFeatured && (
                              <span className="p-1 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30" title="Featured Package">
                                <Star className="w-3 h-3 fill-amber-400" />
                              </span>
                            )}
                          </div>
                          <div className="text-slate-400 flex items-center gap-1 mt-0.5 font-medium">
                            <MapPin className="w-3 h-3 text-accent" />
                            <span>{tour.destination || "Domestic Travel"}</span>
                            <span className="font-mono text-slate-500">({tour.slug})</span>
                          </div>
                        </td>
                        <td className="p-4">
                          <div className="font-bold text-slate-200">{tour.category?.name || "Tour Category"}</div>
                          <div className="text-slate-400 mt-0.5 flex items-center gap-1 font-mono">
                            <Clock className="w-3 h-3 text-accent" />
                            <span>{tour.durationDays}D / {tour.durationNights}N ({tour.itinerary?.length || 0} Itinerary Days)</span>
                          </div>
                        </td>
                        <td className="p-4 font-mono">
                          <div className="font-black text-slate-100 text-sm">₹{Number(tour.basePrice).toLocaleString("en-IN")}</div>
                          {tour.offerPrice && (
                            <div className="text-[10px] text-emerald-400 font-bold mt-0.5">
                              Offer: ₹{Number(tour.offerPrice).toLocaleString("en-IN")}
                            </div>
                          )}
                        </td>
                        <td className="p-4">
                          <div className="flex items-center gap-2">
                            <span className={`text-[9px] font-extrabold py-0.5 px-2 rounded-full border uppercase ${getStatusBadge(tour.status)}`}>
                              {tour.status === "ACTIVE" ? "PUBLISHED" : tour.status}
                            </span>
                          </div>
                        </td>
                        <td className="p-4 text-right space-x-2">
                          <button
                            onClick={() => openModal(tour)}
                            className="p-1.5 bg-slate-900 border border-white/5 rounded-lg text-slate-400 hover:text-accent transition-colors"
                            title="Edit Tour Package"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(tour.id)}
                            className="p-1.5 bg-slate-900 border border-white/5 rounded-lg text-slate-400 hover:text-red-400 transition-colors"
                            title="Delete Tour Package"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination Bar */}
            <div className="p-4 bg-slate-900/60 border-t border-white/5 flex items-center justify-between text-xs text-slate-400">
              <div>
                Showing <span className="font-bold text-slate-200">{totalCount > 0 ? (currentPage - 1) * pageSize + 1 : 0}</span> to <span className="font-bold text-slate-200">{Math.min(currentPage * pageSize, totalCount)}</span> of <span className="font-bold text-slate-200">{totalCount}</span> tour packages
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
          </>
        )}
      </div>

      {/* Tour Package Builder Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-white/10 rounded-2xl max-w-4xl w-full p-6 space-y-6 shadow-2xl max-h-[90vh] overflow-y-auto scrollbar-thin">
            
            <div className="flex justify-between items-center border-b border-white/5 pb-4">
              <div>
                <h3 className="text-lg font-bold text-slate-50">
                  {editingTour ? "Edit Tour Package & Itinerary" : "Create New Tour Package & Itinerary"}
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">Build day-wise itinerary, multi-image gallery, inclusions/exclusions, and SEO meta tags.</p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-white p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {formError && (
              <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-xs flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleSaveTour} className="space-y-6">
              
              {/* Section 1: Basic Info */}
              <div className="space-y-4">
                <h4 className="text-xs font-extrabold text-accent uppercase tracking-widest font-mono border-b border-white/5 pb-2">
                  1. Basic Package Information
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold text-slate-300 block mb-1">Package Title *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Golden Triangle 5 Days Heritage Tour"
                      value={formData.title}
                      onChange={(e) => handleTitleChange(e.target.value)}
                      className="w-full bg-slate-950 border border-white/10 rounded-lg p-2.5 text-xs text-slate-100 focus:outline-none focus:border-accent"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-300 block mb-1">URL Slug *</label>
                    <input
                      type="text"
                      required
                      placeholder="golden-triangle-5-days-heritage-tour"
                      value={formData.slug}
                      onChange={(e) => setFormData({ ...formData, slug: generateSlug(e.target.value) })}
                      className="w-full bg-slate-950 border border-white/10 rounded-lg p-2.5 text-xs text-slate-100 font-mono focus:outline-none focus:border-accent"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="text-xs font-bold text-slate-300 block mb-1">Destination City/Region *</label>
                    <input
                      type="text"
                      placeholder="e.g. Delhi, Agra, Jaipur"
                      value={formData.destination}
                      onChange={(e) => setFormData({ ...formData, destination: e.target.value })}
                      className="w-full bg-slate-950 border border-white/10 rounded-lg p-2.5 text-xs text-slate-100 focus:outline-none focus:border-accent"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-300 block mb-1">Tour Category *</label>
                    <select
                      required
                      value={formData.categoryId}
                      onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                      className="w-full bg-slate-950 border border-white/10 rounded-lg p-2.5 text-xs text-slate-100 focus:outline-none focus:border-accent"
                    >
                      <option value="" disabled>Select Package Category</option>
                      {categories.map((c) => (
                        <option key={c.id} value={c.id} className="bg-slate-900">{c.name}</option>
                      ))}
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-xs font-bold text-slate-300 block mb-1">Days *</label>
                      <input
                        type="number"
                        min={1}
                        required
                        value={formData.durationDays}
                        onChange={(e) => setFormData({ ...formData, durationDays: parseInt(e.target.value, 10) || 1 })}
                        className="w-full bg-slate-950 border border-white/10 rounded-lg p-2.5 text-xs text-slate-100 focus:outline-none focus:border-accent"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-slate-300 block mb-1">Nights *</label>
                      <input
                        type="number"
                        min={0}
                        required
                        value={formData.durationNights}
                        onChange={(e) => setFormData({ ...formData, durationNights: parseInt(e.target.value, 10) || 0 })}
                        className="w-full bg-slate-950 border border-white/10 rounded-lg p-2.5 text-xs text-slate-100 focus:outline-none focus:border-accent"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1">Package Description *</label>
                  <textarea
                    rows={3}
                    required
                    placeholder="Comprehensive overview of the tour package experience..."
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full bg-slate-950 border border-white/10 rounded-lg p-2.5 text-xs text-slate-100 focus:outline-none focus:border-accent resize-none"
                  />
                </div>
              </div>

              {/* Section 2: Pricing & Features */}
              <div className="space-y-4">
                <h4 className="text-xs font-extrabold text-accent uppercase tracking-widest font-mono border-b border-white/5 pb-2">
                  2. Pricing & Inclusions
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold text-slate-300 block mb-1">Base Price per Person (₹) *</label>
                    <input
                      type="number"
                      required
                      placeholder="12500"
                      value={formData.basePrice}
                      onChange={(e) => setFormData({ ...formData, basePrice: e.target.value })}
                      className="w-full bg-slate-950 border border-white/10 rounded-lg p-2.5 text-xs text-slate-100 font-mono focus:outline-none focus:border-accent"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-300 block mb-1">Discount Offer Price (₹)</label>
                    <input
                      type="number"
                      placeholder="9999"
                      value={formData.offerPrice}
                      onChange={(e) => setFormData({ ...formData, offerPrice: e.target.value })}
                      className="w-full bg-slate-950 border border-white/10 rounded-lg p-2.5 text-xs text-slate-100 font-mono focus:outline-none focus:border-accent"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold text-slate-300 block mb-1">Inclusions (One item per line)</label>
                    <textarea
                      rows={4}
                      placeholder="Private AC Vehicle&#10;3-Star Hotel Stay&#10;Daily Breakfast&#10;Sightseeing Guide"
                      value={formData.inclusionsText}
                      onChange={(e) => setFormData({ ...formData, inclusionsText: e.target.value })}
                      className="w-full bg-slate-950 border border-white/10 rounded-lg p-2.5 text-xs text-slate-100 focus:outline-none focus:border-accent resize-none font-mono"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-300 block mb-1">Exclusions (One item per line)</label>
                    <textarea
                      rows={4}
                      placeholder="Airfare / Train fare&#10;Monument Tickets&#10;Personal Expenses & Tips"
                      value={formData.exclusionsText}
                      onChange={(e) => setFormData({ ...formData, exclusionsText: e.target.value })}
                      className="w-full bg-slate-950 border border-white/10 rounded-lg p-2.5 text-xs text-slate-100 focus:outline-none focus:border-accent resize-none font-mono"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1">Multi-Image Gallery URLs (One URL per line)</label>
                  <textarea
                    rows={3}
                    placeholder="https://images.unsplash.com/photo-1&#10;https://images.unsplash.com/photo-2"
                    value={formData.imagesText}
                    onChange={(e) => setFormData({ ...formData, imagesText: e.target.value })}
                    className="w-full bg-slate-950 border border-white/10 rounded-lg p-2.5 text-xs text-slate-100 focus:outline-none focus:border-accent resize-none font-mono text-[11px]"
                  />
                </div>
              </div>

              {/* Section 3: Day-wise Itinerary Builder */}
              <div className="space-y-4">
                <div className="flex justify-between items-center border-b border-white/5 pb-2">
                  <h4 className="text-xs font-extrabold text-accent uppercase tracking-widest font-mono">
                    3. Day-Wise Itinerary Planner ({itinerary.length} Days)
                  </h4>
                  <button
                    type="button"
                    onClick={handleAddItineraryDay}
                    className="text-xs font-bold text-slate-200 hover:text-white bg-slate-800 border border-white/10 px-3 py-1 rounded-lg flex items-center gap-1 transition-all"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Itinerary Day</span>
                  </button>
                </div>

                <div className="space-y-3">
                  {itinerary.map((dayItem, index) => (
                    <div key={index} className="bg-slate-950/60 p-4 rounded-xl border border-white/10 space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-xs font-black text-accent uppercase font-mono">Day {dayItem.day}</span>
                        {itinerary.length > 1 && (
                          <button
                            type="button"
                            onClick={() => handleRemoveItineraryDay(index)}
                            className="text-xs text-red-400 hover:text-red-300 p-1"
                          >
                            Remove Day
                          </button>
                        )}
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
                        <div className="sm:col-span-4">
                          <input
                            type="text"
                            placeholder="Day Title"
                            value={dayItem.title}
                            onChange={(e) => handleItineraryChange(index, "title", e.target.value)}
                            className="w-full bg-slate-900 border border-white/10 rounded-lg p-2 text-xs text-slate-100 focus:outline-none focus:border-accent"
                          />
                        </div>
                        <div className="sm:col-span-8">
                          <textarea
                            rows={2}
                            placeholder="Day schedule details..."
                            value={dayItem.description}
                            onChange={(e) => handleItineraryChange(index, "description", e.target.value)}
                            className="w-full bg-slate-900 border border-white/10 rounded-lg p-2 text-xs text-slate-100 focus:outline-none focus:border-accent resize-none"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Section 4: SEO Meta & Visibility */}
              <div className="space-y-4">
                <h4 className="text-xs font-extrabold text-accent uppercase tracking-widest font-mono border-b border-white/5 pb-2">
                  4. SEO Meta & Publishing Controls
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold text-slate-300 block mb-1">SEO Title (Max 60 chars)</label>
                    <input
                      type="text"
                      maxLength={60}
                      placeholder="Best 5-Day Golden Triangle Tour Package"
                      value={formData.seoTitle}
                      onChange={(e) => setFormData({ ...formData, seoTitle: e.target.value })}
                      className="w-full bg-slate-950 border border-white/10 rounded-lg p-2.5 text-xs text-slate-100 focus:outline-none focus:border-accent"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-300 block mb-1">SEO Keywords</label>
                    <input
                      type="text"
                      placeholder="golden triangle, agra tour, jaipur travel"
                      value={formData.seoKeywords}
                      onChange={(e) => setFormData({ ...formData, seoKeywords: e.target.value })}
                      className="w-full bg-slate-950 border border-white/10 rounded-lg p-2.5 text-xs text-slate-100 focus:outline-none focus:border-accent"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1">SEO Meta Description (Max 160 chars)</label>
                  <textarea
                    rows={2}
                    maxLength={160}
                    placeholder="Book 5-day Golden Triangle package with private cab, hotel stays, and sightseeing."
                    value={formData.seoDescription}
                    onChange={(e) => setFormData({ ...formData, seoDescription: e.target.value })}
                    className="w-full bg-slate-950 border border-white/10 rounded-lg p-2.5 text-xs text-slate-100 focus:outline-none focus:border-accent resize-none"
                  />
                </div>

                <div className="flex flex-col sm:flex-row gap-4 items-center justify-between bg-slate-950/60 p-4 rounded-xl border border-white/10">
                  <div className="flex items-center gap-3">
                    <label className="text-xs font-bold text-slate-300">Status:</label>
                    <select
                      value={formData.status}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value as TourStatus })}
                      className="bg-slate-900 border border-white/10 rounded-lg py-1.5 px-3 text-xs text-slate-100 focus:outline-none focus:border-accent"
                    >
                      <option value="PUBLISHED" className="bg-slate-900 text-emerald-400">PUBLISHED / LIVE</option>
                      <option value="DRAFT" className="bg-slate-900 text-yellow-400">DRAFT</option>
                      <option value="ARCHIVED" className="bg-slate-900 text-slate-400">ARCHIVED</option>
                    </select>
                  </div>

                  <label className="flex items-center gap-2 text-xs font-bold text-slate-200 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.isFeatured}
                      onChange={(e) => setFormData({ ...formData, isFeatured: e.target.checked })}
                      className="w-4 h-4 rounded text-accent focus:ring-0 bg-slate-900 border-white/20"
                    />
                    <span className="flex items-center gap-1">
                      <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                      <span>Highlight as Featured Tour Package</span>
                    </span>
                  </label>
                </div>
              </div>

              {/* Submit Controls */}
              <div className="flex gap-3 pt-4 border-t border-white/5">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold py-2.5 rounded-lg text-xs tracking-wider uppercase transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 bg-accent hover:bg-yellow-500 text-slate-950 font-black py-2.5 rounded-lg text-xs tracking-wider uppercase transition-colors shadow-lg disabled:opacity-50"
                >
                  {isSubmitting ? "Saving..." : editingTour ? "Update Tour Package" : "Publish Tour Package"}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
}
