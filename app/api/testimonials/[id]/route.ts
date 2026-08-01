import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { testimonialSchema } from "@/lib/validations/testimonial";
import { verifyAdmin } from "@/lib/auth";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(req: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const item = await prisma.testimonial.findUnique({ where: { id } });

    if (!item) {
      return NextResponse.json({ error: "Testimonial not found" }, { status: 404 });
    }

    return NextResponse.json(item, { status: 200 });
  } catch (error) {
    console.error("GET /api/testimonials/[id] error:", error);
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
    
    // Support partial updates (e.g. quick status toggle or isFeatured toggle)
    let updateData: any = {};
    if (body.status || body.isFeatured !== undefined) {
      if (body.status) updateData.status = body.status;
      if (body.isFeatured !== undefined) updateData.isFeatured = body.isFeatured;
      if (body.content) updateData.content = body.content;
      if (body.authorName) updateData.authorName = body.authorName;
      if (body.authorRole !== undefined) updateData.authorRole = body.authorRole;
      if (body.companyName !== undefined) updateData.companyName = body.companyName;
      if (body.rating) updateData.rating = Number(body.rating);
      if (body.avatarUrl !== undefined) updateData.avatarUrl = body.avatarUrl;
    } else {
      const result = testimonialSchema.safeParse(body);
      if (!result.success) {
        return NextResponse.json({ error: result.error.flatten() }, { status: 400 });
      }
      updateData = {
        authorName: result.data.authorName,
        authorRole: result.data.authorRole || null,
        companyName: result.data.companyName || null,
        content: result.data.content,
        rating: result.data.rating,
        avatarUrl: result.data.avatarUrl || null,
        isFeatured: result.data.isFeatured,
        status: result.data.status,
      };
    }

    const updated = await prisma.testimonial.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json(updated, { status: 200 });
  } catch (error) {
    console.error("PUT /api/testimonials/[id] error:", error);
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

    await prisma.testimonial.delete({ where: { id } });
    return NextResponse.json({ message: "Testimonial deleted successfully" }, { status: 200 });
  } catch (error) {
    console.error("DELETE /api/testimonials/[id] error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
