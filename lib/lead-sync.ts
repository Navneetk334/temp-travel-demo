/**
 * Centralized Omnichannel Lead & Dispatch Synchronization Utility
 * Keeps Master Admin, Operations Desk, Admin Panel Leads, and Public Website in bidirectional sync.
 */

export function formatLeadPhone(rawPhone: string): string {
  const clean = (rawPhone || "").replace(/[\s-]/g, "");
  if (!clean) return "+919820112233";
  if (clean.startsWith("+")) return clean;
  if (clean.length === 10) return `+91${clean}`;
  return `+${clean}`;
}

export async function syncDispatchToLeads(dispatch: any) {
  if (!dispatch || !dispatch.tripType) return null;

  const phone = formatLeadPhone(dispatch.phone || "");
  const email = dispatch.email || `${phone.replace(/\D/g, "") || "dispatch"}@lead.temptravel.in`;
  const tripType = dispatch.tripType || "Airport Transfer / Pickup & Drop";
  const tLower = tripType.toLowerCase();

  const isLocal = tLower.includes("local") || tLower.includes("hourly");
  const isOutstation = tLower.includes("outstation") || tLower.includes("round trip") || tLower.includes("one way");
  const isPickupDrop = (tLower.includes("pickup") || tLower.includes("airport") || tLower.includes("drop")) && !isLocal && !isOutstation;
  const isCorporateB2B = (tLower.includes("corporate") || tLower.includes("transit") || tLower.includes("shuttle")) && !isLocal && !isOutstation;

  let createdDbLead: any = null;

  try {
    if (isPickupDrop || isCorporateB2B) {
      const corpPayload = {
        companyName: isCorporateB2B ? "Corporate Client" : "Individual",
        contactName: dispatch.customerName || "Customer Lead",
        email,
        phone,
        employeeCount: 1,
        pickupLocations: dispatch.pickupLocation || "Pickup Hub",
        serviceType: tripType,
        requirements: `[Ref: ${dispatch.id}] Quick Dispatch: ${dispatch.vehicleCategory || "Sedan"} ${dispatch.vehicleClass || "Executive"} (${dispatch.vehicleModel || "Standard"}). Drop: ${dispatch.dropLocation || "Destination"}. Fare: ₹${dispatch.fare || "2800"}. Advance: ₹${dispatch.advance || "500"}.${dispatch.regNumber && !dispatch.regNumber.includes("Pending") ? ` Assigned Car: ${dispatch.regNumber}.` : ""}${dispatch.driverName && !dispatch.driverName.includes("Pending") ? ` Chauffeur: ${dispatch.driverName}.` : ""}`,
        notes: `[Ref: ${dispatch.id}] Quick Dispatch`,
        status: dispatch.status === "COMPLETED" ? "CONVERTED" : (dispatch.status === "CANCELLED" ? "LOST" : "NEW")
      };

      const res = await fetch("/api/corporate/lead", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(corpPayload)
      });
      if (res.ok) createdDbLead = await res.json();
    } else {
      // Local or Outstation Rental
      const rentalPayload = {
        customerName: dispatch.customerName || "Customer Lead",
        email,
        phone,
        pickupLocation: dispatch.pickupLocation || "Pickup Hub",
        dropLocation: dispatch.dropLocation || null,
        pickupDateTime: new Date().toISOString(),
        tripType,
        notes: `[Ref: ${dispatch.id}] Quick Dispatch: ${dispatch.vehicleCategory || "Sedan"} ${dispatch.vehicleClass || "Executive"} (${dispatch.vehicleModel || "Standard"}). Fare: ₹${dispatch.fare || "2800"}. Advance: ₹${dispatch.advance || "500"}.${dispatch.regNumber && !dispatch.regNumber.includes("Pending") ? ` Assigned Car: ${dispatch.regNumber}.` : ""}${dispatch.driverName && !dispatch.driverName.includes("Pending") ? ` Chauffeur: ${dispatch.driverName}.` : ""}`,
        status: dispatch.status === "COMPLETED" ? "CONVERTED" : (dispatch.status === "CANCELLED" ? "LOST" : "NEW")
      };

      const res = await fetch("/api/rental/lead", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(rentalPayload)
      });
      if (res.ok) createdDbLead = await res.json();
    }
  } catch (err) {
    console.error("syncDispatchToLeads API error:", err);
  }

  // Update or prepend to user_uploaded_crm_leads in localStorage
  if (typeof window !== "undefined") {
    try {
      const existing = JSON.parse(localStorage.getItem("user_uploaded_crm_leads") || "[]");
      const leadId = createdDbLead?.id || dispatch.id;
      
      const leadRecord = {
        id: leadId,
        bookingRef: dispatch.id,
        customerName: dispatch.customerName || "Customer Lead",
        companyName: isCorporateB2B ? "Corporate Client" : "",
        phone,
        email,
        tripType,
        pickupLocation: dispatch.pickupLocation || "",
        dropLocation: dispatch.dropLocation || "",
        status: dispatch.status === "COMPLETED" ? "CONVERTED" : (dispatch.status === "CANCELLED" ? "LOST" : "NEW"),
        notes: `Quick Dispatch: ${dispatch.vehicleCategory || ""} ${dispatch.vehicleClass || ""} (${dispatch.vehicleModel || ""}). Car: ${dispatch.regNumber || "Pending"}, Driver: ${dispatch.driverName || "Pending"}. Fare: ₹${dispatch.fare || "2800"}`,
        createdAt: dispatch.createdAt || new Date().toISOString()
      };

      const nextLeads = [leadRecord, ...existing.filter((l: any) => l.id !== leadId && l.bookingRef !== dispatch.id)];
      localStorage.setItem("user_uploaded_crm_leads", JSON.stringify(nextLeads));
      window.dispatchEvent(new Event("crm_leads_updated"));
      return leadRecord;
    } catch (e) {
      console.error("syncDispatchToLeads localStorage error:", e);
    }
  }

  return createdDbLead;
}

export function getDeletedDispatchIds(): Set<string> {
  if (typeof window === "undefined") return new Set();
  try {
    const raw = localStorage.getItem("master_deleted_dispatch_ids");
    if (!raw) return new Set();
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return new Set();
    // Sanitize: Only retain discrete booking/dispatch IDs, never blacklist customer phone numbers or names
    const cleaned = parsed.filter((x: any) => {
      if (typeof x !== "string") return false;
      const s = x.trim();
      if (/^\d{10}$/.test(s)) return false; // Purge raw phone numbers
      if (s.toLowerCase() === "navneet" || s.toLowerCase() === "navneet kumar" || s.toLowerCase() === "ajay bhatnagar") return false;
      return true;
    });
    if (cleaned.length !== parsed.length) {
      localStorage.setItem("master_deleted_dispatch_ids", JSON.stringify(cleaned));
    }
    return new Set(cleaned);
  } catch {
    return new Set();
  }
}

export function isDispatchDeleted(item: any): boolean {
  if (!item) return false;
  // Explicitly purge only the stale legacy "Ayush" phantom record
  const cName = String(item.customerName || item.customer?.name || item.contactName || item.name || "").trim().toLowerCase();
  const phone = String(item.phone || item.customerPhone || item.customer?.phone || "").replace(/\D/g, "");
  if (cName === "ayush" && (phone.endsWith("8448755117") || phone === "")) {
    return true;
  }

  const deletedSet = getDeletedDispatchIds();
  if (deletedSet.size === 0) return false;

  const id = String(item.id || "");
  const bookingRef = String(item.bookingRef || item.bookingNumber || "");
  const bookingId = String(item.bookingId || "");

  if (id && deletedSet.has(id)) return true;
  if (bookingRef && deletedSet.has(bookingRef)) return true;
  if (bookingId && deletedSet.has(bookingId)) return true;

  return false;
}

export function recordDeletedDispatch(id: string, extra?: { phone?: string; customerName?: string; bookingRef?: string }) {
  if (typeof window === "undefined") return;
  try {
    const set = getDeletedDispatchIds();
    if (id) set.add(id);
    if (extra?.bookingRef) set.add(extra.bookingRef);
    localStorage.setItem("master_deleted_dispatch_ids", JSON.stringify(Array.from(set)));
  } catch (e) {
    console.error("recordDeletedDispatch error:", e);
  }
}

export function removeDispatchFromLeads(dispatchId: string, extra?: { phone?: string; customerName?: string; bookingRef?: string }) {
  recordDeletedDispatch(dispatchId, extra);

  if (typeof window !== "undefined") {
    const cleanPhoneDigits = extra?.phone ? extra.phone.replace(/\D/g, "").slice(-10) : "";
    const nameMatch = extra?.customerName ? extra.customerName.trim().toLowerCase() : "";

    // 1. Purge from user_uploaded_crm_leads
    try {
      const existing = JSON.parse(localStorage.getItem("user_uploaded_crm_leads") || "[]");
      if (Array.isArray(existing)) {
        const nextLeads = existing.filter((l: any) => {
          if (l.id === dispatchId || l.bookingRef === dispatchId) return false;
          if (extra?.bookingRef && (l.bookingRef === extra.bookingRef || l.id === extra.bookingRef)) return false;
          if (cleanPhoneDigits && (l.phone || "").replace(/\D/g, "").slice(-10) === cleanPhoneDigits) return false;
          if (nameMatch && (l.customerName || l.contactName || "").trim().toLowerCase() === nameMatch) return false;
          if (isDispatchDeleted(l)) return false;
          return true;
        });
        localStorage.setItem("user_uploaded_crm_leads", JSON.stringify(nextLeads));
        window.dispatchEvent(new Event("crm_leads_updated"));
      }
    } catch (e) {
      console.error("removeDispatchFromLeads user_uploaded_crm_leads error:", e);
    }

    // 2. Purge from master_dispatches
    try {
      const masterDisp = JSON.parse(localStorage.getItem("master_dispatches") || "[]");
      if (Array.isArray(masterDisp)) {
        const nextDisp = masterDisp.filter((d: any) => {
          if (d.id === dispatchId || d.bookingRef === dispatchId || d.bookingId === dispatchId) return false;
          if (extra?.bookingRef && (d.bookingRef === extra.bookingRef || d.id === extra.bookingRef)) return false;
          if (cleanPhoneDigits && (d.phone || "").replace(/\D/g, "").slice(-10) === cleanPhoneDigits) return false;
          if (nameMatch && (d.customerName || "").trim().toLowerCase() === nameMatch) return false;
          if (isDispatchDeleted(d)) return false;
          return true;
        });
        localStorage.setItem("master_dispatches", JSON.stringify(nextDisp));
      }
    } catch (e) {
      console.error("removeDispatchFromLeads master_dispatches error:", e);
    }

    // 3. Purge from user_uploaded_dispatched_bookings
    try {
      const userBookings = JSON.parse(localStorage.getItem("user_uploaded_dispatched_bookings") || "[]");
      if (Array.isArray(userBookings)) {
        const nextUserBookings = userBookings.filter((b: any) => {
          if (b.id === dispatchId || b.bookingNumber === dispatchId || b.bookingRef === dispatchId) return false;
          if (extra?.bookingRef && (b.bookingNumber === extra.bookingRef || b.bookingRef === extra.bookingRef || b.id === extra.bookingRef)) return false;
          if (cleanPhoneDigits && (b.customer?.phone || b.phone || "").replace(/\D/g, "").slice(-10) === cleanPhoneDigits) return false;
          if (nameMatch && (b.customer?.name || b.customerName || "").trim().toLowerCase() === nameMatch) return false;
          if (isDispatchDeleted(b)) return false;
          return true;
        });
        localStorage.setItem("user_uploaded_dispatched_bookings", JSON.stringify(nextUserBookings));
      }
    } catch (e) {
      console.error("removeDispatchFromLeads user_uploaded_dispatched_bookings error:", e);
    }

    window.dispatchEvent(new Event("storage"));
  }

  // Also invoke backend API to prune database records (Bookings, Payments, RentalLeads, CorporateLeads, orphaned Users)
  try {
    const params = new URLSearchParams();
    if (dispatchId) params.set("id", dispatchId);
    if (extra?.phone) params.set("phone", extra.phone);
    if (extra?.customerName) params.set("name", extra.customerName);

    fetch(`/api/bookings/dispatch?${params.toString()}`, {
      method: "DELETE"
    }).catch((err) => {
      console.warn("Could not delete backend dispatch records:", err);
    });
  } catch (e) {
    console.error("removeDispatchFromLeads backend call error:", e);
  }
}

export function syncExistingDispatchesToLeads() {
  if (typeof window === "undefined") return;
  try {
    const dispatches = JSON.parse(localStorage.getItem("master_dispatches") || "[]");
    const existingLeads = JSON.parse(localStorage.getItem("user_uploaded_crm_leads") || "[]");
    const dispatchedBookings = JSON.parse(localStorage.getItem("user_uploaded_dispatched_bookings") || "[]");

    // Clean up phantom "Ayush" or any blacklisted deleted dispatches from master_dispatches
    if (Array.isArray(dispatches)) {
      const filteredDispatches = dispatches.filter((d: any) => !isDispatchDeleted(d));
      if (filteredDispatches.length !== dispatches.length) {
        localStorage.setItem("master_dispatches", JSON.stringify(filteredDispatches));
      }
    }

    // Clean up phantom "Ayush" or any blacklisted deleted dispatches from user_uploaded_dispatched_bookings
    if (Array.isArray(dispatchedBookings)) {
      const filteredBookings = dispatchedBookings.filter((b: any) => !isDispatchDeleted(b));
      if (filteredBookings.length !== dispatchedBookings.length) {
        localStorage.setItem("user_uploaded_dispatched_bookings", JSON.stringify(filteredBookings));
      }
    }

    let modified = false;

    // Clean up existing leads:
    // 1. Remove blacklisted or phantom entries
    // 2. Remove "Individual / Quick Dispatch" companyName from non-corporate leads
    // 3. Remove duplicate/stale "Tour Package Booking" leads created erroneously for non-tour dispatches
    const cleanedLeads = (Array.isArray(existingLeads) ? existingLeads : [])
      .filter((l: any) => {
        if (isDispatchDeleted(l)) {
          modified = true;
          return false;
        }
        const type = (l.tripType || "").toLowerCase();
        const ref = (l.bookingRef || l.id || "");
        if (ref.startsWith("DISP-") && type === "tour package booking") {
          modified = true;
          return false;
        }
        return true;
      })
      .map((l: any) => {
        const type = (l.tripType || "").toLowerCase();
        const comp = (l.companyName || "").trim().toLowerCase();
        const isCorp = (type.includes("corporate") || type.includes("transit")) && !type.includes("local") && !type.includes("outstation");
        if (!isCorp && (comp.includes("individual") || comp.includes("quick dispatch"))) {
          modified = true;
          return { ...l, companyName: "" };
        }
        return l;
      });

    if (modified) {
      localStorage.setItem("user_uploaded_crm_leads", JSON.stringify(cleanedLeads));
      window.dispatchEvent(new Event("crm_leads_updated"));
    }

    // Do NOT auto-create leads from dispatches on page refresh:
    // Dispatches are generated FROM leads, so auto-creating leads from dispatches causes ghost duplicate leads.
  } catch (e) {
    console.error("syncExistingDispatchesToLeads error:", e);
  }
}

export const UNIFIED_LEAD_STATUSES = [
  "NEW",
  "CONTACTED",
  "QUALIFIED",
  "NEGOTIATION",
  "CONVERTED",
  "DISPATCHED",
  "LOST",
  "ARCHIVED",
] as const;

export type UnifiedLeadStatus = typeof UNIFIED_LEAD_STATUSES[number];

export function normalizeLeadStatus(status?: string | null): UnifiedLeadStatus {
  if (!status) return "NEW";
  const s = status.trim().toUpperCase();
  if (s === "DISPATCHED") return "DISPATCHED";
  if (s === "CONVERTED" || s === "WON") return "CONVERTED";
  if (s === "READ") return "CONTACTED";
  if (UNIFIED_LEAD_STATUSES.includes(s as UnifiedLeadStatus)) {
    return s as UnifiedLeadStatus;
  }
  return "NEW";
}

/**
 * Check if driver & vehicle have already been assigned/dispatched for a given lead.
 * Used before permitting status transition to 'DISPATCHED'.
 */
export function isLeadAlreadyDispatched(lead: any): boolean {
  if (!lead) return false;

  // 1. Direct object properties (assignedVehicle & assignedDriver)
  const hasVehicleObj = Boolean(
    lead.assignedVehicle ||
    (lead.vehicleRegistration && !lead.vehicleRegistration.toLowerCase().includes("pending")) ||
    (lead.vehicleModel && !lead.vehicleModel.toLowerCase().includes("pending") && !lead.vehicleModel.toLowerCase().includes("default"))
  );

  const hasDriverObj = Boolean(
    lead.assignedDriver ||
    (lead.driverName && !lead.driverName.toLowerCase().includes("pending") && !lead.driverName.toLowerCase().includes("unassigned")) ||
    lead.driverPhone
  );

  if (hasVehicleObj && hasDriverObj) {
    return true;
  }

  // 2. Check dispatch tags in lead notes: e.g. [Vehicle: ...], [AssignedDriver: ...], Assigned Car:, Chauffeur:
  const notesStr = (lead.notes || "").toString();
  const hasVehicleInNotes = /\[Vehicle:\s*[^\]]+\]/i.test(notesStr) || /Assigned Car:\s*[^\.\n]+/i.test(notesStr);
  const hasDriverInNotes = /\[AssignedDriver:\s*[^\]]+\]/i.test(notesStr) || /Chauffeur:\s*[^\.\n]+/i.test(notesStr);

  if (hasVehicleInNotes && hasDriverInNotes) {
    return true;
  }

  // 3. Check client-side stored dispatches / active bookings if in browser
  if (typeof window !== "undefined") {
    try {
      const cleanDigits = (p?: string) => (p || "").replace(/\D/g, "").slice(-10);
      const leadPhone = cleanDigits(lead.phone);
      const leadRef = lead.bookingRef || lead.bookingNumber || (lead.id && lead.id.length < 15 ? lead.id : "");

      // Check master_dispatches
      const dispatches = JSON.parse(localStorage.getItem("master_dispatches") || "[]");
      if (Array.isArray(dispatches)) {
        const found = dispatches.find((d: any) => {
          const matchRef = leadRef && (d.id === leadRef || d.bookingRef === leadRef);
          const matchLeadId = lead.id && (d.leadId === lead.id || d.id === lead.id);
          const matchPhone = leadPhone.length === 10 && cleanDigits(d.phone) === leadPhone;
          return matchRef || matchLeadId || matchPhone;
        });

        if (found) {
          const hasV = Boolean(found.vehicleId || (found.regNumber && !found.regNumber.includes("Pending") && !found.regNumber.includes("Car")));
          const hasD = Boolean(found.driverId || (found.driverName && !found.driverName.includes("Pending") && !found.driverName.includes("Driver")));
          if (hasV && hasD) {
            return true;
          }
        }
      }

      // Check user_uploaded_crm_leads for assigned vehicle/driver
      const localCrm = JSON.parse(localStorage.getItem("user_uploaded_crm_leads") || "[]");
      if (Array.isArray(localCrm)) {
        const foundCrm = localCrm.find((c: any) => {
          const matchId = c.id === lead.id;
          const matchRef = leadRef && (c.bookingRef === leadRef || c.id === leadRef);
          const matchPhone = leadPhone.length === 10 && cleanDigits(c.phone) === leadPhone;
          return matchId || matchRef || matchPhone;
        });
        if (foundCrm) {
          const v = foundCrm.assignedVehicle || foundCrm.vehicleRegistration;
          const d = foundCrm.assignedDriver || foundCrm.driverName;
          if (v && d && !String(v).toLowerCase().includes("pending") && !String(d).toLowerCase().includes("pending")) {
            return true;
          }
          const cNotes = (foundCrm.notes || "").toString();
          if (/\[Vehicle:\s*[^\]]+\]/i.test(cNotes) && /\[AssignedDriver:\s*[^\]]+\]/i.test(cNotes)) {
            return true;
          }
        }
      }
    } catch (e) {
      console.warn("isLeadAlreadyDispatched local check warning:", e);
    }
  }

  return false;
}

export function getCurrentAdminUser(defaultPanel: "Admin Panel" | "Master Admin Panel" = "Admin Panel"): {
  userName: string;
  panel: "Admin Panel" | "Master Admin Panel";
} {
  if (typeof window === "undefined") {
    return { userName: "Admin", panel: defaultPanel };
  }

  if (defaultPanel === "Master Admin Panel") {
    try {
      const masterUser = localStorage.getItem("tt_master_admin_user");
      if (masterUser) {
        const u = JSON.parse(masterUser);
        const name = u.name || u.email || "Master Admin";
        return { userName: name, panel: "Master Admin Panel" };
      }
    } catch (e) {}
    try {
      const adminUser = localStorage.getItem("tt_admin_user");
      if (adminUser) {
        const u = JSON.parse(adminUser);
        const name = u.name || u.email || "Master Admin";
        return { userName: name, panel: "Master Admin Panel" };
      }
    } catch (e) {}
    return { userName: "Master Admin", panel: "Master Admin Panel" };
  }

  // Admin Panel
  try {
    const adminUser = localStorage.getItem("tt_admin_user");
    if (adminUser) {
      const u = JSON.parse(adminUser);
      const name = u.name || u.email || "Operations Staff";
      return { userName: name, panel: "Admin Panel" };
    }
  } catch (e) {}
  return { userName: "Operations Staff", panel: "Admin Panel" };
}

export function createLeadStatusAuditLog({
  oldStatus,
  newStatus,
  userName,
  panel,
  existingNotes,
}: {
  oldStatus?: string | null;
  newStatus: string;
  userName: string;
  panel: "Admin Panel" | "Master Admin Panel";
  existingNotes?: string | null;
}): {
  updatedNotes: string;
  auditMessage: string;
  timestamp: string;
} {
  const timestamp = new Date().toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  const normalizedNew = normalizeLeadStatus(newStatus);
  const normalizedOld = oldStatus ? normalizeLeadStatus(oldStatus) : null;
  const statusDiff = normalizedOld && normalizedOld !== normalizedNew ? `from ${normalizedOld} to ${normalizedNew}` : `to ${normalizedNew}`;

  const auditMessage = `Status changed ${statusDiff} by ${userName} (${panel})`;
  const logLine = `[${timestamp}] ${auditMessage}`;
  const updatedNotes = existingNotes ? `${existingNotes}\n${logLine}` : logLine;

  return { updatedNotes, auditMessage, timestamp };
}

export function parseLastLeadChange(lead: {
  notes?: string | null;
  lastChangedBy?: string | null;
  lastChangedPanel?: string | null;
  lastChangedAt?: string | null;
}): {
  changedBy: string | null;
  panel: string | null;
  timestamp: string | null;
  fullText: string | null;
} {
  if (lead.lastChangedBy && lead.lastChangedPanel) {
    return {
      changedBy: lead.lastChangedBy,
      panel: lead.lastChangedPanel,
      timestamp: lead.lastChangedAt || null,
      fullText: `Changed by ${lead.lastChangedBy} (${lead.lastChangedPanel})`,
    };
  }

  if (!lead.notes) return { changedBy: null, panel: null, timestamp: null, fullText: null };

  const lines = lead.notes.split("\n");
  for (let i = lines.length - 1; i >= 0; i--) {
    const line = lines[i].trim();
    const statusMatch = line.match(/^\[([^\]]+)\]\s*(?:Status changed.*?to\s+([A-Z_]+)\s+)?by\s+(.*?)\s+\(([^)]+)\)/i);
    if (statusMatch) {
      return {
        timestamp: statusMatch[1],
        changedBy: statusMatch[3],
        panel: statusMatch[4],
        fullText: `Changed by ${statusMatch[3]} (${statusMatch[4]})`,
      };
    }
  }

  return { changedBy: null, panel: null, timestamp: null, fullText: null };
}

export function syncLeadStatusUpdateAcrossPanels({
  leadId,
  phone,
  newStatus,
  updatedNotes,
  userName,
  panel,
}: {
  leadId: string;
  phone?: string | null;
  newStatus: string;
  updatedNotes: string;
  userName?: string;
  panel?: "Admin Panel" | "Master Admin Panel";
}) {
  if (typeof window === "undefined") return;
  try {
    const existing = JSON.parse(localStorage.getItem("user_uploaded_crm_leads") || "[]");
    const normalized = normalizeLeadStatus(newStatus);
    const timestamp = new Date().toISOString();
    const cleanDigits = (p?: string | null) => (p || "").replace(/\D/g, "").slice(-10);
    const targetPhone = cleanDigits(phone);

    const updated = (Array.isArray(existing) ? existing : []).map((l: any) => {
      const isMatch = l.id === leadId || 
                      l.bookingRef === leadId || 
                      (targetPhone.length === 10 && cleanDigits(l.phone) === targetPhone);
      if (isMatch) {
        return {
          ...l,
          status: normalized,
          notes: updatedNotes || l.notes,
          lastChangedBy: userName || l.lastChangedBy,
          lastChangedPanel: panel || l.lastChangedPanel,
          lastChangedAt: timestamp,
          updatedAt: timestamp,
        };
      }
      return l;
    });

    localStorage.setItem("user_uploaded_crm_leads", JSON.stringify(updated));
    window.dispatchEvent(new Event("crm_leads_updated"));
  } catch (e) {
    console.error("syncLeadStatusUpdateAcrossPanels error:", e);
  }
}


