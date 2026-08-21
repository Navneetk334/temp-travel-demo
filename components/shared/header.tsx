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
      <div className="pointer-events-auto bg-slate-950/80 backdrop-blur-xl border border-white/15 rounded-full px-7 py-3 sm:py-3.5 shadow-2xl shadow-slate-950/90 flex items-center gap-6 sm:gap-8 max-w-fit mx-auto transition-all duration-300 hover:border-amber-400/40">

        {/* Left Navigation Links */}
        <nav className="hidden md:flex items-center gap-6 sm:gap-8 text-xs font-black uppercase tracking-wider text-slate-300">
          {leftLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`transition-colors py-1 ${pathname === link.href || (link.href !== "/" && pathname?.startsWith(link.href))
                ? "text-accent font-extrabold"
                : "hover:text-accent font-bold"
                }`}
            >
              {link.name}
            </Link>
          ))}
        </nav>

        {/* Centered Brand Logo (Functions as Home Link) */}
        <Link href="/" className="flex items-center px-2 group shrink-0" title="Temp Travel Home">
          <img
            src="/images/logo.png"
            alt="TEMP TRAVEL CAR RENTALS"
            className="h-12 sm:h-14 md:h-16 w-auto object-contain group-hover:scale-105 transition-transform drop-shadow-md"
          />
        </Link>

        {/* Right Navigation Links */}
        <nav className="hidden md:flex items-center gap-6 sm:gap-8 text-xs font-black uppercase tracking-wider text-slate-300">
          {rightLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`transition-colors py-1 ${pathname === link.href || (link.href !== "/" && pathname?.startsWith(link.href))
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
              className={`transition-colors ${pathname === link.href ? "text-accent" : "hover:text-accent"
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
