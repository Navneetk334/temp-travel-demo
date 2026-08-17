"use client";

import React, { useState, useEffect } from "react";
import { 
  Mail, 
  Search, 
  Download, 
  Trash2, 
  FileText, 
  CheckCircle, 
  Clock, 
  AlertCircle, 
  User,
  Phone,
  Eye,
  MessageCircle,
  Archive,
  ChevronLeft,
  ChevronRight,
  CheckCheck
} from "lucide-react";

export type ContactStatus = "NEW" | "READ" | "CONTACTED" | "QUALIFIED" | "LOST" | "ARCHIVED";

interface ContactLead {
  id: string;
  name: string;
  email: string;
  phone?: string | null;
  subject?: string | null;
  message: string;
  status: ContactStatus;
  createdAt: string;
}

interface Stats {
  total: number;
  NEW: number;
  READ: number;
  CONTACTED: number;
  QUALIFIED: number;
  LOST: number;
  ARCHIVED: number;
}

export default function AdminContactLeadsPage() {
  const [leads, setLeads] = useState<ContactLead[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [sortBy, setSortBy] = useState("createdAt");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [stats, setStats] = useState<Stats>({
    total: 0,
    NEW: 0,
    READ: 0,
    CONTACTED: 0,
    QUALIFIED: 0,
    LOST: 0,
    ARCHIVED: 0,
  });

  const [activeLead, setActiveLead] = useState<ContactLead | null>(null);

  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const loadLeads = async (showSpinner = true) => {
    if (showSpinner) setLoading(true);
    try {
      const queryParams = new URLSearchParams({
        search,
        status: statusFilter,
        sortBy,
        sortOrder,
        page: currentPage.toString(),
        limit: pageSize.toString(),
      });

      const res = await fetch(`/api/contact?${queryParams.toString()}`);
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data)) {
          setLeads(data);
          setTotalCount(data.length);
          setTotalPages(1);
        } else {
          setLeads(data.leads || []);
          setTotalCount(data.pagination?.totalCount || 0);
          setTotalPages(data.pagination?.totalPages || 1);
          if (data.stats) {
            setStats(data.stats);
          }
        }
      }
    } catch (err) {
      console.error("Failed to load contact messages:", err);
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

  const handleStatusChange = async (id: string, newStatus: ContactStatus) => {
    try {
      const res = await fetch(`/api/contact/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
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

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this contact message?")) return;

    // Optimistic remove
    setLeads((prev) => prev.filter((l) => l.id !== id));
    setSelectedIds((prev) => prev.filter((i) => i !== id));
    setTotalCount((prev) => Math.max(0, prev - 1));
    if (activeLead && activeLead.id === id) {
      setActiveLead(null);
    }

    try {
      const res = await fetch(`/api/contact/${id}`, { method: "DELETE" });
      loadLeads(false);
    } catch (e) {
      console.error("Failed to delete lead:", e);
      loadLeads(false);
    }
  };

  const handleBulkDelete = async () => {
    if (selectedIds.length === 0) return;
    if (!confirm(`Are you sure you want to delete ${selectedIds.length} selected contact lead(s)?`)) return;

    const idsToDelete = [...selectedIds];
    setLeads((prev) => prev.filter((l) => !idsToDelete.includes(l.id)));
    setSelectedIds([]);
    setTotalCount((prev) => Math.max(0, prev - idsToDelete.length));
    if (activeLead && idsToDelete.includes(activeLead.id)) {
      setActiveLead(null);
    }

    try {
      await Promise.all(idsToDelete.map((id) => fetch(`/api/contact/${id}`, { method: "DELETE" })));
      loadLeads(false);
    } catch (err) {
      console.error("Bulk delete error:", err);
      loadLeads(false);
    }
  };

  const handleExport = () => {
    const query = new URLSearchParams({
      search,
      status: statusFilter,
    }).toString();
    window.open(`/api/contact/export?${query}`, "_blank");
  };

  const openLeadDetails = (lead: ContactLead) => {
    setActiveLead(lead);
    // Automatically mark NEW messages as READ when inspected
    if (lead.status === "NEW") {
      handleStatusChange(lead.id, "READ");
    }
  };

  const getStatusBadge = (status: ContactStatus) => {
    switch (status) {
      case "NEW":
        return "bg-yellow-500/10 text-yellow-400 border-yellow-500/20";
      case "READ":
        return "bg-cyan-500/10 text-cyan-400 border-cyan-500/20";
      case "CONTACTED":
        return "bg-blue-500/10 text-blue-400 border-blue-500/20";
      case "QUALIFIED":
        return "bg-emerald-500/10 text-emerald-400 border-emerald-500/20";
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
            <Mail className="w-8 h-8 text-accent" />
            <span>Contact Messages CRM</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Review general website inquiries, mark messages read/replied, and export contact datasets.
          </p>
        </div>
        <button
          onClick={handleExport}
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
          <div className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Total Messages</div>
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
          onClick={() => { setStatusFilter("READ"); setCurrentPage(1); }}
          className={`glassmorphism p-3 rounded-xl border cursor-pointer transition-all ${
            statusFilter === "READ" ? "border-cyan-400 bg-cyan-500/10" : "border-white/5 hover:border-white/20"
          }`}
        >
          <div className="text-[10px] text-cyan-400 uppercase font-bold tracking-wider">READ</div>
          <div className="text-xl font-black text-cyan-400 mt-1">{stats.READ}</div>
        </div>

        <div 
          onClick={() => { setStatusFilter("CONTACTED"); setCurrentPage(1); }}
          className={`glassmorphism p-3 rounded-xl border cursor-pointer transition-all ${
            statusFilter === "CONTACTED" ? "border-blue-400 bg-blue-500/10" : "border-white/5 hover:border-white/20"
          }`}
        >
          <div className="text-[10px] text-blue-400 uppercase font-bold tracking-wider">REPLIED</div>
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
          onClick={() => { setStatusFilter("LOST"); setCurrentPage(1); }}
          className={`glassmorphism p-3 rounded-xl border cursor-pointer transition-all ${
            statusFilter === "LOST" ? "border-rose-400 bg-rose-500/10" : "border-white/5 hover:border-white/20"
          }`}
        >
          <div className="text-[10px] text-rose-400 uppercase font-bold tracking-wider">LOST</div>
          <div className="text-xl font-black text-rose-400 mt-1">{stats.LOST}</div>
        </div>

        <div 
          onClick={() => { setStatusFilter("ARCHIVED"); setCurrentPage(1); }}
          className={`glassmorphism p-3 rounded-xl border cursor-pointer transition-all ${
            statusFilter === "ARCHIVED" ? "border-slate-400 bg-slate-500/10" : "border-white/5 hover:border-white/20"
          }`}
        >
          <div className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">ARCHIVED</div>
          <div className="text-xl font-black text-slate-400 mt-1">{stats.ARCHIVED}</div>
        </div>
      </div>

      {/* Filter & Control Toolbar */}
      <div className="glassmorphism p-6 rounded-xl border border-white/5 flex flex-col md:flex-row gap-4 items-center justify-between">
        
        {/* Search */}
        <div className="relative w-full md:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search sender, email, subject..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
            className="w-full bg-slate-950/60 border border-white/10 rounded-lg py-2 pl-10 pr-4 text-xs text-slate-100 focus:outline-none focus:border-accent transition-all"
          />
        </div>

        {/* Filter Dropdowns */}
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1); }}
            className="bg-slate-950/60 border border-white/10 rounded-lg py-2 px-3 text-xs text-slate-100 focus:outline-none focus:border-accent"
          >
            <option value="" className="bg-slate-900">All Message Statuses</option>
            <option value="NEW" className="bg-slate-900 text-yellow-400">NEW</option>
            <option value="READ" className="bg-slate-900 text-cyan-400">READ</option>
            <option value="CONTACTED" className="bg-slate-900 text-blue-400">CONTACTED (REPLIED)</option>
            <option value="QUALIFIED" className="bg-slate-900 text-emerald-400">QUALIFIED</option>
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
            <option value="name" className="bg-slate-900">Sort by Sender Name</option>
          </select>

          {/* Sort Order */}
          <button
            onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
            className="bg-slate-950/60 border border-white/10 rounded-lg py-2 px-3 text-xs font-semibold text-slate-300 hover:text-slate-100 transition-colors"
          >
            {sortOrder === "desc" ? "↓ Newest" : "↑ Oldest"}
          </button>
        </div>

      </div>

      {/* Main Split: Messages Table vs Inspector */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Messages Table */}
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
            <div className="text-center py-16 text-slate-400 text-xs">Loading contact messages...</div>
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
                      <th className="p-4">Sender & Subject</th>
                      <th className="p-4">Status</th>
                      <th className="p-4 text-right">Quick Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {leads.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="text-center py-16 text-slate-500 italic">
                          No contact messages found matching selected criteria.
                        </td>
                      </tr>
                    ) : (
                      leads.map((lead, idx) => (
                        <tr 
                          key={lead.id} 
                          onClick={() => openLeadDetails(lead)}
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
                            <div className="font-bold text-slate-200 text-sm flex items-center gap-1.5">
                              <span>{lead.name}</span>
                              {lead.status === "NEW" && (
                                <span className="w-2 h-2 rounded-full bg-yellow-400 animate-ping" />
                              )}
                            </div>
                            <div className="text-slate-400 mt-0.5 font-medium">{lead.subject || "General Inquiry"}</div>
                            <div className="text-[10px] text-slate-500 font-mono mt-0.5">{lead.email} &bull; {new Date(lead.createdAt).toLocaleDateString("en-IN")}</div>
                          </td>
                          <td className="p-4">
                            <span className={`text-[9px] font-extrabold py-0.5 px-2 rounded-full border tracking-wide uppercase ${getStatusBadge(lead.status)}`}>
                              {lead.status === "CONTACTED" ? "REPLIED" : lead.status}
                            </span>
                          </td>
                          <td className="p-4 text-right space-x-1" onClick={(e) => e.stopPropagation()}>
                            {lead.status === "NEW" && (
                              <button
                                onClick={() => handleStatusChange(lead.id, "READ")}
                                title="Mark as Read"
                                className="inline-flex p-1.5 bg-slate-900 border border-white/5 rounded-lg text-slate-400 hover:text-cyan-400 transition-colors"
                              >
                                <Eye className="w-4 h-4" />
                              </button>
                            )}
                            <button
                              onClick={() => handleStatusChange(lead.id, "CONTACTED")}
                              title="Mark as Replied"
                              className="inline-flex p-1.5 bg-slate-900 border border-white/5 rounded-lg text-slate-400 hover:text-blue-400 transition-colors"
                            >
                              <MessageCircle className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleStatusChange(lead.id, "ARCHIVED")}
                              title="Archive Message"
                              className="inline-flex p-1.5 bg-slate-900 border border-white/5 rounded-lg text-slate-400 hover:text-accent transition-colors"
                            >
                              <Archive className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDelete(lead.id)}
                              title="Delete Message"
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
                  Showing <span className="font-bold text-slate-200">{totalCount > 0 ? (currentPage - 1) * pageSize + 1 : 0}</span> to <span className="font-bold text-slate-200">{Math.min(currentPage * pageSize, totalCount)}</span> of <span className="font-bold text-slate-200">{totalCount}</span> messages
                </div>

                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-1">
                    <span>Per page:</span>
                    <select
                      value={pageSize}
                      onChange={(e) => { setPageSize(parseInt(e.target.value)); setCurrentPage(1); }}
                      className="bg-slate-950 border border-white/10 rounded px-2 py-1 text-slate-200"
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

        {/* Message Inspection Dashboard Panel */}
        <div className="lg:col-span-5">
          {activeLead ? (
            <div className="bg-slate-900 border border-white/5 p-6 rounded-2xl space-y-6 glassmorphism">
              
              {/* Header */}
              <div className="flex justify-between items-start border-b border-white/5 pb-4">
                <div>
                  <span className="text-[9px] font-extrabold text-accent uppercase tracking-widest block font-mono">Message Inspection</span>
                  <h3 className="text-xl font-extrabold text-slate-50 mt-0.5">{activeLead.name}</h3>
                  <p className="text-[11px] text-slate-400 mt-0.5">Submitted: {new Date(activeLead.createdAt).toLocaleString("en-IN")}</p>
                </div>
                <span className={`text-[10px] font-extrabold py-1 px-3 rounded-full border uppercase ${getStatusBadge(activeLead.status)}`}>
                  {activeLead.status === "CONTACTED" ? "REPLIED" : activeLead.status}
                </span>
              </div>

              {/* Status Update Quick Buttons */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Quick Status Actions</label>
                <div className="grid grid-cols-3 gap-1.5">
                  <button
                    type="button"
                    onClick={() => handleStatusChange(activeLead.id, "READ")}
                    className={`py-2 px-2 rounded-lg text-[10px] font-extrabold tracking-wider border flex items-center justify-center gap-1 transition-all ${
                      activeLead.status === "READ"
                        ? "bg-cyan-500/20 text-cyan-300 border-cyan-500/40 font-black"
                        : "bg-slate-950/60 text-slate-400 border-white/10 hover:border-cyan-500/40 hover:text-cyan-300"
                    }`}
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>MARK READ</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleStatusChange(activeLead.id, "CONTACTED")}
                    className={`py-2 px-2 rounded-lg text-[10px] font-extrabold tracking-wider border flex items-center justify-center gap-1 transition-all ${
                      activeLead.status === "CONTACTED"
                        ? "bg-blue-500/20 text-blue-300 border-blue-500/40 font-black"
                        : "bg-slate-950/60 text-slate-400 border-white/10 hover:border-blue-500/40 hover:text-blue-300"
                    }`}
                  >
                    <MessageCircle className="w-3.5 h-3.5" />
                    <span>REPLIED</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleStatusChange(activeLead.id, "ARCHIVED")}
                    className={`py-2 px-2 rounded-lg text-[10px] font-extrabold tracking-wider border flex items-center justify-center gap-1 transition-all ${
                      activeLead.status === "ARCHIVED"
                        ? "bg-slate-500/20 text-slate-300 border-slate-500/40 font-black"
                        : "bg-slate-950/60 text-slate-400 border-white/10 hover:border-slate-500/40 hover:text-slate-300"
                    }`}
                  >
                    <Archive className="w-3.5 h-3.5" />
                    <span>ARCHIVE</span>
                  </button>
                </div>
              </div>

              {/* Sender Details */}
              <div className="space-y-3 border-t border-white/5 pt-4 text-xs text-slate-300">
                <div className="flex justify-between items-center bg-slate-950/40 p-2.5 rounded-lg border border-white/5">
                  <span className="text-slate-400">Email Address:</span>
                  <a href={`mailto:${activeLead.email}`} className="font-mono font-bold text-accent hover:underline">{activeLead.email}</a>
                </div>
                {activeLead.phone && (
                  <div className="flex justify-between items-center bg-slate-950/40 p-2.5 rounded-lg border border-white/5">
                    <span className="text-slate-400">Phone Number:</span>
                    <a href={`tel:${activeLead.phone}`} className="font-mono font-bold text-slate-100 hover:underline">{activeLead.phone}</a>
                  </div>
                )}
                <div className="bg-slate-950/40 p-3 rounded-lg border border-white/5 space-y-1">
                  <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Subject</div>
                  <div className="text-slate-100 font-bold text-sm">{activeLead.subject || "No Subject Specified"}</div>
                </div>

                {/* Message Body */}
                <div className="bg-slate-950/80 p-4 rounded-xl border border-white/10 space-y-2">
                  <div className="text-[10px] text-accent font-mono font-bold uppercase tracking-wider flex items-center justify-between">
                    <span>Message Body</span>
                    <span>{activeLead.message.length} chars</span>
                  </div>
                  <div className="text-slate-200 whitespace-pre-wrap leading-relaxed font-sans text-xs">
                    {activeLead.message}
                  </div>
                </div>
              </div>

              {/* Quick Reply Actions */}
              <div className="pt-2 flex gap-3">
                <a
                  href={`mailto:${activeLead.email}?subject=Re: ${encodeURIComponent(activeLead.subject || "Inquiry Reply - Temp Travel")}`}
                  onClick={() => handleStatusChange(activeLead.id, "CONTACTED")}
                  className="flex-1 bg-primary hover:bg-blue-600 text-white font-bold py-2.5 px-4 rounded-lg text-xs tracking-wider uppercase transition-all shadow-md text-center flex items-center justify-center gap-2"
                >
                  <Mail className="w-4 h-4" />
                  <span>Reply via Email</span>
                </a>
              </div>

            </div>
          ) : (
            <div className="bg-slate-900/40 border border-white/5 p-12 rounded-2xl text-center text-slate-500 text-xs italic space-y-2">
              <AlertCircle className="w-8 h-8 mx-auto text-slate-600 animate-pulse" />
              <p>Select a contact message from the table to read full content, mark read/replied, and manage status.</p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
