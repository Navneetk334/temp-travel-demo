import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { blogCategorySchema } from "@/lib/validations/blog";

// Admin auth helper
async function verifyAdmin(req: NextRequest): Promise<boolean> {
  const token = req.cookies.get("next-auth.session-token")?.value || 
                req.cookies.get("__Secure-next-auth.session-token")?.value;
  return !!token;
}

export async function GET() {
  try {
    const categories = await prisma.blogCategory.findMany({
      orderBy: { name: "asc" },
      include: {
        _count: {
          select: { blogPosts: true },
        },
      },
    });
    return NextResponse.json(categories, { status: 200 });
  } catch (error) {
    console.error("GET /api/blog/categories error:", error);
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
    const result = blogCategorySchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json({ error: result.error.flatten() }, { status: 400 });
    }

    // Check if slug exists
    const existing = await prisma.blogCategory.findUnique({
      where: { slug: result.data.slug },
    });
    if (existing) {
      return NextResponse.json({ error: "Category slug already exists" }, { status: 400 });
    }

    const category = await prisma.blogCategory.create({
      data: result.data,
    });

    return NextResponse.json(category, { status: 201 });
  } catch (error) {
    console.error("POST /api/blog/categories error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
