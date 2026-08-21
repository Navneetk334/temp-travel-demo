"use client";

import React, { useState } from "react";
import {
  FileCheck,
  Search,
  Filter,
  Plus,
  Upload,
  User,
  Car,
  Building2,
  FileText,
  ShieldCheck,
  Calendar,
  X,
  CheckCircle2,
  Download,
  Eye,
  Trash2,
  Tag
} from "lucide-react";

export default function MasterDocumentVaultPage() {
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState<"ALL" | "VEHICLE" | "DRIVER" | "EMPLOYEE" | "COMPANY">("ALL");
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [selectedDoc, setSelectedDoc] = useState<any | null>(null);

  const [vaultDocs, setVaultDocs] = useState([
    {
      id: "DOC-101",
      title: "Driver Aadhaar Card - Rajesh Kumar",
      entityType: "DRIVER",
      entityName: "Rajesh Kumar (Driver DRV-101)",
      docTag: "Aadhaar Card",
      refNumber: "9820-1122-3344",
      issueDate: "2020-01-15",
      expiryDate: "N/A (Lifetime)",
      fileName: "aadhaar_rajesh_kumar.pdf",
      fileSize: "1.4 MB",
      status: "VERIFIED"
    },
    {
      id: "DOC-102",
      title: "Driver PAN Card - Rajesh Kumar",
      entityType: "DRIVER",
      entityName: "Rajesh Kumar (Driver DRV-101)",
      docTag: "PAN Card",
      refNumber: "ABCDE1234F",
      issueDate: "2018-05-10",
      expiryDate: "N/A (Lifetime)",
      fileName: "pan_rajesh_kumar.pdf",
      fileSize: "850 KB",
      status: "VERIFIED"
    },
    {
      id: "DOC-103",
      title: "Commercial Vehicle RC Book - Toyota Innova Crysta",
      entityType: "VEHICLE",
      entityName: "MH 04 ER 8890 (Innova Crysta)",
      docTag: "RC Certificate",
      refNumber: "RC-MH04-2022-9901",
      issueDate: "2022-03-10",
      expiryDate: "2037-03-09",
      fileName: "rc_innova_mh04er8890.pdf",
      fileSize: "2.8 MB",
      status: "VERIFIED"
    },
    {
      id: "DOC-104",
      title: "Comprehensive Commercial Insurance Policy - Fortuner",
      entityType: "VEHICLE",
      entityName: "MH 02 FG 9900 (Fortuner 4x4)",
      docTag: "Insurance Policy",
      refNumber: "POL-ICICI-2025-4421",
      issueDate: "2025-01-10",
      expiryDate: "2026-12-05",
      fileName: "insurance_fortuner_mh02fg9900.pdf",
      fileSize: "3.1 MB",
      status: "VERIFIED"
    },
    {
      id: "DOC-105",
      title: "Employee Offer & Verification File - Navneet Kumar",
      entityType: "EMPLOYEE",
      entityName: "Navneet Kumar (Operations Manager)",
      docTag: "Employment Verification",
      refNumber: "EMP-2024-001",
      issueDate: "2024-06-01",
      expiryDate: "N/A",
      fileName: "emp_file_navneet.pdf",
      fileSize: "1.9 MB",
      status: "VERIFIED"
    },
    {
      id: "DOC-106",
      title: "ISO 9001:2015 Commercial Fleet Quality Compliance Certificate",
      entityType: "COMPANY",
      entityName: "TEMP TRAVEL CAR RENTALS PVT LTD",
      docTag: "ISO Compliance Certificate",
      refNumber: "ISO-9001-IND-8842",
      issueDate: "2024-09-01",
      expiryDate: "2027-08-31",
      fileName: "iso_certificate_temptravels.pdf",
      fileSize: "4.2 MB",
      status: "VERIFIED"
    }
  ]);

  const [uploadForm, setUploadForm] = useState({
    title: "",
    entityType: "DRIVER",
    entityName: "",
    docTag: "Aadhaar Card",
    refNumber: "",
    expiryDate: "2028-12-31",
    fileName: ""
  });

  const handleUploadSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const created = {
      id: `DOC-${101 + vaultDocs.length}`,
      title: uploadForm.title,
      entityType: uploadForm.entityType,
      entityName: uploadForm.entityName || "General File",
      docTag: uploadForm.docTag,
      refNumber: uploadForm.refNumber || "REF-9900",
      issueDate: new Date().toISOString().slice(0, 10),
      expiryDate: uploadForm.expiryDate,
      fileName: uploadForm.fileName || "uploaded_document.pdf",
      fileSize: "2.1 MB",
      status: "VERIFIED"
    };
    setVaultDocs([created, ...vaultDocs]);
    setShowUploadModal(false);
    setUploadForm({ title: "", entityType: "DRIVER", entityName: "", docTag: "Aadhaar Card", refNumber: "", expiryDate: "2028-12-31", fileName: "" });
  };

  const filteredDocs = vaultDocs.filter((doc) => {
    const matchesCategory = activeCategory === "ALL" || doc.entityType === activeCategory;
    const matchesSearch =
      doc.title.toLowerCase().includes(search.toLowerCase()) ||
      doc.entityName.toLowerCase().includes(search.toLowerCase()) ||
      doc.refNumber.toLowerCase().includes(search.toLowerCase()) ||
      doc.docTag.toLowerCase().includes(search.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-amber-500/20 pb-6">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-3xl font-black tracking-tight text-slate-50">
              Master Document Vault & Compliance Center
            </h1>
            <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-widest">
              256-Bit Encrypted Vault
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Store, segregate, and instantly retrieve RCs, Insurance, Driver Aadhaar/PAN, Employee records, and Company Permits.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowUploadModal(true)}
            className="flex items-center gap-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 px-4 py-2 rounded-xl text-xs font-black tracking-wider uppercase transition-all shadow-lg shadow-amber-500/20 cursor-pointer"
          >
            <Upload className="w-4 h-4" />
            <span>Upload Document to Vault</span>
          </button>
        </div>
      </div>

      {/* Segregation Category Filter Tabs */}
      <div className="flex flex-wrap items-center gap-3 bg-slate-900/80 p-2 rounded-2xl border border-white/10 w-fit">
        {[
          { key: "ALL", label: "All Documents", icon: FileCheck },
          { key: "DRIVER", label: "Driver Files (DL, Aadhaar, PAN)", icon: User },
          { key: "VEHICLE", label: "Vehicle Documents (RC, Insurance)", icon: Car },
          { key: "EMPLOYEE", label: "Employee Records", icon: ShieldCheck },
          { key: "COMPANY", label: "Company Licenses & ISO", icon: Building2 },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeCategory === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveCategory(tab.key as any)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                isActive
                  ? "bg-amber-500 text-slate-950 font-black shadow-lg shadow-amber-500/20"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-slate-900/60 p-4 rounded-2xl border border-white/10">
        <div className="relative w-full sm:w-96">
          <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by Driver Name, Vehicle Reg #, Employee, or Ref #..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-950 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-100 focus:outline-none focus:border-amber-400 font-semibold"
          />
        </div>

        <span className="text-xs font-mono text-slate-400">
          Showing <strong className="text-amber-400">{filteredDocs.length}</strong> Document Records
        </span>
      </div>

      {/* Documents Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredDocs.map((doc) => (
          <div
            key={doc.id}
            className="bg-slate-900/80 backdrop-blur-xl border border-white/10 hover:border-amber-500/40 rounded-2xl p-6 shadow-xl space-y-4 transition-all flex flex-col justify-between"
          >
            <div className="space-y-3">
              <div className="flex justify-between items-start">
                <span className="text-[10px] font-mono uppercase tracking-widest text-amber-400 bg-amber-500/10 px-2.5 py-0.5 rounded-full border border-amber-500/20 flex items-center gap-1">
                  <Tag className="w-3 h-3" /> {doc.entityType}
                </span>
                <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" /> {doc.status}
                </span>
              </div>

              <div>
                <h3 className="font-extrabold text-slate-50 text-sm leading-snug">{doc.title}</h3>
                <div className="text-[11px] font-mono text-amber-400/90 font-bold mt-0.5">{doc.entityName}</div>
              </div>

              <div className="space-y-1.5 bg-slate-950 p-3.5 rounded-xl border border-white/5 text-xs font-mono">
                <div className="flex justify-between text-slate-300">
                  <span className="text-slate-400 font-sans">Document Tag:</span>
                  <span className="font-bold text-slate-200">{doc.docTag}</span>
                </div>
                <div className="flex justify-between text-slate-300">
                  <span className="text-slate-400 font-sans">Ref / ID #:</span>
                  <span className="font-bold text-amber-400 truncate max-w-[140px]">{doc.refNumber}</span>
                </div>
                <div className="flex justify-between text-slate-300">
                  <span className="text-slate-400 font-sans">Expiry Date:</span>
                  <span className="font-bold text-slate-200">{doc.expiryDate}</span>
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-white/5 flex items-center justify-between">
              <span className="text-[10px] font-mono text-slate-500">{doc.fileName} ({doc.fileSize})</span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setSelectedDoc(doc)}
                  className="flex items-center gap-1 bg-slate-950 text-amber-400 hover:text-white border border-amber-500/30 px-3 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer"
                >
                  <Eye className="w-3 h-3" /> View
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Upload Document Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-amber-500/30 rounded-3xl p-6 sm:p-8 w-full max-w-lg shadow-2xl space-y-4 relative text-slate-100 max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setShowUploadModal(false)}
              className="absolute top-5 right-5 text-slate-400 hover:text-white cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="space-y-1 border-b border-white/10 pb-3">
              <span className="text-[10px] font-bold uppercase text-amber-400 tracking-wider">Encrypted Vault Upload</span>
              <h3 className="text-2xl font-black text-slate-50">Upload Document File</h3>
            </div>

            <form onSubmit={handleUploadSubmit} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="text-slate-300 font-bold">Document Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Driver Aadhaar Card - Suresh Patil"
                  value={uploadForm.title}
                  onChange={(e) => setUploadForm({ ...uploadForm, title: e.target.value })}
                  className="w-full bg-slate-950 border border-white/10 rounded-xl px-3.5 py-2.5 text-slate-100 focus:outline-none focus:border-amber-400 font-semibold"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-slate-300 font-bold">Target Entity Category</label>
                  <select
                    value={uploadForm.entityType}
                    onChange={(e) => setUploadForm({ ...uploadForm, entityType: e.target.value })}
                    className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-slate-100 focus:outline-none focus:border-amber-400"
                  >
                    <option value="DRIVER">DRIVER</option>
                    <option value="VEHICLE">VEHICLE</option>
                    <option value="EMPLOYEE">EMPLOYEE</option>
                    <option value="COMPANY">COMPANY</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-slate-300 font-bold">Document Tag</label>
                  <select
                    value={uploadForm.docTag}
                    onChange={(e) => setUploadForm({ ...uploadForm, docTag: e.target.value })}
                    className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-slate-100 focus:outline-none focus:border-amber-400"
                  >
                    <option value="Aadhaar Card">Aadhaar Card</option>
                    <option value="PAN Card">PAN Card</option>
                    <option value="Driving License">Driving License</option>
                    <option value="Police Verification">Police Verification</option>
                    <option value="RC Certificate">RC Certificate</option>
                    <option value="Insurance Policy">Insurance Policy</option>
                    <option value="Fitness Certificate">Fitness Certificate</option>
                    <option value="Employment Verification">Employment File</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-slate-300 font-bold">Target Entity Name / Detail *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Suresh Patil / MH 04 ER 8890"
                  value={uploadForm.entityName}
                  onChange={(e) => setUploadForm({ ...uploadForm, entityName: e.target.value })}
                  className="w-full bg-slate-950 border border-white/10 rounded-xl px-3.5 py-2.5 text-slate-100 focus:outline-none focus:border-amber-400"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-slate-300 font-bold">Reference / Policy #</label>
                  <input
                    type="text"
                    placeholder="e.g. POL-998811"
                    value={uploadForm.refNumber}
                    onChange={(e) => setUploadForm({ ...uploadForm, refNumber: e.target.value })}
                    className="w-full bg-slate-950 border border-white/10 rounded-xl px-3.5 py-2.5 text-slate-100 focus:outline-none focus:border-amber-400 font-mono"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-slate-300 font-bold">Expiry Date</label>
                  <input
                    type="date"
                    value={uploadForm.expiryDate}
                    onChange={(e) => setUploadForm({ ...uploadForm, expiryDate: e.target.value })}
                    className="w-full bg-slate-950 border border-white/10 rounded-xl px-3.5 py-2.5 text-slate-100 focus:outline-none focus:border-amber-400"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-slate-300 font-bold">Select PDF / Image File from Device *</label>
                <input
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png"
                  required
                  onChange={(e) => setUploadForm({ ...uploadForm, fileName: e.target.files?.[0]?.name || "document.pdf" })}
                  className="w-full bg-slate-950 border border-white/10 rounded-xl px-3.5 py-2 text-slate-300 text-xs file:mr-4 file:py-1 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-amber-500 file:text-slate-950"
                />
              </div>

              <div className="pt-3 border-t border-white/10 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowUploadModal(false)}
                  className="px-5 py-2.5 bg-slate-950 text-slate-400 hover:text-white rounded-xl text-xs font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-black rounded-xl text-xs uppercase tracking-wider shadow-lg shadow-amber-500/20 cursor-pointer"
                >
                  Save Document to Vault
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Document Inspector Modal */}
      {selectedDoc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-amber-500/30 rounded-2xl p-6 w-full max-w-md shadow-2xl space-y-4 relative text-slate-100">
            <button
              onClick={() => setSelectedDoc(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="space-y-1">
              <span className="text-[10px] font-bold uppercase text-amber-400 tracking-wider">Vault File Inspector</span>
              <h3 className="text-xl font-bold text-slate-50">{selectedDoc.title}</h3>
            </div>

            <div className="space-y-2 bg-slate-950 p-4 rounded-xl border border-white/10 text-xs font-mono">
              <div>Entity Category: <strong className="text-amber-400">{selectedDoc.entityType}</strong></div>
              <div>Entity Reference: <strong className="text-slate-100">{selectedDoc.entityName}</strong></div>
              <div>Document Tag: <strong className="text-slate-200">{selectedDoc.docTag}</strong></div>
              <div>Ref / Policy #: <strong className="text-amber-400">{selectedDoc.refNumber}</strong></div>
              <div>Expiry Date: <strong className="text-slate-200">{selectedDoc.expiryDate}</strong></div>
              <div>File Name: <span className="text-slate-400">{selectedDoc.fileName}</span></div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setSelectedDoc(null)}
                className="px-4 py-2 bg-amber-500 text-slate-950 font-bold rounded-xl text-xs cursor-pointer"
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
