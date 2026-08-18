"use client";

import React, { useState, useRef } from "react";
import { motion, useInView, easeInOut } from "framer-motion";
import { Star, CheckCircle2, Quote, ArrowUpRight, ThumbsUp, Sparkles } from "lucide-react";

interface ReviewItem {
  id: string;
  authorName: string;
  authorPhoto?: string;
  rating: number;
  relativeTime: string;
  text: string;
  tripType?: string;
}

interface AnimatedReviewsProps {
  reviews: ReviewItem[];
  googleMapsUri: string;
  rating: number;
  userRatingCount: number;
}

export default function AnimatedReviewsShowcase({
  reviews,
  googleMapsUri,
  rating,
  userRatingCount,
}: AnimatedReviewsProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(containerRef, { once: false, amount: 0.25 });
  const [isManualExpanded, setIsManualExpanded] = useState<boolean | null>(null);

  // Determine if expanded: manual toggle takes precedence, else isInView on-scroll triggers fanned-out spread
  const isExpanded = isManualExpanded !== null ? isManualExpanded : isInView;

  // Position offsets for 4 stacked cards when fanned out on scroll
  const rotateDegree = [-12, -4, 4, 12];
  const xAxis = [-390, -130, 130, 390];
  const yAxis = [15, -15, -15, 15];
  const initialRotation = [0, 5, 10, 15];
  const zIndex = [40, 30, 20, 10];

  const displayReviews = reviews.slice(0, 4);

  return (
    <section ref={containerRef} className="py-24 bg-slate-900/40 px-4 sm:px-6 lg:px-8 border-b border-white/5 overflow-hidden">
      <div className="max-w-7xl mx-auto space-y-12">
        
        {/* Section Header */}
        <div className="text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-white/5 border border-white/10 rounded-full text-xs font-bold text-slate-200 backdrop-blur-md">
            <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
            </svg>
            <span>Google Business Profile Verified Reviews</span>
          </div>

          <h2 className="text-3xl sm:text-5xl font-black text-slate-50 tracking-tight">
            {rating} ★★★★★ Rating on Google Maps
          </h2>

          <p className="text-xs text-amber-400 font-extrabold uppercase tracking-widest flex items-center justify-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-400 animate-pulse" />
            <span>{isExpanded ? "Hover over any card to view feedback" : "Scroll down to expand customer feedback deck"}</span>
          </p>
        </div>

        {/* Desktop Animated Stack-to-Spread Cards Stage */}
        <div
          onClick={() => setIsManualExpanded(!isExpanded)}
          className="hidden xl:flex justify-center items-center min-h-[460px] relative cursor-pointer py-12"
          title="Click deck to toggle stack / spread view"
        >
          {displayReviews.map((rev, ind) => (
            <motion.div
              key={rev.id || ind}
              initial={{ x: 0, y: 0, rotate: initialRotation[ind] }}
              animate={
                isExpanded
                  ? { x: xAxis[ind], y: yAxis[ind], rotate: rotateDegree[ind] }
                  : { x: 0, y: 0, rotate: initialRotation[ind] }
              }
              transition={{ duration: 0.8, ease: easeInOut }}
              style={{
                zIndex: zIndex[ind],
              }}
              whileHover={{
                scale: 1.08,
                zIndex: 60,
                rotate: 0,
                transition: { duration: 0.3 },
              }}
              className="absolute w-[320px] bg-slate-950/95 border border-white/10 p-6 rounded-2xl space-y-4 hover:border-amber-400/60 shadow-2xl hover:shadow-amber-500/20 backdrop-blur-xl transition-colors group flex flex-col justify-between overflow-hidden"
            >
              {/* Background Glow Aura */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 rounded-full blur-2xl group-hover:bg-amber-500/15 transition-all duration-500 pointer-events-none z-0" />
              
              {/* Double Inverted Commas Quote Icon (Inside card bounds, glowing border goes behind) */}
              <Quote className="w-14 h-14 absolute top-2 right-2 text-white/5 group-hover:text-amber-400/25 group-hover:scale-110 group-hover:rotate-6 transition-all duration-500 pointer-events-none z-10" />

              <div className="space-y-3 relative z-10">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-1 bg-amber-500/10 border border-amber-500/20 px-2.5 py-1 rounded-full">
                    {[...Array(rev.rating || 5)].map((_, i) => (
                      <Star key={i} className="w-3 h-3 fill-amber-400 text-amber-400" />
                    ))}
                    <span className="text-[10px] font-black text-amber-400 ml-1">5.0</span>
                  </div>
                  <span className="text-[10px] font-extrabold text-slate-400 bg-slate-900 border border-white/10 px-2.5 py-1 rounded-full font-mono">
                    {rev.relativeTime}
                  </span>
                </div>

                {rev.tripType && (
                  <div className="inline-flex items-center gap-1 text-[9px] font-extrabold uppercase tracking-widest text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                    <span>{rev.tripType}</span>
                  </div>
                )}

                <p className="text-slate-200 text-xs leading-relaxed font-medium line-clamp-4">
                  "{rev.text}"
                </p>
              </div>

              <div className="border-t border-white/10 pt-4 flex items-center justify-between gap-3 relative z-10">
                <div className="flex items-center gap-2.5 min-w-0 flex-1">
                  {rev.authorPhoto ? (
                    <img
                      src={rev.authorPhoto}
                      alt={rev.authorName}
                      className="w-8 h-8 rounded-full object-cover border border-amber-400/40 shrink-0"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-amber-500 to-amber-700 text-slate-950 font-black flex items-center justify-center text-xs border border-amber-400/40 shrink-0">
                      {rev.authorName?.charAt(0) || "G"}
                    </div>
                  )}

                  <div className="min-w-0 flex-1">
                    <div className="font-extrabold text-slate-100 text-xs flex items-center gap-1">
                      <span className="truncate" title={rev.authorName}>{rev.authorName}</span>
                      <CheckCircle2 className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                    </div>
                    <div className="text-[9px] text-slate-400 truncate flex items-center gap-1">
                      <ThumbsUp className="w-2.5 h-2.5 text-emerald-400" />
                      <span>Verified</span>
                    </div>
                  </div>
                </div>

                <a
                  href={googleMapsUri}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => e.stopPropagation()}
                  className="flex items-center gap-1 text-[10px] font-bold text-amber-400 bg-amber-500/10 px-2.5 py-1 rounded-lg border border-amber-500/20 hover:bg-amber-500/20 shrink-0"
                >
                  <span>Maps</span>
                  <ArrowUpRight className="w-3 h-3 shrink-0" />
                </a>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Mobile / Tablet Responsive Grid Fallback */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:hidden gap-6">
          {displayReviews.map((rev, idx) => (
            <div
              key={rev.id || idx}
              className="bg-slate-950/90 border border-white/10 p-6 rounded-2xl space-y-4 hover:border-amber-400/40 shadow-xl flex flex-col justify-between overflow-hidden relative group"
            >
              <Quote className="w-12 h-12 absolute top-2 right-2 text-white/5 group-hover:text-amber-400/20 transition-all pointer-events-none z-10" />
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-1 bg-amber-500/10 border border-amber-500/20 px-2.5 py-1 rounded-full">
                    {[...Array(rev.rating || 5)].map((_, i) => (
                      <Star key={i} className="w-3 h-3 fill-amber-400 text-amber-400" />
                    ))}
                    <span className="text-[10px] font-black text-amber-400 ml-1">5.0</span>
                  </div>
                  <span className="text-[10px] font-extrabold text-slate-400 bg-slate-900 border border-white/10 px-2.5 py-1 rounded-full font-mono">
                    {rev.relativeTime}
                  </span>
                </div>

                {rev.tripType && (
                  <div className="inline-flex items-center gap-1 text-[9px] font-extrabold uppercase tracking-widest text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                    <span>{rev.tripType}</span>
                  </div>
                )}

                <p className="text-slate-200 text-xs leading-relaxed font-medium">"{rev.text}"</p>
              </div>

              <div className="border-t border-white/10 pt-4 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5 min-w-0 flex-1">
                  {rev.authorPhoto ? (
                    <img
                      src={rev.authorPhoto}
                      alt={rev.authorName}
                      className="w-8 h-8 rounded-full object-cover border border-amber-400/40 shrink-0"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-amber-500 to-amber-700 text-slate-950 font-black flex items-center justify-center text-xs border border-amber-400/40 shrink-0">
                      {rev.authorName?.charAt(0) || "G"}
                    </div>
                  )}

                  <div className="min-w-0 flex-1">
                    <div className="font-extrabold text-slate-100 text-xs flex items-center gap-1">
                      <span className="truncate">{rev.authorName}</span>
                      <CheckCircle2 className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                    </div>
                    <div className="text-[9px] text-slate-400 truncate">Google Verified Customer</div>
                  </div>
                </div>

                <a
                  href={googleMapsUri}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 text-[10px] font-bold text-amber-400 bg-amber-500/10 px-2.5 py-1 rounded-lg border border-amber-500/20"
                >
                  <span>Maps</span>
                  <ArrowUpRight className="w-3 h-3" />
                </a>
              </div>
            </div>
          ))}
        </div>

        {/* Read All Verified Reviews Link */}
        <div className="text-center pt-4">
          <a
            href={googleMapsUri}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2.5 text-xs font-extrabold text-slate-950 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 px-7 py-3.5 rounded-xl transition-all shadow-xl shadow-amber-500/15 uppercase tracking-wider font-mono hover:scale-105 active:scale-95"
          >
            <span>Explore All Verified Google Reviews ({userRatingCount}+)</span>
            <ArrowUpRight className="w-4 h-4 text-slate-950" />
          </a>
        </div>
      </div>
    </section>
  );
}
