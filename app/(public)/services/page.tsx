import React from "react";
import { getSEOMetadata } from "@/lib/seo";
import Breadcrumbs from "@/components/shared/breadcrumbs";
import { JsonLd } from "@/components/shared/json-ld";
import Link from "next/link";
import { 
  Building2, 
  Car, 
  MapPin, 
  Plane, 
  Clock, 
  Compass, 
  ShieldCheck, 
  Globe, 
  Settings,
  ChevronRight
} from "lucide-react";

export const metadata = getSEOMetadata({
  title: "Our Services - Corporate Cabs, Airport Transfers & Holiday Tours",
  description: "Browse premium transit services from TEMP TRAVEL. We offer corporate logistics, employee transit, local car rentals, outstation trips, and custom domestic/international holiday packages.",
  path: "/services",
});

export default function ServicesPage() {
  const serviceSchema = {
    "@context": "https://schema.org",
    "@type": "Service",
    "serviceType": "Car Rental & Corporate Transit Services",
    "provider": {
      "@type": "LocalBusiness",
      "name": "TEMP TRAVEL CAR RENTALS PVT LTD",
      "image": "https://temptravels.com/images/hero-cover.png",
      "telephone": "+91-9999999999",
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
    { label: "Services", path: "/services" },
  ];

  const servicesData = [
    {
      title: "Corporate Transportation",
      slug: "corporate-transportation",
      icon: <Building2 className="w-6 h-6 text-accent" />,
      image: "/images/services/corporate-transportation.jpg",
      description: "End-to-end employee transit roster planning, executive rides, and custom logistics solutions for enterprise clients.",
      features: [
        "24/7 Command Center support",
        "ISO 9001:2015 compliant fleet",
        "Automated monthly invoice audits"
      ],
      ctaText: "Setup Corporate Account",
      ctaLink: "/corporate-inquiry"
    },
    {
      title: "Employee Pickup & Drop",
      slug: "employee-commutes",
      icon: <Clock className="w-6 h-6 text-accent" />,
      image: "/images/services/employee-commutes.jpg",
      description: "Optimized route planning, bulk shift schedules, and safety-audited cab operations for staff commutes.",
      features: [
        "Real-time GPS tracking logs",
        "Late-night security escort protocols",
        "Roster optimization & fuel savings"
      ],
      ctaText: "Request Commute Proposal",
      ctaLink: "/corporate-inquiry"
    },
    {
      title: "Corporate Cab Services",
      slug: "corporate-cabs",
      icon: <Car className="w-6 h-6 text-accent" />,
      image: "/images/services/corporate-cabs.jpg",
      description: "Premium sedans and SUVs on-demand or on daily retainers for business delegates, client visits, and executive runs.",
      features: [
        "Professional English-speaking chauffeurs",
        "Mineral water and newspaper in-cabin",
        "Flexible hourly packages"
      ],
      ctaText: "Book Corporate Cab",
      ctaLink: "/corporate-inquiry"
    },
    {
      title: "Airport Transfers",
      slug: "airport-transfers",
      icon: <Plane className="w-6 h-6 text-accent" />,
      image: "/images/services/airport-transfers.jpg",
      description: "Timely airport pick-ups and drops at major metropolitan terminals with flight delay monitoring systems.",
      features: [
        "Complimentary flight tracking adjust",
        "Paging/meet-and-greet on request",
        "Fixed, transparent pricing models"
      ],
      ctaText: "Book Airport Cab",
      ctaLink: "/book"
    },
    {
      title: "Local Car Rentals",
      slug: "local-rentals",
      icon: <Clock className="w-6 h-6 text-accent" />,
      image: "/images/services/local-rentals.jpg",
      description: "Chauffeur-driven local hourly packages (e.g. 8 Hrs / 80 Kms) for city shopping, business meetings, and event travels.",
      features: [
        "Choose hatchbacks, sedans, or SUVs",
        "Professional driver navigations",
        "Flexible extra hour/km billing"
      ],
      ctaText: "Rent Local Cab",
      ctaLink: "/book"
    },
    {
      title: "Outstation Car Rentals",
      slug: "outstation-cabs",
      icon: <MapPin className="w-6 h-6 text-accent" />,
      image: "/images/services/outstation-cabs.jpg",
      description: "Comfortable commercial vehicles with outstation licenses for intercity business trips, family trips, and weekend getaways.",
      features: [
        "One-way and round-trip routes",
        "Verified highway-trained drivers",
        "Toll/permit inclusive options"
      ],
      ctaText: "Book Outstation Trip",
      ctaLink: "/book"
    },
    {
      title: "Domestic Tour Packages",
      slug: "domestic-tours",
      icon: <Compass className="w-6 h-6 text-accent" />,
      image: "/images/services/domestic-tours.jpg",
      description: "Curated domestic holiday itineraries covering hill stations, beaches, heritage spots, and pilgrimage trails across India.",
      features: [
        "Includes transport, stay, and breakfast",
        "Flexible itinerary alterations",
        "Local sightseeing guides included"
      ],
      ctaText: "Browse Domestic Packages",
      ctaLink: "/tours?category=domestic"
    },
    {
      title: "International Tour Packages",
      slug: "international-tours",
      icon: <Globe className="w-6 h-6 text-accent" />,
      image: "/images/services/international-tours.jpg",
      description: "Premium international tour itineraries covering popular destinations with flights, luxury hotels, and local ground transfers.",
      features: [
        "Visa and insurance documentation assist",
        "Handpicked 4-star and 5-star hotels",
        "Bilingual tour guides"
      ],
      ctaText: "Browse International Packages",
      ctaLink: "/tours?category=international"
    },
    {
      title: "Customized Travel Solutions",
      slug: "customized-travel",
      icon: <Settings className="w-6 h-6 text-accent" />,
      image: "/images/services/customized-travel.jpg",
      description: "Tailor-made itineraries, VIP event fleets, and bespoke transport packages designed to meet your specific travel ideas.",
      features: [
        "Dedicated tour desk counselor",
        "Custom hotel and transport configs",
        "Group travel and bus coach hires"
      ],
      ctaText: "Discuss Your Plan",
      ctaLink: "/contact"
    }
  ];

  return (
    <>
      <JsonLd data={serviceSchema} />

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
              Our Fleet & Tour Offerings
            </span>
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-slate-50">
              Corporate & Leisure <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-accent">Transit Offerings</span>
            </h1>
            <p className="text-slate-300 max-w-3xl mx-auto text-base sm:text-lg leading-relaxed font-medium">
              Explore our comprehensive range of commercial fleet rentals, daily employee shuttles, airport transit transfers, and customized holiday packages.
            </p>
          </div>
        </section>

        {/* Services Grid Section */}
        <section className="py-20 bg-slate-950">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {servicesData.map((service, idx) => (
                <div 
                  key={idx}
                  className="bg-slate-900/40 border border-white/5 rounded-2xl overflow-hidden shadow-xl hover:border-primary/45 transition-all group flex flex-col justify-between"
                >
                  {/* Service Image Block */}
                  <div className="relative h-56 bg-slate-950 overflow-hidden">
                    <img 
                      src={service.image} 
                      alt={service.title} 
                      className="w-full h-full object-cover opacity-75 group-hover:scale-105 transition-transform duration-500" 
                    />
                    <div className="absolute top-4 left-4 bg-slate-950/80 border border-white/10 p-2 rounded-lg flex items-center justify-center">
                      {service.icon}
                    </div>
                  </div>

                  {/* Card Content */}
                  <div className="p-6 space-y-6 flex-1 flex flex-col justify-between">
                    <div className="space-y-3">
                      <h3 className="text-xl font-bold text-slate-50 group-hover:text-accent transition-colors duration-300">
                        {service.title}
                      </h3>
                      <p className="text-slate-400 text-sm leading-relaxed">
                        {service.description}
                      </p>
                    </div>

                    {/* Features list */}
                    <div className="space-y-2.5 pt-4 border-t border-white/5">
                      <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Key Service Benefits</div>
                      <ul className="space-y-2">
                        {service.features.map((feature, fIdx) => (
                          <li key={fIdx} className="flex items-start gap-2 text-xs text-slate-300">
                            <ShieldCheck className="w-4 h-4 text-accent shrink-0 mt-0.5" />
                            <span>{feature}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* CTA Button */}
                    <div className="pt-6">
                      <Link 
                        href={service.ctaLink}
                        className="w-full bg-slate-900 border border-white/10 text-slate-200 hover:text-accent font-bold py-2.5 px-4 rounded-lg text-xs tracking-wider transition-all flex items-center justify-center gap-1.5 uppercase"
                      >
                        <span>{service.ctaText}</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </Link>
                    </div>

                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Global CTA Banner */}
        <section className="py-20 bg-gradient-to-t from-slate-950 via-slate-900/30 to-slate-950 border-t border-white/5">
          <div className="max-w-4xl mx-auto px-4 text-center space-y-8">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-50">
              Need a Tailored Transit Configuration?
            </h2>
            <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
              Our travel managers are available 24/7 to formulate custom pricing charts, driver schedules, and coordinate complex multi-city transits.
            </p>
            <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
              <Link
                href="/contact"
                className="w-full sm:w-auto bg-primary hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-lg text-sm tracking-wider shadow-lg transition-all border border-white/10 flex items-center justify-center gap-2"
              >
                <span>Discuss Customized Setup</span>
                <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}
