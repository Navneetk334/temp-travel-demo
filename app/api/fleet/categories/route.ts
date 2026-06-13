import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { vehicleCategorySchema } from "@/lib/validations/fleet";

async function verifyAdmin(req: NextRequest): Promise<boolean> {
  const token = req.cookies.get("next-auth.session-token")?.value || req.cookies.get("__Secure-next-auth.session-token")?.value || req.cookies.get("temp-travel-admin-session")?.value;
  return !!token;
}

export async function GET() {
  try {
    const categories = await prisma.vehicleCategory.findMany({
      orderBy: { name: "asc" },
    });
    return NextResponse.json(categories, { status: 200 });
  } catch (error) {
    console.error("GET /api/fleet/categories error:", error);
    return NextResponse.json({ error: "Failed to fetch vehicle categories" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const isAdmin = await verifyAdmin(req);
    if (!isAdmin) {
      return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
    }

    const body = await req.json();
    const result = vehicleCategorySchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json({ error: result.error.flatten() }, { status: 400 });
    }

    const existing = await prisma.vehicleCategory.findFirst({
      where: {
        OR: [
          { name: result.data.name },
          { slug: result.data.slug }
        ]
      }
    });

    if (existing) {
      return NextResponse.json({ error: "Category name or slug already exists" }, { status: 400 });
    }

    const category = await prisma.vehicleCategory.create({
      data: {
        ...result.data,
        baseHourlyRate: result.data.baseHourlyRate.toString(),
        baseKmsRate: result.data.baseKmsRate.toString(),
        extraHrRate: result.data.extraHrRate.toString(),
        extraKmRate: result.data.extraKmRate.toString(),
        outstationKmRate: result.data.outstationKmRate.toString(),
      },
    });

    return NextResponse.json(category, { status: 201 });
  } catch (error) {
    console.error("POST /api/fleet/categories error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
