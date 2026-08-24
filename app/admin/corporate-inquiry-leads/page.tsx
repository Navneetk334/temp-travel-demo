"use client";

import React, { useState, useEffect } from "react";
import { 
  Briefcase, 
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

export type LeadStatus = "NEW" | "CONTACTED" | "QUALIFIED" | "NEGOTIATION" | "WON" | "LOST" | "ARCHIVED";

interface Lead {
  id: string;
  companyName: string;
  contactName: string;
  email: string;
  phone: string;
  employeeCount?: number | null;
  pickupLocations?: string | null;
  serviceType: string;
  requirements?: string | null;
  notes?: string | null;
  status: LeadStatus;
  createdAt: string;
}

interface Stats {
  total: number;
  NEW: number;
  CONTACTED: number;
  QUALIFIED: number;
  NEGOTIATION: number;
  WON: number;
  LOST: number;
  ARCHIVED: number;
}

export default function AdminCorporateInquiryLeadsPage() {
  const [leads, setLeads] = useState<Lead[]>([]);
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
  const [stats, setStats] = useState<Stats>({
    total: 0,
    NEW: 0,
    CONTACTED: 0,
    QUALIFIED: 0,
    NEGOTIATION: 0,
    WON: 0,
    LOST: 0,
    ARCHIVED: 0,
  });

  const [activeLead, setActiveLead] = useState<Lead | null>(null);
  const [newNoteInput, setNewNoteInput] = useState("");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const loadLeads = async (showSpinner = true) => {
    if (showSpinner) setLoading(true);
    try {
      const queryParams = new URLSearchParams({
        search,
        status: statusFilter,
        leadType: "corporate_inquiry",
        sortBy,
        sortOrder,
        page: currentPage.toString(),
        limit: pageSize.toString(),
      });

      let fetchedLeads: Lead[] = [];
      const res = await fetch(`/api/corporate/lead?${queryParams.toString()}`);
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data)) {
          fetchedLeads = data;
        } else if (data.leads) {
          fetchedLeads = data.leads;
          if (data.stats) setStats(data.stats);
        }
      }

      // Merge local CRM storage leads for Corporate Inquiry
      try {
        const local = localStorage.getItem("user_uploaded_crm_leads");
        if (local) {
          const parsed = JSON.parse(local);
          if (Array.isArray(parsed)) {
            const matching = parsed.filter((l: any) => 
              (l.companyName && l.companyName !== "Individual") ||
              (l.tripType || "").toLowerCase().includes("corporate") ||
              (l.tripType || "").toLowerCase().includes("working") ||
              (l.notes || "").toLowerCase().includes("corporate")
            ).map((l: any) => ({
              id: l.id || `lead_${Date.now()}`,
              companyName: l.companyName || "Corporate Client",
              contactName: l.customerName || "Contact Person",
              email: l.email || "",
              phone: l.phone || "",
              employeeCount: 1,
              pickupLocations: l.pickupLocation || "",
              serviceType: l.tripType || "Corporate Inquiry",
              requirements: l.notes || "",
              notes: l.notes || "",
              status: (l.status || "NEW") as LeadStatus,
              createdAt: l.createdAt || new Date().toISOString()
            }));

            const map = new Map<string, Lead>();
            fetchedLeads.forEach(f => map.set(f.id, f));
            matching.forEach(m => map.set(m.id, m));
            fetchedLeads = Array.from(map.values());
          }
        }
      } catch (e) {
        console.error(e);
      }

      setLeads(fetchedLeads);
      setTotalCount(fetchedLeads.length);
      setTotalPages(Math.ceil(fetchedLeads.length / pageSize) || 1);
    } catch (err) {
      console.error("Failed to load corporate inquiry leads:", err);
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

  const handleStatusChange = async (id: string, newStatus: LeadStatus) => {
    try {
      const target = leads.find((l) => l.id === id);
      const res = await fetch(`/api/corporate/lead/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: newStatus,
          notes: target?.notes || "",
        }),
      });

      if (res.ok) {
        const updated = await res.json();
        setLeads(leads.map((l) => (l.id === id ? updated : l)));
        if (activeLead && activeLead.id === id) {
          setActiveLead(updated);
        }
        loadLeads(false);
      }
    } catch (err) {
      console.error("Failed to update status:", err);
    }
  };

  const handleAddNoteLog = async (id: string) => {
    if (!newNoteInput.trim()) return;

    try {
      const target = leads.find((l) => l.id === id);
      const timestamp = new Date().toLocaleString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });

      const entry = `[${timestamp}] ${newNoteInput.trim()}`;
      const existingNotes = target?.notes ? `${target.notes}\n${entry}` : entry;

      const res = await fetch(`/api/corporate/lead/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: target?.status || "NEW",
          notes: existingNotes,
        }),
      });

      if (res.ok) {
        const updated = await res.json();
        setLeads(leads.map((l) => (l.id === id ? updated : l)));
        setActiveLead(updated);
        setNewNoteInput("");
      }
    } catch (err) {
      console.error("Failed to save note:", err);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to permanently delete this corporate inquiry lead?")) return;

    setLeads((prev) => prev.filter((l) => l.id !== id));
    setSelectedIds((prev) => prev.filter((i) => i !== id));
    setTotalCount((prev) => Math.max(0, prev - 1));
    if (activeLead && activeLead.id === id) {
      setActiveLead(null);
    }

    try {
      await fetch(`/api/corporate/lead/${id}`, { method: "DELETE" });
      loadLeads(false);
    } catch (e) {
      console.error("Failed to delete lead:", e);
      loadLeads(false);
    }
  };

  const handleBulkDelete = async () => {
    if (selectedIds.length === 0) return;
    if (!confirm(`Are you sure you want to delete ${selectedIds.length} selected lead(s)?`)) return;

    const idsToDelete = [...selectedIds];
    setLeads((prev) => prev.filter((l) => !idsToDelete.includes(l.id)));
    setSelectedIds([]);
    setTotalCount((prev) => Math.max(0, prev - idsToDelete.length));
    if (activeLead && idsToDelete.includes(activeLead.id)) {
      setActiveLead(null);
    }

    try {
      await Promise.all(idsToDelete.map((id) => fetch(`/api/corporate/lead/${id}`, { method: "DELETE" })));
      loadLeads(false);
    } catch (err) {
      console.error("Bulk delete error:", err);
      loadLeads(false);
    }
  };

  const handleExportCSV = () => {
    const query = new URLSearchParams({
      search,
      status: statusFilter,
      leadType: "corporate_inquiry",
    }).toString();
    window.open(`/api/corporate/lead/export?${query}`, "_blank");
  };

  const getStatusBadge = (status: LeadStatus) => {
    switch (status) {
      case "NEW":
        return "bg-yellow-500/10 text-yellow-400 border-yellow-500/20";
      case "CONTACTED":
        return "bg-blue-500/10 text-blue-400 border-blue-500/20";
      case "QUALIFIED":
        return "bg-emerald-500/10 text-emerald-400 border-emerald-500/20";
      case "NEGOTIATION":
        return "bg-purple-500/10 text-purple-400 border-purple-500/20";
      case "WON":
        return "bg-green-500/20 text-green-300 border-green-500/40 shadow-sm font-black";
      case "LOST":
        return "bg-rose-500/10 text-rose-400 border-rose-500/20";
      case "ARCHIVED":
        return "bg-slate-500/10 text-slate-400 border-slate-500/20";
      default:
        return "bg-slate-500/10 text-slate-400 border-slate-500/20";
    }
  };

  return (
    <div className="bg-slate-950 min-h-screen text-slate-100 p-8 space-y-8">
      {/* Title Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-white/5 pb-6 gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-50 tracking-tight flex items-center gap-2.5">
            <Briefcase className="w-8 h-8 text-accent" />
            <span>Corporate Inquiry Leads CRM</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Manage B2B enterprise commute, executive car leasing, and corporate fleet partner inquiries.
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
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
        <div 
          onClick={() => { setStatusFilter(""); setCurrentPage(1); }}
          className={`glassmorphism p-3 rounded-xl border cursor-pointer transition-all ${
            statusFilter === "" ? "border-accent bg-accent/10" : "border-white/5 hover:border-white/20"
          }`}
        >
          <div className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Total Leads</div>
          <div className="text-xl font-black text-slate-50 mt-1">{stats.total}</div>
        </div>

        <div 
          onClick={() => { setStatusFilter("NEW"); setCurrentPage(1); }}
          className={`glassmorphism p-3 rounded-xl border cursor-pointer transition-all ${
            statusFilter === "NEW" ? "border-yellow-400 bg-yellow-500/10" : "border-white/5 hover:border-white/20"
          }`}
        >
          <div className="text-[10px] text-yellow-400 uppercase font-bold tracking-wider">NEW</div>
          <div className="text-xl font-black text-yellow-400 mt-1">{stats.NEW}</div>
        </div>

        <div 
          onClick={() => { setStatusFilter("CONTACTED"); setCurrentPage(1); }}
          className={`glassmorphism p-3 rounded-xl border cursor-pointer transition-all ${
            statusFilter === "CONTACTED" ? "border-blue-400 bg-blue-500/10" : "border-white/5 hover:border-white/20"
          }`}
        >
          <div className="text-[10px] text-blue-400 uppercase font-bold tracking-wider">CONTACTED</div>
          <div className="text-xl font-black text-blue-400 mt-1">{stats.CONTACTED}</div>
        </div>

        <div 
          onClick={() => { setStatusFilter("QUALIFIED"); setCurrentPage(1); }}
          className={`glassmorphism p-3 rounded-xl border cursor-pointer transition-all ${
            statusFilter === "QUALIFIED" ? "border-emerald-400 bg-emerald-500/10" : "border-white/5 hover:border-white/20"
          }`}
        >
          <div className="text-[10px] text-emerald-400 uppercase font-bold tracking-wider">QUALIFIED</div>
          <div className="text-xl font-black text-emerald-400 mt-1">{stats.QUALIFIED}</div>
        </div>

        <div 
          onClick={() => { setStatusFilter("NEGOTIATION"); setCurrentPage(1); }}
          className={`glassmorphism p-3 rounded-xl border cursor-pointer transition-all ${
            statusFilter === "NEGOTIATION" ? "border-purple-400 bg-purple-500/10" : "border-white/5 hover:border-white/20"
          }`}
        >
          <div className="text-[10px] text-purple-400 uppercase font-bold tracking-wider">NEGOTIATION</div>
          <div className="text-xl font-black text-purple-400 mt-1">{stats.NEGOTIATION}</div>
        </div>

        <div 
          onClick={() => { setStatusFilter("WON"); setCurrentPage(1); }}
          className={`glassmorphism p-3 rounded-xl border cursor-pointer transition-all ${
            statusFilter === "WON" ? "border-green-400 bg-green-500/10" : "border-white/5 hover:border-white/20"
          }`}
        >
          <div className="text-[10px] text-green-400 uppercase font-bold tracking-wider">WON</div>
          <div className="text-xl font-black text-green-400 mt-1">{stats.WON}</div>
        </div>

        <div 
          onClick={() => { setStatusFilter("LOST"); setCurrentPage(1); }}
          className={`glassmorphism p-3 rounded-xl border cursor-pointer transition-all ${
            statusFilter === "LOST" ? "border-rose-400 bg-rose-500/10" : "border-white/5 hover:border-white/20"
          }`}
        >
          <div className="text-[10px] text-rose-400 uppercase font-bold tracking-wider">LOST</div>
          <div className="text-xl font-black text-rose-400 mt-1">{stats.LOST}</div>
        </div>
      </div>

      {/* Filter & Control Toolbar */}
      <div className="glassmorphism p-6 rounded-xl border border-white/5 flex flex-col md:flex-row gap-4 items-center justify-between">
        
        {/* Search */}
        <div className="relative w-full md:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search company, SPOC, phone..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
            className="w-full bg-slate-950/60 border border-white/10 rounded-lg py-2 pl-10 pr-4 text-xs text-slate-100 focus:outline-none focus:border-accent transition-all"
          />
        </div>

        {/* Filter Dropdowns */}
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          {/* Status filter */}
          <select
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1); }}
            className="bg-slate-950/60 border border-white/10 rounded-lg py-2 px-3 text-xs text-slate-100 focus:outline-none focus:border-accent"
          >
            <option value="" className="bg-slate-900">All Pipeline Statuses</option>
            <option value="NEW" className="bg-slate-900 text-yellow-400">NEW</option>
            <option value="CONTACTED" className="bg-slate-900 text-blue-400">CONTACTED</option>
            <option value="QUALIFIED" className="bg-slate-900 text-emerald-400">QUALIFIED</option>
            <option value="NEGOTIATION" className="bg-slate-900 text-purple-400">NEGOTIATION</option>
            <option value="WON" className="bg-slate-900 text-green-400">WON</option>
            <option value="LOST" className="bg-slate-900 text-rose-400">LOST</option>
            <option value="ARCHIVED" className="bg-slate-900 text-slate-400">ARCHIVED</option>
          </select>

          {/* Sort By */}
          <select
            value={sortBy}
            onChange={(e) => { setSortBy(e.target.value); setCurrentPage(1); }}
            className="bg-slate-950/60 border border-white/10 rounded-lg py-2 px-3 text-xs text-slate-100 focus:outline-none focus:border-accent"
          >
            <option value="createdAt" className="bg-slate-900">Sort by Date</option>
            <option value="companyName" className="bg-slate-900">Sort by Company</option>
            <option value="employeeCount" className="bg-slate-900">Sort by Employees</option>
          </select>

          {/* Sort Order */}
          <button
            onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
            className="bg-slate-950/60 border border-white/10 rounded-lg py-2 px-3 text-xs font-semibold text-slate-300 hover:text-slate-100 transition-colors"
          >
            {sortOrder === "desc" ? "↓ Newest / High" : "↑ Oldest / Low"}
          </button>
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
            <div className="text-center py-16 text-slate-400 text-xs">Loading corporate inquiry leads...</div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-900 border-b border-white/5 text-slate-400 font-semibold uppercase tracking-wider">
                      <th className="p-4 w-10 text-center" onClick={(e) => e.stopPropagation()}>
                        <input
                          type="checkbox"
                          checked={leads.length > 0 && selectedIds.length === leads.length}
                          onChange={handleSelectAll}
                          className="w-4 h-4 rounded text-amber-500 bg-slate-950 border-white/20 focus:ring-0 cursor-pointer"
                        />
                      </th>
                      <th className="p-4 w-12 text-center">S. No.</th>
                      <th className="p-4">Company & Contact</th>
                      <th className="p-4">Service Required</th>
                      <th className="p-4">Status</th>
                      <th className="p-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {leads.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="text-center py-16 text-slate-500 italic">
                          No corporate inquiry leads matching criteria found.
                        </td>
                      </tr>
                    ) : (
                      leads.map((lead, idx) => (
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
                            {(currentPage - 1) * pageSize + idx + 1}
                          </td>
                          <td className="p-4">
                            <div className="font-bold text-slate-200 text-sm">{lead.companyName}</div>
                            <div className="text-slate-400 mt-0.5">{lead.contactName} &bull; <span className="font-mono text-slate-500">{lead.phone}</span></div>
                          </td>
                          <td className="p-4 font-medium text-amber-300">
                            {lead.serviceType}
                          </td>
                          <td className="p-4">
                            <span className={`text-[9px] font-extrabold py-0.5 px-2 rounded-full border tracking-wide uppercase ${getStatusBadge(lead.status)}`}>
                              {lead.status}
                            </span>
                          </td>
                          <td className="p-4 text-right space-x-1" onClick={(e) => e.stopPropagation()}>
                            <button
                              onClick={() => setDispatchLead({ ...lead, customerName: lead.contactName || lead.companyName, tripType: lead.serviceType })}
                              title="Dispatch Fleet & Chauffeur"
                              className="inline-flex items-center gap-1 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black px-2.5 py-1.5 rounded-lg text-[10px] uppercase tracking-wider transition-all shadow-sm cursor-pointer"
                            >
                              <Truck className="w-3.5 h-3.5" />
                              <span>Dispatch</span>
                            </button>
                            <button
                              onClick={() => handleStatusChange(lead.id, "ARCHIVED")}
                              title="Archive Lead"
                              className="inline-flex p-1.5 bg-slate-900 border border-white/5 rounded-lg text-slate-400 hover:text-accent transition-colors"
                            >
                              <Archive className="w-4 h-4" />
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

              {/* Pagination Bar */}
              <div className="p-4 bg-slate-900/60 border-t border-white/5 flex items-center justify-between text-xs text-slate-400">
                <div>
                  Showing <span className="font-bold text-slate-200">{totalCount > 0 ? (currentPage - 1) * pageSize + 1 : 0}</span> to <span className="font-bold text-slate-200">{Math.min(currentPage * pageSize, totalCount)}</span> of <span className="font-bold text-slate-200">{totalCount}</span> entries
                </div>

                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-1">
                    <span>Rows per page:</span>
                    <select
                      value={pageSize}
                      onChange={(e) => { setPageSize(Number(e.target.value)); setCurrentPage(1); }}
                      className="bg-slate-950 border border-white/10 rounded px-2 py-1 text-slate-200 focus:outline-none"
                    >
                      <option value="5">5</option>
                      <option value="10">10</option>
                      <option value="25">25</option>
                      <option value="50">50</option>
                    </select>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      disabled={currentPage === 1}
                      onClick={() => setCurrentPage(currentPage - 1)}
                      className="p-1 bg-slate-950 border border-white/10 rounded text-slate-300 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-slate-800"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <span className="px-2 font-mono font-bold text-slate-200">{currentPage} / {totalPages}</span>
                    <button
                      disabled={currentPage >= totalPages}
                      onClick={() => setCurrentPage(currentPage + 1)}
                      className="p-1 bg-slate-950 border border-white/10 rounded text-slate-300 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-slate-800"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
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
                  <span className="text-[9px] font-extrabold text-accent uppercase tracking-widest block font-mono">Corporate Inquiry Lead</span>
                  <h3 className="text-xl font-extrabold text-slate-50 mt-0.5">{activeLead.companyName}</h3>
                  <p className="text-[11px] text-slate-400 mt-0.5">Created: {new Date(activeLead.createdAt).toLocaleString("en-IN")}</p>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <span className={`text-[10px] font-extrabold py-1 px-3 rounded-full border uppercase ${getStatusBadge(activeLead.status)}`}>
                    {activeLead.status}
                  </span>
                  <button
                    onClick={() => setDispatchLead({ ...activeLead, customerName: activeLead.contactName || activeLead.companyName, tripType: activeLead.serviceType })}
                    className="flex items-center gap-1 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black px-3 py-1.5 rounded-lg text-xs uppercase tracking-wider shadow-md shadow-amber-500/20 cursor-pointer"
                  >
                    <Truck className="w-3.5 h-3.5" />
                    <span>Dispatch Ride</span>
                  </button>
                </div>
              </div>

              {/* Status Update Pipeline Selector */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Update Pipeline Status</label>
                <div className="grid grid-cols-3 gap-1.5">
                  {(["NEW", "CONTACTED", "QUALIFIED", "NEGOTIATION", "WON", "LOST", "ARCHIVED"] as LeadStatus[]).map((st) => (
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
                  <span className="text-slate-400">Contact SPOC:</span>
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
                  <span className="text-slate-400">Service Category:</span>
                  <span className="font-bold text-amber-400">{activeLead.serviceType}</span>
                </div>

                {activeLead.requirements && (
                  <div className="bg-slate-950/40 p-3 rounded-lg border border-white/5 space-y-1">
                    <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Custom Requirements</div>
                    <div className="text-slate-200 whitespace-pre-line leading-relaxed">{activeLead.requirements}</div>
                  </div>
                )}
              </div>

              {/* Follow up Call Logs */}
              <div className="space-y-3 border-t border-white/5 pt-4">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                  <MessageSquare className="w-3.5 h-3.5 text-accent" />
                  <span>Sales Follow-up Log History</span>
                </label>

                {activeLead.notes ? (
                  <div className="bg-slate-950/80 p-3 rounded-lg border border-white/10 text-xs font-mono text-slate-300 max-h-36 overflow-y-auto whitespace-pre-wrap leading-relaxed space-y-1 scrollbar-thin">
                    {activeLead.notes}
                  </div>
                ) : (
                  <div className="text-[11px] text-slate-500 italic">No sales follow-up notes logged yet.</div>
                )}

                <div className="space-y-2">
                  <textarea
                    rows={3}
                    value={newNoteInput}
                    onChange={(e) => setNewNoteInput(e.target.value)}
                    placeholder="Type new call log entry or notes..."
                    className="w-full bg-slate-950 border border-white/10 rounded-lg p-2.5 text-xs text-slate-100 focus:outline-none focus:border-accent resize-none"
                  />
                  <button
                    type="button"
                    onClick={() => handleAddNoteLog(activeLead.id)}
                    className="w-full bg-primary hover:bg-blue-600 text-white font-bold py-2 rounded-lg text-xs tracking-wider uppercase transition-all shadow-md"
                  >
                    Log Follow-up Note
                  </button>
                </div>
              </div>

            </div>
          ) : (
            <div className="bg-slate-900/40 border border-white/5 p-12 rounded-2xl text-center text-slate-500 text-xs italic space-y-2">
              <AlertCircle className="w-8 h-8 mx-auto text-slate-600 animate-pulse" />
              <p>Select a corporate inquiry lead from the table to inspect details, log notes, and update pipeline status.</p>
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
