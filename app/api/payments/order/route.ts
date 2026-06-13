import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { razorpay } from "@/lib/razorpay";
import { createOrderSchema } from "@/lib/validations/payment";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const result = createOrderSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json({ error: result.error.flatten() }, { status: 400 });
    }

    const { bookingId, paymentTier } = result.data;

    // Fetch booking details
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId }
    });

    if (!booking) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 });
    }

    if (booking.status === "CONFIRMED") {
      return NextResponse.json({ error: "Booking has already been confirmed" }, { status: 400 });
    }

    // Calculate amount based on tier
    // Razorpay accepts amounts in paise (INR * 100)
    let paymentAmount = Number(booking.netAmount);
    
    if (paymentTier === "ADVANCE") {
      // 20% Advance Payment rate
      paymentAmount = Number((paymentAmount * 0.20).toFixed(2));
    }

    const amountInPaise = Math.round(paymentAmount * 100);

    // Create order inside Razorpay API
    const orderOptions = {
      amount: amountInPaise,
      currency: "INR",
      receipt: `receipt_${booking.bookingNumber}`,
    };

    const order = await razorpay.orders.create(orderOptions);

    if (!order) {
      return NextResponse.json({ error: "Failed to generate gateway order" }, { status: 500 });
    }

    // Save payment log in PostgreSQL
    const payment = await prisma.razorpayPayment.create({
      data: {
        bookingId,
        razorpayOrderId: order.id,
        status: "PENDING",
        amount: paymentAmount.toString(),
        currency: "INR",
      }
    });

    return NextResponse.json({
      keyId: process.env.RAZORPAY_KEY_ID || "rzp_test_placeholder",
      orderId: order.id,
      amount: amountInPaise,
      currency: "INR",
      bookingNumber: booking.bookingNumber,
    }, { status: 201 });

  } catch (error) {
    console.error("POST /api/payments/order error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
