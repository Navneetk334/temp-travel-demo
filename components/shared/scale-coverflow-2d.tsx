"use client";

import React, { useState, useRef, useEffect } from "react";
import { PhotoItem } from "@/components/shared/photo-coverflow-3d";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface Props {
  photos: PhotoItem[];
  activeIndex: number;
  onChangeIndex: (index: number) => void;
  onSelectPhoto: (photo: PhotoItem, index: number) => void;
}

export default function ScaleCoverflow2D({
  photos,
  activeIndex,
  onChangeIndex,
  onSelectPhoto,
}: Props) {
  const [dragX, setDragX] = useState(0);
  const isDragging = useRef(false);
  const startX = useRef(0);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const handlePointerDown = (e: React.PointerEvent) => {
    isDragging.current = true;
    startX.current = e.clientX;
    setDragX(0);
  };
  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging.current) return;
    setDragX(e.clientX - startX.current);
  };
  const handlePointerUp = () => {
    if (!isDragging.current) return;
    isDragging.current = false;
    
    if (dragX < -50) onChangeIndex((activeIndex + 1) % photos.length);
    if (dragX > 50) onChangeIndex((activeIndex - 1 + photos.length) % photos.length);
    setDragX(0);
  };

  const isMobile = isClient && window.innerWidth < 640;
  const cardWidth = isMobile ? 220 : 400;

  return (
    <div className="relative w-full py-12 flex flex-col items-center">
      <div 
        className="relative w-full h-[380px] sm:h-[500px] flex items-center justify-center overflow-hidden touch-none"
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerUp}
      >
        {photos.map((photo, i) => {
          let offset = (i - activeIndex + photos.length) % photos.length;
          if (offset > photos.length / 2) offset -= photos.length;
          if (offset < -photos.length / 2) offset += photos.length;
          
          const isCenter = offset === 0;
          const absOffset = Math.abs(offset);
          if (absOffset > 4) return null;

          const translateX = offset * cardWidth + (isDragging.current ? dragX : 0);
          const scale = Math.max(0.6, 1 - absOffset * 0.15);
          const opacity = isCenter ? 1 : Math.max(0, 1 - absOffset * 0.25);
          const zIndex = 50 - Math.round(absOffset * 10);

          return (
            <div
              key={photo.id}
              className={`absolute w-[240px] sm:w-[360px] h-[320px] sm:h-[460px] cursor-pointer origin-center ${isCenter ? 'drop-shadow-2xl' : ''}`}
              style={{
                transform: `translateX(${translateX}px) scale(${scale})`,
                zIndex,
                opacity,
                transition: isDragging.current ? 'none' : 'transform 0.5s cubic-bezier(0.25, 1, 0.5, 1), opacity 0.5s ease-out',
              }}
              onClick={() => {
                if (Math.abs(dragX) < 10) onSelectPhoto(photo, i);
              }}
            >
              <div className="w-full h-full rounded-2xl overflow-hidden border border-slate-700 bg-slate-900 flex flex-col relative group">
                <img src={photo.imageUrl} alt={photo.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent opacity-80" />
                
                {isCenter && (
                  <div className="absolute bottom-4 inset-x-4 text-center">
                    <h3 className="text-white font-black text-xl line-clamp-1">{photo.title}</h3>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <div className="flex gap-4 mt-8">
        <button 
          className="p-3 bg-slate-900 text-white rounded-full hover:bg-accent hover:text-slate-950 transition-colors"
          onClick={() => onChangeIndex((activeIndex - 1 + photos.length) % photos.length)}
        >
          <ChevronLeft className="w-6 h-6" />
        </button>
        <button 
          className="p-3 bg-slate-900 text-white rounded-full hover:bg-accent hover:text-slate-950 transition-colors"
          onClick={() => onChangeIndex((activeIndex + 1) % photos.length)}
        >
          <ChevronRight className="w-6 h-6" />
        </button>
      </div>
    </div>
  );
}
