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
  onSelectPhoto: (photo: PhotoItem) => void;
  onInspect: (photo: PhotoItem) => void;
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

  const handlePrev = useCallback(() => {
    const nextIdx = (activeIndex - 1 + photos.length) % photos.length;
    onChangeIndex(nextIdx);
    galleryAudio.playInteractionPing(420);
  }, [activeIndex, photos.length, onChangeIndex]);

  const handleNext = useCallback(() => {
    const nextIdx = (activeIndex + 1) % photos.length;
    onChangeIndex(nextIdx);
    galleryAudio.playInteractionPing(520);
  }, [activeIndex, photos.length, onChangeIndex]);

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
      className="relative w-full h-[540px] sm:h-[600px] flex flex-col items-center justify-center overflow-hidden select-none cursor-grab active:cursor-grabbing bg-[#0a0a0c]"
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

      {/* 3D Horizon Line / Floor Reflection Plane */}
      <div className="absolute bottom-16 sm:bottom-20 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-slate-700/50 to-transparent pointer-events-none" />

      {/* 3D Cards Stage */}
      <div
        className="relative w-full max-w-4xl h-[360px] sm:h-[420px] flex items-center justify-center"
        style={{
          transformStyle: 'preserve-3d',
        }}
      >
        {photos.map((photo, index) => {
          // Calculate offset relative to active index
          let offset = index - activeIndex;
          const total = photos.length;

          // Wrap around logic for seamless circular carousel
          if (offset > total / 2) offset -= total;
          if (offset < -total / 2) offset += total;

          const isCenter = offset === 0;
          const absOffset = Math.abs(offset);

          // Only render cards within visual depth range
          if (absOffset > 4) return null;

          // 3D Mathematical Transform coordinates
          const translateX = offset * (typeof window !== 'undefined' && window.innerWidth < 640 ? 110 : 190);
          const translateZ = -absOffset * 160;
          const rotateY = offset === 0 ? 0 : offset > 0 ? -48 : 48;
          const scale = 1 - absOffset * 0.12;
          const opacity = Math.max(0.2, 1 - absOffset * 0.22);
          const zIndex = 50 - absOffset;

          return (
            <div
              key={photo.id}
              onClick={(e) => {
                e.stopPropagation();
                if (isCenter) {
                  galleryAudio.playCameraShutter();
                  onSelectPhoto(photo);
                } else {
                  onChangeIndex(index);
                  galleryAudio.playInteractionPing(460);
                }
              }}
              className="absolute w-[260px] sm:w-[340px] h-[340px] sm:h-[420px] transition-all duration-500 ease-out cursor-pointer group"
              style={{
                transformStyle: 'preserve-3d',
                transform: `translateX(${translateX}px) translateZ(${translateZ}px) rotateY(${rotateY}deg) scale(${scale})`,
                opacity,
                zIndex,
              }}
            >
              {/* The Physical 3D Framed Photograph */}
              <div className="relative w-full h-full rounded-2xl p-3 sm:p-4 bg-slate-900/90 border border-slate-700/80 shadow-[0_25px_60px_rgba(0,0,0,0.8)] backdrop-blur-xl flex flex-col justify-between overflow-hidden">
                {/* Image Frame */}
                <div className="relative w-full h-[230px] sm:h-[280px] rounded-xl overflow-hidden bg-slate-950 border border-white/10">
                  <img
                    src={photo.imageUrl}
                    alt={photo.title}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />

                  {/* Specular lighting gradient */}
                  <div className="absolute inset-0 bg-gradient-to-tr from-black/40 via-transparent to-white/15 pointer-events-none" />

                  {/* Badges on active card */}
                  {isCenter && (
                    <div className="absolute top-2.5 left-2.5 z-10 flex items-center gap-1.5">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-slate-950/80 backdrop-blur-md text-sky-300 border border-white/15">
                        {photo.genre}
                      </span>
                    </div>
                  )}

                  {isCenter && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onInspect(photo);
                      }}
                      className="absolute top-2.5 right-2.5 p-2 rounded-xl bg-slate-950/80 hover:bg-slate-900 text-slate-300 hover:text-white backdrop-blur-md border border-white/15 shadow-lg transition-colors z-10"
                      title="Inspect in Full Lightbox"
                    >
                      <Maximize2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                {/* Card Title & Specs */}
                <div className="pt-2 px-1">
                  <h3 className="text-sm sm:text-base font-semibold text-white truncate">
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
                  <div className="absolute inset-0 rounded-2xl ring-2 ring-sky-500/40 pointer-events-none shadow-[0_0_30px_rgba(56,189,248,0.2)]" />
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

      {/* Navigation Controls Bar */}
      <div className="relative z-30 mt-6 sm:mt-10 flex items-center gap-4">
        <button
          type="button"
          onClick={handlePrev}
          className="p-3 rounded-2xl bg-slate-900/80 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 shadow-xl transition-all hover:scale-105"
          title="Previous Photograph (←)"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>

        {/* Active Metadata Pill */}
        <div
          onClick={() => onSelectPhoto(activePhoto)}
          className="cursor-pointer px-5 py-2.5 rounded-2xl bg-slate-950/80 hover:bg-slate-900 backdrop-blur-xl border border-slate-800/90 shadow-2xl flex items-center gap-3 transition-all hover:border-slate-700"
        >
          <div className="flex items-center gap-2">
            <Camera className="w-4 h-4 text-sky-400" />
            <span className="text-xs font-semibold text-white">{activePhoto?.title}</span>
          </div>
          <span className="text-slate-600">•</span>
          <span className="text-xs text-slate-400 font-mono hidden sm:inline">
            {activePhoto?.exif?.camera}
          </span>
          <span className="text-slate-600 hidden sm:inline">•</span>
          <span className="text-[11px] text-sky-400 font-medium">Click to Inspect EXIF →</span>
        </div>

        <button
          type="button"
          onClick={handleNext}
          className="p-3 rounded-2xl bg-slate-900/80 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 shadow-xl transition-all hover:scale-105"
          title="Next Photograph (→)"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}
