import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import crypto from "crypto";
import { verifyPaymentSchema } from "@/lib/validations/payment";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const result = verifyPaymentSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json({ error: result.error.flatten() }, { status: 400 });
    }

    const { bookingId, razorpayOrderId, razorpayPaymentId, razorpaySignature } = result.data;

    // Cryptographically verify signature using key_secret
    const secret = process.env.RAZORPAY_KEY_SECRET || "placeholder_secret";
    const generatedSignature = crypto
      .createHmac("sha256", secret)
      .update(`${razorpayOrderId}|${razorpayPaymentId}`)
      .digest("hex");

    if (generatedSignature !== razorpaySignature) {
      // Record payment failure in PostgreSQL
      await prisma.razorpayPayment.update({
        where: { razorpayOrderId },
        data: {
          status: "FAILED",
          gatewayResponse: { error: "Signature mismatch" },
        }
      });

      return NextResponse.json({ error: "Invalid payment signature" }, { status: 400 });
    }

    // Wrap in database transactions for consistency
    const [updatedPayment, updatedBooking] = await prisma.$transaction([
      prisma.razorpayPayment.update({
        where: { razorpayOrderId },
        data: {
          status: "SUCCESS",
          razorpayPaymentId,
          razorpaySignature,
        }
      }),
      prisma.booking.update({
        where: { id: bookingId },
        data: {
          status: "CONFIRMED"
        }
      })
    ]);

    return NextResponse.json({
      message: "Payment verified and booking confirmed successfully",
      bookingNumber: updatedBooking.bookingNumber,
    }, { status: 200 });

  } catch (error) {
    console.error("POST /api/payments/verify error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
