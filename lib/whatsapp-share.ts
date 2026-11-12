export interface WhatsAppDispatchData {
  customerName?: string | null;
  customerPhone?: string | null;
  bookingRef?: string | null;
  bookingType?: string | null;
  tripType?: string | null;
  serviceType?: string | null;
  pickupDateTime?: string | Date | null;
  pickupLocation?: string | null;
  dropLocation?: string | null;
  vehicleModel?: string | null;
  vehicleMake?: string | null;
  vehicleRegistration?: string | null;
  driverName?: string | null;
  driverPhone?: string | null;
  fare?: number | string | null;
  paymentMode?: string | null;
  notes?: string | null;
}

export function isPickupAndDropBooking(data: WhatsAppDispatchData): boolean {
  const typeStr = [data.bookingType, data.tripType, data.serviceType].filter(Boolean).join(" ").toLowerCase();

  if (typeStr) {
    if (typeStr.includes("point") || typeStr.includes("local") || typeStr.includes("outstation") || typeStr.includes("tour")) {
      return false;
    }
    if (typeStr.includes("pickup") || typeStr.includes("drop") || typeStr.includes("airport") || typeStr.includes("transfer")) {
      return true;
    }
    return false;
  }

  // Fallback to notes inspection
  if (data.notes) {
    const notesLower = data.notes.toLowerCase();
    if (notesLower.includes("point-to-point") || notesLower.includes("point to point") || notesLower.includes("local rental") || notesLower.includes("outstation")) {
      return false;
    }
    if (notesLower.includes("pickup & drop") || notesLower.includes("pickup and drop") || notesLower.includes("airport transfer")) {
      return true;
    }
  }

  return false;
}

export function formatIndianDateTime(dt?: string | Date | null): string {
  if (!dt) return "As Scheduled";
  try {
    const d = typeof dt === "string" ? new Date(dt) : dt;
    if (!isNaN(d.getTime())) {
      return d.toLocaleString("en-IN", {
        timeZone: "Asia/Kolkata",
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      });
    }
  } catch (e) {
    console.error("formatIndianDateTime error:", e);
  }
  return String(dt);
}

export function parseDispatchDetailsFromNotes(notes?: string | null) {
  if (!notes) return {};
  const res: {
    driverName?: string;
    driverPhone?: string;
    vehicleInfo?: string;
    vehicleReg?: string;
    bookingRef?: string;
    pickupTime?: string;
  } = {};

  // Extract AssignedDriver: [AssignedDriver: Name|Phone|Id]
  const drvMatch = notes.match(/\[AssignedDriver:\s*([^|\]]+)\|([^|\]]+)(?:\|([^\]]+))?\]/);
  if (drvMatch) {
    res.driverName = drvMatch[1].trim();
    res.driverPhone = drvMatch[2].trim();
  }

  // Extract Vehicle: [Vehicle: Make Model | RegNumber] or [Vehicle: ... ]
  const vehMatch = notes.match(/\[Vehicle:\s*([^|\]]+)(?:\|\s*([^\]]+))?\]/i);
  if (vehMatch) {
    res.vehicleInfo = vehMatch[1].trim();
    if (vehMatch[2]) res.vehicleReg = vehMatch[2].trim();
  }

  // Extract Ref / PNR: [Ref: TT-XXXXXX] or [PNR: ...]
  const refMatch = notes.match(/\[(?:Ref|PNR|BookingRef):\s*([a-zA-Z0-9_-]+)\]/i);
  if (refMatch) {
    res.bookingRef = refMatch[1].trim();
  }

  // Extract PickupTime: [PickupTime: ...]
  const timeMatch = notes.match(/\[PickupTime:\s*([^\]]+)\]/i);
  if (timeMatch) {
    res.pickupTime = timeMatch[1].trim();
  }

  return res;
}

export function buildWhatsAppShareMessage(data: WhatsAppDispatchData): string {
  const noteDetails = parseDispatchDetailsFromNotes(data.notes);

  const customerName = data.customerName || "Valued Customer";
  const pnr = data.bookingRef || noteDetails.bookingRef || "CONFIRMED";

  // Pickup Time Resolution
  let pickupTime = noteDetails.pickupTime;
  if (!pickupTime && data.pickupDateTime) {
    pickupTime = formatIndianDateTime(data.pickupDateTime);
  }
  if (!pickupTime || pickupTime === "As Scheduled") {
    if (data.notes) {
      const timeMatch = data.notes.match(/Pickup Time:\s*([^,\n\.]+)/i);
      const dateMatch = data.notes.match(/Pickup Date:\s*([^,\n\.]+)/i);
      if (timeMatch) {
        pickupTime = dateMatch ? `${dateMatch[1].trim()}, ${timeMatch[1].trim()}` : timeMatch[1].trim();
      }
    }
  }
  if (!pickupTime) {
    pickupTime = "As scheduled";
  }

  const pickupLoc = data.pickupLocation || "As scheduled";
  const dropLoc = data.dropLocation || "As directed";

  // Vehicle Display Resolution
  let vehicleName = "";
  if (noteDetails.vehicleInfo) {
    vehicleName = noteDetails.vehicleInfo;
  } else if (data.vehicleMake || (data.vehicleModel && !data.vehicleModel.toLowerCase().includes("pickup") && !data.vehicleModel.toLowerCase().includes("rental") && !data.vehicleModel.toLowerCase().includes("transfer") && !data.vehicleModel.toLowerCase().includes("drop"))) {
    vehicleName = [data.vehicleMake, data.vehicleModel].filter(Boolean).join(" ").trim();
  } else if (data.vehicleModel) {
    vehicleName = data.vehicleModel;
  } else {
    vehicleName = "Executive Commercial Fleet";
  }

  const regNum = data.vehicleRegistration || noteDetails.vehicleReg || "";
  const vehicleDisplay = regNum ? `${vehicleName} (${regNum})` : vehicleName;

  // Driver Display Resolution
  const driverName = (data.driverName && data.driverName !== "Assigned Chauffeur" && data.driverName !== "Pending Chauffeur" && data.driverName !== "Unassigned")
    ? data.driverName
    : (noteDetails.driverName || data.driverName || "Assigned Chauffeur");

  const driverPhone = data.driverPhone || noteDetails.driverPhone;
  const driverDisplay = driverPhone
    ? `${driverName} (📞 +91-${driverPhone.replace(/\D/g, "").slice(-10)})`
    : driverName;

  const isPickupDrop = isPickupAndDropBooking(data);

  const lines: string[] = [
    "*TEMP TRAVEL CAR RENTALS - RIDE CONFIRMATION*",
    "",
    `Dear ${customerName},`,
    "Your cab has been confirmed and dispatched.",
    "",
    `*Booking Number (PNR):* ${pnr}`,
    `*Pickup Date & Time:* ${pickupTime}`,
  ];

  // Pickup address is ONLY visible when the booking is Pickup & Drop (omitted for Local Rental, Outstation, Point-to-Point)
  if (isPickupDrop && pickupLoc && pickupLoc !== "-") {
    lines.push(`*Pickup Location:* ${pickupLoc}`);
  }

  // Drop location
  if (dropLoc && dropLoc !== "-" && dropLoc !== "Drop Location TBD" && dropLoc !== "As directed") {
    lines.push(`*Drop Location:* ${dropLoc}`);
  }

  lines.push(`*Vehicle:* ${vehicleDisplay}`);
  lines.push(`*Driver / Chauffeur:* ${driverDisplay}`);
  lines.push("");
  lines.push("Thank you for choosing Temp Travel! For assistance call +91-7011729639.");

  return lines.join("\n");
}

export function buildWhatsAppShareUrl(data: WhatsAppDispatchData): string {
  const msg = buildWhatsAppShareMessage(data);
  const cleanPhone = (data.customerPhone || "").replace(/\D/g, "").slice(-10);
  if (cleanPhone && cleanPhone.length === 10) {
    return `https://wa.me/91${cleanPhone}?text=${encodeURIComponent(msg)}`;
  }
  return `https://wa.me/?text=${encodeURIComponent(msg)}`;
}
