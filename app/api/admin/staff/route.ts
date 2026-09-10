import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getAdminFromRequest, hasPermission, hashPassword } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    const admin = await getAdminFromRequest(req);
    if (!admin || (!hasPermission(admin, "USER_MGMT_VIEW") && admin.role !== "MASTER_ADMIN")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const staff = await prisma.admin.findMany({
      include: {
        department: true,
        permissionProfile: true
      },
      orderBy: { createdAt: "desc" }
    });

    return NextResponse.json({ success: true, staff });
  } catch (error) {
    console.error("GET /api/admin/staff error:", error);
    return NextResponse.json({ error: "Failed to fetch staff" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const admin = await getAdminFromRequest(req);
    if (!admin || (!hasPermission(admin, "USER_MGMT_EDIT") && admin.role !== "MASTER_ADMIN")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { name, email, password, role, departmentId, permissionProfileId } = body;

    if (!name || !email || !password) {
      return NextResponse.json({ error: "Name, email and password are required" }, { status: 400 });
    }

    const existingAdmin = await prisma.admin.findUnique({ where: { email } });
    if (existingAdmin) {
      return NextResponse.json({ error: "Email already in use" }, { status: 400 });
    }

    const passwordHash = await hashPassword(password);

    const newStaff = await prisma.admin.create({
      data: {
        name,
        email,
        passwordHash,
        role: role || "MANAGER",
        departmentId: departmentId || null,
        permissionProfileId: permissionProfileId || null,
      },
      include: {
        department: true,
        permissionProfile: true
      }
    });

    return NextResponse.json({ success: true, staff: newStaff });
  } catch (error) {
    console.error("POST /api/admin/staff error:", error);
    return NextResponse.json({ error: "Failed to create staff" }, { status: 500 });
  }
}
