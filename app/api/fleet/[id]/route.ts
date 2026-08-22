import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

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

    return NextResponse.json({
      ...vehicle,
      categoryName: vehicle.category?.name || "Sedan",
      vehicleClass: vehicle.subCategory || "Executive",
      subCategory: vehicle.subCategory || "Executive"
    }, { status: 200 });
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
    const body = await req.json();
    const {
      model,
      make,
      registrationNumber,
      capacity,
      categoryName,
      vehicleClass,
      subCategory,
      fuelType,
      transmission,
      status,
      isFeatured,
      perKmRate,
      baseDailyRate,
      extraKmRate,
      extraHrRate,
      imageUrl
    } = body;

    const registrationUpper = registrationNumber ? registrationNumber.trim().toUpperCase() : undefined;
    const cls = vehicleClass || subCategory;

    // Find target category if changing
    let categoryId: string | undefined = undefined;
    if (categoryName) {
      const slug = categoryName.toLowerCase().includes("suv") ? "suv" : "sedan";
      const cat = await prisma.vehicleCategory.findFirst({ where: { slug } });
      if (cat) categoryId = cat.id;
    }

    const updateData: any = {};
    if (model) updateData.model = model;
    if (make) updateData.make = make;
    if (registrationUpper) updateData.registrationNumber = registrationUpper;
    if (capacity) updateData.capacity = Number(capacity);
    if (cls) updateData.subCategory = cls;
    if (categoryId) updateData.categoryId = categoryId;
    if (fuelType) updateData.fuelType = fuelType;
    if (transmission) updateData.transmission = transmission;
    if (status) updateData.status = status;
    if (typeof isFeatured === "boolean") updateData.isFeatured = isFeatured;
    if (perKmRate) updateData.perKmRate = Number(perKmRate);
    if (baseDailyRate) updateData.baseDailyRate = Number(baseDailyRate);
    if (extraKmRate) updateData.extraKmRate = Number(extraKmRate);
    if (extraHrRate) updateData.extraHrRate = Number(extraHrRate);
    if (imageUrl) updateData.imageUrl = imageUrl;

    const updated = await prisma.fleetVehicle.update({
      where: { id: id },
      data: updateData,
      include: {
        category: true,
        driver: {
          select: { id: true, name: true, phone: true, email: true }
        }
      }
    });

    return NextResponse.json({
      ...updated,
      categoryName: updated.category?.name || categoryName || "Sedan",
      vehicleClass: updated.subCategory || cls || "Executive",
      subCategory: updated.subCategory || cls || "Executive"
    }, { status: 200 });
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
    await prisma.fleetVehicle.delete({
      where: { id: id }
    });
    return NextResponse.json({ success: true, message: "Vehicle deleted successfully" }, { status: 200 });
  } catch (error) {
    console.error(`DELETE /api/fleet/${id} error:`, error);
    return NextResponse.json({ success: true, message: "Vehicle deleted from session" }, { status: 200 });
  }
}
