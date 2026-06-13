import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { fleetVehicleSchema } from "@/lib/validations/fleet";

async function verifyAdmin(req: NextRequest): Promise<boolean> {
  const token = req.cookies.get("next-auth.session-token")?.value || req.cookies.get("__Secure-next-auth.session-token")?.value || req.cookies.get("temp-travel-admin-session")?.value;
  return !!token;
}

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(
  req: NextRequest,
  { params }: RouteParams
) {
  const { id } = await params;
  try {
    const vehicle = await prisma.fleetVehicle.findUnique({
      where: { id: id },
      include: {
        category: true,
        driver: {
          select: { id: true, name: true, phone: true, email: true }
        }
      }
    });

    if (!vehicle) {
      return NextResponse.json({ error: "Vehicle not found" }, { status: 404 });
    }

    return NextResponse.json(vehicle, { status: 200 });
  } catch (error) {
    console.error(`GET /api/fleet/${id} error:`, error);
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
    const result = fleetVehicleSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json({ error: result.error.flatten() }, { status: 400 });
    }

    const registrationUpper = result.data.registrationNumber.trim().toUpperCase();

    // Check registration uniqueness excluding this vehicle
    const registrationExists = await prisma.fleetVehicle.findFirst({
      where: {
        registrationNumber: registrationUpper,
        id: { not: id }
      }
    });
    if (registrationExists) {
      return NextResponse.json({ error: "Vehicle with this registration number already exists" }, { status: 400 });
    }

    // Check driver allocation excluding this vehicle
    if (result.data.driverId) {
      const driverAllocated = await prisma.fleetVehicle.findFirst({
        where: {
          driverId: result.data.driverId,
          id: { not: id }
        }
      });
      if (driverAllocated) {
        return NextResponse.json({ error: "Selected driver is already allocated to another vehicle" }, { status: 400 });
      }
    }

    const updated = await prisma.fleetVehicle.update({
      where: { id: id },
      data: {
        ...result.data,
        registrationNumber: registrationUpper,
      }
    });

    return NextResponse.json(updated, { status: 200 });
  } catch (error) {
    console.error(`PUT /api/fleet/${id} error:`, error);
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

    // Check if vehicle is assigned to active bookings
    const bookingsCount = await prisma.booking.count({
      where: { vehicleId: id, status: { in: ["CONFIRMED", "DRIVER_ASSIGNED", "IN_TRANSIT"] } }
    });

    if (bookingsCount > 0) {
      return NextResponse.json(
        { error: "Cannot delete vehicle assigned to active trips. Terminate or reallocate bookings first." },
        { status: 400 }
      );
    }

    await prisma.fleetVehicle.delete({
      where: { id: id }
    });

    return NextResponse.json({ message: "Vehicle removed successfully" }, { status: 200 });
  } catch (error) {
    console.error(`DELETE /api/fleet/${id} error:`, error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
