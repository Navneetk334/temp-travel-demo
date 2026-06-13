import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { fleetVehicleSchema } from "@/lib/validations/fleet";

async function verifyAdmin(req: NextRequest): Promise<boolean> {
  const token = req.cookies.get("next-auth.session-token")?.value || req.cookies.get("__Secure-next-auth.session-token")?.value || req.cookies.get("temp-travel-admin-session")?.value;
  return !!token;
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const categoryId = searchParams.get("categoryId") || "";
    const status = searchParams.get("status") || "";

    const where: any = {};
    if (categoryId) where.categoryId = categoryId;
    if (status) where.status = status;

    const vehicles = await prisma.fleetVehicle.findMany({
      where,
      include: {
        category: true,
        driver: {
          select: { name: true, phone: true, email: true }
        }
      },
      orderBy: { createdAt: "desc" }
    });

    return NextResponse.json(vehicles, { status: 200 });
  } catch (error) {
    console.error("GET /api/fleet error:", error);
    return NextResponse.json({ error: "Failed to fetch vehicles" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
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

    // Check unique registration number
    const registrationUpper = result.data.registrationNumber.trim().toUpperCase();
    const existing = await prisma.fleetVehicle.findUnique({
      where: { registrationNumber: registrationUpper }
    });

    if (existing) {
      return NextResponse.json({ error: "Vehicle with this registration number already exists" }, { status: 400 });
    }

    // Check unique driver allocation (driverId must be unique on FleetVehicle if not null)
    if (result.data.driverId) {
      const driverAllocated = await prisma.fleetVehicle.findUnique({
        where: { driverId: result.data.driverId }
      });
      if (driverAllocated) {
        return NextResponse.json({ error: "Selected driver is already allocated to another vehicle" }, { status: 400 });
      }
    }

    const vehicle = await prisma.fleetVehicle.create({
      data: {
        ...result.data,
        registrationNumber: registrationUpper,
      }
    });

    return NextResponse.json(vehicle, { status: 201 });
  } catch (error) {
    console.error("POST /api/fleet error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
