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

    // Fetch all leads
    const leads = await prisma.corporateLead.findMany({
      orderBy: { createdAt: "desc" },
    });

    // Generate CSV Header
    const headers = [
      "ID",
      "Company Name",
      "Contact Person",
      "Email",
      "Phone",
      "Employee Count",
      "Pickup Locations",
      "Service Type",
      "Requirements",
      "Status",
      "Notes",
      "Created At"
    ];

    // Helper to safely format values for CSV (escaping quotes and wrapping in double quotes)
    const escapeCSV = (val: any) => {
      if (val === null || val === undefined) return '""';
      let stringified = String(val).replace(/"/g, '""'); // escape quotes
      return `"${stringified}"`;
    };

    const rows = leads.map(l => [
      escapeCSV(l.id),
      escapeCSV(l.companyName),
      escapeCSV(l.contactName),
      escapeCSV(l.email),
      escapeCSV(l.phone),
      escapeCSV(l.employeeCount),
      escapeCSV(l.pickupLocations),
      escapeCSV(l.serviceType),
      escapeCSV(l.requirements),
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
        "Content-Disposition": "attachment; filename=corporate-leads.csv",
        "Cache-Control": "no-cache, no-store, must-revalidate",
      },
    });
  } catch (error) {
    console.error("GET /api/corporate/lead/export error:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
