"use client";

import React, { useRef, useState, useEffect } from "react";
import { motion, useAnimation, useDragControls } from "framer-motion";
import { Maximize2, X } from "lucide-react";

const galleryImages = [
  { id: 1, src: "https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?auto=format&fit=crop&q=80&w=800", title: "Luxury Sedan", width: 300, height: 400 },
  { id: 2, src: "https://images.unsplash.com/photo-1563720223185-11003d516935?auto=format&fit=crop&q=80&w=800", title: "Premium SUV", width: 400, height: 300 },
  { id: 3, src: "https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?auto=format&fit=crop&q=80&w=800", title: "Corporate Travel", width: 350, height: 450 },
  { id: 4, src: "https://images.unsplash.com/photo-1502877338535-34cb0aa4abd1?auto=format&fit=crop&q=80&w=800", title: "VIP Chauffeur", width: 450, height: 350 },
  { id: 5, src: "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&q=80&w=800", title: "Domestic Tours", width: 300, height: 300 },
  { id: 6, src: "https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&q=80&w=800", title: "Airport Transfers", width: 400, height: 500 },
  { id: 7, src: "https://images.unsplash.com/photo-1500835556837-99ac94a94552?auto=format&fit=crop&q=80&w=800", title: "International Holidays", width: 350, height: 250 },
  { id: 8, src: "https://images.unsplash.com/photo-1494976388531-d1058494cdd8?auto=format&fit=crop&q=80&w=800", title: "Fleet Management", width: 250, height: 350 }
];

export default function GalleryFour() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [selectedImage, setSelectedImage] = useState<typeof galleryImages[0] | null>(null);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  return (
    <div className="relative min-h-screen bg-[#0a0a0a] text-slate-100 overflow-hidden pt-20">
      
      {/* Header Info */}
      <div className="absolute top-24 left-1/2 -translate-x-1/2 text-center z-10 pointer-events-none w-full px-4">
        <h1 className="text-3xl md:text-5xl font-black tracking-tight mb-2 text-white mix-blend-difference">
          Prototype 4: The Physics Canvas
        </h1>
        <p className="text-white/60 text-sm md:text-base font-mono uppercase tracking-[0.2em] mix-blend-difference">
          Grab, drag, and throw images around the screen.
        </p>
      </div>

      {/* Draggable Canvas Area */}
      <div 
        ref={containerRef} 
        className="absolute inset-0 w-full h-full overflow-hidden"
      >
        {isClient && galleryImages.map((img, i) => {
          // Random initial positions based on viewport
          const randomX = Math.floor(Math.random() * (window.innerWidth - img.width));
          const randomY = Math.floor(Math.random() * (window.innerHeight - img.height));
          const randomRotation = Math.floor(Math.random() * 30) - 15;

          return (
            <motion.div
              key={img.id}
              className="absolute group cursor-grab active:cursor-grabbing rounded-xl overflow-hidden shadow-2xl border border-border"
              style={{
                width: img.width,
                height: img.height,
                x: randomX,
                y: randomY,
                rotate: randomRotation
              }}
              drag
              dragConstraints={containerRef}
              dragElastic={0.2}
              dragTransition={{ bounceStiffness: 200, bounceDamping: 20 }}
              whileHover={{ scale: 1.05, zIndex: 50 }}
              whileDrag={{ scale: 1.1, zIndex: 100, rotate: 0 }}
            >
              <img 
                src={img.src} 
                alt={img.title}
                className="w-full h-full object-cover pointer-events-none"
              />
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center pointer-events-none">
                <button 
                  className="pointer-events-auto bg-white/20 backdrop-blur-md p-4 rounded-full text-white hover:bg-amber-500 hover:text-black transition-colors"
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedImage(img);
                  }}
                >
                  <Maximize2 className="w-6 h-6" />
                </button>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Lightbox Overlay */}
      {selectedImage && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[99999] bg-black/95 backdrop-blur-2xl flex items-center justify-center p-4 sm:p-8"
          onClick={() => setSelectedImage(null)}
        >
          <button 
            className="absolute top-6 right-6 p-3 bg-white/10 hover:bg-white/20 rounded-full text-white transition-colors border border-border z-10"
            onClick={(e) => {
              e.stopPropagation();
              setSelectedImage(null);
            }}
          >
            <X className="w-6 h-6" />
          </button>
          
          <motion.div 
            initial={{ scale: 0.8, y: 50 }}
            animate={{ scale: 1, y: 0 }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="relative w-full max-w-5xl aspect-video rounded-3xl overflow-hidden border border-border shadow-2xl" 
            onClick={(e) => e.stopPropagation()}
          >
            <img 
              src={selectedImage.src} 
              alt={selectedImage.title}
              className="w-full h-full object-contain bg-black"
            />
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 to-transparent p-8 text-center">
              <h2 className="text-3xl font-black text-white">{selectedImage.title}</h2>
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
}

