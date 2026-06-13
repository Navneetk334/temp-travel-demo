import React from "react";
import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Car, Phone, Mail, MapPin, Calendar, User, BookOpen, Tag, ChevronRight, ArrowLeft } from "lucide-react";
import prisma from "@/lib/prisma";
import { getSEOMetadata } from "@/lib/seo";
import Breadcrumbs from "@/components/shared/breadcrumbs";
import { JsonLd } from "@/components/shared/json-ld";

interface BlogPostPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: BlogPostPageProps) {
  const resolvedParams = await params;
  const post = await prisma.blogPost.findUnique({
    where: { slug: resolvedParams.slug },
  });

  if (!post) {
    return {};
  }

  return getSEOMetadata({
    title: post.seoTitle || post.title,
    description: post.seoDescription || post.summary,
    path: `/blog/${post.slug}`,
    ogImage: post.featuredImage || "/images/hero-cover.png",
    keywords: post.seoKeywords ? post.seoKeywords.split(",") : post.tags,
  });
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const resolvedParams = await params;
  const post = await prisma.blogPost.findUnique({
    where: { slug: resolvedParams.slug },
    include: {
      author: {
        select: { name: true, email: true },
      },
      category: {
        select: { name: true, slug: true },
      },
    },
  });

  if (!post || !post.published) {
    notFound();
  }

  // Fetch related posts (same category, excluding current post)
  const relatedPosts = await prisma.blogPost.findMany({
    where: {
      published: true,
      categoryId: post.categoryId,
      id: { not: post.id },
    },
    take: 3,
    orderBy: { createdAt: "desc" },
    include: {
      category: {
        select: { name: true },
      },
    },
  });

  const blogPostingSchema = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    "headline": post.title,
    "image": post.featuredImage || "https://temptravels.com/images/hero-cover.png",
    "datePublished": post.publishedAt || post.createdAt,
    "dateModified": post.updatedAt,
    "author": {
      "@type": "Person",
      "name": post.author?.name || "Temp Travel Publisher"
    },
    "publisher": {
      "@type": "Organization",
      "name": "TEMP TRAVEL CAR RENTALS PVT LTD",
      "logo": {
        "@type": "ImageObject",
        "url": "https://temptravels.com/images/hero-cover.png"
      }
    },
    "description": post.summary,
    "mainEntityOfPage": {
      "@type": "WebPage",
      "@id": `https://temptravels.com/blog/${post.slug}`
    }
  };

  const breadcrumbsList = [
    { label: "Blog", path: "/blog" },
    { label: post.category.name, path: `/blog?category=${post.category.slug}` },
    { label: post.title, path: `/blog/${post.slug}` },
  ];

  return (
    <>
      <JsonLd data={blogPostingSchema} />

      <div className="bg-slate-950 min-h-screen text-slate-100 flex flex-col justify-between">
        
        {/* 1. Header / Navigation */}
        <header className="sticky top-0 z-50 w-full bg-slate-950/75 backdrop-blur-md border-b border-white/5 transition-all">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Link href="/" className="flex items-center gap-2">
                <div className="bg-primary p-2 rounded-lg text-primary-foreground border border-accent/20">
                  <Car className="w-6 h-6 text-accent" />
                </div>
                <div>
                  <span className="font-extrabold text-xl tracking-tight text-slate-50 uppercase">Temp Travel</span>
                  <span className="block text-[9px] font-bold text-accent tracking-widest uppercase -mt-1">Car Rentals</span>
                </div>
              </Link>
            </div>

            <nav className="hidden md:flex items-center gap-8 text-sm font-semibold tracking-wide text-slate-300">
              <Link href="/" className="hover:text-accent transition-colors">Home</Link>
              <Link href="/services" className="hover:text-accent transition-colors">Services</Link>
              <Link href="/tours" className="hover:text-accent transition-colors">Tours</Link>
              <Link href="/blog" className="text-accent transition-colors">Blog</Link>
              <Link href="/contact" className="hover:text-accent transition-colors">Contact</Link>
            </nav>

            <div className="flex items-center gap-4">
              <Link 
                href="/book" 
                className="bg-primary hover:bg-blue-700 text-white font-bold py-2.5 px-6 rounded-lg text-sm tracking-wide shadow-md transition-all hidden sm:block border border-white/10"
              >
                Book Cab
              </Link>
              <a 
                href="tel:+919999999999" 
                className="flex items-center justify-center p-2.5 bg-slate-900 border border-white/10 rounded-lg text-slate-300 hover:text-accent transition-colors"
              >
                <Phone className="w-4 h-4" />
              </a>
            </div>
          </div>
        </header>

        {/* 2. Breadcrumbs */}
        <div className="bg-slate-950 border-b border-white/5">
          <Breadcrumbs items={breadcrumbsList} />
        </div>

        {/* Main Content */}
        <main className="flex-grow max-w-4xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-10">
          
          {/* Back button */}
          <Link 
            href="/blog"
            className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-slate-200 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>All Articles</span>
          </Link>

          {/* Article Header */}
          <header className="space-y-6">
            <Link
              href={`/blog?category=${post.category.slug}`}
              className="inline-block bg-primary/10 border border-primary/20 text-accent text-xs font-bold py-1 px-3 rounded-full uppercase tracking-wider hover:bg-primary/20 transition-colors"
            >
              {post.category.name}
            </Link>

            <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-slate-50 tracking-tight leading-tight">
              {post.title}
            </h1>

            {/* Author and Date Meta */}
            <div className="flex flex-wrap gap-6 items-center text-xs text-slate-400 font-semibold uppercase tracking-wider border-y border-white/5 py-4">
              <span className="flex items-center gap-1.5">
                <User className="w-4 h-4 text-accent" />
                <span>Written by: <strong>{post.author?.name || "Publisher"}</strong></span>
              </span>
              <span className="flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-accent" />
                <span>Published: <strong>{new Date(post.publishedAt || post.createdAt).toLocaleDateString("en-IN", { day: 'numeric', month: 'long', year: 'numeric' })}</strong></span>
              </span>
            </div>
          </header>

          {/* Featured Image */}
          <div className="relative h-[250px] sm:h-[400px] bg-slate-900 border border-white/5 rounded-2xl overflow-hidden shadow-2xl">
            <Image
              src={post.featuredImage || "/images/hero-cover.png"}
              alt={post.title}
              fill
              className="object-cover opacity-80"
              priority
            />
          </div>

          {/* Article Body Content */}
          <div className="prose prose-invert max-w-none text-slate-200 text-sm sm:text-base leading-relaxed space-y-6">
            {/* Summary Block */}
            <div className="bg-slate-900/40 border-l-4 border-accent p-6 rounded-r-xl italic text-slate-300 text-sm md:text-md">
              "{post.summary}"
            </div>

            {/* Main content body rendering HTML/Markdown paragraphs safely */}
            <div 
              dangerouslySetInnerHTML={{ __html: post.content.replace(/\n/g, "<br />") }} 
              className="space-y-4 font-normal"
            />
          </div>

          {/* Tags list */}
          {post.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 pt-6 border-t border-white/5 items-center text-xs">
              <span className="text-slate-400 font-semibold uppercase">Article Tags:</span>
              {post.tags.map((t) => (
                <Link
                  key={t}
                  href={`/blog?tag=${t}`}
                  className="bg-slate-900 hover:bg-slate-850 border border-white/5 hover:border-accent text-slate-300 font-mono py-1 px-3 rounded-md transition-all"
                >
                  #{t}
                </Link>
              ))}
            </div>
          )}

          {/* Related Articles Section */}
          {relatedPosts.length > 0 && (
            <section className="pt-16 border-t border-white/5 space-y-8">
              <h2 className="text-2xl font-extrabold text-slate-50 tracking-tight flex items-center gap-2">
                <BookOpen className="w-6 h-6 text-accent" />
                <span>Related Travel Articles</span>
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {relatedPosts.map((rp) => (
                  <Link
                    key={rp.id}
                    href={`/blog/${rp.slug}`}
                    className="bg-slate-900/40 border border-white/5 hover:border-accent/30 p-5 rounded-xl block space-y-3 transition-all group"
                  >
                    <span className="text-[10px] font-bold text-accent uppercase tracking-wide block">
                      {rp.category.name}
                    </span>
                    <h3 className="font-bold text-slate-100 leading-snug group-hover:text-accent transition-colors line-clamp-2">
                      {rp.title}
                    </h3>
                    <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                      {rp.summary}
                    </p>
                    <span className="text-[10px] text-slate-500 block">
                      {new Date(rp.createdAt).toLocaleDateString()}
                    </span>
                  </Link>
                ))}
              </div>
            </section>
          )}

        </main>

        {/* Footer */}
        <footer className="py-16 bg-slate-950 border-t border-white/5 text-xs text-slate-400 mt-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-4">
            <div>
              &copy; 2026 TEMP TRAVEL CAR RENTALS PVT LTD. All rights reserved.
            </div>
            <div className="flex gap-6">
              <Link href="/" className="hover:text-accent">Home</Link>
              <Link href="/services" className="hover:text-accent">Services</Link>
              <Link href="/tours" className="hover:text-accent">Tours</Link>
              <Link href="/contact" className="hover:text-accent">Contact</Link>
            </div>
          </div>
        </footer>

      </div>
    </>
  );
}
