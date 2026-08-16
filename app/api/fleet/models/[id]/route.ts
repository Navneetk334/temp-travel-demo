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
    const model = await prisma.vehicleModel.findUnique({
      where: { id },
      include: {
        vehicles: true,
      }
    });

    if (!model) {
      return NextResponse.json({ error: "Vehicle model master not found" }, { status: 404 });
    }

    return NextResponse.json(model, { status: 200 });
  } catch (error) {
    console.error(`GET /api/fleet/models/${id} error:`, error);
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
    const {
      brand,
      modelName,
      category,
      subcategory,
      minSeats,
      maxSeats,
      supportedFuelTypes,
      supportedTransmissionTypes,
      isElectric,
      isActive
    } = body;

    const brandTrim = brand ? brand.trim() : undefined;
    const modelNameTrim = modelName ? modelName.trim() : undefined;

    if (brandTrim && modelNameTrim) {
      const existing = await prisma.vehicleModel.findFirst({
        where: {
          brand: brandTrim,
          modelName: modelNameTrim,
          id: { not: id }
        }
      });
      if (existing) {
        return NextResponse.json({ error: `Vehicle model '${brandTrim} ${modelNameTrim}' already exists.` }, { status: 400 });
      }
    }

    const updated = await prisma.vehicleModel.update({
      where: { id },
      data: {
        ...(brandTrim && { brand: brandTrim }),
        ...(modelNameTrim && { modelName: modelNameTrim }),
        ...(category && { category: category.trim() }),
        ...(subcategory && { subcategory: subcategory.trim() }),
        ...(minSeats !== undefined && { minSeats: Number(minSeats) }),
        ...(maxSeats !== undefined && { maxSeats: Number(maxSeats) }),
        ...(supportedFuelTypes && { supportedFuelTypes }),
        ...(supportedTransmissionTypes && { supportedTransmissionTypes }),
        ...(isElectric !== undefined && { isElectric: Boolean(isElectric) }),
        ...(isActive !== undefined && { isActive: Boolean(isActive) }),
      }
    });

    return NextResponse.json(updated, { status: 200 });
  } catch (error) {
    console.error(`PUT /api/fleet/models/${id} error:`, error);
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

    const modelMaster = await prisma.vehicleModel.findUnique({
      where: { id }
    });

    if (!modelMaster) {
      return NextResponse.json({ error: "Vehicle model not found" }, { status: 404 });
    }

    // Check if any fleet vehicles are assigned to this model master
    const assignedVehiclesCount = await prisma.fleetVehicle.count({
      where: {
        OR: [
          { vehicleModelId: id },
          { make: modelMaster.brand, model: modelMaster.modelName }
        ]
      }
    });

    if (assignedVehiclesCount > 0) {
      return NextResponse.json(
        { error: `Cannot delete model '${modelMaster.brand} ${modelMaster.modelName}' because ${assignedVehiclesCount} active fleet vehicle(s) belong to this model.` },
        { status: 400 }
      );
    }

    await prisma.vehicleModel.delete({
      where: { id }
    });

    return NextResponse.json({ message: "Vehicle model master removed successfully" }, { status: 200 });
  } catch (error) {
    console.error(`DELETE /api/fleet/models/${id} error:`, error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
