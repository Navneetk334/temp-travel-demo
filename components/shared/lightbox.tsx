import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Portal } from "@radix-ui/react-portal";
import { X, ChevronLeft, ChevronRight, Sparkles, MapPin, Calendar, ArrowRight } from "lucide-react";
import Link from "next/link";
import { PhotoItem } from "@/components/shared/photo-coverflow-3d";

interface LightboxProps {
  lightboxItem: PhotoItem | null;
  items: PhotoItem[];
  setLightboxIndex: React.Dispatch<React.SetStateAction<number | null>>;
}

export default function Lightbox({ lightboxItem, items, setLightboxIndex }: LightboxProps) {
  if (!lightboxItem) return null;

  return (
    <Portal>
      <div 
        className="fixed inset-0 bg-black/95 backdrop-blur-xl z-[99999] flex items-center justify-center p-4 sm:p-6 cursor-default"
        onClick={() => setLightboxIndex(null)}
      >
        <div 
          className="relative max-w-5xl w-full bg-surface border border-slate-200 rounded-3xl overflow-hidden shadow-2xl flex flex-col lg:flex-row max-h-[90vh]"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Close Button */}
          <button
            onClick={() => setLightboxIndex(null)}
            className="absolute top-4 right-4 p-2.5 bg-slate-900/90 text-slate-300 hover:text-white hover:bg-slate-800 rounded-full border border-slate-700 z-30 transition-all shadow-xl"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Prev / Next Overlay Buttons */}
          <button
            onClick={() => setLightboxIndex((prev) => (prev !== null ? (prev - 1 + items.length) % items.length : null))}
            className="absolute left-4 top-1/2 -translate-y-1/2 p-3 bg-slate-900/90 text-slate-300 hover:text-accent hover:bg-slate-800 rounded-full border border-slate-700 z-30 transition-all shadow-xl"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <button
            onClick={() => setLightboxIndex((prev) => (prev !== null ? (prev + 1) % items.length : null))}
            className="absolute right-4 top-1/2 -translate-y-1/2 p-3 bg-slate-900/90 text-slate-300 hover:text-accent hover:bg-slate-800 rounded-full border border-slate-700 z-30 transition-all shadow-xl"
          >
            <ChevronRight className="w-6 h-6" />
          </button>

          {/* Lightbox Image Box */}
          <div className="lg:w-2/3 h-[320px] sm:h-[480px] lg:h-auto bg-black flex items-center justify-center relative">
            <img
              src={lightboxItem.imageUrl}
              alt={lightboxItem.altText || lightboxItem.title || "TEMP TRAVEL Lightbox"}
              className="max-w-full max-h-full object-contain p-2"
            />
          </div>

          {/* Lightbox Info Panel */}
          <div className="lg:w-1/3 p-6 sm:p-8 flex flex-col justify-between space-y-6 bg-surface border-t lg:border-t-0 lg:border-l border-border overflow-y-auto">
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-accent/20 text-accent border border-accent/30">
                  {lightboxItem.category || "TEMP TRAVEL Fleet"}
                </span>
                {lightboxItem.isFeatured && (
                  <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center gap-1">
                    <Sparkles className="w-3 h-3" />
                    Featured
                  </span>
                )}
              </div>

              <h3 className="text-xl sm:text-2xl font-black text-slate-50 leading-tight">
                {lightboxItem.title || "Chauffeur Drive Experience"}
              </h3>

              {lightboxItem.description && (
                <p className="text-sm text-slate-300 leading-relaxed font-sans">
                  {lightboxItem.description}
                </p>
              )}

              {lightboxItem.caption && (
                <div className="p-3 bg-slate-800/50 border border-slate-700 rounded-xl text-xs text-slate-400 italic">
                  &ldquo;{lightboxItem.caption}&rdquo;
                </div>
              )}
            </div>

            <div className="space-y-4 border-t border-border pt-4">
              <div className="space-y-2 text-xs text-slate-500 font-mono">
                {lightboxItem.location && (
                  <div className="flex items-center gap-2">
                    <MapPin className="w-3.5 h-3.5 text-accent" />
                    <span>Location: {lightboxItem.location}</span>
                  </div>
                )}
                {lightboxItem.year && (
                  <div className="flex items-center gap-2">
                    <Calendar className="w-3.5 h-3.5 text-accent" />
                    <span>Year: {lightboxItem.year}</span>
                  </div>
                )}
              </div>

              <div className="pt-2">
                <Link
                  href="/contact"
                  className="w-full inline-flex items-center justify-center gap-2 bg-accent hover:bg-yellow-500 text-slate-950 font-extrabold py-3 px-4 rounded-xl text-xs uppercase tracking-wider transition-all shadow-lg"
                >
                  <span>Inquire Mobility Service</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>

          </div>

        </div>
      </div>
    </Portal>
  );
}
