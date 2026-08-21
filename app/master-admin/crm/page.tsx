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
  RefreshCw,
  X,
  Send,
  Eye
} from "lucide-react";

export default function MasterOmnichannelCRMPage() {
  const [activeLeadTab, setActiveLeadTab] = useState<"pickup" | "local" | "outstation" | "corporate" | "tour" | "contact">("pickup");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [leads, setLeads] = useState<any[]>([]);
  const [selectedLead, setSelectedLead] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchLeads = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/rental/lead");
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data)) setLeads(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeads();
  }, []);

  const updateLeadStatus = async (id: string, newStatus: string) => {
    setLeads(prev => prev.map(l => l.id === id ? { ...l, status: newStatus } : l));
    try {
      await fetch(`/api/rental/lead`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status: newStatus }),
      });
    } catch (e) {
      console.error(e);
    }
  };

  const exportCSV = () => {
    const headers = ["Customer Name", "Phone", "Email", "Trip Type", "Pickup", "Status"];
    const rows = displayLeads.map(l => [l.customerName, l.phone, l.email, l.tripType, l.pickupLocation, l.status]);
    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map(e => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Omnichannel_Leads_${activeLeadTab}_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const defaultMockLeads = [
    // Pickup & Drop
    {
      id: "LEAD-101",
      customerName: "Vikram Malhotra",
      phone: "9820112233",
      email: "vikram@acme.com",
      tripType: "Pickup & Drop / Airport Transfer",
      pickupLocation: "Bandra West, Mumbai",
      pickupDateTime: "2026-08-22 09:00 AM",
      status: "NEW",
      notes: "Airport Transfer to T2 Terminal."
    },
    {
      id: "LEAD-104",
      customerName: "Priya Sharma",
      phone: "9811223344",
      email: "priya@gmail.com",
      tripType: "Pickup & Drop",
      pickupLocation: "BKC Complex, Mumbai",
      pickupDateTime: "2026-08-23 02:30 PM",
      status: "CONTACTED",
      notes: "Pickup from BKC to Sahar Hub."
    },

    // Local Rentals
    {
      id: "LEAD-102",
      customerName: "Ananya Roy",
      phone: "9833445566",
      email: "ananya@gmail.com",
      tripType: "Local Rental",
      pickupLocation: "Andheri East, Mumbai",
      pickupDateTime: "2026-08-23 10:00 AM",
      status: "CONTACTED",
      notes: "8 Hrs / 80 Kms package for shopping trip."
    },
    {
      id: "LEAD-105",
      customerName: "Sanjay Gupta",
      phone: "9844556677",
      email: "sanjay@retail.com",
      tripType: "Local Rental",
      pickupLocation: "Lower Parel, Mumbai",
      pickupDateTime: "2026-08-24 11:00 AM",
      status: "QUALIFIED",
      notes: "12 Hrs / 120 Kms Innova Crysta local rental."
    },

    // Outstation
    {
      id: "LEAD-103",
      customerName: "Rohan Kapoor",
      phone: "9899112244",
      email: "rohan@techcorp.com",
      tripType: "Outstation Trip",
      pickupLocation: "Powai, Mumbai",
      pickupDateTime: "2026-08-25 06:00 AM",
      status: "QUALIFIED",
      notes: "Round trip to Mahabaleshwar 3 Days SUV."
    },
    {
      id: "LEAD-106",
      customerName: "Amitabh Sen",
      phone: "9855667788",
      email: "amitabh@sen.com",
      tripType: "Outstation Trip",
      pickupLocation: "Thane West, Mumbai",
      pickupDateTime: "2026-08-26 07:00 AM",
      status: "CONVERTED",
      notes: "One way Pune to Mumbai Innova Crysta."
    },

    // Corporate
    {
      id: "LEAD-107",
      customerName: "Accenture HR Desk",
      phone: "9866778899",
      email: "transit@accenture.com",
      tripType: "Corporate Inquiry",
      pickupLocation: "Vikhroli IT Park",
      pickupDateTime: "Monthly Roster",
      status: "QUALIFIED",
      notes: "50 Shift cabs monthly agreement inquiry."
    },

    // Tour Package
    {
      id: "LEAD-108",
      customerName: "Deepak Mehta",
      phone: "9877889900",
      email: "deepak@mehta.com",
      tripType: "Tour Package",
      pickupLocation: "Mumbai Airport T2",
      pickupDateTime: "2026-09-01",
      status: "NEW",
      notes: "Kerala 5 Days Domestic Tour Package."
    },

    // Contact Leads
    {
      id: "LEAD-109",
      customerName: "Sunita Reddy",
      phone: "9888990011",
      email: "sunita@reddy.com",
      tripType: "Contact Inquiry",
      pickupLocation: "General Inquiry",
      pickupDateTime: "N/A",
      status: "NEW",
      notes: "Inquiry regarding luxury VIP fleet rental tariffs."
    }
  ];

  const allLeads = leads.length > 0 ? [...leads, ...defaultMockLeads] : defaultMockLeads;

  // Filter leads dynamically based on active tab
  const displayLeads = allLeads.filter((l) => {
    const type = (l.tripType || "").toLowerCase();
    const notes = (l.notes || "").toLowerCase();

    if (activeLeadTab === "pickup") return type.includes("pickup") || type.includes("airport") || notes.includes("airport");
    if (activeLeadTab === "local") return type.includes("local") || notes.includes("local");
    if (activeLeadTab === "outstation") return type.includes("outstation") || notes.includes("outstation");
    if (activeLeadTab === "corporate") return type.includes("corporate") || notes.includes("corporate");
    if (activeLeadTab === "tour") return type.includes("tour") || notes.includes("tour");
    if (activeLeadTab === "contact") return type.includes("contact") || type.includes("inquiry");
    return true;
  }).filter((l) => {
    const matchesSearch =
      l.customerName?.toLowerCase().includes(search.toLowerCase()) ||
      l.phone?.includes(search) ||
      l.email?.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === "ALL" || l.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const leadCategories = [
    { key: "pickup", label: "Pickup & Drop Leads", icon: Clock, count: allLeads.filter(l => (l.tripType || "").toLowerCase().includes("pickup") || (l.tripType || "").toLowerCase().includes("airport")).length },
    { key: "local", label: "Local Rentals Leads", icon: Clock, count: allLeads.filter(l => (l.tripType || "").toLowerCase().includes("local")).length },
    { key: "outstation", label: "Outstation Leads", icon: MapPin, count: allLeads.filter(l => (l.tripType || "").toLowerCase().includes("outstation")).length },
    { key: "corporate", label: "Corporate Inquiry Leads", icon: Building2, count: allLeads.filter(l => (l.tripType || "").toLowerCase().includes("corporate")).length },
    { key: "tour", label: "Tour Package Leads", icon: Compass, count: allLeads.filter(l => (l.tripType || "").toLowerCase().includes("tour")).length },
    { key: "contact", label: "Contact Leads", icon: Mail, count: allLeads.filter(l => (l.tripType || "").toLowerCase().includes("contact") || (l.tripType || "").toLowerCase().includes("inquiry")).length },
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
          <button
            onClick={exportCSV}
            className="flex items-center gap-2 bg-slate-900 hover:bg-slate-800 border border-white/10 text-slate-300 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer"
          >
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
              className={`p-4 rounded-2xl border text-left transition-all flex flex-col justify-between cursor-pointer ${
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
                className={`px-3 py-1 rounded-lg text-[10px] font-bold uppercase transition-all cursor-pointer ${
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
                <th className="py-3 px-4">Status Update</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {displayLeads.length > 0 ? (
                displayLeads.map((lead, idx) => (
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
                      <select
                        value={lead.status || "NEW"}
                        onChange={(e) => updateLeadStatus(lead.id, e.target.value)}
                        className="bg-slate-950 border border-white/10 rounded-lg px-2.5 py-1 text-[11px] font-bold text-amber-400 focus:outline-none focus:border-amber-400 cursor-pointer"
                      >
                        <option value="NEW">NEW</option>
                        <option value="CONTACTED">CONTACTED</option>
                        <option value="QUALIFIED">QUALIFIED</option>
                        <option value="CONVERTED">CONVERTED</option>
                        <option value="LOST">LOST</option>
                      </select>
                    </td>
                    <td className="py-4 px-4 text-right space-x-2">
                      <button
                        onClick={() => setSelectedLead(lead)}
                        className="inline-flex items-center gap-1 bg-slate-950 text-slate-300 hover:text-white border border-white/10 px-3 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer"
                      >
                        <Eye className="w-3 h-3 text-amber-400" /> Inspect
                      </button>
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
                    No lead records found for this category tab.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Lead Inspection Modal */}
      {selectedLead && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-amber-500/30 rounded-2xl p-6 w-full max-w-lg shadow-2xl space-y-4 relative text-slate-100">
            <button
              onClick={() => setSelectedLead(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="space-y-1">
              <span className="text-[10px] font-bold uppercase text-amber-400 tracking-wider">Lead Record Inspector</span>
              <h3 className="text-xl font-bold text-slate-50">{selectedLead.customerName}</h3>
            </div>

            <div className="space-y-2 bg-slate-950 p-4 rounded-xl border border-white/10 text-xs font-mono">
              <div>Phone: <strong className="text-slate-200">{selectedLead.phone}</strong></div>
              <div>Email: <strong className="text-slate-200">{selectedLead.email}</strong></div>
              <div>Trip Type: <strong className="text-amber-400">{selectedLead.tripType}</strong></div>
              <div>Pickup Address: <strong className="text-slate-200">{selectedLead.pickupLocation}</strong></div>
              <div>Notes: <p className="text-slate-400 font-sans mt-1">{selectedLead.notes || "No special instructions recorded."}</p></div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setSelectedLead(null)}
                className="px-4 py-2 bg-amber-500 text-slate-950 font-bold rounded-xl text-xs cursor-pointer"
              >
                Close Inspector
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
