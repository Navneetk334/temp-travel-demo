import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { corporateLeadSchema } from "@/lib/validations/corporate";
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
    const sortBy = searchParams.get("sortBy") || "createdAt";
    const sortOrder = searchParams.get("sortOrder") === "asc" ? "asc" : "desc";
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "10", 10);
    const skip = (page - 1) * limit;

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

    // Build orderBy object
    let orderBy: any = { createdAt: sortOrder };
    if (sortBy === "companyName") {
      orderBy = { companyName: sortOrder };
    } else if (sortBy === "employeeCount") {
      orderBy = { employeeCount: sortOrder };
    } else if (sortBy === "createdAt") {
      orderBy = { createdAt: sortOrder };
    }

    // Count total matching records for pagination
    const totalCount = await prisma.corporateLead.count({ where });

    // Fetch paginated leads
    const leads = await prisma.corporateLead.findMany({
      where,
      orderBy,
      skip,
      take: limit,
    });

    // Pipeline counts for stats header
    const [newCount, contactedCount, qualifiedCount, negotiationCount, wonCount, lostCount, archivedCount] = await Promise.all([
      prisma.corporateLead.count({ where: { status: "NEW" } }),
      prisma.corporateLead.count({ where: { status: "CONTACTED" } }),
      prisma.corporateLead.count({ where: { status: "QUALIFIED" } }),
      prisma.corporateLead.count({ where: { status: "NEGOTIATION" } }),
      prisma.corporateLead.count({ where: { status: "WON" } }),
      prisma.corporateLead.count({ where: { status: "LOST" } }),
      prisma.corporateLead.count({ where: { status: "ARCHIVED" } }),
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
      data: {
        ...result.data,
        status: "NEW",
      },
    });

    return NextResponse.json(lead, { status: 201 });
  } catch (error) {
    console.error("POST /api/corporate/lead error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
