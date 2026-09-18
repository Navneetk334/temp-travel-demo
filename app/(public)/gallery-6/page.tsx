"use client";

import React, { useRef, useState, useEffect } from "react";
import { gsap } from "gsap";
import { ChevronRight, ChevronLeft } from "lucide-react";

const images = [
  { id: 1, src: "https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?auto=format&fit=crop&q=80&w=1920", title: "Luxury Sedan" },
  { id: 2, src: "https://images.unsplash.com/photo-1563720223185-11003d516935?auto=format&fit=crop&q=80&w=1920", title: "Premium SUV" },
  { id: 3, src: "https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?auto=format&fit=crop&q=80&w=1920", title: "Corporate Travel" },
  { id: 4, src: "https://images.unsplash.com/photo-1502877338535-34cb0aa4abd1?auto=format&fit=crop&q=80&w=1920", title: "VIP Chauffeur" },
];

export default function GallerySix() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const filterRef = useRef<SVGFEColorMatrixElement>(null);
  const displacementRef = useRef<SVGFEDisplacementMapElement>(null);
  const currentImgRef = useRef<HTMLImageElement>(null);
  const nextImgRef = useRef<HTMLImageElement>(null);

  const [nextIndex, setNextIndex] = useState(0);

  const goToSlide = (newIndex: number) => {
    if (isTransitioning || newIndex === currentIndex) return;
    setIsTransitioning(true);
    setNextIndex(newIndex);

    const tl = gsap.timeline({
      onComplete: () => {
        setCurrentIndex(newIndex);
        setIsTransitioning(false);
        gsap.set(displacementRef.current, { attr: { scale: 0 } });
        gsap.set(currentImgRef.current, { opacity: 1, scale: 1 });
        gsap.set(nextImgRef.current, { opacity: 0, scale: 1.1 });
      }
    });

    // 1. Ramp up the displacement map scale (the liquid ripple)
    tl.to(displacementRef.current, {
      attr: { scale: 150 },
      duration: 1,
      ease: "power2.inOut"
    }, 0);

    // 2. Scale up and fade out current image slightly
    tl.to(currentImgRef.current, {
      opacity: 0,
      scale: 1.1,
      duration: 1,
      ease: "power2.inOut"
    }, 0);

    // 3. Fade in next image
    tl.to(nextImgRef.current, {
      opacity: 1,
      scale: 1,
      duration: 1.2,
      ease: "power2.out"
    }, 0.4);

    // 4. Ramp down the displacement map scale
    tl.to(displacementRef.current, {
      attr: { scale: 0 },
      duration: 1,
      ease: "power2.out"
    }, 0.8);
  };

  const next = () => goToSlide((currentIndex + 1) % images.length);
  const prev = () => goToSlide((currentIndex - 1 + images.length) % images.length);

  return (
    <div className="relative w-full h-screen bg-black overflow-hidden">
      
      {/* Hidden SVG Filter for Liquid Distortion */}
      <svg className="absolute w-0 h-0">
        <defs>
          <filter id="liquid-filter" x="-20%" y="-20%" width="140%" height="140%">
            <feTurbulence type="fractalNoise" baseFrequency="0.02" numOctaves="3" result="noise" />
            <feDisplacementMap 
              ref={displacementRef}
              in="SourceGraphic" 
              in2="noise" 
              scale="0" 
              xChannelSelector="R" 
              yChannelSelector="G" 
            />
          </filter>
        </defs>
      </svg>

      {/* Images Container */}
      <div 
        className="absolute inset-0 w-full h-full"
        style={{ filter: "url(#liquid-filter)" }}
      >
        <img 
          ref={currentImgRef}
          src={images[currentIndex].src} 
          alt={images[currentIndex].title}
          className="absolute inset-0 w-full h-full object-cover z-10"
        />
        <img 
          ref={nextImgRef}
          src={images[nextIndex].src} 
          alt={images[nextIndex].title}
          className="absolute inset-0 w-full h-full object-cover opacity-0 scale-110 z-20"
        />
      </div>

      {/* Dark Overlay for Text Readability */}
      <div className="absolute inset-0 bg-black/30 z-30 pointer-events-none" />

      {/* Overlay Content */}
      <div className="absolute inset-0 z-40 flex flex-col justify-between p-8 sm:p-16">
        <header className="flex justify-between items-start">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-[0.2em] uppercase text-white">Prototype 6</h1>
            <p className="text-white/60 font-mono text-xs mt-2">Liquid WebGL Shader Style Transition</p>
          </div>
          <div className="text-white/80 font-mono text-sm">
            0{currentIndex + 1} / 0{images.length}
          </div>
        </header>

        <div className="flex justify-between items-end">
          <div className="overflow-hidden">
            <h2 className="text-5xl sm:text-7xl lg:text-9xl font-black text-white mix-blend-overlay uppercase tracking-tighter leading-none transform transition-all duration-700">
              {images[currentIndex].title.split(" ")[0]}<br/>
              {images[currentIndex].title.split(" ").slice(1).join(" ")}
            </h2>
          </div>

          <div className="flex gap-4">
            <button 
              onClick={prev}
              disabled={isTransitioning}
              className="w-16 h-16 rounded-full border border-white/30 flex items-center justify-center text-white hover:bg-white hover:text-black transition-all disabled:opacity-50"
            >
              <ChevronLeft className="w-8 h-8" />
            </button>
            <button 
              onClick={next}
              disabled={isTransitioning}
              className="w-16 h-16 rounded-full border border-white/30 flex items-center justify-center text-white hover:bg-white hover:text-black transition-all disabled:opacity-50"
            >
              <ChevronRight className="w-8 h-8" />
            </button>
          </div>
        </div>
      </div>

    </div>
  );
}

