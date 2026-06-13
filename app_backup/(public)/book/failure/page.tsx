import React from "react";
import Link from "next/link";
import { AlertCircle, RefreshCw, Phone, Mail } from "lucide-react";

export default function PaymentFailurePage() {
  return (
    <div className="bg-slate-950 min-h-[80vh] text-slate-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-xl w-full glassmorphism rounded-2xl border border-red-500/20 shadow-2xl p-8 space-y-6 text-center">
        
        {/* Banner icon */}
        <div className="relative w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center mx-auto border border-red-500/25">
          <AlertCircle className="w-12 h-12 text-red-400" />
        </div>

        <div className="space-y-2">
          <h1 className="text-3xl font-extrabold text-slate-50 tracking-tight leading-snug">
            Transaction Failed!
          </h1>
          <p className="text-sm text-slate-400 font-medium">
            We could not complete your payment verification. Your banking order has been logged.
          </p>
        </div>

        {/* Possible reasons */}
        <div className="bg-slate-950/60 p-5 border border-white/5 rounded-xl text-left space-y-2.5 text-xs text-slate-300">
          <div className="font-bold text-slate-100 uppercase tracking-wider text-[10px]">Common Reasons:</div>
          <ul className="list-disc pl-4 space-y-1 text-slate-400">
            <li>User aborted checkout before entering credentials.</li>
            <li>Insufficient balance in card/wallet options.</li>
            <li>Bank servers timed out during two-factor authentication.</li>
          </ul>
        </div>

        {/* Contact dispatch */}
        <p className="text-xs text-slate-400 leading-relaxed max-w-sm mx-auto">
          If your account has been debited, do not re-pay. Our webhook receiver will automatically process and confirm your booking as soon as the banking clearance arrives.
        </p>

        {/* Support contacts */}
        <div className="flex justify-center gap-6 text-xs text-slate-400 border-t border-white/5 pt-5">
          <a href="tel:+919999999999" className="flex items-center gap-1 hover:text-accent transition-colors">
            <Phone className="w-4 h-4 text-accent" />
            <span>+91 99999 99999</span>
          </a>
          <a href="mailto:info@temptravels.com" className="flex items-center gap-1 hover:text-accent transition-colors">
            <Mail className="w-4 h-4 text-accent" />
            <span>info@temptravels.com</span>
          </a>
        </div>

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row gap-4 pt-4 justify-center">
          <Link
            href="/book"
            className="flex items-center justify-center gap-1.5 bg-primary hover:bg-blue-700 text-white font-bold py-2.5 px-6 rounded-lg text-xs tracking-wider uppercase transition-all shadow-md"
          >
            <RefreshCw className="w-4 h-4 animate-spin-slow" />
            <span>Retry Payment checkout</span>
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
