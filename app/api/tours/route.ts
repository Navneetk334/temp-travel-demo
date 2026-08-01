import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { tourPackageSchema } from "@/lib/validations/tour";
import { verifyAdmin } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search") || "";
    const categoryId = searchParams.get("categoryId") || "";
    const status = searchParams.get("status") || "";
    const isFeatured = searchParams.get("isFeatured");
    const sortBy = searchParams.get("sortBy") || "createdAt";
    const sortOrder = searchParams.get("sortOrder") === "asc" ? "asc" : "desc";
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "10", 10);
    const skip = (page - 1) * limit;

    const where: any = {};
    
    if (status && status !== "all" && status !== "ALL") {
      if (status === "FEATURED") {
        where.isFeatured = true;
      } else {
        where.status = status;
      }
    }
    
    if (categoryId) {
      where.categoryId = categoryId;
    }

    if (isFeatured === "true") {
      where.isFeatured = true;
    }

    if (search) {
      where.OR = [
        { title: { contains: search, mode: "insensitive" } },
        { destination: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
      ];
    }

    let orderBy: any = { createdAt: sortOrder };
    if (sortBy === "title") {
      orderBy = { title: sortOrder };
    } else if (sortBy === "basePrice") {
      orderBy = { basePrice: sortOrder };
    } else if (sortBy === "durationDays") {
      orderBy = { durationDays: sortOrder };
    } else if (sortBy === "createdAt") {
      orderBy = { createdAt: sortOrder };
    }

    const totalCount = await prisma.tourPackage.count({ where });

    const packages = await prisma.tourPackage.findMany({
      where,
      include: {
        category: {
          select: { id: true, name: true, slug: true },
        },
      },
      orderBy,
      skip,
      take: limit,
    });

    const [publishedCount, draftCount, featuredCount] = await Promise.all([
      prisma.tourPackage.count({ where: { status: { in: ["PUBLISHED", "ACTIVE"] } } }),
      prisma.tourPackage.count({ where: { status: "DRAFT" } }),
      prisma.tourPackage.count({ where: { isFeatured: true } }),
    ]);

    const totalPages = Math.ceil(totalCount / limit) || 1;

    return NextResponse.json({
      tours: packages,
      pagination: {
        totalCount,
        totalPages,
        currentPage: page,
        limit,
      },
      stats: {
        total: publishedCount + draftCount,
        PUBLISHED: publishedCount,
        DRAFT: draftCount,
        FEATURED: featuredCount,
      }
    }, { status: 200 });
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

    const existing = await prisma.tourPackage.findUnique({
      where: { slug: result.data.slug },
    });
    if (existing) {
      return NextResponse.json({ error: "Tour slug already exists" }, { status: 400 });
    }

    const newPackage = await prisma.tourPackage.create({
      data: {
        ...result.data,
        basePrice: result.data.basePrice.toString(),
        offerPrice: result.data.offerPrice ? result.data.offerPrice.toString() : null,
        itinerary: result.data.itinerary as any,
      },
      include: {
        category: true,
      }
    });

    return NextResponse.json(newPackage, { status: 201 });
  } catch (error) {
    console.error("POST /api/tours error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
