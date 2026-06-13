import React from "react";
import { getSEOMetadata } from "@/lib/seo";
import Breadcrumbs from "@/components/shared/breadcrumbs";
import { ShieldCheck, Mail, RefreshCw } from "lucide-react";

export const metadata = getSEOMetadata({
  title: "Refund & Cancellation Policy - Timelines & Claims",
  description: "Understand the cancellation rules and refund eligibility timelines for TEMP TRAVEL CAR RENTALS PVT LTD across tours, rentals, and corporate transits.",
  path: "/refund-policy",
});

export default function RefundPolicyPage() {
  const breadcrumbsList = [
    { label: "Refund Policy", path: "/refund-policy" },
  ];

  const sections = [
    {
      id: "tour-cancellations",
      title: "Tour Package Cancellation Policy",
      content: "Cancellations of domestic or international tour packages are subject to hotel policy limits and transport commitments. The default deductions are structured as follows: \n\n• Cancellations requested 30 days or more before travel: 100% refund of advance (minus a processing fee of ₹1,000).\n• Cancellations requested 15-29 days before travel: 50% refund of total package value.\n• Cancellations requested less than 15 days before travel: No refund is eligible."
    },
    {
      id: "corporate-cancellations",
      title: "Corporate Booking Cancellation Policy",
      content: "B2B daily employee commutes and executive transport roster changes must be submitted via our corporate SPOC dashboard at least 4 hours before the shift schedules. Cancellations requested inside the 4-hour window will incur the full single-way mileage/hour fare as per contract SLAs."
    },
    {
      id: "vehicle-cancellations",
      title: "Vehicle Rental Cancellation Policy",
      content: "For local hourly and outstation chauffeur-driven car rentals: \n\n• Cancellations requested 12 hours or more before pickup schedule: 100% refund.\n• Cancellations requested 4-11 hours before pickup schedule: 50% refund.\n• Cancellations requested less than 4 hours before pickup schedule: No refund is eligible."
    },
    {
      id: "refund-eligibility",
      title: "Refund Eligibility",
      content: "Refunds are eligible only for transactions canceled in compliance with the above schedules. If a vehicle breaks down and we fail to supply a reserve replacement cab within 45 minutes, a full refund of that specific trip segment is automatically credited."
    },
    {
      id: "refund-timeline",
      title: "Refund Processing Timeline",
      content: "Once a cancellation request is verified, refunds are routed back to the source account (UPI, credit/debit card, or bank account) via our payment gateway (Razorpay). The processing takes 5 to 7 business days as per banking clearing regulations."
    },
    {
      id: "gateway-charges",
      title: "Payment Gateway Charges",
      content: "Online transaction charges (normally 2% to 3% levied by payment networks) are non-refundable. They are deducted from the eligible refund amount during processing."
    },
    {
      id: "force-majeure",
      title: "Force Majeure Conditions",
      content: "No refunds apply if bookings fail to compile due to uncontrollable environmental factors (e.g. earthquakes, state borders shut by regulatory commands, severe weather advisories, sudden highway blockages). We will, however, attempt to reschedule the trip at no extra cost."
    },
    {
      id: "contact-support",
      title: "Contact Support",
      content: "For cancellation requests or status updates on refund transfers, contact our billing desk at billing@temptravels.com or call support at +91 99999 99111."
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
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Timelines & Processing Logs</span>
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-slate-50">
            Refund & Cancellation Policy
          </h1>
          <p className="text-slate-400 max-w-2xl mx-auto text-xs sm:text-sm">
            Effective Date: June 8, 2026. Review rules for cancellation periods and refund clearance schedules.
          </p>
        </div>
      </section>

      {/* Legal Content Layout */}
      <section className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          
          {/* Table of Contents / Sidebar (Desktop Only) */}
          <nav className="hidden lg:block lg:col-span-3 sticky top-28 space-y-2.5">
            <div className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4 pl-3">Policy Sections</div>
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
                  <p className="text-slate-300 text-sm leading-relaxed font-normal whitespace-pre-line">
                    {sec.content}
                  </p>
                </div>
              ))}
            </div>

            {/* Quick Contact Box */}
            <div className="bg-slate-900/40 border border-white/5 p-6 rounded-xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div className="space-y-1">
                <h4 className="font-bold text-slate-50 text-sm">Need Billing Assistance?</h4>
                <p className="text-xs text-slate-400">Request cancel orders or trace Razorpay transaction ledgers.</p>
              </div>
              <a 
                href="mailto:billing@temptravels.com" 
                className="bg-slate-900 border border-white/10 hover:border-accent/40 text-slate-200 hover:text-accent font-bold py-2.5 px-5 rounded-lg text-xs flex items-center gap-1.5 transition-all uppercase tracking-wider shrink-0"
              >
                <Mail className="w-4 h-4" />
                <span>Email Billing Desk</span>
              </a>
            </div>

          </div>

        </div>
      </section>
    </div>
  );
}
