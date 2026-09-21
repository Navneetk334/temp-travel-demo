"use client";

import React, { useRef, useState, useEffect } from "react";
import { PhotoItem } from "@/components/shared/photo-coverflow-3d";

interface Props {
  photos: PhotoItem[];
  activeIndex: number;
  onChangeIndex: (index: number) => void;
  onSelectPhoto: (photo: PhotoItem, index: number) => void;
}

export default function CinematicHorizontalSnap({
  photos,
  activeIndex,
  onChangeIndex,
  onSelectPhoto,
}: Props) {
  const containerRef = useRef<HTMLDivElement>(null);

  // Sync scroll position with activeIndex on load or external change
  useEffect(() => {
    if (containerRef.current) {
      const container = containerRef.current;
      const cardWidth = 320 + 24; // 320px width + 24px gap
      container.scrollTo({
        left: activeIndex * cardWidth,
        behavior: "smooth",
      });
    }
  }, [activeIndex]);

  const handleScroll = () => {
    if (!containerRef.current) return;
    const scrollLeft = containerRef.current.scrollLeft;
    const cardWidth = 320 + 24;
    const newIndex = Math.round(scrollLeft / cardWidth);
    if (newIndex !== activeIndex && newIndex >= 0 && newIndex < photos.length) {
      onChangeIndex(newIndex);
    }
  };

  return (
    <div 
      ref={containerRef}
      onScroll={handleScroll}
      className="w-full overflow-x-auto snap-x snap-mandatory flex gap-6 px-[50vw] py-12 hide-scrollbar"
      style={{
        scrollPaddingLeft: 'calc(50vw - 160px)',
      }}
    >
      {photos.map((photo, index) => (
        <div 
          key={photo.id}
          className={`snap-center shrink-0 w-[320px] h-[450px] relative group cursor-pointer rounded-2xl overflow-hidden border transition-all duration-500 ${activeIndex === index ? 'border-accent shadow-[0_0_40px_rgba(250,204,21,0.3)] scale-100 opacity-100' : 'border-slate-800 opacity-60 scale-95 hover:opacity-100'}`}
          onClick={() => onSelectPhoto(photo, index)}
        >
          <img src={photo.imageUrl} alt={photo.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-900/40 to-transparent opacity-90" />
          <div className="absolute bottom-6 left-6 right-6">
             <span className="text-accent text-xs font-mono uppercase tracking-widest mb-2 block">{photo.category}</span>
             <h3 className="text-white font-black text-2xl leading-tight">{photo.title}</h3>
          </div>
        </div>
      ))}
    </div>
  );
}
