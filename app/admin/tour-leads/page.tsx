"use client";

import React, { useState, useEffect } from "react";
import { 
  MapPin, 
  Search, 
  Download, 
  FileText, 
  Users, 
  Phone, 
  Mail, 
  Compass, 
  Calendar 
} from "lucide-react";

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

  const loadLeads = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/bookings?bookingType=TOUR_PACKAGE`);
      if (res.ok) {
        const data = await res.json();
        const bookingsList = Array.isArray(data) ? data : data.bookings || [];
        setLeads(bookingsList);
      }
    } catch (err) {
      console.error("Failed to load tour leads:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLeads();
  }, []);

  const handleStatusChange = async (bookingId: string, newStatus: BookingStatus) => {
    try {
      const res = await fetch(`/api/bookings/${bookingId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        setLeads(prev => prev.map(b => b.id === bookingId ? { ...b, status: newStatus } : b));
      }
    } catch (err) {
      console.error("Failed to update booking status:", err);
    }
  };

  const filteredLeads = leads.filter(l => {
    const matchesStatus = !statusFilter || l.status === statusFilter;
    const matchesSearch = !search || 
      l.contactName.toLowerCase().includes(search.toLowerCase()) ||
      l.phone.includes(search) ||
      l.bookingNumber.toLowerCase().includes(search.toLowerCase()) ||
      (l.details || "").toLowerCase().includes(search.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900/60 p-6 rounded-2xl border border-white/5 backdrop-blur-xl">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <MapPin className="w-6 h-6 text-amber-400" />
            <h1 className="text-2xl font-black text-slate-50 tracking-tight">Tour Package Booking Leads</h1>
          </div>
          <p className="text-xs text-slate-400">
            Manage inquiries & confirmed bookings for domestic and international tour packages.
          </p>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="bg-slate-900/60 p-4 rounded-xl border border-white/5 flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search ref #, customer, details..."
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
            <option value="PENDING">Pending</option>
            <option value="CONFIRMED">Confirmed</option>
            <option value="COMPLETED">Completed</option>
            <option value="CANCELLED">Cancelled</option>
          </select>
        </div>
      </div>

      {/* Roster Table */}
      <div className="bg-slate-900/60 rounded-2xl border border-white/5 overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950/80 text-slate-400 uppercase font-mono border-b border-white/10 text-[10px]">
              <tr>
                <th className="p-4">Ref Number</th>
                <th className="p-4">Customer</th>
                <th className="p-4">Tour Package Info</th>
                <th className="p-4">Travel Date</th>
                <th className="p-4">Guests</th>
                <th className="p-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {loading ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-slate-500">
                    Loading Tour leads...
                  </td>
                </tr>
              ) : filteredLeads.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-slate-500">
                    No Tour leads found.
                  </td>
                </tr>
              ) : (
                filteredLeads.map((lead) => (
                  <tr key={lead.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="p-4 font-mono font-bold text-amber-400">{lead.bookingNumber}</td>
                    <td className="p-4 space-y-0.5">
                      <div className="font-bold text-slate-100">{lead.contactName}</div>
                      <div className="text-[11px] text-slate-400">{lead.phone} • {lead.email}</div>
                    </td>
                    <td className="p-4 max-w-xs truncate text-slate-200">{lead.details || "Tour Package Booking"}</td>
                    <td className="p-4 font-mono text-slate-300">{new Date(lead.travelDate).toLocaleDateString("en-IN")}</td>
                    <td className="p-4 font-mono text-slate-300">{lead.numPassengers} Person(s)</td>
                    <td className="p-4">
                      <select
                        value={lead.status}
                        onChange={(e) => handleStatusChange(lead.id, e.target.value as BookingStatus)}
                        className="text-[10px] font-bold uppercase px-2.5 py-1 rounded-full border bg-slate-950 border-white/10 text-amber-300 cursor-pointer"
                      >
                        <option value="PENDING">PENDING</option>
                        <option value="CONFIRMED">CONFIRMED</option>
                        <option value="COMPLETED">COMPLETED</option>
                        <option value="CANCELLED">CANCELLED</option>
                      </select>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
