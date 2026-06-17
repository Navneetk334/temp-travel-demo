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
  Phone
} from "lucide-react";

interface ContactLead {
  id: string;
  name: string;
  email: string;
  phone?: string | null;
  subject?: string | null;
  message: string;
  status: "NEW" | "CONTACTED" | "QUALIFIED" | "LOST" | "ARCHIVED";
  createdAt: string;
}

export default function AdminContactLeadsPage() {
  const [leads, setLeads] = useState<ContactLead[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [activeLead, setActiveLead] = useState<ContactLead | null>(null);

  const loadLeads = async () => {
    try {
      const url = `/api/contact?search=${encodeURIComponent(search)}${
        statusFilter ? `&status=${statusFilter}` : ""
      }`;
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        setLeads(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLeads();
  }, [search, statusFilter]);

  const handleStatusChange = async (id: string, newStatus: string) => {
    try {
      const res = await fetch(`/api/contact/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus })
      });
      if (res.ok) {
        const updated = await res.json();
        setLeads(leads.map(l => l.id === id ? updated : l));
        if (activeLead && activeLead.id === id) {
          setActiveLead(updated);
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this contact lead?")) return;
    try {
      const res = await fetch(`/api/contact/${id}`, { method: "DELETE" });
      if (res.ok) {
        setLeads(leads.filter(l => l.id !== id));
        if (activeLead && activeLead.id === id) {
          setActiveLead(null);
        }
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Client-side CSV generation
  const handleExport = () => {
    const headers = ["Name,Email,Phone,Subject,Message,Status,Submitted At"];
    const rows = leads.map(l => [
      l.name,
      l.email,
      l.phone || "",
      `"${l.subject || ""}"`,
      `"${l.message.replace(/"/g, '""')}"`,
      l.status,
      new Date(l.createdAt).toLocaleString()
    ].join(","));

    const csvContent = "data:text/csv;charset=utf-8," + [headers, ...rows].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `contact_leads_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="bg-slate-950 min-h-screen text-slate-100 p-8 space-y-8">
      {/* Title Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-white/5 pb-6 gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-50 tracking-tight flex items-center gap-2.5">
            <Mail className="w-8 h-8 text-accent" />
            <span>Contact Leads Panel</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">Monitor web queries, resolve support requests, and export customer feedback logs.</p>
        </div>
        <button
          onClick={handleExport}
          className="flex items-center gap-1.5 bg-slate-900 hover:bg-slate-800 text-slate-300 font-bold py-2.5 px-6 rounded-lg text-sm tracking-wide transition-all border border-white/10 shadow-lg"
        >
          <Download className="w-4 h-4 text-accent" />
          <span>Export CSV</span>
        </button>
      </div>

      {/* Grid: Search controls */}
      <div className="glassmorphism p-6 rounded-xl border border-white/5 flex flex-col md:flex-row gap-6 items-center justify-between">
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search name, email, subject, message..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-950/60 border border-white/10 rounded-lg py-2 pl-10 pr-4 text-sm text-slate-100 focus:outline-none focus:border-primary transition-all"
          />
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="bg-slate-950/60 border border-white/10 rounded-lg py-2 px-4 text-sm text-slate-100 focus:outline-none focus:border-primary transition-all appearance-none"
        >
          <option value="" className="bg-slate-900">All Statuses</option>
          <option value="NEW" className="bg-slate-900 text-yellow-400">NEW</option>
          <option value="CONTACTED" className="bg-slate-900 text-blue-400">CONTACTED</option>
          <option value="QUALIFIED" className="bg-slate-900 text-green-400">QUALIFIED</option>
          <option value="LOST" className="bg-slate-900 text-red-400">LOST</option>
          <option value="ARCHIVED" className="bg-slate-900 text-slate-400">ARCHIVED</option>
        </select>
      </div>

      {/* Main Split: Leads table vs Detail Inspection */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Leads Table */}
        <div className="lg:col-span-8 glassmorphism rounded-xl border border-white/5 overflow-hidden">
          {loading ? (
            <div className="text-center py-12 text-slate-400">Loading contact leads...</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[600px] text-left border-collapse">
                <thead>
                  <tr className="bg-slate-900 border-b border-white/5 text-slate-400 text-xs font-semibold uppercase tracking-wider">
                    <th className="p-4">Customer & Contact</th>
                    <th className="p-4">Subject & Excerpt</th>
                    <th className="p-4">Status</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 text-sm">
                  {leads.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="text-center py-12 text-slate-500">
                        No general inquiries matching criteria found.
                      </td>
                    </tr>
                  ) : (
                    leads.map((lead) => (
                      <tr 
                        key={lead.id} 
                        onClick={() => setActiveLead(lead)}
                        className={`hover:bg-white/5 cursor-pointer transition-colors ${
                          activeLead?.id === lead.id ? "bg-white/5" : ""
                        }`}
                      >
                        <td className="p-4">
                          <div className="font-bold text-slate-200">{lead.name}</div>
                          <div className="text-xs text-slate-500 mt-0.5">{lead.email}</div>
                          {lead.phone && <div className="text-xs text-slate-500 mt-0.5">{lead.phone}</div>}
                        </td>
                        <td className="p-4">
                          <div className="text-slate-300 font-bold text-xs truncate max-w-[180px]">{lead.subject || "No Subject"}</div>
                          <div className="text-slate-500 text-xs truncate max-w-[180px] mt-0.5">{lead.message}</div>
                        </td>
                        <td className="p-4">
                          <span className={`text-[10px] font-bold py-1 px-2.5 rounded-full border ${
                            lead.status === "NEW" 
                              ? "bg-yellow-500/10 text-yellow-400 border-yellow-500/20" 
                              : lead.status === "CONTACTED"
                              ? "bg-blue-500/10 text-blue-400 border-blue-500/20"
                              : lead.status === "QUALIFIED"
                              ? "bg-green-500/10 text-green-400 border-green-500/20"
                              : lead.status === "LOST"
                              ? "bg-red-500/10 text-red-400 border-red-500/20"
                              : "bg-slate-500/10 text-slate-400 border-slate-500/20"
                          }`}>
                            {lead.status}
                          </span>
                        </td>
                        <td className="p-4 text-right" onClick={(e) => e.stopPropagation()}>
                          <button
                            onClick={() => handleDelete(lead.id)}
                            className="inline-flex p-2 bg-slate-900 border border-white/5 rounded-lg text-slate-400 hover:text-destructive transition-colors"
                          >
                            <Trash2 className="w-4.5 h-4.5" />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Lead Inspection Panel */}
        <div className="lg:col-span-4">
          {activeLead ? (
            <div className="bg-slate-900 border border-white/5 p-6 rounded-2xl space-y-6 glassmorphism">
              <div className="space-y-1">
                <span className="text-[9px] font-bold text-accent uppercase tracking-widest block">Inquiry Details</span>
                <h3 className="text-xl font-bold text-slate-50">{activeLead.name}</h3>
                <p className="text-xs text-slate-400">Received: {new Date(activeLead.createdAt).toLocaleString()}</p>
              </div>

              {/* Status controller */}
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Update Query Status</label>
                <select
                  value={activeLead.status}
                  onChange={(e) => handleStatusChange(activeLead.id, e.target.value)}
                  className="w-full bg-slate-950/60 border border-white/10 rounded-lg py-2 px-3 text-xs text-slate-100 focus:outline-none focus:border-primary appearance-none"
                >
                  <option value="NEW" className="bg-slate-900">NEW (UNREAD)</option>
                  <option value="CONTACTED" className="bg-slate-900">READ</option>
                  <option value="QUALIFIED" className="bg-slate-900">REPLIED</option>
                  <option value="LOST" className="bg-slate-900">LOST</option>
                  <option value="ARCHIVED" className="bg-slate-900">ARCHIVED</option>
                </select>
              </div>

              {/* Information detail */}
              <div className="space-y-4 pt-2 border-t border-white/5 text-xs text-slate-300">
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4 text-accent" />
                  <div>Email: <a href={`mailto:${activeLead.email}`} className="font-bold text-slate-100 hover:underline">{activeLead.email}</a></div>
                </div>
                {activeLead.phone && (
                  <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4 text-accent" />
                    <div>Phone: <a href={`tel:${activeLead.phone}`} className="font-bold text-slate-100 hover:underline">{activeLead.phone}</a></div>
                  </div>
                )}
                <div className="flex items-start gap-2">
                  <FileText className="w-4 h-4 text-accent shrink-0 mt-0.5" />
                  <div>Subject: <span className="font-bold text-slate-100">{activeLead.subject || "No Subject"}</span></div>
                </div>
                
                {/* Full Message Box */}
                <div className="bg-slate-950/60 p-4 border border-white/5 rounded-lg space-y-1.5">
                  <div className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Inquiry Message</div>
                  <div className="text-slate-300 whitespace-pre-line leading-relaxed text-xs font-normal">
                    {activeLead.message}
                  </div>
                </div>
              </div>

              {/* Actions helper */}
              <div className="space-y-2 border-t border-white/5 pt-4">
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => handleStatusChange(activeLead.id, "CONTACTED")}
                    disabled={activeLead.status === "CONTACTED"}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:bg-blue-600/30 text-white font-bold py-2 rounded-lg text-[10px] tracking-wider uppercase transition-all shadow-md flex items-center justify-center gap-1.5"
                  >
                    <CheckCircle className="w-3.5 h-3.5" />
                    <span>Mark as Read</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleStatusChange(activeLead.id, "QUALIFIED")}
                    disabled={activeLead.status === "QUALIFIED"}
                    className="flex-1 bg-green-600 hover:bg-green-700 disabled:opacity-50 disabled:bg-green-600/30 text-white font-bold py-2 rounded-lg text-[10px] tracking-wider uppercase transition-all shadow-md flex items-center justify-center gap-1.5"
                  >
                    <CheckCircle className="w-3.5 h-3.5" />
                    <span>Mark as Replied</span>
                  </button>
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => handleStatusChange(activeLead.id, "ARCHIVED")}
                    disabled={activeLead.status === "ARCHIVED"}
                    className="flex-1 bg-slate-700 hover:bg-slate-600 disabled:opacity-50 disabled:bg-slate-700/30 text-white font-bold py-2 rounded-lg text-[10px] tracking-wider uppercase transition-all shadow-md flex items-center justify-center gap-1.5"
                  >
                    <Clock className="w-3.5 h-3.5" />
                    <span>Archive Lead</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(activeLead.id)}
                    className="bg-slate-950 hover:bg-slate-900 text-slate-400 hover:text-destructive p-2.5 rounded-lg border border-white/5 transition-all shadow-md flex items-center justify-center gap-1.5 w-12"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

            </div>
          ) : (
            <div className="bg-slate-900/40 border border-white/5 p-12 rounded-2xl text-center text-slate-500 text-xs italic space-y-2">
              <AlertCircle className="w-8 h-8 mx-auto text-slate-600 animate-pulse" />
              <p>Select a contact inquiry from the table to view the full message, update status, or delete submission records.</p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
