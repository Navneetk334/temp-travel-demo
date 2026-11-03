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

export function removeDispatchFromLeads(dispatchId: string) {
  if (typeof window !== "undefined") {
    try {
      const existing = JSON.parse(localStorage.getItem("user_uploaded_crm_leads") || "[]");
      const nextLeads = existing.filter((l: any) => l.id !== dispatchId && l.bookingRef !== dispatchId);
      localStorage.setItem("user_uploaded_crm_leads", JSON.stringify(nextLeads));
      window.dispatchEvent(new Event("crm_leads_updated"));
    } catch (e) {
      console.error("removeDispatchFromLeads localStorage error:", e);
    }
  }

  // Also invoke backend API to prune database records (Bookings, Payments, RentalLeads, CorporateLeads)
  try {
    fetch(`/api/bookings/dispatch?id=${encodeURIComponent(dispatchId)}`, {
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

    let modified = false;

    // Clean up existing leads:
    // 1. Remove "Individual / Quick Dispatch" companyName from non-corporate leads
    // 2. Remove duplicate/stale "Tour Package Booking" leads created erroneously for non-tour dispatches
    const cleanedLeads = (Array.isArray(existingLeads) ? existingLeads : [])
      .filter((l: any) => {
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

    if (!Array.isArray(dispatches) || dispatches.length === 0) return;

    const leadIds = new Set(cleanedLeads.map((l: any) => l.id));
    const leadRefs = new Set(cleanedLeads.map((l: any) => l.bookingRef));

    for (const d of dispatches) {
      if (!leadIds.has(d.id) && !leadRefs.has(d.id)) {
        syncDispatchToLeads(d);
      }
    }
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
  "LOST",
  "ARCHIVED",
] as const;

export type UnifiedLeadStatus = typeof UNIFIED_LEAD_STATUSES[number];

export function normalizeLeadStatus(status?: string | null): UnifiedLeadStatus {
  if (!status) return "NEW";
  const s = status.trim().toUpperCase();
  if (s === "CONVERTED" || s === "WON") return "CONVERTED";
  if (s === "READ") return "CONTACTED";
  if (UNIFIED_LEAD_STATUSES.includes(s as UnifiedLeadStatus)) {
    return s as UnifiedLeadStatus;
  }
  return "NEW";
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
  newStatus,
  updatedNotes,
  userName,
  panel,
}: {
  leadId: string;
  newStatus: string;
  updatedNotes: string;
  userName: string;
  panel: "Admin Panel" | "Master Admin Panel";
}) {
  if (typeof window === "undefined") return;
  try {
    const existing = JSON.parse(localStorage.getItem("user_uploaded_crm_leads") || "[]");
    const normalized = normalizeLeadStatus(newStatus);
    const timestamp = new Date().toISOString();

    const updated = existing.map((l: any) => {
      if (l.id === leadId || l.bookingRef === leadId) {
        return {
          ...l,
          status: normalized,
          notes: updatedNotes,
          lastChangedBy: userName,
          lastChangedPanel: panel,
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


