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
  Globe,
  Star,
  Car,
  Plane,
  Compass,
  ArrowRight,
  PhoneCall
} from "lucide-react";

export const metadata = getSEOMetadata({
  title: "About Us - Corporate Transportation & Premium Tours",
  description: "TEMP TRAVEL CAR RENTALS PVT LTD is India's leading corporate transit and leisure travel management partner. Read our mission, vision, core values, and Pan-India coverage.",
  path: "/about",
});

export default async function AboutPage() {
  // Fetch company info from SiteSetting database table safely
  let setting = null;
  try {
    setting = await prisma.siteSetting.findUnique({
      where: { key: "company_info" },
    });
  } catch (e) {
    console.error("About page DB error:", e);
  }

  const companyInfo = (setting?.value as any) || {
    overview: "TEMP TRAVEL CAR RENTALS PVT LTD is a premier corporate transit and leisure travel management company based in India. We operate premium corporate commuter systems, airport transfers, and customized tours.",
    aboutUs: "Established in 2023, Temp Travel operates with a compliant fleet across major business metros and nationwide corridors. We prioritize passenger safety, transparent billing, and 24/7 support desks.",
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
    stats: { completedRides: "500K+", corporateContracts: "120+", hubs: "Pan-India", rating: "4.9/5" },
    serviceAreas: ["Delhi NCR", "Mumbai Metro", "Pune City", "Bangalore Tech Hub", "Goa Coast", "Nashik Hub"],
  };

  const organizationSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "TEMP TRAVEL CAR RENTALS PVT LTD",
    "url": "https://temptravels.com",
    "logo": "https://temptravels.com/images/logo.png",
    "contactPoint": {
      "@type": "ContactPoint",
      "telephone": "+91-7011729639",
      "contactType": "customer service",
      "areaServed": "IN",
      "availableLanguage": ["en", "hi"]
    }
  };

  const breadcrumbsList = [
    { label: "About Us", path: "/about" },
  ];

  const panIndiaRegions = [
    {
      zone: "North Zone",
      states: "Delhi NCR, Punjab, Haryana, Rajasthan, UP & Uttarakhand",
      cities: ["Delhi NCR", "Gurugram", "Noida", "Chandigarh", "Jaipur", "Lucknow", "Agra", "Dehradun", "Amritsar", "Varanasi"]
    },
    {
      zone: "West Zone",
      states: "Maharashtra, Gujarat, Goa & MP Border",
      cities: ["Mumbai Metro", "Pune City", "Ahmedabad", "Surat", "Vadodara", "Nashik Hub", "Goa Coast", "Nagpur", "Rajkot"]
    },
    {
      zone: "South Zone",
      states: "Karnataka, Telangana, Tamil Nadu, Kerala & AP",
      cities: ["Bangalore Tech Hub", "Hyderabad", "Chennai", "Kochi", "Coimbatore", "Mysuru", "Visakhapatnam", "Madurai"]
    },
    {
      zone: "East & Central Zone",
      states: "West Bengal, Odisha, Bihar, Jharkhand & Central India",
      cities: ["Kolkata", "Bhubaneswar", "Indore", "Bhopal", "Patna", "Ranchi", "Raipur", "Guwahati", "Jamshedpur"]
    }
  ];

  return (
    <>
      <JsonLd data={organizationSchema} />

      <div className="bg-background text-slate-100 min-h-screen">
        {/* Combined Hero & Breadcrumbs Section */}
        <section className="relative bg-background overflow-hidden border-b border-border pb-20">
          <div className="absolute inset-0 bg-gradient-to-b from-blue-900/10 via-slate-950 to-slate-950 pointer-events-none" />
          
          <div className="relative z-10">
            <Breadcrumbs items={breadcrumbsList} />
          </div>

          <div className="max-w-[1750px] mx-auto px-4 sm:px-8 lg:px-12 xl:px-16 text-center space-y-6 relative z-10 pt-4">
            <span className="text-xs font-bold text-accent uppercase tracking-widest bg-white/5 border border-border px-3 py-1 rounded-full">
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
        <section className="py-12 bg-background">
          <div className="max-w-[1750px] mx-auto px-4 sm:px-8 lg:px-12 xl:px-16">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div className="glassmorphism p-6 rounded-xl border border-border text-center hover:border-primary/20 transition-all">
                <div className="text-2xl sm:text-3xl font-extrabold text-accent">{companyInfo.stats.completedRides || "500K+"}</div>
                <div className="text-xs text-slate-400 uppercase tracking-wider font-semibold mt-1">Completed Rides</div>
              </div>
              <div className="glassmorphism p-6 rounded-xl border border-border text-center hover:border-primary/20 transition-all">
                <div className="text-2xl sm:text-3xl font-extrabold text-accent">{companyInfo.stats.corporateContracts || "120+"}</div>
                <div className="text-xs text-slate-400 uppercase tracking-wider font-semibold mt-1">Corporate Contracts</div>
              </div>
              <div className="glassmorphism p-6 rounded-xl border border-border text-center hover:border-primary/20 transition-all">
                <div className="text-2xl sm:text-3xl font-extrabold text-accent">{companyInfo.stats.hubs || "Pan-India"}</div>
                <div className="text-xs text-slate-400 uppercase tracking-wider font-semibold mt-1">Pan-India Reach</div>
              </div>
              <div className="glassmorphism p-6 rounded-xl border border-border text-center hover:border-primary/20 transition-all">
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
        <section className="py-16 bg-background">
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

            <div className="space-y-6 glassmorphism p-8 rounded-xl border border-border">
              <h2 className="text-2xl font-bold text-slate-50 flex items-center gap-2">
                <Award className="w-6 h-6 text-accent" />
                <span>Why Choose Us</span>
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
        <section className="py-16 bg-surface/30 border-y border-border">
          <div className="max-w-[1750px] mx-auto px-4 sm:px-8 lg:px-12 xl:px-16 grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="glassmorphism p-8 rounded-xl border border-border space-y-4 hover:border-primary/20 transition-all flex flex-col justify-between">
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

            <div className="glassmorphism p-8 rounded-xl border border-border space-y-4 hover:border-primary/20 transition-all flex flex-col justify-between">
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

        {/* Core Values */}
        <section className="py-16 bg-background">
          <div className="max-w-[1750px] mx-auto px-4 sm:px-8 lg:px-12 xl:px-16 space-y-12">
            <div className="text-center space-y-4">
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-50">Our Core Values</h2>
              <p className="text-slate-400 max-w-2xl mx-auto text-sm">
                The principles governing our client relationships and service standards.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
              {[
                "Safety First", 
                "Integrity & Transparency", 
                "Customer Obsession", 
                "Operational Excellence",
                "Employee & Driver Empowerment"
              ].map((val: string, idx: number) => {
                const valueDescriptions: Record<string, string> = {
                  "Safety First": "Zero-tolerance safety protocols, defensive driver vetting, and real-time vehicle GPS tracking.",
                  "Integrity & Transparency": "Guaranteed transparent billing ledgers, ISO-compliant SLAs, and honest client communication.",
                  "Customer Obsession": "Punctual commuter dispatches, 24/7 command center support, and VIP passenger comfort.",
                  "Operational Excellence": "Smart route optimization engines, automated roster parsing, and zero-downtime fleet logistics.",
                  "Employee & Driver Empowerment": "Prioritizing employee wellbeing, fair chauffeur compensation, continuous skill training, and driver welfare programs."
                };

                return (
                  <div key={idx} className="glassmorphism p-6 rounded-xl border border-border hover:border-accent/30 transition-all space-y-3 flex flex-col justify-between group hover:-translate-y-1">
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

        {/* Pan-India Service Coverage Section */}
        <section className="py-20 bg-surface/30 border-t border-border">
          <div className="max-w-[1750px] mx-auto px-4 sm:px-8 lg:px-12 xl:px-16 space-y-12">
            
            {/* Header */}
            <div className="text-center space-y-4 max-w-3xl mx-auto">
              <span className="text-xs font-bold text-accent uppercase tracking-widest bg-accent/10 border border-accent/20 px-3 py-1 rounded-full inline-flex items-center gap-1.5">
                <Globe className="w-3.5 h-3.5" />
                <span>Nationwide Presence</span>
              </span>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-50 tracking-tight">
                Pan-India Service Coverage
              </h2>
              <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
                Operating seamlessly across all 28 States and 8 Union Territories. Whether you require corporate employee commuter shuttles, VIP airport transfers, or interstate tourist itineraries, TEMP TRAVEL delivers standardized excellence nationwide.
              </p>
            </div>

            {/* 3 Core Mobility Verticals */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="glassmorphism p-6 sm:p-8 rounded-2xl border border-border hover:border-accent/40 transition-all space-y-4 group">
                <div className="w-12 h-12 rounded-xl bg-accent/10 border border-accent/20 flex items-center justify-center text-accent group-hover:scale-110 transition-transform">
                  <Building2 className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-slate-100 group-hover:text-amber-400 transition-colors">
                  Metropolitan & Corporate Transit
                </h3>
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                  Dedicated corporate commuter fleets, shift rosters, and executive transit across Tier-1 IT & business capitals including Delhi NCR, Mumbai, Bengaluru, Hyderabad, and Pune.
                </p>
                <div className="flex flex-wrap gap-1.5 pt-2">
                  <span className="text-[11px] font-semibold text-accent/90 bg-white/5 border border-border px-2.5 py-0.5 rounded-md">Automated Rosters</span>
                  <span className="text-[11px] font-semibold text-accent/90 bg-white/5 border border-border px-2.5 py-0.5 rounded-md">Real-Time GPS</span>
                  <span className="text-[11px] font-semibold text-accent/90 bg-white/5 border border-border px-2.5 py-0.5 rounded-md">Zero-Downtime SLA</span>
                </div>
              </div>

              <div className="glassmorphism p-6 sm:p-8 rounded-2xl border border-border hover:border-accent/40 transition-all space-y-4 group">
                <div className="w-12 h-12 rounded-xl bg-accent/10 border border-accent/20 flex items-center justify-center text-accent group-hover:scale-110 transition-transform">
                  <Car className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-slate-100 group-hover:text-amber-400 transition-colors">
                  Nationwide Outstation & Intercity
                </h3>
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                  Interstate road journeys, one-way drops, and multi-day bespoke holiday circuits across all state borders backed by all-India commercial permits and verified chauffeurs.
                </p>
                <div className="flex flex-wrap gap-1.5 pt-2">
                  <span className="text-[11px] font-semibold text-accent/90 bg-white/5 border border-border px-2.5 py-0.5 rounded-md">All-India Tourist Permit</span>
                  <span className="text-[11px] font-semibold text-accent/90 bg-white/5 border border-border px-2.5 py-0.5 rounded-md">Interstate Toll Clarity</span>
                  <span className="text-[11px] font-semibold text-accent/90 bg-white/5 border border-border px-2.5 py-0.5 rounded-md">24/7 Roadside Assistance</span>
                </div>
              </div>

              <div className="glassmorphism p-6 sm:p-8 rounded-2xl border border-border hover:border-accent/40 transition-all space-y-4 group">
                <div className="w-12 h-12 rounded-xl bg-accent/10 border border-accent/20 flex items-center justify-center text-accent group-hover:scale-110 transition-transform">
                  <Plane className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-slate-100 group-hover:text-amber-400 transition-colors">
                  50+ Airport & Rail Terminal Desks
                </h3>
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                  Guaranteed on-time executive pickups and drops with real-time flight tracking, designated meeting spots, and corporate guest meet-and-greet services.
                </p>
                <div className="flex flex-wrap gap-1.5 pt-2">
                  <span className="text-[11px] font-semibold text-accent/90 bg-white/5 border border-border px-2.5 py-0.5 rounded-md">Flight Tracking</span>
                  <span className="text-[11px] font-semibold text-accent/90 bg-white/5 border border-border px-2.5 py-0.5 rounded-md">Meet & Greet</span>
                  <span className="text-[11px] font-semibold text-accent/90 bg-white/5 border border-border px-2.5 py-0.5 rounded-md">Uniformed Chauffeurs</span>
                </div>
              </div>
            </div>

            {/* Regional Zones Grid */}
            <div className="space-y-6 pt-4">
              <div className="text-center space-y-2">
                <h3 className="text-xl sm:text-2xl font-bold text-slate-100">
                  Key Operational Zones & Regional Hubs
                </h3>
                <p className="text-xs sm:text-sm text-slate-400 max-w-2xl mx-auto">
                  Equipped with local dispatch centers, vetted driver networks, and 24/7 emergency support across every region.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {panIndiaRegions.map((region, idx) => (
                  <div key={idx} className="glassmorphism p-6 rounded-2xl border border-border hover:border-accent/30 transition-all flex flex-col justify-between space-y-4">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-accent shrink-0" />
                        <h4 className="font-bold text-slate-100 text-base">{region.zone}</h4>
                      </div>
                      <p className="text-[11px] text-slate-400 font-medium">
                        {region.states}
                      </p>
                    </div>

                    <div className="flex flex-wrap gap-1.5 pt-2 border-t border-border/60">
                      {region.cities.map((city, cIdx) => (
                        <span 
                          key={cIdx} 
                          className="text-[11px] text-slate-300 bg-surface/80 border border-border/80 px-2.5 py-1 rounded-full font-medium hover:border-accent/40 transition-colors"
                        >
                          {city}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Nationwide CTA Card */}
            <div className="glassmorphism p-8 rounded-2xl border border-border bg-gradient-to-r from-surface/80 via-surface/40 to-surface/80 flex flex-col lg:flex-row items-center justify-between gap-6">
              <div className="space-y-2 text-center lg:text-left">
                <h4 className="text-lg sm:text-xl font-bold text-slate-100 flex items-center justify-center lg:justify-start gap-2">
                  <Compass className="w-5 h-5 text-accent" />
                  <span>Custom Routes & Pan-India Corporate Requirements</span>
                </h4>
                <p className="text-xs sm:text-sm text-slate-300 max-w-3xl leading-relaxed">
                  Need dedicated transit solutions in Tier-2/3 industrial clusters, specialized outstation travel, or nationwide corporate fleet deployments? Our 24/7 command center coordinates custom vehicles anywhere in India.
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-3 shrink-0">
                <Link
                  href="/contact"
                  className="px-5 py-2.5 rounded-xl bg-accent text-slate-950 font-bold text-xs sm:text-sm hover:brightness-110 transition-all shadow-lg flex items-center gap-2"
                >
                  <PhoneCall className="w-4 h-4" />
                  <span>Contact 24/7 Operations</span>
                </Link>
                <Link
                  href="/services"
                  className="px-5 py-2.5 rounded-xl bg-white/5 border border-border text-slate-200 font-semibold text-xs sm:text-sm hover:bg-white/10 transition-all flex items-center gap-2"
                >
                  <span>Explore Services</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>

          </div>
        </section>
      </div>
    </>
  );
}
