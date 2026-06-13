import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

async function verifyAdmin(req: NextRequest): Promise<boolean> {
  const token = req.cookies.get("next-auth.session-token")?.value || req.cookies.get("__Secure-next-auth.session-token")?.value || req.cookies.get("temp-travel-admin-session")?.value;
  return !!token;
}

export async function GET(req: NextRequest) {
  try {
    const isAdmin = await verifyAdmin(req);
    if (!isAdmin) {
      return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
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
        { bookingNumber: { contains: search, mode: "insensitive" } },
        { customer: { name: { contains: search, mode: "insensitive" } } },
        { customer: { phone: { contains: search, mode: "insensitive" } } },
        { pickupLocation: { contains: search, mode: "insensitive" } },
        { dropLocation: { contains: search, mode: "insensitive" } },
      ];
    }

    const bookings = await prisma.booking.findMany({
      where,
      include: {
        customer: {
          select: { name: true, phone: true, email: true }
        },
        vehicleCategory: {
          select: { id: true, name: true }
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
      orderBy: { createdAt: "desc" }
    });

    return NextResponse.json(bookings, { status: 200 });
  } catch (error) {
    console.error("GET /api/bookings error:", error);
    return NextResponse.json({ error: "Failed to fetch bookings" }, { status: 500 });
  }
}

import { z } from "zod";

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

    // 1. Fetch the tour package to verify price
    const tour = await prisma.tourPackage.findUnique({
      where: { id: tourPackageId }
    });
    if (!tour) {
      return NextResponse.json({ error: "Tour package not found" }, { status: 404 });
    }

    // 2. Find or create User by email
    let user = await prisma.user.findUnique({
      where: { email }
    });
    if (!user) {
      user = await prisma.user.create({
        data: {
          name,
          email,
          phone,
          passwordHash: "$2a$12$tD9Y59DqD784lXUvJ9L9XeR82R2gBfE8L9l6UeQ9qXbV8T9yT9nCq", // Default mock hash
          role: "CUSTOMER",
          isActive: true
        }
      });
    }

    // 3. Find a default vehicle category (first category or SUV/Sedan)
    let vehicleCategory = await prisma.vehicleCategory.findFirst({
      where: { slug: "suv" }
    });
    if (!vehicleCategory) {
      vehicleCategory = await prisma.vehicleCategory.findFirst();
    }
    if (!vehicleCategory) {
      return NextResponse.json({ error: "No vehicle categories configured in system" }, { status: 500 });
    }

    // 4. Generate unique booking number
    const count = await prisma.booking.count();
    const bookingNumber = `BKG-${10000 + count + 1}`;

    // 5. Calculate prices
    const totalAmount = Number(tour.basePrice) * numPassengers;
    const taxAmount = totalAmount * 0.05; // 5% GST
    const netAmount = totalAmount + taxAmount;

    // 6. Create booking
    const booking = await prisma.booking.create({
      data: {
        bookingNumber,
        customerId: user.id,
        vehicleCategoryId: vehicleCategory.id,
        type: "TOUR_PACKAGE",
        status: "PENDING",
        pickupDateTime: new Date(travelDate),
        pickupLocation: "IGI Airport Terminal 3, Delhi", // Default tour pickup
        dropLocation: tour.title,
        totalAmount,
        taxAmount,
        netAmount,
        tourPackageId,
        notes: `Passengers: ${numPassengers}. Comments: ${details || "None"}`
      }
    });

    // 7. Create a pending payment log
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

