import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

async function verifyAdmin(req: NextRequest): Promise<boolean> {
  const token = req.cookies.get("next-auth.session-token")?.value || req.cookies.get("__Secure-next-auth.session-token")?.value || req.cookies.get("temp-travel-admin-session")?.value;
  return !!token;
}

interface RouteParams {
  params: Promise<{ id: string }>;
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
    const { status, vehicleId } = body;

    const updateData: any = {};
    if (status) updateData.status = status;
    
    // Explicitly handle vehicle assignment or clearance
    if (vehicleId !== undefined) {
      updateData.vehicleId = vehicleId || null;
    }

    const updatedBooking = await prisma.booking.update({
      where: { id },
      data: updateData,
      include: {
        vehicle: {
          select: {
            registrationNumber: true,
            driver: {
              select: { name: true, phone: true }
            }
          }
        }
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
