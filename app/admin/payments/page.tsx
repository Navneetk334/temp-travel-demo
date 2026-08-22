"use client";

import React, { useState, useEffect } from "react";
import { 
  CreditCard, 
  Search, 
  ShieldCheck, 
  XCircle, 
  FileText, 
  ChevronRight, 
  X, 
  Plus, 
  IndianRupee, 
  UserCheck, 
  Printer, 
  CheckCircle2, 
  Clock, 
  AlertCircle,
  Filter,
  Download,
  Building2,
  Calendar
} from "lucide-react";

interface CashRecord {
  id: string;
  receiptNumber: string;
  bookingNumber: string;
  customerName: string;
  driverName: string;
  driverPhone?: string;
  amount: number;
  paymentMode: "CASH" | "RAZORPAY_ONLINE" | "BANK_TRANSFER";
  status: "HANDED_OVER_TO_OFFICE" | "PENDING_HANDOVER" | "PARTIAL_SETTLED";
  collectedAt: string;
  receivedByStaff: string;
  remarks?: string;
}

interface DriverBalance {
  driverName: string;
  completedTrips: number;
  totalCashCollected: number;
  handedOverToOffice: number;
  pendingBalance: number;
}

export default function AdminPaymentsPage() {
  const [records, setRecords] = useState<CashRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterMode, setFilterMode] = useState<string>("ALL");
  const [filterStatus, setFilterStatus] = useState<string>("ALL");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState<"ledger" | "driver_balances">("ledger");

  // Log Cash Modal State
  const [isLogModalOpen, setIsLogModalOpen] = useState(false);
  const [logForm, setLogForm] = useState({
    bookingNumber: "",
    customerName: "",
    driverName: "Ramesh Singh",
    driverPhone: "+91 98765 43210",
    amount: "",
    paymentMode: "CASH" as const,
    status: "HANDED_OVER_TO_OFFICE" as const,
    receivedByStaff: "Admin Desk",
    remarks: "Full cash payment collected after trip completion."
  });

  // Receipt Modal State
  const [receiptRecord, setReceiptRecord] = useState<CashRecord | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem("user_uploaded_payments");
    if (saved) {
      try {
        setRecords(JSON.parse(saved));
      } catch (e) {
        setRecords([]);
      }
    } else {
      setRecords([]);
    }
    setLoading(false);
  }, []);

  // Filtered Records
  const filteredRecords = records.filter((r) => {
    const matchesSearch =
      r.bookingNumber.toLowerCase().includes(search.toLowerCase()) ||
      r.customerName.toLowerCase().includes(search.toLowerCase()) ||
      r.driverName.toLowerCase().includes(search.toLowerCase()) ||
      r.receiptNumber.toLowerCase().includes(search.toLowerCase());

    const matchesMode = filterMode === "ALL" || r.paymentMode === filterMode;
    const matchesStatus = filterStatus === "ALL" || r.status === filterStatus;

    return matchesSearch && matchesMode && matchesStatus;
  });

  // Calculate Daily Summaries
  const todayTotalCash = records
    .filter((r) => r.paymentMode === "CASH")
    .reduce((sum, r) => sum + r.amount, 0);

  const handedOverCash = records
    .filter((r) => r.paymentMode === "CASH" && r.status === "HANDED_OVER_TO_OFFICE")
    .reduce((sum, r) => sum + r.amount, 0);

  const pendingCashWithDrivers = records
    .filter((r) => r.paymentMode === "CASH" && r.status === "PENDING_HANDOVER")
    .reduce((sum, r) => sum + r.amount, 0);

  // Driver Cash Balances Roster (Computed dynamically from payment records)
  const driverBalances: DriverBalance[] = Array.from(
    records.reduce((acc, r) => {
      const name = r.driverName || "Unassigned Chauffeur";
      if (!acc.has(name)) {
        acc.set(name, {
          driverName: name,
          completedTrips: 0,
          totalCashCollected: 0,
          handedOverToOffice: 0,
          pendingBalance: 0,
        });
      }
      const curr = acc.get(name)!;
      curr.completedTrips += 1;
      if (r.paymentMode === "CASH") {
        curr.totalCashCollected += r.amount;
        if (r.status === "HANDED_OVER_TO_OFFICE") {
          curr.handedOverToOffice += r.amount;
        } else {
          curr.pendingBalance += r.amount;
        }
      }
      return acc;
    }, new Map<string, DriverBalance>()).values()
  );

  const handleLogCashSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!logForm.bookingNumber || !logForm.amount) {
      alert("Please fill booking number and cash amount.");
      return;
    }

    const newRec: CashRecord = {
      id: `rec_${Date.now()}`,
      receiptNumber: `TT-REC-2026-${Math.floor(800 + Math.random() * 100)}`,
      bookingNumber: logForm.bookingNumber.toUpperCase(),
      customerName: logForm.customerName || "Walk-In / Direct Guest",
      driverName: logForm.driverName,
      driverPhone: logForm.driverPhone,
      amount: Number(logForm.amount),
      paymentMode: logForm.paymentMode,
      status: logForm.status,
      collectedAt: new Date().toISOString(),
      receivedByStaff: logForm.receivedByStaff,
      remarks: logForm.remarks
    };

    setRecords([newRec, ...records]);
    setIsLogModalOpen(false);
    setLogForm({
      bookingNumber: "",
      customerName: "",
      driverName: "Ramesh Singh",
      driverPhone: "+91 98765 43210",
      amount: "",
      paymentMode: "CASH",
      status: "HANDED_OVER_TO_OFFICE",
      receivedByStaff: "Admin Desk",
      remarks: "Full cash payment collected after trip completion."
    });
  };

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const handleBulkHandover = () => {
    if (selectedIds.length === 0) return;
    setRecords((prev) =>
      prev.map((r) =>
        selectedIds.includes(r.id) ? { ...r, status: "HANDED_OVER_TO_OFFICE" } : r
      )
    );
    setSelectedIds([]);
  };

  return (
    <div className="bg-slate-950 min-h-screen text-slate-100 p-6 sm:p-8 space-y-8">
      
      {/* Title Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-white/5 pb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-50 tracking-tight flex items-center gap-2.5">
            <CreditCard className="w-8 h-8 text-amber-400" />
            <span>Payments & Cash Ledger Suite</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Log driver cash collections, issue official cash receipts, audit daily cash balances, and track driver handovers.
          </p>
        </div>

        <button
          onClick={() => setIsLogModalOpen(true)}
          className="flex items-center gap-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-extrabold py-2.5 px-6 rounded-xl text-xs tracking-wider uppercase transition-all shadow-lg shadow-amber-500/10"
        >
          <Plus className="w-4 h-4 text-slate-950" />
          <span>Log Driver Cash Collection</span>
        </button>
      </div>

      {/* Daily Cash Collection Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-900/80 border border-white/5 p-4 rounded-xl space-y-1">
          <div className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
            <IndianRupee className="w-4 h-4 text-amber-400" />
            <span>Total Cash Collected</span>
          </div>
          <div className="text-2xl font-black text-slate-50">₹{todayTotalCash.toLocaleString()}</div>
          <div className="text-[10px] text-slate-500">Gross trip cash received today</div>
        </div>

        <div className="bg-slate-900/80 border border-emerald-500/20 p-4 rounded-xl space-y-1">
          <div className="text-xs font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4" />
            <span>Handed Over to Office</span>
          </div>
          <div className="text-2xl font-black text-emerald-400">₹{handedOverCash.toLocaleString()}</div>
          <div className="text-[10px] text-emerald-500/70">Verified in office cash drawer</div>
        </div>

        <div className="bg-slate-900/80 border border-amber-500/20 p-4 rounded-xl space-y-1">
          <div className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-2">
            <Clock className="w-4 h-4" />
            <span>Pending Driver Handover</span>
          </div>
          <div className="text-2xl font-black text-amber-400">₹{pendingCashWithDrivers.toLocaleString()}</div>
          <div className="text-[10px] text-amber-500/70">Cash currently held by chauffeurs</div>
        </div>

        <div className="bg-slate-900/80 border border-blue-500/20 p-4 rounded-xl space-y-1">
          <div className="text-xs font-bold text-blue-400 uppercase tracking-wider flex items-center gap-2">
            <UserCheck className="w-4 h-4" />
            <span>Active Cash Chauffeurs</span>
          </div>
          <div className="text-2xl font-black text-blue-400">{driverBalances.length} Drivers</div>
          <div className="text-[10px] text-blue-500/70">Assigned active trip rosters</div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex border-b border-white/5 gap-4">
        <button
          onClick={() => setActiveTab("ledger")}
          className={`pb-3 text-xs font-extrabold uppercase tracking-wider border-b-2 transition-all ${
            activeTab === "ledger" ? "border-amber-400 text-amber-400" : "border-transparent text-slate-400 hover:text-slate-200"
          }`}
        >
          Cash Transactions & Receipts ({records.length})
        </button>
        <button
          onClick={() => setActiveTab("driver_balances")}
          className={`pb-3 text-xs font-extrabold uppercase tracking-wider border-b-2 transition-all ${
            activeTab === "driver_balances" ? "border-amber-400 text-amber-400" : "border-transparent text-slate-400 hover:text-slate-200"
          }`}
        >
          Driver Cash Balances ({driverBalances.length})
        </button>
      </div>

      {activeTab === "ledger" && (
        <div className="space-y-4">
          {/* Toolbar: Search, Filters & Bulk Actions */}
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-slate-900/60 p-4 rounded-xl border border-white/5">
            <div className="relative w-full md:w-80">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search booking #, driver, or receipt..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-slate-950 border border-white/10 rounded-lg pl-9 pr-4 py-2 text-xs text-slate-200 focus:outline-none focus:border-amber-400"
              />
            </div>

            <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
              <select
                value={filterMode}
                onChange={(e) => setFilterMode(e.target.value)}
                className="bg-slate-950 border border-white/10 rounded-lg px-3 py-2 text-xs text-slate-300 focus:outline-none focus:border-amber-400"
              >
                <option value="ALL">All Payment Modes</option>
                <option value="CASH">Cash Only</option>
                <option value="RAZORPAY_ONLINE">Razorpay Online</option>
              </select>

              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="bg-slate-950 border border-white/10 rounded-lg px-3 py-2 text-xs text-slate-300 focus:outline-none focus:border-amber-400"
              >
                <option value="ALL">All Handover Statuses</option>
                <option value="HANDED_OVER_TO_OFFICE">Handed Over to Office</option>
                <option value="PENDING_HANDOVER">Pending Handover</option>
              </select>

              {selectedIds.length > 0 && (
                <button
                  onClick={handleBulkHandover}
                  className="bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-extrabold text-xs px-3 py-2 rounded-lg transition-all"
                >
                  Mark Selected ({selectedIds.length}) as Handed Over
                </button>
              )}
            </div>
          </div>

          {/* Cash Ledger Master Table */}
          <div className="bg-slate-900/40 rounded-xl border border-white/5 overflow-x-auto shadow-xl">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-900 border-b border-white/5 text-slate-400 font-bold uppercase tracking-wider">
                  <th className="p-4 w-10 text-center">
                    <input
                      type="checkbox"
                      onChange={(e) =>
                        setSelectedIds(e.target.checked ? records.map((r) => r.id) : [])
                      }
                      checked={selectedIds.length === records.length && records.length > 0}
                      className="rounded accent-amber-400"
                    />
                  </th>
                  <th className="p-4 w-12 text-center">S.No.</th>
                  <th className="p-4">Receipt & Booking</th>
                  <th className="p-4">Customer</th>
                  <th className="p-4">Chauffeur</th>
                  <th className="p-4 text-right">Amount Collected</th>
                  <th className="p-4 text-center">Handover Status</th>
                  <th className="p-4">Collected Date</th>
                  <th className="p-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filteredRecords.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="text-center py-12 text-slate-500 font-medium">
                      No cash records found matching your filters.
                    </td>
                  </tr>
                ) : (
                  filteredRecords.map((r, idx) => (
                    <tr key={r.id} className="hover:bg-white/[0.02] transition-colors">
                      <td className="p-4 text-center">
                        <input
                          type="checkbox"
                          checked={selectedIds.includes(r.id)}
                          onChange={() => toggleSelect(r.id)}
                          className="rounded accent-amber-400"
                        />
                      </td>
                      <td className="p-4 text-center font-mono text-slate-500">{idx + 1}</td>
                      <td className="p-4">
                        <div className="font-bold text-slate-100">{r.receiptNumber}</div>
                        <div className="text-[10px] text-amber-400 font-mono mt-0.5">{r.bookingNumber}</div>
                      </td>
                      <td className="p-4 font-semibold text-slate-200">{r.customerName}</td>
                      <td className="p-4">
                        <div className="font-bold text-slate-200">{r.driverName}</div>
                        <div className="text-[10px] text-slate-500">{r.driverPhone}</div>
                      </td>
                      <td className="p-4 text-right font-black text-slate-50 text-sm">
                        ₹{r.amount.toLocaleString()}
                        <span className="block text-[9px] font-bold uppercase text-slate-400">{r.paymentMode}</span>
                      </td>
                      <td className="p-4 text-center">
                        {r.status === "HANDED_OVER_TO_OFFICE" ? (
                          <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider inline-flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3" />
                            <span>Handed Over</span>
                          </span>
                        ) : (
                          <span className="bg-amber-500/10 text-amber-400 border border-amber-500/20 px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider inline-flex items-center gap-1">
                            <Clock className="w-3 h-3 animate-pulse" />
                            <span>With Driver</span>
                          </span>
                        )}
                      </td>
                      <td className="p-4 text-slate-400 text-[11px]">
                        {new Date(r.collectedAt).toLocaleDateString("en-IN", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit"
                        })}
                      </td>
                      <td className="p-4 text-center">
                        <button
                          onClick={() => setReceiptRecord(r)}
                          className="inline-flex items-center gap-1 bg-white/5 hover:bg-amber-400 hover:text-slate-950 text-slate-200 font-bold px-3 py-1.5 rounded-lg text-[10px] tracking-wider uppercase transition-all border border-white/10"
                        >
                          <Printer className="w-3.5 h-3.5" />
                          <span>Issue Receipt</span>
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === "driver_balances" && (
        <div className="bg-slate-900/40 rounded-xl border border-white/5 overflow-hidden shadow-xl">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-900 border-b border-white/5 text-slate-400 font-bold uppercase tracking-wider">
                <th className="p-4">Chauffeur Name</th>
                <th className="p-4 text-center">Completed Trips</th>
                <th className="p-4 text-right">Total Cash Collected</th>
                <th className="p-4 text-right">Handed Over to Office</th>
                <th className="p-4 text-right">Pending Balance</th>
                <th className="p-4 text-center">Status Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {driverBalances.map((d, i) => (
                <tr key={i} className="hover:bg-white/[0.02]">
                  <td className="p-4 font-bold text-slate-100 flex items-center gap-2">
                    <UserCheck className="w-4 h-4 text-amber-400" />
                    <span>{d.driverName}</span>
                  </td>
                  <td className="p-4 text-center font-bold text-slate-300">{d.completedTrips} Trips</td>
                  <td className="p-4 text-right font-mono font-bold text-slate-200">₹{d.totalCashCollected.toLocaleString()}</td>
                  <td className="p-4 text-right font-mono font-bold text-emerald-400">₹{d.handedOverToOffice.toLocaleString()}</td>
                  <td className="p-4 text-right font-mono font-extrabold text-amber-400">
                    ₹{d.pendingBalance.toLocaleString()}
                  </td>
                  <td className="p-4 text-center">
                    {d.pendingBalance > 0 ? (
                      <button
                        onClick={() => alert(`Marking ₹${d.pendingBalance} cash handed over from ${d.driverName}`)}
                        className="bg-amber-400 hover:bg-amber-500 text-slate-950 font-extrabold px-3 py-1.5 rounded-lg text-[10px] uppercase tracking-wider transition-all"
                      >
                        Settle Cash
                      </button>
                    ) : (
                      <span className="text-[10px] text-emerald-400 font-bold uppercase tracking-wider">All Settled ✓</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* MODAL 1: LOG DRIVER CASH COLLECTION */}
      {isLogModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-white/10 rounded-2xl p-6 sm:p-8 max-w-lg w-full space-y-6 shadow-2xl relative">
            <button
              onClick={() => setIsLogModalOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white p-1"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="space-y-1">
              <h3 className="text-xl font-bold text-slate-50 flex items-center gap-2">
                <IndianRupee className="w-5 h-5 text-amber-400" />
                <span>Log Cash Collected by Driver</span>
              </h3>
              <p className="text-xs text-slate-400">Record cash received from trip completion for office ledger audits.</p>
            </div>

            <form onSubmit={handleLogCashSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-400 font-bold uppercase mb-1">Booking Number *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. TT-DEL-9842"
                    value={logForm.bookingNumber}
                    onChange={(e) => setLogForm({ ...logForm, bookingNumber: e.target.value })}
                    className="w-full bg-slate-950 border border-white/10 rounded-lg p-2.5 text-slate-100 focus:border-amber-400"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 font-bold uppercase mb-1">Customer Name</label>
                  <input
                    type="text"
                    placeholder="e.g. Amit Sharma"
                    value={logForm.customerName}
                    onChange={(e) => setLogForm({ ...logForm, customerName: e.target.value })}
                    className="w-full bg-slate-950 border border-white/10 rounded-lg p-2.5 text-slate-100 focus:border-amber-400"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-400 font-bold uppercase mb-1">Driver Name *</label>
                  <input
                    type="text"
                    required
                    value={logForm.driverName}
                    onChange={(e) => setLogForm({ ...logForm, driverName: e.target.value })}
                    className="w-full bg-slate-950 border border-white/10 rounded-lg p-2.5 text-slate-100 focus:border-amber-400"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 font-bold uppercase mb-1">Cash Amount (₹) *</label>
                  <input
                    type="number"
                    required
                    placeholder="e.g. 3500"
                    value={logForm.amount}
                    onChange={(e) => setLogForm({ ...logForm, amount: e.target.value })}
                    className="w-full bg-slate-950 border border-white/10 rounded-lg p-2.5 text-slate-100 font-bold text-amber-400 focus:border-amber-400"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-400 font-bold uppercase mb-1">Handover Status</label>
                <select
                  value={logForm.status}
                  onChange={(e) => setLogForm({ ...logForm, status: e.target.value as any })}
                  className="w-full bg-slate-950 border border-white/10 rounded-lg p-2.5 text-slate-100 focus:border-amber-400"
                >
                  <option value="HANDED_OVER_TO_OFFICE">Handed Over to Office Drawer (Received)</option>
                  <option value="PENDING_HANDOVER">Pending Handover (With Chauffeur)</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-400 font-bold uppercase mb-1">Staff Remarks</label>
                <textarea
                  rows={2}
                  value={logForm.remarks}
                  onChange={(e) => setLogForm({ ...logForm, remarks: e.target.value })}
                  className="w-full bg-slate-950 border border-white/10 rounded-lg p-2.5 text-slate-100 focus:border-amber-400"
                />
              </div>

              <div className="pt-4 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsLogModalOpen(false)}
                  className="px-4 py-2 bg-white/5 text-slate-300 rounded-lg font-bold hover:bg-white/10"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-amber-400 text-slate-950 font-extrabold rounded-lg hover:bg-amber-500 uppercase tracking-wider"
                >
                  Save Cash Record
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: PRINTABLE CASH RECEIPT */}
      {receiptRecord && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-white/10 rounded-2xl p-8 max-w-xl w-full space-y-6 shadow-2xl relative">
            <button
              onClick={() => setReceiptRecord(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white p-1"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Printable Receipt Card */}
            <div id="printable-receipt" className="bg-slate-950 p-6 rounded-xl border border-white/10 space-y-6 text-slate-100">
              <div className="flex justify-between items-start border-b border-white/10 pb-4">
                <div>
                  <h2 className="text-lg font-black text-slate-50 uppercase tracking-tight">TEMP TRAVEL CAR RENTALS PVT LTD</h2>
                  <p className="text-[10px] text-slate-400">Plot No. 183, Kh No. 16/2, Qutub Vihar PH-I, New Delhi - 110071</p>
                  <p className="text-[10px] text-amber-400 font-bold mt-0.5">GSTIN: 07AACCT9842M1Z5 • Cash Collection Desk</p>
                </div>
                <div className="text-right">
                  <span className="text-xs font-mono font-bold text-amber-400 block">{receiptRecord.receiptNumber}</span>
                  <span className="text-[10px] text-slate-400 block">{new Date(receiptRecord.collectedAt).toLocaleDateString()}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 text-xs">
                <div>
                  <span className="text-[10px] text-slate-500 uppercase font-bold block">Booking Reference</span>
                  <span className="font-extrabold text-slate-200">{receiptRecord.bookingNumber}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 uppercase font-bold block">Customer Name</span>
                  <span className="font-extrabold text-slate-200">{receiptRecord.customerName}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 uppercase font-bold block">Assigned Chauffeur</span>
                  <span className="font-extrabold text-slate-200">{receiptRecord.driverName}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 uppercase font-bold block">Received By Staff</span>
                  <span className="font-extrabold text-slate-200">{receiptRecord.receivedByStaff}</span>
                </div>
              </div>

              <div className="bg-slate-900 p-4 rounded-lg border border-white/5 flex justify-between items-center">
                <span className="text-xs font-extrabold uppercase text-slate-300">Total Cash Payment Received:</span>
                <span className="text-2xl font-black text-amber-400">₹{receiptRecord.amount.toLocaleString()}</span>
              </div>

              <div className="text-[10px] text-slate-400 italic">
                Note: {receiptRecord.remarks}
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                onClick={() => window.print()}
                className="flex items-center gap-2 bg-amber-400 hover:bg-amber-500 text-slate-950 font-extrabold px-6 py-2.5 rounded-xl text-xs uppercase tracking-wider"
              >
                <Printer className="w-4 h-4" />
                <span>Print Official Cash Receipt</span>
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
