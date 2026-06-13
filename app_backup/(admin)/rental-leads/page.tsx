"use client";

import React, { useState, useEffect } from "react";
import { 
  Car, 
  Search, 
  Download, 
  Trash2, 
  FileText, 
  MessageSquare,
  Users,
  MapPin,
  Calendar,
  AlertCircle,
  Clock
} from "lucide-react";

interface RentalLead {
  id: string;
  customerName: string;
  email: string;
  phone: string;
  pickupLocation: string;
  dropLocation?: string | null;
  pickupDateTime: string;
  returnDateTime?: string | null;
  vehicleCategoryId: string;
  vehicleCategory: {
    name: string;
  };
  tripType: string;
  notes?: string | null;
  status: "NEW" | "CONTACTED" | "QUALIFIED" | "LOST" | "ARCHIVED";
  createdAt: string;
}

export default function AdminRentalLeadsPage() {
  const [leads, setLeads] = useState<RentalLead[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [activeLead, setActiveLead] = useState<RentalLead | null>(null);
  
  // Note edit state
  const [noteText, setNoteText] = useState("");

  const loadLeads = async () => {
    try {
      const url = `/api/rental/lead?search=${encodeURIComponent(search)}${
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

  const handleStatusChange = async (id: string, newStatus: "NEW" | "CONTACTED" | "QUALIFIED" | "LOST" | "ARCHIVED") => {
    try {
      const target = leads.find(l => l.id === id);
      const res = await fetch(`/api/rental/lead/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: newStatus,
          notes: target?.notes || "",
        })
      });
      if (res.ok) {
        const updated = await res.json();
        // Reload list to keep joined vehicle category objects intact
        loadLeads();
        if (activeLead && activeLead.id === id) {
          setActiveLead({ ...activeLead, status: newStatus });
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleSaveNotes = async (id: string) => {
    try {
      const target = leads.find(l => l.id === id);
      const res = await fetch(`/api/rental/lead/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: target?.status || "NEW",
          notes: noteText,
        })
      });
      if (res.ok) {
        const updated = await res.json();
        loadLeads();
        if (activeLead && activeLead.id === id) {
          setActiveLead({ ...activeLead, notes: noteText });
        }
        alert("Dispatcher notes updated successfully!");
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this inquiry?")) return;
    try {
      const res = await fetch(`/api/rental/lead/${id}`, { method: "DELETE" });
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

  const handleExport = () => {
    window.open("/api/rental/lead/export", "_blank");
  };

  const openLeadDetails = (lead: RentalLead) => {
    setActiveLead(lead);
    setNoteText(lead.notes || "");
  };

  return (
    <div className="bg-slate-950 min-h-screen text-slate-100 p-8 space-y-8">
      {/* Title Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-white/5 pb-6 gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-50 tracking-tight flex items-center gap-2.5">
            <Car className="w-8 h-8 text-accent" />
            <span>Cab Rental Inquiry Panel</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">Audit customer rental leads, log dispatcher remarks, and download inquiries sheets.</p>
        </div>
        <button
          onClick={handleExport}
          className="flex items-center gap-1.5 bg-slate-900 hover:bg-slate-800 text-slate-300 font-bold py-2.5 px-6 rounded-lg text-sm tracking-wide transition-all border border-white/10 shadow-lg"
        >
          <Download className="w-4 h-4 text-accent" />
          <span>Export CSV</span>
        </button>
      </div>

      {/* Search & Filter Controls */}
      <div className="glassmorphism p-6 rounded-xl border border-white/5 flex flex-col md:flex-row gap-6 items-center justify-between">
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search name, phone, email, pickup..."
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

      {/* Main Split: List vs Details Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Inquiry List */}
        <div className="lg:col-span-8 glassmorphism rounded-xl border border-white/5 overflow-hidden">
          {loading ? (
            <div className="text-center py-12 text-slate-400">Loading inquiries...</div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-900 border-b border-white/5 text-slate-400 text-xs font-semibold uppercase tracking-wider">
                  <th className="p-4">Customer</th>
                  <th className="p-4">Trip Details</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-sm">
                {leads.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="text-center py-12 text-slate-500">
                      No car rental inquiries matching criteria found.
                    </td>
                  </tr>
                ) : (
                  leads.map((l) => (
                    <tr
                      key={l.id}
                      onClick={() => openLeadDetails(l)}
                      className={`hover:bg-white/5 cursor-pointer transition-colors ${
                        activeLead?.id === l.id ? "bg-white/5" : ""
                      }`}
                    >
                      <td className="p-4">
                        <div className="font-bold text-slate-200">{l.customerName}</div>
                        <div className="text-xs text-slate-500 mt-0.5">{l.phone}</div>
                      </td>
                      <td className="p-4">
                        <div className="text-xs text-slate-300 font-bold">{l.tripType} ({l.vehicleCategory.name})</div>
                        <div className="text-[10px] text-slate-500 mt-0.5">Pickup: {new Date(l.pickupDateTime).toLocaleString()}</div>
                      </td>
                      <td className="p-4">
                        <span className={`text-[10px] font-bold py-1 px-2.5 rounded-full border ${
                          l.status === "NEW" 
                            ? "bg-yellow-500/10 text-yellow-400 border-yellow-500/20" 
                            : l.status === "CONTACTED"
                            ? "bg-blue-500/10 text-blue-400 border-blue-500/20"
                            : l.status === "QUALIFIED"
                            ? "bg-green-500/10 text-green-400 border-green-500/20"
                            : l.status === "LOST"
                            ? "bg-red-500/10 text-red-400 border-red-500/20"
                            : "bg-slate-500/10 text-slate-400 border-slate-500/20"
                        }`}>
                          {l.status}
                        </span>
                      </td>
                      <td className="p-4 text-right" onClick={(e) => e.stopPropagation()}>
                        <button
                          onClick={() => handleDelete(l.id)}
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
          )}
        </div>

        {/* Detailed Inspection */}
        <div className="lg:col-span-4">
          {activeLead ? (
            <div className="bg-slate-900 border border-white/5 p-6 rounded-2xl space-y-6 glassmorphism">
              <div className="space-y-1">
                <span className="text-[9px] font-bold text-accent uppercase tracking-widest block">Inquiry Inspector</span>
                <h3 className="text-xl font-bold text-slate-50">{activeLead.customerName}</h3>
                <p className="text-xs text-slate-400">Created: {new Date(activeLead.createdAt).toLocaleString()}</p>
              </div>

              {/* Status Selector */}
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Update Lead Status</label>
                <select
                  value={activeLead.status}
                  onChange={(e) => handleStatusChange(activeLead.id, e.target.value as any)}
                  className="w-full bg-slate-950/60 border border-white/10 rounded-lg py-2 px-3 text-xs text-slate-100 focus:outline-none focus:border-primary appearance-none"
                >
                  <option value="NEW" className="bg-slate-900">NEW</option>
                  <option value="CONTACTED" className="bg-slate-900">CONTACTED</option>
                  <option value="QUALIFIED" className="bg-slate-900">QUALIFIED</option>
                  <option value="LOST" className="bg-slate-900">LOST</option>
                  <option value="ARCHIVED" className="bg-slate-900">ARCHIVED</option>
                </select>
              </div>

              {/* Route parameters */}
              <div className="space-y-4 pt-2 border-t border-white/5 text-xs text-slate-300">
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-accent" />
                  <div>Contact Email: <span className="font-bold text-slate-100">{activeLead.email}</span></div>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-accent" />
                  <div>Vehicle Type: <span className="font-bold text-slate-100">{activeLead.vehicleCategory.name}</span></div>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-accent" />
                  <div>Pickup: <span className="font-bold text-slate-100">{new Date(activeLead.pickupDateTime).toLocaleString()}</span></div>
                </div>
                {activeLead.returnDateTime && (
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-accent" />
                    <div>Return: <span className="font-bold text-slate-100">{new Date(activeLead.returnDateTime).toLocaleString()}</span></div>
                  </div>
                )}
                <div className="bg-slate-950/60 p-4 border border-white/5 rounded-lg space-y-2">
                  <div className="flex gap-2 items-start">
                    <MapPin className="w-4 h-4 text-accent shrink-0 mt-0.5" />
                    <div>
                      <div className="text-[9px] text-slate-500 uppercase font-bold tracking-wider">Pickup Address</div>
                      <div className="text-slate-200 mt-0.5">{activeLead.pickupLocation}</div>
                    </div>
                  </div>
                  {activeLead.dropLocation && (
                    <div className="flex gap-2 items-start border-t border-white/5 pt-2">
                      <MapPin className="w-4 h-4 text-accent shrink-0 mt-0.5" />
                      <div>
                        <div className="text-[9px] text-slate-500 uppercase font-bold tracking-wider">Drop Address</div>
                        <div className="text-slate-200 mt-0.5">{activeLead.dropLocation}</div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Notes Log */}
              <div className="space-y-2 border-t border-white/5 pt-4">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                  <MessageSquare className="w-3.5 h-3.5 text-accent" />
                  <span>Dispatcher Remarks</span>
                </label>
                <textarea
                  rows={4}
                  value={noteText}
                  onChange={(e) => setNoteText(e.target.value)}
                  placeholder="Log details like pricing quotes sent, availability updates, vehicle allocation references..."
                  className="w-full bg-slate-950/60 border border-white/10 rounded-lg py-2 px-3 text-xs text-slate-100 focus:outline-none focus:border-primary resize-none"
                />
                <button
                  type="button"
                  onClick={() => handleSaveNotes(activeLead.id)}
                  className="w-full bg-primary hover:bg-blue-700 text-white font-bold py-2 rounded-lg text-xs tracking-wider uppercase transition-all shadow-md"
                >
                  Save Dispatch Notes
                </button>
              </div>

            </div>
          ) : (
            <div className="bg-slate-900/40 border border-white/5 p-12 rounded-2xl text-center text-slate-500 text-xs italic space-y-2">
              <AlertCircle className="w-8 h-8 mx-auto text-slate-600 animate-pulse" />
              <p>Select a rental inquiry from the table to view passenger information, log quotes, and change status.</p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
