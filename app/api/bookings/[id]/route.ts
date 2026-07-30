import { NextRequest, NextResponse } from "next/server";
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

    return NextResponse.json(booking, { status: 200 });
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
    const { status, vehicleId, notes } = body;

    const updateData: any = {};
    if (status) updateData.status = status;
    if (notes !== undefined) updateData.notes = notes;
    
    if (vehicleId !== undefined) {
      updateData.vehicleId = vehicleId || null;
      // If assigning a vehicle and status is PENDING or CONFIRMED, automatically advance status to VEHICLE_ASSIGNED
      if (vehicleId && (!status || status === "PENDING" || status === "CONFIRMED")) {
        updateData.status = "VEHICLE_ASSIGNED";
      }
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

    return NextResponse.json(updatedBooking, { status: 200 });
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

    return NextResponse.json({ message: "Booking deleted successfully" }, { status: 200 });
  } catch (error) {
    console.error(`DELETE /api/bookings/${id} error:`, error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
