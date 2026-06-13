"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Plus, ArrowLeft, Save, Globe, Info } from "lucide-react";

interface Category {
  id: string;
  name: string;
  slug: string;
}

interface BlogPostInput {
  title: string;
  slug: string;
  summary: string;
  content: string;
  featuredImage: string;
  published: boolean;
  categoryId: string;
  tags: string[];
  seoTitle: string;
  seoDescription: string;
  seoKeywords: string;
}

interface BlogFormProps {
  initialData?: BlogPostInput & { id: string };
  isEdit?: boolean;
}

export default function BlogForm({ initialData, isEdit = false }: BlogFormProps) {
  const router = useRouter();
  
  const [formData, setFormData] = useState<BlogPostInput>({
    title: initialData?.title || "",
    slug: initialData?.slug || "",
    summary: initialData?.summary || "",
    content: initialData?.content || "",
    featuredImage: initialData?.featuredImage || "",
    published: initialData?.published || false,
    categoryId: initialData?.categoryId || "",
    tags: initialData?.tags || [],
    seoTitle: initialData?.seoTitle || "",
    seoDescription: initialData?.seoDescription || "",
    seoKeywords: initialData?.seoKeywords || "",
  });

  const [categories, setCategories] = useState<Category[]>([]);
  const [tagInput, setTagInput] = useState(initialData?.tags.join(", ") || "");
  const [loading, setLoading] = useState(false);
  const [fetchingCategories, setFetchingCategories] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Category Quick Add State
  const [showQuickCategory, setShowQuickCategory] = useState(false);
  const [newCatName, setNewCatName] = useState("");
  const [newCatSlug, setNewCatSlug] = useState("");
  const [addingCategory, setAddingCategory] = useState(false);

  // Load categories
  useEffect(() => {
    async function loadCategories() {
      try {
        const res = await fetch("/api/blog/categories");
        if (res.ok) {
          const data = await res.json();
          setCategories(data);
        }
      } catch (err) {
        console.error("Failed to load categories:", err);
      } finally {
        setFetchingCategories(false);
      }
    }
    loadCategories();
  }, []);

  // Sync title to slug automatically if not in edit mode
  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const title = e.target.value;
    const slug = title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");

    setFormData((prev) => ({
      ...prev,
      title,
      slug: isEdit ? prev.slug : slug,
      seoTitle: isEdit ? prev.seoTitle : title.slice(0, 60),
    }));
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setFormData((prev) => ({ ...prev, [name]: checked }));
  };

  // Quick Category Submission
  const handleAddCategory = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (!newCatName.trim() || !newCatSlug.trim()) {
      alert("Please enter both category name and slug.");
      return;
    }
    setAddingCategory(true);
    try {
      const res = await fetch("/api/blog/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newCatName.trim(), slug: newCatSlug.trim() }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to add category");
      }
      setCategories((prev) => [...prev, data].sort((a, b) => a.name.localeCompare(b.name)));
      setFormData((prev) => ({ ...prev, categoryId: data.id }));
      setShowQuickCategory(false);
      setNewCatName("");
      setNewCatSlug("");
    } catch (err: any) {
      alert(err.message || "Error creating category.");
    } finally {
      setAddingCategory(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // Parse tags array
    const tagsArray = tagInput
      .split(",")
      .map((t) => t.trim().toLowerCase())
      .filter((t) => t.length > 0);

    const payload = {
      ...formData,
      tags: tagsArray,
      featuredImage: formData.featuredImage.trim() || null,
      seoTitle: formData.seoTitle.trim() || null,
      seoDescription: formData.seoDescription.trim() || null,
      seoKeywords: formData.seoKeywords.trim() || null,
    };

    const url = isEdit ? `/api/blog/posts/${initialData?.id}` : "/api/blog/posts";
    const method = isEdit ? "PUT" : "POST";

    try {
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        if (data.error && typeof data.error === "object") {
          const fieldErrors = Object.values(data.error).flat().join(", ");
          throw new Error(fieldErrors || "Submission failed.");
        }
        throw new Error(data.error || "Submission failed.");
      }

      router.push("/admin/blog");
      router.refresh();
    } catch (err: any) {
      setError(err.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Top action row */}
      <div className="flex justify-between items-center">
        <button
          type="button"
          onClick={() => router.push("/admin/blog")}
          className="flex items-center gap-2 text-sm text-slate-400 hover:text-slate-200 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Articles</span>
        </button>
      </div>

      {error && (
        <div className="bg-rose-500/10 border border-rose-500/30 rounded-xl p-4 text-xs text-rose-300">
          <strong>Error submitting article:</strong> {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left main area (Post contents) */}
        <div className="lg:col-span-8 space-y-6">
          <div className="bg-slate-900/40 border border-white/5 rounded-2xl p-6 space-y-4 glassmorphism">
            <h2 className="text-lg font-bold text-slate-50 border-b border-white/5 pb-2">Article Core Details</h2>
            
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Article Title *</label>
              <input
                type="text"
                required
                name="title"
                value={formData.title}
                onChange={handleTitleChange}
                placeholder="e.g. 10 Scenic Routes in Mahabaleshwar"
                className="w-full bg-slate-950/50 border border-white/10 rounded-lg py-2.5 px-4 text-sm text-slate-100 focus:outline-none focus:border-primary transition-all font-semibold"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Slug Path *</label>
                <input
                  type="text"
                  required
                  name="slug"
                  value={formData.slug}
                  onChange={handleInputChange}
                  placeholder="e.g. scenic-mahabaleshwar-routes"
                  className="w-full bg-slate-950/50 border border-white/10 rounded-lg py-2 px-4 text-sm text-slate-100 focus:outline-none focus:border-primary transition-all font-mono"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Category *</label>
                {fetchingCategories ? (
                  <div className="text-xs text-slate-500 py-3">Loading categories...</div>
                ) : (
                  <div className="flex gap-2">
                    <select
                      required
                      name="categoryId"
                      value={formData.categoryId}
                      onChange={handleInputChange}
                      className="w-full bg-slate-950/50 border border-white/10 rounded-lg py-2 px-4 text-sm text-slate-100 focus:outline-none focus:border-primary transition-all appearance-none"
                    >
                      <option value="">-- Select Category --</option>
                      {categories.map((cat) => (
                        <option key={cat.id} value={cat.id} className="bg-slate-900">
                          {cat.name}
                        </option>
                      ))}
                    </select>
                    <button
                      type="button"
                      onClick={() => setShowQuickCategory(!showQuickCategory)}
                      className="bg-slate-950 border border-white/10 hover:border-accent p-2.5 rounded-lg text-slate-400 hover:text-accent transition-colors"
                      title="Add category inline"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Quick category add block */}
            {showQuickCategory && (
              <div className="bg-slate-950 border border-white/10 rounded-xl p-4 space-y-3">
                <div className="text-xs font-bold text-accent">Quick Create Category</div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <input
                    type="text"
                    placeholder="Category Name (e.g. Travel Guides)"
                    value={newCatName}
                    onChange={(e) => {
                      setNewCatName(e.target.value);
                      setNewCatSlug(e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, ""));
                    }}
                    className="w-full bg-slate-900 border border-white/5 rounded-lg py-2 px-3 text-xs text-slate-100 focus:outline-none"
                  />
                  <input
                    type="text"
                    placeholder="Slug (e.g. travel-guides)"
                    value={newCatSlug}
                    onChange={(e) => setNewCatSlug(e.target.value)}
                    className="w-full bg-slate-900 border border-white/5 rounded-lg py-2 px-3 text-xs text-slate-100 focus:outline-none font-mono"
                  />
                </div>
                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setShowQuickCategory(false)}
                    className="text-xs text-slate-400 px-3 py-1 hover:underline"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    disabled={addingCategory}
                    onClick={handleAddCategory}
                    className="bg-accent text-slate-950 text-xs font-bold py-1 px-4 rounded-lg flex items-center gap-1"
                  >
                    {addingCategory ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : "Save"}
                  </button>
                </div>
              </div>
            )}

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Featured Image URL</label>
              <input
                type="url"
                name="featuredImage"
                value={formData.featuredImage}
                onChange={handleInputChange}
                placeholder="e.g. https://temptravels.com/images/blog/mahabaleshwar.jpg"
                className="w-full bg-slate-950/50 border border-white/10 rounded-lg py-2 px-4 text-sm text-slate-100 focus:outline-none focus:border-primary transition-all font-mono"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Summary *</label>
              <textarea
                required
                name="summary"
                rows={3}
                value={formData.summary}
                onChange={handleInputChange}
                placeholder="Write a brief, catchy summary for the listing page..."
                className="w-full bg-slate-950/50 border border-white/10 rounded-lg py-2 px-4 text-sm text-slate-100 focus:outline-none focus:border-primary transition-all resize-none"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Article Content *</label>
              <textarea
                required
                name="content"
                rows={12}
                value={formData.content}
                onChange={handleInputChange}
                placeholder="Write full HTML/markdown rich text blog content here..."
                className="w-full bg-slate-950/50 border border-white/10 rounded-lg py-2.5 px-4 text-sm text-slate-100 focus:outline-none focus:border-primary transition-all font-mono"
              />
            </div>
          </div>
        </div>

        {/* Right Sidebar (SEO & Publishing metadata) */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* Publish & Tags Card */}
          <div className="bg-slate-900/40 border border-white/5 rounded-2xl p-6 space-y-4 glassmorphism">
            <h2 className="text-md font-bold text-slate-50 border-b border-white/5 pb-2">Publish Control</h2>
            
            <div className="flex items-center justify-between py-2">
              <span className="text-sm font-semibold text-slate-300">Publish to Public</span>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  name="published"
                  checked={formData.published}
                  onChange={handleCheckboxChange}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-slate-950 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-slate-400 after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
              </label>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Tags (comma separated)</label>
              <input
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                placeholder="e.g. road-trip, travel, cabs"
                className="w-full bg-slate-950/50 border border-white/10 rounded-lg py-2 px-4 text-sm text-slate-100 focus:outline-none focus:border-primary transition-all"
              />
              <span className="block text-[10px] text-slate-500 mt-1">Separate multiple tags with a comma.</span>
            </div>
          </div>

          {/* SEO Details Card */}
          <div className="bg-slate-900/40 border border-white/5 rounded-2xl p-6 space-y-4 glassmorphism">
            <h2 className="text-md font-bold text-slate-50 border-b border-white/5 pb-2 flex items-center gap-1.5">
              <Globe className="w-4 h-4 text-accent" />
              <span>Search Engine Optimization</span>
            </h2>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">SEO Title Override</label>
              <input
                type="text"
                name="seoTitle"
                value={formData.seoTitle}
                onChange={handleInputChange}
                maxLength={70}
                placeholder="Leave blank to use article title"
                className="w-full bg-slate-950/50 border border-white/10 rounded-lg py-2 px-4 text-sm text-slate-100 focus:outline-none focus:border-primary transition-all"
              />
              <span className="block text-[10px] text-slate-500 mt-1">Ideal length: 50-60 characters. Max: 70.</span>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">SEO Meta Description</label>
              <textarea
                name="seoDescription"
                rows={3}
                value={formData.seoDescription}
                onChange={handleInputChange}
                maxLength={160}
                placeholder="Summary describing the post search listing..."
                className="w-full bg-slate-950/50 border border-white/10 rounded-lg py-2 px-4 text-sm text-slate-100 focus:outline-none focus:border-primary transition-all resize-none"
              />
              <span className="block text-[10px] text-slate-500 mt-1">Ideal length: 120-150 characters. Max: 160.</span>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">SEO Meta Keywords</label>
              <input
                type="text"
                name="seoKeywords"
                value={formData.seoKeywords}
                onChange={handleInputChange}
                placeholder="e.g. cab service mumbai, lonavala travel guide"
                className="w-full bg-slate-950/50 border border-white/10 rounded-lg py-2 px-4 text-sm text-slate-100 focus:outline-none focus:border-primary transition-all"
              />
            </div>

            <div className="bg-slate-950 border border-white/5 rounded-xl p-3 flex gap-2 text-[10px] text-slate-400">
              <Info className="w-4 h-4 text-accent shrink-0 mt-0.5" />
              <span>We inject OpenGraph, Twitter Card summary links, and Canonical values automatically based on these SEO definitions.</span>
            </div>
          </div>

          {/* Action Card */}
          <div className="space-y-3">
            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 bg-accent hover:bg-amber-600 disabled:bg-accent/50 text-slate-950 font-bold py-3 rounded-lg shadow-lg tracking-wider transition-all transform hover:-translate-y-0.5 active:translate-y-0"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Saving Article...</span>
                </>
              ) : (
                <>
                  <Save className="w-5 h-5" />
                  <span>{isEdit ? "Update Article" : "Publish Article"}</span>
                </>
              )}
            </button>
          </div>

        </div>
        
      </form>
    </div>
  );
}
