import React from "react";
import { getSEOMetadata } from "@/lib/seo";
import Breadcrumbs from "@/components/shared/breadcrumbs";
import { ShieldCheck, Mail, Lock } from "lucide-react";

export const metadata = getSEOMetadata({
  title: "Privacy Policy - Data Security & Compliance",
  description: "Read the privacy policy of TEMP TRAVEL CAR RENTALS PVT LTD. Learn how we collect, safeguard, and utilize your personal and booking details.",
  path: "/privacy-policy",
});

export default function PrivacyPolicyPage() {
  const breadcrumbsList = [
    { label: "Privacy Policy", path: "/privacy-policy" },
  ];

  const sections = [
    {
      id: "collection",
      title: "Information Collection",
      content: "TEMP TRAVEL CAR RENTALS PVT LTD collects personal, booking, and payment information to deliver compliant and efficient corporate transit and leisure travel management services. Information is collected when you register on our portal, request quotes, configure employee rosters, or confirm bookings."
    },
    {
      id: "personal",
      title: "Personal Information",
      content: "We collect identifiable details such as name, corporate designation, email address, phone number, and employee ID. This data helps establish your customer account and enables SPOCs to manage transit authorization permissions."
    },
    {
      id: "booking",
      title: "Booking Information",
      content: "For booking executions, we capture travel dates, times, pickup and drop coordinates, flight numbers, and customized itinerary requests. This ensures our dispatch commands can track routes and assign chauffeurs punctually."
    },
    {
      id: "payment",
      title: "Payment Information",
      content: "All online transactions are routed through verified third-party payment gateways (Razorpay). TEMP TRAVEL does not store your credit/debit card numbers, UPI PINs, or net banking credentials on our local servers. Only transaction references and status logs are retained."
    },
    {
      id: "cookies",
      title: "Cookies & Tracking Technologies",
      content: "We use essential cookies to maintain user sessions, remember portal preferences, and compile anonymous website traffic statistics. You can control cookie authorization through your browser settings; however, disabling them may limit portal functions."
    },
    {
      id: "usage",
      title: "Data Usage",
      content: "Your data is used to process bookings, optimize employee commuter routes, dispatch trip notifications, audit monthly billing logs, and resolve support queries. We do not sell or lease your personal data to advertising networks."
    },
    {
      id: "security",
      title: "Data Security Standards",
      content: "We employ strict security measures, including SSL encryption for all data transit, role-based access logs, and encrypted database engines. Daily database backups are processed to protect customer and corporate records from unauthorized access."
    },
    {
      id: "thirdparty",
      title: "Third-Party Services",
      content: "Data may be shared with verified partners, such as SMS dispatch services, vehicle tracking software networks (GPS), and payment processors, purely to execute bookings. All partner systems are subject to strict data handling clauses."
    },
    {
      id: "rights",
      title: "User Rights",
      content: "Under applicable data protection laws, users can request access to their registered personal information, update outdated profiles, request data deletion, or revoke consent for promotional announcements. Contact our compliance officer for assistance."
    },
    {
      id: "contact",
      title: "Contact Information",
      content: "For questions regarding this privacy policy or data compliance, please reach out to our privacy desk at compliance@temptravels.com or visit our Corporate Office at Flat No C-102, Shanti Vihar, Lokhandwala Complex, Kandivali East, Mumbai, MH, 400101."
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
            <Lock className="w-3.5 h-3.5" />
            <span>Secure Data Management</span>
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-slate-50">
            Privacy Policy
          </h1>
          <p className="text-slate-400 max-w-2xl mx-auto text-xs sm:text-sm">
            Effective Date: June 8, 2026. Review how we protect your personal and corporate transit details.
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
                  <p className="text-slate-300 text-sm leading-relaxed font-normal">
                    {sec.content}
                  </p>
                </div>
              ))}
            </div>

            {/* Quick Contact Box */}
            <div className="bg-slate-900/40 border border-white/5 p-6 rounded-xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div className="space-y-1">
                <h4 className="font-bold text-slate-50 text-sm">Need Data Assistance?</h4>
                <p className="text-xs text-slate-400">Request account closures or export driver profile data logs.</p>
              </div>
              <a 
                href="mailto:compliance@temptravels.com" 
                className="bg-slate-900 border border-white/10 hover:border-accent/40 text-slate-200 hover:text-accent font-bold py-2.5 px-5 rounded-lg text-xs flex items-center gap-1.5 transition-all uppercase tracking-wider shrink-0"
              >
                <Mail className="w-4 h-4" />
                <span>Contact Compliance</span>
              </a>
            </div>

          </div>

        </div>
      </section>
    </div>
  );
}
