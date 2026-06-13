"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Car, Phone } from "lucide-react";

export default function Header() {
  const pathname = usePathname();

  const links = [
    { name: "Home", href: "/" },
    { name: "About", href: "/about" },
    { name: "Services", href: "/services" },
    { name: "Fleet", href: "/fleet" },
    { name: "Tours", href: "/tours" },
    { name: "Blog", href: "/blog" },
    { name: "Contact", href: "/contact" },
  ];

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

        <div className="flex items-center gap-4">
          <Link 
            href="/book" 
            className="bg-primary hover:bg-blue-700 text-white font-bold py-2.5 px-6 rounded-lg text-sm tracking-wide shadow-md transition-all hidden sm:block border border-white/10"
          >
            Book Cab
          </Link>
          <a 
            href="tel:+919999999999" 
            className="flex items-center justify-center p-2.5 bg-slate-900 border border-white/10 rounded-lg text-slate-300 hover:text-accent transition-colors"
          >
            <Phone className="w-4 h-4" />
          </a>
        </div>
      </div>
    </header>
  );
}
