import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import crypto from "crypto";

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    const admin = await prisma.admin.findUnique({
      where: { email: email.toLowerCase().trim() },
    });

    if (!admin) {
      // Return success anyway to prevent email enumeration
      return NextResponse.json({ success: true, message: "If an account exists, a reset link has been sent." });
    }

    await prisma.admin.update({
      where: { id: admin.id },
      data: { passwordResetRequested: true }
    });

    return NextResponse.json({ 
      success: true, 
      message: "Password reset requested. Please contact the Master Admin to receive your new password."
    });
  } catch (error) {
    console.error("POST /api/admin/forgot-password error:", error);
    return NextResponse.json({ error: "Failed to process request" }, { status: 500 });
  }
}
