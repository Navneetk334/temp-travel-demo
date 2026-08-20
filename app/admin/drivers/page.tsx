"use client";

import React, { useState, useEffect } from "react";
import ImageUploader from "@/components/shared/image-uploader";
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
  Calendar,
  CreditCard,
  FileText,
  User as UserIcon
} from "lucide-react";

interface Driver {
  id: string;
  name: string;
  email: string;
  phone: string;
  isActive: boolean;
  photoUrl?: string | null;
  aadhaarNumber?: string | null;
  panNumber?: string | null;
  dob?: string | null;
  dateOfJoining?: string | null;
  licenseNumber?: string | null;
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
    photoUrl: "",
    aadhaarNumber: "",
    panNumber: "",
    dob: "",
    dateOfJoining: "",
    licenseNumber: "",
  });

  const [formError, setFormError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const formatDate = (dateStr?: string | null) => {
    if (!dateStr) return "N/A";
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return "N/A";
    return d.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
  };

  const formatDateInput = (dateStr?: string | null) => {
    if (!dateStr) return "";
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return "";
    return d.toISOString().split("T")[0];
  };

  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const loadDrivers = async (showSpinner = true) => {
    if (showSpinner) setLoading(true);
    try {
      const res = await fetch(`/api/admin/drivers?search=${encodeURIComponent(search)}`);
      if (res.ok) {
        const data = await res.json();
        setDrivers(data);
      }
    } catch (err) {
      console.error("Failed to load drivers:", err);
    } finally {
      if (showSpinner) setLoading(false);
    }
  };

  useEffect(() => {
    loadDrivers();
    setSelectedIds([]);
  }, [search]);

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedIds(drivers.map((d) => d.id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleSelectOne = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const openModal = (driver: Driver | null = null) => {
    setFormError("");
    if (driver) {
      setEditingDriver(driver);
      setFormData({
        name: driver.name || "",
        email: driver.email || "",
        phone: driver.phone || "",
        password: "",
        isActive: driver.isActive ?? true,
        photoUrl: driver.photoUrl || "",
        aadhaarNumber: driver.aadhaarNumber || "",
        panNumber: driver.panNumber || "",
        dob: formatDateInput(driver.dob),
        dateOfJoining: formatDateInput(driver.dateOfJoining),
        licenseNumber: driver.licenseNumber || "",
      });
    } else {
      setEditingDriver(null);
      setFormData({
        name: "",
        email: "",
        phone: "",
        password: "",
        isActive: true,
        photoUrl: "",
        aadhaarNumber: "",
        panNumber: "",
        dob: "",
        dateOfJoining: new Date().toISOString().split("T")[0],
        licenseNumber: "",
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
      loadDrivers(false);
    } catch (err: any) {
      setFormError(err.message || "Operation failed");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteDriver = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to remove driver "${name}"?`)) return;

    // Optimistic delete - instant feedback with no full page loading spinner!
    setDrivers((prev) => prev.filter((d) => d.id !== id));
    setSelectedIds((prev) => prev.filter((i) => i !== id));

    try {
      const res = await fetch(`/api/admin/drivers/${id}`, { method: "DELETE" });
      if (!res.ok) {
        const data = await res.json();
        alert(data.error || "Failed to delete driver");
        loadDrivers(false);
      } else {
        loadDrivers(false);
      }
    } catch (err) {
      console.error("Failed to delete driver:", err);
      loadDrivers(false);
    }
  };

  const handleBulkDelete = async () => {
    if (selectedIds.length === 0) return;
    if (!confirm(`Are you sure you want to delete ${selectedIds.length} selected chauffeur(s)?`)) return;

    const idsToDelete = [...selectedIds];
    // Optimistic bulk remove
    setDrivers((prev) => prev.filter((d) => !idsToDelete.includes(d.id)));
    setSelectedIds([]);

    try {
      await Promise.all(idsToDelete.map((id) => fetch(`/api/admin/drivers/${id}`, { method: "DELETE" })));
      loadDrivers(false);
    } catch (err) {
      console.error("Bulk delete error:", err);
      loadDrivers(false);
    }
  };

  return (
    <div className="p-6 md:p-8 space-y-8 bg-slate-950 text-slate-100 min-h-screen">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-white/5 pb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-50 tracking-tight flex items-center gap-2.5">
            <UserCheck className="w-7 h-7 text-amber-400" />
            <span>Driver Roster & Dispatch Contact Info</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">View chauffeur roster, verify identity document status (Aadhaar, PAN, License), and access phone numbers for live trip dispatching.</p>
        </div>
      </div>

      {/* Search Filter Bar */}
      <div className="bg-slate-900/60 p-4 rounded-xl border border-white/5 flex items-center gap-4">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search driver by name, phone, email, Aadhaar, PAN, or License No..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-950 border border-white/10 rounded-lg pl-9 pr-4 py-2 text-xs text-slate-100 focus:outline-none focus:border-amber-400"
          />
        </div>
      </div>

      {/* Bulk Delete Bar */}
      {selectedIds.length > 0 && (
        <div className="bg-amber-500/10 border border-amber-500/30 p-4 rounded-xl flex items-center justify-between text-xs animate-in fade-in duration-200">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
            <span className="font-bold text-amber-300">
              {selectedIds.length} chauffeur(s) selected
            </span>
          </div>
          <button
            onClick={handleBulkDelete}
            className="inline-flex items-center gap-2 bg-rose-500 hover:bg-rose-600 text-white font-extrabold px-4 py-2 rounded-lg transition-colors shadow-lg"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Delete Selected Chauffeurs ({selectedIds.length})</span>
          </button>
        </div>
      )}

      {/* Drivers Table */}
      <div className="bg-slate-900/60 rounded-xl border border-white/5 overflow-hidden">
        {loading ? (
          <div className="text-center py-16 text-slate-400 text-xs">Loading chauffeurs directory...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-900 border-b border-white/5 text-slate-400 font-semibold uppercase tracking-wider">
                  <th className="p-4 w-10 text-center">
                    <input
                      type="checkbox"
                      checked={drivers.length > 0 && selectedIds.length === drivers.length}
                      onChange={handleSelectAll}
                      className="w-4 h-4 rounded text-amber-500 bg-slate-950 border-white/20 focus:ring-0 cursor-pointer"
                    />
                  </th>
                  <th className="p-4 w-12 text-center">S. No.</th>
                  <th className="p-4">Chauffeur Profile</th>
                  <th className="p-4">Contact Details</th>
                  <th className="p-4">Govt IDs (Aadhaar / PAN / License)</th>
                  <th className="p-4">DOB & Joining Date</th>
                  <th className="p-4">Assigned Vehicle</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {drivers.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="text-center py-16 text-slate-500 italic">
                      No chauffeurs found matching criteria.
                    </td>
                  </tr>
                ) : (
                  drivers.map((d, idx) => (
                    <tr key={d.id} className={`hover:bg-white/5 transition-colors ${selectedIds.includes(d.id) ? "bg-amber-500/5" : ""}`}>
                      <td className="p-4 text-center">
                        <input
                          type="checkbox"
                          checked={selectedIds.includes(d.id)}
                          onChange={() => handleSelectOne(d.id)}
                          className="w-4 h-4 rounded text-amber-500 bg-slate-950 border-white/20 focus:ring-0 cursor-pointer"
                        />
                      </td>
                      <td className="p-4 text-center font-mono font-bold text-slate-400">
                        {idx + 1}
                      </td>
                      {/* Profile Photo & Name */}
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          {d.photoUrl ? (
                            <img
                              src={d.photoUrl}
                              alt={d.name}
                              className="w-10 h-10 rounded-full object-cover border border-amber-400/40 shrink-0"
                            />
                          ) : (
                            <div className="w-10 h-10 rounded-full bg-amber-500/20 text-amber-400 font-bold flex items-center justify-center text-sm border border-amber-400/40 shrink-0">
                              {d.name?.charAt(0) || "D"}
                            </div>
                          )}
                          <div>
                            <div className="font-extrabold text-slate-100 text-sm flex items-center gap-1.5">
                              <span>{d.name}</span>
                              <CheckCircle2 className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                            </div>
                            <div className="text-slate-400 text-[11px] flex items-center gap-1 mt-0.5">
                              <Mail className="w-3 h-3 text-slate-500 shrink-0" />
                              <span>{d.email}</span>
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Mobile */}
                      <td className="p-4 font-mono font-bold text-slate-200">
                        <div className="flex items-center gap-1.5">
                          <Phone className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                          <span>{d.phone}</span>
                        </div>
                      </td>

                      {/* Govt IDs */}
                      <td className="p-4 space-y-1 font-mono text-[11px]">
                        {d.licenseNumber && (
                          <div className="text-slate-200 font-bold flex items-center gap-1">
                            <ShieldCheck className="w-3 h-3 text-emerald-400 shrink-0" />
                            <span>DL: {d.licenseNumber}</span>
                          </div>
                        )}
                        {d.aadhaarNumber && (
                          <div className="text-slate-400 flex items-center gap-1">
                            <CreditCard className="w-3 h-3 text-slate-500 shrink-0" />
                            <span>Aadhaar: {d.aadhaarNumber}</span>
                          </div>
                        )}
                        {d.panNumber && (
                          <div className="text-slate-400 flex items-center gap-1">
                            <FileText className="w-3 h-3 text-slate-500 shrink-0" />
                            <span>PAN: {d.panNumber}</span>
                          </div>
                        )}
                        {!d.licenseNumber && !d.aadhaarNumber && !d.panNumber && (
                          <span className="text-slate-500 italic">Not Uploaded</span>
                        )}
                      </td>

                      {/* Dates */}
                      <td className="p-4 text-[11px] text-slate-300 space-y-1">
                        <div className="flex items-center gap-1">
                          <Calendar className="w-3 h-3 text-amber-400 shrink-0" />
                          <span>DOB: {formatDate(d.dob)}</span>
                        </div>
                        <div className="text-slate-400 text-[10px]">
                          Joined: {formatDate(d.dateOfJoining)}
                        </div>
                      </td>

                      {/* Assigned Vehicle */}
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

                      {/* Account Status */}
                      <td className="p-4">
                        <span className={`text-[10px] font-extrabold px-2.5 py-1 rounded-full border uppercase ${
                          d.isActive 
                            ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" 
                            : "bg-rose-500/10 text-rose-400 border-rose-500/20"
                        }`}>
                          {d.isActive ? "ACTIVE" : "INACTIVE"}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="p-4 text-right space-x-2">
                        <button
                          onClick={() => openModal(d)}
                          className="p-1.5 bg-slate-900 border border-white/10 rounded-lg text-slate-300 hover:text-amber-400 transition-colors"
                          title="Edit Driver Profile & Credentials"
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
          <div className="bg-slate-900 border border-white/10 rounded-2xl max-w-3xl w-full p-6 space-y-6 shadow-2xl max-h-[90vh] overflow-y-auto scrollbar-thin">
            <div className="flex justify-between items-center border-b border-white/5 pb-4">
              <div>
                <h3 className="text-lg font-bold text-slate-50">
                  {editingDriver ? "Edit Chauffeur Credentials" : "Register New Chauffeur Profile"}
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">Configure driver photo, full name, email, mobile, Aadhaar, PAN, DOB, and joining date.</p>
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
              {/* Driver Photo Uploader */}
              <ImageUploader
                value={formData.photoUrl}
                onChange={(url) => setFormData({ ...formData, photoUrl: url })}
                label="Chauffeur Profile Photo"
                placeholder="Upload photo from device or paste image URL"
              />

              {/* Row 1: Full Name, Mobile, Email */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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

              {/* Row 2: Driving License, Aadhaar, PAN */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="font-bold text-slate-300 block mb-1">Driving License Number</label>
                  <input
                    type="text"
                    placeholder="e.g. MH0120201234567"
                    value={formData.licenseNumber}
                    onChange={(e) => setFormData({ ...formData, licenseNumber: e.target.value.toUpperCase() })}
                    className="w-full bg-slate-950 border border-white/10 rounded-lg p-2.5 text-xs text-slate-100 font-mono font-bold focus:outline-none focus:border-amber-400"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-300 block mb-1">Aadhaar Card Number (12 Digits)</label>
                  <input
                    type="text"
                    maxLength={14}
                    placeholder="e.g. 1234 5678 9012"
                    value={formData.aadhaarNumber}
                    onChange={(e) => setFormData({ ...formData, aadhaarNumber: e.target.value })}
                    className="w-full bg-slate-950 border border-white/10 rounded-lg p-2.5 text-xs text-slate-100 font-mono focus:outline-none focus:border-amber-400"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-300 block mb-1">PAN Card Number (10 Chars)</label>
                  <input
                    type="text"
                    maxLength={10}
                    placeholder="e.g. ABCDE1234F"
                    value={formData.panNumber}
                    onChange={(e) => setFormData({ ...formData, panNumber: e.target.value.toUpperCase() })}
                    className="w-full bg-slate-950 border border-white/10 rounded-lg p-2.5 text-xs text-slate-100 font-mono font-bold focus:outline-none focus:border-amber-400"
                  />
                </div>
              </div>

              {/* Row 3: DOB, Date of Joining, Account Status */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="font-bold text-slate-300 block mb-1">Date of Birth (DOB)</label>
                  <input
                    type="date"
                    value={formData.dob}
                    onChange={(e) => setFormData({ ...formData, dob: e.target.value })}
                    className="w-full bg-slate-950 border border-white/10 rounded-lg p-2.5 text-xs text-slate-100 font-mono focus:outline-none focus:border-amber-400"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-300 block mb-1">Date of Joining (DOJ)</label>
                  <input
                    type="date"
                    value={formData.dateOfJoining}
                    onChange={(e) => setFormData({ ...formData, dateOfJoining: e.target.value })}
                    className="w-full bg-slate-950 border border-white/10 rounded-lg p-2.5 text-xs text-slate-100 font-mono focus:outline-none focus:border-amber-400"
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
              </div>

              {/* Row 4: Password */}
              <div>
                <label className="font-bold text-slate-300 block mb-1">
                  {editingDriver ? "New Password (Leave blank to keep existing)" : "Login Password *"}
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
                  {isSubmitting ? "Saving..." : editingDriver ? "Update Driver Profile" : "Register Driver"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
