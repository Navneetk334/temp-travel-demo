"use client";

import React, { useState, useEffect } from "react";
import {
  Users,
  Building2,
  Clock,
  MapPin,
  Compass,
  Mail,
  Search,
  Filter,
  Download,
  CheckCircle2,
  PhoneCall,
  Calendar,
  Sparkles,
  RefreshCw
} from "lucide-react";

export default function MasterOmnichannelCRMPage() {
  const [activeLeadTab, setActiveLeadTab] = useState<"pickup" | "local" | "outstation" | "corporate" | "tour" | "contact">("pickup");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [leads, setLeads] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/rental/lead")
      .then((res) => res.ok ? res.json() : [])
      .then((data) => {
        if (Array.isArray(data)) setLeads(data);
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  const leadCategories = [
    { key: "pickup", label: "Pickup & Drop Leads", icon: Clock, count: leads.filter(l => l.tripType === "Pickup & Drop" || l.tripType?.includes("Pickup")).length || 2 },
    { key: "local", label: "Local Rentals Leads", icon: Clock, count: leads.filter(l => l.tripType === "Local Rental" || l.notes?.includes("Local")).length || 1 },
    { key: "outstation", label: "Outstation Leads", icon: MapPin, count: leads.filter(l => l.tripType === "Outstation" || l.notes?.includes("Outstation")).length || 1 },
    { key: "corporate", label: "Corporate Inquiry Leads", icon: Building2, count: 2 },
    { key: "tour", label: "Tour Package Leads", icon: Compass, count: 1 },
    { key: "contact", label: "Contact Leads", icon: Mail, count: 1 },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-amber-500/20 pb-6">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-3xl font-black tracking-tight text-slate-50">
              Omnichannel CRM Pipeline
            </h1>
            <span className="bg-amber-500/10 text-amber-400 border border-amber-500/30 text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-widest">
              Master Lead Control
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Consolidated inquiry pipelines across Web Portal, Mobile App, and Corporate Channels.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 bg-slate-900 hover:bg-slate-800 border border-white/10 text-slate-300 px-4 py-2 rounded-xl text-xs font-bold transition-all">
            <Download className="w-3.5 h-3.5 text-amber-400" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* 6 Category Tabs Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {leadCategories.map((cat) => {
          const Icon = cat.icon;
          const isActive = activeLeadTab === cat.key;
          return (
            <button
              key={cat.key}
              onClick={() => setActiveLeadTab(cat.key as any)}
              className={`p-4 rounded-2xl border text-left transition-all flex flex-col justify-between ${
                isActive
                  ? "bg-amber-500 text-slate-950 border-amber-400 font-black shadow-lg shadow-amber-500/20"
                  : "bg-slate-900/80 text-slate-300 border-white/10 hover:border-amber-500/40"
              }`}
            >
              <div className="flex justify-between items-center mb-2">
                <Icon className={`w-4 h-4 ${isActive ? "text-slate-950" : "text-amber-400"}`} />
                <span className={`text-[11px] font-mono px-2 py-0.5 rounded-full font-bold ${isActive ? "bg-slate-950 text-amber-400" : "bg-white/10 text-slate-200"}`}>
                  {cat.count}
                </span>
              </div>
              <div className="text-xs font-bold leading-tight">{cat.label}</div>
            </button>
          );
        })}
      </div>

      {/* Leads Table & Pipeline List */}
      <div className="bg-slate-900/80 backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-2xl space-y-4">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pb-4 border-b border-white/10">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Filter leads by customer, phone or email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-slate-950 border border-white/10 rounded-xl pl-9 pr-4 py-2 text-xs text-slate-100 focus:outline-none focus:border-amber-400"
            />
          </div>

          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-slate-400" />
            <span className="text-xs text-slate-400 font-bold uppercase">Status:</span>
            {["ALL", "NEW", "CONTACTED", "QUALIFIED", "CONVERTED"].map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-3 py-1 rounded-lg text-[10px] font-bold uppercase transition-all ${
                  statusFilter === st
                    ? "bg-amber-500 text-slate-950 font-black"
                    : "bg-slate-950 text-slate-400 hover:text-white"
                }`}
              >
                {st}
              </button>
            ))}
          </div>
        </div>

        {/* Lead Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950 text-slate-400 font-extrabold uppercase text-[10px] tracking-wider border-b border-white/10">
              <tr>
                <th className="py-3 px-4">Customer Info</th>
                <th className="py-3 px-4">Trip / Requirement</th>
                <th className="py-3 px-4">Locations & Date</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {leads.length > 0 ? (
                leads.map((lead, idx) => (
                  <tr key={lead.id || idx} className="hover:bg-white/5 transition-colors">
                    <td className="py-4 px-4 font-semibold text-slate-100">
                      <div>{lead.customerName || "Customer Lead"}</div>
                      <div className="text-[11px] text-slate-400 font-mono">{lead.phone}</div>
                      <div className="text-[10px] text-slate-500">{lead.email}</div>
                    </td>
                    <td className="py-4 px-4">
                      <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-amber-500/10 text-amber-400 border border-amber-500/20">
                        {lead.tripType || "Rental Lead"}
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      <div className="text-slate-200">{lead.pickupLocation || lead.pickup}</div>
                      <div className="text-[11px] text-slate-400 font-mono">{lead.pickupDateTime || "Flexible Date"}</div>
                    </td>
                    <td className="py-4 px-4">
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                        {lead.status || "NEW"}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-right">
                      <a
                        href={`tel:${lead.phone}`}
                        className="inline-flex items-center gap-1 bg-amber-500/10 text-amber-400 border border-amber-500/30 px-3 py-1 rounded-lg hover:bg-amber-500 hover:text-slate-950 text-[11px] font-bold transition-all"
                      >
                        <PhoneCall className="w-3 h-3" /> Call
                      </a>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-slate-400 text-xs">
                    No lead records matching current filter.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
