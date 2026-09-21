"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { 
  ChevronLeft, 
  ChevronRight, 
  X, 
  Maximize2,
  Camera,
  MapPin, 
  Calendar, 
  Sparkles, 
  ArrowRight,
  ArrowDown,
  Car
} from "lucide-react";
import Portal from "@/components/shared/portal";
import PhotoCoverflow3D, { PhotoItem } from "@/components/shared/photo-coverflow-3d";
import Footer from "@/components/shared/footer";
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
  { label: "ALL JOURNEYS", value: "all" },
  { label: "FLEET", value: "fleet" },
  { label: "CORPORATE", value: "corporate" },
  { label: "AIRPORT TRANSFERS", value: "airport transfer" },
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
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const [reducedMotion, setReducedMotion] = useState(false);

  // Motion Lerp Engine Refs
  const containerRef = useRef<HTMLDivElement>(null);
  const targetScrollRef = useRef(0);
  const currentScrollRef = useRef(0);
  const velocityRef = useRef(0);
  const animationFrameRef = useRef<number | null>(null);

  // Dragging Ref
  const isDraggingRef = useRef(false);
  const dragStartXRef = useRef(0);
  const dragStartScrollRef = useRef(0);

  // Mouse Position & Hover Card Tilt State
  const [mousePos, setMousePos] = useState({ x: -100, y: -100 });
  const [isPointerVisible, setIsPointerVisible] = useState(false);
  const [hoveredCardIndex, setHoveredCardIndex] = useState<number | null>(null);
  const [cardTilt, setCardTilt] = useState({ x: 0, y: 0 });
  const [activeCardIndex, setActiveCardIndex] = useState(0);

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
      targetScrollRef.current = 0;
      currentScrollRef.current = 0;
      velocityRef.current = 0;
      setActiveCardIndex(0);
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

  // Global Window Wheel Scroll Handler (Enables full-screen mouse wheel scrolling everywhere)
  useEffect(() => {
    let wheelTimeout: NodeJS.Timeout | null = null;
    
    const handleGlobalWheel = (e: WheelEvent) => {
      if (lightboxIndex !== null || items.length === 0) return;
      
      // Debounce the wheel event to prevent rapid fire scrolling
      if (wheelTimeout) return;
      
      const delta = Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY;
      
      if (delta > 10) {
        // Scroll Right/Down
        setActiveCardIndex((prev) => (prev + 1) % items.length);
        wheelTimeout = setTimeout(() => { wheelTimeout = null; }, 400);
      } else if (delta < -10) {
        // Scroll Left/Up
        setActiveCardIndex((prev) => (prev - 1 + items.length) % items.length);
        wheelTimeout = setTimeout(() => { wheelTimeout = null; }, 400);
      }
    };

    window.addEventListener("wheel", handleGlobalWheel, { passive: true });
    return () => window.removeEventListener("wheel", handleGlobalWheel);
  }, [lightboxIndex, items.length]);

  // Smooth Autoplay is now handled continuously in PhotoCoverflow3D

  // Mouse Drag Handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    if (lightboxIndex !== null) return;
    isDraggingRef.current = true;
    dragStartXRef.current = e.clientX;
    dragStartScrollRef.current = targetScrollRef.current;
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    setMousePos({ x: e.clientX, y: e.clientY });
    if (!isPointerVisible) setIsPointerVisible(true);

    if (!isDraggingRef.current) return;
    const walk = (e.clientX - dragStartXRef.current) * 1.8;
    targetScrollRef.current = dragStartScrollRef.current - walk;
  };

  const handleMouseUp = () => {
    isDraggingRef.current = false;
  };

  // Card Mouse Hover Tilt Calculation
  const handleCardMouseMove = (e: React.MouseEvent<HTMLDivElement>, index: number) => {
    const cardEl = e.currentTarget;
    const rect = cardEl.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;
    setCardTilt({
      x: (x / (rect.width / 2)) * 8, // rotateY tilt
      y: -(y / (rect.height / 2)) * 8, // rotateX tilt
    });
    setHoveredCardIndex(index);
  };

  const handleCardMouseLeave = () => {
    setHoveredCardIndex(null);
    setCardTilt({ x: 0, y: 0 });
  };

  // Touch Swipe Handlers (Mobile)
  const handleTouchStart = (e: React.TouchEvent) => {
    if (lightboxIndex !== null) return;
    isDraggingRef.current = true;
    dragStartXRef.current = e.touches[0].clientX;
    dragStartScrollRef.current = targetScrollRef.current;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDraggingRef.current) return;
    const walk = (e.touches[0].clientX - dragStartXRef.current) * 2;
    targetScrollRef.current = dragStartScrollRef.current - walk;
  };

  const handleTouchEnd = () => {
    isDraggingRef.current = false;
  };

  const scrollPrev = () => {
    const cardWidth = window.innerWidth < 640 ? 340 : 580;
    targetScrollRef.current -= cardWidth;
  };

  const scrollNext = () => {
    const cardWidth = window.innerWidth < 640 ? 340 : 580;
    targetScrollRef.current += cardWidth;
  };

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

      if (e.key === "ArrowRight") scrollNext();
      if (e.key === "ArrowLeft") scrollPrev();
      if ((e.key === " " || e.key === "Enter") && items[activeCardIndex]) {
        setLightboxIndex(activeCardIndex);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [lightboxIndex, items, activeCardIndex]);

  const lightboxItem = lightboxIndex !== null ? items[lightboxIndex] : null;

  return (
    <div className="bg-background min-h-screen w-full text-slate-900 selection:bg-accent selection:text-slate-950 overflow-x-hidden relative select-none flex flex-col">
      <div className="flex-grow relative flex flex-col pt-36 pb-8" onMouseMove={handleMouseMove} onMouseUp={handleMouseUp}>
      
      {/* SVG CONCAVE CURVED MONITOR SCREEN MASK DEFINITION */}
      <svg width="0" height="0" className="absolute pointer-events-none">
        <defs>
          <clipPath id="concave-screen-clip" clipPathUnits="objectBoundingBox">
            <path d="M 0 0 C 0.22 0.035, 0.78 0.035, 1 0 L 1 1 C 0.78 0.965, 0.22 0.965, 0 1 Z" />
          </clipPath>
        </defs>
      </svg>



      <div className="relative z-40 px-6 sm:px-12 flex justify-center pointer-events-auto mt-4 mb-8">
        <div className="flex items-center gap-2 overflow-x-auto scrollbar-none py-1 text-[11px] font-mono bg-[#0f172a]/90 p-1.5 rounded-full border border-slate-800 backdrop-blur-md">
          {CATEGORIES.map((cat) => {
            const isActive = activeCategory === cat.value;
            return (
              <button
                key={cat.value}
                onClick={() => setActiveCategory(cat.value)}
                className={`px-3.5 py-1.5 rounded-full font-bold uppercase tracking-wider transition-all duration-300 whitespace-nowrap ${
                  isActive
                    ? "bg-accent text-slate-950 shadow-md font-extrabold"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                {cat.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* MAIN JESPER LANDBERG 3D CURVED SCREEN CAROUSEL */}
      {loading ? (
        <div className="h-full flex flex-col items-center justify-center space-y-4 text-center">
          <div className="w-10 h-10 rounded-full border-2 border-accent border-t-transparent animate-spin" />
          <div className="text-xs font-mono tracking-widest text-accent uppercase font-bold">
            LOADING 3D CANVAS...
          </div>
        </div>
      ) : error ? (
        <div className="h-full flex items-center justify-center text-center p-6">
          <div className="space-y-2">
            <h3 className="text-base font-bold text-slate-200">Unable to load journal media</h3>
            <p className="text-xs text-slate-500">Please refresh or check back shortly.</p>
          </div>
        </div>
      ) : items.length === 0 ? (
        <div className="h-full flex items-center justify-center text-center p-6">
          <div className="space-y-2">
            <h3 className="text-xl font-extrabold text-slate-200">More journeys coming soon.</h3>
            <p className="text-xs text-slate-500">No media assets found matching the selected category.</p>
          </div>
        </div>
      ) : (
        <div className="flex-1 relative w-full flex items-center justify-center overflow-hidden z-20">
          <PhotoCoverflow3D 
            photos={items.map((item, idx) => ({
              id: item.id || idx,
              imageUrl: item.imageUrl,
              thumbUrl: item.imageUrl,
              title: item.title || "Untitled",
              palette: ['#000', 'transparent'],
              genre: item.category || "GALLERY",
              photographer: item.location || "TEMP TRAVEL",
              exif: {
                aperture: "f/2.8",
                shutterSpeed: "1/500s",
                camera: item.year || "2024",
              }
            }))}
            activeIndex={activeCardIndex}
            onChangeIndex={setActiveCardIndex}
            onSelectPhoto={(_, index) => setLightboxIndex(index)}
            onInspect={(_, index) => setLightboxIndex(index)}
          />
        </div>
      )}

      {/* FULLSCREEN INTERACTIVE LIGHTBOX MODAL */}
      {lightboxItem && (
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
      )}

      </div>
      <Footer />
    </div>
  );
}

