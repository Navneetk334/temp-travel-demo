"use client";

import React, { useRef, useEffect } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

const images = [
  { id: 1, src: "https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?auto=format&fit=crop&q=80&w=1200", title: "THE SEDAN", desc: "A study in motion." },
  { id: 2, src: "https://images.unsplash.com/photo-1563720223185-11003d516935?auto=format&fit=crop&q=80&w=1200", title: "SUV", desc: "Unapologetic presence." },
  { id: 3, src: "https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?auto=format&fit=crop&q=80&w=1200", title: "VIP", desc: "Chauffeur exclusivity." },
  { id: 4, src: "https://images.unsplash.com/photo-1502877338535-34cb0aa4abd1?auto=format&fit=crop&q=80&w=1200", title: "TOUR", desc: "Escape the ordinary." },
];

export default function GalleryEight() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let ctx = gsap.context(() => {
      // Parallax on images
      gsap.utils.toArray(".parallax-img").forEach((img: any) => {
        gsap.to(img, {
          yPercent: 20,
          ease: "none",
          scrollTrigger: {
            trigger: img.parentElement,
            start: "top bottom",
            end: "bottom top",
            scrub: true
          }
        });
      });
      
      // Parallax on large text
      gsap.utils.toArray(".parallax-text").forEach((text: any) => {
        gsap.to(text, {
          y: -100,
          ease: "none",
          scrollTrigger: {
            trigger: text.parentElement,
            start: "top bottom",
            end: "bottom top",
            scrub: true
          }
        });
      });

    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <div ref={containerRef} className="min-h-screen bg-[#EFEFEF] text-[#111111] overflow-x-hidden pt-32 pb-40 font-serif">
      
      <div className="px-6 md:px-12 max-w-[1600px] mx-auto">
        <header className="mb-32 border-b border-black/20 pb-12 flex flex-col md:flex-row justify-between items-end">
          <div>
            <h1 className="text-7xl md:text-9xl font-normal uppercase tracking-tighter leading-[0.8]">
              Volume<br/>One
            </h1>
          </div>
          <div className="text-right mt-12 md:mt-0 max-w-sm">
            <p className="font-sans text-xs uppercase tracking-[0.2em] mb-4">Gallery Prototype 8</p>
            <p className="text-xl italic text-black/60">An editorial exploration of motion, design, and uncompromising luxury.</p>
          </div>
        </header>

        {/* Asymmetrical Grid 1 */}
        <div className="relative mb-40 flex flex-col md:flex-row items-center justify-between gap-12">
          <div className="w-full md:w-5/12 z-10 relative">
            <h2 className="parallax-text text-8xl md:text-[10rem] uppercase tracking-tighter leading-[0.8] absolute -left-12 -top-20 mix-blend-difference text-white pointer-events-none">
              {images[0].title}
            </h2>
            <div className="overflow-hidden aspect-[3/4] w-full">
              <img src={images[0].src} className="parallax-img w-full h-[120%] object-cover origin-top" alt="Sedan" />
            </div>
            <p className="font-sans text-sm uppercase tracking-widest mt-6">{images[0].desc}</p>
          </div>

          <div className="w-full md:w-4/12 md:mt-64 relative">
            <div className="overflow-hidden aspect-square w-full">
              <img src={images[1].src} className="parallax-img w-full h-[120%] object-cover origin-top" alt="SUV" />
            </div>
            <p className="font-sans text-sm uppercase tracking-widest mt-6 text-right">{images[1].desc}</p>
            <h2 className="parallax-text text-6xl md:text-8xl uppercase tracking-tighter leading-[0.8] absolute -right-8 -bottom-16">
              {images[1].title}
            </h2>
          </div>
        </div>

        {/* Asymmetrical Grid 2 */}
        <div className="relative mb-20 flex flex-col md:flex-row-reverse items-center justify-between gap-12">
          <div className="w-full md:w-7/12 z-10 relative">
            <div className="overflow-hidden aspect-[16/9] w-full">
              <img src={images[2].src} className="parallax-img w-full h-[120%] object-cover origin-top" alt="VIP" />
            </div>
            <h2 className="parallax-text text-6xl md:text-9xl uppercase tracking-tighter leading-[0.8] absolute -left-20 top-1/2 -translate-y-1/2 mix-blend-difference text-white">
              {images[2].title}
            </h2>
            <p className="font-sans text-sm uppercase tracking-widest mt-6">{images[2].desc}</p>
          </div>

          <div className="w-full md:w-3/12 md:-mt-40 relative">
            <div className="overflow-hidden aspect-[3/5] w-full">
              <img src={images[3].src} className="parallax-img w-full h-[120%] object-cover origin-top" alt="Tour" />
            </div>
            <p className="font-sans text-sm uppercase tracking-widest mt-6">{images[3].desc}</p>
          </div>
        </div>

      </div>
    </div>
  );
}

