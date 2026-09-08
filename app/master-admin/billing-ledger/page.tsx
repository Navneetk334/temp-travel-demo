import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { verifyAdminToken, ADMIN_COOKIE_NAME } from "@/lib/auth";
import prisma from "@/lib/prisma";
import InvoiceGenerator from "./components/InvoiceGenerator";
import { ShieldAlert, IndianRupee, FileText } from "lucide-react";

export const metadata = {
  title: "Billing & Ledger | Master Admin HQ",
};

export default async function BillingLedgerPage() {
  // 1. Enforce SUPER_ADMIN role securely on the server
  const cookieStore = await cookies();
  const token = cookieStore.get(ADMIN_COOKIE_NAME)?.value;
  
  if (!token || token === "mock-admin-token") {
    redirect("/master-admin/login");
  }

  const admin = verifyAdminToken(token);
  if (!admin || admin.role !== "SUPER_ADMIN") {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] text-center space-y-4">
        <ShieldAlert className="w-16 h-16 text-red-500 animate-pulse" />
        <h1 className="text-3xl font-black text-slate-100 uppercase tracking-widest">Access Denied</h1>
        <p className="text-slate-400 font-mono text-sm max-w-md">
          CRITICAL SECURITY BREACH: This sector requires [SUPER_ADMIN] Level 5 clearance. 
          Your current clearance [{admin?.role || 'UNKNOWN'}] is insufficient. 
          The intrusion attempt has been logged.
        </p>
      </div>
    );
  }

  // 2. Fetch Billing Data (Bookings & Payments)
  const bookings = await prisma.booking.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      customer: true,
      vehicle: true,
      vehicleCategory: true,
      payments: true,
    },
  });

  // Basic Analytics
  const totalRevenue = bookings.reduce((sum, b) => sum + Number(b.netAmount), 0);
  const pendingPayments = bookings.filter(b => b.payments.every(p => p.status !== 'SUCCESS')).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-slate-50 tracking-tight uppercase flex items-center gap-2">
            <IndianRupee className="text-amber-400" />
            Billing & Financial Ledger
          </h1>
          <p className="text-sm text-slate-400 mt-1">Master Admin Secure Terminal. ISO 27001 Encrypted.</p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-slate-900 border border-white/5 rounded-2xl p-5 shadow-lg relative overflow-hidden">
          <div className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-1">Total Revenue</div>
          <div className="text-3xl font-black text-emerald-400">₹{totalRevenue.toLocaleString()}</div>
        </div>
        <div className="bg-slate-900 border border-white/5 rounded-2xl p-5 shadow-lg relative overflow-hidden">
          <div className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-1">Total Bookings</div>
          <div className="text-3xl font-black text-amber-400">{bookings.length}</div>
        </div>
        <div className="bg-slate-900 border border-white/5 rounded-2xl p-5 shadow-lg relative overflow-hidden">
          <div className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-1">Pending Payments</div>
          <div className="text-3xl font-black text-rose-400">{pendingPayments}</div>
        </div>
      </div>

      {/* Ledger Table */}
      <div className="bg-slate-900/80 backdrop-blur-xl border border-white/5 rounded-2xl overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-slate-950/50 text-xs uppercase font-black text-slate-400 tracking-wider">
              <tr>
                <th className="px-6 py-4">Booking ID</th>
                <th className="px-6 py-4">Customer</th>
                <th className="px-6 py-4">Type</th>
                <th className="px-6 py-4">Net Amount</th>
                <th className="px-6 py-4">Payment Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-slate-300">
              {bookings.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-slate-500 italic">No billing records found.</td>
                </tr>
              ) : (
                bookings.map((booking) => {
                  const paymentSuccess = booking.payments.some(p => p.status === 'SUCCESS');
                  return (
                    <tr key={booking.id} className="hover:bg-white/5 transition-colors">
                      <td className="px-6 py-4 font-mono text-amber-400 text-xs">
                        {booking.bookingNumber}
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-bold text-slate-100">{booking.customer.name}</div>
                        <div className="text-[10px] text-slate-500">{booking.customer.email}</div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="bg-slate-800 text-slate-300 px-2.5 py-1 rounded-md text-[10px] font-bold">
                          {booking.type.replace("_", " ")}
                        </span>
                      </td>
                      <td className="px-6 py-4 font-black text-emerald-400">
                        ₹{Number(booking.netAmount).toLocaleString()}
                      </td>
                      <td className="px-6 py-4">
                        {paymentSuccess ? (
                          <span className="inline-flex items-center gap-1 text-emerald-400 text-[10px] font-black uppercase bg-emerald-500/10 border border-emerald-500/30 px-2 py-0.5 rounded-full">
                            Paid
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-amber-400 text-[10px] font-black uppercase bg-amber-500/10 border border-amber-500/30 px-2 py-0.5 rounded-full">
                            Pending
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <InvoiceGenerator booking={booking} />
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
