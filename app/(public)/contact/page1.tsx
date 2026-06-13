import React from "react";
import { getSEOMetadata } from "@/lib/seo";
import Breadcrumbs from "@/components/shared/breadcrumbs";
import { JsonLd } from "@/components/shared/json-ld";
import ContactForm from "@/components/shared/contact-form";
import { 
  Phone, 
  Mail, 
  MapPin, 
  Clock, 
  ShieldAlert, 
  Map, 
  ExternalLink 
} from "lucide-react";

export const metadata = getSEOMetadata({
  title: "Contact Us - Setup Corporate Accounts & Tour Bookings",
  description: "Get in touch with TEMP TRAVEL CAR RENTALS PVT LTD. Contact our 24/7 help desk, query corporate accounts, or submit support tickets and custom tour requests.",
  path: "/contact",
});

export default function ContactPage() {
  const contactSchema = {
    "@context": "https://schema.org",
    "@type": "ContactPage",
    "name": "Contact TEMP TRAVEL",
    "description": "Contact information and general inquiry form for TEMP TRAVEL CAR RENTALS PVT LTD.",
    "url": "https://temptravels.com/contact",
    "mainEntity": {
      "@type": "LocalBusiness",
      "name": "TEMP TRAVEL CAR RENTALS PVT LTD",
      "image": "https://temptravels.com/images/hero-cover.png",
      "telephone": "+91-9999999999",
      "email": "info@temptravels.com",
      "address": {
        "@type": "PostalAddress",
        "streetAddress": "Flat No C-102, Shanti Vihar, Lokhandwala Complex",
        "addressLocality": "Mumbai",
        "addressRegion": "MH",
        "postalCode": "400101",
        "addressCountry": "IN"
      }
    }
  };

  const breadcrumbsList = [
    { label: "Contact Us", path: "/contact" },
  ];

  return (
    <>
      <JsonLd data={contactSchema} />

      <div className="bg-slate-950 text-slate-100 min-h-screen">
        {/* Breadcrumbs Section */}
        <div className="bg-slate-950 border-b border-white/5">
          <Breadcrumbs items={breadcrumbsList} />
        </div>

        {/* Page Header */}
        <section className="relative py-20 bg-slate-950 overflow-hidden border-b border-white/5">
          <div className="absolute inset-0 bg-gradient-to-b from-blue-900/10 via-slate-950 to-slate-950 pointer-events-none" />
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6 relative z-10">
            <span className="text-xs font-bold text-accent uppercase tracking-widest bg-white/5 border border-white/10 px-3 py-1 rounded-full">
              Get In Touch
            </span>
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-slate-50">
              Contact <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-accent">Our Travel Desk</span>
            </h1>
            <p className="text-slate-300 max-w-3xl mx-auto text-base sm:text-lg leading-relaxed font-medium">
              Have questions about billing logs, custom tours, or setting up corporate roster plans? Speak directly to our support agents.
            </p>
          </div>
        </section>

        {/* Form and Info Columns */}
        <section className="py-20 bg-slate-950">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
            
            {/* Contact Information Column */}
            <div className="lg:col-span-5 space-y-6">
              
              {/* Phone Numbers Card */}
              <div className="glassmorphism p-6 rounded-xl border border-white/5 space-y-3">
                <div className="flex items-center gap-3">
                  <div className="bg-primary/10 border border-primary/20 p-2.5 rounded-lg text-accent">
                    <Phone className="w-5 h-5" />
                  </div>
                  <h3 className="font-bold text-slate-100 text-base">Phone Hotlines</h3>
                </div>
                <div className="space-y-1.5 pl-11 text-sm text-slate-300">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400">Corporate & Sales Desk:</span>
                    <a href="tel:+919999999999" className="font-bold hover:text-accent transition-colors">+91 99999 99999</a>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400">Tour Customization:</span>
                    <a href="tel:+919999988888" className="font-bold hover:text-accent transition-colors">+91 99999 88888</a>
                  </div>
                </div>
              </div>

              {/* Email Addresses Card */}
              <div className="glassmorphism p-6 rounded-xl border border-white/5 space-y-3">
                <div className="flex items-center gap-3">
                  <div className="bg-primary/10 border border-primary/20 p-2.5 rounded-lg text-accent">
                    <Mail className="w-5 h-5" />
                  </div>
                  <h3 className="font-bold text-slate-100 text-base">Email Inquiries</h3>
                </div>
                <div className="space-y-1.5 pl-11 text-sm text-slate-300">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400">General Support:</span>
                    <a href="mailto:info@temptravels.com" className="font-bold hover:text-accent transition-colors">info@temptravels.com</a>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400">Enterprise Sales:</span>
                    <a href="mailto:sales@temptravels.com" className="font-bold hover:text-accent transition-colors">sales@temptravels.com</a>
                  </div>
                </div>
              </div>

              {/* Office Address Card */}
              <div className="glassmorphism p-6 rounded-xl border border-white/5 space-y-3">
                <div className="flex items-center gap-3">
                  <div className="bg-primary/10 border border-primary/20 p-2.5 rounded-lg text-accent">
                    <MapPin className="w-5 h-5" />
                  </div>
                  <h3 className="font-bold text-slate-100 text-base">Corporate Head Office</h3>
                </div>
                <div className="pl-11 text-sm text-slate-300 leading-relaxed">
                  Flat No C-102, Shanti Vihar, Lokhandwala Complex, Kandivali East, Mumbai, MH, 400101, India
                </div>
              </div>

              {/* Business Hours Card */}
              <div className="glassmorphism p-6 rounded-xl border border-white/5 space-y-3">
                <div className="flex items-center gap-3">
                  <div className="bg-primary/10 border border-primary/20 p-2.5 rounded-lg text-accent">
                    <Clock className="w-5 h-5" />
                  </div>
                  <h3 className="font-bold text-slate-100 text-base">Business Hours</h3>
                </div>
                <div className="space-y-1.5 pl-11 text-sm text-slate-300">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Monday - Saturday:</span>
                    <span className="font-semibold text-slate-200">09:00 AM - 08:00 PM</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Sunday:</span>
                    <span className="font-semibold text-slate-500">Office Closed</span>
                  </div>
                </div>
              </div>

              {/* Emergency Support Card */}
              <div className="bg-amber-950/20 border border-accent/20 p-6 rounded-xl space-y-3">
                <div className="flex items-center gap-3">
                  <div className="bg-accent/10 p-2.5 rounded-lg text-accent">
                    <ShieldAlert className="w-5 h-5" />
                  </div>
                  <h3 className="font-bold text-slate-100 text-base">24/7 Emergency Support</h3>
                </div>
                <p className="text-xs text-slate-300 pl-11 leading-relaxed">
                  Active drivers and corporate commuters can reach our round-the-clock emergency dispatch desk for roadside rescue or routing delays.
                </p>
                <div className="pl-11 text-sm font-extrabold text-accent">
                  Helpline: <a href="tel:+919999999111" className="hover:underline">+91 99999 99111</a>
                </div>
              </div>

            </div>

            {/* Interactive Form Column */}
            <div className="lg:col-span-7">
              <ContactForm />
            </div>

          </div>
        </section>

        {/* Google Maps Placeholder */}
        <section className="py-16 bg-slate-900/20 border-t border-white/5">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
            <div className="space-y-3 text-center">
              <h2 className="text-2xl font-bold text-slate-50 flex items-center justify-center gap-2">
                <Map className="w-6 h-6 text-accent" />
                <span>Our Office Location</span>
              </h2>
              <p className="text-slate-400 text-sm max-w-xl mx-auto">
                Flat No C-102, Shanti Vihar, Lokhandwala Complex, Kandivali East, Mumbai.
              </p>
            </div>

            {/* Google Map Mock Frame */}
            <div className="relative bg-slate-900 border border-white/5 rounded-2xl h-96 overflow-hidden glassmorphism flex flex-col justify-center items-center text-center p-8 gap-4">
              {/* Styled background simulation */}
              <div className="absolute inset-0 bg-slate-950 opacity-40 pointer-events-none" />
              <div className="absolute inset-0 bg-radial-gradient from-blue-900/10 to-transparent pointer-events-none" />
              
              {/* Styled SVG map representation */}
              <div className="absolute inset-0 opacity-15 pointer-events-none flex items-center justify-center">
                <svg className="w-full h-full text-blue-500" viewBox="0 0 800 400" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M50 150 L200 120 L300 250 L450 100 L600 280 L750 150 M100 20 L100 380 M400 20 L400 380 M700 20 L700 380 M20 200 L780 200" stroke="currentColor" strokeWidth="2" strokeDasharray="5 5" />
                  <circle cx="400" cy="200" r="10" fill="currentColor" />
                  <circle cx="200" cy="120" r="6" fill="currentColor" />
                  <circle cx="600" cy="280" r="6" fill="currentColor" />
                </svg>
              </div>

              <div className="relative z-10 bg-slate-950/80 border border-white/10 p-4 rounded-full text-accent shadow-2xl mb-2 animate-bounce">
                <MapPin className="w-8 h-8" />
              </div>
              <h3 className="relative z-10 text-xl font-bold text-slate-50">TEMP TRAVEL CAR RENTALS PVT LTD</h3>
              <p className="relative z-10 text-slate-300 text-sm max-w-md">
                Kandivali East, Lokhandwala Complex, Mumbai, Maharashtra, 400101
              </p>
              <a 
                href="https://maps.google.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="relative z-10 bg-primary hover:bg-blue-700 text-white font-bold py-2.5 px-6 rounded-lg text-xs tracking-wider transition-all flex items-center gap-2 border border-white/10"
              >
                <span>Open in Google Maps</span>
                <ExternalLink className="w-4 h-4" />
              </a>
            </div>

          </div>
        </section>

      </div>
    </>
  );
}
