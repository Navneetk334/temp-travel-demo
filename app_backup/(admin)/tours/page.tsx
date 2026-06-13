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
  AlertTriangle 
} from "lucide-react";

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
  durationDays: number;
  durationNights: number;
  basePrice: number;
  inclusions: string[];
  exclusions: string[];
  images: string[];
  status: "DRAFT" | "ACTIVE" | "ARCHIVED";
  categoryId: string;
  seoTitle?: string | null;
  seoDescription?: string | null;
  seoKeywords?: string | null;
  itinerary: ItineraryDay[];
}

interface Category {
  id: string;
  name: string;
}

export default function AdminToursPage() {
  const [tours, setTours] = useState<Tour[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTour, setEditingTour] = useState<Tour | null>(null);

  // Form states
  const [formData, setFormData] = useState({
    title: "",
    slug: "",
    description: "",
    durationDays: 1,
    durationNights: 0,
    basePrice: 5000,
    status: "DRAFT" as "DRAFT" | "ACTIVE" | "ARCHIVED",
    categoryId: "",
    seoTitle: "",
    seoDescription: "",
    seoKeywords: "",
    inclusionsText: "",
    exclusionsText: "",
    imagesText: "",
  });

  const [itinerary, setItinerary] = useState<ItineraryDay[]>([
    { day: 1, title: "Arrival", description: "Arrive at hotel and rest." }
  ]);

  // Load active lists
  useEffect(() => {
    async function loadData() {
      try {
        const [toursRes, catsRes] = await Promise.all([
          fetch("/api/tours?status=all"), // Fetching with all statuses
          fetch("/api/tours/categories")
        ]);
        
        if (toursRes.ok && catsRes.ok) {
          const toursData = await toursRes.json();
          const catsData = await catsRes.json();
          setTours(toursData);
          setCategories(catsData);
          if (catsData.length > 0 && !formData.categoryId) {
            setFormData(prev => ({ ...prev, categoryId: catsData[0].id }));
          }
        }
      } catch (err) {
        console.error("Failed to load admin lists:", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  // Handle add itinerary day
  const addItineraryDay = () => {
    setItinerary([
      ...itinerary,
      { day: itinerary.length + 1, title: "", description: "" }
    ]);
  };

  // Handle remove itinerary day
  const removeItineraryDay = (idx: number) => {
    const updated = itinerary.filter((_, i) => i !== idx).map((day, i) => ({
      ...day,
      day: i + 1
    }));
    setItinerary(updated);
  };

  // Open modal for Create/Edit
  const openModal = (tour: Tour | null = null) => {
    if (tour) {
      setEditingTour(tour);
      setFormData({
        title: tour.title,
        slug: tour.slug,
        description: tour.description,
        durationDays: tour.durationDays,
        durationNights: tour.durationNights,
        basePrice: Number(tour.basePrice),
        status: tour.status,
        categoryId: tour.categoryId,
        seoTitle: tour.seoTitle || "",
        seoDescription: tour.seoDescription || "",
        seoKeywords: tour.seoKeywords || "",
        inclusionsText: tour.inclusions.join("\n"),
        exclusionsText: tour.exclusions.join("\n"),
        imagesText: tour.images.join("\n"),
      });
      setItinerary(tour.itinerary);
    } else {
      setEditingTour(null);
      setFormData({
        title: "",
        slug: "",
        description: "",
        durationDays: 1,
        durationNights: 0,
        basePrice: 5000,
        status: "DRAFT",
        categoryId: categories[0]?.id || "",
        seoTitle: "",
        seoDescription: "",
        seoKeywords: "",
        inclusionsText: "",
        exclusionsText: "",
        imagesText: "",
      });
      setItinerary([{ day: 1, title: "Arrival", description: "Arrive at hotel and rest." }]);
    }
    setIsModalOpen(true);
  };

  // Handle Delete
  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this package?")) return;
    try {
      const res = await fetch(`/api/tours/${id}`, { method: "DELETE" });
      if (res.ok) {
        setTours(tours.filter(t => t.id !== id));
      } else {
        const err = await res.json();
        alert(err.error || "Failed to delete package");
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Submit Handler
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const payload = {
      title: formData.title,
      slug: formData.slug,
      description: formData.description,
      durationDays: Number(formData.durationDays),
      durationNights: Number(formData.durationNights),
      basePrice: Number(formData.basePrice),
      status: formData.status,
      categoryId: formData.categoryId,
      seoTitle: formData.seoTitle || null,
      seoDescription: formData.seoDescription || null,
      seoKeywords: formData.seoKeywords || null,
      inclusions: formData.inclusionsText.split("\n").filter(i => i.trim() !== ""),
      exclusions: formData.exclusionsText.split("\n").filter(e => e.trim() !== ""),
      images: formData.imagesText.split("\n").filter(img => img.trim() !== ""),
      itinerary,
    };

    try {
      const url = editingTour ? `/api/tours/${editingTour.id}` : "/api/tours";
      const method = editingTour ? "PUT" : "POST";
      
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        const savedTour = await res.json();
        if (editingTour) {
          setTours(tours.map(t => t.id === editingTour.id ? savedTour : t));
        } else {
          setTours([savedTour, ...tours]);
        }
        setIsModalOpen(false);
      } else {
        const err = await res.json();
        alert(err.error || "Failed to save tour package");
      }
    } catch (err) {
      console.error("Save Tour Error:", err);
    }
  };

  return (
    <div className="bg-slate-950 min-h-screen text-slate-100 p-8 space-y-8">
      {/* Title Header */}
      <div className="flex justify-between items-center border-b border-white/5 pb-6">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-50 tracking-tight flex items-center gap-2">
            <Compass className="w-8 h-8 text-accent" />
            <span>Tour Package Management</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">Configure customer travel itineraries, pricing, and page SEO tags.</p>
        </div>
        <button
          onClick={() => openModal()}
          className="flex items-center gap-1.5 bg-primary hover:bg-blue-700 text-white font-bold py-2.5 px-6 rounded-lg text-sm tracking-wide transition-all shadow-lg border border-white/10"
        >
          <Plus className="w-4 h-4" />
          <span>Add Tour Package</span>
        </button>
      </div>

      {/* Loading state */}
      {loading ? (
        <div className="text-center py-20 text-slate-400">Loading tour packages...</div>
      ) : (
        <div className="glassmorphism rounded-xl border border-white/5 overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-900 border-b border-white/5 text-slate-400 text-xs font-semibold uppercase tracking-wider">
                <th className="p-4">Tour Package</th>
                <th className="p-4">Category</th>
                <th className="p-4">Duration</th>
                <th className="p-4">Base Price</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-sm">
              {tours.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-slate-500">
                    No tour packages created. Click "Add Tour Package" to begin.
                  </td>
                </tr>
              ) : (
                tours.map((tour) => (
                  <tr key={tour.id} className="hover:bg-white/5 transition-colors">
                    <td className="p-4">
                      <div className="font-bold text-slate-200">{tour.title}</div>
                      <div className="text-xs text-slate-500 mt-0.5">/{tour.slug}</div>
                    </td>
                    <td className="p-4 text-xs font-semibold text-slate-400">
                      {categories.find(c => c.id === tour.categoryId)?.name || "Uncategorized"}
                    </td>
                    <td className="p-4 text-slate-300">
                      {tour.durationDays}D / {tour.durationNights}N
                    </td>
                    <td className="p-4 font-bold text-slate-200">
                      ₹{Number(tour.basePrice).toLocaleString("en-IN")}
                    </td>
                    <td className="p-4">
                      <span className={`text-[10px] font-bold py-1 px-2.5 rounded-full border ${
                        tour.status === "ACTIVE" 
                          ? "bg-green-500/10 text-green-400 border-green-500/20" 
                          : tour.status === "DRAFT"
                          ? "bg-yellow-500/10 text-yellow-400 border-yellow-500/20"
                          : "bg-red-500/10 text-red-400 border-red-500/20"
                      }`}>
                        {tour.status}
                      </span>
                    </td>
                    <td className="p-4 text-right space-x-2">
                      <button
                        onClick={() => openModal(tour)}
                        className="inline-flex p-2 bg-slate-900 border border-white/5 rounded-lg text-slate-400 hover:text-accent transition-colors"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(tour.id)}
                        className="inline-flex p-2 bg-slate-900 border border-white/5 rounded-lg text-slate-400 hover:text-destructive transition-colors"
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
      )}

      {/* Modal Add/Edit Package */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-white/10 w-full max-w-4xl rounded-2xl p-6 md:p-8 space-y-6 max-h-[90vh] overflow-y-auto shadow-2xl relative">
            <button 
              onClick={() => setIsModalOpen(false)}
              className="absolute top-6 right-6 p-1.5 bg-slate-950 border border-white/5 rounded-lg text-slate-400 hover:text-slate-200"
            >
              <X className="w-4 h-4" />
            </button>

            <h2 className="text-xl font-bold text-slate-50 flex items-center gap-2">
              <Compass className="w-5 h-5 text-accent" />
              <span>{editingTour ? "Edit Tour Package" : "Create New Tour Package"}</span>
            </h2>

            <form onSubmit={handleSave} className="space-y-6">
              {/* Row 1: Title & Slug */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Package Title</label>
                  <input
                    type="text"
                    required
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full bg-slate-950/60 border border-white/10 rounded-lg py-2 px-4 text-sm text-slate-100 focus:outline-none focus:border-primary transition-all"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Slug</label>
                  <input
                    type="text"
                    required
                    value={formData.slug}
                    onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                    placeholder="e.g. scenic-coastal-goa"
                    className="w-full bg-slate-950/60 border border-white/10 rounded-lg py-2 px-4 text-sm text-slate-100 focus:outline-none focus:border-primary transition-all"
                  />
                </div>
              </div>

              {/* Row 2: Category, Status, Price */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Category</label>
                  <select
                    value={formData.categoryId}
                    onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                    className="w-full bg-slate-950/60 border border-white/10 rounded-lg py-2.5 px-4 text-sm text-slate-100 focus:outline-none focus:border-primary transition-all appearance-none"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.id} className="bg-slate-900">{c.name}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                    className="w-full bg-slate-950/60 border border-white/10 rounded-lg py-2.5 px-4 text-sm text-slate-100 focus:outline-none focus:border-primary transition-all appearance-none"
                  >
                    <option value="DRAFT" className="bg-slate-900">DRAFT</option>
                    <option value="ACTIVE" className="bg-slate-900">ACTIVE</option>
                    <option value="ARCHIVED" className="bg-slate-900">ARCHIVED</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Base Price (INR)</label>
                  <input
                    type="number"
                    required
                    value={formData.basePrice}
                    onChange={(e) => setFormData({ ...formData, basePrice: Number(e.target.value) })}
                    className="w-full bg-slate-950/60 border border-white/10 rounded-lg py-2 px-4 text-sm text-slate-100 focus:outline-none focus:border-primary transition-all"
                  />
                </div>
              </div>

              {/* Row 3: Durations */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Duration Days</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={formData.durationDays}
                    onChange={(e) => setFormData({ ...formData, durationDays: Number(e.target.value) })}
                    className="w-full bg-slate-950/60 border border-white/10 rounded-lg py-2 px-4 text-sm text-slate-100 focus:outline-none focus:border-primary transition-all"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Duration Nights</label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={formData.durationNights}
                    onChange={(e) => setFormData({ ...formData, durationNights: Number(e.target.value) })}
                    className="w-full bg-slate-950/60 border border-white/10 rounded-lg py-2 px-4 text-sm text-slate-100 focus:outline-none focus:border-primary transition-all"
                  />
                </div>
              </div>

              {/* Row 4: Description */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Package Description</label>
                <textarea
                  rows={4}
                  required
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full bg-slate-950/60 border border-white/10 rounded-lg py-2 px-4 text-sm text-slate-100 focus:outline-none focus:border-primary transition-all resize-none"
                />
              </div>

              {/* Day-by-Day Itinerary Builder */}
              <div className="space-y-4 border-t border-white/5 pt-6">
                <div className="flex justify-between items-center">
                  <h3 className="text-md font-bold text-slate-50 flex items-center gap-1.5">
                    <Calendar className="w-4 h-4 text-accent" />
                    <span>Day-by-Day Itinerary Planner</span>
                  </h3>
                  <button
                    type="button"
                    onClick={addItineraryDay}
                    className="flex items-center gap-1 text-xs text-accent hover:underline font-bold"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Day</span>
                  </button>
                </div>

                <div className="space-y-4">
                  {itinerary.map((day, idx) => (
                    <div key={idx} className="bg-slate-950/40 p-4 border border-white/5 rounded-xl space-y-3 relative">
                      <button
                        type="button"
                        onClick={() => removeItineraryDay(idx)}
                        className="absolute top-4 right-4 text-slate-500 hover:text-destructive"
                      >
                        <Trash2 className="w-4.5 h-4.5" />
                      </button>
                      <div className="font-extrabold text-xs text-accent uppercase tracking-wider">Day {day.day}</div>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="md:col-span-1 space-y-1">
                          <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Day Heading</label>
                          <input
                            type="text"
                            required
                            value={day.title}
                            placeholder="e.g. Sightseeing in Fort Aguada"
                            onChange={(e) => {
                              const updated = [...itinerary];
                              updated[idx].title = e.target.value;
                              setItinerary(updated);
                            }}
                            className="w-full bg-slate-950/60 border border-white/10 rounded-lg py-1.5 px-3 text-xs text-slate-100 focus:outline-none focus:border-primary"
                          />
                        </div>
                        <div className="md:col-span-2 space-y-1">
                          <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Day Description</label>
                          <input
                            type="text"
                            required
                            value={day.description}
                            placeholder="Describe itinerary details..."
                            onChange={(e) => {
                              const updated = [...itinerary];
                              updated[idx].description = e.target.value;
                              setItinerary(updated);
                            }}
                            className="w-full bg-slate-950/60 border border-white/10 rounded-lg py-1.5 px-3 text-xs text-slate-100 focus:outline-none focus:border-primary"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Checklists and Images */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 border-t border-white/5 pt-6">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Inclusions (line separated)</label>
                  <textarea
                    rows={4}
                    value={formData.inclusionsText}
                    onChange={(e) => setFormData({ ...formData, inclusionsText: e.target.value })}
                    placeholder="Hotels&#10;Driver allowance&#10;Fuel charges"
                    className="w-full bg-slate-950/60 border border-white/10 rounded-lg py-2 px-4 text-xs text-slate-100 focus:outline-none focus:border-primary transition-all resize-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Exclusions (line separated)</label>
                  <textarea
                    rows={4}
                    value={formData.exclusionsText}
                    onChange={(e) => setFormData({ ...formData, exclusionsText: e.target.value })}
                    placeholder="Flights&#10;Entry monument tickets&#10;Lunch & Dinner"
                    className="w-full bg-slate-950/60 border border-white/10 rounded-lg py-2 px-4 text-xs text-slate-100 focus:outline-none focus:border-primary transition-all resize-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Images (URLs, line separated)</label>
                  <textarea
                    rows={4}
                    value={formData.imagesText}
                    onChange={(e) => setFormData({ ...formData, imagesText: e.target.value })}
                    placeholder="https://images.unsplash.com/photo-xxx&#10;https://images.unsplash.com/photo-yyy"
                    className="w-full bg-slate-950/60 border border-white/10 rounded-lg py-2 px-4 text-xs text-slate-100 focus:outline-none focus:border-primary transition-all resize-none"
                  />
                </div>
              </div>

              {/* SEO Configurations */}
              <div className="space-y-4 border-t border-white/5 pt-6">
                <h3 className="text-md font-bold text-slate-50 flex items-center gap-1.5">
                  <Globe className="w-4 h-4 text-accent" />
                  <span>SEO Configurations</span>
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">SEO Title</label>
                    <input
                      type="text"
                      value={formData.seoTitle}
                      onChange={(e) => setFormData({ ...formData, seoTitle: e.target.value })}
                      placeholder="Max 60 characters for best display"
                      className="w-full bg-slate-950/60 border border-white/10 rounded-lg py-2 px-4 text-sm text-slate-100 focus:outline-none focus:border-primary transition-all"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">SEO Keywords</label>
                    <input
                      type="text"
                      value={formData.seoKeywords}
                      onChange={(e) => setFormData({ ...formData, seoKeywords: e.target.value })}
                      placeholder="e.g. goa, coastal, tour, beaches"
                      className="w-full bg-slate-950/60 border border-white/10 rounded-lg py-2 px-4 text-sm text-slate-100 focus:outline-none focus:border-primary transition-all"
                    />
                  </div>
                  <div className="md:col-span-2 space-y-1">
                    <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">SEO Description</label>
                    <input
                      type="text"
                      value={formData.seoDescription}
                      onChange={(e) => setFormData({ ...formData, seoDescription: e.target.value })}
                      placeholder="Max 160 characters for best search summaries"
                      className="w-full bg-slate-950/60 border border-white/10 rounded-lg py-2 px-4 text-sm text-slate-100 focus:outline-none focus:border-primary transition-all"
                    />
                  </div>
                </div>
              </div>

              {/* Form CTA buttons */}
              <div className="flex justify-end gap-4 border-t border-white/5 pt-6">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="bg-slate-950 hover:bg-slate-900 border border-white/10 text-slate-300 font-semibold py-2 px-6 rounded-lg text-sm tracking-wide transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex items-center gap-1 bg-accent hover:bg-amber-600 text-slate-950 font-bold py-2 px-8 rounded-lg text-sm tracking-wider uppercase transition-all shadow-lg"
                >
                  <Save className="w-4 h-4" />
                  <span>Save Package</span>
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

    </div>
  );
}
