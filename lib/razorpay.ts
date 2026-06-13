import Razorpay from "razorpay";

if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
  console.warn("Razorpay API Keys are missing. Razorpay payments will not function correctly.");
}

export const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID || "placeholder_key",
  key_secret: process.env.RAZORPAY_KEY_SECRET || "placeholder_secret",
});
