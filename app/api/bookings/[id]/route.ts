import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import prisma from "@/lib/prisma";
import { verifyAdmin } from "@/lib/auth";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(
  req: NextRequest,
  { params }: RouteParams
) {
  const { id } = await params;
  try {
    const isAdmin = await verifyAdmin(req);
    if (!isAdmin) {
      return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
    }

    const booking = await prisma.booking.findUnique({
      where: { id },
      include: {
        customer: {
          select: { name: true, phone: true, email: true }
        },
        vehicleCategory: {
          select: { id: true, name: true, slug: true }
        },
        vehicle: {
          select: {
            id: true,
            registrationNumber: true,
            model: true,
            driver: {
              select: { name: true, phone: true }
            }
          }
        },
        payments: true
      }
    });

    if (!booking) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 });
    }

    let customDriver = null;
    if (booking.notes) {
      const match = booking.notes.match(/\[AssignedDriver:\s*([^|\]]+)\|([^|\]]+)(?:\|([^\]]+))?\]/);
      if (match) {
        customDriver = {
          name: match[1].trim(),
          phone: match[2].trim(),
          id: match[3]?.trim() || null
        };
      }
    }
    const activeDriver = customDriver || booking.vehicle?.driver || null;

    const enrichedBooking = {
      ...booking,
      driver: activeDriver,
      vehicle: booking.vehicle ? {
        ...booking.vehicle,
        driver: activeDriver
      } : (activeDriver ? {
        id: "",
        model: "Commercial Fleet",
        registrationNumber: "Pending Vehicle",
        driver: activeDriver
      } : null)
    };

    return NextResponse.json(enrichedBooking, { status: 200 });
  } catch (error) {
    console.error(`GET /api/bookings/${id} error:`, error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function PUT(
  req: NextRequest,
  { params }: RouteParams
) {
  const { id } = await params;
  try {
    const isAdmin = await verifyAdmin(req);
    if (!isAdmin) {
      return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
    }

    const body = await req.json();
    const { status, vehicleId, driverId, notes, tripType, type } = body;

    const currentBooking = await prisma.booking.findUnique({
      where: { id },
      select: { notes: true, status: true, type: true }
    });

    const updateData: any = {};
    if (status) updateData.status = status;

    const finalTripType = tripType || type;
    if (finalTripType) {
      let bType = "LOCAL_RENTAL";
      const tripLower = finalTripType.toLowerCase();
      if (tripLower.includes("outstation")) bType = "OUTSTATION";
      else if (tripLower.includes("airport") || tripLower.includes("pickup") || tripLower.includes("drop") || tripLower.includes("transfer")) {
        bType = "AIRPORT_TRANSFER";
      } else if (tripLower.includes("tour")) bType = "TOUR_PACKAGE";
      updateData.type = bType;
    }
    
    // Resolve notes with assigned driver tag and trip type tag
    let effectiveNotes = notes !== undefined ? notes : (currentBooking?.notes || "");
    if (finalTripType) {
      if (effectiveNotes.includes("[TripType:")) {
        effectiveNotes = effectiveNotes.replace(/\[TripType:\s*([^\]]+)\]/i, `[TripType: ${finalTripType}]`);
      } else {
        effectiveNotes = `[TripType: ${finalTripType}] ${effectiveNotes}`.trim();
      }
    }
    if (driverId !== undefined) {
      // Strip any existing driver tag first
      effectiveNotes = effectiveNotes.replace(/\[AssignedDriver:\s*[^\]]+\]/g, "").trim();
      if (driverId) {
        const drv = await prisma.user.findFirst({
          where: { id: driverId },
          select: { id: true, name: true, phone: true }
        });
        if (drv) {
          effectiveNotes = `${effectiveNotes} [AssignedDriver: ${drv.name}|${drv.phone}|${drv.id}]`.trim();
        }
      }
      updateData.notes = effectiveNotes;
    } else if (notes !== undefined || finalTripType) {
      updateData.notes = effectiveNotes;
    }
    
    if (vehicleId !== undefined) {
      updateData.vehicleId = vehicleId || null;
      // If assigning a vehicle and status is PENDING or CONFIRMED, automatically advance status
      if (vehicleId && (!status || status === "PENDING" || status === "CONFIRMED")) {
        updateData.status = "VEHICLE_ASSIGNED";
      }
    }

    if (driverId && !vehicleId && (!status || status === "PENDING" || status === "CONFIRMED")) {
      updateData.status = "DRIVER_ASSIGNED";
    }

    const updatedBooking = await prisma.booking.update({
      where: { id },
      data: updateData,
      include: {
        customer: {
          select: { name: true, phone: true, email: true }
        },
        vehicleCategory: {
          select: { id: true, name: true, slug: true }
        },
        vehicle: {
          select: {
            id: true,
            registrationNumber: true,
            model: true,
            driver: {
              select: { name: true, phone: true }
            }
          }
        },
        payments: true
      }
    });

    let customDriver = null;
    if (updatedBooking.notes) {
      const match = updatedBooking.notes.match(/\[AssignedDriver:\s*([^|\]]+)\|([^|\]]+)(?:\|([^\]]+))?\]/);
      if (match) {
        customDriver = {
          name: match[1].trim(),
          phone: match[2].trim(),
          id: match[3]?.trim() || null
        };
      }
    }
    const activeDriver = customDriver || updatedBooking.vehicle?.driver || null;

    const enrichedResult = {
      ...updatedBooking,
      driver: activeDriver,
      vehicle: updatedBooking.vehicle ? {
        ...updatedBooking.vehicle,
        driver: activeDriver
      } : (activeDriver ? {
        id: "",
        model: "Commercial Fleet",
        registrationNumber: "Pending Vehicle",
        driver: activeDriver
      } : null)
    };

    return NextResponse.json(enrichedResult, { status: 200 });
  } catch (error) {
    console.error(`PUT /api/bookings/${id} error:`, error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: RouteParams
) {
  const { id } = await params;
  try {
    const isAdmin = await verifyAdmin(req);
    if (!isAdmin) {
      return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
    }

    await prisma.booking.delete({
      where: { id }
    });

    try {
      revalidatePath("/admin");
      revalidatePath("/admin/bookings-dispatch");
      revalidatePath("/admin/tour-leads");
    } catch (e) {
      console.warn("revalidatePath error in DELETE /api/bookings/[id]:", e);
    }

    return NextResponse.json({ message: "Booking deleted successfully" }, { status: 200 });
  } catch (error) {
    console.error(`DELETE /api/bookings/${id} error:`, error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
