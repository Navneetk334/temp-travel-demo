import { NextRequest, NextResponse } from "next/server";
import Razorpay from "razorpay";
import prisma from "@/lib/prisma";
import crypto from "crypto";

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID || "rzp_test_placeholder",
  key_secret: process.env.RAZORPAY_KEY_SECRET || "placeholder_secret",
});

export async function POST(req: NextRequest) {
  try {
    const { bookingId, amount } = await req.json();

    if (!bookingId || !amount) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Verify booking exists
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
    });

    if (!booking) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 });
    }

    // Create Razorpay Order
    // amount in paise (multiply by 100)
    const orderOptions = {
      amount: Math.round(Number(amount) * 100),
      currency: "INR",
      receipt: `receipt_${booking.bookingNumber}`,
    };

    const order = await razorpay.orders.create(orderOptions);

    if (!order || !order.id) {
      throw new Error("Failed to create Razorpay order");
    }

    // Save PENDING payment record
    await prisma.razorpayPayment.create({
      data: {
        bookingId: booking.id,
        razorpayOrderId: order.id,
        amount: Number(amount),
        currency: "INR",
        status: "PENDING",
      },
    });

    return NextResponse.json({
      orderId: order.id,
      amount: orderOptions.amount,
      currency: orderOptions.currency,
    });
  } catch (error: any) {
    console.error("Razorpay Order Error:", error);
    return NextResponse.json({ error: error.message || "Failed to initiate payment" }, { status: 500 });
  }
}
