"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Car, Sun, Moon } from "lucide-react";

export default function Header() {
  const pathname = usePathname();
  const [theme, setTheme] = useState<"dark" | "light">("dark");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const savedTheme = (localStorage.getItem("theme") as "dark" | "light") || "dark";
    setTheme(savedTheme);
    if (savedTheme === "light") {
      document.documentElement.classList.add("light");
      document.documentElement.classList.remove("dark");
    } else {
      document.documentElement.classList.add("dark");
      document.documentElement.classList.remove("light");
    }
  }, []);

  const toggleTheme = () => {
    const nextTheme = theme === "dark" ? "light" : "dark";
    setTheme(nextTheme);
    localStorage.setItem("theme", nextTheme);
    if (nextTheme === "light") {
      document.documentElement.classList.add("light");
      document.documentElement.classList.remove("dark");
    } else {
      document.documentElement.classList.add("dark");
      document.documentElement.classList.remove("light");
    }
  };

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

        {/* Theme Toggle Switch */}
        <div className="flex items-center gap-3">
          {mounted && (
            <button
              type="button"
              onClick={toggleTheme}
              className="group relative w-16 h-8 rounded-full p-1 bg-slate-900 border border-white/15 cursor-pointer shadow-inner transition-all hover:border-amber-400/40 flex items-center justify-between"
              title={theme === "dark" ? "Switch to Light Theme" : "Switch to Dark Theme"}
              aria-label="Toggle theme"
            >
              <Sun className="w-3.5 h-3.5 text-amber-400 ml-1 z-10 opacity-70 group-hover:opacity-100 transition-opacity" />
              <Moon className="w-3.5 h-3.5 text-blue-300 mr-1 z-10 opacity-70 group-hover:opacity-100 transition-opacity" />
              <div
                className={`absolute top-1 left-1 w-6 h-6 rounded-full shadow-md transition-transform duration-300 flex items-center justify-center ${
                  theme === "light"
                    ? "translate-x-0 bg-gradient-to-tr from-amber-400 to-amber-500 shadow-amber-500/20"
                    : "translate-x-8 bg-gradient-to-tr from-blue-600 to-indigo-600 shadow-blue-500/20"
                }`}
              >
                {theme === "light" ? (
                  <Sun className="w-3.5 h-3.5 text-slate-950 fill-amber-300" />
                ) : (
                  <Moon className="w-3.5 h-3.5 text-white fill-white" />
                )}
              </div>
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
