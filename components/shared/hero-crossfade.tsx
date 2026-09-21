"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";


interface Props {
  photos: any[];
  onSelectPhoto: (photo: any, index: number) => void;
}

export default function HeroCrossfade({
  photos,
  onSelectPhoto,
}: Props) {
  const [active, setActive] = useState(0);

  useEffect(() => {
    if (photos.length === 0) return;
    const timer = setInterval(() => {
      setActive((p) => (p + 1) % photos.length);
    }, 4000);
    return () => clearInterval(timer);
  }, [photos.length]);

  if (!photos.length) return null;

  const activePhoto = photos[active];

  return (
    <div className="w-full max-w-6xl mx-auto flex flex-col gap-6 px-4 sm:px-8 py-8">
      {/* Main Hero Image */}
      <div 
        className="w-full h-[50vh] sm:h-[65vh] relative rounded-3xl overflow-hidden border border-slate-800 shadow-2xl cursor-pointer group bg-slate-950"
        onClick={() => onSelectPhoto(activePhoto, active)}
      >
        <AnimatePresence mode="wait">
          <motion.img
            key={active}
            src={activePhoto.imageUrl}
            alt={activePhoto.title}
            initial={{ opacity: 0, scale: 1.05 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8 }}
            className="absolute inset-0 w-full h-full object-cover"
          />
        </AnimatePresence>
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-900/40 to-transparent opacity-80" />
        <div className="absolute bottom-8 left-8 right-8">
           <span className="text-accent text-sm font-mono uppercase tracking-widest">{activePhoto.category}</span>
           <h2 className="text-3xl sm:text-5xl font-black text-white mt-2">{activePhoto.title}</h2>
        </div>
        
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
           <div className="bg-black/50 backdrop-blur-md text-white px-6 py-3 rounded-full font-bold uppercase tracking-widest text-sm border border-slate-600">
             Click to Expand
           </div>
        </div>
      </div>

      {/* Thumbnails */}
      <div className="flex gap-4 overflow-x-auto pb-4 hide-scrollbar snap-x snap-mandatory">
        {photos.map((photo, i) => (
          <button
            key={photo.id}
            onClick={() => setActive(i)}
            className={`snap-center relative w-32 h-20 rounded-xl overflow-hidden shrink-0 border-2 transition-all duration-300 ${active === i ? 'border-accent scale-105 shadow-[0_0_20px_rgba(250,204,21,0.2)]' : 'border-transparent opacity-50 hover:opacity-100'}`}
          >
            <img src={photo.imageUrl} alt="" className="w-full h-full object-cover" />
          </button>
        ))}
      </div>
    </div>
  );
}
