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

  // Normalize incoming lead from any API or local format into consistent structure
  const normalizeLead = (raw: any, defaultType: string = "Rental Inquiry") => {
    return {
      id: raw.id || `lead_${Math.random().toString(36).substring(2, 9)}`,
      bookingRef: raw.bookingRef || raw.bookingNumber || `TT-${(raw.id || Date.now().toString()).slice(-6).toUpperCase()}`,
      customerName: raw.customerName || raw.contactName || raw.name || "Customer Lead",
      companyName: raw.companyName || "",
      phone: raw.phone || "",
      email: raw.email || "",
      tripType: raw.tripType || raw.serviceType || (raw.tourPackageId ? "Tour Package Booking" : (raw.subject ? `Contact Inquiry (${raw.subject})` : defaultType)),
      pickupLocation: raw.pickupLocation || raw.pickupLocations || raw.pickup || "-",
      dropLocation: raw.dropLocation || raw.drop || "-",
      status: (raw.status || "NEW").toUpperCase(),
      createdAt: raw.createdAt || raw.date || new Date().toISOString(),
      notes: raw.notes || raw.requirements || raw.message || raw.details || ""
    };
  };

  const fetchLeads = async () => {
    setLoading(true);
    let combinedLeads: any[] = [];

    // 1. Instant Local Storage Hydration
    try {
      const localLeads = localStorage.getItem("user_uploaded_crm_leads");
      if (localLeads) {
        const parsed = JSON.parse(localLeads);
        if (Array.isArray(parsed)) {
          combinedLeads = parsed.map(l => normalizeLead(l));
        }
      }
    } catch (e) {
      console.error("Error reading local CRM leads:", e);
    }

    // Update state immediately so UI renders with zero lag
    if (combinedLeads.length > 0) {
      setLeads([...combinedLeads]);
    }

    // 2. Concurrently fetch all live CRM sources from backend
    try {
      const [rentalRes, corpRes, toursRes, contactRes] = await Promise.allSettled([
        fetch("/api/rental/lead"),
        fetch("/api/corporate/lead"),
        fetch("/api/bookings"),
        fetch("/api/contact")
      ]);

      const fetchedList: any[] = [];

      if (rentalRes.status === "fulfilled" && rentalRes.value.ok) {
        const data = await rentalRes.value.json();
        const items = Array.isArray(data) ? data : (data.leads || []);
        items.forEach((item: any) => fetchedList.push(normalizeLead(item, "Rental Inquiry")));
      }

      if (corpRes.status === "fulfilled" && corpRes.value.ok) {
        const data = await corpRes.value.json();
        const items = Array.isArray(data) ? data : (data.leads || []);
        items.forEach((item: any) => fetchedList.push(normalizeLead(item, "Corporate Inquiry")));
      }

      if (toursRes.status === "fulfilled" && toursRes.value.ok) {
        const data = await toursRes.value.json();
        const items = Array.isArray(data) ? data : (data.bookings || []);
        items.forEach((item: any) => fetchedList.push(normalizeLead(item, "Tour Package Booking")));
      }

      if (contactRes.status === "fulfilled" && contactRes.value.ok) {
        const data = await contactRes.value.json();
        const items = Array.isArray(data) ? data : (data.leads || []);
        items.forEach((item: any) => fetchedList.push(normalizeLead(item, "Contact Inquiry")));
      }

      // Merge and deduplicate by bookingRef / id / phone+email
      const map = new Map<string, any>();
      // First add remote fetched items
      fetchedList.forEach(item => {
        const key = item.id || item.bookingRef || `${item.phone}_${item.tripType}`;
        map.set(key, item);
      });
      // Then overlay local submissions (ensures latest local status & newest submissions win)
      combinedLeads.forEach(item => {
        const key = item.id || item.bookingRef || `${item.phone}_${item.tripType}`;
        map.set(key, item);
      });

      const merged = Array.from(map.values()).sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );

      setLeads(merged);
    } catch (err) {
      console.error("Error fetching live leads:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeads();
  }, []);

  const updateLeadStatus = async (id: string, newStatus: string) => {
    const updated = leads.map(l => l.id === id ? { ...l, status: newStatus } : l);
    setLeads(updated);

    // Save to local storage
    try {
      localStorage.setItem("user_uploaded_crm_leads", JSON.stringify(updated));
    } catch (e) {
      console.error("Error saving updated lead status:", e);
    }

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
    const headers = ["Booking Ref", "Customer Name", "Phone", "Email", "Trip Type", "Pickup", "Drop", "Status", "Date"];
    const rows = displayLeads.map(l => [
      l.bookingRef,
      l.customerName,
      l.phone,
      l.email,
      l.tripType,
      l.pickupLocation,
      l.dropLocation,
      l.status,
      l.createdAt
    ]);
    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map(e => e.map(x => `"${(x || "").toString().replace(/"/g, '""')}"`).join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Omnichannel_Leads_${activeLeadTab}_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const allLeads = leads;

  // Filter leads dynamically based on active tab
  const displayLeads = allLeads.filter((l) => {
    const type = (l.tripType || "").toLowerCase();
    const notes = (l.notes || "").toLowerCase();

    if (activeLeadTab === "pickup") return type.includes("pickup") || type.includes("airport") || notes.includes("pickup") || notes.includes("airport");
    if (activeLeadTab === "local") return type.includes("local") || notes.includes("local") || type.includes("hourly");
    if (activeLeadTab === "outstation") return type.includes("outstation") || notes.includes("outstation") || type.includes("round trip") || type.includes("one way");
    if (activeLeadTab === "corporate") return type.includes("corporate") || type.includes("working") || notes.includes("corporate") || Boolean(l.companyName && l.companyName !== "Individual");
    if (activeLeadTab === "tour") return type.includes("tour") || notes.includes("tour");
    if (activeLeadTab === "contact") return type.includes("contact") || type.includes("inquiry") || notes.includes("subject");
    return true;
  }).filter((l) => {
    const matchesSearch =
      l.customerName?.toLowerCase().includes(search.toLowerCase()) ||
      l.phone?.includes(search) ||
      l.email?.toLowerCase().includes(search.toLowerCase()) ||
      l.bookingRef?.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === "ALL" || l.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const leadCategories = [
    {
      key: "pickup" as const,
      label: "Pickup & Drop Leads",
      icon: Clock,
      count: allLeads.filter(l => (l.tripType || "").toLowerCase().includes("pickup") || (l.tripType || "").toLowerCase().includes("airport") || (l.notes || "").toLowerCase().includes("pickup")).length
    },
    {
      key: "local" as const,
      label: "Local Rentals Leads",
      icon: Clock,
      count: allLeads.filter(l => (l.tripType || "").toLowerCase().includes("local") || (l.notes || "").toLowerCase().includes("local") || (l.tripType || "").toLowerCase().includes("hourly")).length
    },
    {
      key: "outstation" as const,
      label: "Outstation Leads",
      icon: MapPin,
      count: allLeads.filter(l => (l.tripType || "").toLowerCase().includes("outstation") || (l.notes || "").toLowerCase().includes("outstation") || (l.tripType || "").toLowerCase().includes("round trip") || (l.tripType || "").toLowerCase().includes("one way")).length
    },
    {
      key: "corporate" as const,
      label: "Corporate Inquiry Leads",
      icon: Building2,
      count: allLeads.filter(l => (l.tripType || "").toLowerCase().includes("corporate") || (l.tripType || "").toLowerCase().includes("working") || (l.notes || "").toLowerCase().includes("corporate") || Boolean(l.companyName && l.companyName !== "Individual")).length
    },
    {
      key: "tour" as const,
      label: "Tour Package Leads",
      icon: Compass,
      count: allLeads.filter(l => (l.tripType || "").toLowerCase().includes("tour") || (l.notes || "").toLowerCase().includes("tour")).length
    },
    {
      key: "contact" as const,
      label: "Contact Leads",
      icon: Mail,
      count: allLeads.filter(l => (l.tripType || "").toLowerCase().includes("contact") || (l.tripType || "").toLowerCase().includes("inquiry") || (l.notes || "").toLowerCase().includes("subject")).length
    },
  ];

  const [selectedLeadIds, setSelectedLeadIds] = useState<string[]>([]);

  const handleSelectAll = () => {
    if (selectedLeadIds.length === displayLeads.length && displayLeads.length > 0) {
      setSelectedLeadIds([]);
    } else {
      setSelectedLeadIds(displayLeads.map(l => l.id));
    }
  };

  const handleToggleSelect = (id: string) => {
    setSelectedLeadIds(prev =>
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const handleBulkStatusChange = (newStatus: string) => {
    if (selectedLeadIds.length === 0) return;
    const updated = leads.map(l => selectedLeadIds.includes(l.id) ? { ...l, status: newStatus } : l);
    setLeads(updated);
    try {
      localStorage.setItem("user_uploaded_crm_leads", JSON.stringify(updated));
    } catch (e) {
      console.error(e);
    }
  };

  const handleBulkDelete = () => {
    if (selectedLeadIds.length === 0) return;
    if (confirm(`Are you sure you want to delete ${selectedLeadIds.length} selected lead(s)?`)) {
      const updated = leads.filter(l => !selectedLeadIds.includes(l.id));
      setLeads(updated);
      setSelectedLeadIds([]);
      try {
        localStorage.setItem("user_uploaded_crm_leads", JSON.stringify(updated));
      } catch (e) {
        console.error(e);
      }
    }
  };

  const exportSelectedCSV = () => {
    const targetLeads = selectedLeadIds.length > 0
      ? leads.filter(l => selectedLeadIds.includes(l.id))
      : displayLeads;

    const headers = ["Booking Ref", "Customer Name", "Phone", "Email", "Trip Type", "Pickup", "Drop", "Status", "Date"];
    const rows = targetLeads.map(l => [
      l.bookingRef,
      l.customerName,
      l.phone,
      l.email,
      l.tripType,
      l.pickupLocation,
      l.dropLocation,
      l.status,
      l.createdAt
    ]);
    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map(e => e.map(x => `"${(x || "").toString().replace(/"/g, '""')}"`).join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Omnichannel_Selected_Leads_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

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
            onClick={fetchLeads}
            disabled={loading}
            className="flex items-center gap-2 bg-slate-900 hover:bg-slate-800 border border-white/10 text-slate-300 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer disabled:opacity-50"
            title="Sync live leads across all channels"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-amber-400 ${loading ? "animate-spin" : ""}`} />
            <span>{loading ? "Syncing..." : "Refresh Pipeline"}</span>
          </button>
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
              className={`p-4 rounded-2xl border text-left transition-all cursor-pointer ${
                isActive
                  ? "bg-amber-500 text-slate-950 border-amber-400 shadow-xl shadow-amber-500/20 font-black scale-[1.02]"
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
        {/* Search and Filters */}
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

          <div className="flex items-center gap-2 flex-wrap">
            <Filter className="w-4 h-4 text-slate-400" />
            <span className="text-xs text-slate-400 font-bold uppercase">Status:</span>
            {["ALL", "NEW", "CONTACTED", "QUALIFIED", "CONVERTED", "LOST"].map((st) => (
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

        {/* Multi-Select Bulk Actions Toolbar */}
        {selectedLeadIds.length > 0 && (
          <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl animate-in fade-in slide-in-from-top-2">
            <div className="flex items-center gap-2">
              <span className="bg-amber-500 text-slate-950 text-xs font-black px-2.5 py-0.5 rounded-md font-mono">
                {selectedLeadIds.length} Selected
              </span>
              <span className="text-xs text-slate-300 font-medium">Bulk Lead Operations</span>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <div className="flex items-center gap-1.5">
                <span className="text-[11px] text-slate-400 font-bold">Mark As:</span>
                <select
                  onChange={(e) => {
                    if (e.target.value) {
                      handleBulkStatusChange(e.target.value);
                      e.target.value = "";
                    }
                  }}
                  className="bg-slate-950 border border-amber-500/30 text-amber-400 text-xs font-bold rounded-lg px-2.5 py-1 focus:outline-none cursor-pointer"
                  defaultValue=""
                >
                  <option value="" disabled>Select Status...</option>
                  <option value="NEW">NEW</option>
                  <option value="CONTACTED">CONTACTED</option>
                  <option value="QUALIFIED">QUALIFIED</option>
                  <option value="CONVERTED">CONVERTED</option>
                  <option value="LOST">LOST</option>
                </select>
              </div>

              <button
                onClick={exportSelectedCSV}
                className="flex items-center gap-1 bg-slate-950 hover:bg-slate-800 border border-white/10 text-slate-300 px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer"
              >
                <Download className="w-3 h-3 text-amber-400" />
                <span>Export Selected</span>
              </button>

              <button
                onClick={handleBulkDelete}
                className="flex items-center gap-1 bg-rose-500/10 hover:bg-rose-500 text-rose-400 hover:text-white border border-rose-500/30 px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer"
              >
                <span>Delete Selected</span>
              </button>

              <button
                onClick={() => setSelectedLeadIds([])}
                className="text-xs text-slate-400 hover:text-white font-bold underline px-2 py-1 cursor-pointer"
              >
                Deselect All
              </button>
            </div>
          </div>
        )}

        {/* Lead Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950 text-slate-400 font-extrabold uppercase text-[10px] tracking-wider border-b border-white/10">
              <tr>
                <th className="py-3 px-3 w-10 text-center">
                  <input
                    type="checkbox"
                    checked={displayLeads.length > 0 && selectedLeadIds.length === displayLeads.length}
                    onChange={handleSelectAll}
                    className="w-4 h-4 rounded border-white/20 bg-slate-900 text-amber-500 focus:ring-amber-400 cursor-pointer accent-amber-500"
                    title="Select All Leads"
                  />
                </th>
                <th className="py-3 px-4">Customer Info</th>
                <th className="py-3 px-4">Trip / Requirement</th>
                <th className="py-3 px-4">Locations & Date</th>
                <th className="py-3 px-4">Status Update</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {displayLeads.length > 0 ? (
                displayLeads.map((lead, idx) => {
                  const isSelected = selectedLeadIds.includes(lead.id);
                  return (
                    <tr
                      key={lead.id || idx}
                      className={`transition-colors ${
                        isSelected ? "bg-amber-500/10" : "hover:bg-white/5"
                      }`}
                    >
                      <td className="py-4 px-3 text-center">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => handleToggleSelect(lead.id)}
                          className="w-4 h-4 rounded border-white/20 bg-slate-900 text-amber-500 focus:ring-amber-400 cursor-pointer accent-amber-500"
                        />
                      </td>
                      <td className="py-4 px-4 font-semibold text-slate-100">
                        <div className="flex items-center gap-2">
                          <span>{lead.customerName || "Customer Lead"}</span>
                          {lead.companyName && (
                            <span className="text-[10px] bg-slate-800 text-slate-300 px-2 py-0.5 rounded font-normal">
                              {lead.companyName}
                            </span>
                          )}
                        </div>
                        <div className="text-[11px] text-slate-400 font-mono mt-0.5">{lead.phone}</div>
                        <div className="text-[10px] text-slate-500">{lead.email}</div>
                      </td>
                      <td className="py-4 px-4">
                        <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-amber-500/10 text-amber-400 border border-amber-500/20 whitespace-nowrap">
                          {lead.tripType || "Rental Lead"}
                        </span>
                      </td>
                      <td className="py-4 px-4 max-w-xs">
                        <div className="text-slate-200 truncate" title={lead.pickupLocation}>
                          {lead.pickupLocation || lead.pickup}
                        </div>
                        <div className="text-[11px] text-slate-400 font-mono">{lead.createdAt?.slice(0, 10) || "Recent"}</div>
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
                      <td className="py-4 px-4 text-right">
                        <div className="flex items-center justify-end gap-2 whitespace-nowrap">
                          <button
                            onClick={() => setSelectedLead(lead)}
                            className="inline-flex items-center gap-1 bg-slate-950 hover:bg-slate-800 text-slate-300 hover:text-white border border-white/10 px-3 py-1.5 rounded-lg text-[11px] font-bold transition-all cursor-pointer shadow-sm"
                          >
                            <Eye className="w-3.5 h-3.5 text-amber-400" />
                            <span>Inspect</span>
                          </button>
                          <a
                            href={`tel:${lead.phone}`}
                            className="inline-flex items-center gap-1 bg-amber-500/10 hover:bg-amber-500 text-amber-400 hover:text-slate-950 border border-amber-500/30 px-3 py-1.5 rounded-lg text-[11px] font-bold transition-all shadow-sm"
                          >
                            <PhoneCall className="w-3.5 h-3.5" />
                            <span>Call</span>
                          </a>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-400 text-xs">
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
