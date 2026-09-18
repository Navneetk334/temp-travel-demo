"use client";

import React, { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

const galleryImages = [
  { id: 1, src: "https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?auto=format&fit=crop&q=80&w=800", title: "Luxury Sedan", subtitle: "Unmatched Comfort" },
  { id: 2, src: "https://images.unsplash.com/photo-1563720223185-11003d516935?auto=format&fit=crop&q=80&w=800", title: "Premium SUV", subtitle: "Command the Road" },
  { id: 3, src: "https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?auto=format&fit=crop&q=80&w=800", title: "Corporate Travel", subtitle: "Executive Standards" },
  { id: 4, src: "https://images.unsplash.com/photo-1502877338535-34cb0aa4abd1?auto=format&fit=crop&q=80&w=800", title: "VIP Chauffeur", subtitle: "Professional Drivers" },
  { id: 5, src: "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&q=80&w=800", title: "Domestic Tours", subtitle: "Explore the Country" },
  { id: 6, src: "https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&q=80&w=800", title: "Airport Transfers", subtitle: "On-Time Always" },
  { id: 7, src: "https://images.unsplash.com/photo-1500835556837-99ac94a94552?auto=format&fit=crop&q=80&w=800", title: "International Holidays", subtitle: "Global Escapes" },
];

export default function GalleryThree() {
  const [activeIndex, setActiveIndex] = useState(3);

  const nextSlide = () => {
    setActiveIndex((prev) => (prev + 1) % galleryImages.length);
  };

  const prevSlide = () => {
    setActiveIndex((prev) => (prev - 1 + galleryImages.length) % galleryImages.length);
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") nextSlide();
      if (e.key === "ArrowLeft") prevSlide();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <div className="min-h-screen bg-background text-slate-100 overflow-hidden flex flex-col justify-center pt-20">
      
      {/* Header */}
      <div className="text-center mb-12 relative z-20 px-4">
        <h1 className="text-4xl md:text-6xl font-black tracking-tight mb-4 text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-amber-600">
          Gallery Prototype 3
        </h1>
        <p className="text-slate-400 max-w-2xl mx-auto mb-2 text-lg">
          The 3D Coverflow Carousel. Highly interactive and perfect for high-end showcases.
        </p>
        <p className="text-amber-500/70 text-sm font-mono tracking-widest uppercase">
          Use Arrow Keys to Navigate
        </p>
      </div>

      {/* 3D Carousel Stage */}
      <div className="relative w-full max-w-7xl mx-auto h-[60vh] flex items-center justify-center perspective-[1200px] overflow-hidden">
        
        {galleryImages.map((img, i) => {
          // Calculate relative position
          let offset = i - activeIndex;
          if (offset < -Math.floor(galleryImages.length / 2)) offset += galleryImages.length;
          if (offset > Math.floor(galleryImages.length / 2)) offset -= galleryImages.length;

          // Determine styles based on offset
          const isActive = offset === 0;
          const isVisible = Math.abs(offset) <= 2;
          
          let transform = "translateX(0) scale(1) rotateY(0deg)";
          let zIndex = 10;
          let opacity = 1;
          
          if (!isActive) {
            const sign = Math.sign(offset);
            const absOffset = Math.abs(offset);
            transform = `translateX(${sign * 40 * absOffset}%) scale(${1 - 0.2 * absOffset}) rotateY(${-sign * 45}deg) translateZ(${-100 * absOffset}px)`;
            zIndex = 10 - absOffset;
            opacity = isVisible ? 1 - 0.3 * absOffset : 0;
          }

          return (
            <div
              key={img.id}
              className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 transition-all duration-700 ease-out cursor-pointer ${
                !isVisible ? "pointer-events-none" : ""
              }`}
              style={{
                transform,
                zIndex,
                opacity,
                width: "min(60vw, 500px)",
                aspectRatio: "3/4"
              }}
              onClick={() => setActiveIndex(i)}
            >
              <div className="w-full h-full rounded-2xl overflow-hidden border border-border shadow-[0_20px_50px_rgba(0,0,0,0.5)] relative group">
                <img 
                  src={img.src} 
                  alt={img.title}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className={`absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent transition-opacity duration-500 ${isActive ? 'opacity-80' : 'opacity-40 group-hover:opacity-60'}`} />
                
                {/* Text only fully visible on active slide */}
                <div className={`absolute bottom-0 left-0 right-0 p-8 transition-all duration-500 ${isActive ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}`}>
                  <span className="text-amber-400 text-xs font-bold uppercase tracking-widest block mb-2">{img.subtitle}</span>
                  <h3 className="text-3xl font-black text-white">{img.title}</h3>
                </div>
              </div>
            </div>
          );
        })}

        {/* Controls */}
        <button 
          onClick={prevSlide}
          className="absolute left-4 md:left-12 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/5 border border-border flex items-center justify-center text-white hover:bg-amber-500 hover:text-slate-950 transition-colors z-20"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>
        <button 
          onClick={nextSlide}
          className="absolute right-4 md:right-12 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/5 border border-border flex items-center justify-center text-white hover:bg-amber-500 hover:text-slate-950 transition-colors z-20"
        >
          <ChevronRight className="w-6 h-6" />
        </button>

      </div>
    </div>
  );
}

