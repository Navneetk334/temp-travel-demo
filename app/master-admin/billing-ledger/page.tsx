"use client";

import React, { useState } from "react";
import {
  CreditCard,
  IndianRupee,
  FileText,
  Download,
  CheckCircle2,
  AlertCircle,
  Building2,
  Calendar,
  Search,
  Filter,
  ArrowUpRight,
  ShieldCheck
} from "lucide-react";

export default function MasterBillingLedgerPage() {
  const [activeLedgerTab, setActiveLedgerTab] = useState<"invoices" | "razorpay" | "cash">("invoices");

  const billingInvoices = [
    {
      id: "INV-2026-001",
      customerName: "Acme Corp Logistics",
      gstin: "27AABCU9603R1ZM",
      tripType: "Corporate Employee Transit",
      baseAmount: 45000,
      cgst: 2700,
      sgst: 2700,
      totalAmount: 50400,
      sacCode: "996412",
      status: "PAID",
      date: "2026-08-20"
    },
    {
      id: "INV-2026-002",
      customerName: "Dr. Aris Thorne",
      gstin: "URP (Unregistered)",
      tripType: "Outstation Car Rental - Pune",
      baseAmount: 8500,
      cgst: 255,
      sgst: 255,
      totalAmount: 9010,
      sacCode: "996412",
      status: "PAID",
      date: "2026-08-19"
    },
    {
      id: "INV-2026-003",
      customerName: "Tata Consultancy Services",
      gstin: "27AAACT2727Q1ZW",
      tripType: "Monthly Airport Executive Shuttle",
      baseAmount: 120000,
      cgst: 7200,
      sgst: 7200,
      totalAmount: 134400,
      sacCode: "996412",
      status: "PENDING",
      date: "2026-08-18"
    }
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-amber-500/20 pb-6">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-3xl font-black tracking-tight text-slate-50">
              Master Billing & Tax Ledger
            </h1>
            <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-widest">
              GST Tax Compliant (SAC 9964)
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Automated GST tax invoicing, Razorpay order settlements, and driver cash collection reconciliation.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 px-4 py-2 rounded-xl text-xs font-black tracking-wider uppercase transition-all shadow-lg shadow-amber-500/20">
            <FileText className="w-4 h-4" />
            <span>Generate New GST Invoice</span>
          </button>
        </div>
      </div>

      {/* Financial Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-slate-900/80 backdrop-blur-xl border border-amber-500/30 rounded-2xl p-6 shadow-xl">
          <div className="flex justify-between items-center mb-2">
            <span className="text-xs text-slate-400 font-bold uppercase">Total Invoiced Billing</span>
            <IndianRupee className="w-5 h-5 text-amber-400" />
          </div>
          <div className="text-3xl font-black text-slate-50 font-mono">₹1,93,810</div>
          <div className="text-[11px] text-slate-400 mt-1">CGST (6%) + SGST (6%) / IGST (12%) Applied</div>
        </div>

        <div className="bg-slate-900/80 backdrop-blur-xl border border-emerald-500/30 rounded-2xl p-6 shadow-xl">
          <div className="flex justify-between items-center mb-2">
            <span className="text-xs text-slate-400 font-bold uppercase">Razorpay Bank Settlements</span>
            <CheckCircle2 className="w-5 h-5 text-emerald-400" />
          </div>
          <div className="text-3xl font-black text-slate-50 font-mono">₹1,44,810</div>
          <div className="text-[11px] text-emerald-400 mt-1">Verified Gateway HMAC Signatures</div>
        </div>

        <div className="bg-slate-900/80 backdrop-blur-xl border border-blue-500/30 rounded-2xl p-6 shadow-xl">
          <div className="flex justify-between items-center mb-2">
            <span className="text-xs text-slate-400 font-bold uppercase">Driver Cash Collections</span>
            <CreditCard className="w-5 h-5 text-blue-400" />
          </div>
          <div className="text-3xl font-black text-slate-50 font-mono">₹49,000</div>
          <div className="text-[11px] text-blue-400 mt-1">Reconciled against Duty Logs</div>
        </div>
      </div>

      {/* Invoices & Gateway Ledger Table */}
      <div className="bg-slate-900/80 backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-2xl space-y-4">
        <div className="flex justify-between items-center pb-4 border-b border-white/10">
          <h3 className="text-base font-bold text-slate-100">Tax Invoices & Transaction History</h3>
          <span className="text-xs font-mono text-slate-400">SAC Code: 996412 (Passenger Transport)</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950 text-slate-400 font-extrabold uppercase text-[10px] tracking-wider border-b border-white/10">
              <tr>
                <th className="py-3 px-4">Invoice # & Date</th>
                <th className="py-3 px-4">Customer & GSTIN</th>
                <th className="py-3 px-4">Base Fare</th>
                <th className="py-3 px-4">GST (12%)</th>
                <th className="py-3 px-4">Total Amount</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">PDF Invoice</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {billingInvoices.map((inv) => (
                <tr key={inv.id} className="hover:bg-white/5 transition-colors">
                  <td className="py-4 px-4 font-mono font-bold text-amber-400">
                    <div>{inv.id}</div>
                    <div className="text-[10px] text-slate-500 font-normal">{inv.date}</div>
                  </td>
                  <td className="py-4 px-4">
                    <div className="font-bold text-slate-100">{inv.customerName}</div>
                    <div className="text-[10px] font-mono text-slate-400">GSTIN: {inv.gstin}</div>
                  </td>
                  <td className="py-4 px-4 font-mono text-slate-200">₹{inv.baseAmount.toLocaleString("en-IN")}</td>
                  <td className="py-4 px-4 font-mono text-slate-400">₹{(inv.cgst + inv.sgst).toLocaleString("en-IN")}</td>
                  <td className="py-4 px-4 font-mono font-bold text-emerald-400">₹{inv.totalAmount.toLocaleString("en-IN")}</td>
                  <td className="py-4 px-4">
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                      inv.status === "PAID" ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" : "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                    }`}>
                      {inv.status}
                    </span>
                  </td>
                  <td className="py-4 px-4 text-right">
                    <button className="inline-flex items-center gap-1 bg-slate-950 text-slate-300 hover:text-white border border-white/10 hover:border-amber-400/40 px-3 py-1 rounded-lg text-[11px] font-bold transition-all">
                      <Download className="w-3 h-3 text-amber-400" /> PDF Receipt
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
