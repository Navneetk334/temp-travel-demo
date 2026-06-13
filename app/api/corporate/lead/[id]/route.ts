import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { leadAdminUpdateSchema } from "@/lib/validations/corporate";

async function verifyAdmin(req: NextRequest): Promise<boolean> {
  const token = req.cookies.get("next-auth.session-token")?.value || req.cookies.get("__Secure-next-auth.session-token")?.value || req.cookies.get("temp-travel-admin-session")?.value;
  return !!token;
}

interface RouteParams {
  params: Promise<{ id: string }>;
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
    const result = leadAdminUpdateSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json({ error: result.error.flatten() }, { status: 400 });
    }

    const updatedLead = await prisma.corporateLead.update({
      where: { id: id },
      data: result.data,
    });

    return NextResponse.json(updatedLead, { status: 200 });
  } catch (error) {
    console.error(`PUT /api/corporate/lead/${id} error:`, error);
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

    await prisma.corporateLead.delete({
      where: { id: id },
    });

    return NextResponse.json({ message: "Lead deleted successfully" }, { status: 200 });
  } catch (error) {
    console.error(`DELETE /api/corporate/lead/${id} error:`, error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
