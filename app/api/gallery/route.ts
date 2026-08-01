import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { galleryItemSchema } from "@/lib/validations/gallery";
import { verifyAdmin } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search") || "";
    const category = searchParams.get("category") || "";
    const sortBy = searchParams.get("sortBy") || "sortOrder";
    const sortOrder = searchParams.get("sortOrder") === "desc" ? "desc" : "asc";
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "12", 10);
    const skip = (page - 1) * limit;

    const where: any = {};
    if (category && category !== "all") {
      where.category = { equals: category, mode: "insensitive" };
    }

    if (search) {
      where.OR = [
        { title: { contains: search, mode: "insensitive" } },
        { category: { contains: search, mode: "insensitive" } },
      ];
    }

    let orderBy: any = { sortOrder: sortOrder };
    if (sortBy === "createdAt") {
      orderBy = { createdAt: sortOrder };
    } else if (sortBy === "title") {
      orderBy = { title: sortOrder };
    }

    const totalCount = await prisma.gallery.count({ where });

    const media = await prisma.gallery.findMany({
      where,
      orderBy,
      skip,
      take: limit,
    });

    const totalPages = Math.ceil(totalCount / limit) || 1;

    return NextResponse.json({
      media,
      pagination: {
        totalCount,
        totalPages,
        currentPage: page,
        limit,
      }
    }, { status: 200 });
  } catch (error) {
    console.error("GET /api/gallery error:", error);
    return NextResponse.json({ error: "Failed to fetch gallery media" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const isAdmin = await verifyAdmin(req);
    if (!isAdmin) {
      return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
    }

    const body = await req.json();
    const result = galleryItemSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json({ error: result.error.flatten() }, { status: 400 });
    }

    const item = await prisma.gallery.create({
      data: {
        title: result.data.title || null,
        imageUrl: result.data.imageUrl,
        mediaType: result.data.mediaType,
        category: result.data.category ? result.data.category.toLowerCase() : "fleet",
        sortOrder: result.data.sortOrder,
      },
    });

    return NextResponse.json(item, { status: 201 });
  } catch (error) {
    console.error("POST /api/gallery error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
