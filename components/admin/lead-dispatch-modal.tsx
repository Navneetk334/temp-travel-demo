"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  X,
  Truck,
  Car,
  UserCheck,
  IndianRupee,
  CheckCircle2,
  Check,
  Share2,
  ArrowRight,
  Filter,
  Sparkles,
  MapPin,
  AlertCircle,
  Loader2
} from "lucide-react";
import LocationInput from "@/components/shared/location-input";
import Portal from "@/components/shared/portal";
import { getCurrentAdminUser, createLeadStatusAuditLog } from "@/lib/lead-sync";
import { buildWhatsAppShareUrl } from "@/lib/whatsapp-share";

export interface LeadDispatchModalProps {
  isOpen: boolean;
  onClose: () => void;
  lead: any;
  onSuccess?: (dispatchedBooking: any) => void;
}

// Vehicle Class options matching mandatory PRD specs
const SEDAN_CLASSES = ["Compact", "Executive", "Premium Executive", "Luxury"];
const SUV_CLASSES = ["Subcompact/Urban", "Mid-Premium", "Premium", "Luxury"];

export function extractLeadVehicleRequirements(lead: any): {
  category: string;
  vehicleClass: string;
  model: string;
  isVehiclePreSelected: boolean;
} {
  if (!lead) return { category: "", vehicleClass: "", model: "", isVehiclePreSelected: false };

  let category = lead.category || lead.vehicleCategory?.name || lead.categoryName || "";
  let vehicleClass = lead.vehicleClass || lead.subCategory || "";
  let model = lead.model || lead.vehicleModel || lead.modelName || "";

  const trip = (lead.tripType || "") + " " + (lead.notes || "") + " " + (lead.requirements || "");

  // If not explicitly set, try extracting from tripType string
  if (!category) {
    if (/\bSUV\b/i.test(trip)) category = "SUV";
    else if (/\bSedan\b/i.test(trip)) category = "Sedan";
  }

  if (!vehicleClass) {
    const classMatch = trip.match(/\((Compact|Executive|Premium Executive|Luxury|Subcompact\/Urban|Mid-Premium|Premium)\)/i);
    if (classMatch) vehicleClass = classMatch[1];
  }

  if (!model) {
    const modelMatch = trip.match(/Model:\s*([^,\)\n]+)/i);
    if (modelMatch) model = modelMatch[1].trim();
  }

  const isVehiclePreSelected = Boolean(category || vehicleClass || model);

  return { category, vehicleClass, model, isVehiclePreSelected };
}

export function extractPickupLocation(lead: any): string {
  if (!lead) return "";
  if (lead.pickupLocation && typeof lead.pickupLocation === "string" && lead.pickupLocation.trim() && lead.pickupLocation.trim() !== "Pickup Hub" && lead.pickupLocation.trim() !== "-") {
    return lead.pickupLocation.trim();
  }
  if (lead.pickupLocations && typeof lead.pickupLocations === "string" && lead.pickupLocations.trim() && lead.pickupLocations.trim() !== "Pickup Hub" && lead.pickupLocations.trim() !== "-") {
    return lead.pickupLocations.trim();
  }
  if (lead.pickup && typeof lead.pickup === "string" && lead.pickup.trim() && lead.pickup.trim() !== "Pickup Hub" && lead.pickup.trim() !== "-") {
    return lead.pickup.trim();
  }
  const text = `${lead.requirements || ""} ${lead.notes || ""}`;
  const match = text.match(/(?:Pickup Address|Pickup Location|Pickup):\s*([^.\n]+(?:\.[^.\n]+)*?)(?=\.\s*(?:Drop Address|Drop Location|Drop|Pickup Time|Drop Time|Fare|$)|$|\n)/i)
    || text.match(/(?:Pickup Address|Pickup Location|Pickup):\s*([^\n\r]+)/i);
  return match && match[1] ? match[1].trim() : (lead.pickupLocations || lead.pickupLocation || lead.pickup || "");
}

export function extractDropLocation(lead: any): string {
  if (!lead) return "";
  if (lead.dropLocation && typeof lead.dropLocation === "string" && lead.dropLocation.trim() && lead.dropLocation.trim() !== "-") {
    return lead.dropLocation.trim();
  }
  if (lead.drop && typeof lead.drop === "string" && lead.drop.trim() && lead.drop.trim() !== "-") {
    return lead.drop.trim();
  }
  const text = `${lead.requirements || ""} ${lead.notes || ""}`;
  const match = text.match(/(?:Drop Address|Drop Location|Drop):\s*([^.\n]+(?:\.[^.\n]+)*?)(?=\.\s*(?:Pickup Time|Drop Time|Fare|Advance|Car|Chauffeur|Notes|$)|$|\n)/i)
    || text.match(/(?:Drop Address|Drop Location|Drop):\s*([^\n\r]+)/i);
  return match && match[1] ? match[1].trim() : "";
}

export function extractPickupTime(lead: any): string {
  if (!lead) return "";
  if (lead.pickupTime && typeof lead.pickupTime === "string" && lead.pickupTime.trim()) {
    return lead.pickupTime.trim();
  }
  const text = `${lead.requirements || ""} ${lead.notes || ""}`;
  const match = text.match(/(?:Pickup Time|Pickup at|Time):\s*([0-9]{1,2}:[0-9]{2}(?:\s*[APap][Mm])?)/i);
  if (match && match[1]) return match[1].trim();

  if (lead.pickupDateTime) {
    try {
      const d = new Date(lead.pickupDateTime);
      if (!isNaN(d.getTime())) {
        return d.toLocaleTimeString("en-IN", { timeZone: "Asia/Kolkata", hour: "2-digit", minute: "2-digit", hour12: true });
      }
    } catch (e) {}
  }
  return "";
}

export function extractPickupDate(lead: any): string {
  if (!lead) return "";
  if (lead.pickupDate && typeof lead.pickupDate === "string" && lead.pickupDate.trim()) {
    return lead.pickupDate.trim();
  }
  if (lead.date && typeof lead.date === "string" && lead.date.trim()) {
    return lead.date.trim();
  }
  const text = `${lead.requirements || ""} ${lead.notes || ""}`;
  const match = text.match(/(?:Pickup Date|Travel Date|Date):\s*([0-9]{4}-[0-9]{2}-[0-9]{2}|[0-9]{1,2}[/-][0-9]{1,2}[/-][0-9]{2,4})/i);
  if (match && match[1]) return match[1].trim();

  if (lead.pickupDateTime) {
    try {
      const d = new Date(lead.pickupDateTime);
      if (!isNaN(d.getTime())) {
        return d.toISOString().slice(0, 10);
      }
    } catch (e) {}
  }
  if (lead.createdAt) {
    try {
      const d = new Date(lead.createdAt);
      if (!isNaN(d.getTime())) {
        return d.toISOString().slice(0, 10);
      }
    } catch (e) {}
  }
  return new Date().toISOString().slice(0, 10);
}

export function formatToDateTimeLocal(dateStr?: string, timeStr?: string): string {
  let yyyyMmDd = "";
  if (dateStr && /^\d{4}-\d{2}-\d{2}$/.test(dateStr.trim())) {
    yyyyMmDd = dateStr.trim();
  } else {
    const now = new Date();
    const istYear = new Intl.DateTimeFormat("en-US", { timeZone: "Asia/Kolkata", year: "numeric" }).format(now);
    const istMonth = new Intl.DateTimeFormat("en-US", { timeZone: "Asia/Kolkata", month: "2-digit" }).format(now);
    const istDay = new Intl.DateTimeFormat("en-US", { timeZone: "Asia/Kolkata", day: "2-digit" }).format(now);
    yyyyMmDd = `${istYear}-${istMonth}-${istDay}`;
  }

  if (timeStr) {
    const t = timeStr.trim();
    const ampmMatch = t.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)?$/i);
    if (ampmMatch) {
      let hours = parseInt(ampmMatch[1], 10);
      const minutes = ampmMatch[2];
      const meridiem = (ampmMatch[3] || "").toUpperCase();
      if (meridiem === "PM" && hours < 12) hours += 12;
      if (meridiem === "AM" && hours === 12) hours = 0;
      const hh = hours.toString().padStart(2, "0");
      return `${yyyyMmDd}T${hh}:${minutes}`;
    }
  }

  const now = new Date();
  const istHour = new Intl.DateTimeFormat("en-US", { timeZone: "Asia/Kolkata", hour: "2-digit", hour12: false }).format(now);
  const istMin = new Intl.DateTimeFormat("en-US", { timeZone: "Asia/Kolkata", minute: "2-digit" }).format(now);
  return `${yyyyMmDd}T${istHour.padStart(2, "0")}:${istMin.padStart(2, "0")}`;
}

export default function LeadDispatchModal({
  isOpen,
  onClose,
  lead,
  onSuccess
}: LeadDispatchModalProps) {
  const [availableVehicles, setAvailableVehicles] = useState<any[]>([]);
  const [availableDrivers, setAvailableDrivers] = useState<any[]>([]);
  const [activeBookings, setActiveBookings] = useState<any[]>([]);
  const [dispatchedSuccess, setDispatchedSuccess] = useState<any | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Vehicle Category & Class Filter States for Dispatch Desk
  const [categoryFilter, setCategoryFilter] = useState<string>("ALL");
  const [classFilter, setClassFilter] = useState<string>("ALL");

  const [dispatchForm, setDispatchForm] = useState({
    tripType: "Pickup & Drop",
    vehicleId: "",
    driverId: "",
    fare: "2800",
    advance: "500",
    paymentMode: "Cash Collection",
    pickupLocation: "",
    dropLocation: "",
    pickupDateTime: "",
    notes: ""
  });

  // Extract lead vehicle specs
  const leadVehReq = useMemo(() => extractLeadVehicleRequirements(lead), [lead]);

  // Busy vehicles and chauffeurs tracking from live active bookings
  const busyVehiclesMap = useMemo(() => {
    const map = new Map<string, { bookingNumber: string; status: string; customerName: string }>();
    activeBookings.forEach((b: any) => {
      const info = {
        bookingNumber: b.bookingNumber,
        status: b.status,
        customerName: b.customer?.name || "Customer"
      };
      if (b.vehicleId) map.set(b.vehicleId, info);
      if (b.vehicle?.id) map.set(b.vehicle.id, info);
      if (b.vehicle?.registrationNumber) map.set(b.vehicle.registrationNumber.toUpperCase(), info);
    });
    return map;
  }, [activeBookings]);

  const busyDriversMap = useMemo(() => {
    const map = new Map<string, { bookingNumber: string; vehicleReg: string }>();
    activeBookings.forEach((b: any) => {
      const info = {
        bookingNumber: b.bookingNumber,
        vehicleReg: b.vehicle?.registrationNumber || "Fleet Car"
      };
      if (b.vehicle?.driver?.id) map.set(b.vehicle.driver.id, info);
      if (b.driverId) map.set(b.driverId, info);
      if (b.vehicle?.driver?.phone) map.set(b.vehicle.driver.phone.replace(/\D/g, "").slice(-10), info);
      if (b.vehicle?.driver?.name) map.set(b.vehicle.driver.name.trim().toLowerCase(), info);
    });
    return map;
  }, [activeBookings]);

  const getVehicleBusy = (veh: any) => {
    if (!veh) return null;
    if (veh.id && busyVehiclesMap.has(veh.id)) return busyVehiclesMap.get(veh.id);
    const reg = (veh.registrationNumber || "").toUpperCase();
    if (reg && busyVehiclesMap.has(reg)) return busyVehiclesMap.get(reg);
    return null;
  };

  const getDriverBusy = (drv: any) => {
    if (!drv) return null;
    if (drv.id && busyDriversMap.has(drv.id)) return busyDriversMap.get(drv.id);
    const phoneClean = (drv.phone || "").replace(/\D/g, "").slice(-10);
    if (phoneClean && busyDriversMap.has(phoneClean)) return busyDriversMap.get(phoneClean);
    const nameClean = (drv.name || "").trim().toLowerCase();
    if (nameClean && busyDriversMap.has(nameClean)) return busyDriversMap.get(nameClean);
    return null;
  };

  // Load registered fleet vehicles and drivers for assignment
  useEffect(() => {
    if (!isOpen) return;

    // 1. Initial Load from Local Storage
    let vList: any[] = [];
    try {
      const storedVehicles = localStorage.getItem("user_uploaded_fleet_vehicles") || localStorage.getItem("user_uploaded_fleet");
      if (storedVehicles) {
        const parsed = JSON.parse(storedVehicles);
        if (Array.isArray(parsed) && parsed.length > 0) vList = parsed;
      }
      if (vList.length > 0) setAvailableVehicles(vList);
    } catch (e) {
      console.error(e);
    }

    // 2. Initial Load Drivers from Local Storage
    let dList: any[] = [];
    try {
      const storedDrivers = localStorage.getItem("user_uploaded_drivers");
      if (storedDrivers) {
        const parsed = JSON.parse(storedDrivers);
        if (Array.isArray(parsed) && parsed.length > 0) dList = parsed;
      }
      if (dList.length > 0) setAvailableDrivers(dList);
    } catch (e) {
      console.error(e);
    }

    // 3. Live Sync from API
    const syncLiveSources = async () => {
      try {
        const [fleetRes, drvRes, bookingsRes] = await Promise.allSettled([
          fetch("/api/fleet"),
          fetch("/api/admin/drivers"),
          fetch("/api/bookings?limit=100")
        ]);

        if (fleetRes.status === "fulfilled" && fleetRes.value.ok) {
          const fleetData = await fleetRes.value.json();
          const apiVehicles = Array.isArray(fleetData) ? fleetData : (fleetData.vehicles || []);
          if (apiVehicles.length > 0) {
            const vMap = new Map();
            vList.forEach(v => vMap.set(v.id || v.registrationNumber, v));
            apiVehicles.forEach((v: any) => {
              if (!vMap.has(v.id || v.registrationNumber)) {
                vMap.set(v.id || v.registrationNumber, v);
              }
            });
            vList = Array.from(vMap.values());
            setAvailableVehicles(vList);
          }
        }

        if (drvRes.status === "fulfilled" && drvRes.value.ok) {
          const drvData = await drvRes.value.json();
          if (Array.isArray(drvData) && drvData.length > 0) {
            const dMap = new Map();
            dList.forEach(d => dMap.set(d.id || d.phone, d));
            drvData.forEach((d: any) => {
              if (!dMap.has(d.id || d.phone)) {
                dMap.set(d.id || d.phone, d);
              }
            });
            dList = Array.from(dMap.values());
            setAvailableDrivers(dList);
          }
        }

        if (bookingsRes.status === "fulfilled" && bookingsRes.value.ok) {
          const bData = await bookingsRes.value.json();
          const bList = Array.isArray(bData) ? bData : (bData.bookings || []);
          const activeOnly = bList.filter((b: any) => b.status !== "COMPLETED" && b.status !== "CANCELLED");
          setActiveBookings(activeOnly);
        }

        if (vList.length > 0 || dList.length > 0) {
          setDispatchForm(prev => ({
            ...prev,
            vehicleId: prev.vehicleId || (vList.find((v: any) => !getVehicleBusy(v))?.id || vList[0]?.id || ""),
            driverId: prev.driverId || (dList.find((d: any) => !getDriverBusy(d))?.id || dList[0]?.id || "")
          }));
        }
      } catch (err) {
        console.error("Live dispatch sync error:", err);
      }
    };

    syncLiveSources();

    // 4. Configure Filter & Vehicle defaults based on lead type
    if (lead) {
      setDispatchedSuccess(null);

      const req = extractLeadVehicleRequirements(lead);

      let initialCat = "ALL";
      let initialClass = "ALL";
      let preMatchedVehicle = null;

      if (req.isVehiclePreSelected) {
        if (req.category) initialCat = req.category;
        if (req.vehicleClass) initialClass = req.vehicleClass;

        preMatchedVehicle = vList.find((v) => {
          const catMatches = !req.category || (v.categoryName || "").toUpperCase() === req.category.toUpperCase();
          const classMatches = !req.vehicleClass || (v.vehicleClass || "").toLowerCase() === req.vehicleClass.toLowerCase();
          const modelMatches = !req.model || `${v.make} ${v.model}`.toLowerCase().includes(req.model.toLowerCase());
          return catMatches && (classMatches || modelMatches);
        });
      }

      setCategoryFilter(initialCat);
      setClassFilter(initialClass);

      // Default to an available (not busy) vehicle
      const availableVList = vList.filter((v: any) => !getVehicleBusy(v));
      const chosenVehId = (preMatchedVehicle && !getVehicleBusy(preMatchedVehicle))
        ? preMatchedVehicle.id
        : (availableVList[0]?.id || vList[0]?.id || "");

      // Default to an available (not busy) driver
      const availableDList = dList.filter((d: any) => !getDriverBusy(d));
      const chosenDrvId = availableDList[0]?.id || dList[0]?.id || "";

      const extractedDate = extractPickupDate(lead);
      const extractedTime = extractPickupTime(lead);
      const initialPickupDateTime = lead.pickupDateTime
        ? (lead.pickupDateTime.length === 16 ? lead.pickupDateTime : lead.pickupDateTime.slice(0, 16))
        : formatToDateTimeLocal(extractedDate, extractedTime);

      setDispatchForm({
        tripType: lead.serviceType || lead.tripType || "Pickup & Drop",
        vehicleId: chosenVehId,
        driverId: chosenDrvId,
        fare: "2800",
        advance: "500",
        paymentMode: "Cash Collection",
        pickupLocation: extractPickupLocation(lead),
        dropLocation: extractDropLocation(lead),
        pickupDateTime: initialPickupDateTime,
        notes: lead.notes || `Dispatched via Website Admin for ${lead.customerName || lead.name || "Customer"}`
      });
    }
  }, [isOpen, lead]);

  const filteredVehicles = useMemo(() => {
    return availableVehicles.filter((v) => {
      const matchesCat =
        categoryFilter === "ALL" ||
        (v.categoryName || "").toUpperCase() === categoryFilter.toUpperCase();

      const matchesClass =
        classFilter === "ALL" ||
        (v.vehicleClass || "").toLowerCase() === classFilter.toLowerCase();

      return matchesCat && matchesClass;
    });
  }, [availableVehicles, categoryFilter, classFilter]);

  const availableClassOptions = useMemo(() => {
    if (categoryFilter === "Sedan") return SEDAN_CLASSES;
    if (categoryFilter === "SUV") return SUV_CLASSES;
    return Array.from(new Set([...SEDAN_CLASSES, ...SUV_CLASSES]));
  }, [categoryFilter]);

  if (!isOpen || !lead) return null;

  const handleConfirmDispatch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    const assignedVeh = availableVehicles.find(v => v.id === dispatchForm.vehicleId) || filteredVehicles.find(v => !getVehicleBusy(v)) || availableVehicles[0];
    const assignedDrv = availableDrivers.find(d => d.id === dispatchForm.driverId) || availableDrivers.find(d => !getDriverBusy(d)) || availableDrivers[0];

    if (assignedVeh && getVehicleBusy(assignedVeh)) {
      const busy = getVehicleBusy(assignedVeh);
      alert(`Vehicle ${assignedVeh.registrationNumber} is already on active duty for ride #${busy?.bookingNumber}. Please select an available vehicle.`);
      return;
    }
    if (assignedDrv && getDriverBusy(assignedDrv)) {
      const busy = getDriverBusy(assignedDrv);
      alert(`Chauffeur ${assignedDrv.name} is already assigned to ride #${busy?.bookingNumber}. Please select an available chauffeur.`);
      return;
    }

    setIsSubmitting(true);
    const finalBookingRef = lead.bookingRef || lead.bookingNumber || (lead.id ? `TT-${lead.id.slice(-6).toUpperCase()}` : `TT-${Date.now().toString().slice(-6)}`);
    const finalTripType = dispatchForm.tripType || lead.serviceType || lead.tripType || "Pickup & Drop";
    
    let finalPickupDateTime = dispatchForm.pickupDateTime;
    if (finalPickupDateTime && !finalPickupDateTime.includes("Z") && !finalPickupDateTime.includes("+")) {
      const withSec = finalPickupDateTime.length === 16 ? `${finalPickupDateTime}:00` : finalPickupDateTime;
      finalPickupDateTime = `${withSec}+05:30`;
    }

    const dispatchedBooking = {
      id: `booking_${Date.now()}`,
      bookingNumber: finalBookingRef,
      type: finalTripType,
      status: "CONFIRMED",
      pickupLocation: dispatchForm.pickupLocation,
      dropLocation: dispatchForm.dropLocation,
      pickupDateTime: finalPickupDateTime,
      netAmount: dispatchForm.fare,
      totalAmount: dispatchForm.fare,
      advanceAmount: dispatchForm.advance,
      paymentMode: dispatchForm.paymentMode,
      notes: dispatchForm.notes,
      createdAt: new Date().toISOString(),
      customer: {
        name: lead.customerName || lead.contactName || lead.name || lead.companyName || "Customer Lead",
        phone: lead.phone || "",
        email: lead.email || ""
      },
      vehicleCategory: {
        name: assignedVeh?.categoryName || "Premium Fleet"
      },
      vehicle: {
        id: assignedVeh?.id,
        registrationNumber: assignedVeh?.registrationNumber,
        model: `${assignedVeh?.make || ""} ${assignedVeh?.model || ""}`.trim(),
        driver: {
          name: assignedDrv?.name,
          phone: assignedDrv?.phone
        }
      },
      payments: [
        {
          id: `pay_${Date.now()}`,
          status: Number(dispatchForm.advance) > 0 ? "SUCCESS" : "PENDING",
          gateway: dispatchForm.paymentMode,
          amount: dispatchForm.advance || "0"
        }
      ]
    };

    // Removed localStorage save for dispatch

    const { userName, panel } = getCurrentAdminUser("Admin Panel");
    const { updatedNotes } = createLeadStatusAuditLog({
      oldStatus: lead.status,
      newStatus: "CONVERTED",
      userName,
      panel,
      existingNotes: lead.notes,
    });

    const dispatchDetailsTag = [
      `[BookingRef: ${finalBookingRef}]`,
      `[TripType: ${finalTripType}]`,
      assignedVeh ? `[Vehicle: ${assignedVeh.make || ""} ${assignedVeh.model || ""} | ${assignedVeh.registrationNumber || ""}]` : null,
      assignedDrv ? `[AssignedDriver: ${assignedDrv.name || ""}|${assignedDrv.phone || ""}|${assignedDrv.id || ""}]` : null,
      finalPickupDateTime ? `[PickupTime: ${formattedSuccessPickupTime}]` : null,
    ].filter(Boolean).join(" ");

    const fullUpdatedNotes = [dispatchDetailsTag, updatedNotes].filter(Boolean).join("\n");
    const nowIso = new Date().toISOString();

    try {
      const crmStored = localStorage.getItem("user_uploaded_crm_leads");
      if (crmStored) {
        const crmList = JSON.parse(crmStored);
        if (Array.isArray(crmList)) {
          const updatedCRM = crmList.map((l: any) =>
            (l.id === lead.id || l.bookingRef === lead.bookingRef || (l.phone && lead.phone && l.phone === lead.phone))
              ? { 
                  ...l, 
                  status: "CONVERTED",
                  bookingRef: finalBookingRef,
                  tripType: finalTripType,
                  serviceType: finalTripType,
                  assignedVehicle: assignedVeh,
                  assignedDriver: assignedDrv,
                  vehicleModel: `${assignedVeh?.make || ""} ${assignedVeh?.model || ""}`.trim(),
                  vehicleRegistration: assignedVeh?.registrationNumber,
                  driverName: assignedDrv?.name,
                  driverPhone: assignedDrv?.phone,
                  pickupDateTime: finalPickupDateTime,
                  notes: fullUpdatedNotes,
                  lastChangedBy: userName,
                  lastChangedPanel: panel,
                  lastChangedAt: nowIso,
                  updatedAt: nowIso
                }
              : l
          );
          localStorage.setItem("user_uploaded_crm_leads", JSON.stringify(updatedCRM));
          window.dispatchEvent(new Event("crm_leads_updated"));
        }
      }
    } catch (e) {
      console.error(e);
    }

    try {
      await Promise.allSettled([
        fetch(`/api/rental/lead`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: lead.id, status: "CONVERTED", tripType: finalTripType, serviceType: finalTripType, notes: fullUpdatedNotes }),
        }),
        fetch(`/api/corporate/lead/${lead.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status: "CONVERTED", tripType: finalTripType, serviceType: finalTripType, notes: fullUpdatedNotes }),
        })
      ]);
    } catch (e) {}

    try {
      await fetch(`/api/bookings/dispatch`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          leadId: lead.id,
          vehicleId: assignedVeh?.id,
          driverId: assignedDrv?.id,
          fare: dispatchForm.fare,
          advance: dispatchForm.advance,
          paymentMode: dispatchForm.paymentMode,
          pickupLocation: dispatchForm.pickupLocation,
          dropLocation: dispatchForm.dropLocation,
          pickupDateTime: finalPickupDateTime,
          notes: fullUpdatedNotes,
          customerName: lead.customerName || lead.contactName || lead.name || lead.companyName || "Customer Lead",
          customerPhone: lead.phone,
          customerEmail: lead.email,
          tripType: finalTripType,
          bookingRef: finalBookingRef
        }),
      });
    } catch (e) {
      console.error("Backend dispatch error:", e);
    }

    if (onSuccess) onSuccess(dispatchedBooking);

    setIsSubmitting(false);
    setDispatchedSuccess({
      bookingRef: finalBookingRef,
      lead: lead,
      tripType: finalTripType,
      vehicle: assignedVeh,
      driver: assignedDrv,
      fare: dispatchForm.fare,
      advance: dispatchForm.advance,
      paymentMode: dispatchForm.paymentMode,
      pickupLocation: dispatchForm.pickupLocation,
      dropLocation: dispatchForm.dropLocation,
      pickupDateTime: finalPickupDateTime,
      notes: fullUpdatedNotes
    });
  };

  const formattedSuccessPickupTime = (() => {
    if (!dispatchedSuccess?.pickupDateTime) return "As Scheduled";
    try {
      const d = new Date(dispatchedSuccess.pickupDateTime);
      if (!isNaN(d.getTime())) {
        return d.toLocaleString("en-IN", {
          timeZone: "Asia/Kolkata",
          day: "2-digit",
          month: "short",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
          hour12: true
        });
      }
    } catch (e) {}
    return dispatchedSuccess.pickupDateTime;
  })();

  return (
    <Portal>
      <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
      <div className="bg-slate-900 border border-amber-500/40 rounded-3xl p-6 sm:p-8 w-full max-w-2xl shadow-2xl space-y-6 relative text-slate-100 max-h-[92vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-slate-400 hover:text-white cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {dispatchedSuccess ? (
          <div className="space-y-6 text-center py-2">
            <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center mx-auto">
              <Check className="w-8 h-8" />
            </div>
            <div>
              <h3 className="text-2xl font-black text-slate-50">Ride Dispatched Successfully!</h3>
              <p className="text-xs text-slate-400 mt-1">
                The lead is now confirmed and logged as an active booking in the dispatch network.
              </p>
            </div>

            {/* Official Booking PNR Ticket Banner */}
            <div className="bg-slate-950 p-5 rounded-2xl border border-amber-500/30 space-y-3 text-left">
              <div className="flex justify-between items-center border-b border-white/10 pb-3">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Official Booking PNR</span>
                <span className="text-xl font-black font-mono text-amber-400">{dispatchedSuccess.bookingRef}</span>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Customer</span>
                  <span className="font-bold text-slate-100">{dispatchedSuccess.lead?.customerName || dispatchedSuccess.lead?.name}</span>
                  <div className="text-[11px] font-mono text-slate-400">{dispatchedSuccess.lead?.phone}</div>
                </div>

                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Assigned Vehicle</span>
                  <span className="font-bold text-amber-400 font-mono">{dispatchedSuccess.vehicle?.registrationNumber}</span>
                  <div className="text-[11px] text-slate-300">{dispatchedSuccess.vehicle?.make} {dispatchedSuccess.vehicle?.model}</div>
                </div>

                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Chauffeur</span>
                  <span className="font-bold text-slate-100">{dispatchedSuccess.driver?.name}</span>
                  <div className="text-[11px] font-mono text-slate-400">+91 {dispatchedSuccess.driver?.phone}</div>
                </div>

                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Total Fare / Mode</span>
                  <span className="font-black text-emerald-400 font-mono text-sm">₹{dispatchedSuccess.fare}</span>
                  <div className="text-[10px] text-slate-400">{dispatchedSuccess.paymentMode}</div>
                </div>

                <div className="col-span-2 pt-2 border-t border-white/10 flex flex-wrap justify-between items-center text-xs">
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-bold">Pickup Date & Time</span>
                    <span className="font-semibold text-amber-400 font-mono">{formattedSuccessPickupTime}</span>
                  </div>
                  {dispatchedSuccess.pickupLocation && (
                    <div className="text-right max-w-[240px]">
                      <span className="text-slate-400 block text-[10px] uppercase font-bold">Pickup Hub</span>
                      <span className="text-slate-200 truncate block" title={dispatchedSuccess.pickupLocation}>{dispatchedSuccess.pickupLocation}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* 1-Click Action Buttons: WhatsApp Share & Dispatch View */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <a
                href={buildWhatsAppShareUrl({
                  customerName: dispatchedSuccess.lead?.customerName || dispatchedSuccess.lead?.name || dispatchedSuccess.lead?.contactName || dispatchedSuccess.lead?.companyName || "Valued Customer",
                  customerPhone: dispatchedSuccess.lead?.phone,
                  bookingRef: dispatchedSuccess.bookingRef,
                  bookingType: dispatchedSuccess.tripType,
                  tripType: dispatchedSuccess.tripType,
                  pickupDateTime: dispatchedSuccess.pickupDateTime,
                  pickupLocation: dispatchedSuccess.pickupLocation,
                  dropLocation: dispatchedSuccess.dropLocation,
                  vehicleMake: dispatchedSuccess.vehicle?.make,
                  vehicleModel: dispatchedSuccess.vehicle?.model,
                  vehicleRegistration: dispatchedSuccess.vehicle?.registrationNumber,
                  driverName: dispatchedSuccess.driver?.name,
                  driverPhone: dispatchedSuccess.driver?.phone,
                  notes: dispatchedSuccess.notes,
                })}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white font-black py-2.5 px-4 rounded-xl text-xs uppercase tracking-wider shadow-lg transition-all cursor-pointer"
              >
                <Share2 className="w-4 h-4" />
                <span>Share On WhatsApp</span>
              </a>

              <button
                type="button"
                onClick={onClose}
                className="flex items-center justify-center gap-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black py-2.5 px-4 rounded-xl text-xs uppercase tracking-wider shadow-lg transition-all cursor-pointer"
              >
                <span>Done & Return to Leads</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        ) : (
          <>
            <div className="space-y-1 border-b border-white/10 pb-4">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold uppercase text-amber-400 tracking-wider">
                  Website Admin Dispatch Desk
                </span>
                <span className="text-[10px] font-mono text-slate-400 bg-slate-950 px-2 py-0.5 rounded border border-white/10 font-bold">
                  {lead.bookingRef || lead.bookingNumber || "NEW-LEAD"}
                </span>
              </div>
              <h3 className="text-xl sm:text-2xl font-black text-slate-50">
                Dispatch Ride & Assign Chauffeur
              </h3>
              <p className="text-xs text-slate-400">
                Assign an active vehicle from your Fleet Roster and a Chauffeur to confirm this customer booking.
              </p>
            </div>

            <form onSubmit={handleConfirmDispatch} className="space-y-5">
              {/* Customer Lead Summary */}
              <div className="bg-slate-950 p-4 rounded-2xl border border-white/10 space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                  <div>
                    <span className="text-[10px] text-slate-400 block uppercase font-bold">Customer</span>
                    <span className="font-bold text-slate-100 text-sm">{lead.customerName || lead.name}</span>
                    <div className="text-slate-400 font-mono text-[11px]">{lead.phone}</div>
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-400 block uppercase font-bold mb-1">
                      Trip / Booking Type *
                    </label>
                    <select
                      value={dispatchForm.tripType}
                      onChange={(e) => setDispatchForm((prev) => ({ ...prev, tripType: e.target.value }))}
                      className="w-full bg-slate-900 border border-amber-500/40 rounded-lg px-2 py-1 text-xs font-bold text-amber-300 focus:outline-none focus:border-amber-400 cursor-pointer"
                    >
                      <option value="Pickup & Drop">Pickup & Drop</option>
                      <option value="Point to Point">Point to Point</option>
                      <option value="Local Rental">Local Rental</option>
                      <option value="Outstation">Outstation</option>
                    </select>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block uppercase font-bold">Lead Ingested</span>
                    <span className="text-slate-300 font-mono">{lead.createdAt?.slice(0, 10) || "Today"}</span>
                  </div>
                </div>

                {/* Show Vehicle Requirement Badge ONLY if specified in lead (Local Rental / Outstation) */}
                {leadVehReq.isVehiclePreSelected ? (
                  <div className="pt-2 border-t border-white/5 flex flex-wrap items-center gap-2 text-xs">
                    <span className="text-[10px] font-bold uppercase text-amber-400 tracking-wider flex items-center gap-1">
                      <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                      <span>Customer Selected Vehicle:</span>
                    </span>
                    {leadVehReq.category && (
                      <span className="px-2 py-0.5 rounded-md bg-amber-500/10 border border-amber-500/30 text-amber-300 font-bold text-[11px]">
                        Category: {leadVehReq.category}
                      </span>
                    )}
                    {leadVehReq.vehicleClass && (
                      <span className="px-2 py-0.5 rounded-md bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 font-bold text-[11px]">
                        Class: {leadVehReq.vehicleClass}
                      </span>
                    )}
                    {leadVehReq.model && (
                      <span className="px-2 py-0.5 rounded-md bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 font-bold text-[11px]">
                        Model: {leadVehReq.model}
                      </span>
                    )}
                  </div>
                ) : null}

                {/* Warning if lead is already marked WON / DISPATCHED */}
                {(lead.status === "WON" || lead.status === "CONVERTED" || lead.status === "COMPLETED") && (
                  <div className="mt-3 p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-200 text-xs flex items-start gap-2.5">
                    <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-extrabold uppercase tracking-wider block text-amber-300">Caution: Lead Already Dispatched ({lead.status})</span>
                      <p className="text-[11px] text-slate-300 mt-0.5">
                        This lead is already converted. Dispatching again will assign another chauffeur/car and create an additional booking record.
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Assignment Controls: Vehicle Filter (Category & Class) & Chauffeur */}
              <div className="space-y-3 bg-slate-950/60 p-4 rounded-2xl border border-white/5">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                  <span className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                    <Filter className="w-4 h-4 text-amber-400" />
                    <span>Filter Fleet for Dispatch</span>
                  </span>
                  <span className="text-[11px] text-slate-400">
                    Ready for Duty: <strong className="text-emerald-400">{filteredVehicles.filter(v => !getVehicleBusy(v)).length}</strong> of {filteredVehicles.length} vehicle(s)
                  </span>
                </div>

                {/* Category & Class Selection Buttons */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      Vehicle Category
                    </label>
                    <div className="grid grid-cols-3 gap-1.5">
                      {["ALL", "Sedan", "SUV"].map((cat) => (
                        <button
                          key={cat}
                          type="button"
                          onClick={() => {
                            setCategoryFilter(cat);
                            setClassFilter("ALL");
                          }}
                          className={`py-1.5 px-2 rounded-lg text-xs font-bold transition-all cursor-pointer border ${
                            categoryFilter.toUpperCase() === cat.toUpperCase()
                              ? "bg-amber-500 text-slate-950 border-amber-400 font-black shadow-md shadow-amber-500/10"
                              : "bg-slate-900 text-slate-400 border-white/10 hover:text-slate-200"
                          }`}
                        >
                          {cat}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      Vehicle Class
                    </label>
                    <select
                      value={classFilter}
                      onChange={(e) => setClassFilter(e.target.value)}
                      className="w-full bg-slate-900 border border-white/10 rounded-lg p-2 text-xs text-slate-100 focus:outline-none focus:border-amber-400 cursor-pointer"
                    >
                      <option value="ALL">All Vehicle Classes</option>
                      {availableClassOptions.map((cls) => (
                        <option key={cls} value={cls}>
                          {cls}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Vehicle & Chauffeur Dropdowns with Duty Status */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-white/5">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                      <Car className="w-4 h-4 text-amber-400" />
                      <span>Select Fleet Vehicle *</span>
                    </label>
                    <select
                      value={dispatchForm.vehicleId}
                      onChange={(e) => setDispatchForm({ ...dispatchForm, vehicleId: e.target.value })}
                      required
                      className="w-full bg-slate-950 border border-white/10 rounded-xl p-3 text-xs text-slate-100 focus:outline-none focus:border-amber-400 font-mono cursor-pointer"
                    >
                      <option value="" disabled>- Select Fleet Vehicle -</option>
                      {filteredVehicles.filter(v => !getVehicleBusy(v)).length > 0 && (
                        <optgroup label="Available Fleet (Ready for Dispatch)">
                          {filteredVehicles.filter(v => !getVehicleBusy(v)).map((veh) => (
                            <option key={veh.id} value={veh.id} className="bg-slate-900 text-emerald-300">
                              ✓ {veh.make} {veh.model} ({veh.registrationNumber}) • {veh.categoryName || "Sedan"}
                            </option>
                          ))}
                        </optgroup>
                      )}
                      {filteredVehicles.filter(v => getVehicleBusy(v)).length > 0 && (
                        <optgroup label="Currently Assigned / On Duty (Disabled)">
                          {filteredVehicles.filter(v => getVehicleBusy(v)).map((veh) => {
                            const busy = getVehicleBusy(veh);
                            return (
                              <option key={veh.id} value={veh.id} disabled className="bg-slate-950 text-slate-500">
                                ⛔ [ON DUTY - Ride #{busy?.bookingNumber}] {veh.make} {veh.model} ({veh.registrationNumber})
                              </option>
                            );
                          })}
                        </optgroup>
                      )}
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                      <UserCheck className="w-4 h-4 text-amber-400" />
                      <span>Select Chauffeur / Driver *</span>
                    </label>
                    <select
                      value={dispatchForm.driverId}
                      onChange={(e) => setDispatchForm({ ...dispatchForm, driverId: e.target.value })}
                      required
                      className="w-full bg-slate-950 border border-white/10 rounded-xl p-3 text-xs text-slate-100 focus:outline-none focus:border-amber-400 font-mono cursor-pointer"
                    >
                      <option value="" disabled>- Select Assigned Chauffeur -</option>
                      {availableDrivers.filter(d => !getDriverBusy(d)).length > 0 && (
                        <optgroup label="Available Chauffeurs (Ready for Duty)">
                          {availableDrivers.filter(d => !getDriverBusy(d)).map((drv) => {
                            const selectedVeh = availableVehicles.find(v => v.id === dispatchForm.vehicleId);
                            const isCarDefault = selectedVeh?.driver?.id === drv.id;
                            return (
                              <option key={drv.id} value={drv.id} className="bg-slate-900 text-emerald-300">
                                ✓ {drv.name} (+91 {drv.phone}) {isCarDefault ? "★ [Default for Car]" : ""}
                              </option>
                            );
                          })}
                        </optgroup>
                      )}
                      {availableDrivers.filter(d => getDriverBusy(d)).length > 0 && (
                        <optgroup label="Currently Assigned / On Duty (Disabled)">
                          {availableDrivers.filter(d => getDriverBusy(d)).map((drv) => {
                            const busy = getDriverBusy(drv);
                            return (
                              <option key={drv.id} value={drv.id} disabled className="bg-slate-950 text-slate-500">
                                ⛔ [ON DUTY - Car {busy?.vehicleReg} • Ride #{busy?.bookingNumber}] {drv.name}
                              </option>
                            );
                          })}
                        </optgroup>
                      )}
                    </select>
                  </div>
                </div>

                <div className="p-2.5 rounded-xl bg-slate-900/80 border border-white/5 text-[11px] text-slate-400 flex items-center gap-2">
                  <span>💡 <strong>Independent Allocation:</strong> You can assign any available chauffeur to any vehicle. If the car&apos;s regular driver is on holiday or unavailable, simply choose any other available chauffeur.</span>
                </div>
              </div>

              {/* Commercials: Fare & Payment */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-300">Agreed Trip Fare (₹) *</label>
                  <div className="relative">
                    <IndianRupee className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="number"
                      required
                      value={dispatchForm.fare}
                      onChange={(e) => setDispatchForm({ ...dispatchForm, fare: e.target.value })}
                      className="w-full bg-slate-950 border border-white/10 rounded-xl pl-8 pr-3 py-2.5 text-xs text-slate-100 focus:outline-none focus:border-amber-400 font-mono font-bold"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-300">Advance Collected (₹)</label>
                  <div className="relative">
                    <IndianRupee className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="number"
                      value={dispatchForm.advance}
                      onChange={(e) => setDispatchForm({ ...dispatchForm, advance: e.target.value })}
                      className="w-full bg-slate-950 border border-white/10 rounded-xl pl-8 pr-3 py-2.5 text-xs text-slate-100 focus:outline-none focus:border-amber-400 font-mono"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-300">Payment Collection Mode</label>
                  <select
                    value={dispatchForm.paymentMode}
                    onChange={(e) => setDispatchForm({ ...dispatchForm, paymentMode: e.target.value })}
                    className="w-full bg-slate-950 border border-white/10 rounded-xl p-2.5 text-xs text-slate-100 focus:outline-none focus:border-amber-400 cursor-pointer"
                  >
                    <option value="Cash Collection">Driver Cash Collection</option>
                    <option value="UPI / QR Code">UPI / QR Code Scan</option>
                    <option value="Razorpay Online Link">Razorpay Payment Link</option>
                    <option value="NEFT / Bank Transfer">Bank NEFT Transfer</option>
                    <option value="Post-Trip Bill">Corporate Billing / Post-Trip</option>
                  </select>
                </div>
              </div>

              {/* Route & Schedule Confirmation with Live Location Search */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-300 flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-amber-400" />
                    <span>Pickup Location *</span>
                  </label>
                  <LocationInput
                    value={dispatchForm.pickupLocation}
                    onChange={(val) => setDispatchForm(prev => ({ ...prev, pickupLocation: val }))}
                    placeholder="Search pickup location, airport, landmark..."
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-300 flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-amber-400" />
                    <span>Drop Location / Destination</span>
                  </label>
                  <LocationInput
                    value={dispatchForm.dropLocation}
                    onChange={(val) => setDispatchForm(prev => ({ ...prev, dropLocation: val }))}
                    placeholder="Search drop location or transit hub..."
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300">Special Dispatcher Instructions</label>
                <textarea
                  rows={2}
                  value={dispatchForm.notes}
                  onChange={(e) => setDispatchForm({ ...dispatchForm, notes: e.target.value })}
                  placeholder="e.g. Provide bottle water, verify flight timing, etc."
                  className="w-full bg-slate-950 border border-white/10 rounded-xl p-2.5 text-xs text-slate-100 focus:outline-none focus:border-amber-400 resize-none"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-white/10">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 bg-slate-950 border border-white/10 text-slate-400 hover:text-white rounded-xl text-xs font-bold transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex items-center gap-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 disabled:opacity-60 disabled:cursor-not-allowed text-slate-950 font-black px-6 py-2.5 rounded-xl text-xs uppercase tracking-wider shadow-lg shadow-amber-500/20 cursor-pointer transition-all"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin text-slate-950" />
                      <span>Dispatching & Generating PNR...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Confirm Dispatch & Generate PNR</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
    </Portal>
  );
}
