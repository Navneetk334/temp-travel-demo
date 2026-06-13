import React from "react";
import BlogForm from "@/components/shared/blog-form";
import { BookOpen } from "lucide-react";

export default function NewBlogPostPage() {
  return (
    <div className="bg-slate-950 min-h-screen text-slate-100 p-8 space-y-8">
      {/* Title Header */}
      <div className="border-b border-white/5 pb-6">
        <h1 className="text-3xl font-extrabold text-slate-50 tracking-tight flex items-center gap-2.5">
          <BookOpen className="w-8 h-8 text-accent" />
          <span>Write New Article</span>
        </h1>
        <p className="text-xs text-slate-400 mt-1">Compose fresh travel stories or B2B transportation updates.</p>
      </div>

      <BlogForm />
    </div>
  );
}
