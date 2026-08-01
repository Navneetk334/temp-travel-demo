import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { blogPostSchema } from "@/lib/validations/blog";
import { verifyAdmin } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const categorySlug = searchParams.get("category") || "";
    const tag = searchParams.get("tag") || "";
    const search = searchParams.get("search") || "";
    const status = searchParams.get("status") || "";
    const showAll = searchParams.get("admin") === "true";
    const sortBy = searchParams.get("sortBy") || "createdAt";
    const sortOrder = searchParams.get("sortOrder") === "asc" ? "asc" : "desc";
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "10", 10);
    const skip = (page - 1) * limit;

    const where: any = {};
    const now = new Date();

    if (!showAll && !status) {
      where.published = true;
      where.OR = [
        { publishedAt: null },
        { publishedAt: { lte: now } }
      ];
    } else if (status && status !== "ALL" && status !== "all") {
      if (status === "PUBLISHED") {
        where.published = true;
        where.OR = [
          { publishedAt: null },
          { publishedAt: { lte: now } }
        ];
      } else if (status === "SCHEDULED") {
        where.published = true;
        where.publishedAt = { gt: now };
      } else if (status === "DRAFT") {
        where.published = false;
      }
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

    let orderBy: any = { createdAt: sortOrder };
    if (sortBy === "title") {
      orderBy = { title: sortOrder };
    } else if (sortBy === "publishedAt") {
      orderBy = { publishedAt: sortOrder };
    } else if (sortBy === "createdAt") {
      orderBy = { createdAt: sortOrder };
    }

    const totalCount = await prisma.blogPost.count({ where });

    const posts = await prisma.blogPost.findMany({
      where,
      orderBy,
      skip,
      take: limit,
      include: {
        author: {
          select: { name: true, email: true },
        },
        category: {
          select: { id: true, name: true, slug: true },
        },
      },
    });

    const [publishedCount, draftCount, scheduledCount] = await Promise.all([
      prisma.blogPost.count({
        where: {
          published: true,
          OR: [{ publishedAt: null }, { publishedAt: { lte: now } }]
        }
      }),
      prisma.blogPost.count({ where: { published: false } }),
      prisma.blogPost.count({
        where: {
          published: true,
          publishedAt: { gt: now }
        }
      }),
    ]);

    const totalPages = Math.ceil(totalCount / limit) || 1;

    return NextResponse.json({
      posts,
      pagination: {
        totalCount,
        totalPages,
        currentPage: page,
        limit,
      },
      stats: {
        total: publishedCount + draftCount + scheduledCount,
        PUBLISHED: publishedCount,
        DRAFT: draftCount,
        SCHEDULED: scheduledCount,
      }
    }, { status: 200 });
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

    const existing = await prisma.blogPost.findUnique({
      where: { slug: result.data.slug },
    });
    if (existing) {
      return NextResponse.json({ error: "Blog slug already exists" }, { status: 400 });
    }

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
          passwordHash: "$2a$12$tD9Y59DqD784lXUvJ9L9XeR82R2gBfE8L9l6UeQ9qXbV8T9yT9nCq",
          role: "SUPER_ADMIN",
          isActive: true,
        },
      });
      authorId = seedAdmin.id;
    }

    let publishedAtDate: Date | null = null;
    if (result.data.published) {
      publishedAtDate = result.data.publishedAt ? new Date(result.data.publishedAt) : new Date();
    }

    const post = await prisma.blogPost.create({
      data: {
        title: result.data.title,
        slug: result.data.slug,
        summary: result.data.summary,
        content: result.data.content,
        featuredImage: result.data.featuredImage || null,
        published: result.data.published,
        publishedAt: publishedAtDate,
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
