import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { 
      leadId, leadType, 
      vehicleId, driverId, 
      fare, advance, paymentMode, 
      pickupLocation, dropLocation, pickupDateTime, 
      notes, customerName, customerEmail, customerPhone, tripType, bookingRef 
    } = body;

    // 1. Find or Create Customer (User)
    let user = null;
    if (customerEmail || customerPhone) {
      user = await prisma.user.findFirst({
        where: {
          OR: [
            { email: customerEmail || "no-email@temptravel.in" },
            { phone: customerPhone || "0000000000" }
          ]
        }
      });
    }

    if (!user) {
      user = await prisma.user.create({
        data: {
          name: customerName || "Unknown Customer",
          email: customerEmail || `customer_${Date.now()}@temptravel.in`,
          phone: customerPhone || `+910000000000`,
          passwordHash: "dispatch-generated",
          role: "CUSTOMER",
          isActive: true
        }
      });
    }

    // 2. Determine Vehicle Category
    let vehicleCategoryId = null;
    if (vehicleId) {
      const vehicle = await prisma.fleetVehicle.findUnique({ where: { id: vehicleId } });
      if (vehicle) vehicleCategoryId = vehicle.categoryId;
    }
    if (!vehicleCategoryId) {
      const fallbackCat = await prisma.vehicleCategory.findFirst();
      if (!fallbackCat) {
        return NextResponse.json({ error: "No vehicle categories configured" }, { status: 500 });
      }
      vehicleCategoryId = fallbackCat.id;
    }

    const netAmount = Number(fare) || 0;
    const taxAmount = netAmount * 0.05; // 5% GST
    const totalAmount = netAmount; // Net = Total in this logic (fare is total)
    // Actually in the UI fare is Net, so let's use that.
    
    // Determine booking type enum
    let bType = "LOCAL_RENTAL";
    const tripTypeLower = (tripType || "").toLowerCase();
    if (tripTypeLower.includes("outstation")) bType = "OUTSTATION";
    else if (tripTypeLower.includes("airport") || tripTypeLower.includes("pickup") || tripTypeLower.includes("drop") || tripTypeLower.includes("transfer")) {
      bType = "AIRPORT_TRANSFER";
    }
    else if (tripTypeLower.includes("tour")) bType = "TOUR_PACKAGE";

    // 2.5 Resolve explicitly assigned chauffeur if provided
    let driverTag = "";
    if (driverId) {
      try {
        const drv = await prisma.user.findFirst({
          where: { id: driverId },
          select: { id: true, name: true, phone: true }
        });
        if (drv) {
          driverTag = `[AssignedDriver: ${drv.name}|${drv.phone}|${drv.id}]`;
        }
      } catch (err) {
        console.warn("Could not lookup driver details:", err);
      }
    }

    const tripTypeTag = tripType && !notes?.includes("[TripType:") ? `[TripType: ${tripType}]` : "";
    const resolvedDriverTag = driverTag && !notes?.includes("[AssignedDriver:") ? driverTag : "";
    const finalNotes = [tripTypeTag, notes || "Dispatched via Admin", resolvedDriverTag].filter(Boolean).join(" ");

    // 3. Create Booking
    let parsedPickupDateTime = new Date();
    if (pickupDateTime) {
      if (typeof pickupDateTime === "string" && !pickupDateTime.includes("Z") && !pickupDateTime.includes("+")) {
        const withSec = pickupDateTime.length === 16 ? `${pickupDateTime}:00` : pickupDateTime;
        parsedPickupDateTime = new Date(`${withSec}+05:30`);
      } else {
        parsedPickupDateTime = new Date(pickupDateTime);
      }
    }

    const booking = await prisma.booking.create({
      data: {
        bookingNumber: bookingRef || `TT-${Date.now().toString().slice(-6)}`,
        customerId: user.id,
        vehicleId: vehicleId || null,
        vehicleCategoryId: vehicleCategoryId,
        type: bType as any,
        status: "CONFIRMED",
        pickupDateTime: parsedPickupDateTime,
        pickupLocation: pickupLocation || "TBD",
        dropLocation: dropLocation || null,
        totalAmount: totalAmount - taxAmount,
        taxAmount: taxAmount,
        netAmount: netAmount,
        notes: finalNotes,
      },
    });

    // 4. Create Payment if advance is > 0
    if (Number(advance) > 0) {
      await prisma.razorpayPayment.create({
        data: {
          bookingId: booking.id,
          razorpayOrderId: `cash_adv_${Date.now()}`,
          status: paymentMode.toLowerCase().includes("cash") ? "SUCCESS" : "PENDING",
          amount: Number(advance),
          currency: "INR",
          gateway: paymentMode,
        }
      });
    }

    // 5. Update Lead Status to DISPATCHED and persist assigned notes & tripType
    if (leadId) {
      try {
        await prisma.rentalLead.update({ 
          where: { id: leadId }, 
          data: { 
            status: "DISPATCHED",
            notes: finalNotes,
            ...(tripType ? { tripType } : {})
          } 
        }).catch(() => null);
        await prisma.corporateLead.update({ 
          where: { id: leadId }, 
          data: { 
            status: "DISPATCHED",
            notes: finalNotes,
            ...(tripType ? { serviceType: tripType } : {})
          } 
        }).catch(() => null);
        await prisma.contactLead.update({ 
          where: { id: leadId }, 
          data: { 
            status: "DISPATCHED"
          } 
        }).catch(() => null);
      } catch (err) {
        console.warn("Could not update lead status", err);
      }
    }

    return NextResponse.json(booking, { status: 201 });
  } catch (error: any) {
    console.error("POST /api/bookings/dispatch error:", error);
    return NextResponse.json({ error: error.message || "Failed to dispatch booking" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    const phone = searchParams.get("phone");
    const name = searchParams.get("name");

    if (!id && !phone && !name) {
      return NextResponse.json({ error: "Missing dispatch id parameter" }, { status: 400 });
    }

    const cleanPhone = phone ? phone.replace(/\D/g, "").slice(-10) : "";

    // 1. Delete associated Razorpay payments and Bookings
    const bookingOrConditions: any[] = [];
    if (id) {
      bookingOrConditions.push({ id: id });
      bookingOrConditions.push({ bookingNumber: id });
      bookingOrConditions.push({ notes: { contains: id } });
    }
    if (cleanPhone) {
      bookingOrConditions.push({ customer: { phone: { contains: cleanPhone } } });
    }
    if (name) {
      bookingOrConditions.push({ customer: { name: { equals: name, mode: "insensitive" } } });
    }

    const matchingBookings = await prisma.booking.findMany({
      where: {
        OR: bookingOrConditions
      },
      select: { id: true, customerId: true }
    });

    const bookingIds = matchingBookings.map((b) => b.id);
    const customerIds = matchingBookings.map((b) => b.customerId).filter(Boolean);

    if (bookingIds.length > 0) {
      await prisma.razorpayPayment.deleteMany({
        where: { bookingId: { in: bookingIds } }
      });
      await prisma.booking.deleteMany({
        where: { id: { in: bookingIds } }
      });
    }

    // 2. Delete associated Rental Leads
    const rentalOrConditions: any[] = [];
    if (id) {
      rentalOrConditions.push({ id: id });
      rentalOrConditions.push({ notes: { contains: id } });
    }
    if (cleanPhone) {
      rentalOrConditions.push({ phone: { contains: cleanPhone } });
    }
    if (name) {
      rentalOrConditions.push({ customerName: { equals: name, mode: "insensitive" } });
    }

    if (rentalOrConditions.length > 0) {
      await prisma.rentalLead.deleteMany({
        where: {
          OR: rentalOrConditions
        }
      });
    }

    // 3. Delete associated Corporate Leads
    const corpOrConditions: any[] = [];
    if (id) {
      corpOrConditions.push({ id: id });
      corpOrConditions.push({ notes: { contains: id } });
      corpOrConditions.push({ requirements: { contains: id } });
    }
    if (cleanPhone) {
      corpOrConditions.push({ phone: { contains: cleanPhone } });
    }
    if (name) {
      corpOrConditions.push({ contactName: { equals: name, mode: "insensitive" } });
    }

    if (corpOrConditions.length > 0) {
      await prisma.corporateLead.deleteMany({
        where: {
          OR: corpOrConditions
        }
      });
    }

    // 4. Delete orphaned dispatch-generated users
    const userOrConditions: any[] = [];
    if (customerIds.length > 0) {
      userOrConditions.push({ id: { in: customerIds } });
    }
    if (cleanPhone) {
      userOrConditions.push({ phone: { contains: cleanPhone } });
    }
    if (name) {
      userOrConditions.push({ name: { equals: name, mode: "insensitive" } });
    }

    if (userOrConditions.length > 0) {
      await prisma.user.deleteMany({
        where: {
          passwordHash: "dispatch-generated",
          bookings: { none: {} },
          OR: userOrConditions
        }
      });
    }

    // 5. Invalidate relevant caches immediately
    try {
      revalidatePath("/admin");
      revalidatePath("/admin/bookings-dispatch");
      revalidatePath("/admin/local-rental-leads");
      revalidatePath("/admin/outstation-leads");
      revalidatePath("/admin/corporate-leads");
      revalidatePath("/admin/tour-leads");
      revalidatePath("/master-admin");
      revalidatePath("/master-admin/crm");
      revalidatePath("/master-admin/dispatch-radar");
    } catch (e) {
      console.warn("revalidatePath error in DELETE /api/bookings/dispatch:", e);
    }

    return NextResponse.json(
      { success: true, message: `Dispatch records removed successfully.` },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("DELETE /api/bookings/dispatch error:", error);
    return NextResponse.json({ error: error.message || "Failed to delete dispatch" }, { status: 500 });
  }
}
