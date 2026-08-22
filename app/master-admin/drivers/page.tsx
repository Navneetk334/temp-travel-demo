"use client";

import React, { useState } from "react";
import {
  UserCheck,
  Plus,
  Search,
  Filter,
  PhoneCall,
  ShieldCheck,
  Car,
  Clock,
  AlertTriangle,
  CheckCircle2,
  X,
  FileText,
  BadgeCheck,
  Edit2,
  Trash2,
  CheckSquare,
  Square
} from "lucide-react";

export default function MasterDriversPage() {
  const [search, setSearch] = useState("");
  const [filterDuty, setFilterDuty] = useState("ALL");
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingDriver, setEditingDriver] = useState<any | null>(null);
  const [selectedDriver, setSelectedDriver] = useState<any | null>(null);

  // Multi-selection state
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const [drivers, setDrivers] = useState([
    {
      id: "DRV-101",
      name: "Rajesh Kumar",
      phone: "9820112233",
      licenseNumber: "MH-0220190045123",
      licenseExpiry: "2029-08-15",
      vehicleCategory: "Pickup & Drop / Airport Transfer",
      vehicleClass: "Sedan",
      vehicleModel: "Maruti Suzuki Dzire",
      assignedVehicle: "MH 02 CZ 4421 (Swift Dzire)",
      policeVerification: "VERIFIED",
      status: "ON_DUTY",
      experienceYears: 8,
      address: "Andheri West, Mumbai",
      emergencyContact: "9820119900 (Wife)"
    },
    {
      id: "DRV-102",
      name: "Suresh Patil",
      phone: "9833445566",
      licenseNumber: "MH-0420180098765",
      licenseExpiry: "2028-12-01",
      vehicleCategory: "Outstation Trip",
      vehicleClass: "SUV",
      vehicleModel: "Toyota Innova Crysta",
      assignedVehicle: "MH 04 ER 8890 (Innova Crysta)",
      policeVerification: "VERIFIED",
      status: "ON_DUTY",
      experienceYears: 12,
      address: "Thane West, Mumbai",
      emergencyContact: "9833441122 (Brother)"
    },
    {
      id: "DRV-103",
      name: "Vikram Singh",
      phone: "9899112244",
      licenseNumber: "MH-0120200033445",
      licenseExpiry: "2030-05-10",
      vehicleCategory: "Corporate Transit",
      vehicleClass: "Sedan",
      vehicleModel: "Honda City",
      assignedVehicle: "MH 01 AB 1234 (Honda City)",
      policeVerification: "VERIFIED",
      status: "STANDBY",
      experienceYears: 6,
      address: "Powai, Mumbai",
      emergencyContact: "9899110099 (Father)"
    },
    {
      id: "DRV-104",
      name: "Mahesh Yadav",
      phone: "9766554433",
      licenseNumber: "MH-0220170077889",
      licenseExpiry: "2027-02-18",
      vehicleCategory: "VIP Delegation",
      vehicleClass: "Luxury SUV",
      vehicleModel: "Toyota Fortuner 4x4",
      assignedVehicle: "MH 02 FG 9900 (Fortuner 4x4)",
      policeVerification: "VERIFIED",
      status: "ON_DUTY",
      experienceYears: 10,
      address: "Bandra East, Mumbai",
      emergencyContact: "9766550011 (Wife)"
    }
  ]);

  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    licenseNumber: "",
    address: "",
    vehicleCategory: "Pickup & Drop / Airport Transfer",
    vehicleClass: "Sedan",
    vehicleModel: "Maruti Suzuki Dzire",
    experienceYears: "5",
    emergencyContact: ""
  });

  const openAddModal = () => {
    setEditingDriver(null);
    setFormData({
      name: "",
      phone: "",
      licenseNumber: "",
      address: "",
      vehicleCategory: "Pickup & Drop / Airport Transfer",
      vehicleClass: "Sedan",
      vehicleModel: "Maruti Suzuki Dzire",
      experienceYears: "5",
      emergencyContact: ""
    });
    setShowAddModal(true);
  };

  const openEditModal = (drv: any) => {
    setEditingDriver(drv);
    setFormData({
      name: drv.name || "",
      phone: drv.phone || "",
      licenseNumber: drv.licenseNumber || "",
      address: drv.address || "",
      vehicleCategory: drv.vehicleCategory || "Pickup & Drop / Airport Transfer",
      vehicleClass: drv.vehicleClass || "Sedan",
      vehicleModel: drv.vehicleModel || "Maruti Suzuki Dzire",
      experienceYears: String(drv.experienceYears || 5),
      emergencyContact: drv.emergencyContact || ""
    });
    setShowAddModal(true);
  };

  const handleDriverFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingDriver) {
      setDrivers(drivers.map(d => {
        if (d.id === editingDriver.id) {
          return {
            ...d,
            name: formData.name,
            phone: formData.phone,
            licenseNumber: formData.licenseNumber,
            address: formData.address,
            vehicleCategory: formData.vehicleCategory,
            vehicleClass: formData.vehicleClass,
            vehicleModel: formData.vehicleModel,
            experienceYears: Number(formData.experienceYears) || 5,
            emergencyContact: formData.emergencyContact
          };
        }
        return d;
      }));
    } else {
      const created = {
        id: `DRV-${Date.now()}`,
        name: formData.name || "Commercial Driver",
        phone: formData.phone || "9820001122",
        licenseNumber: formData.licenseNumber || "MH-022023001122",
        licenseExpiry: "2030-12-31",
        vehicleCategory: formData.vehicleCategory,
        vehicleClass: formData.vehicleClass,
        vehicleModel: formData.vehicleModel,
        assignedVehicle: `${formData.vehicleModel} (Assigned)`,
        policeVerification: "VERIFIED",
        status: "STANDBY",
        experienceYears: Number(formData.experienceYears) || 5,
        address: formData.address || "Mumbai HQ",
        emergencyContact: formData.emergencyContact || "Next of Kin"
      };
      setDrivers([created, ...drivers]);
    }
    setShowAddModal(false);
  };

  const handleDeleteDriver = (drv: any) => {
    const confirmDel = confirm(`Are you sure you want to remove driver ${drv.name}?`);
    if (confirmDel) {
      setDrivers(drivers.filter(d => d.id !== drv.id));
      setSelectedIds(selectedIds.filter(id => id !== drv.id));
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
      drv.licenseNumber.toLowerCase().includes(search.toLowerCase());
    const matchesDuty = filterDuty === "ALL" || drv.status === filterDuty;
    return matchesSearch && matchesDuty;
  });

  const handleSelectAll = () => {
    if (selectedIds.length === filteredDrivers.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredDrivers.map(d => d.id));
    }
  };

  const handleBulkDelete = () => {
    if (selectedIds.length === 0) return;
    const confirmDel = confirm(`Are you sure you want to delete ${selectedIds.length} selected chauffeur(s)?`);
    if (confirmDel) {
      setDrivers(drivers.filter(d => !selectedIds.includes(d.id)));
      setSelectedIds([]);
    }
  };

  return (
    <div className="p-6 md:p-8 space-y-8 bg-slate-950 text-slate-100 min-h-screen">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-white/5 pb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-50 tracking-tight flex items-center gap-2.5">
            <UserCheck className="w-7 h-7 text-amber-400" />
            <span>Master Chauffeur Roster & Vehicle Mapping</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Manage drivers, license verifications, vehicle category mappings, and dispatch availability.
          </p>
        </div>

        <button
          onClick={openAddModal}
          className="flex items-center gap-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all shadow-lg shadow-amber-500/20 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Register New Driver</span>
        </button>
      </div>

      {/* Multi-Select Floating Action Bar */}
      {selectedIds.length > 0 && (
        <div className="bg-amber-500/10 border border-amber-500/30 p-4 rounded-2xl flex items-center justify-between text-xs animate-in fade-in duration-200">
          <div className="flex items-center gap-3">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-ping" />
            <span className="font-extrabold text-amber-300">
              {selectedIds.length} chauffeur(s) selected
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setSelectedIds([])}
              className="px-3 py-1.5 bg-slate-950 text-slate-400 hover:text-white rounded-lg text-xs font-bold"
            >
              Clear Selection
            </button>
            <button
              onClick={handleBulkDelete}
              className="flex items-center gap-1.5 bg-rose-500 hover:bg-rose-600 text-white px-4 py-1.5 rounded-lg text-xs font-black uppercase tracking-wider shadow-lg transition-all cursor-pointer"
            >
              <Trash2 className="w-4 h-4" />
              <span>Delete Selected ({selectedIds.length})</span>
            </button>
          </div>
        </div>
      )}

      {/* Search & Filter Toolbar */}
      <div className="bg-slate-900/60 p-4 rounded-xl border border-white/5 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search driver by name, phone, or license..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-950 border border-white/10 rounded-lg pl-9 pr-4 py-2 text-xs text-slate-100 focus:outline-none focus:border-amber-400"
          />
        </div>

        <div className="flex items-center gap-3">
          {filteredDrivers.length > 0 && (
            <button
              onClick={handleSelectAll}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-950 text-slate-300 border border-white/10 rounded-xl text-xs font-bold hover:text-amber-400 transition-colors cursor-pointer"
            >
              {selectedIds.length === filteredDrivers.length ? (
                <CheckSquare className="w-4 h-4 text-amber-400" />
              ) : (
                <Square className="w-4 h-4 text-slate-500" />
              )}
              <span>{selectedIds.length === filteredDrivers.length ? "Deselect All" : "Select All"}</span>
            </button>
          )}

          <div className="flex items-center gap-2">
            {["ALL", "ON_DUTY", "STANDBY"].map((duty) => (
              <button
                key={duty}
                onClick={() => setFilterDuty(duty)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  filterDuty === duty
                    ? "bg-amber-500 text-slate-950 font-black"
                    : "bg-slate-950 text-slate-400 hover:text-white border border-white/5"
                }`}
              >
                {duty.replace("_", " ")}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Driver Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredDrivers.map((drv) => {
          const isSelected = selectedIds.includes(drv.id);
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
                    <div className="w-9 h-9 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 font-black text-sm">
                      {drv.name.charAt(0)}
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-100 text-sm">{drv.name}</h3>
                      <div className="text-[11px] font-mono text-slate-400">+91-{drv.phone}</div>
                    </div>
                  </div>
                  <span
                    className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full border ${
                      drv.status === "ON_DUTY"
                        ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                        : "bg-amber-500/10 text-amber-400 border-amber-500/20"
                    }`}
                  >
                    {drv.status.replace("_", " ")}
                  </span>
                </div>

                <div className="space-y-1.5 bg-slate-950 p-3 rounded-xl border border-white/5 text-xs font-mono">
                  <div className="flex justify-between">
                    <span className="text-slate-400 font-sans">License #:</span>
                    <span className="text-amber-400 font-bold truncate max-w-[120px]">{drv.licenseNumber}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400 font-sans">Assigned Model:</span>
                    <span className="text-slate-200 font-bold truncate max-w-[120px]">{drv.vehicleModel}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400 font-sans">Class / Duty:</span>
                    <span className="text-slate-200">{drv.vehicleClass}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between text-[10px] font-bold">
                  <span className="flex items-center gap-1 text-emerald-400">
                    <BadgeCheck className="w-3.5 h-3.5" /> Police Verified
                  </span>
                  <span className="text-slate-500 font-mono">Lic Exp: {drv.licenseExpiry}</span>
                </div>
              </div>

              {/* Action Buttons: Edit Icon & Delete Icon */}
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
                  <a
                    href={`tel:${drv.phone}`}
                    className="flex items-center gap-1 bg-amber-500/10 text-amber-400 border border-amber-500/30 px-3 py-1 rounded-lg hover:bg-amber-500 hover:text-slate-950 text-[11px] font-bold transition-all"
                  >
                    <PhoneCall className="w-3 h-3" /> Call
                  </a>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add / Edit Driver Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-amber-500/30 rounded-3xl p-6 sm:p-8 w-full max-w-xl shadow-2xl space-y-6 relative text-slate-100 max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setShowAddModal(false)}
              className="absolute top-5 right-5 text-slate-400 hover:text-white cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="space-y-1 border-b border-white/10 pb-3">
              <span className="text-[10px] font-bold uppercase text-amber-400 tracking-wider">
                {editingDriver ? "Edit Chauffeur Profile" : "Master Chauffeur Roster"}
              </span>
              <h3 className="text-2xl font-black text-slate-50">
                {editingDriver ? `Edit ${editingDriver.name}` : "Register New Driver"}
              </h3>
            </div>

            <form onSubmit={handleDriverFormSubmit} className="space-y-5 text-xs">
              <div className="space-y-3">
                <h4 className="text-amber-400 font-extrabold uppercase text-[11px] tracking-wider flex items-center gap-1.5">
                  <UserCheck className="w-4 h-4" /> Personal & Driving License Details
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-slate-300 font-bold">Driver Name *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Ramesh Pawar"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full bg-slate-950 border border-white/10 rounded-xl px-3.5 py-2.5 text-slate-100 focus:outline-none focus:border-amber-400 font-semibold"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-slate-300 font-bold">Mobile Number *</label>
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

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-slate-300 font-bold">Driving License Number *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. MH-0220190045123"
                      value={formData.licenseNumber}
                      onChange={(e) => setFormData({ ...formData, licenseNumber: e.target.value })}
                      className="w-full bg-slate-950 border border-white/10 rounded-xl px-3.5 py-2.5 text-slate-100 focus:outline-none focus:border-amber-400 font-mono"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-slate-300 font-bold">Years of Experience</label>
                    <input
                      type="number"
                      value={formData.experienceYears}
                      onChange={(e) => setFormData({ ...formData, experienceYears: e.target.value })}
                      className="w-full bg-slate-950 border border-white/10 rounded-xl px-3.5 py-2.5 text-slate-100 focus:outline-none focus:border-amber-400"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-3 pt-2 border-t border-white/10">
                <h4 className="text-amber-400 font-extrabold uppercase text-[11px] tracking-wider flex items-center gap-1.5">
                  <Car className="w-4 h-4" /> Vehicle Category & Class Mapping
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-slate-300 font-bold">Vehicle Class *</label>
                    <select
                      value={formData.vehicleClass}
                      onChange={(e) => setFormData({ ...formData, vehicleClass: e.target.value })}
                      className="w-full bg-slate-950 border border-white/10 rounded-xl px-3.5 py-2.5 text-slate-100 focus:outline-none focus:border-amber-400"
                    >
                      <option value="Sedan">Sedan</option>
                      <option value="SUV">SUV</option>
                      <option value="Luxury SUV">Luxury SUV</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-slate-300 font-bold">Assigned Model Name *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Innova Crysta / Dzire"
                      value={formData.vehicleModel}
                      onChange={(e) => setFormData({ ...formData, vehicleModel: e.target.value })}
                      className="w-full bg-slate-950 border border-white/10 rounded-xl px-3.5 py-2.5 text-slate-100 focus:outline-none focus:border-amber-400"
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
                  {editingDriver ? "Update Driver Profile" : "Save Driver Record"}
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
              <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 font-black text-xl">
                {selectedDriver.name.charAt(0)}
              </div>
              <div>
                <h3 className="text-xl font-extrabold text-slate-50">{selectedDriver.name}</h3>
                <div className="text-xs font-mono text-amber-400">ID: {selectedDriver.id}</div>
              </div>
            </div>

            <div className="space-y-2 text-xs font-mono bg-slate-950 p-4 rounded-2xl border border-white/5">
              <div className="flex justify-between">
                <span className="text-slate-400 font-sans">Mobile:</span>
                <span className="text-slate-100 font-bold">+91-{selectedDriver.phone}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400 font-sans">License #:</span>
                <span className="text-amber-400 font-bold">{selectedDriver.licenseNumber}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400 font-sans">Verification:</span>
                <span className="text-emerald-400 font-bold">{selectedDriver.policeVerification}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400 font-sans">Assigned Vehicle:</span>
                <span className="text-slate-100">{selectedDriver.assignedVehicle}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400 font-sans">Emergency Contact:</span>
                <span className="text-slate-300">{selectedDriver.emergencyContact}</span>
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
