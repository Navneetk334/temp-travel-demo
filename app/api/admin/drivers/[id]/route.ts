import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { verifyAdmin } from "@/lib/auth";
import bcrypt from "bcryptjs";

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const isAdmin = await verifyAdmin(req);
    if (!isAdmin) {
      return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
    }

    const { id } = await params;
    const body = await req.json();
    const { name, phone, email, password, isActive } = body;

    const existingDriver = await prisma.user.findUnique({
      where: { id }
    });

    if (!existingDriver) {
      return NextResponse.json({ error: "Driver not found" }, { status: 404 });
    }

    const updateData: any = {};
    if (name) updateData.name = name.trim();
    if (email) updateData.email = email.trim().toLowerCase();
    if (phone) updateData.phone = phone.trim();
    if (typeof isActive === "boolean") updateData.isActive = isActive;
    if (password && password.trim()) {
      updateData.passwordHash = await bcrypt.hash(password.trim(), 10);
    }

    const updatedDriver = await prisma.user.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        isActive: true,
        updatedAt: true,
      }
    });

    return NextResponse.json(updatedDriver, { status: 200 });
  } catch (error: any) {
    console.error("PUT /api/admin/drivers/[id] error:", error);
    return NextResponse.json({ error: "Failed to update driver" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const isAdmin = await verifyAdmin(req);
    if (!isAdmin) {
      return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
    }

    const { id } = await params;

    // Unassign vehicle if assigned
    await prisma.fleetVehicle.updateMany({
      where: { driverId: id },
      data: { driverId: null }
    });

    await prisma.user.delete({
      where: { id }
    });

    return NextResponse.json({ success: true, message: "Driver removed successfully" }, { status: 200 });
  } catch (error: any) {
    console.error("DELETE /api/admin/drivers/[id] error:", error);
    return NextResponse.json({ error: "Failed to delete driver" }, { status: 500 });
  }
}
