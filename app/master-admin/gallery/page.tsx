"use client";

import React, { useState, useEffect } from "react";
import {
  Image as ImageIcon,
  Plus,
  Search,
  CheckCircle2,
  AlertCircle,
  X,
  Edit2,
  Trash2,
  CheckSquare,
  Square,
  Sparkles,
  Upload,
  Calendar,
  MapPin,
  RefreshCw,
  Filter,
  Eye,
  Settings2
} from "lucide-react";
import Portal from "@/components/shared/portal";
import { useDialog } from "@/app/components/DialogProvider";

const CATEGORIES = [
  "FLEET",
  "CORPORATE",
  "AIRPORT TRANSFER",
  "OUTSTATION",
  "TOURS",
  "DESTINATIONS",
  "EVENTS",
  "LIFESTYLE",
];

export default function MasterGalleryPage() {
  const [items, setItems] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("ALL");
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const { showAlert, showConfirm } = useDialog();

  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "FLEET",
    location: "",
    year: new Date().getFullYear().toString(),
    caption: "",
    altText: "",
    isFeatured: false,
    isActive: true,
    sortOrder: "0",
    imageUrl: "",
    mediaType: "IMAGE"
  });

  const loadGallery = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/gallery?admin=true&limit=100");
      if (res.ok) {
        const data = await res.json();
        setItems(data.media || []);
      }
    } catch (e) {
      console.error("Failed to fetch gallery:", e);
      showAlert("Error loading gallery items.", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadGallery();
  }, []);

  const openAddModal = () => {
    setEditingItem(null);
    setFormData({
      title: "",
      description: "",
      category: "FLEET",
      location: "",
      year: new Date().getFullYear().toString(),
      caption: "",
      altText: "",
      isFeatured: false,
      isActive: true,
      sortOrder: "0",
      imageUrl: "",
      mediaType: "IMAGE"
    });
    setImagePreview(null);
    setShowModal(true);
  };

  const openEditModal = (item: any) => {
    setEditingItem(item);
    setFormData({
      title: item.title || "",
      description: item.description || "",
      category: (item.category || "FLEET").toUpperCase(),
      location: item.location || "",
      year: item.year || "",
      caption: item.caption || "",
      altText: item.altText || "",
      isFeatured: Boolean(item.isFeatured),
      isActive: Boolean(item.isActive),
      sortOrder: String(item.sortOrder || 0),
      imageUrl: item.imageUrl || "",
      mediaType: item.mediaType || "IMAGE"
    });
    setImagePreview(item.imageUrl || null);
    setShowModal(true);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      showAlert("File size must be under 5MB.", "error");
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const base64 = event.target?.result as string;
      setImagePreview(base64);
      setFormData(prev => ({ ...prev, imageUrl: base64 }));
    };
    reader.readAsDataURL(file);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.imageUrl) {
      showAlert("An image is required.", "error");
      return;
    }
    
    if (isSubmitting) return;
    setIsSubmitting(true);

    const payload = {
      ...formData,
      category: formData.category.toLowerCase(),
      sortOrder: parseInt(formData.sortOrder) || 0
    };

    try {
      const url = editingItem ? `/api/gallery/${editingItem.id}` : "/api/gallery";
      const method = editingItem ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      if (!res.ok) throw new Error("Failed to save gallery item");

      showAlert(`Media successfully ${editingItem ? "updated" : "uploaded"}.`, "success");
      setShowModal(false);
      loadGallery();
    } catch (error) {
      console.error(error);
      showAlert("Error saving media item.", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    const confirmed = await showConfirm(
      "Are you sure you want to permanently delete this item?",
      "Delete Media"
    );
    if (!confirmed) return;

    try {
      const res = await fetch(`/api/gallery/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete");
      showAlert("Media deleted successfully.", "success");
      setItems(prev => prev.filter(item => item.id !== id));
      if (selectedIds.includes(id)) {
        setSelectedIds(prev => prev.filter(selectedId => selectedId !== id));
      }
    } catch (e) {
      showAlert("Error deleting media.", "error");
    }
  };

  const toggleSelection = (id: string) => {
    setSelectedIds(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    if (selectedIds.length === filteredItems.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredItems.map(i => i.id));
    }
  };

  // Filter Items
  const filteredItems = items.filter(item => {
    const matchesSearch =
      (item.title || "").toLowerCase().includes(search.toLowerCase()) ||
      (item.description || "").toLowerCase().includes(search.toLowerCase());
    const matchesCat = categoryFilter === "ALL" || (item.category || "").toUpperCase() === categoryFilter;
    return matchesSearch && matchesCat;
  });

  return (
    <div className="p-6 max-w-[1600px] mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 bg-surface p-6 rounded-2xl border border-border shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-accent/5 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />
        
        <div className="relative z-10 space-y-1">
          <div className="flex items-center gap-2">
            <ImageIcon className="w-6 h-6 text-accent" />
            <h1 className="text-2xl font-black text-slate-50 tracking-tight uppercase">Media Gallery</h1>
          </div>
          <p className="text-sm text-slate-400">Manage public gallery images and promotional media.</p>
        </div>

        <div className="relative z-10 flex items-center gap-3">
          <button
            onClick={loadGallery}
            className="flex items-center gap-2 bg-surface hover:bg-slate-800 text-slate-300 border border-border px-4 py-2.5 rounded-xl text-sm font-bold transition-all"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Sync</span>
          </button>
          <button
            onClick={openAddModal}
            className="flex items-center gap-2 bg-accent hover:bg-yellow-500 text-slate-950 px-4 py-2.5 rounded-xl text-sm font-black uppercase tracking-wider transition-all shadow-lg shadow-accent/20"
          >
            <Plus className="w-4 h-4" />
            <span>Upload Media</span>
          </button>
        </div>
      </div>

      {/* Filters & Actions */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="flex items-center gap-2 w-full md:w-auto">
          <div className="relative w-full md:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input
              type="text"
              placeholder="Search by title or description..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-surface border border-border rounded-xl pl-9 pr-4 py-2.5 text-sm text-slate-200 focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-all"
            />
          </div>
          
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="bg-surface border border-border rounded-xl px-4 py-2.5 text-sm text-slate-200 focus:outline-none focus:border-accent transition-all appearance-none pr-8 cursor-pointer relative"
          >
            <option value="ALL">All Categories</option>
            {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>

        {selectedIds.length > 0 && (
          <div className="flex items-center gap-3 animate-in fade-in zoom-in-95 duration-200">
            <span className="text-xs font-bold text-slate-400 bg-slate-800/50 px-3 py-1.5 rounded-lg border border-border">
              {selectedIds.length} Selected
            </span>
            <button className="flex items-center gap-1.5 text-xs font-bold text-red-400 hover:text-red-300 hover:bg-red-400/10 px-3 py-1.5 rounded-lg border border-red-400/20 transition-all">
              <Trash2 className="w-3.5 h-3.5" />
              Delete Selected
            </button>
          </div>
        )}
      </div>

      {/* Media Grid */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-24 text-slate-400 space-y-4">
          <RefreshCw className="w-8 h-8 animate-spin text-accent" />
          <p className="text-sm font-mono tracking-widest uppercase">Loading Gallery...</p>
        </div>
      ) : filteredItems.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 bg-surface/50 rounded-2xl border border-dashed border-border text-center">
          <ImageIcon className="w-12 h-12 text-slate-600 mb-4" />
          <h3 className="text-lg font-bold text-slate-300">No media found</h3>
          <p className="text-sm text-slate-500 mt-1 mb-6">Upload images to showcase your fleet and services.</p>
          <button
            onClick={openAddModal}
            className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-slate-200 px-4 py-2 rounded-lg text-sm font-bold transition-all border border-border"
          >
            <Plus className="w-4 h-4" />
            Upload Media
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
          {filteredItems.map((item) => (
            <div 
              key={item.id} 
              className={`group bg-surface rounded-2xl border ${selectedIds.includes(item.id) ? 'border-accent ring-1 ring-accent/50' : 'border-border hover:border-slate-600'} overflow-hidden shadow-sm transition-all relative flex flex-col`}
            >
              {/* Image Preview */}
              <div className="relative aspect-square bg-slate-900 overflow-hidden">
                <img 
                  src={item.imageUrl} 
                  alt={item.title || "Gallery item"} 
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
                
                {/* Overlay Controls */}
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                  <button 
                    onClick={() => openEditModal(item)}
                    className="p-2 bg-white/10 hover:bg-accent text-white hover:text-slate-950 rounded-full backdrop-blur-sm transition-all"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button 
                    onClick={() => handleDelete(item.id)}
                    className="p-2 bg-white/10 hover:bg-red-500 text-white rounded-full backdrop-blur-sm transition-all"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                {/* Status Badges */}
                <div className="absolute top-3 left-3 flex flex-col gap-2">
                  <span className="px-2 py-1 text-[9px] font-black uppercase tracking-widest bg-black/70 text-white rounded backdrop-blur-md border border-white/10">
                    {item.category}
                  </span>
                  {item.isFeatured && (
                    <span className="px-2 py-1 text-[9px] font-black uppercase tracking-widest bg-accent/90 text-slate-950 rounded backdrop-blur-md shadow-lg flex items-center gap-1">
                      <Sparkles className="w-3 h-3" />
                      Featured
                    </span>
                  )}
                </div>

                {/* Selection Checkbox */}
                <button 
                  onClick={(e) => { e.stopPropagation(); toggleSelection(item.id); }}
                  className={`absolute top-3 right-3 p-1.5 rounded-full backdrop-blur-md transition-all ${selectedIds.includes(item.id) ? 'bg-accent text-slate-950 shadow-lg' : 'bg-black/50 text-white opacity-0 group-hover:opacity-100 hover:bg-white/20'}`}
                >
                  {selectedIds.includes(item.id) ? <CheckSquare className="w-4 h-4" /> : <Square className="w-4 h-4" />}
                </button>
              </div>

              {/* Info */}
              <div className="p-4 flex flex-col gap-1">
                <h3 className="text-sm font-bold text-slate-100 truncate" title={item.title || "Untitled"}>
                  {item.title || "Untitled Media"}
                </h3>
                <div className="flex items-center justify-between mt-1">
                  <div className="flex items-center gap-1.5 text-xs text-slate-500">
                    <MapPin className="w-3 h-3" />
                    <span className="truncate max-w-[100px]">{item.location || "N/A"}</span>
                  </div>
                  <div className="flex items-center gap-1 text-[10px] font-mono text-slate-500">
                    <Eye className={`w-3 h-3 ${item.isActive ? 'text-emerald-400' : 'text-slate-600'}`} />
                    {item.isActive ? 'VISIBLE' : 'HIDDEN'}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add / Edit Modal */}
      {showModal && (
        <Portal>
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[9999] flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
            <div className="bg-background border border-border rounded-2xl w-full max-w-4xl shadow-2xl relative my-8">
              {/* Modal Header */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-surface/50 rounded-t-2xl">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-accent/10 border border-accent/20 flex items-center justify-center text-accent">
                    {editingItem ? <Edit2 className="w-5 h-5" /> : <ImageIcon className="w-5 h-5" />}
                  </div>
                  <div>
                    <h2 className="text-lg font-black text-slate-50 uppercase tracking-wide">
                      {editingItem ? "Edit Media" : "Upload New Media"}
                    </h2>
                    <p className="text-xs text-slate-400 font-medium">
                      Fill out media details for the public gallery.
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setShowModal(false)}
                  className="p-2 text-slate-400 hover:text-white hover:bg-surface rounded-full transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Modal Form */}
              <form onSubmit={handleFormSubmit} className="p-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* Left Column: Image Upload & Preview */}
                  <div className="space-y-6">
                    <div>
                      <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Media File *</label>
                      <div className="relative group">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleImageUpload}
                          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                        />
                        <div className={`w-full aspect-video rounded-2xl border-2 border-dashed ${imagePreview ? 'border-accent' : 'border-slate-700 group-hover:border-slate-500'} bg-surface flex flex-col items-center justify-center overflow-hidden transition-all relative`}>
                          {imagePreview ? (
                            <>
                              <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-all">
                                <p className="text-white font-bold flex items-center gap-2">
                                  <Upload className="w-4 h-4" /> Change Image
                                </p>
                              </div>
                            </>
                          ) : (
                            <div className="text-center p-6 space-y-3">
                              <div className="w-12 h-12 bg-slate-800 rounded-full flex items-center justify-center mx-auto text-slate-400 group-hover:text-accent group-hover:bg-accent/10 transition-colors">
                                <Upload className="w-5 h-5" />
                              </div>
                              <div>
                                <p className="text-sm font-bold text-slate-200">Click to upload image</p>
                                <p className="text-xs text-slate-500 mt-1">PNG, JPG up to 5MB</p>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      {/* Featured Toggle */}
                      <div 
                        onClick={() => setFormData(p => ({ ...p, isFeatured: !p.isFeatured }))}
                        className={`p-4 rounded-xl border cursor-pointer transition-all flex items-center justify-between ${formData.isFeatured ? 'bg-amber-500/10 border-amber-500/50' : 'bg-surface border-border hover:border-slate-600'}`}
                      >
                        <div className="flex items-center gap-3">
                          <Sparkles className={`w-5 h-5 ${formData.isFeatured ? 'text-amber-400' : 'text-slate-500'}`} />
                          <div>
                            <p className={`text-sm font-bold ${formData.isFeatured ? 'text-amber-400' : 'text-slate-300'}`}>Featured</p>
                            <p className="text-[10px] text-slate-500">Show in priority spots</p>
                          </div>
                        </div>
                        <div className={`w-5 h-5 rounded flex items-center justify-center ${formData.isFeatured ? 'bg-amber-500 text-slate-950' : 'border border-slate-600'}`}>
                          {formData.isFeatured && <CheckCircle2 className="w-4 h-4" />}
                        </div>
                      </div>

                      {/* Active Toggle */}
                      <div 
                        onClick={() => setFormData(p => ({ ...p, isActive: !p.isActive }))}
                        className={`p-4 rounded-xl border cursor-pointer transition-all flex items-center justify-between ${formData.isActive ? 'bg-emerald-500/10 border-emerald-500/50' : 'bg-surface border-border hover:border-slate-600'}`}
                      >
                        <div className="flex items-center gap-3">
                          <Eye className={`w-5 h-5 ${formData.isActive ? 'text-emerald-400' : 'text-slate-500'}`} />
                          <div>
                            <p className={`text-sm font-bold ${formData.isActive ? 'text-emerald-400' : 'text-slate-300'}`}>Active</p>
                            <p className="text-[10px] text-slate-500">Visible to public</p>
                          </div>
                        </div>
                        <div className={`w-5 h-5 rounded flex items-center justify-center ${formData.isActive ? 'bg-emerald-500 text-slate-950' : 'border border-slate-600'}`}>
                          {formData.isActive && <CheckCircle2 className="w-4 h-4" />}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Right Column: Details */}
                  <div className="space-y-5">
                    <div>
                      <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Title</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Mercedes S-Class Arrival"
                        value={formData.title}
                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                        className="w-full bg-surface border border-border rounded-xl px-4 py-2.5 text-sm text-slate-200 focus:outline-none focus:border-accent transition-colors"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Category</label>
                        <select
                          value={formData.category}
                          onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                          className="w-full bg-surface border border-border rounded-xl px-4 py-2.5 text-sm text-slate-200 focus:outline-none focus:border-accent transition-colors appearance-none"
                        >
                          {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Sort Order</label>
                        <input
                          type="number"
                          value={formData.sortOrder}
                          onChange={(e) => setFormData({ ...formData, sortOrder: e.target.value })}
                          className="w-full bg-surface border border-border rounded-xl px-4 py-2.5 text-sm text-slate-200 focus:outline-none focus:border-accent transition-colors"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Location</label>
                        <input
                          type="text"
                          placeholder="e.g. Delhi NCR"
                          value={formData.location}
                          onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                          className="w-full bg-surface border border-border rounded-xl px-4 py-2.5 text-sm text-slate-200 focus:outline-none focus:border-accent transition-colors"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Year</label>
                        <input
                          type="text"
                          placeholder="e.g. 2024"
                          value={formData.year}
                          onChange={(e) => setFormData({ ...formData, year: e.target.value })}
                          className="w-full bg-surface border border-border rounded-xl px-4 py-2.5 text-sm text-slate-200 focus:outline-none focus:border-accent transition-colors"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Description</label>
                      <textarea
                        rows={3}
                        placeholder="Detailed description of the media..."
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        className="w-full bg-surface border border-border rounded-xl px-4 py-2.5 text-sm text-slate-200 focus:outline-none focus:border-accent transition-colors resize-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Quote / Caption (Optional)</label>
                      <input
                        type="text"
                        placeholder="e.g. Experience luxury on the move."
                        value={formData.caption}
                        onChange={(e) => setFormData({ ...formData, caption: e.target.value })}
                        className="w-full bg-surface border border-border rounded-xl px-4 py-2.5 text-sm text-slate-200 focus:outline-none focus:border-accent transition-colors"
                      />
                    </div>
                  </div>
                </div>

                {/* Footer */}
                <div className="mt-8 pt-6 border-t border-border flex items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="px-6 py-2.5 text-sm font-bold text-slate-300 hover:text-white bg-surface border border-border hover:bg-slate-800 rounded-xl transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-8 py-2.5 text-sm font-black uppercase tracking-wider text-slate-950 bg-accent hover:bg-yellow-500 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl transition-all shadow-lg shadow-accent/20 flex items-center gap-2"
                  >
                    {isSubmitting ? (
                      <RefreshCw className="w-4 h-4 animate-spin" />
                    ) : editingItem ? (
                      <CheckCircle2 className="w-4 h-4" />
                    ) : (
                      <Plus className="w-4 h-4" />
                    )}
                    {isSubmitting ? "Processing..." : editingItem ? "Save Changes" : "Upload Media"}
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
