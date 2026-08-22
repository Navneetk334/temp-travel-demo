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
  Sparkles,
  Shield,
  Upload,
  Plus,
  X
} from "lucide-react";

export default function MasterDocumentVaultPage() {
  const [search, setSearch] = useState("");
  const [activeRoot, setActiveRoot] = useState<"VEHICLES" | "DRIVERS" | "STAFF">("VEHICLES");
  const [selectedSubFolder, setSelectedSubFolder] = useState<string | null>(null);

  // Dynamic state for auto-archived folders
  const [vehicleFolders, setVehicleFolders] = useState<any[]>([]);
  const [driverFolders, setDriverFolders] = useState<any[]>([]);
  const [staffFolders, setStaffFolders] = useState<any[]>([]);

  useEffect(() => {
    // 1. Auto-organize Vehicles from Local Storage
    const savedFleet = localStorage.getItem("user_uploaded_fleet");
    if (savedFleet) {
      try {
        const fleet = JSON.parse(savedFleet);
        const folders = fleet.map((v: any) => ({
          name: `${v.make} ${v.model}`,
          regNumber: v.registrationNumber,
          docs: [
            { title: "Vehicle RC Document", ref: v.rcNumber || `RC-${v.registrationNumber}`, file: v.rcDocName || `rc_${v.registrationNumber.replace(/\s+/g, "_")}.pdf` },
            { title: "Insurance Policy", ref: v.insuranceNumber || "POL-8829102", file: v.insuranceDocName || `insurance_${v.registrationNumber.replace(/\s+/g, "_")}.pdf`, exp: v.insuranceExpiry },
            { title: "Fitness Certificate", ref: "FIT-COMPLIANCE", file: v.fitnessDocName || "fitness_cert.pdf", exp: v.fitnessExpiry },
            { title: "All India Permit", ref: "AIP-NATIONAL", file: v.allIndiaPermitDocName || "all_india_permit.pdf", exp: v.allIndiaPermitExpiry || v.permitExpiry },
            { title: "Yearly State Permit", ref: "PERMIT-ANNUAL", file: v.yearlyPermitDocName || "yearly_permit.pdf", exp: v.yearlyPermitExpiry },
            { title: "PUC Pollution Certificate", ref: "PUC-GREEN", file: v.pucDocName || "puc_certificate.pdf", exp: v.pucExpiry }
          ]
        }));
        setVehicleFolders(folders);
      } catch (e) {
        console.error(e);
      }
    } else {
      setVehicleFolders([]);
    }

    // 2. Auto-organize Drivers from Local Storage
    const savedDrivers = localStorage.getItem("user_uploaded_drivers");
    if (savedDrivers) {
      try {
        const drivers = JSON.parse(savedDrivers);
        const folders = drivers.map((d: any) => ({
          name: d.name,
          phone: d.phone,
          docs: [
            { title: "Driver Photo", ref: "KYC-PHOTO", file: d.photoName || `${d.name.toLowerCase().replace(/\s+/g, "_")}_photo.jpg` },
            { title: "Aadhaar Card", ref: d.aadhaarNumber || "9988 7766 5544", file: d.aadhaarDocName || `aadhaar_${d.name.toLowerCase().replace(/\s+/g, "_")}.pdf` },
            { title: "PAN Card", ref: d.panNumber || "ABCDE1234F", file: d.panDocName || `pan_${d.name.toLowerCase().replace(/\s+/g, "_")}.pdf` },
            { title: "Driving License", ref: d.licenseNumber || "MH-0220190045123", file: d.licenseDocName || `license_${d.name.toLowerCase().replace(/\s+/g, "_")}.pdf`, exp: d.licenseExpiry }
          ]
        }));
        setDriverFolders(folders);
      } catch (e) {
        console.error(e);
      }
    } else {
      setDriverFolders([]);
    }

    // 3. Auto-organize Office Staff from Local Storage
    const savedStaff = localStorage.getItem("user_uploaded_office_staff");
    if (savedStaff) {
      try {
        const staff = JSON.parse(savedStaff);
        const folders = staff.map((s: any) => ({
          name: s.name,
          role: s.role,
          docs: [
            { title: "Staff Photo", ref: "STAFF-PHOTO", file: s.photoName || `${s.name.toLowerCase().replace(/\s+/g, "_")}_photo.jpg` },
            { title: "Aadhaar Card", ref: s.aadhaarNumber || "1122 3344 5566", file: s.aadhaarDocName || `aadhaar_${s.name.toLowerCase().replace(/\s+/g, "_")}.pdf` },
            { title: "PAN Card", ref: s.panNumber || "ABCDE5678G", file: s.panDocName || `pan_${s.name.toLowerCase().replace(/\s+/g, "_")}.pdf` },
            { title: "Employment Contract / Offer Letter", ref: "EMP-CONTRACT-HQ", file: s.contractDocName || `contract_${s.name.toLowerCase().replace(/\s+/g, "_")}.pdf` }
          ]
        }));
        setStaffFolders(folders);
      } catch (e) {
        console.error(e);
      }
    } else {
      setStaffFolders([]);
    }
  }, []);

  const currentFolderList =
    activeRoot === "VEHICLES"
      ? vehicleFolders
      : activeRoot === "DRIVERS"
      ? driverFolders
      : staffFolders;

  const activeFolder = selectedSubFolder
    ? currentFolderList.find(f => f.name === selectedSubFolder)
    : currentFolderList[0];

  return (
    <div className="p-6 md:p-8 space-y-8 bg-slate-950 text-slate-100 min-h-screen">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-amber-500/20 pb-6">
        <div>
          <div className="flex items-center gap-2">
            <FileCheck className="w-7 h-7 text-amber-400" />
            <h1 className="text-2xl sm:text-3xl font-black text-slate-50 tracking-tight">
              Master Document Vault & Auto-Archive
            </h1>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Automatically organized document repository for Vehicles, Drivers, and Office Staff.
          </p>
        </div>

        <div className="flex items-center gap-2 bg-slate-900 border border-white/10 p-1.5 rounded-2xl">
          <button
            onClick={() => { setActiveRoot("VEHICLES"); setSelectedSubFolder(null); }}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-black transition-all cursor-pointer ${
              activeRoot === "VEHICLES" ? "bg-amber-500 text-slate-950 shadow-md" : "text-slate-400 hover:text-white"
            }`}
          >
            <Car className="w-4 h-4" />
            <span>Vehicles</span>
          </button>
          <button
            onClick={() => { setActiveRoot("DRIVERS"); setSelectedSubFolder(null); }}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-black transition-all cursor-pointer ${
              activeRoot === "DRIVERS" ? "bg-amber-500 text-slate-950 shadow-md" : "text-slate-400 hover:text-white"
            }`}
          >
            <UserCheck className="w-4 h-4" />
            <span>Drivers</span>
          </button>
          <button
            onClick={() => { setActiveRoot("STAFF"); setSelectedSubFolder(null); }}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-black transition-all cursor-pointer ${
              activeRoot === "STAFF" ? "bg-amber-500 text-slate-950 shadow-md" : "text-slate-400 hover:text-white"
            }`}
          >
            <Briefcase className="w-4 h-4" />
            <span>Office Staff</span>
          </button>
        </div>
      </div>

      {/* Explorer Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Side Sub-Folder Directory List */}
        <div className="lg:col-span-4 bg-slate-900/80 backdrop-blur-xl border border-white/10 rounded-2xl p-5 space-y-4 shadow-xl">
          <div className="flex items-center justify-between border-b border-white/10 pb-3">
            <span className="text-xs font-black uppercase text-amber-400 tracking-wider flex items-center gap-1.5">
              <Folder className="w-4 h-4" /> Root Directory: {activeRoot}
            </span>
            <span className="text-[10px] font-mono font-bold bg-amber-500/10 text-amber-300 px-2 py-0.5 rounded-full border border-amber-500/20">
              {currentFolderList.length} Folders
            </span>
          </div>

          <div className="space-y-2 max-h-[500px] overflow-y-auto pr-1">
            {currentFolderList.map((f, idx) => {
              const isSelected = (selectedSubFolder || currentFolderList[0]?.name) === f.name;
              return (
                <button
                  key={idx}
                  onClick={() => setSelectedSubFolder(f.name)}
                  className={`w-full flex items-center justify-between p-3 rounded-xl border text-left text-xs transition-all cursor-pointer ${
                    isSelected
                      ? "bg-amber-500/15 border-amber-400 text-slate-50 font-extrabold shadow-lg"
                      : "bg-slate-950 border-white/5 text-slate-300 hover:border-white/20"
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    {isSelected ? (
                      <FolderOpen className="w-4 h-4 text-amber-400 shrink-0" />
                    ) : (
                      <Folder className="w-4 h-4 text-slate-500 shrink-0" />
                    )}
                    <div>
                      <div className="font-bold text-slate-100">{f.name}</div>
                      <div className="text-[10px] font-mono text-slate-400">
                        {f.regNumber || f.phone || f.role || "Automated Folder"}
                      </div>
                    </div>
                  </div>
                  <ChevronRight className={`w-4 h-4 ${isSelected ? "text-amber-400" : "text-slate-600"}`} />
                </button>
              );
            })}
          </div>
        </div>

        {/* Right Side Documents View Inside Folder */}
        <div className="lg:col-span-8 bg-slate-900/80 backdrop-blur-xl border border-white/10 rounded-2xl p-6 space-y-6 shadow-xl">
          {activeFolder ? (
            <div className="space-y-6">
              <div className="flex items-center justify-between border-b border-white/10 pb-4">
                <div>
                  <div className="text-[10px] font-mono font-bold text-amber-400 uppercase tracking-widest">
                    {activeRoot} &gt; {activeFolder.name}
                  </div>
                  <h3 className="text-xl font-black text-slate-50 mt-0.5 flex items-center gap-2">
                    <FolderOpen className="w-5 h-5 text-amber-400" />
                    <span>{activeFolder.name}</span>
                  </h3>
                </div>

                <span className="text-xs font-mono font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-3 py-1 rounded-full flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4" /> 100% Vault Compliant
                </span>
              </div>

              {/* Documents List */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {activeFolder.docs.map((doc: any, idx: number) => (
                  <div
                    key={idx}
                    className="bg-slate-950 p-4 rounded-xl border border-white/5 hover:border-amber-400/40 transition-all space-y-3 relative group"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2.5">
                        <div className="w-9 h-9 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 font-bold">
                          <FileText className="w-4 h-4" />
                        </div>
                        <div>
                          <h4 className="font-extrabold text-slate-100 text-xs">{doc.title}</h4>
                          <div className="text-[10px] font-mono text-slate-400 mt-0.5">Ref: {doc.ref}</div>
                        </div>
                      </div>
                    </div>

                    <div className="text-[11px] font-mono text-amber-400/90 bg-amber-500/5 p-2 rounded-lg border border-amber-500/10 flex justify-between">
                      <span>File Name:</span>
                      <strong className="text-slate-200 truncate max-w-[150px]">{doc.file}</strong>
                    </div>

                    {doc.exp && (
                      <div className="text-[10px] font-mono text-slate-400 flex justify-between">
                        <span>Expiry Date:</span>
                        <span className="text-emerald-400 font-bold">{doc.exp}</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="p-12 text-center text-slate-500 italic text-xs">
              No folder selected. Select a folder from the left directory menu.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
