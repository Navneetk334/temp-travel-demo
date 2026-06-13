import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { rentalLeadAdminUpdateSchema } from "@/lib/validations/rental";

async function verifyAdmin(req: NextRequest): Promise<boolean> {
  const token = req.cookies.get("next-auth.session-token")?.value || 
                req.cookies.get("__Secure-next-auth.session-token")?.value;
  return !!token;
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
    const result = rentalLeadAdminUpdateSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json({ error: result.error.flatten() }, { status: 400 });
    }

    const updated = await prisma.rentalLead.update({
      where: { id: params.id },
      data: result.data,
    });

    return NextResponse.json(updated, { status: 200 });
  } catch (error) {
    console.error(`PUT /api/rental/lead/${params.id} error:`, error);
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

    await prisma.rentalLead.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ message: "Inquiry removed successfully" }, { status: 200 });
  } catch (error) {
    console.error(`DELETE /api/rental/lead/${params.id} error:`, error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
