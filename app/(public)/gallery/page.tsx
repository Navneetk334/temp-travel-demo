"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
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
  Car,
  MoveHorizontal
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

  // Smooth Lerp Physics & Scroll Refs
  const containerRef = useRef<HTMLDivElement>(null);
  const targetScrollRef = useRef(0);
  const currentScrollRef = useRef(0);
  const velocityRef = useRef(0);
  const animationFrameRef = useRef<number | null>(null);

  // Dragging & Interaction State
  const isDraggingRef = useRef(false);
  const dragStartXRef = useRef(0);
  const dragStartScrollRef = useRef(0);

  // Custom Follower Cursor State
  const [mousePos, setMousePos] = useState({ x: -100, y: -100 });
  const [cursorText, setCursorText] = useState("DRAG");
  const [isHoveringCard, setIsHoveringCard] = useState(false);
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

  // Smooth Lerp & Parabolic Animation Loop Engine
  useEffect(() => {
    if (loading || items.length === 0) return;

    let prevTime = performance.now();

    const updateMotion = (time: number) => {
      const delta = Math.min((time - prevTime) / 1000, 0.1);
      prevTime = time;

      // Smooth lerp scroll interpolation
      const prevScroll = currentScrollRef.current;
      currentScrollRef.current += (targetScrollRef.current - currentScrollRef.current) * 0.08;
      velocityRef.current = currentScrollRef.current - prevScroll;

      // Card Dimensions & Spacing Math
      const viewportWidth = window.innerWidth;
      const cardWidth = viewportWidth < 640 ? 320 : viewportWidth < 1024 ? 520 : 640;
      const cardGap = viewportWidth < 640 ? 24 : 48;
      const cardSpacing = cardWidth + cardGap;
      const totalWidth = items.length * cardSpacing;

      // Calculate which card is closest to screen center
      let closestIdx = 0;
      let minCenterDist = Infinity;

      if (containerRef.current) {
        const cards = containerRef.current.children;
        for (let i = 0; i < items.length; i++) {
          const cardEl = cards[i] as HTMLElement;
          if (!cardEl) continue;

          // Infinite wrapping position math
          let itemX = (i * cardSpacing - currentScrollRef.current) % totalWidth;
          if (itemX < -cardSpacing) itemX += totalWidth;
          if (itemX > totalWidth - cardSpacing) itemX -= totalWidth;

          // Center relative calculation
          const centerPos = itemX + cardWidth / 2;
          const distFromCenter = centerPos - viewportWidth / 2;
          const normalizedDist = distFromCenter / (viewportWidth / 2);

          if (Math.abs(distFromCenter) < minCenterDist) {
            minCenterDist = Math.abs(distFromCenter);
            closestIdx = i;
          }

          // 3D Parabolic Curve & Velocity Skew Transformations
          if (!reducedMotion) {
            const rotateY = Math.max(-35, Math.min(35, normalizedDist * -24));
            const translateY = Math.pow(normalizedDist, 2) * 52;
            const scale = Math.max(0.68, 1 - Math.pow(Math.abs(normalizedDist), 1.8) * 0.32);
            const skewX = Math.max(-12, Math.min(12, velocityRef.current * 0.15));
            const opacity = Math.max(0.25, 1 - Math.abs(normalizedDist) * 0.55);

            cardEl.style.transform = `translate3d(${itemX}px, ${translateY}px, 0px) rotateY(${rotateY}deg) skewX(${skewX}deg) scale(${scale})`;
            cardEl.style.opacity = `${opacity}`;
            cardEl.style.zIndex = `${30 - Math.round(Math.abs(normalizedDist) * 10)}`;
          } else {
            cardEl.style.transform = `translate3d(${itemX}px, 0px, 0px)`;
            cardEl.style.opacity = Math.abs(normalizedDist) < 0.5 ? "1" : "0.5";
          }
        }
      }

      setActiveCardIndex(closestIdx);
      animationFrameRef.current = requestAnimationFrame(updateMotion);
    };

    animationFrameRef.current = requestAnimationFrame(updateMotion);

    return () => {
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    };
  }, [loading, items.length, reducedMotion]);

  // Trackpad & Mouse Wheel Handler
  const handleWheel = (e: React.WheelEvent) => {
    if (lightboxIndex !== null) return;
    const delta = Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY;
    targetScrollRef.current += delta * 1.2;
  };

  // Mouse Drag Handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    if (lightboxIndex !== null) return;
    isDraggingRef.current = true;
    dragStartXRef.current = e.clientX;
    dragStartScrollRef.current = targetScrollRef.current;
    setCursorText("DRAG");
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    setMousePos({ x: e.clientX, y: e.clientY });

    if (!isDraggingRef.current) return;
    const walk = (e.clientX - dragStartXRef.current) * 1.8;
    targetScrollRef.current = dragStartScrollRef.current - walk;
  };

  const handleMouseUp = () => {
    isDraggingRef.current = false;
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

  // Manual Prev / Next Navigation
  const scrollPrev = () => {
    const cardWidth = window.innerWidth < 640 ? 344 : 688;
    targetScrollRef.current -= cardWidth;
  };

  const scrollNext = () => {
    const cardWidth = window.innerWidth < 640 ? 344 : 688;
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

  const activeItem = items[activeCardIndex];
  const lightboxItem = lightboxIndex !== null ? items[lightboxIndex] : null;

  return (
    <div 
      onWheel={handleWheel}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      className="bg-slate-950 min-h-screen text-slate-100 selection:bg-accent selection:text-slate-950 overflow-x-hidden relative cursor-default"
    >
      
      {/* CUSTOM FLOATING CURSOR FOLLOWER */}
      {!reducedMotion && (
        <div
          style={{
            transform: `translate3d(${mousePos.x - 36}px, ${mousePos.y - 36}px, 0px) scale(${isHoveringCard ? 1.25 : isDraggingRef.current ? 0.9 : 1})`,
            opacity: mousePos.x > 0 ? 1 : 0,
          }}
          className="fixed w-18 h-18 rounded-full bg-accent text-slate-950 font-mono font-black text-[10px] tracking-widest pointer-events-none z-50 flex items-center justify-center shadow-2xl shadow-accent/40 transition-transform duration-100 ease-out uppercase"
        >
          {isHoveringCard ? "VIEW" : cursorText}
        </div>
      )}

      {/* BACKGROUND AMBIENT ENVIRONMENT */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[900px] h-[600px] bg-primary/10 rounded-full blur-[150px] opacity-70" />
        <div className="absolute bottom-10 right-1/4 w-[600px] h-[500px] bg-accent/5 rounded-full blur-[140px] opacity-50" />
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

      <div className="relative z-10 max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-14 space-y-8 flex flex-col justify-between min-h-screen">
        
        {/* HEADER SECTION */}
        <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
          <div className="space-y-3 max-w-2xl">
            <div className="flex items-center gap-2 text-accent text-xs font-mono font-bold tracking-widest uppercase">
              <Sparkles className="w-4 h-4" />
              <span>TEMP TRAVEL &bull; VISUAL JOURNAL</span>
            </div>
            <h1 className="text-4xl sm:text-6xl font-black text-slate-50 tracking-tight leading-none">
              Travel, In Motion.
            </h1>
            <p className="text-slate-400 text-xs sm:text-sm leading-relaxed font-light">
              A visual collection of our journeys, vehicles, destinations and transportation experiences across India.
            </p>
          </div>

          {/* Minimal Controls */}
          <div className="flex items-center gap-3">
            <button
              onClick={scrollPrev}
              className="p-3 bg-slate-900/80 hover:bg-slate-800 text-slate-200 rounded-full border border-white/10 transition-all hover:scale-105 active:scale-95"
              title="Previous (Left Arrow)"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={scrollNext}
              className="p-3 bg-slate-900/80 hover:bg-slate-800 text-slate-200 rounded-full border border-white/10 transition-all hover:scale-105 active:scale-95"
              title="Next (Right Arrow)"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </header>

        {/* MINIMAL CATEGORY FILTER RIBBON */}
        <div className="border-b border-white/10 pb-4">
          <div className="flex items-center gap-2 overflow-x-auto scrollbar-none py-1 text-xs">
            {CATEGORIES.map((cat) => {
              const isActive = activeCategory === cat.value;
              return (
                <button
                  key={cat.value}
                  onClick={() => setActiveCategory(cat.value)}
                  className={`px-4 py-2 rounded-full font-extrabold uppercase tracking-wider transition-all duration-300 whitespace-nowrap border ${
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

        {/* MAIN JESPER LANDBERG-INSPIRED INFINITE CANVAS */}
        {loading ? (
          <div className="h-[55vh] flex flex-col items-center justify-center space-y-4 text-center">
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
          <div className="relative h-[62vh] sm:h-[68vh] w-full overflow-hidden flex items-center">
            
            <div 
              ref={containerRef}
              onMouseDown={handleMouseDown}
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
              className="absolute inset-0 flex items-center perspective-[1200px] touch-pan-x"
            >
              {items.map((item, index) => {
                const formattedIndex = String(index + 1).padStart(2, "0");

                return (
                  <div
                    key={item.id}
                    onMouseEnter={() => setIsHoveringCard(true)}
                    onMouseLeave={() => setIsHoveringCard(false)}
                    onClick={() => setLightboxIndex(index)}
                    className="absolute top-0 left-0 w-[320px] sm:w-[520px] md:w-[600px] lg:w-[640px] h-[55vh] sm:h-[62vh] rounded-3xl overflow-hidden glassmorphism border border-white/10 hover:border-accent/60 transition-colors duration-500 shadow-2xl group cursor-pointer flex flex-col justify-between p-6 sm:p-8"
                  >
                    
                    {/* Background Outline Editorial Number */}
                    <div className="absolute top-4 right-6 font-black text-7xl sm:text-9xl text-transparent stroke-white/10 opacity-30 select-none pointer-events-none font-mono">
                      {formattedIndex}
                    </div>

                    {/* Card Media Background */}
                    <div className="absolute inset-0 bg-slate-950 overflow-hidden z-0">
                      <img
                        src={item.imageUrl}
                        alt={item.altText || item.title || "TEMP TRAVEL Gallery"}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 opacity-75"
                        loading={index <= 2 ? "eager" : "lazy"}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />
                    </div>

                    {/* Card Top Category Tag */}
                    <div className="relative z-10 flex items-center justify-between">
                      <span className="px-3.5 py-1 rounded-full text-[10px] font-black uppercase tracking-widest bg-slate-950/80 text-accent border border-white/10 backdrop-blur-md">
                        {item.category || "FLEET"}
                      </span>
                      {item.isFeatured && (
                        <span className="px-3 py-1 rounded-full text-[10px] font-extrabold bg-accent text-slate-950 flex items-center gap-1 shadow-md">
                          <Sparkles className="w-3 h-3" />
                          <span>FEATURED</span>
                        </span>
                      )}
                    </div>

                    {/* Card Bottom Editorial Metadata */}
                    <div className="relative z-10 space-y-3">
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

                      <h2 className="text-2xl sm:text-4xl font-black text-slate-50 group-hover:text-accent transition-colors leading-tight">
                        {item.title || "Untitled Journal Asset"}
                      </h2>

                      {item.description && (
                        <p className="text-xs text-slate-300 font-light line-clamp-2 max-w-xl">
                          {item.description}
                        </p>
                      )}
                    </div>

                  </div>
                );
              })}
            </div>

          </div>
        )}

        {/* GALLERY FOOTER TOOLBAR */}
        <div className="flex items-center justify-between border-t border-white/10 pt-6 text-xs text-slate-400">
          
          {/* Active Counter */}
          <div className="font-mono font-bold text-slate-300 flex items-center gap-2">
            <span className="text-accent text-base font-black">{String(activeCardIndex + 1).padStart(2, "0")}</span>
            <span>/</span>
            <span>{String(items.length).padStart(2, "0")}</span>
          </div>

          {/* Active Item Title Preview */}
          {activeItem && (
            <div className="hidden sm:block font-mono text-xs text-slate-300 uppercase tracking-widest truncate max-w-md">
              &bull; {activeItem.title || "TEMP TRAVEL MOBILITY"}
            </div>
          )}

          {/* Keyboard Guidance Hint */}
          <div className="flex items-center gap-2 text-[11px] font-mono text-slate-500">
            <span className="px-2 py-0.5 bg-slate-900 border border-white/10 rounded text-slate-300">←</span>
            <span className="px-2 py-0.5 bg-slate-900 border border-white/10 rounded text-slate-300">→</span>
            <span>Navigate</span>
            <span className="hidden sm:inline-block ml-2 px-2 py-0.5 bg-slate-900 border border-white/10 rounded text-slate-300">Space</span>
            <span className="hidden sm:inline-block">Zoom</span>
          </div>

        </div>

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
