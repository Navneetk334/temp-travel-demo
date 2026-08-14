"use client";

import React, { useState, useEffect } from "react";
import { 
  Plus, 
  Trash2, 
  Edit, 
  X, 
  Car, 
  Users, 
  ShieldCheck, 
  AlertTriangle,
  Search,
  ChevronLeft,
  ChevronRight,
  Fuel,
  Settings,
  DollarSign,
  UserCheck,
  Zap,
  CheckCircle2,
  FolderTree,
  SlidersHorizontal,
  ChevronDown
} from "lucide-react";

type VehicleStatus = "AVAILABLE" | "ON_TRIP" | "MAINTENANCE" | "INACTIVE";

// Master Taxonomy for UI mapping
const MASTER_CATEGORIES = ["Sedan", "SUV", "MPV/MUV"];

const MASTER_SUBCATEGORIES_MAP: Record<string, string[]> = {
  "Sedan": ["Compact", "Executive", "Premium Executive", "Luxury"],
  "SUV": ["Subcompact/Urban", "Mid-Premium", "Premium", "Luxury"],
  "MPV/MUV": ["Value/Family", "Business", "Premium", "Luxury"],
};

interface VehicleModelMaster {
  id: string;
  brand: string;
  modelName: string;
  category: string;
  subcategory: string;
  minSeats: number;
  maxSeats: number;
  supportedFuelTypes: string[];
  supportedTransmissionTypes: string[];
  isElectric: Boolean;
  isActive: Boolean;
}

interface Vehicle {
  id: string;
  model: string;
  make: string;
  registrationNumber: string;
  capacity: number;
  fuelType?: string | null;
  transmission?: string | null;
  subCategory?: string | null;
  vehicleType?: string | null;
  vehicleModelId?: string | null;
  imageUrl?: string | null;
  perKmRate?: number | string | null;
  baseDailyRate?: number | string | null;
  status: VehicleStatus;
  categoryId: string;
  category?: {
    id: string;
    name: string;
    imageUrl?: string | null;
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
  const [masterModels, setMasterModels] = useState<VehicleModelMaster[]>([]);
  const [loading, setLoading] = useState(true);

  // Modals State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isModelManagerOpen, setIsModelManagerOpen] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState<Vehicle | null>(null);
  const [showTaxonomyCard, setShowTaxonomyCard] = useState(true);

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

  // Dynamic Fleet Vehicle Form State
  const [formData, setFormData] = useState({
    selectedCategory: "MPV/MUV",
    selectedSubcategory: "Business",
    selectedBrand: "Toyota",
    selectedModelId: "",
    modelName: "Innova Hycross",
    capacity: 7,
    fuelType: "HYBRID",
    transmission: "AUTOMATIC",
    vehicleType: "Executive Shuttle",
    registrationNumber: "",
    imageUrl: "",
    perKmRate: "22.00",
    baseDailyRate: "4500.00",
    status: "AVAILABLE" as VehicleStatus,
    categoryId: "",
    driverId: "",
  });

  // Master Model Manager Form State
  const [modelManagerData, setModelManagerData] = useState({
    brand: "",
    modelName: "",
    category: "Sedan",
    subcategory: "Executive",
    minSeats: 4,
    maxSeats: 5,
    supportedFuelTypes: ["PETROL", "DIESEL"],
    supportedTransmissionTypes: ["MANUAL", "AUTOMATIC"],
    isElectric: false,
  });
  const [modelManagerError, setModelManagerError] = useState("");
  const [isSubmittingModel, setIsSubmittingModel] = useState(false);

  const [formError, setFormError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Load Database Data
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

      const [vehiclesRes, catsRes, driversRes, modelsRes] = await Promise.all([
        fetch(`/api/fleet?${queryParams.toString()}`),
        fetch("/api/fleet/categories"),
        fetch("/api/admin/drivers"),
        fetch("/api/fleet/models")
      ]);

      if (vehiclesRes.ok && catsRes.ok && modelsRes.ok) {
        const vData = await vehiclesRes.json();
        const cData: Category[] = await catsRes.json();
        const dData = driversRes.ok ? await driversRes.json() : [];
        const mData = await modelsRes.json();

        if (Array.isArray(vData)) {
          setVehicles(vData);
          setTotalCount(vData.length);
          setTotalPages(1);
        } else {
          setVehicles(vData.vehicles || []);
          setTotalCount(vData.pagination?.totalCount || 0);
          setTotalPages(vData.pagination?.totalPages || 1);
          if (vData.stats) setStats(vData.stats);
        }

        setCategories(cData);
        setDrivers(dData);
        setMasterModels(mData.models || []);

        if (cData.length > 0 && !formData.categoryId) {
          setFormData(prev => ({ ...prev, categoryId: cData[0].id }));
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

  // Helper to map category name to database Category ID
  const getCatIdForName = (catName: string): string => {
    const target = categories.find(c => {
      const cn = c.name.toLowerCase();
      if (catName.includes("MPV") || catName.includes("MUV")) return cn.includes("mpv") || cn.includes("muv") || cn.includes("bus") || cn.includes("tempo") || cn.includes("suv");
      if (catName.includes("SUV")) return cn.includes("suv");
      if (catName.includes("Sedan")) return cn.includes("sedan") || cn.includes("hatchback") || cn.includes("premium");
      return false;
    });
    return target ? target.id : (categories[0]?.id || "");
  };

  // Filtered Options for 5-Step Dynamic Cascading Select
  const availableSubcategories = MASTER_SUBCATEGORIES_MAP[formData.selectedCategory] || ["Executive"];
  
  const availableBrandsForCategorySubcategory = Array.from(
    new Set(
      masterModels
        .filter(m => m.category.toLowerCase() === formData.selectedCategory.toLowerCase() && m.subcategory.toLowerCase() === formData.selectedSubcategory.toLowerCase())
        .map(m => m.brand)
    )
  ).sort();

  const availableModelsForBrand = masterModels.filter(
    m => m.category.toLowerCase() === formData.selectedCategory.toLowerCase() &&
         m.subcategory.toLowerCase() === formData.selectedSubcategory.toLowerCase() &&
         m.brand.toLowerCase() === formData.selectedBrand.toLowerCase()
  );

  const openModal = (vehicle: Vehicle | null = null) => {
    setFormError("");
    if (vehicle) {
      setEditingVehicle(vehicle);
      const catName = vehicle.category?.name || "Sedan";
      const matchedMasterCat = MASTER_CATEGORIES.find(c => catName.toLowerCase().includes(c.toLowerCase())) || "Sedan";
      const matchedSubcat = vehicle.subCategory || (MASTER_SUBCATEGORIES_MAP[matchedMasterCat]?.[0] || "Executive");
      
      setFormData({
        selectedCategory: matchedMasterCat,
        selectedSubcategory: matchedSubcat,
        selectedBrand: vehicle.make,
        selectedModelId: vehicle.vehicleModelId || "",
        modelName: vehicle.model,
        capacity: vehicle.capacity,
        fuelType: vehicle.fuelType || "DIESEL",
        transmission: vehicle.transmission || "MANUAL",
        vehicleType: vehicle.vehicleType || "Standard Fleet",
        registrationNumber: vehicle.registrationNumber,
        imageUrl: vehicle.imageUrl || "",
        perKmRate: vehicle.perKmRate ? String(vehicle.perKmRate) : "",
        baseDailyRate: vehicle.baseDailyRate ? String(vehicle.baseDailyRate) : "",
        status: vehicle.status,
        categoryId: vehicle.categoryId,
        driverId: vehicle.driverId || "",
      });
    } else {
      setEditingVehicle(null);
      const defaultCat = "MPV/MUV";
      const defaultSubcat = "Business";
      const defaultBrand = "Toyota";

      const matchedMasterModel = masterModels.find(
        m => m.category === defaultCat && m.subcategory === defaultSubcat && m.brand === defaultBrand
      );

      setFormData({
        selectedCategory: defaultCat,
        selectedSubcategory: defaultSubcat,
        selectedBrand: defaultBrand,
        selectedModelId: matchedMasterModel?.id || "",
        modelName: matchedMasterModel?.modelName || "Innova Hycross",
        capacity: matchedMasterModel?.maxSeats || 7,
        fuelType: matchedMasterModel?.supportedFuelTypes[0] || "HYBRID",
        transmission: matchedMasterModel?.supportedTransmissionTypes[0] || "AUTOMATIC",
        vehicleType: "Executive Shuttle",
        registrationNumber: "",
        imageUrl: "",
        perKmRate: "22.00",
        baseDailyRate: "4500.00",
        status: "AVAILABLE",
        categoryId: getCatIdForName(defaultCat),
        driverId: "",
      });
    }
    setIsModalOpen(true);
  };

  // Handle Model Selection to Auto-Populate Specifications
  const handleModelChange = (modelId: string) => {
    const selectedMaster = masterModels.find(m => m.id === modelId);
    if (selectedMaster) {
      setFormData(prev => ({
        ...prev,
        selectedModelId: selectedMaster.id,
        modelName: selectedMaster.modelName,
        selectedBrand: selectedMaster.brand,
        capacity: selectedMaster.maxSeats,
        fuelType: selectedMaster.supportedFuelTypes[0] || "DIESEL",
        transmission: selectedMaster.supportedTransmissionTypes[0] || "MANUAL",
        vehicleType: selectedMaster.category === "MPV/MUV" ? "Executive Shuttle" : selectedMaster.category === "SUV" ? "Outstation Cruiser" : "Corporate Commute",
      }));
    }
  };

  // Pre-fill Demonstration Toyota Innova Crysta / Hycross
  const handlePreFillInnova = () => {
    const matchedMaster = masterModels.find(m => m.brand === "Toyota" && m.modelName.includes("Innova"));
    const catName = "MPV/MUV";
    const subcatName = "Business";
    setFormData({
      selectedCategory: catName,
      selectedSubcategory: subcatName,
      selectedBrand: "Toyota",
      selectedModelId: matchedMaster?.id || "",
      modelName: matchedMaster?.modelName || "Innova Hycross",
      capacity: 7,
      fuelType: "HYBRID",
      transmission: "AUTOMATIC",
      vehicleType: "Executive Shuttle",
      registrationNumber: `DL${Math.floor(10 + Math.random() * 89)}AB${Math.floor(1000 + Math.random() * 8999)}`,
      imageUrl: "",
      perKmRate: "22.00",
      baseDailyRate: "4500.00",
      status: "AVAILABLE",
      categoryId: getCatIdForName(catName),
      driverId: "",
    });
  };

  // Save Fleet Vehicle to Database
  const handleSaveVehicle = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");
    setIsSubmitting(true);

    try {
      const matchedCatId = getCatIdForName(formData.selectedCategory) || formData.categoryId;

      const payload: any = {
        make: formData.selectedBrand.trim(),
        model: formData.modelName.trim(),
        categoryId: matchedCatId,
        subCategory: formData.selectedSubcategory,
        capacity: Number(formData.capacity),
        fuelType: formData.fuelType,
        transmission: formData.transmission,
        vehicleType: formData.vehicleType,
        registrationNumber: formData.registrationNumber.trim().toUpperCase(),
        status: formData.status,
        driverId: formData.driverId || null,
        vehicleModelId: formData.selectedModelId || null,
      };

      if (formData.imageUrl.trim()) payload.imageUrl = formData.imageUrl.trim();
      if (formData.perKmRate) payload.perKmRate = Number(formData.perKmRate);
      if (formData.baseDailyRate) payload.baseDailyRate = Number(formData.baseDailyRate);

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

  // Save New Master Model in Database
  const handleSaveMasterModel = async (e: React.FormEvent) => {
    e.preventDefault();
    setModelManagerError("");
    setIsSubmittingModel(true);

    try {
      const res = await fetch("/api/fleet/models", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(modelManagerData),
      });

      const data = await res.json();

      if (!res.ok) {
        setModelManagerError(data.error || "Failed to create model master");
        return;
      }

      setModelManagerData({
        brand: "",
        modelName: "",
        category: "Sedan",
        subcategory: "Executive",
        minSeats: 4,
        maxSeats: 5,
        supportedFuelTypes: ["PETROL", "DIESEL"],
        supportedTransmissionTypes: ["MANUAL", "AUTOMATIC"],
        isElectric: false,
      });

      setIsModelManagerOpen(false);
      loadData();
    } catch (err) {
      console.error("Failed to save master model:", err);
      setModelManagerError("Server error adding master model");
    } finally {
      setIsSubmittingModel(false);
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
    <div className="bg-slate-950 min-h-screen text-slate-100 p-6 sm:p-8 space-y-8">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-white/5 pb-6 gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-50 tracking-tight flex items-center gap-2.5">
            <Car className="w-8 h-8 text-accent" />
            <span>Vehicle Master Database & Fleet Operations</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Hierarchy: Category &rarr; Subcategory &rarr; Brand &rarr; Vehicle Model &rarr; Actual Fleet Vehicle
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsModelManagerOpen(true)}
            className="flex items-center gap-1.5 bg-slate-900 hover:bg-slate-800 border border-white/10 text-slate-200 font-semibold py-2.5 px-4 rounded-lg text-xs transition-all"
          >
            <SlidersHorizontal className="w-4 h-4 text-accent" />
            <span>Manage Master Models ({masterModels.length})</span>
          </button>

          <button
            onClick={() => openModal()}
            className="flex items-center gap-1.5 bg-accent hover:bg-yellow-500 text-slate-950 font-extrabold py-2.5 px-6 rounded-lg text-xs tracking-wider uppercase transition-all shadow-lg"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Vehicle</span>
          </button>
        </div>
      </div>

      {/* MASTER STRUCTURE TAXONOMY TREE CARD */}
      {showTaxonomyCard && (
        <div className="glassmorphism p-6 rounded-2xl border border-white/10 space-y-4 bg-slate-900/60 shadow-xl">
          <div className="flex items-center justify-between border-b border-white/5 pb-3">
            <div className="flex items-center gap-2">
              <FolderTree className="w-5 h-5 text-accent" />
              <h2 className="text-sm font-extrabold uppercase tracking-wider text-slate-100">
                Database-Backed Category & Subcategory Master Taxonomy
              </h2>
            </div>
            <button
              onClick={() => setShowTaxonomyCard(false)}
              className="text-xs text-slate-400 hover:text-white"
            >
              Hide Taxonomy
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
            {MASTER_CATEGORIES.map((catName) => {
              const subcats = MASTER_SUBCATEGORIES_MAP[catName] || [];
              const catModelsCount = masterModels.filter(m => m.category.toLowerCase() === catName.toLowerCase()).length;
              return (
                <div key={catName} className="bg-slate-950/70 border border-white/10 rounded-xl p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-black text-accent uppercase tracking-wide">{catName}</span>
                    <span className="text-[10px] font-mono font-bold text-slate-400 bg-accent/10 text-accent px-2 py-0.5 rounded">
                      {catModelsCount} Models Registered
                    </span>
                  </div>
                  <div className="space-y-1.5 pl-2 border-l-2 border-accent/40">
                    {subcats.map((sub) => {
                      const count = masterModels.filter(m => m.category.toLowerCase() === catName.toLowerCase() && m.subcategory.toLowerCase() === sub.toLowerCase()).length;
                      return (
                        <div key={sub} className="text-xs text-slate-300 flex items-center justify-between hover:text-white transition-colors">
                          <span className="font-semibold">&bull; {sub}</span>
                          <span className="text-[10px] text-slate-500 font-mono">
                            {count} Master Model(s)
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

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
            placeholder="Search make, model, reg number..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
            className="w-full bg-slate-950/60 border border-white/10 rounded-lg py-2 pl-10 pr-4 text-xs text-slate-100 focus:outline-none focus:border-accent transition-all"
          />
        </div>

        {/* Filter Dropdowns */}
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
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

          <select
            value={fuelTypeFilter}
            onChange={(e) => { setFuelTypeFilter(e.target.value); setCurrentPage(1); }}
            className="bg-slate-950/60 border border-white/10 rounded-lg py-2 px-3 text-xs text-slate-100 focus:outline-none focus:border-accent"
          >
            <option value="" className="bg-slate-900">All Fuel Types</option>
            <option value="DIESEL" className="bg-slate-900">Diesel</option>
            <option value="PETROL" className="bg-slate-900">Petrol</option>
            <option value="HYBRID" className="bg-slate-900">Hybrid</option>
            <option value="ELECTRIC" className="bg-slate-900">Electric</option>
            <option value="CNG" className="bg-slate-900">CNG</option>
          </select>

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
                    <th className="p-4">Brand & Model</th>
                    <th className="p-4">Category & Subcategory</th>
                    <th className="p-4">Seats, Fuel & Gearbox</th>
                    <th className="p-4">Vehicle Scope</th>
                    <th className="p-4">Tariff Rates</th>
                    <th className="p-4">Status & Driver</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {vehicles.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="text-center py-16 text-slate-500 italic">
                        No fleet vehicles matching selected criteria found.
                      </td>
                    </tr>
                  ) : (
                    vehicles.map((v) => (
                      <tr key={v.id} className="hover:bg-white/5 transition-colors">
                        <td className="p-4">
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-lg bg-slate-950 border border-white/10 overflow-hidden shrink-0 relative flex items-center justify-center">
                              <img
                                src={v.imageUrl || v.category?.imageUrl || "/images/fleet-suv.png"}
                                alt={v.model}
                                className="w-full h-full object-cover"
                              />
                            </div>
                            <div>
                              <div className="font-extrabold text-slate-100 text-sm flex items-center gap-2">
                                <span>{v.make} {v.model}</span>
                              </div>
                              <div className="font-mono text-emerald-400 text-[11px] mt-0.5 font-bold">
                                {v.registrationNumber}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="p-4">
                          <div className="font-bold text-slate-200 flex items-center gap-1.5">
                            <span className="px-2 py-0.5 rounded bg-primary/20 text-accent font-extrabold text-[11px]">
                              {v.category?.name || "Sedan"}
                            </span>
                          </div>
                          <div className="text-[11px] text-slate-300 font-semibold mt-1">
                            {v.subCategory || "Executive"}
                          </div>
                        </td>
                        <td className="p-4 space-y-0.5">
                          <div className="text-slate-200 font-bold flex items-center gap-1">
                            <Users className="w-3 h-3 text-accent" />
                            <span>{v.capacity} Passenger Seats</span>
                          </div>
                          <div className="text-[10px] text-slate-400 flex items-center gap-2">
                            <span className="font-semibold text-slate-300">{v.fuelType || "DIESEL"}</span>
                            <span>&bull;</span>
                            <span className="font-mono">{v.transmission || "MANUAL"}</span>
                          </div>
                        </td>
                        <td className="p-4">
                          <span className="text-xs text-slate-300 font-medium">
                            {v.vehicleType || "Standard Fleet"}
                          </span>
                        </td>
                        <td className="p-4 font-mono text-[11px]">
                          {v.perKmRate ? (
                            <div className="space-y-0.5">
                              <div className="text-slate-200 font-bold">₹{Number(v.perKmRate)}/km</div>
                              <div className="text-slate-400 text-[10px]">Daily: ₹{Number(v.baseDailyRate || 0)}</div>
                            </div>
                          ) : (
                            <span className="text-slate-500 italic">Standard Category Rates</span>
                          )}
                        </td>
                        <td className="p-4 space-y-1">
                          <span className={`inline-block px-2.5 py-0.5 rounded text-[10px] uppercase tracking-wider border ${getStatusBadge(v.status)}`}>
                            {v.status}
                          </span>
                          {v.driver ? (
                            <div className="text-slate-300 font-semibold text-[11px] flex items-center gap-1">
                              <UserCheck className="w-3 h-3 text-accent" />
                              <span>{v.driver.name}</span>
                            </div>
                          ) : (
                            <div className="text-[10px] text-slate-500 italic">No driver assigned</div>
                          )}
                        </td>
                        <td className="p-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => openModal(v)}
                              className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded border border-white/10 transition-colors"
                              title="Edit Vehicle Specs"
                            >
                              <Edit className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleDelete(v.id)}
                              className="p-1.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 rounded border border-rose-500/20 transition-colors"
                              title="Delete Vehicle"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls */}
            <div className="p-4 bg-slate-900 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400 gap-4">
              <div>
                Showing <span className="font-bold text-slate-200">{vehicles.length}</span> of <span className="font-bold text-slate-200">{totalCount}</span> total fleet vehicles
              </div>
              
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <span>Page Size:</span>
                  <select
                    value={pageSize}
                    onChange={(e) => { setPageSize(Number(e.target.value)); setCurrentPage(1); }}
                    className="bg-slate-950 border border-white/10 rounded px-2 py-1 text-slate-200 focus:outline-none"
                  >
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

      {/* 5-STEP CASCADING FLEET VEHICLE ADD/EDIT MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-white/10 rounded-2xl max-w-2xl w-full p-6 space-y-6 shadow-2xl max-h-[90vh] overflow-y-auto scrollbar-thin">
            
            <div className="flex justify-between items-center border-b border-white/5 pb-4">
              <div>
                <h3 className="text-lg font-extrabold text-slate-50 flex items-center gap-2">
                  <Car className="w-5 h-5 text-accent" />
                  <span>{editingVehicle ? "Edit Fleet Vehicle Configuration" : "Register Fleet Vehicle (Master Catalogue Flow)"}</span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">Flow: Category &rarr; Subcategory &rarr; Brand &rarr; Vehicle Model &rarr; Specifications &rarr; Reg Number</p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-white p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Quick Demo Pre-fill Action */}
            {!editingVehicle && (
              <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-3 flex items-center justify-between">
                <span className="text-xs text-slate-300">Quick Test: Pre-fill Specs for <strong>Toyota Innova Hycross</strong></span>
                <button
                  type="button"
                  onClick={handlePreFillInnova}
                  className="bg-accent hover:bg-yellow-500 text-slate-950 font-bold px-3 py-1 rounded text-xs transition-all"
                >
                  Pre-fill Demo Data
                </button>
              </div>
            )}

            {formError && (
              <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-xs flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleSaveVehicle} className="space-y-4">
              
              {/* Step 1: Select Category & Step 2: Subcategory */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1">1. Select Category *</label>
                  <select
                    required
                    value={formData.selectedCategory}
                    onChange={(e) => {
                      const newCat = e.target.value;
                      const newSubcats = MASTER_SUBCATEGORIES_MAP[newCat] || ["Executive"];
                      const firstSubcat = newSubcats[0] || "Executive";

                      // Find matching brand in database
                      const matchedBrands = Array.from(new Set(
                        masterModels
                          .filter(m => m.category.toLowerCase() === newCat.toLowerCase() && m.subcategory.toLowerCase() === firstSubcat.toLowerCase())
                          .map(m => m.brand)
                      ));
                      const firstBrand = matchedBrands[0] || "Toyota";

                      setFormData(prev => ({
                        ...prev,
                        selectedCategory: newCat,
                        selectedSubcategory: firstSubcat,
                        selectedBrand: firstBrand,
                        selectedModelId: "",
                        categoryId: getCatIdForName(newCat)
                      }));
                    }}
                    className="w-full bg-slate-950 border border-white/10 rounded-lg p-2.5 text-xs text-slate-100 focus:outline-none focus:border-accent font-bold text-accent"
                  >
                    {MASTER_CATEGORIES.map((catName) => (
                      <option key={catName} value={catName} className="bg-slate-900">{catName}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1">2. Filtered Subcategory *</label>
                  <select
                    required
                    value={formData.selectedSubcategory}
                    onChange={(e) => {
                      const newSubcat = e.target.value;
                      const matchedBrands = Array.from(new Set(
                        masterModels
                          .filter(m => m.category.toLowerCase() === formData.selectedCategory.toLowerCase() && m.subcategory.toLowerCase() === newSubcat.toLowerCase())
                          .map(m => m.brand)
                      ));
                      const firstBrand = matchedBrands[0] || formData.selectedBrand;

                      setFormData(prev => ({
                        ...prev,
                        selectedSubcategory: newSubcat,
                        selectedBrand: firstBrand,
                        selectedModelId: "",
                      }));
                    }}
                    className="w-full bg-slate-950 border border-white/10 rounded-lg p-2.5 text-xs text-slate-100 focus:outline-none focus:border-accent font-bold text-slate-200"
                  >
                    {availableSubcategories.map((sub) => (
                      <option key={sub} value={sub} className="bg-slate-900">{sub}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Step 3: Select Brand & Step 4: Select Model */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1">3. Select Brand (Database-Backed) *</label>
                  <select
                    required
                    value={formData.selectedBrand}
                    onChange={(e) => {
                      const newBrand = e.target.value;
                      const matchedModels = masterModels.filter(
                        m => m.category.toLowerCase() === formData.selectedCategory.toLowerCase() &&
                             m.subcategory.toLowerCase() === formData.selectedSubcategory.toLowerCase() &&
                             m.brand.toLowerCase() === newBrand.toLowerCase()
                      );
                      const firstModel = matchedModels[0];

                      setFormData(prev => ({
                        ...prev,
                        selectedBrand: newBrand,
                        selectedModelId: firstModel?.id || "",
                        modelName: firstModel?.modelName || prev.modelName,
                        capacity: firstModel?.maxSeats || prev.capacity,
                        fuelType: firstModel?.supportedFuelTypes[0] || prev.fuelType,
                        transmission: firstModel?.supportedTransmissionTypes[0] || prev.transmission,
                      }));
                    }}
                    className="w-full bg-slate-950 border border-white/10 rounded-lg p-2.5 text-xs text-slate-100 focus:outline-none focus:border-accent font-semibold"
                  >
                    {availableBrandsForCategorySubcategory.length > 0 ? (
                      availableBrandsForCategorySubcategory.map(b => (
                        <option key={b} value={b} className="bg-slate-900">{b}</option>
                      ))
                    ) : (
                      <option value={formData.selectedBrand} className="bg-slate-900">{formData.selectedBrand} (Custom)</option>
                    )}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1">4. Select Vehicle Model (Auto-Filters) *</label>
                  <select
                    required
                    value={formData.selectedModelId}
                    onChange={(e) => handleModelChange(e.target.value)}
                    className="w-full bg-slate-950 border border-white/10 rounded-lg p-2.5 text-xs text-slate-100 focus:outline-none focus:border-accent font-bold"
                  >
                    <option value="" disabled>-- Select Vehicle Model --</option>
                    {availableModelsForBrand.map(m => (
                      <option key={m.id} value={m.id} className="bg-slate-900">
                        {m.brand} {m.modelName} ({m.minSeats}-{m.maxSeats} Seats)
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Step 5 & 6: Config (Seats, Fuel, Transmission, Scope) */}
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1">Seats (Capacity) *</label>
                  <input
                    type="number"
                    min={1}
                    max={50}
                    required
                    value={formData.capacity}
                    onChange={(e) => setFormData({ ...formData, capacity: parseInt(e.target.value, 10) || 1 })}
                    className="w-full bg-slate-950 border border-white/10 rounded-lg p-2.5 text-xs text-slate-100 focus:outline-none focus:border-accent font-mono font-bold"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1">Fuel Type *</label>
                  <select
                    value={formData.fuelType}
                    onChange={(e) => setFormData({ ...formData, fuelType: e.target.value })}
                    className="w-full bg-slate-950 border border-white/10 rounded-lg p-2.5 text-xs text-slate-100 focus:outline-none focus:border-accent"
                  >
                    <option value="HYBRID" className="bg-slate-900">Petrol / Hybrid</option>
                    <option value="PETROL" className="bg-slate-900">Petrol</option>
                    <option value="DIESEL" className="bg-slate-900">Diesel</option>
                    <option value="CNG" className="bg-slate-900">CNG</option>
                    <option value="ELECTRIC" className="bg-slate-900">Electric</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1">Transmission *</label>
                  <select
                    value={formData.transmission}
                    onChange={(e) => setFormData({ ...formData, transmission: e.target.value })}
                    className="w-full bg-slate-950 border border-white/10 rounded-lg p-2.5 text-xs text-slate-100 focus:outline-none focus:border-accent"
                  >
                    <option value="AUTOMATIC" className="bg-slate-900">Automatic</option>
                    <option value="MANUAL" className="bg-slate-900">Manual</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1">Vehicle Scope *</label>
                  <select
                    value={formData.vehicleType}
                    onChange={(e) => setFormData({ ...formData, vehicleType: e.target.value })}
                    className="w-full bg-slate-950 border border-white/10 rounded-lg p-2.5 text-xs text-slate-100 focus:outline-none focus:border-accent"
                  >
                    <option value="Executive Shuttle" className="bg-slate-900">Executive Shuttle</option>
                    <option value="Standard Fleet" className="bg-slate-900">Standard Fleet</option>
                    <option value="Luxury Chauffeur" className="bg-slate-900">Luxury Chauffeur</option>
                    <option value="Corporate Commute" className="bg-slate-900">Corporate Commute</option>
                    <option value="Outstation Cruiser" className="bg-slate-900">Outstation Cruiser</option>
                  </select>
                </div>
              </div>

              {/* Step 7 & 8: Registration & Tariff */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1">Registration Number *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. DL01AB1234 or MH02PQ9999"
                    value={formData.registrationNumber}
                    onChange={(e) => setFormData({ ...formData, registrationNumber: e.target.value.toUpperCase() })}
                    className="w-full bg-slate-950 border border-white/10 rounded-lg p-2.5 text-xs text-slate-100 font-mono font-bold focus:outline-none focus:border-accent uppercase"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1">Custom Per-KM Rate (₹)</label>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="e.g. 22.00"
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
                    placeholder="e.g. 4500.00"
                    value={formData.baseDailyRate}
                    onChange={(e) => setFormData({ ...formData, baseDailyRate: e.target.value })}
                    className="w-full bg-slate-950 border border-white/10 rounded-lg p-2.5 text-xs text-slate-100 font-mono focus:outline-none focus:border-accent"
                  />
                </div>
              </div>

              {/* Step 9: Vehicle Image / Photo Link */}
              <div className="space-y-2 border-t border-white/5 pt-3">
                <label className="text-xs font-bold text-slate-300 block mb-1">Vehicle Image / Photo URL</label>
                <div className="flex gap-3 items-center">
                  <div className="w-14 h-14 rounded-lg bg-slate-950 border border-white/10 overflow-hidden shrink-0 flex items-center justify-center relative">
                    <img
                      src={formData.imageUrl.trim() || "/images/fleet-suv.png"}
                      alt="Vehicle preview"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1 space-y-1.5">
                    <input
                      type="url"
                      placeholder="https://example.com/photo.jpg (or leave empty for category default)"
                      value={formData.imageUrl}
                      onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                      className="w-full bg-slate-950 border border-white/10 rounded-lg p-2.5 text-xs text-slate-100 focus:outline-none focus:border-accent font-mono"
                    />
                    <div className="text-[10px] text-slate-400 flex items-center gap-2">
                      <span>Quick Presets:</span>
                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, imageUrl: "/images/fleet-suv.png" })}
                        className="text-accent hover:underline font-semibold"
                      >
                        SUV Photo
                      </button>
                      <span>&bull;</span>
                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, imageUrl: "/images/categories/sedan.jpg" })}
                        className="text-accent hover:underline font-semibold"
                      >
                        Sedan Photo
                      </button>
                      <span>&bull;</span>
                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, imageUrl: "/images/categories/luxury.jpg" })}
                        className="text-accent hover:underline font-semibold"
                      >
                        Luxury Photo
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Status & Driver Allocation */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border-t border-white/5 pt-3">
                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1">Vehicle Status *</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as VehicleStatus })}
                    className="w-full bg-slate-950 border border-white/10 rounded-lg p-2.5 text-xs text-slate-100 focus:outline-none focus:border-accent font-bold"
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
                    <option value="">Unassigned (No Driver)</option>
                    {drivers.map((d) => (
                      <option key={d.id} value={d.id} className="bg-slate-900">{d.name} ({d.phone})</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end gap-3 pt-4 border-t border-white/5">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-5 py-2.5 rounded-lg text-xs font-semibold bg-slate-800 text-slate-300 hover:bg-slate-700 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-2.5 rounded-lg text-xs font-extrabold bg-accent text-slate-950 hover:bg-yellow-500 transition-all uppercase tracking-wider shadow-lg disabled:opacity-50"
                >
                  {isSubmitting ? "Registering Fleet Vehicle..." : editingVehicle ? "Update Fleet Vehicle" : "Register Fleet Vehicle"}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* MASTER MODEL CATALOGUE MANAGER MODAL */}
      {isModelManagerOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-white/10 rounded-2xl max-w-3xl w-full p-6 space-y-6 shadow-2xl max-h-[90vh] overflow-y-auto scrollbar-thin">
            
            <div className="flex justify-between items-center border-b border-white/5 pb-4">
              <div>
                <h3 className="text-lg font-extrabold text-slate-50 flex items-center gap-2">
                  <SlidersHorizontal className="w-5 h-5 text-accent" />
                  <span>Admin Master Vehicle Models Catalogue</span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">Add new brands or vehicle models dynamically into database master without code changes.</p>
              </div>
              <button
                onClick={() => setIsModelManagerOpen(false)}
                className="text-slate-400 hover:text-white p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {modelManagerError && (
              <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-xs flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                <span>{modelManagerError}</span>
              </div>
            )}

            {/* Form to Add New Master Model */}
            <form onSubmit={handleSaveMasterModel} className="bg-slate-950 border border-white/10 rounded-xl p-4 space-y-4">
              <h4 className="text-xs font-bold text-accent uppercase tracking-wider">Add New Master Model Record</h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1">Brand Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Toyota, Force, Volvo, BYD"
                    value={modelManagerData.brand}
                    onChange={(e) => setModelManagerData({ ...modelManagerData, brand: e.target.value })}
                    className="w-full bg-slate-900 border border-white/10 rounded-lg p-2.5 text-xs text-slate-100 focus:outline-none focus:border-accent"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1">Model Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Urbania, Innova Crysta, Seal"
                    value={modelManagerData.modelName}
                    onChange={(e) => setModelManagerData({ ...modelManagerData, modelName: e.target.value })}
                    className="w-full bg-slate-900 border border-white/10 rounded-lg p-2.5 text-xs text-slate-100 focus:outline-none focus:border-accent"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1">Category *</label>
                  <select
                    value={modelManagerData.category}
                    onChange={(e) => {
                      const cat = e.target.value;
                      const subcats = MASTER_SUBCATEGORIES_MAP[cat] || [];
                      setModelManagerData({ ...modelManagerData, category: cat, subcategory: subcats[0] || "Executive" });
                    }}
                    className="w-full bg-slate-900 border border-white/10 rounded-lg p-2.5 text-xs text-slate-100 focus:outline-none focus:border-accent"
                  >
                    {MASTER_CATEGORIES.map((c) => (
                      <option key={c} value={c} className="bg-slate-900">{c}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1">Subcategory *</label>
                  <select
                    value={modelManagerData.subcategory}
                    onChange={(e) => setModelManagerData({ ...modelManagerData, subcategory: e.target.value })}
                    className="w-full bg-slate-900 border border-white/10 rounded-lg p-2.5 text-xs text-slate-100 focus:outline-none focus:border-accent"
                  >
                    {(MASTER_SUBCATEGORIES_MAP[modelManagerData.category] || []).map((s) => (
                      <option key={s} value={s} className="bg-slate-900">{s}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1">Min Seats</label>
                  <input
                    type="number"
                    min={1}
                    max={50}
                    value={modelManagerData.minSeats}
                    onChange={(e) => setModelManagerData({ ...modelManagerData, minSeats: parseInt(e.target.value, 10) || 4 })}
                    className="w-full bg-slate-900 border border-white/10 rounded-lg p-2.5 text-xs text-slate-100 focus:outline-none focus:border-accent"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1">Max Seats</label>
                  <input
                    type="number"
                    min={1}
                    max={50}
                    value={modelManagerData.maxSeats}
                    onChange={(e) => setModelManagerData({ ...modelManagerData, maxSeats: parseInt(e.target.value, 10) || 7 })}
                    className="w-full bg-slate-900 border border-white/10 rounded-lg p-2.5 text-xs text-slate-100 focus:outline-none focus:border-accent"
                  />
                </div>
              </div>

              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={isSubmittingModel}
                  className="bg-accent hover:bg-yellow-500 text-slate-950 font-extrabold px-5 py-2 rounded-lg text-xs uppercase tracking-wider transition-all disabled:opacity-50"
                >
                  {isSubmittingModel ? "Saving Master..." : "Add Master Model Record"}
                </button>
              </div>
            </form>

            {/* List of Existing Database Master Models */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">Registered Database Master Models ({masterModels.length})</h4>
              <div className="max-h-60 overflow-y-auto divide-y divide-white/5 border border-white/10 rounded-xl bg-slate-950/80">
                {masterModels.map((m) => (
                  <div key={m.id} className="p-3 flex items-center justify-between text-xs hover:bg-white/5 transition-colors">
                    <div>
                      <span className="font-extrabold text-slate-100">{m.brand} {m.modelName}</span>
                      <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                        {m.category} &bull; {m.subcategory} &bull; {m.minSeats}-{m.maxSeats} Seats
                      </div>
                    </div>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                      ACTIVE MASTER
                    </span>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
