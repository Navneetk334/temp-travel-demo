"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  FileText,
  Plus,
  Search,
  Calendar,
  Car,
  Clock,
  MapPin,
  Building2,
  Phone,
  Scan,
  UploadCloud,
  Eye,
  Edit,
  Trash2,
  Printer,
  X,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Sparkles,
  RefreshCw,
  Layers,
  ArrowRight,
  Receipt,
  User,
  ShieldCheck,
  ChevronRight,
  Maximize2,
  Camera,
  Wifi,
  Activity,
  Check,
  Sliders,
  Laptop,
  Loader2,
  Paperclip,
  Navigation
} from "lucide-react";
import Portal from "@/components/shared/portal";
import { DutySlipRecord, DutyAttachment } from "@/lib/duties";
import { isDispatchDeleted } from "@/lib/lead-sync";

// Helper to convert any date string (YYYY-MM-DD or DD/MM/YYYY) to DD/MM/YYYY
function formatToDDMMYYYY(val?: string): string {
  if (!val) return "";
  const trimmed = val.trim();
  if (/^\d{2}\/\d{2}\/\d{4}$/.test(trimmed)) {
    return trimmed;
  }
  if (/^\d{2}-\d{2}-\d{4}$/.test(trimmed)) {
    return trimmed.replace(/-/g, "/");
  }
  if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
    const [y, m, d] = trimmed.split("-");
    return `${d}/${m}/${y}`;
  }
  const parsed = new Date(trimmed);
  if (!isNaN(parsed.getTime())) {
    const d = String(parsed.getDate()).padStart(2, "0");
    const m = String(parsed.getMonth() + 1).padStart(2, "0");
    const y = parsed.getFullYear();
    return `${d}/${m}/${y}`;
  }
  return trimmed;
}

// Helper to convert DD/MM/YYYY to YYYY-MM-DD for native date pickers
function toYYYYMMDD(val?: string): string {
  if (!val) return "";
  const trimmed = val.trim();
  if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
    return trimmed;
  }
  if (/^\d{2}\/\d{2}\/\d{4}$/.test(trimmed)) {
    const [d, m, y] = trimmed.split("/");
    return `${y}-${m}-${d}`;
  }
  if (/^\d{2}-\d{2}-\d{4}$/.test(trimmed)) {
    const [d, m, y] = trimmed.split("-");
    return `${y}-${m}-${d}`;
  }
  const parsed = new Date(trimmed);
  if (!isNaN(parsed.getTime())) {
    return parsed.toISOString().split("T")[0];
  }
  return "";
}

// Calculate total days between start and end dates
function calculateTotalDays(startStr?: string, endStr?: string): string {
  if (!startStr || !endStr) return "1 Day";
  const startISO = toYYYYMMDD(startStr);
  const endISO = toYYYYMMDD(endStr);
  if (!startISO || !endISO) return "1 Day";
  const start = new Date(startISO);
  const end = new Date(endISO);
  const diffTime = end.getTime() - start.getTime();
  const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24)) + 1;
  if (diffDays <= 1) return "1 Day";
  return `${diffDays} Days`;
}

// Reusable DatePicker with DD/MM/YYYY display, direct input and calendar pop-up
function DatePickerDDMMYYYY({
  value,
  onChange,
  className = "",
  placeholder = "dd/mm/yyyy",
}: {
  value: string;
  onChange: (val: string) => void;
  className?: string;
  placeholder?: string;
}) {
  const hiddenDateRef = useRef<HTMLInputElement>(null);
  const displayVal = formatToDDMMYYYY(value);
  const isoVal = toYYYYMMDD(value);

  return (
    <div className="relative flex items-center w-full">
      <input
        type="text"
        placeholder={placeholder}
        value={displayVal}
        onChange={(e) => {
          onChange(e.target.value);
        }}
        className={`w-full bg-surface text-center font-mono font-bold text-slate-100 p-2 pr-7 rounded border border-border focus:border-accent text-xs placeholder:text-slate-500 ${className}`}
      />
      <button
        type="button"
        onClick={() => {
          if (hiddenDateRef.current) {
            if (hiddenDateRef.current.showPicker) {
              hiddenDateRef.current.showPicker();
            } else {
              hiddenDateRef.current.click();
            }
          }
        }}
        className="absolute right-1.5 p-1 text-accent hover:text-yellow-400 transition-colors"
        title="Select date (dd/mm/yyyy)"
      >
        <Calendar className="w-3.5 h-3.5" />
      </button>
      <input
        type="date"
        ref={hiddenDateRef}
        value={isoVal}
        onClick={(e) => e.currentTarget.showPicker?.()}
        onChange={(e) => {
          const raw = e.target.value;
          if (raw) {
            onChange(formatToDDMMYYYY(raw));
          }
        }}
        className="sr-only pointer-events-none absolute"
        tabIndex={-1}
      />
    </div>
  );
}

export default function AdminDutiesPage() {
  const [duties, setDuties] = useState<DutySlipRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDate, setSelectedDate] = useState("");
  const [feedbackFilter, setFeedbackFilter] = useState("ALL");

  // Modals
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingDuty, setEditingDuty] = useState<DutySlipRecord | null>(null);
  const [viewingDuty, setViewingDuty] = useState<DutySlipRecord | null>(null);
  const [viewingRouteDuty, setViewingRouteDuty] = useState<DutySlipRecord | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [scanMessage, setScanMessage] = useState("");
  const [uploadDocCategory, setUploadDocCategory] = useState<string>("Duty Slip");

  // Real Scanner & Camera Hub States
  const [isScanOptionsModalOpen, setIsScanOptionsModalOpen] = useState(false);
  const [isPrinterScannerModalOpen, setIsPrinterScannerModalOpen] = useState(false);
  const [isScanningPrinter, setIsScanningPrinter] = useState(false);
  const [scannerProgress, setScannerProgress] = useState(0);
  const [scannerStatusText, setScannerStatusText] = useState("");
  const [scannerTab, setScannerTab] = useState<"PRINTER_ESCL" | "DOCUMENT_CAMERA" | "FILE_UPLOAD">("PRINTER_ESCL");
  
  // Real Hardware Device Enumeration
  const [installedPrintersList, setInstalledPrintersList] = useState<Array<{ name: string; driver: string; port: string; isDefault: boolean; type: string }>>([]);
  const [connectedCamerasList, setConnectedCamerasList] = useState<Array<{ deviceId: string; label: string }>>([]);
  const [isLoadingDevices, setIsLoadingDevices] = useState(false);
  const [selectedScannerDevice, setSelectedScannerDevice] = useState("HP Smart Tank 750 series [A371A2]");
  const [printerIp, setPrinterIp] = useState("192.168.1.100");
  const [printerPingStatus, setPrinterPingStatus] = useState<"IDLE" | "CHECKING" | "ONLINE" | "LAN_LOCAL">("IDLE");
  const [scanDpi, setScanDpi] = useState("300");
  const [scanColorMode, setScanColorMode] = useState("COLOR");
  const [scanCloudGuidance, setScanCloudGuidance] = useState("");

  // Real Camera Document Scanner
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState("");
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const mobileCameraInputRef = useRef<HTMLInputElement>(null);

  // Form State
  const initialFormState: Omit<DutySlipRecord, "id" | "createdAt" | "updatedAt"> = {
    tripSheetNo: "",
    carNo: "",
    date: "",
    reportedTo: "",
    account: "",
    reportAt: "",
    garageDepartureDate: "",
    garageDepartureTime: "",
    garageOpeningKm: "",
    reportingDate: "",
    reportingTime: "",
    reportingKm: "",
    releaseDate: "",
    releaseTime: "",
    releaseKm: "",
    garagingDate: "",
    garagingTime: "",
    garagingKm: "",
    totalHours: "",
    totalKms: "",
    remarks: "",
    serviceFeedback: "EXCELLENT",
    parkingTollTax: "",
    placeOfRelease: "",
    mobile: "",
    officeTo: "",
    bookedBy: "",
    officeFor: "",
    garageInTime: "",
    garageInKm: "",
    officeReleasePlace: "",
    parkingAmount: "",
    handoverPerson: "",
    handoverDate: "",
    handoverTime: "",
    officeRemarks: "",
    usageTracks: [],
    slipImageUrl: "",
    slipImageName: "",
    attachments: [],
  };

  const [formData, setFormData] = useState(initialFormState);
  const [isDeletingId, setIsDeletingId] = useState<string | null>(null);
  const [isSubmittingForm, setIsSubmittingForm] = useState(false);

  // Fetch all duties
  const fetchDuties = async () => {
    try {
      setIsLoading(true);
      const params = new URLSearchParams();
      if (searchQuery) params.append("search", searchQuery);
      if (selectedDate) params.append("date", selectedDate);
      if (feedbackFilter !== "ALL") params.append("feedback", feedbackFilter);

      const res = await fetch(`/api/duties?${params.toString()}`);
      const data = await res.json();
      let serverDuties: DutySlipRecord[] = [];
      if (data.success && Array.isArray(data.duties)) {
        serverDuties = data.duties;
      }

      // Check localStorage deleted IDs to ensure deleted items never flash/reappear
      let deletedIds: string[] = [];
      try {
        deletedIds = JSON.parse(localStorage.getItem("admin_deleted_duty_ids") || "[]");
      } catch (e) {}

      // Check localStorage custom slips to merge any immediate local additions
      let localCustom: DutySlipRecord[] = [];
      try {
        localCustom = JSON.parse(localStorage.getItem("admin_custom_duty_slips") || "[]");
      } catch (e) {}

      // Check localStorage master_dispatches in case any local dispatches are pending sync
      let localDispatches: DutySlipRecord[] = [];
      try {
        const rawDisp = JSON.parse(localStorage.getItem("master_dispatches") || "[]");
        if (Array.isArray(rawDisp)) {
          localDispatches = rawDisp.map((d: any): DutySlipRecord => ({
            id: d.id || `DS-${d.bookingNumber || Date.now()}`,
            tripSheetNo: d.bookingNumber || d.pnr || `TT-DS-${String(d.id || Date.now()).slice(-4)}`,
            carNo: d.regNumber || d.vehicleModel || "Assigned Fleet",
            date: d.pickupDate || (d.createdAt ? String(d.createdAt).split("T")[0] : new Date().toISOString().split("T")[0]),
            reportedTo: d.customerName || "Customer Lead",
            account: d.tripType || "Dispatched Ride",
            reportAt: d.pickupLocation || "Pickup Hub",
            garageDepartureTime: "06:30 AM",
            garageOpeningKm: "45100",
            reportingTime: d.pickupTime || "08:00 AM",
            reportingKm: "45115",
            releaseTime: "06:30 PM",
            releaseKm: "45195",
            garagingTime: "07:30 PM",
            garagingKm: "45210",
            totalHours: "8.0",
            totalKms: "80",
            remarks: `[Local Dispatch] ${d.tripType || "Ride"} - ${d.vehicleCategory || "Fleet"}`,
            serviceFeedback: "EXCELLENT",
            parkingTollTax: "0",
            releaseDate: d.pickupDate || new Date().toISOString().split("T")[0],
            placeOfRelease: d.dropLocation || "Drop Hub",
            mobile: d.phone || "",
            officeTo: "Operations Desk",
            bookedBy: d.customerName || "Staff",
            officeFor: d.tripType || "Dispatch",
            garageInTime: "07:30 PM",
            garageInKm: "45210",
            officeReleasePlace: d.dropLocation || "Drop Hub",
            parkingAmount: "0",
            handoverPerson: d.driverName || "Assigned Chauffeur",
            handoverDate: d.pickupDate || new Date().toISOString().split("T")[0],
            handoverTime: "07:45 PM",
            officeRemarks: `Status: ${d.status || "CONFIRMED"} | Fare: ₹${d.fare || 0}`,
            usageTracks: [
              { id: "1", from: "Garage", to: d.pickupLocation || "Pickup Hub", details: "Reporting" },
              { id: "2", from: d.pickupLocation || "Pickup Hub", to: d.dropLocation || "Drop Hub", details: "Transit" }
            ],
            slipImageUrl: "",
            slipImageName: "",
            attachments: [],
            createdAt: d.createdAt || new Date().toISOString(),
            updatedAt: d.updatedAt || new Date().toISOString(),
          }));
        }
      } catch (e) {}

      const combined = [...localCustom, ...serverDuties, ...localDispatches];
      const seen = new Set<string>();
      const filtered = combined.filter((d) => {
        if (!d || !d.id) return false;
        if (isDispatchDeleted(d) || isDispatchDeleted({ customerName: d.reportedTo })) {
          return false;
        }
        if (deletedIds.includes(d.id) || (d.tripSheetNo && deletedIds.includes(d.tripSheetNo))) {
          return false;
        }
        if (seen.has(d.id) || (d.tripSheetNo && seen.has(d.tripSheetNo))) {
          return false;
        }
        seen.add(d.id);
        if (d.tripSheetNo) seen.add(d.tripSheetNo);
        return true;
      });

      setDuties(filtered);
    } catch (err) {
      console.error("Error fetching duties:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const loadRealDevices = async () => {
    setIsLoadingDevices(true);
    try {
      const res = await fetch("/api/duties/scan/devices");
      const data = await res.json();
      if (data.success && data.devices?.length) {
        setInstalledPrintersList(data.devices);
        const defaultDev = data.devices.find((d: any) => d.isDefault) || data.devices[0];
        if (defaultDev) {
          setSelectedScannerDevice(defaultDev.name);
          if (defaultDev.port && defaultDev.port.includes("192.")) {
            const match = defaultDev.port.match(/\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}/);
            if (match) setPrinterIp(match[0]);
          } else {
            setPrinterIp("192.168.1.15");
          }
        }
      }

      // Enumerate connected cameras / document capture devices
      if (typeof navigator !== "undefined" && navigator.mediaDevices?.enumerateDevices) {
        const devs = await navigator.mediaDevices.enumerateDevices();
        const vDevs = devs
          .filter((d) => d.kind === "videoinput")
          .map((d, i) => ({
            deviceId: d.deviceId,
            label: d.label || `Connected Video Scanner #${i + 1}`,
          }));
        setConnectedCamerasList(vDevs);
      }
    } catch (err) {
      console.error("Error loading real hardware devices:", err);
    } finally {
      setIsLoadingDevices(false);
    }
  };

  useEffect(() => {
    fetchDuties();
    loadRealDevices();
  }, [searchQuery, selectedDate, feedbackFilter]);

  // Open Create Modal
  const handleOpenCreateModal = () => {
    setEditingDuty(null);
    const today = new Date();
    const todayISO = today.toISOString().split("T")[0];
    const todayDD = formatToDDMMYYYY(todayISO);
    setFormData({
      ...initialFormState,
      tripSheetNo: `TT-DS-${Math.floor(1000 + Math.random() * 9000)}`,
      date: todayISO,
      garageDepartureDate: todayDD,
      reportingDate: todayDD,
      releaseDate: todayDD,
      garagingDate: todayDD,
    });
    setScanMessage("");
    setIsFormModalOpen(true);
  };

  // Open Edit Modal
  const handleOpenEditModal = (duty: DutySlipRecord) => {
    setEditingDuty(duty);
    const existingAttachments: DutyAttachment[] = (duty.attachments && duty.attachments.length > 0)
      ? duty.attachments
      : duty.slipImageUrl && !duty.slipImageUrl.includes("hero-bg")
        ? [{
            id: `att_init_${Date.now()}`,
            name: duty.slipImageName || "Duty_Slip",
            category: "Duty Slip",
            url: duty.slipImageUrl,
            fileType: (duty.slipImageUrl.includes("application/pdf") || (duty.slipImageName || "").toLowerCase().endsWith(".pdf")) ? "pdf" : "image"
          }]
        : [];

    const dutyDateDD = formatToDDMMYYYY(duty.date);

    setFormData({
      tripSheetNo: duty.tripSheetNo,
      carNo: duty.carNo,
      date: duty.date,
      reportedTo: duty.reportedTo,
      account: duty.account,
      reportAt: duty.reportAt,
      garageDepartureDate: duty.garageDepartureDate ? formatToDDMMYYYY(duty.garageDepartureDate) : dutyDateDD,
      garageDepartureTime: duty.garageDepartureTime,
      garageOpeningKm: duty.garageOpeningKm,
      reportingDate: duty.reportingDate ? formatToDDMMYYYY(duty.reportingDate) : dutyDateDD,
      reportingTime: duty.reportingTime,
      reportingKm: duty.reportingKm,
      releaseDate: duty.releaseDate ? formatToDDMMYYYY(duty.releaseDate) : dutyDateDD,
      releaseTime: duty.releaseTime,
      releaseKm: duty.releaseKm,
      garagingDate: duty.garagingDate ? formatToDDMMYYYY(duty.garagingDate) : dutyDateDD,
      garagingTime: duty.garagingTime,
      garagingKm: duty.garagingKm,
      totalHours: duty.totalHours,
      totalKms: duty.totalKms,
      remarks: duty.remarks || "",
      serviceFeedback: duty.serviceFeedback,
      parkingTollTax: duty.parkingTollTax,
      placeOfRelease: duty.placeOfRelease,
      mobile: duty.mobile,
      officeTo: duty.officeTo,
      bookedBy: duty.bookedBy,
      officeFor: duty.officeFor,
      garageInTime: duty.garageInTime,
      garageInKm: duty.garageInKm,
      officeReleasePlace: duty.officeReleasePlace,
      parkingAmount: duty.parkingAmount,
      handoverPerson: duty.handoverPerson,
      handoverDate: duty.handoverDate,
      handoverTime: duty.handoverTime,
      officeRemarks: duty.officeRemarks,
      usageTracks: duty.usageTracks || [],
      slipImageUrl: duty.slipImageUrl && !duty.slipImageUrl.includes("hero-bg") ? duty.slipImageUrl : "",
      slipImageName: duty.slipImageName || "",
      attachments: existingAttachments,
    });
    setScanMessage("");
    setIsFormModalOpen(true);
  };

  // Convert time string to 24-hour format HH:mm
  const to24Hour = (timeStr?: string): string => {
    if (!timeStr) return "";
    const str = timeStr.trim();
    if (/^([01]\d|2[0-3]):[0-5]\d$/.test(str)) {
      return str;
    }
    const match = str.match(/(\d{1,2}):(\d{2})(?::\d{2})?\s*(AM|PM)?/i);
    if (!match) return str;
    let hours = parseInt(match[1], 10);
    const minutes = match[2];
    const modifier = match[3]?.toUpperCase();

    if (modifier === "PM" && hours < 12) hours += 12;
    if (modifier === "AM" && hours === 12) hours = 0;

    return `${String(hours).padStart(2, "0")}:${minutes}`;
  };

  // Auto-calculate Total Hours in 24-hour time format (with multi-day date support)
  const handleCalculateHours = (
    departure: string,
    garaging: string,
    reporting?: string,
    release?: string,
    depDate?: string,
    garDate?: string
  ) => {
    const startTime = departure || reporting || "";
    const endTime = garaging || release || "";
    if (!startTime || !endTime) return;

    const s24 = to24Hour(startTime);
    const e24 = to24Hour(endTime);
    if (!s24.includes(":") || !e24.includes(":")) return;

    const [sH, sM] = s24.split(":").map(Number);
    const [eH, eM] = e24.split(":").map(Number);
    if (isNaN(sH) || isNaN(sM) || isNaN(eH) || isNaN(eM)) return;

    const sDateISO = depDate ? toYYYYMMDD(depDate) : "";
    const eDateISO = garDate ? toYYYYMMDD(garDate) : "";

    let diffMins = 0;
    if (sDateISO && eDateISO && sDateISO !== eDateISO) {
      const startDateTime = new Date(`${sDateISO}T${s24}:00`);
      const endDateTime = new Date(`${eDateISO}T${e24}:00`);
      if (!isNaN(startDateTime.getTime()) && !isNaN(endDateTime.getTime())) {
        const diffMs = endDateTime.getTime() - startDateTime.getTime();
        diffMins = Math.max(0, Math.round(diffMs / 60000));
      } else {
        const startTotalMins = sH * 60 + sM;
        let endTotalMins = eH * 60 + eM;
        if (endTotalMins < startTotalMins) endTotalMins += 24 * 60;
        diffMins = endTotalMins - startTotalMins;
      }
    } else {
      const startTotalMins = sH * 60 + sM;
      let endTotalMins = eH * 60 + eM;
      if (endTotalMins < startTotalMins) endTotalMins += 24 * 60;
      diffMins = endTotalMins - startTotalMins;
    }

    const hours = diffMins / 60;
    const computedHours = (Math.round(hours * 10) / 10).toFixed(1);

    setFormData((prev) => ({
      ...prev,
      totalHours: computedHours,
    }));
  };

  // Auto-calculate Total KM
  const handleCalculateTotals = (openingKmStr: string, garagingKmStr: string) => {
    const opening = parseFloat(openingKmStr);
    const garaging = parseFloat(garagingKmStr);
    if (!isNaN(opening) && !isNaN(garaging) && garaging >= opening) {
      setFormData((prev) => ({
        ...prev,
        totalKms: String(garaging - opening),
      }));
    }
  };

  // Handle Document Upload (PDF & Images, Multi-File Support)
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const newAttachments: DutyAttachment[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const isPdf = file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf");

      await new Promise<void>((resolve) => {
        const reader = new FileReader();
        reader.onload = () => {
          const resultStr = reader.result as string;
          if (isPdf) {
            newAttachments.push({
              id: `att_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
              name: file.name,
              category: uploadDocCategory || "Duty Slip",
              url: resultStr,
              fileType: "pdf",
              size: `${(file.size / (1024 * 1024)).toFixed(2)} MB`,
              uploadedAt: new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", hour12: false }),
            });
            resolve();
          } else {
            const img = new Image();
            img.onload = () => {
              const canvas = document.createElement("canvas");
              let width = img.width;
              let height = img.height;
              const MAX_DIM = 1920;
              if (width > MAX_DIM || height > MAX_DIM) {
                if (width > height) {
                  height *= MAX_DIM / width;
                  width = MAX_DIM;
                } else {
                  width *= MAX_DIM / height;
                  height = MAX_DIM;
                }
              }
              canvas.width = width;
              canvas.height = height;
              const ctx = canvas.getContext("2d");
              if (ctx) {
                ctx.drawImage(img, 0, 0, width, height);
                const compressedBase64 = canvas.toDataURL("image/jpeg", 0.7);
                newAttachments.push({
                  id: `att_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
                  name: file.name,
                  category: uploadDocCategory || "Duty Slip",
                  url: compressedBase64,
                  fileType: "image",
                  size: `${(file.size / 1024).toFixed(0)} KB`,
                  uploadedAt: new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", hour12: false }),
                });
              } else {
                newAttachments.push({
                  id: `att_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
                  name: file.name,
                  category: uploadDocCategory || "Duty Slip",
                  url: resultStr,
                  fileType: "image",
                  size: `${(file.size / 1024).toFixed(0)} KB`,
                  uploadedAt: new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", hour12: false }),
                });
              }
              resolve();
            };
            img.onerror = () => {
              newAttachments.push({
                id: `att_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
                name: file.name,
                category: uploadDocCategory || "Duty Slip",
                url: resultStr,
                fileType: "image",
                size: `${(file.size / 1024).toFixed(0)} KB`,
                uploadedAt: new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", hour12: false }),
              });
              resolve();
            };
            img.src = resultStr;
          }
        };
        reader.readAsDataURL(file);
      });
    }

    if (newAttachments.length > 0) {
      setFormData((prev) => {
        const combined = [...(prev.attachments || []), ...newAttachments];
        const primarySlip = combined.find((a) => a.category === "Duty Slip") || combined[0];
        return {
          ...prev,
          attachments: combined,
          slipImageUrl: primarySlip?.url || prev.slipImageUrl,
          slipImageName: primarySlip?.name || prev.slipImageName,
        };
      });
      setScanMessage(`Attached ${newAttachments.length} document(s) successfully.`);
    }

    if (e.target) e.target.value = "";
  };

  // Remove single attachment from formData
  const handleRemoveAttachment = (attId: string) => {
    setFormData((prev) => {
      const filtered = (prev.attachments || []).filter((a) => a.id !== attId);
      const primarySlip = filtered.find((a) => a.category === "Duty Slip") || filtered[0];
      return {
        ...prev,
        attachments: filtered,
        slipImageUrl: primarySlip ? primarySlip.url : "",
        slipImageName: primarySlip ? primarySlip.name : "",
      };
    });
  };

  // Real Camera Document Scanner Controls
  const startCamera = async () => {
    setCameraError("");
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: "environment",
          width: { ideal: 1920 },
          height: { ideal: 1080 }
        }
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
      setIsCameraActive(true);
    } catch (err: any) {
      console.error("Camera access error:", err);
      setCameraError("Camera access denied or device not found. Please enable camera permission in your browser.");
    }
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach((track) => track.stop());
      videoRef.current.srcObject = null;
    }
    setIsCameraActive(false);
  };

  const captureCameraSnapshot = async () => {
    if (!videoRef.current || !canvasRef.current) return;
    const video = videoRef.current;
    const canvas = canvasRef.current;
    const w = video.videoWidth || 1920;
    const h = video.videoHeight || 1080;
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext("2d");
    if (ctx) {
      ctx.drawImage(video, 0, 0, w, h);
      const dataUrl = canvas.toDataURL("image/jpeg", 0.7);
      stopCamera();
      setIsPrinterScannerModalOpen(false);
      setIsScanOptionsModalOpen(false);
      setIsFormModalOpen(true);

      const newAtt: DutyAttachment = {
        id: `att_${Date.now()}`,
        name: `camera_capture_${Date.now()}.jpg`,
        category: "Duty Slip",
        url: dataUrl,
        fileType: "image",
        size: "Captured",
        uploadedAt: new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", hour12: false })
      };

      setFormData((prev) => ({
        ...prev,
        slipImageUrl: dataUrl,
        slipImageName: newAtt.name,
        attachments: [...(prev.attachments || []), newAtt],
      }));
      setScanMessage("Camera snapshot captured and attached to duty slip.");
    }
  };

  // Real Network Printer Scanner Connection Probe & Ingestion
  const handleTestPrinterPing = async () => {
    setPrinterPingStatus("CHECKING");
    try {
      const res = await fetch("/api/duties/scan/network", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          scannerIp: printerIp,
          protocol: "eSCL",
          dpi: parseInt(scanDpi, 10) || 300,
          colorMode: scanColorMode,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setPrinterPingStatus("ONLINE");
      } else {
        setPrinterPingStatus("LAN_LOCAL");
      }
    } catch (err) {
      setPrinterPingStatus("LAN_LOCAL");
    }
  };

  const handleStartPrinterScan = async () => {
    setIsScanningPrinter(true);
    setScannerProgress(20);
    setScannerStatusText(`Accessing physical scanner hardware '${selectedScannerDevice}'...`);

    try {
      // 1. Send WIA Hardware Scan Request to host PC
      const res = await fetch("/api/duties/scan/wia", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          deviceName: selectedScannerDevice,
          dpi: parseInt(scanDpi, 10) || 300,
          colorMode: scanColorMode,
        }),
      });

      const data = await res.json();
      setScannerProgress(60);

      if (data.success && (data.imageBase64 || data.imageUrl)) {
        setScannerStatusText(`Acquired physical scan from ${selectedScannerDevice}! Attaching to duty slip...`);
        const realScanImage = data.imageBase64 || data.imageUrl;
        const newAtt: DutyAttachment = {
          id: `att_${Date.now()}`,
          name: data.fileName || `hp_scan_${Date.now()}.jpg`,
          category: "Duty Slip",
          url: realScanImage,
          fileType: (data.fileName || "").toLowerCase().endsWith(".pdf") ? "pdf" : "image",
          size: "Scanned",
          uploadedAt: new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", hour12: false })
        };
        
        setFormData((prev) => ({
          ...prev,
          slipImageUrl: realScanImage,
          slipImageName: newAtt.name,
          attachments: [...(prev.attachments || []), newAtt],
        }));

        setScannerProgress(100);
        setScannerStatusText("Physical scan complete! Opening duty slip...");

        setTimeout(() => {
          setIsScanningPrinter(false);
          setIsPrinterScannerModalOpen(false);
          setIsScanOptionsModalOpen(false);
          setIsFormModalOpen(true);
        }, 500);
      } else {
        setIsScanningPrinter(false);
        setScanCloudGuidance(data.message || `Physical scanner '${selectedScannerDevice}' could not be accessed. Please ensure the scanner is turned on and paper is placed on the glass bed.`);
      }
    } catch (err: any) {
      console.error("Physical scan error:", err);
      setIsScanningPrinter(false);
      setScanCloudGuidance(`Physical scan connection: ${err.message || "Failed to communicate with scanner"}`);
    }
  };

  // Add Leg / Route Log to Car Usage Sheet
  const handleAddRouteLog = () => {
    setFormData((prev) => ({
      ...prev,
      usageTracks: [
        ...prev.usageTracks,
        {
          id: String(prev.usageTracks.length + 1),
          from: "",
          to: "",
          details: `Route Log ${prev.usageTracks.length + 1}`,
        },
      ],
    }));
  };
  const handleAddUsageLeg = handleAddRouteLog;

  const handleRemoveUsageLeg = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      usageTracks: prev.usageTracks.filter((_, i) => i !== index),
    }));
  };

  const handleUpdateUsageLeg = (index: number, field: "from" | "to", val: string) => {
    setFormData((prev) => {
      const updated = [...prev.usageTracks];
      updated[index] = { ...updated[index], [field]: val };
      return { ...prev, usageTracks: updated };
    });
  };

  // Submit Duty Form
  const handleSubmitDutyForm = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmittingForm(true);
    try {
      if (editingDuty) {
        // Edit flow
        const res = await fetch(`/api/duties/${editingDuty.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        });
        const resData = await res.json();
        const updated = resData.duty || {
          ...editingDuty,
          ...formData,
          updatedAt: new Date().toISOString(),
        };

        setDuties((prev) =>
          prev.map((d) => (d.id === editingDuty.id ? updated : d))
        );

        // Update local cache
        try {
          const localCustom: DutySlipRecord[] = JSON.parse(localStorage.getItem("admin_custom_duty_slips") || "[]");
          const idx = localCustom.findIndex((d) => d.id === editingDuty.id);
          if (idx >= 0) {
            localCustom[idx] = updated;
          } else {
            localCustom.unshift(updated);
          }
          localStorage.setItem("admin_custom_duty_slips", JSON.stringify(localCustom));
        } catch (e) {}
      } else {
        // Create flow
        const res = await fetch("/api/duties", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        });
        const resData = await res.json();
        if (resData.success && resData.duty) {
          setDuties((prev) => [resData.duty, ...prev]);

          // Save to local cache
          try {
            const localCustom: DutySlipRecord[] = JSON.parse(localStorage.getItem("admin_custom_duty_slips") || "[]");
            localCustom.unshift(resData.duty);
            localStorage.setItem("admin_custom_duty_slips", JSON.stringify(localCustom));
          } catch (e) {}
        }
      }
      setIsFormModalOpen(false);
      setEditingDuty(null);
    } catch (err) {
      console.error("Submit error:", err);
    } finally {
      setIsSubmittingForm(false);
    }
  };

  // Delete Record
  const handleDeleteDuty = async (id: string) => {
    if (!confirm("Are you sure you want to delete this Duty Slip record?")) {
      return;
    }

    setIsDeletingId(id);
    try {
      // 1. Optimistic UI update
      setDuties((prev) => prev.filter((d) => d.id !== id && d.tripSheetNo !== id));
      if (viewingDuty?.id === id || viewingDuty?.tripSheetNo === id) setViewingDuty(null);

      // 2. Persist in localStorage deleted list so it NEVER returns
      try {
        const stored = JSON.parse(localStorage.getItem("admin_deleted_duty_ids") || "[]");
        if (!stored.includes(id)) {
          stored.push(id);
          localStorage.setItem("admin_deleted_duty_ids", JSON.stringify(stored));
        }
        // Also remove from local custom slips if present
        const localCustom: DutySlipRecord[] = JSON.parse(localStorage.getItem("admin_custom_duty_slips") || "[]");
        const filteredCustom = localCustom.filter((d) => d.id !== id && d.tripSheetNo !== id);
        localStorage.setItem("admin_custom_duty_slips", JSON.stringify(filteredCustom));
      } catch (e) {}

      // 3. Call backend DELETE API
      await fetch(`/api/duties/${id}`, {
        method: "DELETE",
      });
    } catch (err) {
      console.error("Delete duty slip error:", err);
    } finally {
      setIsDeletingId(null);
    }
  };

  // KPI Calculations
  const totalDutyCount = duties.length;
  const totalKmsAll = duties.reduce((acc, d) => acc + (parseFloat(d.totalKms) || 0), 0);
  const totalHoursAll = duties.reduce((acc, d) => acc + (parseFloat(d.totalHours) || 0), 0);
  const totalTollTaxAll = duties.reduce((acc, d) => acc + (parseFloat(d.parkingTollTax) || 0), 0);

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
      
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-6">
        <div>
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-accent/10 border border-accent/20 rounded-xl text-accent">
              <FileText className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-50 tracking-tight">
                Duty Slip Master Registry
              </h1>
              <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
                Manage commercial trip sheets, garage logs, kilometer reconciliations, and AI slip scans.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsScanOptionsModalOpen(true)}
            className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-border font-bold px-4 py-2.5 rounded-xl text-xs uppercase tracking-wider transition-all shadow-md"
          >
            <Scan className="w-4 h-4 text-accent" />
            <span>Scan / Upload Slip</span>
          </button>

          <button
            onClick={handleOpenCreateModal}
            className="flex items-center gap-2 bg-accent hover:bg-yellow-500 text-slate-950 font-extrabold px-5 py-2.5 rounded-xl text-xs uppercase tracking-wider transition-all shadow-lg shadow-accent/20"
          >
            <Plus className="w-4 h-4" />
            <span>Add Duty Slip</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-surface border border-border p-5 rounded-2xl space-y-2">
          <div className="flex justify-between items-center text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider">Total Duty Slips</span>
            <FileText className="w-4 h-4 text-accent" />
          </div>
          <p className="text-2xl sm:text-3xl font-black text-slate-50">{totalDutyCount}</p>
          <span className="text-[11px] text-emerald-400 font-semibold flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" />
            <span>100% Digitized Records</span>
          </span>
        </div>

        <div className="bg-surface border border-border p-5 rounded-2xl space-y-2">
          <div className="flex justify-between items-center text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider">Total Fleet Distance</span>
            <Car className="w-4 h-4 text-accent" />
          </div>
          <p className="text-2xl sm:text-3xl font-black text-slate-50">{totalKmsAll.toLocaleString()} <span className="text-xs text-slate-400 font-normal">KM</span></p>
          <span className="text-[11px] text-slate-400">Garage to Garage Basis</span>
        </div>

        <div className="bg-surface border border-border p-5 rounded-2xl space-y-2">
          <div className="flex justify-between items-center text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider">Chauffeur Hours</span>
            <Clock className="w-4 h-4 text-accent" />
          </div>
          <p className="text-2xl sm:text-3xl font-black text-slate-50">{totalHoursAll.toFixed(1)} <span className="text-xs text-slate-400 font-normal">Hrs</span></p>
          <span className="text-[11px] text-slate-400">Duty Duration Logged</span>
        </div>

        <div className="bg-surface border border-border p-5 rounded-2xl space-y-2">
          <div className="flex justify-between items-center text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider">Toll & Parking Reconciled</span>
            <Receipt className="w-4 h-4 text-accent" />
          </div>
          <p className="text-2xl sm:text-3xl font-black text-amber-400">₹{totalTollTaxAll.toLocaleString()}</p>
          <span className="text-[11px] text-slate-400">Direct Pass-Through Taxes</span>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-surface/80 border border-border p-4 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by Trip Sheet No, Vehicle Number, Guest Name, Corporate Account, or Location..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-background border border-border rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-accent"
          />
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="flex items-center gap-2 bg-background border border-border px-3 py-2 rounded-xl text-xs text-slate-300">
            <Calendar className="w-3.5 h-3.5 text-accent" />
            <input
              type="date"
              value={selectedDate}
              onClick={(e) => e.currentTarget.showPicker?.()}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="bg-transparent text-slate-200 focus:outline-none cursor-pointer text-xs [color-scheme:dark]"
            />
          </div>

          <select
            value={feedbackFilter}
            onChange={(e) => setFeedbackFilter(e.target.value)}
            className="bg-background border border-border px-3 py-2.5 rounded-xl text-xs text-slate-300 focus:outline-none focus:border-accent font-semibold"
          >
            <option value="ALL">All Feedback</option>
            <option value="EXCELLENT">Excellent</option>
            <option value="GOOD">Good</option>
            <option value="POOR">Poor</option>
          </select>

          {(searchQuery || selectedDate || feedbackFilter !== "ALL") && (
            <button
              onClick={() => {
                setSearchQuery("");
                setSelectedDate("");
                setFeedbackFilter("ALL");
              }}
              className="p-2.5 text-slate-400 hover:text-white bg-background border border-border rounded-xl"
              title="Reset Filters"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Main Registry Table */}
      <div className="bg-surface border border-border rounded-2xl overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-background/80 border-b border-border text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              <tr>
                <th className="py-3.5 px-4">Trip Sheet / Date</th>
                <th className="py-3.5 px-4">Vehicle / Account</th>
                <th className="py-3.5 px-4">Reported To / Guest</th>
                <th className="py-3.5 px-4">Garage Metrics (KM & Hrs)</th>
                <th className="py-3.5 px-4">Toll & Parking</th>
                <th className="py-3.5 px-4">Rating & Scan</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-slate-400">
                    <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-accent" />
                    <span>Loading Duty Slip Registry...</span>
                  </td>
                </tr>
              ) : duties.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-slate-400">
                    <FileText className="w-8 h-8 mx-auto mb-2 text-slate-600" />
                    <p className="font-bold text-slate-300">No Duty Slips Found</p>
                    <p className="text-xs text-slate-500 mt-1">Click "Add Duty Slip" or "Scan Slip" to record a new trip sheet.</p>
                  </td>
                </tr>
              ) : (
                duties.map((duty) => (
                  <tr key={duty.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="py-3.5 px-4">
                      <span className="font-mono font-bold text-accent block">{duty.tripSheetNo}</span>
                      <span className="text-[10px] text-slate-400 flex items-center gap-1 mt-0.5">
                        <Calendar className="w-3 h-3" />
                        {formatToDDMMYYYY(duty.date)}
                      </span>
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 bg-background border border-border font-mono font-bold text-slate-200 rounded">
                          {duty.carNo}
                        </span>
                      </div>
                      <span className="text-[11px] text-slate-400 block mt-1 truncate max-w-[160px]">
                        {duty.account || "Individual Rental"}
                      </span>
                    </td>

                    <td className="py-3.5 px-4">
                      <span className="font-bold text-slate-100 block">{duty.reportedTo || "Guest Commute"}</span>
                      <span className="text-[10px] text-slate-400 flex items-center gap-1 mt-0.5">
                        <Phone className="w-3 h-3 text-slate-500" />
                        {duty.mobile || "N/A"}
                      </span>
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <div>
                          <span className="font-mono font-extrabold text-slate-100">{duty.totalKms} KM</span>
                          <span className="text-[10px] text-slate-500 block">Dist. Covered</span>
                        </div>
                        <div className="border-l border-border pl-3">
                          <span className="font-mono font-bold text-slate-300">{duty.totalHours} Hrs</span>
                          <span className="text-[10px] text-slate-500 block">Duration</span>
                        </div>
                      </div>
                    </td>

                    <td className="py-3.5 px-4 font-mono font-extrabold text-amber-400">
                      ₹{parseFloat(duty.parkingTollTax || "0").toLocaleString()}
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="space-y-1">
                        <span
                          className={`inline-block px-2 py-0.5 text-[9px] font-black uppercase tracking-wider rounded ${
                            duty.serviceFeedback === "EXCELLENT"
                              ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                              : duty.serviceFeedback === "GOOD"
                              ? "bg-blue-500/20 text-blue-400 border border-blue-500/30"
                              : "bg-red-500/20 text-red-400 border border-red-500/30"
                          }`}
                        >
                          {duty.serviceFeedback}
                        </span>

                        {duty.attachments && duty.attachments.length > 0 ? (
                          <div className="flex items-center gap-1 text-[10px] text-accent font-semibold">
                            <Paperclip className="w-3 h-3" />
                            <span>{duty.attachments.length} file{duty.attachments.length > 1 ? "s" : ""}</span>
                          </div>
                        ) : duty.slipImageUrl ? (
                          <a
                            href={duty.slipImageUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[10px] text-accent hover:underline flex items-center gap-1 font-semibold"
                            title="Open scanned slip in original quality"
                          >
                            <ExternalLink className="w-2.5 h-2.5" />
                            <span>Slip Attached</span>
                          </a>
                        ) : null}
                      </div>
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => setViewingRouteDuty(duty)}
                          className="p-1.5 bg-sky-500/10 hover:bg-sky-500/20 text-sky-400 rounded-lg transition-colors"
                          title="View Route on Map"
                        >
                          <Navigation className="w-4 h-4" />
                        </button>

                        <button
                          onClick={() => setViewingDuty(duty)}
                          className="p-1.5 bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white rounded-lg transition-colors"
                          title="View Official Duty Dossier"
                        >
                          <Eye className="w-4 h-4" />
                        </button>

                        <button
                          onClick={() => handleOpenEditModal(duty)}
                          className="p-1.5 bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white rounded-lg transition-colors"
                          title="Edit Duty Slip Record"
                        >
                          <Edit className="w-4 h-4" />
                        </button>

                        <button
                          onClick={() => handleDeleteDuty(duty.id)}
                          disabled={isDeletingId === duty.id}
                          className="p-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-lg transition-colors disabled:opacity-50"
                          title="Delete Record"
                        >
                          {isDeletingId === duty.id ? (
                            <Loader2 className="w-4 h-4 animate-spin text-red-400" />
                          ) : (
                            <Trash2 className="w-4 h-4" />
                          )}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* MODAL 1: ADD / EDIT DUTY SLIP & DOCUMENT VAULT MODAL */}
      {/* ========================================================================= */}
      {isFormModalOpen && (
        <Portal>
          <div className="fixed inset-0 z-[99999] bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-5 overflow-y-auto">
            <div className="bg-surface border border-border rounded-3xl max-w-4xl w-full p-6 sm:p-8 space-y-6 shadow-2xl relative my-auto max-h-[92vh] overflow-y-auto scrollbar-thin">
              
              {/* Modal Header */}
              <div className="flex justify-between items-start border-b border-border pb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-accent/20 text-accent border border-accent/30">
                      TEMP TRAVEL CAR RENTALS PVT LTD
                    </span>
                    <span className="text-xs text-slate-400 font-mono">GSTIN: 07AACCT9842M1Z5</span>
                  </div>
                  <h2 className="text-xl sm:text-2xl font-black text-slate-50 mt-1">
                    {editingDuty ? "Edit Physical Duty Slip Record" : "Add New Physical Duty Slip Entry"}
                  </h2>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Enter details manually or upload a scanned slip image to auto-fill all columns.
                  </p>
                </div>
                <button
                  onClick={() => setIsFormModalOpen(false)}
                  className="p-2 bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white rounded-full transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* DUTY SLIP & MULTI-EXPENSE MEDIA VAULT */}
              <div className="bg-background p-4 sm:p-5 rounded-2xl border border-border space-y-4">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-accent/10 border border-accent/20 rounded-xl text-accent">
                      <Paperclip className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-slate-100">Duty Slip & Expense Media Vault</h4>
                      <p className="text-[11px] text-slate-400">
                        Upload original duty slip scan plus separate receipts (Toll, Parking, State Tax, Fuel, etc.). PDF & Image formats supported.
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2.5">
                    {/* Category Selector */}
                    <select
                      value={uploadDocCategory}
                      onChange={(e) => setUploadDocCategory(e.target.value)}
                      className="bg-surface border border-border text-slate-200 text-xs font-semibold rounded-xl px-3 py-2 focus:outline-none focus:border-accent"
                    >
                      <option value="Duty Slip">Duty Slip</option>
                      <option value="Toll Tax Receipt">Toll Tax Receipt</option>
                      <option value="Parking Receipt">Parking Receipt</option>
                      <option value="State Tax / Border">State Tax / Border</option>
                      <option value="Fuel Receipt">Fuel Receipt</option>
                      <option value="Other Receipt">Other Attachment</option>
                    </select>

                    <input
                      type="file"
                      ref={fileInputRef}
                      accept="image/*,application/pdf,.pdf"
                      multiple
                      onChange={handleFileUpload}
                      className="hidden"
                    />

                    <button
                      type="button"
                      onClick={() => setIsPrinterScannerModalOpen(true)}
                      disabled={isScanning || isScanningPrinter}
                      className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-border font-bold px-3.5 py-2 rounded-xl text-xs uppercase tracking-wider transition-all disabled:opacity-50 shadow-sm"
                    >
                      <Printer className="w-3.5 h-3.5 text-accent" />
                      <span>Scan / Camera</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={isScanning || isScanningPrinter}
                      className="flex items-center gap-2 bg-accent hover:bg-yellow-500 text-slate-950 font-extrabold px-4 py-2 rounded-xl text-xs uppercase tracking-wider transition-all disabled:opacity-50 shadow-md shadow-accent/20"
                    >
                      <UploadCloud className="w-3.5 h-3.5" />
                      <span>Upload Files / PDF</span>
                    </button>
                  </div>
                </div>

                {/* Status Message */}
                {scanMessage && (
                  <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-emerald-400 text-xs flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-4 h-4 flex-shrink-0" />
                      <span>{scanMessage}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setScanMessage("")}
                      className="text-slate-400 hover:text-white"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}

                {/* Uploaded Attachments Gallery */}
                {formData.attachments && formData.attachments.length > 0 ? (
                  <div className="space-y-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                      Uploaded Documents & Receipts ({formData.attachments.length})
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
                      {formData.attachments.map((att) => (
                        <div
                          key={att.id}
                          className="flex items-center justify-between p-2.5 bg-surface border border-border rounded-xl group hover:border-slate-600 transition-colors"
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            {att.fileType === "pdf" ? (
                              <div className="w-10 h-10 rounded-lg bg-rose-500/20 border border-rose-500/30 text-rose-400 flex flex-col items-center justify-center shrink-0">
                                <FileText className="w-4 h-4" />
                                <span className="text-[8px] font-black uppercase">PDF</span>
                              </div>
                            ) : (
                              <img
                                src={att.url}
                                alt={att.name}
                                className="w-10 h-10 object-cover rounded-lg border border-border shrink-0"
                              />
                            )}
                            <div className="min-w-0">
                              <span className="text-[10px] font-bold text-accent uppercase tracking-wider block">
                                {att.category}
                              </span>
                              <span className="text-xs font-semibold text-slate-200 block truncate max-w-[150px]" title={att.name}>
                                {att.name}
                              </span>
                              {att.size && (
                                <span className="text-[10px] text-slate-400">{att.size}</span>
                              )}
                            </div>
                          </div>

                          <div className="flex items-center gap-1 shrink-0">
                            <a
                              href={att.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="p-1.5 text-slate-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                              title="Open original document"
                            >
                              <ExternalLink className="w-3.5 h-3.5" />
                            </a>
                            <button
                              type="button"
                              onClick={() => handleRemoveAttachment(att.id)}
                              className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors"
                              title="Remove document"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : formData.slipImageUrl ? (
                  <div className="flex items-center justify-between bg-surface p-3 rounded-xl border border-border">
                    <div className="flex items-center gap-3">
                      <img
                        src={formData.slipImageUrl}
                        alt="Scanned Slip Preview"
                        className="w-12 h-12 object-cover rounded-lg border border-border"
                      />
                      <div>
                        <span className="text-xs font-bold text-slate-200 block">{formData.slipImageName || "Duty Slip"}</span>
                        <span className="text-[10px] text-emerald-400 font-semibold">Slip Image Stored & Attached</span>
                      </div>
                    </div>

                    <a
                      href={formData.slipImageUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1.5 text-xs text-accent hover:underline font-bold bg-background px-3 py-1.5 rounded-lg border border-border"
                    >
                      <Maximize2 className="w-3.5 h-3.5" />
                      <span>View Full Resolution</span>
                    </a>
                  </div>
                ) : (
                  <p className="text-[11px] text-slate-500 italic">No attachments added yet. Choose a category and click &quot;Upload Files / PDF&quot; or &quot;Scan / Camera&quot;.</p>
                )}
              </div>

              {/* FORM FIELDS */}
              <form onSubmit={handleSubmitDutyForm} className="space-y-6 text-xs">
                
                {/* SECTION 1: HEADER DETAILS */}
                <div className="space-y-3">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2 border-b border-border pb-2">
                    <FileText className="w-4 h-4 text-accent" />
                    <span>1. Header & Passenger Reporting Info</span>
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-slate-400 font-bold uppercase mb-1">Trip Sheet No *</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. TT-DS-9842"
                        value={formData.tripSheetNo}
                        onChange={(e) => setFormData({ ...formData, tripSheetNo: e.target.value })}
                        className="w-full bg-background border border-border rounded-lg p-2.5 text-slate-100 font-mono font-bold focus:border-accent"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-400 font-bold uppercase mb-1">Car No. (Vehicle Reg) *</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. DL 1ZB 9842"
                        value={formData.carNo}
                        onChange={(e) => setFormData({ ...formData, carNo: e.target.value.toUpperCase() })}
                        className="w-full bg-background border border-border rounded-lg p-2.5 text-slate-100 font-mono font-bold focus:border-accent"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-400 font-bold uppercase mb-1">Date * (dd/mm/yyyy)</label>
                      <DatePickerDDMMYYYY
                        value={formData.date}
                        onChange={(val) => {
                          const iso = toYYYYMMDD(val);
                          const dd = formatToDDMMYYYY(val);
                          setFormData((prev) => ({
                            ...prev,
                            date: iso || val,
                            garageDepartureDate: prev.garageDepartureDate || dd,
                            reportingDate: prev.reportingDate || dd,
                            releaseDate: prev.releaseDate || dd,
                            garagingDate: prev.garagingDate || dd,
                          }));
                        }}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-slate-400 font-bold uppercase mb-1">Car to Report to Mr. *</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Mr. Rajesh Malhotra"
                        value={formData.reportedTo}
                        onChange={(e) => setFormData({ ...formData, reportedTo: e.target.value })}
                        className="w-full bg-background border border-border rounded-lg p-2.5 text-slate-100 focus:border-accent"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-400 font-bold uppercase mb-1">Acc. (Account / Company)</label>
                      <input
                        type="text"
                        placeholder="e.g. McKinsey & Company"
                        value={formData.account}
                        onChange={(e) => setFormData({ ...formData, account: e.target.value })}
                        className="w-full bg-background border border-border rounded-lg p-2.5 text-slate-100 focus:border-accent"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-400 font-bold uppercase mb-1">Report At (Location)</label>
                      <input
                        type="text"
                        placeholder="e.g. Aerocity Hotel Pullman, New Delhi"
                        value={formData.reportAt}
                        onChange={(e) => setFormData({ ...formData, reportAt: e.target.value })}
                        className="w-full bg-background border border-border rounded-lg p-2.5 text-slate-100 focus:border-accent"
                      />
                    </div>
                  </div>
                </div>

                {/* SECTION 2: TIME & KM TRACKING (PHYSICAL SLIP TABLE) */}
                <div className="space-y-3">
                  <div className="flex justify-between items-center border-b border-border pb-2">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
                      <Clock className="w-4 h-4 text-accent" />
                      <span>2. Garage-to-Garage Time & KM Tracking Table</span>
                    </h3>
                    <span className="text-[10px] text-amber-400 font-semibold italic">
                      * Dates in DD/MM/YYYY format • Timing & Distance Calculated From Garage to Garage basis
                    </span>
                  </div>

                  <div className="bg-background border border-border rounded-xl overflow-x-auto">
                    <table className="w-full text-center border-collapse">
                      <thead className="bg-surface border-b border-border text-[10px] uppercase font-bold text-slate-300">
                        <tr>
                          <th className="p-2 border-r border-border">Departure Garage</th>
                          <th className="p-2 border-r border-border">Reporting</th>
                          <th className="p-2 border-r border-border">Release</th>
                          <th className="p-2 border-r border-border">Garaging</th>
                          <th className="p-2 bg-surface/90 font-extrabold text-accent">Total</th>
                        </tr>
                      </thead>
                      <tbody>
                        {/* 1. DATES ROW (DD/MM/YYYY) */}
                        <tr className="bg-surface/50 text-[10px] uppercase font-bold text-slate-300 border-b border-border">
                          <td className="p-1 border-r border-border text-slate-400">Date (dd/mm/yyyy)</td>
                          <td className="p-1 border-r border-border text-slate-400">Date (dd/mm/yyyy)</td>
                          <td className="p-1 border-r border-border text-slate-400">Date (dd/mm/yyyy)</td>
                          <td className="p-1 border-r border-border text-slate-400">Date (dd/mm/yyyy)</td>
                          <td className="p-1 bg-surface/90 font-extrabold text-accent">Total Days</td>
                        </tr>
                        <tr className="border-b border-border bg-surface/20">
                          <td className="p-2 border-r border-border">
                            <DatePickerDDMMYYYY
                              value={formData.garageDepartureDate || formatToDDMMYYYY(formData.date)}
                              onChange={(val) => {
                                setFormData((prev) => ({ ...prev, garageDepartureDate: val }));
                                handleCalculateHours(
                                  formData.garageDepartureTime,
                                  formData.garagingTime,
                                  formData.reportingTime,
                                  formData.releaseTime,
                                  val,
                                  formData.garagingDate || formData.releaseDate || val
                                );
                              }}
                            />
                          </td>
                          <td className="p-2 border-r border-border">
                            <DatePickerDDMMYYYY
                              value={formData.reportingDate || formData.garageDepartureDate || formatToDDMMYYYY(formData.date)}
                              onChange={(val) => setFormData((prev) => ({ ...prev, reportingDate: val }))}
                            />
                          </td>
                          <td className="p-2 border-r border-border">
                            <DatePickerDDMMYYYY
                              value={formData.releaseDate || formData.garageDepartureDate || formatToDDMMYYYY(formData.date)}
                              onChange={(val) => {
                                setFormData((prev) => ({ ...prev, releaseDate: val }));
                                handleCalculateHours(
                                  formData.garageDepartureTime,
                                  formData.garagingTime,
                                  formData.reportingTime,
                                  formData.releaseTime,
                                  formData.garageDepartureDate,
                                  formData.garagingDate || val
                                );
                              }}
                            />
                          </td>
                          <td className="p-2 border-r border-border">
                            <DatePickerDDMMYYYY
                              value={formData.garagingDate || formData.releaseDate || formData.garageDepartureDate || formatToDDMMYYYY(formData.date)}
                              onChange={(val) => {
                                setFormData((prev) => ({ ...prev, garagingDate: val }));
                                handleCalculateHours(
                                  formData.garageDepartureTime,
                                  formData.garagingTime,
                                  formData.reportingTime,
                                  formData.releaseTime,
                                  formData.garageDepartureDate,
                                  val
                                );
                              }}
                            />
                          </td>
                          <td className="p-2 bg-surface/50">
                            <div className="font-mono font-black text-slate-100 text-xs">
                              {calculateTotalDays(
                                formData.garageDepartureDate || formData.date,
                                formData.garagingDate || formData.releaseDate || formData.date
                              )}
                            </div>
                            <span className="text-[9px] text-slate-400 block mt-0.5">Duration</span>
                          </td>
                        </tr>

                        {/* 2. TIME ROW (24H) */}
                        <tr className="bg-surface/40 text-[10px] uppercase font-bold text-slate-300 border-b border-border">
                          <td className="p-1 border-r border-border">Departure Time (24h)</td>
                          <td className="p-1 border-r border-border">Reporting Time (24h)</td>
                          <td className="p-1 border-r border-border">Release Time (24h)</td>
                          <td className="p-1 border-r border-border">Garaging Time (24h)</td>
                          <td className="p-1 bg-surface/90 font-extrabold text-accent">Total Hours</td>
                        </tr>
                        <tr className="border-b border-border">
                          <td className="p-2 border-r border-border">
                            <input
                              type="time"
                              value={to24Hour(formData.garageDepartureTime)}
                              onChange={(e) => {
                                const val = e.target.value;
                                setFormData((prev) => ({ ...prev, garageDepartureTime: val }));
                                handleCalculateHours(
                                  val,
                                  formData.garagingTime,
                                  formData.reportingTime,
                                  formData.releaseTime,
                                  formData.garageDepartureDate,
                                  formData.garagingDate
                                );
                              }}
                              className="w-full bg-surface text-center font-mono font-bold text-slate-100 p-2 rounded border border-border focus:border-accent [color-scheme:dark]"
                            />
                          </td>
                          <td className="p-2 border-r border-border">
                            <input
                              type="time"
                              value={to24Hour(formData.reportingTime)}
                              onChange={(e) => {
                                const val = e.target.value;
                                setFormData((prev) => ({ ...prev, reportingTime: val }));
                                handleCalculateHours(
                                  formData.garageDepartureTime,
                                  formData.garagingTime,
                                  val,
                                  formData.releaseTime,
                                  formData.garageDepartureDate,
                                  formData.garagingDate
                                );
                              }}
                              className="w-full bg-surface text-center font-mono font-bold text-slate-100 p-2 rounded border border-border focus:border-accent [color-scheme:dark]"
                            />
                          </td>
                          <td className="p-2 border-r border-border">
                            <input
                              type="time"
                              value={to24Hour(formData.releaseTime)}
                              onChange={(e) => {
                                const val = e.target.value;
                                setFormData((prev) => ({ ...prev, releaseTime: val }));
                                handleCalculateHours(
                                  formData.garageDepartureTime,
                                  formData.garagingTime,
                                  formData.reportingTime,
                                  val,
                                  formData.garageDepartureDate,
                                  formData.garagingDate
                                );
                              }}
                              className="w-full bg-surface text-center font-mono font-bold text-slate-100 p-2 rounded border border-border focus:border-accent [color-scheme:dark]"
                            />
                          </td>
                          <td className="p-2 border-r border-border">
                            <input
                              type="time"
                              value={to24Hour(formData.garagingTime)}
                              onChange={(e) => {
                                const val = e.target.value;
                                setFormData((prev) => ({ ...prev, garagingTime: val }));
                                handleCalculateHours(
                                  formData.garageDepartureTime,
                                  val,
                                  formData.reportingTime,
                                  formData.releaseTime,
                                  formData.garageDepartureDate,
                                  formData.garagingDate
                                );
                              }}
                              className="w-full bg-surface text-center font-mono font-bold text-slate-100 p-2 rounded border border-border focus:border-accent [color-scheme:dark]"
                            />
                          </td>
                          <td className="p-2 bg-surface/50">
                            <input
                              type="text"
                              readOnly
                              placeholder="0.0"
                              value={formData.totalHours}
                              className="w-full bg-surface text-center text-accent font-extrabold p-2 rounded border border-accent/20 cursor-not-allowed"
                              title="Auto-calculated from departure and garaging times (24h)"
                            />
                            <span className="text-[9px] text-slate-400 block mt-0.5">Auto-calculated</span>
                          </td>
                        </tr>
                        <tr className="bg-surface/40 text-[10px] uppercase font-bold text-slate-300 border-b border-border">
                          <td className="p-2 border-r border-border">Opening KM (Garage)</td>
                          <td className="p-2 border-r border-border">Reporting KM</td>
                          <td className="p-2 border-r border-border">Release KM</td>
                          <td className="p-2 border-r border-border">Garaging KM</td>
                          <td className="p-2 bg-surface/90 font-extrabold text-accent">Total KMs</td>
                        </tr>
                        <tr>
                          <td className="p-2 border-r border-border">
                            <input
                              type="number"
                              placeholder="45120"
                              value={formData.garageOpeningKm}
                              onChange={(e) => {
                                setFormData({ ...formData, garageOpeningKm: e.target.value });
                                handleCalculateTotals(e.target.value, formData.garagingKm);
                              }}
                              className="w-full bg-surface text-center font-mono font-bold text-slate-100 p-1.5 rounded border border-border focus:border-accent"
                            />
                          </td>
                          <td className="p-2 border-r border-border">
                            <input
                              type="number"
                              placeholder="45138"
                              value={formData.reportingKm}
                              onChange={(e) => setFormData({ ...formData, reportingKm: e.target.value })}
                              className="w-full bg-surface text-center font-mono text-slate-100 p-1.5 rounded border border-border focus:border-accent"
                            />
                          </td>
                          <td className="p-2 border-r border-border">
                            <input
                              type="number"
                              placeholder="45280"
                              value={formData.releaseKm}
                              onChange={(e) => setFormData({ ...formData, releaseKm: e.target.value })}
                              className="w-full bg-surface text-center font-mono text-slate-100 p-1.5 rounded border border-border focus:border-accent"
                            />
                          </td>
                          <td className="p-2 border-r border-border">
                            <input
                              type="number"
                              placeholder="45302"
                              value={formData.garagingKm}
                              onChange={(e) => {
                                setFormData({ ...formData, garagingKm: e.target.value });
                                handleCalculateTotals(formData.garageOpeningKm, e.target.value);
                              }}
                              className="w-full bg-surface text-center font-mono font-bold text-slate-100 p-1.5 rounded border border-border focus:border-accent"
                            />
                          </td>
                          <td className="p-2 bg-surface/50">
                            <input
                              type="text"
                              placeholder="182"
                              value={formData.totalKms}
                              onChange={(e) => setFormData({ ...formData, totalKms: e.target.value })}
                              className="w-full bg-surface text-center text-accent font-mono font-black p-1.5 rounded border border-accent/20 focus:border-accent"
                            />
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* SECTION 3: SETTLEMENT, TOLL & USER RATING */}
                <div className="space-y-3">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2 border-b border-border pb-2">
                    <Receipt className="w-4 h-4 text-accent" />
                    <span>3. Service Rating, Toll Settlement & Release</span>
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-4 items-start">
                    <div className="lg:col-span-4">
                      <label className="block text-slate-400 font-bold uppercase mb-1">Was Service Provided</label>
                      <div className="grid grid-cols-3 gap-1.5 pt-0.5">
                        {["EXCELLENT", "GOOD", "POOR"].map((opt) => (
                          <label
                            key={opt}
                            className={`flex items-center justify-center text-center px-2 py-2 rounded-lg border text-[11px] font-bold cursor-pointer transition-all ${
                              formData.serviceFeedback === opt
                                ? "bg-accent text-slate-950 border-accent font-black shadow-sm"
                                : "bg-background text-slate-400 border-border hover:text-white"
                            }`}
                          >
                            <input
                              type="radio"
                              name="serviceFeedback"
                              value={opt}
                              checked={formData.serviceFeedback === opt}
                              onChange={(e) => setFormData({ ...formData, serviceFeedback: e.target.value })}
                              className="hidden"
                            />
                            <span>{opt}</span>
                          </label>
                        ))}
                      </div>
                    </div>

                    <div className="lg:col-span-3">
                      <label className="block text-slate-400 font-bold uppercase mb-1 whitespace-nowrap">
                        Parking / Toll / Tax (₹)
                      </label>
                      <input
                        type="number"
                        placeholder="e.g. 420"
                        value={formData.parkingTollTax}
                        onChange={(e) => setFormData({ ...formData, parkingTollTax: e.target.value })}
                        className="w-full bg-background border border-border rounded-lg p-2.5 text-amber-400 font-mono font-extrabold focus:border-accent"
                      />
                    </div>

                    <div className="lg:col-span-3">
                      <label className="block text-slate-400 font-bold uppercase mb-1 whitespace-nowrap">
                        Place of Release
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Aerocity Terminal 3"
                        value={formData.placeOfRelease}
                        onChange={(e) => setFormData({ ...formData, placeOfRelease: e.target.value })}
                        className="w-full bg-background border border-border rounded-lg p-2.5 text-slate-100 focus:border-accent"
                      />
                    </div>

                    <div className="lg:col-span-2">
                      <label className="block text-slate-400 font-bold uppercase mb-1 whitespace-nowrap">
                        Guest Mobile
                      </label>
                      <input
                        type="text"
                        placeholder="+91 98112 34567"
                        value={formData.mobile}
                        onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
                        className="w-full bg-background border border-border rounded-lg p-2.5 text-slate-100 font-mono focus:border-accent"
                      />
                    </div>
                  </div>
                </div>

                {/* SECTION 4: CAR USAGE TRACK SHEET */}
                <div className="space-y-3">
                  <div className="flex justify-between items-center border-b border-border pb-2">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-accent" />
                      <span>4. Car Usage Track Sheet (Route Details)</span>
                    </h3>
                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={() => setViewingRouteDuty(formData as any)}
                        className="text-xs text-sky-400 font-bold hover:underline flex items-center gap-1.5"
                      >
                        <Navigation className="w-3.5 h-3.5" />
                        <span>Preview Route on Map</span>
                      </button>
                      <button
                        type="button"
                        onClick={handleAddRouteLog}
                        className="text-xs text-accent font-bold hover:underline flex items-center gap-1.5"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Add Route Log</span>
                      </button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    {formData.usageTracks.map((leg, idx) => (
                      <div key={leg.id || idx} className="flex flex-col sm:flex-row items-center gap-2.5 bg-background p-2.5 rounded-xl border border-border">
                        <span className="shrink-0 w-8 text-center font-mono font-bold text-slate-500">#{idx + 1}</span>
                        
                        <div className="flex-1 w-full">
                          <input
                            type="text"
                            placeholder="FROM (e.g. Garage / Hotel Pullman)"
                            value={leg.from}
                            onChange={(e) => handleUpdateUsageLeg(idx, "from", e.target.value)}
                            className="w-full bg-surface border border-border rounded-lg p-2.5 text-slate-100 text-xs focus:border-accent"
                          />
                        </div>

                        <span className="shrink-0 px-2.5 py-1 bg-surface border border-border rounded-md text-xs font-bold text-amber-400 lowercase">
                          to
                        </span>

                        <div className="flex-1 w-full">
                          <input
                            type="text"
                            placeholder="TO (e.g. Cyber City Gurugram / Airport)"
                            value={leg.to}
                            onChange={(e) => handleUpdateUsageLeg(idx, "to", e.target.value)}
                            className="w-full bg-surface border border-border rounded-lg p-2.5 text-slate-100 text-xs focus:border-accent"
                          />
                        </div>

                        <button
                          type="button"
                          onClick={() => handleRemoveUsageLeg(idx)}
                          className="shrink-0 p-2 text-slate-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                          title="Remove Route Log"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* SECTION 5: OFFICE USE ONLY */}
                <div className="space-y-3 bg-background/60 p-4 rounded-2xl border border-border">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-2 border-b border-border pb-2">
                    <ShieldCheck className="w-4 h-4 text-amber-400" />
                    <span>5. Office Use Only Section</span>
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-slate-400 font-bold mb-1">To</label>
                      <input
                        type="text"
                        value={formData.officeTo}
                        onChange={(e) => setFormData({ ...formData, officeTo: e.target.value })}
                        className="w-full bg-surface border border-border rounded-lg p-2 text-slate-100 focus:border-accent"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-400 font-bold mb-1">Booked By</label>
                      <input
                        type="text"
                        value={formData.bookedBy}
                        onChange={(e) => setFormData({ ...formData, bookedBy: e.target.value })}
                        className="w-full bg-surface border border-border rounded-lg p-2 text-slate-100 focus:border-accent"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-400 font-bold mb-1">For</label>
                      <input
                        type="text"
                        value={formData.officeFor}
                        onChange={(e) => setFormData({ ...formData, officeFor: e.target.value })}
                        className="w-full bg-surface border border-border rounded-lg p-2 text-slate-100 focus:border-accent"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div>
                      <label className="block text-slate-400 font-bold mb-1">Garage In Time</label>
                      <input
                        type="text"
                        value={formData.garageInTime}
                        onChange={(e) => setFormData({ ...formData, garageInTime: e.target.value })}
                        className="w-full bg-surface border border-border rounded-lg p-2 text-slate-100 focus:border-accent"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-400 font-bold mb-1">Garage In KM</label>
                      <input
                        type="text"
                        value={formData.garageInKm}
                        onChange={(e) => setFormData({ ...formData, garageInKm: e.target.value })}
                        className="w-full bg-surface border border-border rounded-lg p-2 text-slate-100 font-mono focus:border-accent"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-400 font-bold mb-1">Handover Person</label>
                      <input
                        type="text"
                        placeholder="Chauffeur Name"
                        value={formData.handoverPerson}
                        onChange={(e) => setFormData({ ...formData, handoverPerson: e.target.value })}
                        className="w-full bg-surface border border-border rounded-lg p-2 text-slate-100 focus:border-accent"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-400 font-bold mb-1">Handover Date/Time</label>
                      <input
                        type="text"
                        value={`${formData.handoverDate} ${formData.handoverTime}`}
                        onChange={(e) => setFormData({ ...formData, handoverTime: e.target.value })}
                        className="w-full bg-surface border border-border rounded-lg p-2 text-slate-100 focus:border-accent"
                      />
                    </div>
                  </div>
                </div>

                {/* Submit Controls */}
                <div className="flex justify-end gap-3 pt-4 border-t border-border">
                  <button
                    type="button"
                    onClick={() => setIsFormModalOpen(false)}
                    className="px-5 py-2.5 bg-white/5 hover:bg-white/10 text-slate-300 rounded-xl font-bold transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmittingForm}
                    className="flex items-center gap-2 px-6 py-2.5 bg-accent hover:bg-yellow-500 text-slate-950 font-black rounded-xl uppercase tracking-wider transition-all shadow-lg shadow-accent/20 disabled:opacity-50"
                  >
                    {isSubmittingForm && <Loader2 className="w-4 h-4 animate-spin text-slate-950" />}
                    <span>{editingDuty ? "Update Duty Slip Entry" : "Save Duty Slip Entry"}</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        </Portal>
      )}

      {/* ========================================================================= */}
      {/* MODAL 2: VIEW OFFICIAL DUTY DOSSIER & PRINTABLE SLIP */}
      {/* ========================================================================= */}
      {viewingDuty && (
        <Portal>
          <div className="fixed inset-0 z-[99999] bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-5 overflow-y-auto">
            <div className="bg-surface border border-border rounded-3xl max-w-3xl w-full p-6 sm:p-8 space-y-6 shadow-2xl relative my-auto max-h-[92vh] overflow-y-auto scrollbar-thin">
              
              <button
                onClick={() => setViewingDuty(null)}
                className="absolute top-5 right-5 p-2 bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white rounded-full transition-colors z-10"
              >
                <X className="w-5 h-5" />
              </button>

              {/* Printable Official Paper Layout */}
              <div id="printable-duty-slip" className="bg-white text-slate-950 p-6 sm:p-8 rounded-2xl shadow-xl space-y-5 font-sans border border-slate-300">
                
                {/* Header */}
                <div className="border-b-2 border-slate-900 pb-4 flex justify-between items-start">
                  <div>
                    <h2 className="text-xl sm:text-2xl font-black uppercase tracking-tight text-slate-900">
                      TEMP TRAVEL CAR RENTALS PVT LTD
                    </h2>
                    <p className="text-[11px] text-slate-700 font-semibold">
                      Plot No. 183, Kh No. 16/2, Qutub Vihar PH-I, New Delhi - 110071
                    </p>
                    <p className="text-[11px] text-slate-800 font-bold mt-0.5">
                      GSTIN: 07AACCT9842M1Z5 • 24x7 Corporate Dispatch Desk
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="text-lg font-black text-slate-900 border-2 border-slate-900 px-3 py-1 inline-block uppercase">
                      DUTY SLIP
                    </span>
                    <span className="text-xs font-mono font-black text-slate-800 block mt-2">
                      Trip Sheet No: {viewingDuty.tripSheetNo}
                    </span>
                    <span className="text-xs text-slate-600 font-bold block">
                      Date: {formatToDDMMYYYY(viewingDuty.date)}
                    </span>
                  </div>
                </div>

                {/* Subheader Box */}
                <div className="border border-slate-400 p-3 rounded text-xs space-y-1.5">
                  <p className="text-[10px] italic text-slate-600 border-b border-slate-200 pb-1">
                    Dear Customer, Our Company Prides itself on its Honesty in order to ensure, fare billing. The user is requested to fill in all the columns with bold letter.
                  </p>
                  <div className="grid grid-cols-2 gap-2 pt-1 font-semibold">
                    <div>
                      <span className="text-slate-500 font-bold">Car No: </span>
                      <span className="font-mono font-black text-slate-900">{viewingDuty.carNo}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 font-bold">Acc. (Company): </span>
                      <span className="font-bold text-slate-900">{viewingDuty.account || "N/A"}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 font-bold">Car to report to Mr: </span>
                      <span className="font-bold text-slate-900">{viewingDuty.reportedTo}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 font-bold">Report at: </span>
                      <span className="font-bold text-slate-900">{viewingDuty.reportAt}</span>
                    </div>
                  </div>
                </div>

                {/* Table 1: Garage Time & KM Tracking */}
                <table className="w-full text-xs border-collapse border border-slate-400 text-center">
                  <thead className="bg-slate-100 text-[10px] uppercase font-bold text-slate-800 border-b border-slate-400">
                    <tr>
                      <th className="p-1.5 border border-slate-400">Departure Garage</th>
                      <th className="p-1.5 border border-slate-400">Reporting</th>
                      <th className="p-1.5 border border-slate-400">Release</th>
                      <th className="p-1.5 border border-slate-400">Garaging</th>
                      <th className="p-1.5 border border-slate-400 bg-slate-200 font-extrabold">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="bg-slate-50 text-[10px] uppercase font-bold text-slate-700">
                      <td className="p-1 border border-slate-400">Date (DD/MM/YYYY)</td>
                      <td className="p-1 border border-slate-400">Date (DD/MM/YYYY)</td>
                      <td className="p-1 border border-slate-400">Date (DD/MM/YYYY)</td>
                      <td className="p-1 border border-slate-400">Date (DD/MM/YYYY)</td>
                      <td className="p-1 border border-slate-400 bg-slate-100">Total Days</td>
                    </tr>
                    <tr>
                      <td className="p-2 border border-slate-400 font-mono font-medium">{formatToDDMMYYYY(viewingDuty.garageDepartureDate || viewingDuty.date)}</td>
                      <td className="p-2 border border-slate-400 font-mono font-medium">{formatToDDMMYYYY(viewingDuty.reportingDate || viewingDuty.garageDepartureDate || viewingDuty.date)}</td>
                      <td className="p-2 border border-slate-400 font-mono font-medium">{formatToDDMMYYYY(viewingDuty.releaseDate || viewingDuty.garageDepartureDate || viewingDuty.date)}</td>
                      <td className="p-2 border border-slate-400 font-mono font-medium">{formatToDDMMYYYY(viewingDuty.garagingDate || viewingDuty.releaseDate || viewingDuty.garageDepartureDate || viewingDuty.date)}</td>
                      <td className="p-2 border border-slate-400 font-bold bg-slate-100">{calculateTotalDays(viewingDuty.garageDepartureDate || viewingDuty.date, viewingDuty.garagingDate || viewingDuty.releaseDate || viewingDuty.date)}</td>
                    </tr>
                    <tr className="bg-slate-50 text-[10px] uppercase font-bold text-slate-700">
                      <td className="p-1 border border-slate-400">Departure Time (24h)</td>
                      <td className="p-1 border border-slate-400">Reporting Time (24h)</td>
                      <td className="p-1 border border-slate-400">Release Time (24h)</td>
                      <td className="p-1 border border-slate-400">Garaging Time (24h)</td>
                      <td className="p-1 border border-slate-400 bg-slate-100 font-extrabold">Total Hours</td>
                    </tr>
                    <tr>
                      <td className="p-2 border border-slate-400 font-medium">{viewingDuty.garageDepartureTime}</td>
                      <td className="p-2 border border-slate-400 font-medium">{viewingDuty.reportingTime}</td>
                      <td className="p-2 border border-slate-400 font-medium">{viewingDuty.releaseTime}</td>
                      <td className="p-2 border border-slate-400 font-medium">{viewingDuty.garagingTime}</td>
                      <td className="p-2 border border-slate-400 font-black bg-slate-100">{viewingDuty.totalHours} Hrs</td>
                    </tr>
                    <tr className="bg-slate-100 text-[10px] uppercase font-bold text-slate-800">
                      <td className="p-1.5 border border-slate-400">Opening Km. at Garage</td>
                      <td className="p-1.5 border border-slate-400">Reporting K.M.</td>
                      <td className="p-1.5 border border-slate-400">Release K.M.</td>
                      <td className="p-1.5 border border-slate-400">Garaging K.M.</td>
                      <td className="p-1.5 border border-slate-400 bg-slate-200 font-extrabold">Total Kms.</td>
                    </tr>
                    <tr>
                      <td className="p-2 border border-slate-400 font-mono font-bold">{viewingDuty.garageOpeningKm}</td>
                      <td className="p-2 border border-slate-400 font-mono">{viewingDuty.reportingKm}</td>
                      <td className="p-2 border border-slate-400 font-mono">{viewingDuty.releaseKm}</td>
                      <td className="p-2 border border-slate-400 font-mono font-bold">{viewingDuty.garagingKm}</td>
                      <td className="p-2 border border-slate-400 font-mono font-black bg-slate-100">{viewingDuty.totalKms} KM</td>
                    </tr>
                  </tbody>
                </table>

                {/* Remarks & Settlement */}
                <div className="grid grid-cols-2 gap-4 text-xs border border-slate-400 p-3 rounded">
                  <div>
                    <span className="text-slate-500 font-bold block">Service Rating:</span>
                    <span className="font-extrabold text-slate-900 text-sm">
                      {viewingDuty.serviceFeedback === "EXCELLENT" ? "⭐⭐⭐⭐⭐ EXCELLENT" : viewingDuty.serviceFeedback}
                    </span>
                    <span className="text-slate-500 font-bold block mt-2">Place of Release:</span>
                    <span className="font-semibold text-slate-900">{viewingDuty.placeOfRelease}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 font-bold block">Parking / Toll / Tax:</span>
                    <span className="font-mono font-black text-slate-900 text-base">₹{viewingDuty.parkingTollTax}</span>
                    <span className="text-slate-500 font-bold block mt-1">Guest Mobile:</span>
                    <span className="font-mono font-semibold text-slate-900">{viewingDuty.mobile}</span>
                  </div>
                </div>

                {/* Usage Tracks */}
                {viewingDuty.usageTracks && viewingDuty.usageTracks.length > 0 && (
                  <div className="border border-slate-400 rounded overflow-hidden text-xs">
                    <div className="bg-slate-100 p-2 font-bold uppercase text-[10px] text-slate-700 border-b border-slate-400">
                      CAR USAGE TRACK SHEET
                    </div>
                    <table className="w-full text-left">
                      <thead className="bg-slate-50 text-[10px] text-slate-600 border-b border-slate-300">
                        <tr>
                          <th className="p-1.5 pl-3">Leg #</th>
                          <th className="p-1.5">FROM</th>
                          <th className="p-1.5">TO</th>
                        </tr>
                      </thead>
                      <tbody>
                        {viewingDuty.usageTracks.map((trk, i) => (
                          <tr key={trk.id || i} className="border-b border-slate-200">
                            <td className="p-1.5 pl-3 font-mono font-bold text-slate-500">{i + 1}.</td>
                            <td className="p-1.5 font-medium text-slate-800">{trk.from || "-"}</td>
                            <td className="p-1.5 font-medium text-slate-800">{trk.to || "-"}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}

                {/* Office Use Section */}
                <div className="border-t-2 border-dashed border-slate-400 pt-3 text-[11px] space-y-2">
                  <span className="font-bold text-slate-800 uppercase tracking-wide block">OFFICE USE ONLY</span>
                  <div className="grid grid-cols-4 gap-2 text-slate-700">
                    <div><span className="font-bold">To:</span> {viewingDuty.officeTo}</div>
                    <div><span className="font-bold">Booked By:</span> {viewingDuty.bookedBy}</div>
                    <div><span className="font-bold">For:</span> {viewingDuty.officeFor}</div>
                    <div><span className="font-bold">Handover:</span> {viewingDuty.handoverPerson}</div>
                  </div>
                </div>

                {/* Footer Signatures */}
                <div className="pt-6 flex justify-between items-end text-xs font-bold text-slate-700">
                  <div>
                    <div className="w-40 border-b border-slate-900 mb-1"></div>
                    <span>(Chauffeur Handover Signature)</span>
                  </div>
                  <div className="text-right">
                    <div className="w-40 border-b border-slate-900 mb-1 ml-auto"></div>
                    <span>(Customer / Passenger Signature)</span>
                  </div>
                </div>
              </div>

              {/* Attached Original Documents & Expense Receipts */}
              {viewingDuty.attachments && viewingDuty.attachments.length > 0 ? (
                <div className="bg-background p-4 rounded-2xl border border-border space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-200">
                      Attached Documents & Receipts ({viewingDuty.attachments.length})
                    </span>
                    <span className="text-[10px] text-slate-400">Original high-resolution attachments</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {viewingDuty.attachments.map((att) => (
                      <div
                        key={att.id}
                        className="flex items-center justify-between p-2.5 bg-surface border border-border rounded-xl"
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          {att.fileType === "pdf" ? (
                            <div className="w-9 h-9 rounded-lg bg-rose-500/20 border border-rose-500/30 text-rose-400 flex flex-col items-center justify-center shrink-0">
                              <FileText className="w-4 h-4" />
                              <span className="text-[7px] font-black uppercase">PDF</span>
                            </div>
                          ) : (
                            <img
                              src={att.url}
                              alt={att.name}
                              className="w-9 h-9 object-cover rounded-lg border border-border shrink-0"
                            />
                          )}
                          <div className="min-w-0">
                            <span className="text-[9px] font-bold text-accent uppercase tracking-wider block">
                              {att.category}
                            </span>
                            <span className="text-xs font-semibold text-slate-200 block truncate max-w-[140px]" title={att.name}>
                              {att.name}
                            </span>
                          </div>
                        </div>

                        <a
                          href={att.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1 text-[11px] font-bold text-accent hover:underline bg-background px-2.5 py-1 rounded-lg border border-border shrink-0"
                        >
                          <ExternalLink className="w-3 h-3" />
                          <span>View</span>
                        </a>
                      </div>
                    ))}
                  </div>
                </div>
              ) : viewingDuty.slipImageUrl && !viewingDuty.slipImageUrl.includes("hero-bg") ? (
                <div className="bg-background p-4 rounded-2xl border border-border flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <img
                      src={viewingDuty.slipImageUrl}
                      alt="Scanned Slip"
                      className="w-12 h-12 object-cover rounded-lg border border-border"
                    />
                    <div>
                      <span className="text-xs font-bold text-slate-200 block">Original Scanned Duty Slip</span>
                      <span className="text-[10px] text-slate-400">Available in full uploaded/scanner quality</span>
                    </div>
                  </div>

                  <a
                    href={viewingDuty.slipImageUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 bg-accent hover:bg-yellow-500 text-slate-950 font-extrabold px-4 py-2 rounded-xl text-xs uppercase tracking-wider transition-all shadow-md"
                  >
                    <ExternalLink className="w-4 h-4" />
                    <span>Open in New Tab (Full Quality)</span>
                  </a>
                </div>
              ) : (
                <div className="bg-background p-3.5 rounded-2xl border border-border text-center text-xs text-slate-400">
                  <span>No original physical documents or slips attached to this duty record.</span>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setViewingRouteDuty(viewingDuty)}
                  className="flex items-center gap-2 bg-sky-600 hover:bg-sky-500 text-white font-bold px-5 py-2.5 rounded-xl text-xs uppercase tracking-wider transition-all shadow-md"
                >
                  <Navigation className="w-4 h-4" />
                  <span>View Route on Map</span>
                </button>

                <button
                  type="button"
                  onClick={() => window.print()}
                  className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold px-5 py-2.5 rounded-xl text-xs uppercase tracking-wider transition-all"
                >
                  <Printer className="w-4 h-4 text-accent" />
                  <span>Print Duty Slip</span>
                </button>
              </div>

            </div>
          </div>
        </Portal>
      )}

      {/* ========================================================================= */}
      {/* MODAL 3: SCAN / CAPTURE METHOD SELECTOR MODAL */}
      {/* ========================================================================= */}
      {isScanOptionsModalOpen && (
        <Portal>
          <div className="fixed inset-0 z-[99999] bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
            <div className="bg-surface border border-border rounded-3xl max-w-xl w-full p-6 sm:p-8 space-y-6 shadow-2xl relative">
              <button
                onClick={() => setIsScanOptionsModalOpen(false)}
                className="absolute top-5 right-5 p-2 bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="space-y-1">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-accent/20 text-accent border border-accent/30 inline-block">
                  Document & Media Ingestion
                </span>
                <h3 className="text-xl font-black text-slate-50">
                  Select Document Capture Method
                </h3>
                <p className="text-xs text-slate-400">
                  Choose how you would like to capture or upload the physical duty slip and receipts.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 pt-2">
                {/* Option 1: Mobile HD Camera Capture */}
                <button
                  type="button"
                  onClick={() => {
                    setIsScanOptionsModalOpen(false);
                    handleOpenCreateModal();
                    setTimeout(() => mobileCameraInputRef.current?.click(), 300);
                  }}
                  className="bg-background hover:bg-slate-800/80 border border-border hover:border-accent/50 p-4 rounded-2xl flex flex-col items-center text-center space-y-2.5 transition-all group shadow-lg"
                >
                  <div className="p-3 bg-accent text-slate-950 rounded-2xl transition-all shadow-md">
                    <Camera className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="text-xs font-extrabold text-slate-100 group-hover:text-accent transition-colors">
                      Live HD Camera
                    </h4>
                    <p className="text-[10px] text-slate-400 mt-1 leading-relaxed">
                      Snap a photo using your phone or webcam with autofocus.
                    </p>
                  </div>
                  <span className="text-[9px] text-accent font-black uppercase tracking-wider flex items-center gap-1 pt-1">
                    <span>Take Photo</span>
                    <ChevronRight className="w-3 h-3" />
                  </span>
                </button>

                {/* Option 2: Scan Directly from Printer */}
                <button
                  type="button"
                  onClick={() => {
                    setIsScanOptionsModalOpen(false);
                    setIsPrinterScannerModalOpen(true);
                  }}
                  className="bg-background hover:bg-slate-800/80 border border-border hover:border-accent/50 p-4 rounded-2xl flex flex-col items-center text-center space-y-2.5 transition-all group shadow-lg"
                >
                  <div className="p-3 bg-accent/10 text-accent group-hover:bg-accent group-hover:text-slate-950 rounded-2xl transition-all shadow-inner">
                    <Printer className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="text-xs font-extrabold text-slate-100 group-hover:text-accent transition-colors">
                      Scan from Printer
                    </h4>
                    <p className="text-[10px] text-slate-400 mt-1 leading-relaxed">
                      Flatbed / WIA hardware scanner ingestion.
                    </p>
                  </div>
                  <span className="text-[9px] text-accent font-black uppercase tracking-wider flex items-center gap-1 pt-1">
                    <span>Scanner Hub</span>
                    <ChevronRight className="w-3 h-3" />
                  </span>
                </button>

                {/* Option 3: Upload from Device */}
                <button
                  type="button"
                  onClick={() => {
                    setIsScanOptionsModalOpen(false);
                    handleOpenCreateModal();
                    setTimeout(() => fileInputRef.current?.click(), 300);
                  }}
                  className="bg-background hover:bg-slate-800/80 border border-border hover:border-accent/50 p-4 rounded-2xl flex flex-col items-center text-center space-y-2.5 transition-all group shadow-lg"
                >
                  <div className="p-3 bg-white/5 text-slate-200 group-hover:bg-accent group-hover:text-slate-950 rounded-2xl transition-all shadow-inner">
                    <UploadCloud className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="text-xs font-extrabold text-slate-100 group-hover:text-accent transition-colors">
                      Upload from Device
                    </h4>
                    <p className="text-[10px] text-slate-400 mt-1 leading-relaxed">
                      Select any existing image, scan, or PDF.
                    </p>
                  </div>
                  <span className="text-[9px] text-slate-300 group-hover:text-accent font-black uppercase tracking-wider flex items-center gap-1 pt-1">
                    <span>Browse Files</span>
                    <ChevronRight className="w-3 h-3" />
                  </span>
                </button>
              </div>
            </div>
          </div>
        </Portal>
      )}

      {/* ========================================================================= */}
      {/* MODAL 4: PRINTER / SCANNER HARDWARE CONSOLE MODAL */}
      {/* ========================================================================= */}
      {isPrinterScannerModalOpen && (
        <Portal>
          <div className="fixed inset-0 z-[99999] bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-5 overflow-y-auto">
            <div className="bg-surface border border-border rounded-3xl max-w-xl w-full p-6 sm:p-7 space-y-5 shadow-2xl relative my-auto max-h-[94vh] overflow-y-auto scrollbar-thin">
              <button
                onClick={() => {
                  if (!isScanningPrinter) {
                    stopCamera();
                    setIsPrinterScannerModalOpen(false);
                  }
                }}
                disabled={isScanningPrinter}
                className="absolute top-5 right-5 p-2 bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white rounded-full transition-colors disabled:opacity-30 z-10"
              >
                <X className="w-5 h-5" />
              </button>

              {/* Header */}
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="p-1.5 bg-accent/20 text-accent rounded-lg">
                    <Printer className="w-4 h-4" />
                  </span>
                  <h3 className="text-xl font-black text-slate-50">
                    Physical Scanner & Hardware Hub
                  </h3>
                </div>
                <p className="text-xs text-slate-400">
                  Direct physical device integration via Network eSCL / AirScan, USB Document Camera, or File Ingestion.
                </p>
              </div>

              {/* Hardware Source Tabs */}
              <div className="grid grid-cols-3 gap-2 bg-background p-1.5 rounded-xl border border-border text-xs font-bold">
                <button
                  type="button"
                  onClick={() => {
                    stopCamera();
                    setScannerTab("PRINTER_ESCL");
                  }}
                  className={`py-2 px-2.5 rounded-lg flex items-center justify-center gap-1.5 transition-all ${
                    scannerTab === "PRINTER_ESCL"
                      ? "bg-accent text-slate-950 font-black shadow"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Network Printer</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setScannerTab("DOCUMENT_CAMERA");
                    startCamera();
                  }}
                  className={`py-2 px-2.5 rounded-lg flex items-center justify-center gap-1.5 transition-all ${
                    scannerTab === "DOCUMENT_CAMERA"
                      ? "bg-accent text-slate-950 font-black shadow"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  <Camera className="w-3.5 h-3.5" />
                  <span>Doc Camera</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    stopCamera();
                    setScannerTab("FILE_UPLOAD");
                  }}
                  className={`py-2 px-2.5 rounded-lg flex items-center justify-center gap-1.5 transition-all ${
                    scannerTab === "FILE_UPLOAD"
                      ? "bg-accent text-slate-950 font-black shadow"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  <UploadCloud className="w-3.5 h-3.5" />
                  <span>File Ingest</span>
                </button>
              </div>

              {/* TAB 1: NETWORK PRINTER / eSCL SCANNER */}
              {scannerTab === "PRINTER_ESCL" && (
                <div className="space-y-4 text-xs">
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <label className="text-slate-400 font-bold uppercase">
                        Detected Physical Scanner / Printer on PC
                      </label>
                      <span className="text-[10px] text-emerald-400 font-bold flex items-center gap-1">
                        <Check className="w-3 h-3" />
                        <span>Real Hardware Synced</span>
                      </span>
                    </div>
                    <select
                      value={selectedScannerDevice}
                      onChange={(e) => {
                        setSelectedScannerDevice(e.target.value);
                        const found = installedPrintersList.find((p) => p.name === e.target.value);
                        if (found && found.port && found.port.includes("192.")) {
                          const match = found.port.match(/\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}/);
                          if (match) setPrinterIp(match[0]);
                        } else {
                          setPrinterIp("192.168.1.15");
                        }
                      }}
                      disabled={isScanningPrinter}
                      className="w-full bg-background border border-border rounded-xl p-2.5 text-slate-100 font-semibold focus:border-accent disabled:opacity-50"
                    >
                      {installedPrintersList.length > 0 ? (
                        installedPrintersList.map((dev) => (
                          <option key={dev.name} value={dev.name}>
                            {dev.name} {dev.isDefault ? "★ (Default Device)" : ""} — [{dev.driver}]
                          </option>
                        ))
                      ) : (
                        <option value="HP Smart Tank 750 series [A371A2]">
                          HP Smart Tank 750 series [A371A2] ★ (Default Scanner)
                        </option>
                      )}
                    </select>
                  </div>

                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <label className="text-slate-400 font-bold uppercase">
                        Printer IP / Localhost Scanner Bridge
                      </label>
                      <span className="text-[10px] text-slate-500 font-mono">eSCL REST Port: 80 / 8080</span>
                    </div>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="e.g. 192.168.1.100 or localhost:18622"
                        value={printerIp}
                        onChange={(e) => {
                          setPrinterIp(e.target.value);
                          setPrinterPingStatus("IDLE");
                        }}
                        className="flex-1 bg-background border border-border rounded-xl p-2.5 text-slate-100 font-mono focus:border-accent"
                      />
                      <button
                        type="button"
                        onClick={handleTestPrinterPing}
                        disabled={printerPingStatus === "CHECKING"}
                        className="bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold px-3 py-2 rounded-xl text-xs flex items-center gap-1.5 transition-colors"
                      >
                        {printerPingStatus === "CHECKING" ? (
                          <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        ) : printerPingStatus === "ONLINE" ? (
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                        ) : (
                          <Wifi className="w-3.5 h-3.5 text-accent" />
                        )}
                        <span>{printerPingStatus === "ONLINE" ? "Online" : "Test IP"}</span>
                      </button>
                    </div>
                    {printerPingStatus === "ONLINE" && (
                      <p className="text-[11px] text-emerald-400 mt-1 flex items-center gap-1 font-semibold">
                        <CheckCircle2 className="w-3 h-3" />
                        <span>Connected to physical scanner web interface</span>
                      </p>
                    )}
                    {printerPingStatus === "LAN_LOCAL" && (
                      <p className="text-[11px] text-amber-400 mt-1 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" />
                        <span>Local device profile selected. Ready for scan job execution &amp; document ingestion.</span>
                      </p>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-slate-400 font-bold uppercase mb-1">
                        Optical DPI
                      </label>
                      <select
                        value={scanDpi}
                        onChange={(e) => setScanDpi(e.target.value)}
                        disabled={isScanningPrinter}
                        className="w-full bg-background border border-border rounded-xl p-2.5 text-slate-100 font-semibold focus:border-accent disabled:opacity-50"
                      >
                        <option value="300">300 DPI (Standard Clarity)</option>
                        <option value="600">600 DPI (High Precision Archive)</option>
                        <option value="150">150 DPI (Fast Draft)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-slate-400 font-bold uppercase mb-1">
                        Color Filter
                      </label>
                      <select
                        value={scanColorMode}
                        onChange={(e) => setScanColorMode(e.target.value)}
                        disabled={isScanningPrinter}
                        className="w-full bg-background border border-border rounded-xl p-2.5 text-slate-100 font-semibold focus:border-accent disabled:opacity-50"
                      >
                        <option value="COLOR">Full Color (24-bit RGB)</option>
                        <option value="BW">Black & White (High Contrast)</option>
                        <option value="GRAYSCALE">Grayscale Document</option>
                      </select>
                    </div>
                  </div>

                  {/* Virtual Scanner Glass Bed Visualization */}
                  <div className="relative h-28 bg-background border border-border rounded-2xl overflow-hidden flex items-center justify-center">
                    <div className="absolute inset-0 bg-[radial-gradient(#ffffff0a_1px,transparent_1px)] [background-size:12px_12px]" />
                    
                    {isScanningPrinter ? (
                      <div className="relative w-full h-full flex flex-col items-center justify-center p-4 space-y-2">
                        <div className="absolute inset-x-0 h-1 bg-gradient-to-r from-transparent via-accent to-transparent shadow-[0_0_15px_rgba(251,191,36,0.8)] animate-pulse" />
                        <RefreshCw className="w-5 h-5 text-accent animate-spin" />
                        <p className="text-xs font-bold text-slate-200">{scannerStatusText}</p>
                        <div className="w-48 bg-surface h-2 rounded-full overflow-hidden border border-border">
                          <div
                            className="bg-accent h-full transition-all duration-300"
                            style={{ width: `${scannerProgress}%` }}
                          />
                        </div>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center text-center p-4 space-y-1 text-slate-400">
                        <Scan className="w-6 h-6 text-slate-500" />
                        <span className="text-xs font-semibold text-slate-300">
                          {selectedScannerDevice} Glass Bed Ready
                        </span>
                        <span className="text-[10px] text-slate-500">Place physical duty slip face-down on flatbed</span>
                      </div>
                    )}
                  </div>

                  <div className="pt-1">
                    <button
                      type="button"
                      onClick={handleStartPrinterScan}
                      disabled={isScanningPrinter}
                      className="w-full flex items-center justify-center gap-2 bg-accent hover:bg-yellow-500 text-slate-950 font-black py-3 px-4 rounded-xl text-xs uppercase tracking-wider transition-all shadow-lg shadow-accent/20 disabled:opacity-50"
                    >
                      {isScanningPrinter ? (
                        <>
                          <RefreshCw className="w-4 h-4 animate-spin" />
                          <span>Acquiring Scan ({scannerProgress}%)...</span>
                        </>
                      ) : (
                        <>
                          <Printer className="w-4 h-4" />
                          <span>Scan from {selectedScannerDevice.split(" [")[0] || "Physical Device"} &amp; Attach</span>
                        </>
                      )}
                    </button>
                  </div>

                  {scanCloudGuidance && (
                    <div className="p-3.5 bg-amber-500/10 border border-amber-500/20 rounded-2xl text-amber-300 space-y-2">
                      <div className="flex items-center gap-2 font-bold text-xs">
                        <AlertCircle className="w-4 h-4 text-amber-400 flex-shrink-0" />
                        <span>Hardware Scanner Communication Note</span>
                      </div>
                      <p className="text-[11px] leading-relaxed text-slate-300">{scanCloudGuidance}</p>
                      <div className="flex flex-wrap gap-2 pt-1">
                        <button
                          type="button"
                          onClick={() => {
                            setScannerTab("DOCUMENT_CAMERA");
                            startCamera();
                          }}
                          className="bg-accent text-slate-950 px-3 py-1.5 rounded-lg font-black text-[10px] uppercase tracking-wider flex items-center gap-1 shadow-sm"
                        >
                          <Camera className="w-3.5 h-3.5" />
                          <span>Scan via Live Doc Camera</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setScannerTab("FILE_UPLOAD");
                            fileInputRef.current?.click();
                          }}
                          className="bg-white/10 hover:bg-white/20 text-slate-200 px-3 py-1.5 rounded-lg font-bold text-[10px] uppercase tracking-wider flex items-center gap-1"
                        >
                          <UploadCloud className="w-3.5 h-3.5" />
                          <span>Upload Scanned File / PDF</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* TAB 2: LIVE USB DOCUMENT CAMERA / OVERHEAD SCANNER */}
              {scannerTab === "DOCUMENT_CAMERA" && (
                <div className="space-y-4 text-xs">
                  {connectedCamerasList.length > 0 && (
                    <div>
                      <label className="block text-slate-400 font-bold uppercase mb-1">
                        Physical Video Capture Device
                      </label>
                      <select
                        className="w-full bg-background border border-border rounded-xl p-2.5 text-slate-100 font-semibold focus:border-accent"
                        onChange={() => startCamera()}
                      >
                        {connectedCamerasList.map((cam) => (
                          <option key={cam.deviceId} value={cam.deviceId}>
                            {cam.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}

                  {cameraError ? (
                    <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-400 space-y-2">
                      <div className="flex items-center gap-2 font-bold">
                        <AlertCircle className="w-4 h-4" />
                        <span>Camera Permission Required</span>
                      </div>
                      <p className="text-[11px] leading-relaxed">{cameraError}</p>
                      <button
                        type="button"
                        onClick={startCamera}
                        className="bg-red-500/20 hover:bg-red-500/30 text-red-300 px-3 py-1.5 rounded-lg font-bold text-[11px] transition-colors"
                      >
                        Retry Camera Connection
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {/* Live Camera Viewfinder */}
                      <div className="relative aspect-[4/3] bg-black rounded-2xl overflow-hidden border border-border flex items-center justify-center">
                        <video
                          ref={videoRef}
                          autoPlay
                          playsInline
                          muted
                          className="w-full h-full object-cover"
                        />
                        <canvas ref={canvasRef} className="hidden" />

                        {/* Document Bounding Alignment Overlay */}
                        <div className="absolute inset-4 border-2 border-dashed border-accent/80 rounded-xl pointer-events-none flex flex-col justify-between p-3">
                          <div className="flex justify-between text-[10px] font-black uppercase text-accent bg-black/60 px-2 py-0.5 rounded w-max">
                            <span>Align Duty Slip In Box</span>
                          </div>
                          <div className="text-center text-[10px] text-slate-300 bg-black/60 px-2 py-0.5 rounded mx-auto">
                            <span>Hold steady under good lighting</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={captureCameraSnapshot}
                          disabled={isScanning}
                          className="flex-1 flex items-center justify-center gap-2 bg-accent hover:bg-yellow-500 text-slate-950 font-black py-3 px-4 rounded-xl text-xs uppercase tracking-wider transition-all shadow-lg shadow-accent/20 disabled:opacity-50"
                        >
                          <Camera className="w-4 h-4" />
                          <span>Capture Slip &amp; Attach</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* TAB 3: FILE INGESTION */}
              {scannerTab === "FILE_UPLOAD" && (
                <div className="space-y-4 text-xs">
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="border-2 border-dashed border-white/20 hover:border-accent/60 bg-background p-8 rounded-2xl text-center space-y-3 cursor-pointer transition-all group"
                  >
                    <div className="p-4 bg-white/5 group-hover:bg-accent group-hover:text-slate-950 text-slate-200 rounded-2xl w-max mx-auto transition-all">
                      <UploadCloud className="w-8 h-8" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-slate-100 group-hover:text-accent transition-colors">
                        Click to select Scanned Slip file
                      </h4>
                      <p className="text-[11px] text-slate-400 mt-1">
                        Supports high-resolution PNG, JPG, JPEG, and PDF documents.
                      </p>
                    </div>
                    <span className="inline-block px-3 py-1 bg-white/5 text-slate-300 rounded-full text-[10px] font-bold">
                      PDF &amp; High-Resolution Media Ingestion
                    </span>
                  </div>
                </div>
              )}

            </div>
          </div>
        </Portal>
      )}

      {/* ========================================================================= */}
      {/* MODAL 5: ROUTE ON MAP MODAL */}
      {/* ========================================================================= */}
      {viewingRouteDuty && (
        <Portal>
          <div className="fixed inset-0 z-[99999] bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-5 overflow-y-auto">
            <div className="bg-surface border border-border rounded-3xl max-w-4xl w-full p-6 sm:p-8 space-y-6 shadow-2xl relative my-auto max-h-[94vh] overflow-y-auto scrollbar-thin">
              <button
                onClick={() => setViewingRouteDuty(null)}
                className="absolute top-5 right-5 p-2 bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white rounded-full transition-colors z-10"
              >
                <X className="w-5 h-5" />
              </button>

              {/* Header */}
              <div className="border-b border-border pb-4">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-sky-500/20 text-sky-400 border border-sky-500/30">
                    Route Log &amp; GPS Trajectory
                  </span>
                  <span className="text-xs text-slate-400 font-mono">Trip Sheet: {viewingRouteDuty.tripSheetNo}</span>
                </div>
                <h2 className="text-xl sm:text-2xl font-black text-slate-50 mt-1 flex items-center gap-2">
                  <Navigation className="w-5 h-5 text-sky-400" />
                  <span>Route Map &amp; Stops Trajectory</span>
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Visual map view of the entered route log stops. Take a screenshot or share this route with corporate clients.
                </p>
              </div>

              {/* Trip Summary Quick Banner */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-background p-4 rounded-2xl border border-border text-xs">
                <div>
                  <span className="text-slate-400 font-bold block">Vehicle</span>
                  <span className="font-mono font-extrabold text-slate-100">{viewingRouteDuty.carNo || "N/A"}</span>
                </div>
                <div>
                  <span className="text-slate-400 font-bold block">Guest / Reported To</span>
                  <span className="font-bold text-slate-100 truncate block">{viewingRouteDuty.reportedTo || "N/A"}</span>
                </div>
                <div>
                  <span className="text-slate-400 font-bold block">Total Distance</span>
                  <span className="font-mono font-black text-accent">{viewingRouteDuty.totalKms || "0"} KM</span>
                </div>
                <div>
                  <span className="text-slate-400 font-bold block">Total Hours</span>
                  <span className="font-mono font-black text-emerald-400">{viewingRouteDuty.totalHours || "0"} Hrs</span>
                </div>
              </div>

              {/* Route Stops List */}
              <div className="space-y-2">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-300 block">
                  Logged Route Stops ({viewingRouteDuty.usageTracks?.length || 0} legs)
                </span>
                {viewingRouteDuty.usageTracks && viewingRouteDuty.usageTracks.length > 0 ? (
                  <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                    {viewingRouteDuty.usageTracks.map((leg, i) => (
                      <div
                        key={leg.id || i}
                        className="flex items-center gap-3 bg-background border border-border p-3 rounded-xl text-xs"
                      >
                        <span className="w-6 h-6 rounded-full bg-accent/20 text-accent font-bold text-xs flex items-center justify-center shrink-0">
                          {i + 1}
                        </span>
                        <div className="flex-1 flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 min-w-0">
                          <span className="font-semibold text-slate-100 truncate">{leg.from || "Start Point"}</span>
                          <span className="text-slate-500 font-bold sm:inline hidden">→</span>
                          <span className="font-semibold text-emerald-400 truncate">{leg.to || "Destination"}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-3 bg-background border border-border rounded-xl text-xs text-slate-400">
                    No individual legs recorded in route log. Map displays general route between reporting location ({viewingRouteDuty.reportAt || "Start"}) and release location ({viewingRouteDuty.placeOfRelease || "End"}).
                  </div>
                )}
              </div>

              {/* Map Preview Embed */}
              {(() => {
                const tracks = viewingRouteDuty.usageTracks || [];
                const firstLeg = tracks[0];
                const lastLeg = tracks[tracks.length - 1];
                const origin = firstLeg?.from || viewingRouteDuty.reportAt || "New Delhi";
                const destination = lastLeg?.to || viewingRouteDuty.placeOfRelease || "Delhi NCR";
                const waypoints = tracks.slice(1, -1).map((t) => t.to || t.from).filter(Boolean);
                const gmapsDirUrl = `https://www.google.com/maps/dir/?api=1&origin=${encodeURIComponent(origin)}&destination=${encodeURIComponent(destination)}${waypoints.length > 0 ? `&waypoints=${encodeURIComponent(waypoints.join('|'))}` : ""}`;
                const embedQuery = `${origin} to ${destination}`;

                return (
                  <div className="space-y-3">
                    <div className="rounded-2xl overflow-hidden border border-border shadow-lg bg-black h-80 relative">
                      <iframe
                        title="Route Map Trajectory"
                        width="100%"
                        height="100%"
                        style={{ border: 0 }}
                        src={`https://maps.google.com/maps?q=${encodeURIComponent(embedQuery)}&t=&z=12&ie=UTF8&iwloc=&output=embed`}
                        allowFullScreen
                      />
                    </div>

                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
                      <p className="text-[11px] text-slate-400 flex items-center gap-1.5">
                        <Camera className="w-3.5 h-3.5 text-accent" />
                        <span>Take a screenshot of this view to share route trajectory with passengers.</span>
                      </p>

                      <div className="flex items-center gap-2">
                        <a
                          href={gmapsDirUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1.5 bg-sky-600 hover:bg-sky-500 text-white font-extrabold px-4 py-2 rounded-xl text-xs uppercase tracking-wider transition-all shadow-md"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                          <span>Open in Google Maps</span>
                        </a>

                        <button
                          type="button"
                          onClick={() => setViewingRouteDuty(null)}
                          className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold rounded-xl text-xs uppercase tracking-wider transition-all"
                        >
                          Close
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })()}
            </div>
          </div>
        </Portal>
      )}

    </div>
  );
}

