import React from "react";
import prisma from "@/lib/prisma";
import GSTInvoiceTemplate, { InvoiceData } from "@/components/admin/GSTInvoiceTemplate";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export const dynamic = "force-dynamic";

// Number to Words utility function for INR
function numberToWords(num: number): string {
  const a = ['', 'One ', 'Two ', 'Three ', 'Four ', 'Five ', 'Six ', 'Seven ', 'Eight ', 'Nine ', 'Ten ', 'Eleven ', 'Twelve ', 'Thirteen ', 'Fourteen ', 'Fifteen ', 'Sixteen ', 'Seventeen ', 'Eighteen ', 'Nineteen '];
  const b = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

  if ((num = num.toString().replace(/[\, ]/g, '') as any) != parseFloat(num as any)) return 'not a number';
  let x: any = num.toString().indexOf('.');
  if (x == -1) x = num.toString().length;
  if (x > 15) return 'too big';
  let n: any = num.toString().split('');
  let str = '';
  let sk = 0;
  for (let i = 0; i < x; i++) {
    if ((x - i) % 3 == 2) {
      if (n[i] == '1') {
        str += a[Number(n[i]) + Number(n[i + 1])] + ' ';
        i++;
        sk = 1;
      } else if (n[i] != 0) {
        str += b[n[i]] + ' ';
        sk = 1;
      }
    } else if (n[i] != 0) {
      str += a[n[i]] + ' ';
      if ((x - i) % 3 == 0) str += 'Hundred ';
      sk = 1;
    }
    if ((x - i) % 3 == 1) {
      if (sk) str += (x - i - 1 == 9 ? 'Billion ' : x - i - 1 == 6 ? 'Million ' : x - i - 1 == 3 ? 'Thousand ' : '');
      sk = 0;
    }
  }
  if (x != num.toString().length) {
    let y = num.toString().length;
    str += 'point ';
    for (let i = x + 1; i < y; i++) str += a[n[i]] + ' ';
  }
  return str.replace(/\s+/g, ' ').trim();
}

export default async function BookingInvoicePage({ params }: { params: { id: string } }) {
  const booking = await prisma.booking.findUnique({
    where: { id: params.id },
    include: {
      customer: true,
      vehicle: true,
      vehicleCategory: true,
      payments: true,
    }
  });

  if (!booking) {
    notFound();
  }

  // Fetch or mock Company Settings
  // In a real app, this comes from `prisma.siteSetting`
  const companyName = "TEMP TRAVEL CAR RENTALS PVT LTD";
  const companyAddress = "123 Business Hub, Sector 62\nNoida, Uttar Pradesh 201309";
  const companyGst = "09AAAAA0000A1Z5";

  // GST Math
  const netAmount = Number(booking.netAmount);
  // Defaulting to 9% CGST + 9% SGST. If IGST is required, it can be adjusted.
  const cgstRate = 9;
  const sgstRate = 9;
  
  const cgstAmount = (netAmount * cgstRate) / 100;
  const sgstAmount = (netAmount * sgstRate) / 100;
  const computedTotal = netAmount + cgstAmount + sgstAmount;
  
  // Create Invoice Number from Booking Number
  const invoiceNumber = `INV-${new Date().getFullYear()}-${booking.bookingNumber.replace('BKG-', '')}`;

  const paymentMode = booking.payments.length > 0 ? booking.payments[0].gateway : "Pending";
  const paymentStatus = booking.payments.some(p => p.status === "SUCCESS") ? "PAID" : "PENDING";
  const paymentId = booking.payments.find(p => p.status === "SUCCESS")?.razorpayPaymentId || undefined;

  const invoiceData: InvoiceData = {
    invoiceNumber,
    issueDate: new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }),
    companyName,
    companyGst,
    companyAddress,
    customerName: booking.customer.name,
    customerPhone: booking.customer.phone,
    bookingNumber: booking.bookingNumber,
    vehicleMakeModel: booking.vehicle ? `${booking.vehicle.make} ${booking.vehicle.model}` : booking.vehicleCategory.name,
    tripDates: new Date(booking.pickupDateTime).toLocaleDateString('en-IN'),
    tripLocations: `${booking.pickupLocation} to ${booking.dropLocation || 'Local'}`,
    items: [
      {
        description: `${booking.type.replace('_', ' ')} Service Charges`,
        sacCode: "996601",
        quantity: 1,
        rate: netAmount,
        amount: netAmount
      }
    ],
    subtotal: netAmount,
    cgstRate,
    cgstAmount,
    sgstRate,
    sgstAmount,
    totalAmount: computedTotal,
    amountWords: numberToWords(Math.round(computedTotal)),
    status: paymentStatus,
    paymentMode,
    paymentId
  };

  return (
    <div className="min-h-screen bg-gray-50 text-black font-sans pb-20 print:bg-white print:pb-0">
      {/* Top Navbar */}
      <div className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between sticky top-0 z-50 print:hidden shadow-sm">
        <Link 
          href="/admin/bookings-dispatch" 
          className="flex items-center gap-2 text-sm font-semibold text-gray-600 hover:text-black transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Dispatch
        </Link>
        <div className="font-bold text-lg tracking-tight">Invoice System</div>
      </div>

      <div className="max-w-5xl mx-auto pt-10">
        <GSTInvoiceTemplate data={invoiceData} />
      </div>
    </div>
  );
}
