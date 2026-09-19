"use client";

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { ChevronLeft, ChevronRight, Maximize2, Camera } from 'lucide-react';

export interface PhotoItem {
  id: string | number;
  imageUrl: string;
  thumbUrl?: string;
  title: string;
  palette: string[];
  genre: string;
  photographer: string;
  exif: {
    aperture: string;
    shutterSpeed: string;
    camera: string;
  };
}

// Mock audio synthesizer to prevent crashes
const galleryAudio = {
  playInteractionPing: (freq: number) => {},
  playCameraShutter: () => {},
};

interface PhotoCoverflow3DProps {
  photos: PhotoItem[];
  activeIndex: number;
  onChangeIndex: (index: number) => void;
  onSelectPhoto: (photo: PhotoItem, index: number) => void;
  onInspect: (photo: PhotoItem, index: number) => void;
}

export default function PhotoCoverflow3D({
  photos,
  activeIndex,
  onChangeIndex,
  onSelectPhoto,
  onInspect,
}: PhotoCoverflow3DProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const dragStartX = useRef(0);
  const dragDistance = useRef(0);

  const activePhoto = photos[activeIndex] || photos[0];

  const currentScrollRef = useRef(activeIndex);
  const targetScrollRef = useRef(activeIndex);
  const animationFrameRef = useRef<number>(0);
  const [, setRenderTick] = useState(0);

  // Sync external activeIndex changes to targetScroll
  useEffect(() => {
    // We try to find the shortest path in a circular array
    const total = photos.length;
    let diff = (activeIndex - (targetScrollRef.current % total)) % total;
    if (diff > total / 2) diff -= total;
    if (diff < -total / 2) diff += total;
    
    targetScrollRef.current += diff;
  }, [activeIndex, photos.length]);

  // The Physics Lerp Loop
  useEffect(() => {
    const updateMotion = () => {
      const diff = targetScrollRef.current - currentScrollRef.current;
      
      // If we are far enough, smoothly interpolate
      if (Math.abs(diff) > 0.001) {
        currentScrollRef.current += diff * 0.08;
        setRenderTick((prev) => prev + 1);
      } 
      // If we are extremely close, snap to exact target and STOP rendering
      else if (currentScrollRef.current !== targetScrollRef.current) {
        currentScrollRef.current = targetScrollRef.current;
        setRenderTick((prev) => prev + 1);
      }
      
      animationFrameRef.current = requestAnimationFrame(updateMotion);
    };
    animationFrameRef.current = requestAnimationFrame(updateMotion);
    return () => cancelAnimationFrame(animationFrameRef.current);
  }, []);

  const handlePrev = useCallback(() => {
    targetScrollRef.current -= 1;
    // We still notify parent so the active indicator updates, but use modulo
    const nextIdx = ((targetScrollRef.current % photos.length) + photos.length) % photos.length;
    onChangeIndex(Math.round(nextIdx));
    galleryAudio.playInteractionPing(420);
  }, [photos.length, onChangeIndex]);

  const handleNext = useCallback(() => {
    targetScrollRef.current += 1;
    const nextIdx = ((targetScrollRef.current % photos.length) + photos.length) % photos.length;
    onChangeIndex(Math.round(nextIdx));
    galleryAudio.playInteractionPing(520);
  }, [photos.length, onChangeIndex]);

  // Drag handling for fluid swiping in 3D
  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    dragStartX.current = e.clientX;
    dragDistance.current = 0;
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    dragDistance.current = e.clientX - dragStartX.current;
  };

  const handleMouseUp = () => {
    if (!isDragging) return;
    setIsDragging(false);
    if (dragDistance.current < -60) {
      handleNext();
    } else if (dragDistance.current > 60) {
      handlePrev();
    }
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    dragStartX.current = e.touches[0].clientX;
    dragDistance.current = 0;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    dragDistance.current = e.touches[0].clientX - dragStartX.current;
  };

  const handleTouchEnd = () => {
    if (dragDistance.current < -50) {
      handleNext();
    } else if (dragDistance.current > 50) {
      handlePrev();
    }
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement).tagName)) return;
      if (e.key === 'ArrowLeft') handlePrev();
      if (e.key === 'ArrowRight') handleNext();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handlePrev, handleNext]);

  return (
    <div
      ref={containerRef}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      className="relative w-full h-[540px] sm:h-[600px] flex flex-col items-center justify-center overflow-hidden select-none cursor-grab active:cursor-grabbing bg-transparent"
      style={{
        perspective: '1200px',
      }}
    >
      {/* 3D Atmosphere Stage Background Lighting */}
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
        <div
          className="w-[500px] h-[350px] rounded-full blur-[120px] opacity-25 transition-colors duration-700"
          style={{
            backgroundColor: activePhoto?.palette[1] || '#38bdf8',
          }}
        />
      </div>

      {/* 3D Cards Stage */}
      <div
        className="relative w-full h-[360px] sm:h-[420px] flex items-center justify-center"
        style={{
          transformStyle: 'preserve-3d',
        }}
      >
        {photos.map((photo, index) => {
          const total = photos.length;
          // Calculate offset relative to smooth floating scroll
          let offset = (index - currentScrollRef.current) % total;

          // Wrap around logic for seamless circular carousel
          if (offset > total / 2) offset -= total;
          if (offset < -total / 2) offset += total;

          const isCenter = Math.abs(offset) < 0.5;
          const absOffset = Math.abs(offset);

          // Only render cards within visual depth range
          if (absOffset > 8) return null;

          // 3D Mathematical Transform coordinates
          const translateX = offset * (typeof window !== 'undefined' && window.innerWidth < 640 ? 110 : 280);
          const translateZ = -absOffset * 110;
          // offset > 0 (right side) needs negative rotation to point left edge away from camera
          const rotateY = offset === 0 ? 0 : offset > 0 ? Math.max(-48, offset * -48) : Math.min(48, offset * -48);
          const scale = Math.max(0, 1 - absOffset * 0.08);
          const zIndex = 50 - Math.round(absOffset * 10);

          return (
            <div
              key={photo.id}
              className="absolute w-[260px] sm:w-[340px] h-[340px] sm:h-[420px] group"
              style={{
                transformStyle: 'preserve-3d',
                transform: `translateX(${translateX}px) translateZ(${translateZ}px) rotateY(${rotateY}deg) scale(${scale})`,
                zIndex,
              }}
            >
              {/* The Physical 3D Framed Photograph */}
              <div className="relative w-full h-full rounded-2xl p-3 sm:p-4 bg-slate-900 border border-slate-700/80 shadow-[0_25px_60px_rgba(0,0,0,0.9)] flex flex-col justify-between overflow-hidden">
                {/* Image Frame */}
                <div className="relative w-full h-[230px] sm:h-[280px] rounded-xl overflow-hidden bg-slate-950 border border-slate-800">
                  <img
                    src={photo.imageUrl}
                    alt={photo.title}
                    referrerPolicy="no-referrer"
                    draggable={false}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 relative z-20"
                  />

                  {/* Invisible Click Overlay to guarantee lightbox opening */}
                  <button
                    type="button"
                    className="absolute inset-0 z-[100] w-full h-full cursor-pointer focus:outline-none"
                    onPointerDown={(e) => {
                      e.currentTarget.dataset.downX = e.clientX.toString();
                      e.currentTarget.dataset.downY = e.clientY.toString();
                      e.currentTarget.dataset.time = Date.now().toString();
                    }}
                    onPointerUp={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      
                      const downX = parseFloat(e.currentTarget.dataset.downX || "0");
                      const downY = parseFloat(e.currentTarget.dataset.downY || "0");
                      const time = parseInt(e.currentTarget.dataset.time || "0", 10);
                      
                      const distance = Math.sqrt(Math.pow(e.clientX - downX, 2) + Math.pow(e.clientY - downY, 2));
                      const duration = Date.now() - time;
                      
                      // If pointer moved less than 15 pixels and held for less than 500ms, it's a valid click
                      if (distance < 15 && duration < 500) {
                        onSelectPhoto(photo, index);
                      }
                    }}
                    aria-label={`View ${photo.title} in Lightbox`}
                  />

                  {/* Specular lighting gradient */}
                  <div className="absolute inset-0 bg-gradient-to-tr from-black/40 via-transparent to-white/15 pointer-events-none" />

                  {isCenter && (
                    <div className="absolute top-2.5 left-2.5 z-10 flex items-center gap-1.5">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-slate-900/80 backdrop-blur-md text-accent border border-slate-700">
                        {photo.genre}
                      </span>
                    </div>
                  )}
                </div>

                {/* Card Title & Specs */}
                <div className="pt-2 px-1">
                  <h3 className="text-sm sm:text-base font-semibold text-slate-100 truncate">
                    {photo.title}
                  </h3>
                  <div className="flex items-center justify-between text-xs text-slate-400 mt-0.5">
                    <span className="truncate">{photo.photographer}</span>
                    <span className="text-[11px] font-mono text-slate-500 truncate max-w-[100px]">
                      {photo.exif.aperture} • {photo.exif.shutterSpeed}
                    </span>
                  </div>
                </div>

                {/* Active Indicator Glow Ring */}
                {isCenter && (
                  <div className="absolute inset-0 rounded-2xl ring-2 ring-accent/40 pointer-events-none shadow-[0_0_30px_rgba(250,204,21,0.2)]" />
                )}
              </div>

              {/* 3D Floor Reflection Simulation */}
              <div
                className="w-full h-16 sm:h-20 rounded-2xl mt-2 overflow-hidden opacity-25 pointer-events-none transition-opacity duration-300"
                style={{
                  transform: 'rotateX(180deg) scaleY(0.7)',
                  filter: 'blur(3px)',
                  maskImage: 'linear-gradient(to bottom, rgba(0,0,0,0.7), rgba(0,0,0,0))',
                  WebkitMaskImage: 'linear-gradient(to bottom, rgba(0,0,0,0.7), rgba(0,0,0,0))',
                }}
              >
                <img
                  src={photo.thumbUrl || photo.imageUrl}
                  alt="Reflection"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          );
        })}
      </div>

    </div>
  );
}
