"use client";

import React from "react";
import { motion } from "framer-motion";

const images = [
  { id: 1, src: "https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?auto=format&fit=crop&q=80&w=2000", title: "The Executive Sedan", desc: "Uncompromising luxury and precision engineering." },
  { id: 2, src: "https://images.unsplash.com/photo-1563720223185-11003d516935?auto=format&fit=crop&q=80&w=2000", title: "Premium SUV", desc: "Command presence on any road." },
  { id: 3, src: "https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?auto=format&fit=crop&q=80&w=2000", title: "Corporate Travel", desc: "Seamless logistics for the modern enterprise." }
];

const FadeInSection = ({ children }: { children: React.ReactNode }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 50, scale: 0.98 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: false, amount: 0.3 }}
      transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }} // Apple-like ease
      className="w-full flex flex-col items-center"
    >
      {children}
    </motion.div>
  );
};

export default function GallerySeven() {
  return (
    <div className="min-h-screen bg-[#F5F5F7] text-[#1d1d1f] overflow-x-hidden selection:bg-black selection:text-white pb-32">
      
      {/* Minimal Header */}
      <div className="pt-40 pb-20 px-4 text-center max-w-4xl mx-auto">
        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.2 }}
          className="text-xs font-semibold uppercase tracking-widest text-slate-500 mb-4"
        >
          Gallery Prototype 7
        </motion.p>
        <motion.h1 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.3 }}
          className="text-5xl md:text-7xl font-semibold tracking-tight"
        >
          Profoundly elegant. <br/> Completely minimal.
        </motion.h1>
      </div>

      {/* Large Image Showcase */}
      <div className="space-y-40 max-w-[1400px] mx-auto px-4 md:px-12">
        {images.map((img) => (
          <FadeInSection key={img.id}>
            <div className="text-center mb-8">
              <h2 className="text-4xl md:text-5xl font-semibold tracking-tight mb-3">{img.title}</h2>
              <p className="text-xl md:text-2xl text-[#86868b]">{img.desc}</p>
            </div>
            <div className="w-full rounded-[2rem] overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.1)] bg-white">
              <img 
                src={img.src} 
                alt={img.title}
                className="w-full h-auto aspect-video md:aspect-[21/9] object-cover"
              />
            </div>
          </FadeInSection>
        ))}
      </div>
    </div>
  );
}
