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
  Eye,
  Truck,
  Car,
  UserCheck,
  IndianRupee,
  Share2,
  Printer,
  Check,
  ArrowRight,
  ShieldCheck,
  FileText
} from "lucide-react";

export default function MasterOmnichannelCRMPage() {
  const [activeLeadTab, setActiveLeadTab] = useState<"pickup" | "local" | "outstation" | "corporate" | "tour" | "contact">("pickup");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [leads, setLeads] = useState<any[]>([]);
  const [selectedLead, setSelectedLead] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  // Dispatch Modal States
  const [dispatchModalLead, setDispatchModalLead] = useState<any | null>(null);
  const [dispatchedSuccess, setDispatchedSuccess] = useState<any | null>(null);
  const [availableVehicles, setAvailableVehicles] = useState<any[]>([]);
  const [availableDrivers, setAvailableDrivers] = useState<any[]>([]);

  // Dispatch Form State
  const [dispatchForm, setDispatchForm] = useState({
    vehicleId: "",
    driverId: "",
    fare: "2500",
    advance: "0",
    paymentMode: "Cash Collection",
    pickupLocation: "",
    dropLocation: "",
    pickupDateTime: "",
    notes: ""
  });

  // Load registered fleet vehicles and drivers for assignment
  useEffect(() => {
    // 1. Load Vehicles
    let vList: any[] = [];
    try {
      const storedVehicles = localStorage.getItem("user_uploaded_fleet_vehicles") || localStorage.getItem("user_uploaded_fleet");
      if (storedVehicles) {
        const parsed = JSON.parse(storedVehicles);
        if (Array.isArray(parsed) && parsed.length > 0) vList = parsed;
      }
    } catch (e) {
      console.error(e);
    }
    if (vList.length === 0) {
      vList = [
        { id: "v-1", make: "Toyota", model: "Innova Hycross", registrationNumber: "DL 01 AB 1234", categoryName: "SUV", vehicleClass: "Mid-Premium" },
        { id: "v-2", make: "Maruti Suzuki", model: "Dzire", registrationNumber: "DL 01 CD 5678", categoryName: "Sedan", vehicleClass: "Compact" },
        { id: "v-3", make: "Honda", model: "City", registrationNumber: "HR 26 EF 9012", categoryName: "Sedan", vehicleClass: "Executive" },
        { id: "v-4", make: "BMW", model: "X5", registrationNumber: "DL 01 LM 4321", categoryName: "SUV", vehicleClass: "Luxury" }
      ];
    }
    setAvailableVehicles(vList);

    // 2. Load Drivers
    let dList: any[] = [];
    try {
      const storedDrivers = localStorage.getItem("user_uploaded_drivers");
      if (storedDrivers) {
        const parsed = JSON.parse(storedDrivers);
        if (Array.isArray(parsed) && parsed.length > 0) dList = parsed;
      }
    } catch (e) {
      console.error(e);
    }
    if (dList.length === 0) {
      dList = [
        { id: "d-1", name: "Ramesh Sharma", phone: "9876543210", licenseNumber: "DL-042021008765" },
        { id: "d-2", name: "Vikram Singh", phone: "9811223344", licenseNumber: "HR-262022001122" },
        { id: "d-3", name: "Amit Kumar Verma", phone: "9988776655", licenseNumber: "DL-012020009988" }
      ];
    }
    setAvailableDrivers(dList);
  }, []);

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

      const map = new Map();
      combinedLeads.forEach(item => map.set(item.id, item));
      fetchedList.forEach(item => {
        if (!map.has(item.id)) map.set(item.id, item);
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

  // Open Dispatch Modal with Pre-filled Lead Information
  const openDispatchModal = (lead: any) => {
    setDispatchModalLead(lead);
    setDispatchForm({
      vehicleId: availableVehicles[0]?.id || "",
      driverId: availableDrivers[0]?.id || "",
      fare: "2800",
      advance: "500",
      paymentMode: "Cash Collection",
      pickupLocation: lead.pickupLocation || "",
      dropLocation: lead.dropLocation || "",
      pickupDateTime: new Date().toISOString().slice(0, 16),
      notes: lead.notes || `Dispatched via Master CRM for ${lead.customerName}`
    });
  };

  // Execute Ride Dispatch & Generate Official Booking
  const handleConfirmDispatch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!dispatchModalLead) return;

    const assignedVeh = availableVehicles.find(v => v.id === dispatchForm.vehicleId) || availableVehicles[0];
    const assignedDrv = availableDrivers.find(d => d.id === dispatchForm.driverId) || availableDrivers[0];
    const finalBookingRef = dispatchModalLead.bookingRef || `TT-${Date.now().toString().slice(-6)}`;

    const dispatchedBooking = {
      id: `booking_${Date.now()}`,
      bookingNumber: finalBookingRef,
      type: dispatchModalLead.tripType || "Dispatched Ride",
      status: "CONFIRMED",
      pickupLocation: dispatchForm.pickupLocation || dispatchModalLead.pickupLocation,
      dropLocation: dispatchForm.dropLocation || dispatchModalLead.dropLocation,
      pickupDateTime: dispatchForm.pickupDateTime || new Date().toISOString(),
      netAmount: dispatchForm.fare,
      totalAmount: dispatchForm.fare,
      advanceAmount: dispatchForm.advance,
      paymentMode: dispatchForm.paymentMode,
      notes: dispatchForm.notes,
      createdAt: new Date().toISOString(),
      customer: {
        name: dispatchModalLead.customerName,
        phone: dispatchModalLead.phone,
        email: dispatchModalLead.email
      },
      vehicleCategory: {
        name: assignedVeh?.categoryName || "Premium Fleet"
      },
      vehicle: {
        id: assignedVeh?.id,
        registrationNumber: assignedVeh?.registrationNumber,
        model: `${assignedVeh?.make || ""} ${assignedVeh?.model || ""}`.trim(),
        driver: {
          name: assignedDrv?.name,
          phone: assignedDrv?.phone
        }
      },
      payments: [
        {
          id: `pay_${Date.now()}`,
          status: Number(dispatchForm.advance) > 0 ? "SUCCESS" : "PENDING",
          gateway: dispatchForm.paymentMode,
          amount: dispatchForm.advance || "0"
        }
      ]
    };

    // 1. Save Dispatched Booking into Local Dispatch Vault
    try {
      const stored = localStorage.getItem("user_uploaded_dispatched_bookings");
      const list = stored ? JSON.parse(stored) : [];
      list.unshift(dispatchedBooking);
      localStorage.setItem("user_uploaded_dispatched_bookings", JSON.stringify(list));
    } catch (err) {
      console.error("Failed to save dispatched booking:", err);
    }

    // 2. Mark Lead as CONVERTED in CRM
    updateLeadStatus(dispatchModalLead.id, "CONVERTED");

    // 3. Show Dispatched Dossier Confirmation
    setDispatchedSuccess({
      bookingRef: finalBookingRef,
      lead: dispatchModalLead,
      vehicle: assignedVeh,
      driver: assignedDrv,
      fare: dispatchForm.fare,
      advance: dispatchForm.advance,
      paymentMode: dispatchForm.paymentMode,
      pickupLocation: dispatchForm.pickupLocation,
      dropLocation: dispatchForm.dropLocation,
      pickupDateTime: dispatchForm.pickupDateTime
    });

    setDispatchModalLead(null);
  };

  // Multi-Select Lead State
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
    localStorage.setItem("user_uploaded_crm_leads", JSON.stringify(updated));
  };

  const handleBulkDelete = () => {
    if (selectedLeadIds.length === 0) return;
    if (confirm(`Are you sure you want to delete ${selectedLeadIds.length} selected lead(s)?`)) {
      const updated = leads.filter(l => !selectedLeadIds.includes(l.id));
      setLeads(updated);
      setSelectedLeadIds([]);
      localStorage.setItem("user_uploaded_crm_leads", JSON.stringify(updated));
    }
  };

  const exportSelectedCSV = () => {
    const subset = selectedLeadIds.length > 0 ? leads.filter(l => selectedLeadIds.includes(l.id)) : displayLeads;
    if (subset.length === 0) return;
    const headers = ["Booking Ref", "Customer Name", "Phone", "Email", "Trip Type", "Pickup", "Drop", "Status", "Date"];
    const rows = subset.map(l => [
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

  // Filter Leads by Active Tab
  const getFilteredByTab = () => {
    switch (activeLeadTab) {
      case "pickup":
        return leads.filter(l => (l.tripType || "").toLowerCase().includes("pickup") || (l.notes || "").toLowerCase().includes("pickup") || (l.tripType || "").toLowerCase().includes("drop"));
      case "local":
        return leads.filter(l => (l.tripType || "").toLowerCase().includes("local") || (l.tripType || "").toLowerCase().includes("hourly") || (l.notes || "").toLowerCase().includes("local"));
      case "outstation":
        return leads.filter(l => (l.tripType || "").toLowerCase().includes("outstation") || (l.tripType || "").toLowerCase().includes("round trip") || (l.tripType || "").toLowerCase().includes("one way"));
      case "corporate":
        return leads.filter(l => (l.companyName && l.companyName.trim() !== "") || (l.tripType || "").toLowerCase().includes("corporate") || (l.tripType || "").toLowerCase().includes("working"));
      case "tour":
        return leads.filter(l => (l.tripType || "").toLowerCase().includes("tour"));
      case "contact":
        return leads.filter(l => (l.tripType || "").toLowerCase().includes("contact") || (l.tripType || "").toLowerCase().includes("inquiry"));
      default:
        return leads;
    }
  };

  const tabFiltered = getFilteredByTab();

  const displayLeads = tabFiltered.filter(l => {
    const matchesSearch =
      (l.customerName || "").toLowerCase().includes(search.toLowerCase()) ||
      (l.phone || "").toLowerCase().includes(search.toLowerCase()) ||
      (l.email || "").toLowerCase().includes(search.toLowerCase()) ||
      (l.bookingRef || "").toLowerCase().includes(search.toLowerCase()) ||
      (l.pickupLocation || "").toLowerCase().includes(search.toLowerCase());

    const matchesStatus = statusFilter === "ALL" || (l.status || "NEW") === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-amber-500/20 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-black tracking-tight text-slate-50">
              Omnichannel Lead Ingestion & Dispatch CRM
            </h1>
            <span className="bg-amber-500/10 text-amber-400 border border-amber-500/30 text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider">
              Live Ingestion Pipeline
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Real-time pipeline aggregating customer leads across Booking Widgets, Corporate Accounts, Rentals, and Tours.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={fetchLeads}
            disabled={loading}
            className="flex items-center gap-1.5 bg-slate-900 border border-white/10 hover:border-amber-400/40 text-slate-300 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-amber-400 ${loading ? "animate-spin" : ""}`} />
            <span>Refresh Pipeline</span>
          </button>
        </div>
      </div>

      {/* Omnichannel Segmented Lead Source Tabs */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
        {[
          { key: "pickup", label: "Pickup & Drop", icon: Building2, count: leads.filter(l => (l.tripType || "").toLowerCase().includes("pickup") || (l.notes || "").toLowerCase().includes("pickup") || (l.tripType || "").toLowerCase().includes("drop")).length },
          { key: "local", label: "Local Rentals", icon: Clock, count: leads.filter(l => (l.tripType || "").toLowerCase().includes("local") || (l.tripType || "").toLowerCase().includes("hourly") || (l.notes || "").toLowerCase().includes("local")).length },
          { key: "outstation", label: "Outstation", icon: Compass, count: leads.filter(l => (l.tripType || "").toLowerCase().includes("outstation") || (l.tripType || "").toLowerCase().includes("round trip") || (l.tripType || "").toLowerCase().includes("one way")).length },
          { key: "corporate", label: "Corporate B2B", icon: Users, count: leads.filter(l => (l.companyName && l.companyName.trim() !== "") || (l.tripType || "").toLowerCase().includes("corporate") || (l.tripType || "").toLowerCase().includes("working")).length },
          { key: "tour", label: "Tour Packages", icon: Sparkles, count: leads.filter(l => (l.tripType || "").toLowerCase().includes("tour")).length },
          { key: "contact", label: "Web Inquiries", icon: Mail, count: leads.filter(l => (l.tripType || "").toLowerCase().includes("contact") || (l.tripType || "").toLowerCase().includes("inquiry")).length },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeLeadTab === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => {
                setActiveLeadTab(tab.key as any);
                setSelectedLeadIds([]);
              }}
              className={`p-3 rounded-2xl border transition-all text-left flex flex-col justify-between cursor-pointer ${
                isActive
                  ? "bg-amber-500/10 border-amber-500 text-amber-400 shadow-lg shadow-amber-500/10"
                  : "bg-slate-900/60 border-white/10 text-slate-400 hover:text-slate-200 hover:border-white/20"
              }`}
            >
              <div className="flex items-center justify-between">
                <Icon className="w-4 h-4" />
                <span className="text-[10px] font-mono font-bold bg-slate-950 px-1.5 py-0.5 rounded border border-white/10">
                  {tab.count}
                </span>
              </div>
              <div className="text-xs font-black mt-2 truncate">{tab.label}</div>
            </button>
          );
        })}
      </div>

      {/* Main CRM Table Container */}
      <div className="bg-slate-900/80 backdrop-blur-xl border border-white/10 rounded-2xl p-5 shadow-2xl space-y-4">
        {/* Search & Status Toolbar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pb-4 border-b border-white/10">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Filter leads by customer, phone, PNR or route..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-slate-950 border border-white/10 rounded-xl pl-9 pr-4 py-2 text-xs text-slate-100 focus:outline-none focus:border-amber-400"
            />
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <Filter className="w-4 h-4 text-slate-400" />
            <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">Status:</span>
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
          <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl">
            <div className="flex items-center gap-2">
              <span className="bg-amber-500 text-slate-950 text-xs font-black px-2.5 py-0.5 rounded-md font-mono">
                {selectedLeadIds.length} Selected
              </span>
              <span className="text-xs text-slate-300 font-medium">Bulk Actions</span>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <select
                onChange={(e) => {
                  if (e.target.value) {
                    handleBulkStatusChange(e.target.value);
                    e.target.value = "";
                  }
                }}
                className="bg-slate-950 border border-amber-500/30 text-amber-400 text-xs font-bold rounded-lg px-2 py-1 focus:outline-none cursor-pointer"
                defaultValue=""
              >
                <option value="" disabled>Change Status...</option>
                <option value="NEW">NEW</option>
                <option value="CONTACTED">CONTACTED</option>
                <option value="QUALIFIED">QUALIFIED</option>
                <option value="CONVERTED">CONVERTED</option>
                <option value="LOST">LOST</option>
              </select>

              <button
                onClick={exportSelectedCSV}
                className="flex items-center gap-1 bg-slate-950 hover:bg-slate-800 border border-white/10 text-slate-300 px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer"
              >
                <Download className="w-3 h-3 text-amber-400" />
                <span>Export</span>
              </button>

              <button
                onClick={handleBulkDelete}
                className="flex items-center gap-1 bg-rose-500/10 hover:bg-rose-500 text-rose-400 hover:text-white border border-rose-500/30 px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer"
              >
                <span>Delete</span>
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
                <th className="py-3 px-4">Customer & PNR</th>
                <th className="py-3 px-4">Trip Requirement</th>
                <th className="py-3 px-4">Pickup / Drop Route</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Dispatch & Actions</th>
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
                          <span className="text-[10px] font-mono text-amber-400 font-bold bg-amber-500/10 px-1.5 py-0.5 rounded border border-amber-500/20">
                            {lead.bookingRef}
                          </span>
                        </div>
                        {lead.companyName && (
                          <div className="text-[10px] text-slate-400 font-sans mt-0.5 font-bold flex items-center gap-1">
                            <Building2 className="w-3 h-3 text-slate-500" />
                            <span>{lead.companyName}</span>
                          </div>
                        )}
                        <div className="text-[11px] text-slate-400 font-mono mt-0.5">{lead.phone}</div>
                      </td>
                      <td className="py-4 px-4">
                        <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-amber-500/10 text-amber-400 border border-amber-500/20 whitespace-nowrap">
                          {lead.tripType || "Rental Lead"}
                        </span>
                      </td>
                      <td className="py-4 px-4">
                        <div className="text-slate-200 text-[11px] truncate max-w-[150px]" title={lead.pickupLocation}>
                          {lead.pickupLocation || "N/A"}
                        </div>
                        <div className="text-[10px] text-slate-500 italic mt-0.5">to {lead.dropLocation || "N/A"}</div>
                      </td>
                      <td className="py-4 px-4">
                        <select
                          value={lead.status || "NEW"}
                          onChange={(e) => updateLeadStatus(lead.id, e.target.value)}
                          className={`border rounded-lg px-2.5 py-1 text-[11px] font-bold focus:outline-none cursor-pointer ${
                            lead.status === "CONVERTED"
                              ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30 font-black"
                              : "bg-slate-950 text-amber-400 border-white/10"
                          }`}
                        >
                          <option value="NEW">NEW</option>
                          <option value="CONTACTED">CONTACTED</option>
                          <option value="QUALIFIED">QUALIFIED</option>
                          <option value="CONVERTED">CONVERTED</option>
                          <option value="LOST">LOST</option>
                        </select>
                      </td>
                      <td className="py-4 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5 whitespace-nowrap">
                          <button
                            onClick={() => openDispatchModal(lead)}
                            className="inline-flex items-center gap-1 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 px-3 py-1.5 rounded-lg text-[11px] font-black uppercase tracking-wider transition-all shadow-md shadow-amber-500/20 cursor-pointer"
                            title="Assign Fleet & Driver to Dispatch Ride"
                          >
                            <Truck className="w-3.5 h-3.5" />
                            <span>Dispatch</span>
                          </button>
                          <button
                            onClick={() => setSelectedLead(lead)}
                            className="inline-flex items-center gap-1 bg-slate-950 hover:bg-slate-800 text-slate-300 hover:text-white border border-white/10 px-2.5 py-1.5 rounded-lg text-[11px] font-bold transition-all cursor-pointer"
                          >
                            <Eye className="w-3.5 h-3.5 text-amber-400" />
                            <span>Inspect</span>
                          </button>
                          <a
                            href={`tel:${lead.phone}`}
                            className="inline-flex items-center gap-1 bg-slate-950 hover:bg-white/10 text-slate-300 border border-white/10 px-2.5 py-1.5 rounded-lg text-[11px] font-bold transition-all"
                          >
                            <PhoneCall className="w-3.5 h-3.5 text-emerald-400" />
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

      {/* Ride Dispatch & Fleet Assignment Modal */}
      {dispatchModalLead && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
          <div className="bg-slate-900 border border-amber-500/40 rounded-3xl p-6 sm:p-8 w-full max-w-2xl shadow-2xl space-y-6 relative text-slate-100 max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setDispatchModalLead(null)}
              className="absolute top-5 right-5 text-slate-400 hover:text-white cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="space-y-1 border-b border-white/10 pb-4">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold uppercase text-amber-400 tracking-wider">
                  Live Dispatch Control Desk
                </span>
                <span className="text-[10px] font-mono text-slate-400 bg-slate-950 px-2 py-0.5 rounded border border-white/10 font-bold">
                  {dispatchModalLead.bookingRef}
                </span>
              </div>
              <h3 className="text-xl sm:text-2xl font-black text-slate-50">
                Dispatch Ride & Assign Chauffeur
              </h3>
              <p className="text-xs text-slate-400">
                Assign an active vehicle from your Fleet Roster and a Chauffeur to confirm this customer booking.
              </p>
            </div>

            <form onSubmit={handleConfirmDispatch} className="space-y-5">
              {/* Customer Lead Summary */}
              <div className="bg-slate-950 p-4 rounded-2xl border border-white/10 grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                <div>
                  <span className="text-[10px] text-slate-400 block uppercase font-bold">Customer</span>
                  <span className="font-bold text-slate-100 text-sm">{dispatchModalLead.customerName}</span>
                  <div className="text-slate-400 font-mono text-[11px]">{dispatchModalLead.phone}</div>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block uppercase font-bold">Trip Type</span>
                  <span className="font-bold text-amber-400">{dispatchModalLead.tripType}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block uppercase font-bold">Lead Ingested</span>
                  <span className="text-slate-300 font-mono">{dispatchModalLead.createdAt?.slice(0, 10)}</span>
                </div>
              </div>

              {/* Assignment Controls: Vehicle & Driver */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                    <Car className="w-4 h-4 text-amber-400" />
                    <span>Select Fleet Vehicle *</span>
                  </label>
                  <select
                    value={dispatchForm.vehicleId}
                    onChange={(e) => setDispatchForm({ ...dispatchForm, vehicleId: e.target.value })}
                    required
                    className="w-full bg-slate-950 border border-white/10 rounded-xl p-3 text-xs text-slate-100 focus:outline-none focus:border-amber-400 font-mono cursor-pointer"
                  >
                    <option value="" disabled>- Select Active Fleet Vehicle -</option>
                    {availableVehicles.map((veh) => (
                      <option key={veh.id} value={veh.id} className="bg-slate-900">
                        {veh.make} {veh.model} ({veh.registrationNumber}) - {veh.categoryName} {veh.vehicleClass}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                    <UserCheck className="w-4 h-4 text-amber-400" />
                    <span>Select Chauffeur / Driver *</span>
                  </label>
                  <select
                    value={dispatchForm.driverId}
                    onChange={(e) => setDispatchForm({ ...dispatchForm, driverId: e.target.value })}
                    required
                    className="w-full bg-slate-950 border border-white/10 rounded-xl p-3 text-xs text-slate-100 focus:outline-none focus:border-amber-400 font-mono cursor-pointer"
                  >
                    <option value="" disabled>- Select Assigned Chauffeur -</option>
                    {availableDrivers.map((drv) => (
                      <option key={drv.id} value={drv.id} className="bg-slate-900">
                        {drv.name} (+91 {drv.phone})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Commercials: Fare & Payment */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-300">Agreed Trip Fare (₹) *</label>
                  <div className="relative">
                    <IndianRupee className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="number"
                      required
                      value={dispatchForm.fare}
                      onChange={(e) => setDispatchForm({ ...dispatchForm, fare: e.target.value })}
                      className="w-full bg-slate-950 border border-white/10 rounded-xl pl-8 pr-3 py-2.5 text-xs text-slate-100 focus:outline-none focus:border-amber-400 font-mono font-bold"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-300">Advance Collected (₹)</label>
                  <div className="relative">
                    <IndianRupee className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="number"
                      value={dispatchForm.advance}
                      onChange={(e) => setDispatchForm({ ...dispatchForm, advance: e.target.value })}
                      className="w-full bg-slate-950 border border-white/10 rounded-xl pl-8 pr-3 py-2.5 text-xs text-slate-100 focus:outline-none focus:border-amber-400 font-mono"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-300">Payment Collection Mode</label>
                  <select
                    value={dispatchForm.paymentMode}
                    onChange={(e) => setDispatchForm({ ...dispatchForm, paymentMode: e.target.value })}
                    className="w-full bg-slate-950 border border-white/10 rounded-xl p-2.5 text-xs text-slate-100 focus:outline-none focus:border-amber-400 cursor-pointer"
                  >
                    <option value="Cash Collection">Driver Cash Collection</option>
                    <option value="UPI / QR Code">UPI / QR Code Scan</option>
                    <option value="Razorpay Online Link">Razorpay Payment Link</option>
                    <option value="NEFT / Bank Transfer">Bank NEFT Transfer</option>
                    <option value="Post-Trip Bill">Corporate Billing / Post-Trip</option>
                  </select>
                </div>
              </div>

              {/* Route & Schedule Confirmation */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-300">Pickup Location *</label>
                  <input
                    type="text"
                    required
                    value={dispatchForm.pickupLocation}
                    onChange={(e) => setDispatchForm({ ...dispatchForm, pickupLocation: e.target.value })}
                    className="w-full bg-slate-950 border border-white/10 rounded-xl p-2.5 text-xs text-slate-100 focus:outline-none focus:border-amber-400"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-300">Drop Location / Destination</label>
                  <input
                    type="text"
                    value={dispatchForm.dropLocation}
                    onChange={(e) => setDispatchForm({ ...dispatchForm, dropLocation: e.target.value })}
                    className="w-full bg-slate-950 border border-white/10 rounded-xl p-2.5 text-xs text-slate-100 focus:outline-none focus:border-amber-400"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300">Special Dispatcher Instructions</label>
                <textarea
                  rows={2}
                  value={dispatchForm.notes}
                  onChange={(e) => setDispatchForm({ ...dispatchForm, notes: e.target.value })}
                  placeholder="e.g. Flight AI-802 arrival at Pillar 4; provide water bottles & newspaper."
                  className="w-full bg-slate-950 border border-white/10 rounded-xl p-2.5 text-xs text-slate-100 focus:outline-none focus:border-amber-400 resize-none"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setDispatchModalLead(null)}
                  className="px-4 py-2 bg-slate-950 border border-white/10 text-slate-400 hover:text-white rounded-xl text-xs font-bold transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex items-center gap-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black px-6 py-2.5 rounded-xl text-xs uppercase tracking-wider shadow-lg shadow-amber-500/20 cursor-pointer"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Confirm Dispatch & Generate PNR</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Dispatched Success & Booking Reference Card */}
      {dispatchedSuccess && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
          <div className="bg-slate-900 border border-emerald-500/40 rounded-3xl p-6 sm:p-8 w-full max-w-xl shadow-2xl space-y-6 relative text-slate-100">
            <button
              onClick={() => setDispatchedSuccess(null)}
              className="absolute top-5 right-5 text-slate-400 hover:text-white cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="text-center space-y-2">
              <div className="w-12 h-12 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center mx-auto">
                <Check className="w-6 h-6" />
              </div>
              <h3 className="text-2xl font-black text-slate-50">Ride Dispatched Successfully!</h3>
              <p className="text-xs text-slate-400">
                The lead is now confirmed and logged as an active booking in the dispatch network.
              </p>
            </div>

            {/* Official Booking PNR Ticket Banner */}
            <div className="bg-slate-950 p-5 rounded-2xl border border-amber-500/30 space-y-3">
              <div className="flex justify-between items-center border-b border-white/10 pb-3">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Official Booking PNR</span>
                <span className="text-xl font-black font-mono text-amber-400">{dispatchedSuccess.bookingRef}</span>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Customer</span>
                  <span className="font-bold text-slate-100">{dispatchedSuccess.lead?.customerName}</span>
                  <div className="text-[11px] font-mono text-slate-400">{dispatchedSuccess.lead?.phone}</div>
                </div>

                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Assigned Vehicle</span>
                  <span className="font-bold text-amber-400 font-mono">{dispatchedSuccess.vehicle?.registrationNumber}</span>
                  <div className="text-[11px] text-slate-300">{dispatchedSuccess.vehicle?.make} {dispatchedSuccess.vehicle?.model}</div>
                </div>

                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Chauffeur</span>
                  <span className="font-bold text-slate-100">{dispatchedSuccess.driver?.name}</span>
                  <div className="text-[11px] font-mono text-slate-400">+91 {dispatchedSuccess.driver?.phone}</div>
                </div>

                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Total Fare / Mode</span>
                  <span className="font-black text-emerald-400 font-mono text-sm">₹{dispatchedSuccess.fare}</span>
                  <div className="text-[10px] text-slate-400">{dispatchedSuccess.paymentMode}</div>
                </div>
              </div>
            </div>

            {/* 1-Click Action Buttons: WhatsApp Share & Print Slip */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <a
                href={`https://wa.me/91${(dispatchedSuccess.lead?.phone || "").replace(/\D/g, "").slice(-10)}?text=${encodeURIComponent(
                  `*TEMP TRAVEL CAR RENTALS - RIDE CONFIRMATION*\n\nDear ${dispatchedSuccess.lead?.customerName},\nYour cab has been confirmed and dispatched.\n\n*Booking Number (PNR):* ${dispatchedSuccess.bookingRef}\n*Vehicle:* ${dispatchedSuccess.vehicle?.make} ${dispatchedSuccess.vehicle?.model} (${dispatchedSuccess.vehicle?.registrationNumber})\n*Driver / Chauffeur:* ${dispatchedSuccess.driver?.name} (📞 +91-${dispatchedSuccess.driver?.phone})\n*Pickup Location:* ${dispatchedSuccess.pickupLocation}\n*Agreed Fare:* ₹${dispatchedSuccess.fare}\n\nThank you for choosing Temp Travel! For assistance call +91-9999999999.`
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white font-black py-2.5 px-4 rounded-xl text-xs uppercase tracking-wider shadow-lg transition-all"
              >
                <Share2 className="w-4 h-4" />
                <span>Share On WhatsApp</span>
              </a>

              <a
                href="/admin/bookings-dispatch"
                className="flex items-center justify-center gap-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black py-2.5 px-4 rounded-xl text-xs uppercase tracking-wider shadow-lg transition-all"
              >
                <span>View In Dispatch Desk</span>
                <ArrowRight className="w-4 h-4" />
              </a>
            </div>
          </div>
        </div>
      )}

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
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold uppercase text-amber-400 tracking-wider">Lead Record Dossier</span>
                <span className="text-[10px] font-mono text-slate-400 bg-slate-950 px-2 py-0.5 rounded border border-white/10 font-bold">
                  {selectedLead.bookingRef}
                </span>
              </div>
              <h3 className="text-xl font-bold text-slate-50">{selectedLead.customerName}</h3>
            </div>

            <div className="space-y-2 bg-slate-950 p-4 rounded-xl border border-white/10 text-xs font-mono">
              <div>Phone: <strong className="text-slate-200">{selectedLead.phone}</strong></div>
              <div>Email: <strong className="text-slate-200">{selectedLead.email}</strong></div>
              <div>Trip Type: <strong className="text-amber-400">{selectedLead.tripType}</strong></div>
              <div>Pickup Address: <strong className="text-slate-200">{selectedLead.pickupLocation}</strong></div>
              <div>Notes: <p className="text-slate-400 font-sans mt-1">{selectedLead.notes || "No special instructions recorded."}</p></div>
            </div>

            <div className="pt-2 flex justify-between items-center">
              <button
                onClick={() => {
                  const leadToDispatch = selectedLead;
                  setSelectedLead(null);
                  openDispatchModal(leadToDispatch);
                }}
                className="flex items-center gap-1.5 bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-black px-4 py-2 rounded-xl text-xs uppercase tracking-wider shadow-md shadow-amber-500/20 cursor-pointer"
              >
                <Truck className="w-4 h-4" />
                <span>Dispatch & Book Ride</span>
              </button>

              <button
                onClick={() => setSelectedLead(null)}
                className="px-4 py-2 bg-slate-950 hover:bg-white/10 border border-white/10 text-slate-300 font-bold rounded-xl text-xs cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
