import React from "react";
import { getSEOMetadata } from "@/lib/seo";
import Breadcrumbs from "@/components/shared/breadcrumbs";
import { JsonLd } from "@/components/shared/json-ld";
import { 
  ShieldCheck, 
  Mail, 
  Lock, 
  Car, 
  MapPin, 
  CreditCard, 
  Users, 
  FileText, 
  Clock, 
  Phone, 
  AlertCircle, 
  Building2,
  CheckCircle2
} from "lucide-react";

export const metadata = getSEOMetadata({
  title: "Privacy Policy - TEMP TRAVEL CAR RENTALS PVT LTD",
  description: "Read the Privacy Policy of TEMP TRAVEL CAR RENTALS PVT LTD. Learn how we collect, use, and protect your personal, corporate transit, telemetry, and payment data in compliance with Indian laws.",
  path: "/privacy-policy",
});

export default function PrivacyPolicyPage() {
  const breadcrumbsList = [
    { label: "Home", path: "/" },
    { label: "Privacy Policy", path: "/privacy-policy" },
  ];

  const policySchema = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "name": "Privacy Policy - TEMP TRAVEL CAR RENTALS PVT LTD",
    "description": "Comprehensive Privacy Policy for TEMP TRAVEL CAR RENTALS PVT LTD, covering airport transfers, local city rentals, outstation trips, corporate employee transport, and tour packages.",
    "url": "https://temptravel.in/privacy-policy",
    "publisher": {
      "@type": "Organization",
      "name": "TEMP TRAVEL CAR RENTALS PVT LTD",
      "url": "https://temptravel.in",
      "logo": "https://temptravel.in/images/logo.png",
      "contactPoint": {
        "@type": "ContactPoint",
        "telephone": "+91-7011729639",
        "contactType": "customer service",
        "email": "compliance@temptravel.in",
        "areaServed": "IN"
      },
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

  const sections = [
    {
      id: "introduction",
      title: "1. Introduction & Corporate Commitment",
      icon: Building2,
      content: (
        <div className="space-y-3">
          <p>
            Welcome to <strong>TEMP TRAVEL CAR RENTALS PVT LTD</strong> (&ldquo;Company&rdquo;, &ldquo;we&rdquo;, &ldquo;our&rdquo;, or &ldquo;us&rdquo;). We are a premier mobility and corporate fleet management enterprise headquartered at <strong>Plot No. 183, Kh No. 16/2, A-Block, Qutub Vihar PH-I, New Delhi - 110071</strong> (GSTIN: <strong>07AACCT9842M1Z5</strong>).
          </p>
          <p>
            We are deeply committed to safeguarding the privacy, confidentiality, and integrity of the personal and business information entrusted to us by individual passengers, corporate executives, travel coordinators, and enterprise Single Points of Contact (SPOCs). This Privacy Policy explains our practices regarding data collection, processing, storage, and rights under the <strong>Digital Personal Data Protection Act, 2023 (DPDP Act, India)</strong>, the <strong>Information Technology Act, 2000</strong>, and the <strong>Information Technology (Reasonable Security Practices and Procedures and Sensitive Personal Data or Information) Rules, 2011</strong>.
          </p>
          <p>
            By accessing our web portal (<a href="https://temptravel.in" className="text-accent hover:underline">temptravel.in</a>), booking our vehicles, or utilizing our corporate roster systems, you acknowledge and agree to the practices outlined in this policy.
          </p>
        </div>
      )
    },
    {
      id: "services-scope",
      title: "2. Scope of Mobility Services Covered",
      icon: Car,
      content: (
        <div className="space-y-3">
          <p>
            This Privacy Policy applies to all passenger transportation and mobility management services provided by TEMP TRAVEL CAR RENTALS PVT LTD across India, including:
          </p>
          <ul className="list-disc pl-5 space-y-1.5 text-slate-300">
            <li><strong>Airport Pickup & Drop:</strong> Punctual flight-synchronized airport arrival and departure transfers for executives, retail travelers, and corporate clients.</li>
            <li><strong>Local City Rentals:</strong> Hourly and distance-based disposal packages (4 Hours / 40 KM, 8 Hours / 80 KM, 12 Hours / 120 KM) for intra-city mobility, client meetings, and VIP transits.</li>
            <li><strong>Outstation Intercity Travel:</strong> Point-to-point one-way intercity drops and comprehensive round-trip journeys across interstate corridors.</li>
            <li><strong>Corporate B2B Employee Transportation:</strong> Daily employee shuttle and cab rostering, shift-based pickups, executive mobility plans, and centralized corporate billing.</li>
            <li><strong>Curated Tour Packages:</strong> Tailored holiday itineraries, golden triangle tours, hill station circuits, and spiritual expeditions.</li>
            <li><strong>Fleet & Chauffeur Services:</strong> Chauffeur allocations, physical and digital duty slip operations, and trip sheet auditing.</li>
          </ul>
        </div>
      )
    },
    {
      id: "information-collection",
      title: "3. Information We Collect",
      icon: FileText,
      content: (
        <div className="space-y-4">
          <p>
            To deliver prompt, safe, and legally compliant car rental services, we collect specific categories of information based on your interaction with our platform:
          </p>
          
          <div className="space-y-3 pl-2">
            <div>
              <h4 className="font-bold text-slate-100 text-sm flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-accent" />
                A. Personal & Contact Information
              </h4>
              <p className="text-xs text-slate-300 mt-1 pl-3.5 leading-relaxed">
                Passenger full name, corporate honorific/gender, mobile telephone number, email address, corporate designation, department, employee ID (for B2B corporate rosters), and communication preferences.
              </p>
            </div>

            <div>
              <h4 className="font-bold text-slate-100 text-sm flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-accent" />
                B. Ride Itinerary & Transit Coordinates
              </h4>
              <p className="text-xs text-slate-300 mt-1 pl-3.5 leading-relaxed">
                Exact pickup address, landmark details, destination drop address, reporting time and date, flight/train numbers (for automated airport transfer flight-delay adjustments), intermediate route waypoints, and specialized transit instructions.
              </p>
            </div>

            <div>
              <h4 className="font-bold text-slate-100 text-sm flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-accent" />
                C. Real-Time Telemetry & GPS Tracking
              </h4>
              <p className="text-xs text-slate-300 mt-1 pl-3.5 leading-relaxed">
                Our commercial fleet vehicles are equipped with active GPS telematic units. During the lifecycle of an active ride, we process live vehicular coordinates, speed logs, route deviations, and transit timestamps to ensure passenger safety, facilitate dispatch supervision, and calculate exact overage/distance charges.
              </p>
            </div>

            <div>
              <h4 className="font-bold text-slate-100 text-sm flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-accent" />
                D. Duty Slips & Trip Sheet Metrics
              </h4>
              <p className="text-xs text-slate-300 mt-1 pl-3.5 leading-relaxed">
                Official Trip Sheet Numbers (e.g., TT-DS-XXXX), garage opening and reporting kilometer logs, release times, release kilometers, garaging readings, toll and parking receipt uploads, and client physical or digital sign-offs.
              </p>
            </div>

            <div>
              <h4 className="font-bold text-slate-100 text-sm flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-accent" />
                E. Corporate Client & Billing Credentials
              </h4>
              <p className="text-xs text-slate-300 mt-1 pl-3.5 leading-relaxed">
                Company registered name, Goods and Services Tax Identification Number (GSTIN), corporate billing address, authorized signatory/SPOC contact details, purchase order (PO) numbers, and cost-center allocations for corporate Input Tax Credit (ITC) reconciliation.
              </p>
            </div>
          </div>
        </div>
      )
    },
    {
      id: "payment-security",
      title: "4. Payment Processing & Financial Security",
      icon: CreditCard,
      content: (
        <div className="space-y-3">
          <p>
            All online financial transactions on our portal—including advance deposits, fare payments, and tour bookings—are securely executed through PCI-DSS Level 1 compliant payment aggregators (<strong>Razorpay Software Private Limited</strong>).
          </p>
          <div className="bg-background/80 border border-emerald-500/20 p-4 rounded-xl space-y-2">
            <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs uppercase tracking-wider">
              <CheckCircle2 className="w-4 h-4" />
              <span>Zero Local Financial Storage Guarantee</span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              <strong>TEMP TRAVEL CAR RENTALS PVT LTD never stores, views, or logs</strong> your credit card numbers, debit card details, CVV codes, net banking passwords, or UPI PINs on our servers. All sensitive financial data is encrypted in transit using 256-bit SSL encryption directly to the payment gateway. We solely retain gateway transaction reference IDs, payment status flags (SUCCESS/PENDING/FAILED), timestamps, and amount paid for audit, billing, and GST invoice generation.
            </p>
          </div>
        </div>
      )
    },
    {
      id: "purpose-of-processing",
      title: "5. How We Use Your Information",
      icon: ShieldCheck,
      content: (
        <div className="space-y-3">
          <p>
            We process your data strictly for legitimate operational, service delivery, and statutory tax compliance purposes, including:
          </p>
          <ul className="list-disc pl-5 space-y-1.5 text-slate-300">
            <li>Allocating appropriate vehicle categories (Sedans: Compact, Executive, Luxury; SUVs: Urban, Mid-Premium, Luxury) and assigning certified commercial chauffeurs.</li>
            <li>Transmitting instant booking confirmations, chauffeur names, mobile contact links, and vehicle registration numbers via SMS, WhatsApp, and email.</li>
            <li>Monitoring airport arrival flight statuses in real time to prevent unnecessary driver waiting fees or missed pickups.</li>
            <li>Managing automated corporate daily commuter rosters, generating corporate dispatch manifests, and route optimization.</li>
            <li>Calculating transparent billing, toll taxes, night halt allowances, and issuing downloadable GST-compliant tax invoices (SAC 9966).</li>
            <li>Operating our 24x7 emergency road assistance desk, breakdown recovery, and passenger grievance redressal systems.</li>
            <li>Complying with statutory reporting requirements under the Motor Vehicles Act, 1988, Central Motor Vehicles Rules, and tax laws.</li>
          </ul>
        </div>
      )
    },
    {
      id: "data-sharing",
      title: "6. Data Sharing & Third-Party Disclosures",
      icon: Users,
      content: (
        <div className="space-y-3">
          <div className="p-3 bg-accent/10 border border-accent/20 rounded-xl text-xs text-accent font-semibold flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>Strict No-Sale Policy: We do not sell, rent, monetize, or lease your personal data to any external advertising or data brokerage networks.</span>
          </div>
          <p>
            Information is disclosed strictly on a need-to-know basis to authorized parties essential for trip execution:
          </p>
          <ul className="list-disc pl-5 space-y-1.5 text-slate-300">
            <li><strong>Assigned Chauffeurs:</strong> Provided solely with passenger name, reporting time, pickup address, destination, and passenger phone number for pickup coordination. Chauffeurs cannot export or repurpose passenger contacts.</li>
            <li><strong>Corporate SPOCs & Employers:</strong> For enterprise B2B accounts, authorized corporate coordinators have administrative access to ride logs, passenger employee names, pickup/drop timestamps, and billing summaries for authorized roster auditing.</li>
            <li><strong>Infrastructure Service Providers:</strong> Trusted enterprise technology partners (e.g., Razorpay for payment processing, certified SMS/WhatsApp gateway providers for ride telemetry alerts, and cloud hosting infrastructure) bound by non-disclosure and strict confidentiality agreements.</li>
            <li><strong>Legal & Regulatory Authorities:</strong> Where mandated by law, court order, or governmental law enforcement agency for criminal investigations, motor accident claims, or emergency passenger rescue situations.</li>
          </ul>
        </div>
      )
    },
    {
      id: "data-security",
      title: "7. Data Protection & Technical Safeguards",
      icon: Lock,
      content: (
        <div className="space-y-3">
          <p>
            TEMP TRAVEL CAR RENTALS PVT LTD maintains multi-tiered technical, administrative, and physical controls to shield your personal data from unauthorized access, accidental loss, disclosure, or tampering:
          </p>
          <ul className="list-disc pl-5 space-y-1.5 text-slate-300">
            <li><strong>Encryption in Transit:</strong> Entire web portal traffic is protected with industry-standard TLS 1.3 / 256-bit SSL encryption.</li>
            <li><strong>Database Hardening:</strong> Production databases are secured within isolated virtual private networks with automated daily snapshot backups and encryption at rest.</li>
            <li><strong>Role-Based Access Control (RBAC):</strong> Administrative access to passenger rosters and trip dossiers is strictly partitioned among Super Admins, Operations Managers, and Dispatchers with multi-factor authentication.</li>
            <li><strong>Audit Logging:</strong> Every administrative status change, lead conversion, and dispatch update is permanently logged with user identity and timestamp audit trails.</li>
          </ul>
        </div>
      )
    },
    {
      id: "data-retention",
      title: "8. Data Retention Policy",
      icon: Clock,
      content: (
        <div className="space-y-3">
          <p>
            We retain personal, booking, and vehicular telemetry data only for as long as necessary to fulfill the purposes outlined in this policy or to comply with statutory legal, tax, and regulatory obligations:
          </p>
          <ul className="list-disc pl-5 space-y-1.5 text-slate-300">
            <li><strong>Customer Account & Profile Data:</strong> Retained for the duration of your active relationship with our portal or corporate contract.</li>
            <li><strong>Invoices, Ledgers & Duty Slips:</strong> Retained for a minimum period of <strong>7 to 8 years</strong> in accordance with mandatory Indian Goods and Services Tax (GST) Act, 2017 and Companies Act, 2013 statutory accounting requirements.</li>
            <li><strong>Live GPS Telematics:</strong> Vehicular coordinate trails are retained for an operational audit window of <strong>90 days</strong> for route dispute settlement and safety verification, after which they are purged or irreversibly anonymized into macro travel analytics.</li>
          </ul>
        </div>
      )
    },
    {
      id: "cookies-tracking",
      title: "9. Cookies & Web Analytics",
      icon: ShieldCheck,
      content: (
        <div className="space-y-3">
          <p>
            Our web portal uses essential session cookies and performance telemetry to maintain secure user sessions, remember booking form parameters (such as selected pickup dates, vehicle categories, and trip types), and analyze overall website responsiveness.
          </p>
          <p>
            We do not use invasive third-party cross-site advertising cookies. You have the right to modify or disable cookie storage via your web browser preferences; however, doing so may disable specific portal features such as booking progress saves and authenticated client login desks.
          </p>
        </div>
      )
    },
    {
      id: "user-rights",
      title: "10. Your Rights Under DPDP Act, 2023",
      icon: CheckCircle2,
      content: (
        <div className="space-y-3">
          <p>
            As a data principal under Indian data privacy regulations, you possess the following rights regarding your personal information:
          </p>
          <ul className="list-disc pl-5 space-y-1.5 text-slate-300">
            <li><strong>Right to Access:</strong> You can request a summary of the personal information and booking histories associated with your account.</li>
            <li><strong>Right to Correction:</strong> You may request the update or rectification of outdated, inaccurate, or incomplete contact and billing details.</li>
            <li><strong>Right to Erasure:</strong> You can request the deletion of your personal profile data, subject to mandatory statutory tax, billing, and regulatory retention requirements.</li>
            <li><strong>Right to Grievance Redressal:</strong> You have the right to expeditious grievance redressal regarding any data processing concerns.</li>
          </ul>
          <p className="text-xs text-slate-400">
            To exercise any of these rights, please submit a written request to our Data Protection & Grievance Desk at <a href="mailto:compliance@temptravel.in" className="text-accent hover:underline">compliance@temptravel.in</a>.
          </p>
        </div>
      )
    },
    {
      id: "policy-updates",
      title: "11. Updates to This Privacy Policy",
      icon: Clock,
      content: (
        <div className="space-y-3">
          <p>
            We may periodically revise this Privacy Policy to reflect advancements in our fleet management technology, service launches, or changes in applicable regulatory frameworks. When updates occur, the &ldquo;Last Updated&rdquo; date at the top of this document will be modified. We encourage passengers and corporate partners to review this page periodically. Continued usage of our services after updates signifies your consent to the revised terms.
          </p>
        </div>
      )
    },
    {
      id: "grievance-contact",
      title: "12. Grievance Officer & Contact Information",
      icon: Mail,
      content: (
        <div className="space-y-4">
          <p>
            In compliance with the Information Technology Act, 2000 and the Digital Personal Data Protection Act, 2023, the details of our designated Data Protection & Grievance Officer are provided below:
          </p>
          
          <div className="bg-surface/80 border border-border p-5 rounded-2xl space-y-3">
            <div className="flex items-center gap-2 text-accent font-bold text-sm">
              <Building2 className="w-4 h-4" />
              <span>TEMP TRAVEL CAR RENTALS PVT LTD</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-slate-300">
              <div>
                <span className="text-slate-400 block font-semibold">Corporate Headquarters:</span>
                Plot No. 183, Kh No. 16/2, A-Block, Qutub Vihar PH-I, New Delhi - 110071, India
              </div>
              <div>
                <span className="text-slate-400 block font-semibold">Corporate Identification & GSTIN:</span>
                GSTIN: 07AACCT9842M1Z5
              </div>
              <div>
                <span className="text-slate-400 block font-semibold">Privacy & Compliance Email:</span>
                <a href="mailto:compliance@temptravel.in" className="text-accent hover:underline font-mono">compliance@temptravel.in</a>
              </div>
              <div>
                <span className="text-slate-400 block font-semibold">Customer & Corporate Helpline:</span>
                <a href="tel:+917011729639" className="text-accent hover:underline font-bold">+91 70117 29639</a> / <a href="tel:+919560332555" className="text-accent hover:underline">+91 95603 32555</a>
              </div>
            </div>
            <div className="pt-2 border-t border-border/60 text-[11px] text-slate-400">
              Operating Hours: Monday – Saturday: 10:00 AM – 7:00 PM IST (24x7 Emergency Transit Desk Operational 365 Days)
            </div>
          </div>
        </div>
      )
    }
  ];

  return (
    <>
      <JsonLd data={policySchema} />

      <div className="bg-background text-slate-100 min-h-screen">
        {/* Page Header & Breadcrumbs Section */}
        <section className="relative bg-background overflow-hidden border-b border-border pb-16">
          <div className="absolute inset-0 bg-gradient-to-b from-blue-900/10 via-slate-950 to-slate-950 pointer-events-none" />
          
          <div className="relative z-10">
            <Breadcrumbs items={breadcrumbsList} />
          </div>

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-4 relative z-10 pt-4">
            <div className="inline-flex items-center gap-2 bg-white/5 border border-border px-3.5 py-1 rounded-full text-xs text-accent font-semibold">
              <Lock className="w-3.5 h-3.5" />
              <span>DPDP Act & IT Act 2000 Compliant</span>
            </div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-slate-50">
              Privacy Policy
            </h1>
            <p className="text-slate-400 max-w-2xl mx-auto text-xs sm:text-sm leading-relaxed">
              TEMP TRAVEL CAR RENTALS PVT LTD &bull; Effective Date: November 2026. Review how we protect your personal, transit telemetry, and corporate mobility data.
            </p>
          </div>
        </section>

        {/* Legal Content Layout */}
        <section className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
            
            {/* Table of Contents / Sidebar (Desktop Only) */}
            <nav className="hidden lg:block lg:col-span-4 sticky top-28 space-y-2 bg-surface/50 border border-border p-5 rounded-2xl shadow-xl backdrop-blur-sm">
              <div className="text-[11px] font-extrabold text-accent uppercase tracking-widest mb-3 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4" />
                <span>Policy Navigation</span>
              </div>
              <div className="space-y-1 max-h-[70vh] overflow-y-auto pr-2 scrollbar-thin">
                {sections.map((sec) => (
                  <a 
                    key={sec.id}
                    href={`#${sec.id}`}
                    className="block px-3 py-2 rounded-lg text-slate-400 hover:text-accent hover:bg-white/5 text-xs font-semibold tracking-wide transition-all border-l-2 border-transparent hover:border-accent"
                  >
                    {sec.title}
                  </a>
                ))}
              </div>
            </nav>

            {/* Legal Text Sections */}
            <div className="lg:col-span-8 space-y-8">
              <div className="glassmorphism p-6 sm:p-8 rounded-2xl border border-border space-y-8 shadow-2xl">
                {sections.map((sec) => {
                  const Icon = sec.icon;
                  return (
                    <div key={sec.id} id={sec.id} className="space-y-3.5 scroll-mt-28">
                      <h2 className="text-base sm:text-lg font-bold text-slate-100 flex items-center gap-2.5 border-b border-border pb-2.5">
                        <Icon className="w-4 h-4 text-accent shrink-0" />
                        <span>{sec.title}</span>
                      </h2>
                      <div className="text-slate-300 text-xs sm:text-sm leading-relaxed font-normal">
                        {sec.content}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Quick Contact Box */}
              <div className="bg-surface/60 border border-border p-6 rounded-2xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 shadow-xl">
                <div className="space-y-1">
                  <h4 className="font-bold text-slate-50 text-sm flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-emerald-400" />
                    <span>Have Data Protection Inquiries?</span>
                  </h4>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Contact our dedicated compliance desk for roster data requests, account assistance, or DPDP Act inquiries.
                  </p>
                </div>
                <a 
                  href="mailto:compliance@temptravel.in" 
                  className="bg-accent hover:bg-yellow-500 text-slate-950 font-black py-2.5 px-5 rounded-xl text-xs flex items-center gap-2 transition-all uppercase tracking-wider shrink-0 shadow-lg shadow-accent/20"
                >
                  <Mail className="w-4 h-4" />
                  <span>Contact Compliance</span>
                </a>
              </div>

            </div>

          </div>
        </section>
      </div>
    </>
  );
}
