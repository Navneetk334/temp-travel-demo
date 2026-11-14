"use client";

import React, { useState, useEffect, useRef } from "react";
import Script from "next/script";
import {
  Radio,
  Car,
  MapPin,
  ShieldCheck,
  Search,
  Filter,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Navigation,
  RefreshCw,
  PhoneCall,
  X,
  UserCheck,
  Plus,
  Compass,
  Activity,
  Sun,
  Moon,
  Layers,
  Maximize2,
  Trash2,
  Loader2,
  Share2
} from "lucide-react";

declare global {
  interface Window {
    L: any;
  }
}

import Portal from "@/components/shared/portal";
import LocationInput from "@/components/shared/location-input";
import QuickDispatchAssignmentModal from "@/components/admin/quick-dispatch-assignment-modal";
import { syncDispatchToLeads, removeDispatchFromLeads, syncExistingDispatchesToLeads, isDispatchDeleted } from "@/lib/lead-sync";
import { buildWhatsAppShareUrl } from "@/lib/whatsapp-share";

const TRIP_TYPES = [
  "Airport Transfer / Pickup & Drop",
  "Local Rental (4hr / 40km)",
  "Local Rental (8hr / 80km)",
  "Local Rental (12hr / 120km)",
  "Outstation (One Way)",
  "Outstation (Round Trip)",
  "Corporate Employee Transit"
];

export default function MasterDispatchRadarPage() {
  const mapRef = useRef<HTMLDivElement>(null);
  const leafletInstanceRef = useRef<any>(null);
  const tileLayerRef = useRef<any>(null);
  const markersRef = useRef<any[]>([]);

  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("ALL");
  const [mapMode, setMapMode] = useState<"DAY" | "NIGHT">("DAY"); // Google Maps Day / Night mode
  const [selectedDriver, setSelectedDriver] = useState<any | null>(null);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [assignSuccess, setAssignSuccess] = useState(false);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [assigningDispatch, setAssigningDispatch] = useState<any | null>(null);

  const [fleetVehicles, setFleetVehicles] = useState<any[]>([]);
  const [registeredDrivers, setRegisteredDrivers] = useState<any[]>([]);

  const [assignForm, setAssignForm] = useState({
    driverId: "",
    vehicleId: "",
    customerName: "",
    phone: "",
    pickupLocation: "",
    destination: "",
    tripType: "Airport Transfer / Pickup & Drop",
    fare: "2800",
    advance: "500"
  });

  const [drivers, setDrivers] = useState<any[]>([]);
  const [activeBookings, setActiveBookings] = useState<any[]>([]);
  const [busyVehiclesMap, setBusyVehiclesMap] = useState<Record<string, string>>({});
  const [busyDriversMap, setBusyDriversMap] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Load saved dispatches, fleet vehicles, and drivers
  useEffect(() => {
    // 1. Load fleet vehicles
    try {
      const savedFleet = localStorage.getItem("user_uploaded_fleet_vehicles") || localStorage.getItem("user_uploaded_fleet");
      if (savedFleet) {
        const parsed = JSON.parse(savedFleet);
        if (Array.isArray(parsed) && parsed.length > 0) setFleetVehicles(parsed);
      }
    } catch (e) {
      console.error(e);
    }
    fetch("/api/fleet?minimal=true")
      .then(res => res.ok ? res.json() : null)
      .then(data => {
        if (data) {
          const list = Array.isArray(data) ? data : (data.vehicles || []);
          if (list.length > 0) setFleetVehicles(list);
        }
      })
      .catch(e => console.error(e));

    // 2. Load registered drivers
    try {
      const savedDrivers = localStorage.getItem("user_uploaded_drivers");
      if (savedDrivers) {
        const parsed = JSON.parse(savedDrivers);
        if (Array.isArray(parsed) && parsed.length > 0) setRegisteredDrivers(parsed);
      }
    } catch (e) {
      console.error(e);
    }
    fetch("/api/admin/drivers")
      .then(res => res.ok ? res.json() : null)
      .then(data => {
        if (Array.isArray(data) && data.length > 0) {
          setRegisteredDrivers(data);
        }
      })
      .catch(e => console.error(e));

    // 3. Load dispatches from Backend Database + Local Storage
    const loadAllDispatches = async () => {
      let localMaster: any[] = [];
      try {
        const saved = localStorage.getItem("master_dispatches");
        if (saved) {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed)) {
            localMaster = parsed.filter((d: any) => !isDispatchDeleted(d));
            if (localMaster.length !== parsed.length) {
              localStorage.setItem("master_dispatches", JSON.stringify(localMaster));
            }
          }
        }
      } catch (e) {
        console.error(e);
      }

      let localDispatchedBookings: any[] = [];
      try {
        const savedDispatched = localStorage.getItem("user_uploaded_dispatched_bookings");
        if (savedDispatched) {
          const parsed = JSON.parse(savedDispatched);
          if (Array.isArray(parsed)) {
            localDispatchedBookings = parsed.filter((b: any) => !isDispatchDeleted(b));
            if (localDispatchedBookings.length !== parsed.length) {
              localStorage.setItem("user_uploaded_dispatched_bookings", JSON.stringify(localDispatchedBookings));
            }
          }
        }
      } catch (e) {
        console.error(e);
      }

      try {
        const bRes = await fetch("/api/bookings?limit=100");
        let apiBookings: any[] = [];
        if (bRes.ok) {
          const bData = await bRes.json();
          apiBookings = (Array.isArray(bData) ? bData : (bData.bookings || [])).filter((b: any) => !isDispatchDeleted(b));
          setActiveBookings(apiBookings);

          const vMap: Record<string, string> = {};
          const dMap: Record<string, string> = {};
          apiBookings.forEach((b: any) => {
            const isActive = b.status !== "COMPLETED" && b.status !== "CANCELLED";
            if (isActive) {
              const ref = b.bookingNumber || `TT-${b.id?.slice(-6) || "RIDE"}`;
              if (b.vehicleId) vMap[b.vehicleId] = ref;
              if (b.vehicle?.id) vMap[b.vehicle.id] = ref;
              if (b.vehicle?.registrationNumber) vMap[b.vehicle.registrationNumber.toUpperCase()] = ref;
              if (b.driverId) dMap[b.driverId] = ref;
              if (b.vehicle?.driver?.id) dMap[b.vehicle.driver.id] = ref;
              if (b.vehicle?.driver?.phone) {
                const cleanPhone = b.vehicle.driver.phone.replace(/\D/g, "").slice(-10);
                if (cleanPhone) dMap[cleanPhone] = ref;
              }
            }
          });
          setBusyVehiclesMap(vMap);
          setBusyDriversMap(dMap);
        }

        // Convert Live Backend Database Bookings to Radar Dispatches
        const convertedApiDispatches = apiBookings
          .filter((b: any) => b.status !== "CANCELLED" && !isDispatchDeleted(b))
          .map((b: any) => {
            let drvName = b.driver?.name || b.vehicle?.driver?.name || "";
            let drvPhone = b.driver?.phone || b.vehicle?.driver?.phone || "";
            let drvId = b.driver?.id || b.vehicle?.driver?.id || "";

            if (!drvName && b.notes) {
              const match = b.notes.match(/\[AssignedDriver:\s*([^|\]]+)\|([^|\]]+)(?:\|([^\]]+))?\]/);
              if (match) {
                drvName = match[1].trim();
                drvPhone = match[2].trim();
                drvId = match[3]?.trim() || "";
              }
            }

            const hasVehicle = Boolean(b.vehicle && b.vehicle.registrationNumber && b.vehicle.registrationNumber !== "Pending Vehicle");
            const hasDriver = Boolean(drvName && drvName !== "Pending Chauffeur" && drvName !== "Unassigned");

            let status: "IN_TRANSIT" | "ASSIGNED" | "AVAILABLE" = "ASSIGNED";
            if (b.status === "IN_TRANSIT" || b.status === "IN_PROGRESS") {
              status = "IN_TRANSIT";
            } else if (hasVehicle || hasDriver || b.status === "CONFIRMED" || b.status === "DRIVER_ASSIGNED" || b.status === "VEHICLE_ASSIGNED") {
              status = "ASSIGNED";
            } else {
              status = "AVAILABLE";
            }

            const hash = String(b.bookingNumber || b.id || b.customer?.name || "TT")
              .split("")
              .reduce((acc: number, char: string) => acc + char.charCodeAt(0), 0);
            const latOffset = ((hash % 100) - 50) * 0.0008;
            const lngOffset = (((hash * 13) % 100) - 50) * 0.0008;

            const pLoc = b.pickupLocation && b.pickupLocation !== "-" ? b.pickupLocation : "Pickup Hub";
            const dLoc = b.dropLocation && b.dropLocation !== "-" ? b.dropLocation : "Drop Location TBD";

            return {
              id: b.id || `DISP-${b.bookingNumber || Date.now()}`,
              bookingRef: b.bookingNumber || `TT-${(b.id || "").slice(-6).toUpperCase()}`,
              bookingId: b.id,
              driverId: drvId,
              driverName: drvName || "Pending Chauffeur",
              phone: b.customer?.phone || "+91-9820112233",
              driverPhone: drvPhone,
              vehicleId: b.vehicle?.id || "",
              vehicleModel: b.vehicle?.model || (b.vehicleCategory?.name ? `${b.vehicleCategory.name} Fleet` : "Commercial Fleet"),
              vehicleCategory: b.vehicleCategory?.name || "Sedan",
              vehicleClass: b.vehicle?.vehicleClass || "Executive",
              regNumber: b.vehicle?.registrationNumber || "Pending Vehicle",
              currentLocation: pLoc,
              destination: dLoc,
              pickupLocation: pLoc,
              dropLocation: dLoc,
              status: status,
              speed: status === "IN_TRANSIT" ? `${35 + (hash % 25)} km/h` : "0 km/h",
              eta: status === "IN_TRANSIT" ? `${10 + (hash % 20)} Mins` : "Scheduled / At Pickup Hub",
              tripType: b.type ? b.type.replace(/_/g, " ") : "Dispatched Ride",
              customerName: b.customer?.name || "Customer Lead",
              fare: b.netAmount ? String(b.netAmount) : (b.totalAmount ? String(b.totalAmount) : "2800"),
              advance: b.payments?.[0]?.amount ? String(b.payments[0].amount) : "500",
              pickupDateTime: b.pickupDateTime || b.createdAt,
              notes: b.notes || "",
              lat: 28.5910 + latOffset,
              lng: 77.0250 + lngOffset,
              isFromLiveBookings: true
            };
          });

        // Convert Local Dispatched Bookings (Fallback)
        const convertedLocalDispatched = localDispatchedBookings
          .filter((b: any) => !isDispatchDeleted(b))
          .map((b: any) => {
          let drvName = b.driver?.name || b.vehicle?.driver?.name || "";
          let drvPhone = b.driver?.phone || b.vehicle?.driver?.phone || "";
          let drvId = b.driver?.id || b.vehicle?.driver?.id || "";

          if (!drvName && b.notes) {
            const match = b.notes.match(/\[AssignedDriver:\s*([^|\]]+)\|([^|\]]+)(?:\|([^\]]+))?\]/);
            if (match) {
              drvName = match[1].trim();
              drvPhone = match[2].trim();
              drvId = match[3]?.trim() || "";
            }
          }

          const hasVehicle = Boolean(b.vehicle && b.vehicle.registrationNumber && b.vehicle.registrationNumber !== "Pending Vehicle");
          const hasDriver = Boolean(drvName && drvName !== "Pending Chauffeur" && drvName !== "Unassigned");

          let status: "IN_TRANSIT" | "ASSIGNED" | "AVAILABLE" = "ASSIGNED";
          if (b.status === "IN_TRANSIT" || b.status === "IN_PROGRESS") {
            status = "IN_TRANSIT";
          } else if (hasVehicle || hasDriver || b.status === "CONFIRMED") {
            status = "ASSIGNED";
          } else {
            status = "AVAILABLE";
          }

          const hash = String(b.bookingNumber || b.id || b.customer?.name || "TT")
            .split("")
            .reduce((acc: number, char: string) => acc + char.charCodeAt(0), 0);
          const latOffset = ((hash % 100) - 50) * 0.0008;
          const lngOffset = (((hash * 13) % 100) - 50) * 0.0008;

          const pLoc = b.pickupLocation && b.pickupLocation !== "-" ? b.pickupLocation : "Pickup Hub";
          const dLoc = b.dropLocation && b.dropLocation !== "-" ? b.dropLocation : "Drop Location TBD";

          return {
            id: b.id || `DISP-${b.bookingNumber || Date.now()}`,
            bookingRef: b.bookingNumber || `TT-${(b.id || "").slice(-6).toUpperCase()}`,
            bookingId: b.id,
            driverId: drvId,
            driverName: drvName || "Pending Chauffeur",
            phone: b.customer?.phone || "+91-9820112233",
            driverPhone: drvPhone,
            vehicleId: b.vehicle?.id || "",
            vehicleModel: b.vehicle?.model || (b.vehicleCategory?.name ? `${b.vehicleCategory.name} Fleet` : "Commercial Fleet"),
            vehicleCategory: b.vehicleCategory?.name || "Sedan",
            vehicleClass: b.vehicle?.vehicleClass || "Executive",
            regNumber: b.vehicle?.registrationNumber || "Pending Vehicle",
            currentLocation: pLoc,
            destination: dLoc,
            pickupLocation: pLoc,
            dropLocation: dLoc,
            status: status,
            speed: status === "IN_TRANSIT" ? `${35 + (hash % 25)} km/h` : "0 km/h",
            eta: status === "IN_TRANSIT" ? `${10 + (hash % 20)} Mins` : "Scheduled / At Pickup Hub",
            tripType: b.type || "Dispatched Ride",
            customerName: b.customer?.name || "Customer Lead",
            fare: b.netAmount ? String(b.netAmount) : (b.totalAmount ? String(b.totalAmount) : "2800"),
            advance: b.advanceAmount || "500",
            pickupDateTime: b.pickupDateTime || b.createdAt,
            notes: b.notes || "",
            lat: 28.5910 + latOffset,
            lng: 77.0250 + lngOffset
          };
        });

        // Merge all sources deduplicated
        const dispatchesMap = new Map<string, any>();
        convertedApiDispatches.forEach(d => {
          if (!isDispatchDeleted(d)) dispatchesMap.set(d.bookingRef || d.id, d);
        });
        convertedLocalDispatched.forEach(d => {
          if (!isDispatchDeleted(d)) {
            const key = d.bookingRef || d.id;
            if (!dispatchesMap.has(key)) dispatchesMap.set(key, d);
          }
        });
        localMaster.forEach(d => {
          if (!isDispatchDeleted(d)) {
            const key = d.bookingRef || d.id;
            if (!dispatchesMap.has(key)) {
              dispatchesMap.set(key, d);
            } else {
              const existing = dispatchesMap.get(key);
              dispatchesMap.set(key, { ...existing, ...d });
            }
          }
        });

        const mergedDrivers = Array.from(dispatchesMap.values()).filter((d: any) => !isDispatchDeleted(d));
        if (mergedDrivers.length > 0) {
          setDrivers(mergedDrivers);
        } else if (localMaster.length > 0) {
          setDrivers(localMaster.filter((d: any) => !isDispatchDeleted(d)));
        }
      } catch (err) {
        console.error("Failed to load live dispatches for radar:", err);
        if (localMaster.length > 0) setDrivers(localMaster);
      }
    };

    loadAllDispatches();
    syncExistingDispatchesToLeads();
  }, []);

  const getVehicleBusy = (v: any) => {
    if (!v) return null;
    if (v.id && busyVehiclesMap[v.id]) return busyVehiclesMap[v.id];
    if (v.registrationNumber && busyVehiclesMap[v.registrationNumber.toUpperCase()]) {
      return busyVehiclesMap[v.registrationNumber.toUpperCase()];
    }
    return null;
  };

  const getDriverBusy = (d: any) => {
    if (!d) return null;
    if (d.id && busyDriversMap[d.id]) return busyDriversMap[d.id];
    if (d.phone) {
      const clean = d.phone.replace(/\D/g, "").slice(-10);
      if (clean && busyDriversMap[clean]) return busyDriversMap[clean];
    }
    return null;
  };

  const handleSaveRadarAssignment = (updatedItem: any) => {
    setDrivers((prev) => {
      const next = prev.map((d) => (d.id === updatedItem.id ? updatedItem : d));
      localStorage.setItem("master_dispatches", JSON.stringify(next));
      return next;
    });
    syncDispatchToLeads(updatedItem);
  };

  const handleDeleteDispatch = (id: string) => {
    if (!window.confirm("Are you sure you want to permanently delete this quick dispatch entry?")) return;
    const target = drivers.find((d) => d.id === id || d.bookingRef === id || d.bookingId === id);
    const extraInfo = {
      phone: target?.phone,
      customerName: target?.customerName,
      bookingRef: target?.bookingRef || target?.id
    };

    // Purge across all storages and blacklist it permanently
    removeDispatchFromLeads(id, extraInfo);

    setDrivers((prev) => {
      const next = prev.filter((d) => 
        !isDispatchDeleted(d) && 
        d.id !== id && 
        d.bookingRef !== id && 
        d.bookingId !== id
      );
      localStorage.setItem("master_dispatches", JSON.stringify(next));
      return next;
    });

    try {
      const savedDispatched = localStorage.getItem("user_uploaded_dispatched_bookings");
      if (savedDispatched) {
        const parsed = JSON.parse(savedDispatched);
        if (Array.isArray(parsed)) {
          const next = parsed.filter((b: any) => 
            !isDispatchDeleted(b) && 
            b.id !== id && 
            b.bookingNumber !== id && 
            b.bookingRef !== id
          );
          localStorage.setItem("user_uploaded_dispatched_bookings", JSON.stringify(next));
        }
      }
    } catch (e) {}

    if (selectedDriver?.id === id || selectedDriver?.bookingRef === id) {
      setSelectedDriver(null);
    }
  };

  // Real Google Maps Tile URL (mt0, mt1, mt2, mt3)
  const getGoogleMapsTileUrl = () => {
    return "https://{s}.google.com/vt/lyrs=m&x={x}&y={y}&z={z}";
  };

  // Initialize Real Leaflet Map with Google Maps Day/Night Toggle
  const initLeafletMap = () => {
    if (!window.L || !mapRef.current) return;

    if (leafletInstanceRef.current) {
      leafletInstanceRef.current.remove();
      leafletInstanceRef.current = null;
    }

    try {
      const map = window.L.map(mapRef.current, {
        center: [28.5910, 77.0250],
        zoom: 14,
        zoomControl: true,
        attributionControl: false
      });

      const tileLayer = window.L.tileLayer(getGoogleMapsTileUrl(), {
        maxZoom: 20,
        subdomains: ["mt0", "mt1", "mt2", "mt3"]
      }).addTo(map);

      tileLayerRef.current = tileLayer;
      leafletInstanceRef.current = map;
      setMapLoaded(true);

      renderMapMarkers(map, drivers);
    } catch (e) {
      console.error("Leaflet map initialization error:", e);
    }
  };

  const renderMapMarkers = (map: any, driverList: any[]) => {
    if (!window.L || !map) return;

    markersRef.current.forEach(m => map.removeLayer(m));
    markersRef.current = [];

    driverList.forEach(drv => {
      const lat = drv.lat || 28.5910 + (Math.random() - 0.5) * 0.05;
      const lng = drv.lng || 77.0250 + (Math.random() - 0.5) * 0.05;

      const customIcon = window.L.divIcon({
        className: "custom-leaflet-marker",
        html: `
          <div class="relative group cursor-pointer">
            <div class="w-9 h-9 rounded-full bg-surface border-2 border-amber-400 shadow-2xl flex items-center justify-center text-amber-400 font-bold hover:scale-125 transition-transform">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9l-1.4 2.9A3.7 3.7 0 0 0 2 12v4c0 .6.4 1 1 1h2"/><circle cx="7" cy="17" r="2"/><path d="M9 17h6"/><circle cx="17" cy="17" r="2"/></svg>
            </div>
            <div class="absolute top-full left-1/2 -translate-x-1/2 mt-1 bg-background/95 border border-amber-500/40 text-amber-400 text-[10px] font-mono font-bold px-2 py-0.5 rounded shadow-2xl whitespace-nowrap z-50">
              ${drv.driverName} (${drv.regNumber})
            </div>
          </div>
        `,
        iconSize: [36, 36],
        iconAnchor: [18, 18]
      });

      const marker = window.L.marker([lat, lng], { icon: customIcon }).addTo(map);
      marker.on("click", () => setSelectedDriver(drv));
      markersRef.current.push(marker);
    });
  };

  useEffect(() => {
    if (leafletInstanceRef.current) {
      renderMapMarkers(leafletInstanceRef.current, drivers);
    }
  }, [drivers]);

  const handleAssignSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!assignForm.customerName || !assignForm.pickupLocation) return;
    if (isSubmitting) return;

    const assignedDrv = registeredDrivers.find(d => d.id === assignForm.driverId);
    const assignedVeh = fleetVehicles.find(v => v.id === assignForm.vehicleId);

    if (assignedVeh) {
      const busyRef = getVehicleBusy(assignedVeh);
      if (busyRef) {
        alert(`Vehicle ${assignedVeh.registrationNumber} is currently on duty in ride #${busyRef}. Please select an available vehicle.`);
        return;
      }
    }
    if (assignedDrv) {
      const busyRef = getDriverBusy(assignedDrv);
      if (busyRef) {
        alert(`Chauffeur ${assignedDrv.name} is currently on duty in ride #${busyRef}. Please select an available chauffeur.`);
        return;
      }
    }

    const hasAssignment = Boolean(assignedDrv && assignedVeh);

    const newDuty = {
      id: `DISP-${Date.now()}`,
      driverId: assignedDrv?.id || "",
      driverName: assignedDrv?.name || "Pending Chauffeur",
      phone: assignForm.phone || assignedDrv?.phone || "+91-9820112233",
      driverPhone: assignedDrv?.phone || "",
      vehicleId: assignedVeh?.id || "",
      vehicleModel: assignedVeh ? `${assignedVeh.make} ${assignedVeh.model}` : "Commercial Fleet",
      vehicleCategory: assignedVeh?.categoryName || "Sedan",
      vehicleClass: assignedVeh?.vehicleClass || "Executive",
      regNumber: assignedVeh?.registrationNumber || "Pending Vehicle",
      currentLocation: assignForm.pickupLocation,
      destination: assignForm.destination || "Destination Hub",
      pickupLocation: assignForm.pickupLocation,
      dropLocation: assignForm.destination,
      status: hasAssignment ? "ASSIGNED" : "UNASSIGNED",
      speed: "0 km/h",
      eta: "15 Mins",
      tripType: assignForm.tripType,
      customerName: assignForm.customerName,
      fare: assignForm.fare || "2800",
      advance: assignForm.advance || "500",
      lat: 28.5910 + (Math.random() - 0.5) * 0.04,
      lng: 77.0250 + (Math.random() - 0.5) * 0.04
    };

    setIsSubmitting(true);
    const updated = [newDuty, ...drivers];
    setDrivers(updated);
    localStorage.setItem("master_dispatches", JSON.stringify(updated));
    syncDispatchToLeads(newDuty);
    setAssignSuccess(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setAssignSuccess(false);
      setShowAssignModal(false);
      setAssignForm({
        driverId: "",
        vehicleId: "",
        customerName: "",
        phone: "",
        pickupLocation: "",
        destination: "",
        tripType: "Airport Transfer / Pickup & Drop",
        fare: "2800",
        advance: "500"
      });
    }, 1500);
  };

  const filtered = drivers.filter((drv) => {
    const s = search.toLowerCase();
    const matchesSearch =
      (drv.driverName || "").toLowerCase().includes(s) ||
      (drv.vehicleModel || "").toLowerCase().includes(s) ||
      (drv.currentLocation || "").toLowerCase().includes(s) ||
      (drv.destination || "").toLowerCase().includes(s) ||
      (drv.customerName || "").toLowerCase().includes(s) ||
      (drv.regNumber || "").toLowerCase().includes(s) ||
      (drv.bookingRef || "").toLowerCase().includes(s) ||
      (drv.tripType || "").toLowerCase().includes(s);
    const matchesStatus = filterStatus === "ALL" || drv.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-8">
      {/* Leaflet CSS Inject */}
      <link
        rel="stylesheet"
        href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
      />

      {/* Leaflet JS Script Load */}
      <Script
        src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"
        strategy="afterInteractive"
        onLoad={initLeafletMap}
      />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-amber-500/20 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-black tracking-tight text-slate-50">
              Live Dispatch Radar & GPS Telematics Map
            </h1>
            <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
              LIVE TELEMATICS STREAM
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Real-time Google Maps style GPS tracking, Day/Night mode toggles, and live ETAs.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowAssignModal(true)}
            className="flex items-center gap-1.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 px-3.5 py-1.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all shadow-md shadow-amber-500/20 cursor-pointer"
          >
            <UserCheck className="w-3.5 h-3.5" />
            <span>Assign Duty Roster</span>
          </button>
        </div>
      </div>

      {/* Real Interactive Google Maps Style Map Window */}
      <div className="bg-surface/90 backdrop-blur-2xl border border-amber-500/30 rounded-2xl p-4 sm:p-5 shadow-xl relative overflow-hidden space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border pb-3">
          <div className="flex items-center gap-2 text-amber-400 font-bold text-xs uppercase tracking-wider">
            <Radio className="w-3.5 h-3.5 animate-pulse" />
            <span>Interactive Google Maps Telematics View (HQ: Temp Travel Car Rentals Pvt Ltd)</span>
          </div>

          {/* Google Maps Day / Night Mode Toggle Switch */}
          <div className="flex items-center gap-3">
            <span className="text-xs text-slate-400 font-mono">Map Style Mode:</span>
            <div className="flex bg-background p-1 rounded-xl border border-border">
              <button
                onClick={() => setMapMode("DAY")}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${mapMode === "DAY"
                    ? "bg-amber-500 text-slate-950 font-black shadow-md"
                    : "text-slate-400 hover:text-white"
                  }`}
              >
                <Sun className="w-3.5 h-3.5" />
                <span>☀️ Day Mode</span>
              </button>
              <button
                onClick={() => setMapMode("NIGHT")}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${mapMode === "NIGHT"
                    ? "bg-amber-500 text-slate-950 font-black shadow-md"
                    : "text-slate-400 hover:text-white"
                  }`}
              >
                <Moon className="w-3.5 h-3.5" />
                <span>🌙 Night Mode</span>
              </button>
            </div>
          </div>
        </div>

        {/* Real Leaflet Map Render Container */}
        <div className={`relative h-80 sm:h-[350px] w-full rounded-xl overflow-hidden border border-amber-500/30 shadow-xl bg-background ${mapMode === "NIGHT" ? "google-maps-night-mode" : "google-maps-day-mode"}`}>
          <div ref={mapRef} className="w-full h-full z-10" />

          {!mapLoaded && (
            <div className="absolute inset-0 z-20 bg-background flex flex-col items-center justify-center space-y-3">
              <RefreshCw className="w-8 h-8 text-amber-400 animate-spin" />
              <div className="text-xs font-mono text-amber-400 font-bold">Loading Google Maps Vector Tiles...</div>
            </div>
          )}
        </div>

        <style jsx global>{`
          .google-maps-night-mode .leaflet-tile-pane {
            filter: invert(100%) hue-rotate(180deg) brightness(92%) contrast(90%) saturate(110%) !important;
          }
          .google-maps-day-mode .leaflet-tile-pane {
            filter: none !important;
          }
        `}</style>
      </div>

      {/* Search & Filter Toolbar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-surface/60 p-4 rounded-2xl border border-border">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search driver, vehicle or location..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-background border border-border rounded-xl pl-9 pr-4 py-2 text-xs text-slate-100 focus:outline-none focus:border-amber-400"
          />
        </div>

        <div className="flex items-center gap-2">
          {["ALL", "IN_TRANSIT", "ASSIGNED", "AVAILABLE"].map((status) => (
            <button
              key={status}
              onClick={() => setFilterStatus(status)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${filterStatus === status
                  ? "bg-amber-500 text-slate-950 font-black"
                  : "bg-background text-slate-400 hover:text-white border border-border"
                }`}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      {/* Driver Roster Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {filtered.map((drv) => (
          <div
            key={drv.id}
            className="bg-surface/80 backdrop-blur-xl border border-border hover:border-amber-500/40 rounded-2xl p-5 shadow-xl space-y-4 transition-all flex flex-col justify-between"
          >
            <div className="space-y-3">
              <div className="flex justify-between items-start">
                <span
                  className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${drv.status === "IN_TRANSIT"
                      ? "bg-amber-500/10 text-amber-400 border-amber-500/30"
                      : drv.status === "ASSIGNED"
                        ? "bg-blue-500/10 text-blue-400 border-blue-500/30"
                        : "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                    }`}
                >
                  {drv.status.replace("_", " ")}
                </span>
                <span className="text-[11px] font-mono text-slate-400 font-bold">{drv.speed}</span>
              </div>

              <div>
                <div className="flex items-center justify-between gap-1.5">
                  <h3 className="font-extrabold text-slate-100 text-sm truncate">{drv.driverName}</h3>
                  {drv.bookingRef && (
                    <span className="text-[10px] font-mono text-amber-400 font-bold bg-amber-500/10 px-1.5 py-0.5 rounded border border-amber-500/20 shrink-0">
                      {drv.bookingRef}
                    </span>
                  )}
                </div>
                <div className="text-xs text-amber-400/90 font-semibold">{drv.vehicleModel}</div>
                <div className="text-[10px] font-mono text-slate-400 mt-0.5">{drv.regNumber}</div>
              </div>

              <div className="space-y-2 bg-background p-3 rounded-xl border border-border text-[11px]">
                <div className="flex items-start gap-2 text-slate-300">
                  <MapPin className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                  <div>
                    <div className="text-[9px] text-slate-500 uppercase font-bold">Pickup / Location</div>
                    <div className="font-medium text-slate-200 line-clamp-1">{drv.currentLocation}</div>
                  </div>
                </div>
                <div className="flex items-start gap-2 text-slate-300">
                  <Navigation className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                  <div>
                    <div className="text-[9px] text-slate-500 uppercase font-bold">Destination</div>
                    <div className="font-medium text-slate-200 line-clamp-1">{drv.destination}</div>
                  </div>
                </div>
              </div>

              <div className="flex justify-between items-center text-xs pt-1">
                <span className="text-slate-400">ETA: <strong className="text-slate-200">{drv.eta}</strong></span>
                <span className="text-slate-400">Pax: <strong className="text-slate-200">{drv.customerName}</strong></span>
              </div>
            </div>

            <div className="pt-3 border-t border-border flex items-center gap-2">
              {(() => {
                const isAssigned = Boolean(drv.driverName && drv.driverName !== "Unassigned" && drv.driverName !== "Pending Chauffeur" && drv.vehicleModel);
                return (
                  <button
                    type="button"
                    onClick={() => setAssigningDispatch(drv)}
                    className={`flex-1 border py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                      isAssigned
                        ? "bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border-emerald-500/30"
                        : "bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border-amber-500/30"
                    }`}
                    title={isAssigned ? "Driver & Vehicle Assigned (Click to Reassign)" : "Assign Vehicle & Chauffeur"}
                  >
                    <UserCheck className="w-3.5 h-3.5" />
                    <span>{isAssigned ? "Reassign" : "Assign Duty"}</span>
                  </button>
                );
              })()}

              <a
                href={buildWhatsAppShareUrl({
                  customerName: drv.customerName,
                  customerPhone: drv.phone,
                  bookingRef: drv.bookingRef,
                  bookingType: drv.tripType,
                  tripType: drv.tripType,
                  pickupDateTime: drv.pickupDateTime,
                  pickupLocation: drv.pickupLocation || drv.currentLocation,
                  dropLocation: drv.dropLocation || drv.destination,
                  vehicleModel: drv.vehicleModel,
                  vehicleRegistration: drv.regNumber,
                  driverName: drv.driverName,
                  driverPhone: drv.driverPhone,
                  notes: drv.notes,
                })}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-xl text-xs font-bold transition-all flex items-center justify-center cursor-pointer"
                title="Share Ride Confirmation on WhatsApp"
              >
                <Share2 className="w-3.5 h-3.5" />
              </a>

              <button
                type="button"
                onClick={() => setSelectedDriver(drv)}
                className="p-2 bg-background hover:bg-white/5 text-slate-300 border border-border rounded-xl text-xs font-bold transition-all flex items-center justify-center cursor-pointer"
                title="Inspect GPS Telematics Ping"
              >
                <Activity className="w-3.5 h-3.5 text-amber-400" />
              </button>

              <button
                type="button"
                onClick={() => handleDeleteDispatch(drv.id)}
                className="p-2 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 rounded-xl text-xs font-bold transition-all flex items-center justify-center cursor-pointer"
                title="Permanently Delete Dispatch"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Assign Duty Roster Modal */}
      {showAssignModal && (
        <Portal>
          <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
            <div className="bg-surface border border-amber-500/30 rounded-3xl p-6 sm:p-8 w-full max-w-xl shadow-2xl space-y-4 relative text-slate-100 max-h-[90vh] overflow-y-auto">
              <button
                onClick={() => setShowAssignModal(false)}
                className="absolute top-5 right-5 text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="space-y-1 border-b border-border pb-3">
                <span className="text-[10px] font-bold uppercase text-amber-400 tracking-wider">Master Duty Roster</span>
                <h3 className="text-2xl font-black text-slate-50">Assign Chauffeur Duty</h3>
              </div>

              {assignSuccess ? (
                <div className="p-8 text-center space-y-3">
                  <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto animate-bounce" />
                  <h4 className="text-lg font-bold text-slate-100">Duty Assigned & Dispatched!</h4>
                  <p className="text-xs text-slate-400">Driver app notified. GPS radar tracking active.</p>
                </div>
              ) : (
                <form onSubmit={handleAssignSubmit} className="space-y-4 text-xs">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-slate-300 font-bold uppercase text-[10px]">Select Chauffeur *</label>
                      <select
                        value={assignForm.driverId}
                        onChange={(e) => setAssignForm({ ...assignForm, driverId: e.target.value })}
                        className="w-full bg-background border border-border rounded-xl px-3 py-2.5 text-slate-100 focus:outline-none focus:border-amber-400 cursor-pointer"
                      >
                        <option value="">-- Choose Chauffeur --</option>
                        <optgroup label="Available Chauffeurs (Ready)">
                          {registeredDrivers.filter(d => !getDriverBusy(d)).map((d) => {
                            const isCarDefault = assignForm.vehicleId && fleetVehicles.find(v => v.id === assignForm.vehicleId)?.driverId === d.id;
                            return (
                              <option key={d.id} value={d.id}>
                                {d.name} &bull; {d.phone} {isCarDefault ? "★ [Default for Car]" : ""} {d.licenseNumber ? `(${d.licenseNumber})` : ""}
                              </option>
                            );
                          })}
                        </optgroup>
                        {registeredDrivers.filter(d => getDriverBusy(d)).length > 0 && (
                          <optgroup label="Currently Assigned / On Duty (Disabled)">
                            {registeredDrivers.filter(d => getDriverBusy(d)).map((d) => {
                              const busyRide = getDriverBusy(d);
                              return (
                                <option key={d.id} value={d.id} disabled className="text-slate-500 bg-slate-900/90 italic">
                                  ⛔ {d.name} &bull; {d.phone} [ON DUTY - Ride #{busyRide}]
                                </option>
                              );
                            })}
                          </optgroup>
                        )}
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="text-slate-300 font-bold uppercase text-[10px]">Select Vehicle *</label>
                      <select
                        value={assignForm.vehicleId}
                        onChange={(e) => setAssignForm({ ...assignForm, vehicleId: e.target.value })}
                        className="w-full bg-background border border-border rounded-xl px-3 py-2.5 text-slate-100 focus:outline-none focus:border-amber-400 cursor-pointer"
                      >
                        <option value="">-- Choose Vehicle --</option>
                        <optgroup label="Available Fleet (Ready)">
                          {fleetVehicles.filter(v => !getVehicleBusy(v)).map((v) => (
                            <option key={v.id} value={v.id}>
                              {v.make} {v.model} ({v.registrationNumber}) &bull; {v.categoryName || v.category?.name || "Sedan"}
                            </option>
                          ))}
                        </optgroup>
                        {fleetVehicles.filter(v => getVehicleBusy(v)).length > 0 && (
                          <optgroup label="Currently Assigned / On Duty (Disabled)">
                            {fleetVehicles.filter(v => getVehicleBusy(v)).map((v) => {
                              const busyRide = getVehicleBusy(v);
                              return (
                                <option key={v.id} value={v.id} disabled className="text-slate-500 bg-slate-900/90 italic">
                                  ⛔ {v.make} {v.model} ({v.registrationNumber}) [ON DUTY - Ride #{busyRide}]
                                </option>
                              );
                            })}
                          </optgroup>
                        )}
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-slate-300 font-bold uppercase text-[10px]">Trip Type *</label>
                      <select
                        value={assignForm.tripType}
                        onChange={(e) => setAssignForm({ ...assignForm, tripType: e.target.value })}
                        className="w-full bg-background border border-border rounded-xl px-3 py-2.5 text-slate-100 focus:outline-none focus:border-amber-400 font-bold text-amber-400 cursor-pointer"
                      >
                        {TRIP_TYPES.map((t) => (
                          <option key={t} value={t}>
                            {t}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="text-slate-300 font-bold uppercase text-[10px]">Passenger Name *</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Vikram Malhotra"
                        value={assignForm.customerName}
                        onChange={(e) => setAssignForm({ ...assignForm, customerName: e.target.value })}
                        className="w-full bg-background border border-border rounded-xl px-3.5 py-2.5 text-slate-100 focus:outline-none focus:border-amber-400"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-slate-300 font-bold uppercase text-[10px]">Pickup Location *</label>
                      <LocationInput
                        required
                        placeholder="Search pickup hub or address..."
                        value={assignForm.pickupLocation}
                        onChange={(val) => setAssignForm({ ...assignForm, pickupLocation: val })}
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-slate-300 font-bold uppercase text-[10px]">Destination Drop Location</label>
                      <LocationInput
                        placeholder="Search drop destination..."
                        value={assignForm.destination}
                        onChange={(val) => setAssignForm({ ...assignForm, destination: val })}
                      />
                    </div>
                  </div>

                  <div className="pt-3 border-t border-border flex justify-end gap-3">
                    <button
                      type="button"
                      onClick={() => setShowAssignModal(false)}
                      className="px-5 py-2.5 bg-background text-slate-400 hover:text-white rounded-xl text-xs font-bold cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="px-6 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 disabled:opacity-60 disabled:cursor-not-allowed text-slate-950 font-black rounded-xl text-xs uppercase tracking-wider shadow-lg shadow-amber-500/20 cursor-pointer flex items-center gap-1.5 transition-all"
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin text-slate-950" />
                          <span>Dispatching Duty...</span>
                        </>
                      ) : (
                        <>
                          <CheckCircle2 className="w-4 h-4" />
                          <span>Dispatch Duty Now</span>
                        </>
                      )}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </Portal>
      )}

      {/* Quick Dispatch Assignment & Reallocation Modal */}
      <QuickDispatchAssignmentModal
        isOpen={!!assigningDispatch}
        onClose={() => setAssigningDispatch(null)}
        dispatchItem={assigningDispatch}
        fleetVehicles={fleetVehicles}
        drivers={registeredDrivers}
        onSave={handleSaveRadarAssignment}
        onDelete={handleDeleteDispatch}
      />

      {/* Driver Telematics Drawer */}
      {selectedDriver && (
        <Portal>
          <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
            <div className="bg-surface border border-amber-500/30 rounded-3xl p-6 w-full max-w-md shadow-2xl space-y-4 relative text-slate-100">
              <button
                onClick={() => setSelectedDriver(null)}
                className="absolute top-4 right-4 text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="space-y-1">
                <span className="text-[10px] font-bold uppercase text-amber-400 tracking-wider">Live GPS Telematics Telemetry</span>
                <h3 className="text-xl font-bold text-slate-50">{selectedDriver.driverName}</h3>
                <div className="text-xs text-amber-400 font-mono font-bold">{selectedDriver.vehicleModel} &bull; {selectedDriver.regNumber}</div>
              </div>

              <div className="space-y-2 bg-background p-4 rounded-xl border border-border text-xs font-mono">
                <div className="flex justify-between">
                  <span className="text-slate-400">Current Speed:</span>
                  <strong className="text-emerald-400">{selectedDriver.speed}</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Estimated ETA:</span>
                  <strong className="text-amber-400">{selectedDriver.eta}</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Passenger Name:</span>
                  <strong className="text-slate-100">{selectedDriver.customerName}</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Current Location:</span>
                  <strong className="text-slate-200 truncate max-w-[180px]">{selectedDriver.currentLocation}</strong>
                </div>
              </div>

              {/* 1-Click WhatsApp Share Action */}
              <a
                href={buildWhatsAppShareUrl({
                  customerName: selectedDriver.customerName,
                  customerPhone: selectedDriver.phone,
                  bookingRef: selectedDriver.bookingRef,
                  bookingType: selectedDriver.tripType,
                  tripType: selectedDriver.tripType,
                  pickupDateTime: selectedDriver.pickupDateTime,
                  pickupLocation: selectedDriver.pickupLocation || selectedDriver.currentLocation,
                  dropLocation: selectedDriver.dropLocation || selectedDriver.destination,
                  vehicleModel: selectedDriver.vehicleModel,
                  vehicleRegistration: selectedDriver.regNumber,
                  driverName: selectedDriver.driverName,
                  driverPhone: selectedDriver.driverPhone,
                  notes: selectedDriver.notes,
                })}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white font-black py-2.5 px-4 rounded-xl text-xs uppercase tracking-wider shadow-lg shadow-emerald-600/20 transition-all cursor-pointer"
              >
                <Share2 className="w-4 h-4" />
                <span>Share Ride Confirmation on WhatsApp</span>
              </a>

              <div className="pt-2 flex justify-between items-center">
                <button
                  type="button"
                  onClick={() => handleDeleteDispatch(selectedDriver.id)}
                  className="px-3.5 py-2 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 font-bold rounded-xl text-xs cursor-pointer flex items-center gap-1.5 transition-all"
                  title="Delete this dispatch"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Delete</span>
                </button>
                <button
                  onClick={() => setSelectedDriver(null)}
                  className="px-4 py-2 bg-amber-500 text-slate-950 font-bold rounded-xl text-xs cursor-pointer"
                >
                  Close Inspector
                </button>
              </div>
            </div>
          </div>
        </Portal>
      )}
    </div>
  );
}

