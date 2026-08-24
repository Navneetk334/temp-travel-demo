"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Calendar,
  User,
  Tag,
  Search,
  ArrowRight,
  Clock,
  BookOpen,
  Sparkles
} from "lucide-react";
import {
  DEFAULT_BLOG_POSTS,
  DEFAULT_BLOG_CATEGORIES,
  BlogPostData,
  BlogCategoryData
} from "@/lib/default-blogs";

interface BlogIndexClientProps {
  initialPosts?: any[];
  initialCategories?: any[];
  initialCategorySlug?: string;
  initialTag?: string;
  initialSearch?: string;
}

export default function BlogIndexClient({
  initialPosts = [],
  initialCategories = [],
  initialCategorySlug = "",
  initialTag = "",
  initialSearch = ""
}: BlogIndexClientProps) {
  const [posts, setPosts] = useState<any[]>(() => {
    if (initialPosts && initialPosts.length > 0) return initialPosts;
    return DEFAULT_BLOG_POSTS;
  });

  const [categories, setCategories] = useState<any[]>(() => {
    if (initialCategories && initialCategories.length > 0) return initialCategories;
    return DEFAULT_BLOG_CATEGORIES;
  });

  const [activeCategory, setActiveCategory] = useState<string>(initialCategorySlug);
  const [activeTag, setActiveTag] = useState<string>(initialTag);
  const [searchQuery, setSearchQuery] = useState<string>(initialSearch);

  // Hydrate & synchronize with localStorage (user_uploaded_blogs & user_uploaded_blog_categories)
  useEffect(() => {
    try {
      // 1. Categories sync
      const savedCats = localStorage.getItem("user_uploaded_blog_categories");
      let mergedCats: any[] = [...DEFAULT_BLOG_CATEGORIES];
      if (savedCats) {
        const parsed = JSON.parse(savedCats);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const map = new Map();
          mergedCats.forEach(c => map.set(c.slug || c.name, c));
          parsed.forEach((c: any) => map.set(c.slug || c.name, {
            ...c,
            slug: c.slug || c.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "")
          }));
          mergedCats = Array.from(map.values());
        }
      }
      setCategories(mergedCats);

      // 2. Blog posts sync
      const savedBlogs = localStorage.getItem("user_uploaded_blogs");
      let allPosts = [...DEFAULT_BLOG_POSTS];

      if (savedBlogs) {
        const parsed = JSON.parse(savedBlogs);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const map = new Map();
          // Put user uploaded / edited blogs first
          parsed.forEach((b: any) => {
            const slug = b.slug || b.title?.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "") || `post-${b.id}`;
            map.set(slug, {
              ...b,
              slug,
              categoryName: typeof b.category === "object" ? b.category?.name : (b.category || "General"),
              categorySlug: typeof b.category === "object" ? b.category?.slug : (b.category?.toLowerCase().replace(/[^a-z0-9]+/g, "-") || "general"),
              authorName: typeof b.author === "object" ? b.author?.name : (b.author || "TEMP TRAVEL Editorial Team"),
              formattedDate: b.date || b.createdAt || new Date().toISOString().slice(0, 10),
              image: b.coverImage || b.featuredImage || "/images/hero-car.png"
            });
          });

          // Add any missing default blogs
          DEFAULT_BLOG_POSTS.forEach(b => {
            if (!map.has(b.slug)) {
              map.set(b.slug, b);
            }
          });

          allPosts = Array.from(map.values());
        }
      } else {
        // First time initialization: persist defaults so admin and public stay in sync
        localStorage.setItem("user_uploaded_blogs", JSON.stringify(DEFAULT_BLOG_POSTS));
        localStorage.setItem("user_uploaded_blog_categories", JSON.stringify(DEFAULT_BLOG_CATEGORIES));
      }

      setPosts(allPosts);
    } catch (e) {
      console.error("Error syncing blogs on client:", e);
    }
  }, []);

  // Filtered list based on category, tag, search
  const filteredPosts = useMemo(() => {
    return posts.filter((post) => {
      // 1. Publication status (treat default / admin blogs as published)
      const isPublished = post.published !== false && post.status !== "DRAFT";
      if (!isPublished) return false;

      // 2. Category Match
      if (activeCategory) {
        const postCatName = (typeof post.category === "object" ? post.category?.name : post.category || "").toLowerCase();
        const postCatSlug = (typeof post.category === "object" ? post.category?.slug : post.categorySlug || postCatName.replace(/[^a-z0-9]+/g, "-")).toLowerCase();
        const target = activeCategory.toLowerCase();
        if (postCatSlug !== target && postCatName !== target && !postCatName.includes(target)) {
          return false;
        }
      }

      // 3. Tag Match
      if (activeTag) {
        const tags = Array.isArray(post.tags) ? post.tags : (post.seoKeywords ? post.seoKeywords.split(",").map((s: string) => s.trim()) : []);
        const matchesTag = tags.some((t: string) => t.toLowerCase() === activeTag.toLowerCase());
        if (!matchesTag) return false;
      }

      // 4. Search Query Match
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase().trim();
        const title = (post.title || "").toLowerCase();
        const summary = (post.summary || "").toLowerCase();
        const content = (post.content || "").toLowerCase();
        const cat = (typeof post.category === "object" ? post.category?.name : post.category || "").toLowerCase();
        if (!title.includes(query) && !summary.includes(query) && !content.includes(query) && !cat.includes(query)) {
          return false;
        }
      }

      return true;
    });
  }, [posts, activeCategory, activeTag, searchQuery]);

  return (
    <div className="space-y-12">
      {/* Blog Hero Intro */}
      <div className="text-center space-y-4 max-w-3xl mx-auto">
        <div className="inline-flex items-center gap-2 bg-amber-500/10 border border-amber-500/20 px-3.5 py-1 rounded-full text-xs font-bold text-amber-400 uppercase tracking-wider">
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          <span>TEMP TRAVEL Editorial & Insights</span>
        </div>
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-50 tracking-tight">
          Travel Logs & Corporate Mobility Insights
        </h1>
        <p className="text-slate-300 text-xs sm:text-sm leading-relaxed max-w-2xl mx-auto">
          Explore curated outstation route guides, airport terminal transfer tips, corporate employee transit solutions, and chauffeur safety advisories.
        </p>
      </div>

      {/* Filter Toolbar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/10 pb-6">
        {/* Category Tabs */}
        <div className="flex flex-wrap gap-2 text-xs font-bold">
          <button
            type="button"
            onClick={() => {
              setActiveCategory("");
              setActiveTag("");
            }}
            className={`py-2 px-4 rounded-full border transition-all cursor-pointer ${
              !activeCategory && !activeTag
                ? "bg-amber-500 text-slate-950 border-amber-400 font-black shadow-lg shadow-amber-500/20"
                : "bg-slate-900/80 border-white/10 text-slate-300 hover:text-white hover:border-white/20"
            }`}
          >
            All Articles ({posts.length})
          </button>

          {categories.map((cat) => (
            <button
              key={cat.id || cat.slug || cat.name}
              type="button"
              onClick={() => {
                setActiveCategory(cat.slug || cat.name);
                setActiveTag("");
              }}
              className={`py-2 px-4 rounded-full border transition-all cursor-pointer ${
                activeCategory === cat.slug || activeCategory === cat.name
                  ? "bg-amber-500 text-slate-950 border-amber-400 font-black shadow-lg shadow-amber-500/20"
                  : "bg-slate-900/80 border-white/10 text-slate-300 hover:text-white hover:border-white/20"
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>

        {/* Search Input */}
        <div className="relative max-w-xs w-full">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search articles, routes..."
            className="w-full bg-slate-900 border border-white/10 rounded-xl py-2 pl-10 pr-4 text-xs text-slate-100 placeholder-slate-400 focus:outline-none focus:border-amber-400 transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white text-xs font-bold"
            >
              Clear
            </button>
          )}
        </div>
      </div>

      {/* Active Filter Indicators */}
      {(activeCategory || activeTag || searchQuery) && (
        <div className="bg-slate-950 p-3.5 rounded-xl border border-amber-500/30 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex flex-wrap items-center gap-2 text-slate-300">
            <span className="text-[11px] font-bold text-amber-400 uppercase tracking-wider">Active Filter:</span>
            {activeCategory && (
              <span className="px-2.5 py-1 rounded-md bg-amber-500/10 border border-amber-500/30 text-amber-300 font-semibold text-[11px]">
                Category: {activeCategory}
              </span>
            )}
            {activeTag && (
              <span className="px-2.5 py-1 rounded-md bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 font-semibold text-[11px]">
                Tag: #{activeTag}
              </span>
            )}
            {searchQuery && (
              <span className="px-2.5 py-1 rounded-md bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 font-semibold text-[11px]">
                Search: &quot;{searchQuery}&quot;
              </span>
            )}
          </div>
          <button
            onClick={() => {
              setActiveCategory("");
              setActiveTag("");
              setSearchQuery("");
            }}
            className="text-amber-400 hover:underline font-bold text-xs cursor-pointer"
          >
            Reset Filters
          </button>
        </div>
      )}

      {/* Blog Posts Grid */}
      {filteredPosts.length === 0 ? (
        <div className="text-center py-20 bg-slate-950 border border-dashed border-white/10 rounded-3xl text-slate-400 space-y-3">
          <BookOpen className="w-10 h-10 mx-auto text-amber-400/50" />
          <div className="text-base font-bold text-slate-200">No articles matching criteria found.</div>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Try adjusting your search terms or clearing the selected category filters.
          </p>
          <button
            onClick={() => {
              setActiveCategory("");
              setActiveTag("");
              setSearchQuery("");
            }}
            className="mt-2 inline-block bg-amber-500 text-slate-950 font-black px-4 py-2 rounded-xl text-xs uppercase tracking-wider cursor-pointer"
          >
            View All Articles
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredPosts.map((post) => {
            const catName = typeof post.category === "object" ? post.category?.name : (post.category || "General");
            const authorName = typeof post.author === "object" ? post.author?.name : (post.author || "TEMP TRAVEL Editorial Team");
            const displayDate = post.date || post.createdAt?.slice(0, 10) || "Recent";
            const coverImg = post.coverImage || post.featuredImage || "/images/hero-car.png";
            const tags = Array.isArray(post.tags) ? post.tags : (post.seoKeywords ? post.seoKeywords.split(",").map((s: string) => s.trim()) : []);

            return (
              <article
                key={post.id || post.slug}
                className="bg-slate-900/60 border border-white/10 hover:border-amber-500/40 rounded-3xl overflow-hidden flex flex-col justify-between transition-all duration-300 group shadow-xl hover:shadow-amber-500/5"
              >
                <div>
                  {/* Card Thumbnail */}
                  <div className="relative h-52 bg-slate-950 overflow-hidden">
                    <img
                      src={coverImg}
                      alt={post.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-75 group-hover:opacity-90"
                    />
                    <div className="absolute top-4 left-4 bg-slate-950/90 backdrop-blur-md border border-amber-500/30 text-[10px] font-black text-amber-400 py-1 px-3 rounded-full uppercase tracking-wider shadow-md">
                      {catName}
                    </div>
                  </div>

                  {/* Card Body */}
                  <div className="p-6 space-y-3">
                    <div className="flex items-center gap-4 text-[11px] text-slate-400 font-mono">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 text-amber-400" />
                        <span>{displayDate}</span>
                      </span>
                      <span className="flex items-center gap-1">
                        <User className="w-3.5 h-3.5 text-amber-400" />
                        <span className="truncate max-w-[120px]">{authorName}</span>
                      </span>
                    </div>

                    <h3 className="text-lg font-bold text-slate-100 leading-snug group-hover:text-amber-400 transition-colors">
                      <Link href={`/blog/${post.slug}`} className="hover:underline">
                        {post.title}
                      </Link>
                    </h3>

                    <p className="text-slate-300 text-xs leading-relaxed line-clamp-3">
                      {post.summary}
                    </p>
                  </div>
                </div>

                {/* Card footer */}
                <div className="px-6 pb-6 pt-3 border-t border-white/5 flex justify-between items-center text-xs">
                  <div className="flex flex-wrap gap-1.5">
                    {tags.slice(0, 2).map((t: string) => (
                      <button
                        key={t}
                        type="button"
                        onClick={() => setActiveTag(t)}
                        className="text-slate-400 hover:text-amber-400 transition-colors bg-slate-950 border border-white/10 px-2 py-0.5 rounded-md font-mono text-[10px] cursor-pointer"
                      >
                        #{t}
                      </button>
                    ))}
                  </div>

                  <Link
                    href={`/blog/${post.slug}`}
                    className="inline-flex items-center gap-1 text-amber-400 font-black hover:text-amber-300 uppercase tracking-wider text-[11px] shrink-0 group-hover:translate-x-1 transition-transform"
                  >
                    <span>Read Article</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}
