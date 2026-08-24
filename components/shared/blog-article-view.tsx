"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Calendar,
  User,
  Tag,
  ArrowLeft,
  BookOpen,
  Share2,
  Clock,
  Check,
  Sparkles,
  PhoneCall
} from "lucide-react";
import { DEFAULT_BLOG_POSTS, BlogPostData } from "@/lib/default-blogs";

interface BlogArticleViewProps {
  initialPost: any;
  slug: string;
  relatedPosts?: any[];
}

export default function BlogArticleView({
  initialPost,
  slug,
  relatedPosts = []
}: BlogArticleViewProps) {
  const [post, setPost] = useState<any>(initialPost);
  const [copied, setCopied] = useState(false);

  // Client-side fallback to check localStorage for dynamic admin blogs
  useEffect(() => {
    if (!post) {
      try {
        const savedBlogs = localStorage.getItem("user_uploaded_blogs");
        if (savedBlogs) {
          const parsed = JSON.parse(savedBlogs);
          if (Array.isArray(parsed)) {
            const found = parsed.find(
              (p: any) => p.slug === slug || p.id === slug
            );
            if (found) {
              setPost(found);
              return;
            }
          }
        }
      } catch (e) {
        console.error(e);
      }

      const defaultMatch = DEFAULT_BLOG_POSTS.find((p) => p.slug === slug);
      if (defaultMatch) {
        setPost(defaultMatch);
      }
    }
  }, [post, slug]);

  const handleShare = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    }
  };

  if (!post) {
    return (
      <div className="max-w-3xl mx-auto py-24 text-center space-y-4">
        <div className="w-16 h-16 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center mx-auto">
          <BookOpen className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-bold text-slate-100">Article Loading or Not Found</h2>
        <p className="text-xs text-slate-400 max-w-md mx-auto">
          The requested article may have been moved or updated. You can explore our complete collection of travel articles.
        </p>
        <Link
          href="/blog"
          className="inline-block bg-amber-500 hover:bg-amber-400 text-slate-950 font-black px-6 py-2.5 rounded-xl text-xs uppercase tracking-wider transition-all"
        >
          Return to Blog Directory
        </Link>
      </div>
    );
  }

  const catName = typeof post.category === "object" ? post.category?.name : (post.category || "Travel Guide");
  const catSlug = typeof post.category === "object" ? post.category?.slug : (post.categorySlug || catName.toLowerCase().replace(/[^a-z0-9]+/g, "-"));
  const authorName = typeof post.author === "object" ? post.author?.name : (post.author || "TEMP TRAVEL Editorial Team");
  const displayDate = post.date || post.publishedAt?.slice(0, 10) || post.createdAt?.slice(0, 10) || "August 2026";
  const coverImg = post.coverImage || post.featuredImage || "/images/hero-car.png";
  const tags = Array.isArray(post.tags) ? post.tags : (post.seoKeywords ? post.seoKeywords.split(",").map((s: string) => s.trim()) : []);

  // Compute related articles from default/server list
  const effectiveRelated = (relatedPosts && relatedPosts.length > 0)
    ? relatedPosts
    : DEFAULT_BLOG_POSTS.filter((p) => p.slug !== post.slug).slice(0, 2);

  return (
    <main className="max-w-4xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-10">
      {/* Back button & Action Toolbar */}
      <div className="flex justify-between items-center">
        <Link
          href="/blog"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-400 hover:text-amber-400 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to All Publications</span>
        </Link>

        <button
          onClick={handleShare}
          className="inline-flex items-center gap-1.5 text-xs font-bold bg-slate-900 border border-white/10 hover:border-amber-400 text-slate-300 hover:text-white px-3.5 py-1.5 rounded-xl transition-all cursor-pointer"
        >
          {copied ? (
            <>
              <Check className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-emerald-400 font-bold">Link Copied!</span>
            </>
          ) : (
            <>
              <Share2 className="w-3.5 h-3.5 text-amber-400" />
              <span>Share Article</span>
            </>
          )}
        </button>
      </div>

      {/* Article Header */}
      <header className="space-y-6">
        <div className="flex flex-wrap items-center gap-3">
          <Link
            href={`/blog?category=${catSlug}`}
            className="inline-block bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-black py-1 px-3.5 rounded-full uppercase tracking-wider hover:bg-amber-500/20 transition-colors"
          >
            {catName}
          </Link>
          {post.readTime && (
            <span className="text-slate-400 text-xs font-mono flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-slate-500" />
              <span>{post.readTime}</span>
            </span>
          )}
        </div>

        <h1 className="text-2xl sm:text-4xl md:text-5xl font-black text-slate-50 tracking-tight leading-tight">
          {post.title}
        </h1>

        {/* Author and Date Meta */}
        <div className="flex flex-wrap gap-6 items-center text-xs text-slate-400 font-mono uppercase tracking-wider border-y border-white/10 py-4">
          <span className="flex items-center gap-2">
            <User className="w-4 h-4 text-amber-400" />
            <span>Author: <strong className="text-slate-200">{authorName}</strong></span>
          </span>
          <span className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-amber-400" />
            <span>Published: <strong className="text-slate-200">{displayDate}</strong></span>
          </span>
        </div>
      </header>

      {/* Featured Cover Image */}
      <div className="relative h-[250px] sm:h-[420px] bg-slate-950 border border-white/10 rounded-3xl overflow-hidden shadow-2xl">
        <img
          src={coverImg}
          alt={post.title}
          className="w-full h-full object-cover opacity-85"
        />
      </div>

      {/* Article Body Content */}
      <div className="space-y-6 text-slate-200 text-sm sm:text-base leading-relaxed">
        {/* Summary Lead Block */}
        {post.summary && (
          <div className="bg-slate-900/80 border-l-4 border-amber-400 p-6 rounded-r-2xl text-slate-200 text-sm md:text-base leading-relaxed font-medium shadow-lg">
            &ldquo;{post.summary}&rdquo;
          </div>
        )}

        {/* Content body rendered with clean markdown-like paragraph splits */}
        <div className="space-y-5">
          {post.content ? (
            post.content.split("\n\n").map((para: string, idx: number) => {
              const trimmed = para.trim();
              if (trimmed.startsWith("### ")) {
                return (
                  <h3 key={idx} className="text-xl font-black text-amber-400 pt-4 pb-1">
                    {trimmed.replace(/^###\s+/, "")}
                  </h3>
                );
              }
              if (trimmed.startsWith("## ")) {
                return (
                  <h2 key={idx} className="text-2xl font-black text-slate-50 pt-6 pb-2 border-b border-white/10">
                    {trimmed.replace(/^##\s+/, "")}
                  </h2>
                );
              }
              if (trimmed.startsWith("---")) {
                return <hr key={idx} className="border-white/10 my-6" />;
              }
              if (trimmed.startsWith("- ") || trimmed.startsWith("* ")) {
                const items = trimmed.split("\n").filter(Boolean);
                return (
                  <ul key={idx} className="list-disc list-inside space-y-1.5 pl-2 text-slate-300 text-sm">
                    {items.map((it, i) => (
                      <li key={i}>{it.replace(/^[-*]\s+/, "")}</li>
                    ))}
                  </ul>
                );
              }
              if (/^\d+\.\s+/.test(trimmed)) {
                const items = trimmed.split("\n").filter(Boolean);
                return (
                  <ol key={idx} className="list-decimal list-inside space-y-1.5 pl-2 text-slate-300 text-sm">
                    {items.map((it, i) => (
                      <li key={i}>{it.replace(/^\d+\.\s+/, "")}</li>
                    ))}
                  </ol>
                );
              }
              return (
                <p key={idx} className="text-slate-300 leading-relaxed text-sm sm:text-base">
                  {trimmed}
                </p>
              );
            })
          ) : (
            <p className="text-slate-400 italic">Content not available.</p>
          )}
        </div>
      </div>

      {/* Tags List */}
      {tags.length > 0 && (
        <div className="flex flex-wrap gap-2 pt-6 border-t border-white/10 items-center text-xs">
          <span className="text-slate-400 font-bold uppercase tracking-wider mr-1">
            <Tag className="w-3.5 h-3.5 inline mr-1 text-amber-400" />
            Article Tags:
          </span>
          {tags.map((t: string) => (
            <Link
              key={t}
              href={`/blog?tag=${t}`}
              className="bg-slate-900 hover:bg-amber-500/20 border border-white/10 hover:border-amber-400/40 text-slate-300 hover:text-amber-300 font-mono py-1 px-3 rounded-lg transition-all"
            >
              #{t}
            </Link>
          ))}
        </div>
      )}

      {/* Ride Booking Call to Action Banner */}
      <div className="bg-gradient-to-r from-amber-500/10 via-slate-900 to-amber-500/10 border border-amber-500/30 rounded-3xl p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-2xl">
        <div className="space-y-2 text-center sm:text-left">
          <div className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-400 uppercase tracking-wider">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span>Ready for your Journey?</span>
          </div>
          <h3 className="text-xl sm:text-2xl font-black text-slate-50">
            Book a Verified Chauffeur-Driven Cab Today
          </h3>
          <p className="text-xs text-slate-300 max-w-md">
            Guaranteed on-time pickup, sanitized luxury fleet, transparent fixed rates, and 24/7 passenger support.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 shrink-0">
          <Link
            href="/rental-inquiry"
            className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black px-6 py-3 rounded-xl text-xs uppercase tracking-wider shadow-lg shadow-amber-500/20 text-center"
          >
            Book Cab Online
          </Link>
          <a
            href="tel:+919999999999"
            className="bg-slate-950 border border-white/10 hover:border-amber-400 text-slate-200 hover:text-white font-bold px-4 py-3 rounded-xl text-xs flex items-center justify-center gap-2 transition-all"
          >
            <PhoneCall className="w-4 h-4 text-amber-400" />
            <span>Call 24/7 Support</span>
          </a>
        </div>
      </div>

      {/* Related Articles Section */}
      {effectiveRelated.length > 0 && (
        <section className="pt-12 border-t border-white/10 space-y-6">
          <div className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-amber-400" />
            <h2 className="text-xl font-black text-slate-50 tracking-tight">
              Related Travel Publications
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {effectiveRelated.map((rp) => (
              <Link
                key={rp.id || rp.slug}
                href={`/blog/${rp.slug}`}
                className="bg-slate-900/60 border border-white/10 hover:border-amber-500/40 p-6 rounded-2xl block space-y-3 transition-all group shadow-md"
              >
                <span className="text-[10px] font-black text-amber-400 uppercase tracking-wider block">
                  {typeof rp.category === "object" ? rp.category?.name : (rp.category || "Travel Guide")}
                </span>
                <h3 className="font-bold text-slate-100 text-base leading-snug group-hover:text-amber-400 transition-colors line-clamp-2">
                  {rp.title}
                </h3>
                <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                  {rp.summary}
                </p>
                <span className="text-[11px] font-mono text-slate-500 block pt-1">
                  {rp.date || rp.createdAt?.slice(0, 10) || "August 2026"}
                </span>
              </Link>
            ))}
          </div>
        </section>
      )}
    </main>
  );
}
