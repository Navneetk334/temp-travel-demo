import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { verifyAdmin } from "@/lib/auth";
import bcrypt from "bcryptjs";

export async function GET(req: NextRequest) {
  try {
    const isAdmin = await verifyAdmin(req);
    if (!isAdmin) {
      return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search") || "";

    const where: any = {
      role: "DRIVER",
    };

    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { phone: { contains: search, mode: "insensitive" } },
        { email: { contains: search, mode: "insensitive" } },
      ];
    }

    const drivers = await prisma.user.findMany({
      where,
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        isActive: true,
        createdAt: true,
        vehicle: {
          select: {
            id: true,
            make: true,
            model: true,
            registrationNumber: true,
          }
        }
      },
      orderBy: { name: "asc" }
    });

    return NextResponse.json(drivers, { status: 200 });
  } catch (error) {
    console.error("GET /api/admin/drivers error:", error);
    return NextResponse.json({ error: "Failed to fetch drivers" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const isAdmin = await verifyAdmin(req);
    if (!isAdmin) {
      return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
    }

    const body = await req.json();
    const { name, phone, email, password, isActive } = body;

    if (!name || !phone || !email) {
      return NextResponse.json({ error: "Name, phone, and email are required" }, { status: 400 });
    }

    // Check existing email or phone
    const existing = await prisma.user.findFirst({
      where: {
        OR: [
          { email: email.trim().toLowerCase() },
          { phone: phone.trim() }
        ]
      }
    });

    if (existing) {
      return NextResponse.json({ error: "Driver with this email or phone number already exists" }, { status: 400 });
    }

    const passwordHash = await bcrypt.hash(password || "TempDriver@123", 10);

    const driver = await prisma.user.create({
      data: {
        name: name.trim(),
        email: email.trim().toLowerCase(),
        phone: phone.trim(),
        passwordHash,
        role: "DRIVER",
        isActive: isActive ?? true,
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        isActive: true,
        createdAt: true,
      }
    });

    return NextResponse.json(driver, { status: 201 });
  } catch (error: any) {
    console.error("POST /api/admin/drivers error:", error);
    return NextResponse.json({ error: "Failed to create driver account" }, { status: 500 });
  }
}
