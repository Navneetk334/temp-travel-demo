"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

const images = [
  "https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?auto=format&fit=crop&q=80&w=800",
  "https://images.unsplash.com/photo-1563720223185-11003d516935?auto=format&fit=crop&q=80&w=800",
  "https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?auto=format&fit=crop&q=80&w=800",
  "https://images.unsplash.com/photo-1502877338535-34cb0aa4abd1?auto=format&fit=crop&q=80&w=800",
  "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&q=80&w=800",
  "https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&q=80&w=800",
  "https://images.unsplash.com/photo-1500835556837-99ac94a94552?auto=format&fit=crop&q=80&w=800",
];

interface TrailImage {
  id: number;
  src: string;
  x: number;
  y: number;
}

export default function GalleryFive() {
  const [trail, setTrail] = useState<TrailImage[]>([]);
  const imageIndexRef = useRef(0);
  const idCounterRef = useRef(0);
  const lastTimeRef = useRef(0);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = (e: React.MouseEvent) => {
    const now = Date.now();
    // Throttle image drops to one every 100ms
    if (now - lastTimeRef.current < 100) return;
    lastTimeRef.current = now;

    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    
    // Create new image
    const newImage: TrailImage = {
      id: idCounterRef.current++,
      src: images[imageIndexRef.current % images.length],
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };

    imageIndexRef.current++;

    setTrail((prev) => [...prev, newImage]);

    // Remove the image after 1.5 seconds
    setTimeout(() => {
      setTrail((prev) => prev.filter((img) => img.id !== newImage.id));
    }, 1500);
  };

  return (
    <div 
      ref={containerRef}
      className="relative min-h-screen bg-slate-950 overflow-hidden cursor-crosshair"
      onMouseMove={handleMouseMove}
      onTouchMove={(e) => {
        // support touch trails for mobile testing
        const touch = e.touches[0];
        handleMouseMove({ clientX: touch.clientX, clientY: touch.clientY } as unknown as React.MouseEvent);
      }}
    >
      {/* Centered Instructions */}
      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none z-0">
        <h1 className="text-4xl md:text-6xl font-black tracking-widest text-slate-800 uppercase mix-blend-color-dodge">
          Explore
        </h1>
        <p className="text-slate-600 font-mono mt-4 text-xs tracking-[0.3em]">
          Move your cursor around the screen
        </p>
      </div>

      {/* Render Trail Images */}
      <AnimatePresence>
        {trail.map((img) => (
          <motion.div
            key={img.id}
            initial={{ opacity: 0, scale: 0.5, rotate: Math.random() * 20 - 10 }}
            animate={{ opacity: 1, scale: 1, rotate: Math.random() * 20 - 10 }}
            exit={{ opacity: 0, scale: 0.8, filter: "blur(10px)" }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="absolute z-10 pointer-events-none overflow-hidden rounded-xl shadow-2xl border border-white/5"
            style={{
              left: img.x,
              top: img.y,
              width: 300,
              height: 400,
              x: "-50%",
              y: "-50%",
            }}
          >
            <img 
              src={img.src} 
              alt="Trail" 
              className="w-full h-full object-cover"
            />
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
