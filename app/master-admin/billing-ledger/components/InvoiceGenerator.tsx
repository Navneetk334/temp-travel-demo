"use client";

import React, { useRef, useState } from "react";
import { jsPDF } from "jspdf";
import html2canvas from "html2canvas";
import { Download, Loader2 } from "lucide-react";
import { format } from "date-fns";

export default function InvoiceGenerator({ booking }: { booking: any }) {
  const invoiceRef = useRef<HTMLDivElement>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const generatePDF = async () => {
    if (!invoiceRef.current) return;
    setIsGenerating(true);

    try {
      const element = invoiceRef.current;
      // Temporarily make it visible for html2canvas
      element.style.display = "block";
      
      const canvas = await html2canvas(element, {
        scale: 2, // High resolution
        useCORS: true,
        logging: false,
      });

      element.style.display = "none";

      const imgData = canvas.toDataURL("image/jpeg", 1.0);
      const pdf = new jsPDF("p", "mm", "a4");
      
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      
      pdf.addImage(imgData, "JPEG", 0, 0, pdfWidth, pdfHeight);
      pdf.save(`Tax_Invoice_${booking.bookingNumber}.pdf`);

    } catch (error) {
      console.error("Error generating PDF:", error);
      alert("Failed to generate PDF. Check console for details.");
    } finally {
      setIsGenerating(false);
    }
  };

  const gstRate = 5; // Assuming 5% GST for transportation
  const baseAmount = Number(booking.netAmount) / (1 + (gstRate/100));
  const gstAmount = Number(booking.netAmount) - baseAmount;
  const cgstAmount = gstAmount / 2;
  const sgstAmount = gstAmount / 2;

  return (
    <>
      <button
        onClick={generatePDF}
        disabled={isGenerating}
        className="inline-flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 px-3 py-1.5 rounded-lg text-xs font-bold transition-all disabled:opacity-50"
      >
        {isGenerating ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Download className="w-3.5 h-3.5" />}
        PDF Invoice
      </button>

      {/* Hidden Invoice Template */}
      <div 
        ref={invoiceRef}
        className="bg-white text-slate-950 p-8 w-[800px] h-max absolute left-[-9999px] top-[-9999px]"
        style={{ display: "none" }}
      >
        <div className="flex justify-between items-start border-b-2 border-slate-200 pb-6 mb-6">
          <div>
            <h1 className="text-3xl font-black tracking-tighter text-amber-500">TEMP TRAVEL</h1>
            <p className="text-xs font-semibold mt-1">CAR RENTALS PVT LTD</p>
            <div className="text-[10px] mt-2 space-y-0.5 text-slate-600">
              <p>123 Corporate Park, Sector 62, Noida, UP 201309</p>
              <p>Phone: +91-9999999999 | Email: billing@temptravels.com</p>
              <p className="font-bold">GSTIN: 09ABCDE1234F1Z5</p>
              <p>State: Uttar Pradesh | Code: 09</p>
            </div>
          </div>
          <div className="text-right">
            <h2 className="text-2xl font-black text-slate-300 uppercase tracking-widest">TAX INVOICE</h2>
            <div className="mt-2 text-xs">
              <p><span className="font-semibold text-slate-500">Invoice No:</span> {booking.bookingNumber}</p>
              <p><span className="font-semibold text-slate-500">Date:</span> {format(new Date(), 'dd MMM yyyy')}</p>
              <p><span className="font-semibold text-slate-500">Service:</span> {booking.type.replace("_", " ")}</p>
            </div>
          </div>
        </div>

        <div className="mb-8 grid grid-cols-2 gap-8 text-sm">
          <div>
            <h3 className="font-bold border-b border-slate-200 pb-1 mb-2 text-slate-500 text-xs uppercase tracking-wider">Billed To</h3>
            <p className="font-black text-base">{booking.customer.name}</p>
            <p className="text-slate-600">{booking.customer.email}</p>
            <p className="text-slate-600">{booking.customer.phone}</p>
          </div>
          <div>
            <h3 className="font-bold border-b border-slate-200 pb-1 mb-2 text-slate-500 text-xs uppercase tracking-wider">Trip Details</h3>
            <p><span className="font-semibold">Pickup:</span> {booking.pickupLocation}</p>
            {booking.dropLocation && <p><span className="font-semibold">Drop:</span> {booking.dropLocation}</p>}
            <p><span className="font-semibold">Date:</span> {format(new Date(booking.pickupDateTime), 'dd MMM yyyy HH:mm')}</p>
          </div>
        </div>

        <table className="w-full text-sm mb-8">
          <thead>
            <tr className="bg-slate-100 border-b-2 border-slate-300">
              <th className="py-2 px-3 text-left font-bold text-slate-700">Description</th>
              <th className="py-2 px-3 text-right font-bold text-slate-700">SAC Code</th>
              <th className="py-2 px-3 text-right font-bold text-slate-700">Rate (₹)</th>
              <th className="py-2 px-3 text-right font-bold text-slate-700">Total (₹)</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-b border-slate-100">
              <td className="py-3 px-3">
                <div className="font-bold">{booking.type.replace("_", " ")} Services</div>
                <div className="text-xs text-slate-500">Vehicle: {booking.vehicle?.make} {booking.vehicle?.model} (Reg: {booking.vehicle?.registrationNumber || 'TBA'})</div>
              </td>
              <td className="py-3 px-3 text-right">996601</td>
              <td className="py-3 px-3 text-right">{baseAmount.toFixed(2)}</td>
              <td className="py-3 px-3 text-right">{baseAmount.toFixed(2)}</td>
            </tr>
          </tbody>
        </table>

        <div className="flex justify-end mb-12">
          <div className="w-1/2">
            <div className="flex justify-between py-1 text-sm border-b border-slate-100">
              <span className="text-slate-500">Taxable Amount</span>
              <span>₹{baseAmount.toFixed(2)}</span>
            </div>
            <div className="flex justify-between py-1 text-sm border-b border-slate-100">
              <span className="text-slate-500">CGST @ {gstRate/2}%</span>
              <span>₹{cgstAmount.toFixed(2)}</span>
            </div>
            <div className="flex justify-between py-1 text-sm border-b border-slate-200">
              <span className="text-slate-500">SGST @ {gstRate/2}%</span>
              <span>₹{sgstAmount.toFixed(2)}</span>
            </div>
            <div className="flex justify-between py-2 text-lg font-black text-emerald-600 bg-emerald-50 px-2 mt-2 rounded-md">
              <span>Grand Total</span>
              <span>₹{Number(booking.netAmount).toFixed(2)}</span>
            </div>
          </div>
        </div>

        <div className="border-t border-slate-200 pt-6 mt-16 text-xs text-slate-500 text-center space-y-1">
          <p className="font-bold text-slate-700">Thank you for traveling with Temp Travel!</p>
          <p>This is a computer generated invoice and does not require a physical signature.</p>
          <p>For any billing discrepancies, please contact billing@temptravels.com within 7 days.</p>
        </div>
      </div>
    </>
  );
}
