"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { 
  Building2, 
  Search, 
  Download, 
  Trash2, 
  Edit, 
  FileText, 
  CheckCircle, 
  Clock, 
  AlertCircle, 
  ArrowRight,
  MessageSquare,
  Users,
  MapPin,
  Archive,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  Briefcase,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Truck,
  Loader2,
  Share2
} from "lucide-react";
import LeadDispatchModal, { 
  extractPickupLocation, 
  extractDropLocation,
  extractPickupTime,
  extractPickupDate 
} from "@/components/admin/lead-dispatch-modal";
import { buildWhatsAppShareUrl } from "@/lib/whatsapp-share";
import { 
  syncExistingDispatchesToLeads, 
  getCurrentAdminUser, 
  createLeadStatusAuditLog, 
  parseLastLeadChange, 
  syncLeadStatusUpdateAcrossPanels, 
  UNIFIED_LEAD_STATUSES, 
  normalizeLeadStatus,
  isLeadAlreadyDispatched 
} from "@/lib/lead-sync";

export type LeadStatus = "NEW" | "CONTACTED" | "QUALIFIED" | "NEGOTIATION" | "CONVERTED" | "DISPATCHED" | "WON" | "LOST" | "ARCHIVED";

interface Lead {
  id: string;
  companyName: string;
  contactName: string;
  email: string;
  phone: string;
  employeeCount?: number | null;
  pickupLocations?: string | null;
  pickupLocation?: string | null;
  dropLocation?: string | null;
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
  CONVERTED: number;
  DISPATCHED: number;
  WON?: number;
  LOST: number;
  ARCHIVED: number;
}

export default function AdminCorporateLeadsPage() {
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
    CONVERTED: 0,
    DISPATCHED: 0,
    LOST: 0,
    ARCHIVED: 0,
  });

  const [activeLead, setActiveLead] = useState<Lead | null>(null);
  const [newNoteInput, setNewNoteInput] = useState("");
  const [isLoggingNote, setIsLoggingNote] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState<string | null>(null);

  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const loadLeads = async (showSpinner = true) => {
    if (showSpinner) setLoading(true);
    try {
      const queryParams = new URLSearchParams({
        search,
        status: statusFilter,
        leadType: "pickup_drop",
        sortBy,
        sortOrder,
        page: currentPage.toString(),
        limit: pageSize.toString(),
      });

      let fetchedLeads: Lead[] = [];
      const res = await fetch(`/api/corporate/lead?${queryParams.toString()}&_t=${Date.now()}`, { cache: "no-store" });
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data)) {
          fetchedLeads = data.map((l: any) => ({
            ...l,
            status: normalizeLeadStatus(l.status),
          }));
        } else if (data.leads) {
          fetchedLeads = data.leads.map((l: any) => ({
            ...l,
            status: normalizeLeadStatus(l.status),
          }));
          if (data.stats) setStats({ ...data.stats, CONVERTED: data.stats.CONVERTED ?? (data.stats as any).WON ?? 0 });
        }
      }

      // Check local CRM leads for Pickup & Drop
      try {
        const local = localStorage.getItem("user_uploaded_crm_leads");
        if (local) {
          const parsed = JSON.parse(local);
          if (Array.isArray(parsed)) {
            const matching = parsed.filter((l: any) => {
              const type = (l.tripType || l.serviceType || "").toLowerCase();
              if (
                type.includes("local") ||
                type.includes("hourly") ||
                type.includes("outstation") ||
                type.includes("round trip") ||
                type.includes("one way") ||
                type.includes("tour")
              ) {
                return false;
              }
              return (
                type.includes("pickup") ||
                type.includes("airport") ||
                type.includes("drop") ||
                type.includes("point") ||
                type.includes("transfer")
              );
            }).map((l: any) => ({
              id: l.id || `lead_${Date.now()}`,
              companyName: l.companyName || "Individual",
              contactName: l.customerName || l.contactName || "Customer",
              email: l.email || "",
              phone: l.phone || "",
              employeeCount: l.employeeCount || 1,
              pickupLocations: l.pickupLocation || l.pickupLocations || "",
              pickupLocation: l.pickupLocation || l.pickupLocations || "",
              dropLocation: l.dropLocation || "",
              serviceType: l.tripType || l.serviceType || "Pickup & Drop",
              requirements: l.requirements || l.notes || "",
              notes: l.notes || "",
              status: normalizeLeadStatus(l.status),
              createdAt: l.createdAt || new Date().toISOString()
            }));

            // Merge deduplicated: Database leads ALWAYS take precedence over local storage
            const cleanPhone = (p?: string) => (p || "").replace(/\D/g, "").slice(-10);
            const seenKeys = new Set<string>();
            const deduplicatedLeads: Lead[] = [];

            // 1. Live database leads take absolute priority
            fetchedLeads.forEach((f) => {
              if (f.id) seenKeys.add(`id_${f.id}`);
              if ((f as any).bookingRef) seenKeys.add(`ref_${(f as any).bookingRef}`);
              const phone = cleanPhone(f.phone);
              if (phone.length === 10) seenKeys.add(`phone_${phone}`);
              deduplicatedLeads.push(f);
            });

            // 2. Local storage leads added ONLY if not matching any database lead
            matching.forEach((m) => {
              const idKey = m.id ? `id_${m.id}` : null;
              const refKey = (m as any).bookingRef ? `ref_${(m as any).bookingRef}` : null;
              const phone = cleanPhone(m.phone);
              const phoneKey = phone.length === 10 ? `phone_${phone}` : null;

              if (idKey && seenKeys.has(idKey)) return;
              if (refKey && seenKeys.has(refKey)) return;
              if (phoneKey && seenKeys.has(phoneKey)) return;

              if (idKey) seenKeys.add(idKey);
              if (refKey) seenKeys.add(refKey);
              if (phoneKey) seenKeys.add(phoneKey);
              deduplicatedLeads.push(m);
            });

            fetchedLeads = deduplicatedLeads;

            // Sync user_uploaded_crm_leads in localStorage with fresh DB status & notes & unified ID
            try {
              let updated = false;
              const syncedLocal = parsed.map((item: any) => {
                const itemPhone = cleanPhone(item.phone);
                const live = fetchedLeads.find((f) => 
                  f.id === item.id || 
                  ((f as any).bookingRef && item.bookingRef && (f as any).bookingRef === item.bookingRef) ||
                  (itemPhone.length === 10 && cleanPhone(f.phone) === itemPhone)
                );
                if (live) {
                  if (item.status !== live.status || item.notes !== live.notes || item.id !== live.id) {
                    updated = true;
                    return {
                      ...item,
                      id: live.id,
                      status: live.status,
                      notes: live.notes || item.notes,
                    };
                  }
                }
                return item;
              });
              if (updated) {
                localStorage.setItem("user_uploaded_crm_leads", JSON.stringify(syncedLocal));
              }
            } catch (syncErr) {
              console.error("Local sync error:", syncErr);
            }
          }
        }
      } catch (e) {
        console.error(e);
      }

      // Strictly enforce pickup & drop classification only (exclude local, outstation, tour)
      fetchedLeads = fetchedLeads.filter((l) => {
        const type = (l.serviceType || (l as any).tripType || "").toLowerCase();
        if (
          type.includes("local") ||
          type.includes("hourly") ||
          type.includes("outstation") ||
          type.includes("round trip") ||
          type.includes("one way") ||
          type.includes("tour")
        ) {
          return false;
        }
        return (
          type.includes("pickup") ||
          type.includes("drop") ||
          type.includes("airport") ||
          type.includes("transfer") ||
          type.includes("point")
        );
      });

      setLeads(fetchedLeads);
      setTotalCount(fetchedLeads.length);
      setTotalPages(Math.ceil(fetchedLeads.length / pageSize) || 1);
      setActiveLead((prev) => {
        if (!prev) return null;
        const cleanDigits = (p?: string) => (p || "").replace(/\D/g, "").slice(-10);
        const prevPhone = cleanDigits(prev.phone);
        const fresh = fetchedLeads.find((l) => 
          l.id === prev.id || 
          ((l as any).bookingRef && (prev as any).bookingRef && (l as any).bookingRef === (prev as any).bookingRef) ||
          (prevPhone.length === 10 && cleanDigits(l.phone) === prevPhone)
        );
        return fresh || prev;
      });
    } catch (err) {
      console.error("Failed to load corporate leads:", err);
    } finally {
      if (showSpinner) setLoading(false);
    }
  };

  useEffect(() => {
    syncExistingDispatchesToLeads();
    loadLeads();
    setSelectedIds([]);

    const handleUpdate = () => loadLeads(false);
    window.addEventListener("crm_leads_updated", handleUpdate);
    window.addEventListener("storage", handleUpdate);
    return () => {
      window.removeEventListener("crm_leads_updated", handleUpdate);
      window.removeEventListener("storage", handleUpdate);
    };
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
    const target = leads.find((l) => l.id === id);

    // If changing status to DISPATCHED, verify if vehicle & chauffeur have already been dispatched
    if (newStatus === "DISPATCHED") {
      const alreadyDispatched = isLeadAlreadyDispatched(target);
      if (!alreadyDispatched) {
        if (target) {
          setDispatchLead({
            ...target,
            customerName: target.contactName || target.companyName || "Customer Lead",
            pickupLocation: extractPickupLocation(target),
            dropLocation: extractDropLocation(target),
          });
        }
        return;
      }
    }

    setUpdatingStatus(newStatus);
    try {
      const { userName, panel } = getCurrentAdminUser("Admin Panel");
      const { updatedNotes } = createLeadStatusAuditLog({
        oldStatus: target?.status,
        newStatus,
        userName,
        panel,
        existingNotes: target?.notes,
      });

      const res = await fetch(`/api/corporate/lead/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: newStatus,
          notes: updatedNotes,
          phone: target?.phone,
        }),
      });

      if (res.ok) {
        const updated = await res.json();
        const normUpdated = {
          ...updated,
          status: normalizeLeadStatus(updated.status),
        };
        setLeads(leads.map((l) => (l.id === id ? normUpdated : l)));
        if (activeLead && activeLead.id === id) {
          setActiveLead(normUpdated);
        }
        syncLeadStatusUpdateAcrossPanels({
          leadId: id,
          phone: target?.phone,
          newStatus,
          updatedNotes,
          userName,
          panel,
        });
        loadLeads(false); // refresh counts without full loading spinner
      }
    } catch (err) {
      console.error("Failed to update status:", err);
    } finally {
      setUpdatingStatus(null);
    }
  };

  const handleServiceTypeChange = async (id: string, newType: string) => {
    const { userName, panel } = getCurrentAdminUser("Admin Panel");
    const timestamp = new Date().toLocaleString("en-IN", {
      timeZone: "Asia/Kolkata",
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true
    });
    const logTag = `[${timestamp}] Booking type updated to "${newType}" by ${userName} (${panel})`;

    const target = leads.find((l) => l.id === id);
    const updatedNotes = [logTag, target?.notes].filter(Boolean).join("\n");
    const cleanDigits = (p?: string) => (p || "").replace(/\D/g, "").slice(-10);
    const targetPhone = cleanDigits(target?.phone);

    // 1. Await database backend update first so migration commits
    try {
      await fetch(`/api/corporate/lead/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          serviceType: newType,
          tripType: newType,
          notes: updatedNotes,
          phone: target?.phone,
        }),
      });
    } catch (err) {
      console.error("Failed to update service type:", err);
    }

    // 2. Update local state
    const isStillPickup =
      newType.toLowerCase().includes("pickup") ||
      newType.toLowerCase().includes("drop") ||
      newType.toLowerCase().includes("airport") ||
      newType.toLowerCase().includes("transfer") ||
      newType.toLowerCase().includes("point");

    if (!isStillPickup) {
      setLeads((prev) => prev.filter((l) => l.id !== id && (targetPhone.length !== 10 || cleanDigits(l.phone) !== targetPhone)));
      if (activeLead && (activeLead.id === id || (targetPhone.length === 10 && cleanDigits(activeLead.phone) === targetPhone))) {
        setActiveLead(null);
      }
    } else {
      setLeads((prev) =>
        prev.map((l) => (l.id === id || (targetPhone.length === 10 && cleanDigits(l.phone) === targetPhone) ? { ...l, serviceType: newType, notes: updatedNotes } : l))
      );
      if (activeLead && (activeLead.id === id || (targetPhone.length === 10 && cleanDigits(activeLead.phone) === targetPhone))) {
        setActiveLead({ ...activeLead, serviceType: newType, notes: updatedNotes });
      }
    }

    // 3. Persist to localStorage and broadcast across panels
    try {
      const crmStored = localStorage.getItem("user_uploaded_crm_leads");
      if (crmStored) {
        const crmList = JSON.parse(crmStored);
        if (Array.isArray(crmList)) {
          const updatedCRM = crmList.map((l: any) =>
            l.id === id || (targetPhone.length === 10 && cleanDigits(l.phone) === targetPhone) ? { ...l, serviceType: newType, tripType: newType, notes: updatedNotes } : l
          );
          localStorage.setItem("user_uploaded_crm_leads", JSON.stringify(updatedCRM));
          window.dispatchEvent(new Event("crm_leads_updated"));
        }
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleAddNoteLog = async (id: string) => {
    if (!newNoteInput.trim() || isLoggingNote) return;
    setIsLoggingNote(true);

    try {
      const target = leads.find((l) => l.id === id);
      const { userName, panel } = getCurrentAdminUser("Admin Panel");
      const timestamp = new Date().toLocaleString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });

      const entry = `[${timestamp}] Note by ${userName} (${panel}): ${newNoteInput.trim()}`;
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
        syncLeadStatusUpdateAcrossPanels({
          leadId: id,
          newStatus: target?.status || "NEW",
          updatedNotes: existingNotes,
          userName,
          panel,
        });
        setNewNoteInput("");
      }
    } catch (err) {
      console.error("Failed to save note:", err);
    } finally {
      setIsLoggingNote(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to permanently delete this corporate lead?")) return;

    // Optimistic remove
    setLeads((prev) => prev.filter((l) => l.id !== id));
    setSelectedIds((prev) => prev.filter((i) => i !== id));
    setTotalCount((prev) => Math.max(0, prev - 1));
    if (activeLead && activeLead.id === id) {
      setActiveLead(null);
    }

    try {
      const local = localStorage.getItem("user_uploaded_crm_leads");
      if (local) {
        const parsed = JSON.parse(local);
        if (Array.isArray(parsed)) {
          const next = parsed.filter((l: any) => l.id !== id && l.bookingRef !== id);
          localStorage.setItem("user_uploaded_crm_leads", JSON.stringify(next));
          window.dispatchEvent(new Event("crm_leads_updated"));
        }
      }
    } catch (e) {
      console.error(e);
    }

    try {
      const res = await fetch(`/api/corporate/lead/${id}`, { method: "DELETE" });
      loadLeads(false);
    } catch (e) {
      console.error("Failed to delete lead:", e);
      loadLeads(false);
    }
  };

  const handleBulkDelete = async () => {
    if (selectedIds.length === 0) return;
    if (!confirm(`Are you sure you want to delete ${selectedIds.length} selected corporate lead(s)?`)) return;

    const idsToDelete = [...selectedIds];
    setLeads((prev) => prev.filter((l) => !idsToDelete.includes(l.id)));
    setSelectedIds([]);
    setTotalCount((prev) => Math.max(0, prev - idsToDelete.length));
    if (activeLead && idsToDelete.includes(activeLead.id)) {
      setActiveLead(null);
    }

    try {
      const local = localStorage.getItem("user_uploaded_crm_leads");
      if (local) {
        const parsed = JSON.parse(local);
        if (Array.isArray(parsed)) {
          const next = parsed.filter((l: any) => !idsToDelete.includes(l.id) && !idsToDelete.includes(l.bookingRef));
          localStorage.setItem("user_uploaded_crm_leads", JSON.stringify(next));
          window.dispatchEvent(new Event("crm_leads_updated"));
        }
      }
    } catch (e) {
      console.error(e);
    }

    try {
      await Promise.all(idsToDelete.map((id) => fetch(`/api/corporate/lead/${id}`, { method: "DELETE" })));
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
    window.open(`/api/corporate/lead/export?${query}`, "_blank");
  };

  const openLeadDetails = (lead: Lead) => {
    setActiveLead(lead);
    setNewNoteInput("");
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
      case "CONVERTED":
      case "WON":
        return "bg-green-500/20 text-green-300 border-green-500/40 shadow-sm font-black";
      case "DISPATCHED":
        return "bg-purple-500/20 text-purple-300 border-purple-500/40 shadow-sm font-black";
      case "LOST":
        return "bg-rose-500/10 text-rose-400 border-rose-500/20";
      case "ARCHIVED":
        return "bg-slate-500/10 text-slate-400 border-slate-500/20";
      default:
        return "bg-slate-500/10 text-slate-400 border-slate-500/20";
    }
  };

  return (
    <div className="bg-background min-h-screen text-slate-100 p-8 space-y-8">
      {/* Title Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-border pb-6 gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-50 tracking-tight flex items-center gap-2.5">
            <Building2 className="w-8 h-8 text-accent" />
            <span>Pickup & Drop (Corporate) Leads CRM</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Manage B2B employee transport inquiries, status pipeline, sales call logs, and data exports.
          </p>
        </div>
        <button
          onClick={handleExport}
          className="flex items-center gap-1.5 bg-surface hover:bg-slate-800 text-slate-300 font-bold py-2.5 px-6 rounded-lg text-xs tracking-wider uppercase transition-all border border-border shadow-lg"
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
            statusFilter === "" ? "border-accent bg-accent/10" : "border-border hover:border-white/20"
          }`}
        >
          <div className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Total Leads</div>
          <div className="text-xl font-black text-slate-50 mt-1">{stats.total}</div>
        </div>

        <div 
          onClick={() => { setStatusFilter("NEW"); setCurrentPage(1); }}
          className={`glassmorphism p-3 rounded-xl border cursor-pointer transition-all ${
            statusFilter === "NEW" ? "border-yellow-400 bg-yellow-500/10" : "border-border hover:border-white/20"
          }`}
        >
          <div className="text-[10px] text-yellow-400 uppercase font-bold tracking-wider">NEW</div>
          <div className="text-xl font-black text-yellow-400 mt-1">{stats.NEW}</div>
        </div>

        <div 
          onClick={() => { setStatusFilter("CONTACTED"); setCurrentPage(1); }}
          className={`glassmorphism p-3 rounded-xl border cursor-pointer transition-all ${
            statusFilter === "CONTACTED" ? "border-blue-400 bg-blue-500/10" : "border-border hover:border-white/20"
          }`}
        >
          <div className="text-[10px] text-blue-400 uppercase font-bold tracking-wider">CONTACTED</div>
          <div className="text-xl font-black text-blue-400 mt-1">{stats.CONTACTED}</div>
        </div>

        <div 
          onClick={() => { setStatusFilter("QUALIFIED"); setCurrentPage(1); }}
          className={`glassmorphism p-3 rounded-xl border cursor-pointer transition-all ${
            statusFilter === "QUALIFIED" ? "border-emerald-400 bg-emerald-500/10" : "border-border hover:border-white/20"
          }`}
        >
          <div className="text-[10px] text-emerald-400 uppercase font-bold tracking-wider">QUALIFIED</div>
          <div className="text-xl font-black text-emerald-400 mt-1">{stats.QUALIFIED}</div>
        </div>

        <div 
          onClick={() => { setStatusFilter("NEGOTIATION"); setCurrentPage(1); }}
          className={`glassmorphism p-3 rounded-xl border cursor-pointer transition-all ${
            statusFilter === "NEGOTIATION" ? "border-purple-400 bg-purple-500/10" : "border-border hover:border-white/20"
          }`}
        >
          <div className="text-[10px] text-purple-400 uppercase font-bold tracking-wider">NEGOTIATION</div>
          <div className="text-xl font-black text-purple-400 mt-1">{stats.NEGOTIATION}</div>
        </div>

        <div 
          onClick={() => { setStatusFilter("CONVERTED"); setCurrentPage(1); }}
          className={`glassmorphism p-3 rounded-xl border cursor-pointer transition-all ${
            (statusFilter === "CONVERTED" || statusFilter === "WON") ? "border-green-400 bg-green-500/10" : "border-border hover:border-white/20"
          }`}
        >
          <div className="text-[10px] text-green-400 uppercase font-bold tracking-wider">CONVERTED</div>
          <div className="text-xl font-black text-green-400 mt-1">{stats.CONVERTED ?? (stats as any).WON ?? 0}</div>
        </div>

        <div 
          onClick={() => { setStatusFilter("DISPATCHED"); setCurrentPage(1); }}
          className={`glassmorphism p-3 rounded-xl border cursor-pointer transition-all ${
            statusFilter === "DISPATCHED" ? "border-purple-400 bg-purple-500/10" : "border-border hover:border-white/20"
          }`}
        >
          <div className="text-[10px] text-purple-400 uppercase font-bold tracking-wider">DISPATCHED</div>
          <div className="text-xl font-black text-purple-400 mt-1">{stats.DISPATCHED ?? 0}</div>
        </div>

        <div 
          onClick={() => { setStatusFilter("LOST"); setCurrentPage(1); }}
          className={`glassmorphism p-3 rounded-xl border cursor-pointer transition-all ${
            statusFilter === "LOST" ? "border-rose-400 bg-rose-500/10" : "border-border hover:border-white/20"
          }`}
        >
          <div className="text-[10px] text-rose-400 uppercase font-bold tracking-wider">LOST</div>
          <div className="text-xl font-black text-rose-400 mt-1">{stats.LOST}</div>
        </div>
      </div>

      {/* Filter & Control Toolbar */}
      <div className="glassmorphism p-6 rounded-xl border border-border flex flex-col md:flex-row gap-4 items-center justify-between">
        
        {/* Search */}
        <div className="relative w-full md:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search company, SPOC, phone..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
            className="w-full bg-background/60 border border-border rounded-lg py-2 pl-10 pr-4 text-xs text-slate-100 focus:outline-none focus:border-accent transition-all"
          />
        </div>

        {/* Filter Dropdowns */}
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          {/* Status filter */}
          <select
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1); }}
            className="bg-background/60 border border-border rounded-lg py-2 px-3 text-xs text-slate-100 focus:outline-none focus:border-accent"
          >
            <option value="" className="bg-surface">All Pipeline Statuses</option>
            <option value="NEW" className="bg-surface text-yellow-400">NEW</option>
            <option value="CONTACTED" className="bg-surface text-blue-400">CONTACTED</option>
            <option value="QUALIFIED" className="bg-surface text-emerald-400">QUALIFIED</option>
            <option value="NEGOTIATION" className="bg-surface text-purple-400">NEGOTIATION</option>
            <option value="CONVERTED" className="bg-surface text-green-400">CONVERTED</option>
            <option value="DISPATCHED" className="bg-surface text-purple-400">DISPATCHED</option>
            <option value="LOST" className="bg-surface text-rose-400">LOST</option>
            <option value="ARCHIVED" className="bg-surface text-slate-400">ARCHIVED</option>
          </select>

          {/* Sort By */}
          <select
            value={sortBy}
            onChange={(e) => { setSortBy(e.target.value); setCurrentPage(1); }}
            className="bg-background/60 border border-border rounded-lg py-2 px-3 text-xs text-slate-100 focus:outline-none focus:border-accent"
          >
            <option value="createdAt" className="bg-surface">Sort by Date</option>
            <option value="companyName" className="bg-surface">Sort by Company</option>
            <option value="employeeCount" className="bg-surface">Sort by Employees</option>
          </select>

          {/* Sort Order */}
          <button
            onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
            className="bg-background/60 border border-border rounded-lg py-2 px-3 text-xs font-semibold text-slate-300 hover:text-slate-100 transition-colors"
          >
            {sortOrder === "desc" ? "↓ Newest / High" : "↑ Oldest / Low"}
          </button>
        </div>

      </div>

      {/* Main Split: Leads table vs Detail Inspection */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Leads Table */}
        <div className="lg:col-span-7 glassmorphism rounded-xl border border-border overflow-hidden flex flex-col space-y-2 p-2 sm:p-0">
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
            <div className="flex flex-col items-center justify-center py-20 px-6 space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center">
                <Loader2 className="w-6 h-6 text-accent animate-spin" />
              </div>
              <div className="text-sm font-bold text-slate-200">Loading Pickup & Drop Leads...</div>
              <p className="text-xs text-slate-400">Fetching corporate route requests and employee transit pipelines</p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-surface border-b border-border text-slate-400 font-semibold uppercase tracking-wider">
                      <th className="p-4 w-10 text-center" onClick={(e) => e.stopPropagation()}>
                        <input
                          type="checkbox"
                          checked={leads.length > 0 && selectedIds.length === leads.length}
                          onChange={handleSelectAll}
                          className="w-4 h-4 rounded text-amber-500 bg-background border-white/20 focus:ring-0 cursor-pointer"
                        />
                      </th>
                      <th className="p-4 w-12 text-center">S. No.</th>
                      <th className="p-4">Company & Contact</th>
                      <th className="p-4">Staff</th>
                      <th className="p-4">Status</th>
                      <th className="p-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {leads.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="text-center py-16 text-slate-500 italic">
                          No corporate leads matching criteria found.
                        </td>
                      </tr>
                    ) : (
                      leads.map((lead, idx) => (
                        <tr 
                          key={lead.id} 
                          onClick={() => setActiveLead(lead)}
                          className={`hover:bg-white/5 cursor-pointer transition-colors ${
                            activeLead?.id === lead.id ? "bg-white/5" : ""
                          } ${selectedIds.includes(lead.id) ? "bg-amber-500/5" : ""}`}
                        >
                          <td className="p-4 text-center" onClick={(e) => e.stopPropagation()}>
                            <input
                              type="checkbox"
                              checked={selectedIds.includes(lead.id)}
                              onChange={() => handleSelectOne(lead.id)}
                              className="w-4 h-4 rounded text-amber-500 bg-background border-white/20 focus:ring-0 cursor-pointer"
                            />
                          </td>
                          <td className="p-4 text-center font-mono font-bold text-slate-400">
                            {(currentPage - 1) * pageSize + idx + 1}
                          </td>
                          <td className="p-4">
                            <div className="font-bold text-slate-200 text-sm">{lead.companyName}</div>
                            <div className="text-slate-400 mt-0.5">{lead.contactName} &bull; <span className="font-mono text-slate-500">{lead.phone}</span></div>
                            <div className="flex flex-wrap items-center gap-x-2 gap-y-1 mt-1 text-[11px]">
                              {extractPickupTime(lead) && (
                                <span className="inline-flex items-center gap-1 font-semibold text-amber-400 bg-amber-500/10 px-1.5 py-0.5 rounded border border-amber-500/20">
                                  <Clock className="w-3 h-3 text-amber-400" />
                                  <span>Pickup: {extractPickupTime(lead)}</span>
                                </span>
                              )}
                              {(extractPickupLocation(lead) || lead.pickupLocations) && (
                                <span className="text-slate-400 truncate max-w-[220px]" title={extractPickupLocation(lead) || lead.pickupLocations || ""}>
                                  📍 {extractPickupLocation(lead) || lead.pickupLocations}
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="p-4 font-mono font-bold text-slate-300">
                            {lead.employeeCount ? `${lead.employeeCount} pax` : "—"}
                          </td>
                          <td className="p-4">
                            <span className={`text-[9px] font-extrabold py-0.5 px-2 rounded-full border tracking-wide uppercase ${getStatusBadge(lead.status)}`}>
                              {lead.status}
                            </span>
                            {(() => {
                              const lastChange = parseLastLeadChange(lead);
                              if (lastChange.changedBy) {
                                return (
                                  <div className="text-[9px] text-slate-400 mt-1 font-sans">
                                    By <span className="text-amber-400 font-bold">{lastChange.changedBy}</span> ({lastChange.panel === "Master Admin Panel" ? "Master HQ" : "Admin"})
                                  </div>
                                );
                              }
                              return null;
                            })()}
                          </td>
                          <td className="p-4 text-right space-x-1" onClick={(e) => e.stopPropagation()}>
                            {(lead.status === "DISPATCHED" || Boolean((lead as any).bookingRef) || isLeadAlreadyDispatched(lead)) ? (
                              <>
                                <a
                                  href={buildWhatsAppShareUrl({
                                    customerName: lead.contactName || lead.companyName,
                                    customerPhone: lead.phone,
                                    bookingRef: (lead as any).bookingRef,
                                    bookingType: (lead as any).serviceType || (lead as any).tripType,
                                    tripType: (lead as any).serviceType || (lead as any).tripType,
                                    pickupDateTime: (lead as any).pickupDateTime || lead.createdAt,
                                    pickupLocation: extractPickupLocation(lead) || lead.pickupLocations,
                                    dropLocation: extractDropLocation(lead),
                                    vehicleModel: (lead as any).vehicleModel || (lead as any).assignedVehicle?.model,
                                    vehicleMake: (lead as any).vehicleMake || (lead as any).assignedVehicle?.make,
                                    vehicleRegistration: (lead as any).vehicleRegistration || (lead as any).assignedVehicle?.registrationNumber,
                                    driverName: (lead as any).driverName || (lead as any).assignedDriver?.name,
                                    driverPhone: (lead as any).driverPhone || (lead as any).assignedDriver?.phone,
                                    notes: lead.notes,
                                  })}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  title="Share Ride Confirmation on WhatsApp"
                                  className="inline-flex items-center justify-center p-1.5 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20 rounded-lg text-[10px] font-bold transition-all cursor-pointer"
                                >
                                  <Share2 className="w-3.5 h-3.5" />
                                </a>
                                <Link
                                  href="/admin/bookings-dispatch"
                                  title="Ride already dispatched — View in Dispatch CRM"
                                  className="inline-flex items-center gap-1 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20 font-bold px-2.5 py-1.5 rounded-lg text-[10px] uppercase tracking-wider transition-all shadow-sm cursor-pointer"
                                >
                                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                                  <span>Dispatched</span>
                                </Link>
                              </>
                            ) : (
                              <button
                                onClick={() => setDispatchLead({
                                  ...lead,
                                  customerName: lead.contactName || lead.companyName || "Customer Lead",
                                  pickupLocation: extractPickupLocation(lead),
                                  dropLocation: extractDropLocation(lead),
                                })}
                                title="Dispatch Fleet & Chauffeur"
                                className="inline-flex items-center gap-1 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black px-2.5 py-1.5 rounded-lg text-[10px] uppercase tracking-wider transition-all shadow-sm cursor-pointer"
                              >
                                <Truck className="w-3.5 h-3.5" />
                                <span>Dispatch</span>
                              </button>
                            )}
                            <button
                              onClick={() => handleStatusChange(lead.id, "ARCHIVED")}
                              title="Archive Lead"
                              className="inline-flex p-1.5 bg-surface border border-border rounded-lg text-slate-400 hover:text-accent transition-colors"
                            >
                              <Archive className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDelete(lead.id)}
                              title="Delete Lead"
                              className="inline-flex p-1.5 bg-surface border border-border rounded-lg text-slate-400 hover:text-red-400 transition-colors"
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
              <div className="p-4 bg-surface/60 border-t border-border flex items-center justify-between text-xs text-slate-400">
                <div>
                  Showing <span className="font-bold text-slate-200">{totalCount > 0 ? (currentPage - 1) * pageSize + 1 : 0}</span> to <span className="font-bold text-slate-200">{Math.min(currentPage * pageSize, totalCount)}</span> of <span className="font-bold text-slate-200">{totalCount}</span> entries
                </div>

                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-1">
                    <span>Rows per page:</span>
                    <select
                      value={pageSize}
                      onChange={(e) => { setPageSize(Number(e.target.value)); setCurrentPage(1); }}
                      className="bg-background border border-border rounded px-2 py-1 text-slate-200 focus:outline-none"
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
                      className="p-1 bg-background border border-border rounded text-slate-300 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-slate-800"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <span className="px-2 font-mono font-bold text-slate-200">{currentPage} / {totalPages}</span>
                    <button
                      disabled={currentPage >= totalPages}
                      onClick={() => setCurrentPage(currentPage + 1)}
                      className="p-1 bg-background border border-border rounded text-slate-300 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-slate-800"
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
            <div className="bg-surface border border-border p-6 rounded-2xl space-y-6 glassmorphism">
              
              {/* Header */}
              <div className="flex justify-between items-start border-b border-border pb-4">
                <div>
                  <span className="text-[9px] font-extrabold text-accent uppercase tracking-widest block font-mono">Corporate Lead Inspection</span>
                  <h3 className="text-xl font-extrabold text-slate-50 mt-0.5">{activeLead.companyName}</h3>
                  <p className="text-[11px] text-slate-400 mt-0.5">Created: {new Date(activeLead.createdAt).toLocaleString("en-IN")}</p>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <span className={`text-[10px] font-extrabold py-1 px-3 rounded-full border uppercase ${getStatusBadge(activeLead.status)}`}>
                    {activeLead.status}
                  </span>
                  {(activeLead.status === "DISPATCHED" || Boolean((activeLead as any).bookingRef) || isLeadAlreadyDispatched(activeLead)) ? (
                    <div className="flex flex-col items-end gap-1.5">
                      <a
                        href={buildWhatsAppShareUrl({
                          customerName: activeLead.contactName || activeLead.companyName,
                          customerPhone: activeLead.phone,
                          bookingRef: (activeLead as any).bookingRef,
                          bookingType: (activeLead as any).serviceType || (activeLead as any).tripType,
                          tripType: (activeLead as any).serviceType || (activeLead as any).tripType,
                          pickupDateTime: (activeLead as any).pickupDateTime || activeLead.createdAt,
                          pickupLocation: extractPickupLocation(activeLead) || activeLead.pickupLocations,
                          dropLocation: extractDropLocation(activeLead),
                          vehicleModel: (activeLead as any).vehicleModel || (activeLead as any).assignedVehicle?.model,
                          vehicleMake: (activeLead as any).vehicleMake || (activeLead as any).assignedVehicle?.make,
                          vehicleRegistration: (activeLead as any).vehicleRegistration || (activeLead as any).assignedVehicle?.registrationNumber,
                          driverName: (activeLead as any).driverName || (activeLead as any).assignedDriver?.name,
                          driverPhone: (activeLead as any).driverPhone || (activeLead as any).assignedDriver?.phone,
                          notes: activeLead.notes,
                        })}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-3 py-1.5 rounded-lg text-xs uppercase tracking-wider transition-all shadow-sm cursor-pointer"
                        title="Share Ride Confirmation on WhatsApp"
                      >
                        <Share2 className="w-3.5 h-3.5" />
                        <span>Share On WhatsApp</span>
                      </a>
                      <Link
                        href="/admin/bookings-dispatch"
                        className="flex items-center gap-1.5 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20 font-bold px-3 py-1.5 rounded-lg text-xs uppercase tracking-wider transition-all shadow-sm cursor-pointer"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                        <span>View Dispatched Booking</span>
                      </Link>
                    </div>
                  ) : (
                    <button
                      onClick={() => setDispatchLead({
                        ...activeLead,
                        customerName: activeLead.contactName || activeLead.companyName,
                        tripType: activeLead.serviceType,
                        pickupLocation: extractPickupLocation(activeLead),
                        dropLocation: extractDropLocation(activeLead),
                      })}
                      className="flex items-center gap-1 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black px-3 py-1.5 rounded-lg text-xs uppercase tracking-wider shadow-md shadow-amber-500/20 cursor-pointer"
                    >
                      <Truck className="w-3.5 h-3.5" />
                      <span>Dispatch Ride</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Status Update Pipeline Selector */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Update Pipeline Status</label>
                <div className="grid grid-cols-4 gap-1.5">
                  {(["NEW", "CONTACTED", "QUALIFIED", "NEGOTIATION", "CONVERTED", "DISPATCHED", "LOST", "ARCHIVED"] as LeadStatus[]).map((st) => (
                    <button
                      key={st}
                      type="button"
                      disabled={updatingStatus !== null}
                      onClick={() => handleStatusChange(activeLead.id, st)}
                      className={`py-1.5 px-2 rounded-lg text-[10px] font-extrabold tracking-wider border transition-all flex items-center justify-center gap-1 ${
                        activeLead.status === st
                          ? "bg-accent text-slate-950 border-accent font-black shadow-md"
                          : "bg-background/60 text-slate-400 border-border hover:border-white/20 hover:text-slate-200"
                      } disabled:opacity-60 disabled:cursor-not-allowed`}
                    >
                      {updatingStatus === st && <Loader2 className="w-2.5 h-2.5 animate-spin" />}
                      <span>{st}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Last Changed By Audit Indicator */}
              {(() => {
                const lastChange = parseLastLeadChange(activeLead);
                if (lastChange.changedBy) {
                  return (
                    <div className="bg-amber-500/10 border border-amber-500/20 p-2.5 rounded-xl text-xs space-y-0.5">
                      <div className="text-[10px] text-amber-400 font-bold uppercase tracking-wider">Last Status Update</div>
                      <div className="text-slate-200 text-[11px]">
                        Changed by <strong className="text-amber-300">{lastChange.changedBy}</strong> ({lastChange.panel})
                        {lastChange.timestamp && <span className="text-slate-400"> on {lastChange.timestamp}</span>}
                      </div>
                    </div>
                  );
                }
                return null;
              })()}

              {/* Details Specs */}
              <div className="space-y-3 border-t border-border pt-4 text-xs text-slate-300">
                <div className="flex justify-between items-center bg-background/40 p-2.5 rounded-lg border border-border">
                  <span className="text-slate-400">Company Name:</span>
                  <span className="font-bold text-slate-100">{activeLead.companyName}</span>
                </div>
                <div className="flex justify-between items-center bg-background/40 p-2.5 rounded-lg border border-border">
                  <span className="text-slate-400">Contact SPOC:</span>
                  <span className="font-bold text-slate-100">{activeLead.contactName}</span>
                </div>
                <div className="flex justify-between items-center bg-background/40 p-2.5 rounded-lg border border-border">
                  <span className="text-slate-400">Email:</span>
                  <span className="font-mono font-bold text-accent">{activeLead.email}</span>
                </div>
                <div className="flex justify-between items-center bg-background/40 p-2.5 rounded-lg border border-border">
                  <span className="text-slate-400">Phone:</span>
                  <span className="font-mono font-bold text-slate-100">{activeLead.phone}</span>
                </div>
                <div className="flex justify-between items-center bg-background/40 p-2.5 rounded-lg border border-border">
                  <span className="text-slate-400 font-bold uppercase text-[10px]">Booking / Trip Type:</span>
                  <select
                    value={activeLead.serviceType || "Pickup & Drop"}
                    onChange={(e) => handleServiceTypeChange(activeLead.id, e.target.value)}
                    className="bg-surface border border-amber-500/40 rounded-lg px-2.5 py-1 text-xs font-bold text-amber-400 focus:outline-none focus:border-amber-400 cursor-pointer font-sans"
                  >
                    <option value="Pickup & Drop" className="bg-slate-900 text-slate-100">Pickup & Drop</option>
                    <option value="Point to Point" className="bg-slate-900 text-slate-100">Point to Point</option>
                    <option value="Local Rental" className="bg-slate-900 text-slate-100">Local Rental</option>
                    <option value="Outstation" className="bg-slate-900 text-slate-100">Outstation</option>
                  </select>
                </div>

                {extractPickupTime(activeLead) && (
                  <div className="flex justify-between items-center bg-background/40 p-2.5 rounded-lg border border-border">
                    <span className="text-slate-400 flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-amber-400" />
                      <span>Pickup Time:</span>
                    </span>
                    <span className="font-bold font-mono text-amber-400 text-xs px-2 py-0.5 rounded bg-amber-500/10 border border-amber-500/20">
                      {extractPickupTime(activeLead)}
                    </span>
                  </div>
                )}

                {(activeLead.pickupLocations || extractPickupLocation(activeLead)) && (
                  <div className="bg-background/40 p-3 rounded-lg border border-border space-y-1">
                    <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Pickup / Transit Locations</div>
                    <div className="text-slate-200 leading-relaxed">{extractPickupLocation(activeLead) || activeLead.pickupLocations}</div>
                  </div>
                )}

                {extractDropLocation(activeLead) && (
                  <div className="bg-background/40 p-3 rounded-lg border border-border space-y-1">
                    <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Drop Location</div>
                    <div className="text-slate-200 leading-relaxed">{extractDropLocation(activeLead)}</div>
                  </div>
                )}

                {activeLead.requirements && (
                  <div className="bg-background/40 p-3 rounded-lg border border-border space-y-1">
                    <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Fleet / Service Requirements</div>
                    <div className="text-slate-200 leading-relaxed">{activeLead.requirements}</div>
                  </div>
                )}
              </div>

              {/* Follow up Call Logs */}
              <div className="space-y-3 border-t border-border pt-4">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                  <MessageSquare className="w-3.5 h-3.5 text-accent" />
                  <span>Sales Follow-up Log History</span>
                </label>

                {/* Log entries history */}
                {activeLead.notes ? (
                  <div className="bg-background/80 p-3 rounded-lg border border-border text-xs font-mono text-slate-300 max-h-36 overflow-y-auto whitespace-pre-wrap leading-relaxed space-y-1 scrollbar-thin">
                    {activeLead.notes}
                  </div>
                ) : (
                  <div className="text-[11px] text-slate-500 italic">No sales follow-up notes logged yet.</div>
                )}

                {/* Add new entry */}
                <div className="space-y-2">
                  <textarea
                    rows={3}
                    value={newNoteInput}
                    onChange={(e) => setNewNoteInput(e.target.value)}
                    placeholder="Type new call log entry or notes..."
                    className="w-full bg-background border border-border rounded-lg p-2.5 text-xs text-slate-100 focus:outline-none focus:border-accent resize-none"
                  />
                  <button
                    type="button"
                    disabled={isLoggingNote || !newNoteInput.trim()}
                    onClick={() => handleAddNoteLog(activeLead.id)}
                    className="w-full bg-primary hover:bg-blue-600 disabled:opacity-60 disabled:cursor-not-allowed text-white font-bold py-2 rounded-lg text-xs tracking-wider uppercase transition-all shadow-md flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    {isLoggingNote ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin text-white" />
                        <span>Logging Note...</span>
                      </>
                    ) : (
                      "Log Follow-up Note"
                    )}
                  </button>
                </div>
              </div>

            </div>
          ) : (
            <div className="bg-surface/40 border border-border p-12 rounded-2xl text-center text-slate-500 text-xs italic space-y-2">
              <AlertCircle className="w-8 h-8 mx-auto text-slate-600 animate-pulse" />
              <p>Select a corporate lead from the table to inspect details, log notes, and update pipeline status.</p>
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
          onSuccess={(dispatchedBooking: any) => {
            loadLeads(false);
            if (activeLead && dispatchLead && activeLead.id === dispatchLead.id) {
              setActiveLead((prev: any) => prev ? {
                ...prev,
                status: "DISPATCHED",
                bookingRef: dispatchedBooking?.bookingNumber,
                vehicleModel: dispatchedBooking?.vehicle?.model,
                vehicleRegistration: dispatchedBooking?.vehicle?.registrationNumber,
                driverName: dispatchedBooking?.vehicle?.driver?.name,
                driverPhone: dispatchedBooking?.vehicle?.driver?.phone,
              } : null);
            }
          }}
        />
      )}
    </div>
  );
}

