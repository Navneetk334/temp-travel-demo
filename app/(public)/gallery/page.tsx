"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { 
  ChevronLeft, 
  ChevronRight, 
  X, 
  MapPin, 
  Calendar, 
  Sparkles, 
  ArrowRight,
  Car
} from "lucide-react";
import Portal from "@/components/shared/portal";

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
    const handleGlobalWheel = (e: WheelEvent) => {
      if (lightboxIndex !== null) return;
      // Convert vertical deltaY or horizontal deltaX into horizontal cylinder scroll
      const delta = Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY;
      targetScrollRef.current += delta * 1.35;
    };

    window.addEventListener("wheel", handleGlobalWheel, { passive: true });
    return () => window.removeEventListener("wheel", handleGlobalWheel);
  }, [lightboxIndex]);

  // Smooth Lerp & Concave Curved Screen Animation Loop Engine
  useEffect(() => {
    if (loading || items.length === 0) return;

    let prevTime = performance.now();

    const updateMotion = (time: number) => {
      const delta = Math.min((time - prevTime) / 1000, 0.1);
      prevTime = time;

      // Lerp smooth scroll calculation
      const prevScroll = currentScrollRef.current;
      currentScrollRef.current += (targetScrollRef.current - currentScrollRef.current) * 0.08;
      velocityRef.current = currentScrollRef.current - prevScroll;

      const viewportWidth = window.innerWidth;
      const cardWidth = viewportWidth < 640 ? 320 : viewportWidth < 1024 ? 540 : 640;
      const cardGap = viewportWidth < 640 ? 20 : 44;
      const cardSpacing = cardWidth + cardGap;
      const totalWidth = items.length * cardSpacing;

      let closestIdx = 0;
      let minCenterDist = Infinity;

      if (containerRef.current) {
        const cards = containerRef.current.children;
        for (let i = 0; i < items.length; i++) {
          const cardEl = cards[i] as HTMLElement;
          if (!cardEl) continue;

          // Wrap scroll position infinitely
          let itemX = (i * cardSpacing - currentScrollRef.current) % totalWidth;
          if (itemX < -cardSpacing) itemX += totalWidth;
          if (itemX > totalWidth - cardSpacing) itemX -= totalWidth;

          const centerPos = itemX + cardWidth / 2;
          const distFromCenter = centerPos - viewportWidth / 2;
          const normalizedDist = distFromCenter / (viewportWidth / 2);

          if (Math.abs(distFromCenter) < minCenterDist) {
            minCenterDist = Math.abs(distFromCenter);
            closestIdx = i;
          }

          if (!reducedMotion) {
            // Concave Curved Screen Monitor Perspective Transformation
            let rotateY = Math.max(-32, Math.min(32, normalizedDist * -26));
            let rotateX = 0;

            // Apply interactive card mouse hover tilt if this card is currently hovered
            if (hoveredCardIndex === i) {
              rotateY += cardTilt.x;
              rotateX = cardTilt.y;
            }

            const translateZ = (1 - Math.pow(Math.abs(normalizedDist), 2)) * 70 - 80;
            const scale = Math.max(0.72, 1 - Math.pow(Math.abs(normalizedDist), 1.8) * 0.28);
            const opacity = Math.max(0.35, 1 - Math.abs(normalizedDist) * 0.5);
            const skewX = Math.max(-10, Math.min(10, velocityRef.current * 0.14));

            cardEl.style.transform = `translate3d(${itemX}px, 0px, ${translateZ}px) rotateY(${rotateY}deg) rotateX(${rotateX}deg) skewX(${skewX}deg) scale(${scale})`;
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
  }, [loading, items.length, reducedMotion, hoveredCardIndex, cardTilt]);

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
    <div 
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      className="bg-black h-full w-full text-slate-100 selection:bg-accent selection:text-slate-950 overflow-hidden relative cursor-none select-none"
    >
      
      {/* SVG CONCAVE CURVED MONITOR SCREEN MASK DEFINITION */}
      <svg width="0" height="0" className="absolute pointer-events-none">
        <defs>
          <clipPath id="concave-screen-clip" clipPathUnits="objectBoundingBox">
            <path d="M 0 0 C 0.22 0.035, 0.78 0.035, 1 0 L 1 1 C 0.78 0.965, 0.22 0.965, 0 1 Z" />
          </clipPath>
        </defs>
      </svg>

      {/* FLOATING JESPER LANDBERG WHITE HAND CURSOR POINTER */}
      {!reducedMotion && isPointerVisible && (
        <div
          style={{
            transform: `translate3d(${mousePos.x - 14}px, ${mousePos.y - 14}px, 0px) scale(${isDraggingRef.current ? 0.9 : 1})`,
          }}
          className="fixed pointer-events-none z-50 transition-transform duration-75 ease-out text-white drop-shadow-lg"
        >
          {/* White Hand Icon */}
          <svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor" className="text-white">
            <path d="M9 11.25V4.5C9 3.67157 9.67157 3 10.5 3C11.3284 3 12 3.67157 12 4.5V10.25M12 4.5C12 3.67157 12.6716 3 13.5 3C14.3284 3 15 3.67157 15 4.5V10.25M15 4.5C15 3.67157 15.6716 3 16.5 3C17.3284 3 18 3.67157 18 4.5V14.25C18 17.5637 15.3137 20.25 12 20.25H11.25C8.35051 20.25 5.86178 18.3976 5.06836 15.6033L4.17937 12.4674C3.89668 11.4704 4.54518 10.4578 5.53982 10.2603C6.30939 10.1074 7.08643 10.4907 7.42938 11.1912L9 14.4074V11.25Z" />
          </svg>
        </div>
      )}

      {/* MINIMAL CATEGORY FILTER RIBBON (TOP BAR) */}
      <div className="absolute top-24 sm:top-28 left-0 right-0 z-40 px-6 sm:px-12 flex justify-center pointer-events-auto">
        <div className="flex items-center gap-2 overflow-x-auto scrollbar-none py-1 text-[11px] font-mono bg-slate-950/80 p-1.5 rounded-full border border-white/10 backdrop-blur-md">
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
            <p className="text-xs text-slate-400">Please refresh or check back shortly.</p>
          </div>
        </div>
      ) : items.length === 0 ? (
        <div className="h-full flex items-center justify-center text-center p-6">
          <div className="space-y-2">
            <h3 className="text-xl font-extrabold text-slate-200">More journeys coming soon.</h3>
            <p className="text-xs text-slate-400">No media assets found matching the selected category.</p>
          </div>
        </div>
      ) : (
        <div className="relative h-full w-full flex items-center justify-center overflow-hidden">
          
          {/* 3D CAROUSEL CONTAINER */}
          <div 
            ref={containerRef}
            onMouseDown={handleMouseDown}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            className="absolute inset-0 flex items-center perspective-[1200px] touch-pan-x z-20 pointer-events-auto"
          >
            {items.map((item, index) => {
              const isCurrent = index === activeCardIndex;

              return (
                <div
                  key={item.id}
                  onMouseMove={(e) => handleCardMouseMove(e, index)}
                  onMouseLeave={handleCardMouseLeave}
                  onClick={() => {
                    if (isCurrent) setLightboxIndex(index);
                    else {
                      const cardWidth = window.innerWidth < 640 ? 340 : 580;
                      targetScrollRef.current = index * cardWidth;
                    }
                  }}
                  className="absolute top-1/2 -translate-y-1/2 left-0 w-[320px] sm:w-[540px] md:w-[620px] h-[380px] sm:h-[480px] md:h-[520px] transition-all duration-200 group"
                >
                  {/* JESPER LANDBERG CONCAVE CURVED MONITOR SCREEN PANEL */}
                  <div 
                    style={{ clipPath: "url(#concave-screen-clip)" }}
                    className="relative w-full h-full bg-slate-900 border border-white/10 rounded-2xl overflow-hidden shadow-2xl flex flex-col justify-between p-6 sm:p-8 transition-transform duration-200 ease-out"
                  >
                    
                    {/* Background Full-Bleed Image */}
                    <div className="absolute inset-0 bg-slate-950 overflow-hidden">
                      <img
                        src={item.imageUrl}
                        alt={item.altText || item.title || "TEMP TRAVEL Gallery"}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 opacity-80"
                        loading={index <= 2 ? "eager" : "lazy"}
                      />
                      {/* 3D Screen Surface Glare Gradient */}
                      <div 
                        className="absolute inset-0 pointer-events-none"
                        style={{
                          background: `linear-gradient(110deg, rgba(255, 255, 255, 0.15) 0%, transparent 45%, rgba(0, 0, 0, 0.5) 100%)`
                        }}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent" />
                    </div>

                    {/* Top Left Category Pill Tag */}
                    <div className="relative z-10 flex items-center justify-between">
                      <span className="px-3 py-1 rounded-full text-[10px] font-mono font-bold uppercase tracking-widest bg-slate-950/80 text-accent border border-white/10 backdrop-blur-md">
                        {item.category || "FLEET"}
                      </span>
                      {item.isFeatured && (
                        <span className="px-2.5 py-0.5 rounded-full text-[9px] font-extrabold bg-accent text-slate-950 flex items-center gap-1 shadow-md">
                          <Sparkles className="w-3 h-3" />
                          <span>FEATURED</span>
                        </span>
                      )}
                    </div>

                    {/* Bottom Content Overlays */}
                    <div className="relative z-10 flex items-end justify-between gap-4">
                      
                      {/* Bottom Left Title & Location */}
                      <div className="space-y-1 max-w-xs sm:max-w-md">
                        <h3 className="text-xl sm:text-3xl font-extrabold text-slate-50 leading-tight group-hover:text-accent transition-colors">
                          {item.title || "Untitled Journal Asset"}
                        </h3>
                        <div className="flex items-center gap-2 text-xs text-slate-300 font-mono">
                          {item.location && <span>{item.location}</span>}
                          {item.location && item.year && <span>&bull;</span>}
                          {item.year && <span>{item.year}</span>}
                        </div>
                      </div>

                      {/* Bottom Right Circular Arrow Button (Jesper Landberg style) */}
                      <div className="w-10 h-10 rounded-full bg-slate-950/80 border border-white/20 flex items-center justify-center text-white group-hover:bg-accent group-hover:text-slate-950 transition-all shrink-0">
                        <ArrowRight className="w-4 h-4" />
                      </div>

                    </div>

                  </div>
                </div>
              );
            })}
          </div>

          {/* JESPER LANDBERG 3D PERSPECTIVE FLOOR GRID */}
          <div className="absolute bottom-0 inset-x-0 h-64 pointer-events-none z-10 overflow-hidden">
            <div 
              className="w-full h-full opacity-[0.22]"
              style={{
                backgroundImage: `linear-gradient(to right, rgba(255, 255, 255, 0.4) 1px, transparent 1px),
                                  linear-gradient(to bottom, rgba(255, 255, 255, 0.4) 1px, transparent 1px)`,
                backgroundSize: "80px 80px",
                transform: "perspective(900px) rotateX(76deg) translateY(180px)",
                transformOrigin: "center top",
              }}
            />
          </div>

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
              <div className="lg:w-1/3 p-6 sm:p-8 flex flex-col justify-between space-y-6 bg-slate-900 border-t lg:border-t-0 lg:border-l border-white/5 overflow-y-auto">
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
                    <p className="text-xs text-slate-300 leading-relaxed font-sans">
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
        </Portal>
      )}

    </div>
  );
}
