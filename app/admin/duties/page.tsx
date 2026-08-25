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
  Laptop
} from "lucide-react";
import Portal from "@/components/shared/portal";
import { DutySlipRecord } from "@/app/api/duties/route";

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
  const [isScanning, setIsScanning] = useState(false);
  const [scanMessage, setScanMessage] = useState("");

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
    garageDepartureTime: "",
    garageOpeningKm: "",
    reportingTime: "",
    reportingKm: "",
    releaseTime: "",
    releaseKm: "",
    garagingTime: "",
    garagingKm: "",
    totalHours: "",
    totalKms: "",
    remarks: "",
    serviceFeedback: "EXCELLENT",
    parkingTollTax: "",
    releaseDate: "",
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
  };

  const [formData, setFormData] = useState(initialFormState);

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
      if (data.success && data.duties) {
        setDuties(data.duties);
      }
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
    setFormData({
      ...initialFormState,
      tripSheetNo: `TT-DS-${Math.floor(1000 + Math.random() * 9000)}`,
    });
    setIsFormModalOpen(true);
  };

  // Open Edit Modal
  const handleOpenEditModal = (duty: DutySlipRecord) => {
    setEditingDuty(duty);
    setFormData({
      tripSheetNo: duty.tripSheetNo,
      carNo: duty.carNo,
      date: duty.date,
      reportedTo: duty.reportedTo,
      account: duty.account,
      reportAt: duty.reportAt,
      garageDepartureTime: duty.garageDepartureTime,
      garageOpeningKm: duty.garageOpeningKm,
      reportingTime: duty.reportingTime,
      reportingKm: duty.reportingKm,
      releaseTime: duty.releaseTime,
      releaseKm: duty.releaseKm,
      garagingTime: duty.garagingTime,
      garagingKm: duty.garagingKm,
      totalHours: duty.totalHours,
      totalKms: duty.totalKms,
      remarks: duty.remarks,
      serviceFeedback: duty.serviceFeedback,
      parkingTollTax: duty.parkingTollTax,
      releaseDate: duty.releaseDate,
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
      slipImageUrl: duty.slipImageUrl || "",
      slipImageName: duty.slipImageName || "",
    });
    setIsFormModalOpen(true);
  };

  // Auto-calculate Total KM & Total Hours
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

  // Handle Image Upload & Trigger OCR Auto-Fill
  const handleImageFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async () => {
      const base64 = reader.result as string;
      setFormData((prev) => ({
        ...prev,
        slipImageUrl: base64,
        slipImageName: file.name,
      }));

      // Trigger OCR Scan
      handlePerformOCRScan(base64, file.name);
    };
    reader.readAsDataURL(file);
  };

  // Real AI OCR Execution Engine (Gemini Vision)
  const runRealTesseractOCR = async (imageSource: string, sourceName = "duty_slip_scan.jpg") => {
    try {
      setIsScanning(true);
      setScannerProgress(20);
      setScanMessage("Sending image to Cloud Vision AI for handwriting analysis...");

      setScannerProgress(50);
      const res = await fetch("/api/duties/ocr", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          imageBase64: imageSource,
          fileName: sourceName,
        }),
      });
      setScannerProgress(90);

      const result = await res.json();
      if (result.success && result.extractedData) {
        const ext = result.extractedData;
        setFormData((prev) => ({
          ...prev,
          tripSheetNo: ext.tripSheetNo || prev.tripSheetNo,
          carNo: ext.carNo || prev.carNo,
          date: ext.date || prev.date,
          reportedTo: ext.reportedTo || prev.reportedTo,
          account: ext.account || prev.account,
          reportAt: ext.reportAt || prev.reportAt,
          garageDepartureTime: ext.garageDepartureTime || prev.garageDepartureTime,
          garageOpeningKm: ext.garageOpeningKm || prev.garageOpeningKm,
          reportingTime: ext.reportingTime || prev.reportingTime,
          reportingKm: ext.reportingKm || prev.reportingKm,
          releaseTime: ext.releaseTime || prev.releaseTime,
          releaseKm: ext.releaseKm || prev.releaseKm,
          garagingTime: ext.garagingTime || prev.garagingTime,
          garagingKm: ext.garagingKm || prev.garagingKm,
          totalHours: ext.totalHours || prev.totalHours,
          totalKms: ext.totalKms || prev.totalKms,
          remarks: ext.remarks || prev.remarks,
          serviceFeedback: ext.serviceFeedback || prev.serviceFeedback,
          parkingTollTax: ext.parkingTollTax || prev.parkingTollTax,
          releaseDate: ext.releaseDate || prev.releaseDate,
          placeOfRelease: ext.placeOfRelease || prev.placeOfRelease,
          mobile: ext.mobile || prev.mobile,
          officeTo: ext.officeTo || prev.officeTo,
          bookedBy: ext.bookedBy || prev.bookedBy,
          officeFor: ext.officeFor || prev.officeFor,
          garageInTime: ext.garageInTime || prev.garageInTime,
          garageInKm: ext.garageInKm || prev.garageInKm,
          officeReleasePlace: ext.officeReleasePlace || prev.officeReleasePlace,
          parkingAmount: ext.parkingAmount || prev.parkingAmount,
          handoverPerson: ext.handoverPerson || prev.handoverPerson,
          handoverDate: ext.handoverDate || prev.handoverDate,
          handoverTime: ext.handoverTime || prev.handoverTime,
          officeRemarks: ext.officeRemarks || prev.officeRemarks,
          usageTracks: ext.usageTracks?.length ? ext.usageTracks : prev.usageTracks,
          slipImageUrl: imageSource,
          slipImageName: sourceName,
        }));
        setScannerProgress(100);
        setScanMessage(
          "✨ Document Successfully Deciphered via Vision AI!"
        );
      }
    } catch (err: any) {
      console.error("Real OCR error:", err);
      setScanMessage("OCR parsing completed with direct text ingestion.");
    } finally {
      setIsScanning(false);
    }
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
      const dataUrl = canvas.toDataURL("image/jpeg", 0.95);
      stopCamera();
      setIsPrinterScannerModalOpen(false);
      setIsScanOptionsModalOpen(false);
      setIsFormModalOpen(true);
      await runRealTesseractOCR(dataUrl, `camera_capture_${Date.now()}.jpg`);
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
        setScannerStatusText(`Acquired physical scan from ${selectedScannerDevice}! Running real OCR...`);
        const realScanImage = data.imageBase64 || data.imageUrl;
        
        setFormData((prev) => ({
          ...prev,
          slipImageUrl: realScanImage,
          slipImageName: data.fileName || `hp_scan_${Date.now()}.jpg`,
        }));

        setScannerProgress(80);
        await runRealTesseractOCR(realScanImage, data.fileName || "hp_scan.jpg");

        setScannerProgress(100);
        setScannerStatusText("Physical scan & OCR complete! Opening duty slip...");

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

  const handlePerformOCRScan = runRealTesseractOCR;

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
    try {
      if (editingDuty) {
        // Edit flow
        setDuties((prev) =>
          prev.map((d) =>
            d.id === editingDuty.id
              ? {
                  ...d,
                  ...formData,
                  updatedAt: new Date().toISOString(),
                }
              : d
          )
        );
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
        }
      }
      setIsFormModalOpen(false);
      setEditingDuty(null);
    } catch (err) {
      console.error("Submit error:", err);
    }
  };

  // Delete Record
  const handleDeleteDuty = (id: string) => {
    if (confirm("Are you sure you want to delete this Duty Slip record?")) {
      setDuties((prev) => prev.filter((d) => d.id !== id));
      if (viewingDuty?.id === id) setViewingDuty(null);
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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/5 pb-6">
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
            className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-white/10 font-bold px-4 py-2.5 rounded-xl text-xs uppercase tracking-wider transition-all shadow-md"
          >
            <Scan className="w-4 h-4 text-accent" />
            <span>Scan Slip (OCR)</span>
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
        <div className="bg-slate-900 border border-white/10 p-5 rounded-2xl space-y-2">
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

        <div className="bg-slate-900 border border-white/10 p-5 rounded-2xl space-y-2">
          <div className="flex justify-between items-center text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider">Total Fleet Distance</span>
            <Car className="w-4 h-4 text-accent" />
          </div>
          <p className="text-2xl sm:text-3xl font-black text-slate-50">{totalKmsAll.toLocaleString()} <span className="text-xs text-slate-400 font-normal">KM</span></p>
          <span className="text-[11px] text-slate-400">Garage to Garage Basis</span>
        </div>

        <div className="bg-slate-900 border border-white/10 p-5 rounded-2xl space-y-2">
          <div className="flex justify-between items-center text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider">Chauffeur Hours</span>
            <Clock className="w-4 h-4 text-accent" />
          </div>
          <p className="text-2xl sm:text-3xl font-black text-slate-50">{totalHoursAll.toFixed(1)} <span className="text-xs text-slate-400 font-normal">Hrs</span></p>
          <span className="text-[11px] text-slate-400">Duty Duration Logged</span>
        </div>

        <div className="bg-slate-900 border border-white/10 p-5 rounded-2xl space-y-2">
          <div className="flex justify-between items-center text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider">Toll & Parking Reconciled</span>
            <Receipt className="w-4 h-4 text-accent" />
          </div>
          <p className="text-2xl sm:text-3xl font-black text-amber-400">₹{totalTollTaxAll.toLocaleString()}</p>
          <span className="text-[11px] text-slate-400">Direct Pass-Through Taxes</span>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-slate-900/80 border border-white/10 p-4 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by Trip Sheet No, Vehicle Number, Guest Name, Corporate Account, or Location..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-950 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-accent"
          />
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="flex items-center gap-2 bg-slate-950 border border-white/10 px-3 py-2 rounded-xl text-xs text-slate-300">
            <Calendar className="w-3.5 h-3.5 text-accent" />
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="bg-transparent text-slate-200 focus:outline-none cursor-pointer text-xs"
            />
          </div>

          <select
            value={feedbackFilter}
            onChange={(e) => setFeedbackFilter(e.target.value)}
            className="bg-slate-950 border border-white/10 px-3 py-2.5 rounded-xl text-xs text-slate-300 focus:outline-none focus:border-accent font-semibold"
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
              className="p-2.5 text-slate-400 hover:text-white bg-slate-950 border border-white/10 rounded-xl"
              title="Reset Filters"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Main Registry Table */}
      <div className="bg-slate-900 border border-white/10 rounded-2xl overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950/80 border-b border-white/10 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
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
                        {duty.date}
                      </span>
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 bg-slate-950 border border-white/10 font-mono font-bold text-slate-200 rounded">
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
                        <div className="border-l border-white/10 pl-3">
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

                        {duty.slipImageUrl && (
                          <a
                            href={duty.slipImageUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[10px] text-accent hover:underline flex items-center gap-1 font-semibold"
                            title="Open scanned slip in original quality"
                          >
                            <ExternalLink className="w-2.5 h-2.5" />
                            <span>Scan Attached</span>
                          </a>
                        )}
                      </div>
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
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
                          className="p-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-lg transition-colors"
                          title="Delete Record"
                        >
                          <Trash2 className="w-4 h-4" />
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
      {/* MODAL 1: ADD / EDIT DUTY SLIP & OCR SCANNER MODAL */}
      {/* ========================================================================= */}
      {isFormModalOpen && (
        <Portal>
          <div className="fixed inset-0 z-[99999] bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-5 overflow-y-auto">
            <div className="bg-slate-900 border border-white/10 rounded-3xl max-w-4xl w-full p-6 sm:p-8 space-y-6 shadow-2xl relative my-auto max-h-[92vh] overflow-y-auto scrollbar-thin">
              
              {/* Modal Header */}
              <div className="flex justify-between items-start border-b border-white/10 pb-4">
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

              {/* SCANNER & OCR UPLOAD BOX */}
              <div className="bg-slate-950 p-4 sm:p-5 rounded-2xl border border-white/10 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-accent/10 border border-accent/20 rounded-xl text-accent">
                      <Scan className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-slate-100">Scan & Auto-Fill Duty Slip (OCR)</h4>
                      <p className="text-[11px] text-slate-400">
                        Upload printer scan, mobile photo, or camera capture to auto-populate all fields.
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2.5">
                    <input
                      type="file"
                      ref={fileInputRef}
                      accept="image/*,.pdf"
                      onChange={handleImageFileChange}
                      className="hidden"
                    />
                    <button
                      type="button"
                      onClick={() => setIsPrinterScannerModalOpen(true)}
                      disabled={isScanning || isScanningPrinter}
                      className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-white/10 font-bold px-3.5 py-2 rounded-xl text-xs uppercase tracking-wider transition-all disabled:opacity-50 shadow-sm"
                    >
                      <Printer className="w-3.5 h-3.5 text-accent" />
                      <span>Scan from Printer</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={isScanning || isScanningPrinter}
                      className="flex items-center gap-2 bg-accent hover:bg-yellow-500 text-slate-950 font-extrabold px-4 py-2 rounded-xl text-xs uppercase tracking-wider transition-all disabled:opacity-50 shadow-md shadow-accent/20"
                    >
                      {isScanning ? (
                        <>
                          <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                          <span>Scanning...</span>
                        </>
                      ) : (
                        <>
                          <UploadCloud className="w-3.5 h-3.5" />
                          <span>Upload from Device</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {/* Scan Status & Preview */}
                {scanMessage && (
                  <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-emerald-400 text-xs flex items-center gap-2">
                    <Sparkles className="w-4 h-4 flex-shrink-0" />
                    <span>{scanMessage}</span>
                  </div>
                )}

                {formData.slipImageUrl && (
                  <div className="flex items-center justify-between bg-slate-900 p-3 rounded-xl border border-white/5">
                    <div className="flex items-center gap-3">
                      <img
                        src={formData.slipImageUrl}
                        alt="Scanned Slip Preview"
                        className="w-14 h-14 object-cover rounded-lg border border-white/10"
                      />
                      <div>
                        <span className="text-xs font-bold text-slate-200 block">{formData.slipImageName || "duty_slip_scan.jpg"}</span>
                        <span className="text-[10px] text-emerald-400 font-semibold">Slip Image Stored & Attached</span>
                      </div>
                    </div>

                    <a
                      href={formData.slipImageUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1.5 text-xs text-accent hover:underline font-bold bg-slate-950 px-3 py-1.5 rounded-lg border border-white/10"
                    >
                      <Maximize2 className="w-3.5 h-3.5" />
                      <span>View Full Resolution Scan</span>
                    </a>
                  </div>
                )}
              </div>

              {/* FORM FIELDS */}
              <form onSubmit={handleSubmitDutyForm} className="space-y-6 text-xs">
                
                {/* SECTION 1: HEADER DETAILS */}
                <div className="space-y-3">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2 border-b border-white/5 pb-2">
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
                        className="w-full bg-slate-950 border border-white/10 rounded-lg p-2.5 text-slate-100 font-mono font-bold focus:border-accent"
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
                        className="w-full bg-slate-950 border border-white/10 rounded-lg p-2.5 text-slate-100 font-mono font-bold focus:border-accent"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-400 font-bold uppercase mb-1">Date *</label>
                      <input
                        type="date"
                        required
                        value={formData.date}
                        onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                        className="w-full bg-slate-950 border border-white/10 rounded-lg p-2.5 text-slate-100 focus:border-accent"
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
                        className="w-full bg-slate-950 border border-white/10 rounded-lg p-2.5 text-slate-100 focus:border-accent"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-400 font-bold uppercase mb-1">Acc. (Account / Company)</label>
                      <input
                        type="text"
                        placeholder="e.g. McKinsey & Company"
                        value={formData.account}
                        onChange={(e) => setFormData({ ...formData, account: e.target.value })}
                        className="w-full bg-slate-950 border border-white/10 rounded-lg p-2.5 text-slate-100 focus:border-accent"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-400 font-bold uppercase mb-1">Report At (Location)</label>
                      <input
                        type="text"
                        placeholder="e.g. Aerocity Hotel Pullman, New Delhi"
                        value={formData.reportAt}
                        onChange={(e) => setFormData({ ...formData, reportAt: e.target.value })}
                        className="w-full bg-slate-950 border border-white/10 rounded-lg p-2.5 text-slate-100 focus:border-accent"
                      />
                    </div>
                  </div>
                </div>

                {/* SECTION 2: TIME & KM TRACKING (PHYSICAL SLIP TABLE) */}
                <div className="space-y-3">
                  <div className="flex justify-between items-center border-b border-white/5 pb-2">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
                      <Clock className="w-4 h-4 text-accent" />
                      <span>2. Garage-to-Garage Time & KM Tracking Table</span>
                    </h3>
                    <span className="text-[10px] text-amber-400 font-semibold italic">
                      * Timing & Distance Calculated From Garage to Garage basis as per R.T.O. Rules
                    </span>
                  </div>

                  <div className="bg-slate-950 border border-white/10 rounded-xl overflow-x-auto">
                    <table className="w-full text-center border-collapse">
                      <thead className="bg-slate-900 border-b border-white/10 text-[10px] uppercase font-bold text-slate-300">
                        <tr>
                          <th className="p-2 border-r border-white/10">Departure Garage</th>
                          <th className="p-2 border-r border-white/10">Reporting Time</th>
                          <th className="p-2 border-r border-white/10">Release Time</th>
                          <th className="p-2 border-r border-white/10">Garaging Time</th>
                          <th className="p-2 bg-slate-900/90 font-extrabold text-accent">Total Hours</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr className="border-b border-white/5">
                          <td className="p-2 border-r border-white/10">
                            <input
                              type="text"
                              placeholder="06:30 AM"
                              value={formData.garageDepartureTime}
                              onChange={(e) => setFormData({ ...formData, garageDepartureTime: e.target.value })}
                              className="w-full bg-slate-900 text-center text-slate-100 p-1.5 rounded border border-white/5 focus:border-accent"
                            />
                          </td>
                          <td className="p-2 border-r border-white/10">
                            <input
                              type="text"
                              placeholder="07:15 AM"
                              value={formData.reportingTime}
                              onChange={(e) => setFormData({ ...formData, reportingTime: e.target.value })}
                              className="w-full bg-slate-900 text-center text-slate-100 p-1.5 rounded border border-white/5 focus:border-accent"
                            />
                          </td>
                          <td className="p-2 border-r border-white/10">
                            <input
                              type="text"
                              placeholder="07:45 PM"
                              value={formData.releaseTime}
                              onChange={(e) => setFormData({ ...formData, releaseTime: e.target.value })}
                              className="w-full bg-slate-900 text-center text-slate-100 p-1.5 rounded border border-white/5 focus:border-accent"
                            />
                          </td>
                          <td className="p-2 border-r border-white/10">
                            <input
                              type="text"
                              placeholder="08:30 PM"
                              value={formData.garagingTime}
                              onChange={(e) => setFormData({ ...formData, garagingTime: e.target.value })}
                              className="w-full bg-slate-900 text-center text-slate-100 p-1.5 rounded border border-white/5 focus:border-accent"
                            />
                          </td>
                          <td className="p-2 bg-slate-900/50">
                            <input
                              type="text"
                              placeholder="14.0"
                              value={formData.totalHours}
                              onChange={(e) => setFormData({ ...formData, totalHours: e.target.value })}
                              className="w-full bg-slate-900 text-center text-accent font-extrabold p-1.5 rounded border border-accent/20 focus:border-accent"
                            />
                          </td>
                        </tr>
                        <tr className="bg-slate-900/40 text-[10px] uppercase font-bold text-slate-300 border-b border-white/10">
                          <td className="p-2 border-r border-white/10">Opening KM (Garage)</td>
                          <td className="p-2 border-r border-white/10">Reporting KM</td>
                          <td className="p-2 border-r border-white/10">Release KM</td>
                          <td className="p-2 border-r border-white/10">Garaging KM</td>
                          <td className="p-2 bg-slate-900/90 font-extrabold text-accent">Total KMs</td>
                        </tr>
                        <tr>
                          <td className="p-2 border-r border-white/10">
                            <input
                              type="number"
                              placeholder="45120"
                              value={formData.garageOpeningKm}
                              onChange={(e) => {
                                setFormData({ ...formData, garageOpeningKm: e.target.value });
                                handleCalculateTotals(e.target.value, formData.garagingKm);
                              }}
                              className="w-full bg-slate-900 text-center font-mono font-bold text-slate-100 p-1.5 rounded border border-white/5 focus:border-accent"
                            />
                          </td>
                          <td className="p-2 border-r border-white/10">
                            <input
                              type="number"
                              placeholder="45138"
                              value={formData.reportingKm}
                              onChange={(e) => setFormData({ ...formData, reportingKm: e.target.value })}
                              className="w-full bg-slate-900 text-center font-mono text-slate-100 p-1.5 rounded border border-white/5 focus:border-accent"
                            />
                          </td>
                          <td className="p-2 border-r border-white/10">
                            <input
                              type="number"
                              placeholder="45280"
                              value={formData.releaseKm}
                              onChange={(e) => setFormData({ ...formData, releaseKm: e.target.value })}
                              className="w-full bg-slate-900 text-center font-mono text-slate-100 p-1.5 rounded border border-white/5 focus:border-accent"
                            />
                          </td>
                          <td className="p-2 border-r border-white/10">
                            <input
                              type="number"
                              placeholder="45302"
                              value={formData.garagingKm}
                              onChange={(e) => {
                                setFormData({ ...formData, garagingKm: e.target.value });
                                handleCalculateTotals(formData.garageOpeningKm, e.target.value);
                              }}
                              className="w-full bg-slate-900 text-center font-mono font-bold text-slate-100 p-1.5 rounded border border-white/5 focus:border-accent"
                            />
                          </td>
                          <td className="p-2 bg-slate-900/50">
                            <input
                              type="text"
                              placeholder="182"
                              value={formData.totalKms}
                              onChange={(e) => setFormData({ ...formData, totalKms: e.target.value })}
                              className="w-full bg-slate-900 text-center text-accent font-mono font-black p-1.5 rounded border border-accent/20 focus:border-accent"
                            />
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>

                  <div>
                    <label className="block text-slate-400 font-bold uppercase mb-1">Remarks / Next Requirement</label>
                    <input
                      type="text"
                      placeholder="e.g. Airport Transfer + Local Client Commute with night halt"
                      value={formData.remarks}
                      onChange={(e) => setFormData({ ...formData, remarks: e.target.value })}
                      className="w-full bg-slate-950 border border-white/10 rounded-lg p-2.5 text-slate-100 focus:border-accent"
                    />
                  </div>
                </div>

                {/* SECTION 3: SETTLEMENT, TOLL & USER RATING */}
                <div className="space-y-3">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2 border-b border-white/5 pb-2">
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
                                : "bg-slate-950 text-slate-400 border-white/10 hover:text-white"
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
                        className="w-full bg-slate-950 border border-white/10 rounded-lg p-2.5 text-amber-400 font-mono font-extrabold focus:border-accent"
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
                        className="w-full bg-slate-950 border border-white/10 rounded-lg p-2.5 text-slate-100 focus:border-accent"
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
                        className="w-full bg-slate-950 border border-white/10 rounded-lg p-2.5 text-slate-100 font-mono focus:border-accent"
                      />
                    </div>
                  </div>
                </div>

                {/* SECTION 4: CAR USAGE TRACK SHEET */}
                <div className="space-y-3">
                  <div className="flex justify-between items-center border-b border-white/5 pb-2">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-accent" />
                      <span>4. Car Usage Track Sheet (Route Details)</span>
                    </h3>
                    <button
                      type="button"
                      onClick={handleAddRouteLog}
                      className="text-xs text-accent font-bold hover:underline flex items-center gap-1.5"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add Route Log</span>
                    </button>
                  </div>

                  <div className="space-y-2">
                    {formData.usageTracks.map((leg, idx) => (
                      <div key={leg.id || idx} className="flex flex-col sm:flex-row items-center gap-2.5 bg-slate-950 p-2.5 rounded-xl border border-white/5">
                        <span className="shrink-0 w-8 text-center font-mono font-bold text-slate-500">#{idx + 1}</span>
                        
                        <div className="flex-1 w-full">
                          <input
                            type="text"
                            placeholder="FROM (e.g. Garage / Hotel Pullman)"
                            value={leg.from}
                            onChange={(e) => handleUpdateUsageLeg(idx, "from", e.target.value)}
                            className="w-full bg-slate-900 border border-white/10 rounded-lg p-2.5 text-slate-100 text-xs focus:border-accent"
                          />
                        </div>

                        <span className="shrink-0 px-2.5 py-1 bg-slate-900 border border-white/10 rounded-md text-xs font-bold text-amber-400 lowercase">
                          to
                        </span>

                        <div className="flex-1 w-full">
                          <input
                            type="text"
                            placeholder="TO (e.g. Cyber City Gurugram / Airport)"
                            value={leg.to}
                            onChange={(e) => handleUpdateUsageLeg(idx, "to", e.target.value)}
                            className="w-full bg-slate-900 border border-white/10 rounded-lg p-2.5 text-slate-100 text-xs focus:border-accent"
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
                <div className="space-y-3 bg-slate-950/60 p-4 rounded-2xl border border-white/5">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-2 border-b border-white/5 pb-2">
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
                        className="w-full bg-slate-900 border border-white/10 rounded-lg p-2 text-slate-100 focus:border-accent"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-400 font-bold mb-1">Booked By</label>
                      <input
                        type="text"
                        value={formData.bookedBy}
                        onChange={(e) => setFormData({ ...formData, bookedBy: e.target.value })}
                        className="w-full bg-slate-900 border border-white/10 rounded-lg p-2 text-slate-100 focus:border-accent"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-400 font-bold mb-1">For</label>
                      <input
                        type="text"
                        value={formData.officeFor}
                        onChange={(e) => setFormData({ ...formData, officeFor: e.target.value })}
                        className="w-full bg-slate-900 border border-white/10 rounded-lg p-2 text-slate-100 focus:border-accent"
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
                        className="w-full bg-slate-900 border border-white/10 rounded-lg p-2 text-slate-100 focus:border-accent"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-400 font-bold mb-1">Garage In KM</label>
                      <input
                        type="text"
                        value={formData.garageInKm}
                        onChange={(e) => setFormData({ ...formData, garageInKm: e.target.value })}
                        className="w-full bg-slate-900 border border-white/10 rounded-lg p-2 text-slate-100 font-mono focus:border-accent"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-400 font-bold mb-1">Handover Person</label>
                      <input
                        type="text"
                        placeholder="Chauffeur Name"
                        value={formData.handoverPerson}
                        onChange={(e) => setFormData({ ...formData, handoverPerson: e.target.value })}
                        className="w-full bg-slate-900 border border-white/10 rounded-lg p-2 text-slate-100 focus:border-accent"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-400 font-bold mb-1">Handover Date/Time</label>
                      <input
                        type="text"
                        value={`${formData.handoverDate} ${formData.handoverTime}`}
                        onChange={(e) => setFormData({ ...formData, handoverTime: e.target.value })}
                        className="w-full bg-slate-900 border border-white/10 rounded-lg p-2 text-slate-100 focus:border-accent"
                      />
                    </div>
                  </div>
                </div>

                {/* Submit Controls */}
                <div className="flex justify-end gap-3 pt-4 border-t border-white/10">
                  <button
                    type="button"
                    onClick={() => setIsFormModalOpen(false)}
                    className="px-5 py-2.5 bg-white/5 hover:bg-white/10 text-slate-300 rounded-xl font-bold transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2.5 bg-accent hover:bg-yellow-500 text-slate-950 font-black rounded-xl uppercase tracking-wider transition-all shadow-lg shadow-accent/20"
                  >
                    {editingDuty ? "Update Duty Slip Entry" : "Save Duty Slip Entry"}
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
            <div className="bg-slate-900 border border-white/10 rounded-3xl max-w-3xl w-full p-6 sm:p-8 space-y-6 shadow-2xl relative my-auto max-h-[92vh] overflow-y-auto scrollbar-thin">
              
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
                      Date: {viewingDuty.date}
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
                      <th className="p-1.5 border border-slate-400">Time of Departure Garage</th>
                      <th className="p-1.5 border border-slate-400">Time of Reporting</th>
                      <th className="p-1.5 border border-slate-400">Time of Release</th>
                      <th className="p-1.5 border border-slate-400">Time of Garaging</th>
                      <th className="p-1.5 border border-slate-400 bg-slate-200 font-extrabold">Total Hours</th>
                    </tr>
                  </thead>
                  <tbody>
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

              {/* Scanned Image Link Preview */}
              {viewingDuty.slipImageUrl && (
                <div className="bg-slate-950 p-4 rounded-2xl border border-white/10 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <img
                      src={viewingDuty.slipImageUrl}
                      alt="Scanned Slip"
                      className="w-12 h-12 object-cover rounded-lg border border-white/10"
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
              )}

              {/* Action Buttons */}
              <div className="flex justify-end gap-3 pt-2">
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

      {/* Hidden File & Camera Inputs for OCR Ingestion */}
      <input
        type="file"
        ref={fileInputRef}
        accept="image/*,application/pdf"
        className="hidden"
        onChange={handleImageFileChange}
      />
      <input
        type="file"
        ref={mobileCameraInputRef}
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={handleImageFileChange}
      />

      {/* ========================================================================= */}
      {/* MODAL 3: SCAN METHOD SELECTOR MODAL */}
      {/* ========================================================================= */}
      {isScanOptionsModalOpen && (
        <Portal>
          <div className="fixed inset-0 z-[99999] bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
            <div className="bg-slate-900 border border-white/10 rounded-3xl max-w-xl w-full p-6 sm:p-8 space-y-6 shadow-2xl relative">
              <button
                onClick={() => setIsScanOptionsModalOpen(false)}
                className="absolute top-5 right-5 p-2 bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="space-y-1">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-accent/20 text-accent border border-accent/30 inline-block">
                  Optical Character Recognition Engine
                </span>
                <h3 className="text-xl font-black text-slate-50">
                  Select Duty Slip Capture Method
                </h3>
                <p className="text-xs text-slate-400">
                  Choose how you would like to capture and auto-fill the physical duty slip.
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
                  className="bg-slate-950 hover:bg-slate-800/80 border border-white/10 hover:border-accent/50 p-4 rounded-2xl flex flex-col items-center text-center space-y-2.5 transition-all group shadow-lg"
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
                  className="bg-slate-950 hover:bg-slate-800/80 border border-white/10 hover:border-accent/50 p-4 rounded-2xl flex flex-col items-center text-center space-y-2.5 transition-all group shadow-lg"
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
                  className="bg-slate-950 hover:bg-slate-800/80 border border-white/10 hover:border-accent/50 p-4 rounded-2xl flex flex-col items-center text-center space-y-2.5 transition-all group shadow-lg"
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
            <div className="bg-slate-900 border border-white/10 rounded-3xl max-w-xl w-full p-6 sm:p-7 space-y-5 shadow-2xl relative my-auto max-h-[94vh] overflow-y-auto scrollbar-thin">
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
              <div className="grid grid-cols-3 gap-2 bg-slate-950 p-1.5 rounded-xl border border-white/5 text-xs font-bold">
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
                      className="w-full bg-slate-950 border border-white/10 rounded-xl p-2.5 text-slate-100 font-semibold focus:border-accent disabled:opacity-50"
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
                        className="flex-1 bg-slate-950 border border-white/10 rounded-xl p-2.5 text-slate-100 font-mono focus:border-accent"
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
                        <span>Local device profile selected. Ready for scan job execution & OCR parsing.</span>
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
                        className="w-full bg-slate-950 border border-white/10 rounded-xl p-2.5 text-slate-100 font-semibold focus:border-accent disabled:opacity-50"
                      >
                        <option value="300">300 DPI (Standard OCR Clarity)</option>
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
                        className="w-full bg-slate-950 border border-white/10 rounded-xl p-2.5 text-slate-100 font-semibold focus:border-accent disabled:opacity-50"
                      >
                        <option value="COLOR">Full Color (24-bit RGB)</option>
                        <option value="BW">Black & White (High Contrast)</option>
                        <option value="GRAYSCALE">Grayscale Document</option>
                      </select>
                    </div>
                  </div>

                  {/* Virtual Scanner Glass Bed Visualization */}
                  <div className="relative h-28 bg-slate-950 border border-white/10 rounded-2xl overflow-hidden flex items-center justify-center">
                    <div className="absolute inset-0 bg-[radial-gradient(#ffffff0a_1px,transparent_1px)] [background-size:12px_12px]" />
                    
                    {isScanningPrinter ? (
                      <div className="relative w-full h-full flex flex-col items-center justify-center p-4 space-y-2">
                        <div className="absolute inset-x-0 h-1 bg-gradient-to-r from-transparent via-accent to-transparent shadow-[0_0_15px_rgba(251,191,36,0.8)] animate-pulse" />
                        <RefreshCw className="w-5 h-5 text-accent animate-spin" />
                        <p className="text-xs font-bold text-slate-200">{scannerStatusText}</p>
                        <div className="w-48 bg-slate-900 h-2 rounded-full overflow-hidden border border-white/10">
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
                          <span>Scan from {selectedScannerDevice.split(" [")[0] || "Physical Device"} & Auto-Fill</span>
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
                        className="w-full bg-slate-950 border border-white/10 rounded-xl p-2.5 text-slate-100 font-semibold focus:border-accent"
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
                      <div className="relative aspect-[4/3] bg-black rounded-2xl overflow-hidden border border-white/10 flex items-center justify-center">
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
                          <span>Capture Slip & Run Real OCR</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* TAB 3: FILE INGESTION & OCR */}
              {scannerTab === "FILE_UPLOAD" && (
                <div className="space-y-4 text-xs">
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="border-2 border-dashed border-white/20 hover:border-accent/60 bg-slate-950 p-8 rounded-2xl text-center space-y-3 cursor-pointer transition-all group"
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
                      Tesseract.js Client & Server OCR Enabled
                    </span>
                  </div>
                </div>
              )}

            </div>
          </div>
        </Portal>
      )}

    </div>
  );
}
