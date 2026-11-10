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

      {/* Main Split: Dispatch Table vs Inspector */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Table Container Skeleton */}
        <div className="lg:col-span-7 glassmorphism rounded-xl border border-border overflow-hidden p-8 flex flex-col items-center justify-center min-h-[420px] space-y-4">
          <div className="relative flex items-center justify-center">
            <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center shadow-lg shadow-amber-500/10">
              <Truck className="w-8 h-8 text-accent animate-pulse" />
            </div>
            <Loader2 className="w-6 h-6 text-amber-400 animate-spin absolute -top-1 -right-1" />
          </div>
          <div className="text-center space-y-1">
            <div className="text-sm font-bold text-slate-100 flex items-center justify-center gap-2">
              <span>Loading Booking & Fleet Dispatch CRM</span>
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
            </div>
            <p className="text-xs text-slate-400 max-w-sm">
              Connecting live fleet dispatches, driver allocations, and payment statuses...
            </p>
          </div>
          <div className="w-full max-w-md space-y-2.5 pt-2">
            <div className="h-10 bg-white/5 border border-white/5 rounded-xl" />
            <div className="h-10 bg-white/5 border border-white/5 rounded-xl" />
            <div className="h-10 bg-white/5 border border-white/5 rounded-xl" />
          </div>
        </div>

        {/* Inspector Panel Skeleton */}
        <div className="lg:col-span-5 glassmorphism border border-border rounded-2xl p-8 min-h-[420px] flex flex-col items-center justify-center text-center space-y-3">
          <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center">
            <Loader2 className="w-6 h-6 text-slate-500 animate-spin" />
          </div>
          <div className="h-4 w-48 bg-white/10 rounded" />
          <div className="h-3 w-64 bg-white/5 rounded" />
        </div>
      </div>
    </div>
  );
}
