"use client";

import React, { useState, useEffect } from "react";
import { 
  Briefcase, 
  Search, 
  Download, 
  FileText, 
  Building2, 
  Users, 
  PhoneCall, 
  Mail, 
  CheckCircle2, 
  AlertCircle 
} from "lucide-react";

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

      const res = await fetch(`/api/corporate/lead?${queryParams.toString()}`);
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data)) {
          setLeads(data);
          setTotalCount(data.length);
          setTotalPages(1);
        } else if (data.leads) {
          setLeads(data.leads);
          if (data.pagination) {
            setTotalCount(data.pagination.totalCount);
            setTotalPages(data.pagination.totalPages);
          }
          if (data.stats) {
            setStats(data.stats);
          }
        }
      }
    } catch (err) {
      console.error("Failed to load corporate inquiry leads:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLeads();
  }, [search, statusFilter, sortBy, sortOrder, currentPage, pageSize]);

  const handleStatusChange = async (leadId: string, newStatus: LeadStatus) => {
    try {
      const res = await fetch(`/api/corporate/lead/${leadId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        setLeads(prev => prev.map(l => l.id === leadId ? { ...l, status: newStatus } : l));
        if (activeLead && activeLead.id === leadId) {
          setActiveLead({ ...activeLead, status: newStatus });
        }
        loadLeads(false);
      }
    } catch (err) {
      console.error("Failed to update status:", err);
    }
  };

  const handleAddNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeLead || !newNoteInput.trim()) return;

    const updatedNotes = activeLead.notes 
      ? `${activeLead.notes}\n[${new Date().toLocaleDateString("en-IN")}] ${newNoteInput.trim()}`
      : `[${new Date().toLocaleDateString("en-IN")}] ${newNoteInput.trim()}`;

    try {
      const res = await fetch(`/api/corporate/lead/${activeLead.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ notes: updatedNotes }),
      });

      if (res.ok) {
        setActiveLead({ ...activeLead, notes: updatedNotes });
        setLeads(prev => prev.map(l => l.id === activeLead.id ? { ...l, notes: updatedNotes } : l));
        setNewNoteInput("");
      }
    } catch (err) {
      console.error("Failed to add note:", err);
    }
  };

  const handleExportCSV = () => {
    if (leads.length === 0) return;
    const headers = ["ID", "Company Name", "Contact Person", "Email", "Phone", "Employees", "Service Category", "Status"];
    const rows = leads.map(l => [
      l.id,
      `"${l.companyName}"`,
      `"${l.contactName}"`,
      `"${l.email}"`,
      `"${l.phone}"`,
      l.employeeCount || 0,
      `"${l.serviceType}"`,
      l.status
    ]);

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map(e => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `corporate_inquiry_leads_${new Date().toISOString().slice(0,10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const statusBadgeColor = (st: LeadStatus) => {
    switch (st) {
      case "NEW": return "bg-blue-500/10 text-blue-400 border-blue-500/20";
      case "CONTACTED": return "bg-amber-500/10 text-amber-400 border-amber-500/20";
      case "QUALIFIED": return "bg-cyan-500/10 text-cyan-400 border-cyan-500/20";
      case "NEGOTIATION": return "bg-purple-500/10 text-purple-400 border-purple-500/20";
      case "WON": return "bg-emerald-500/10 text-emerald-400 border-emerald-500/20";
      case "LOST": return "bg-rose-500/10 text-rose-400 border-rose-500/20";
      case "ARCHIVED": return "bg-slate-500/10 text-slate-400 border-slate-500/20";
      default: return "bg-slate-800 text-slate-300";
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900/60 p-6 rounded-2xl border border-white/5 backdrop-blur-xl">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Briefcase className="w-6 h-6 text-amber-400" />
            <h1 className="text-2xl font-black text-slate-50 tracking-tight">Corporate Inquiry Leads CRM</h1>
          </div>
          <p className="text-xs text-slate-400">
            Manage B2B enterprise commute, executive car leasing, and corporate fleet partner inquiries.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-slate-200 px-4 py-2 rounded-xl text-xs font-bold transition-all border border-white/10"
          >
            <Download className="w-4 h-4 text-amber-400" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* KPI Stats Bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
        {[
          { label: "Total Leads", count: stats.total, color: "text-slate-200" },
          { label: "New", count: stats.NEW, color: "text-blue-400" },
          { label: "Contacted", count: stats.CONTACTED, color: "text-amber-400" },
          { label: "Qualified", count: stats.QUALIFIED, color: "text-cyan-400" },
          { label: "Negotiation", count: stats.NEGOTIATION, color: "text-purple-400" },
          { label: "Won", count: stats.WON, color: "text-emerald-400" },
          { label: "Lost", count: stats.LOST, color: "text-rose-400" },
        ].map((item, idx) => (
          <div key={idx} className="bg-slate-900/40 border border-white/5 rounded-xl p-3.5 space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">{item.label}</span>
            <span className={`text-xl font-black ${item.color}`}>{item.count}</span>
          </div>
        ))}
      </div>

      {/* Filters & Search */}
      <div className="bg-slate-900/60 p-4 rounded-xl border border-white/5 flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search company, SPOC name, email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-950/50 border border-white/10 rounded-lg pl-9 pr-4 py-2 text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-amber-400"
          />
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-slate-950/50 border border-white/10 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-amber-400"
          >
            <option value="">All Statuses</option>
            <option value="NEW">New</option>
            <option value="CONTACTED">Contacted</option>
            <option value="QUALIFIED">Qualified</option>
            <option value="NEGOTIATION">Negotiation</option>
            <option value="WON">Won</option>
            <option value="LOST">Lost</option>
            <option value="ARCHIVED">Archived</option>
          </select>
        </div>
      </div>

      {/* Roster Table */}
      <div className="bg-slate-900/60 rounded-2xl border border-white/5 overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950/80 text-slate-400 uppercase font-mono border-b border-white/10 text-[10px]">
              <tr>
                <th className="p-4">Company</th>
                <th className="p-4">SPOC / Contact</th>
                <th className="p-4">Service Required</th>
                <th className="p-4">Employees</th>
                <th className="p-4">Date</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {loading ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-slate-500">
                    Loading Corporate Inquiry leads...
                  </td>
                </tr>
              ) : leads.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-slate-500">
                    No Corporate Inquiry leads found.
                  </td>
                </tr>
              ) : (
                leads.map((lead) => (
                  <tr key={lead.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="p-4 font-bold text-slate-100">{lead.companyName}</td>
                    <td className="p-4 space-y-0.5">
                      <div className="font-semibold text-slate-200">{lead.contactName}</div>
                      <div className="font-mono text-slate-400 text-[11px]">{lead.phone} • {lead.email}</div>
                    </td>
                    <td className="p-4 font-medium text-amber-300">{lead.serviceType}</td>
                    <td className="p-4 font-mono text-slate-300">{lead.employeeCount || "N/A"}</td>
                    <td className="p-4 font-mono text-slate-400">{new Date(lead.createdAt).toLocaleDateString("en-IN")}</td>
                    <td className="p-4">
                      <select
                        value={lead.status}
                        onChange={(e) => handleStatusChange(lead.id, e.target.value as LeadStatus)}
                        className={`text-[10px] font-bold uppercase px-2.5 py-1 rounded-full border cursor-pointer ${statusBadgeColor(lead.status)}`}
                      >
                        <option value="NEW" className="bg-slate-900 text-blue-400">NEW</option>
                        <option value="CONTACTED" className="bg-slate-900 text-amber-400">CONTACTED</option>
                        <option value="QUALIFIED" className="bg-slate-900 text-cyan-400">QUALIFIED</option>
                        <option value="NEGOTIATION" className="bg-slate-900 text-purple-400">NEGOTIATION</option>
                        <option value="WON" className="bg-slate-900 text-emerald-400">WON</option>
                        <option value="LOST" className="bg-slate-900 text-rose-400">LOST</option>
                        <option value="ARCHIVED" className="bg-slate-900 text-slate-400">ARCHIVED</option>
                      </select>
                    </td>
                    <td className="p-4 text-right">
                      <button
                        onClick={() => setActiveLead(lead)}
                        className="p-1.5 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-amber-400 transition-colors"
                      >
                        <FileText className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {activeLead && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-white/10 rounded-2xl p-6 max-w-2xl w-full space-y-6 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-start border-b border-white/10 pb-4">
              <div>
                <span className="text-[10px] font-mono font-bold text-amber-400 uppercase tracking-widest block">CORPORATE INQUIRY LEAD DETAILS</span>
                <h2 className="text-xl font-bold text-slate-50 mt-1">{activeLead.companyName}</h2>
              </div>
              <button onClick={() => setActiveLead(null)} className="text-slate-400 hover:text-white text-sm font-bold">✕ Close</button>
            </div>

            <div className="grid grid-cols-2 gap-4 text-xs">
              <div className="bg-slate-950 p-3 rounded-xl border border-white/5">
                <span className="text-slate-500 uppercase tracking-wider block text-[10px]">SPOC Info</span>
                <span className="font-bold text-slate-200 block mt-1">{activeLead.contactName}</span>
                <span className="text-slate-400 block">{activeLead.phone} • {activeLead.email}</span>
              </div>
              <div className="bg-slate-950 p-3 rounded-xl border border-white/5">
                <span className="text-slate-500 uppercase tracking-wider block text-[10px]">Service Scope</span>
                <span className="font-bold text-amber-400 block mt-1">{activeLead.serviceType}</span>
                <span className="text-slate-400 block">Est. Employees: {activeLead.employeeCount || "N/A"}</span>
              </div>
            </div>

            {activeLead.requirements && (
              <div className="bg-slate-950 p-4 rounded-xl border border-white/5 space-y-1 text-xs">
                <span className="text-slate-500 uppercase tracking-wider block text-[10px] font-bold">Requirements</span>
                <div className="text-slate-300 whitespace-pre-wrap">{activeLead.requirements}</div>
              </div>
            )}

            <div className="space-y-2">
              <span className="text-xs font-bold text-slate-300 block">Internal Corporate Account Notes</span>
              <div className="bg-slate-950 p-3 rounded-xl border border-white/5 text-xs text-slate-300 whitespace-pre-wrap max-h-36 overflow-y-auto">
                {activeLead.notes || "No notes logged yet."}
              </div>
              <form onSubmit={handleAddNote} className="flex gap-2">
                <input
                  type="text"
                  placeholder="Add note..."
                  value={newNoteInput}
                  onChange={(e) => setNewNoteInput(e.target.value)}
                  className="flex-1 bg-slate-950 border border-white/10 rounded-lg px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-amber-400"
                />
                <button type="submit" className="bg-amber-400 hover:bg-amber-500 text-slate-950 px-4 py-2 rounded-lg text-xs font-bold">Add</button>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
