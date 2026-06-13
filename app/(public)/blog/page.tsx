import React from "react";
import Link from "next/link";
import Image from "next/image";
import { Car, Phone, Mail, MapPin, BookOpen, Calendar, User, Tag, Search, ArrowRight } from "lucide-react";
import prisma from "@/lib/prisma";
import { getSEOMetadata } from "@/lib/seo";
import Breadcrumbs from "@/components/shared/breadcrumbs";

interface PageProps {
  searchParams: Promise<{ category?: string; tag?: string; search?: string }>;
}

export async function generateMetadata({ searchParams }: PageProps) {
  const resolvedParams = await searchParams;
  let subtitle = "";
  if (resolvedParams.category) {
    subtitle = ` in Category "${resolvedParams.category}"`;
  } else if (resolvedParams.tag) {
    subtitle = ` Tagged with "${resolvedParams.tag}"`;
  }

  return getSEOMetadata({
    title: `Travel guides & corporate travel articles${subtitle}`,
    description: "Read regional tour plans, executive corporate commuting solutions, driver checklist summaries, and trip guidelines from Temp Travel Car Rentals.",
    path: "/blog",
  });
}

export default async function BlogIndexPage({ searchParams }: PageProps) {
  const resolvedParams = await searchParams;
  const categorySlug = resolvedParams.category || "";
  const activeTag = resolvedParams.tag || "";
  const searchQuery = resolvedParams.search || "";

  // Fetch all categories for filter tabs
  const categories = await prisma.blogCategory.findMany({
    orderBy: { name: "asc" },
  });

  // Query blog posts from DB
  const where: any = { published: true };

  if (categorySlug) {
    where.category = { slug: categorySlug };
  }

  if (activeTag) {
    where.tags = { has: activeTag };
  }

  if (searchQuery) {
    where.OR = [
      { title: { contains: searchQuery, mode: "insensitive" } },
      { summary: { contains: searchQuery, mode: "insensitive" } },
      { content: { contains: searchQuery, mode: "insensitive" } },
    ];
  }

  const posts = await prisma.blogPost.findMany({
    where,
    orderBy: { createdAt: "desc" },
    include: {
      author: {
        select: { name: true },
      },
      category: {
        select: { name: true, slug: true },
      },
    },
  });

  const breadcrumbsList = [
    { label: "Blog", path: "/blog" },
  ];

  return (
    <div className="w-full">

      {/* 2. Breadcrumbs */}
      <div className="bg-slate-950 border-b border-white/5">
        <Breadcrumbs items={breadcrumbsList} />
      </div>

      {/* Main Body */}
      <main className="flex-grow max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
        
        {/* Blog Hero Intro */}
        <div className="text-center space-y-4 max-w-3xl mx-auto">
          <span className="text-xs font-bold text-accent uppercase tracking-wider block">Publications</span>
          <h1 className="text-4xl font-extrabold text-slate-50 tracking-tight">Travel Logs & Corporate Commute Insights</h1>
          <p className="text-slate-300 text-sm leading-relaxed">
            Stay updated with local travel routes, driver safety guidelines, weekend getaway plans, and corporate fleet logistics optimizations.
          </p>
        </div>

        {/* Filter Toolbar */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-white/5 pb-6">
          {/* Category Tabs */}
          <div className="flex flex-wrap gap-2 text-xs font-semibold">
            <Link
              href="/blog"
              className={`py-2 px-4 rounded-full border transition-all ${
                !categorySlug && !activeTag
                  ? "bg-primary text-white border-primary"
                  : "bg-slate-900 border-white/5 text-slate-400 hover:text-slate-200"
              }`}
            >
              All Articles
            </Link>
            {categories.map((cat) => (
              <Link
                key={cat.id}
                href={`/blog?category=${cat.slug}`}
                className={`py-2 px-4 rounded-full border transition-all ${
                  categorySlug === cat.slug
                    ? "bg-primary text-white border-primary"
                    : "bg-slate-900 border-white/5 text-slate-400 hover:text-slate-200"
                }`}
              >
                {cat.name}
              </Link>
            ))}
          </div>

          {/* Search Input Form */}
          <form className="relative max-w-xs w-full" method="GET" action="/blog">
            {categorySlug && <input type="hidden" name="category" value={categorySlug} />}
            {activeTag && <input type="hidden" name="tag" value={activeTag} />}
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input
              type="text"
              name="search"
              defaultValue={searchQuery}
              placeholder="Search articles..."
              className="w-full bg-slate-900/60 border border-white/10 rounded-lg py-2 pl-9 pr-4 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-primary transition-all"
            />
          </form>
        </div>

        {/* Tag Banner */}
        {activeTag && (
          <div className="bg-slate-900/40 border border-white/5 p-4 rounded-xl flex items-center justify-between text-xs text-slate-300">
            <div className="flex items-center gap-2">
              <Tag className="w-4 h-4 text-accent" />
              <span>Filtering articles with tag: <strong>#{activeTag}</strong></span>
            </div>
            <Link href="/blog" className="text-accent hover:underline font-semibold">Clear Tag Filter</Link>
          </div>
        )}

        {/* Blog Posts Grid Grid */}
        {posts.length === 0 ? (
          <div className="text-center py-20 bg-slate-900/10 border border-dashed border-white/5 rounded-2xl text-slate-500">
            No published articles found matching the selected filters.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {posts.map((post) => (
              <article 
                key={post.id} 
                className="bg-slate-900/20 border border-white/5 rounded-2xl overflow-hidden flex flex-col justify-between hover:border-accent/30 transition-all group"
              >
                <div>
                  {/* Card Thumbnail */}
                  <div className="relative h-48 bg-slate-950 overflow-hidden">
                    <Image
                      src={post.featuredImage || "/images/hero-cover.png"}
                      alt={post.title}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-300 opacity-60 group-hover:opacity-75"
                    />
                    <div className="absolute top-4 left-4 bg-slate-950/80 backdrop-blur-sm border border-white/10 text-[10px] font-bold text-accent py-1 px-2.5 rounded-full uppercase">
                      {post.category.name}
                    </div>
                  </div>

                  {/* Card Body */}
                  <div className="p-6 space-y-3">
                    <div className="flex items-center gap-4 text-[10px] text-slate-400 font-semibold uppercase tracking-wider">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5" />
                        <span>{new Date(post.createdAt).toLocaleDateString("en-IN", { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                      </span>
                      <span className="flex items-center gap-1">
                        <User className="w-3.5 h-3.5" />
                        <span>{post.author?.name || "Publisher"}</span>
                      </span>
                    </div>

                    <h3 className="text-lg font-bold text-slate-50 leading-snug group-hover:text-accent transition-colors">
                      <Link href={`/blog/${post.slug}`}>{post.title}</Link>
                    </h3>

                    <p className="text-slate-300 text-xs leading-relaxed line-clamp-3">
                      {post.summary}
                    </p>
                  </div>
                </div>

                {/* Card footer */}
                <div className="px-6 pb-6 pt-4 border-t border-white/5 flex justify-between items-center text-xs">
                  <div className="flex flex-wrap gap-1">
                    {post.tags.slice(0, 2).map((t) => (
                      <Link 
                        key={t} 
                        href={`/blog?tag=${t}`} 
                        className="text-slate-400 hover:text-accent transition-colors bg-white/5 px-2 py-0.5 rounded-md font-mono"
                      >
                        #{t}
                      </Link>
                    ))}
                  </div>
                  <Link 
                    href={`/blog/${post.slug}`} 
                    className="flex items-center gap-1 text-accent font-bold hover:underline shrink-0 group-hover:translate-x-0.5 transition-transform"
                  >
                    <span>Read Post</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </article>
            ))}
          </div>
        )}

      </main>
    </div>
  );
}
