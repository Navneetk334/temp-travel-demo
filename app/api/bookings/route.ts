import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { verifyAdmin } from "@/lib/auth";
import { z } from "zod";

export async function GET(req: NextRequest) {
  try {
    const isAdmin = await verifyAdmin(req);
    if (!isAdmin) {
      return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search") || "";
    const status = searchParams.get("status") || "";
    const paymentStatus = searchParams.get("paymentStatus") || "";
    const sortBy = searchParams.get("sortBy") || "createdAt";
    const sortOrder = searchParams.get("sortOrder") === "asc" ? "asc" : "desc";
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "10", 10);
    const skip = (page - 1) * limit;

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

    let orderBy: any = { createdAt: sortOrder };
    if (sortBy === "pickupDateTime") {
      orderBy = { pickupDateTime: sortOrder };
    } else if (sortBy === "netAmount") {
      orderBy = { netAmount: sortOrder };
    } else if (sortBy === "createdAt") {
      orderBy = { createdAt: sortOrder };
    }

    const totalCount = await prisma.booking.count({ where });

    const bookings = await prisma.booking.findMany({
      where,
      include: {
        customer: {
          select: { name: true, phone: true, email: true }
        },
        vehicleCategory: {
          select: { id: true, name: true, slug: true }
        },
        vehicle: {
          select: {
            id: true,
            registrationNumber: true,
            model: true,
            driver: {
              select: { name: true, phone: true }
            }
          }
        },
        payments: true
      },
      orderBy,
      skip,
      take: limit,
    });

    const [pendingCount, confirmedCount, driverAssignedCount, vehicleAssignedCount, inProgressCount, completedCount, cancelledCount] = await Promise.all([
      prisma.booking.count({ where: { status: "PENDING" } }),
      prisma.booking.count({ where: { status: "CONFIRMED" } }),
      prisma.booking.count({ where: { status: "DRIVER_ASSIGNED" } }),
      prisma.booking.count({ where: { status: "VEHICLE_ASSIGNED" } }),
      prisma.booking.count({ where: { status: { in: ["IN_PROGRESS", "IN_TRANSIT"] } } }),
      prisma.booking.count({ where: { status: "COMPLETED" } }),
      prisma.booking.count({ where: { status: "CANCELLED" } }),
    ]);

    const totalPages = Math.ceil(totalCount / limit) || 1;

    return NextResponse.json({
      bookings,
      pagination: {
        totalCount,
        totalPages,
        currentPage: page,
        limit,
      },
      stats: {
        total: pendingCount + confirmedCount + driverAssignedCount + vehicleAssignedCount + inProgressCount + completedCount + cancelledCount,
        PENDING: pendingCount,
        CONFIRMED: confirmedCount,
        DRIVER_ASSIGNED: driverAssignedCount,
        VEHICLE_ASSIGNED: vehicleAssignedCount,
        IN_PROGRESS: inProgressCount,
        COMPLETED: completedCount,
        CANCELLED: cancelledCount,
      }
    }, { status: 200 });
  } catch (error) {
    console.error("GET /api/bookings error:", error);
    return NextResponse.json({ error: "Failed to fetch bookings" }, { status: 500 });
  }
}

const tourBookingSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  phone: z.string().min(10, "Phone number must be at least 10 digits"),
  travelDate: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: "Invalid travel date",
  }),
  numPassengers: z.number().min(1, "Must have at least 1 passenger"),
  details: z.string().optional().nullable().or(z.literal("")),
  tourPackageId: z.string().uuid("Invalid tour package ID"),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const result = tourBookingSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json({ error: result.error.flatten() }, { status: 400 });
    }

    const { name, email, phone, travelDate, numPassengers, details, tourPackageId } = result.data;

    const tour = await prisma.tourPackage.findUnique({
      where: { id: tourPackageId }
    });
    if (!tour) {
      return NextResponse.json({ error: "Tour package not found" }, { status: 404 });
    }

    let user = await prisma.user.findUnique({
      where: { email }
    });
    if (!user) {
      user = await prisma.user.create({
        data: {
          name,
          email,
          phone,
          passwordHash: "$2a$12$tD9Y59DqD784lXUvJ9L9XeR82R2gBfE8L9l6UeQ9qXbV8T9yT9nCq",
          role: "CUSTOMER",
          isActive: true
        }
      });
    }

    let vehicleCategory = await prisma.vehicleCategory.findFirst({
      where: { slug: "suv" }
    });
    if (!vehicleCategory) {
      vehicleCategory = await prisma.vehicleCategory.findFirst();
    }
    if (!vehicleCategory) {
      return NextResponse.json({ error: "No vehicle categories configured in system" }, { status: 500 });
    }

    const count = await prisma.booking.count();
    const bookingNumber = `BKG-${10000 + count + 1}`;

    const totalAmount = Number(tour.basePrice) * numPassengers;
    const taxAmount = totalAmount * 0.05;
    const netAmount = totalAmount + taxAmount;

    const booking = await prisma.booking.create({
      data: {
        bookingNumber,
        customerId: user.id,
        vehicleCategoryId: vehicleCategory.id,
        type: "TOUR_PACKAGE",
        status: "PENDING",
        pickupDateTime: new Date(travelDate),
        pickupLocation: "IGI Airport Terminal 3, Delhi",
        dropLocation: tour.title,
        totalAmount,
        taxAmount,
        netAmount,
        tourPackageId,
        notes: `Passengers: ${numPassengers}. Comments: ${details || "None"}`
      }
    });

    await prisma.razorpayPayment.create({
      data: {
        bookingId: booking.id,
        razorpayOrderId: `order_live_${10000 + count + 1}_xyz`,
        status: "PENDING",
        amount: netAmount,
        currency: "INR"
      }
    });

    return NextResponse.json(booking, { status: 201 });
  } catch (error) {
    console.error("POST /api/bookings error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
