import React from "react";
import { notFound } from "next/navigation";
import prisma from "@/lib/prisma";
import BlogForm from "@/components/shared/blog-form";
import { Edit3 } from "lucide-react";

interface EditBlogPostPageProps {
  params: Promise<{ id: string }>;
}

export default async function EditBlogPostPage({ params }: EditBlogPostPageProps) {
  const { id } = await params;

  const post = await prisma.blogPost.findUnique({
    where: { id },
  });

  if (!post) {
    notFound();
  }

  const initialData = {
    id: post.id,
    title: post.title,
    slug: post.slug,
    summary: post.summary,
    content: post.content,
    featuredImage: post.featuredImage || "",
    published: post.published,
    categoryId: post.categoryId,
    tags: post.tags,
    seoTitle: post.seoTitle || "",
    seoDescription: post.seoDescription || "",
    seoKeywords: post.seoKeywords || "",
  };

  return (
    <div className="bg-slate-950 min-h-screen text-slate-100 p-8 space-y-8">
      {/* Title Header */}
      <div className="border-b border-white/5 pb-6">
        <h1 className="text-3xl font-extrabold text-slate-50 tracking-tight flex items-center gap-2.5">
          <Edit3 className="w-8 h-8 text-accent" />
          <span>Edit Article</span>
        </h1>
        <p className="text-xs text-slate-400 mt-1">Update article settings, contents, and search engine parameters.</p>
      </div>

      <BlogForm initialData={initialData} isEdit={true} />
    </div>
  );
}
