import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { rentalLeadSchema } from "@/lib/validations/rental";
import { verifyAdmin } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    const isAdmin = await verifyAdmin(req);
    if (!isAdmin) {
      return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search") || "";
    const status = searchParams.get("status") || "";
    const tripType = searchParams.get("tripType") || "";
    const sortBy = searchParams.get("sortBy") || "createdAt";
    const sortOrder = searchParams.get("sortOrder") === "asc" ? "asc" : "desc";
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "10", 10);
    const skip = (page - 1) * limit;

    const where: any = {};
    if (status) {
      where.status = status;
    }

    if (tripType) {
      where.tripType = { contains: tripType, mode: "insensitive" };
    }

    if (search) {
      where.OR = [
        { customerName: { contains: search, mode: "insensitive" } },
        { email: { contains: search, mode: "insensitive" } },
        { phone: { contains: search, mode: "insensitive" } },
        { pickupLocation: { contains: search, mode: "insensitive" } },
        { dropLocation: { contains: search, mode: "insensitive" } },
      ];
    }

    // Build orderBy object
    let orderBy: any = { createdAt: sortOrder };
    if (sortBy === "customerName") {
      orderBy = { customerName: sortOrder };
    } else if (sortBy === "pickupDateTime") {
      orderBy = { pickupDateTime: sortOrder };
    } else if (sortBy === "createdAt") {
      orderBy = { createdAt: sortOrder };
    }

    // Total matching records count
    const totalCount = await prisma.rentalLead.count({ where });

    // Fetch paginated records with vehicleCategory join
    const leads = await prisma.rentalLead.findMany({
      where,
      include: {
        vehicleCategory: {
          select: { id: true, name: true, slug: true }
        }
      },
      orderBy,
      skip,
      take: limit,
    });

    // Pipeline counts for stats header
    const [newCount, contactedCount, qualifiedCount, negotiationCount, wonCount, lostCount, archivedCount] = await Promise.all([
      prisma.rentalLead.count({ where: { status: "NEW" } }),
      prisma.rentalLead.count({ where: { status: "CONTACTED" } }),
      prisma.rentalLead.count({ where: { status: "QUALIFIED" } }),
      prisma.rentalLead.count({ where: { status: "NEGOTIATION" } }),
      prisma.rentalLead.count({ where: { status: "WON" } }),
      prisma.rentalLead.count({ where: { status: "LOST" } }),
      prisma.rentalLead.count({ where: { status: "ARCHIVED" } }),
    ]);

    const totalPages = Math.ceil(totalCount / limit) || 1;

    return NextResponse.json({
      leads,
      pagination: {
        totalCount,
        totalPages,
        currentPage: page,
        limit,
      },
      stats: {
        total: newCount + contactedCount + qualifiedCount + negotiationCount + wonCount + lostCount + archivedCount,
        NEW: newCount,
        CONTACTED: contactedCount,
        QUALIFIED: qualifiedCount,
        NEGOTIATION: negotiationCount,
        WON: wonCount,
        LOST: lostCount,
        ARCHIVED: archivedCount,
      }
    }, { status: 200 });
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
        status: "NEW",
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
