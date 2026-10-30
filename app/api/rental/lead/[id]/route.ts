import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import prisma from "@/lib/prisma";
import { rentalLeadAdminUpdateSchema } from "@/lib/validations/rental";
import { verifyAdmin } from "@/lib/auth";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(
  req: NextRequest,
  { params }: RouteParams
) {
  const { id } = await params;
  try {
    const isAdmin = await verifyAdmin(req);
    if (!isAdmin) {
      return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
    }

    const lead = await prisma.rentalLead.findUnique({
      where: { id },
      include: {
        vehicleCategory: {
          select: { id: true, name: true, slug: true }
        }
      }
    });

    if (!lead) {
      return NextResponse.json({ error: "Rental lead not found" }, { status: 404 });
    }

    return NextResponse.json(lead, { status: 200 });
  } catch (error) {
    console.error(`GET /api/rental/lead/${id} error:`, error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function PUT(
  req: NextRequest,
  { params }: RouteParams
) {
  const { id } = await params;
  try {
    const isAdmin = await verifyAdmin(req);
    if (!isAdmin) {
      return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
    }

    const body = await req.json();
    const result = rentalLeadAdminUpdateSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json({ error: result.error.flatten() }, { status: 400 });
    }

    const updated = await prisma.rentalLead.update({
      where: { id: id },
      data: result.data,
      include: {
        vehicleCategory: {
          select: { id: true, name: true, slug: true }
        }
      }
    });

    return NextResponse.json(updated, { status: 200 });
  } catch (error) {
    console.error(`PUT /api/rental/lead/${id} error:`, error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: RouteParams
) {
  const { id } = await params;
  try {
    const isAdmin = await verifyAdmin(req);
    if (!isAdmin) {
      return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
    }

    await prisma.rentalLead.delete({
      where: { id: id },
    });

    try {
      revalidatePath("/admin");
      revalidatePath("/admin/local-rental-leads");
      revalidatePath("/admin/outstation-leads");
    } catch (e) {
      console.warn("revalidatePath error in DELETE /api/rental/lead/[id]:", e);
    }

    return NextResponse.json({ message: "Inquiry removed successfully" }, { status: 200 });
  } catch (error) {
    console.error(`DELETE /api/rental/lead/${id} error:`, error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
