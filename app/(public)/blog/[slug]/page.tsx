import React from "react";
import prisma from "@/lib/prisma";
import { getSEOMetadata } from "@/lib/seo";
import Breadcrumbs from "@/components/shared/breadcrumbs";
import { JsonLd } from "@/components/shared/json-ld";
import BlogArticleView from "@/components/shared/blog-article-view";
import { DEFAULT_BLOG_POSTS } from "@/lib/default-blogs";

interface BlogPostPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: BlogPostPageProps) {
  const resolvedParams = await params;
  let post = null;
  try {
    post = await prisma.blogPost.findUnique({
      where: { slug: resolvedParams.slug },
    });
  } catch (e) {
    console.error("Blog post metadata error:", e);
  }

  if (!post) {
    post = DEFAULT_BLOG_POSTS.find((p) => p.slug === resolvedParams.slug) || null;
  }

  if (!post) {
    return {
      title: "Travel Article | Temp Travel Car Rentals",
      description: "Read travel guides, airport transfer advice, and corporate fleet insights from Temp Travel.",
    };
  }

  return getSEOMetadata({
    title: (post as any).seoTitle || post.title,
    description: (post as any).seoDescription || post.summary,
    path: `/blog/${post.slug}`,
    ogImage: (post as any).featuredImage || (post as any).coverImage || "/images/hero-car.png",
    keywords: (post as any).seoKeywords ? (post as any).seoKeywords.split(",") : (post as any).tags,
  });
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const resolvedParams = await params;
  let post: any = null;

  try {
    post = await prisma.blogPost.findUnique({
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
  } catch (e) {
    console.error("Blog post page error:", e);
  }

  // Fallback to default blogs
  if (!post) {
    post = DEFAULT_BLOG_POSTS.find((p) => p.slug === resolvedParams.slug) || null;
  }

  // Fetch related posts safely
  let relatedPosts: any[] = [];
  if (post && post.categoryId) {
    try {
      relatedPosts = await prisma.blogPost.findMany({
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
    } catch (e) {
      console.error("Related blog posts error:", e);
    }
  }

  if (relatedPosts.length === 0) {
    relatedPosts = DEFAULT_BLOG_POSTS.filter((p) => p.slug !== resolvedParams.slug).slice(0, 2);
  }

  const blogPostingSchema = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    "headline": post?.title || "Temp Travel Article",
    "image": post?.featuredImage || post?.coverImage || "https://temptravels.com/images/hero-car.png",
    "datePublished": post?.publishedAt || post?.createdAt || "2026-08-20",
    "dateModified": post?.updatedAt || post?.createdAt || "2026-08-20",
    "author": {
      "@type": "Person",
      "name": (typeof post?.author === "object" ? post?.author?.name : post?.author) || "Temp Travel Editorial Team"
    },
    "publisher": {
      "@type": "Organization",
      "name": "TEMP TRAVEL CAR RENTALS PVT LTD",
      "logo": {
        "@type": "ImageObject",
        "url": "https://temptravels.com/images/hero-car.png"
      }
    },
    "description": post?.summary || "Travel log from Temp Travel",
    "mainEntityOfPage": {
      "@type": "WebPage",
      "@id": `https://temptravels.com/blog/${resolvedParams.slug}`
    }
  };

  const catName = typeof post?.category === "object" ? post?.category?.name : (post?.category || "Travel Guide");
  const catSlug = typeof post?.category === "object" ? post?.category?.slug : (post?.categorySlug || "travel-guides");

  const breadcrumbsList = [
    { label: "Blog", path: "/blog" },
    { label: catName, path: `/blog?category=${catSlug}` },
    { label: post?.title || "Article", path: `/blog/${resolvedParams.slug}` },
  ];

  return (
    <>
      <JsonLd data={blogPostingSchema} />

      <div className="w-full bg-slate-950 text-slate-100 min-h-screen">
        {/* Breadcrumbs */}
        <Breadcrumbs items={breadcrumbsList} />

        {/* Client Article View with fallback synchronization */}
        <BlogArticleView
          initialPost={post}
          slug={resolvedParams.slug}
          relatedPosts={relatedPosts}
        />
      </div>
    </>
  );
}
