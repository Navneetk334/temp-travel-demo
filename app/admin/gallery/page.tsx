"use client";

import React, { useState, useEffect } from "react";
import { Plus, Trash2, Image as ImageIcon, Save, X, Eye, Filter } from "lucide-react";

interface Media {
  id: string;
  title?: string | null;
  imageUrl: string;
  mediaType: "IMAGE" | "VIDEO";
  category?: string | null;
  sortOrder: number;
}

export default function AdminGalleryPage() {
  const [mediaList, setMediaList] = useState<Media[]>([]);
  const [loading, setLoading] = useState(true);
  const [categoryFilter, setCategoryFilter] = useState("");

  useEffect(() => {
    // Mock load gallery items (in production fetched from /api/gallery)
    const mockMedia: Media[] = [
      { id: "1", title: "Premium SUV Innova Crysta", imageUrl: "/images/fleet-suv.png", mediaType: "IMAGE", category: "fleet", sortOrder: 1 },
      { id: "2", title: "Scenic Sunset Road Tour", imageUrl: "/images/hero-cover.png", mediaType: "IMAGE", category: "tours", sortOrder: 2 },
    ];
    setMediaList(mockMedia);
    setLoading(false);
  }, []);

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this media item?")) {
      setMediaList(mediaList.filter((m) => m.id !== id));
    }
  };

  const filteredList = categoryFilter 
    ? mediaList.filter(m => m.category === categoryFilter)
    : mediaList;

  return (
    <div className="bg-slate-950 min-h-screen text-slate-100 p-8 space-y-8">
      {/* Title Header */}
      <div className="flex justify-between items-center border-b border-white/5 pb-6">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-50 tracking-tight flex items-center gap-2.5">
            <ImageIcon className="w-8 h-8 text-accent" />
            <span>Gallery Media Catalog</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">Manage web graphics, fleet photography, and corporate outing summaries.</p>
        </div>
        <button
          onClick={() => alert("Uploads are locked in read-only sandbox mode.")}
          className="flex items-center gap-1.5 bg-primary hover:bg-blue-700 text-white font-bold py-2.5 px-6 rounded-lg text-sm tracking-wide transition-all shadow-lg border border-white/10"
        >
          <Plus className="w-4 h-4" />
          <span>Upload Image</span>
        </button>
      </div>

      {/* Filter Bar */}
      <div className="glassmorphism p-6 rounded-xl border border-white/5 flex gap-2 items-center">
        <Filter className="w-4 h-4 text-slate-400 mr-2" />
        {["", "fleet", "tours", "corporate"].map((cat) => (
          <button
            key={cat}
            onClick={() => setCategoryFilter(cat)}
            className={`py-1.5 px-4 rounded-full text-xs font-semibold uppercase tracking-wider transition-all border ${
              categoryFilter === cat
                ? "bg-primary text-primary-foreground border-accent"
                : "bg-white/5 text-slate-300 border-white/10 hover:border-slate-400"
            }`}
          >
            {cat || "All Categories"}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="text-center py-20 text-slate-400">Loading media library...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {filteredList.map((m) => (
            <div key={m.id} className="bg-slate-900 border border-white/5 rounded-xl overflow-hidden shadow-lg flex flex-col group hover:border-primary/45 transition-all">
              <div className="relative h-44 bg-slate-950 flex items-center justify-center">
                <img
                  src={m.imageUrl}
                  alt={m.title || "Gallery Item"}
                  className="w-full h-full object-cover opacity-80"
                />
                <span className="absolute top-3 right-3 bg-slate-950/80 border border-white/10 py-0.5 px-2 rounded text-[9px] font-bold text-accent">
                  Order: {m.sortOrder}
                </span>
              </div>
              <div className="p-4 space-y-4 flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="font-bold text-slate-200 text-sm">{m.title || "Untitled Graphic"}</h3>
                  <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block mt-1">Tag: {m.category || "Unassigned"}</span>
                </div>
                <div className="flex justify-end gap-2 border-t border-white/5 pt-3">
                  <button
                    onClick={() => handleDelete(m.id)}
                    className="p-2 bg-slate-950 border border-white/5 rounded-lg text-slate-400 hover:text-destructive transition-all"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
