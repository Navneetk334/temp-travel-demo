import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { packageCategorySchema } from "@/lib/validations/tour";
import { verifyAdmin } from "@/lib/auth";

export async function GET() {
  try {
    const categories = await prisma.packageCategory.findMany({
      orderBy: { name: "asc" },
    });
    return NextResponse.json(categories, { status: 200 });
  } catch (error) {
    console.error("GET /api/tours/categories error:", error);
    return NextResponse.json({ error: "Failed to fetch categories" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const isAdmin = await verifyAdmin(req);
    if (!isAdmin) {
      return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
    }

    const body = await req.json();
    const result = packageCategorySchema.safeParse(body);
    
    if (!result.success) {
      return NextResponse.json({ error: result.error.flatten() }, { status: 400 });
    }

    // Check if slug unique
    const existing = await prisma.packageCategory.findUnique({
      where: { slug: result.data.slug },
    });
    if (existing) {
      return NextResponse.json({ error: "Category slug already exists" }, { status: 400 });
    }

    const category = await prisma.packageCategory.create({
      data: result.data,
    });

    return NextResponse.json(category, { status: 201 });
  } catch (error) {
    console.error("POST /api/tours/categories error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
