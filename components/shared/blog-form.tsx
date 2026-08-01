"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { 
  Loader2, 
  Plus, 
  ArrowLeft, 
  Save, 
  Globe, 
  Info,
  Heading1,
  Heading2,
  Heading3,
  Bold,
  Italic,
  List,
  Quote,
  Link as LinkIcon,
  Image as ImageIcon,
  Calendar,
  Tag,
  CheckCircle,
  Clock
} from "lucide-react";

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
  publishedAt?: string | null;
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
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  
  // Format publishedAt for datetime-local input
  const formatDateTimeLocal = (dateStr?: string | Date | null) => {
    if (!dateStr) return "";
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return "";
    const pad = (n: number) => (n < 10 ? "0" + n : n);
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
  };

  const [formData, setFormData] = useState<BlogPostInput>({
    title: initialData?.title || "",
    slug: initialData?.slug || "",
    summary: initialData?.summary || "",
    content: initialData?.content || "",
    featuredImage: initialData?.featuredImage || "",
    published: initialData?.published || false,
    publishedAt: formatDateTimeLocal(initialData?.publishedAt),
    categoryId: initialData?.categoryId || "",
    tags: initialData?.tags || [],
    seoTitle: initialData?.seoTitle || "",
    seoDescription: initialData?.seoDescription || "",
    seoKeywords: initialData?.seoKeywords || "",
  });

  const [categories, setCategories] = useState<Category[]>([]);
  const [tagInput, setTagInput] = useState(initialData?.tags ? initialData.tags.join(", ") : "");
  const [loading, setLoading] = useState(false);
  const [fetchingCategories, setFetchingCategories] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Quick Category Add State
  const [showQuickCategory, setShowQuickCategory] = useState(false);
  const [newCatName, setNewCatName] = useState("");
  const [newCatSlug, setNewCatSlug] = useState("");
  const [addingCategory, setAddingCategory] = useState(false);

  useEffect(() => {
    async function loadCategories() {
      try {
        const res = await fetch("/api/blog/categories");
        if (res.ok) {
          const data = await res.json();
          setCategories(data);
          if (data.length > 0 && !formData.categoryId && !initialData?.categoryId) {
            setFormData(prev => ({ ...prev, categoryId: data[0].id }));
          }
        }
      } catch (err) {
        console.error("Failed to load categories:", err);
      } finally {
        setFetchingCategories(false);
      }
    }
    loadCategories();
  }, []);

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

  // Rich Text Formatting Injection Toolbar
  const insertFormatting = (tagStart: string, tagEnd: string = "") => {
    if (!textareaRef.current) return;
    const textarea = textareaRef.current;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = formData.content;

    const selected = text.substring(start, end);
    const replacement = `${tagStart}${selected || "Sample Text"}${tagEnd}`;
    const newText = text.substring(0, start) + replacement + text.substring(end);

    setFormData(prev => ({ ...prev, content: newText }));
    
    // Defer focus & selection restore
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + tagStart.length, start + tagStart.length + (selected || "Sample Text").length);
    }, 0);
  };

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

    const tagsArray = tagInput
      .split(",")
      .map((t) => t.trim().toLowerCase())
      .filter((t) => t.length > 0);

    const payload = {
      ...formData,
      tags: tagsArray,
      featuredImage: formData.featuredImage.trim() || null,
      publishedAt: formData.publishedAt ? new Date(formData.publishedAt).toISOString() : null,
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
      
      {/* Top Navigation Row */}
      <div className="flex justify-between items-center">
        <button
          type="button"
          onClick={() => router.push("/admin/blog")}
          className="flex items-center gap-2 text-xs font-bold text-slate-400 hover:text-slate-200 transition-colors uppercase tracking-wider"
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
        
        {/* Left Column (Content & Formatting Editor) */}
        <div className="lg:col-span-8 space-y-6">
          <div className="bg-slate-900/40 border border-white/5 rounded-2xl p-6 space-y-4 glassmorphism">
            <h2 className="text-lg font-bold text-slate-50 border-b border-white/5 pb-2">Article Specifications & Content</h2>
            
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Article Title *</label>
              <input
                type="text"
                required
                name="title"
                value={formData.title}
                onChange={handleTitleChange}
                placeholder="e.g. Top 10 Scenic Road Trips from Pune in Car Rentals"
                className="w-full bg-slate-950/50 border border-white/10 rounded-lg py-2.5 px-4 text-sm text-slate-100 focus:outline-none focus:border-accent transition-all font-semibold"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">URL Slug Path *</label>
                <input
                  type="text"
                  required
                  name="slug"
                  value={formData.slug}
                  onChange={handleInputChange}
                  placeholder="scenic-road-trips-pune"
                  className="w-full bg-slate-950/50 border border-white/10 rounded-lg py-2 px-4 text-xs text-slate-100 focus:outline-none focus:border-accent transition-all font-mono"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Category *</label>
                {fetchingCategories ? (
                  <div className="text-xs text-slate-500 py-2">Loading categories...</div>
                ) : (
                  <div className="flex gap-2">
                    <select
                      required
                      name="categoryId"
                      value={formData.categoryId}
                      onChange={handleInputChange}
                      className="w-full bg-slate-950/50 border border-white/10 rounded-lg py-2 px-3 text-xs text-slate-100 focus:outline-none focus:border-accent"
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
                      className="bg-slate-950 border border-white/10 hover:border-accent p-2 rounded-lg text-slate-400 hover:text-accent transition-colors"
                      title="Add category inline"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Quick Category Add */}
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

            {/* Featured Image & Thumbnail Preview */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Featured Image URL</label>
              <div className="flex flex-col sm:flex-row gap-3">
                <input
                  type="url"
                  name="featuredImage"
                  value={formData.featuredImage}
                  onChange={handleInputChange}
                  placeholder="https://images.unsplash.com/photo-..."
                  className="w-full bg-slate-950/50 border border-white/10 rounded-lg py-2 px-4 text-xs text-slate-100 focus:outline-none focus:border-accent font-mono"
                />
              </div>
              {formData.featuredImage.trim() && (
                <div className="relative rounded-xl overflow-hidden border border-white/10 h-40 bg-slate-950 max-w-sm mt-2">
                  <img
                    src={formData.featuredImage}
                    alt="Featured Image Preview"
                    className="w-full h-full object-cover"
                    onError={(e) => { (e.target as HTMLElement).style.display = 'none'; }}
                  />
                </div>
              )}
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Summary / Excerpt *</label>
              <textarea
                required
                name="summary"
                rows={3}
                value={formData.summary}
                onChange={handleInputChange}
                placeholder="Write a catchy 2-3 sentence article summary for search cards..."
                className="w-full bg-slate-950/50 border border-white/10 rounded-lg py-2 px-4 text-xs text-slate-100 focus:outline-none focus:border-accent transition-all resize-none"
              />
            </div>

            {/* Rich Text Editor Section */}
            <div className="space-y-2">
              <div className="flex items-center justify-between border-b border-white/5 pb-2">
                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Article Content *</label>
                <div className="text-[10px] text-accent font-mono font-bold">Rich Text HTML Editor</div>
              </div>

              {/* Formatting Toolbar */}
              <div className="bg-slate-950 p-2 rounded-t-xl border border-white/10 border-b-0 flex flex-wrap items-center gap-1.5 text-xs text-slate-300">
                <button
                  type="button"
                  onClick={() => insertFormatting("<h2>", "</h2>")}
                  className="p-1.5 bg-slate-900 border border-white/5 hover:border-accent rounded text-slate-300 hover:text-white font-bold"
                  title="Heading 2"
                >
                  <Heading2 className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => insertFormatting("<h3>", "</h3>")}
                  className="p-1.5 bg-slate-900 border border-white/5 hover:border-accent rounded text-slate-300 hover:text-white font-bold"
                  title="Heading 3"
                >
                  <Heading3 className="w-3.5 h-3.5" />
                </button>
                <div className="h-4 w-px bg-white/10 mx-1" />
                <button
                  type="button"
                  onClick={() => insertFormatting("<b>", "</b>")}
                  className="p-1.5 bg-slate-900 border border-white/5 hover:border-accent rounded text-slate-300 hover:text-white"
                  title="Bold"
                >
                  <Bold className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => insertFormatting("<i>", "</i>")}
                  className="p-1.5 bg-slate-900 border border-white/5 hover:border-accent rounded text-slate-300 hover:text-white"
                  title="Italic"
                >
                  <Italic className="w-3.5 h-3.5" />
                </button>
                <div className="h-4 w-px bg-white/10 mx-1" />
                <button
                  type="button"
                  onClick={() => insertFormatting("<ul>\n  <li>", "</li>\n</ul>")}
                  className="p-1.5 bg-slate-900 border border-white/5 hover:border-accent rounded text-slate-300 hover:text-white"
                  title="Bullet List"
                >
                  <List className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => insertFormatting("<blockquote>", "</blockquote>")}
                  className="p-1.5 bg-slate-900 border border-white/5 hover:border-accent rounded text-slate-300 hover:text-white"
                  title="Blockquote"
                >
                  <Quote className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => insertFormatting('<a href="https://temptravels.com">', '</a>')}
                  className="p-1.5 bg-slate-900 border border-white/5 hover:border-accent rounded text-slate-300 hover:text-white"
                  title="Insert Link"
                >
                  <LinkIcon className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => insertFormatting('<img src="https://images.unsplash.com/photo-..." alt="Image description" className="rounded-xl w-full my-4" />')}
                  className="p-1.5 bg-slate-900 border border-white/5 hover:border-accent rounded text-slate-300 hover:text-white"
                  title="Embed Image"
                >
                  <ImageIcon className="w-3.5 h-3.5" />
                </button>
              </div>

              <textarea
                ref={textareaRef}
                required
                name="content"
                rows={14}
                value={formData.content}
                onChange={handleInputChange}
                placeholder="Write full HTML/rich text article content..."
                className="w-full bg-slate-950/50 border border-white/10 rounded-b-xl py-3 px-4 text-xs text-slate-100 focus:outline-none focus:border-accent transition-all font-mono leading-relaxed resize-y"
              />
            </div>

          </div>
        </div>

        {/* Right Column (Publishing, Scheduled Date, SEO) */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* Publishing & Scheduled Date Card */}
          <div className="bg-slate-900/40 border border-white/5 rounded-2xl p-6 space-y-4 glassmorphism">
            <h2 className="text-md font-bold text-slate-50 border-b border-white/5 pb-2 flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-accent" />
              <span>Publish & Scheduling</span>
            </h2>
            
            <div className="flex items-center justify-between py-2 border-b border-white/5">
              <span className="text-xs font-bold text-slate-200">Publish Article</span>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  name="published"
                  checked={formData.published}
                  onChange={handleCheckboxChange}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-slate-950 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-slate-400 after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
              </label>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">Scheduled Publish Date & Time</label>
              <input
                type="datetime-local"
                name="publishedAt"
                value={formData.publishedAt || ""}
                onChange={handleInputChange}
                className="w-full bg-slate-950/50 border border-white/10 rounded-lg py-2 px-3 text-xs text-slate-100 focus:outline-none focus:border-accent transition-all font-mono"
              />
              <span className="block text-[10px] text-slate-500 mt-1">Leave blank to publish immediately upon saving.</span>
            </div>

            <div className="space-y-1 pt-2">
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">Tags (Comma Separated)</label>
              <input
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                placeholder="e.g. car-rentals, travel-tips, pune-cab"
                className="w-full bg-slate-950/50 border border-white/10 rounded-lg py-2 px-3 text-xs text-slate-100 focus:outline-none focus:border-accent transition-all"
              />
              {tagInput && (
                <div className="flex flex-wrap gap-1 mt-2">
                  {tagInput.split(",").map((t, idx) => {
                    const tagClean = t.trim();
                    if (!tagClean) return null;
                    return (
                      <span key={idx} className="text-[9px] bg-accent/10 border border-accent/20 text-accent font-bold px-2 py-0.5 rounded-full">
                        #{tagClean}
                      </span>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* SEO Metadata Card */}
          <div className="bg-slate-900/40 border border-white/5 rounded-2xl p-6 space-y-4 glassmorphism">
            <h2 className="text-md font-bold text-slate-50 border-b border-white/5 pb-2 flex items-center gap-1.5">
              <Globe className="w-4 h-4 text-accent" />
              <span>SEO Search Meta Tags</span>
            </h2>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">SEO Title Override</label>
              <input
                type="text"
                name="seoTitle"
                value={formData.seoTitle}
                onChange={handleInputChange}
                maxLength={70}
                placeholder="Max 70 chars"
                className="w-full bg-slate-950/50 border border-white/10 rounded-lg py-2 px-3 text-xs text-slate-100 focus:outline-none focus:border-accent transition-all"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">SEO Meta Description</label>
              <textarea
                name="seoDescription"
                rows={3}
                value={formData.seoDescription}
                onChange={handleInputChange}
                maxLength={160}
                placeholder="Max 160 chars summary for search engines..."
                className="w-full bg-slate-950/50 border border-white/10 rounded-lg py-2 px-3 text-xs text-slate-100 focus:outline-none focus:border-accent transition-all resize-none"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">SEO Meta Keywords</label>
              <input
                type="text"
                name="seoKeywords"
                value={formData.seoKeywords}
                onChange={handleInputChange}
                placeholder="e.g. cab service, travel guide"
                className="w-full bg-slate-950/50 border border-white/10 rounded-lg py-2 px-3 text-xs text-slate-100 focus:outline-none focus:border-accent transition-all"
              />
            </div>
          </div>

          {/* Submit Action */}
          <div>
            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 bg-accent hover:bg-yellow-500 disabled:bg-accent/50 text-slate-950 font-black py-3 rounded-xl shadow-lg uppercase tracking-wider text-xs transition-all"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Saving Article...</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
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
