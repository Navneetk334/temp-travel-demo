"use client";
import React, { useState } from "react";
import { Loader2, RefreshCw, Send, CheckCircle2 } from "lucide-react";

export default function LoadingDemoPage() {
  const [activeLoader, setActiveLoader] = useState<number | null>(null);

  const simulateLoading = (id: number) => {
    setActiveLoader(id);
    setTimeout(() => setActiveLoader(null), 3000);
  };

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-12">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold text-slate-100">Loading Indicator Showcase</h1>
        <p className="text-slate-400">
          Click the buttons below to simulate a 3-second loading state. Choose your favorite style, and we will implement it globally across all forms and actions in the Admin Panel to prevent duplicate clicks.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        
        {/* Style 1: Classic Spinner */}
        <div className="bg-surface border border-border p-6 rounded-2xl flex flex-col gap-4">
          <h2 className="text-amber-400 font-bold">1. Classic Spinner (Lucide)</h2>
          <p className="text-sm text-slate-400">Replaces icon with a spinning loader and disables button.</p>
          <button 
            onClick={() => simulateLoading(1)}
            disabled={activeLoader === 1}
            className="mt-auto bg-amber-500 hover:bg-amber-600 text-slate-900 font-bold py-3 px-4 rounded-xl flex items-center justify-center gap-2 transition-all disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {activeLoader === 1 ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
            {activeLoader === 1 ? "Saving..." : "Save Record"}
          </button>
        </div>

        {/* Style 2: Bouncing Dots */}
        <div className="bg-surface border border-border p-6 rounded-2xl flex flex-col gap-4">
          <h2 className="text-amber-400 font-bold">2. Bouncing Dots</h2>
          <p className="text-sm text-slate-400">Shows animated dots indicating background processing.</p>
          <button 
            onClick={() => simulateLoading(2)}
            disabled={activeLoader === 2}
            className="mt-auto bg-emerald-500 hover:bg-emerald-600 text-slate-900 font-bold py-3 px-4 rounded-xl flex items-center justify-center transition-all disabled:opacity-70 disabled:cursor-not-allowed min-h-[48px]"
          >
            {activeLoader === 2 ? (
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 bg-surface rounded-full animate-bounce" style={{ animationDelay: "0ms" }}></div>
                <div className="w-2 h-2 bg-surface rounded-full animate-bounce" style={{ animationDelay: "150ms" }}></div>
                <div className="w-2 h-2 bg-surface rounded-full animate-bounce" style={{ animationDelay: "300ms" }}></div>
              </div>
            ) : "Submit Data"}
          </button>
        </div>

        {/* Style 3: Gradient Ring Spinner */}
        <div className="bg-surface border border-border p-6 rounded-2xl flex flex-col gap-4">
          <h2 className="text-amber-400 font-bold">3. Gradient Ring Spinner</h2>
          <p className="text-sm text-slate-400">A custom CSS spinning ring that looks premium.</p>
          <button 
            onClick={() => simulateLoading(3)}
            disabled={activeLoader === 3}
            className="mt-auto bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 px-4 rounded-xl flex items-center justify-center gap-2 transition-all disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {activeLoader === 3 ? (
              <div className="w-5 h-5 rounded-full border-2 border-white/30 border-t-white animate-spin"></div>
            ) : <CheckCircle2 className="w-5 h-5" />}
            {activeLoader === 3 ? "Processing..." : "Confirm Action"}
          </button>
        </div>

        {/* Style 4: Skeleton / Pulse Text */}
        <div className="bg-surface border border-border p-6 rounded-2xl flex flex-col gap-4">
          <h2 className="text-amber-400 font-bold">4. Pulse Text Effect</h2>
          <p className="text-sm text-slate-400">Simple pulsing text without moving icons.</p>
          <button 
            onClick={() => simulateLoading(4)}
            disabled={activeLoader === 4}
            className="mt-auto bg-rose-500 hover:bg-rose-600 text-white font-bold py-3 px-4 rounded-xl flex items-center justify-center gap-2 transition-all disabled:opacity-80 disabled:cursor-not-allowed"
          >
            {activeLoader === 4 ? (
              <span className="animate-pulse flex items-center gap-2">
                <RefreshCw className="w-4 h-4 animate-spin" /> Authenticating
              </span>
            ) : "Login"}
          </button>
        </div>

        {/* Style 5: Full Button Shimmer */}
        <div className="bg-surface border border-border p-6 rounded-2xl flex flex-col gap-4">
          <h2 className="text-amber-400 font-bold">5. Progress / Shimmer</h2>
          <p className="text-sm text-slate-400">Creates a moving gradient over the button.</p>
          <button 
            onClick={() => simulateLoading(5)}
            disabled={activeLoader === 5}
            className={`mt-auto text-slate-900 font-bold py-3 px-4 rounded-xl flex items-center justify-center transition-all disabled:cursor-not-allowed overflow-hidden relative ${
              activeLoader === 5 ? "bg-slate-700 text-slate-300" : "bg-amber-500 hover:bg-amber-600"
            }`}
          >
            {activeLoader === 5 && (
              <div className="absolute inset-0 -translate-x-full animate-[shimmer_1.5s_infinite] bg-gradient-to-r from-transparent via-white/10 to-transparent"></div>
            )}
            {activeLoader === 5 ? "Uploading..." : "Upload File"}
          </button>
        </div>

      </div>

      <div className="p-6 bg-amber-500/10 border border-amber-500/20 rounded-2xl mt-8">
        <h3 className="text-amber-400 font-bold text-lg mb-2">Global Overlay Option</h3>
        <p className="text-slate-300 text-sm">
          If you choose, we can also pair any of these button loaders with a <strong>semi-transparent full-screen overlay</strong> that prevents the user from clicking anywhere else on the page until the action succeeds or fails.
        </p>
      </div>

    </div>
  );
}

