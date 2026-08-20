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
      "email": "sales@temptravel.co.in",
      "address": {
        "@type": "PostalAddress",
        "streetAddress": "Plot No. 183, Kh No. 16/2, A-Block, Qutub Vihar PH-I",
        "addressLocality": "New Delhi",
        "addressRegion": "DL",
        "postalCode": "110071",
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
        {/* Combined Page Header & Breadcrumbs Section */}
        <section className="relative bg-slate-950 overflow-hidden border-b border-white/5 pb-20">
          <div className="absolute inset-0 bg-gradient-to-b from-blue-900/10 via-slate-950 to-slate-950 pointer-events-none" />
          
          <div className="relative z-10">
            <Breadcrumbs items={breadcrumbsList} />
          </div>

          <div className="max-w-[1750px] mx-auto px-4 sm:px-8 lg:px-12 xl:px-16 text-center space-y-6 relative z-10 pt-4">
            <span className="text-xs font-bold text-accent uppercase tracking-widest bg-white/5 border border-white/10 px-3 py-1 rounded-full">
              Get In Touch
            </span>
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-slate-50">
              Contact <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-accent">Our Travel Desk</span>
            </h1>
            <p className="text-slate-300 max-w-3xl mx-auto text-base sm:text-lg leading-relaxed font-medium">
              Have questions about corporate roster plans, executive rentals, or custom travel contracts? Speak directly to our team.
            </p>
          </div>
        </section>

        {/* Form and Info Columns */}
        <section className="py-20 bg-slate-950">
          <div className="max-w-[1750px] mx-auto px-4 sm:px-8 lg:px-12 xl:px-16 grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
            
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
                    <span className="text-slate-400">Technical Support:</span>
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
                    <span className="text-slate-400">Sales Support:</span>
                    <a href="mailto:sales@temptravel.co.in" className="font-bold hover:text-accent transition-colors">sales@temptravel.co.in</a>
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
                <div className="pl-11 text-sm text-slate-300 leading-relaxed font-semibold">
                  TEMP TRAVEL CAR RENTALS PVT. LTD.
                  <div className="font-normal text-slate-300 mt-1">
                    Plot No. 183, Kh No. 16/2, A-Block, Qutub Vihar PH-I, New Delhi - 110071
                  </div>
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
                    <span className="font-semibold text-slate-200">10:00 AM - 7:00 PM</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Sunday:</span>
                    <span className="font-semibold text-slate-500">Closed</span>
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
          <div className="max-w-[1750px] mx-auto px-4 sm:px-8 lg:px-12 xl:px-16 space-y-8">
            <div className="space-y-3 text-center">
              <h2 className="text-2xl font-bold text-slate-50 flex items-center justify-center gap-2">
                <Map className="w-6 h-6 text-accent" />
                <span>Our Office Location</span>
              </h2>
              <p className="text-slate-400 text-sm max-w-xl mx-auto">
                Plot No. 183, Kh No. 16/2, A-Block, Qutub Vihar PH-I, New Delhi - 110071
              </p>
            </div>

            {/* Real Interactive Google Maps Container */}
            <div className="relative bg-slate-900 border border-white/10 rounded-2xl h-[420px] overflow-hidden shadow-2xl group">
              {/* Real Google Maps Embed Iframe */}
              <iframe
                title="TEMP TRAVEL CAR RENTALS PVT LTD - Google Maps Location"
                src="https://maps.google.com/maps?q=place_id:ChIJ5Zoykd0bDTkRc8tFlL_O6rY&t=&z=16&ie=UTF8&iwloc=&output=embed"
                className="w-full h-full border-0 filter grayscale invert contrast-125 opacity-90 group-hover:filter-none group-hover:opacity-100 transition-all duration-500"
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />

              {/* Direct Click Overlay Bar */}
              <div className="absolute bottom-4 left-4 right-4 md:left-auto md:right-4 bg-slate-950/90 backdrop-blur-md border border-white/15 p-4 rounded-xl flex items-center justify-between gap-4 shadow-2xl z-10">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-amber-500/20 text-amber-400 rounded-lg border border-amber-500/30">
                    <MapPin className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-slate-100 text-xs sm:text-sm">TEMP TRAVEL CAR RENTALS PVT. LTD.</h3>
                    <p className="text-[11px] text-slate-400 truncate max-w-xs sm:max-w-md">Plot No. 183, Kh No. 16/2, Qutub Vihar PH-I, New Delhi - 110071</p>
                  </div>
                </div>
                <a
                  href="https://www.google.com/maps/place/?q=place_id:ChIJ5Zoykd0bDTkRc8tFlL_O6rY"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 bg-amber-400 hover:bg-amber-300 text-slate-950 font-black px-4 py-2.5 rounded-lg text-xs tracking-wider transition-all shadow-lg shrink-0 uppercase"
                >
                  <span>Open Business Listing</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>

          </div>
        </section>

      </div>
    </>
  );
}
