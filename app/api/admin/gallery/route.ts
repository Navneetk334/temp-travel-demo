import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

export async function GET() {
  try {
    const images = await prisma.galleryImage.findMany({
      orderBy: { order: "asc" }
    });
    return NextResponse.json(images);
  } catch (error) {
    console.error("Error fetching gallery images:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "SUPER_ADMIN" && session.user.role !== "MANAGER") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const data = await req.json();
    const { src, title, category, colSpan, rowSpan, order } = data;

    if (!src || !title || !category) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const newImage = await prisma.galleryImage.create({
      data: {
        src,
        title,
        category,
        colSpan: colSpan || "col-span-12 md:col-span-4",
        rowSpan: rowSpan || "row-span-1",
        order: order || 0
      }
    });

    return NextResponse.json(newImage, { status: 201 });
  } catch (error) {
    console.error("Error creating gallery image:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
