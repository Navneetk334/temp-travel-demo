"use client";

import React, { useState, useEffect } from "react";
import { 
  Plus, 
  Trash2, 
  Edit, 
  Save, 
  X, 
  Car, 
  Users, 
  ShieldCheck, 
  AlertTriangle,
  Clock,
  Compass,
  Search,
  ChevronLeft,
  ChevronRight,
  Fuel,
  Settings,
  DollarSign,
  UserCheck,
  Image as ImageIcon
} from "lucide-react";

export type VehicleStatus = "AVAILABLE" | "ON_TRIP" | "MAINTENANCE" | "INACTIVE";

interface Vehicle {
  id: string;
  model: string;
  make: string;
  registrationNumber: string;
  subCategory?: string | null;
  capacity: number;
  fuelType?: string | null;
  transmission?: string | null;
  imageUrl?: string | null;
  perKmRate?: number | string | null;
  baseDailyRate?: number | string | null;
  extraKmRate?: number | string | null;
  extraHrRate?: number | string | null;
  status: VehicleStatus;
  categoryId: string;
  category?: {
    id: string;
    name: string;
  } | null;
  driverId?: string | null;
  driver?: {
    id: string;
    name: string;
    phone: string;
  } | null;
}

interface Category {
  id: string;
  name: string;
}

interface Driver {
  id: string;
  name: string;
  phone: string;
  email: string;
}

interface Stats {
  total: number;
  AVAILABLE: number;
  ON_TRIP: number;
  MAINTENANCE: number;
  INACTIVE: number;
}

export default function AdminFleetPage() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState<Vehicle | null>(null);

  // Filters & Pagination State
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [fuelTypeFilter, setFuelTypeFilter] = useState("");
  const [transmissionFilter, setTransmissionFilter] = useState("");
  const [sortBy, setSortBy] = useState("createdAt");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [stats, setStats] = useState<Stats>({
    total: 0,
    AVAILABLE: 0,
    ON_TRIP: 0,
    MAINTENANCE: 0,
    INACTIVE: 0,
  });

  // Form State
  const [formData, setFormData] = useState({
    model: "",
    make: "",
    registrationNumber: "",
    subCategory: "Executive",
    capacity: 4,
    fuelType: "DIESEL",
    transmission: "MANUAL",
    imageUrl: "",
    perKmRate: "",
    baseDailyRate: "",
    extraKmRate: "",
    extraHourRate: "",
    status: "AVAILABLE" as VehicleStatus,
    categoryId: "",
    driverId: "",
  });

  const [formError, setFormError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const loadData = async () => {
    setLoading(true);
    try {
      const queryParams = new URLSearchParams({
        search,
        categoryId: categoryFilter,
        status: statusFilter,
        fuelType: fuelTypeFilter,
        transmission: transmissionFilter,
        sortBy,
        sortOrder,
        page: currentPage.toString(),
        limit: pageSize.toString(),
      });

      const [vehiclesRes, catsRes, driversRes] = await Promise.all([
        fetch(`/api/fleet?${queryParams.toString()}`),
        fetch("/api/fleet/categories"),
        fetch("/api/admin/drivers")
      ]);

      if (vehiclesRes.ok && catsRes.ok) {
        const vData = await vehiclesRes.json();
        const cData = await catsRes.json();
        const dData = driversRes.ok ? await driversRes.json() : [];

        if (Array.isArray(vData)) {
          setVehicles(vData);
          setTotalCount(vData.length);
          setTotalPages(1);
        } else {
          setVehicles(vData.vehicles || []);
          setTotalCount(vData.pagination?.totalCount || 0);
          setTotalPages(vData.pagination?.totalPages || 1);
          if (vData.stats) {
            setStats(vData.stats);
          }
        }

        const loadedCats = Array.isArray(cData) ? cData : (cData.categories || []);
        setCategories(loadedCats);
        setDrivers(dData);

        if (loadedCats.length > 0 && !formData.categoryId) {
          setFormData(prev => ({ ...prev, categoryId: loadedCats[0].id }));
        }
      }
    } catch (err) {
      console.error("Failed to load admin fleet data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [search, categoryFilter, statusFilter, fuelTypeFilter, transmissionFilter, sortBy, sortOrder, currentPage, pageSize]);

  const openModal = (vehicle: Vehicle | null = null) => {
    setFormError("");
    if (vehicle) {
      setEditingVehicle(vehicle);
      setFormData({
        model: vehicle.model,
        make: vehicle.make,
        registrationNumber: vehicle.registrationNumber,
        subCategory: vehicle.subCategory || "Executive",
        capacity: vehicle.capacity,
        fuelType: vehicle.fuelType || "DIESEL",
        transmission: vehicle.transmission || "MANUAL",
        imageUrl: vehicle.imageUrl || "",
        perKmRate: vehicle.perKmRate ? String(vehicle.perKmRate) : "",
        baseDailyRate: vehicle.baseDailyRate ? String(vehicle.baseDailyRate) : "",
        extraKmRate: vehicle.extraKmRate ? String(vehicle.extraKmRate) : "",
        extraHourRate: vehicle.extraHrRate ? String(vehicle.extraHrRate) : "",
        status: vehicle.status,
        categoryId: vehicle.categoryId || (categories[0]?.id || ""),
        driverId: vehicle.driverId || "",
      });
    } else {
      setEditingVehicle(null);
      const defaultCatId = categories.length > 0 ? categories[0].id : "";
      setFormData({
        model: "",
        make: "",
        registrationNumber: "",
        subCategory: "Compact",
        capacity: 4,
        fuelType: "DIESEL",
        transmission: "MANUAL",
        imageUrl: "",
        perKmRate: "",
        baseDailyRate: "",
        extraKmRate: "",
        extraHourRate: "",
        status: "AVAILABLE",
        categoryId: defaultCatId,
        driverId: "",
      });
    }
    setIsModalOpen(true);
  };

  const handleSaveVehicle = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");
    setIsSubmitting(true);

    try {
      const payload: any = {
        model: formData.model,
        make: formData.make,
        registrationNumber: formData.registrationNumber,
        subCategory: formData.subCategory,
        capacity: Number(formData.capacity),
        fuelType: formData.fuelType,
        transmission: formData.transmission,
        status: formData.status,
        categoryId: formData.categoryId,
        driverId: formData.driverId || null,
      };

      if (formData.imageUrl.trim()) payload.imageUrl = formData.imageUrl.trim();
      if (formData.perKmRate) payload.perKmRate = Number(formData.perKmRate);
      if (formData.baseDailyRate) payload.baseDailyRate = Number(formData.baseDailyRate);
      if (formData.extraKmRate) payload.extraKmRate = Number(formData.extraKmRate);
      if (formData.extraHourRate) payload.extraHrRate = Number(formData.extraHourRate);

      const url = editingVehicle ? `/api/fleet/${editingVehicle.id}` : "/api/fleet";
      const method = editingVehicle ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        if (data.error && typeof data.error === "object") {
          setFormError(JSON.stringify(data.error));
        } else {
          setFormError(data.error || "Failed to save vehicle");
        }
        return;
      }

      setIsModalOpen(false);
      loadData();
    } catch (err) {
      console.error("Save vehicle error:", err);
      setFormError("Server connection error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this vehicle from fleet?")) return;
    try {
      const res = await fetch(`/api/fleet/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) {
        alert(data.error || "Failed to delete vehicle");
        return;
      }
      loadData();
    } catch (e) {
      console.error("Failed to delete vehicle:", e);
    }
  };

  const getStatusBadge = (status: VehicleStatus) => {
    switch (status) {
      case "AVAILABLE":
        return "bg-emerald-500/10 text-emerald-400 border-emerald-500/20 font-bold";
      case "ON_TRIP":
        return "bg-blue-500/20 text-blue-300 border-blue-500/40 animate-pulse font-extrabold";
      case "MAINTENANCE":
        return "bg-yellow-500/10 text-yellow-400 border-yellow-500/20 font-bold";
      case "INACTIVE":
        return "bg-rose-500/10 text-rose-400 border-rose-500/20";
      default:
        return "bg-slate-500/10 text-slate-400 border-slate-500/20";
    }
  };

  return (
    <div className="bg-slate-950 min-h-screen text-slate-100 p-8 space-y-8">
      
      {/* Title Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-white/5 pb-6 gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-50 tracking-tight flex items-center gap-2.5">
            <Car className="w-8 h-8 text-accent" />
            <span>Fleet Management & Vehicle Operations</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Manage commercial fleet vehicles, seating capacities, fuel types, transmission specs, driver allocations, and maintenance statuses.
          </p>
        </div>
        <button
          onClick={() => openModal()}
          className="flex items-center gap-1.5 bg-accent hover:bg-yellow-500 text-slate-950 font-extrabold py-2.5 px-6 rounded-lg text-xs tracking-wider uppercase transition-all shadow-lg"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Vehicle</span>
        </button>
      </div>

      {/* Fleet Status Counters Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <div 
          onClick={() => { setStatusFilter(""); setCurrentPage(1); }}
          className={`glassmorphism p-3 rounded-xl border cursor-pointer transition-all ${
            statusFilter === "" ? "border-accent bg-accent/10" : "border-white/5 hover:border-white/20"
          }`}
        >
          <div className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Total Fleet Vehicles</div>
          <div className="text-xl font-black text-slate-50 mt-1">{stats.total}</div>
        </div>

        <div 
          onClick={() => { setStatusFilter("AVAILABLE"); setCurrentPage(1); }}
          className={`glassmorphism p-3 rounded-xl border cursor-pointer transition-all ${
            statusFilter === "AVAILABLE" ? "border-emerald-400 bg-emerald-500/10" : "border-white/5 hover:border-white/20"
          }`}
        >
          <div className="text-[10px] text-emerald-400 uppercase font-bold tracking-wider">AVAILABLE</div>
          <div className="text-xl font-black text-emerald-400 mt-1">{stats.AVAILABLE}</div>
        </div>

        <div 
          onClick={() => { setStatusFilter("ON_TRIP"); setCurrentPage(1); }}
          className={`glassmorphism p-3 rounded-xl border cursor-pointer transition-all ${
            statusFilter === "ON_TRIP" ? "border-blue-400 bg-blue-500/10" : "border-white/5 hover:border-white/20"
          }`}
        >
          <div className="text-[10px] text-blue-400 uppercase font-bold tracking-wider">ON TRIP</div>
          <div className="text-xl font-black text-blue-400 mt-1">{stats.ON_TRIP}</div>
        </div>

        <div 
          onClick={() => { setStatusFilter("MAINTENANCE"); setCurrentPage(1); }}
          className={`glassmorphism p-3 rounded-xl border cursor-pointer transition-all ${
            statusFilter === "MAINTENANCE" ? "border-yellow-400 bg-yellow-500/10" : "border-white/5 hover:border-white/20"
          }`}
        >
          <div className="text-[10px] text-yellow-400 uppercase font-bold tracking-wider">MAINTENANCE</div>
          <div className="text-xl font-black text-yellow-400 mt-1">{stats.MAINTENANCE}</div>
        </div>

        <div 
          onClick={() => { setStatusFilter("INACTIVE"); setCurrentPage(1); }}
          className={`glassmorphism p-3 rounded-xl border cursor-pointer transition-all ${
            statusFilter === "INACTIVE" ? "border-rose-400 bg-rose-500/10" : "border-white/5 hover:border-white/20"
          }`}
        >
          <div className="text-[10px] text-rose-400 uppercase font-bold tracking-wider">INACTIVE</div>
          <div className="text-xl font-black text-rose-400 mt-1">{stats.INACTIVE}</div>
        </div>
      </div>

      {/* Filter & Control Toolbar */}
      <div className="glassmorphism p-6 rounded-xl border border-white/5 flex flex-col md:flex-row gap-4 items-center justify-between">
        
        {/* Search */}
        <div className="relative w-full md:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search model, make, reg number..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
            className="w-full bg-slate-950/60 border border-white/10 rounded-lg py-2 pl-10 pr-4 text-xs text-slate-100 focus:outline-none focus:border-accent transition-all"
          />
        </div>

        {/* Filter Dropdowns */}
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          {/* Category Filter */}
          <select
            value={categoryFilter}
            onChange={(e) => { setCategoryFilter(e.target.value); setCurrentPage(1); }}
            className="bg-slate-950/60 border border-white/10 rounded-lg py-2 px-3 text-xs text-slate-100 focus:outline-none focus:border-accent"
          >
            <option value="" className="bg-slate-900">All Vehicle Categories</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id} className="bg-slate-900">{c.name}</option>
            ))}
          </select>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1); }}
            className="bg-slate-950/60 border border-white/10 rounded-lg py-2 px-3 text-xs text-slate-100 focus:outline-none focus:border-accent"
          >
            <option value="" className="bg-slate-900">All Statuses</option>
            <option value="AVAILABLE" className="bg-slate-900 text-emerald-400">AVAILABLE</option>
            <option value="ON_TRIP" className="bg-slate-900 text-blue-400">ON TRIP</option>
            <option value="MAINTENANCE" className="bg-slate-900 text-yellow-400">MAINTENANCE</option>
            <option value="INACTIVE" className="bg-slate-900 text-rose-400">INACTIVE</option>
          </select>

          {/* Fuel Type */}
          <select
            value={fuelTypeFilter}
            onChange={(e) => { setFuelTypeFilter(e.target.value); setCurrentPage(1); }}
            className="bg-slate-950/60 border border-white/10 rounded-lg py-2 px-3 text-xs text-slate-100 focus:outline-none focus:border-accent"
          >
            <option value="" className="bg-slate-900">All Fuel Types</option>
            <option value="DIESEL" className="bg-slate-900">Diesel</option>
            <option value="PETROL" className="bg-slate-900">Petrol</option>
            <option value="ELECTRIC" className="bg-slate-900">Electric</option>
            <option value="CNG" className="bg-slate-900">CNG</option>
            <option value="HYBRID" className="bg-slate-900">Hybrid</option>
          </select>

          {/* Transmission */}
          <select
            value={transmissionFilter}
            onChange={(e) => { setTransmissionFilter(e.target.value); setCurrentPage(1); }}
            className="bg-slate-950/60 border border-white/10 rounded-lg py-2 px-3 text-xs text-slate-100 focus:outline-none focus:border-accent"
          >
            <option value="" className="bg-slate-900">All Transmissions</option>
            <option value="MANUAL" className="bg-slate-900">Manual</option>
            <option value="AUTOMATIC" className="bg-slate-900">Automatic</option>
          </select>
        </div>

      </div>

      {/* Fleet Vehicles Table Grid */}
      <div className="glassmorphism rounded-xl border border-white/5 overflow-hidden flex flex-col">
        {loading ? (
          <div className="text-center py-16 text-slate-400 text-xs">Loading fleet vehicle database...</div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-900 border-b border-white/5 text-slate-400 font-semibold uppercase tracking-wider">
                    <th className="p-4">Vehicle Model & Registration</th>
                    <th className="p-4">Category & Capacity</th>
                    <th className="p-4">Fuel & Gearbox</th>
                    <th className="p-4">Assigned Driver</th>
                    <th className="p-4">Status</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {vehicles.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="text-center py-16 text-slate-500 italic">
                        No fleet vehicles matching selected criteria found.
                      </td>
                    </tr>
                  ) : (
                    vehicles.map((v) => (
                      <tr key={v.id} className="hover:bg-white/5 transition-colors">
                        <td className="p-4">
                          <div className="font-bold text-slate-100 text-sm flex items-center gap-2">
                            <span>{v.make} {v.model}</span>
                            <span className="font-mono text-emerald-400 text-xs px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20 font-extrabold">
                              {v.registrationNumber}
                            </span>
                          </div>
                          {v.perKmRate && (
                            <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                              Tariff: ₹{Number(v.perKmRate)}/km &bull; Daily: ₹{Number(v.baseDailyRate || 0)}
                            </div>
                          )}
                        </td>
                        <td className="p-4">
                          <div className="font-bold text-slate-200 flex items-center gap-1.5">
                            <span>{v.category?.name || "Standard"}</span>
                            {v.subCategory && (
                              <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20">
                                {v.subCategory}
                              </span>
                            )}
                          </div>
                          <div className="text-slate-400 mt-0.5">{v.capacity} Passenger Seats</div>
                        </td>
                        <td className="p-4">
                          <div className="text-slate-200 font-bold flex items-center gap-1">
                            <Fuel className="w-3 h-3 text-accent" />
                            <span>{v.fuelType || "DIESEL"}</span>
                          </div>
                          <div className="text-[10px] text-slate-400 mt-0.5 font-mono">{v.transmission || "MANUAL"}</div>
                        </td>
                        <td className="p-4">
                          {v.driver ? (
                            <div className="text-slate-200 font-bold flex items-center gap-1">
                              <UserCheck className="w-3.5 h-3.5 text-accent" />
                              <span>{v.driver.name}</span>
                              <span className="text-[10px] font-mono text-slate-400">({v.driver.phone})</span>
                            </div>
                          ) : (
                            <span className="text-slate-500 italic text-[11px]">Unassigned</span>
                          )}
                        </td>
                        <td className="p-4">
                          <span className={`text-[9px] font-extrabold py-0.5 px-2 rounded-full border uppercase ${getStatusBadge(v.status)}`}>
                            {v.status}
                          </span>
                        </td>
                        <td className="p-4 text-right space-x-2">
                          <button
                            onClick={() => openModal(v)}
                            className="p-1.5 bg-slate-900 border border-white/5 rounded-lg text-slate-400 hover:text-accent transition-colors"
                            title="Edit Vehicle Specs"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(v.id)}
                            className="p-1.5 bg-slate-900 border border-white/5 rounded-lg text-slate-400 hover:text-red-400 transition-colors"
                            title="Delete Vehicle"
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
            <div className="p-4 bg-slate-900/60 border-t border-white/5 flex items-center justify-between text-xs text-slate-400">
              <div>
                Showing <span className="font-bold text-slate-200">{totalCount > 0 ? (currentPage - 1) * pageSize + 1 : 0}</span> to <span className="font-bold text-slate-200">{Math.min(currentPage * pageSize, totalCount)}</span> of <span className="font-bold text-slate-200">{totalCount}</span> vehicles
              </div>

              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1">
                  <span>Per page:</span>
                  <select
                    value={pageSize}
                    onChange={(e) => { setPageSize(parseInt(e.target.value)); setCurrentPage(1); }}
                    className="bg-slate-950 border border-white/10 rounded px-2 py-1 text-slate-200"
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
                    className="p-1 bg-slate-950 border border-white/10 rounded text-slate-300 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-slate-800"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <span className="px-2 font-mono font-bold text-slate-200">{currentPage} / {totalPages}</span>
                  <button
                    disabled={currentPage >= totalPages}
                    onClick={() => setCurrentPage(currentPage + 1)}
                    className="p-1 bg-slate-950 border border-white/10 rounded text-slate-300 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-slate-800"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Vehicle CRUD Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-white/10 rounded-2xl max-w-2xl w-full p-6 space-y-6 shadow-2xl max-h-[90vh] overflow-y-auto scrollbar-thin">
            
            <div className="flex justify-between items-center border-b border-white/5 pb-4">
              <div>
                <h3 className="text-lg font-bold text-slate-50">
                  {editingVehicle ? "Edit Fleet Vehicle Specifications" : "Register New Fleet Vehicle"}
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">Configure make, model, registration, rates, fuel, transmission, and driver.</p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-white p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {formError && (
              <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-xs flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleSaveVehicle} className="space-y-4">
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1">Vehicle Make / Brand *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Toyota, Mahindra, Force"
                    value={formData.make}
                    onChange={(e) => setFormData({ ...formData, make: e.target.value })}
                    className="w-full bg-slate-950 border border-white/10 rounded-lg p-2.5 text-xs text-slate-100 focus:outline-none focus:border-accent"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1">Vehicle Model Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Innova Crysta, Scorpio, Urbania"
                    value={formData.model}
                    onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                    className="w-full bg-slate-950 border border-white/10 rounded-lg p-2.5 text-xs text-slate-100 focus:outline-none focus:border-accent"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1">Registration Number *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. MH12PQ9999 or HR26AB1234"
                    value={formData.registrationNumber}
                    onChange={(e) => setFormData({ ...formData, registrationNumber: e.target.value.toUpperCase() })}
                    className="w-full bg-slate-950 border border-white/10 rounded-lg p-2.5 text-xs text-slate-100 font-mono font-bold focus:outline-none focus:border-accent"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1">Vehicle Category *</label>
                  <select
                    required
                    value={formData.categoryId}
                    onChange={(e) => {
                      const newCatId = e.target.value;
                      const selectedCat = categories.find(c => c.id === newCatId);
                      const catName = (selectedCat?.name || "").toLowerCase();
                      let defaultSub = "Executive";
                      if (catName.includes("sedan")) defaultSub = "Compact";
                      else if (catName.includes("suv")) defaultSub = "Subcompact / Urban";
                      else if (catName.includes("hatchback")) defaultSub = "Compact";

                      setFormData({ ...formData, categoryId: newCatId, subCategory: defaultSub });
                    }}
                    className="w-full bg-slate-950 border border-white/10 rounded-lg p-2.5 text-xs text-slate-100 focus:outline-none focus:border-accent"
                  >
                    <option value="" disabled>-- Select Vehicle Category --</option>
                    {categories.map((c) => (
                      <option key={c.id} value={c.id} className="bg-slate-900">{c.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1">Vehicle Class *</label>
                  <select
                    required
                    value={formData.subCategory || "Executive"}
                    onChange={(e) => setFormData({ ...formData, subCategory: e.target.value })}
                    className="w-full bg-slate-950 border border-white/10 rounded-lg p-2.5 text-xs text-slate-100 focus:outline-none focus:border-accent"
                  >
                    {(() => {
                      const selectedCat = categories.find(c => c.id === formData.categoryId);
                      const catName = (selectedCat?.name || "").toLowerCase();

                      if (catName.includes("sedan")) {
                        return (
                          <>
                            <option value="Compact" className="bg-slate-900">Compact (e.g. Swift Dzire, Aura, Amaze)</option>
                            <option value="Executive" className="bg-slate-900">Executive (e.g. Honda City, Verna, Ciaz)</option>
                            <option value="Premium Executive" className="bg-slate-900">Premium Executive (e.g. Camry, Superb)</option>
                            <option value="Luxury" className="bg-slate-900">Luxury (e.g. E-Class, 5 Series, A6)</option>
                          </>
                        );
                      }
                      if (catName.includes("suv")) {
                        return (
                          <>
                            <option value="Subcompact / Urban" className="bg-slate-900">Subcompact / Urban (e.g. Brezza, Nexon, Venue)</option>
                            <option value="Mid-Premium" className="bg-slate-900">Mid-Premium (e.g. Creta, Seltos, Harrier)</option>
                            <option value="Premium" className="bg-slate-900">Premium (e.g. Innova Crysta, XUV700, Safari)</option>
                            <option value="Luxury" className="bg-slate-900">Luxury (e.g. Fortuner, GLE, X5)</option>
                          </>
                        );
                      }
                      return (
                        <>
                          <option value="Compact" className="bg-slate-900">Compact</option>
                          <option value="Standard" className="bg-slate-900">Standard</option>
                          <option value="Executive" className="bg-slate-900">Executive</option>
                          <option value="Premium" className="bg-slate-900">Premium</option>
                          <option value="Luxury" className="bg-slate-900">Luxury</option>
                        </>
                      );
                    })()}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1">Seating Capacity *</label>
                  <input
                    type="number"
                    min={1}
                    required
                    value={formData.capacity}
                    onChange={(e) => setFormData({ ...formData, capacity: parseInt(e.target.value, 10) || 1 })}
                    className="w-full bg-slate-950 border border-white/10 rounded-lg p-2.5 text-xs text-slate-100 focus:outline-none focus:border-accent"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1">Fuel Type *</label>
                  <select
                    value={formData.fuelType}
                    onChange={(e) => setFormData({ ...formData, fuelType: e.target.value })}
                    className="w-full bg-slate-950 border border-white/10 rounded-lg p-2.5 text-xs text-slate-100 focus:outline-none focus:border-accent"
                  >
                    <option value="DIESEL" className="bg-slate-900">Diesel</option>
                    <option value="PETROL" className="bg-slate-900">Petrol</option>
                    <option value="ELECTRIC" className="bg-slate-900">Electric</option>
                    <option value="CNG" className="bg-slate-900">CNG</option>
                    <option value="HYBRID" className="bg-slate-900">Hybrid</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1">Transmission *</label>
                  <select
                    value={formData.transmission}
                    onChange={(e) => setFormData({ ...formData, transmission: e.target.value })}
                    className="w-full bg-slate-950 border border-white/10 rounded-lg p-2.5 text-xs text-slate-100 focus:outline-none focus:border-accent"
                  >
                    <option value="MANUAL" className="bg-slate-900">Manual</option>
                    <option value="AUTOMATIC" className="bg-slate-900">Automatic</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1">Custom Per-KM Rate (₹)</label>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="e.g. 18.50"
                    value={formData.perKmRate}
                    onChange={(e) => setFormData({ ...formData, perKmRate: e.target.value })}
                    className="w-full bg-slate-950 border border-white/10 rounded-lg p-2.5 text-xs text-slate-100 font-mono focus:outline-none focus:border-accent"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1">Custom Base Daily Rate (₹)</label>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="e.g. 3500.00"
                    value={formData.baseDailyRate}
                    onChange={(e) => setFormData({ ...formData, baseDailyRate: e.target.value })}
                    className="w-full bg-slate-950 border border-white/10 rounded-lg p-2.5 text-xs text-slate-100 font-mono focus:outline-none focus:border-accent"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1">Extra KM Rate (₹/extra km)</label>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="e.g. 15.00"
                    value={formData.extraKmRate}
                    onChange={(e) => setFormData({ ...formData, extraKmRate: e.target.value })}
                    className="w-full bg-slate-950 border border-white/10 rounded-lg p-2.5 text-xs text-slate-100 font-mono focus:outline-none focus:border-accent"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1">Extra Hour Rate (₹/extra hr)</label>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="e.g. 200.00"
                    value={formData.extraHourRate}
                    onChange={(e) => setFormData({ ...formData, extraHourRate: e.target.value })}
                    className="w-full bg-slate-950 border border-white/10 rounded-lg p-2.5 text-xs text-slate-100 font-mono focus:outline-none focus:border-accent"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1">Vehicle Status *</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as VehicleStatus })}
                    className="w-full bg-slate-950 border border-white/10 rounded-lg p-2.5 text-xs text-slate-100 focus:outline-none focus:border-accent"
                  >
                    <option value="AVAILABLE" className="bg-slate-900 text-emerald-400">AVAILABLE</option>
                    <option value="ON_TRIP" className="bg-slate-900 text-blue-400">ON TRIP</option>
                    <option value="MAINTENANCE" className="bg-slate-900 text-yellow-400">MAINTENANCE</option>
                    <option value="INACTIVE" className="bg-slate-900 text-rose-400">INACTIVE</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1">Assign Driver (Optional)</label>
                  <select
                    value={formData.driverId}
                    onChange={(e) => setFormData({ ...formData, driverId: e.target.value })}
                    className="w-full bg-slate-950 border border-white/10 rounded-lg p-2.5 text-xs text-slate-100 focus:outline-none focus:border-accent"
                  >
                    <option value="">No Driver Assigned</option>
                    {drivers.map((d) => (
                      <option key={d.id} value={d.id} className="bg-slate-900">
                        {d.name} ({d.phone})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">Vehicle Image URL</label>
                <input
                  type="url"
                  placeholder="https://images.unsplash.com/photo-..."
                  value={formData.imageUrl}
                  onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                  className="w-full bg-slate-950 border border-white/10 rounded-lg p-2.5 text-xs text-slate-100 font-mono focus:outline-none focus:border-accent"
                />
              </div>

              <div className="flex gap-3 pt-4 border-t border-white/5">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold py-2.5 rounded-lg text-xs tracking-wider uppercase transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 bg-accent hover:bg-yellow-500 text-slate-950 font-black py-2.5 rounded-lg text-xs tracking-wider uppercase transition-colors shadow-lg disabled:opacity-50"
                >
                  {isSubmitting ? "Saving..." : editingVehicle ? "Update Vehicle" : "Create Vehicle"}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
}
