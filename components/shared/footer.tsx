import React from "react";
import Link from "next/link";
import { Car, MapPin, Phone, Mail } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-slate-950 border-t border-white/5 text-slate-400 pt-16 pb-8 text-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
        {/* Brand Column */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <div className="bg-primary p-2 rounded-lg text-primary-foreground border border-accent/20">
              <Car className="w-5 h-5 text-accent" />
            </div>
            <div>
              <span className="font-extrabold text-lg tracking-tight text-slate-50 uppercase">Temp Travel</span>
              <span className="block text-[8px] font-bold text-accent tracking-widest uppercase -mt-1">Car Rentals</span>
            </div>
          </div>
          <p className="text-slate-400 leading-relaxed">
            TEMP TRAVEL CAR RENTALS PVT LTD is India's leading corporate transit and leisure travel management partner, specializing in compliant, safe, and efficient mobility.
          </p>
        </div>

        {/* Quick Links Column */}
        <div className="space-y-4">
          <h4 className="text-slate-50 font-bold uppercase tracking-wider text-[10px]">Quick Links</h4>
          <ul className="space-y-2.5">
            <li>
              <Link href="/" className="hover:text-accent transition-colors">Home</Link>
            </li>
            <li>
              <Link href="/about" className="hover:text-accent transition-colors">About Us</Link>
            </li>
            <li>
              <Link href="/services" className="hover:text-accent transition-colors">Our Services</Link>
            </li>
            <li>
              <Link href="/fleet" className="hover:text-accent transition-colors">Fleet Showcase</Link>
            </li>
            <li>
              <Link href="/tours" className="hover:text-accent transition-colors">Tour Packages</Link>
            </li>
            <li>
              <Link href="/blog" className="hover:text-accent transition-colors">Blog & Guides</Link>
            </li>
            <li>
              <Link href="/contact" className="hover:text-accent transition-colors">Contact Us</Link>
            </li>
          </ul>
        </div>

        {/* Services Column */}
        <div className="space-y-4">
          <h4 className="text-slate-50 font-bold uppercase tracking-wider text-[10px]">Our Offerings</h4>
          <ul className="space-y-2.5">
            <li>
              <Link href="/services" className="hover:text-accent transition-colors">Corporate Transportation</Link>
            </li>
            <li>
              <Link href="/services" className="hover:text-accent transition-colors">Employee Commutes</Link>
            </li>
            <li>
              <Link href="/services" className="hover:text-accent transition-colors">Airport Transfers</Link>
            </li>
            <li>
              <Link href="/services" className="hover:text-accent transition-colors">Local Hourly Rentals</Link>
            </li>
            <li>
              <Link href="/services" className="hover:text-accent transition-colors">Outstation Cabs</Link>
            </li>
            <li>
              <Link href="/services" className="hover:text-accent transition-colors">Custom Holiday Packages</Link>
            </li>
          </ul>
        </div>

        {/* Contact Info Column */}
        <div className="space-y-4">
          <h4 className="text-slate-50 font-bold uppercase tracking-wider text-[10px]">Corporate Office</h4>
          <ul className="space-y-3">
            <li className="flex gap-2 items-start">
              <MapPin className="w-4 h-4 text-accent shrink-0 mt-0.5" />
              <span className="leading-relaxed text-slate-300">
                Flat No C-102, Shanti Vihar, Lokhandwala Complex, Kandivali East, Mumbai, MH, 400101
              </span>
            </li>
            <li className="flex gap-2 items-center">
              <Phone className="w-4 h-4 text-accent shrink-0" />
              <a href="tel:+919999999999" className="text-slate-300 hover:underline font-bold">+91 99999 99999</a>
            </li>
            <li className="flex gap-2 items-center">
              <Mail className="w-4 h-4 text-accent shrink-0" />
              <a href="mailto:info@temptravels.com" className="text-slate-300 hover:underline">info@temptravels.com</a>
            </li>
          </ul>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8 pt-8 border-t border-white/5 flex flex-col md:flex-row items-center justify-between text-slate-500 gap-4">
        <div>
          &copy; 2026 TEMP TRAVEL CAR RENTALS PVT LTD. All rights reserved.
        </div>
        <div className="flex gap-6">
          <Link href="/terms-and-conditions" className="hover:text-accent">Terms & Conditions</Link>
          <Link href="/privacy-policy" className="hover:text-accent">Privacy Policy</Link>
          <Link href="/refund-policy" className="hover:text-accent">Refund Policy</Link>
        </div>
      </div>
    </footer>
  );
}
