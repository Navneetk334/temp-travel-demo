import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getAdminFromRequest, hasPermission } from "@/lib/auth";

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const admin = await getAdminFromRequest(req);
    if (!admin || (!hasPermission(admin, "USER_MGMT_EDIT") && admin.role !== "MASTER_ADMIN")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await req.json();

    const { name, email, role, departmentId, permissionProfileId, isActive } = body;

    const updatedStaff = await prisma.admin.update({
      where: { id },
      data: {
        name,
        email,
        role,
        departmentId: departmentId || null,
        permissionProfileId: permissionProfileId || null,
        isActive: isActive !== undefined ? isActive : true,
      },
      include: {
        department: true,
        permissionProfile: true
      }
    });

    return NextResponse.json({ success: true, staff: updatedStaff });
  } catch (error) {
    console.error("PUT /api/admin/staff/[id] error:", error);
    return NextResponse.json({ error: "Failed to update staff" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const admin = await getAdminFromRequest(req);
    if (!admin || (!hasPermission(admin, "USER_MGMT_EDIT") && admin.role !== "MASTER_ADMIN")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    await prisma.admin.delete({ where: { id } });

    return NextResponse.json({ success: true, message: "Deleted successfully" });
  } catch (error) {
    console.error("DELETE /api/admin/staff/[id] error:", error);
    return NextResponse.json({ error: "Failed to delete staff" }, { status: 500 });
  }
}
