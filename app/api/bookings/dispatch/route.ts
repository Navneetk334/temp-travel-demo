import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

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
            { email: customerEmail || "no-email@temptravels.com" },
            { phone: customerPhone || "0000000000" }
          ]
        }
      });
    }

    if (!user) {
      user = await prisma.user.create({
        data: {
          name: customerName || "Unknown Customer",
          email: customerEmail || `customer_${Date.now()}@temptravels.com`,
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
    else if (tripTypeLower.includes("airport")) bType = "AIRPORT_TRANSFER";
    else if (tripTypeLower.includes("tour")) bType = "TOUR_PACKAGE";

    // 3. Create Booking
    const booking = await prisma.booking.create({
      data: {
        bookingNumber: bookingRef || `TT-${Date.now().toString().slice(-6)}`,
        customerId: user.id,
        vehicleId: vehicleId || null,
        vehicleCategoryId: vehicleCategoryId,
        type: bType as any,
        status: "CONFIRMED",
        pickupDateTime: new Date(pickupDateTime),
        pickupLocation: pickupLocation || "TBD",
        dropLocation: dropLocation || null,
        totalAmount: totalAmount - taxAmount,
        taxAmount: taxAmount,
        netAmount: netAmount,
        notes: notes || "Dispatched via Admin",
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

    // 5. Update Lead Status to WON
    if (leadId) {
      try {
        // We attempt to update all 3 types since we don't know the exact type
        await prisma.rentalLead.update({ where: { id: leadId }, data: { status: "WON" } }).catch(() => null);
        await prisma.corporateLead.update({ where: { id: leadId }, data: { status: "WON" } }).catch(() => null);
        await prisma.contactLead.update({ where: { id: leadId }, data: { status: "WON" } }).catch(() => null);
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
