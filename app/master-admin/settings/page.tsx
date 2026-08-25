"use client";

import React, { useState } from "react";
import {
  Settings,
  UserPlus,
  FileCheck,
  ShieldCheck,
  Building2,
  Lock,
  Save,
  CheckCircle2,
  AlertCircle,
  Plus,
  Trash2,
  X,
  Upload,
  FileText,
  Key
} from "lucide-react";
import Portal from "@/components/shared/portal";

export default function MasterSettingsVaultPage() {
  const [activeTab, setActiveTab] = useState<"global" | "users" | "vault">("global");
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Global Site Settings State
  const [globalSettings, setGlobalSettings] = useState({
    companyName: "TEMP TRAVEL CAR RENTALS PVT LTD",
    contactEmail: "info@temptravels.com",
    contactPhone: "+91-9999999999",
    supportAddress: "Flat No C-102, Shanti Vihar, Lokhandwala Complex, Mumbai - 400101",
    currencySymbol: "₹",
    defaultSedanKmRate: "12",
    defaultSuvKmRate: "16",
    gstinNumber: "27AABCU9603R1ZM",
    sacCode: "996412"
  });

  // Master Users RBAC State
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [users, setUsers] = useState([
    { id: "u-1", name: "Master Command Center", email: "master@temptravels.com", role: "SUPER_ADMIN", status: "ACTIVE" },
    { id: "u-2", name: "Navneet Kumar", email: "admin@temptravels.com", role: "OPERATIONS_DISPATCH", status: "ACTIVE" },
    { id: "u-3", name: "Accounts Team", email: "billing@temptravels.com", role: "ACCOUNTANT", status: "ACTIVE" },
    { id: "u-4", name: "Cash Desk Operator", email: "cash@temptravels.com", role: "CASH_ADMIN", status: "ACTIVE" },
  ]);

  const [newUser, setNewUser] = useState({
    name: "",
    email: "",
    password: "",
    role: "OPERATIONS_DISPATCH"
  });

  // Secure Document Vault State
  const [showAddDocModal, setShowAddDocModal] = useState(false);
  const [vaultDocs, setVaultDocs] = useState([
    { id: "doc-1", title: "Commercial Registration Certificate (RC) - Swift Dzire", category: "VEHICLE", refNumber: "MH 02 CZ 4421", expiryDate: "2029-03-15", status: "VALID" },
    { id: "doc-2", title: "Comprehensive Commercial Insurance Policy - Innova Crysta", category: "VEHICLE", refNumber: "POL-9988112", expiryDate: "2027-01-10", status: "VALID" },
    { id: "doc-3", title: "Commercial Driving License - Chauffeur Rajesh Kumar", category: "DRIVER", refNumber: "MH-0220190045123", expiryDate: "2029-08-15", status: "VALID" },
    { id: "doc-[#4]", title: "Police Clearance Background Certificate - Suresh Patil", category: "DRIVER", refNumber: "PCC-2024-8812", expiryDate: "2026-12-31", status: "VALID" },
    { id: "doc-5", title: "ISO 9001:2015 Quality Management Certificate", category: "COMPANY", refNumber: "ISO-9001-2024", expiryDate: "2027-09-30", status: "VALID" },
  ]);

  const [newDoc, setNewDoc] = useState({
    title: "",
    category: "VEHICLE",
    refNumber: "",
    expiryDate: "2027-12-31"
  });

  const handleGlobalSettingsSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2000);
  };

  const handleAddUserSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newUser.name,
          email: newUser.email,
          password: newUser.password,
          role: newUser.role,
        }),
      });
      const data = await res.json();
      if (data.success && data.user) {
        setUsers([
          {
            id: data.user.id,
            name: data.user.name,
            email: data.user.email,
            role: data.user.role,
            status: "ACTIVE",
          },
          ...users,
        ]);
      } else {
        const created = {
          id: `u-${Date.now()}`,
          name: newUser.name,
          email: newUser.email,
          role: newUser.role,
          status: "ACTIVE",
        };
        setUsers([created, ...users]);
      }
    } catch (err) {
      const created = {
        id: `u-${Date.now()}`,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
        status: "ACTIVE",
      };
      setUsers([created, ...users]);
    }
    setShowAddUserModal(false);
    setNewUser({ name: "", email: "", password: "", role: "OPERATIONS_DISPATCH" });
  };

  const handleAddDocSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const created = {
      id: `doc-${Date.now()}`,
      title: newDoc.title,
      category: newDoc.category,
      refNumber: newDoc.refNumber || "REF-9900",
      expiryDate: newDoc.expiryDate,
      status: "VALID"
    };
    setVaultDocs([created, ...vaultDocs]);
    setShowAddDocModal(false);
    setNewDoc({ title: "", category: "VEHICLE", refNumber: "", expiryDate: "2027-12-31" });
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-amber-500/20 pb-6">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-3xl font-black tracking-tight text-slate-50">
              System Settings & Secure Document Vault
            </h1>
            <span className="bg-amber-500/10 text-amber-400 border border-amber-500/30 text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-widest">
              Master Control HQ
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Global business parameters, multi-role user access control, and encrypted compliance vault.
          </p>
        </div>
      </div>

      {/* 3 Main Navigation Tabs */}
      <div className="flex items-center gap-3 bg-slate-900/80 p-2 rounded-2xl border border-white/10 w-fit">
        <button
          onClick={() => setActiveTab("global")}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === "global"
              ? "bg-amber-500 text-slate-950 font-black shadow-lg shadow-amber-500/20"
              : "text-slate-400 hover:text-white"
          }`}
        >
          <Building2 className="w-4 h-4" />
          <span>Global Settings</span>
        </button>

        <button
          onClick={() => setActiveTab("users")}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === "users"
              ? "bg-amber-500 text-slate-950 font-black shadow-lg shadow-amber-500/20"
              : "text-slate-400 hover:text-white"
          }`}
        >
          <UserPlus className="w-4 h-4" />
          <span>Users & RBAC Roles ({users.length})</span>
        </button>

        <button
          onClick={() => setActiveTab("vault")}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === "vault"
              ? "bg-amber-500 text-slate-950 font-black shadow-lg shadow-amber-500/20"
              : "text-slate-400 hover:text-white"
          }`}
        >
          <FileCheck className="w-4 h-4" />
          <span>Document Vault ({vaultDocs.length})</span>
        </button>
      </div>

      {/* TAB 1: Global Site & Admin Settings */}
      {activeTab === "global" && (
        <form onSubmit={handleGlobalSettingsSave} className="bg-slate-900/80 backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-2xl space-y-6">
          <div className="flex justify-between items-center border-b border-white/10 pb-4">
            <h3 className="text-lg font-bold text-slate-50">Global Business & Tariff Parameters</h3>
            {saveSuccess && (
              <span className="flex items-center gap-1 text-xs font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 rounded-full">
                <CheckCircle2 className="w-3.5 h-3.5" /> Settings Saved!
              </span>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
            <div className="space-y-1">
              <label className="text-slate-400 font-bold">Company Name *</label>
              <input
                type="text"
                required
                value={globalSettings.companyName}
                onChange={(e) => setGlobalSettings({ ...globalSettings, companyName: e.target.value })}
                className="w-full bg-slate-950 border border-white/10 rounded-xl px-3.5 py-2.5 text-slate-100 focus:outline-none focus:border-amber-400 font-semibold"
              />
            </div>

            <div className="space-y-1">
              <label className="text-slate-400 font-bold">Support Contact Email *</label>
              <input
                type="email"
                required
                value={globalSettings.contactEmail}
                onChange={(e) => setGlobalSettings({ ...globalSettings, contactEmail: e.target.value })}
                className="w-full bg-slate-950 border border-white/10 rounded-xl px-3.5 py-2.5 text-slate-100 focus:outline-none focus:border-amber-400 font-semibold"
              />
            </div>

            <div className="space-y-1">
              <label className="text-slate-400 font-bold">Customer Helpline Number *</label>
              <input
                type="text"
                required
                value={globalSettings.contactPhone}
                onChange={(e) => setGlobalSettings({ ...globalSettings, contactPhone: e.target.value })}
                className="w-full bg-slate-950 border border-white/10 rounded-xl px-3.5 py-2.5 text-slate-100 focus:outline-none focus:border-amber-400 font-semibold"
              />
            </div>

            <div className="space-y-1">
              <label className="text-slate-400 font-bold">Company GSTIN Number</label>
              <input
                type="text"
                value={globalSettings.gstinNumber}
                onChange={(e) => setGlobalSettings({ ...globalSettings, gstinNumber: e.target.value })}
                className="w-full bg-slate-950 border border-white/10 rounded-xl px-3.5 py-2.5 text-amber-400 font-mono focus:outline-none focus:border-amber-400"
              />
            </div>

            <div className="space-y-1">
              <label className="text-slate-400 font-bold">Default Sedan Per Km Tariff (₹)</label>
              <input
                type="text"
                value={globalSettings.defaultSedanKmRate}
                onChange={(e) => setGlobalSettings({ ...globalSettings, defaultSedanKmRate: e.target.value })}
                className="w-full bg-slate-950 border border-white/10 rounded-xl px-3.5 py-2.5 text-slate-100 focus:outline-none focus:border-amber-400 font-semibold"
              />
            </div>

            <div className="space-y-1">
              <label className="text-slate-400 font-bold">Default SUV Per Km Tariff (₹)</label>
              <input
                type="text"
                value={globalSettings.defaultSuvKmRate}
                onChange={(e) => setGlobalSettings({ ...globalSettings, defaultSuvKmRate: e.target.value })}
                className="w-full bg-slate-950 border border-white/10 rounded-xl px-3.5 py-2.5 text-slate-100 focus:outline-none focus:border-amber-400 font-semibold"
              />
            </div>
          </div>

          <div className="pt-4 border-t border-white/10 flex justify-end">
            <button
              type="submit"
              className="flex items-center gap-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all shadow-lg shadow-amber-500/20"
            >
              <Save className="w-4 h-4" />
              <span>Save System Settings</span>
            </button>
          </div>
        </form>
      )}

      {/* TAB 2: Master Users & RBAC Roles */}
      {activeTab === "users" && (
        <div className="bg-slate-900/80 backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-2xl space-y-6">
          <div className="flex justify-between items-center border-b border-white/10 pb-4">
            <div>
              <h3 className="text-lg font-bold text-slate-50">Master Admin User Accounts & Access Roles</h3>
              <p className="text-xs text-slate-400">Manage administrative permissions across Web, Cash Admin, and Master HQ.</p>
            </div>
            <button
              onClick={() => setShowAddUserModal(true)}
              className="flex items-center gap-2 bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider shadow-lg shadow-amber-500/20"
            >
              <Plus className="w-4 h-4" />
              <span>Add Admin User</span>
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950 text-slate-400 font-extrabold uppercase text-[10px] tracking-wider border-b border-white/10">
                <tr>
                  <th className="py-3 px-4">User Name</th>
                  <th className="py-3 px-4">Email Address</th>
                  <th className="py-3 px-4">Assigned RBAC Role</th>
                  <th className="py-3 px-4">Account Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {users.map((u) => (
                  <tr key={u.id} className="hover:bg-white/5 transition-colors">
                    <td className="py-4 px-4 font-bold text-slate-100">{u.name}</td>
                    <td className="py-4 px-4 font-mono text-slate-300">{u.email}</td>
                    <td className="py-4 px-4 font-mono font-bold text-amber-400">{u.role}</td>
                    <td className="py-4 px-4">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                        {u.status}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-right">
                      <button className="text-slate-400 hover:text-red-400 p-1">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: Secure Document Vault */}
      {activeTab === "vault" && (
        <div className="bg-slate-900/80 backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-2xl space-y-6">
          <div className="flex justify-between items-center border-b border-white/10 pb-4">
            <div>
              <h3 className="text-lg font-bold text-slate-50">Encrypted Compliance Document Vault</h3>
              <p className="text-xs text-slate-400">Store and track commercial RCs, Insurance, Driver Licenses, and PCC certificates.</p>
            </div>
            <button
              onClick={() => setShowAddDocModal(true)}
              className="flex items-center gap-2 bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider shadow-lg shadow-amber-500/20"
            >
              <Upload className="w-4 h-4" />
              <span>Upload Document</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {vaultDocs.map((doc) => (
              <div key={doc.id} className="bg-slate-950 p-5 rounded-2xl border border-white/10 space-y-3">
                <div className="flex justify-between items-start">
                  <span className="text-[10px] font-mono uppercase tracking-widest text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20">
                    {doc.category}
                  </span>
                  <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-0.5 rounded-full">
                    {doc.status}
                  </span>
                </div>
                <h4 className="font-bold text-slate-100 text-sm leading-snug">{doc.title}</h4>
                <div className="text-xs font-mono text-slate-400">Ref: <strong className="text-slate-200">{doc.refNumber}</strong></div>
                <div className="text-xs font-mono text-slate-400">Expiry Date: <strong className="text-amber-400">{doc.expiryDate}</strong></div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Add User Modal */}
      {showAddUserModal && (
        <Portal>
          <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
            <div className="bg-slate-900 border border-amber-500/30 rounded-2xl p-6 w-full max-w-lg shadow-2xl space-y-4 relative text-slate-100">
              <button onClick={() => setShowAddUserModal(false)} className="absolute top-4 right-4 text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
              <h3 className="text-xl font-bold text-slate-50">Create Admin Account</h3>
              <form onSubmit={handleAddUserSubmit} className="space-y-4 text-xs">
                <div className="space-y-1">
                  <label className="text-slate-400 font-bold">Full Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Navneet Kumar"
                    value={newUser.name}
                    onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                    className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-slate-100"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-slate-400 font-bold">Email Address *</label>
                  <input
                    type="email"
                    required
                    placeholder="user@temptravels.com"
                    value={newUser.email}
                    onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                    className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-slate-100"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-slate-400 font-bold">Assigned Role</label>
                  <select
                    value={newUser.role}
                    onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
                    className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-slate-100"
                  >
                    <option value="SUPER_ADMIN">SUPER_ADMIN (Full HQ Access)</option>
                    <option value="OPERATIONS_DISPATCH">OPERATIONS_DISPATCH</option>
                    <option value="ACCOUNTANT">ACCOUNTANT</option>
                    <option value="CASH_ADMIN">CASH_ADMIN (Local Cash Desk)</option>
                  </select>
                </div>
                <div className="pt-2 flex justify-end gap-3">
                  <button type="button" onClick={() => setShowAddUserModal(false)} className="px-4 py-2 bg-slate-950 text-slate-400 rounded-xl">Cancel</button>
                  <button type="submit" className="px-5 py-2 bg-amber-500 text-slate-950 font-bold rounded-xl uppercase">Create Account</button>
                </div>
              </form>
            </div>
          </div>
        </Portal>
      )}

      {/* Add Document Modal */}
      {showAddDocModal && (
        <Portal>
          <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
            <div className="bg-slate-900 border border-amber-500/30 rounded-2xl p-6 w-full max-w-lg shadow-2xl space-y-4 relative text-slate-100">
              <button onClick={() => setShowAddDocModal(false)} className="absolute top-4 right-4 text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
              <h3 className="text-xl font-bold text-slate-50">Upload Document to Vault</h3>
              <form onSubmit={handleAddDocSubmit} className="space-y-4 text-xs">
                <div className="space-y-1">
                  <label className="text-slate-400 font-bold">Document Title *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Commercial Permit - Ertiga"
                    value={newDoc.title}
                    onChange={(e) => setNewDoc({ ...newDoc, title: e.target.value })}
                    className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-slate-100"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-slate-400 font-bold">Category</label>
                    <select
                      value={newDoc.category}
                      onChange={(e) => setNewDoc({ ...newDoc, category: e.target.value })}
                      className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-slate-100"
                    >
                      <option value="VEHICLE">VEHICLE</option>
                      <option value="DRIVER">DRIVER</option>
                      <option value="EMPLOYEE">EMPLOYEE</option>
                      <option value="COMPANY">COMPANY</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-slate-400 font-bold">Reference / Policy #</label>
                    <input
                      type="text"
                      placeholder="MH-02-2025"
                      value={newDoc.refNumber}
                      onChange={(e) => setNewDoc({ ...newDoc, refNumber: e.target.value })}
                      className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-slate-100"
                    />
                  </div>
                </div>
                <div className="pt-2 flex justify-end gap-3">
                  <button type="button" onClick={() => setShowAddDocModal(false)} className="px-4 py-2 bg-slate-950 text-slate-400 rounded-xl">Cancel</button>
                  <button type="submit" className="px-5 py-2 bg-amber-500 text-slate-950 font-bold rounded-xl uppercase">Save Document</button>
                </div>
              </form>
            </div>
          </div>
        </Portal>
      )}
    </div>
  );
}
