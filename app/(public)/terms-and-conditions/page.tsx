import React from "react";
import { getSEOMetadata } from "@/lib/seo";
import Breadcrumbs from "@/components/shared/breadcrumbs";
import { Scale, ShieldCheck, Mail } from "lucide-react";

export const metadata = getSEOMetadata({
  title: "Terms & Conditions - User Service Agreement",
  description: "Read the service agreement and terms of usage for TEMP TRAVEL CAR RENTALS PVT LTD. Learn about booking rules, liability limits, and governing laws.",
  path: "/terms-and-conditions",
});

export default function TermsAndConditionsPage() {
  const breadcrumbsList = [
    { label: "Terms & Conditions", path: "/terms-and-conditions" },
  ];

  const sections = [
    {
      id: "service-terms",
      title: "Service Terms",
      content: "These terms govern the utilization of corporate transport fleets, driver dispatches, and tour itineraries provided by TEMP TRAVEL CAR RENTALS PVT LTD. By booking any vehicle category or travel plan through our channels, you agree to abide by these clauses in full."
    },
    {
      id: "booking-terms",
      title: "Booking Terms",
      content: "Bookings can be initialized through our digital widget, corporate SPOC portal, or tour desk. All bookings require a registered email address and phone verification. Confirmation vouchers are dispatched via SMS/email and remain subject to fleet availability."
    },
    {
      id: "vehicle-rental",
      title: "Vehicle Rental Terms",
      content: "Chauffeur-driven local hourly or outstation rentals operate under commercial licensing permits. The vehicle capacity limits (e.g. 4 passengers for Sedans, 7 passengers for SUVs) are strictly governed by RTO laws and must not be exceeded. Luggage storage is subject to vehicle boot limits."
    },
    {
      id: "tour-packages",
      title: "Tour Package Terms",
      content: "Tour packages include selected transport transfers, hotel bookings, and sightseeing itineraries as specified in confirmation sheets. Sightseeing stops are contingent on local traffic regulations, weather conditions, and regional permits. Entry tickets and personal activities are excluded unless listed."
    },
    {
      id: "payment-terms",
      title: "Payment Terms",
      content: "Bookings require an advance payment ranging from 20% to 50% depending on the vehicle category and hotels. Balance payments must be settled before trip termination. Razorpay processing fees are added to online gateway operations."
    },
    {
      id: "user-responsibilities",
      title: "User Responsibilities",
      content: "Customers must cooperate with chauffeurs, avoid smoking or drinking inside vehicles, and present valid government IDs. Corporate employees must follow assigned shift timing limits to maintain roster punctuality. Passengers are liable for physical damages caused to the vehicle interiors."
    },
    {
      id: "liability-limits",
      title: "Liability Limitations",
      content: "TEMP TRAVEL is not liable for delay log sheets arising from force majeure events (e.g., flight delays, mountain landslides, political strikes, heavy rainfall). Our financial liability remains capped at the total amount received for the specific booking."
    },
    {
      id: "cancellations",
      title: "Cancellation Terms",
      content: "Cancellations must be requested through our booking desk or customer portals. Applicable cancellation charges are computed based on the time elapsed before pickup schedule thresholds (refer to our detailed Refund Policy)."
    },
    {
      id: "intellectual-property",
      title: "Intellectual Property",
      content: "All brand names, portal code bases, digital UI graphics, dynamic layouts, and copywriting content hosted on temptravels.com are owned by TEMP TRAVEL CAR RENTALS PVT LTD. Unauthorized scraping, copying, or replication is prohibited."
    },
    {
      id: "governing-law",
      title: "Governing Law",
      content: "These service agreements are compiled under Indian transport compliance laws. Any legal disputes or litigation claims arising from booking contracts shall be subject to the exclusive jurisdiction of courts located in Mumbai, Maharashtra."
    }
  ];

  return (
    <div className="bg-slate-950 text-slate-100 min-h-screen">
      {/* Breadcrumbs */}
      <div className="bg-slate-950 border-b border-white/5">
        <Breadcrumbs items={breadcrumbsList} />
      </div>

      {/* Page Header */}
      <section className="relative py-16 bg-slate-950 overflow-hidden border-b border-white/5">
        <div className="absolute inset-0 bg-gradient-to-b from-blue-900/10 via-slate-950 to-slate-950 pointer-events-none" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-4 relative z-10">
          <div className="inline-flex items-center gap-2 bg-white/5 border border-white/10 px-3 py-1 rounded-full text-xs text-accent">
            <Scale className="w-3.5 h-3.5" />
            <span>Service Agreement Clauses</span>
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-slate-50">
            Terms & Conditions
          </h1>
          <p className="text-slate-400 max-w-2xl mx-auto text-xs sm:text-sm">
            Last Updated: June 8, 2026. Please read these terms carefully before confirming your travel packages or corporate rosters.
          </p>
        </div>
      </section>

      {/* Legal Content Layout */}
      <section className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          
          {/* Table of Contents / Sidebar (Desktop Only) */}
          <nav className="hidden lg:block lg:col-span-3 sticky top-28 space-y-2.5">
            <div className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4 pl-3">Agreement Sections</div>
            {sections.map((sec) => (
              <a 
                key={sec.id}
                href={`#${sec.id}`}
                className="block pl-3 py-1.5 border-l border-white/5 hover:border-accent text-slate-400 hover:text-accent text-xs font-semibold tracking-wide transition-all"
              >
                {sec.title}
              </a>
            ))}
          </nav>

          {/* Legal Text Sections */}
          <div className="lg:col-span-9 space-y-10">
            <div className="glassmorphism p-6 sm:p-8 rounded-2xl border border-white/5 space-y-8">
              {sections.map((sec) => (
                <div key={sec.id} id={sec.id} className="space-y-3 scroll-mt-28">
                  <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2 border-b border-white/5 pb-2">
                    <ShieldCheck className="w-4 h-4 text-accent shrink-0" />
                    <span>{sec.title}</span>
                  </h2>
                  <p className="text-slate-300 text-sm leading-relaxed font-normal">
                    {sec.content}
                  </p>
                </div>
              ))}
            </div>

            {/* Quick Contact Box */}
            <div className="bg-slate-900/40 border border-white/5 p-6 rounded-xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div className="space-y-1">
                <h4 className="font-bold text-slate-50 text-sm">Have Contract Questions?</h4>
                <p className="text-xs text-slate-400">Discuss custom SLAs and liability extensions for enterprise B2B accounts.</p>
              </div>
              <a 
                href="mailto:info@temptravels.com" 
                className="bg-slate-900 border border-white/10 hover:border-accent/40 text-slate-200 hover:text-accent font-bold py-2.5 px-5 rounded-lg text-xs flex items-center gap-1.5 transition-all uppercase tracking-wider shrink-0"
              >
                <Mail className="w-4 h-4" />
                <span>Email Legal Desk</span>
              </a>
            </div>

          </div>

        </div>
      </section>
    </div>
  );
}
