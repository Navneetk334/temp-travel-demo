"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Car } from "lucide-react";

export default function Header() {
  const pathname = usePathname();

  useEffect(() => {
    // Ensure site is locked to main theme
    document.documentElement.classList.remove("light");
    document.documentElement.classList.add("dark");
    localStorage.removeItem("theme");
  }, []);

  const leftLinks = [
    { name: "About", href: "/about" },
    { name: "Services", href: "/services" },
    { name: "Fleet", href: "/fleet" },
  ];

  const rightLinks = [
    { name: "Blog", href: "/blog" },
    { name: "Gallery", href: "/gallery" },
    { name: "Contact", href: "/contact" },
  ];

  return (
    <header className="fixed top-4 inset-x-0 z-50 px-4 flex justify-center pointer-events-none">
      <div className="pointer-events-auto bg-slate-950/70 backdrop-blur-xl border border-white/10 rounded-full px-6 py-2.5 shadow-2xl shadow-slate-950/80 flex items-center gap-6 sm:gap-8 max-w-fit mx-auto transition-all duration-300 hover:border-amber-400/30">
        
        {/* Left Navigation Links */}
        <nav className="hidden md:flex items-center gap-6 sm:gap-8 text-xs font-black uppercase tracking-wider text-slate-300">
          {leftLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`transition-colors py-1 ${
                pathname === link.href || (link.href !== "/" && pathname?.startsWith(link.href))
                  ? "text-accent font-extrabold"
                  : "hover:text-accent font-bold"
              }`}
            >
              {link.name}
            </Link>
          ))}
        </nav>

        {/* Centered Brand Logo (Functions as Home Link) */}
        <Link href="/" className="flex items-center gap-2 px-2 group shrink-0" title="Temp Travel Home">
          <div className="bg-primary p-1.5 rounded-lg text-primary-foreground border border-accent/30 group-hover:scale-105 transition-transform shadow-md">
            <Car className="w-4 h-4 sm:w-5 sm:h-5 text-accent" />
          </div>
          <div className="text-left">
            <span className="font-black text-sm sm:text-base tracking-tight text-slate-50 uppercase block leading-none">
              Temp Travel
            </span>
            <span className="block text-[8px] font-extrabold text-accent tracking-widest uppercase mt-0.5 leading-none">
              Car Rentals
            </span>
          </div>
        </Link>

        {/* Right Navigation Links */}
        <nav className="hidden md:flex items-center gap-6 sm:gap-8 text-xs font-black uppercase tracking-wider text-slate-300">
          {rightLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`transition-colors py-1 ${
                pathname === link.href || (link.href !== "/" && pathname?.startsWith(link.href))
                  ? "text-accent font-extrabold"
                  : "hover:text-accent font-bold"
              }`}
            >
              {link.name}
            </Link>
          ))}
        </nav>

        {/* Mobile View Navigation Links */}
        <div className="flex md:hidden items-center gap-3 text-[11px] font-extrabold text-slate-300 uppercase tracking-wider">
          {[...leftLinks, ...rightLinks].slice(0, 3).map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`transition-colors ${
                pathname === link.href ? "text-accent" : "hover:text-accent"
              }`}
            >
              {link.name}
            </Link>
          ))}
        </div>

      </div>
    </header>
  );
}
