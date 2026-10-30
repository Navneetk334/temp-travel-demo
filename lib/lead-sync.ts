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
        requirements: `Quick Dispatch: ${dispatch.vehicleCategory || "Sedan"} ${dispatch.vehicleClass || "Executive"} (${dispatch.vehicleModel || "Standard"}). Drop: ${dispatch.dropLocation || "Destination"}. Fare: ₹${dispatch.fare || "2800"}. Advance: ₹${dispatch.advance || "500"}.${dispatch.regNumber && !dispatch.regNumber.includes("Pending") ? ` Assigned Car: ${dispatch.regNumber}.` : ""}${dispatch.driverName && !dispatch.driverName.includes("Pending") ? ` Chauffeur: ${dispatch.driverName}.` : ""}`,
        status: dispatch.status === "COMPLETED" ? "WON" : (dispatch.status === "CANCELLED" ? "LOST" : "NEW")
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
        notes: `Quick Dispatch: ${dispatch.vehicleCategory || "Sedan"} ${dispatch.vehicleClass || "Executive"} (${dispatch.vehicleModel || "Standard"}). Fare: ₹${dispatch.fare || "2800"}. Advance: ₹${dispatch.advance || "500"}.${dispatch.regNumber && !dispatch.regNumber.includes("Pending") ? ` Assigned Car: ${dispatch.regNumber}.` : ""}${dispatch.driverName && !dispatch.driverName.includes("Pending") ? ` Chauffeur: ${dispatch.driverName}.` : ""}`,
        status: dispatch.status === "COMPLETED" ? "WON" : (dispatch.status === "CANCELLED" ? "LOST" : "NEW")
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
        status: dispatch.status === "COMPLETED" ? "WON" : (dispatch.status === "CANCELLED" ? "LOST" : "NEW"),
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
  if (typeof window === "undefined") return;
  try {
    const existing = JSON.parse(localStorage.getItem("user_uploaded_crm_leads") || "[]");
    const nextLeads = existing.filter((l: any) => l.id !== dispatchId && l.bookingRef !== dispatchId);
    localStorage.setItem("user_uploaded_crm_leads", JSON.stringify(nextLeads));
    window.dispatchEvent(new Event("crm_leads_updated"));
  } catch (e) {
    console.error("removeDispatchFromLeads error:", e);
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

