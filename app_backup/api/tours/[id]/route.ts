import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { tourPackageSchema } from "@/lib/validations/tour";

async function verifyAdmin(req: NextRequest): Promise<boolean> {
  const token = req.cookies.get("next-auth.session-token")?.value || 
                req.cookies.get("__Secure-next-auth.session-token")?.value;
  return !!token;
}

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const tour = await prisma.tourPackage.findUnique({
      where: { id: params.id },
      include: {
        category: true,
      },
    });

    if (!tour) {
      return NextResponse.json({ error: "Tour package not found" }, { status: 404 });
    }

    return NextResponse.json(tour, { status: 200 });
  } catch (error) {
    console.error(`GET /api/tours/${params.id} error:`, error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const isAdmin = await verifyAdmin(req);
    if (!isAdmin) {
      return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
    }

    const body = await req.json();
    const result = tourPackageSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json({ error: result.error.flatten() }, { status: 400 });
    }

    // Check slug uniqueness excluding this record
    const existing = await prisma.tourPackage.findFirst({
      where: { 
        slug: result.data.slug,
        id: { not: params.id } 
      },
    });
    if (existing) {
      return NextResponse.json({ error: "Tour slug already exists" }, { status: 400 });
    }

    const updated = await prisma.tourPackage.update({
      where: { id: params.id },
      data: {
        ...result.data,
        basePrice: result.data.basePrice.toString(),
        itinerary: result.data.itinerary as any,
      },
    });

    return NextResponse.json(updated, { status: 200 });
  } catch (error) {
    console.error(`PUT /api/tours/${params.id} error:`, error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const isAdmin = await verifyAdmin(req);
    if (!isAdmin) {
      return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
    }

    // Check if package has active bookings
    const bookingsCount = await prisma.booking.count({
      where: { tourPackageId: params.id },
    });

    if (bookingsCount > 0) {
      return NextResponse.json(
        { error: "Cannot delete package with active bookings. Archive it instead." },
        { status: 400 }
      );
    }

    await prisma.tourPackage.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ message: "Tour package deleted successfully" }, { status: 200 });
  } catch (error) {
    console.error(`DELETE /api/tours/${params.id} error:`, error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
