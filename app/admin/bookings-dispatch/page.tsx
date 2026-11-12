"use client";

import React, { useState, useEffect } from "react";
import { 
  CalendarRange, 
  Search, 
  Download, 
  Car, 
  User, 
  Clock, 
  MapPin, 
  CreditCard,
  CheckCircle,
  X,
  AlertCircle,
  Truck,
  FileText,
  IndianRupee,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  MessageSquare,
  ArrowRight,
  UserCheck,
  Trash2,
  Loader2,
  Share2
} from "lucide-react";
import Portal from "@/components/shared/portal";
import { buildWhatsAppShareUrl } from "@/lib/whatsapp-share";

export type BookingStatus = 
  | "PENDING" 
  | "CONFIRMED" 
  | "DRIVER_ASSIGNED" 
  | "VEHICLE_ASSIGNED" 
  | "IN_PROGRESS" 
  | "IN_TRANSIT" 
  | "COMPLETED" 
  | "CANCELLED";

interface Customer {
  name: string;
  phone: string;
  email: string;
}

interface VehicleCategory {
  id: string;
  name: string;
  slug?: string;
}

interface Driver {
  name: string;
  phone: string;
}

interface Vehicle {
  id: string;
  registrationNumber: string;
  model: string;
  driver?: Driver | null;
}

interface Payment {
  id: string;
  status: string;
  gateway: string;
  amount: string;
  razorpayOrderId?: string;
}

interface Booking {
  id: string;
  bookingNumber: string;
  type: string;
  status: BookingStatus;
  pickupDateTime: string;
  pickupLocation: string;
  dropLocation?: string | null;
  totalAmount: string;
  taxAmount: string;
  netAmount: string;
  notes?: string | null;
  outstationType?: string | null;
  returnDateTime?: string | null;
  rentalDurationHrs?: number | null;
  rentalDurationKms?: number | null;
  customer: Customer;
  vehicleCategory: VehicleCategory;
  vehicle?: Vehicle | null;
  payments: Payment[];
  createdAt: string;
}

interface Stats {
  total: number;
  PENDING: number;
  CONFIRMED: number;
  DRIVER_ASSIGNED: number;
  VEHICLE_ASSIGNED: number;
  IN_PROGRESS: number;
  COMPLETED: number;
  CANCELLED: number;
}

export default function BookingDispatchPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [drivers, setDrivers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [paymentFilter, setPaymentFilter] = useState("");
  const [sortBy, setSortBy] = useState("createdAt");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [stats, setStats] = useState<Stats>({
    total: 0,
    PENDING: 0,
    CONFIRMED: 0,
    DRIVER_ASSIGNED: 0,
    VEHICLE_ASSIGNED: 0,
    IN_PROGRESS: 0,
    COMPLETED: 0,
    CANCELLED: 0,
  });

  // Modals & Active Inspector state
  const [activeBooking, setActiveBooking] = useState<Booking | null>(null);
  const [assignModalOpen, setAssignModalOpen] = useState(false);
  const [selectedVehicleId, setSelectedVehicleId] = useState("");
  const [selectedDriverId, setSelectedDriverId] = useState("");
  const [newNoteInput, setNewNoteInput] = useState("");
  const [isAssigning, setIsAssigning] = useState(false);
  const [isLoggingNote, setIsLoggingNote] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState<string | null>(null);

  const loadData = async () => {
    setLoading(true);
    try {
      const queryParams = new URLSearchParams({
        search,
        status: statusFilter,
        paymentStatus: paymentFilter,
        sortBy,
        sortOrder,
        page: currentPage.toString(),
        limit: pageSize.toString(),
      });

      let combinedBookings: Booking[] = [];
      const res = await fetch(`/api/bookings?${queryParams.toString()}`);
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data)) {
          combinedBookings = data;
        } else if (data.bookings) {
          combinedBookings = data.bookings;
          if (data.stats) setStats(data.stats);
        }
      }

      // Removed localStorage merge for bookings

      setBookings(combinedBookings);
      setTotalCount(combinedBookings.length);
      setTotalPages(Math.ceil(combinedBookings.length / pageSize) || 1);

      // Fetch vehicles to use for dispatch assignments
      let localVehicles: any[] = [];

      const vehiclesRes = await fetch("/api/fleet?minimal=true");
      let apiList: any[] = [];
      if (vehiclesRes.ok) {
        const fleetData = await vehiclesRes.json();
        apiList = Array.isArray(fleetData) ? fleetData : (fleetData.vehicles || []);
      }

      const vMap = new Map();
      localVehicles.forEach(v => vMap.set(v.id || v.registrationNumber, v));
      apiList.forEach(v => {
        if (!vMap.has(v.id || v.registrationNumber)) {
          vMap.set(v.id || v.registrationNumber, v);
        }
      });
      setVehicles(Array.from(vMap.values()));

      // Fetch drivers for separate driver assignment
      const driversRes = await fetch("/api/admin/drivers");
      if (driversRes.ok) {
        const driversData = await driversRes.json();
        setDrivers(Array.isArray(driversData) ? driversData : []);
      }
    } catch (err) {
      console.error("Failed to load bookings dispatch:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [search, statusFilter, paymentFilter, sortBy, sortOrder, currentPage, pageSize]);

  const handleStatusChange = async (id: string, newStatus: BookingStatus) => {
    setUpdatingStatus(newStatus);
    // 1. Update local storage dispatched bookings
    try {
      const stored = localStorage.getItem("user_uploaded_dispatched_bookings");
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          const updatedLocal = parsed.map((b: any) => (b.id === id || b.bookingNumber === id) ? { ...b, status: newStatus } : b);
          localStorage.setItem("user_uploaded_dispatched_bookings", JSON.stringify(updatedLocal));
        }
      }
    } catch (e) {
      console.error(e);
    }

    setBookings(prev => prev.map(b => (b.id === id || b.bookingNumber === id) ? { ...b, status: newStatus } : b));
    if (activeBooking && (activeBooking.id === id || activeBooking.bookingNumber === id)) {
      setActiveBooking(prev => prev ? { ...prev, status: newStatus } : null);
    }

    try {
      const target = bookings.find((b) => b.id === id || b.bookingNumber === id);
      await fetch(`/api/bookings/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: newStatus,
          notes: target?.notes || "",
        }),
      });
    } catch (err) {
      console.error("Failed to update booking status on backend:", err);
    } finally {
      setUpdatingStatus(null);
    }
  };

  const handleAssignVehicle = async () => {
    if (!activeBooking || isAssigning) return;
    setIsAssigning(true);
    const selectedVeh = vehicles.find(v => v.id === selectedVehicleId);
    const selectedDrv = drivers.find(d => d.id === selectedDriverId);

    const targetDriver = selectedDrv 
      ? { id: selectedDrv.id, name: selectedDrv.name, phone: selectedDrv.phone } 
      : (selectedVeh?.driver ? { id: selectedVeh.driver.id, name: selectedVeh.driver.name, phone: selectedVeh.driver.phone } : null);
    
    // Update local storage
    try {
      const stored = localStorage.getItem("user_uploaded_dispatched_bookings");
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          const updatedLocal = parsed.map((b: any) => {
            if (b.id === activeBooking.id || b.bookingNumber === activeBooking.bookingNumber) {
              return {
                ...b,
                status: (selectedVeh && targetDriver ? "VEHICLE_ASSIGNED" : (targetDriver ? "DRIVER_ASSIGNED" : "CONFIRMED")) as BookingStatus,
                driver: targetDriver,
                vehicle: selectedVeh ? {
                  id: selectedVeh.id,
                  model: `${selectedVeh.make || ""} ${selectedVeh.model || ""}`.trim(),
                  registrationNumber: selectedVeh.registrationNumber,
                  driver: targetDriver
                } : (targetDriver ? {
                  id: "",
                  model: "Commercial Fleet",
                  registrationNumber: "Pending Vehicle",
                  driver: targetDriver
                } : b.vehicle)
              };
            }
            return b;
          });
          localStorage.setItem("user_uploaded_dispatched_bookings", JSON.stringify(updatedLocal));
        }
      }
    } catch (e) {
      console.error(e);
    }

    try {
      const res = await fetch(`/api/bookings/${activeBooking.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          vehicleId: selectedVehicleId || null,
          driverId: selectedDriverId || null,
          status: selectedVeh ? "VEHICLE_ASSIGNED" : (selectedDrv ? "DRIVER_ASSIGNED" : "CONFIRMED"),
          notes: activeBooking.notes || "",
        }),
      });

      if (res.ok) {
        const updated = await res.json();
        setBookings(bookings.map((b) => (b.id === activeBooking.id ? updated : b)));
        setActiveBooking(updated);
      }
    } catch (err) {
      console.error("Failed to assign vehicle:", err);
    } finally {
      setIsAssigning(false);
      setAssignModalOpen(false);
      loadData();
    }
  };

  const handleAddNoteLog = async (id: string) => {
    if (!newNoteInput.trim() || isLoggingNote) return;
    setIsLoggingNote(true);

    try {
      const target = bookings.find((b) => b.id === id);
      const timestamp = new Date().toLocaleString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });

      const entry = `[${timestamp}] ${newNoteInput.trim()}`;
      const existingNotes = target?.notes ? `${target.notes}\n${entry}` : entry;

      const res = await fetch(`/api/bookings/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: target?.status || "PENDING",
          notes: existingNotes,
        }),
      });

      if (res.ok) {
        const updated = await res.json();
        setBookings(bookings.map((b) => (b.id === id ? updated : b)));
        setActiveBooking(updated);
        setNewNoteInput("");
      }
    } catch (err) {
      console.error("Failed to save note:", err);
    } finally {
      setIsLoggingNote(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this booking record?")) return;
    const targetBooking = bookings.find((b) => b.id === id);
    const bookingNum = targetBooking?.bookingNumber;

    try {
      const local = localStorage.getItem("user_uploaded_crm_leads");
      if (local) {
        const parsed = JSON.parse(local);
        if (Array.isArray(parsed)) {
          const next = parsed.filter((l: any) => l.id !== id && l.bookingRef !== id && (bookingNum ? l.bookingRef !== bookingNum : true));
          localStorage.setItem("user_uploaded_crm_leads", JSON.stringify(next));
          window.dispatchEvent(new Event("crm_leads_updated"));
        }
      }
    } catch (e) {
      console.error(e);
    }

    try {
      const res = await fetch(`/api/bookings/${id}`, { method: "DELETE" });
      if (res.ok) {
        setBookings(bookings.filter((b) => b.id !== id));
        if (activeBooking && activeBooking.id === id) {
          setActiveBooking(null);
        }
        loadData();
      }
    } catch (e) {
      console.error("Failed to delete booking:", e);
    }
  };

  const handleExport = () => {
    const query = new URLSearchParams({
      search,
      status: statusFilter,
      paymentStatus: paymentFilter,
    }).toString();
    window.open(`/api/bookings/export?${query}`, "_blank");
  };

  const openBookingInspector = (booking: Booking) => {
    setActiveBooking(booking);
    setSelectedVehicleId(booking.vehicle?.id || "");
    const dId = (booking as any).driver?.id || (booking.vehicle as any)?.driver?.id || "";
    setSelectedDriverId(dId);
    setNewNoteInput("");
  };

  const getStatusBadge = (status: BookingStatus) => {
    switch (status) {
      case "PENDING":
        return "bg-yellow-500/10 text-yellow-400 border-yellow-500/20";
      case "CONFIRMED":
        return "bg-blue-500/10 text-blue-400 border-blue-500/20";
      case "DRIVER_ASSIGNED":
      case "VEHICLE_ASSIGNED":
        return "bg-purple-500/10 text-purple-400 border-purple-500/20 font-bold";
      case "IN_PROGRESS":
      case "IN_TRANSIT":
        return "bg-amber-500/20 text-amber-300 border-amber-500/40 animate-pulse font-extrabold";
      case "COMPLETED":
        return "bg-emerald-500/20 text-emerald-300 border-emerald-500/40 font-black";
      case "CANCELLED":
        return "bg-rose-500/10 text-rose-400 border-rose-500/20";
      default:
        return "bg-slate-500/10 text-slate-400 border-slate-500/20";
    }
  };

  const getStepIndex = (status: BookingStatus) => {
    switch (status) {
      case "PENDING": return 1;
      case "CONFIRMED": return 2;
      case "DRIVER_ASSIGNED":
      case "VEHICLE_ASSIGNED": return 3;
      case "IN_PROGRESS":
      case "IN_TRANSIT": return 4;
      case "COMPLETED": return 5;
      case "CANCELLED": return 0;
      default: return 1;
    }
  };

  return (
    <div className="bg-background min-h-screen text-slate-100 p-8 space-y-8">
      
      {/* Title Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-border pb-6 gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-50 tracking-tight flex items-center gap-2.5">
            <Truck className="w-8 h-8 text-accent" />
            <span>Booking & Fleet Dispatch CRM</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Dispatch fleet vehicles, assign drivers, track booking timelines, and monitor Razorpay payment statuses.
          </p>
        </div>
        <button
          onClick={handleExport}
          className="flex items-center gap-1.5 bg-surface hover:bg-slate-800 text-slate-300 font-bold py-2.5 px-6 rounded-lg text-xs tracking-wider uppercase transition-all border border-border shadow-lg"
        >
          <Download className="w-4 h-4 text-accent" />
          <span>Export Dispatch Report</span>
        </button>
      </div>

      {/* Stats Lifecycle Pipeline Counters */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
        <div 
          onClick={() => { setStatusFilter(""); setCurrentPage(1); }}
          className={`glassmorphism p-3 rounded-xl border cursor-pointer transition-all ${
            statusFilter === "" ? "border-accent bg-accent/10" : "border-border hover:border-white/20"
          }`}
        >
          <div className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Total Dispatches</div>
          {loading ? (
            <div className="h-6 w-12 bg-white/10 rounded animate-pulse mt-1" />
          ) : (
            <div className="text-xl font-black text-slate-50 mt-1">{stats.total}</div>
          )}
        </div>

        <div 
          onClick={() => { setStatusFilter("PENDING"); setCurrentPage(1); }}
          className={`glassmorphism p-3 rounded-xl border cursor-pointer transition-all ${
            statusFilter === "PENDING" ? "border-yellow-400 bg-yellow-500/10" : "border-border hover:border-white/20"
          }`}
        >
          <div className="text-[10px] text-yellow-400 uppercase font-bold tracking-wider">PENDING</div>
          {loading ? (
            <div className="h-6 w-10 bg-yellow-400/20 rounded animate-pulse mt-1" />
          ) : (
            <div className="text-xl font-black text-yellow-400 mt-1">{stats.PENDING}</div>
          )}
        </div>

        <div 
          onClick={() => { setStatusFilter("CONFIRMED"); setCurrentPage(1); }}
          className={`glassmorphism p-3 rounded-xl border cursor-pointer transition-all ${
            statusFilter === "CONFIRMED" ? "border-blue-400 bg-blue-500/10" : "border-border hover:border-white/20"
          }`}
        >
          <div className="text-[10px] text-blue-400 uppercase font-bold tracking-wider">CONFIRMED</div>
          {loading ? (
            <div className="h-6 w-10 bg-blue-400/20 rounded animate-pulse mt-1" />
          ) : (
            <div className="text-xl font-black text-blue-400 mt-1">{stats.CONFIRMED}</div>
          )}
        </div>

        <div 
          onClick={() => { setStatusFilter("VEHICLE_ASSIGNED"); setCurrentPage(1); }}
          className={`glassmorphism p-3 rounded-xl border cursor-pointer transition-all ${
            statusFilter === "VEHICLE_ASSIGNED" || statusFilter === "DRIVER_ASSIGNED" ? "border-purple-400 bg-purple-500/10" : "border-border hover:border-white/20"
          }`}
        >
          <div className="text-[10px] text-purple-400 uppercase font-bold tracking-wider">ASSIGNED</div>
          {loading ? (
            <div className="h-6 w-10 bg-purple-400/20 rounded animate-pulse mt-1" />
          ) : (
            <div className="text-xl font-black text-purple-400 mt-1">{stats.VEHICLE_ASSIGNED + stats.DRIVER_ASSIGNED}</div>
          )}
        </div>

        <div 
          onClick={() => { setStatusFilter("IN_PROGRESS"); setCurrentPage(1); }}
          className={`glassmorphism p-3 rounded-xl border cursor-pointer transition-all ${
            statusFilter === "IN_PROGRESS" ? "border-amber-400 bg-amber-500/10" : "border-border hover:border-white/20"
          }`}
        >
          <div className="text-[10px] text-amber-400 uppercase font-bold tracking-wider">IN PROGRESS</div>
          {loading ? (
            <div className="h-6 w-10 bg-amber-400/20 rounded animate-pulse mt-1" />
          ) : (
            <div className="text-xl font-black text-amber-400 mt-1">{stats.IN_PROGRESS}</div>
          )}
        </div>

        <div 
          onClick={() => { setStatusFilter("COMPLETED"); setCurrentPage(1); }}
          className={`glassmorphism p-3 rounded-xl border cursor-pointer transition-all ${
            statusFilter === "COMPLETED" ? "border-emerald-400 bg-emerald-500/10" : "border-border hover:border-white/20"
          }`}
        >
          <div className="text-[10px] text-emerald-400 uppercase font-bold tracking-wider">COMPLETED</div>
          {loading ? (
            <div className="h-6 w-10 bg-emerald-400/20 rounded animate-pulse mt-1" />
          ) : (
            <div className="text-xl font-black text-emerald-400 mt-1">{stats.COMPLETED}</div>
          )}
        </div>

        <div 
          onClick={() => { setStatusFilter("CANCELLED"); setCurrentPage(1); }}
          className={`glassmorphism p-3 rounded-xl border cursor-pointer transition-all ${
            statusFilter === "CANCELLED" ? "border-rose-400 bg-rose-500/10" : "border-border hover:border-white/20"
          }`}
        >
          <div className="text-[10px] text-rose-400 uppercase font-bold tracking-wider">CANCELLED</div>
          {loading ? (
            <div className="h-6 w-10 bg-rose-400/20 rounded animate-pulse mt-1" />
          ) : (
            <div className="text-xl font-black text-rose-400 mt-1">{stats.CANCELLED}</div>
          )}
        </div>
      </div>

      {/* Filter & Control Toolbar */}
      <div className="glassmorphism p-6 rounded-xl border border-border flex flex-col md:flex-row gap-4 items-center justify-between">
        
        {/* Search */}
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search PNR, customer, driver, reg..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
            className="w-full bg-background/60 border border-border rounded-lg py-2 pl-10 pr-4 text-xs text-slate-100 focus:outline-none focus:border-accent transition-all"
          />
        </div>

        {/* Filter Dropdowns */}
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          
          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1); }}
            className="bg-background/60 border border-border rounded-lg py-2 px-3 text-xs text-slate-100 focus:outline-none focus:border-accent"
          >
            <option value="" className="bg-surface">All Dispatch Statuses</option>
            <option value="PENDING" className="bg-surface text-yellow-400">PENDING</option>
            <option value="CONFIRMED" className="bg-surface text-blue-400">CONFIRMED</option>
            <option value="VEHICLE_ASSIGNED" className="bg-surface text-purple-400">ASSIGNED (DRIVER/VEHICLE)</option>
            <option value="IN_PROGRESS" className="bg-surface text-amber-400">IN PROGRESS</option>
            <option value="COMPLETED" className="bg-surface text-emerald-400">COMPLETED</option>
            <option value="CANCELLED" className="bg-surface text-rose-400">CANCELLED</option>
          </select>

          {/* Payment Filter */}
          <select
            value={paymentFilter}
            onChange={(e) => { setPaymentFilter(e.target.value); setCurrentPage(1); }}
            className="bg-background/60 border border-border rounded-lg py-2 px-3 text-xs text-slate-100 focus:outline-none focus:border-accent"
          >
            <option value="" className="bg-surface">All Payment Statuses</option>
            <option value="SUCCESS" className="bg-surface text-emerald-400">PAID (SUCCESS)</option>
            <option value="PENDING" className="bg-surface text-yellow-400">PAYMENT PENDING</option>
            <option value="REFUNDED" className="bg-surface text-slate-400">REFUNDED</option>
          </select>

          {/* Sort By */}
          <select
            value={sortBy}
            onChange={(e) => { setSortBy(e.target.value); setCurrentPage(1); }}
            className="bg-background/60 border border-border rounded-lg py-2 px-3 text-xs text-slate-100 focus:outline-none focus:border-accent"
          >
            <option value="createdAt" className="bg-surface">Sort by Date</option>
            <option value="pickupDateTime" className="bg-surface">Sort by Pickup Date</option>
            <option value="netAmount" className="bg-surface">Sort by Net Amount</option>
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

      {/* Main Content: Full-Width Centered Loading State OR Split Table & Inspector Layout */}
      {loading ? (
        <div className="w-full glassmorphism rounded-2xl border border-border p-12 sm:p-16 flex flex-col items-center justify-center min-h-[460px] space-y-6 text-center shadow-xl">
          {/* Symmetrical Concentric Glowing & Spinning Ring around Fleet Badge */}
          <div className="relative flex items-center justify-center w-20 h-20">
            <div className="absolute inset-0 rounded-full border-2 border-amber-500/20 border-t-amber-400 animate-spin" />
            <div className="w-14 h-14 rounded-full bg-amber-500/10 border border-amber-500/30 flex items-center justify-center shadow-lg shadow-amber-500/15">
              <Truck className="w-7 h-7 text-accent animate-pulse" />
            </div>
          </div>

          <div className="space-y-1.5 max-w-md">
            <div className="text-base font-bold text-slate-100 flex items-center justify-center gap-2">
              <span>Loading Booking & Fleet Dispatch CRM</span>
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Synchronizing active dispatches, fleet allocations, driver rosters, and payment statuses...
            </p>
          </div>

          {/* Shimmering Table Row Skeletons Centered */}
          <div className="w-full max-w-lg space-y-3 pt-2">
            <div className="h-11 bg-white/5 border border-white/5 rounded-xl animate-pulse" />
            <div className="h-11 bg-white/5 border border-white/5 rounded-xl animate-pulse delay-75" />
            <div className="h-11 bg-white/5 border border-white/5 rounded-xl animate-pulse delay-150" />
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Bookings Table */}
          <div className="lg:col-span-7 glassmorphism rounded-xl border border-border overflow-hidden flex flex-col">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-surface border-b border-border text-slate-400 font-semibold uppercase tracking-wider">
                    <th className="p-4">PNR & Customer</th>
                    <th className="p-4">Vehicle & Driver</th>
                    <th className="p-4">Amount & Status</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {bookings.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="text-center py-16 text-slate-500 italic">
                        No dispatch bookings matching selected criteria found.
                      </td>
                    </tr>
                  ) : (
                      bookings.map((booking) => {
                        const isPaid = booking.payments?.some((p) => p.status === "SUCCESS");
                        return (
                          <tr 
                            key={booking.id} 
                            onClick={() => openBookingInspector(booking)}
                            className={`hover:bg-white/5 cursor-pointer transition-colors ${
                              activeBooking?.id === booking.id ? "bg-white/5" : ""
                            }`}
                          >
                            <td className="p-4">
                              <div className="font-mono font-bold text-accent text-sm">{booking.bookingNumber}</div>
                              <div className="font-bold text-slate-200 mt-0.5">{booking.customer?.name}</div>
                              <div className="text-[10px] text-slate-400 font-mono">{booking.customer?.phone}</div>
                            </td>
                            <td className="p-4">
                              <div className="font-bold text-slate-200">{booking.vehicleCategory?.name}</div>
                              {booking.vehicle ? (
                                <div className="text-[10px] text-emerald-400 font-mono font-semibold flex items-center gap-1 mt-0.5">
                                  <Car className="w-3 h-3" />
                                  <span>{booking.vehicle.registrationNumber}</span>
                                  {booking.vehicle.driver && (
                                    <span className="text-slate-400">({booking.vehicle.driver.name})</span>
                                  )}
                                </div>
                              ) : (
                                <span className="text-[10px] text-yellow-500/80 font-mono italic block mt-0.5">Unassigned</span>
                              )}
                            </td>
                            <td className="p-4">
                              <div className="font-mono font-black text-slate-100 text-sm">₹{Number(booking.netAmount).toLocaleString("en-IN")}</div>
                              <div className="flex items-center gap-1.5 mt-1">
                                <span className={`text-[9px] font-extrabold py-0.5 px-2 rounded-full border uppercase ${getStatusBadge(booking.status)}`}>
                                  {booking.status}
                                </span>
                                <span className={`text-[8px] font-extrabold px-1.5 py-0.5 rounded border uppercase ${
                                  isPaid ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" : "bg-yellow-500/10 text-yellow-400 border-yellow-500/20"
                                }`}>
                                  {isPaid ? "PAID" : "UNPAID"}
                                </span>
                              </div>
                            </td>
                            <td className="p-4 text-right space-x-1" onClick={(e) => e.stopPropagation()}>
                              <a
                                href={buildWhatsAppShareUrl({
                                  customerName: booking.customer?.name,
                                  customerPhone: booking.customer?.phone,
                                  bookingRef: booking.bookingNumber,
                                  bookingType: (booking as any).tripType || booking.type,
                                  tripType: (booking as any).tripType || booking.type,
                                  pickupDateTime: booking.pickupDateTime,
                                  pickupLocation: booking.pickupLocation,
                                  dropLocation: booking.dropLocation,
                                  vehicleModel: booking.vehicle?.model,
                                  vehicleRegistration: booking.vehicle?.registrationNumber,
                                  driverName: booking.vehicle?.driver?.name || (booking as any).driver?.name,
                                  driverPhone: booking.vehicle?.driver?.phone || (booking as any).driver?.phone,
                                  notes: booking.notes,
                                })}
                                target="_blank"
                                rel="noopener noreferrer"
                                title="Share Ride Confirmation on WhatsApp"
                                className="inline-flex p-1.5 bg-emerald-500/10 border border-emerald-500/30 rounded-lg text-emerald-400 hover:bg-emerald-500/20 hover:text-emerald-300 transition-colors"
                              >
                                <Share2 className="w-4 h-4" />
                              </a>
                              <button
                                onClick={() => {
                                  openBookingInspector(booking);
                                  setAssignModalOpen(true);
                                }}
                                title="Assign Vehicle & Driver"
                                className="inline-flex p-1.5 bg-surface border border-border rounded-lg text-slate-400 hover:text-accent transition-colors"
                              >
                                <UserCheck className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleDelete(booking.id)}
                                title="Delete Dispatch Booking"
                                className="inline-flex p-1.5 bg-surface border border-border rounded-lg text-slate-400 hover:text-red-400 transition-colors"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>

              {/* Pagination Bar */}
              <div className="p-4 bg-surface/60 border-t border-border flex items-center justify-between text-xs text-slate-400">
                <div>
                  Showing <span className="font-bold text-slate-200">{totalCount > 0 ? (currentPage - 1) * pageSize + 1 : 0}</span> to <span className="font-bold text-slate-200">{Math.min(currentPage * pageSize, totalCount)}</span> of <span className="font-bold text-slate-200">{totalCount}</span> dispatches
                </div>

                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-1">
                    <span>Per page:</span>
                    <select
                      value={pageSize}
                      onChange={(e) => { setPageSize(parseInt(e.target.value)); setCurrentPage(1); }}
                      className="bg-background border border-border rounded px-2 py-1 text-slate-200"
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
            </div>

        {/* Dispatch & Lifecycle Inspection Dashboard Panel */}
        <div className="lg:col-span-5">
          {activeBooking ? (
            <div className="bg-surface border border-border p-6 rounded-2xl space-y-6 glassmorphism">
              
              {/* Header */}
              <div className="flex justify-between items-start border-b border-border pb-4">
                <div>
                  <span className="text-[9px] font-extrabold text-accent uppercase tracking-widest block font-mono">{activeBooking.bookingNumber}</span>
                  <h3 className="text-xl font-extrabold text-slate-50 mt-0.5">{activeBooking.customer?.name}</h3>
                  <p className="text-[11px] text-slate-400 mt-0.5">Pickup: {new Date(activeBooking.pickupDateTime).toLocaleString("en-IN")}</p>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <span className={`text-[10px] font-extrabold py-1 px-3 rounded-full border uppercase ${getStatusBadge(activeBooking.status)}`}>
                    {activeBooking.status}
                  </span>
                  <button
                    onClick={() => handleDelete(activeBooking.id)}
                    title="Delete Dispatch Booking"
                    className="inline-flex items-center gap-1 text-[11px] text-red-400 hover:text-red-300 transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Delete</span>
                  </button>
                </div>
              </div>

              {/* 1-Click WhatsApp Share Action */}
              <a
                href={buildWhatsAppShareUrl({
                  customerName: activeBooking.customer?.name,
                  customerPhone: activeBooking.customer?.phone,
                  bookingRef: activeBooking.bookingNumber,
                  bookingType: (activeBooking as any).tripType || activeBooking.type,
                  tripType: (activeBooking as any).tripType || activeBooking.type,
                  pickupDateTime: activeBooking.pickupDateTime,
                  pickupLocation: activeBooking.pickupLocation,
                  dropLocation: activeBooking.dropLocation,
                  vehicleModel: activeBooking.vehicle?.model,
                  vehicleRegistration: activeBooking.vehicle?.registrationNumber,
                  driverName: activeBooking.vehicle?.driver?.name || (activeBooking as any).driver?.name,
                  driverPhone: activeBooking.vehicle?.driver?.phone || (activeBooking as any).driver?.phone,
                  notes: activeBooking.notes,
                })}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white font-black py-2.5 px-4 rounded-xl text-xs uppercase tracking-wider shadow-lg shadow-emerald-600/20 transition-all cursor-pointer"
              >
                <Share2 className="w-4 h-4" />
                <span>Share Ride Confirmation on WhatsApp</span>
              </a>

              {/* Visual Booking Lifecycle Timeline */}
              <div className="space-y-2 border-b border-border pb-5">
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-accent" />
                  <span>Dispatch Lifecycle Timeline</span>
                </div>
                <div className="grid grid-cols-5 gap-1 pt-1">
                  {[
                    { title: "Created", step: 1 },
                    { title: "Confirmed", step: 2 },
                    { title: "Assigned", step: 3 },
                    { title: "In Progress", step: 4 },
                    { title: "Completed", step: 5 },
                  ].map((s) => {
                    const activeStep = getStepIndex(activeBooking.status);
                    const isDone = activeStep >= s.step;
                    const isCurrent = activeStep === s.step;
                    return (
                      <div key={s.step} className="text-center space-y-1">
                        <div className={`h-1.5 rounded-full transition-all ${
                          isDone ? "bg-emerald-400 shadow-sm" : "bg-slate-800"
                        }`} />
                        <span className={`text-[8px] font-extrabold uppercase tracking-tight block ${
                          isCurrent ? "text-accent font-black" : isDone ? "text-slate-300" : "text-slate-600"
                        }`}>
                          {s.title}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Status Update Pipeline Selector */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Update Dispatch Status</label>
                <div className="grid grid-cols-3 gap-1.5">
                  {(["PENDING", "CONFIRMED", "VEHICLE_ASSIGNED", "IN_PROGRESS", "COMPLETED", "CANCELLED"] as BookingStatus[]).map((st) => (
                    <button
                      key={st}
                      type="button"
                      disabled={updatingStatus !== null}
                      onClick={() => handleStatusChange(activeBooking.id, st)}
                      className={`py-1.5 px-2 rounded-lg text-[10px] font-extrabold tracking-wider border transition-all flex items-center justify-center gap-1 ${
                        activeBooking.status === st
                          ? "bg-accent text-slate-950 border-accent font-black shadow-md"
                          : "bg-background/60 text-slate-400 border-border hover:border-white/20 hover:text-slate-200"
                      }`}
                    >
                      {updatingStatus === st ? <Loader2 className="w-3 h-3 animate-spin" /> : null}
                      <span>{st === "VEHICLE_ASSIGNED" ? "ASSIGNED" : st}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Driver & Vehicle Assignment Card */}
              <div className="bg-background/60 p-4 rounded-xl border border-border space-y-3">
                <div className="flex justify-between items-center">
                  <div className="text-[10px] font-extrabold text-accent uppercase tracking-wider flex items-center gap-1.5">
                    <Car className="w-4 h-4" />
                    <span>Assigned Vehicle & Driver</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setAssignModalOpen(true)}
                    className="text-[10px] font-bold text-slate-300 hover:text-white bg-surface border border-border px-2.5 py-1 rounded transition-colors"
                  >
                    Change Assignment
                  </button>
                </div>

                {activeBooking.vehicle ? (
                  <div className="space-y-1 text-xs">
                    <div className="font-bold text-slate-100 text-sm flex items-center gap-2">
                      <span>{activeBooking.vehicle.model}</span>
                      <span className="font-mono text-emerald-400 text-xs px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20">
                        {activeBooking.vehicle.registrationNumber}
                      </span>
                    </div>
                    {activeBooking.vehicle.driver || (activeBooking as any).driver ? (
                      <div className="text-slate-300 flex items-center gap-1.5 pt-1">
                        <User className="w-3.5 h-3.5 text-accent" />
                        <span>Driver: <strong className="text-slate-100">{activeBooking.vehicle.driver?.name || (activeBooking as any).driver?.name}</strong> ({activeBooking.vehicle.driver?.phone || (activeBooking as any).driver?.phone})</span>
                      </div>
                    ) : (
                      <div className="text-amber-400 text-[11px] italic">No driver assigned to this ride yet.</div>
                    )}
                  </div>
                ) : (activeBooking as any).driver ? (
                  <div className="space-y-1 text-xs">
                    <div className="text-yellow-400/90 text-xs italic">Pending vehicle allocation</div>
                    <div className="text-slate-300 flex items-center gap-1.5 pt-1">
                      <User className="w-3.5 h-3.5 text-accent" />
                      <span>Assigned Driver: <strong className="text-slate-100">{(activeBooking as any).driver.name}</strong> ({(activeBooking as any).driver.phone})</span>
                    </div>
                  </div>
                ) : (
                  <div className="text-yellow-400/90 text-xs italic">
                    No vehicle assigned yet. Click &quot;Change Assignment&quot; to pick from fleet.
                  </div>
                )}
              </div>

              {/* Financial & Payment Breakdown */}
              <div className="space-y-2 border-t border-border pt-4 text-xs text-slate-300">
                <div className="flex justify-between items-center bg-background/40 p-2.5 rounded-lg border border-border">
                  <span className="text-slate-400">Pickup Location:</span>
                  <span className="font-medium text-slate-100">{activeBooking.pickupLocation}</span>
                </div>
                {activeBooking.dropLocation && (
                  <div className="flex justify-between items-center bg-background/40 p-2.5 rounded-lg border border-border">
                    <span className="text-slate-400">Drop Location:</span>
                    <span className="font-medium text-slate-100">{activeBooking.dropLocation}</span>
                  </div>
                )}
                <div className="flex justify-between items-center bg-background/40 p-2.5 rounded-lg border border-border">
                  <span className="text-slate-400">Net Amount / Tariff:</span>
                  <span className="font-mono font-black text-accent text-sm">₹{Number(activeBooking.netAmount).toLocaleString("en-IN")}</span>
                </div>

                {/* Razorpay transaction badge */}
                {activeBooking.payments && activeBooking.payments.length > 0 && (
                  <div className="bg-background/40 p-3 rounded-lg border border-border space-y-1 font-mono text-[11px]">
                    <div className="text-[10px] text-slate-400 font-bold uppercase font-sans tracking-wider">Razorpay Payment Transaction</div>
                    <div className="flex justify-between text-slate-300">
                      <span>Order ID:</span>
                      <span className="text-slate-100 font-bold">{activeBooking.payments[0].razorpayOrderId}</span>
                    </div>
                    <div className="flex justify-between text-slate-300">
                      <span>Gateway Status:</span>
                      <span className="text-emerald-400 font-extrabold uppercase">{activeBooking.payments[0].status}</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Dispatch Trip Notes & History Log */}
              <div className="space-y-3 border-t border-border pt-4">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                  <MessageSquare className="w-3.5 h-3.5 text-accent" />
                  <span>Dispatch Notes & Trip Log</span>
                </label>

                {activeBooking.notes ? (
                  <div className="bg-background/80 p-3 rounded-lg border border-border text-xs font-mono text-slate-300 max-h-36 overflow-y-auto whitespace-pre-wrap leading-relaxed space-y-1 scrollbar-thin">
                    {activeBooking.notes}
                  </div>
                ) : (
                  <div className="text-[11px] text-slate-500 italic">No dispatch trip notes logged yet.</div>
                )}

                <div className="space-y-2">
                  <textarea
                    rows={3}
                    value={newNoteInput}
                    onChange={(e) => setNewNoteInput(e.target.value)}
                    placeholder="Type dispatch comment or trip log entry..."
                    className="w-full bg-background border border-border rounded-lg p-2.5 text-xs text-slate-100 focus:outline-none focus:border-accent resize-none"
                  />
                  <button
                    type="button"
                    disabled={isLoggingNote || !newNoteInput.trim()}
                    onClick={() => handleAddNoteLog(activeBooking.id)}
                    className="w-full bg-primary hover:bg-blue-600 disabled:opacity-60 disabled:cursor-not-allowed text-white font-bold py-2 rounded-lg text-xs tracking-wider uppercase transition-all shadow-md flex items-center justify-center gap-1.5"
                  >
                    {isLoggingNote ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        <span>Logging Note...</span>
                      </>
                    ) : (
                      <span>Log Dispatch Note</span>
                    )}
                  </button>
                </div>
              </div>

            </div>
          ) : (
            <div className="bg-surface/40 border border-border p-12 rounded-2xl text-center text-slate-500 text-xs italic space-y-2">
              <AlertCircle className="w-8 h-8 mx-auto text-slate-600 animate-pulse" />
              <p>Select a dispatch booking from the table to assign fleet vehicles, inspect timelines, and manage trip notes.</p>
            </div>
          )}
        </div>

      </div>
      )}

      {/* Driver & Vehicle Assignment Modal */}
      {assignModalOpen && activeBooking && (
        <Portal>
          <div className="fixed inset-0 bg-black/85 backdrop-blur-md z-[99999] flex items-center justify-center p-4">
            <div className="bg-surface border border-border rounded-2xl max-w-md w-full p-6 space-y-6 shadow-2xl">
              <div className="flex justify-between items-center border-b border-border pb-4">
                <div>
                  <h3 className="text-lg font-bold text-slate-50">Assign Fleet Vehicle & Driver</h3>
                  <p className="text-xs text-slate-400 font-mono mt-0.5">{activeBooking.bookingNumber}</p>
                </div>
                <button
                  onClick={() => setAssignModalOpen(false)}
                  className="text-slate-400 hover:text-white p-1"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-300 flex items-center justify-between">
                    <span>1. Select Fleet Vehicle</span>
                    <span className="text-[10px] text-slate-400">Independent Selection</span>
                  </label>
                  <select
                    value={selectedVehicleId}
                    onChange={(e) => {
                      const newVehId = e.target.value;
                      setSelectedVehicleId(newVehId);
                      // If no driver currently chosen, optionally suggest the car's default driver
                      if (!selectedDriverId && newVehId) {
                        const veh = vehicles.find(v => v.id === newVehId);
                        if (veh?.driver?.id) {
                          setSelectedDriverId(veh.driver.id);
                        }
                      }
                    }}
                    className="w-full bg-background border border-border rounded-lg p-3 text-xs text-slate-100 focus:outline-none focus:border-accent font-mono cursor-pointer"
                  >
                    <option value="">Unassign / No Vehicle</option>
                    {vehicles.map((v) => (
                      <option key={v.id} value={v.id} className="bg-surface">
                        {v.model} &bull; {v.registrationNumber} {v.driver ? `[Default Driver: ${v.driver.name}]` : "(No Default Driver)"}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-300 flex items-center justify-between">
                    <span>2. Select Chauffeur / Driver</span>
                    <span className="text-[10px] text-amber-400 font-medium">Independent of Vehicle</span>
                  </label>
                  <select
                    value={selectedDriverId}
                    onChange={(e) => setSelectedDriverId(e.target.value)}
                    className="w-full bg-background border border-border rounded-lg p-3 text-xs text-slate-100 focus:outline-none focus:border-accent font-mono cursor-pointer"
                  >
                    <option value="">Unassign / No Driver</option>
                    {drivers.map((d) => {
                      const isCarDefault = selectedVehicleId && vehicles.find(v => v.id === selectedVehicleId)?.driver?.id === d.id;
                      return (
                        <option key={d.id} value={d.id} className="bg-surface">
                          {d.name} &bull; {d.phone} {isCarDefault ? "★ [Default for Selected Car]" : ""}
                        </option>
                      );
                    })}
                  </select>
                  <p className="text-[10px] text-slate-400 leading-relaxed">
                    💡 <strong>Independent Driver Allocation:</strong> If the vehicle&apos;s regular driver is on holiday, leave, or unavailable, you can freely select any active driver from the list.
                  </p>
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setAssignModalOpen(false)}
                  className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold py-2.5 rounded-lg text-xs tracking-wider uppercase transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={isAssigning}
                  onClick={handleAssignVehicle}
                  className="flex-1 bg-accent hover:bg-yellow-500 disabled:opacity-60 disabled:cursor-not-allowed text-slate-950 font-black py-2.5 rounded-lg text-xs tracking-wider uppercase transition-colors shadow-lg flex items-center justify-center gap-1.5"
                >
                  {isAssigning ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin text-slate-950" />
                      <span>Saving Assignment...</span>
                    </>
                  ) : (
                    <span>Confirm Assignment</span>
                  )}
                </button>
              </div>
            </div>
          </div>
        </Portal>
      )}

    </div>
  );
}

