import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { corporateLeadSchema } from "@/lib/validations/corporate";

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
        { companyName: { contains: search, mode: "insensitive" } },
        { contactName: { contains: search, mode: "insensitive" } },
        { email: { contains: search, mode: "insensitive" } },
        { phone: { contains: search, mode: "insensitive" } },
      ];
    }

    const leads = await prisma.corporateLead.findMany({
      where,
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(leads, { status: 200 });
  } catch (error) {
    console.error("GET /api/corporate/lead error:", error);
    return NextResponse.json({ error: "Failed to fetch corporate leads" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const result = corporateLeadSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json({ error: result.error.flatten() }, { status: 400 });
    }

    const lead = await prisma.corporateLead.create({
      data: result.data,
    });

    return NextResponse.json(lead, { status: 201 });
  } catch (error) {
    console.error("POST /api/corporate/lead error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
