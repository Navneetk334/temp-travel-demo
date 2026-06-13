import React from "react";
import Link from "next/link";
import { CheckCircle2, Calendar, ShieldCheck, PhoneCall, FileText } from "lucide-react";

interface PageProps {
  searchParams: Promise<{
    bookingNumber?: string;
  }>;
}

export default async function PaymentSuccessPage({ searchParams }: PageProps) {
  const resolvedParams = await searchParams;
  const bookingNumber = resolvedParams.bookingNumber || "TT-MUM-9837";

  return (
    <div className="bg-slate-950 min-h-[80vh] text-slate-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-xl w-full glassmorphism rounded-2xl border border-green-500/20 shadow-2xl p-8 space-y-6 text-center">
        
        {/* Banner icon */}
        <div className="relative w-20 h-20 bg-green-500/10 rounded-full flex items-center justify-center mx-auto border border-green-500/25">
          <CheckCircle2 className="w-12 h-12 text-green-400" />
        </div>

        <div className="space-y-2">
          <h1 className="text-3xl font-extrabold text-slate-50 tracking-tight leading-snug">
            Booking Confirmed!
          </h1>
          <p className="text-sm text-slate-400">
            Payment verified successfully. Your booking is logged inside our dispatch systems.
          </p>
        </div>

        {/* Details Card */}
        <div className="bg-slate-950/60 p-6 border border-white/5 rounded-xl text-left space-y-4">
          <div className="flex justify-between items-center text-xs">
            <span className="text-slate-400 font-semibold uppercase tracking-wider">Booking Number</span>
            <span className="font-mono font-bold text-accent text-sm">{bookingNumber}</span>
          </div>

          <div className="flex justify-between items-center text-xs border-t border-white/5 pt-3">
            <span className="text-slate-400 font-semibold uppercase tracking-wider">Payment Status</span>
            <span className="text-green-400 font-bold uppercase tracking-wider flex items-center gap-1">
              <ShieldCheck className="w-4 h-4" />
              <span>Full/Advance Paid</span>
            </span>
          </div>
        </div>

        {/* Instructions */}
        <div className="text-xs text-slate-400 leading-relaxed text-left space-y-3 pt-2">
          <div className="flex gap-2.5 items-start">
            <Calendar className="w-4.5 h-4.5 text-accent shrink-0" />
            <span>A PDF invoice receipt has been compiled and emailed to your registered address.</span>
          </div>
          <div className="flex gap-2.5 items-start">
            <PhoneCall className="w-4.5 h-4.5 text-accent shrink-0" />
            <span>Driver details and registration plates will be shared via SMS/WhatsApp 4 hours before pickup.</span>
          </div>
        </div>

        {/* Action button */}
        <div className="flex flex-col sm:flex-row gap-4 pt-4 justify-center">
          <Link
            href="/dashboard/bookings"
            className="flex items-center justify-center gap-1.5 bg-primary hover:bg-blue-700 text-white font-bold py-2.5 px-6 rounded-lg text-xs tracking-wider uppercase transition-all shadow-md"
          >
            <FileText className="w-4 h-4" />
            <span>My Dashboard Bookings</span>
          </Link>
          <Link
            href="/"
            className="bg-slate-900 hover:bg-slate-800 text-slate-300 font-bold py-2.5 px-6 rounded-lg text-xs tracking-wider uppercase transition-all border border-white/10"
          >
            Go to Homepage
          </Link>
        </div>

      </div>
    </div>
  );
}
