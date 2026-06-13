import { z } from "zod";

// Validates order creation requests
export const createOrderSchema = z.object({
  bookingId: z.string().uuid("Invalid booking ID"),
  paymentTier: z.enum(["FULL", "ADVANCE"]).default("FULL"),
});

// Validates payment verification signatures
export const verifyPaymentSchema = z.object({
  bookingId: z.string().uuid("Invalid booking ID"),
  razorpayOrderId: z.string().min(5, "Invalid order ID"),
  razorpayPaymentId: z.string().min(5, "Invalid payment ID"),
  razorpaySignature: z.string().min(10, "Invalid signature"),
});
