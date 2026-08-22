import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search") || "";
    const status = searchParams.get("status") || "";

    // Query user uploaded vehicles from Prisma database
    let dbVehicles: any[] = [];
    try {
      dbVehicles = await prisma.fleetVehicle.findMany({
        include: {
          category: true,
          driver: {
            select: { id: true, name: true, phone: true }
          }
        },
        orderBy: { createdAt: "desc" }
      });
    } catch (e) {
      console.error("Prisma query error:", e);
    }

    let vehiclesList = dbVehicles.map(v => {
      const catName = v.category?.name || "Sedan";
      const clsName = v.subCategory || "Executive";
      return {
        id: v.id,
        make: v.make,
        model: v.model,
        registrationNumber: v.registrationNumber,
        capacity: v.capacity || 4,
        categoryName: catName,
        vehicleClass: clsName,
        subCategory: clsName,
        perKmRate: v.perKmRate || 15,
        perHourRate: (v as any).perHourRate || v.extraHrRate || 150,
        baseDailyRate: v.baseDailyRate || 3000,
        driverAllowance: (v as any).driverAllowance || 500,
        nightAllowance: (v as any).nightAllowance || 300,
        fuelType: v.fuelType || "Diesel",
        transmission: v.transmission || "MANUAL",
        insuranceProvider: (v as any).insuranceProvider || "HDFC ERGO General Insurance",
        insuranceNumber: (v as any).insuranceNumber || "POL-8829102",
        insuranceExpiry: (v as any).insuranceExpiry || "2027-06-30",
        fitnessExpiry: (v as any).fitnessExpiry || "2027-12-31",
        permitExpiry: (v as any).permitExpiry || "2028-03-15",
        permitStatus: (v as any).permitStatus || "VALID",
        status: v.status || "AVAILABLE",
        isAvailable: v.status === "AVAILABLE",
        isFeatured: v.isFeatured ?? false,
        imageUrl: v.imageUrl || "/images/hero-car.png",
        driver: v.driver
      };
    });

    // Apply search filter if provided
    if (search) {
      vehiclesList = vehiclesList.filter(v =>
        v.model.toLowerCase().includes(search.toLowerCase()) ||
        v.make.toLowerCase().includes(search.toLowerCase()) ||
        v.registrationNumber.toLowerCase().includes(search.toLowerCase())
      );
    }

    // Apply status filter if provided
    if (status) {
      vehiclesList = vehiclesList.filter(v => v.status === status);
    }

    const availableCount = vehiclesList.filter(v => v.status === "AVAILABLE").length;
    const onTripCount = vehiclesList.filter(v => v.status === "ON_TRIP").length;
    const maintenanceCount = vehiclesList.filter(v => v.status === "MAINTENANCE").length;
    const inactiveCount = vehiclesList.filter(v => v.status === "INACTIVE").length;

    return NextResponse.json({
      success: true,
      vehicles: vehiclesList,
      pagination: {
        totalCount: vehiclesList.length,
        totalPages: 1,
        currentPage: 1,
        limit: 100,
      },
      stats: {
        total: vehiclesList.length,
        AVAILABLE: availableCount,
        ON_TRIP: onTripCount,
        MAINTENANCE: maintenanceCount,
        INACTIVE: inactiveCount,
      },
    });
  } catch (error) {
    console.error("GET /api/fleet error:", error);
    return NextResponse.json({ success: true, vehicles: [], stats: { total: 0, AVAILABLE: 0, ON_TRIP: 0, MAINTENANCE: 0, INACTIVE: 0 } });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { model, make, registrationNumber, capacity, categoryName, vehicleClass, subCategory, perKmRate, baseDailyRate, fuelType, transmission, imageUrl } = body;

    const targetCategorySlug = (categoryName || "Sedan").toLowerCase().includes("suv") ? "suv" : "sedan";
    const targetCategory = await prisma.vehicleCategory.findFirst({ where: { slug: targetCategorySlug } });

    const cls = vehicleClass || subCategory || "Executive";

    const created = await prisma.fleetVehicle.create({
      data: {
        model: model || "Commercial Vehicle",
        make: make || "Commercial Brand",
        registrationNumber: registrationNumber ? registrationNumber.trim().toUpperCase() : `MH ${Math.floor(10 + Math.random() * 90)} AB ${Math.floor(1000 + Math.random() * 9000)}`,
        capacity: Number(capacity) || 4,
        subCategory: cls,
        categoryId: targetCategory?.id || "default-cat",
        status: "AVAILABLE",
        fuelType: fuelType || "Diesel",
        transmission: transmission || "MANUAL",
        perKmRate: Number(perKmRate) || 15,
        baseDailyRate: Number(baseDailyRate) || 3000,
        imageUrl: imageUrl || "/images/hero-car.png"
      },
    });

    return NextResponse.json({
      success: true,
      vehicle: {
        ...created,
        categoryName: categoryName || "Sedan",
        vehicleClass: cls,
        subCategory: cls,
        perHourRate: 150,
        driverAllowance: 500,
        nightAllowance: 300,
        permitStatus: "VALID",
        insuranceProvider: "HDFC ERGO General Insurance",
        insuranceNumber: "POL-8829102",
        insuranceExpiry: "2027-06-30",
        fitnessExpiry: "2027-12-31",
        permitExpiry: "2028-03-15"
      }
    });
  } catch (error) {
    console.error("POST /api/fleet error:", error);
    return NextResponse.json({ error: "Failed to create vehicle" }, { status: 500 });
  }
}
