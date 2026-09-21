"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { PhotoItem } from "@/components/shared/photo-coverflow-3d";

interface Props {
  photos: PhotoItem[];
  onSelectPhoto: (photo: PhotoItem, index: number) => void;
}

export default function FocusExpansionCarousel({
  photos,
  onSelectPhoto,
}: Props) {
  const [hovered, setHovered] = useState<number | null>(null);

  return (
    <div className="w-full flex h-[500px] gap-2 px-6 sm:px-12 py-8 max-w-7xl mx-auto">
      {photos.map((photo, index) => {
        const isActive = hovered === index || (hovered === null && index === Math.floor(photos.length / 2));
        
        return (
          <motion.div
            key={photo.id}
            layout
            className={`relative rounded-2xl overflow-hidden cursor-pointer shadow-2xl border ${isActive ? 'flex-grow border-accent' : 'w-16 sm:w-24 opacity-60 hover:opacity-100 border-slate-700'}`}
            onMouseEnter={() => setHovered(index)}
            onMouseLeave={() => setHovered(null)}
            onClick={() => onSelectPhoto(photo, index)}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
          >
            <img 
              src={photo.imageUrl} 
              alt={photo.title} 
              className="absolute inset-0 w-full h-full object-cover origin-center" 
            />
            <div className={`absolute inset-0 bg-black/50 transition-opacity duration-300 ${isActive ? 'opacity-0' : 'opacity-100'}`} />
            
            {isActive && (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="absolute bottom-0 inset-x-0 p-6 sm:p-8 bg-gradient-to-t from-slate-950 via-slate-900/80 to-transparent"
              >
                <span className="text-accent text-xs font-mono uppercase tracking-widest">{photo.category}</span>
                <h3 className="text-2xl sm:text-4xl font-black text-white mt-1">{photo.title}</h3>
              </motion.div>
            )}
          </motion.div>
        );
      })}
    </div>
  );
}
