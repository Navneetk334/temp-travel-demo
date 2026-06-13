import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { blogPostSchema } from "@/lib/validations/blog";

// Admin auth helper
async function verifyAdmin(req: NextRequest): Promise<boolean> {
  const token = req.cookies.get("next-auth.session-token")?.value || req.cookies.get("__Secure-next-auth.session-token")?.value || req.cookies.get("temp-travel-admin-session")?.value;
  return !!token;
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const categorySlug = searchParams.get("category") || "";
    const tag = searchParams.get("tag") || "";
    const search = searchParams.get("search") || "";
    const showAll = searchParams.get("admin") === "true"; // Admin panel requests all posts

    const where: any = {};

    // Standard public filters only query published posts
    if (!showAll) {
      where.published = true;
    }

    if (categorySlug) {
      where.category = { slug: categorySlug };
    }

    if (tag) {
      where.tags = { has: tag };
    }

    if (search) {
      where.OR = [
        { title: { contains: search, mode: "insensitive" } },
        { summary: { contains: search, mode: "insensitive" } },
        { content: { contains: search, mode: "insensitive" } },
      ];
    }

    const posts = await prisma.blogPost.findMany({
      where,
      orderBy: { createdAt: "desc" },
      include: {
        author: {
          select: { name: true, email: true },
        },
        category: {
          select: { name: true, slug: true },
        },
      },
    });

    return NextResponse.json(posts, { status: 200 });
  } catch (error) {
    console.error("GET /api/blog/posts error:", error);
    return NextResponse.json({ error: "Failed to fetch blog posts" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const isAdmin = await verifyAdmin(req);
    if (!isAdmin) {
      return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
    }

    const body = await req.json();
    const result = blogPostSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json({ error: result.error.flatten() }, { status: 400 });
    }

    // Check slug uniqueness
    const existing = await prisma.blogPost.findUnique({
      where: { slug: result.data.slug },
    });
    if (existing) {
      return NextResponse.json({ error: "Blog slug already exists" }, { status: 400 });
    }

    // Resolve or seed default Admin Author to satisfy database constraint
    let authorId: string;
    const activeAdmin = await prisma.admin.findFirst({
      where: { isActive: true },
    });
    if (activeAdmin) {
      authorId = activeAdmin.id;
    } else {
      const seedAdmin = await prisma.admin.create({
        data: {
          name: "Enterprise Publisher",
          email: "publisher@temptravels.com",
          passwordHash: "$2a$12$tD9Y59DqD784lXUvJ9L9XeR82R2gBfE8L9l6UeQ9qXbV8T9yT9nCq", // mock
          role: "SUPER_ADMIN",
          isActive: true,
        },
      });
      authorId = seedAdmin.id;
    }

    const post = await prisma.blogPost.create({
      data: {
        title: result.data.title,
        slug: result.data.slug,
        summary: result.data.summary,
        content: result.data.content,
        featuredImage: result.data.featuredImage || null,
        published: result.data.published,
        publishedAt: result.data.published ? new Date() : null,
        categoryId: result.data.categoryId,
        tags: result.data.tags,
        seoTitle: result.data.seoTitle || null,
        seoDescription: result.data.seoDescription || null,
        seoKeywords: result.data.seoKeywords || null,
        authorId,
      },
    });

    return NextResponse.json(post, { status: 201 });
  } catch (error) {
    console.error("POST /api/blog/posts error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
