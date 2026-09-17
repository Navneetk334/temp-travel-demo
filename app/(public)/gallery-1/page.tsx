"use client";

import React, { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { X, Maximize2 } from "lucide-react";

// Register ScrollTrigger
if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

const galleryImages = [
  { id: 1, src: "https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?auto=format&fit=crop&q=80&w=1200", title: "Luxury Sedan", category: "Fleet" },
  { id: 2, src: "https://images.unsplash.com/photo-1563720223185-11003d516935?auto=format&fit=crop&q=80&w=800", title: "Premium SUV", category: "Fleet" },
  { id: 3, src: "https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?auto=format&fit=crop&q=80&w=1000", title: "Corporate Event Travel", category: "Corporate" },
  { id: 4, src: "https://images.unsplash.com/photo-1502877338535-34cb0aa4abd1?auto=format&fit=crop&q=80&w=1200", title: "VIP Chauffeur Service", category: "Services" },
  { id: 5, src: "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&q=80&w=800", title: "Domestic Tours", category: "Tours" },
  { id: 6, src: "https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&q=80&w=1000", title: "Airport Transfers", category: "Services" },
  { id: 7, src: "https://images.unsplash.com/photo-1500835556837-99ac94a94552?auto=format&fit=crop&q=80&w=800", title: "International Holidays", category: "Tours" },
  { id: 8, src: "https://images.unsplash.com/photo-1503375811369-02c347b77ce5?auto=format&fit=crop&q=80&w=1200", title: "Executive Commute", category: "Corporate" },
  { id: 9, src: "https://images.unsplash.com/photo-1494976388531-d1058494cdd8?auto=format&fit=crop&q=80&w=800", title: "Fleet Management", category: "Fleet" }
];

export default function GalleryOne() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [selectedImage, setSelectedImage] = useState<typeof galleryImages[0] | null>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Intro Animation
      gsap.from(".gallery-title", {
        y: 50,
        opacity: 0,
        duration: 1,
        ease: "power4.out",
        stagger: 0.2
      });

      // Staggered reveal for images on scroll
      gsap.from(".gallery-item", {
        scrollTrigger: {
          trigger: ".gallery-grid",
          start: "top 80%",
        },
        y: 100,
        opacity: 0,
        duration: 1.2,
        stagger: 0.15,
        ease: "expo.out"
      });
    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <div ref={containerRef} className="min-h-screen bg-slate-950 text-slate-100 overflow-x-hidden pt-24 pb-12">
      {/* Header */}
      <div className="max-w-7xl mx-auto px-6 mb-16 text-center">
        <h1 className="gallery-title text-4xl md:text-6xl font-black tracking-tight mb-4 text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-amber-600">
          Gallery Prototype 1
        </h1>
        <p className="gallery-title text-slate-400 max-w-2xl mx-auto">
          Modern Masonry Reveal. Smooth staggered enter animations triggered on scroll with glassmorphism hover overlays.
        </p>
      </div>

      {/* Masonry Grid */}
      <div className="gallery-grid max-w-7xl mx-auto px-4 columns-1 sm:columns-2 lg:columns-3 gap-6 space-y-6">
        {galleryImages.map((img) => (
          <div 
            key={img.id} 
            className="gallery-item break-inside-avoid relative rounded-3xl overflow-hidden group cursor-pointer border border-white/5 shadow-2xl"
            onClick={() => setSelectedImage(img)}
          >
            {/* Image */}
            <div className="relative aspect-auto">
              <img
                src={img.src}
                alt={img.title}
                className="w-full h-auto object-cover transform transition-transform duration-700 group-hover:scale-110"
                loading="lazy"
              />
            </div>
            
            {/* Hover Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex flex-col justify-end p-6">
              <div className="transform translate-y-8 group-hover:translate-y-0 transition-transform duration-500">
                <span className="text-[10px] font-black uppercase tracking-widest text-amber-400 mb-2 block">
                  {img.category}
                </span>
                <h3 className="text-xl font-bold text-white mb-2">{img.title}</h3>
                <div className="inline-flex items-center gap-2 text-xs font-semibold text-white/70 hover:text-white transition-colors">
                  <Maximize2 className="w-3.5 h-3.5" />
                  View Image
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Lightbox */}
      {selectedImage && (
        <div 
          className="fixed inset-0 z-[999999] bg-black/95 backdrop-blur-xl flex items-center justify-center p-4 sm:p-8"
          onClick={() => setSelectedImage(null)}
        >
          <button 
            className="absolute top-6 right-6 p-3 bg-white/10 hover:bg-white/20 rounded-full text-white transition-colors border border-white/10"
            onClick={(e) => {
              e.stopPropagation();
              setSelectedImage(null);
            }}
          >
            <X className="w-6 h-6" />
          </button>
          
          <div className="relative w-full max-w-5xl aspect-video rounded-2xl overflow-hidden border border-white/10 shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <img 
              src={selectedImage.src} 
              alt={selectedImage.title}
              className="w-full h-full object-contain bg-black"
            />
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 to-transparent p-8">
              <span className="text-amber-400 text-xs font-bold uppercase tracking-widest block mb-2">{selectedImage.category}</span>
              <h2 className="text-3xl font-black text-white">{selectedImage.title}</h2>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
