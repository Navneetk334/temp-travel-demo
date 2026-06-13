import React from "react";
import prisma from "@/lib/prisma";
import DashboardCharts from "./dashboard-charts";
import { 
  TrendingUp, 
  Calendar, 
  Building2, 
  Car, 
  DollarSign, 
  Users, 
  PhoneCall, 
  Mail,
  ArrowRight,
  MessageSquare,
  HelpCircle
} from "lucide-react";
import Link from "next/link";

export default async function AdminDashboardPage() {
  // 1. Fetch counts for dashboard cards
  const totalContactLeads = await prisma.contactLead.count();
  const totalCorporateLeads = await prisma.corporateLead.count();
  const totalRentalLeads = await prisma.rentalLead.count();
  const totalBookings = await prisma.booking.count();
  
  const paymentAggregation = await prisma.razorpayPayment.aggregate({
    _sum: { amount: true },
    where: { status: "SUCCESS" }
  });
  const totalPaymentsAmount = Number(paymentAggregation._sum.amount || 0);
  const totalPaymentsCount = await prisma.razorpayPayment.count({
    where: { status: "SUCCESS" }
  });

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

  // 3. Fetch recent submissions from different lead pipelines
  const recentCorpLeads = await prisma.corporateLead.findMany({
    take: 3,
    orderBy: { createdAt: "desc" }
  });

  const recentRentalLeads = await prisma.rentalLead.findMany({
    take: 3,
    orderBy: { createdAt: "desc" },
    include: { vehicleCategory: { select: { name: true } } }
  });

  const recentContactLeads = await prisma.contactLead.findMany({
    take: 3,
    orderBy: { createdAt: "desc" }
  });

  // 4. Fetch lead conversions counts for bar chart
  const corpTotal = await prisma.corporateLead.count();
  const corpQualified = await prisma.corporateLead.count({ where: { status: "QUALIFIED" } });

  const rentalTotal = await prisma.rentalLead.count();
  const rentalContacted = await prisma.rentalLead.count({ where: { status: "CONTACTED" } });

  const contactTotal = await prisma.contactLead.count();
  const contactContacted = await prisma.contactLead.count({ where: { status: "CONTACTED" } });

  const leadConversionsData = [
    { name: "Corporate Leads", total: corpTotal, converted: corpQualified },
    { name: "Rental Leads", total: rentalTotal, converted: rentalContacted },
    { name: "Contact Leads", total: contactTotal, converted: contactContacted }
  ];

  // 5. Fetch revenue history and bookings count for line chart (Jan-Dec for current year)
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
  }).slice(0, 6); // show first 6 months

  // Counter cards configurations
  const cards = [
    {
      title: "Contact Leads",
      value: totalContactLeads.toString(),
      change: "General web queries",
      icon: Mail,
      color: "text-blue-400",
      href: "/admin/contact-leads"
    },
    {
      title: "Corporate Leads",
      value: totalCorporateLeads.toString(),
      change: "B2B transit accounts",
      icon: Building2,
      color: "text-yellow-400",
      href: "/admin/corporate-leads"
    },
    {
      title: "Rental Leads",
      value: totalRentalLeads.toString(),
      change: "B2C hourly & outstation",
      icon: PhoneCall,
      color: "text-purple-400",
      href: "/admin/rental-leads"
    },
    {
      title: "Total Bookings",
      value: totalBookings.toString(),
      change: "All rides generated",
      icon: Calendar,
      color: "text-green-400",
      href: "/admin/bookings-dispatch"
    },
    {
      title: "Total Payments",
      value: `₹${totalPaymentsAmount.toLocaleString("en-IN")}`,
      change: `${totalPaymentsCount} successful logs`,
      icon: DollarSign,
      color: "text-emerald-400",
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
          <p className="text-xs text-slate-400 mt-1">Live database metrics, inquiry submissions, and ride allocations.</p>
        </div>
      </div>

      {/* Grid of counter cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
        {cards.map((c, i) => {
          const Icon = c.icon;
          return (
            <Link 
              key={i} 
              href={c.href}
              className="glassmorphism p-5 rounded-xl border border-white/5 space-y-3 shadow-md flex justify-between items-start hover:border-primary/30 transition-all block group"
            >
              <div className="space-y-1.5">
                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">{c.title}</span>
                <div className="text-xl font-extrabold text-slate-50 group-hover:text-accent transition-colors">{c.value}</div>
                <div className="text-[9px] text-slate-500 font-semibold">{c.change}</div>
              </div>
              <div className={`p-2.5 bg-white/5 border border-white/5 rounded-lg ${c.color}`}>
                <Icon className="w-4.5 h-4.5" />
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
          <h2 className="text-lg font-bold text-slate-50">Recent Lead Submissions</h2>
          <div className="space-y-4">
            
            {/* Corporate Leads Group */}
            {recentCorpLeads.map((lead) => (
              <div key={lead.id} className="bg-slate-950/45 p-3 rounded-lg border border-white/5 text-xs space-y-1 hover:border-yellow-500/20 transition-all">
                <div className="flex justify-between items-center">
                  <span className="font-extrabold text-yellow-400 uppercase tracking-widest text-[9px] flex items-center gap-1">
                    <Building2 className="w-3 h-3" />
                    <span>Corporate B2B</span>
                  </span>
                  <span className="text-[9px] text-slate-500">{new Date(lead.createdAt).toLocaleDateString()}</span>
                </div>
                <div className="font-bold text-slate-200">{lead.companyName}</div>
                <div className="text-[10px] text-slate-400">POC: {lead.contactName} &bull; {lead.phone}</div>
              </div>
            ))}

            {/* Rental Leads Group */}
            {recentRentalLeads.map((lead) => (
              <div key={lead.id} className="bg-slate-950/45 p-3 rounded-lg border border-white/5 text-xs space-y-1 hover:border-purple-500/20 transition-all">
                <div className="flex justify-between items-center">
                  <span className="font-extrabold text-purple-400 uppercase tracking-widest text-[9px] flex items-center gap-1">
                    <PhoneCall className="w-3 h-3" />
                    <span>Rental B2C</span>
                  </span>
                  <span className="text-[9px] text-slate-500">{new Date(lead.createdAt).toLocaleDateString()}</span>
                </div>
                <div className="font-bold text-slate-200">{lead.customerName}</div>
                <div className="text-[10px] text-slate-400">{lead.vehicleCategory?.name || "Cab"} &bull; {lead.tripType} &bull; {lead.phone}</div>
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
                  <span className="text-[9px] text-slate-500">{new Date(lead.createdAt).toLocaleDateString()}</span>
                </div>
                <div className="font-bold text-slate-200">{lead.name}</div>
                <div className="text-[10px] text-slate-400 line-clamp-1 italic text-slate-400">"{lead.message}"</div>
              </div>
            ))}

            {recentCorpLeads.length === 0 && recentRentalLeads.length === 0 && recentContactLeads.length === 0 && (
              <div className="text-center p-4 text-xs text-slate-500">No submissions found.</div>
            )}

          </div>
        </div>

      </div>
    </div>
  );
}
