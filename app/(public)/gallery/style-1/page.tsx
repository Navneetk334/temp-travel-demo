"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";
import Footer from "@/components/shared/footer";
import Lightbox from "@/components/shared/lightbox";
import CinematicHorizontalSnap from "@/components/shared/cinematic-horizontal-snap";

const CATEGORIES = [
  { label: "ALL JOURNEYS", value: "all" },
  { label: "FLEET", value: "fleet" },
  { label: "CORPORATE", value: "corporate" },
];

export default function GalleryStyle() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState("all");
  const [lightboxIndex, setLightboxIndex] = useState(null);
  const [activeCardIndex, setActiveCardIndex] = useState(0);

  const fetchGallery = async (category) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/gallery?category=${encodeURIComponent(category)}&sortBy=featured&limit=50`);
      if (res.ok) {
        const data = await res.json();
        setItems(data.media || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGallery(activeCategory);
  }, [activeCategory]);

  return (
    <div className="bg-background min-h-screen w-full text-slate-900 selection:bg-accent selection:text-slate-950 flex flex-col pt-36">
      <div className="relative z-40 px-6 flex justify-center mb-8">
        <div className="flex gap-2 overflow-x-auto scrollbar-none py-1 text-[11px] font-mono bg-slate-900/90 p-1.5 rounded-full border border-slate-800">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.value}
              onClick={() => setActiveCategory(cat.value)}
              className={`px-5 py-2 rounded-full whitespace-nowrap transition-all ${activeCategory === cat.value ? 'bg-accent text-slate-950 font-black' : 'text-slate-400 hover:text-slate-200'}`}
            >
              {cat.label}
            </button>
          ))}
          <Link href="/gallery/style-1" className="px-5 py-2 text-slate-400 hover:text-white">Style 1</Link>
          <Link href="/gallery/style-2" className="px-5 py-2 text-slate-400 hover:text-white">Style 2</Link>
          <Link href="/gallery/style-3" className="px-5 py-2 text-slate-400 hover:text-white">Style 3</Link>
          <Link href="/gallery/style-4" className="px-5 py-2 text-slate-400 hover:text-white">Style 4</Link>
        </div>
      </div>

      <div className="flex-grow">
        {loading ? (
          <div className="flex justify-center items-center h-64"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent"></div></div>
        ) : (
          <CinematicHorizontalSnap
            photos={items}
            activeIndex={activeCardIndex}
            onChangeIndex={setActiveCardIndex}
            onSelectPhoto={(_, index) => setLightboxIndex(index)}
          />
        )}
      </div>

      <Lightbox lightboxItem={lightboxIndex !== null ? items[lightboxIndex] : null} items={items} setLightboxIndex={setLightboxIndex} />
      <Footer />
    </div>
  );
}
