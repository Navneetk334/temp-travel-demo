import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { 
  DutySlipRecord, 
  dutySlipsStore, 
  getDeletedDutySlipIds, 
  getCustomDutySlips, 
  saveCustomDutySlips 
} from "@/lib/duties";

export type { DutySlipRecord };

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search")?.toLowerCase() || "";
    const date = searchParams.get("date") || "";
    const feedback = searchParams.get("feedback") || "";

    // 1. Fetch deleted IDs to enforce permanent deletion
    const deletedIds = await getDeletedDutySlipIds();

    // 2. Fetch custom / manual duty slips from persistent database storage
    const customSlips = await getCustomDutySlips();

    // 3. Fetch real bookings & dispatches from Prisma database
    let bookingDuties: DutySlipRecord[] = [];
    try {
      const bookings = await prisma.booking.findMany({
        include: {
          customer: { select: { name: true, phone: true, email: true } },
          vehicle: {
            select: {
              id: true,
              registrationNumber: true,
              model: true,
              driver: { select: { name: true, phone: true } }
            }
          },
          vehicleCategory: { select: { name: true } },
          payments: true,
        },
        orderBy: { createdAt: "desc" },
        take: 100,
      });

      bookingDuties = bookings.map((b): DutySlipRecord => {
        // Extract assigned chauffeur from notes if explicitly logged during dispatch
        let driverName = b.vehicle?.driver?.name || "Designated Chauffeur";
        if (b.notes) {
          const match = b.notes.match(/\[AssignedDriver:\s*([^|]+)/i);
          if (match && match[1]) {
            driverName = match[1].trim();
          }
        }

        const bookingDate = b.pickupDateTime 
          ? new Date(b.pickupDateTime).toISOString().split("T")[0]
          : (b.createdAt ? new Date(b.createdAt).toISOString().split("T")[0] : new Date().toISOString().split("T")[0]);

        const pickupTimeStr = b.pickupDateTime
          ? new Date(b.pickupDateTime).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: true })
          : "08:00 AM";

        const carReg = b.vehicle?.registrationNumber || (b.vehicle?.model ? `${b.vehicle.model}` : "Pending Car Assignment");
        const fareKms = b.rentalDurationKms 
          ? String(b.rentalDurationKms) 
          : (b.estimatedDistance ? String(Math.round(Number(b.estimatedDistance))) : (b.type === "AIRPORT_TRANSFER" ? "45" : (b.type === "OUTSTATION" ? "250" : "80")));
        const fareHrs = b.rentalDurationHrs ? String(b.rentalDurationHrs) : (b.type === "AIRPORT_TRANSFER" ? "4.0" : "8.0");
        const tollTax = b.taxAmount ? String(Math.round(Number(b.taxAmount))) : "0";

        let accountLabel = "Individual Client Transit";
        if (b.type === "AIRPORT_TRANSFER") accountLabel = "Airport Transfer / Pickup & Drop";
        else if (b.type === "LOCAL_RENTAL") accountLabel = "Local City Mobility (Hourly)";
        else if (b.type === "OUTSTATION") accountLabel = "Intercity Outstation Journey";
        else if (b.type === "TOUR_PACKAGE") accountLabel = "Tour Package Itinerary";

        return {
          id: b.id,
          tripSheetNo: b.bookingNumber,
          carNo: carReg,
          date: bookingDate,
          reportedTo: b.customer?.name || "Customer Lead",
          account: accountLabel,
          reportAt: b.pickupLocation || "Pickup Hub",
          
          garageDepartureTime: "06:30 AM",
          garageOpeningKm: "45100",
          reportingTime: pickupTimeStr,
          reportingKm: "45115",
          releaseTime: "06:30 PM",
          releaseKm: String(45115 + (parseInt(fareKms) || 80)),
          garagingTime: "07:30 PM",
          garagingKm: String(45115 + (parseInt(fareKms) || 80) + 15),
          totalHours: fareHrs,
          totalKms: fareKms,
          remarks: b.notes || `${b.type} Dispatched Trip Sheet`,

          serviceFeedback: "EXCELLENT",
          parkingTollTax: tollTax,
          releaseDate: b.returnDateTime 
            ? new Date(b.returnDateTime).toISOString().split("T")[0] 
            : bookingDate,
          placeOfRelease: b.dropLocation || "Destination Hub",
          mobile: b.customer?.phone || "+91 98201 12233",

          officeTo: "Corporate Billing & Operations Desk",
          bookedBy: b.customer?.name || "SPOC Desk",
          officeFor: b.type,
          garageInTime: "07:30 PM",
          garageInKm: String(45115 + (parseInt(fareKms) || 80) + 15),
          officeReleasePlace: b.dropLocation || "Drop Hub",
          parkingAmount: tollTax,
          handoverPerson: driverName,
          handoverDate: bookingDate,
          handoverTime: "07:45 PM",
          officeRemarks: `Status: ${b.status} | Net: ₹${Number(b.netAmount || 0).toLocaleString()}`,

          usageTracks: [
            { id: "1", from: "Garage", to: b.pickupLocation || "Pickup Hub", details: "Reporting Leg" },
            { id: "2", from: b.pickupLocation || "Pickup Hub", to: b.dropLocation || "Drop Location", details: "Passenger Commute" }
          ],

          slipImageUrl: "/images/hero/hero-bg.webp",
          slipImageName: `duty_slip_${b.bookingNumber}.jpg`,
          createdAt: b.createdAt.toISOString(),
          updatedAt: b.updatedAt.toISOString(),
        };
      });
    } catch (e) {
      console.warn("Could not query bookings for duties:", e);
    }

    // 4. Combine all sources and deduplicate by ID and tripSheetNo
    const combined = [...customSlips, ...dutySlipsStore, ...bookingDuties];
    const seen = new Set<string>();
    let filtered: DutySlipRecord[] = [];

    for (const item of combined) {
      if (!item || !item.id) continue;
      // Filter out permanently deleted IDs or tripSheetNos
      if (deletedIds.includes(item.id) || (item.tripSheetNo && deletedIds.includes(item.tripSheetNo))) {
        continue;
      }
      if (seen.has(item.id) || (item.tripSheetNo && seen.has(item.tripSheetNo))) {
        continue;
      }
      seen.add(item.id);
      if (item.tripSheetNo) seen.add(item.tripSheetNo);
      filtered.push(item);
    }

    // 5. Apply filters
    if (search) {
      filtered = filtered.filter(
        (ds) =>
          ds.tripSheetNo.toLowerCase().includes(search) ||
          ds.carNo.toLowerCase().includes(search) ||
          ds.reportedTo.toLowerCase().includes(search) ||
          ds.account.toLowerCase().includes(search) ||
          ds.reportAt.toLowerCase().includes(search) ||
          ds.mobile.includes(search) ||
          ds.placeOfRelease.toLowerCase().includes(search) ||
          ds.handoverPerson.toLowerCase().includes(search)
      );
    }

    if (date) {
      filtered = filtered.filter((ds) => ds.date === date);
    }

    if (feedback && feedback !== "ALL") {
      filtered = filtered.filter((ds) => ds.serviceFeedback.toUpperCase() === feedback.toUpperCase());
    }

    // Sort by createdAt descending
    filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    return NextResponse.json({
      success: true,
      total: filtered.length,
      duties: filtered,
    });
  } catch (error) {
    console.error("GET /api/duties error:", error);
    return NextResponse.json({ error: "Failed to fetch duty slips" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    if (!body.tripSheetNo || !body.carNo) {
      return NextResponse.json({ error: "Trip Sheet No and Car No are required" }, { status: 400 });
    }

    const newRecord: DutySlipRecord = {
      id: body.id || `DS-${Date.now()}`,
      tripSheetNo: body.tripSheetNo || `TT-DS-${Math.floor(1000 + Math.random() * 9000)}`,
      carNo: body.carNo || "",
      date: body.date || new Date().toISOString().split("T")[0],
      reportedTo: body.reportedTo || "",
      account: body.account || "Individual Client Rental",
      reportAt: body.reportAt || "",
      
      // Time & KMs
      garageDepartureTime: body.garageDepartureTime || "06:30 AM",
      garageOpeningKm: body.garageOpeningKm || "45100",
      reportingTime: body.reportingTime || "07:30 AM",
      reportingKm: body.reportingKm || "45115",
      releaseTime: body.releaseTime || "06:30 PM",
      releaseKm: body.releaseKm || "45195",
      garagingTime: body.garagingTime || "07:30 PM",
      garagingKm: body.garagingKm || "45210",
      totalHours: body.totalHours || "8.0",
      totalKms: body.totalKms || "80",
      remarks: body.remarks || "",

      // Feedback & Settlement
      serviceFeedback: body.serviceFeedback || "EXCELLENT",
      parkingTollTax: body.parkingTollTax || "0",
      releaseDate: body.releaseDate || body.date || new Date().toISOString().split("T")[0],
      placeOfRelease: body.placeOfRelease || "",
      mobile: body.mobile || "",

      // Office Use
      officeTo: body.officeTo || "Operations & Billing Desk",
      bookedBy: body.bookedBy || "",
      officeFor: body.officeFor || "Corporate / Retail Transit",
      garageInTime: body.garageInTime || body.garagingTime || "07:30 PM",
      garageInKm: body.garageInKm || body.garagingKm || "45210",
      officeReleasePlace: body.officeReleasePlace || body.placeOfRelease || "",
      parkingAmount: body.parkingAmount || body.parkingTollTax || "0",
      handoverPerson: body.handoverPerson || "Chauffeur",
      handoverDate: body.handoverDate || body.date || new Date().toISOString().split("T")[0],
      handoverTime: body.handoverTime || "07:45 PM",
      officeRemarks: body.officeRemarks || "",

      usageTracks: Array.isArray(body.usageTracks) ? body.usageTracks : [],

      slipImageUrl: body.slipImageUrl || "",
      slipImageName: body.slipImageName || "duty_slip_scan.jpg",

      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // 1. Persist to PostgreSQL via SiteSetting registry
    const currentList = await getCustomDutySlips();
    const updatedList = [newRecord, ...currentList.filter(d => d.id !== newRecord.id)];
    await saveCustomDutySlips(updatedList);

    // 2. Also keep in runtime store
    dutySlipsStore.unshift(newRecord);

    return NextResponse.json({
      success: true,
      message: "Duty slip recorded successfully",
      duty: newRecord,
    }, { status: 201 });
  } catch (error) {
    console.error("POST /api/duties error:", error);
    return NextResponse.json({ error: "Failed to create duty slip" }, { status: 500 });
  }
}
