"use client";

import React, { useState, useEffect } from "react";
import { CreditCard, Search, ShieldCheck, XCircle, FileText, ChevronRight, X } from "lucide-react";

interface Payment {
  id: string;
  booking: {
    bookingNumber: string;
    customer: {
      name: string;
    }
  };
  razorpayOrderId: string;
  razorpayPaymentId?: string | null;
  status: "PENDING" | "SUCCESS" | "FAILED" | "REFUNDED";
  amount: number;
  currency: string;
  gatewayResponse?: any;
  createdAt: string;
}

export default function AdminPaymentsPage() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [activePayment, setActivePayment] = useState<Payment | null>(null);

  useEffect(() => {
    // Mock load payments (in production fetched from /api/payments API)
    const mockPayments: Payment[] = [
      {
        id: "1",
        booking: {
          bookingNumber: "TT-GOA-9873",
          customer: { name: "Ananya Sen" }
        },
        razorpayOrderId: "order_OG8927F389A",
        razorpayPaymentId: "pay_OG9823HF98S",
        status: "SUCCESS",
        amount: 24999,
        currency: "INR",
        createdAt: "2026-06-07T12:00:00Z",
        gatewayResponse: {
          id: "pay_OG9823HF98S",
          entity: "payment",
          amount: 2499900,
          currency: "INR",
          status: "captured",
          order_id: "order_OG8927F389A",
          method: "upi",
          email: "ananya@example.com",
          contact: "+919999999999",
          created_at: 1780838400
        }
      },
      {
        id: "2",
        booking: {
          bookingNumber: "TT-MUM-4837",
          customer: { name: "Karan Johar" }
        },
        razorpayOrderId: "order_OG4839G283Y",
        razorpayPaymentId: null,
        status: "PENDING",
        amount: 2500,
        currency: "INR",
        createdAt: "2026-06-07T14:30:00Z"
      }
    ];
    setPayments(mockPayments);
    setLoading(false);
  }, []);

  return (
    <div className="bg-slate-950 min-h-screen text-slate-100 p-8 space-y-8">
      {/* Title Header */}
      <div className="flex justify-between items-center border-b border-white/5 pb-6">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-50 tracking-tight flex items-center gap-2.5">
            <CreditCard className="w-8 h-8 text-accent" />
            <span>Payments Ledger Auditing</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">Audit customer booking transactions, track Razorpay payment IDs, and inspect response payloads.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Payments Table */}
        <div className="lg:col-span-8 glassmorphism rounded-xl border border-white/5 overflow-hidden">
          {loading ? (
            <div className="text-center py-12 text-slate-400">Loading ledger logs...</div>
          ) : (
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="bg-slate-900 border-b border-white/5 text-slate-400 text-xs font-semibold uppercase tracking-wider">
                  <th className="p-4">Booking</th>
                  <th className="p-4">Gateway IDs</th>
                  <th className="p-4 text-right">Amount</th>
                  <th className="p-4 text-center">Status</th>
                  <th className="p-4 text-right">Inspect</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {payments.map((p) => (
                  <tr 
                    key={p.id} 
                    onClick={() => p.gatewayResponse && setActivePayment(p)}
                    className={`hover:bg-white/5 transition-colors ${p.gatewayResponse ? "cursor-pointer" : ""}`}
                  >
                    <td className="p-4">
                      <div className="font-bold text-slate-200">{p.booking.bookingNumber}</div>
                      <div className="text-xs text-slate-500 mt-0.5">{p.booking.customer.name}</div>
                    </td>
                    <td className="p-4 font-mono text-xs text-slate-300">
                      <div>O: {p.razorpayOrderId}</div>
                      {p.razorpayPaymentId && <div className="text-slate-500 mt-0.5">P: {p.razorpayPaymentId}</div>}
                    </td>
                    <td className="p-4 font-bold text-slate-200 text-right">
                      ₹{p.amount.toLocaleString("en-IN")}
                    </td>
                    <td className="p-4 text-center">
                      <span className={`text-[9px] font-bold py-0.5 px-2 rounded-full border ${
                        p.status === "SUCCESS"
                          ? "bg-green-500/10 text-green-400 border-green-500/20"
                          : p.status === "PENDING"
                          ? "bg-yellow-500/10 text-yellow-400 border-yellow-500/20"
                          : "bg-red-500/10 text-red-400 border-red-500/20"
                      }`}>
                        {p.status}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      {p.gatewayResponse ? (
                        <button className="inline-flex p-1.5 bg-slate-900 border border-white/5 rounded-lg text-slate-400 hover:text-accent transition-colors">
                          <ChevronRight className="w-4 h-4" />
                        </button>
                      ) : (
                        <span className="text-slate-500 text-xs italic">No payload</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Payload Inspector Panel */}
        <div className="lg:col-span-4">
          {activePayment ? (
            <div className="bg-slate-900 border border-white/5 p-6 rounded-2xl space-y-6 glassmorphism relative">
              <button
                onClick={() => setActivePayment(null)}
                className="absolute top-6 right-6 p-1 bg-slate-950 border border-white/5 rounded-lg text-slate-400"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="space-y-1">
                <span className="text-[9px] font-bold text-accent uppercase tracking-widest block font-mono">Payload Inspector</span>
                <h3 className="text-md font-bold text-slate-50">{activePayment.booking.bookingNumber}</h3>
                <p className="text-xs text-slate-400">Order: {activePayment.razorpayOrderId}</p>
              </div>

              <div className="bg-slate-950/80 p-4 border border-white/5 rounded-lg overflow-x-auto text-[10px] font-mono text-slate-300 max-h-[350px] scrollbar-thin">
                <pre>{JSON.stringify(activePayment.gatewayResponse, null, 2)}</pre>
              </div>
            </div>
          ) : (
            <div className="bg-slate-900/40 border border-white/5 p-12 rounded-2xl text-center text-slate-500 text-xs italic space-y-2">
              <FileText className="w-8 h-8 mx-auto text-slate-600 animate-pulse" />
              <p>Select a successful payment transaction from the ledger list to inspect its detailed gateway API response.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
