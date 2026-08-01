"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { 
  Plus, 
  Trash2, 
  Edit, 
  BookOpen, 
  Globe, 
  Eye, 
  FileText, 
  Loader2, 
  Search,
  ChevronLeft,
  ChevronRight,
  Clock,
  CheckCircle,
  AlertCircle,
  Tag
} from "lucide-react";

export type BlogStatusFilter = "ALL" | "PUBLISHED" | "DRAFT" | "SCHEDULED";

interface Post {
  id: string;
  title: string;
  slug: string;
  summary: string;
  published: boolean;
  publishedAt?: string | null;
  tags: string[];
  author: {
    name: string;
  };
  category: {
    id: string;
    name: string;
    slug: string;
  };
  createdAt: string;
}

interface Category {
  id: string;
  name: string;
  slug: string;
}

interface Stats {
  total: number;
  PUBLISHED: number;
  DRAFT: number;
  SCHEDULED: number;
}

export default function AdminBlogPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionId, setActionId] = useState<string | null>(null);

  // Filters & Pagination State
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("");
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
    SCHEDULED: 0,
  });

  async function loadPosts() {
    setLoading(true);
    try {
      const queryParams = new URLSearchParams({
        admin: "true",
        search,
        category: categoryFilter,
        status: statusFilter,
        sortBy,
        sortOrder,
        page: currentPage.toString(),
        limit: pageSize.toString(),
      });

      const [postsRes, catsRes] = await Promise.all([
        fetch(`/api/blog/posts?${queryParams.toString()}`),
        fetch("/api/blog/categories")
      ]);

      if (postsRes.ok && catsRes.ok) {
        const postsData = await postsRes.json();
        const catsData = await catsRes.json();

        if (Array.isArray(postsData)) {
          setPosts(postsData);
          setTotalCount(postsData.length);
          setTotalPages(1);
        } else {
          setPosts(postsData.posts || []);
          setTotalCount(postsData.pagination?.totalCount || 0);
          setTotalPages(postsData.pagination?.totalPages || 1);
          if (postsData.stats) {
            setStats(postsData.stats);
          }
        }
        setCategories(catsData);
      }
    } catch (err) {
      console.error("Failed to load admin blog posts:", err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadPosts();
  }, [search, categoryFilter, statusFilter, sortBy, sortOrder, currentPage, pageSize]);

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this blog post?")) {
      return;
    }
    setActionId(id);
    try {
      const res = await fetch(`/api/blog/posts/${id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        loadPosts();
      } else {
        const data = await res.json();
        alert(data.error || "Failed to delete blog post");
      }
    } catch (err) {
      alert("Error deleting blog post");
    } finally {
      setActionId(null);
    }
  };

  const handleTogglePublish = async (post: Post) => {
    setActionId(post.id);
    try {
      const detailRes = await fetch(`/api/blog/posts/${post.id}`);
      if (!detailRes.ok) throw new Error("Failed to fetch article details");
      const currentDetails = await detailRes.json();

      const updatedDetails = {
        title: currentDetails.title,
        slug: currentDetails.slug,
        summary: currentDetails.summary,
        content: currentDetails.content,
        featuredImage: currentDetails.featuredImage,
        published: !post.published,
        publishedAt: currentDetails.publishedAt,
        categoryId: currentDetails.categoryId,
        tags: currentDetails.tags,
        seoTitle: currentDetails.seoTitle,
        seoDescription: currentDetails.seoDescription,
        seoKeywords: currentDetails.seoKeywords,
      };

      const res = await fetch(`/api/blog/posts/${post.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedDetails),
      });

      if (res.ok) {
        loadPosts();
      } else {
        alert("Failed to toggle publish status");
      }
    } catch (err) {
      console.error("Error toggling status:", err);
    } finally {
      setActionId(null);
    }
  };

  const getPostStatusBadge = (post: Post) => {
    if (!post.published) {
      return (
        <span className="bg-yellow-500/10 text-yellow-400 border border-yellow-500/20 text-[9px] font-bold px-2 py-0.5 rounded-full uppercase">
          DRAFT
        </span>
      );
    }
    if (post.publishedAt && new Date(post.publishedAt) > new Date()) {
      return (
        <span className="bg-blue-500/20 text-blue-300 border border-blue-500/40 text-[9px] font-extrabold px-2 py-0.5 rounded-full uppercase flex items-center gap-1">
          <Clock className="w-2.5 h-2.5" />
          <span>SCHEDULED</span>
        </span>
      );
    }
    return (
      <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[9px] font-extrabold px-2 py-0.5 rounded-full uppercase">
        PUBLISHED
      </span>
    );
  };

  return (
    <div className="bg-slate-950 min-h-screen text-slate-100 p-8 space-y-8">
      
      {/* Title Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-white/5 pb-6 gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-50 tracking-tight flex items-center gap-2.5">
            <BookOpen className="w-8 h-8 text-accent" />
            <span>Blog CMS & Content Management</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Manage travel articles, news updates, rich text formatting, tags, categories, scheduled publishing, and SEO search tags.
          </p>
        </div>
        <Link
          href="/admin/blog/new"
          className="flex items-center gap-1.5 bg-accent hover:bg-yellow-500 text-slate-950 font-extrabold py-2.5 px-6 rounded-lg text-xs tracking-wider uppercase transition-all shadow-lg"
        >
          <Plus className="w-4 h-4" />
          <span>Write New Article</span>
        </Link>
      </div>

      {/* Article Status Counters Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div 
          onClick={() => { setStatusFilter(""); setCurrentPage(1); }}
          className={`glassmorphism p-4 rounded-xl border cursor-pointer transition-all ${
            statusFilter === "" ? "border-accent bg-accent/10" : "border-white/5 hover:border-white/20"
          }`}
        >
          <div className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Total Articles</div>
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
          <div className="text-[10px] text-yellow-400 uppercase font-bold tracking-wider">DRAFT ARTICLES</div>
          <div className="text-2xl font-black text-yellow-400 mt-1">{stats.DRAFT}</div>
        </div>

        <div 
          onClick={() => { setStatusFilter("SCHEDULED"); setCurrentPage(1); }}
          className={`glassmorphism p-4 rounded-xl border cursor-pointer transition-all ${
            statusFilter === "SCHEDULED" ? "border-blue-400 bg-blue-500/10" : "border-white/5 hover:border-white/20"
          }`}
        >
          <div className="text-[10px] text-blue-400 uppercase font-bold tracking-wider">SCHEDULED</div>
          <div className="text-2xl font-black text-blue-400 mt-1">{stats.SCHEDULED}</div>
        </div>
      </div>

      {/* Filter & Control Toolbar */}
      <div className="glassmorphism p-6 rounded-xl border border-white/5 flex flex-col md:flex-row gap-4 items-center justify-between">
        
        {/* Search */}
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search article title, content, summary..."
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
              <option key={c.id} value={c.slug} className="bg-slate-900">{c.name}</option>
            ))}
          </select>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1); }}
            className="bg-slate-950/60 border border-white/10 rounded-lg py-2 px-3 text-xs text-slate-100 focus:outline-none focus:border-accent"
          >
            <option value="" className="bg-slate-900">All Statuses</option>
            <option value="PUBLISHED" className="bg-slate-900 text-emerald-400">PUBLISHED</option>
            <option value="DRAFT" className="bg-slate-900 text-yellow-400">DRAFT</option>
            <option value="SCHEDULED" className="bg-slate-900 text-blue-400">SCHEDULED</option>
          </select>

          {/* Sort By */}
          <select
            value={sortBy}
            onChange={(e) => { setSortBy(e.target.value); setCurrentPage(1); }}
            className="bg-slate-950/60 border border-white/10 rounded-lg py-2 px-3 text-xs text-slate-100 focus:outline-none focus:border-accent"
          >
            <option value="createdAt" className="bg-slate-900">Sort by Date</option>
            <option value="title" className="bg-slate-900">Sort by Title</option>
          </select>

          {/* Sort Order */}
          <button
            onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
            className="bg-slate-950/60 border border-white/10 rounded-lg py-2 px-3 text-xs font-semibold text-slate-300 hover:text-slate-100 transition-colors"
          >
            {sortOrder === "desc" ? "↓ Newest" : "↑ Oldest"}
          </button>
        </div>

      </div>

      {/* Blog Articles Table Grid */}
      <div className="glassmorphism rounded-xl border border-white/5 overflow-hidden flex flex-col">
        {loading ? (
          <div className="text-center py-16 text-slate-400 text-xs">Loading blog articles...</div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-900 border-b border-white/5 text-slate-400 font-semibold uppercase tracking-wider">
                    <th className="p-4">Article Title & Slug</th>
                    <th className="p-4">Category & Tags</th>
                    <th className="p-4">Author & Date</th>
                    <th className="p-4">Status</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {posts.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="text-center py-16 text-slate-500 italic">
                        No blog posts matching selected criteria found.
                      </td>
                    </tr>
                  ) : (
                    posts.map((post) => (
                      <tr key={post.id} className="hover:bg-white/5 transition-colors">
                        <td className="p-4">
                          <div className="font-bold text-slate-100 text-sm">
                            {post.title}
                          </div>
                          <div className="text-slate-400 font-mono text-[11px] mt-0.5">
                            /{post.slug}
                          </div>
                        </td>
                        <td className="p-4">
                          <div className="font-bold text-slate-200">{post.category?.name || "Uncategorized"}</div>
                          {post.tags && post.tags.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-1">
                              {post.tags.slice(0, 3).map((t, i) => (
                                <span key={i} className="text-[9px] bg-slate-900 border border-white/10 text-slate-400 px-1.5 py-0.5 rounded">
                                  #{t}
                                </span>
                              ))}
                            </div>
                          )}
                        </td>
                        <td className="p-4">
                          <div className="text-slate-200 font-bold">{post.author?.name || "Admin"}</div>
                          <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                            {post.publishedAt 
                              ? new Date(post.publishedAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })
                              : new Date(post.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })
                            }
                          </div>
                        </td>
                        <td className="p-4">
                          {getPostStatusBadge(post)}
                        </td>
                        <td className="p-4 text-right space-x-2">
                          <button
                            disabled={actionId === post.id}
                            onClick={() => handleTogglePublish(post)}
                            className="p-1.5 bg-slate-900 border border-white/5 rounded-lg text-slate-400 hover:text-emerald-400 transition-colors disabled:opacity-50"
                            title={post.published ? "Unpublish to Draft" : "Publish Article"}
                          >
                            {actionId === post.id ? (
                              <Loader2 className="w-4 h-4 animate-spin text-accent" />
                            ) : post.published ? (
                              <CheckCircle className="w-4 h-4 text-emerald-400" />
                            ) : (
                              <FileText className="w-4 h-4 text-yellow-400" />
                            )}
                          </button>

                          <Link
                            href={`/admin/blog/${post.id}/edit`}
                            className="p-1.5 bg-slate-900 border border-white/5 rounded-lg text-slate-400 hover:text-accent transition-colors inline-block"
                            title="Edit Article"
                          >
                            <Edit className="w-4 h-4" />
                          </Link>

                          <button
                            disabled={actionId === post.id}
                            onClick={() => handleDelete(post.id)}
                            className="p-1.5 bg-slate-900 border border-white/5 rounded-lg text-slate-400 hover:text-red-400 transition-colors disabled:opacity-50"
                            title="Delete Article"
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
                Showing <span className="font-bold text-slate-200">{totalCount > 0 ? (currentPage - 1) * pageSize + 1 : 0}</span> to <span className="font-bold text-slate-200">{Math.min(currentPage * pageSize, totalCount)}</span> of <span className="font-bold text-slate-200">{totalCount}</span> blog articles
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

    </div>
  );
}
