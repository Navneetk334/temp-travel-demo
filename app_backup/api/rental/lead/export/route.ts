import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

async function verifyAdmin(req: NextRequest): Promise<boolean> {
  const token = req.cookies.get("next-auth.session-token")?.value || 
                req.cookies.get("__Secure-next-auth.session-token")?.value;
  return !!token;
}

export async function GET(req: NextRequest) {
  try {
    const isAdmin = await verifyAdmin(req);
    if (!isAdmin) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const leads = await prisma.rentalLead.findMany({
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
      escapeCSV(l.vehicleCategory.name),
      escapeCSV(l.tripType),
      escapeCSV(l.status),
      escapeCSV(l.notes),
      escapeCSV(l.createdAt.toISOString())
    ]);

    const csvContent = [
      headers.join(","),
      ...rows.map(r => r.join(","))
    ].join("\n");

    return new NextResponse(csvContent, {
      status: 200,
      headers: {
        "Content-Type": "text/csv",
        "Content-Disposition": "attachment; filename=rental-inquiries.csv",
        "Cache-Control": "no-cache, no-store, must-revalidate",
      },
    });
  } catch (error) {
    console.error("GET /api/rental/lead/export error:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
