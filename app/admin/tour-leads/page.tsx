"use client";

import React, { useState, useEffect } from "react";
import { 
  MapPin, 
  Search, 
  Download, 
  Trash2, 
  FileText, 
  AlertCircle, 
  MessageSquare, 
  Archive, 
  ChevronLeft, 
  ChevronRight,
  Truck
} from "lucide-react";
import LeadDispatchModal from "@/components/admin/lead-dispatch-modal";

export type BookingStatus = "PENDING" | "CONFIRMED" | "DRIVER_ASSIGNED" | "VEHICLE_ASSIGNED" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED";

interface BookingLead {
  id: string;
  bookingNumber: string;
  bookingType: string;
  contactName: string;
  email: string;
  phone: string;
  travelDate: string;
  numPassengers: number;
  status: BookingStatus;
  totalAmount?: number | null;
  details?: string | null;
  createdAt: string;
}

export default function AdminTourLeadsPage() {
  const [leads, setLeads] = useState<BookingLead[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [sortBy, setSortBy] = useState("createdAt");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [dispatchLead, setDispatchLead] = useState<any | null>(null);

  const [activeLead, setActiveLead] = useState<BookingLead | null>(null);
  const [newNoteInput, setNewNoteInput] = useState("");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const loadLeads = async (showSpinner = true) => {
    if (showSpinner) setLoading(true);
    try {
      let bookingsList: BookingLead[] = [];
      const res = await fetch(`/api/bookings?bookingType=TOUR_PACKAGE`);
      if (res.ok) {
        const data = await res.json();
        bookingsList = Array.isArray(data) ? data : data.bookings || [];
      }

      // Merge local CRM storage leads for Tour Packages
      try {
        const local = localStorage.getItem("user_uploaded_crm_leads");
        if (local) {
          const parsed = JSON.parse(local);
          if (Array.isArray(parsed)) {
            const matching = parsed.filter((l: any) => 
              (l.tripType || "").toLowerCase().includes("tour") ||
              (l.notes || "").toLowerCase().includes("tour")
            ).map((l: any) => ({
              id: l.id || `book_${Date.now()}`,
              bookingNumber: l.bookingRef || `BKG-${Date.now().toString().slice(-6)}`,
              name: l.customerName || "Tour Passenger",
              contactName: l.customerName || "Tour Passenger",
              bookingType: "TOUR_PACKAGE",
              email: l.email || "",
              phone: l.phone || "",
              travelDate: l.createdAt || new Date().toISOString(),
              numPassengers: 2,
              pickupLocation: l.pickupLocation || "IGI Airport Terminal 3",
              dropLocation: l.dropLocation || "Tour Destination",
              totalAmount: 15000,
              taxAmount: 750,
              netAmount: 15750,
              notes: l.notes || "",
              status: (l.status || "PENDING") as BookingStatus,
              tourPackage: {
                id: "tour-pkg-1",
                title: l.tripType || "Exclusive Tour Package",
                duration: "3 Days / 2 Nights"
              },
              createdAt: l.createdAt || new Date().toISOString()
            }));

            const map = new Map<string, BookingLead>();
            bookingsList.forEach(f => map.set(f.id, f));
            matching.forEach(m => map.set(m.id, m));
            bookingsList = Array.from(map.values());
          }
        }
      } catch (e) {
        console.error(e);
      }

      setLeads(bookingsList);
      setTotalCount(bookingsList.length);
      setTotalPages(Math.ceil(bookingsList.length / pageSize) || 1);
    } catch (err) {
      console.error("Failed to load tour leads:", err);
    } finally {
      if (showSpinner) setLoading(false);
    }
  };

  useEffect(() => {
    loadLeads();
    setSelectedIds([]);
  }, [search, statusFilter, sortBy, sortOrder, currentPage, pageSize]);

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedIds(leads.map((l) => l.id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleSelectOne = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const handleStatusChange = async (id: string, newStatus: BookingStatus) => {
    try {
      const res = await fetch(`/api/bookings/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });

      if (res.ok) {
        setLeads(leads.map((l) => (l.id === id ? { ...l, status: newStatus } : l)));
        if (activeLead && activeLead.id === id) {
          setActiveLead({ ...activeLead, status: newStatus });
        }
        loadLeads(false);
      }
    } catch (err) {
      console.error("Failed to update status:", err);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this tour package booking lead?")) return;

    setLeads((prev) => prev.filter((l) => l.id !== id));
    setSelectedIds((prev) => prev.filter((i) => i !== id));
    setTotalCount((prev) => Math.max(0, prev - 1));
    if (activeLead && activeLead.id === id) {
      setActiveLead(null);
    }

    try {
      await fetch(`/api/bookings/${id}`, { method: "DELETE" });
      loadLeads(false);
    } catch (e) {
      console.error("Failed to delete lead:", e);
      loadLeads(false);
    }
  };

  const handleBulkDelete = async () => {
    if (selectedIds.length === 0) return;
    if (!confirm(`Are you sure you want to delete ${selectedIds.length} selected tour lead(s)?`)) return;

    const idsToDelete = [...selectedIds];
    setLeads((prev) => prev.filter((l) => !idsToDelete.includes(l.id)));
    setSelectedIds([]);
    setTotalCount((prev) => Math.max(0, prev - idsToDelete.length));
    if (activeLead && idsToDelete.includes(activeLead.id)) {
      setActiveLead(null);
    }

    try {
      await Promise.all(idsToDelete.map((id) => fetch(`/api/bookings/${id}`, { method: "DELETE" })));
      loadLeads(false);
    } catch (err) {
      console.error("Bulk delete error:", err);
      loadLeads(false);
    }
  };

  const handleExportCSV = () => {
    if (leads.length === 0) return;
    const headers = ["Booking Ref", "Customer Name", "Email", "Phone", "Travel Date", "Guests", "Tour Package Info", "Status", "Created At"];
    const rows = leads.map((l) => [
      l.bookingNumber,
      `"${l.contactName}"`,
      `"${l.email}"`,
      `"${l.phone}"`,
      `"${new Date(l.travelDate).toLocaleDateString("en-IN")}"`,
      l.numPassengers,
      `"${l.details || "Tour Package"}"`,
      l.status,
      `"${new Date(l.createdAt).toLocaleDateString("en-IN")}"`,
    ]);

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `tour_leads_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getStatusBadge = (status: BookingStatus) => {
    switch (status) {
      case "PENDING":
        return "bg-yellow-500/10 text-yellow-400 border-yellow-500/20";
      case "CONFIRMED":
        return "bg-blue-500/10 text-blue-400 border-blue-500/20";
      case "COMPLETED":
        return "bg-green-500/20 text-green-300 border-green-500/40 shadow-sm font-black";
      case "CANCELLED":
        return "bg-rose-500/10 text-rose-400 border-rose-500/20";
      default:
        return "bg-slate-500/10 text-slate-400 border-slate-500/20";
    }
  };

  const filteredLeads = leads.filter((l) => {
    const matchesStatus = !statusFilter || l.status === statusFilter;
    const matchesSearch = !search || 
      l.contactName.toLowerCase().includes(search.toLowerCase()) ||
      l.phone.includes(search) ||
      l.bookingNumber.toLowerCase().includes(search.toLowerCase()) ||
      (l.details || "").toLowerCase().includes(search.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  return (
    <div className="bg-slate-950 min-h-screen text-slate-100 p-8 space-y-8">
      {/* Title Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-white/5 pb-6 gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-50 tracking-tight flex items-center gap-2.5">
            <MapPin className="w-8 h-8 text-accent" />
            <span>Tour Package Leads CRM</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Manage domestic & international tour package booking inquiries, customer status, and export reports.
          </p>
        </div>
        <button
          onClick={handleExportCSV}
          className="flex items-center gap-1.5 bg-slate-900 hover:bg-slate-800 text-slate-300 font-bold py-2.5 px-6 rounded-lg text-xs tracking-wider uppercase transition-all border border-white/10 shadow-lg"
        >
          <Download className="w-4 h-4 text-accent" />
          <span>Export CSV Report</span>
        </button>
      </div>

      {/* Stats Pipeline Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 gap-3">
        <div 
          onClick={() => { setStatusFilter(""); setCurrentPage(1); }}
          className={`glassmorphism p-3 rounded-xl border cursor-pointer transition-all ${
            statusFilter === "" ? "border-accent bg-accent/10" : "border-white/5 hover:border-white/20"
          }`}
        >
          <div className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Total Bookings</div>
          <div className="text-xl font-black text-slate-50 mt-1">{leads.length}</div>
        </div>

        <div 
          onClick={() => { setStatusFilter("PENDING"); setCurrentPage(1); }}
          className={`glassmorphism p-3 rounded-xl border cursor-pointer transition-all ${
            statusFilter === "PENDING" ? "border-yellow-400 bg-yellow-500/10" : "border-white/5 hover:border-white/20"
          }`}
        >
          <div className="text-[10px] text-yellow-400 uppercase font-bold tracking-wider">PENDING</div>
          <div className="text-xl font-black text-yellow-400 mt-1">{leads.filter(l => l.status === "PENDING").length}</div>
        </div>

        <div 
          onClick={() => { setStatusFilter("CONFIRMED"); setCurrentPage(1); }}
          className={`glassmorphism p-3 rounded-xl border cursor-pointer transition-all ${
            statusFilter === "CONFIRMED" ? "border-blue-400 bg-blue-500/10" : "border-white/5 hover:border-white/20"
          }`}
        >
          <div className="text-[10px] text-blue-400 uppercase font-bold tracking-wider">CONFIRMED</div>
          <div className="text-xl font-black text-blue-400 mt-1">{leads.filter(l => l.status === "CONFIRMED").length}</div>
        </div>

        <div 
          onClick={() => { setStatusFilter("COMPLETED"); setCurrentPage(1); }}
          className={`glassmorphism p-3 rounded-xl border cursor-pointer transition-all ${
            statusFilter === "COMPLETED" ? "border-green-400 bg-green-500/10" : "border-white/5 hover:border-white/20"
          }`}
        >
          <div className="text-[10px] text-green-400 uppercase font-bold tracking-wider">COMPLETED</div>
          <div className="text-xl font-black text-green-400 mt-1">{leads.filter(l => l.status === "COMPLETED").length}</div>
        </div>

        <div 
          onClick={() => { setStatusFilter("CANCELLED"); setCurrentPage(1); }}
          className={`glassmorphism p-3 rounded-xl border cursor-pointer transition-all ${
            statusFilter === "CANCELLED" ? "border-rose-400 bg-rose-500/10" : "border-white/5 hover:border-white/20"
          }`}
        >
          <div className="text-[10px] text-rose-400 uppercase font-bold tracking-wider">CANCELLED</div>
          <div className="text-xl font-black text-rose-400 mt-1">{leads.filter(l => l.status === "CANCELLED").length}</div>
        </div>
      </div>

      {/* Filter & Control Toolbar */}
      <div className="glassmorphism p-6 rounded-xl border border-white/5 flex flex-col md:flex-row gap-4 items-center justify-between">
        
        {/* Search */}
        <div className="relative w-full md:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search ref #, customer, details..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
            className="w-full bg-slate-950/60 border border-white/10 rounded-lg py-2 pl-10 pr-4 text-xs text-slate-100 focus:outline-none focus:border-accent transition-all"
          />
        </div>

        {/* Filter Dropdowns */}
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          <select
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1); }}
            className="bg-slate-950/60 border border-white/10 rounded-lg py-2 px-3 text-xs text-slate-100 focus:outline-none focus:border-accent"
          >
            <option value="" className="bg-slate-900">All Booking Statuses</option>
            <option value="PENDING" className="bg-slate-900 text-yellow-400">PENDING</option>
            <option value="CONFIRMED" className="bg-slate-900 text-blue-400">CONFIRMED</option>
            <option value="COMPLETED" className="bg-slate-900 text-green-400">COMPLETED</option>
            <option value="CANCELLED" className="bg-slate-900 text-rose-400">CANCELLED</option>
          </select>
        </div>

      </div>

      {/* Main Split: Leads table vs Detail Inspection */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Leads Table */}
        <div className="lg:col-span-7 glassmorphism rounded-xl border border-white/5 overflow-hidden flex flex-col space-y-2 p-2 sm:p-0">
          {/* Bulk Action Header Bar */}
          {selectedIds.length > 0 && (
            <div className="bg-amber-500/10 border-b border-amber-500/20 p-3 flex items-center justify-between text-xs">
              <span className="font-bold text-amber-300">
                {selectedIds.length} lead(s) selected
              </span>
              <button
                onClick={handleBulkDelete}
                className="bg-rose-500 hover:bg-rose-600 text-white font-extrabold px-3 py-1.5 rounded-lg text-xs transition-colors flex items-center gap-1"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete Selected ({selectedIds.length})</span>
              </button>
            </div>
          )}

          {loading ? (
            <div className="text-center py-16 text-slate-400 text-xs">Loading tour package leads...</div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-900 border-b border-white/5 text-slate-400 font-semibold uppercase tracking-wider">
                      <th className="p-4 w-10 text-center" onClick={(e) => e.stopPropagation()}>
                        <input
                          type="checkbox"
                          checked={filteredLeads.length > 0 && selectedIds.length === filteredLeads.length}
                          onChange={handleSelectAll}
                          className="w-4 h-4 rounded text-amber-500 bg-slate-950 border-white/20 focus:ring-0 cursor-pointer"
                        />
                      </th>
                      <th className="p-4 w-12 text-center">S. No.</th>
                      <th className="p-4">Ref & Customer</th>
                      <th className="p-4">Package Details</th>
                      <th className="p-4">Status</th>
                      <th className="p-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {filteredLeads.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="text-center py-16 text-slate-500 italic">
                          No tour package leads matching criteria found.
                        </td>
                      </tr>
                    ) : (
                      filteredLeads.map((lead, idx) => (
                        <tr 
                          key={lead.id} 
                          onClick={() => { setActiveLead(lead); setNewNoteInput(""); }}
                          className={`hover:bg-white/5 cursor-pointer transition-colors ${
                            activeLead?.id === lead.id ? "bg-white/5" : ""
                          } ${selectedIds.includes(lead.id) ? "bg-amber-500/5" : ""}`}
                        >
                          <td className="p-4 text-center" onClick={(e) => e.stopPropagation()}>
                            <input
                              type="checkbox"
                              checked={selectedIds.includes(lead.id)}
                              onChange={() => handleSelectOne(lead.id)}
                              className="w-4 h-4 rounded text-amber-500 bg-slate-950 border-white/20 focus:ring-0 cursor-pointer"
                            />
                          </td>
                          <td className="p-4 text-center font-mono font-bold text-slate-400">
                            {idx + 1}
                          </td>
                          <td className="p-4">
                            <div className="font-mono font-bold text-amber-400 text-xs">{lead.bookingNumber}</div>
                            <div className="font-bold text-slate-200 text-sm mt-0.5">{lead.contactName}</div>
                            <div className="text-slate-400 mt-0.5"><span className="font-mono text-slate-500">{lead.phone}</span></div>
                          </td>
                          <td className="p-4 max-w-xs truncate text-slate-300">
                            {lead.details || "Tour Package Booking"}
                          </td>
                          <td className="p-4">
                            <span className={`text-[9px] font-extrabold py-0.5 px-2 rounded-full border tracking-wide uppercase ${getStatusBadge(lead.status)}`}>
                              {lead.status}
                            </span>
                          </td>
                          <td className="p-4 text-right space-x-1" onClick={(e) => e.stopPropagation()}>
                            <button
                              onClick={() => setDispatchLead({ ...lead, customerName: lead.contactName, tripType: "Tour Package Booking" })}
                              title="Dispatch Fleet & Chauffeur"
                              className="inline-flex items-center gap-1 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black px-2.5 py-1.5 rounded-lg text-[10px] uppercase tracking-wider transition-all shadow-sm cursor-pointer"
                            >
                              <Truck className="w-3.5 h-3.5" />
                              <span>Dispatch</span>
                            </button>
                            <button
                              onClick={() => handleDelete(lead.id)}
                              title="Delete Lead"
                              className="inline-flex p-1.5 bg-slate-900 border border-white/5 rounded-lg text-slate-400 hover:text-red-400 transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>

        {/* Lead Inspection Dashboard Panel */}
        <div className="lg:col-span-5">
          {activeLead ? (
            <div className="bg-slate-900 border border-white/5 p-6 rounded-2xl space-y-6 glassmorphism">
              
              {/* Header */}
              <div className="flex justify-between items-start border-b border-white/5 pb-4">
                <div>
                  <span className="text-[9px] font-extrabold text-amber-400 font-mono uppercase tracking-widest block">{activeLead.bookingNumber}</span>
                  <h3 className="text-xl font-extrabold text-slate-50 mt-0.5">{activeLead.contactName}</h3>
                  <p className="text-[11px] text-slate-400 mt-0.5">Created: {new Date(activeLead.createdAt).toLocaleString("en-IN")}</p>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <span className={`text-[10px] font-extrabold py-1 px-3 rounded-full border uppercase ${getStatusBadge(activeLead.status)}`}>
                    {activeLead.status}
                  </span>
                  <button
                    onClick={() => setDispatchLead({ ...activeLead, customerName: activeLead.contactName, tripType: "Tour Package Booking" })}
                    className="flex items-center gap-1 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black px-3 py-1.5 rounded-lg text-xs uppercase tracking-wider shadow-md shadow-amber-500/20 cursor-pointer"
                  >
                    <Truck className="w-3.5 h-3.5" />
                    <span>Dispatch Ride</span>
                  </button>
                </div>
              </div>

              {/* Status Update Pipeline Selector */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Update Booking Status</label>
                <div className="grid grid-cols-2 gap-1.5">
                  {(["PENDING", "CONFIRMED", "COMPLETED", "CANCELLED"] as BookingStatus[]).map((st) => (
                    <button
                      key={st}
                      type="button"
                      onClick={() => handleStatusChange(activeLead.id, st)}
                      className={`py-1.5 px-2 rounded-lg text-[10px] font-extrabold tracking-wider border transition-all ${
                        activeLead.status === st
                          ? "bg-accent text-slate-950 border-accent font-black shadow-md"
                          : "bg-slate-950/60 text-slate-400 border-white/10 hover:border-white/20 hover:text-slate-200"
                      }`}
                    >
                      {st}
                    </button>
                  ))}
                </div>
              </div>

              {/* Details Specs */}
              <div className="space-y-3 border-t border-white/5 pt-4 text-xs text-slate-300">
                <div className="flex justify-between items-center bg-slate-950/40 p-2.5 rounded-lg border border-white/5">
                  <span className="text-slate-400">Customer Name:</span>
                  <span className="font-bold text-slate-100">{activeLead.contactName}</span>
                </div>
                <div className="flex justify-between items-center bg-slate-950/40 p-2.5 rounded-lg border border-white/5">
                  <span className="text-slate-400">Email:</span>
                  <span className="font-mono font-bold text-accent">{activeLead.email}</span>
                </div>
                <div className="flex justify-between items-center bg-slate-950/40 p-2.5 rounded-lg border border-white/5">
                  <span className="text-slate-400">Phone:</span>
                  <span className="font-mono font-bold text-slate-100">{activeLead.phone}</span>
                </div>
                <div className="flex justify-between items-center bg-slate-950/40 p-2.5 rounded-lg border border-white/5">
                  <span className="text-slate-400">Travel Date:</span>
                  <span className="font-mono font-bold text-amber-400">{new Date(activeLead.travelDate).toLocaleDateString("en-IN")}</span>
                </div>
                <div className="flex justify-between items-center bg-slate-950/40 p-2.5 rounded-lg border border-white/5">
                  <span className="text-slate-400">Number of Guests:</span>
                  <span className="font-bold text-slate-100">{activeLead.numPassengers} Pax</span>
                </div>

                <div className="bg-slate-950/40 p-3 rounded-lg border border-white/5 space-y-1">
                  <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Tour Package Requested</div>
                  <div className="text-slate-200 leading-relaxed font-bold">{activeLead.details || "Tour Package Booking"}</div>
                </div>
              </div>

            </div>
          ) : (
            <div className="bg-slate-900/40 border border-white/5 p-12 rounded-2xl text-center text-slate-500 text-xs italic space-y-2">
              <AlertCircle className="w-8 h-8 mx-auto text-slate-600 animate-pulse" />
              <p>Select a tour package booking lead from the table to inspect details and update status.</p>
            </div>
          )}
        </div>

      </div>

      {/* Global Lead Dispatch Modal */}
      {dispatchLead && (
        <LeadDispatchModal
          isOpen={Boolean(dispatchLead)}
          onClose={() => setDispatchLead(null)}
          lead={dispatchLead}
          onSuccess={() => {
            loadLeads(false);
          }}
        />
      )}
    </div>
  );
}
