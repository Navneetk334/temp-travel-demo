import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { tourPackageSchema } from "@/lib/validations/tour";

async function verifyAdmin(req: NextRequest): Promise<boolean> {
  const token = req.cookies.get("next-auth.session-token")?.value || req.cookies.get("__Secure-next-auth.session-token")?.value || req.cookies.get("temp-travel-admin-session")?.value;
  return !!token;
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search") || "";
    const categoryId = searchParams.get("categoryId") || "";
    const status = searchParams.get("status") || "ACTIVE"; // default to active for public queries

    // Query Filters
    const where: any = {};
    
    if (status) {
      where.status = status;
    }
    
    if (categoryId) {
      where.categoryId = categoryId;
    }

    if (search) {
      where.OR = [
        { title: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
      ];
    }

    const packages = await prisma.tourPackage.findMany({
      where,
      include: {
        category: {
          select: { name: true, slug: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(packages, { status: 200 });
  } catch (error) {
    console.error("GET /api/tours error:", error);
    return NextResponse.json({ error: "Failed to fetch tour packages" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const isAdmin = await verifyAdmin(req);
    if (!isAdmin) {
      return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
    }

    const body = await req.json();
    const result = tourPackageSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json({ error: result.error.flatten() }, { status: 400 });
    }

    // Check slug uniqueness
    const existing = await prisma.tourPackage.findUnique({
      where: { slug: result.data.slug },
    });
    if (existing) {
      return NextResponse.json({ error: "Tour slug already exists" }, { status: 400 });
    }

    const newPackage = await prisma.tourPackage.create({
      data: {
        ...result.data,
        basePrice: result.data.basePrice.toString(), // Prisma handles Decimal as String/Decimal object
        itinerary: result.data.itinerary as any, // Cast JSON array
      },
    });

    return NextResponse.json(newPackage, { status: 201 });
  } catch (error) {
    console.error("POST /api/tours error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
