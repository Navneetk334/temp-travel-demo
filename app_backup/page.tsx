import React from "react";
import Image from "next/image";
import BookingWidget from "@/components/shared/booking-widget";
import { JsonLd } from "@/components/shared/json-ld";
import { 
  Building2, 
  Car, 
  ShieldCheck, 
  MapPin, 
  Phone, 
  Mail, 
  Star, 
  Award, 
  Clock, 
  Users, 
  Compass, 
  ArrowUpRight, 
  ChevronRight,
  TrendingUp
} from "lucide-react";

export default function Homepage() {
  
  // LocalBusiness and CarRental Schema JSON-LD payloads for SEO
  const businessSchema = {
    "@context": "https://schema.org",
    "@type": "CarRental",
    "name": "TEMP TRAVEL CAR RENTALS PVT LTD",
    "image": "https://temptravels.com/images/hero-cover.png",
    "address": {
      "@type": "PostalAddress",
      "streetAddress": "Flat No C-102, Shanti Vihar, Lokhandwala Complex",
      "addressLocality": "Mumbai",
      "addressRegion": "MH",
      "postalCode": "400101",
      "addressCountry": "IN"
    },
    "url": "https://temptravels.com",
    "telephone": "+91-9999999999",
    "priceRange": "₹₹",
    "areaServed": ["Mumbai", "Pune", "Nashik", "Goa", "Bangalore"],
    "offers": {
      "@type": "AggregateOffer",
      "priceCurrency": "INR",
      "lowPrice": "2000",
      "highPrice": "45000"
    }
  };

  return (
    <>
      <JsonLd data={businessSchema} />

      {/* 1. Header / Navigation */}
      <header className="sticky top-0 z-50 w-full bg-slate-950/75 backdrop-blur-md border-b border-white/5 transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-primary p-2 rounded-lg text-primary-foreground border border-accent/20">
              <Car className="w-6 h-6 text-accent" />
            </div>
            <div>
              <span className="font-extrabold text-xl tracking-tight text-slate-50 uppercase">Temp Travel</span>
              <span className="block text-[9px] font-bold text-accent tracking-widest uppercase -mt-1">Car Rentals</span>
            </div>
          </div>

          <nav className="hidden md:flex items-center gap-8 text-sm font-semibold tracking-wide text-slate-300">
            <a href="#services" className="hover:text-accent transition-colors">Services</a>
            <a href="#corporate" className="hover:text-accent transition-colors">Corporate Transport</a>
            <a href="#tours" className="hover:text-accent transition-colors">Tours & Packages</a>
            <a href="#fleet" className="hover:text-accent transition-colors">Our Fleet</a>
            <a href="#why-choose" className="hover:text-accent transition-colors">Why Us</a>
            <a href="#contact" className="hover:text-accent transition-colors">Contact</a>
          </nav>

          <div className="flex items-center gap-4">
            <a 
              href="#book-widget" 
              className="bg-primary hover:bg-blue-700 text-white font-bold py-2.5 px-6 rounded-lg text-sm tracking-wide shadow-md transition-all hidden sm:block border border-white/10"
            >
              Book Cab
            </a>
            <a 
              href="tel:+919999999999" 
              className="flex items-center justify-center p-2.5 bg-slate-900 border border-white/10 rounded-lg text-slate-300 hover:text-accent transition-colors"
            >
              <Phone className="w-4 h-4" />
            </a>
          </div>
        </div>
      </header>

      {/* 2. Hero Banner */}
      <section className="relative min-h-[90vh] flex flex-col justify-center items-center py-20 px-4 md:px-8 bg-slate-950 overflow-hidden">
        {/* Background image overlay */}
        <div className="absolute inset-0 z-0">
          <Image 
            src="/images/hero-cover.png"
            alt="Premium executive car driving at sunset"
            fill
            priority
            className="object-cover opacity-35"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/80 to-transparent" />
        </div>

        {/* Hero Content */}
        <div className="relative z-10 w-full max-w-7xl mx-auto text-center space-y-8 mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/5 border border-white/10 rounded-full text-xs font-semibold text-accent uppercase tracking-wider backdrop-blur-sm animate-pulse">
            <Award className="w-3.5 h-3.5" />
            <span>ISO 9001:2015 Certified Fleet</span>
          </div>

          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold text-slate-50 tracking-tight leading-tight max-w-5xl mx-auto">
            Redefining <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-primary to-accent">Corporate Mobility</span> & Premium Tours
          </h1>

          <p className="text-base sm:text-lg md:text-xl text-slate-300 max-w-3xl mx-auto font-medium">
            Providing luxury corporate commutes, local rentals, outstation trips, and customized travel packages across major metropolitan cities.
          </p>
        </div>

        {/* Interactive Booking Widget */}
        <div id="book-widget" className="relative z-10 w-full max-w-5xl mx-auto scroll-mt-24">
          <BookingWidget />
        </div>
      </section>

      {/* 3. Corporate Transportation Section */}
      <section id="corporate" className="py-24 bg-slate-950 text-slate-100 px-4 sm:px-6 lg:px-8 border-t border-white/5">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-16 items-center">
          <div className="lg:col-span-6 space-y-6">
            <div className="inline-flex items-center gap-1 text-xs font-bold text-accent uppercase tracking-wider">
              <Building2 className="w-4 h-4" />
              <span>B2B Corporate Logistics</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-50 tracking-tight leading-snug">
              Employee Transportation & Executive Cab Solutions
            </h2>
            <p className="text-slate-300 leading-relaxed text-base">
              At TEMP TRAVEL, we specialize in high-volume employee pick-and-drop rosters. Our tailored logistics solutions help HR managers optimize routing, reduce travel operational expenses, and provide unmatched safety.
            </p>
            <ul className="space-y-4">
              {[
                "Bulk Roster Parsing: Instant scheduler uploads for corporate employee travel.",
                "Real-time GPS Tracking: Live dashboards for vehicle progress monitoring.",
                "Vetted Professional Chauffeurs: Backed by rigorous verification and compliance.",
                "Automated Billing & Reporting: Instant invoice logs and compliance statements."
              ].map((item, idx) => (
                <li key={idx} className="flex gap-3 text-sm text-slate-300 items-start">
                  <ShieldCheck className="w-5 h-5 text-accent shrink-0 mt-0.5" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
            <div className="pt-4">
              <a href="#contact" className="inline-flex items-center gap-2 bg-primary hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-lg tracking-wider transition-all">
                <span>Setup Corporate Account</span>
                <ChevronRight className="w-4 h-4" />
              </a>
            </div>
          </div>

          <div className="lg:col-span-6 bg-slate-900/40 border border-white/5 rounded-2xl p-6 md:p-8 space-y-6 relative overflow-hidden glassmorphism">
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-3xl" />
            <h3 className="text-lg font-bold text-slate-100 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-accent" />
              <span>Corporate SPOC Dashboard Preview</span>
            </h3>
            <div className="space-y-4 bg-slate-950/80 rounded-xl p-4 border border-white/5 text-xs font-mono text-slate-400">
              <div>// Active Fleet Rosters</div>
              <div className="flex justify-between border-b border-white/5 py-2">
                <span>Route-24 (Mumbai to Pune)</span>
                <span className="text-green-400">ON TRIP</span>
              </div>
              <div className="flex justify-between border-b border-white/5 py-2">
                <span>Airport Shuttle (Delhi Terminal 3)</span>
                <span className="text-green-400">DRIVER ASSIGNED</span>
              </div>
              <div className="flex justify-between py-2">
                <span>Local Dispatch (Bangalore IT Park)</span>
                <span className="text-yellow-400">PENDING ALLOCATION</span>
              </div>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Our backend matches route configurations to active vehicles, providing managers a birds-eye dashboard interface.
            </p>
          </div>
        </div>
      </section>

      {/* 4. Tour Packages Section */}
      <section id="tours" className="py-24 bg-slate-900/40 px-4 sm:px-6 lg:px-8 border-t border-white/5">
        <div className="max-w-7xl mx-auto space-y-16">
          <div className="text-center space-y-4">
            <span className="text-xs font-bold text-accent uppercase tracking-wider block">Leisure Travel</span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-50 tracking-tight">Customized Tour & Travel Packages</h2>
            <p className="text-slate-300 max-w-2xl mx-auto text-sm">
              Discover beautiful tourist hubs across India. Choose pre-curated tours or request a customized route from our specialists.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                title: "Coastal Goa Gateway Route",
                duration: "5 Days / 4 Nights",
                price: "₹24,999",
                description: "Experience premium beaches, historic forts, and seafood cruises with luxury SUV drives."
              },
              {
                title: "Mahabaleshwar Scenic Hill Escape",
                duration: "3 Days / 2 Nights",
                price: "₹12,499",
                description: "Relax amidst strawberries, viewpoints, and temples with private driver allocation."
              },
              {
                title: "Golden Triangle Cultural Tour",
                duration: "6 Days / 5 Nights",
                price: "₹45,000",
                description: "Premium heritage tour covering iconic locations across Delhi, Agra, and Jaipur."
              }
            ].map((pkg, idx) => (
              <div key={idx} className="bg-slate-950/80 border border-white/5 rounded-xl overflow-hidden shadow-lg hover:border-accent/30 transition-all group">
                <div className="p-6 space-y-4">
                  <div className="flex justify-between items-start">
                    <span className="text-xs font-bold text-accent bg-white/5 py-1 px-2.5 rounded-full">{pkg.duration}</span>
                    <span className="text-lg font-extrabold text-slate-50">{pkg.price}</span>
                  </div>
                  <h3 className="text-xl font-bold text-slate-50 group-hover:text-accent transition-colors">{pkg.title}</h3>
                  <p className="text-slate-300 text-sm leading-relaxed">{pkg.description}</p>
                  <div className="pt-4 flex items-center justify-between border-t border-white/5">
                    <span className="text-xs font-medium text-slate-400">Includes hotel & transport</span>
                    <a href="#book-widget" className="text-accent flex items-center gap-1 text-sm font-semibold hover:underline">
                      <span>Book Package</span>
                      <ArrowUpRight className="w-4 h-4" />
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 5. Fleet Showcase Section */}
      <section id="fleet" className="py-24 bg-slate-950 px-4 sm:px-6 lg:px-8 border-t border-white/5">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-16 items-center">
          <div className="lg:col-span-5 space-y-6">
            <span className="text-xs font-bold text-accent uppercase tracking-wider block">Our Fleet</span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-50 tracking-tight leading-snug">
              Modern Vehicles for Ultimate Passenger Comfort
            </h2>
            <p className="text-slate-300 leading-relaxed text-sm">
              We manage a versatile fleet to meet varying passenger counts and distance requirements. From fuel-efficient sedans for airport drop-offs to executive coaches for group outings, every vehicle is clean and vetted.
            </p>
            <div className="grid grid-cols-2 gap-4">
              {[
                { name: "Executive Sedans", desc: "Dzire, Etios" },
                { name: "Premium SUVs", desc: "Innova Crysta, Fortuner" },
                { name: "Tempo Travellers", desc: "13 to 26 Seater options" },
                { name: "Luxury Coaches", desc: "32 to 50 Seater luxury buses" }
              ].map((f, i) => (
                <div key={i} className="bg-white/5 border border-white/5 p-4 rounded-xl">
                  <div className="font-bold text-slate-100 text-sm">{f.name}</div>
                  <div className="text-xs text-slate-400 mt-1">{f.desc}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="lg:col-span-7 relative bg-slate-900 border border-white/5 rounded-2xl overflow-hidden shadow-2xl h-[350px] md:h-[450px]">
            <Image 
              src="/images/fleet-suv.png"
              alt="Premium executive black SUV fleet vehicle"
              fill
              className="object-cover"
            />
            <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent p-6 md:p-8 flex justify-between items-end">
              <div>
                <span className="text-xs font-bold text-accent uppercase tracking-wider">Most Booked SUV</span>
                <h3 className="text-xl font-bold text-slate-50 mt-1">Innova Crysta Premium</h3>
                <p className="text-slate-300 text-xs mt-1">Perfect for airport transport & family tours.</p>
              </div>
              <span className="bg-primary hover:bg-blue-700 text-white p-3 rounded-full shadow-lg">
                <ArrowUpRight className="w-5 h-5" />
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* 6. Why Choose Us Section */}
      <section id="why-choose" className="py-24 bg-slate-900/40 px-4 sm:px-6 lg:px-8 border-t border-white/5">
        <div className="max-w-7xl mx-auto space-y-16">
          <div className="text-center space-y-4">
            <span className="text-xs font-bold text-accent uppercase tracking-wider block">Service Quality</span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-50 tracking-tight">The Temp Travel Advantage</h2>
            <p className="text-slate-300 max-w-2xl mx-auto text-sm">
              We focus on comfort, reliability, and security parameters to provide premium passenger service.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {[
              {
                icon: ShieldCheck,
                title: "Safety Verified",
                desc: "Vehicles undergo regular safety checks. Verified, licensed drivers only."
              },
              {
                icon: Clock,
                title: "On-Time Dispatch",
                desc: "Automated routing alerts guarantee punctual pickups for flights and meetings."
              },
              {
                icon: Users,
                title: "B2B Roster Tools",
                desc: "Simplifies employee scheduling and tracking tasks for corporate HR departments."
              },
              {
                icon: Phone,
                title: "24/7 Client Dispatch",
                desc: "Live human dispatchers available 24/7/365 to handle emergency adjustments."
              }
            ].map((adv, idx) => {
              const Icon = adv.icon;
              return (
                <div key={idx} className="bg-slate-950/80 border border-white/5 p-6 rounded-xl space-y-4 hover:border-primary/40 transition-all">
                  <div className="bg-primary/10 w-12 h-12 rounded-lg flex items-center justify-center text-primary border border-primary/20">
                    <Icon className="w-6 h-6 text-accent" />
                  </div>
                  <h3 className="text-lg font-bold text-slate-50">{adv.title}</h3>
                  <p className="text-slate-300 text-xs leading-relaxed">{adv.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 7. Corporate Clients Section */}
      <section className="py-16 bg-slate-950 border-t border-white/5 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 text-center space-y-8">
          <span className="text-xs font-semibold uppercase tracking-widest text-slate-400">Trusted By Major Enterprise Companies</span>
          <div className="flex flex-wrap justify-center items-center gap-12 opacity-60">
            {["Amazon India", "Tata Consulting", "Infosys", "Wipro Technologies", "Google India", "Capgemini"].map((client, idx) => (
              <span key={idx} className="text-lg font-extrabold text-slate-300 tracking-wider uppercase">{client}</span>
            ))}
          </div>
        </div>
      </section>

      {/* 8. Testimonials Section */}
      <section className="py-24 bg-slate-900/40 px-4 sm:px-6 lg:px-8 border-t border-white/5">
        <div className="max-w-7xl mx-auto space-y-16">
          <div className="text-center space-y-4">
            <span className="text-xs font-bold text-accent uppercase tracking-wider block">Reviews</span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-50 tracking-tight">Feedback From Our Clients</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                name: "Rahul Mehta",
                role: "HR Lead, Tata Consultancy Services",
                content: "Managing employee shifts used to take hours. Temp Travel's bulk roster tool changed everything. Dispatch routing is prompt and support is outstanding.",
                stars: 5
              },
              {
                name: "Preeti Sharma",
                role: "Traveler",
                content: "Booked a Mahabaleshwar package for my family. The Innova Crysta was spotless, the driver was courteous, and the pricing was clear without hidden costs.",
                stars: 5
              },
              {
                name: "Vikram Malhotra",
                role: "Business Executive",
                content: "Very reliable airport pickup services. Drivers meet you at the arrivals terminal on time. Highly recommended for corporate travel requirements.",
                stars: 5
              }
            ].map((t, idx) => (
              <div key={idx} className="bg-slate-950/80 border border-white/5 p-6 rounded-xl space-y-4">
                <div className="flex gap-1">
                  {[...Array(t.stars)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-accent text-accent" />
                  ))}
                </div>
                <p className="text-slate-300 text-sm italic leading-relaxed">"{t.content}"</p>
                <div className="border-t border-white/5 pt-4">
                  <div className="font-bold text-slate-100 text-sm">{t.name}</div>
                  <div className="text-xs text-slate-400 mt-0.5">{t.role}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 9. Service Areas Section */}
      <section className="py-24 bg-slate-950 px-4 sm:px-6 lg:px-8 border-t border-white/5">
        <div className="max-w-7xl mx-auto space-y-12 text-center">
          <div className="space-y-4">
            <span className="text-xs font-bold text-accent uppercase tracking-wider block">Operational Reach</span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-50 tracking-tight">Our Service Areas</h2>
            <p className="text-slate-300 max-w-2xl mx-auto text-sm">
              We provide active passenger transit services across major economic hubs and tourist centers.
            </p>
          </div>

          <div className="flex flex-wrap justify-center gap-4">
            {["Mumbai Metro Region", "Pune City", "Nashik Hub", "Goa Coastal Region", "Bangalore Tech Hub", "Delhi NCR"].map((area, idx) => (
              <span key={idx} className="bg-white/5 border border-white/10 text-slate-300 font-bold py-2.5 px-6 rounded-full text-xs tracking-wider uppercase hover:border-accent transition-colors flex items-center gap-2">
                <MapPin className="w-3.5 h-3.5 text-accent" />
                <span>{area}</span>
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* 10. Statistics Section */}
      <section className="py-20 bg-slate-900 border-t border-white/5">
        <div className="max-w-7xl mx-auto px-4 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {[
            { value: "500K+", label: "Completed Rides" },
            { value: "120+", label: "Corporate Contracts" },
            { value: "30+", label: "Operational Hubs" },
            { value: "4.9/5", label: "Client Star Rating" }
          ].map((stat, idx) => (
            <div key={idx} className="space-y-2">
              <div className="text-4xl sm:text-5xl font-extrabold text-slate-50 tracking-tight">{stat.value}</div>
              <div className="text-xs font-semibold text-slate-400 uppercase tracking-widest">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* 11. Contact CTA & Footer */}
      <section id="contact" className="py-24 bg-slate-950 text-slate-100 px-4 sm:px-6 lg:px-8 border-t border-white/5">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-16">
          
          {/* Contact Details */}
          <div className="lg:col-span-5 space-y-6">
            <span className="text-xs font-bold text-accent uppercase tracking-wider block">Get In Touch</span>
            <h2 className="text-3xl font-extrabold text-slate-50 tracking-tight leading-snug">
              Discuss Your Transport & Tour Requirements
            </h2>
            <p className="text-slate-300 text-sm leading-relaxed">
              Have a custom itinerary request? Or looking for a fleet quote for employee logistics? Reach out directly and our managers will contact you within 24 hours.
            </p>

            <div className="space-y-4 pt-4">
              <div className="flex gap-4 items-start">
                <div className="bg-white/5 p-3 rounded-lg text-accent">
                  <Phone className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Call Support</div>
                  <a href="tel:+919999999999" className="text-slate-200 font-bold hover:underline">+91 99999 99999</a>
                </div>
              </div>

              <div className="flex gap-4 items-start">
                <div className="bg-white/5 p-3 rounded-lg text-accent">
                  <Mail className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Email Sales</div>
                  <a href="mailto:info@temptravels.com" className="text-slate-200 font-bold hover:underline">info@temptravels.com</a>
                </div>
              </div>

              <div className="flex gap-4 items-start">
                <div className="bg-white/5 p-3 rounded-lg text-accent">
                  <MapPin className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Corporate Office</div>
                  <div className="text-slate-300 text-sm">
                    Flat No C-102, Shanti Vihar, Lokhandwala Complex, Kandivali East, Mumbai, MH, 400101
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Inquiry Form */}
          <div className="lg:col-span-7 bg-slate-900/40 border border-white/5 rounded-2xl p-6 md:p-8 space-y-6 glassmorphism">
            <h3 className="text-xl font-bold text-slate-50">Send Inquiry Message</h3>
            <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); alert("Lead captured! Connecting to sales panel..."); }}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Your Name</label>
                  <input
                    type="text"
                    required
                    placeholder="John Doe"
                    className="w-full bg-slate-950/50 border border-white/10 rounded-lg py-2 px-4 text-sm text-slate-100 focus:outline-none focus:border-primary transition-all"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Email Address</label>
                  <input
                    type="email"
                    required
                    placeholder="john@example.com"
                    className="w-full bg-slate-950/50 border border-white/10 rounded-lg py-2 px-4 text-sm text-slate-100 focus:outline-none focus:border-primary transition-all"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Subject</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. B2B Corporate Cab Contract Query"
                  className="w-full bg-slate-950/50 border border-white/10 rounded-lg py-2 px-4 text-sm text-slate-100 focus:outline-none focus:border-primary transition-all"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Message Details</label>
                <textarea
                  rows={4}
                  required
                  placeholder="Describe your tour dates, routes, or corporate fleet requirements..."
                  className="w-full bg-slate-950/50 border border-white/10 rounded-lg py-2 px-4 text-sm text-slate-100 focus:outline-none focus:border-primary transition-all resize-none"
                />
              </div>

              <button
                type="submit"
                className="w-full flex items-center justify-center gap-2 bg-primary hover:bg-blue-700 text-white font-bold py-3 rounded-lg shadow-lg tracking-wider transition-all"
              >
                <span>Send Message Inquiry</span>
                <ChevronRight className="w-5 h-5" />
              </button>
            </form>
          </div>

        </div>

        {/* Footer Links & Copyright */}
        <div className="max-w-7xl mx-auto px-4 mt-20 pt-8 border-t border-white/5 flex flex-col md:flex-row items-center justify-between text-xs text-slate-400 gap-4">
          <div>
            &copy; 2026 TEMP TRAVEL CAR RENTALS PVT LTD. All rights reserved.
          </div>
          <div className="flex gap-6">
            <a href="#services" className="hover:text-accent">Services</a>
            <a href="#corporate" className="hover:text-accent">B2B Logistics</a>
            <a href="#tours" className="hover:text-accent">Tours</a>
            <a href="#contact" className="hover:text-accent">Privacy Policy</a>
          </div>
        </div>
      </section>
    </>
  );
}
