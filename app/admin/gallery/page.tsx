"use client";

import React, { useState, useEffect } from "react";
import { 
  Plus, 
  Trash2, 
  Image as ImageIcon, 
  Save, 
  X, 
  Eye, 
  Filter,
  Search,
  ChevronLeft,
  ChevronRight,
  ZoomIn,
  AlertCircle,
  Star,
  CheckCircle2,
  Edit,
  MapPin,
  Calendar,
  Sparkles,
  ToggleLeft,
  ToggleRight
} from "lucide-react";

interface Media {
  id: string;
  title?: string | null;
  description?: string | null;
  imageUrl: string;
  mediaType: "IMAGE" | "VIDEO";
  category?: string | null;
  location?: string | null;
  year?: string | null;
  isFeatured: boolean;
  isActive: boolean;
  altText?: string | null;
  caption?: string | null;
  sortOrder: number;
  createdAt: string;
}

export default function AdminGalleryPage() {
  const [mediaList, setMediaList] = useState<Media[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMedia, setEditingMedia] = useState<Media | null>(null);
  const [lightboxImage, setLightboxImage] = useState<Media | null>(null);

  // Filters & Pagination State
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(12);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  // Form State
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    imageUrl: "",
    mediaType: "IMAGE" as "IMAGE" | "VIDEO",
    category: "fleet",
    location: "Delhi NCR",
    year: "2026",
    isFeatured: false,
    isActive: true,
    altText: "",
    caption: "",
    sortOrder: 0,
  });
  const [formError, setFormError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const loadMedia = async () => {
    setLoading(true);
    try {
      const queryParams = new URLSearchParams({
        search,
        category: categoryFilter,
        admin: "true",
        page: currentPage.toString(),
        limit: pageSize.toString(),
      });

      const res = await fetch(`/api/gallery?${queryParams.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setMediaList(data.media || []);
        setTotalCount(data.pagination?.totalCount || 0);
        setTotalPages(data.pagination?.totalPages || 1);
      }
    } catch (err) {
      console.error("Failed to load gallery media:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMedia();
  }, [search, categoryFilter, currentPage, pageSize]);

  const openModal = (mediaItem: Media | null = null) => {
    setFormError("");
    if (mediaItem) {
      setEditingMedia(mediaItem);
      setFormData({
        title: mediaItem.title || "",
        description: mediaItem.description || "",
        imageUrl: mediaItem.imageUrl || "",
        mediaType: mediaItem.mediaType || "IMAGE",
        category: mediaItem.category || "fleet",
        location: mediaItem.location || "Delhi NCR",
        year: mediaItem.year || "2026",
        isFeatured: mediaItem.isFeatured ?? false,
        isActive: mediaItem.isActive ?? true,
        altText: mediaItem.altText || "",
        caption: mediaItem.caption || "",
        sortOrder: mediaItem.sortOrder ?? 0,
      });
    } else {
      setEditingMedia(null);
      setFormData({
        title: "",
        description: "",
        imageUrl: "",
        mediaType: "IMAGE",
        category: "fleet",
        location: "Delhi NCR",
        year: "2026",
        isFeatured: false,
        isActive: true,
        altText: "",
        caption: "",
        sortOrder: mediaList.length + 1,
      });
    }
    setIsModalOpen(true);
  };

  const handleSaveMedia = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");
    setIsSubmitting(true);

    try {
      const payload = {
        title: formData.title.trim() || null,
        description: formData.description.trim() || null,
        imageUrl: formData.imageUrl.trim(),
        mediaType: formData.mediaType,
        category: formData.category.toLowerCase(),
        location: formData.location.trim() || null,
        year: formData.year.trim() || null,
        isFeatured: formData.isFeatured,
        isActive: formData.isActive,
        altText: formData.altText.trim() || null,
        caption: formData.caption.trim() || null,
        sortOrder: Number(formData.sortOrder) || 0,
      };

      const url = editingMedia ? `/api/gallery/${editingMedia.id}` : "/api/gallery";
      const method = editingMedia ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        setFormError(typeof data.error === "string" ? data.error : JSON.stringify(data.error));
        return;
      }

      setIsModalOpen(false);
      loadMedia();
    } catch (err) {
      console.error("Save gallery media error:", err);
      setFormError("Server connection error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this media item?")) return;
    try {
      const res = await fetch(`/api/gallery/${id}`, { method: "DELETE" });
      if (res.ok) {
        loadMedia();
      } else {
        alert("Failed to delete media item");
      }
    } catch (e) {
      console.error("Error deleting media item:", e);
    }
  };

  const handleToggleFeatured = async (item: Media) => {
    try {
      const res = await fetch(`/api/gallery/${item.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...item,
          isFeatured: !item.isFeatured,
        }),
      });
      if (res.ok) loadMedia();
    } catch (e) {
      console.error("Toggle featured error:", e);
    }
  };

  const handleToggleActive = async (item: Media) => {
    try {
      const res = await fetch(`/api/gallery/${item.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...item,
          isActive: !item.isActive,
        }),
      });
      if (res.ok) loadMedia();
    } catch (e) {
      console.error("Toggle active error:", e);
    }
  };

  const categoryOptions = [
    { label: "All Categories", value: "" },
    { label: "Fleet Vehicles", value: "fleet" },
    { label: "Corporate Mobility", value: "corporate" },
    { label: "Airport Transfers", value: "airport transfer" },
    { label: "Outstation Journeys", value: "outstation" },
    { label: "Tour Packages", value: "tours" },
    { label: "Destinations", value: "destinations" },
    { label: "Events & Lifestyle", value: "events" },
    { label: "Lifestyle", value: "lifestyle" },
  ];

  return (
    <div className="bg-slate-950 min-h-screen text-slate-100 p-6 sm:p-8 space-y-8">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-white/5 pb-6 gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-50 tracking-tight flex items-center gap-2.5">
            <ImageIcon className="w-8 h-8 text-accent" />
            <span>Gallery Catalog CMS</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Manage public media journal items, featured flags, display orders, locations, and descriptions for the /gallery page.
          </p>
        </div>
        <button
          onClick={() => openModal()}
          className="flex items-center gap-1.5 bg-accent hover:bg-yellow-500 text-slate-950 font-extrabold py-2.5 px-6 rounded-lg text-xs tracking-wider uppercase transition-all shadow-lg"
        >
          <Plus className="w-4 h-4" />
          <span>Add Media Item</span>
        </button>
      </div>

      {/* Filter & Toolbar */}
      <div className="glassmorphism p-6 rounded-xl border border-white/5 flex flex-col md:flex-row gap-4 items-center justify-between">
        
        {/* Search */}
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search titles, locations, tags..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
            className="w-full bg-slate-950/60 border border-white/10 rounded-lg py-2 pl-10 pr-4 text-xs text-slate-100 focus:outline-none focus:border-accent transition-all"
          />
        </div>

        {/* Filter Bar */}
        <div className="flex items-center gap-3 w-full md:w-auto">
          <select
            value={categoryFilter}
            onChange={(e) => { setCategoryFilter(e.target.value); setCurrentPage(1); }}
            className="bg-slate-950/60 border border-white/10 rounded-lg py-2 px-3 text-xs text-slate-100 focus:outline-none focus:border-accent capitalize"
          >
            {categoryOptions.map((c) => (
              <option key={c.value} value={c.value} className="bg-slate-900">{c.label}</option>
            ))}
          </select>
        </div>

      </div>

      {/* Media Grid Display */}
      {loading ? (
        <div className="text-center py-20 text-slate-400 text-xs">Loading media journal database...</div>
      ) : mediaList.length === 0 ? (
        <div className="glassmorphism p-12 rounded-2xl border border-white/5 text-center space-y-4">
          <ImageIcon className="w-12 h-12 text-slate-600 mx-auto" />
          <h3 className="text-lg font-bold text-slate-300">No Gallery Items Found</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            No gallery images found matching the selected category. Click &quot;Add Media Item&quot; to add new photos.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {mediaList.map((item) => (
            <div 
              key={item.id}
              className={`bg-slate-900/60 border rounded-2xl overflow-hidden flex flex-col justify-between transition-all group hover:border-white/20 ${
                item.isFeatured ? "border-accent/40 bg-accent/5 shadow-xl" : "border-white/5"
              }`}
            >
              {/* Media Preview Box */}
              <div className="relative h-48 bg-slate-950 overflow-hidden group">
                <img
                  src={item.imageUrl}
                  alt={item.altText || item.title || "Gallery image"}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                
                {/* Badges Overlay */}
                <div className="absolute top-3 left-3 flex flex-col gap-1 z-10">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-slate-950/80 text-accent border border-white/10 backdrop-blur-md">
                    {item.category || "fleet"}
                  </span>
                  {item.isFeatured && (
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-accent text-slate-950 flex items-center gap-1 shadow-md">
                      <Sparkles className="w-3 h-3" />
                      <span>FEATURED</span>
                    </span>
                  )}
                </div>

                <div className="absolute top-3 right-3 z-10">
                  <button
                    onClick={() => handleToggleActive(item)}
                    className={`px-2 py-0.5 rounded text-[10px] font-bold border transition-colors ${
                      item.isActive ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/40" : "bg-rose-500/20 text-rose-300 border-rose-500/40"
                    }`}
                  >
                    {item.isActive ? "ACTIVE" : "DISABLED"}
                  </button>
                </div>

                {/* Quick Action Overlay */}
                <div className="absolute inset-0 bg-slate-950/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                  <button
                    onClick={() => setLightboxImage(item)}
                    className="p-2 bg-slate-900 text-slate-100 rounded-full border border-white/20 hover:bg-slate-800 transition-colors"
                    title="Zoom Preview"
                  >
                    <ZoomIn className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => openModal(item)}
                    className="p-2 bg-accent text-slate-950 rounded-full hover:bg-yellow-500 transition-colors"
                    title="Edit Item"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(item.id)}
                    className="p-2 bg-rose-500 text-white rounded-full hover:bg-rose-600 transition-colors"
                    title="Delete Item"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Item Info Box */}
              <div className="p-4 space-y-2 flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="font-extrabold text-slate-100 text-sm line-clamp-1">
                    {item.title || "Untitled Journal Asset"}
                  </h3>
                  {item.description && (
                    <p className="text-xs text-slate-400 line-clamp-2 mt-1">
                      {item.description}
                    </p>
                  )}
                </div>

                <div className="flex items-center justify-between text-[11px] text-slate-400 border-t border-white/5 pt-2 font-mono">
                  <div className="flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-accent" />
                    <span>{item.location || "India"}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleToggleFeatured(item)}
                      className={`p-1 rounded transition-colors ${
                        item.isFeatured ? "text-accent hover:text-white" : "text-slate-600 hover:text-slate-300"
                      }`}
                      title={item.isFeatured ? "Featured item" : "Mark as featured"}
                    >
                      <Star className={`w-3.5 h-3.5 ${item.isFeatured ? "fill-accent" : ""}`} />
                    </button>
                    <span>Order: #{item.sortOrder}</span>
                  </div>
                </div>
              </div>

            </div>
          ))}
        </div>
      )}

      {/* Pagination Controls */}
      <div className="glassmorphism p-4 rounded-xl border border-white/5 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400 gap-4">
        <div>
          Showing <span className="font-bold text-slate-200">{mediaList.length}</span> of <span className="font-bold text-slate-200">{totalCount}</span> gallery media items
        </div>
        
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span>Page Size:</span>
            <select
              value={pageSize}
              onChange={(e) => { setPageSize(Number(e.target.value)); setCurrentPage(1); }}
              className="bg-slate-950 border border-white/10 rounded px-2 py-1 text-slate-200 focus:outline-none"
            >
              <option value="12">12</option>
              <option value="24">24</option>
              <option value="48">48</option>
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

      {/* ADD / EDIT MEDIA MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-white/10 rounded-2xl max-w-xl w-full p-6 space-y-5 shadow-2xl max-h-[90vh] overflow-y-auto scrollbar-thin">
            
            <div className="flex justify-between items-center border-b border-white/5 pb-4">
              <div>
                <h3 className="text-lg font-extrabold text-slate-50 flex items-center gap-2">
                  <ImageIcon className="w-5 h-5 text-accent" />
                  <span>{editingMedia ? "Edit Gallery Item" : "Add Gallery Journal Asset"}</span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">Control image URL, category tag, location, description, and display order.</p>
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
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleSaveMedia} className="space-y-4 text-xs">
              
              <div>
                <label className="font-bold text-slate-300 block mb-1">Image / Media URL *</label>
                <div className="flex gap-3 items-center">
                  <div className="w-14 h-14 bg-slate-950 border border-white/10 rounded-lg overflow-hidden shrink-0 flex items-center justify-center">
                    <img
                      src={formData.imageUrl.trim() || "/images/fleet-suv.png"}
                      alt="Preview"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <input
                    type="url"
                    required
                    placeholder="https://images.unsplash.com/photo-..."
                    value={formData.imageUrl}
                    onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                    className="w-full bg-slate-950 border border-white/10 rounded-lg p-2.5 text-xs text-slate-100 font-mono focus:outline-none focus:border-accent"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="font-bold text-slate-300 block mb-1">Title / Caption Headline *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Executive Commute"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full bg-slate-950 border border-white/10 rounded-lg p-2.5 text-xs text-slate-100 focus:outline-none focus:border-accent font-semibold"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-300 block mb-1">Category Tag *</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full bg-slate-950 border border-white/10 rounded-lg p-2.5 text-xs text-slate-100 focus:outline-none focus:border-accent font-bold"
                  >
                    <option value="fleet" className="bg-slate-900">Fleet Vehicles</option>
                    <option value="corporate" className="bg-slate-900">Corporate Mobility</option>
                    <option value="airport transfer" className="bg-slate-900">Airport Transfer</option>
                    <option value="outstation" className="bg-slate-900">Outstation</option>
                    <option value="tours" className="bg-slate-900">Tours</option>
                    <option value="destinations" className="bg-slate-900">Destinations</option>
                    <option value="events" className="bg-slate-900">Events</option>
                    <option value="lifestyle" className="bg-slate-900">Lifestyle</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="font-bold text-slate-300 block mb-1">Location</label>
                  <input
                    type="text"
                    placeholder="e.g. Delhi NCR or Jaipur"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    className="w-full bg-slate-950 border border-white/10 rounded-lg p-2.5 text-xs text-slate-100 focus:outline-none focus:border-accent"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-300 block mb-1">Year / Date</label>
                  <input
                    type="text"
                    placeholder="e.g. 2026"
                    value={formData.year}
                    onChange={(e) => setFormData({ ...formData, year: e.target.value })}
                    className="w-full bg-slate-950 border border-white/10 rounded-lg p-2.5 text-xs text-slate-100 focus:outline-none focus:border-accent"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-300 block mb-1">Display Order</label>
                  <input
                    type="number"
                    min={0}
                    value={formData.sortOrder}
                    onChange={(e) => setFormData({ ...formData, sortOrder: parseInt(e.target.value, 10) || 0 })}
                    className="w-full bg-slate-950 border border-white/10 rounded-lg p-2.5 text-xs text-slate-100 font-mono focus:outline-none focus:border-accent"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-300 block mb-1">Short Description</label>
                <textarea
                  rows={2}
                  placeholder="A visual snapshot of our executive corporate cab fleet in motion..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full bg-slate-950 border border-white/10 rounded-lg p-2.5 text-xs text-slate-100 focus:outline-none focus:border-accent"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border-t border-white/5 pt-3">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.isFeatured}
                    onChange={(e) => setFormData({ ...formData, isFeatured: e.target.checked })}
                    className="w-4 h-4 rounded text-accent focus:ring-accent bg-slate-950 border-white/10"
                  />
                  <span className="font-bold text-slate-200">Featured Item (Prioritize on Public Gallery)</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.isActive}
                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                    className="w-4 h-4 rounded text-accent focus:ring-accent bg-slate-950 border-white/10"
                  />
                  <span className="font-bold text-slate-200">Active (Visible on Public /gallery)</span>
                </label>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-white/5">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-5 py-2.5 rounded-lg text-xs font-semibold bg-slate-800 text-slate-300 hover:bg-slate-700 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-2.5 rounded-lg text-xs font-extrabold bg-accent text-slate-950 hover:bg-yellow-500 transition-all uppercase tracking-wider shadow-lg disabled:opacity-50"
                >
                  {isSubmitting ? "Saving Asset..." : editingMedia ? "Update Gallery Item" : "Save Gallery Item"}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* LIGHTBOX ZOOM MODAL */}
      {lightboxImage && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="relative max-w-4xl w-full bg-slate-900 border border-white/10 rounded-2xl overflow-hidden shadow-2xl flex flex-col md:flex-row">
            <button
              onClick={() => setLightboxImage(null)}
              className="absolute top-4 right-4 p-2 bg-slate-950/80 text-white rounded-full hover:bg-slate-800 z-10"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="md:w-2/3 h-80 md:h-[500px] bg-black flex items-center justify-center">
              <img
                src={lightboxImage.imageUrl}
                alt={lightboxImage.title || "Gallery Zoom"}
                className="max-w-full max-h-full object-contain"
              />
            </div>

            <div className="md:w-1/3 p-6 space-y-4 flex flex-col justify-between bg-slate-900 border-l border-white/5">
              <div className="space-y-3">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-accent/20 text-accent border border-accent/30 inline-block">
                  {lightboxImage.category}
                </span>
                <h3 className="text-xl font-extrabold text-slate-50">{lightboxImage.title || "Untitled Asset"}</h3>
                {lightboxImage.description && (
                  <p className="text-xs text-slate-300 leading-relaxed">{lightboxImage.description}</p>
                )}
                
                <div className="space-y-1.5 text-xs text-slate-400 font-mono border-t border-white/5 pt-3">
                  {lightboxImage.location && (
                    <div className="flex items-center gap-2">
                      <MapPin className="w-3.5 h-3.5 text-accent" />
                      <span>{lightboxImage.location}</span>
                    </div>
                  )}
                  {lightboxImage.year && (
                    <div className="flex items-center gap-2">
                      <Calendar className="w-3.5 h-3.5 text-accent" />
                      <span>{lightboxImage.year}</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="text-[10px] text-slate-500 font-mono border-t border-white/5 pt-3">
                ID: {lightboxImage.id}
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
