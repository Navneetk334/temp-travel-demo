import React from "react";
import Image from "next/image";
import Link from "next/link";
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
  HelpCircle,
  CheckCircle2,
  TrendingUp
} from "lucide-react";

import BookingWidget from "@/components/shared/booking-widget";
import Breadcrumbs from "@/components/shared/breadcrumbs";
import CorporateLeadForm from "@/components/shared/corporate-lead-form";
import { JsonLd } from "@/components/shared/json-ld";
import { getSEOMetadata } from "@/lib/seo";
import { getCityDetails } from "@/lib/cities-data";

interface PageProps {
  params: Promise<{ city: string }>;
}

export async function generateMetadata({ params }: PageProps) {
  const resolvedParams = await params;
  const details = getCityDetails(resolvedParams.city);
  return getSEOMetadata({
    title: `Corporate Cab Service & Car Rental in ${details.formattedName}`,
    description: details.metaDescription,
    path: `/car-rental/${details.name}`,
    keywords: details.keywords,
  });
}

// Generate static params for the key operational cities
export async function generateStaticParams() {
  return [
    { city: "delhi" },
    { city: "mumbai" },
    { city: "pune" },
    { city: "bangalore" },
  ];
}

export default async function CityPage({ params }: PageProps) {
  const resolvedParams = await params;
  const details = getCityDetails(resolvedParams.city);

  const localBusinessSchema = {
    "@context": "https://schema.org",
    "@type": "CarRental",
    "name": `TEMP TRAVEL CAR RENTALS - ${details.formattedName}`,
    "image": "https://temptravels.com/images/hero-cover.png",
    "telephone": details.phone,
    "url": `https://temptravels.com/car-rental/${details.name}`,
    "priceRange": "₹₹",
    "address": {
      "@type": "PostalAddress",
      "streetAddress": details.streetAddress,
      "addressLocality": details.formattedName,
      "addressRegion": details.stateCode,
      "postalCode": details.postalCode,
      "addressCountry": "IN"
    },
    "areaServed": [details.formattedName, ...details.corporateHubs],
    "description": details.description
  };

  const breadcrumbsList = [
    { label: "Car Rental", path: "/car-rental" },
    { label: details.formattedName, path: `/car-rental/${details.name}` },
  ];

  return (
    <>
      <JsonLd data={localBusinessSchema} />

      {/* Layout will inject Header here */}

      {/* 2. Breadcrumbs Component Section */}
      <div className="bg-slate-950 border-b border-white/5">
        <Breadcrumbs items={breadcrumbsList} />
      </div>

      {/* 3. Hero Banner Section */}
      <section className="relative min-h-[75vh] flex flex-col justify-center items-center py-20 px-4 md:px-8 bg-slate-950 overflow-hidden">
        {/* Background image overlay */}
        <div className="absolute inset-0 z-0">
          <Image 
            src="/images/hero-cover.png"
            alt={`Premium car rentals and corporate transport in ${details.formattedName}`}
            fill
            priority
            className="object-cover opacity-25"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/90 to-transparent" />
        </div>

        {/* Hero Content */}
        <div className="relative z-10 w-full max-w-7xl mx-auto text-center space-y-6 mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/5 border border-white/10 rounded-full text-xs font-semibold text-accent uppercase tracking-wider backdrop-blur-sm">
            <Award className="w-3.5 h-3.5" />
            <span>ISO 9001:2015 Premium Fleet in {details.formattedName}</span>
          </div>

          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold text-slate-50 tracking-tight leading-tight max-w-4xl mx-auto">
            Corporate Cab Service & Car Rental in <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-primary to-accent">{details.formattedName}</span>
          </h1>

          <p className="text-base sm:text-lg text-slate-300 max-w-2xl mx-auto font-medium">
            Providing reliable employee transportation, airport transfers, executive car hire, and outstation taxi packages across key business zones.
          </p>
        </div>

        {/* Interactive Booking Widget */}
        <div id="book-widget" className="relative z-10 w-full max-w-5xl mx-auto scroll-mt-24">
          <BookingWidget />
        </div>
      </section>

      {/* 4. Localized Corporate Transport Section */}
      <section id="corporate" className="py-24 bg-slate-950 text-slate-100 px-4 sm:px-6 lg:px-8 border-t border-white/5">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-16 items-center">
          <div className="lg:col-span-7 space-y-6">
            <div className="inline-flex items-center gap-1 text-xs font-bold text-accent uppercase tracking-wider">
              <Building2 className="w-4 h-4" />
              <span>B2B Employee Mobility</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-50 tracking-tight">
              Corporate Transportation Services in {details.formattedName}
            </h2>
            <p className="text-slate-300 leading-relaxed text-sm">
              {details.description}
            </p>
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                "Corporate Employee Transportation",
                "Airport Transfers & Meet-and-Greet",
                "Executive Car Rental Subscription",
                "Outstation Tour Cab Routes",
                "24/7 Operations Command Hub",
                "Verified Chauffeurs & Clean Fleet"
              ].map((item, idx) => (
                <li key={idx} className="flex gap-2 text-xs text-slate-300 items-center">
                  <CheckCircle2 className="w-4.5 h-4.5 text-accent shrink-0" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
            <div className="pt-2">
              <a href="#contact" className="inline-flex items-center gap-2 bg-primary hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg text-sm tracking-wider transition-all">
                <span>Setup Corporate Roster</span>
                <ChevronRight className="w-4 h-4" />
              </a>
            </div>
          </div>

          <div className="lg:col-span-5 bg-slate-900/40 border border-white/5 rounded-2xl p-6 space-y-6 relative overflow-hidden glassmorphism">
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-3xl" />
            <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-accent" />
              <span>Operational Highlights ({details.formattedName})</span>
            </h3>
            <div className="space-y-4">
              {details.localQuotes.map((quote, i) => (
                <div key={i} className="flex gap-3 items-start text-xs text-slate-300 border-b border-white/5 pb-3 last:border-b-0 last:pb-0">
                  <ShieldCheck className="w-4 h-4 text-accent shrink-0 mt-0.5" />
                  <span>{quote}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 5. Operational Hubs Section */}
      <section id="operational-hubs" className="py-20 bg-slate-900/40 px-4 sm:px-6 lg:px-8 border-t border-white/5">
        <div className="max-w-7xl mx-auto space-y-12 text-center">
          <div className="space-y-4">
            <span className="text-xs font-bold text-accent uppercase tracking-wider block">Coverage Scope</span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-50 tracking-tight">
              Major Business Zones Served in {details.formattedName}
            </h2>
            <p className="text-slate-300 max-w-2xl mx-auto text-xs sm:text-sm">
              We coordinate high-volume dispatches and executive pickup routes across all core commercial and tech hubs.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {details.corporateHubs.map((hub, idx) => (
              <div 
                key={idx} 
                className="bg-slate-950/80 border border-white/5 py-4 px-6 rounded-xl flex flex-col items-center justify-center gap-2 hover:border-accent/40 transition-colors"
              >
                <MapPin className="w-5 h-5 text-accent" />
                <span className="text-xs font-bold text-slate-200 text-center">{hub}</span>
              </div>
            ))}
          </div>

          <div className="bg-slate-950/50 border border-white/5 rounded-xl p-4 inline-flex items-center gap-2 text-xs text-slate-400">
            <Clock className="w-4 h-4 text-accent" />
            <span>Dedicated airport transfers to and from <strong>{details.airport}</strong> are available 24/7.</span>
          </div>
        </div>
      </section>

      {/* 6. Fleet Showcase Section */}
      <section id="fleet" className="py-24 bg-slate-950 px-4 sm:px-6 lg:px-8 border-t border-white/5">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-16 items-center">
          <div className="lg:col-span-5 space-y-6">
            <span className="text-xs font-bold text-accent uppercase tracking-wider block">Fleet Vehicle Range</span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-50 tracking-tight leading-snug">
              Premium Corporate Fleets
            </h2>
            <p className="text-slate-300 leading-relaxed text-sm">
              We manage a curated fleet of sanitized vehicles matching compliance rules. All cars are equipped with working GPS and emergency SOS modules.
            </p>
            <div className="grid grid-cols-2 gap-4">
              {[
                { name: "Executive Sedans", desc: "Dzire, Etios" },
                { name: "Executive SUVs", desc: "Innova Crysta, Ertiga" },
                { name: "Luxury SUVs", desc: "Toyota Fortuner" },
                { name: "Tempo Travellers", desc: "13 to 26 Seaters" }
              ].map((f, i) => (
                <div key={i} className="bg-white/5 border border-white/5 p-4 rounded-xl">
                  <div className="font-bold text-slate-100 text-sm">{f.name}</div>
                  <div className="text-xs text-slate-400 mt-1">{f.desc}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="lg:col-span-7 relative bg-slate-900 border border-white/5 rounded-2xl overflow-hidden shadow-2xl h-[300px] md:h-[400px]">
            <Image 
              src="/images/fleet-suv.png"
              alt={`Executive SUV fleet in ${details.formattedName}`}
              fill
              className="object-cover"
            />
            <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent p-6 md:p-8">
              <span className="text-xs font-bold text-accent uppercase tracking-wider">Operational Vehicle Choice</span>
              <h3 className="text-xl font-bold text-slate-50 mt-1">Toyota Innova Crysta</h3>
              <p className="text-slate-300 text-xs mt-1">First-class employee transfers and corporate airport transfers.</p>
            </div>
          </div>
        </div>
      </section>

      {/* 7. FAQs Section with Schema Markup support */}
      <section id="faqs" className="py-24 bg-slate-900/40 px-4 sm:px-6 lg:px-8 border-t border-white/5">
        <div className="max-w-4xl mx-auto space-y-12">
          <div className="text-center space-y-4">
            <span className="text-xs font-bold text-accent uppercase tracking-wider block">Information Center</span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-50 tracking-tight">
              Frequently Asked Questions - {details.formattedName}
            </h2>
          </div>

          <div className="space-y-6">
            {details.faqs.map((faq, idx) => (
              <div 
                key={idx} 
                className="bg-slate-950/80 border border-white/5 p-6 rounded-xl space-y-2 hover:border-primary/20 transition-all"
              >
                <h3 className="text-base font-bold text-slate-100 flex items-start gap-2.5">
                  <HelpCircle className="w-5 h-5 text-accent shrink-0 mt-0.5" />
                  <span>{faq.question}</span>
                </h3>
                <p className="text-sm text-slate-300 pl-7 leading-relaxed">
                  {faq.answer}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 8. Localized Contact CTA & Footer */}
      <section id="contact" className="py-24 bg-slate-950 text-slate-100 px-4 sm:px-6 lg:px-8 border-t border-white/5">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-16">
          
          {/* Contact Details */}
          <div className="lg:col-span-5 space-y-6">
            <span className="text-xs font-bold text-accent uppercase tracking-wider block">Connect Locally</span>
            <h2 className="text-3xl font-extrabold text-slate-50 tracking-tight leading-snug">
              Setup Corporate Transport System in {details.formattedName}
            </h2>
            <p className="text-slate-300 text-sm leading-relaxed">
              Contact our {details.formattedName} operational office to request corporate cab quotes, pricing structures, or customized driver schedules.
            </p>

            <div className="space-y-4 pt-4">
              <div className="flex gap-4 items-start">
                <div className="bg-white/5 p-3 rounded-lg text-accent">
                  <Phone className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Call Hub Support</div>
                  <a href={`tel:${details.phone}`} className="text-slate-200 font-bold hover:underline">{details.phone}</a>
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
                  <div className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Local Hub Address</div>
                  <div className="text-slate-300 text-sm">
                    {details.streetAddress}, {details.formattedName}, {details.stateCode}, {details.postalCode}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Inquiry Form */}
          <div className="lg:col-span-7">
            <CorporateLeadForm 
              cityFormatted={details.formattedName} 
              defaultServiceType={`Corporate Cab Service ${details.formattedName}`} 
            />
          </div>

        </div>

      </section>
    </>
  );
}
