"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowUpRight } from "lucide-react";

const images = [
  { id: 1, src: "https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?auto=format&fit=crop&q=80&w=800", title: "Luxury Sedan", category: "Fleet", colSpan: "col-span-12 md:col-span-8", rowSpan: "row-span-2" },
  { id: 2, src: "https://images.unsplash.com/photo-1563720223185-11003d516935?auto=format&fit=crop&q=80&w=800", title: "Premium SUV", category: "Fleet", colSpan: "col-span-12 md:col-span-4", rowSpan: "row-span-1" },
  { id: 3, src: "https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?auto=format&fit=crop&q=80&w=800", title: "Corporate Travel", category: "Service", colSpan: "col-span-12 md:col-span-4", rowSpan: "row-span-1" },
  { id: 4, src: "https://images.unsplash.com/photo-1502877338535-34cb0aa4abd1?auto=format&fit=crop&q=80&w=800", title: "VIP Chauffeur", category: "Service", colSpan: "col-span-12 md:col-span-6", rowSpan: "row-span-1" },
  { id: 5, src: "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&q=80&w=800", title: "Domestic Tours", category: "Tour", colSpan: "col-span-12 md:col-span-6", rowSpan: "row-span-1" },
];

export default function GalleryNine() {
  const [hoveredId, setHoveredId] = useState<number | null>(null);

  return (
    <div className="min-h-screen bg-black text-white p-4 md:p-8 pt-32 pb-20 font-sans">
      
      <header className="max-w-[1800px] mx-auto mb-16 px-2">
        <p className="text-amber-500 font-mono text-xs uppercase tracking-[0.2em] mb-4">Gallery Prototype 9</p>
        <h1 className="text-5xl md:text-7xl font-semibold tracking-tight">Structured Precision.</h1>
      </header>

      <div className="max-w-[1800px] mx-auto grid grid-cols-12 gap-4 auto-rows-[300px]">
        {images.map((img) => {
          const isHovered = hoveredId === img.id;
          const isOtherHovered = hoveredId !== null && hoveredId !== img.id;

          return (
            <motion.div
              key={img.id}
              className={`${img.colSpan} ${img.rowSpan} relative rounded-3xl overflow-hidden cursor-pointer group`}
              onMouseEnter={() => setHoveredId(img.id)}
              onMouseLeave={() => setHoveredId(null)}
              animate={{
                scale: isHovered ? 0.98 : 1,
                opacity: isOtherHovered ? 0.4 : 1,
                filter: isOtherHovered ? "blur(4px) grayscale(100%)" : "blur(0px) grayscale(0%)"
              }}
              transition={{ duration: 0.4, ease: "easeOut" }}
            >
              {/* Image Base */}
              <motion.img 
                src={img.src} 
                alt={img.title}
                className="absolute inset-0 w-full h-full object-cover"
                animate={{
                  scale: isHovered ? 1.05 : 1
                }}
                transition={{ duration: 0.6, ease: "easeOut" }}
              />

              {/* Hover Overlay Slice Effect */}
              <AnimatePresence>
                {isHovered && (
                  <>
                    <motion.div 
                      initial={{ y: "-100%" }}
                      animate={{ y: "0%" }}
                      exit={{ y: "-100%" }}
                      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                      className="absolute inset-0 bg-black/40 z-10"
                    />
                    
                    <div className="absolute inset-0 z-20 flex flex-col justify-between p-8 pointer-events-none">
                      <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ duration: 0.4, delay: 0.1 }}
                      >
                        <span className="bg-white text-black px-4 py-1 rounded-full text-xs font-bold uppercase tracking-widest">
                          {img.category}
                        </span>
                      </motion.div>

                      <div className="flex justify-between items-end">
                        <motion.h2
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: 20 }}
                          transition={{ duration: 0.4, delay: 0.2 }}
                          className="text-4xl md:text-5xl font-semibold tracking-tight"
                        >
                          {img.title}
                        </motion.h2>

                        <motion.div
                          initial={{ opacity: 0, scale: 0, rotate: -45 }}
                          animate={{ opacity: 1, scale: 1, rotate: 0 }}
                          exit={{ opacity: 0, scale: 0, rotate: -45 }}
                          transition={{ duration: 0.4, delay: 0.3 }}
                          className="w-12 h-12 rounded-full bg-white text-black flex items-center justify-center shrink-0"
                        >
                          <ArrowUpRight className="w-6 h-6" />
                        </motion.div>
                      </div>
                    </div>
                  </>
                )}
              </AnimatePresence>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
