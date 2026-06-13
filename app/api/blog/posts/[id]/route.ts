import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { blogPostSchema } from "@/lib/validations/blog";

// Admin auth helper
async function verifyAdmin(req: NextRequest): Promise<boolean> {
  const token = req.cookies.get("next-auth.session-token")?.value || req.cookies.get("__Secure-next-auth.session-token")?.value || req.cookies.get("temp-travel-admin-session")?.value;
  return !!token;
}

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(req: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const post = await prisma.blogPost.findUnique({
      where: { id },
      include: {
        category: {
          select: { name: true, slug: true },
        },
      },
    });

    if (!post) {
      return NextResponse.json({ error: "Blog post not found" }, { status: 404 });
    }

    return NextResponse.json(post, { status: 200 });
  } catch (error) {
    console.error("GET /api/blog/posts/[id] error:", error);
    return NextResponse.json({ error: "Failed to fetch blog post" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const isAdmin = await verifyAdmin(req);
    if (!isAdmin) {
      return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
    }

    const body = await req.json();
    const result = blogPostSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json({ error: result.error.flatten() }, { status: 400 });
    }

    // Check if post exists
    const post = await prisma.blogPost.findUnique({
      where: { id },
    });

    if (!post) {
      return NextResponse.json({ error: "Blog post not found" }, { status: 404 });
    }

    // Check if slug is taken by another post
    if (result.data.slug !== post.slug) {
      const slugDuplicate = await prisma.blogPost.findUnique({
        where: { slug: result.data.slug },
      });
      if (slugDuplicate) {
        return NextResponse.json({ error: "Blog slug already taken" }, { status: 400 });
      }
    }

    const updated = await prisma.blogPost.update({
      where: { id },
      data: {
        title: result.data.title,
        slug: result.data.slug,
        summary: result.data.summary,
        content: result.data.content,
        featuredImage: result.data.featuredImage || null,
        published: result.data.published,
        publishedAt: result.data.published ? (post.publishedAt || new Date()) : null,
        categoryId: result.data.categoryId,
        tags: result.data.tags,
        seoTitle: result.data.seoTitle || null,
        seoDescription: result.data.seoDescription || null,
        seoKeywords: result.data.seoKeywords || null,
      },
    });

    return NextResponse.json(updated, { status: 200 });
  } catch (error) {
    console.error("PUT /api/blog/posts/[id] error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const isAdmin = await verifyAdmin(req);
    if (!isAdmin) {
      return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
    }

    const post = await prisma.blogPost.findUnique({
      where: { id },
    });

    if (!post) {
      return NextResponse.json({ error: "Blog post not found" }, { status: 404 });
    }

    await prisma.blogPost.delete({
      where: { id },
    });

    return NextResponse.json({ message: "Blog post deleted successfully" }, { status: 200 });
  } catch (error) {
    console.error("DELETE /api/blog/posts/[id] error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
