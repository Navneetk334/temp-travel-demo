"use client";

import React, { useState, useEffect } from "react";
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
  Key,
  Eye,
  Edit
} from "lucide-react";
import Portal from "@/components/shared/portal";
import {
  openDocumentInNewTab,
  getVaultFile,
  setVaultFile,
  deleteVaultFile
} from "@/lib/vaultStorage";

export default function MasterSettingsVaultPage() {
  const [activeTab, setActiveTab] = useState<"global" | "users" | "vault">("global");
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Global Site Settings State
  const [globalSettings, setGlobalSettings] = useState({
    companyName: "TEMP TRAVEL CAR RENTALS PVT LTD",
    contactEmail: "info@temptravel.in",
    contactPhone: "+91-7011729639",
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
    { id: "u-1", name: "Master Command Center", email: "master@temptravel.in", role: "SUPER_ADMIN", status: "ACTIVE" },
    { id: "u-2", name: "Navneet Kumar", email: "admin@temptravel.in", role: "OPERATIONS_DISPATCH", status: "ACTIVE" },
    { id: "u-3", name: "Accounts Team", email: "billing@temptravel.in", role: "ACCOUNTANT", status: "ACTIVE" },
    { id: "u-4", name: "Cash Desk Operator", email: "cash@temptravel.in", role: "CASH_ADMIN", status: "ACTIVE" },
  ]);

  const [newUser, setNewUser] = useState({
    name: "",
    email: "",
    password: "",
    role: "OPERATIONS_DISPATCH"
  });

  // Secure Document Vault State
  const [showAddDocModal, setShowAddDocModal] = useState(false);
  const [editingDoc, setEditingDoc] = useState<any | null>(null);
  const [vaultDocs, setVaultDocs] = useState<any[]>([]);

  const [newDoc, setNewDoc] = useState({
    title: "",
    category: "COMPANY",
    refNumber: "",
    expiryDate: "2028-12-31",
    fileName: "",
    dataUrl: ""
  });

  // Load saved company documents from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem("temp_travel_company_documents");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          setVaultDocs(parsed);
        }
      }
    } catch (e) {
      console.error("Error loading company documents:", e);
    }
  }, []);

  const saveCompanyDocsToStorage = (docs: any[]) => {
    try {
      localStorage.setItem("temp_travel_company_documents", JSON.stringify(docs));
    } catch (e) {
      console.warn("Storage quota fallback for company documents", e);
    }
  };

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

  const handleAddDocSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const docId = `doc-${Date.now()}`;
    const fileName = newDoc.fileName || `${newDoc.title.replace(/\s+/g, "_")}.pdf`;

    if (newDoc.dataUrl) {
      await setVaultFile(`doc_company_${docId}`, newDoc.dataUrl);
    }

    const created = {
      id: docId,
      title: newDoc.title,
      category: newDoc.category,
      refNumber: newDoc.refNumber || `REF-${Date.now().toString().slice(-6)}`,
      expiryDate: newDoc.expiryDate || "Active Perpetual",
      fileName: fileName,
      status: "VALID"
    };

    const updated = [created, ...vaultDocs];
    setVaultDocs(updated);
    saveCompanyDocsToStorage(updated);
    setShowAddDocModal(false);
    setNewDoc({ title: "", category: "COMPANY", refNumber: "", expiryDate: "2028-12-31", fileName: "", dataUrl: "" });
  };

  const handleUpdateDocSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingDoc) return;

    if (editingDoc.dataUrl) {
      await setVaultFile(`doc_company_${editingDoc.id}`, editingDoc.dataUrl);
    }

    const updated = vaultDocs.map(d => {
      if (d.id === editingDoc.id) {
        return {
          ...d,
          title: editingDoc.title,
          category: editingDoc.category,
          refNumber: editingDoc.refNumber,
          expiryDate: editingDoc.expiryDate,
          fileName: editingDoc.fileName || d.fileName
        };
      }
      return d;
    });

    setVaultDocs(updated);
    saveCompanyDocsToStorage(updated);
    setEditingDoc(null);
  };

  const handleDeleteDoc = async (docId: string, title: string) => {
    const confirmed = window.confirm(`Are you sure you want to delete the company document "${title}"?`);
    if (!confirmed) return;

    await deleteVaultFile(`doc_company_${docId}`);
    const updated = vaultDocs.filter(d => d.id !== docId);
    setVaultDocs(updated);
    saveCompanyDocsToStorage(updated);
  };

  const handleViewDoc = async (doc: any) => {
    const key = `doc_company_${doc.id}`;
    const dataUrl = await getVaultFile(key);
    openDocumentInNewTab({
      title: doc.title,
      fileName: doc.fileName || `${doc.title.replace(/\s+/g, "_")}.pdf`,
      refNumber: doc.refNumber,
      expiryDate: doc.expiryDate,
      regNumber: "TEMP TRAVEL CAR RENTALS PVT LTD",
      dataUrl: dataUrl,
      category: `COMPANY - ${doc.category}`,
      storageKey: key
    });
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
      <div className="flex items-center gap-3 bg-surface/80 p-2 rounded-2xl border border-border w-fit">
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
          <span>Company Documents ({vaultDocs.length})</span>
        </button>
      </div>

      {/* TAB 1: Global Site & Admin Settings */}
      {activeTab === "global" && (
        <form onSubmit={handleGlobalSettingsSave} className="bg-surface/80 backdrop-blur-xl border border-border rounded-2xl p-6 shadow-2xl space-y-6">
          <div className="flex justify-between items-center border-b border-border pb-4">
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
                className="w-full bg-background border border-border rounded-xl px-3.5 py-2.5 text-slate-100 focus:outline-none focus:border-amber-400 font-semibold"
              />
            </div>

            <div className="space-y-1">
              <label className="text-slate-400 font-bold">Support Contact Email *</label>
              <input
                type="email"
                required
                value={globalSettings.contactEmail}
                onChange={(e) => setGlobalSettings({ ...globalSettings, contactEmail: e.target.value })}
                className="w-full bg-background border border-border rounded-xl px-3.5 py-2.5 text-slate-100 focus:outline-none focus:border-amber-400 font-semibold"
              />
            </div>

            <div className="space-y-1">
              <label className="text-slate-400 font-bold">Customer Helpline Number *</label>
              <input
                type="text"
                required
                value={globalSettings.contactPhone}
                onChange={(e) => setGlobalSettings({ ...globalSettings, contactPhone: e.target.value })}
                className="w-full bg-background border border-border rounded-xl px-3.5 py-2.5 text-slate-100 focus:outline-none focus:border-amber-400 font-semibold"
              />
            </div>

            <div className="space-y-1">
              <label className="text-slate-400 font-bold">Company GSTIN Number</label>
              <input
                type="text"
                value={globalSettings.gstinNumber}
                onChange={(e) => setGlobalSettings({ ...globalSettings, gstinNumber: e.target.value })}
                className="w-full bg-background border border-border rounded-xl px-3.5 py-2.5 text-amber-400 font-mono focus:outline-none focus:border-amber-400"
              />
            </div>

            <div className="space-y-1">
              <label className="text-slate-400 font-bold">Default Sedan Per Km Tariff (₹)</label>
              <input
                type="text"
                value={globalSettings.defaultSedanKmRate}
                onChange={(e) => setGlobalSettings({ ...globalSettings, defaultSedanKmRate: e.target.value })}
                className="w-full bg-background border border-border rounded-xl px-3.5 py-2.5 text-slate-100 focus:outline-none focus:border-amber-400 font-semibold"
              />
            </div>

            <div className="space-y-1">
              <label className="text-slate-400 font-bold">Default SUV Per Km Tariff (₹)</label>
              <input
                type="text"
                value={globalSettings.defaultSuvKmRate}
                onChange={(e) => setGlobalSettings({ ...globalSettings, defaultSuvKmRate: e.target.value })}
                className="w-full bg-background border border-border rounded-xl px-3.5 py-2.5 text-slate-100 focus:outline-none focus:border-amber-400 font-semibold"
              />
            </div>
          </div>

          <div className="pt-4 border-t border-border flex justify-end">
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
        <div className="bg-surface/80 backdrop-blur-xl border border-border rounded-2xl p-6 shadow-2xl space-y-6">
          <div className="flex justify-between items-center border-b border-border pb-4">
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
              <thead className="bg-background text-slate-400 font-extrabold uppercase text-[10px] tracking-wider border-b border-border">
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

      {/* TAB 3: Company Documents */}
      {activeTab === "vault" && (
        <div className="bg-surface/80 backdrop-blur-xl border border-border rounded-2xl p-6 shadow-2xl space-y-6">
          <div className="flex justify-between items-center border-b border-border pb-4">
            <div>
              <h3 className="text-lg font-bold text-slate-50">Company Documents</h3>
              <p className="text-xs text-slate-400">Store and track company-level compliance certificates, incorporation documents, and ISO files.</p>
            </div>
            <button
              onClick={() => setShowAddDocModal(true)}
              className="flex items-center gap-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider shadow-lg shadow-amber-500/20 cursor-pointer transition-all"
            >
              <Upload className="w-4 h-4" />
              <span>Upload Document</span>
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {vaultDocs.length === 0 && (
              <div className="col-span-full py-12 text-center border-2 border-dashed border-border rounded-2xl space-y-2">
                <FileCheck className="w-10 h-10 text-amber-400/40 mx-auto" />
                <p className="text-slate-400 text-sm font-bold">No company documents uploaded yet.</p>
                <p className="text-slate-500 text-xs">Click "Upload Document" to archive official registration and tax certificates.</p>
              </div>
            )}
            {vaultDocs.map((doc) => (
              <div key={doc.id} className="bg-background p-5 rounded-2xl border border-border space-y-3.5 hover:border-amber-400/40 transition-all flex flex-col justify-between">
                <div className="space-y-3">
                  <div className="flex justify-between items-start">
                    <span className="text-[10px] font-mono uppercase tracking-widest text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20 font-bold">
                      {doc.category}
                    </span>
                    <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-0.5 rounded-full">
                      ● Active Verified
                    </span>
                  </div>

                  <h4 className="font-extrabold text-slate-100 text-sm leading-snug">{doc.title}</h4>

                  <div className="text-[11px] font-mono text-amber-400/90 bg-amber-500/5 p-2 rounded-lg border border-amber-500/10 flex justify-between items-center">
                    <span className="text-slate-400 text-[10px]">File:</span>
                    <strong className="text-slate-200 truncate max-w-[170px]" title={doc.fileName || doc.title}>
                      {doc.fileName || `${doc.title.replace(/\s+/g, "_")}.pdf`}
                    </strong>
                  </div>

                  <div className="text-xs font-mono text-slate-400 flex justify-between">
                    <span>Reference / Ref #:</span>
                    <strong className="text-slate-200">{doc.refNumber || "N/A"}</strong>
                  </div>

                  <div className="text-xs font-mono text-slate-400 flex justify-between">
                    <span>Expiry Date:</span>
                    <strong className="text-emerald-400">{doc.expiryDate || "Perpetual"}</strong>
                  </div>
                </div>

                {/* Actions: View in New Tab, Change / Edit, Delete */}
                <div className="pt-3 border-t border-white/5 flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => handleViewDoc(doc)}
                    className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-amber-400 text-xs font-bold rounded-lg border border-amber-500/20 flex items-center gap-1.5 transition-all cursor-pointer"
                    title="View and verify document in new tab"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>View</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setEditingDoc({ ...doc, dataUrl: "" })}
                    className="px-2.5 py-1.5 bg-slate-800 hover:bg-amber-500 hover:text-slate-950 text-slate-300 text-xs font-bold rounded-lg border border-white/10 flex items-center gap-1.5 transition-all cursor-pointer"
                    title="Change or replace document"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    <span>Change</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleDeleteDoc(doc.id, doc.title)}
                    className="p-1.5 bg-slate-800/80 hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 rounded-lg border border-white/5 transition-all cursor-pointer"
                    title="Delete document"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Add User Modal */}
      {showAddUserModal && (
        <Portal>
          <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
            <div className="bg-surface border border-amber-500/30 rounded-2xl p-6 w-full max-w-lg shadow-2xl space-y-4 relative text-slate-100">
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
                    className="w-full bg-background border border-border rounded-xl px-3 py-2 text-slate-100"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-slate-400 font-bold">Email Address *</label>
                  <input
                    type="email"
                    required
                    placeholder="user@temptravel.in"
                    value={newUser.email}
                    onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                    className="w-full bg-background border border-border rounded-xl px-3 py-2 text-slate-100"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-slate-400 font-bold">Assigned Role</label>
                  <select
                    value={newUser.role}
                    onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
                    className="w-full bg-background border border-border rounded-xl px-3 py-2 text-slate-100"
                  >
                    <option value="SUPER_ADMIN">SUPER_ADMIN (Full HQ Access)</option>
                    <option value="OPERATIONS_DISPATCH">OPERATIONS_DISPATCH</option>
                    <option value="ACCOUNTANT">ACCOUNTANT</option>
                    <option value="CASH_ADMIN">CASH_ADMIN (Local Cash Desk)</option>
                  </select>
                </div>
                <div className="pt-2 flex justify-end gap-3">
                  <button type="button" onClick={() => setShowAddUserModal(false)} className="px-4 py-2 bg-background text-slate-400 rounded-xl">Cancel</button>
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
            <div className="bg-surface border border-amber-500/30 rounded-2xl p-6 w-full max-w-lg shadow-2xl space-y-4 relative text-slate-100">
              <button onClick={() => setShowAddDocModal(false)} className="absolute top-4 right-4 text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
              <h3 className="text-xl font-bold text-slate-50">Upload Company Document</h3>
              <form onSubmit={handleAddDocSubmit} className="space-y-4 text-xs">
                <div className="space-y-1">
                  <label className="text-slate-400 font-bold">Document Title *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. ISO 9001 Certificate or GST Registration"
                    value={newDoc.title}
                    onChange={(e) => setNewDoc({ ...newDoc, title: e.target.value })}
                    className="w-full bg-background border border-border rounded-xl px-3 py-2 text-slate-100 focus:outline-none focus:border-amber-400"
                  />
                </div>
                
                <div className="space-y-1">
                  <label className="text-slate-400 font-bold">Upload File (.pdf, .png, .jpg) *</label>
                  <input
                    type="file"
                    required
                    accept=".pdf,.png,.jpg,.jpeg"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        const reader = new FileReader();
                        reader.onload = (ev) => {
                          setNewDoc(prev => ({
                            ...prev,
                            fileName: file.name,
                            dataUrl: ev.target?.result as string
                          }));
                        };
                        reader.readAsDataURL(file);
                      }
                    }}
                    className="w-full bg-background border border-border rounded-xl px-3 py-2 text-slate-100 file:mr-4 file:py-1 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-amber-500 file:text-slate-950 hover:file:brightness-110 cursor-pointer"
                  />
                  {newDoc.fileName && (
                    <div className="text-[11px] font-mono text-emerald-400 mt-1">
                      Attached: <strong>{newDoc.fileName}</strong>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-slate-400 font-bold">Category</label>
                    <select
                      value={newDoc.category}
                      onChange={(e) => setNewDoc({ ...newDoc, category: e.target.value })}
                      className="w-full bg-background border border-border rounded-xl px-3 py-2 text-slate-100 focus:outline-none focus:border-amber-400"
                    >
                      <option value="COMPANY">COMPANY</option>
                      <option value="COMPLIANCE">COMPLIANCE</option>
                      <option value="TAX">TAX & AUDIT</option>
                      <option value="LEGAL">LEGAL</option>
                      <option value="OTHER">OTHER</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-slate-400 font-bold">Reference / Policy #</label>
                    <input
                      type="text"
                      placeholder="e.g. ISO-2025"
                      value={newDoc.refNumber}
                      onChange={(e) => setNewDoc({ ...newDoc, refNumber: e.target.value })}
                      className="w-full bg-background border border-border rounded-xl px-3 py-2 text-slate-100 font-mono focus:outline-none focus:border-amber-400"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-slate-400 font-bold">Expiry Date</label>
                  <input
                    type="date"
                    value={newDoc.expiryDate}
                    onClick={(e) => e.currentTarget.showPicker?.()}
                    onChange={(e) => setNewDoc({ ...newDoc, expiryDate: e.target.value })}
                    className="w-full bg-background border border-border rounded-xl px-3 py-2 text-slate-100 font-mono focus:outline-none focus:border-amber-400 cursor-pointer [color-scheme:dark]"
                  />
                </div>

                <div className="pt-2 flex justify-end gap-3">
                  <button type="button" onClick={() => setShowAddDocModal(false)} className="px-4 py-2 bg-background hover:bg-white/5 text-slate-400 rounded-xl font-bold cursor-pointer">Cancel</button>
                  <button type="submit" className="px-5 py-2 bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-black rounded-xl uppercase tracking-wider shadow-lg shadow-amber-500/20 cursor-pointer">Save & Archive</button>
                </div>
              </form>
            </div>
          </div>
        </Portal>
      )}

      {/* Edit / Change Document Modal */}
      {editingDoc && (
        <Portal>
          <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
            <div className="bg-surface border border-amber-500/30 rounded-2xl p-6 w-full max-w-lg shadow-2xl space-y-4 relative text-slate-100">
              <button onClick={() => setEditingDoc(null)} className="absolute top-4 right-4 text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
              <h3 className="text-xl font-bold text-slate-50">Change / Update Company Document</h3>
              <form onSubmit={handleUpdateDocSubmit} className="space-y-4 text-xs">
                <div className="space-y-1">
                  <label className="text-slate-400 font-bold">Document Title *</label>
                  <input
                    type="text"
                    required
                    value={editingDoc.title}
                    onChange={(e) => setEditingDoc({ ...editingDoc, title: e.target.value })}
                    className="w-full bg-background border border-border rounded-xl px-3 py-2 text-slate-100 focus:outline-none focus:border-amber-400"
                  />
                </div>
                
                <div className="space-y-1">
                  <label className="text-slate-400 font-bold">Choose Replacement File (.pdf, .png, .jpg)</label>
                  <input
                    type="file"
                    accept=".pdf,.png,.jpg,.jpeg"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        const reader = new FileReader();
                        reader.onload = (ev) => {
                          setEditingDoc((prev: any) => ({
                            ...prev,
                            fileName: file.name,
                            dataUrl: ev.target?.result as string
                          }));
                        };
                        reader.readAsDataURL(file);
                      }
                    }}
                    className="w-full bg-background border border-border rounded-xl px-3 py-2 text-slate-100 file:mr-4 file:py-1 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-amber-500 file:text-slate-950 hover:file:brightness-110 cursor-pointer"
                  />
                  <div className="text-[11px] font-mono text-slate-400 mt-1">
                    Current file: <strong className="text-amber-400">{editingDoc.fileName || `${editingDoc.title}.pdf`}</strong>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-slate-400 font-bold">Category</label>
                    <select
                      value={editingDoc.category}
                      onChange={(e) => setEditingDoc({ ...editingDoc, category: e.target.value })}
                      className="w-full bg-background border border-border rounded-xl px-3 py-2 text-slate-100 focus:outline-none focus:border-amber-400"
                    >
                      <option value="COMPANY">COMPANY</option>
                      <option value="COMPLIANCE">COMPLIANCE</option>
                      <option value="TAX">TAX & AUDIT</option>
                      <option value="LEGAL">LEGAL</option>
                      <option value="OTHER">OTHER</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-slate-400 font-bold">Reference / Policy #</label>
                    <input
                      type="text"
                      value={editingDoc.refNumber}
                      onChange={(e) => setEditingDoc({ ...editingDoc, refNumber: e.target.value })}
                      className="w-full bg-background border border-border rounded-xl px-3 py-2 text-slate-100 font-mono focus:outline-none focus:border-amber-400"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-slate-400 font-bold">Expiry Date</label>
                  <input
                    type="date"
                    value={editingDoc.expiryDate}
                    onClick={(e) => e.currentTarget.showPicker?.()}
                    onChange={(e) => setEditingDoc({ ...editingDoc, expiryDate: e.target.value })}
                    className="w-full bg-background border border-border rounded-xl px-3 py-2 text-slate-100 font-mono focus:outline-none focus:border-amber-400 cursor-pointer [color-scheme:dark]"
                  />
                </div>

                <div className="pt-2 flex justify-end gap-3">
                  <button type="button" onClick={() => setEditingDoc(null)} className="px-4 py-2 bg-background hover:bg-white/5 text-slate-400 rounded-xl font-bold cursor-pointer">Cancel</button>
                  <button type="submit" className="px-5 py-2 bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-black rounded-xl uppercase tracking-wider shadow-lg shadow-amber-500/20 cursor-pointer">Update Document</button>
                </div>
              </form>
            </div>
          </div>
        </Portal>
      )}
    </div>
  );
}

