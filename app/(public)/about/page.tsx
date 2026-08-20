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
  Star,
  Cpu,
  Zap,
  CheckCircle2
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
    values: [
      "Safety First", 
      "Integrity & Transparency", 
      "Customer Obsession", 
      "Operational Excellence",
      "Employee & Driver Empowerment"
    ],
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
    {
      year: "2012",
      title: "Company Founding & Fleet Launch",
      desc: "Started operations in New Delhi with a modest fleet of 5 premium sedans targeting executive airport transfers and local corporate rentals.",
      metric: "5 Initial Vehicles",
      icon: Building2,
    },
    {
      year: "2015",
      title: "Enterprise B2B Expansion",
      desc: "Contracted with top IT hubs in Gurgaon and Noida to deliver daily employee shuttle logistics with guaranteed zero-downtime SLAs.",
      metric: "15+ B2B Contracts",
      icon: Award,
    },
    {
      year: "2018",
      title: "Multi-City Metro Hubs",
      desc: "Launched full regional operations in Mumbai Metro and Pune City, expanding commercial fleet size past 100+ commercial units.",
      metric: "100+ Commercial Units",
      icon: MapPin,
    },
    {
      year: "2021",
      title: "Smart Commute & Dispatch Engine",
      desc: "Integrated real-time GPS fleet tracking, automated roster parsing, and digital billing ledgers into our client admin dispatch portal.",
      metric: "100% Automated Roster",
      icon: Cpu,
    },
    {
      year: "2024",
      title: "Pan-India Enterprise Reach",
      desc: "Scaled active operations across 30+ regional hubs, serving 120+ active enterprise clients and 500K+ completed passenger rides.",
      metric: "30+ Regional Hubs",
      icon: Globe,
    },
    {
      year: "2026",
      title: "Carbon-Neutral EV Transit",
      desc: "Commenced rapid rollout of commercial Electric Vehicles (EVs) and hybrid fleets for eco-friendly corporate employee commutes.",
      metric: "Zero-Emission Fleet",
      icon: Zap,
    },
  ];

  return (
    <>
      <JsonLd data={organizationSchema} />

      <div className="bg-slate-950 text-slate-100 min-h-screen">
        {/* Combined Hero & Breadcrumbs Section */}
        <section className="relative bg-slate-950 overflow-hidden border-b border-white/5 pb-20">
          <div className="absolute inset-0 bg-gradient-to-b from-blue-900/10 via-slate-950 to-slate-950 pointer-events-none" />
          
          <div className="relative z-10">
            <Breadcrumbs items={breadcrumbsList} />
          </div>

          <div className="max-w-[1750px] mx-auto px-4 sm:px-8 lg:px-12 xl:px-16 text-center space-y-6 relative z-10 pt-4">
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
          <div className="max-w-[1750px] mx-auto px-4 sm:px-8 lg:px-12 xl:px-16">
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
          <div className="max-w-[1750px] mx-auto px-4 sm:px-8 lg:px-12 xl:px-16 grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
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
          <div className="max-w-[1750px] mx-auto px-4 sm:px-8 lg:px-12 xl:px-16 grid grid-cols-1 md:grid-cols-2 gap-8">
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

        {/* Style 1: Our Growth Journey (Alternating Glowing Timeline) */}
        <section className="py-20 bg-slate-950">
          <div className="max-w-6xl mx-auto px-4 sm:px-8 lg:px-12 space-y-12">
            <div className="text-center space-y-4 max-w-3xl mx-auto">
              <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-50 tracking-tight">Our Growth Journey</h2>
              <p className="text-slate-400 text-sm sm:text-base leading-relaxed">
                How TEMP TRAVEL evolved from a local rental startup into India's leading ISO-compliant corporate transit & tour management partner.
              </p>
            </div>

            {/* Vertical Alternating Zig-Zag Timeline */}
            <div className="relative pt-8 pb-12">

              {/* Central Glowing Vertical Line */}
              <div className="absolute left-1/2 top-12 bottom-12 w-0.5 -translate-x-1/2 bg-gradient-to-b from-accent via-blue-500 to-emerald-400 hidden md:block opacity-40" />

              <div className="space-y-12 relative">
                {timelineMilestones.map((item, idx) => {
                  const isEven = idx % 2 === 0;
                  const Icon = item.icon;

                  return (
                    <div
                      key={idx}
                      className={`flex flex-col md:flex-row items-center ${
                        isEven ? "md:flex-row-reverse" : ""
                      }`}
                    >
                      {/* Left or Right Card Content */}
                      <div className="w-full md:w-1/2 p-4">
                        <div className="bg-slate-900/60 border border-white/10 hover:border-accent/40 rounded-2xl p-6 sm:p-8 space-y-4 shadow-xl transition-all group glassmorphism hover:-translate-y-1">
                          
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <div className="p-2.5 bg-accent/10 border border-accent/20 rounded-xl text-accent group-hover:scale-110 transition-transform">
                                <Icon className="w-5 h-5" />
                              </div>
                              <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                                Phase 0{idx + 1}
                              </span>
                            </div>
                            <span className="text-2xl font-black font-mono text-accent">
                              {item.year}
                            </span>
                          </div>

                          <div className="space-y-2">
                            <h3 className="text-xl font-bold text-slate-50 group-hover:text-amber-400 transition-colors">
                              {item.title}
                            </h3>
                            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                              {item.desc}
                            </p>
                          </div>

                          <div className="pt-3 border-t border-white/5 flex items-center justify-between">
                            <span className="inline-flex items-center gap-1.5 text-[11px] font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 py-1 px-3 rounded-full">
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              <span>{item.metric}</span>
                            </span>
                            <span className="text-[10px] text-slate-500 font-mono">Verified Milestone</span>
                          </div>

                        </div>
                      </div>

                      {/* Central Node Badge */}
                      <div className="relative z-10 my-4 md:my-0 flex items-center justify-center">
                        <div className="w-12 h-12 rounded-full bg-slate-950 border-2 border-accent flex items-center justify-center font-mono font-bold text-xs text-accent shadow-lg shadow-amber-500/10 group-hover:scale-125 transition-transform">
                          {item.year.slice(2)}
                        </div>
                      </div>

                      {/* Spacer for opposite side */}
                      <div className="w-full md:w-1/2 p-4 hidden md:block" />
                    </div>
                  );
                })}
              </div>

            </div>
          </div>
        </section>

        {/* Core Values */}
        <section className="py-16 bg-slate-900/30 border-t border-white/5">
          <div className="max-w-[1750px] mx-auto px-4 sm:px-8 lg:px-12 xl:px-16 space-y-12">
            <div className="text-center space-y-4">
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-50">Our Core Values</h2>
              <p className="text-slate-400 max-w-2xl mx-auto text-sm">
                The principles governing our client relationships and service standards.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
              {companyInfo.values.map((val: string, idx: number) => {
                const valueDescriptions: Record<string, string> = {
                  "Safety First": "Zero-tolerance safety protocols, defensive driver vetting, and real-time vehicle GPS tracking.",
                  "Integrity & Transparency": "Guaranteed transparent billing ledgers, ISO-compliant SLAs, and honest client communication.",
                  "Customer Obsession": "Punctual commuter dispatches, 24/7 command center support, and VIP passenger comfort.",
                  "Operational Excellence": "Smart route optimization engines, automated roster parsing, and zero-downtime fleet logistics.",
                  "Employee & Driver Empowerment": "Prioritizing employee wellbeing, fair chauffeur compensation, continuous skill training, and driver welfare programs."
                };

                return (
                  <div key={idx} className="glassmorphism p-6 rounded-xl border border-white/5 hover:border-accent/30 transition-all space-y-3 flex flex-col justify-between group hover:-translate-y-1">
                    <div className="space-y-3">
                      <div className="text-accent font-mono font-extrabold text-sm">0{idx + 1}.</div>
                      <h4 className="font-bold text-slate-100 text-base group-hover:text-amber-400 transition-colors leading-snug">{val}</h4>
                      <p className="text-xs text-slate-400 leading-relaxed">
                        {valueDescriptions[val] || "Executing everyday operations with a strong commitment to quality and service reliability."}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Service Coverage areas */}
        <section className="py-16 bg-slate-950">
          <div className="max-w-[1750px] mx-auto px-4 sm:px-8 lg:px-12 xl:px-16 space-y-8">
            <div className="text-center space-y-4">
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-50 flex items-center justify-center gap-2">
                <Globe className="w-6 h-6 text-accent" />
                <span>Service Coverage Areas</span>
              </h2>
              <p className="text-slate-400 max-w-2xl mx-auto text-sm">
                Actively serving major business hubs and tourist corridors across India.
              </p>
            </div>

            <div className="flex flex-wrap gap-3 justify-center">
              {companyInfo.serviceAreas.map((area: string, idx: number) => (
                <div key={idx} className="glassmorphism py-2 px-5 rounded-full border border-white/5 text-slate-300 text-xs font-semibold flex items-center gap-2 hover:border-primary/20 transition-all">
                  <MapPin className="w-3.5 h-3.5 text-accent" />
                  <span>{area}</span>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>
    </>
  );
}
