export const dynamic = "force-dynamic";

import React from "react";
import prisma from "@/lib/prisma";
import DashboardCharts from "./dashboard-charts";
import { 
  TrendingUp, 
  Calendar, 
  Building2, 
  Car, 
  IndianRupee, 
  Users, 
  PhoneCall, 
  Mail,
  ArrowRight,
  MessageSquare,
  Clock,
  Compass,
  Briefcase,
  MapPin,
  HelpCircle
} from "lucide-react";
import Link from "next/link";

export default async function AdminDashboardPage() {
  // 1. Fetch counts for all specific lead modules & metrics
  const pickupDropCount = await prisma.corporateLead.count({
    where: { serviceType: { contains: "Pickup & Drop", mode: "insensitive" } }
  });

  const corporateInquiryCount = await prisma.corporateLead.count({
    where: { NOT: { serviceType: { contains: "Pickup & Drop", mode: "insensitive" } } }
  });

  const localRentalCount = await prisma.rentalLead.count({
    where: { tripType: { contains: "Local", mode: "insensitive" } }
  });

  const outstationCount = await prisma.rentalLead.count({
    where: { tripType: { contains: "Outstation", mode: "insensitive" } }
  });

  const tourLeadsCount = await prisma.booking.count({
    where: { type: "TOUR_PACKAGE" }
  });

  const totalContactLeads = await prisma.contactLead.count();
  const totalBookings = await prisma.booking.count();
  const totalFleetVehicles = await prisma.fleetVehicle.count();
  
  const paymentAggregation = await prisma.razorpayPayment.aggregate({
    _sum: { amount: true },
    where: { status: "SUCCESS" }
  });
  const totalPaymentsAmount = Number(paymentAggregation._sum.amount || 0);

  // 2. Fetch recent bookings dispatches
  const recentBookings = await prisma.booking.findMany({
    take: 5,
    orderBy: { createdAt: "desc" },
    include: {
      customer: { select: { name: true } },
      vehicleCategory: { select: { name: true } },
      vehicle: { 
        select: { 
          registrationNumber: true,
          driver: { select: { name: true } }
        } 
      }
    }
  });

  // 3. Fetch recent submissions from distinct lead pipelines
  const recentPickupDropLeads = await prisma.corporateLead.findMany({
    take: 2,
    where: { serviceType: { contains: "Pickup & Drop", mode: "insensitive" } },
    orderBy: { createdAt: "desc" }
  });

  const recentCorporateInquiryLeads = await prisma.corporateLead.findMany({
    take: 2,
    where: { NOT: { serviceType: { contains: "Pickup & Drop", mode: "insensitive" } } },
    orderBy: { createdAt: "desc" }
  });

  const recentLocalLeads = await prisma.rentalLead.findMany({
    take: 2,
    where: { tripType: { contains: "Local", mode: "insensitive" } },
    orderBy: { createdAt: "desc" },
    include: { vehicleCategory: { select: { name: true } } }
  });

  const recentOutstationLeads = await prisma.rentalLead.findMany({
    take: 2,
    where: { tripType: { contains: "Outstation", mode: "insensitive" } },
    orderBy: { createdAt: "desc" },
    include: { vehicleCategory: { select: { name: true } } }
  });

  const recentContactLeads = await prisma.contactLead.findMany({
    take: 2,
    orderBy: { createdAt: "desc" }
  });

  // 4. Fetch lead conversions counts for bar chart
  const pickupDropConverted = await prisma.corporateLead.count({ 
    where: { 
      serviceType: { contains: "Pickup & Drop", mode: "insensitive" },
      status: { in: ["QUALIFIED", "NEGOTIATION", "WON"] } 
    } 
  });

  const localConverted = await prisma.rentalLead.count({ 
    where: { 
      tripType: { contains: "Local", mode: "insensitive" },
      status: { in: ["CONTACTED", "QUALIFIED", "WON"] } 
    } 
  });

  const outstationConverted = await prisma.rentalLead.count({ 
    where: { 
      tripType: { contains: "Outstation", mode: "insensitive" },
      status: { in: ["CONTACTED", "QUALIFIED", "WON"] } 
    } 
  });

  const corpInquiryConverted = await prisma.corporateLead.count({ 
    where: { 
      NOT: { serviceType: { contains: "Pickup & Drop", mode: "insensitive" } },
      status: { in: ["QUALIFIED", "NEGOTIATION", "WON"] } 
    } 
  });

  const contactContacted = await prisma.contactLead.count({ 
    where: { status: { in: ["READ", "CONTACTED", "QUALIFIED"] } } 
  });

  const leadConversionsData = [
    { name: "Pickup & Drop", total: pickupDropCount, converted: pickupDropConverted },
    { name: "Local Rentals", total: localRentalCount, converted: localConverted },
    { name: "Outstation", total: outstationCount, converted: outstationConverted },
    { name: "Corporate B2B", total: corporateInquiryCount, converted: corpInquiryConverted },
    { name: "Contact Msgs", total: totalContactLeads, converted: contactContacted }
  ];

  // 5. Fetch revenue history and bookings count for line chart
  const allBookings = await prisma.booking.findMany({
    select: {
      netAmount: true,
      createdAt: true
    }
  });

  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const currentYear = new Date().getFullYear();
  
  const monthlyRevenueData = months.map((m, idx) => {
    const monthBookings = allBookings.filter(b => b.createdAt.getMonth() === idx && b.createdAt.getFullYear() === currentYear);
    const revenue = monthBookings.reduce((sum, b) => sum + Number(b.netAmount), 0);
    return {
      month: m,
      revenue,
      bookings: monthBookings.length
    };
  }).slice(0, 6);

  // Counter cards configurations (8 distinct cards matching our lead structure)
  const cards = [
    {
      title: "Pickup & Drop Leads",
      value: pickupDropCount.toString(),
      change: "B2B transit leads",
      icon: Building2,
      color: "text-yellow-400",
      href: "/admin/corporate-leads"
    },
    {
      title: "Local Rentals Leads",
      value: localRentalCount.toString(),
      change: "Hourly 4h/40k & 8h/80k",
      icon: Clock,
      color: "text-purple-400",
      href: "/admin/local-rental-leads"
    },
    {
      title: "Outstation Leads",
      value: outstationCount.toString(),
      change: "Intercity 1-way/round",
      icon: Compass,
      color: "text-cyan-400",
      href: "/admin/outstation-leads"
    },
    {
      title: "Corporate Inquiry Leads",
      value: corporateInquiryCount.toString(),
      change: "Enterprise contracts",
      icon: Briefcase,
      color: "text-amber-400",
      href: "/admin/corporate-inquiry-leads"
    },
    {
      title: "Tour Package Leads",
      value: tourLeadsCount.toString(),
      change: "Domestic & intl tours",
      icon: MapPin,
      color: "text-emerald-400",
      href: "/admin/tour-leads"
    },
    {
      title: "Contact Leads",
      value: totalContactLeads.toString(),
      change: "General queries",
      icon: Mail,
      color: "text-blue-400",
      href: "/admin/contact-leads"
    },
    {
      title: "Fleet Vehicles",
      value: totalFleetVehicles.toString(),
      change: "Commercial fleet cars",
      icon: Car,
      color: "text-indigo-400",
      href: "/admin/fleet"
    },
    {
      title: "Total Payments",
      value: `₹${totalPaymentsAmount.toLocaleString("en-IN")}`,
      change: "Successful Razorpay logs",
      icon: IndianRupee,
      color: "text-emerald-300",
      href: "/admin/payments"
    }
  ];

  return (
    <div className="bg-slate-950 min-h-screen text-slate-100 p-8 space-y-8">
      {/* Title Header */}
      <div className="flex justify-between items-center border-b border-white/5 pb-6">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-50 tracking-tight">
            Dashboard Overview
          </h1>
          <p className="text-xs text-slate-400 mt-1">Live database metrics, isolated inquiry pipelines, and ride dispatches.</p>
        </div>
      </div>

      {/* Grid of counter cards (4 cards per row across 2 rows) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {cards.map((c, i) => {
          const Icon = c.icon;
          return (
            <Link 
              key={i} 
              href={c.href}
              className="glassmorphism p-4 rounded-xl border border-white/5 space-y-2 shadow-md flex justify-between items-start hover:border-primary/40 transition-all block group"
            >
              <div className="space-y-1">
                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">{c.title}</span>
                <div className="text-lg font-extrabold text-slate-50 group-hover:text-accent transition-colors">{c.value}</div>
                <div className="text-[9px] text-slate-500 font-semibold truncate">{c.change}</div>
              </div>
              <div className={`p-2 bg-white/5 border border-white/5 rounded-lg shrink-0 ${c.color}`}>
                <Icon className="w-4 h-4" />
              </div>
            </Link>
          );
        })}
      </div>

      {/* Visual Analytics charts */}
      <DashboardCharts 
        monthlyRevenueData={monthlyRevenueData}
        leadConversionsData={leadConversionsData}
      />

      {/* Recent Activity Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Recent Bookings Dispatch Table */}
        <div className="lg:col-span-8 glassmorphism p-6 rounded-xl border border-white/5 space-y-4 overflow-hidden">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-bold text-slate-50">Recent Ride Dispatches</h2>
            <Link 
              href="/admin/bookings-dispatch"
              className="text-xs font-semibold text-accent hover:underline flex items-center gap-1"
            >
              <span>Dispatch Desk</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-900 border-b border-white/5 text-slate-400 font-semibold uppercase tracking-wider">
                  <th className="p-3">Booking ID</th>
                  <th className="p-3">Customer</th>
                  <th className="p-3">Category</th>
                  <th className="p-3">Vehicle / Driver</th>
                  <th className="p-3 text-right">Net Amount</th>
                  <th className="p-3 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {recentBookings.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-4 text-center text-slate-500">No bookings available.</td>
                  </tr>
                ) : (
                  recentBookings.map((b) => (
                    <tr key={b.id} className="hover:bg-white/5 transition-colors">
                      <td className="p-3 font-mono font-bold text-slate-300">{b.bookingNumber}</td>
                      <td className="p-3 font-bold text-slate-200">{b.customer.name}</td>
                      <td className="p-3 text-slate-400">{b.vehicleCategory.name}</td>
                      <td className="p-3 text-slate-400">
                        {b.vehicle ? (
                          <span className="font-semibold text-slate-300">
                            {b.vehicle.registrationNumber} ({b.vehicle.driver?.name || "No Driver"})
                          </span>
                        ) : (
                          <span className="text-slate-500 italic">Unassigned</span>
                        )}
                      </td>
                      <td className="p-3 font-bold text-slate-300 text-right">₹{Number(b.netAmount).toLocaleString("en-IN")}</td>
                      <td className="p-3 text-center">
                        <span className={`text-[9px] font-bold py-0.5 px-2 rounded-full border ${
                          b.status === "COMPLETED" ? "text-green-400 border-green-500/20 bg-green-500/10" :
                          b.status === "CANCELLED" ? "text-red-400 border-red-500/20 bg-red-500/10" :
                          b.status === "CONFIRMED" ? "text-blue-400 border-blue-500/20 bg-blue-500/10" :
                          "text-yellow-400 border-yellow-500/20 bg-yellow-500/10"
                        }`}>
                          {b.status}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Recent Submissions Widget */}
        <div className="lg:col-span-4 glassmorphism p-6 rounded-xl border border-white/5 space-y-4">
          <h2 className="text-lg font-bold text-slate-50">Recent Pipeline Submissions</h2>
          <div className="space-y-3">
            
            {/* Pickup & Drop Leads Group */}
            {recentPickupDropLeads.map((lead) => (
              <div key={lead.id} className="bg-slate-950/45 p-3 rounded-lg border border-white/5 text-xs space-y-1 hover:border-yellow-500/20 transition-all">
                <div className="flex justify-between items-center">
                  <span className="font-extrabold text-yellow-400 uppercase tracking-widest text-[9px] flex items-center gap-1">
                    <Building2 className="w-3 h-3" />
                    <span>Pickup & Drop</span>
                  </span>
                  <span className="text-[9px] text-slate-500">{new Date(lead.createdAt).toLocaleDateString("en-IN")}</span>
                </div>
                <div className="font-bold text-slate-200">{lead.companyName}</div>
                <div className="text-[10px] text-slate-400">SPOC: {lead.contactName} &bull; {lead.phone}</div>
              </div>
            ))}

            {/* Local Rental Leads Group */}
            {recentLocalLeads.map((lead) => (
              <div key={lead.id} className="bg-slate-950/45 p-3 rounded-lg border border-white/5 text-xs space-y-1 hover:border-purple-500/20 transition-all">
                <div className="flex justify-between items-center">
                  <span className="font-extrabold text-purple-400 uppercase tracking-widest text-[9px] flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    <span>Local Rental</span>
                  </span>
                  <span className="text-[9px] text-slate-500">{new Date(lead.createdAt).toLocaleDateString("en-IN")}</span>
                </div>
                <div className="font-bold text-slate-200">{lead.customerName}</div>
                <div className="text-[10px] text-slate-400">{lead.tripType || "Local"} &bull; {lead.phone}</div>
              </div>
            ))}

            {/* Outstation Leads Group */}
            {recentOutstationLeads.map((lead) => (
              <div key={lead.id} className="bg-slate-950/45 p-3 rounded-lg border border-white/5 text-xs space-y-1 hover:border-cyan-500/20 transition-all">
                <div className="flex justify-between items-center">
                  <span className="font-extrabold text-cyan-400 uppercase tracking-widest text-[9px] flex items-center gap-1">
                    <Compass className="w-3 h-3" />
                    <span>Outstation</span>
                  </span>
                  <span className="text-[9px] text-slate-500">{new Date(lead.createdAt).toLocaleDateString("en-IN")}</span>
                </div>
                <div className="font-bold text-slate-200">{lead.customerName}</div>
                <div className="text-[10px] text-slate-400">{lead.pickupLocation} → {lead.dropLocation || "N/A"}</div>
              </div>
            ))}

            {/* Corporate Inquiry Leads Group */}
            {recentCorporateInquiryLeads.map((lead) => (
              <div key={lead.id} className="bg-slate-950/45 p-3 rounded-lg border border-white/5 text-xs space-y-1 hover:border-amber-500/20 transition-all">
                <div className="flex justify-between items-center">
                  <span className="font-extrabold text-amber-400 uppercase tracking-widest text-[9px] flex items-center gap-1">
                    <Briefcase className="w-3 h-3" />
                    <span>Corporate B2B</span>
                  </span>
                  <span className="text-[9px] text-slate-500">{new Date(lead.createdAt).toLocaleDateString("en-IN")}</span>
                </div>
                <div className="font-bold text-slate-200">{lead.companyName}</div>
                <div className="text-[10px] text-slate-400">SPOC: {lead.contactName} &bull; {lead.serviceType}</div>
              </div>
            ))}

            {/* Contact Leads Group */}
            {recentContactLeads.map((lead) => (
              <div key={lead.id} className="bg-slate-950/45 p-3 rounded-lg border border-white/5 text-xs space-y-1 hover:border-blue-500/20 transition-all">
                <div className="flex justify-between items-center">
                  <span className="font-extrabold text-blue-400 uppercase tracking-widest text-[9px] flex items-center gap-1">
                    <Mail className="w-3 h-3" />
                    <span>General Query</span>
                  </span>
                  <span className="text-[9px] text-slate-500">{new Date(lead.createdAt).toLocaleDateString("en-IN")}</span>
                </div>
                <div className="font-bold text-slate-200">{lead.name}</div>
                <div className="text-[10px] text-slate-400 line-clamp-1 italic text-slate-400">"{lead.message}"</div>
              </div>
            ))}

            {recentPickupDropLeads.length === 0 && recentLocalLeads.length === 0 && recentOutstationLeads.length === 0 && recentCorporateInquiryLeads.length === 0 && recentContactLeads.length === 0 && (
              <div className="text-center p-4 text-xs text-slate-500">No recent submissions found.</div>
            )}

          </div>
        </div>

      </div>
    </div>
  );
}
