import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import prisma from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = await req.json();

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return NextResponse.json({ error: "Missing Razorpay payment parameters" }, { status: 400 });
    }

    const secret = process.env.RAZORPAY_KEY_SECRET || "placeholder_secret";

    // Verify signature
    const hmac = crypto.createHmac("sha256", secret);
    hmac.update(`${razorpay_order_id}|${razorpay_payment_id}`);
    const expectedSignature = hmac.digest("hex");

    const isAuthentic = expectedSignature === razorpay_signature;

    if (!isAuthentic) {
      // Log failed attempt
      await prisma.razorpayPayment.updateMany({
        where: { razorpayOrderId: razorpay_order_id },
        data: { status: "FAILED", razorpayPaymentId: razorpay_payment_id },
      });
      return NextResponse.json({ error: "Invalid payment signature" }, { status: 400 });
    }

    // Payment is valid, update records
    const payment = await prisma.razorpayPayment.findUnique({
      where: { razorpayOrderId: razorpay_order_id },
    });

    if (payment) {
      await prisma.razorpayPayment.update({
        where: { id: payment.id },
        data: {
          razorpayPaymentId: razorpay_payment_id,
          razorpaySignature: razorpay_signature,
          status: "SUCCESS",
        },
      });

      // Optionally update booking status if needed
      // e.g. status: 'CONFIRMED'
    }

    return NextResponse.json({ success: true, message: "Payment verified successfully" });
  } catch (error: any) {
    console.error("Razorpay Verify Error:", error);
    return NextResponse.json({ error: "Failed to verify payment" }, { status: 500 });
  }
}
