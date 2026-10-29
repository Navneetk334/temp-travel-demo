import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const vehicle = await prisma.fleetVehicle.findFirst({
      where: {
        OR: [{ id }, { registrationNumber: id }]
      },
      include: {
        category: true,
        driver: { select: { id: true, name: true, phone: true } }
      }
    });

    if (!vehicle) {
      return NextResponse.json({ error: "Vehicle not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, vehicle });
  } catch (error) {
    console.error("GET /api/fleet/[id] error:", error);
    return NextResponse.json({ error: "Failed to fetch vehicle" }, { status: 500 });
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return handleUpdate(req, params);
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return handleUpdate(req, params);
}

async function handleUpdate(
  req: NextRequest,
  params: Promise<{ id: string }>
) {
  try {
    const { id } = await params;
    const body = await req.json();

    // Find existing vehicle first by id or registrationNumber
    const existing = await prisma.fleetVehicle.findFirst({
      where: {
        OR: [{ id }, { registrationNumber: id }]
      }
    });

    if (!existing) {
      return NextResponse.json({ error: "Vehicle not found" }, { status: 404 });
    }

    const updateData: any = {};

    if (typeof body.isFeatured === "boolean") {
      updateData.isFeatured = body.isFeatured;
    }

    if (body.make !== undefined) updateData.make = body.make;
    if (body.model !== undefined) updateData.model = body.model;
    if (body.registrationNumber !== undefined) updateData.registrationNumber = body.registrationNumber.trim().toUpperCase();
    if (body.capacity !== undefined) updateData.capacity = Number(body.capacity);
    if (body.fuelType !== undefined) updateData.fuelType = body.fuelType;
    if (body.transmission !== undefined) updateData.transmission = body.transmission;
    if (body.status !== undefined) updateData.status = body.status;
    if (body.imageUrl !== undefined) updateData.imageUrl = body.imageUrl;
    if (body.perKmRate !== undefined) updateData.perKmRate = Number(body.perKmRate);
    if (body.baseDailyRate !== undefined) updateData.baseDailyRate = Number(body.baseDailyRate);
    if (body.extraKmRate !== undefined) updateData.extraKmRate = Number(body.extraKmRate);
    if (body.extraHrRate !== undefined) updateData.extraHrRate = Number(body.extraHrRate);
    if (body.subCategory !== undefined || body.vehicleClass !== undefined) {
      updateData.subCategory = body.vehicleClass || body.subCategory;
    }
    if (body.categoryId !== undefined && body.categoryId) {
      updateData.categoryId = body.categoryId;
    }
    if (body.driverId !== undefined) {
      updateData.driverId = body.driverId || null;
    }

    // Merge document/metadata in vehicleType if provided
    if (
      body.rcNumber ||
      body.rcDocName ||
      body.insuranceProvider ||
      body.insuranceNumber ||
      body.insuranceDocName ||
      body.insuranceExpiry ||
      body.fitnessExpiry ||
      body.fitnessDocName ||
      body.allIndiaPermitExpiry ||
      body.allIndiaPermitDocName ||
      body.yearlyPermitExpiry ||
      body.yearlyPermitDocName ||
      body.pucExpiry ||
      body.pucDocName ||
      body.perHourRate !== undefined ||
      body.driverAllowance !== undefined ||
      body.nightAllowance !== undefined ||
      body.imageName
    ) {
      let currentMeta: any = {};
      if (existing.vehicleType && existing.vehicleType.startsWith("{")) {
        try {
          currentMeta = JSON.parse(existing.vehicleType);
        } catch (e) {
          // ignore
        }
      }
      const updatedMeta = {
        ...currentMeta,
        ...(body.rcNumber ? { rcNumber: body.rcNumber } : {}),
        ...(body.rcDocName ? { rcDocName: body.rcDocName } : {}),
        ...(body.insuranceProvider ? { insuranceProvider: body.insuranceProvider } : {}),
        ...(body.insuranceNumber ? { insuranceNumber: body.insuranceNumber } : {}),
        ...(body.insuranceDocName ? { insuranceDocName: body.insuranceDocName } : {}),
        ...(body.insuranceExpiry ? { insuranceExpiry: body.insuranceExpiry } : {}),
        ...(body.fitnessExpiry ? { fitnessExpiry: body.fitnessExpiry } : {}),
        ...(body.fitnessDocName ? { fitnessDocName: body.fitnessDocName } : {}),
        ...(body.allIndiaPermitExpiry ? { allIndiaPermitExpiry: body.allIndiaPermitExpiry } : {}),
        ...(body.allIndiaPermitDocName ? { allIndiaPermitDocName: body.allIndiaPermitDocName } : {}),
        ...(body.yearlyPermitExpiry ? { yearlyPermitExpiry: body.yearlyPermitExpiry } : {}),
        ...(body.yearlyPermitDocName ? { yearlyPermitDocName: body.yearlyPermitDocName } : {}),
        ...(body.pucExpiry ? { pucExpiry: body.pucExpiry } : {}),
        ...(body.pucDocName ? { pucDocName: body.pucDocName } : {}),
        ...(body.perHourRate !== undefined ? { perHourRate: Number(body.perHourRate) } : {}),
        ...(body.driverAllowance !== undefined ? { driverAllowance: Number(body.driverAllowance) } : {}),
        ...(body.nightAllowance !== undefined ? { nightAllowance: Number(body.nightAllowance) } : {}),
        ...(body.imageName ? { imageName: body.imageName } : {})
      };
      updateData.vehicleType = JSON.stringify(updatedMeta);
    }

    const updated = await prisma.fleetVehicle.update({
      where: { id: existing.id },
      data: updateData,
      include: {
        category: true,
        driver: { select: { id: true, name: true, phone: true } }
      }
    });

    return NextResponse.json({ success: true, vehicle: updated });
  } catch (error) {
    console.error("PUT/PATCH /api/fleet/[id] error:", error);
    return NextResponse.json({ error: "Failed to update vehicle" }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const existing = await prisma.fleetVehicle.findFirst({
      where: {
        OR: [{ id }, { registrationNumber: id }]
      }
    });

    if (!existing) {
      return NextResponse.json({ error: "Vehicle not found" }, { status: 404 });
    }

    await prisma.fleetVehicle.delete({
      where: { id: existing.id }
    });

    return NextResponse.json({ success: true, message: "Vehicle deleted successfully" });
  } catch (error) {
    console.error("DELETE /api/fleet/[id] error:", error);
    return NextResponse.json({ error: "Failed to delete vehicle" }, { status: 500 });
  }
}
