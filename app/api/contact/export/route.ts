import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { verifyAdmin } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    const isAdmin = await verifyAdmin(req);
    if (!isAdmin) {
      return new NextResponse("Unauthorized", { status: 401 });
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
        { name: { contains: search, mode: "insensitive" } },
        { email: { contains: search, mode: "insensitive" } },
        { phone: { contains: search, mode: "insensitive" } },
        { subject: { contains: search, mode: "insensitive" } },
        { message: { contains: search, mode: "insensitive" } },
      ];
    }

    const leads = await prisma.contactLead.findMany({
      where,
      orderBy: { createdAt: "desc" },
    });

    const headers = [
      "ID",
      "Name",
      "Email",
      "Phone",
      "Subject",
      "Message",
      "Status",
      "Submitted At"
    ];

    const escapeCSV = (val: any) => {
      if (val === null || val === undefined) return '""';
      let stringified = String(val).replace(/"/g, '""');
      return `"${stringified}"`;
    };

    const rows = leads.map(l => [
      escapeCSV(l.id),
      escapeCSV(l.name),
      escapeCSV(l.email),
      escapeCSV(l.phone),
      escapeCSV(l.subject),
      escapeCSV(l.message),
      escapeCSV(l.status),
      escapeCSV(l.createdAt.toISOString())
    ]);

    const csvContent = [
      headers.join(","),
      ...rows.map(r => r.join(","))
    ].join("\n");

    const filename = status ? `contact-messages-${status.toLowerCase()}.csv` : "contact-messages.csv";

    return new NextResponse(csvContent, {
      status: 200,
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Cache-Control": "no-cache, no-store, must-revalidate",
      },
    });
  } catch (error) {
    console.error("GET /api/contact/export error:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
