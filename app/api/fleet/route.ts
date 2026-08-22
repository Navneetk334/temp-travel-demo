import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

const MASTER_UPLOADED_FLEET = [
  {
    id: "v-1",
    make: "Maruti Suzuki",
    model: "Swift Dzire",
    registrationNumber: "MH 02 CZ 4421",
    capacity: 4,
    categoryName: "Sedan",
    subCategory: "Compact Sedan",
    perKmRate: 12,
    baseDailyRate: 2200,
    driverAllowance: 400,
    nightAllowance: 250,
    fuelType: "CNG / Petrol",
    transmission: "MANUAL",
    status: "AVAILABLE",
    imageUrl: "/images/hero-car.png"
  },
  {
    id: "v-2",
    make: "Honda",
    model: "City / Hyundai Verna",
    registrationNumber: "MH 01 AB 1234",
    capacity: 4,
    categoryName: "Sedan",
    subCategory: "Executive Sedan",
    perKmRate: 18,
    baseDailyRate: 3500,
    driverAllowance: 500,
    nightAllowance: 300,
    fuelType: "Petrol",
    transmission: "MANUAL",
    status: "AVAILABLE",
    imageUrl: "/images/hero-car.png"
  },
  {
    id: "v-3",
    make: "Toyota",
    model: "Innova Crysta",
    registrationNumber: "MH 04 ER 8890",
    capacity: 7,
    categoryName: "SUV",
    subCategory: "Premium MPV",
    perKmRate: 22,
    baseDailyRate: 4800,
    driverAllowance: 600,
    nightAllowance: 400,
    fuelType: "Diesel",
    transmission: "MANUAL",
    status: "AVAILABLE",
    imageUrl: "/images/hero-car.png"
  },
  {
    id: "v-4",
    make: "Toyota",
    model: "Fortuner 4x4",
    registrationNumber: "MH 02 FG 9900",
    capacity: 7,
    categoryName: "SUV",
    subCategory: "Luxury SUV",
    perKmRate: 45,
    baseDailyRate: 9500,
    driverAllowance: 1000,
    nightAllowance: 600,
    fuelType: "Diesel",
    transmission: "AUTOMATIC",
    status: "AVAILABLE",
    imageUrl: "/images/hero-car.png"
  },
  {
    id: "v-5",
    make: "Mahindra",
    model: "XUV700 AX7",
    registrationNumber: "MH 03 EY 7711",
    capacity: 7,
    categoryName: "SUV",
    subCategory: "Premium SUV",
    perKmRate: 26,
    baseDailyRate: 5200,
    driverAllowance: 650,
    nightAllowance: 450,
    fuelType: "Diesel",
    transmission: "AUTOMATIC",
    status: "AVAILABLE",
    imageUrl: "/images/hero-car.png"
  },
  {
    id: "v-6",
    make: "Hyundai",
    model: "Creta / Alcazar",
    registrationNumber: "MH 02 DF 5544",
    capacity: 6,
    categoryName: "SUV",
    subCategory: "Mid SUV",
    perKmRate: 20,
    baseDailyRate: 4200,
    driverAllowance: 550,
    nightAllowance: 350,
    fuelType: "Petrol / Diesel",
    transmission: "MANUAL",
    status: "AVAILABLE",
    imageUrl: "/images/hero-car.png"
  },
  {
    id: "v-7",
    make: "Mercedes-Benz",
    model: "E-Class Luxury",
    registrationNumber: "MH 01 CC 9000",
    capacity: 4,
    categoryName: "Sedan",
    subCategory: "Luxury Sedan",
    perKmRate: 75,
    baseDailyRate: 16000,
    driverAllowance: 1500,
    nightAllowance: 1000,
    fuelType: "Diesel",
    transmission: "AUTOMATIC",
    status: "AVAILABLE",
    imageUrl: "/images/hero-car.png"
  },
  {
    id: "v-8",
    make: "BMW",
    model: "5 Series Executive",
    registrationNumber: "MH 01 DD 8000",
    capacity: 4,
    categoryName: "Sedan",
    subCategory: "Luxury Sedan",
    perKmRate: 80,
    baseDailyRate: 17500,
    driverAllowance: 1500,
    nightAllowance: 1000,
    fuelType: "Petrol",
    transmission: "AUTOMATIC",
    status: "AVAILABLE",
    imageUrl: "/images/hero-car.png"
  },
  {
    id: "v-9",
    make: "Force Motors",
    model: "Traveller Executive 17S",
    registrationNumber: "MH 04 TT 1717",
    capacity: 17,
    categoryName: "SUV",
    subCategory: "Executive Coach",
    perKmRate: 32,
    baseDailyRate: 7500,
    driverAllowance: 800,
    nightAllowance: 500,
    fuelType: "Diesel",
    transmission: "MANUAL",
    status: "AVAILABLE",
    imageUrl: "/images/hero-car.png"
  }
];

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search") || "";
    const status = searchParams.get("status") || "";

    // Check database vehicles
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

    // If database vehicles exist, use them formatted; otherwise use MASTER_UPLOADED_FLEET
    let vehiclesList = dbVehicles.length > 0
      ? dbVehicles.map(v => ({
          id: v.id,
          make: v.make,
          model: v.model,
          registrationNumber: v.registrationNumber,
          capacity: v.capacity || 4,
          categoryName: v.category?.name || "Sedan",
          subCategory: v.subCategory || v.category?.name || "Executive Fleet",
          perKmRate: v.perKmRate || 15,
          baseDailyRate: v.baseDailyRate || 3000,
          driverAllowance: v.driverAllowance || 500,
          nightAllowance: v.nightAllowance || 300,
          fuelType: v.fuelType || "Diesel",
          transmission: v.transmission || "MANUAL",
          status: v.status || "AVAILABLE",
          imageUrl: v.imageUrl || "/images/hero-car.png",
          driver: v.driver
        }))
      : MASTER_UPLOADED_FLEET;

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

    const response = NextResponse.json({
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

    response.headers.set("Cache-Control", "public, max-age=10, s-maxage=30, stale-while-revalidate=120");
    return response;
  } catch (error) {
    console.error("GET /api/fleet error:", error);
    return NextResponse.json({ success: true, vehicles: MASTER_UPLOADED_FLEET, stats: { total: 9, AVAILABLE: 9, ON_TRIP: 0, MAINTENANCE: 0, INACTIVE: 0 } });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { model, make, registrationNumber, capacity, categoryName, perKmRate, baseDailyRate, fuelType, transmission } = body;

    // Find category ID or default
    const sedanCat = await prisma.vehicleCategory.findFirst({ where: { slug: "sedan" } });

    const created = await prisma.fleetVehicle.create({
      data: {
        model: model || "Custom Vehicle",
        make: make || "Brand Make",
        registrationNumber: registrationNumber || `MH ${Math.floor(10 + Math.random() * 90)} AB ${Math.floor(1000 + Math.random() * 9000)}`,
        capacity: Number(capacity) || 4,
        categoryId: sedanCat?.id || "default-cat",
        status: "AVAILABLE",
        fuelType: fuelType || "Diesel",
        transmission: transmission || "MANUAL",
        perKmRate: Number(perKmRate) || 15,
        baseDailyRate: Number(baseDailyRate) || 3000,
      },
    });

    return NextResponse.json({ success: true, vehicle: created });
  } catch (error) {
    console.error("POST /api/fleet error:", error);
    return NextResponse.json({ error: "Failed to create vehicle" }, { status: 500 });
  }
}
