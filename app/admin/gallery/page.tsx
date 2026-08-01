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
  AlertCircle
} from "lucide-react";

interface Media {
  id: string;
  title?: string | null;
  imageUrl: string;
  mediaType: "IMAGE" | "VIDEO";
  category?: string | null;
  sortOrder: number;
  createdAt: string;
}

export default function AdminGalleryPage() {
  const [mediaList, setMediaList] = useState<Media[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
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
    imageUrl: "",
    category: "fleet",
    sortOrder: 1,
  });
  const [formError, setFormError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const loadMedia = async () => {
    setLoading(true);
    try {
      const queryParams = new URLSearchParams({
        search,
        category: categoryFilter,
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

  const openModal = () => {
    setFormError("");
    setFormData({
      title: "",
      imageUrl: "",
      category: "fleet",
      sortOrder: mediaList.length + 1,
    });
    setIsModalOpen(true);
  };

  const handleSaveMedia = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");
    setIsSubmitting(true);

    try {
      const payload = {
        title: formData.title.trim() || null,
        imageUrl: formData.imageUrl.trim(),
        category: formData.category.toLowerCase(),
        sortOrder: Number(formData.sortOrder),
        mediaType: "IMAGE",
      };

      const res = await fetch("/api/gallery", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        setFormError(data.error || "Failed to add media item");
        return;
      }

      setIsModalOpen(false);
      loadMedia();
    } catch (err) {
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

  const categoryOptions = [
    { label: "All Categories", value: "" },
    { label: "Fleet Vehicles", value: "fleet" },
    { label: "Tour Packages", value: "tours" },
    { label: "Corporate Trips", value: "corporate" },
    { label: "Events & Outings", value: "events" },
    { label: "Customer Reviews", value: "customers" },
  ];

  return (
    <div className="bg-slate-950 min-h-screen text-slate-100 p-8 space-y-8">
      
      {/* Title Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-white/5 pb-6 gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-50 tracking-tight flex items-center gap-2.5">
            <ImageIcon className="w-8 h-8 text-accent" />
            <span>Gallery Media & Photo Catalog</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Manage web graphics, vehicle photos, tour destination shots, and corporate event photo highlights.
          </p>
        </div>
        <button
          onClick={openModal}
          className="flex items-center gap-1.5 bg-accent hover:bg-yellow-500 text-slate-950 font-extrabold py-2.5 px-6 rounded-lg text-xs tracking-wider uppercase transition-all shadow-lg"
        >
          <Plus className="w-4 h-4" />
          <span>Upload / Add Media</span>
        </button>
      </div>

      {/* Filter & Control Toolbar */}
      <div className="glassmorphism p-6 rounded-xl border border-white/5 flex flex-col md:flex-row gap-4 items-center justify-between">
        
        {/* Search */}
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search photo title, category..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
            className="w-full bg-slate-950/60 border border-white/10 rounded-lg py-2 pl-10 pr-4 text-xs text-slate-100 focus:outline-none focus:border-accent transition-all"
          />
        </div>

        {/* Category Buttons */}
        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          {categoryOptions.map((cat) => (
            <button
              key={cat.value}
              onClick={() => { setCategoryFilter(cat.value); setCurrentPage(1); }}
              className={`py-1.5 px-3 rounded-lg text-xs font-semibold uppercase tracking-wider transition-all border ${
                categoryFilter === cat.value
                  ? "bg-accent text-slate-950 border-accent font-black"
                  : "bg-slate-900 text-slate-400 border-white/5 hover:border-white/20"
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

      </div>

      {/* Gallery Grid */}
      {loading ? (
        <div className="text-center py-20 text-slate-400 text-xs">Loading media catalog...</div>
      ) : mediaList.length === 0 ? (
        <div className="glassmorphism p-16 text-center rounded-xl border border-white/5 text-slate-500 italic text-xs">
          No gallery images found matching the selected category.
        </div>
      ) : (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {mediaList.map((m) => (
              <div 
                key={m.id} 
                className="bg-slate-900 border border-white/5 rounded-xl overflow-hidden shadow-lg flex flex-col group hover:border-accent/40 transition-all"
              >
                <div 
                  onClick={() => setLightboxImage(m)}
                  className="relative h-48 bg-slate-950 flex items-center justify-center cursor-pointer overflow-hidden"
                >
                  <img
                    src={m.imageUrl}
                    alt={m.title || "Gallery Item"}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1548013146-72479768bada";
                    }}
                  />
                  <div className="absolute inset-0 bg-slate-950/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <div className="p-2 bg-slate-900/80 rounded-full border border-white/20 text-white">
                      <ZoomIn className="w-5 h-5" />
                    </div>
                  </div>
                  <span className="absolute top-3 right-3 bg-slate-950/80 border border-white/10 py-0.5 px-2 rounded text-[9px] font-bold font-mono text-accent">
                    Order #{m.sortOrder}
                  </span>
                </div>

                <div className="p-4 space-y-3 flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="font-bold text-slate-200 text-xs line-clamp-1">{m.title || "Untitled Media"}</h3>
                    <span className="text-[9px] bg-slate-950 text-slate-400 font-bold uppercase tracking-wider px-2 py-0.5 rounded border border-white/5 inline-block mt-1">
                      {m.category || "General"}
                    </span>
                  </div>

                  <div className="flex justify-end gap-2 border-t border-white/5 pt-3">
                    <button
                      onClick={() => setLightboxImage(m)}
                      className="p-1.5 bg-slate-950 border border-white/5 rounded-lg text-slate-400 hover:text-accent transition-colors"
                      title="View Image Lightbox"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(m.id)}
                      className="p-1.5 bg-slate-950 border border-white/5 rounded-lg text-slate-400 hover:text-red-400 transition-colors"
                      title="Delete Image"
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
              Showing <span className="font-bold text-slate-200">{totalCount > 0 ? (currentPage - 1) * pageSize + 1 : 0}</span> to <span className="font-bold text-slate-200">{Math.min(currentPage * pageSize, totalCount)}</span> of <span className="font-bold text-slate-200">{totalCount}</span> media items
            </div>

            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1">
                <span>Per page:</span>
                <select
                  value={pageSize}
                  onChange={(e) => { setPageSize(parseInt(e.target.value)); setCurrentPage(1); }}
                  className="bg-slate-950 border border-white/10 rounded px-2 py-1 text-slate-200"
                >
                  <option value="8">8</option>
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
        </div>
      )}

      {/* Add Media Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-white/10 rounded-2xl max-w-lg w-full p-6 space-y-6 shadow-2xl">
            
            <div className="flex justify-between items-center border-b border-white/5 pb-4">
              <div>
                <h3 className="text-lg font-bold text-slate-50">Upload / Add Gallery Media</h3>
                <p className="text-xs text-slate-400 mt-0.5">Add photo catalog items with title, image URL, category, and display order.</p>
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

            <form onSubmit={handleSaveMedia} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">Image Title / Description</label>
                <input
                  type="text"
                  placeholder="e.g. Executive Sedan Fleet at Airport"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full bg-slate-950 border border-white/10 rounded-lg p-2.5 text-xs text-slate-100 focus:outline-none focus:border-accent"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">Image URL *</label>
                <input
                  type="url"
                  required
                  placeholder="https://images.unsplash.com/photo-..."
                  value={formData.imageUrl}
                  onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                  className="w-full bg-slate-950 border border-white/10 rounded-lg p-2.5 text-xs text-slate-100 font-mono focus:outline-none focus:border-accent"
                />
              </div>

              {formData.imageUrl.trim() && (
                <div className="relative rounded-xl overflow-hidden border border-white/10 h-36 bg-slate-950">
                  <img
                    src={formData.imageUrl}
                    alt="Preview"
                    className="w-full h-full object-cover"
                    onError={(e) => { (e.target as HTMLElement).style.display = 'none'; }}
                  />
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1">Category *</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full bg-slate-950 border border-white/10 rounded-lg p-2.5 text-xs text-slate-100 focus:outline-none focus:border-accent"
                  >
                    <option value="fleet" className="bg-slate-900">Fleet Vehicles</option>
                    <option value="tours" className="bg-slate-900">Tour Packages</option>
                    <option value="corporate" className="bg-slate-900">Corporate Trips</option>
                    <option value="events" className="bg-slate-900">Events & Outings</option>
                    <option value="customers" className="bg-slate-900">Customer Reviews</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1">Sort Order *</label>
                  <input
                    type="number"
                    min={0}
                    required
                    value={formData.sortOrder}
                    onChange={(e) => setFormData({ ...formData, sortOrder: parseInt(e.target.value, 10) || 0 })}
                    className="w-full bg-slate-950 border border-white/10 rounded-lg p-2.5 text-xs text-slate-100 focus:outline-none focus:border-accent"
                  />
                </div>
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
                  {isSubmitting ? "Saving..." : "Add Media"}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* Lightbox Modal */}
      {lightboxImage && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="relative max-w-4xl w-full max-h-[90vh] flex flex-col items-center justify-center">
            <button
              onClick={() => setLightboxImage(null)}
              className="absolute -top-10 right-0 text-white hover:text-accent p-2 font-bold flex items-center gap-1"
            >
              <X className="w-6 h-6" />
              <span className="text-xs uppercase">Close</span>
            </button>
            
            <img
              src={lightboxImage.imageUrl}
              alt={lightboxImage.title || "Gallery Preview"}
              className="max-w-full max-h-[75vh] object-contain rounded-xl border border-white/10 shadow-2xl"
            />
            
            <div className="mt-4 text-center">
              <h3 className="text-sm font-bold text-slate-100">{lightboxImage.title || "Media Preview"}</h3>
              <div className="text-[10px] text-slate-400 font-mono mt-1">
                Category: <span className="text-accent font-bold uppercase">{lightboxImage.category}</span> &bull; Order #{lightboxImage.sortOrder}
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
