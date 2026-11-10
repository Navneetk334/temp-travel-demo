import React from "react";
import { Loader2 } from "lucide-react";

export default function AdminLoading() {
  return (
    <div className="space-y-8 animate-pulse p-6">
      {/* Top Banner Skeleton with Active Loading Badge */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-400/10 border border-amber-400/20 text-accent text-xs font-semibold">
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
            <span>Loading Section...</span>
          </div>
          <div className="h-8 w-64 bg-white/10 rounded-xl" />
        </div>
        <div className="h-9 w-40 bg-white/10 rounded-xl" />
      </div>

      {/* 8 Stats Cards Skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <div
            key={i}
            className="p-5 rounded-2xl bg-surface/60 border border-border space-y-3"
          >
            <div className="flex justify-between items-start">
              <div className="h-3 w-28 bg-white/10 rounded" />
              <div className="w-8 h-8 rounded-xl bg-white/10" />
            </div>
            <div className="h-7 w-20 bg-white/10 rounded-lg" />
            <div className="h-3 w-36 bg-white/5 rounded" />
          </div>
        ))}
      </div>

      {/* Charts Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-8 p-6 rounded-2xl bg-surface/60 border border-border h-96 space-y-4">
          <div className="h-5 w-48 bg-white/10 rounded" />
          <div className="h-72 w-full bg-white/5 rounded-xl" />
        </div>
        <div className="lg:col-span-4 p-6 rounded-2xl bg-surface/60 border border-border h-96 space-y-4">
          <div className="h-5 w-40 bg-white/10 rounded" />
          <div className="h-72 w-full bg-white/5 rounded-xl" />
        </div>
      </div>

      {/* Bottom Activity Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-8 p-6 rounded-2xl bg-surface/60 border border-border h-64 space-y-4">
          <div className="h-5 w-44 bg-white/10 rounded" />
          <div className="h-44 w-full bg-white/5 rounded-xl" />
        </div>
        <div className="lg:col-span-4 p-6 rounded-2xl bg-surface/60 border border-border h-64 space-y-4">
          <div className="h-5 w-36 bg-white/10 rounded" />
          <div className="h-44 w-full bg-white/5 rounded-xl" />
        </div>
      </div>
    </div>
  );
}

