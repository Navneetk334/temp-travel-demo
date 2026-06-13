import React from "react";
import prisma from "@/lib/prisma";
import { getSEOMetadata } from "@/lib/seo";
import Breadcrumbs from "@/components/shared/breadcrumbs";
import { JsonLd } from "@/components/shared/json-ld";
import Link from "next/link";
import { 
  Building2, 
  Target, 
  Eye, 
  ShieldCheck, 
  MapPin, 
  Award, 
  Users, 
  Briefcase,
  ChevronRight,
  Globe,
  Star
} from "lucide-react";

export const metadata = getSEOMetadata({
  title: "About Us - Corporate Transportation & Premium Tours",
  description: "TEMP TRAVEL CAR RENTALS PVT LTD is India's leading corporate transit and leisure travel management partner. Read our journey, mission, vision, and core values.",
  path: "/about",
});

export default async function AboutPage() {
  // Fetch company info from SiteSetting database table
  const setting = await prisma.siteSetting.findUnique({
    where: { key: "company_info" },
  });

  const companyInfo = (setting?.value as any) || {
    overview: "TEMP TRAVEL CAR RENTALS PVT LTD is a premier corporate transit and leisure travel management company based in India. We operate premium corporate commuter systems, airport transfers, and customized tours.",
    aboutUs: "Established in 2012, Temp Travel operates with a compliant fleet across major business metros. We prioritize passenger safety, transparent billing, and 24/7 support desks.",
    mission: "To deliver safe, compliant, and cost-effective transportation logistics and leisure travel experiences.",
    vision: "To become India's primary choice for corporate employee transportation and customized leisure holiday packages.",
    values: ["Safety First", "Integrity & Transparency", "Customer Obsession", "Operational Excellence"],
    whyUs: ["ISO 9001:2015 Compliance", "Defensive Driver Vetting", "Automated Roster Routing", "24/7 Command Center Support"],
    stats: { completedRides: "500K+", corporateContracts: "120+", hubs: "30+", rating: "4.9/5" },
    serviceAreas: ["Delhi NCR", "Mumbai Metro", "Pune City", "Bangalore Tech Hub", "Goa Coast", "Nashik Hub"],
  };

  const organizationSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "TEMP TRAVEL CAR RENTALS PVT LTD",
    "url": "https://temptravels.com",
    "logo": "https://temptravels.com/images/hero-cover.png",
    "contactPoint": {
      "@type": "ContactPoint",
      "telephone": "+91-9999999999",
      "contactType": "customer service",
      "areaServed": "IN",
      "availableLanguage": ["en", "hi"]
    }
  };

  const breadcrumbsList = [
    { label: "About Us", path: "/about" },
  ];

  const timelineMilestones = [
    { year: "2012", title: "Company Founding", desc: "Started operations in New Delhi with a fleet of 5 vehicles targeting local corporate rentals." },
    { year: "2015", title: "B2B Expansion", desc: "Contracted with top IT hubs to deliver daily employee shuttle logistics." },
    { year: "2018", title: "Multi-City Hubs", desc: "Launched full operations in Mumbai and Pune, expanding fleet size past 100+ commercial units." },
    { year: "2021", title: "Smart Commute Launch", desc: "Integrated real-time GPS fleet tracking and automated roster parsing into our client dispatch portal." },
    { year: "2024", title: "Pan-India Reach", desc: "Scaled operations across 30+ regional hubs, serving 120+ active enterprise clients." },
    { year: "2026", title: "Eco-Friendly Transit", desc: "Commenced integration of commercial Electric Vehicles (EVs) for carbon-neutral employee commutes." },
  ];

  return (
    <>
      <JsonLd data={organizationSchema} />

      <div className="bg-slate-950 text-slate-100 min-h-screen">
        {/* Breadcrumbs Section */}
        <div className="bg-slate-950 border-b border-white/5">
          <Breadcrumbs items={breadcrumbsList} />
        </div>

        {/* Hero Section */}
        <section className="relative py-20 bg-slate-950 overflow-hidden border-b border-white/5">
          <div className="absolute inset-0 bg-gradient-to-b from-blue-900/10 via-slate-950 to-slate-950 pointer-events-none" />
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6 relative z-10">
            <span className="text-xs font-bold text-accent uppercase tracking-widest bg-white/5 border border-white/10 px-3 py-1 rounded-full">
              Who We Are
            </span>
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-slate-50">
              India's Premier <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-accent">Corporate Transit Partner</span>
            </h1>
            <p className="text-slate-300 max-w-3xl mx-auto text-base sm:text-lg leading-relaxed">
              {companyInfo.overview}
            </p>
          </div>
        </section>

        {/* Statistics Grid */}
        <section className="py-12 bg-slate-950">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div className="glassmorphism p-6 rounded-xl border border-white/5 text-center hover:border-primary/20 transition-all">
                <div className="text-2xl sm:text-3xl font-extrabold text-accent">{companyInfo.stats.completedRides || "500K+"}</div>
                <div className="text-xs text-slate-400 uppercase tracking-wider font-semibold mt-1">Completed Rides</div>
              </div>
              <div className="glassmorphism p-6 rounded-xl border border-white/5 text-center hover:border-primary/20 transition-all">
                <div className="text-2xl sm:text-3xl font-extrabold text-accent">{companyInfo.stats.corporateContracts || "120+"}</div>
                <div className="text-xs text-slate-400 uppercase tracking-wider font-semibold mt-1">Corporate Contracts</div>
              </div>
              <div className="glassmorphism p-6 rounded-xl border border-white/5 text-center hover:border-primary/20 transition-all">
                <div className="text-2xl sm:text-3xl font-extrabold text-accent">{companyInfo.stats.hubs || "30+"}</div>
                <div className="text-xs text-slate-400 uppercase tracking-wider font-semibold mt-1">Regional Hubs</div>
              </div>
              <div className="glassmorphism p-6 rounded-xl border border-white/5 text-center hover:border-primary/20 transition-all">
                <div className="text-2xl sm:text-3xl font-extrabold text-accent flex items-center justify-center gap-1">
                  <span>{companyInfo.stats.rating || "4.9/5"}</span>
                  <Star className="w-5 h-5 text-accent fill-accent shrink-0 inline-block mb-1" />
                </div>
                <div className="text-xs text-slate-400 uppercase tracking-wider font-semibold mt-1">Client Rating</div>
              </div>
            </div>
          </div>
        </section>

        {/* About details & Why Choose Us */}
        <section className="py-16 bg-slate-950">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
            <div className="space-y-6">
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-50 flex items-center gap-2">
                <Building2 className="w-6 h-6 text-accent" />
                <span>Our Heritage</span>
              </h2>
              <p className="text-slate-300 leading-relaxed text-sm sm:text-base">
                {companyInfo.aboutUs}
              </p>
              <p className="text-slate-400 leading-relaxed text-xs sm:text-sm">
                From our corporate headquarters to regional desks, we focus on strictly implementing compliance metrics. Every transit activity is backed by defensive driver standards, speed restriction systems, and automated billing ledgers to guarantee operational clarity.
              </p>
            </div>

            <div className="space-y-6 glassmorphism p-8 rounded-xl border border-white/5">
              <h2 className="text-2xl font-bold text-slate-50 flex items-center gap-2">
                <Award className="w-6 h-6 text-accent" />
                <span>Why Corporate Partners Choose Us</span>
              </h2>
              <ul className="space-y-4 text-sm">
                {companyInfo.whyUs.map((item: string, idx: number) => (
                  <li key={idx} className="flex items-start gap-3 text-slate-300">
                    <ShieldCheck className="w-5 h-5 text-accent shrink-0 mt-0.5" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        {/* Mission & Vision */}
        <section className="py-16 bg-slate-900/30 border-y border-white/5">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="glassmorphism p-8 rounded-xl border border-white/5 space-y-4 hover:border-primary/20 transition-all flex flex-col justify-between">
              <div className="space-y-4">
                <div className="bg-primary/10 border border-primary/20 w-12 h-12 rounded-lg flex items-center justify-center text-accent">
                  <Target className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-slate-50">Our Mission</h3>
                <p className="text-slate-300 text-sm leading-relaxed">
                  {companyInfo.mission}
                </p>
              </div>
            </div>

            <div className="glassmorphism p-8 rounded-xl border border-white/5 space-y-4 hover:border-primary/20 transition-all flex flex-col justify-between">
              <div className="space-y-4">
                <div className="bg-primary/10 border border-primary/20 w-12 h-12 rounded-lg flex items-center justify-center text-accent">
                  <Eye className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-slate-50">Our Vision</h3>
                <p className="text-slate-300 text-sm leading-relaxed">
                  {companyInfo.vision}
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Journey Timeline */}
        <section className="py-20 bg-slate-950">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
            <div className="text-center space-y-4">
              <h2 className="text-3xl font-extrabold text-slate-50">Our Growth Journey</h2>
              <p className="text-slate-400 max-w-2xl mx-auto text-sm">
                How we scaled from a startup rental desk to an ISO-compliant enterprise logistics network.
              </p>
            </div>

            <div className="relative border-l border-white/10 md:border-l-0 md:grid md:grid-cols-3 md:gap-8 space-y-8 md:space-y-0 pl-6 md:pl-0 pt-4">
              {timelineMilestones.map((milestone, idx) => (
                <div key={idx} className="relative md:bg-slate-900/30 md:border md:border-white/5 md:rounded-xl md:p-6 hover:border-primary/20 transition-all">
                  <div className="absolute -left-9 md:left-6 -top-1 md:-top-5 w-6 h-6 rounded-full bg-slate-950 border-2 border-accent flex items-center justify-center text-[10px] font-bold text-accent">
                    {idx + 1}
                  </div>
                  <div className="space-y-2">
                    <span className="text-accent font-mono font-extrabold text-lg block">{milestone.year}</span>
                    <h4 className="font-bold text-slate-100">{milestone.title}</h4>
                    <p className="text-xs text-slate-400 leading-relaxed">{milestone.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Core Values */}
        <section className="py-16 bg-slate-900/30 border-t border-white/5">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
            <div className="text-center space-y-4">
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-50">Our Core Values</h2>
              <p className="text-slate-400 max-w-2xl mx-auto text-sm">
                The principles governing our client relationships and service standards.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {companyInfo.values.map((val: string, idx: number) => (
                <div key={idx} className="glassmorphism p-6 rounded-xl border border-white/5 hover:border-primary/20 transition-all space-y-3">
                  <div className="text-accent font-bold text-sm">0{idx + 1}.</div>
                  <h4 className="font-bold text-slate-100 text-base">{val}</h4>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Executing everyday operations with a strong commitment to quality and service reliability.
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Service Coverage areas */}
        <section className="py-16 bg-slate-950">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
            <div className="text-center space-y-4">
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-50 flex items-center justify-center gap-2">
                <Globe className="w-6 h-6 text-accent" />
                <span>Service Coverage Areas</span>
              </h2>
              <p className="text-slate-400 max-w-2xl mx-auto text-sm">
                Actively serving major business hubs and tourist corridors across India.
              </p>
            </div>

            <div className="flex flex-wrap justify-center gap-3">
              {companyInfo.serviceAreas.map((area: string, idx: number) => (
                <div key={idx} className="bg-slate-900 border border-white/5 px-4 py-2 rounded-lg text-slate-300 font-semibold text-xs flex items-center gap-2 hover:border-accent transition-colors">
                  <MapPin className="w-3.5 h-3.5 text-accent" />
                  <span>{area}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 bg-gradient-to-t from-slate-950 via-slate-900/30 to-slate-950 border-t border-white/5">
          <div className="max-w-4xl mx-auto px-4 text-center space-y-8">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-50">
              Ready to Upgrade Your Corporate Logistics?
            </h2>
            <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
              Join 120+ active enterprise clients benefiting from our compliance audits, smart routing systems, and verified chauffeur services.
            </p>
            <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
              <Link
                href="/corporate-inquiry"
                className="w-full sm:w-auto bg-primary hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-lg text-sm tracking-wider shadow-lg transition-all border border-white/10 flex items-center justify-center gap-2"
              >
                <span>Request B2B Roster Proposal</span>
                <ChevronRight className="w-4 h-4" />
              </Link>
              <Link
                href="/contact"
                className="w-full sm:w-auto bg-slate-900 border border-white/10 text-slate-200 hover:text-accent font-bold py-3 px-8 rounded-lg text-sm tracking-wider transition-all flex items-center justify-center gap-2"
              >
                <span>Speak to Tour Manager</span>
              </Link>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}
