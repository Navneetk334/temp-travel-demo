import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { rentalLeadSchema } from "@/lib/validations/rental";

async function verifyAdmin(req: NextRequest): Promise<boolean> {
  const token = req.cookies.get("next-auth.session-token")?.value || 
                req.cookies.get("__Secure-next-auth.session-token")?.value;
  return !!token;
}

export async function GET(req: NextRequest) {
  try {
    const isAdmin = await verifyAdmin(req);
    if (!isAdmin) {
      return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search") || "";
    const status = searchParams.get("status") || "";

    const where: any = {};
    if (status) {
      where.status = status;
    }

    if (search) {
      where.OR = [
        { customerName: { contains: search, mode: "insensitive" } },
        { email: { contains: search, mode: "insensitive" } },
        { phone: { contains: search, mode: "insensitive" } },
        { pickupLocation: { contains: search, mode: "insensitive" } },
      ];
    }

    const leads = await prisma.rentalLead.findMany({
      where,
      include: {
        vehicleCategory: {
          select: { name: true }
        }
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(leads, { status: 200 });
  } catch (error) {
    console.error("GET /api/rental/lead error:", error);
    return NextResponse.json({ error: "Failed to fetch rental inquiries" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const result = rentalLeadSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json({ error: result.error.flatten() }, { status: 400 });
    }

    const lead = await prisma.rentalLead.create({
      data: {
        ...result.data,
        pickupDateTime: new Date(result.data.pickupDateTime),
        returnDateTime: result.data.returnDateTime ? new Date(result.data.returnDateTime) : null,
      },
    });

    return NextResponse.json(lead, { status: 201 });
  } catch (error) {
    console.error("POST /api/rental/lead error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
