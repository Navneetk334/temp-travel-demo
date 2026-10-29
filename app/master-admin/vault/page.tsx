"use client";

import React, { useState, useEffect } from "react";
import {
  FileCheck,
  Search,
  Folder,
  FolderOpen,
  FileText,
  ShieldCheck,
  ChevronRight,
  Download,
  Eye,
  Trash2,
  Car,
  UserCheck,
  Briefcase,
  Upload,
  Plus,
  X,
  Edit,
  CheckCircle2,
  AlertCircle,
  FileQuestion
} from "lucide-react";
import Portal from "@/components/shared/portal";
import {
  openDocumentInNewTab,
  getVaultFile,
  setVaultFile,
  deleteVaultFile,
  getVehicleDocKey,
  getDriverDocKey,
  getStaffDocKey
} from "@/lib/vaultStorage";

export interface VaultDocItem {
  key: string; // e.g. 'rc', 'insurance', 'fitness', 'permit', 'mvtax', 'puc'
  title: string;
  ref: string;
  file: string;
  exp?: string;
  provider?: string;
  hasFile?: boolean;
}

export interface VaultFolderItem {
  id?: string;
  name: string;
  regNumber?: string;
  phone?: string;
  role?: string;
  vehicleRaw?: any;
  driverRaw?: any;
  staffRaw?: any;
  docs: VaultDocItem[];
}

function mapVehicleToFolder(v: any): VaultFolderItem {
  const regNumber = v.registrationNumber || v.regNumber || "";
  const modelName = [v.make, v.model].filter(Boolean).join(" ").trim() || regNumber || "Commercial Vehicle";
  return {
    id: v.id,
    name: modelName,
    regNumber: regNumber || "PENDING-REG",
    vehicleRaw: v,
    docs: [
      {
        key: "rc",
        title: "Vehicle RC Document",
        ref: v.rcNumber || (regNumber ? `RC-${regNumber.replace(/\s+/g, "")}` : ""),
        file: v.rcDocName || "",
        exp: "",
        hasFile: Boolean(v.rcDocName)
      },
      {
        key: "insurance",
        title: "Insurance Policy",
        ref: v.insuranceNumber || "",
        provider: v.insuranceProvider || "",
        file: v.insuranceDocName || "",
        exp: v.insuranceExpiry || "",
        hasFile: Boolean(v.insuranceDocName)
      },
      {
        key: "fitness",
        title: "Fitness Certificate",
        ref: "FIT-COMPLIANCE",
        file: v.fitnessDocName || "",
        exp: v.fitnessExpiry || "",
        hasFile: Boolean(v.fitnessDocName)
      },
      {
        key: "permit",
        title: "All India Permit",
        ref: "AIP-NATIONAL",
        file: v.allIndiaPermitDocName || "",
        exp: v.allIndiaPermitExpiry || v.permitExpiry || "",
        hasFile: Boolean(v.allIndiaPermitDocName)
      },
      {
        key: "mvtax",
        title: "Motor Vehicle Tax Receipt",
        ref: "MV-TAX",
        file: v.yearlyPermitDocName || "",
        exp: v.yearlyPermitExpiry || "",
        hasFile: Boolean(v.yearlyPermitDocName)
      },
      {
        key: "puc",
        title: "PUC Pollution Certificate",
        ref: "PUC-GREEN",
        file: v.pucDocName || "",
        exp: v.pucExpiry || "",
        hasFile: Boolean(v.pucDocName)
      }
    ]
  };
}

function mapDriverToFolder(d: any): VaultFolderItem {
  return {
    id: d.id,
    name: d.name,
    phone: d.phone,
    driverRaw: d,
    docs: [
      {
        key: "photo",
        title: "Driver Photo",
        ref: "KYC-PHOTO",
        file: d.photoName || "",
        hasFile: Boolean(d.photoName)
      },
      {
        key: "aadhaar",
        title: "Aadhaar Card",
        ref: d.aadhaarNumber || "",
        file: d.aadhaarDocName || "",
        hasFile: Boolean(d.aadhaarDocName)
      },
      {
        key: "pan",
        title: "PAN Card",
        ref: d.panNumber || "",
        file: d.panDocName || "",
        hasFile: Boolean(d.panDocName)
      },
      {
        key: "license",
        title: "Commercial Driving License",
        ref: d.licenseNumber || "",
        file: d.licenseDocName || "",
        exp: d.licenseExpiry || "",
        hasFile: Boolean(d.licenseDocName)
      }
    ]
  };
}

function mapStaffToFolder(s: any): VaultFolderItem {
  return {
    id: s.id,
    name: s.name,
    role: s.role,
    staffRaw: s,
    docs: [
      {
        key: "photo",
        title: "Staff Photo",
        ref: "STAFF-PHOTO",
        file: s.photoName || "",
        hasFile: Boolean(s.photoName)
      },
      {
        key: "aadhaar",
        title: "Aadhaar Card",
        ref: s.aadhaarNumber || "",
        file: s.aadhaarDocName || "",
        hasFile: Boolean(s.aadhaarDocName)
      },
      {
        key: "pan",
        title: "PAN Card",
        ref: s.panNumber || "",
        file: s.panDocName || "",
        hasFile: Boolean(s.panDocName)
      },
      {
        key: "contract",
        title: "Employment Agreement",
        ref: "EMP-CONTRACT-HQ",
        file: s.contractDocName || "",
        hasFile: Boolean(s.contractDocName)
      }
    ]
  };
}

export default function MasterDocumentVaultPage() {
  const [search, setSearch] = useState("");
  const [activeRoot, setActiveRoot] = useState<"VEHICLES" | "DRIVERS" | "STAFF">("VEHICLES");
  const [selectedFolderKey, setSelectedFolderKey] = useState<string | null>(null);

  // Dynamic state for auto-archived folders
  const [vehicleFolders, setVehicleFolders] = useState<VaultFolderItem[]>([]);
  const [driverFolders, setDriverFolders] = useState<VaultFolderItem[]>([]);
  const [staffFolders, setStaffFolders] = useState<VaultFolderItem[]>([]);

  // Edit / Replace Document Modal State
  const [editingDoc, setEditingDoc] = useState<{
    folder: VaultFolderItem;
    doc: VaultDocItem;
  } | null>(null);

  const [modalFormData, setModalFormData] = useState({
    file: null as File | null,
    fileName: "",
    dataUrl: "",
    refNumber: "",
    expiryDate: ""
  });

  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  useEffect(() => {
    // 1. Auto-organize Vehicles from Local Storage immediately
    const savedFleet = localStorage.getItem("user_uploaded_fleet_vehicles") || localStorage.getItem("user_uploaded_fleet");
    if (savedFleet) {
      try {
        const fleet = JSON.parse(savedFleet);
        if (Array.isArray(fleet)) {
          setVehicleFolders(fleet.map(mapVehicleToFolder));
        }
      } catch (e) {
        console.error("Error reading local fleet for vault:", e);
      }
    }

    // Also fetch from DB via /api/fleet to ensure all vehicles from all sessions are displayed
    fetch("/api/fleet")
      .then(res => res.json())
      .then(apiFleet => {
        if (Array.isArray(apiFleet) && apiFleet.length > 0) {
          setVehicleFolders(prev => {
            const map = new Map<string, VaultFolderItem>();
            apiFleet.forEach((v: any) => {
              const folder = mapVehicleToFolder(v);
              const key = (folder.regNumber || folder.name).toUpperCase().trim();
              map.set(key, folder);
            });
            prev.forEach((f: VaultFolderItem) => {
              const key = (f.regNumber || f.name).toUpperCase().trim();
              if (key && !map.has(key)) {
                map.set(key, f);
              }
            });
            return Array.from(map.values());
          });
        }
      })
      .catch(err => {
        console.warn("Failed to fetch fleet from API for vault:", err);
      });

    // 2. Auto-organize Drivers from Local Storage
    const savedDrivers = localStorage.getItem("user_uploaded_drivers");
    if (savedDrivers) {
      try {
        const drivers = JSON.parse(savedDrivers);
        if (Array.isArray(drivers)) {
          setDriverFolders(drivers.map(mapDriverToFolder));
        }
      } catch (e) {
        console.error(e);
      }
    }

    // 3. Auto-organize Office Staff from Local Storage
    const savedStaff = localStorage.getItem("user_uploaded_office_staff");
    if (savedStaff) {
      try {
        const staff = JSON.parse(savedStaff);
        if (Array.isArray(staff)) {
          setStaffFolders(staff.map(mapStaffToFolder));
        }
      } catch (e) {
        console.error(e);
      }
    }
  }, []);

  const currentFolderList =
    activeRoot === "VEHICLES"
      ? vehicleFolders
      : activeRoot === "DRIVERS"
        ? driverFolders
        : staffFolders;

  const filteredFolders = currentFolderList.filter(f => {
    const q = search.toLowerCase().trim();
    if (!q) return true;
    return (
      f.name.toLowerCase().includes(q) ||
      (f.regNumber && f.regNumber.toLowerCase().includes(q)) ||
      (f.phone && f.phone.toLowerCase().includes(q)) ||
      (f.role && f.role.toLowerCase().includes(q))
    );
  });

  const activeFolder = selectedFolderKey
    ? currentFolderList.find(f => (f.regNumber || f.name) === selectedFolderKey)
    : filteredFolders[0] || currentFolderList[0];

  // Helper to get storage key
  const getStorageKey = (folder: VaultFolderItem, docKey: string) => {
    if (activeRoot === "VEHICLES") {
      return getVehicleDocKey(folder.regNumber || folder.name, docKey);
    } else if (activeRoot === "DRIVERS") {
      return getDriverDocKey(folder.phone || folder.name, docKey);
    } else {
      return getStaffDocKey(folder.name, docKey);
    }
  };

  // View Document in New Tab
  const handleViewDocument = async (folder: VaultFolderItem, doc: VaultDocItem) => {
    const key = getStorageKey(folder, doc.key);
    let dataUrl = await getVaultFile(key);

    openDocumentInNewTab({
      title: doc.title,
      fileName: doc.file || `${doc.title.replace(/\s+/g, "_")}.pdf`,
      refNumber: doc.ref || "REF-VERIFIED",
      expiryDate: doc.exp || "Valid",
      regNumber: folder.regNumber || folder.name,
      dataUrl: dataUrl,
      category: activeRoot === "VEHICLES" ? "COMMERCIAL FLEET VAULT" : `${activeRoot} COMPLIANCE VAULT`,
      storageKey: key
    });
  };

  // Open Edit / Replace Modal
  const handleOpenEditModal = (folder: VaultFolderItem, doc: VaultDocItem) => {
    setEditingDoc({ folder, doc });
    setModalFormData({
      file: null,
      fileName: doc.file || "",
      dataUrl: "",
      refNumber: doc.ref || "",
      expiryDate: doc.exp || ""
    });
  };

  // Save Document Update
  const handleSaveDocUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingDoc) return;

    const { folder, doc } = editingDoc;
    const finalFileName = modalFormData.fileName || doc.file || `${doc.key}_document.pdf`;
    const finalRef = modalFormData.refNumber || doc.ref;
    const finalExp = modalFormData.expiryDate || doc.exp;

    // 1. If a new file was uploaded, save binary to IndexedDB
    const storageKey = getStorageKey(folder, doc.key);
    if (modalFormData.dataUrl) {
      await setVaultFile(storageKey, modalFormData.dataUrl);
    }

    // 2. Update local state
    if (activeRoot === "VEHICLES") {
      setVehicleFolders(prev =>
        prev.map(vf => {
          if ((vf.regNumber || vf.name) === (folder.regNumber || folder.name)) {
            return {
              ...vf,
              docs: vf.docs.map(d =>
                d.key === doc.key
                  ? { ...d, file: finalFileName, ref: finalRef, exp: finalExp, hasFile: true }
                  : d
              )
            };
          }
          return vf;
        })
      );

      // 3. Update localStorage for vehicles
      try {
        const savedFleet = localStorage.getItem("user_uploaded_fleet_vehicles") || localStorage.getItem("user_uploaded_fleet");
        if (savedFleet) {
          const fleet = JSON.parse(savedFleet);
          const updated = fleet.map((v: any) => {
            const matches =
              (v.registrationNumber && v.registrationNumber.toUpperCase() === (folder.regNumber || "").toUpperCase()) ||
              v.id === folder.id;
            if (matches) {
              if (doc.key === "rc") {
                v.rcDocName = finalFileName;
                if (finalRef) v.rcNumber = finalRef;
              } else if (doc.key === "insurance") {
                v.insuranceDocName = finalFileName;
                if (finalRef) v.insuranceNumber = finalRef;
                if (finalExp) v.insuranceExpiry = finalExp;
              } else if (doc.key === "fitness") {
                v.fitnessDocName = finalFileName;
                if (finalExp) v.fitnessExpiry = finalExp;
              } else if (doc.key === "permit") {
                v.allIndiaPermitDocName = finalFileName;
                if (finalExp) v.allIndiaPermitExpiry = finalExp;
              } else if (doc.key === "mvtax") {
                v.yearlyPermitDocName = finalFileName;
                if (finalExp) v.yearlyPermitExpiry = finalExp;
              } else if (doc.key === "puc") {
                v.pucDocName = finalFileName;
                if (finalExp) v.pucExpiry = finalExp;
              }
            }
            return v;
          });
          localStorage.setItem("user_uploaded_fleet_vehicles", JSON.stringify(updated));
        }
      } catch (err) {
        console.error("Error updating local fleet storage:", err);
      }

      // 4. Update Database via API
      if (folder.id) {
        try {
          const payload: any = {};
          if (doc.key === "rc") {
            payload.rcDocName = finalFileName;
            if (finalRef) payload.rcNumber = finalRef;
          } else if (doc.key === "insurance") {
            payload.insuranceDocName = finalFileName;
            if (finalRef) payload.insuranceNumber = finalRef;
            if (finalExp) payload.insuranceExpiry = finalExp;
          } else if (doc.key === "fitness") {
            payload.fitnessDocName = finalFileName;
            if (finalExp) payload.fitnessExpiry = finalExp;
          } else if (doc.key === "permit") {
            payload.allIndiaPermitDocName = finalFileName;
            if (finalExp) payload.allIndiaPermitExpiry = finalExp;
          } else if (doc.key === "mvtax") {
            payload.yearlyPermitDocName = finalFileName;
            if (finalExp) payload.yearlyPermitExpiry = finalExp;
          } else if (doc.key === "puc") {
            payload.pucDocName = finalFileName;
            if (finalExp) payload.pucExpiry = finalExp;
          }

          fetch(`/api/fleet/${folder.id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload)
          }).catch(e => console.warn("API update background sync warning:", e));
        } catch (e) {
          console.warn("DB update sync failed:", e);
        }
      }
    } else if (activeRoot === "DRIVERS") {
      setDriverFolders(prev =>
        prev.map(df => {
          if (df.name === folder.name) {
            return {
              ...df,
              docs: df.docs.map(d =>
                d.key === doc.key
                  ? { ...d, file: finalFileName, ref: finalRef, exp: finalExp, hasFile: true }
                  : d
              )
            };
          }
          return df;
        })
      );
      try {
        const savedDrivers = localStorage.getItem("user_uploaded_drivers");
        if (savedDrivers) {
          const drivers = JSON.parse(savedDrivers);
          const updated = drivers.map((d: any) => {
            if (d.name === folder.name) {
              if (doc.key === "photo") d.photoName = finalFileName;
              if (doc.key === "aadhaar") { d.aadhaarDocName = finalFileName; if (finalRef) d.aadhaarNumber = finalRef; }
              if (doc.key === "pan") { d.panDocName = finalFileName; if (finalRef) d.panNumber = finalRef; }
              if (doc.key === "license") { d.licenseDocName = finalFileName; if (finalRef) d.licenseNumber = finalRef; if (finalExp) d.licenseExpiry = finalExp; }
            }
            return d;
          });
          localStorage.setItem("user_uploaded_drivers", JSON.stringify(updated));
        }
      } catch (err) {}
    } else {
      setStaffFolders(prev =>
        prev.map(sf => {
          if (sf.name === folder.name) {
            return {
              ...sf,
              docs: sf.docs.map(d =>
                d.key === doc.key
                  ? { ...d, file: finalFileName, ref: finalRef, exp: finalExp, hasFile: true }
                  : d
              )
            };
          }
          return sf;
        })
      );
      try {
        const savedStaff = localStorage.getItem("user_uploaded_office_staff");
        if (savedStaff) {
          const staff = JSON.parse(savedStaff);
          const updated = staff.map((s: any) => {
            if (s.name === folder.name) {
              if (doc.key === "photo") s.photoName = finalFileName;
              if (doc.key === "aadhaar") { s.aadhaarDocName = finalFileName; if (finalRef) s.aadhaarNumber = finalRef; }
              if (doc.key === "pan") { s.panDocName = finalFileName; if (finalRef) s.panNumber = finalRef; }
              if (doc.key === "contract") s.contractDocName = finalFileName;
            }
            return s;
          });
          localStorage.setItem("user_uploaded_office_staff", JSON.stringify(updated));
        }
      } catch (err) {}
    }

    showToast(`${doc.title} updated and archived in vault!`);
    setEditingDoc(null);
  };

  // Delete Document
  const handleDeleteDocument = async (folder: VaultFolderItem, doc: VaultDocItem) => {
    const confirmed = window.confirm(`Are you sure you want to delete the ${doc.title} for ${folder.name}?`);
    if (!confirmed) return;

    const storageKey = getStorageKey(folder, doc.key);
    await deleteVaultFile(storageKey);

    if (activeRoot === "VEHICLES") {
      setVehicleFolders(prev =>
        prev.map(vf => {
          if ((vf.regNumber || vf.name) === (folder.regNumber || folder.name)) {
            return {
              ...vf,
              docs: vf.docs.map(d =>
                d.key === doc.key
                  ? { ...d, file: "", hasFile: false }
                  : d
              )
            };
          }
          return vf;
        })
      );

      // Local storage
      try {
        const savedFleet = localStorage.getItem("user_uploaded_fleet_vehicles") || localStorage.getItem("user_uploaded_fleet");
        if (savedFleet) {
          const fleet = JSON.parse(savedFleet);
          const updated = fleet.map((v: any) => {
            const matches =
              (v.registrationNumber && v.registrationNumber.toUpperCase() === (folder.regNumber || "").toUpperCase()) ||
              v.id === folder.id;
            if (matches) {
              if (doc.key === "rc") v.rcDocName = "";
              if (doc.key === "insurance") v.insuranceDocName = "";
              if (doc.key === "fitness") v.fitnessDocName = "";
              if (doc.key === "permit") v.allIndiaPermitDocName = "";
              if (doc.key === "mvtax") v.yearlyPermitDocName = "";
              if (doc.key === "puc") v.pucDocName = "";
            }
            return v;
          });
          localStorage.setItem("user_uploaded_fleet_vehicles", JSON.stringify(updated));
        }
      } catch (err) {}

      // DB update
      if (folder.id) {
        const payload: any = {};
        if (doc.key === "rc") payload.rcDocName = "";
        if (doc.key === "insurance") payload.insuranceDocName = "";
        if (doc.key === "fitness") payload.fitnessDocName = "";
        if (doc.key === "permit") payload.allIndiaPermitDocName = "";
        if (doc.key === "mvtax") payload.yearlyPermitDocName = "";
        if (doc.key === "puc") payload.pucDocName = "";

        fetch(`/api/fleet/${folder.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload)
        }).catch(e => console.warn(e));
      }
    } else if (activeRoot === "DRIVERS") {
      setDriverFolders(prev =>
        prev.map(df => {
          if (df.name === folder.name) {
            return {
              ...df,
              docs: df.docs.map(d =>
                d.key === doc.key ? { ...d, file: "", hasFile: false } : d
              )
            };
          }
          return df;
        })
      );
      try {
        const savedDrivers = localStorage.getItem("user_uploaded_drivers");
        if (savedDrivers) {
          const drivers = JSON.parse(savedDrivers);
          const updated = drivers.map((d: any) => {
            if (d.name === folder.name) {
              if (doc.key === "photo") d.photoName = "";
              if (doc.key === "aadhaar") d.aadhaarDocName = "";
              if (doc.key === "pan") d.panDocName = "";
              if (doc.key === "license") d.licenseDocName = "";
            }
            return d;
          });
          localStorage.setItem("user_uploaded_drivers", JSON.stringify(updated));
        }
      } catch (err) {}
    } else {
      setStaffFolders(prev =>
        prev.map(sf => {
          if (sf.name === folder.name) {
            return {
              ...sf,
              docs: sf.docs.map(d =>
                d.key === doc.key ? { ...d, file: "", hasFile: false } : d
              )
            };
          }
          return sf;
        })
      );
      try {
        const savedStaff = localStorage.getItem("user_uploaded_office_staff");
        if (savedStaff) {
          const staff = JSON.parse(savedStaff);
          const updated = staff.map((s: any) => {
            if (s.name === folder.name) {
              if (doc.key === "photo") s.photoName = "";
              if (doc.key === "aadhaar") s.aadhaarDocName = "";
              if (doc.key === "pan") s.panDocName = "";
              if (doc.key === "contract") s.contractDocName = "";
            }
            return s;
          });
          localStorage.setItem("user_uploaded_office_staff", JSON.stringify(updated));
        }
      } catch (err) {}
    }

    showToast(`${doc.title} removed from vault.`);
  };

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-[99999] bg-emerald-500 text-slate-950 font-black px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-2 text-xs border border-emerald-400 animate-bounce">
          <CheckCircle2 className="w-4 h-4" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-amber-500/20 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <FileCheck className="w-6 h-6 text-amber-400" />
            <h1 className="text-xl sm:text-2xl font-black text-slate-50 tracking-tight">
              Master Document Vault & Auto-Archive
            </h1>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Auto-organized, encrypted digital compliance repository for Vehicles, Drivers, and Corporate Staff.
          </p>
        </div>

        <div className="flex items-center gap-2 bg-surface border border-border p-1.5 rounded-2xl">
          <button
            onClick={() => { setActiveRoot("VEHICLES"); setSelectedFolderKey(null); }}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-black transition-all cursor-pointer ${activeRoot === "VEHICLES" ? "bg-amber-500 text-slate-950 shadow-md" : "text-slate-400 hover:text-white"
              }`}
          >
            <Car className="w-4 h-4" />
            <span>Vehicles ({vehicleFolders.length})</span>
          </button>
          <button
            onClick={() => { setActiveRoot("DRIVERS"); setSelectedFolderKey(null); }}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-black transition-all cursor-pointer ${activeRoot === "DRIVERS" ? "bg-amber-500 text-slate-950 shadow-md" : "text-slate-400 hover:text-white"
              }`}
          >
            <UserCheck className="w-4 h-4" />
            <span>Drivers ({driverFolders.length})</span>
          </button>
          <button
            onClick={() => { setActiveRoot("STAFF"); setSelectedFolderKey(null); }}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-black transition-all cursor-pointer ${activeRoot === "STAFF" ? "bg-amber-500 text-slate-950 shadow-md" : "text-slate-400 hover:text-white"
              }`}
          >
            <Briefcase className="w-4 h-4" />
            <span>Staff ({staffFolders.length})</span>
          </button>
        </div>
      </div>

      {/* Explorer Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Side Sub-Folder Directory List */}
        <div className="lg:col-span-4 bg-surface/80 backdrop-blur-xl border border-border rounded-2xl p-5 space-y-4 shadow-xl">
          <div className="flex items-center justify-between border-b border-border pb-3">
            <span className="text-xs font-black uppercase text-amber-400 tracking-wider flex items-center gap-1.5">
              <Folder className="w-4 h-4" /> Directory: {activeRoot}
            </span>
            <span className="text-[10px] font-mono font-bold bg-amber-500/10 text-amber-300 px-2 py-0.5 rounded-full border border-amber-500/20">
              {filteredFolders.length} Folders
            </span>
          </div>

          {/* Quick Search inside Root Directory */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder={`Search ${activeRoot.toLowerCase()}...`}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-background border border-border rounded-xl pl-9 pr-3 py-2 text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-amber-400 font-mono"
            />
          </div>

          <div className="space-y-2 max-h-[500px] overflow-y-auto pr-1">
            {filteredFolders.length === 0 ? (
              <div className="text-center py-8 text-slate-500 text-xs italic">
                No folders found. Add new items in Fleet or Drivers.
              </div>
            ) : (
              filteredFolders.map((f, idx) => {
                const folderKey = f.regNumber || f.name;
                const isSelected = (selectedFolderKey || (activeFolder?.regNumber || activeFolder?.name)) === folderKey;
                const uploadedCount = f.docs.filter(d => Boolean(d.file)).length;
                return (
                  <button
                    key={idx}
                    onClick={() => setSelectedFolderKey(folderKey)}
                    className={`w-full flex items-center justify-between p-3 rounded-xl border text-left text-xs transition-all cursor-pointer ${
                      isSelected
                        ? "bg-amber-500/15 border-amber-400 text-slate-50 font-extrabold shadow-lg"
                        : "bg-background border-border text-slate-300 hover:border-white/20"
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      {isSelected ? (
                        <FolderOpen className="w-4 h-4 text-amber-400 shrink-0" />
                      ) : (
                        <Folder className="w-4 h-4 text-slate-500 shrink-0" />
                      )}
                      <div className="truncate">
                        <div className="font-bold text-slate-100 truncate">{f.name}</div>
                        <div className="text-[10px] font-mono text-slate-400 flex items-center gap-2">
                          <span>{f.regNumber || f.phone || f.role || "Automated Folder"}</span>
                          <span className={`text-[9px] px-1.5 py-0.2 rounded font-bold ${uploadedCount === f.docs.length ? "text-emerald-400 bg-emerald-500/10" : "text-amber-400 bg-amber-500/10"}`}>
                            {uploadedCount}/{f.docs.length} docs
                          </span>
                        </div>
                      </div>
                    </div>
                    <ChevronRight className={`w-4 h-4 shrink-0 ${isSelected ? "text-amber-400" : "text-slate-600"}`} />
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* Right Side Documents View Inside Folder */}
        <div className="lg:col-span-8 bg-surface/80 backdrop-blur-xl border border-border rounded-2xl p-6 space-y-6 shadow-xl">
          {activeFolder ? (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border pb-4">
                <div>
                  <div className="text-[10px] font-mono font-bold text-amber-400 uppercase tracking-widest">
                    {activeRoot} &gt; {activeFolder.name}
                  </div>
                  <h3 className="text-xl font-black text-slate-50 mt-0.5 flex items-center gap-2">
                    <FolderOpen className="w-5 h-5 text-amber-400" />
                    <span>{activeFolder.name}</span>
                    {activeFolder.regNumber && (
                      <span className="text-xs font-mono font-bold bg-amber-500/10 text-amber-300 border border-amber-500/30 px-2 py-0.5 rounded-lg">
                        {activeFolder.regNumber}
                      </span>
                    )}
                  </h3>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-3 py-1 rounded-full flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4" /> Vault Encrypted
                  </span>
                </div>
              </div>

              {/* Documents Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {activeFolder.docs.map((doc, idx) => {
                  const hasFile = Boolean(doc.file);
                  return (
                    <div
                      key={idx}
                      className={`p-4 rounded-xl border transition-all space-y-3.5 relative flex flex-col justify-between ${
                        hasFile
                          ? "bg-background border-border hover:border-amber-400/40"
                          : "bg-background/50 border-dashed border-white/10"
                      }`}
                    >
                      <div className="space-y-2.5">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-center gap-2.5">
                            <div className={`w-9 h-9 rounded-lg flex items-center justify-center font-bold ${
                              hasFile
                                ? "bg-amber-500/10 border border-amber-500/30 text-amber-400"
                                : "bg-slate-800 text-slate-500"
                            }`}>
                              <FileText className="w-4 h-4" />
                            </div>
                            <div>
                              <h4 className="font-extrabold text-slate-100 text-xs">{doc.title}</h4>
                              <div className="text-[10px] font-mono text-slate-400 mt-0.5">
                                Ref: {doc.ref || "Pending"}
                              </div>
                            </div>
                          </div>

                          <span className={`text-[9px] font-mono font-bold px-2 py-0.5 rounded-full uppercase tracking-wider shrink-0 ${
                            hasFile
                              ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                              : "bg-rose-500/10 text-rose-400 border border-rose-500/20"
                          }`}>
                            {hasFile ? "Uploaded" : "Missing"}
                          </span>
                        </div>

                        <div className="text-[11px] font-mono text-amber-400/90 bg-amber-500/5 p-2 rounded-lg border border-amber-500/10 flex justify-between items-center">
                          <span className="text-slate-400 text-[10px]">File:</span>
                          <strong className="text-slate-200 truncate max-w-[170px]" title={doc.file || "No file uploaded"}>
                            {doc.file || "No document uploaded"}
                          </strong>
                        </div>

                        {doc.exp && (
                          <div className="text-[10px] font-mono text-slate-400 flex justify-between">
                            <span>Expiry Date:</span>
                            <span className="text-emerald-400 font-bold">{doc.exp}</span>
                          </div>
                        )}
                      </div>

                      {/* Action Buttons: View in New Tab, Change / Upload, Delete */}
                      <div className="pt-2 border-t border-white/5 flex items-center justify-end gap-2">
                        {hasFile && (
                          <button
                            type="button"
                            onClick={() => handleViewDocument(activeFolder, doc)}
                            className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-amber-400 text-xs font-bold rounded-lg border border-amber-500/20 flex items-center gap-1.5 transition-all cursor-pointer hover:shadow-md"
                            title="Open and view document in a new tab"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span>View</span>
                          </button>
                        )}

                        <button
                          type="button"
                          onClick={() => handleOpenEditModal(activeFolder, doc)}
                          className={`px-2.5 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
                            hasFile
                              ? "bg-slate-800 hover:bg-amber-500 hover:text-slate-950 text-slate-300 border border-white/10"
                              : "bg-amber-500 text-slate-950 font-black hover:brightness-110 shadow-md shadow-amber-500/20"
                          }`}
                          title={hasFile ? "Change or replace document" : "Upload document"}
                        >
                          <Upload className="w-3.5 h-3.5" />
                          <span>{hasFile ? "Change" : "Upload"}</span>
                        </button>

                        {hasFile && (
                          <button
                            type="button"
                            onClick={() => handleDeleteDocument(activeFolder, doc)}
                            className="p-1.5 bg-slate-800/80 hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 rounded-lg border border-white/5 transition-all cursor-pointer"
                            title="Delete this document from vault"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="p-12 text-center text-slate-500 italic text-xs">
              No folder selected. Select a folder from the left directory menu.
            </div>
          )}
        </div>
      </div>

      {/* Edit / Change / Upload Document Modal */}
      {editingDoc && (
        <Portal>
          <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
            <div className="bg-surface border border-amber-500/30 rounded-2xl p-6 w-full max-w-lg shadow-2xl space-y-5 relative text-slate-100">
              <button
                onClick={() => setEditingDoc(null)}
                className="absolute top-4 right-4 text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="space-y-1">
                <div className="text-[10px] font-mono uppercase tracking-widest text-amber-400 font-bold">
                  Document Vault Manager • {activeRoot}
                </div>
                <h3 className="text-lg font-black text-slate-50">
                  {editingDoc.doc.hasFile ? "Change / Replace Document" : "Upload Document"}
                </h3>
                <p className="text-xs text-slate-400">
                  Target: <strong className="text-slate-200">{editingDoc.folder.name}</strong> ({editingDoc.folder.regNumber || editingDoc.folder.phone || editingDoc.folder.role})
                </p>
              </div>

              <form onSubmit={handleSaveDocUpdate} className="space-y-4 text-xs">
                {/* Document Title Display */}
                <div className="bg-background/80 p-3 rounded-xl border border-border">
                  <div className="text-[10px] font-mono text-slate-400 uppercase">Document Category</div>
                  <div className="text-sm font-bold text-amber-400">{editingDoc.doc.title}</div>
                </div>

                {/* File Upload Picker */}
                <div className="space-y-1.5">
                  <label className="text-slate-300 font-bold block">
                    Choose Replacement Document File (.pdf, .jpg, .png) *
                  </label>
                  <input
                    type="file"
                    accept=".pdf,image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        const reader = new FileReader();
                        reader.onload = (ev) => {
                          setModalFormData(prev => ({
                            ...prev,
                            file: file,
                            fileName: file.name,
                            dataUrl: ev.target?.result as string
                          }));
                        };
                        reader.readAsDataURL(file);
                      }
                    }}
                    className="w-full bg-background border border-border rounded-xl px-3 py-2 text-slate-300 text-xs file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-amber-500 file:text-slate-950 cursor-pointer"
                  />
                  {modalFormData.fileName && (
                    <div className="text-[11px] font-mono text-emerald-400 flex items-center gap-1.5 mt-1">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Selected file: <strong>{modalFormData.fileName}</strong></span>
                    </div>
                  )}
                </div>

                {/* Reference Number */}
                <div className="space-y-1">
                  <label className="text-slate-300 font-bold block">
                    Reference / Policy / Certificate Number
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. MH04/RC/8890 or POL-8829102"
                    value={modalFormData.refNumber}
                    onChange={(e) => setModalFormData({ ...modalFormData, refNumber: e.target.value })}
                    className="w-full bg-background border border-border rounded-xl px-3.5 py-2.5 text-slate-100 font-mono focus:outline-none focus:border-amber-400"
                  />
                </div>

                {/* Expiry Date */}
                <div className="space-y-1">
                  <label className="text-slate-300 font-bold block">
                    Document Expiry Date (if applicable)
                  </label>
                  <input
                    type="date"
                    value={modalFormData.expiryDate}
                    onClick={(e) => e.currentTarget.showPicker?.()}
                    onChange={(e) => setModalFormData({ ...modalFormData, expiryDate: e.target.value })}
                    className="w-full bg-background border border-border rounded-xl px-3.5 py-2.5 text-slate-100 font-mono focus:outline-none focus:border-amber-400 cursor-pointer [color-scheme:dark]"
                  />
                </div>

                <div className="pt-3 border-t border-border flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setEditingDoc(null)}
                    className="px-4 py-2 bg-background hover:bg-white/5 text-slate-400 rounded-xl font-bold cursor-pointer transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black rounded-xl uppercase tracking-wider shadow-lg shadow-amber-500/20 cursor-pointer transition-all"
                  >
                    Save & Archive Document
                  </button>
                </div>
              </form>
            </div>
          </div>
        </Portal>
      )}
    </div>
  );
}
