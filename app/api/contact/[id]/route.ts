import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

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
    const { status } = body;

    const updatedLead = await prisma.contactLead.update({
      where: { id: id },
      data: { status },
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
