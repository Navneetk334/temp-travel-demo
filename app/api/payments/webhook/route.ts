import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import crypto from "crypto";

export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.text();
    const signature = req.headers.get("x-razorpay-signature") || "";

    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET || "placeholder_webhook_secret";

    // Verify webhook signature
    const expectedSignature = crypto
      .createHmac("sha256", webhookSecret)
      .update(rawBody)
      .digest("hex");

    if (expectedSignature !== signature) {
      console.warn("Razorpay Webhook: Invalid Signature received.");
      return new NextResponse("Invalid Signature", { status: 400 });
    }

    const payload = JSON.parse(rawBody);
    const event = payload.event;

    // Handle Payment Captured Asynchronously
    if (event === "payment.captured") {
      const paymentEntity = payload.payload.payment.entity;
      const orderId = paymentEntity.order_id;
      const paymentId = paymentEntity.id;

      // Find the payment record in DB
      const existingPayment = await prisma.razorpayPayment.findUnique({
        where: { razorpayOrderId: orderId }
      });

      if (!existingPayment) {
        console.error(`Razorpay Webhook: Payment log for order ${orderId} not found.`);
        return new NextResponse("Order not found", { status: 200 }); // Return 200 to prevent Razorpay retries
      }

      if (existingPayment.status === "SUCCESS") {
        return new NextResponse("Already Processed", { status: 200 });
      }

      // Confirm payment & booking
      await prisma.$transaction([
        prisma.razorpayPayment.update({
          where: { razorpayOrderId: orderId },
          data: {
            status: "SUCCESS",
            razorpayPaymentId: paymentId,
            gatewayResponse: paymentEntity,
          }
        }),
        prisma.booking.update({
          where: { id: existingPayment.bookingId },
          data: {
            status: "CONFIRMED"
          }
        })
      ]);

      console.log(`Razorpay Webhook: Successfully captured payment for order ${orderId}`);
    }

    // Handle Payment Failed
    if (event === "payment.failed") {
      const paymentEntity = payload.payload.payment.entity;
      const orderId = paymentEntity.order_id;

      await prisma.razorpayPayment.update({
        where: { razorpayOrderId: orderId },
        data: {
          status: "FAILED",
          gatewayResponse: paymentEntity,
        }
      });

      console.log(`Razorpay Webhook: Logged payment failure for order ${orderId}`);
    }

    return new NextResponse("OK", { status: 200 });

  } catch (error) {
    console.error("POST /api/payments/webhook error:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
