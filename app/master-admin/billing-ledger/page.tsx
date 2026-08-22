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
  ShieldCheck,
  X,
  Plus
} from "lucide-react";

export default function MasterBillingLedgerPage() {
  const [activeLedgerTab, setActiveLedgerTab] = useState<"invoices" | "razorpay" | "cash">("invoices");
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<any | null>(null);

  const [invoices, setInvoices] = useState<any[]>([]);

  const [invoiceForm, setInvoiceForm] = useState({
    customerName: "",
    gstin: "",
    tripType: "Corporate Employee Transit",
    baseAmount: "",
  });

  const handleCreateInvoiceSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const base = parseFloat(invoiceForm.baseAmount) || 0;
    const cgst = base * 0.06;
    const sgst = base * 0.06;
    const created = {
      id: `INV-2026-00${invoices.length + 1}`,
      customerName: invoiceForm.customerName,
      gstin: invoiceForm.gstin || "URP (Unregistered)",
      tripType: invoiceForm.tripType,
      baseAmount: base,
      cgst,
      sgst,
      totalAmount: base + cgst + sgst,
      sacCode: "996412",
      status: "PAID",
      date: new Date().toISOString().slice(0, 10)
    };
    setInvoices([created, ...invoices]);
    setShowInvoiceModal(false);
    setInvoiceForm({ customerName: "", gstin: "", tripType: "Corporate Employee Transit", baseAmount: "" });
  };

  const handlePrintPDF = (inv: any) => {
    setSelectedInvoice(inv);
  };

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
          <button
            onClick={() => setShowInvoiceModal(true)}
            className="flex items-center gap-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 px-4 py-2 rounded-xl text-xs font-black tracking-wider uppercase transition-all shadow-lg shadow-amber-500/20"
          >
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
          <div className="text-3xl font-black text-slate-50 font-mono">
            ₹{invoices.reduce((acc, i) => acc + i.totalAmount, 0).toLocaleString("en-IN")}
          </div>
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
              {invoices.map((inv) => (
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
                    <button
                      onClick={() => handlePrintPDF(inv)}
                      className="inline-flex items-center gap-1 bg-slate-950 text-slate-300 hover:text-white border border-white/10 hover:border-amber-400/40 px-3 py-1 rounded-lg text-[11px] font-bold transition-all"
                    >
                      <Download className="w-3 h-3 text-amber-400" /> PDF Receipt
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Generate GST Invoice Modal */}
      {showInvoiceModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-amber-500/30 rounded-2xl p-6 w-full max-w-lg shadow-2xl space-y-4 relative text-slate-100">
            <button
              onClick={() => setShowInvoiceModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="space-y-1">
              <span className="text-[10px] font-bold uppercase text-amber-400 tracking-wider">GST Tax Invoice Generator</span>
              <h3 className="text-xl font-bold text-slate-50">Create New Bill</h3>
            </div>

            <form onSubmit={handleCreateInvoiceSubmit} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="text-slate-400 font-bold">Customer / Company Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Acme Corp Logistics"
                  value={invoiceForm.customerName}
                  onChange={(e) => setInvoiceForm({ ...invoiceForm, customerName: e.target.value })}
                  className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-slate-100 focus:outline-none focus:border-amber-400"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-slate-400 font-bold">GSTIN (Optional)</label>
                  <input
                    type="text"
                    placeholder="27AAAAA0000A1Z5"
                    value={invoiceForm.gstin}
                    onChange={(e) => setInvoiceForm({ ...invoiceForm, gstin: e.target.value })}
                    className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-slate-100 focus:outline-none focus:border-amber-400"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-slate-400 font-bold">Base Fare Amount (₹) *</label>
                  <input
                    type="number"
                    required
                    placeholder="45000"
                    value={invoiceForm.baseAmount}
                    onChange={(e) => setInvoiceForm({ ...invoiceForm, baseAmount: e.target.value })}
                    className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-slate-100 focus:outline-none focus:border-amber-400"
                  />
                </div>
              </div>

              <div className="p-3 bg-slate-950 rounded-xl border border-white/5 space-y-1 font-mono text-[11px]">
                <div className="flex justify-between text-slate-400">
                  <span>SAC Code:</span>
                  <span className="text-slate-200">996412</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>CGST (6%):</span>
                  <span className="text-amber-400">₹{((parseFloat(invoiceForm.baseAmount) || 0) * 0.06).toLocaleString("en-IN")}</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>SGST (6%):</span>
                  <span className="text-amber-400">₹{((parseFloat(invoiceForm.baseAmount) || 0) * 0.06).toLocaleString("en-IN")}</span>
                </div>
                <div className="flex justify-between text-slate-200 font-bold pt-1 border-t border-white/10">
                  <span>Total Tax Inclusive Bill:</span>
                  <span className="text-emerald-400">₹{((parseFloat(invoiceForm.baseAmount) || 0) * 1.12).toLocaleString("en-IN")}</span>
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowInvoiceModal(false)}
                  className="px-4 py-2 bg-slate-950 text-slate-400 hover:text-white rounded-xl text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-amber-500 text-slate-950 font-bold rounded-xl text-xs uppercase"
                >
                  Generate Invoice
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* PDF Receipt Viewer Modal */}
      {selectedInvoice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-amber-500/30 rounded-2xl p-6 w-full max-w-lg shadow-2xl space-y-4 relative text-slate-100">
            <button
              onClick={() => setSelectedInvoice(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="space-y-1 text-center border-b border-white/10 pb-4">
              <img src="/images/logo.png" alt="TEMP TRAVEL" className="h-10 mx-auto object-contain mb-1" />
              <h3 className="text-lg font-bold text-slate-50">TAX INVOICE - TEMP TRAVEL CAR RENTALS PVT LTD</h3>
              <div className="text-[10px] text-slate-400 font-mono">Invoice Ref: {selectedInvoice.id} &bull; Date: {selectedInvoice.date}</div>
            </div>

            <div className="space-y-2 text-xs font-mono bg-slate-950 p-4 rounded-xl border border-white/5">
              <div className="flex justify-between">
                <span className="text-slate-400">Billed To:</span>
                <span className="text-slate-100 font-bold">{selectedInvoice.customerName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">GSTIN:</span>
                <span className="text-slate-200">{selectedInvoice.gstin}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">SAC Code:</span>
                <span className="text-slate-200">{selectedInvoice.sacCode}</span>
              </div>
              <div className="border-t border-white/10 pt-2 flex justify-between">
                <span className="text-slate-400">Base Fare:</span>
                <span className="text-slate-200">₹{selectedInvoice.baseAmount.toLocaleString("en-IN")}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">CGST (6%) + SGST (6%):</span>
                <span className="text-amber-400">₹{(selectedInvoice.cgst + selectedInvoice.sgst).toLocaleString("en-IN")}</span>
              </div>
              <div className="border-t border-white/10 pt-2 flex justify-between text-emerald-400 font-bold text-sm">
                <span>Total Amount Paid:</span>
                <span>₹{selectedInvoice.totalAmount.toLocaleString("en-IN")}</span>
              </div>
            </div>

            <div className="pt-2 flex justify-end gap-3">
              <button
                onClick={() => setSelectedInvoice(null)}
                className="px-4 py-2 bg-amber-500 text-slate-950 font-bold rounded-xl text-xs"
              >
                Close Receipt
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
