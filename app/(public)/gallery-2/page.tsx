"use client";

import React, { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ArrowRight } from "lucide-react";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

const galleryImages = [
  { id: 1, src: "https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?auto=format&fit=crop&q=80&w=1200", title: "Luxury Sedan", subtitle: "Unmatched Comfort" },
  { id: 2, src: "https://images.unsplash.com/photo-1563720223185-11003d516935?auto=format&fit=crop&q=80&w=1200", title: "Premium SUV", subtitle: "Command the Road" },
  { id: 3, src: "https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?auto=format&fit=crop&q=80&w=1200", title: "Corporate Travel", subtitle: "Executive Standards" },
  { id: 4, src: "https://images.unsplash.com/photo-1502877338535-34cb0aa4abd1?auto=format&fit=crop&q=80&w=1200", title: "VIP Chauffeur", subtitle: "Professional Drivers" },
  { id: 5, src: "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&q=80&w=1200", title: "Domestic Tours", subtitle: "Explore the Country" },
  { id: 6, src: "https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&q=80&w=1200", title: "Airport Transfers", subtitle: "On-Time Always" }
];

export default function GalleryTwo() {
  const containerRef = useRef<HTMLDivElement>(null);
  const scrollWrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let ctx = gsap.context(() => {
      const sections = gsap.utils.toArray(".horizontal-panel");
      
      gsap.to(sections, {
        xPercent: -100 * (sections.length - 1),
        ease: "none",
        scrollTrigger: {
          trigger: scrollWrapperRef.current,
          pin: true,
          scrub: 1,
          snap: 1 / (sections.length - 1),
          end: () => "+=" + scrollWrapperRef.current!.offsetWidth * 2
        }
      });
      
      // Parallax effect on images
      gsap.utils.toArray(".parallax-img").forEach((img: any, i) => {
        gsap.to(img, {
          xPercent: 20,
          ease: "none",
          scrollTrigger: {
            trigger: scrollWrapperRef.current,
            scrub: true,
            start: "top top",
            end: () => "+=" + scrollWrapperRef.current!.offsetWidth * 2
          }
        });
      });

    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <div ref={containerRef} className="bg-background text-slate-100 overflow-x-hidden">
      <div className="h-[80vh] flex flex-col items-center justify-center text-center px-4 relative z-10">
        <h1 className="text-4xl md:text-6xl font-black tracking-tight mb-6 text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-amber-600">
          Gallery Prototype 2
        </h1>
        <p className="text-slate-400 max-w-2xl mx-auto mb-10 text-lg">
          The Cinematic Horizontal Scroll. Scroll down to move sideways through a premium, parallax-infused showcase.
        </p>
        <div className="animate-bounce flex flex-col items-center gap-2 text-amber-400">
          <span className="text-xs font-bold uppercase tracking-widest">Scroll Down</span>
          <ArrowRight className="w-6 h-6 rotate-90" />
        </div>
      </div>

      <div ref={scrollWrapperRef} className="h-screen w-[600vw] flex flex-nowrap bg-surface border-y border-border shadow-[inset_0_0_100px_rgba(0,0,0,0.8)]">
        {galleryImages.map((img, i) => (
          <div key={img.id} className="horizontal-panel w-screen h-screen flex items-center justify-center p-8 sm:p-20 relative overflow-hidden">
            {/* Background number */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[30vw] font-black text-white/5 pointer-events-none z-0">
              0{i + 1}
            </div>
            
            <div className="relative w-full max-w-5xl aspect-video overflow-hidden rounded-3xl border border-border shadow-2xl z-10 group">
              <img 
                src={img.src} 
                alt={img.title}
                className="parallax-img absolute top-0 left-[-10%] w-[120%] h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/20 to-transparent flex flex-col justify-end p-10 sm:p-16">
                <span className="text-amber-400 font-bold tracking-[0.2em] uppercase text-sm mb-2 opacity-0 group-hover:opacity-100 transform translate-y-4 group-hover:translate-y-0 transition-all duration-500 delay-100">
                  {img.subtitle}
                </span>
                <h2 className="text-4xl sm:text-6xl font-black text-white opacity-0 group-hover:opacity-100 transform translate-y-4 group-hover:translate-y-0 transition-all duration-500">
                  {img.title}
                </h2>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="h-[50vh] flex items-center justify-center text-slate-500">
        End of Gallery
      </div>
    </div>
  );
}

