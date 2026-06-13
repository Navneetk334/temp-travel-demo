"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Plus, Trash2, Edit, BookOpen, Globe, Eye, FileText, Loader2, ToggleLeft } from "lucide-react";

interface Post {
  id: string;
  title: string;
  slug: string;
  summary: string;
  published: boolean;
  publishedAt?: string | null;
  author: {
    name: string;
  };
  category: {
    name: string;
  };
}

export default function AdminBlogPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionId, setActionId] = useState<string | null>(null);

  async function loadPosts() {
    setLoading(true);
    try {
      const res = await fetch("/api/blog/posts?admin=true");
      if (res.ok) {
        const data = await res.json();
        setPosts(data);
      }
    } catch (err) {
      console.error("Failed to load blog posts:", err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadPosts();
  }, []);

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
        setPosts((prev) => prev.filter((p) => p.id !== id));
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
      // Fetch post full details first or make partial update.
      // Since our PUT endpoint expects the complete validated body, we fetch the post, toggle published, and PUT it back.
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
        setPosts((prev) =>
          prev.map((p) =>
            p.id === post.id
              ? {
                  ...p,
                  published: !post.published,
                  publishedAt: !post.published ? new Date().toISOString() : null,
                }
              : p
          )
        );
      } else {
        const data = await res.json();
        alert(data.error || "Failed to toggle publish status");
      }
    } catch (err: any) {
      alert(err.message || "Error toggling publish status");
    } finally {
      setActionId(null);
    }
  };

  return (
    <div className="bg-slate-950 min-h-screen text-slate-100 p-8 space-y-8">
      {/* Title Header */}
      <div className="flex justify-between items-center border-b border-white/5 pb-6">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-50 tracking-tight flex items-center gap-2.5">
            <BookOpen className="w-8 h-8 text-accent" />
            <span>Blog Posts CMS</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">Write road travel guides, corporate updates, and optimize your web search presence.</p>
        </div>
        <Link
          href="/admin/blog/new"
          className="flex items-center gap-1.5 bg-primary hover:bg-blue-700 text-white font-bold py-2.5 px-6 rounded-lg text-sm tracking-wide transition-all shadow-lg border border-white/10"
        >
          <Plus className="w-4 h-4" />
          <span>Write Post</span>
        </Link>
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-20 text-slate-400 gap-2">
          <Loader2 className="w-6 h-6 animate-spin text-accent" />
          <span>Loading articles...</span>
        </div>
      ) : posts.length === 0 ? (
        <div className="text-center py-20 bg-slate-900/20 border border-dashed border-white/5 rounded-xl text-slate-500">
          No blog posts found. Click "Write Post" to compose your first article.
        </div>
      ) : (
        <div className="glassmorphism rounded-xl border border-white/5 overflow-hidden">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="bg-slate-900 border-b border-white/5 text-slate-400 text-xs font-semibold uppercase tracking-wider">
                <th className="p-4">Blog Post Title</th>
                <th className="p-4">Author</th>
                <th className="p-4">Category</th>
                <th className="p-4">Publish Date</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {posts.map((p) => (
                <tr key={p.id} className="hover:bg-white/5 transition-colors">
                  <td className="p-4">
                    <div className="font-bold text-slate-200">{p.title}</div>
                    <div className="text-xs text-slate-500 mt-0.5">/{p.slug}</div>
                  </td>
                  <td className="p-4 text-slate-300">{p.author?.name || "Publisher"}</td>
                  <td className="p-4 text-xs font-semibold text-slate-400">{p.category?.name}</td>
                  <td className="p-4 text-xs text-slate-500">
                    {p.publishedAt ? new Date(p.publishedAt).toLocaleDateString() : "--"}
                  </td>
                  <td className="p-4">
                    {actionId === p.id ? (
                      <Loader2 className="w-4 h-4 animate-spin text-accent" />
                    ) : (
                      <button
                        onClick={() => handleTogglePublish(p)}
                        className={`text-[10px] font-bold py-1 px-3 rounded-full border transition-all ${
                          p.published
                            ? "bg-green-500/10 text-green-400 border-green-500/20 hover:bg-green-500/20"
                            : "bg-yellow-500/10 text-yellow-400 border-yellow-500/20 hover:bg-yellow-500/20"
                        }`}
                      >
                        {p.published ? "PUBLISHED" : "DRAFT"}
                      </button>
                    )}
                  </td>
                  <td className="p-4 text-right space-x-2">
                    <Link
                      href={`/blog/${p.slug}`}
                      target="_blank"
                      className="inline-flex p-2 bg-slate-900 border border-white/5 rounded-lg text-slate-400 hover:text-accent transition-colors"
                      title="Preview article"
                    >
                      <Eye className="w-4 h-4" />
                    </Link>
                    <Link
                      href={`/admin/blog/${p.id}/edit`}
                      className="inline-flex p-2 bg-slate-900 border border-white/5 rounded-lg text-slate-400 hover:text-accent transition-colors"
                      title="Edit article"
                    >
                      <Edit className="w-4 h-4" />
                    </Link>
                    <button
                      onClick={() => handleDelete(p.id)}
                      disabled={actionId === p.id}
                      className="inline-flex p-2 bg-slate-900 border border-white/5 rounded-lg text-slate-400 hover:text-destructive transition-colors disabled:opacity-50"
                      title="Delete article"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
