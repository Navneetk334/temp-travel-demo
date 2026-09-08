"use client";

import React, { useRef } from "react";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import { Download, CheckCircle, Printer } from "lucide-react";

export interface InvoiceData {
  invoiceNumber: string;
  issueDate: string;
  companyName: string;
  companyGst: string;
  companyAddress: string;
  customerName: string;
  customerGst?: string;
  customerAddress?: string;
  customerPhone?: string;
  bookingNumber: string;
  vehicleMakeModel: string;
  tripDates: string;
  tripLocations: string;
  items: {
    description: string;
    sacCode: string;
    quantity: number;
    rate: number;
    amount: number;
  }[];
  subtotal: number;
  cgstRate: number;
  cgstAmount: number;
  sgstRate: number;
  sgstAmount: number;
  igstRate?: number;
  igstAmount?: number;
  totalAmount: number;
  amountWords: string;
  status: "PAID" | "PENDING";
  paymentMode?: string;
  paymentId?: string;
}

interface GSTInvoiceTemplateProps {
  data: InvoiceData;
  onDownloadStart?: () => void;
  onDownloadEnd?: () => void;
}

export default function GSTInvoiceTemplate({
  data,
  onDownloadStart,
  onDownloadEnd
}: GSTInvoiceTemplateProps) {
  const invoiceRef = useRef<HTMLDivElement>(null);

  const downloadPDF = async () => {
    if (!invoiceRef.current) return;
    
    if (onDownloadStart) onDownloadStart();

    try {
      const canvas = await html2canvas(invoiceRef.current, {
        scale: 2,
        useCORS: true,
        logging: false
      });
      
      const imgData = canvas.toDataURL("image/jpeg", 1.0);
      const pdf = new jsPDF("p", "mm", "a4");
      
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      
      pdf.addImage(imgData, "JPEG", 0, 0, pdfWidth, pdfHeight);
      pdf.save(`Invoice_${data.invoiceNumber}.pdf`);
    } catch (err) {
      console.error("PDF generation failed:", err);
      alert("Failed to generate PDF. Please try again.");
    } finally {
      if (onDownloadEnd) onDownloadEnd();
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const isPaid = data.status === "PAID";

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-end gap-3 print:hidden">
        <button
          onClick={handlePrint}
          className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 hover:bg-gray-200 rounded-md transition-colors"
        >
          <Printer className="w-4 h-4" />
          Print
        </button>
        <button
          onClick={downloadPDF}
          className="flex items-center gap-2 px-4 py-2 bg-black text-white hover:bg-gray-800 rounded-md transition-colors shadow-sm"
        >
          <Download className="w-4 h-4" />
          Download PDF
        </button>
      </div>

      {/* Invoice Container */}
      <div 
        ref={invoiceRef}
        className="w-[210mm] min-h-[297mm] mx-auto bg-white p-10 shadow-lg text-black print:shadow-none print:w-full print:p-0 relative"
      >
        {/* Paid Watermark */}
        {isPaid && (
          <div className="absolute inset-0 flex items-center justify-center opacity-10 pointer-events-none z-0">
            <div className="transform -rotate-45 text-[150px] font-black tracking-widest text-green-600 border-8 border-green-600 rounded-xl px-8 py-4">
              PAID
            </div>
          </div>
        )}

        <div className="relative z-10">
          {/* Header */}
          <div className="flex justify-between items-start border-b-2 border-gray-800 pb-6 mb-6">
            <div className="flex flex-col">
              <h1 className="text-4xl font-black tracking-tight mb-1">{data.companyName}</h1>
              <p className="text-sm text-gray-600 max-w-sm whitespace-pre-line">{data.companyAddress}</p>
              <p className="text-sm font-semibold mt-2">GSTIN: {data.companyGst}</p>
            </div>
            <div className="flex flex-col items-end">
              <h2 className="text-3xl font-light tracking-widest text-gray-400 mb-2">TAX INVOICE</h2>
              <div className="text-right">
                <p className="text-sm"><span className="font-semibold">Invoice No:</span> {data.invoiceNumber}</p>
                <p className="text-sm"><span className="font-semibold">Date:</span> {data.issueDate}</p>
                <p className="text-sm"><span className="font-semibold">Booking Ref:</span> {data.bookingNumber}</p>
              </div>
            </div>
          </div>

          {/* Parties */}
          <div className="grid grid-cols-2 gap-12 mb-8">
            <div>
              <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-2">Billed To:</h3>
              <p className="font-bold text-lg">{data.customerName}</p>
              {data.customerAddress && <p className="text-sm text-gray-700 whitespace-pre-line">{data.customerAddress}</p>}
              {data.customerPhone && <p className="text-sm text-gray-700 mt-1">Ph: {data.customerPhone}</p>}
              {data.customerGst && <p className="text-sm font-semibold mt-2">GSTIN: {data.customerGst}</p>}
            </div>
            <div>
              <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-2">Trip Details:</h3>
              <p className="text-sm mb-1"><span className="font-semibold">Vehicle:</span> {data.vehicleMakeModel}</p>
              <p className="text-sm mb-1"><span className="font-semibold">Dates:</span> {data.tripDates}</p>
              <p className="text-sm mb-1"><span className="font-semibold">Route:</span> {data.tripLocations}</p>
            </div>
          </div>

          {/* Items Table */}
          <table className="w-full mb-8 text-left border-collapse">
            <thead>
              <tr className="bg-gray-100">
                <th className="py-3 px-4 font-semibold text-sm border-y border-gray-300 w-12 text-center">#</th>
                <th className="py-3 px-4 font-semibold text-sm border-y border-gray-300">Description of Service</th>
                <th className="py-3 px-4 font-semibold text-sm border-y border-gray-300 text-center">SAC Code</th>
                <th className="py-3 px-4 font-semibold text-sm border-y border-gray-300 text-center">Qty</th>
                <th className="py-3 px-4 font-semibold text-sm border-y border-gray-300 text-right">Rate</th>
                <th className="py-3 px-4 font-semibold text-sm border-y border-gray-300 text-right">Amount (₹)</th>
              </tr>
            </thead>
            <tbody>
              {data.items.map((item, index) => (
                <tr key={index} className="border-b border-gray-200 last:border-b-2 last:border-gray-800">
                  <td className="py-4 px-4 text-sm text-center text-gray-500">{index + 1}</td>
                  <td className="py-4 px-4 text-sm font-medium">{item.description}</td>
                  <td className="py-4 px-4 text-sm text-center text-gray-600">{item.sacCode}</td>
                  <td className="py-4 px-4 text-sm text-center">{item.quantity}</td>
                  <td className="py-4 px-4 text-sm text-right">₹{item.rate.toFixed(2)}</td>
                  <td className="py-4 px-4 text-sm text-right font-semibold">₹{item.amount.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Totals */}
          <div className="flex justify-between items-start mb-12">
            <div className="w-1/2 pr-8">
              <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-2">Payment Details:</h3>
              <div className="bg-gray-50 p-4 rounded-md border border-gray-200">
                <p className="text-sm mb-2"><span className="font-semibold">Status:</span> 
                  <span className={`ml-2 inline-flex items-center gap-1 ${isPaid ? 'text-green-600' : 'text-amber-600'}`}>
                    {isPaid ? <CheckCircle className="w-4 h-4" /> : null}
                    {data.status}
                  </span>
                </p>
                {data.paymentMode && (
                  <p className="text-sm mb-1"><span className="font-semibold">Mode:</span> {data.paymentMode}</p>
                )}
                {data.paymentId && (
                  <p className="text-sm"><span className="font-semibold">Transaction ID:</span> {data.paymentId}</p>
                )}
              </div>
            </div>
            
            <div className="w-1/2">
              <div className="flex justify-between py-2 border-b border-gray-100">
                <span className="text-sm font-medium text-gray-600">Subtotal</span>
                <span className="text-sm font-semibold">₹{data.subtotal.toFixed(2)}</span>
              </div>
              
              {data.igstAmount ? (
                <div className="flex justify-between py-2 border-b border-gray-100">
                  <span className="text-sm font-medium text-gray-600">IGST ({data.igstRate}%)</span>
                  <span className="text-sm font-semibold">₹{data.igstAmount.toFixed(2)}</span>
                </div>
              ) : (
                <>
                  <div className="flex justify-between py-2 border-b border-gray-100">
                    <span className="text-sm font-medium text-gray-600">CGST ({data.cgstRate}%)</span>
                    <span className="text-sm font-semibold">₹{data.cgstAmount.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-gray-100">
                    <span className="text-sm font-medium text-gray-600">SGST ({data.sgstRate}%)</span>
                    <span className="text-sm font-semibold">₹{data.sgstAmount.toFixed(2)}</span>
                  </div>
                </>
              )}

              <div className="flex justify-between py-4 mt-2 border-t-2 border-black bg-gray-50 px-4 -mx-4">
                <span className="text-lg font-bold">Grand Total</span>
                <span className="text-xl font-black">₹{data.totalAmount.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Footer/Words */}
          <div className="mt-8">
            <p className="text-sm text-gray-500 mb-8"><span className="font-semibold">Amount in Words:</span> Rupees {data.amountWords} Only</p>
            
            <div className="flex justify-between items-end border-t border-gray-200 pt-8">
              <div>
                <p className="text-xs text-gray-400">Subject to local jurisdiction.</p>
                <p className="text-xs text-gray-400">This is a computer generated invoice.</p>
              </div>
              <div className="text-center">
                <div className="h-16 w-48 border-b border-gray-300 mb-2"></div>
                <p className="text-xs font-semibold uppercase tracking-wider">Authorized Signatory</p>
                <p className="text-xs text-gray-500 mt-1">For {data.companyName}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
