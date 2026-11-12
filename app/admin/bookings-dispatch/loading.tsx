import React from "react";
import { Truck, Loader2 } from "lucide-react";

export default function BookingsDispatchLoading() {
  return (
    <div className="bg-background min-h-screen text-slate-100 p-8 space-y-8 animate-pulse">
      {/* Title Header Skeleton with Active Spinner */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-border pb-6 gap-4">
        <div className="space-y-2">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-500/20 border border-amber-500/30 flex items-center justify-center">
              <Truck className="w-5 h-5 text-accent animate-pulse" />
            </div>
            <div className="h-8 w-72 bg-white/10 rounded-xl" />
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-400/10 border border-amber-400/20 text-accent text-xs font-semibold">
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              <span>Loading CRM...</span>
            </div>
          </div>
          <div className="h-3 w-96 bg-white/5 rounded" />
        </div>
        <div className="h-10 w-48 bg-white/10 rounded-lg" />
      </div>

      {/* 7 Stats Lifecycle Pipeline Skeletons */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
        {Array.from({ length: 7 }).map((_, i) => (
          <div key={i} className="glassmorphism p-3 rounded-xl border border-border space-y-2">
            <div className="h-2.5 w-16 bg-white/10 rounded" />
            <div className="h-6 w-10 bg-white/10 rounded" />
          </div>
        ))}
      </div>

      {/* Filter & Toolbar Skeleton */}
      <div className="glassmorphism p-6 rounded-xl border border-border flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="h-10 w-full md:w-80 bg-white/10 rounded-lg" />
        <div className="flex gap-3 w-full md:w-auto">
          <div className="h-10 w-36 bg-white/10 rounded-lg" />
          <div className="h-10 w-36 bg-white/10 rounded-lg" />
          <div className="h-10 w-36 bg-white/10 rounded-lg" />
        </div>
      </div>

      {/* Main Content: Full-Width Centered Loading Container */}
      <div className="w-full glassmorphism rounded-2xl border border-border p-12 sm:p-16 flex flex-col items-center justify-center min-h-[460px] space-y-6 text-center shadow-xl">
        {/* Symmetrical Concentric Glowing & Spinning Ring around Fleet Badge */}
        <div className="relative flex items-center justify-center w-20 h-20">
          <div className="absolute inset-0 rounded-full border-2 border-amber-500/20 border-t-amber-400 animate-spin" />
          <div className="w-14 h-14 rounded-full bg-amber-500/10 border border-amber-500/30 flex items-center justify-center shadow-lg shadow-amber-500/15">
            <Truck className="w-7 h-7 text-accent animate-pulse" />
          </div>
        </div>

        <div className="space-y-1.5 max-w-md">
          <div className="text-base font-bold text-slate-100 flex items-center justify-center gap-2">
            <span>Loading Booking & Fleet Dispatch CRM</span>
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">
            Synchronizing active dispatches, fleet allocations, driver rosters, and payment statuses...
          </p>
        </div>

        {/* Shimmering Table Row Skeletons Centered */}
        <div className="w-full max-w-lg space-y-3 pt-2">
          <div className="h-11 bg-white/5 border border-white/5 rounded-xl animate-pulse" />
          <div className="h-11 bg-white/5 border border-white/5 rounded-xl animate-pulse delay-75" />
          <div className="h-11 bg-white/5 border border-white/5 rounded-xl animate-pulse delay-150" />
        </div>
      </div>
    </div>
  );
}

