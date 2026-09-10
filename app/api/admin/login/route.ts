import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { verifyPassword, createAdminToken, ADMIN_COOKIE_NAME } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json({ error: "Email and password are required" }, { status: 400 });
    }

    const cleanEmail = email.toLowerCase().trim();
    let authenticatedAdmin: {
      id: string;
      name: string;
      email: string;
      role: string;
      permissions?: string[];
    } | null = null;

    // 1. Try querying Database if available
    try {
      const dbAdmin = await prisma.admin.findUnique({
        where: { email: cleanEmail },
        include: { permissionProfile: true }
      });

      if (dbAdmin && dbAdmin.isActive) {
        const isValid = await verifyPassword(password, dbAdmin.passwordHash);
        if (isValid) {
          authenticatedAdmin = {
            id: dbAdmin.id,
            name: dbAdmin.name,
            email: dbAdmin.email,
            role: dbAdmin.role,
            permissions: dbAdmin.permissionProfile ? dbAdmin.permissionProfile.permissions : []
          };
        }
      }
    } catch (dbErr) {
      console.warn("Database connection notice during admin login:", dbErr);
    }

    // 2. Demo logins have been removed to enforce real authentication
    if (!authenticatedAdmin) {
      return NextResponse.json({ error: "Invalid email or password" }, { status: 401 });
    }

    if (!authenticatedAdmin) {
      return NextResponse.json({ error: "Invalid email or password" }, { status: 401 });
    }

    const token = createAdminToken({
      id: authenticatedAdmin.id,
      name: authenticatedAdmin.name,
      email: authenticatedAdmin.email,
      role: authenticatedAdmin.role,
      permissions: authenticatedAdmin.permissions,
    });

    const response = NextResponse.json({
      success: true,
      admin: authenticatedAdmin,
      token,
    });

    // Set auth cookie
    response.cookies.set({
      name: ADMIN_COOKIE_NAME,
      value: token,
      httpOnly: true,
      path: "/",
      maxAge: 60 * 60 * 24 * 7, // 7 days
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
    });

    return response;
  } catch (error: any) {
    console.error("POST /api/admin/login error:", error);
    return NextResponse.json({ error: error.message || "Authentication process failed" }, { status: 500 });
  }
}
