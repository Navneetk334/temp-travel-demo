"use client";

import React, { useState, useEffect } from "react";
import {
  Car,
  ShieldCheck,
  Plus,
  Search,
  IndianRupee,
  Users,
  CheckCircle2,
  AlertCircle,
  FileText,
  Clock,
  X,
  Edit2,
  Trash2,
  CheckSquare,
  Square,
  Sparkles,
  Upload,
  Calendar,
  Shield
} from "lucide-react";

// Category to Class Mapping Hierarchy
const CLASS_OPTIONS: Record<string, string[]> = {
  Sedan: ["Compact", "Executive", "Premium Executive", "Luxury"],
  SUV: ["Subcompact/Urban", "Mid-Premium", "Premium", "Luxury"]
};

export default function MasterFleetRosterPage() {
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("ALL");
  const [showModal, setShowModal] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  // Multi-select state
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // Complete Vehicle Form State with Expiries, Numbers, and Document Uploads
  const [formData, setFormData] = useState({
    make: "",
    model: "",
    categoryName: "Sedan",
    vehicleClass: "Executive",
    registrationNumber: "",
    transmission: "Manual",
    fuelType: "Diesel",
    capacity: "4",
    perKmRate: "14",
    perHourRate: "150",
    driverAllowance: "500",
    nightAllowance: "300",
    // RC Number & Doc
    rcNumber: "",
    rcDocName: "",
    // Insurance
    insuranceProvider: "HDFC ERGO General Insurance",
    insuranceNumber: "POL-8829102",
    insuranceDocName: "",
    insuranceExpiry: "2027-06-30",
    // Fitness
    fitnessExpiry: "2027-12-31",
    fitnessDocName: "",
    // Permits & PUC
    allIndiaPermitExpiry: "2028-03-15",
    allIndiaPermitDocName: "",
    yearlyPermitExpiry: "2027-03-15",
    yearlyPermitDocName: "",
    pucExpiry: "2026-11-30",
    pucDocName: "",
    // Device Image Upload
    imageName: "",
    imageUrl: ""
  });

  const handleCategoryChange = (cat: string) => {
    const defaultClass = CLASS_OPTIONS[cat]?.[0] || "Executive";
    setFormData(prev => ({ ...prev, categoryName: cat, vehicleClass: defaultClass }));
  };

  // Load User Uploaded Fleet Vehicles
  useEffect(() => {
    const loadFleet = async () => {
      setLoading(true);
      let localList: any[] = [];
      const saved = localStorage.getItem("user_uploaded_fleet");
      if (saved) {
        try {
          localList = JSON.parse(saved);
        } catch (e) {
          console.error(e);
        }
      }

      try {
        const res = await fetch("/api/fleet");
        if (res.ok) {
          const data = await res.json();
          const apiList = data.vehicles || [];
          const regMap = new Map();
          localList.forEach(v => regMap.set(v.registrationNumber, v));
          apiList.forEach((v: any) => regMap.set(v.registrationNumber, v));
          setVehicles(Array.from(regMap.values()));
        } else {
          setVehicles(localList);
        }
      } catch (e) {
        setVehicles(localList);
      } finally {
        setLoading(false);
      }
    };

    loadFleet();
  }, []);

  const openAddModal = () => {
    setEditingVehicle(null);
    setFormData({
      make: "",
      model: "",
      categoryName: "Sedan",
      vehicleClass: "Executive",
      registrationNumber: "",
      transmission: "Manual",
      fuelType: "Diesel",
      capacity: "4",
      perKmRate: "14",
      perHourRate: "150",
      driverAllowance: "500",
      nightAllowance: "300",
      rcNumber: "",
      rcDocName: "",
      insuranceProvider: "HDFC ERGO General Insurance",
      insuranceNumber: "POL-8829102",
      insuranceDocName: "",
      insuranceExpiry: "2027-06-30",
      fitnessExpiry: "2027-12-31",
      fitnessDocName: "",
      allIndiaPermitExpiry: "2028-03-15",
      allIndiaPermitDocName: "",
      yearlyPermitExpiry: "2027-03-15",
      yearlyPermitDocName: "",
      pucExpiry: "2026-11-30",
      pucDocName: "",
      imageName: "",
      imageUrl: ""
    });
    setShowModal(true);
  };

  const openEditModal = (v: any) => {
    setEditingVehicle(v);
    setFormData({
      make: v.make || "",
      model: v.model || "",
      categoryName: v.categoryName || "Sedan",
      vehicleClass: v.vehicleClass || CLASS_OPTIONS[v.categoryName || "Sedan"]?.[0] || "Executive",
      registrationNumber: v.registrationNumber || "",
      transmission: v.transmission || "Manual",
      fuelType: v.fuelType || "Diesel",
      capacity: String(v.capacity || 4),
      perKmRate: String(v.perKmRate || 14),
      perHourRate: String(v.perHourRate || 150),
      driverAllowance: String(v.driverAllowance || 500),
      nightAllowance: String(v.nightAllowance || 300),
      rcNumber: v.rcNumber || "",
      rcDocName: v.rcDocName || "",
      insuranceProvider: v.insuranceProvider || "HDFC ERGO General Insurance",
      insuranceNumber: v.insuranceNumber || "POL-8829102",
      insuranceDocName: v.insuranceDocName || "",
      insuranceExpiry: v.insuranceExpiry || "2027-06-30",
      fitnessExpiry: v.fitnessExpiry || "2027-12-31",
      fitnessDocName: v.fitnessDocName || "",
      allIndiaPermitExpiry: v.allIndiaPermitExpiry || "2028-03-15",
      allIndiaPermitDocName: v.allIndiaPermitDocName || "",
      yearlyPermitExpiry: v.yearlyPermitExpiry || "2027-03-15",
      yearlyPermitDocName: v.yearlyPermitDocName || "",
      pucExpiry: v.pucExpiry || "2026-11-30",
      pucDocName: v.pucDocName || "",
      imageName: v.imageName || "",
      imageUrl: v.imageUrl || ""
    });
    setShowModal(true);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    let updatedList: any[] = [];
    if (editingVehicle) {
      updatedList = vehicles.map((v) => {
        if (v.id === editingVehicle.id) {
          return {
            ...v,
            make: formData.make,
            model: formData.model,
            categoryName: formData.categoryName,
            vehicleClass: formData.vehicleClass,
            registrationNumber: formData.registrationNumber,
            transmission: formData.transmission,
            fuelType: formData.fuelType,
            capacity: parseInt(formData.capacity) || 4,
            perKmRate: parseFloat(formData.perKmRate) || 14,
            perHourRate: parseFloat(formData.perHourRate) || 150,
            driverAllowance: parseFloat(formData.driverAllowance) || 500,
            nightAllowance: parseFloat(formData.nightAllowance) || 300,
            rcNumber: formData.rcNumber,
            rcDocName: formData.rcDocName,
            insuranceProvider: formData.insuranceProvider,
            insuranceNumber: formData.insuranceNumber,
            insuranceDocName: formData.insuranceDocName,
            insuranceExpiry: formData.insuranceExpiry,
            fitnessExpiry: formData.fitnessExpiry,
            fitnessDocName: formData.fitnessDocName,
            permitExpiry: formData.allIndiaPermitExpiry,
            allIndiaPermitExpiry: formData.allIndiaPermitExpiry,
            allIndiaPermitDocName: formData.allIndiaPermitDocName,
            yearlyPermitExpiry: formData.yearlyPermitExpiry,
            yearlyPermitDocName: formData.yearlyPermitDocName,
            pucExpiry: formData.pucExpiry,
            pucDocName: formData.pucDocName,
            imageName: formData.imageName,
            imageUrl: formData.imageUrl
          };
        }
        return v;
      });
    } else {
      const created = {
        id: `v-${Date.now()}`,
        make: formData.make || "Commercial Make",
        model: formData.model || "Commercial Vehicle",
        categoryName: formData.categoryName,
        vehicleClass: formData.vehicleClass,
        registrationNumber: formData.registrationNumber || `MH 04 XX ${Math.floor(1000 + Math.random() * 9000)}`,
        transmission: formData.transmission,
        fuelType: formData.fuelType,
        capacity: parseInt(formData.capacity) || 4,
        perKmRate: parseFloat(formData.perKmRate) || 14,
        perHourRate: parseFloat(formData.perHourRate) || 150,
        driverAllowance: parseFloat(formData.driverAllowance) || 500,
        nightAllowance: parseFloat(formData.nightAllowance) || 300,
        rcNumber: formData.rcNumber,
        rcDocName: formData.rcDocName,
        insuranceProvider: formData.insuranceProvider,
        insuranceNumber: formData.insuranceNumber,
        insuranceDocName: formData.insuranceDocName,
        insuranceExpiry: formData.insuranceExpiry,
        fitnessExpiry: formData.fitnessExpiry,
        fitnessDocName: formData.fitnessDocName,
        permitExpiry: formData.allIndiaPermitExpiry,
        allIndiaPermitExpiry: formData.allIndiaPermitExpiry,
        allIndiaPermitDocName: formData.allIndiaPermitDocName,
        yearlyPermitExpiry: formData.yearlyPermitExpiry,
        yearlyPermitDocName: formData.yearlyPermitDocName,
        pucExpiry: formData.pucExpiry,
        pucDocName: formData.pucDocName,
        isAvailable: true,
        permitStatus: "VALID",
        imageName: formData.imageName,
        imageUrl: formData.imageUrl
      };
      updatedList = [created, ...vehicles];
    }

    setVehicles(updatedList);
    localStorage.setItem("user_uploaded_fleet", JSON.stringify(updatedList));

    try {
      if (editingVehicle) {
        await fetch(`/api/fleet/${editingVehicle.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData)
        });
      } else {
        await fetch("/api/fleet", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(updatedList[0])
        });
      }
    } catch (err) {
      console.error("Save vehicle API error:", err);
    }

    setShowModal(false);
  };

  const handleDeleteVehicle = (v: any) => {
    const confirmDel = confirm(`Are you sure you want to delete ${v.make} ${v.model} (${v.registrationNumber})?`);
    if (confirmDel) {
      const updated = vehicles.filter(item => item.id !== v.id);
      setVehicles(updated);
      setSelectedIds(selectedIds.filter(id => id !== v.id));
      localStorage.setItem("user_uploaded_fleet", JSON.stringify(updated));
      fetch(`/api/fleet/${v.id}`, { method: "DELETE" }).catch(e => console.error(e));
    }
  };

  const handleSelectToggle = (id: string) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter(i => i !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };

  const filteredVehicles = vehicles.filter((v) => {
    const matchesSearch =
      v.model.toLowerCase().includes(search.toLowerCase()) ||
      v.make.toLowerCase().includes(search.toLowerCase()) ||
      v.registrationNumber.toLowerCase().includes(search.toLowerCase());
    const matchesCat = categoryFilter === "ALL" || v.categoryName.toUpperCase() === categoryFilter.toUpperCase();
    return matchesSearch && matchesCat;
  });

  const handleSelectAll = () => {
    if (selectedIds.length === filteredVehicles.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredVehicles.map(v => v.id));
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-amber-500/20 pb-6">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-3xl font-black tracking-tight text-slate-50">
              Commercial Fleet Roster & Vault Compliance
            </h1>
            <span className="bg-amber-500/10 text-amber-400 border border-amber-500/30 text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-widest">
              {vehicles.length} Uploaded Vehicles
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Complete vehicle specs, Category/Class hierarchy, RC, Insurance, Permits, PUC uploads, and Document Vault auto-archiving.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              if (confirm("Are you sure you want to clear all stored vehicle roster data? You will be able to upload your fresh vehicles clean.")) {
                localStorage.removeItem("user_uploaded_fleet");
                setVehicles([]);
              }
            }}
            className="px-3.5 py-2 bg-slate-900 border border-white/10 hover:border-rose-400 text-slate-400 hover:text-rose-400 rounded-xl text-xs font-bold transition-all cursor-pointer"
          >
            Clear Stored Roster
          </button>
          <button
            onClick={openAddModal}
            className="flex items-center gap-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all shadow-lg shadow-amber-500/20 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add Vehicle</span>
          </button>
        </div>
      </div>

      {/* Search & Category Filter Toolbar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-slate-900/60 p-4 rounded-2xl border border-white/10">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by make, model or reg number..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-950 border border-white/10 rounded-xl pl-9 pr-4 py-2 text-xs text-slate-100 focus:outline-none focus:border-amber-400"
          />
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            {["ALL", "SEDAN", "SUV"].map((cat) => (
              <button
                key={cat}
                onClick={() => setCategoryFilter(cat)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  categoryFilter === cat
                    ? "bg-amber-500 text-slate-950 font-black"
                    : "bg-slate-950 text-slate-400 hover:text-white border border-white/5"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Fleet Vehicles Grid */}
      {filteredVehicles.length === 0 ? (
        <div className="bg-slate-900/60 border border-white/10 rounded-3xl p-12 text-center space-y-4">
          <Car className="w-12 h-12 text-amber-400 mx-auto opacity-80" />
          <div className="space-y-1">
            <h3 className="text-xl font-bold text-slate-100">No Uploaded Vehicles Found</h3>
            <p className="text-xs text-slate-400 max-w-md mx-auto">
              Your fleet roster is clean and empty. Click "Add Vehicle" above to upload your vehicles and documents.
            </p>
          </div>
          <button
            onClick={openAddModal}
            className="px-6 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-black rounded-xl text-xs uppercase tracking-wider shadow-lg shadow-amber-500/20 cursor-pointer"
          >
            + Upload Vehicle Now
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredVehicles.map((v) => {
            const isSelected = selectedIds.includes(v.id);
            return (
              <div
                key={v.id}
                className={`bg-slate-900/80 backdrop-blur-xl border rounded-2xl p-6 shadow-xl space-y-4 transition-all flex flex-col justify-between relative ${
                  isSelected ? "border-amber-400 bg-amber-500/5 ring-1 ring-amber-400/40" : "border-white/10 hover:border-amber-500/40"
                }`}
              >
                <div className="space-y-3">
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleSelectToggle(v.id)}
                        className="text-slate-400 hover:text-amber-400 cursor-pointer"
                      >
                        {isSelected ? (
                          <CheckSquare className="w-4 h-4 text-amber-400" />
                        ) : (
                          <Square className="w-4 h-4 text-slate-600" />
                        )}
                      </button>
                      <span className="text-[10px] font-mono text-amber-400 font-bold uppercase tracking-wider bg-amber-500/10 px-2.5 py-0.5 rounded-full border border-amber-500/20">
                        {v.categoryName || "Sedan"} &bull; {v.vehicleClass || "Executive"}
                      </span>
                    </div>
                    <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-0.5 rounded-full">
                      READY FOR DUTY
                    </span>
                  </div>

                  {/* Vehicle Image Banner */}
                  <div className="relative h-40 bg-slate-950 rounded-xl overflow-hidden border border-white/5 group">
                    <img
                      src={v.imageUrl || "/images/hero-car.png"}
                      alt={`${v.make} ${v.model}`}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      onError={(e) => {
                        (e.target as HTMLElement).setAttribute("src", "/images/hero-car.png");
                      }}
                    />
                    {v.isFeatured && (
                      <div className="absolute top-2 right-2 bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 px-2.5 py-0.5 rounded-full text-[9px] font-black flex items-center gap-1 shadow-lg tracking-wider">
                        <Sparkles className="w-3 h-3 fill-slate-950" />
                        <span>HOMEPAGE FEATURED</span>
                      </div>
                    )}
                  </div>

                  <div>
                    <h3 className="font-extrabold text-slate-100 text-lg leading-tight">
                      {v.make} {v.model}
                    </h3>
                    <div className="text-xs font-mono text-amber-400 font-bold mt-0.5">{v.registrationNumber}</div>
                  </div>

                  {/* Specs & Tariffs Grid */}
                  <div className="grid grid-cols-2 gap-2 bg-slate-950 p-3 rounded-xl border border-white/5 text-xs font-mono">
                    <div>
                      <span className="text-slate-500 text-[10px] block font-sans">Per Km Rate</span>
                      <span className="font-bold text-amber-400">₹{v.perKmRate} / Km</span>
                    </div>
                    <div>
                      <span className="text-slate-500 text-[10px] block font-sans">Per Hour Rate</span>
                      <span className="font-bold text-amber-400">₹{v.perHourRate || 150} / Hr</span>
                    </div>
                    <div>
                      <span className="text-slate-500 text-[10px] block font-sans">Driver Day Allowance</span>
                      <span className="font-bold text-slate-300">₹{v.driverAllowance || 500}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 text-[10px] block font-sans">Night Halt Allowance</span>
                      <span className="font-bold text-slate-300">₹{v.nightAllowance || 300}</span>
                    </div>
                  </div>
                </div>

                {/* Footer Action Icons */}
                <div className="pt-3 border-t border-white/5 flex items-center justify-between text-[11px]">
                  <span className="font-mono text-slate-400">
                    Permit Exp: <strong className="text-emerald-400">{v.allIndiaPermitExpiry || v.permitExpiry || "2028-03-15"}</strong>
                  </span>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        const currentFeatured = vehicles.filter(item => item.isFeatured);
                        if (!v.isFeatured && currentFeatured.length >= 3) {
                          alert("Maximum 3 vehicles can be featured on the homepage showcase. Please unstar a vehicle first.");
                          return;
                        }
                        const newFeaturedState = !v.isFeatured;
                        const updated = vehicles.map(item => item.id === v.id ? { ...item, isFeatured: newFeaturedState } : item);
                        setVehicles(updated);
                        localStorage.setItem("user_uploaded_fleet", JSON.stringify(updated));
                      }}
                      className={`p-1.5 bg-slate-950 border rounded-lg transition-all cursor-pointer ${
                        v.isFeatured
                          ? "border-amber-400 text-amber-400 bg-amber-500/10 shadow-sm"
                          : "border-white/10 text-slate-500 hover:text-amber-400"
                      }`}
                      title={v.isFeatured ? "Featured on Homepage (Click to Unstar)" : "Star to Feature on Homepage (Max 3)"}
                    >
                      <Sparkles className={`w-4 h-4 ${v.isFeatured ? "fill-amber-400 text-amber-400 animate-pulse" : ""}`} />
                    </button>
                    <button
                      onClick={() => openEditModal(v)}
                      className="p-1.5 bg-slate-950 border border-white/10 hover:border-amber-400 rounded-lg text-slate-400 hover:text-amber-400 transition-all cursor-pointer"
                      title="Edit Vehicle Specs & Uploads"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteVehicle(v)}
                      className="p-1.5 bg-slate-950 border border-white/10 hover:border-rose-400 rounded-lg text-slate-400 hover:text-rose-400 transition-all cursor-pointer"
                      title="Delete Vehicle"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Complete Rearranged Add / Edit Vehicle Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-amber-500/30 rounded-3xl p-6 sm:p-8 w-full max-w-3xl shadow-2xl space-y-6 relative text-slate-100 max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setShowModal(false)}
              className="absolute top-5 right-5 text-slate-400 hover:text-white cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="space-y-1 border-b border-white/10 pb-3">
              <span className="text-[10px] font-bold uppercase text-amber-400 tracking-wider">
                {editingVehicle ? "Edit Commercial Vehicle & Vault Uploads" : "Master Commercial Fleet Entry"}
              </span>
              <h3 className="text-2xl font-black text-slate-50">
                {editingVehicle ? `Edit ${editingVehicle.make} ${editingVehicle.model}` : "Add Commercial Vehicle"}
              </h3>
            </div>

            <form onSubmit={handleFormSubmit} className="space-y-5 text-xs">
              {/* Section 1: Vehicle Brand, Model & Category Hierarchy */}
              <div className="space-y-3">
                <h4 className="text-amber-400 font-extrabold uppercase text-[11px] tracking-wider flex items-center gap-1.5">
                  <Car className="w-4 h-4" /> 1. Brand, Model Name & Category Hierarchy
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-slate-300 font-bold">1. Vehicle Brand (Make) *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Toyota / Maruti Suzuki / Hyundai"
                      value={formData.make}
                      onChange={(e) => setFormData({ ...formData, make: e.target.value })}
                      className="w-full bg-slate-950 border border-white/10 rounded-xl px-3.5 py-2.5 text-slate-100 focus:outline-none focus:border-amber-400 font-semibold"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-slate-300 font-bold">2. Vehicle Model Name *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Innova Crysta / Swift Dzire / Fortuner"
                      value={formData.model}
                      onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                      className="w-full bg-slate-950 border border-white/10 rounded-xl px-3.5 py-2.5 text-slate-100 focus:outline-none focus:border-amber-400 font-semibold"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="space-y-1">
                    <label className="text-slate-300 font-bold">3. Vehicle Category *</label>
                    <select
                      value={formData.categoryName}
                      onChange={(e) => handleCategoryChange(e.target.value)}
                      className="w-full bg-slate-950 border border-white/10 rounded-xl px-3.5 py-2.5 text-slate-100 focus:outline-none focus:border-amber-400 font-bold text-amber-400"
                    >
                      <option value="Sedan">Sedan</option>
                      <option value="SUV">SUV</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-slate-300 font-bold">4. Vehicle Class *</label>
                    <select
                      value={formData.vehicleClass}
                      onChange={(e) => setFormData({ ...formData, vehicleClass: e.target.value })}
                      className="w-full bg-slate-950 border border-white/10 rounded-xl px-3.5 py-2.5 text-slate-100 focus:outline-none focus:border-amber-400 font-semibold"
                    >
                      {(CLASS_OPTIONS[formData.categoryName] || []).map((cls) => (
                        <option key={cls} value={cls}>
                          {cls}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-slate-300 font-bold">5. Registration Number *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. MH 04 ER 8890"
                      value={formData.registrationNumber}
                      onChange={(e) => setFormData({ ...formData, registrationNumber: e.target.value })}
                      className="w-full bg-slate-950 border border-white/10 rounded-xl px-3.5 py-2.5 text-slate-100 focus:outline-none focus:border-amber-400 font-mono font-extrabold text-emerald-400 uppercase"
                    />
                  </div>
                </div>
              </div>

              {/* Section 2: Transmission, Fuel & Tariffs */}
              <div className="space-y-3 pt-3 border-t border-white/10">
                <h4 className="text-amber-400 font-extrabold uppercase text-[11px] tracking-wider flex items-center gap-1.5">
                  <IndianRupee className="w-4 h-4" /> 2. Technical Specs, Rates & Allowances
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="space-y-1">
                    <label className="text-slate-300 font-bold">6. Transmission *</label>
                    <select
                      value={formData.transmission}
                      onChange={(e) => setFormData({ ...formData, transmission: e.target.value })}
                      className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-slate-100 focus:outline-none focus:border-amber-400"
                    >
                      <option value="Manual">Manual</option>
                      <option value="Automatic">Automatic</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-slate-300 font-bold">7. Fuel Type *</label>
                    <select
                      value={formData.fuelType}
                      onChange={(e) => setFormData({ ...formData, fuelType: e.target.value })}
                      className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-slate-100 focus:outline-none focus:border-amber-400"
                    >
                      <option value="Diesel">Diesel</option>
                      <option value="Petrol">Petrol</option>
                      <option value="CNG">CNG</option>
                      <option value="Electric (EV)">Electric (EV)</option>
                      <option value="Hybrid">Hybrid</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-slate-300 font-bold">8. Seating Capacity *</label>
                    <input
                      type="number"
                      required
                      value={formData.capacity}
                      onChange={(e) => setFormData({ ...formData, capacity: e.target.value })}
                      className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-slate-100 focus:outline-none focus:border-amber-400 font-bold"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                  <div className="space-y-1">
                    <label className="text-slate-300 font-bold">9. Per Km Rate (₹) *</label>
                    <input
                      type="number"
                      required
                      value={formData.perKmRate}
                      onChange={(e) => setFormData({ ...formData, perKmRate: e.target.value })}
                      className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-slate-100 focus:outline-none focus:border-amber-400 font-bold text-amber-400"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-slate-300 font-bold">10. Per Hour Rate (₹) *</label>
                    <input
                      type="number"
                      required
                      value={formData.perHourRate}
                      onChange={(e) => setFormData({ ...formData, perHourRate: e.target.value })}
                      className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-slate-100 focus:outline-none focus:border-amber-400 font-bold text-amber-400"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-slate-300 font-bold">11. Driver Day Allowance (₹)</label>
                    <input
                      type="number"
                      value={formData.driverAllowance}
                      onChange={(e) => setFormData({ ...formData, driverAllowance: e.target.value })}
                      className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-slate-100 focus:outline-none focus:border-amber-400 font-semibold"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-slate-300 font-bold">12. Night Halt Allowance (₹)</label>
                    <input
                      type="number"
                      value={formData.nightAllowance}
                      onChange={(e) => setFormData({ ...formData, nightAllowance: e.target.value })}
                      className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-slate-100 focus:outline-none focus:border-amber-400 font-semibold"
                    />
                  </div>
                </div>
              </div>

              {/* Section 3: RC, Insurance & Expiry Documents */}
              <div className="space-y-3 pt-3 border-t border-white/10">
                <h4 className="text-amber-400 font-extrabold uppercase text-[11px] tracking-wider flex items-center gap-1.5">
                  <Shield className="w-4 h-4" /> 3. Vehicle RC, Insurance & Expiry Document Vault Uploads
                </h4>

                {/* RC */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-slate-300 font-bold">13a. Vehicle RC Number *</label>
                    <input
                      type="text"
                      placeholder="e.g. MH04/RC/8890"
                      value={formData.rcNumber}
                      onChange={(e) => setFormData({ ...formData, rcNumber: e.target.value })}
                      className="w-full bg-slate-950 border border-white/10 rounded-xl px-3.5 py-2 text-slate-100 focus:outline-none focus:border-amber-400 font-mono"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-slate-300 font-bold">13b. Upload Vehicle RC Document</label>
                    <input
                      type="file"
                      accept=".pdf,image/*"
                      onChange={(e) => setFormData({ ...formData, rcDocName: e.target.files?.[0]?.name || "" })}
                      className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-slate-300 text-xs file:mr-3 file:py-1 file:px-2.5 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-amber-500 file:text-slate-950 cursor-pointer"
                    />
                  </div>
                </div>

                {/* Insurance */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="space-y-1">
                    <label className="text-slate-300 font-bold">14. Insurance Provider Name</label>
                    <input
                      type="text"
                      placeholder="e.g. HDFC ERGO General Insurance"
                      value={formData.insuranceProvider}
                      onChange={(e) => setFormData({ ...formData, insuranceProvider: e.target.value })}
                      className="w-full bg-slate-950 border border-white/10 rounded-xl px-3.5 py-2 text-slate-100 focus:outline-none focus:border-amber-400"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-slate-300 font-bold">15a. Insurance Policy Number</label>
                    <input
                      type="text"
                      placeholder="e.g. POL-8829102"
                      value={formData.insuranceNumber}
                      onChange={(e) => setFormData({ ...formData, insuranceNumber: e.target.value })}
                      className="w-full bg-slate-950 border border-white/10 rounded-xl px-3.5 py-2 text-slate-100 focus:outline-none focus:border-amber-400 font-mono"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-slate-300 font-bold">15b. Insurance Expiry Date *</label>
                    <input
                      type="date"
                      value={formData.insuranceExpiry}
                      onChange={(e) => setFormData({ ...formData, insuranceExpiry: e.target.value })}
                      className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-slate-100 focus:outline-none focus:border-amber-400 font-mono"
                    />
                  </div>
                </div>

                {/* Fitness & All India Permit */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-slate-300 font-bold">16. Fitness Expiry Date & Upload</label>
                    <div className="flex items-center gap-2">
                      <input
                        type="date"
                        value={formData.fitnessExpiry}
                        onChange={(e) => setFormData({ ...formData, fitnessExpiry: e.target.value })}
                        className="w-1/2 bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-slate-100 focus:outline-none focus:border-amber-400 font-mono"
                      />
                      <input
                        type="file"
                        accept=".pdf,image/*"
                        onChange={(e) => setFormData({ ...formData, fitnessDocName: e.target.files?.[0]?.name || "" })}
                        className="w-1/2 bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-slate-300 text-xs file:mr-2 file:py-1 file:px-2 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-amber-500 file:text-slate-950 cursor-pointer"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-slate-300 font-bold">17. All India Permit Expiry & Upload</label>
                    <div className="flex items-center gap-2">
                      <input
                        type="date"
                        value={formData.allIndiaPermitExpiry}
                        onChange={(e) => setFormData({ ...formData, allIndiaPermitExpiry: e.target.value })}
                        className="w-1/2 bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-slate-100 focus:outline-none focus:border-amber-400 font-mono"
                      />
                      <input
                        type="file"
                        accept=".pdf,image/*"
                        onChange={(e) => setFormData({ ...formData, allIndiaPermitDocName: e.target.files?.[0]?.name || "" })}
                        className="w-1/2 bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-slate-300 text-xs file:mr-2 file:py-1 file:px-2 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-amber-500 file:text-slate-950 cursor-pointer"
                      />
                    </div>
                  </div>
                </div>

                {/* Yearly Permit & PUC */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-slate-300 font-bold">18. Yearly Permit Expiry & Upload</label>
                    <div className="flex items-center gap-2">
                      <input
                        type="date"
                        value={formData.yearlyPermitExpiry}
                        onChange={(e) => setFormData({ ...formData, yearlyPermitExpiry: e.target.value })}
                        className="w-1/2 bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-slate-100 focus:outline-none focus:border-amber-400 font-mono"
                      />
                      <input
                        type="file"
                        accept=".pdf,image/*"
                        onChange={(e) => setFormData({ ...formData, yearlyPermitDocName: e.target.files?.[0]?.name || "" })}
                        className="w-1/2 bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-slate-300 text-xs file:mr-2 file:py-1 file:px-2 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-amber-500 file:text-slate-950 cursor-pointer"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-slate-300 font-bold">19. PUC Expiry & Upload</label>
                    <div className="flex items-center gap-2">
                      <input
                        type="date"
                        value={formData.pucExpiry}
                        onChange={(e) => setFormData({ ...formData, pucExpiry: e.target.value })}
                        className="w-1/2 bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-slate-100 focus:outline-none focus:border-amber-400 font-mono"
                      />
                      <input
                        type="file"
                        accept=".pdf,image/*"
                        onChange={(e) => setFormData({ ...formData, pucDocName: e.target.files?.[0]?.name || "" })}
                        className="w-1/2 bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-slate-300 text-xs file:mr-2 file:py-1 file:px-2 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-amber-500 file:text-slate-950 cursor-pointer"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Section 4: Device Image Upload with Live Preview */}
              <div className="space-y-2 pt-3 border-t border-white/10">
                <label className="text-slate-300 font-bold block">20. Vehicle Image Upload from Device (with Live Preview)</label>
                <div className="flex items-center gap-4 bg-slate-950 p-3 rounded-2xl border border-white/5">
                  {formData.imageUrl ? (
                    <img src={formData.imageUrl} alt="Vehicle Preview" className="w-20 h-14 object-cover rounded-xl border-2 border-amber-400" />
                  ) : (
                    <div className="w-20 h-14 bg-slate-900 border border-dashed border-white/20 rounded-xl flex items-center justify-center text-slate-500 font-bold text-[10px]">
                      No Image
                    </div>
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        const reader = new FileReader();
                        reader.onload = (event) => {
                          setFormData(prev => ({
                            ...prev,
                            imageName: file.name,
                            imageUrl: event.target?.result as string
                          }));
                        };
                        reader.readAsDataURL(file);
                      }
                    }}
                    className="w-full bg-slate-900 border border-white/10 rounded-xl px-3 py-2 text-slate-300 text-xs file:mr-3 file:py-1 file:px-2.5 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-amber-500 file:text-slate-950 cursor-pointer"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-white/10 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-5 py-2.5 bg-slate-950 text-slate-400 hover:text-white rounded-xl text-xs font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-black rounded-xl text-xs uppercase tracking-wider shadow-lg shadow-amber-500/20 cursor-pointer"
                >
                  {editingVehicle ? "Update Vehicle Specs" : "Save Commercial Vehicle"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
