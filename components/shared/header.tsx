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

  const links = [
    { name: "Home", href: "/" },
    { name: "About", href: "/about" },
    { name: "Services", href: "/services" },
    { name: "Fleet", href: "/fleet" },
    // { name: "Tours", href: "/tours" }, // Hidden as per user directive
    { name: "Blog", href: "/blog" },
    { name: "Gallery", href: "/gallery" },
    { name: "Contact", href: "/contact" },
  ].filter(l => l.name !== "Tours");

  return (
    <header className="sticky top-0 z-50 w-full bg-slate-950/75 backdrop-blur-md border-b border-white/5 transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Link href="/" className="flex items-center gap-2">
            <div className="bg-primary p-2 rounded-lg text-primary-foreground border border-accent/20">
              <Car className="w-6 h-6 text-accent" />
            </div>
            <div>
              <span className="font-extrabold text-xl tracking-tight text-slate-50 uppercase">Temp Travel</span>
              <span className="block text-[9px] font-bold text-accent tracking-widest uppercase -mt-1">Car Rentals</span>
            </div>
          </Link>
        </div>

        <nav className="hidden md:flex items-center gap-8 text-sm font-semibold tracking-wide text-slate-300">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`transition-colors ${
                pathname === link.href || (link.href !== "/" && pathname?.startsWith(link.href))
                  ? "text-accent"
                  : "hover:text-accent font-semibold"
              }`}
            >
              {link.name}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
