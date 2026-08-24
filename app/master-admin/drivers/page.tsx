"use client";

import React, { useState, useEffect } from "react";
import {
  UserCheck,
  Plus,
  Search,
  PhoneCall,
  ShieldCheck,
  Car,
  CheckCircle2,
  X,
  BadgeCheck,
  Edit2,
  Trash2,
  CheckSquare,
  Square,
  Landmark,
  Cake,
  Calendar,
  RefreshCw
} from "lucide-react";

// Category to Class Mapping Hierarchy
const CLASS_OPTIONS: Record<string, string[]> = {
  Sedan: ["Compact", "Executive", "Premium Executive", "Luxury"],
  SUV: ["Subcompact/Urban", "Mid-Premium", "Premium", "Luxury"]
};

// Age calculation helper
function calculateAge(dobString: string): number | null {
  if (!dobString) return null;
  const birth = new Date(dobString);
  if (isNaN(birth.getTime())) return null;
  const now = new Date();
  let age = now.getFullYear() - birth.getFullYear();
  const m = now.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && now.getDate() < birth.getDate())) {
    age--;
  }
  return age >= 0 ? age : null;
}

export default function MasterDriversPage() {
  const [search, setSearch] = useState("");
  const [filterDuty, setFilterDuty] = useState("ALL");
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingDriver, setEditingDriver] = useState<any | null>(null);
  const [selectedDriver, setSelectedDriver] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  // Multi-selection state
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const [drivers, setDrivers] = useState<any[]>([]);

  // Complete Form State with Photo Preview & DOB Age Calculation
  const [formData, setFormData] = useState({
    photoName: "",
    photoUrl: "",
    name: "",
    dob: "1992-06-15",
    phone: "",
    aadhaarNumber: "",
    aadhaarDocName: "",
    panNumber: "",
    panDocName: "",
    licenseNumber: "",
    licenseDocName: "",
    licenseExpiry: "2029-08-15",
    bankName: "HDFC Bank",
    accountHolderName: "",
    accountNumber: "",
    confirmAccountNumber: "",
    ifscCode: "HDFC0000123",
    vehicleCategory: "Sedan",
    vehicleClass: "Executive",
    vehicleModel: "Maruti Suzuki Dzire"
  });

  // Load local storage
  useEffect(() => {
    let hasLocal = false;
    const saved = localStorage.getItem("user_uploaded_drivers");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setDrivers(parsed);
          setLoading(false);
          hasLocal = true;
        }
      } catch (e) {
        console.error(e);
      }
    }
    if (!hasLocal) {
      setLoading(true);
    }

    const loadDrivers = async () => {
      try {
        const res = await fetch("/api/admin/drivers");
        if (res.ok) {
          const apiList = await res.json();
          if (Array.isArray(apiList) && apiList.length > 0) {
            setDrivers(prev => (prev.length > 0 ? prev : apiList));
          }
        }
      } catch (e) {
        console.error("Failed to fetch drivers from API:", e);
      } finally {
        setLoading(false);
      }
    };

    loadDrivers();
  }, []);

  const handleCategoryChange = (cat: string) => {
    const defaultClass = CLASS_OPTIONS[cat]?.[0] || "Executive";
    setFormData(prev => ({ ...prev, vehicleCategory: cat, vehicleClass: defaultClass }));
  };

  const openAddModal = () => {
    setEditingDriver(null);
    setFormData({
      photoName: "",
      photoUrl: "",
      name: "",
      dob: "1992-06-15",
      phone: "",
      aadhaarNumber: "",
      aadhaarDocName: "",
      panNumber: "",
      panDocName: "",
      licenseNumber: "",
      licenseDocName: "",
      licenseExpiry: "2029-08-15",
      bankName: "HDFC Bank",
      accountHolderName: "",
      accountNumber: "",
      confirmAccountNumber: "",
      ifscCode: "HDFC0000123",
      vehicleCategory: "Sedan",
      vehicleClass: "Executive",
      vehicleModel: "Maruti Suzuki Dzire"
    });
    setShowAddModal(true);
  };

  const openEditModal = (drv: any) => {
    setEditingDriver(drv);
    setFormData({
      photoName: drv.photoName || "",
      photoUrl: drv.photoUrl || "",
      name: drv.name || "",
      dob: drv.dob || "1992-06-15",
      phone: drv.phone || "",
      aadhaarNumber: drv.aadhaarNumber || "",
      aadhaarDocName: drv.aadhaarDocName || "",
      panNumber: drv.panNumber || "",
      panDocName: drv.panDocName || "",
      licenseNumber: drv.licenseNumber || "",
      licenseDocName: drv.licenseDocName || "",
      licenseExpiry: drv.licenseExpiry || "2029-08-15",
      bankName: drv.bankName || "HDFC Bank",
      accountHolderName: drv.accountHolderName || drv.name || "",
      accountNumber: drv.accountNumber || "",
      confirmAccountNumber: drv.accountNumber || "",
      ifscCode: drv.ifscCode || "HDFC0000123",
      vehicleCategory: drv.vehicleCategory || "Sedan",
      vehicleClass: drv.vehicleClass || CLASS_OPTIONS[drv.vehicleCategory || "Sedan"]?.[0] || "Executive",
      vehicleModel: drv.vehicleModel || "Maruti Suzuki Dzire"
    });
    setShowAddModal(true);
  };

  const handleDriverFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.accountNumber !== formData.confirmAccountNumber) {
      alert("Bank Account Number and Confirm Account Number do not match!");
      return;
    }

    let updated: any[] = [];
    if (editingDriver) {
      updated = drivers.map(d => {
        if (d.id === editingDriver.id) {
          return {
            ...d,
            name: formData.name,
            dob: formData.dob,
            phone: formData.phone,
            photoName: formData.photoName,
            photoUrl: formData.photoUrl,
            aadhaarNumber: formData.aadhaarNumber,
            aadhaarDocName: formData.aadhaarDocName,
            panNumber: formData.panNumber,
            panDocName: formData.panDocName,
            licenseNumber: formData.licenseNumber,
            licenseDocName: formData.licenseDocName,
            licenseExpiry: formData.licenseExpiry,
            bankName: formData.bankName,
            accountHolderName: formData.accountHolderName,
            accountNumber: formData.accountNumber,
            ifscCode: formData.ifscCode,
            vehicleCategory: formData.vehicleCategory,
            vehicleClass: formData.vehicleClass,
            vehicleModel: formData.vehicleModel
          };
        }
        return d;
      });
    } else {
      const created = {
        id: `DRV-${Date.now()}`,
        name: formData.name || "Commercial Driver",
        dob: formData.dob,
        phone: formData.phone || "9820001122",
        photoName: formData.photoName,
        photoUrl: formData.photoUrl,
        aadhaarNumber: formData.aadhaarNumber || "9900 8877 6655",
        aadhaarDocName: formData.aadhaarDocName,
        panNumber: formData.panNumber || "ABCDE1234F",
        panDocName: formData.panDocName,
        licenseNumber: formData.licenseNumber || "MH-022023001122",
        licenseDocName: formData.licenseDocName,
        licenseExpiry: formData.licenseExpiry || "2030-12-31",
        bankName: formData.bankName || "HDFC Bank",
        accountHolderName: formData.accountHolderName || formData.name,
        accountNumber: formData.accountNumber || "501009876543",
        ifscCode: formData.ifscCode || "HDFC0000123",
        vehicleCategory: formData.vehicleCategory,
        vehicleClass: formData.vehicleClass,
        vehicleModel: formData.vehicleModel,
        policeVerification: "VERIFIED",
        status: "STANDBY"
      };
      updated = [created, ...drivers];
    }

    setDrivers(updated);
    localStorage.setItem("user_uploaded_drivers", JSON.stringify(updated));

    // Sync to backend DB
    try {
      if (editingDriver) {
        await fetch(`/api/admin/drivers/${editingDriver.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: formData.name,
            phone: formData.phone,
            email: `${formData.name.toLowerCase().replace(/\s+/g, '')}@temptravel.in`,
            dob: formData.dob,
            photoUrl: formData.photoUrl,
            aadhaarNumber: formData.aadhaarNumber,
            panNumber: formData.panNumber,
            licenseNumber: formData.licenseNumber
          })
        });
      } else {
        await fetch("/api/admin/drivers", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: formData.name,
            phone: formData.phone,
            email: `${formData.name.toLowerCase().replace(/\s+/g, '')}${Date.now().toString().slice(-4)}@temptravel.in`,
            dob: formData.dob,
            photoUrl: formData.photoUrl,
            aadhaarNumber: formData.aadhaarNumber,
            panNumber: formData.panNumber,
            licenseNumber: formData.licenseNumber
          })
        });
      }
    } catch (err) {
      console.error("Save driver API error:", err);
    }

    setShowAddModal(false);
  };

  const handleDeleteDriver = (drv: any) => {
    const confirmDel = confirm(`Are you sure you want to remove driver ${drv.name}?`);
    if (confirmDel) {
      const updated = drivers.filter(d => d.id !== drv.id);
      setDrivers(updated);
      setSelectedIds(selectedIds.filter(id => id !== drv.id));
      localStorage.setItem("user_uploaded_drivers", JSON.stringify(updated));
      fetch(`/api/admin/drivers/${drv.id}`, { method: "DELETE" }).catch(e => console.error(e));
    }
  };

  const handleSelectToggle = (id: string) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter(i => i !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };

  const filteredDrivers = drivers.filter((drv) => {
    const matchesSearch =
      drv.name.toLowerCase().includes(search.toLowerCase()) ||
      drv.phone.includes(search) ||
      drv.aadhaarNumber.includes(search) ||
      drv.panNumber.toLowerCase().includes(search.toLowerCase());
    const matchesDuty = filterDuty === "ALL" || drv.status === filterDuty;
    return matchesSearch && matchesDuty;
  });

  const computedAge = calculateAge(formData.dob);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-white/10 pb-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-50 tracking-tight flex items-center gap-2">
            <UserCheck className="w-6 h-6 text-amber-400" />
            <span>Master Chauffeur Roster & License Expiry Vault</span>
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Manage driver profiles, DOB age calculation, License/Aadhaar/PAN document uploads, and automatic Vault archiving.
          </p>
        </div>

        <button
          onClick={openAddModal}
          className="flex items-center gap-1.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 px-3.5 py-1.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all shadow-md shadow-amber-500/20 cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Register New Driver</span>
        </button>
      </div>

      {/* Search & Filter Toolbar */}
      <div className="bg-slate-900/60 p-4 rounded-xl border border-white/5 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search driver by name, phone, Aadhaar, or PAN..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-950 border border-white/10 rounded-lg pl-9 pr-4 py-2 text-xs text-slate-100 focus:outline-none focus:border-amber-400"
          />
        </div>
      </div>

      {/* Driver Cards Grid */}
      {loading && drivers.length === 0 ? (
        <div className="bg-slate-900/60 border border-white/10 rounded-3xl p-16 text-center space-y-4">
          <RefreshCw className="w-10 h-10 text-amber-400 mx-auto animate-spin" />
          <div className="space-y-1">
            <h3 className="text-base font-bold text-slate-100">Loading Master Chauffeur Roster...</h3>
            <p className="text-xs text-slate-400">Verifying driver KYC, license validity and document vault records.</p>
          </div>
        </div>
      ) : filteredDrivers.length === 0 ? (
        <div className="bg-slate-900/60 border border-white/10 rounded-3xl p-12 text-center space-y-4">
          <UserCheck className="w-12 h-12 text-amber-400 mx-auto opacity-80" />
          <div className="space-y-1">
            <h3 className="text-xl font-bold text-slate-100">No Registered Drivers Found</h3>
            <p className="text-xs text-slate-400 max-w-md mx-auto">
              Your driver roster is clean and empty. Click "Register New Driver" above to onboard chauffeurs and upload KYC documents.
            </p>
          </div>
          <button
            onClick={openAddModal}
            className="px-6 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-black rounded-xl text-xs uppercase tracking-wider shadow-lg shadow-amber-500/20 cursor-pointer"
          >
            + Register Driver Now
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredDrivers.map((drv) => {
          const isSelected = selectedIds.includes(drv.id);
          const age = calculateAge(drv.dob);
          return (
            <div
              key={drv.id}
              className={`bg-slate-900/80 backdrop-blur-xl border rounded-2xl p-6 shadow-xl space-y-4 transition-all flex flex-col justify-between relative ${
                isSelected ? "border-amber-400 bg-amber-500/5 ring-1 ring-amber-400/40" : "border-white/10 hover:border-amber-500/40"
              }`}
            >
              <div className="space-y-3">
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-2.5">
                    <button
                      onClick={() => handleSelectToggle(drv.id)}
                      className="text-slate-400 hover:text-amber-400 cursor-pointer"
                    >
                      {isSelected ? (
                        <CheckSquare className="w-4 h-4 text-amber-400" />
                      ) : (
                        <Square className="w-4 h-4 text-slate-600" />
                      )}
                    </button>
                    {drv.photoUrl ? (
                      <img src={drv.photoUrl} alt={drv.name} className="w-10 h-10 rounded-xl object-cover border border-amber-400/40" />
                    ) : (
                      <div className="w-9 h-9 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 font-black text-sm">
                        {drv.name.charAt(0)}
                      </div>
                    )}
                    <div>
                      <h3 className="font-bold text-slate-100 text-sm">{drv.name}</h3>
                      <div className="text-[11px] font-mono text-slate-400">+91-{drv.phone}</div>
                    </div>
                  </div>
                  {age !== null && (
                    <span className="text-[10px] font-black text-amber-300 bg-amber-500/10 border border-amber-500/30 px-2 py-0.5 rounded-full flex items-center gap-1">
                      <Cake className="w-3 h-3 text-amber-400" />
                      <span>{age} Yrs</span>
                    </span>
                  )}
                </div>

                <div className="space-y-1.5 bg-slate-950 p-3 rounded-xl border border-white/5 text-xs font-mono">
                  <div className="flex justify-between">
                    <span className="text-slate-400 font-sans">Driving License:</span>
                    <span className="text-amber-400 font-bold">{drv.licenseNumber}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400 font-sans">License Expiry:</span>
                    <span className="text-emerald-400 font-bold">{drv.licenseExpiry || "2029-08-15"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400 font-sans">Aadhaar:</span>
                    <span className="text-slate-200">{drv.aadhaarNumber}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400 font-sans">Bank Account:</span>
                    <span className="text-slate-300 font-bold">{drv.bankName} ({drv.accountNumber.slice(-4)})</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-3 border-t border-white/5 flex items-center justify-between">
                <button
                  onClick={() => setSelectedDriver(drv)}
                  className="text-[11px] font-bold text-slate-300 hover:text-amber-400 transition-colors cursor-pointer"
                >
                  Inspect File
                </button>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => openEditModal(drv)}
                    className="p-1.5 bg-slate-950 border border-white/10 hover:border-amber-400 rounded-lg text-slate-400 hover:text-amber-400 transition-all cursor-pointer"
                    title="Edit Driver Profile"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDeleteDriver(drv)}
                    className="p-1.5 bg-slate-950 border border-white/10 hover:border-rose-400 rounded-lg text-slate-400 hover:text-rose-400 transition-all cursor-pointer"
                    title="Delete Driver Account"
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

      {/* Add / Edit Driver Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-amber-500/30 rounded-3xl p-6 sm:p-8 w-full max-w-2xl shadow-2xl space-y-6 relative text-slate-100 max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setShowAddModal(false)}
              className="absolute top-5 right-5 text-slate-400 hover:text-white cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="space-y-1 border-b border-white/10 pb-3">
              <span className="text-[10px] font-bold uppercase text-amber-400 tracking-wider">
                {editingDriver ? "Edit Chauffeur Credentials" : "Master Chauffeur Onboarding"}
              </span>
              <h3 className="text-2xl font-black text-slate-50">
                {editingDriver ? `Edit ${editingDriver.name}` : "Register New Driver"}
              </h3>
            </div>

            <form onSubmit={handleDriverFormSubmit} className="space-y-6 text-xs">
              {/* Photo Upload with Live Preview */}
              <div className="space-y-2 bg-slate-950 p-4 rounded-2xl border border-white/5">
                <label className="text-slate-300 font-bold block">1. Driver Photo Upload from Device (with Live Preview)</label>
                <div className="flex items-center gap-4">
                  {formData.photoUrl ? (
                    <img src={formData.photoUrl} alt="Preview" className="w-16 h-16 rounded-2xl object-cover border-2 border-amber-400" />
                  ) : (
                    <div className="w-16 h-16 rounded-2xl bg-slate-900 border border-dashed border-white/20 flex items-center justify-center text-slate-500 font-bold text-xs">
                      No Photo
                    </div>
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        const reader = new FileReader();
                        reader.onload = (ev) => {
                          setFormData({ ...formData, photoName: file.name, photoUrl: ev.target?.result as string });
                        };
                        reader.readAsDataURL(file);
                      }
                    }}
                    className="w-full bg-slate-900 border border-white/10 rounded-xl px-3 py-2 text-slate-300 text-xs file:mr-3 file:py-1 file:px-2.5 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-amber-500 file:text-slate-950 cursor-pointer"
                  />
                </div>
              </div>

              {/* Personal Details & DOB Age Calculation */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-1">
                  <label className="text-slate-300 font-bold">2. Driver Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Rajesh Kumar"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full bg-slate-950 border border-white/10 rounded-xl px-3.5 py-2.5 text-slate-100 focus:outline-none focus:border-amber-400 font-semibold"
                  />
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between items-center">
                    <label className="text-slate-300 font-bold">3. Date of Birth *</label>
                    {computedAge !== null && (
                      <span className="text-[11px] font-black text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-md border border-amber-500/20">
                        {computedAge} Years
                      </span>
                    )}
                  </div>
                  <input
                    type="date"
                    required
                    value={formData.dob}
                    onChange={(e) => setFormData({ ...formData, dob: e.target.value })}
                    className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-slate-100 focus:outline-none focus:border-amber-400 font-mono"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-slate-300 font-bold">4. Mobile Number *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 9820112233"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full bg-slate-950 border border-white/10 rounded-xl px-3.5 py-2.5 text-slate-100 focus:outline-none focus:border-amber-400 font-mono"
                  />
                </div>
              </div>

              {/* KYC & Driving License Section */}
              <div className="space-y-3 pt-3 border-t border-white/10">
                <h4 className="text-amber-400 font-extrabold uppercase text-[11px] tracking-wider flex items-center gap-1.5 border-b border-white/5 pb-1">
                  <ShieldCheck className="w-4 h-4" /> Aadhaar, PAN & Driving License Uploads
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-slate-300 font-bold">5. Aadhaar Card Number *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. 9988 7766 5544"
                      value={formData.aadhaarNumber}
                      onChange={(e) => setFormData({ ...formData, aadhaarNumber: e.target.value })}
                      className="w-full bg-slate-950 border border-white/10 rounded-xl px-3.5 py-2 text-slate-100 focus:outline-none focus:border-amber-400 font-mono"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-slate-300 font-bold">Upload Aadhaar Card from Device</label>
                    <input
                      type="file"
                      accept=".pdf,image/*"
                      onChange={(e) => setFormData({ ...formData, aadhaarDocName: e.target.files?.[0]?.name || "" })}
                      className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-slate-300 text-xs file:mr-3 file:py-1 file:px-2.5 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-amber-500 file:text-slate-950 cursor-pointer"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-slate-300 font-bold">6. PAN Card Number *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. ABCDE1234F"
                      value={formData.panNumber}
                      onChange={(e) => setFormData({ ...formData, panNumber: e.target.value })}
                      className="w-full bg-slate-950 border border-white/10 rounded-xl px-3.5 py-2 text-slate-100 focus:outline-none focus:border-amber-400 font-mono uppercase"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-slate-300 font-bold">Upload PAN Card from Device</label>
                    <input
                      type="file"
                      accept=".pdf,image/*"
                      onChange={(e) => setFormData({ ...formData, panDocName: e.target.files?.[0]?.name || "" })}
                      className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-slate-300 text-xs file:mr-3 file:py-1 file:px-2.5 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-amber-500 file:text-slate-950 cursor-pointer"
                    />
                  </div>
                </div>

                {/* License Number, Upload & Expiry Date */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="space-y-1">
                    <label className="text-slate-300 font-bold">7a. Driving License Number *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. MH-0220190045123"
                      value={formData.licenseNumber}
                      onChange={(e) => setFormData({ ...formData, licenseNumber: e.target.value })}
                      className="w-full bg-slate-950 border border-white/10 rounded-xl px-3.5 py-2 text-slate-100 focus:outline-none focus:border-amber-400 font-mono"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-slate-300 font-bold">7b. Upload Driving License</label>
                    <input
                      type="file"
                      accept=".pdf,image/*"
                      onChange={(e) => setFormData({ ...formData, licenseDocName: e.target.files?.[0]?.name || "" })}
                      className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-slate-300 text-xs file:mr-2 file:py-1 file:px-2 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-amber-500 file:text-slate-950 cursor-pointer"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-slate-300 font-bold">7c. License Expiry Date *</label>
                    <input
                      type="date"
                      required
                      value={formData.licenseExpiry}
                      onChange={(e) => setFormData({ ...formData, licenseExpiry: e.target.value })}
                      className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-slate-100 focus:outline-none focus:border-amber-400 font-mono"
                    />
                  </div>
                </div>
              </div>

              {/* Banking Details */}
              <div className="space-y-3 pt-3 border-t border-white/10">
                <h4 className="text-amber-400 font-extrabold uppercase text-[11px] tracking-wider flex items-center gap-1.5 border-b border-white/5 pb-1">
                  <Landmark className="w-4 h-4" /> 8. Banking Settlement Details
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-slate-300 font-bold">Bank Name *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. HDFC Bank / ICICI Bank"
                      value={formData.bankName}
                      onChange={(e) => setFormData({ ...formData, bankName: e.target.value })}
                      className="w-full bg-slate-950 border border-white/10 rounded-xl px-3.5 py-2.5 text-slate-100 focus:outline-none focus:border-amber-400 font-semibold"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-slate-300 font-bold">Account Holder Name *</label>
                    <input
                      type="text"
                      required
                      placeholder="Name as per bank records"
                      value={formData.accountHolderName}
                      onChange={(e) => setFormData({ ...formData, accountHolderName: e.target.value })}
                      className="w-full bg-slate-950 border border-white/10 rounded-xl px-3.5 py-2.5 text-slate-100 focus:outline-none focus:border-amber-400"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="space-y-1">
                    <label className="text-slate-300 font-bold">Account Number *</label>
                    <input
                      type="text"
                      required
                      placeholder="Account number"
                      value={formData.accountNumber}
                      onChange={(e) => setFormData({ ...formData, accountNumber: e.target.value })}
                      className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-slate-100 focus:outline-none focus:border-amber-400 font-mono"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-slate-300 font-bold">Confirm Account Number *</label>
                    <input
                      type="text"
                      required
                      placeholder="Repeat account number"
                      value={formData.confirmAccountNumber}
                      onChange={(e) => setFormData({ ...formData, confirmAccountNumber: e.target.value })}
                      className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-slate-100 focus:outline-none focus:border-amber-400 font-mono"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-slate-300 font-bold">IFSC Code *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. HDFC0000123"
                      value={formData.ifscCode}
                      onChange={(e) => setFormData({ ...formData, ifscCode: e.target.value })}
                      className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-slate-100 focus:outline-none focus:border-amber-400 font-mono uppercase"
                    />
                  </div>
                </div>
              </div>

              {/* Vehicle Assignment */}
              <div className="space-y-3 pt-3 border-t border-white/10">
                <h4 className="text-amber-400 font-extrabold uppercase text-[11px] tracking-wider flex items-center gap-1.5 border-b border-white/5 pb-1">
                  <Car className="w-4 h-4" /> 9. Vehicle Assignment Mapping
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="space-y-1">
                    <label className="text-slate-300 font-bold">Vehicle Category *</label>
                    <select
                      value={formData.vehicleCategory}
                      onChange={(e) => handleCategoryChange(e.target.value)}
                      className="w-full bg-slate-950 border border-white/10 rounded-xl px-3.5 py-2.5 text-slate-100 focus:outline-none focus:border-amber-400 font-bold text-amber-400"
                    >
                      <option value="Sedan">Sedan</option>
                      <option value="SUV">SUV</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-slate-300 font-bold">Vehicle Class *</label>
                    <select
                      value={formData.vehicleClass}
                      onChange={(e) => setFormData({ ...formData, vehicleClass: e.target.value })}
                      className="w-full bg-slate-950 border border-white/10 rounded-xl px-3.5 py-2.5 text-slate-100 focus:outline-none focus:border-amber-400 font-semibold"
                    >
                      {(CLASS_OPTIONS[formData.vehicleCategory] || []).map((cls) => (
                        <option key={cls} value={cls}>
                          {cls}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-slate-300 font-bold">Vehicle Model Name *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Swift Dzire / Innova Crysta"
                      value={formData.vehicleModel}
                      onChange={(e) => setFormData({ ...formData, vehicleModel: e.target.value })}
                      className="w-full bg-slate-950 border border-white/10 rounded-xl px-3.5 py-2.5 text-slate-100 focus:outline-none focus:border-amber-400 font-semibold"
                    />
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-white/10 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-5 py-2.5 bg-slate-950 text-slate-400 hover:text-white rounded-xl text-xs font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-black rounded-xl text-xs uppercase tracking-wider shadow-lg shadow-amber-500/20 cursor-pointer"
                >
                  {editingDriver ? "Update Driver Record" : "Save Driver Record"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Inspect File Modal */}
      {selectedDriver && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-amber-500/30 rounded-3xl p-6 sm:p-8 w-full max-w-md shadow-2xl space-y-4 relative text-slate-100">
            <button
              onClick={() => setSelectedDriver(null)}
              className="absolute top-5 right-5 text-slate-400 hover:text-white cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 border-b border-white/10 pb-4">
              {selectedDriver.photoUrl ? (
                <img src={selectedDriver.photoUrl} alt={selectedDriver.name} className="w-12 h-12 rounded-2xl object-cover border border-amber-400/40" />
              ) : (
                <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 font-black text-xl">
                  {selectedDriver.name.charAt(0)}
                </div>
              )}
              <div>
                <h3 className="text-xl font-extrabold text-slate-50">{selectedDriver.name}</h3>
                <div className="text-xs font-mono text-amber-400">ID: {selectedDriver.id}</div>
              </div>
            </div>

            <div className="space-y-2 text-xs font-mono bg-slate-950 p-4 rounded-2xl border border-white/5">
              <div className="flex justify-between">
                <span className="text-slate-400 font-sans">Date of Birth:</span>
                <span className="text-amber-400 font-bold">{selectedDriver.dob || "N/A"} ({calculateAge(selectedDriver.dob) || 30} Yrs)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400 font-sans">Mobile:</span>
                <span className="text-slate-100 font-bold">+91-{selectedDriver.phone}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400 font-sans">Driving License:</span>
                <span className="text-amber-400 font-bold">{selectedDriver.licenseNumber} (Exp: {selectedDriver.licenseExpiry})</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400 font-sans">Aadhaar:</span>
                <span className="text-slate-200">{selectedDriver.aadhaarNumber}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400 font-sans">PAN Card:</span>
                <span className="text-slate-200">{selectedDriver.panNumber}</span>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setSelectedDriver(null)}
                className="px-5 py-2 bg-slate-950 border border-white/10 hover:border-white/20 text-slate-200 rounded-xl text-xs font-bold"
              >
                Close File
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
