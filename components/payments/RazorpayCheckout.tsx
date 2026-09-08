"use client";

import React, { useState } from "react";
import { CreditCard, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";
import Script from "next/script";

// Define the shape of the Razorpay window object
declare global {
  interface Window {
    Razorpay: any;
  }
}

interface RazorpayCheckoutProps {
  bookingId: string;
  bookingNumber: string;
  netAmount: number;
  paymentTier: "ADVANCE" | "FULL";
  onSuccess?: () => void;
  buttonClassName?: string;
  buttonText?: string;
  disabled?: boolean;
}

export default function RazorpayCheckout({
  bookingId,
  bookingNumber,
  netAmount,
  paymentTier,
  onSuccess,
  buttonClassName = "bg-black text-white hover:bg-gray-800",
  buttonText = "Pay Now",
  disabled = false
}: RazorpayCheckoutProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handlePayment = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // 1. Create order on backend
      const orderRes = await fetch("/api/payments/order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bookingId, paymentTier }),
      });

      const orderData = await orderRes.json();

      if (!orderRes.ok) {
        throw new Error(orderData.error || "Failed to initialize payment");
      }

      // 2. Configure Razorpay Checkout
      const options = {
        key: orderData.keyId,
        amount: orderData.amount,
        currency: orderData.currency,
        name: "TEMP TRAVEL",
        description: `Payment for Booking #${bookingNumber}`,
        order_id: orderData.orderId,
        handler: async function (response: any) {
          try {
            setIsLoading(true);
            // 3. Verify Payment
            const verifyRes = await fetch("/api/payments/verify", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                bookingId,
                razorpayOrderId: response.razorpay_order_id,
                razorpayPaymentId: response.razorpay_payment_id,
                razorpaySignature: response.razorpay_signature,
              }),
            });

            if (!verifyRes.ok) {
              const verifyData = await verifyRes.json();
              throw new Error(verifyData.error || "Payment verification failed");
            }

            // Success
            if (onSuccess) onSuccess();
          } catch (err: any) {
            setError(err.message || "An error occurred during verification");
          } finally {
            setIsLoading(false);
          }
        },
        prefill: {
          name: "Customer Name", 
          email: "customer@example.com",
          contact: "9999999999"
        },
        theme: {
          color: "#000000"
        }
      };

      const rzp = new window.Razorpay(options);
      
      rzp.on('payment.failed', function (response: any){
        setError(`Payment Failed: ${response.error.description}`);
      });

      rzp.open();
    } catch (err: any) {
      setError(err.message || "Could not initiate payment gateway");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="lazyOnload" />
      
      <div className="flex flex-col items-start gap-2">
        <button
          onClick={handlePayment}
          disabled={isLoading || disabled}
          className={`px-4 py-2 rounded-md font-medium flex items-center justify-center gap-2 transition-colors ${buttonClassName} ${
            isLoading || disabled ? "opacity-50 cursor-not-allowed" : ""
          }`}
        >
          {isLoading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <CreditCard className="w-4 h-4" />
          )}
          {isLoading ? "Processing..." : buttonText}
        </button>

        {error && (
          <div className="flex items-center gap-2 text-red-600 text-sm bg-red-50 p-2 rounded w-full">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <p>{error}</p>
          </div>
        )}
      </div>
    </>
  );
}
