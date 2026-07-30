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
    const paymentStatus = searchParams.get("paymentStatus") || "";

    const where: any = {};
    if (status) {
      where.status = status;
    }
    if (paymentStatus) {
      where.payments = {
        some: { status: paymentStatus }
      };
    }
    if (search) {
      where.OR = [
        { bookingNumber: { contains: search, mode: "insensitive" } },
        { customer: { name: { contains: search, mode: "insensitive" } } },
        { customer: { email: { contains: search, mode: "insensitive" } } },
        { customer: { phone: { contains: search, mode: "insensitive" } } },
        { pickupLocation: { contains: search, mode: "insensitive" } },
        { dropLocation: { contains: search, mode: "insensitive" } },
        { vehicle: { registrationNumber: { contains: search, mode: "insensitive" } } },
        { vehicle: { driver: { name: { contains: search, mode: "insensitive" } } } },
      ];
    }

    const bookings = await prisma.booking.findMany({
      where,
      include: {
        customer: { select: { name: true, email: true, phone: true } },
        vehicleCategory: { select: { name: true } },
        vehicle: {
          select: {
            registrationNumber: true,
            model: true,
            driver: { select: { name: true, phone: true } }
          }
        },
        payments: true
      },
      orderBy: { createdAt: "desc" },
    });

    const headers = [
      "Booking PNR",
      "Customer Name",
      "Customer Email",
      "Customer Phone",
      "Booking Type",
      "Pickup Location",
      "Drop Location",
      "Pickup Date Time",
      "Vehicle Category",
      "Assigned Vehicle",
      "Assigned Driver",
      "Status",
      "Net Amount",
      "Payment Status",
      "Razorpay Order ID",
      "Notes",
      "Created At"
    ];

    const escapeCSV = (val: any) => {
      if (val === null || val === undefined) return '""';
      let stringified = String(val).replace(/"/g, '""');
      return `"${stringified}"`;
    };

    const rows = bookings.map(b => {
      const mainPayment = b.payments?.[0];
      return [
        escapeCSV(b.bookingNumber),
        escapeCSV(b.customer?.name),
        escapeCSV(b.customer?.email),
        escapeCSV(b.customer?.phone),
        escapeCSV(b.type),
        escapeCSV(b.pickupLocation),
        escapeCSV(b.dropLocation),
        escapeCSV(b.pickupDateTime.toISOString()),
        escapeCSV(b.vehicleCategory?.name),
        escapeCSV(b.vehicle ? `${b.vehicle.model} (${b.vehicle.registrationNumber})` : "Unassigned"),
        escapeCSV(b.vehicle?.driver ? `${b.vehicle.driver.name} (${b.vehicle.driver.phone})` : "Unassigned"),
        escapeCSV(b.status),
        escapeCSV(Number(b.netAmount).toFixed(2)),
        escapeCSV(mainPayment?.status || "PENDING"),
        escapeCSV(mainPayment?.razorpayOrderId || "N/A"),
        escapeCSV(b.notes),
        escapeCSV(b.createdAt.toISOString())
      ];
    });

    const csvContent = [
      headers.join(","),
      ...rows.map(r => r.join(","))
    ].join("\n");

    const filename = status ? `bookings-dispatch-${status.toLowerCase()}.csv` : "bookings-dispatch.csv";

    return new NextResponse(csvContent, {
      status: 200,
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Cache-Control": "no-cache, no-store, must-revalidate",
      },
    });
  } catch (error) {
    console.error("GET /api/bookings/export error:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
