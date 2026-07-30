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
    const tripType = searchParams.get("tripType") || "";

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

    const leads = await prisma.rentalLead.findMany({
      where,
      include: {
        vehicleCategory: {
          select: { name: true }
        }
      },
      orderBy: { createdAt: "desc" },
    });

    const headers = [
      "ID",
      "Customer Name",
      "Email",
      "Phone",
      "Pickup Location",
      "Drop Location",
      "Pickup Date Time",
      "Return Date Time",
      "Vehicle Category",
      "Trip Type",
      "Status",
      "Notes",
      "Created At"
    ];

    const escapeCSV = (val: any) => {
      if (val === null || val === undefined) return '""';
      let stringified = String(val).replace(/"/g, '""');
      return `"${stringified}"`;
    };

    const rows = leads.map(l => [
      escapeCSV(l.id),
      escapeCSV(l.customerName),
      escapeCSV(l.email),
      escapeCSV(l.phone),
      escapeCSV(l.pickupLocation),
      escapeCSV(l.dropLocation),
      escapeCSV(l.pickupDateTime.toISOString()),
      escapeCSV(l.returnDateTime ? l.returnDateTime.toISOString() : ""),
      escapeCSV(l.vehicleCategory?.name || "Unassigned"),
      escapeCSV(l.tripType),
      escapeCSV(l.status),
      escapeCSV(l.notes),
      escapeCSV(l.createdAt.toISOString())
    ]);

    const csvContent = [
      headers.join(","),
      ...rows.map(r => r.join(","))
    ].join("\n");

    const filename = status ? `rental-inquiries-${status.toLowerCase()}.csv` : "rental-inquiries.csv";

    return new NextResponse(csvContent, {
      status: 200,
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Cache-Control": "no-cache, no-store, must-revalidate",
      },
    });
  } catch (error) {
    console.error("GET /api/rental/lead/export error:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
