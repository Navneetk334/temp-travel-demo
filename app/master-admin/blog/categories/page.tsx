"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Tag,
  Plus,
  Search,
  FileText,
  Edit2,
  Trash2,
  X,
  CheckCircle2,
  FolderTree,
  Sparkles,
  ArrowRight
} from "lucide-react";
import Portal from "@/components/shared/portal";

interface BlogCategory {
  id: string;
  name: string;
  slug: string;
  description: string;
  articleCount?: number;
  createdAt: string;
}

const DEFAULT_CATEGORIES: BlogCategory[] = [
  {
    id: "cat-1",
    name: "Outstation Trips",
    slug: "outstation-trips",
    description: "Inter-city round trips, weekend getaways, and highway travel guides across India.",
    articleCount: 1,
    createdAt: "2026-08-01"
  },
  {
    id: "cat-2",
    name: "Corporate Travel",
    slug: "corporate-travel",
    description: "Executive chauffeurs, corporate employee transit solutions, and business hub connectivity.",
    articleCount: 1,
    createdAt: "2026-08-01"
  },
  {
    id: "cat-3",
    name: "Airport Transfers",
    slug: "airport-transfers",
    description: "Dedicated 24/7 airport terminal pickup and drop shuttles with real-time flight tracking.",
    articleCount: 1,
    createdAt: "2026-08-01"
  },
  {
    id: "cat-4",
    name: "Local City Guides",
    slug: "local-city-guides",
    description: "Full-day hourly 8hr/80km local sightseeing, point-to-point transfers and city exploration.",
    articleCount: 0,
    createdAt: "2026-08-01"
  }
];

export default function MasterBlogCategoriesPage() {
  const [categories, setCategories] = useState<BlogCategory[]>([]);
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState<BlogCategory | null>(null);

  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    description: ""
  });

  // Load from LocalStorage
  useEffect(() => {
    const saved = localStorage.getItem("user_uploaded_blog_categories");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setCategories(parsed);
          return;
        }
      } catch (e) {
        console.error(e);
      }
    }
    setCategories(DEFAULT_CATEGORIES);
    localStorage.setItem("user_uploaded_blog_categories", JSON.stringify(DEFAULT_CATEGORIES));
  }, []);

  const openAddModal = () => {
    setEditingCategory(null);
    setFormData({ name: "", slug: "", description: "" });
    setShowModal(true);
  };

  const openEditModal = (cat: BlogCategory) => {
    setEditingCategory(cat);
    setFormData({
      name: cat.name,
      slug: cat.slug,
      description: cat.description
    });
    setShowModal(true);
  };

  const handleSaveCategory = (e: React.FormEvent) => {
    e.preventDefault();
    const slug = formData.slug || formData.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)+/g, "");

    let updated: BlogCategory[] = [];
    if (editingCategory) {
      updated = categories.map(c => c.id === editingCategory.id ? {
        ...c,
        name: formData.name,
        slug,
        description: formData.description
      } : c);
    } else {
      const newCat: BlogCategory = {
        id: `cat-${Date.now()}`,
        name: formData.name,
        slug,
        description: formData.description || "Category for SEO articles and company guides.",
        articleCount: 0,
        createdAt: new Date().toISOString().slice(0, 10)
      };
      updated = [newCat, ...categories];
    }

    setCategories(updated);
    localStorage.setItem("user_uploaded_blog_categories", JSON.stringify(updated));
    setShowModal(false);
    setEditingCategory(null);
  };

  const handleDeleteCategory = (id: string) => {
    if (confirm("Are you sure you want to delete this blog category?")) {
      const updated = categories.filter(c => c.id !== id);
      setCategories(updated);
      localStorage.setItem("user_uploaded_blog_categories", JSON.stringify(updated));
    }
  };

  const filtered = categories.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.slug.toLowerCase().includes(search.toLowerCase()) ||
    c.description.toLowerCase().includes(search.toLowerCase())
  );

  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const handleSelectAll = () => {
    if (selectedIds.length === filtered.length && filtered.length > 0) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filtered.map(c => c.id));
    }
  };

  const handleToggleSelect = (id: string) => {
    setSelectedIds(prev =>
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const handleBulkDelete = () => {
    if (selectedIds.length === 0) return;
    if (confirm(`Are you sure you want to delete ${selectedIds.length} selected category(ies)?`)) {
      const updated = categories.filter(c => !selectedIds.includes(c.id));
      setCategories(updated);
      setSelectedIds([]);
      localStorage.setItem("user_uploaded_blog_categories", JSON.stringify(updated));
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-amber-500/20 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-black tracking-tight text-slate-50">
              Blog Categories Manager
            </h1>
            <span className="bg-amber-500/10 text-amber-400 border border-amber-500/30 text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider">
              {categories.length} Taxonomies
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Manage topic categories used when creating and tagging blog articles.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/master-admin/blog"
            className="flex items-center gap-1.5 bg-slate-900 border border-white/10 hover:border-amber-400/40 text-slate-300 px-3 py-1.5 rounded-xl text-xs font-bold transition-all"
          >
            <FileText className="w-3.5 h-3.5 text-amber-400" />
            <span>View All Blogs</span>
          </Link>
          <button
            onClick={openAddModal}
            className="flex items-center gap-1.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 px-3.5 py-1.5 rounded-xl text-xs font-black tracking-wider uppercase transition-all shadow-md shadow-amber-500/20 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Category</span>
          </button>
        </div>
      </div>

      {/* Search Toolbar & Select All */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-slate-900/60 p-4 rounded-2xl border border-white/10">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search category name, slug or description..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-950 border border-white/10 rounded-xl pl-9 pr-4 py-2 text-xs text-slate-100 focus:outline-none focus:border-amber-400"
          />
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleSelectAll}
            className="px-3 py-1.5 bg-slate-950 hover:bg-white/10 border border-white/10 text-slate-300 rounded-xl text-xs font-bold transition-all cursor-pointer"
          >
            {selectedIds.length === filtered.length && filtered.length > 0 ? "Deselect All" : "Select All Categories"}
          </button>
        </div>
      </div>

      {/* Bulk Action Bar */}
      {selectedIds.length > 0 && (
        <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl animate-in fade-in slide-in-from-top-2">
          <div className="flex items-center gap-2">
            <span className="bg-amber-500 text-slate-950 text-xs font-black px-2.5 py-0.5 rounded-md font-mono">
              {selectedIds.length} Selected
            </span>
            <span className="text-xs text-slate-300 font-medium">Bulk Category Operations</span>
          </div>

          <div className="flex items-center gap-2">
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
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Categories Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.map((cat) => {
          const isSelected = selectedIds.includes(cat.id);
          return (
            <div
              key={cat.id}
              className={`bg-slate-900/80 backdrop-blur-xl border rounded-2xl p-5 shadow-xl space-y-3 transition-all flex flex-col justify-between ${
                isSelected ? "border-amber-400 bg-amber-500/5 ring-1 ring-amber-400/40" : "border-white/10 hover:border-amber-500/40"
              }`}
            >
              <div className="space-y-2">
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => handleToggleSelect(cat.id)}
                      className="w-4 h-4 rounded border-white/20 bg-slate-900 text-amber-500 focus:ring-amber-400 cursor-pointer accent-amber-500"
                    />
                    <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
                      <Tag className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-100 text-sm">{cat.name}</h3>
                      <span className="text-[10px] font-mono text-amber-400">/{cat.slug}</span>
                    </div>
                  </div>
                  <span className="text-[10px] font-bold text-slate-400 bg-slate-950 border border-white/10 px-2 py-0.5 rounded-full font-mono">
                    {cat.articleCount ?? 0} Posts
                  </span>
                </div>

                <p className="text-xs text-slate-400 leading-relaxed line-clamp-2">
                  {cat.description}
                </p>
              </div>

              <div className="pt-3 border-t border-white/5 flex items-center justify-between">
                <span className="text-[10px] font-mono text-slate-500">Created: {cat.createdAt}</span>
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => openEditModal(cat)}
                    className="p-1.5 bg-slate-950 text-slate-300 hover:text-white border border-white/10 hover:border-amber-400/40 rounded-lg text-xs font-bold transition-all cursor-pointer"
                    title="Edit Category"
                  >
                    <Edit2 className="w-3.5 h-3.5 text-amber-400" />
                  </button>
                  <button
                    onClick={() => handleDeleteCategory(cat.id)}
                    className="p-1.5 bg-slate-950 text-slate-400 hover:text-rose-400 border border-white/10 hover:border-rose-400/40 rounded-lg text-xs font-bold transition-all cursor-pointer"
                    title="Delete Category"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add / Edit Category Modal */}
      {showModal && (
        <Portal>
          <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
            <div className="bg-slate-900 border border-amber-500/30 rounded-3xl p-6 sm:p-8 w-full max-w-lg shadow-2xl space-y-4 relative text-slate-100">
              <button
                onClick={() => setShowModal(false)}
                className="absolute top-5 right-5 text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="space-y-1 border-b border-white/10 pb-3">
                <span className="text-[10px] font-bold uppercase text-amber-400 tracking-wider">
                  {editingCategory ? "Update Category" : "New Taxonomy"}
                </span>
                <h3 className="text-xl font-black text-slate-50">
                  {editingCategory ? "Edit Blog Category" : "Add Blog Category"}
                </h3>
              </div>

              <form onSubmit={handleSaveCategory} className="space-y-4 text-xs">
                <div className="space-y-1">
                  <label className="text-slate-300 font-bold">Category Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Wedding Car Rentals"
                    value={formData.name}
                    onChange={(e) => {
                      const name = e.target.value;
                      const autoSlug = name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)+/g, "");
                      setFormData({ ...formData, name, slug: editingCategory ? formData.slug : autoSlug });
                    }}
                    className="w-full bg-slate-950 border border-white/10 rounded-xl px-3.5 py-2 text-slate-100 focus:outline-none focus:border-amber-400 font-semibold"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-slate-300 font-bold">URL Slug *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. wedding-car-rentals"
                    value={formData.slug}
                    onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                    className="w-full bg-slate-950 border border-white/10 rounded-xl px-3.5 py-2 text-slate-100 focus:outline-none focus:border-amber-400 font-mono"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-slate-300 font-bold">Description</label>
                  <textarea
                    rows={3}
                    placeholder="Brief description of the articles and topics covered under this category..."
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full bg-slate-950 border border-white/10 rounded-xl px-3.5 py-2 text-slate-100 focus:outline-none focus:border-amber-400 font-sans"
                  />
                </div>

                <div className="pt-3 border-t border-white/10 flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="px-5 py-2 bg-slate-950 text-slate-400 hover:text-white rounded-xl text-xs font-bold cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2 bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-black rounded-xl text-xs uppercase tracking-wider shadow-lg shadow-amber-500/20 cursor-pointer"
                  >
                    {editingCategory ? "Save Changes" : "Create Category"}
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
