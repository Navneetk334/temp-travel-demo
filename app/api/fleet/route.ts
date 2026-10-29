import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search") || "";
    const status = searchParams.get("status") || "";
    const minimal = searchParams.get("minimal") === "true";

    // Query user uploaded vehicles from Prisma database
    let dbVehicles: any[] = [];
    try {
      const queryOpts: any = { orderBy: { createdAt: "desc" } };
      
      if (minimal) {
        queryOpts.select = {
          id: true,
          make: true,
          model: true,
          registrationNumber: true,
          capacity: true,
          subCategory: true,
          vehicleType: true,
          status: true,
          category: { select: { name: true } },
          driver: { select: { id: true, name: true, phone: true } }
        };
      } else {
        queryOpts.include = {
          category: true,
          driver: {
            select: { id: true, name: true, phone: true }
          }
        };
      }

      dbVehicles = await prisma.fleetVehicle.findMany(queryOpts);
    } catch (e) {
      console.error("Prisma query error:", e);
    }

    let vehiclesList = dbVehicles.map(v => {
      const catName = v.category?.name || "Sedan";
      const clsName = v.subCategory || "Executive";

      // Unpack documents metadata stored in vehicleType
      let meta: any = {};
      if (v.vehicleType && v.vehicleType.startsWith("{")) {
        try {
          meta = JSON.parse(v.vehicleType);
        } catch (e) {
          // fallback
        }
      }

      return {
        id: v.id,
        make: v.make,
        model: v.model,
        registrationNumber: v.registrationNumber,
        capacity: v.capacity || 4,
        categoryName: catName,
        vehicleClass: clsName,
        subCategory: clsName,
        perKmRate: Number(v.perKmRate) || 15,
        perHourRate: Number(meta.perHourRate) || Number((v as any).perHourRate) || Number(v.extraHrRate) || 150,
        baseDailyRate: Number(v.baseDailyRate) || 3000,
        driverAllowance: Number(meta.driverAllowance) || Number((v as any).driverAllowance) || 500,
        nightAllowance: Number(meta.nightAllowance) || Number((v as any).nightAllowance) || 300,
        fuelType: v.fuelType || "Diesel",
        transmission: v.transmission || "MANUAL",
        // RC Details
        rcNumber: meta.rcNumber || `RC-${v.registrationNumber}`,
        rcDocName: meta.rcDocName || "",
        // Insurance Details
        insuranceProvider: meta.insuranceProvider || "HDFC ERGO General Insurance",
        insuranceNumber: meta.insuranceNumber || "POL-8829102",
        insuranceDocName: meta.insuranceDocName || "",
        insuranceExpiry: meta.insuranceExpiry || "2027-06-30",
        // Fitness Details
        fitnessExpiry: meta.fitnessExpiry || "2027-12-31",
        fitnessDocName: meta.fitnessDocName || "",
        // Permits & Tax & PUC
        permitExpiry: meta.allIndiaPermitExpiry || meta.permitExpiry || "2028-03-15",
        allIndiaPermitExpiry: meta.allIndiaPermitExpiry || meta.permitExpiry || "2028-03-15",
        allIndiaPermitDocName: meta.allIndiaPermitDocName || "",
        yearlyPermitExpiry: meta.yearlyPermitExpiry || "2027-03-15",
        yearlyPermitDocName: meta.yearlyPermitDocName || "",
        pucExpiry: meta.pucExpiry || "2026-11-30",
        pucDocName: meta.pucDocName || "",
        permitStatus: "VALID",
        status: v.status || "AVAILABLE",
        isAvailable: v.status === "AVAILABLE",
        isFeatured: v.isFeatured ?? false,
        imageName: meta.imageName || "",
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
    const { 
      model, 
      make, 
      registrationNumber, 
      capacity, 
      categoryName, 
      vehicleClass, 
      subCategory, 
      perKmRate, 
      baseDailyRate, 
      fuelType, 
      transmission, 
      imageUrl,
      rcNumber,
      rcDocName,
      insuranceProvider,
      insuranceNumber,
      insuranceDocName,
      insuranceExpiry,
      fitnessExpiry,
      fitnessDocName,
      allIndiaPermitExpiry,
      allIndiaPermitDocName,
      yearlyPermitExpiry,
      yearlyPermitDocName,
      pucExpiry,
      pucDocName,
      perHourRate,
      driverAllowance,
      nightAllowance,
      imageName
    } = body;

    const targetCategorySlug = (categoryName || "Sedan").toLowerCase().includes("suv") ? "suv" : "sedan";
    const targetCategoryName = targetCategorySlug === "suv" ? "SUV" : "Sedan";

    // Auto-ensure vehicle category exists in DB so foreign key never fails
    let targetCategory = await prisma.vehicleCategory.findFirst({
      where: {
        OR: [
          { slug: targetCategorySlug },
          { name: { equals: targetCategoryName, mode: "insensitive" } }
        ]
      }
    });

    if (!targetCategory) {
      targetCategory = await prisma.vehicleCategory.create({
        data: {
          name: targetCategoryName,
          slug: targetCategorySlug,
          description: `Premium ${targetCategoryName} Fleet`,
          baseHourlyRate: targetCategorySlug === "suv" ? 200 : 150,
          baseKmsRate: targetCategorySlug === "suv" ? 18 : 14,
          extraHrRate: targetCategorySlug === "suv" ? 200 : 150,
          extraKmRate: targetCategorySlug === "suv" ? 18 : 14,
          outstationKmRate: targetCategorySlug === "suv" ? 18 : 14
        }
      });
    }

    const cls = vehicleClass || subCategory || "Executive";

    // Pack complete document metadata and rates into vehicleType field for DB persistence
    const metadataPayload = {
      rcNumber: rcNumber || "",
      rcDocName: rcDocName || "",
      insuranceProvider: insuranceProvider || "HDFC ERGO General Insurance",
      insuranceNumber: insuranceNumber || "",
      insuranceDocName: insuranceDocName || "",
      insuranceExpiry: insuranceExpiry || "2027-06-30",
      fitnessExpiry: fitnessExpiry || "2027-12-31",
      fitnessDocName: fitnessDocName || "",
      allIndiaPermitExpiry: allIndiaPermitExpiry || "2028-03-15",
      allIndiaPermitDocName: allIndiaPermitDocName || "",
      yearlyPermitExpiry: yearlyPermitExpiry || "2027-03-15",
      yearlyPermitDocName: yearlyPermitDocName || "",
      pucExpiry: pucExpiry || "2026-11-30",
      pucDocName: pucDocName || "",
      perHourRate: Number(perHourRate) || 150,
      driverAllowance: Number(driverAllowance) || 500,
      nightAllowance: Number(nightAllowance) || 300,
      imageName: imageName || ""
    };

    const regNum = registrationNumber ? registrationNumber.trim().toUpperCase() : `MH ${Math.floor(10 + Math.random() * 90)} AB ${Math.floor(1000 + Math.random() * 9000)}`;

    const created = await prisma.fleetVehicle.create({
      data: {
        model: model || "Commercial Vehicle",
        make: make || "Commercial Brand",
        registrationNumber: regNum,
        capacity: Number(capacity) || 4,
        subCategory: cls,
        vehicleType: JSON.stringify(metadataPayload),
        categoryId: targetCategory.id,
        status: "AVAILABLE",
        fuelType: fuelType || "Diesel",
        transmission: transmission || "MANUAL",
        perKmRate: Number(perKmRate) || 14,
        baseDailyRate: Number(baseDailyRate) || 3000,
        imageUrl: imageUrl || "/images/hero-car.png"
      },
    });

    return NextResponse.json({
      success: true,
      vehicle: {
        ...body,
        id: created.id,
        make: created.make,
        model: created.model,
        registrationNumber: created.registrationNumber,
        categoryName: targetCategory.name,
        vehicleClass: cls,
        subCategory: cls,
        status: created.status,
        isAvailable: true,
        permitStatus: "VALID",
        ...metadataPayload,
        imageUrl: created.imageUrl
      }
    });
  } catch (error) {
    console.error("POST /api/fleet error:", error);
    return NextResponse.json({ error: "Failed to create vehicle" }, { status: 500 });
  }
}
