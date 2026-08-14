"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { 
  ChevronLeft, 
  ChevronRight, 
  X, 
  MapPin, 
  Calendar, 
  Sparkles, 
  Maximize2,
  ArrowRight,
  ShieldCheck,
  Compass,
  Car
} from "lucide-react";

interface GalleryItem {
  id: string;
  title?: string | null;
  description?: string | null;
  imageUrl: string;
  mediaType: "IMAGE" | "VIDEO";
  category?: string | null;
  location?: string | null;
  year?: string | null;
  isFeatured: boolean;
  isActive: boolean;
  altText?: string | null;
  caption?: string | null;
  sortOrder: number;
}

const CATEGORIES = [
  { label: "ALL", value: "all" },
  { label: "FLEET", value: "fleet" },
  { label: "CORPORATE", value: "corporate" },
  { label: "AIRPORT TRANSFER", value: "airport transfer" },
  { label: "OUTSTATION", value: "outstation" },
  { label: "TOURS", value: "tours" },
  { label: "DESTINATIONS", value: "destinations" },
  { label: "EVENTS", value: "events" },
  { label: "LIFESTYLE", value: "lifestyle" },
];

export default function PublicGalleryPage() {
  const [items, setItems] = useState<GalleryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [activeCategory, setActiveCategory] = useState("all");
  const [activeIndex, setActiveIndex] = useState(0);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const [reducedMotion, setReducedMotion] = useState(false);

  // Touch & Drag state
  const galleryRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);

  // Check reduced motion preference
  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReducedMotion(mediaQuery.matches);
    const listener = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
    mediaQuery.addEventListener("change", listener);
    return () => mediaQuery.removeEventListener("change", listener);
  }, []);

  // Fetch active gallery items from backend API
  const fetchGallery = async (category: string) => {
    setLoading(true);
    setError(false);
    try {
      const res = await fetch(`/api/gallery?category=${encodeURIComponent(category)}&sortBy=featured&limit=50`);
      if (!res.ok) throw new Error("API request failed");
      const data = await res.json();
      setItems(data.media || []);
      setActiveIndex(0);
    } catch (err) {
      console.error("Fetch gallery error:", err);
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGallery(activeCategory);
  }, [activeCategory]);

  const handleNext = useCallback(() => {
    if (items.length === 0) return;
    setActiveIndex((prev) => (prev + 1) % items.length);
  }, [items.length]);

  const handlePrev = useCallback(() => {
    if (items.length === 0) return;
    setActiveIndex((prev) => (prev - 1 + items.length) % items.length);
  }, [items.length]);

  // Keyboard navigation listener (←, →, ESC, Space/Enter)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (lightboxIndex !== null) {
        if (e.key === "Escape") setLightboxIndex(null);
        if (e.key === "ArrowRight") {
          setLightboxIndex((prev) => (prev !== null ? (prev + 1) % items.length : null));
        }
        if (e.key === "ArrowLeft") {
          setLightboxIndex((prev) => (prev !== null ? (prev - 1 + items.length) % items.length : null));
        }
        return;
      }

      if (e.key === "ArrowRight") handleNext();
      if (e.key === "ArrowLeft") handlePrev();
      if ((e.key === " " || e.key === "Enter") && items[activeIndex]) {
        setLightboxIndex(activeIndex);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [lightboxIndex, items, activeIndex, handleNext, handlePrev]);

  // Mouse drag & touchpad wheel handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setStartX(e.pageX - (galleryRef.current?.offsetLeft || 0));
  };

  const handleMouseLeave = () => setIsDragging(false);
  const handleMouseUp = () => setIsDragging(false);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    e.preventDefault();
    const x = e.pageX - (galleryRef.current?.offsetLeft || 0);
    const walk = (x - startX) * 1.5;
    if (walk > 50) {
      handlePrev();
      setIsDragging(false);
    } else if (walk < -50) {
      handleNext();
      setIsDragging(false);
    }
  };

  const activeItem = items[activeIndex];
  const lightboxItem = lightboxIndex !== null ? items[lightboxIndex] : null;

  return (
    <div className="bg-slate-950 min-h-screen text-slate-100 selection:bg-accent selection:text-slate-950 overflow-x-hidden relative">
      
      {/* Background Visual Environment */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-primary/10 rounded-full blur-[140px] opacity-60" />
        <div className="absolute bottom-10 right-1/4 w-[500px] h-[400px] bg-accent/5 rounded-full blur-[120px] opacity-40" />
        {/* Subtle Perspective Floor Grid */}
        <div 
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `linear-gradient(to right, #ffffff 1px, transparent 1px), linear-gradient(to bottom, #ffffff 1px, transparent 1px)`,
            backgroundSize: "60px 60px",
            transform: "perspective(800px) rotateX(60deg) translateY(200px)",
          }}
        />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16 space-y-12">
        
        {/* HERO SECTION */}
        <header className="space-y-4 max-w-3xl">
          <div className="flex items-center gap-2 text-accent text-xs font-mono font-bold tracking-widest uppercase">
            <Sparkles className="w-4 h-4" />
            <span>TEMP TRAVEL &bull; VISUAL JOURNAL</span>
          </div>
          <h1 className="text-4xl sm:text-6xl font-black text-slate-50 tracking-tight leading-[1.1]">
            Travel, In Motion.
          </h1>
          <p className="text-slate-400 text-sm sm:text-base leading-relaxed font-light">
            A visual collection of our journeys, vehicles, destinations and transportation experiences across India.
          </p>
        </header>

        {/* MINIMAL CATEGORY FILTER BAR */}
        <div className="border-b border-white/10 pb-4">
          <div className="flex items-center gap-2 overflow-x-auto scrollbar-none py-1 text-xs">
            {CATEGORIES.map((cat) => {
              const isActive = activeCategory === cat.value;
              return (
                <button
                  key={cat.value}
                  onClick={() => setActiveCategory(cat.value)}
                  className={`px-4 py-2 rounded-full font-bold uppercase tracking-wider transition-all duration-300 whitespace-nowrap border ${
                    isActive
                      ? "bg-accent text-slate-950 border-accent shadow-lg shadow-accent/20 scale-105"
                      : "bg-slate-900/60 text-slate-400 border-white/5 hover:border-white/20 hover:text-slate-200"
                  }`}
                >
                  {cat.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* MAIN GALLERY EXPERIENCE */}
        {loading ? (
          <div className="h-[450px] flex flex-col items-center justify-center space-y-4 text-center">
            <div className="w-12 h-12 rounded-full border-2 border-accent border-t-transparent animate-spin" />
            <div className="text-xs font-mono tracking-widest text-accent uppercase font-bold">
              TEMP TRAVEL &bull; VISUAL JOURNAL
            </div>
          </div>
        ) : error ? (
          <div className="glassmorphism p-12 rounded-2xl border border-rose-500/20 text-center space-y-4">
            <h3 className="text-lg font-bold text-slate-200">Unable to load journal media</h3>
            <p className="text-xs text-slate-400">Please refresh the page or check back shortly.</p>
          </div>
        ) : items.length === 0 ? (
          <div className="glassmorphism p-16 rounded-2xl border border-white/5 text-center space-y-4">
            <Car className="w-12 h-12 text-slate-600 mx-auto" />
            <h3 className="text-xl font-extrabold text-slate-200">More journeys coming soon.</h3>
            <p className="text-xs text-slate-400">No media assets found matching the selected category.</p>
          </div>
        ) : (
          <div className="space-y-8">
            
            {/* SPATIAL 3D CAROUSEL CONTAINER */}
            <div 
              ref={galleryRef}
              onMouseDown={handleMouseDown}
              onMouseLeave={handleMouseLeave}
              onMouseUp={handleMouseUp}
              onMouseMove={handleMouseMove}
              className="relative h-[480px] sm:h-[540px] flex items-center justify-center cursor-grab active:cursor-grabbing select-none overflow-hidden rounded-3xl"
            >
              <div className="relative w-full h-full flex items-center justify-center perspective-[1200px]">
                {items.map((item, index) => {
                  // Calculate distance offset relative to active card index
                  const offset = index - activeIndex;
                  const absOffset = Math.abs(offset);
                  
                  // Hide cards that are far away for performance
                  if (absOffset > 3) return null;

                  // 3D Perspective Spatial Calculations
                  let translateX = offset * (window.innerWidth < 640 ? 280 : 420);
                  let scale = Math.max(0.7, 1 - absOffset * 0.15);
                  let rotateY = offset * -18; // Curved perspective tilt
                  let zIndex = 30 - absOffset * 5;
                  let opacity = Math.max(0.2, 1 - absOffset * 0.35);

                  if (reducedMotion) {
                    rotateY = 0;
                    scale = offset === 0 ? 1 : 0.85;
                  }

                  const isCurrent = offset === 0;

                  return (
                    <div
                      key={item.id}
                      onClick={() => {
                        if (isCurrent) setLightboxIndex(index);
                        else setActiveIndex(index);
                      }}
                      style={{
                        transform: `translateX(${translateX}px) scale(${scale}) rotateY(${rotateY}deg) translateZ(${isCurrent ? 50 : -100}px)`,
                        zIndex,
                        opacity,
                        transition: isDragging ? "none" : "all 0.6s cubic-bezier(0.16, 1, 0.3, 1)",
                      }}
                      className={`absolute w-[320px] sm:w-[540px] md:w-[620px] h-[360px] sm:h-[440px] rounded-3xl overflow-hidden glassmorphism border shadow-2xl transition-all duration-500 group ${
                        isCurrent 
                          ? "border-accent/50 shadow-accent/20 cursor-pointer ring-1 ring-accent/30" 
                          : "border-white/10 hover:border-white/30 cursor-pointer"
                      }`}
                    >
                      {/* Card Image */}
                      <div className="relative w-full h-full bg-slate-950">
                        <img
                          src={item.imageUrl}
                          alt={item.altText || item.title || "TEMP TRAVEL Gallery"}
                          className={`w-full h-full object-cover transition-all duration-700 ${
                            isCurrent ? "scale-100 group-hover:scale-105 opacity-90" : "scale-100 opacity-60 grayscale-[30%]"
                          }`}
                          loading={index <= 2 ? "eager" : "lazy"}
                        />

                        {/* Top Category Badge */}
                        <div className="absolute top-5 left-5 z-20 flex items-center gap-2">
                          <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest bg-slate-950/80 text-accent border border-white/10 backdrop-blur-md">
                            {item.category || "FLEET"}
                          </span>
                          {item.isFeatured && (
                            <span className="px-3 py-1 rounded-full text-[10px] font-extrabold bg-accent text-slate-950 flex items-center gap-1 shadow-md">
                              <Sparkles className="w-3 h-3" />
                              <span>FEATURED</span>
                            </span>
                          )}
                        </div>

                        {/* Zoom Hint for Active Card */}
                        {isCurrent && (
                          <div className="absolute top-5 right-5 z-20 opacity-0 group-hover:opacity-100 transition-opacity">
                            <span className="p-2.5 bg-slate-950/80 text-accent rounded-full border border-white/10 flex items-center justify-center backdrop-blur-md shadow-lg">
                              <Maximize2 className="w-4 h-4" />
                            </span>
                          </div>
                        )}

                        {/* Card Gradient Overlay */}
                        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/30 to-transparent z-10" />

                        {/* Card Content Footer */}
                        <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-8 z-20 space-y-2">
                          <div className="flex items-center gap-3 text-xs text-accent font-mono font-semibold">
                            {item.location && (
                              <span className="flex items-center gap-1">
                                <MapPin className="w-3.5 h-3.5" />
                                {item.location}
                              </span>
                            )}
                            {item.location && item.year && <span>&bull;</span>}
                            {item.year && (
                              <span className="flex items-center gap-1">
                                <Calendar className="w-3.5 h-3.5" />
                                {item.year}
                              </span>
                            )}
                          </div>

                          <h3 className="text-xl sm:text-2xl font-black text-slate-50 group-hover:text-accent transition-colors leading-tight">
                            {item.title || "Untitled Journal Asset"}
                          </h3>

                          {item.description && (
                            <p className="text-xs text-slate-300 font-light line-clamp-2 max-w-xl">
                              {item.description}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* GALLERY NAVIGATION CONTROLS */}
            <div className="flex items-center justify-between border-t border-white/5 pt-6 text-xs text-slate-400">
              
              {/* Index Counter */}
              <div className="font-mono font-bold text-slate-300 flex items-center gap-2">
                <span className="text-accent text-sm">{String(activeIndex + 1).padStart(2, "0")}</span>
                <span>/</span>
                <span>{String(items.length).padStart(2, "0")}</span>
              </div>

              {/* Central Arrow Navigation */}
              <div className="flex items-center gap-4">
                <button
                  onClick={handlePrev}
                  className="p-3 bg-slate-900 hover:bg-slate-800 text-slate-200 rounded-full border border-white/10 transition-all hover:scale-105 active:scale-95"
                  title="Previous Card (Left Arrow)"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button
                  onClick={handleNext}
                  className="p-3 bg-slate-900 hover:bg-slate-800 text-slate-200 rounded-full border border-white/10 transition-all hover:scale-105 active:scale-95"
                  title="Next Card (Right Arrow)"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>

              {/* Keyboard Guidance Hint */}
              <div className="hidden md:flex items-center gap-2 text-[11px] font-mono text-slate-500">
                <span className="px-2 py-0.5 bg-slate-900 border border-white/10 rounded">←</span>
                <span className="px-2 py-0.5 bg-slate-900 border border-white/10 rounded">→</span>
                <span>Navigate</span>
                <span className="ml-2 px-2 py-0.5 bg-slate-900 border border-white/10 rounded">Space</span>
                <span>Zoom</span>
              </div>

            </div>

          </div>
        )}

      </div>

      {/* FULLSCREEN INTERACTIVE LIGHTBOX MODAL */}
      {lightboxItem && (
        <div 
          className="fixed inset-0 bg-black/95 backdrop-blur-xl z-50 flex items-center justify-center p-4 sm:p-6"
          onClick={() => setLightboxIndex(null)}
        >
          <div 
            className="relative max-w-5xl w-full bg-slate-900 border border-white/10 rounded-3xl overflow-hidden shadow-2xl flex flex-col lg:flex-row max-h-[90vh]"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              onClick={() => setLightboxIndex(null)}
              className="absolute top-4 right-4 p-2.5 bg-slate-950/80 text-slate-200 hover:text-white rounded-full border border-white/10 z-30 transition-all"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Prev / Next Overlay Buttons */}
            <button
              onClick={() => setLightboxIndex((prev) => (prev !== null ? (prev - 1 + items.length) % items.length : null))}
              className="absolute left-4 top-1/2 -translate-y-1/2 p-3 bg-slate-950/80 text-slate-200 hover:text-accent rounded-full border border-white/10 z-30 transition-all"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
            <button
              onClick={() => setLightboxIndex((prev) => (prev !== null ? (prev + 1) % items.length : null))}
              className="absolute right-4 top-1/2 -translate-y-1/2 p-3 bg-slate-950/80 text-slate-200 hover:text-accent rounded-full border border-white/10 z-30 transition-all"
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
            <div className="lg:w-1/3 p-6 sm:p-8 space-y-6 flex flex-col justify-between bg-slate-900 border-t lg:border-t-0 lg:border-l border-white/10 overflow-y-auto">
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest bg-accent/10 text-accent border border-accent/20">
                    {lightboxItem.category || "FLEET"}
                  </span>
                  {lightboxItem.isFeatured && (
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-accent text-slate-950">
                      FEATURED
                    </span>
                  )}
                </div>

                <h2 className="text-2xl font-extrabold text-slate-50 leading-tight">
                  {lightboxItem.title || "Untitled Journal Asset"}
                </h2>

                {lightboxItem.description && (
                  <p className="text-xs text-slate-300 font-light leading-relaxed">
                    {lightboxItem.description}
                  </p>
                )}

                {lightboxItem.caption && (
                  <div className="p-3 bg-slate-950/60 border border-white/5 rounded-xl text-xs text-slate-400 italic">
                    &ldquo;{lightboxItem.caption}&rdquo;
                  </div>
                )}
              </div>

              <div className="space-y-4 border-t border-white/5 pt-4">
                <div className="space-y-2 text-xs text-slate-400 font-mono">
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
      )}

    </div>
  );
}
