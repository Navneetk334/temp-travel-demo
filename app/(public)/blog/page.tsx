export const revalidate = 60;

import React from "react";
import prisma from "@/lib/prisma";
import { getSEOMetadata } from "@/lib/seo";
import Breadcrumbs from "@/components/shared/breadcrumbs";
import BlogIndexClient from "@/components/shared/blog-index-client";
import { DEFAULT_BLOG_POSTS, DEFAULT_BLOG_CATEGORIES } from "@/lib/default-blogs";

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
    title: `Travel Guides, Route Tips & Corporate Fleet Articles${subtitle}`,
    description: "Read verified outstation route guides, airport terminal transfer tips, executive corporate commute solutions, and trip guidelines from TEMP TRAVEL CAR RENTALS PVT LTD.",
    path: "/blog",
  });
}

export default async function BlogIndexPage({ searchParams }: PageProps) {
  const resolvedParams = await searchParams;
  const categorySlug = resolvedParams.category || "";
  const activeTag = resolvedParams.tag || "";
  const searchQuery = resolvedParams.search || "";

  // Fetch all categories for filter tabs safely
  let categories: any[] = [];
  try {
    categories = await prisma.blogCategory.findMany({
      orderBy: { name: "asc" },
    });
  } catch (e) {
    console.error("Blog categories DB error:", e);
  }

  if (categories.length === 0) {
    categories = DEFAULT_BLOG_CATEGORIES;
  }

  // Query blog posts from DB safely
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

  let posts: any[] = [];
  try {
    posts = await prisma.blogPost.findMany({
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
  } catch (e) {
    console.error("Blog posts DB error:", e);
  }

  if (posts.length === 0) {
    posts = DEFAULT_BLOG_POSTS;
  }

  const breadcrumbsList = [
    { label: "Blog", path: "/blog" },
  ];

  return (
    <div className="w-full bg-slate-950 text-slate-100 min-h-screen">
      {/* Breadcrumbs */}
      <Breadcrumbs items={breadcrumbsList} />

      {/* Main Body */}
      <main className="flex-grow max-w-[1750px] w-full mx-auto px-4 sm:px-8 lg:px-12 xl:px-16 py-12">
        <BlogIndexClient
          initialPosts={posts}
          initialCategories={categories}
          initialCategorySlug={categorySlug}
          initialTag={activeTag}
          initialSearch={searchQuery}
        />
      </main>
    </div>
  );
}
