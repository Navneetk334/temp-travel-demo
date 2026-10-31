import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getAdminFromRequest, hasPermission } from "@/lib/auth";

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const admin = await getAdminFromRequest(req);
    if (!admin || (!hasPermission(admin, "USER_MGMT_EDIT") && admin.role !== "MASTER_ADMIN")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await req.json();

    const { 
      name, email, role, departmentId, isActive,
      employeeId, phone, dob, photoUrl, aadhaarNumber, panNumber, 
      bankName, accountHolderName, accountNumber, ifscCode, permissions
    } = body;

    // Validate departmentId exists in database before linking to avoid FK constraint error
    let validDeptId: string | null = null;
    if (departmentId) {
      try {
        const found = await prisma.department.findUnique({ where: { id: departmentId } });
        if (found) validDeptId = departmentId;
      } catch (e) {
        validDeptId = null;
      }
    }

    const updatedStaff = await prisma.admin.update({
      where: { id },
      data: {
        name,
        email,
        role,
        departmentId: validDeptId,
        isActive: isActive !== undefined ? isActive : true,
        employeeId: employeeId || null,
        phone: phone || null,
        dob: dob || null,
        photoUrl: photoUrl || null,
        aadhaarNumber: aadhaarNumber || null,
        panNumber: panNumber || null,
        bankName: bankName || null,
        accountHolderName: accountHolderName || null,
        accountNumber: accountNumber || null,
        ifscCode: ifscCode || null,
        ...(permissions !== undefined && { permissions })
      },
      include: {
        department: true
      }
    });

    return NextResponse.json({ success: true, staff: updatedStaff });
  } catch (error) {
    console.error("PUT /api/admin/staff/[id] error:", error);
    return NextResponse.json({ error: "Failed to update staff" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
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
