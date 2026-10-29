import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const vehicle = await prisma.fleetVehicle.findUnique({
      where: { id },
      include: { category: true, driver: true }
    });

    if (!vehicle) {
      return NextResponse.json({ error: "Vehicle not found" }, { status: 404 });
    }

    let meta: any = {};
    if (vehicle.vehicleType && vehicle.vehicleType.startsWith("{")) {
      try {
        meta = JSON.parse(vehicle.vehicleType);
      } catch (e) {}
    }

    return NextResponse.json({
      success: true,
      vehicle: {
        ...vehicle,
        categoryName: vehicle.category?.name || "Sedan",
        vehicleClass: vehicle.subCategory || "Executive",
        ...meta
      }
    });
  } catch (error) {
    console.error("GET /api/fleet/[id] error:", error);
    return NextResponse.json({ error: "Failed to fetch vehicle" }, { status: 500 });
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
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

    const updated = await prisma.fleetVehicle.update({
      where: { id },
      data: {
        model: model || undefined,
        make: make || undefined,
        registrationNumber: registrationNumber ? registrationNumber.trim().toUpperCase() : undefined,
        capacity: capacity ? Number(capacity) : undefined,
        subCategory: cls,
        vehicleType: JSON.stringify(metadataPayload),
        categoryId: targetCategory.id,
        fuelType: fuelType || undefined,
        transmission: transmission || undefined,
        perKmRate: perKmRate ? Number(perKmRate) : undefined,
        baseDailyRate: baseDailyRate ? Number(baseDailyRate) : undefined,
        imageUrl: imageUrl || undefined
      }
    });

    return NextResponse.json({
      success: true,
      vehicle: {
        ...body,
        id: updated.id,
        make: updated.make,
        model: updated.model,
        registrationNumber: updated.registrationNumber,
        categoryName: targetCategory.name,
        vehicleClass: cls,
        subCategory: cls,
        ...metadataPayload,
        imageUrl: updated.imageUrl
      }
    });
  } catch (error) {
    console.error("PUT /api/fleet/[id] error:", error);
    return NextResponse.json({ error: "Failed to update vehicle" }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await prisma.fleetVehicle.delete({
      where: { id }
    });
    return NextResponse.json({ success: true, message: "Vehicle deleted successfully" });
  } catch (error) {
    console.error("DELETE /api/fleet/[id] error:", error);
    return NextResponse.json({ error: "Failed to delete vehicle" }, { status: 500 });
  }
}
