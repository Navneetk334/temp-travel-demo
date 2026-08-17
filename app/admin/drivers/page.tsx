"use client";

import React, { useState, useEffect } from "react";
import { 
  Plus, 
  Trash2, 
  Edit, 
  X, 
  Search, 
  UserCheck, 
  Phone, 
  Mail, 
  Car, 
  ShieldCheck, 
  AlertTriangle,
  CheckCircle2,
  Lock
} from "lucide-react";

interface Driver {
  id: string;
  name: string;
  email: string;
  phone: string;
  isActive: boolean;
  createdAt: string;
  vehicle?: {
    id: string;
    make: string;
    model: string;
    registrationNumber: string;
  } | null;
}

export default function AdminDriversPage() {
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDriver, setEditingDriver] = useState<Driver | null>(null);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    isActive: true,
  });

  const [formError, setFormError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const loadDrivers = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/drivers?search=${encodeURIComponent(search)}`);
      if (res.ok) {
        const data = await res.json();
        setDrivers(data);
      }
    } catch (err) {
      console.error("Failed to load drivers:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDrivers();
  }, [search]);

  const openModal = (driver: Driver | null = null) => {
    setFormError("");
    if (driver) {
      setEditingDriver(driver);
      setFormData({
        name: driver.name,
        email: driver.email,
        phone: driver.phone,
        password: "",
        isActive: driver.isActive,
      });
    } else {
      setEditingDriver(null);
      setFormData({
        name: "",
        email: "",
        phone: "",
        password: "",
        isActive: true,
      });
    }
    setIsModalOpen(true);
  };

  const handleSaveDriver = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");
    setIsSubmitting(true);

    try {
      const url = editingDriver ? `/api/admin/drivers/${editingDriver.id}` : "/api/admin/drivers";
      const method = editingDriver ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to save driver");
      }

      setIsModalOpen(false);
      loadDrivers();
    } catch (err: any) {
      setFormError(err.message || "Operation failed");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteDriver = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to remove driver "${name}"?`)) return;

    try {
      const res = await fetch(`/api/admin/drivers/${id}`, { method: "DELETE" });
      if (res.ok) {
        loadDrivers();
      } else {
        const data = await res.json();
        alert(data.error || "Failed to delete driver");
      }
    } catch (err) {
      console.error("Failed to delete driver:", err);
    }
  };

  return (
    <div className="p-6 md:p-8 space-y-8 bg-slate-950 text-slate-100 min-h-screen">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-white/5 pb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-50 tracking-tight flex items-center gap-2.5">
            <UserCheck className="w-7 h-7 text-amber-400" />
            <span>Driver Management</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">Register, verify credentials, and manage fleet chauffeurs.</p>
        </div>

        <button
          onClick={() => openModal(null)}
          className="inline-flex items-center gap-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-extrabold px-5 py-2.5 rounded-xl text-xs tracking-wider uppercase transition-all shadow-lg shadow-amber-500/10"
        >
          <Plus className="w-4 h-4 text-slate-950" />
          <span>Add New Driver</span>
        </button>
      </div>

      {/* Search Filter Bar */}
      <div className="bg-slate-900/60 p-4 rounded-xl border border-white/5 flex items-center gap-4">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search driver by name, mobile number, or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-950 border border-white/10 rounded-lg pl-9 pr-4 py-2 text-xs text-slate-100 focus:outline-none focus:border-amber-400"
          />
        </div>
      </div>

      {/* Drivers Table */}
      <div className="bg-slate-900/60 rounded-xl border border-white/5 overflow-hidden">
        {loading ? (
          <div className="text-center py-16 text-slate-400 text-xs">Loading chauffeurs directory...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-900 border-b border-white/5 text-slate-400 font-semibold uppercase tracking-wider">
                  <th className="p-4">Driver Name & Details</th>
                  <th className="p-4">Mobile Number</th>
                  <th className="p-4">Assigned Vehicle</th>
                  <th className="p-4">Account Status</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {drivers.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="text-center py-16 text-slate-500 italic">
                      No chauffeurs found matching criteria.
                    </td>
                  </tr>
                ) : (
                  drivers.map((d) => (
                    <tr key={d.id} className="hover:bg-white/5 transition-colors">
                      <td className="p-4">
                        <div className="font-bold text-slate-100 text-sm flex items-center gap-2">
                          <span>{d.name}</span>
                          <CheckCircle2 className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                        </div>
                        <div className="text-slate-400 text-[11px] flex items-center gap-1 mt-0.5">
                          <Mail className="w-3 h-3 text-slate-500" />
                          <span>{d.email}</span>
                        </div>
                      </td>

                      <td className="p-4 font-mono font-bold text-slate-200">
                        <div className="flex items-center gap-1.5">
                          <Phone className="w-3.5 h-3.5 text-amber-400" />
                          <span>{d.phone}</span>
                        </div>
                      </td>

                      <td className="p-4">
                        {d.vehicle ? (
                          <div className="bg-slate-950 px-2.5 py-1.5 rounded-lg border border-white/10 inline-block space-y-0.5">
                            <div className="font-bold text-slate-100 flex items-center gap-1 text-xs">
                              <Car className="w-3.5 h-3.5 text-amber-400" />
                              <span>{d.vehicle.make} {d.vehicle.model}</span>
                            </div>
                            <div className="font-mono text-[10px] text-emerald-400 font-bold">
                              {d.vehicle.registrationNumber}
                            </div>
                          </div>
                        ) : (
                          <span className="text-slate-500 italic text-[11px]">Unassigned (Available)</span>
                        )}
                      </td>

                      <td className="p-4">
                        <span className={`text-[10px] font-extrabold px-2.5 py-1 rounded-full border uppercase ${
                          d.isActive 
                            ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" 
                            : "bg-rose-500/10 text-rose-400 border-rose-500/20"
                        }`}>
                          {d.isActive ? "ACTIVE" : "INACTIVE"}
                        </span>
                      </td>

                      <td className="p-4 text-right space-x-2">
                        <button
                          onClick={() => openModal(d)}
                          className="p-1.5 bg-slate-900 border border-white/10 rounded-lg text-slate-300 hover:text-amber-400 transition-colors"
                          title="Edit Driver Credentials"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteDriver(d.id, d.name)}
                          className="p-1.5 bg-slate-900 border border-white/10 rounded-lg text-slate-300 hover:text-rose-400 transition-colors"
                          title="Delete Driver Account"
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
        )}
      </div>

      {/* Driver Add / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-white/10 rounded-2xl max-w-lg w-full p-6 space-y-6 shadow-2xl">
            <div className="flex justify-between items-center border-b border-white/5 pb-4">
              <div>
                <h3 className="text-lg font-bold text-slate-50">
                  {editingDriver ? "Edit Chauffeur Details" : "Register New Chauffeur"}
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">Configure driver name, contact, phone, and account status.</p>
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
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleSaveDriver} className="space-y-4 text-xs">
              <div>
                <label className="font-bold text-slate-300 block mb-1">Full Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Ramesh Sharma"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full bg-slate-950 border border-white/10 rounded-lg p-2.5 text-xs text-slate-100 focus:outline-none focus:border-amber-400"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="font-bold text-slate-300 block mb-1">Mobile Number (10 Digits) *</label>
                  <input
                    type="tel"
                    required
                    placeholder="e.g. +91 9876543210"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full bg-slate-950 border border-white/10 rounded-lg p-2.5 text-xs text-slate-100 font-mono focus:outline-none focus:border-amber-400"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-300 block mb-1">Email Address *</label>
                  <input
                    type="email"
                    required
                    placeholder="e.g. ramesh@temptravels.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full bg-slate-950 border border-white/10 rounded-lg p-2.5 text-xs text-slate-100 focus:outline-none focus:border-amber-400"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-300 block mb-1">
                  {editingDriver ? "New Password (Leave blank to keep existing)" : "Password *"}
                </label>
                <input
                  type="password"
                  required={!editingDriver}
                  placeholder={editingDriver ? "••••••••" : "Driver Login Password"}
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full bg-slate-950 border border-white/10 rounded-lg p-2.5 text-xs text-slate-100 focus:outline-none focus:border-amber-400 font-mono"
                />
              </div>

              <div>
                <label className="font-bold text-slate-300 block mb-1">Account Status</label>
                <select
                  value={formData.isActive ? "true" : "false"}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.value === "true" })}
                  className="w-full bg-slate-950 border border-white/10 rounded-lg p-2.5 text-xs text-slate-100 focus:outline-none focus:border-amber-400"
                >
                  <option value="true" className="bg-slate-900 text-emerald-400">ACTIVE (Eligible for Cabs)</option>
                  <option value="false" className="bg-slate-900 text-rose-400">INACTIVE (Suspended)</option>
                </select>
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
                  className="flex-1 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black py-2.5 rounded-lg text-xs tracking-wider uppercase transition-colors shadow-lg disabled:opacity-50"
                >
                  {isSubmitting ? "Saving..." : editingDriver ? "Update Driver" : "Register Driver"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
