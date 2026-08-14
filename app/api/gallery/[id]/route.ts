import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { galleryItemSchema } from "@/lib/validations/gallery";
import { verifyAdmin } from "@/lib/auth";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(req: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const item = await prisma.gallery.findUnique({ where: { id } });

    if (!item) {
      return NextResponse.json({ error: "Media item not found" }, { status: 404 });
    }

    return NextResponse.json(item, { status: 200 });
  } catch (error) {
    console.error("GET /api/gallery/[id] error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
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
    const result = galleryItemSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json({ error: result.error.flatten() }, { status: 400 });
    }

    const updated = await prisma.gallery.update({
      where: { id },
      data: {
        title: result.data.title || null,
        description: result.data.description || null,
        imageUrl: result.data.imageUrl,
        mediaType: result.data.mediaType,
        category: result.data.category ? result.data.category.toLowerCase() : "fleet",
        location: result.data.location || null,
        year: result.data.year || null,
        isFeatured: Boolean(result.data.isFeatured),
        isActive: Boolean(result.data.isActive),
        altText: result.data.altText || null,
        caption: result.data.caption || null,
        sortOrder: Number(result.data.sortOrder) || 0,
      },
    });

    return NextResponse.json(updated, { status: 200 });
  } catch (error) {
    console.error("PUT /api/gallery/[id] error:", error);
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

    await prisma.gallery.delete({ where: { id } });
    return NextResponse.json({ message: "Media item deleted successfully" }, { status: 200 });
  } catch (error) {
    console.error("DELETE /api/gallery/[id] error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
