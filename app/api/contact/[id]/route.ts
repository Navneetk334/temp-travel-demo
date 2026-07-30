import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { contactLeadAdminUpdateSchema } from "@/lib/validations/contact";
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

    const lead = await prisma.contactLead.findUnique({
      where: { id },
    });

    if (!lead) {
      return NextResponse.json({ error: "Contact message not found" }, { status: 404 });
    }

    return NextResponse.json(lead, { status: 200 });
  } catch (error) {
    console.error(`GET /api/contact/${id} error:`, error);
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
    const result = contactLeadAdminUpdateSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json({ error: result.error.flatten() }, { status: 400 });
    }

    const updatedLead = await prisma.contactLead.update({
      where: { id: id },
      data: { status: result.data.status as any },
    });

    return NextResponse.json(updatedLead, { status: 200 });
  } catch (error) {
    console.error(`PUT /api/contact/${id} error:`, error);
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

    await prisma.contactLead.delete({
      where: { id: id },
    });

    return NextResponse.json({ message: "Contact lead deleted successfully" }, { status: 200 });
  } catch (error) {
    console.error(`DELETE /api/contact/${id} error:`, error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
