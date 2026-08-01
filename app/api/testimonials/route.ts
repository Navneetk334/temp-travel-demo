import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { testimonialSchema } from "@/lib/validations/testimonial";
import { verifyAdmin } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search") || "";
    const status = searchParams.get("status") || "";
    const isFeatured = searchParams.get("isFeatured");
    const showAll = searchParams.get("admin") === "true";
    const sortBy = searchParams.get("sortBy") || "createdAt";
    const sortOrder = searchParams.get("sortOrder") === "asc" ? "asc" : "desc";
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "10", 10);
    const skip = (page - 1) * limit;

    const where: any = {};

    if (!showAll && !status) {
      where.status = "APPROVED";
    } else if (status && status !== "ALL" && status !== "all") {
      where.status = status;
    }

    if (isFeatured === "true") {
      where.isFeatured = true;
    }

    if (search) {
      where.OR = [
        { authorName: { contains: search, mode: "insensitive" } },
        { companyName: { contains: search, mode: "insensitive" } },
        { authorRole: { contains: search, mode: "insensitive" } },
        { content: { contains: search, mode: "insensitive" } },
      ];
    }

    let orderBy: any = { createdAt: sortOrder };
    if (sortBy === "rating") {
      orderBy = { rating: sortOrder };
    } else if (sortBy === "authorName") {
      orderBy = { authorName: sortOrder };
    }

    const totalCount = await prisma.testimonial.count({ where });

    const testimonials = await prisma.testimonial.findMany({
      where,
      orderBy,
      skip,
      take: limit,
    });

    const [approvedCount, pendingCount, rejectedCount, featuredCount] = await Promise.all([
      prisma.testimonial.count({ where: { status: "APPROVED" } }),
      prisma.testimonial.count({ where: { status: "PENDING" } }),
      prisma.testimonial.count({ where: { status: "REJECTED" } }),
      prisma.testimonial.count({ where: { isFeatured: true } }),
    ]);

    const totalPages = Math.ceil(totalCount / limit) || 1;

    return NextResponse.json({
      testimonials,
      pagination: {
        totalCount,
        totalPages,
        currentPage: page,
        limit,
      },
      stats: {
        total: approvedCount + pendingCount + rejectedCount,
        APPROVED: approvedCount,
        PENDING: pendingCount,
        REJECTED: rejectedCount,
        FEATURED: featuredCount,
      }
    }, { status: 200 });
  } catch (error) {
    console.error("GET /api/testimonials error:", error);
    return NextResponse.json({ error: "Failed to fetch testimonials" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const result = testimonialSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json({ error: result.error.flatten() }, { status: 400 });
    }

    const item = await prisma.testimonial.create({
      data: {
        authorName: result.data.authorName,
        authorRole: result.data.authorRole || null,
        companyName: result.data.companyName || null,
        content: result.data.content,
        rating: result.data.rating,
        avatarUrl: result.data.avatarUrl || null,
        isFeatured: result.data.isFeatured,
        status: result.data.status,
      },
    });

    return NextResponse.json(item, { status: 201 });
  } catch (error) {
    console.error("POST /api/testimonials error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
