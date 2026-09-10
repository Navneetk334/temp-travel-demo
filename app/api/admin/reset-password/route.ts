import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { hashPassword, getAdminFromRequest, hasPermission } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const admin = await getAdminFromRequest(req);
    // Only Super Admin or someone with USER_MGMT_EDIT can reset passwords
    if (!admin || !hasPermission(admin, "USER_MGMT_EDIT")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { userId, newPassword } = await req.json();

    if (!userId || !newPassword) {
      return NextResponse.json({ error: "User ID and new password are required" }, { status: 400 });
    }

    const passwordHash = await hashPassword(newPassword);

    await prisma.admin.update({
      where: { id: userId },
      data: {
        passwordHash,
        passwordResetRequested: false, // clear the flag
      },
    });

    return NextResponse.json({ success: true, message: "Password updated successfully" });
  } catch (error) {
    console.error("POST /api/admin/reset-password error:", error);
    return NextResponse.json({ error: "Failed to reset password" }, { status: 500 });
  }
}
