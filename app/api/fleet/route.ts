import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { fleetVehicleSchema } from "@/lib/validations/fleet";
import { verifyAdmin } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search") || "";
    const categoryId = searchParams.get("categoryId") || "";
    const status = searchParams.get("status") || "";
    const fuelType = searchParams.get("fuelType") || "";
    const transmission = searchParams.get("transmission") || "";
    const featuredParam = searchParams.get("featured");
    const sortBy = searchParams.get("sortBy") || "createdAt";
    const sortOrder = searchParams.get("sortOrder") === "asc" ? "asc" : "desc";
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "10", 10);
    const skip = (page - 1) * limit;

    const where: any = {};
    if (categoryId) where.categoryId = categoryId;
    if (status) where.status = status;
    if (fuelType) where.fuelType = fuelType;
    if (transmission) where.transmission = transmission;
    if (featuredParam === "true") where.isFeatured = true;

    if (search) {
      where.OR = [
        { model: { contains: search, mode: "insensitive" } },
        { make: { contains: search, mode: "insensitive" } },
        { registrationNumber: { contains: search, mode: "insensitive" } },
      ];
    }

    let orderBy: any = { createdAt: sortOrder };
    if (sortBy === "model") {
      orderBy = { model: sortOrder };
    } else if (sortBy === "registrationNumber") {
      orderBy = { registrationNumber: sortOrder };
    } else if (sortBy === "capacity") {
      orderBy = { capacity: sortOrder };
    } else if (sortBy === "createdAt") {
      orderBy = { createdAt: sortOrder };
    }

    const totalCount = await prisma.fleetVehicle.count({ where });

    const vehicles = await prisma.fleetVehicle.findMany({
      where,
      include: {
        category: true,
        driver: {
          select: { id: true, name: true, phone: true, email: true }
        }
      },
      orderBy,
      skip,
      take: limit,
    });

    const [availableCount, onTripCount, maintenanceCount, inactiveCount] = await Promise.all([
      prisma.fleetVehicle.count({ where: { status: "AVAILABLE" } }),
      prisma.fleetVehicle.count({ where: { status: "ON_TRIP" } }),
      prisma.fleetVehicle.count({ where: { status: "MAINTENANCE" } }),
      prisma.fleetVehicle.count({ where: { status: "INACTIVE" } }),
    ]);

    const response = NextResponse.json({
      vehicles,
      pagination: {
        totalCount,
        totalPages: Math.ceil(totalCount / limit) || 1,
        currentPage: page,
        limit,
      },
      stats: {
        total: availableCount + onTripCount + maintenanceCount + inactiveCount,
        AVAILABLE: availableCount,
        ON_TRIP: onTripCount,
        MAINTENANCE: maintenanceCount,
        INACTIVE: inactiveCount,
      }
    }, { status: 200 });
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

    const registrationUpper = result.data.registrationNumber.trim().toUpperCase();
    const existing = await prisma.fleetVehicle.findUnique({
      where: { registrationNumber: registrationUpper }
    });

    if (existing) {
      return NextResponse.json({ error: "Vehicle with this registration number already exists" }, { status: 400 });
    }

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
      },
      include: {
        category: true,
        driver: {
          select: { id: true, name: true, phone: true, email: true }
        }
      }
    });

    return NextResponse.json(vehicle, { status: 201 });
  } catch (error) {
    console.error("POST /api/fleet error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
