import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { contactLeadSchema } from "@/lib/validations/contact";
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
        { name: { contains: search, mode: "insensitive" } },
        { email: { contains: search, mode: "insensitive" } },
        { phone: { contains: search, mode: "insensitive" } },
        { subject: { contains: search, mode: "insensitive" } },
        { message: { contains: search, mode: "insensitive" } },
      ];
    }

    let orderBy: any = { createdAt: sortOrder };
    if (sortBy === "name") {
      orderBy = { name: sortOrder };
    } else if (sortBy === "createdAt") {
      orderBy = { createdAt: sortOrder };
    }

    const totalCount = await prisma.contactLead.count({ where });

    const leads = await prisma.contactLead.findMany({
      where,
      orderBy,
      skip,
      take: limit,
    });

    const [newCount, readCount, contactedCount, qualifiedCount, lostCount, archivedCount] = await Promise.all([
      prisma.contactLead.count({ where: { status: "NEW" } }),
      prisma.contactLead.count({ where: { status: "READ" } }),
      prisma.contactLead.count({ where: { status: "CONTACTED" } }),
      prisma.contactLead.count({ where: { status: "QUALIFIED" } }),
      prisma.contactLead.count({ where: { status: "LOST" } }),
      prisma.contactLead.count({ where: { status: "ARCHIVED" } }),
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
        total: newCount + readCount + contactedCount + qualifiedCount + lostCount + archivedCount,
        NEW: newCount,
        READ: readCount,
        CONTACTED: contactedCount,
        QUALIFIED: qualifiedCount,
        LOST: lostCount,
        ARCHIVED: archivedCount,
      }
    }, { status: 200 });
  } catch (error) {
    console.error("GET /api/contact error:", error);
    return NextResponse.json({ error: "Failed to fetch contact leads" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const result = contactLeadSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json({ error: result.error.flatten() }, { status: 400 });
    }

    const { name, email, phone, subject, message } = result.data;

    const lead = await prisma.contactLead.create({
      data: {
        name,
        email,
        phone: phone || null,
        subject: subject || null,
        message,
        status: "NEW",
      },
    });

    return NextResponse.json(lead, { status: 201 });
  } catch (error) {
    console.error("POST /api/contact error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
