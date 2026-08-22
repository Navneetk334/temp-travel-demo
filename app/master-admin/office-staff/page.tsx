"use client";

import React, { useState, useEffect } from "react";
import {
  Users,
  Plus,
  Search,
  PhoneCall,
  Mail,
  ShieldCheck,
  Briefcase,
  CheckCircle2,
  X,
  FileText,
  BadgeCheck,
  Edit2,
  Trash2,
  CheckSquare,
  Square,
  Upload,
  Landmark,
  Cake,
  Calendar
} from "lucide-react";

// Age calculation helper
function calculateAge(dobString: string): number | null {
  if (!dobString) return null;
  const dob = new Date(dobString);
  if (isNaN(dob.getTime())) return null;
  const today = new Date();
  let age = today.getFullYear() - dob.getFullYear();
  const monthDiff = today.getMonth() - dob.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) {
    age--;
  }
  return age >= 0 ? age : null;
}

export default function MasterOfficeStaffPage() {
  const [search, setSearch] = useState("");
  const [filterRole, setFilterRole] = useState("ALL");
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingStaff, setEditingStaff] = useState<any | null>(null);
  const [selectedStaff, setSelectedStaff] = useState<any | null>(null);

  // Multi-selection state
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const [staffList, setStaffList] = useState<any[]>([]);

  const [formData, setFormData] = useState({
    name: "",
    role: "Dispatch Manager",
    dob: "1995-05-15",
    phone: "",
    email: "",
    photoName: "",
    photoUrl: "",
    aadhaarNumber: "",
    aadhaarDocName: "",
    panNumber: "",
    panDocName: "",
    contractDocName: "",
    bankName: "HDFC Bank",
    accountHolderName: "",
    accountNumber: "",
    confirmAccountNumber: "",
    ifscCode: "HDFC0000123"
  });

  // Load from local storage
  useEffect(() => {
    const saved = localStorage.getItem("user_uploaded_office_staff");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setStaffList(parsed);
        }
      } catch (e) {
        console.error(e);
      }
    }
  }, []);

  const openAddModal = () => {
    setEditingStaff(null);
    setFormData({
      name: "",
      role: "Dispatch Manager",
      dob: "1995-05-15",
      phone: "",
      email: "",
      photoName: "",
      photoUrl: "",
      aadhaarNumber: "",
      aadhaarDocName: "",
      panNumber: "",
      panDocName: "",
      contractDocName: "",
      bankName: "HDFC Bank",
      accountHolderName: "",
      accountNumber: "",
      confirmAccountNumber: "",
      ifscCode: "HDFC0000123"
    });
    setShowAddModal(true);
  };

  const openEditModal = (stf: any) => {
    setEditingStaff(stf);
    setFormData({
      name: stf.name || "",
      role: stf.role || "Dispatch Manager",
      dob: stf.dob || "1995-05-15",
      phone: stf.phone || "",
      email: stf.email || "",
      photoName: stf.photoName || "",
      photoUrl: stf.photoUrl || "",
      aadhaarNumber: stf.aadhaarNumber || "",
      aadhaarDocName: stf.aadhaarDocName || "",
      panNumber: stf.panNumber || "",
      panDocName: stf.panDocName || "",
      contractDocName: stf.contractDocName || "",
      bankName: stf.bankName || "HDFC Bank",
      accountHolderName: stf.accountHolderName || stf.name || "",
      accountNumber: stf.accountNumber || "",
      confirmAccountNumber: stf.accountNumber || "",
      ifscCode: stf.ifscCode || "HDFC0000123"
    });
    setShowAddModal(true);
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.accountNumber !== formData.confirmAccountNumber) {
      alert("Bank Account Number and Confirm Account Number do not match!");
      return;
    }

    let updated: any[] = [];
    if (editingStaff) {
      updated = staffList.map(s => {
        if (s.id === editingStaff.id) {
          return {
            ...s,
            name: formData.name,
            role: formData.role,
            dob: formData.dob,
            phone: formData.phone,
            email: formData.email,
            photoName: formData.photoName,
            photoUrl: formData.photoUrl,
            aadhaarNumber: formData.aadhaarNumber,
            aadhaarDocName: formData.aadhaarDocName,
            panNumber: formData.panNumber,
            panDocName: formData.panDocName,
            contractDocName: formData.contractDocName,
            bankName: formData.bankName,
            accountHolderName: formData.accountHolderName,
            accountNumber: formData.accountNumber,
            ifscCode: formData.ifscCode
          };
        }
        return s;
      });
    } else {
      const created = {
        id: `STF-${Date.now()}`,
        name: formData.name || "Office Executive",
        role: formData.role || "Dispatch Manager",
        dob: formData.dob,
        phone: formData.phone || "9876543210",
        email: formData.email || "staff@temptravels.com",
        photoName: formData.photoName,
        photoUrl: formData.photoUrl,
        aadhaarNumber: formData.aadhaarNumber || "1122 3344 5566",
        aadhaarDocName: formData.aadhaarDocName,
        panNumber: formData.panNumber || "ABCDE1234F",
        panDocName: formData.panDocName,
        contractDocName: formData.contractDocName,
        bankName: formData.bankName || "HDFC Bank",
        accountHolderName: formData.accountHolderName || formData.name,
        accountNumber: formData.accountNumber || "501009876123",
        ifscCode: formData.ifscCode || "HDFC0000123"
      };
      updated = [created, ...staffList];
    }

    setStaffList(updated);
    localStorage.setItem("user_uploaded_office_staff", JSON.stringify(updated));
    setShowAddModal(false);
  };

  const handleDeleteStaff = (stf: any) => {
    const confirmDel = confirm(`Are you sure you want to remove office staff member ${stf.name}?`);
    if (confirmDel) {
      const updated = staffList.filter(s => s.id !== stf.id);
      setStaffList(updated);
      setSelectedIds(selectedIds.filter(id => id !== stf.id));
      localStorage.setItem("user_uploaded_office_staff", JSON.stringify(updated));
    }
  };

  const handleSelectToggle = (id: string) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter(i => i !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };

  const filteredStaff = staffList.filter((stf) => {
    const matchesSearch =
      stf.name.toLowerCase().includes(search.toLowerCase()) ||
      stf.phone.includes(search) ||
      stf.email.toLowerCase().includes(search.toLowerCase()) ||
      stf.role.toLowerCase().includes(search.toLowerCase());
    const matchesRole = filterRole === "ALL" || stf.role.toUpperCase().includes(filterRole.toUpperCase());
    return matchesSearch && matchesRole;
  });

  const computedAge = calculateAge(formData.dob);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-white/10 pb-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-50 tracking-tight flex items-center gap-2">
            <Users className="w-6 h-6 text-amber-400" />
            <span>Master Office Staff Directory</span>
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Manage corporate office staff records, DOB age calculation, KYC uploads, and Vault document segregation.
          </p>
        </div>

        <button
          onClick={openAddModal}
          className="flex items-center gap-1.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 px-3.5 py-1.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all shadow-md shadow-amber-500/20 cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Add Office Staff</span>
        </button>
      </div>

      {/* Multi-Select Floating Action Bar */}
      {selectedIds.length > 0 && (
        <div className="bg-amber-500/10 border border-amber-500/30 p-4 rounded-2xl flex items-center justify-between text-xs animate-in fade-in duration-200">
          <div className="flex items-center gap-3">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-ping" />
            <span className="font-extrabold text-amber-300">
              {selectedIds.length} staff member(s) selected
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
              onClick={() => {
                if (confirm(`Are you sure you want to delete ${selectedIds.length} selected staff member(s)?`)) {
                  const updated = staffList.filter(s => !selectedIds.includes(s.id));
                  setStaffList(updated);
                  setSelectedIds([]);
                  localStorage.setItem("user_uploaded_office_staff", JSON.stringify(updated));
                }
              }}
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
            placeholder="Search staff by name, phone, email, or designation..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-950 border border-white/10 rounded-lg pl-9 pr-4 py-2 text-xs text-slate-100 focus:outline-none focus:border-amber-400"
          />
        </div>
      </div>

      {/* Office Staff Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredStaff.map((stf) => {
          const isSelected = selectedIds.includes(stf.id);
          const age = calculateAge(stf.dob);
          return (
            <div
              key={stf.id}
              className={`bg-slate-900/80 backdrop-blur-xl border rounded-2xl p-6 shadow-xl space-y-4 transition-all flex flex-col justify-between relative ${
                isSelected ? "border-amber-400 bg-amber-500/5 ring-1 ring-amber-400/40" : "border-white/10 hover:border-amber-500/40"
              }`}
            >
              <div className="space-y-4">
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => handleSelectToggle(stf.id)}
                      className="text-slate-400 hover:text-amber-400 cursor-pointer"
                    >
                      {isSelected ? (
                        <CheckSquare className="w-4 h-4 text-amber-400" />
                      ) : (
                        <Square className="w-4 h-4 text-slate-600" />
                      )}
                    </button>
                    {stf.photoUrl ? (
                      <img src={stf.photoUrl} alt={stf.name} className="w-12 h-12 rounded-xl object-cover border border-amber-400/40" />
                    ) : (
                      <div className="w-12 h-12 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 font-black text-base">
                        {stf.name.charAt(0)}
                      </div>
                    )}
                    <div>
                      <h3 className="font-extrabold text-slate-100 text-base">{stf.name}</h3>
                      <div className="text-[11px] font-mono text-amber-400 font-bold">{stf.role}</div>
                    </div>
                  </div>
                  {age !== null && (
                    <span className="text-[10px] font-black text-amber-300 bg-amber-500/10 border border-amber-500/30 px-2 py-0.5 rounded-full flex items-center gap-1">
                      <Cake className="w-3 h-3 text-amber-400" />
                      <span>{age} Yrs</span>
                    </span>
                  )}
                </div>

                <div className="space-y-2 bg-slate-950 p-3.5 rounded-xl border border-white/5 text-xs font-mono">
                  <div className="flex justify-between">
                    <span className="text-slate-400 font-sans">Mobile:</span>
                    <span className="text-slate-200 font-bold">+91-{stf.phone}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400 font-sans">Email:</span>
                    <span className="text-slate-200">{stf.email}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400 font-sans">Aadhaar:</span>
                    <span className="text-amber-400 font-bold">{stf.aadhaarNumber}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400 font-sans">PAN Card:</span>
                    <span className="text-slate-200 font-bold">{stf.panNumber}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400 font-sans">Bank:</span>
                    <span className="text-emerald-400 font-bold">{stf.bankName} ({stf.accountNumber.slice(-4)})</span>
                  </div>
                </div>
              </div>

              {/* Card Footer Actions */}
              <div className="pt-3 border-t border-white/5 flex items-center justify-between">
                <span className="text-[10px] font-mono text-emerald-400 font-bold flex items-center gap-1">
                  <BadgeCheck className="w-3.5 h-3.5" /> Staff Active
                </span>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => openEditModal(stf)}
                    className="p-1.5 bg-slate-950 border border-white/10 hover:border-amber-400 rounded-lg text-slate-400 hover:text-amber-400 transition-all cursor-pointer"
                    title="Edit Staff Credentials"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDeleteStaff(stf)}
                    className="p-1.5 bg-slate-950 border border-white/10 hover:border-rose-400 rounded-lg text-slate-400 hover:text-rose-400 transition-all cursor-pointer"
                    title="Delete Staff Record"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add / Edit Staff Modal */}
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
                {editingStaff ? "Edit Office Staff Profile" : "New Office Staff Onboarding"}
              </span>
              <h3 className="text-2xl font-black text-slate-50">
                {editingStaff ? `Edit ${editingStaff.name}` : "Add Office Staff Member"}
              </h3>
            </div>

            <form onSubmit={handleFormSubmit} className="space-y-6 text-xs">
              {/* Photo Upload with Live Preview */}
              <div className="space-y-2 bg-slate-950 p-4 rounded-2xl border border-white/5">
                <label className="text-slate-300 font-bold block">Staff Photo Upload from Device (with Live Preview)</label>
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

              {/* Personal Info & DOB Age Calculation */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-slate-300 font-bold">Staff Full Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Navneet Kumar"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full bg-slate-950 border border-white/10 rounded-xl px-3.5 py-2.5 text-slate-100 focus:outline-none focus:border-amber-400 font-semibold"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-slate-300 font-bold">Role / Designation *</label>
                  <select
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                    className="w-full bg-slate-950 border border-white/10 rounded-xl px-3.5 py-2.5 text-slate-100 focus:outline-none focus:border-amber-400 font-bold text-amber-400"
                  >
                    <option value="Dispatch Manager">Dispatch Manager</option>
                    <option value="Fleet Operations Head">Fleet Operations Head</option>
                    <option value="Senior Accountant">Senior Accountant</option>
                    <option value="HR & Compliance Manager">HR & Compliance Manager</option>
                    <option value="Customer Support Executive">Customer Support Executive</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-1">
                  <div className="flex justify-between items-center">
                    <label className="text-slate-300 font-bold">Date of Birth *</label>
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
                  <label className="text-slate-300 font-bold">Mobile Number *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 9876543210"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full bg-slate-950 border border-white/10 rounded-xl px-3.5 py-2 text-slate-100 focus:outline-none focus:border-amber-400 font-mono"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-slate-300 font-bold">Email Address *</label>
                  <input
                    type="email"
                    required
                    placeholder="staff@temptravels.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full bg-slate-950 border border-white/10 rounded-xl px-3.5 py-2 text-slate-100 focus:outline-none focus:border-amber-400 font-mono"
                  />
                </div>
              </div>

              {/* KYC Documents Section */}
              <div className="space-y-3 pt-3 border-t border-white/10">
                <h4 className="text-amber-400 font-extrabold uppercase text-[11px] tracking-wider flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4" /> KYC Document Numbers & Vault Uploads
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-slate-300 font-bold">Aadhaar Card Number *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. 1122 3344 5566"
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
                    <label className="text-slate-300 font-bold">PAN Card Number *</label>
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

                <div className="space-y-1">
                  <label className="text-slate-300 font-bold block">Upload Employment Contract / Offer Letter</label>
                  <input
                    type="file"
                    accept=".pdf,image/*"
                    onChange={(e) => setFormData({ ...formData, contractDocName: e.target.files?.[0]?.name || "" })}
                    className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-slate-300 text-xs file:mr-3 file:py-1 file:px-2.5 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-amber-500 file:text-slate-950 cursor-pointer"
                  />
                </div>
              </div>

              {/* Banking Details */}
              <div className="space-y-3 pt-3 border-t border-white/10">
                <h4 className="text-amber-400 font-extrabold uppercase text-[11px] tracking-wider flex items-center gap-1.5">
                  <Landmark className="w-4 h-4" /> Banking Salary Settlement Account
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
                      className="w-full bg-slate-950 border border-white/10 rounded-xl px-3.5 py-2 text-slate-100 focus:outline-none focus:border-amber-400 font-semibold"
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
                      className="w-full bg-slate-950 border border-white/10 rounded-xl px-3.5 py-2 text-slate-100 focus:outline-none focus:border-amber-400"
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
                  {editingStaff ? "Update Staff Record" : "Save Staff Record"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
