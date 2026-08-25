import { NextRequest, NextResponse } from "next/server";

export interface DutySlipRecord {
  id: string;
  tripSheetNo: string;
  carNo: string;
  date: string;
  reportedTo: string;
  account: string;
  reportAt: string;
  
  // Time & Kilometer Log
  garageDepartureTime: string;
  garageOpeningKm: string;
  reportingTime: string;
  reportingKm: string;
  releaseTime: string;
  releaseKm: string;
  garagingTime: string;
  garagingKm: string;
  totalHours: string;
  totalKms: string;
  remarks: string;

  // Feedback & Settlement
  serviceFeedback: "EXCELLENT" | "GOOD" | "POOR" | string;
  parkingTollTax: string;
  releaseDate: string;
  placeOfRelease: string;
  mobile: string;

  // Office Use Only
  officeTo: string;
  bookedBy: string;
  officeFor: string;
  garageInTime: string;
  garageInKm: string;
  officeReleasePlace: string;
  parkingAmount: string;
  handoverPerson: string;
  handoverDate: string;
  handoverTime: string;
  officeRemarks: string;

  // Car Usage Track Sheet (multi-leg)
  usageTracks: Array<{ id: string; from: string; to: string; details?: string }>;

  // Scanned Image Vault
  slipImageUrl?: string;
  slipImageName?: string;

  createdAt: string;
  updatedAt: string;
}

// Global In-Memory Persistence for Duty Slips across dev/production instances
let dutySlipsStore: DutySlipRecord[] = [
  {
    id: "DS-2026-001",
    tripSheetNo: "TT-DS-9842",
    carNo: "DL 1ZB 9842",
    date: "2026-08-24",
    reportedTo: "Mr. Rajesh Malhotra",
    account: "McKinsey & Company India",
    reportAt: "Aerocity Hotel Pullman, New Delhi",
    garageDepartureTime: "06:30 AM",
    garageOpeningKm: "45120",
    reportingTime: "07:15 AM",
    reportingKm: "45138",
    releaseTime: "07:45 PM",
    releaseKm: "45280",
    garagingTime: "08:30 PM",
    garagingKm: "45302",
    totalHours: "14.0",
    totalKms: "182",
    remarks: "Executive Corporate Commute & Airport Transit",
    serviceFeedback: "EXCELLENT",
    parkingTollTax: "420",
    releaseDate: "2026-08-24",
    placeOfRelease: "Aerocity, New Delhi",
    mobile: "+91 98112 34567",
    officeTo: "Corporate Billing Desk",
    bookedBy: "Sunita Verma (SPOC)",
    officeFor: "Executive Partner Transit",
    garageInTime: "08:30 PM",
    garageInKm: "45302",
    officeReleasePlace: "Garage Qutub Vihar",
    parkingAmount: "420",
    handoverPerson: "Mukesh Kumar (Chauffeur)",
    handoverDate: "2026-08-24",
    handoverTime: "08:45 PM",
    officeRemarks: "Toll receipts verified and signed by client",
    usageTracks: [
      { id: "1", from: "Garage (Qutub Vihar)", to: "Pullman Aerocity", details: "Morning Reporting" },
      { id: "2", from: "Pullman Aerocity", to: "Cyber City DLF Phase 2 Gurugram", details: "Client Office Commute" },
      { id: "3", from: "Cyber City Gurugram", to: "Taj Palace Diplomatic Enclave", details: "Board Meeting" },
      { id: "4", from: "Taj Palace", to: "IGI Airport T3 Terminal", details: "Evening Drop" },
      { id: "5", from: "IGI Airport T3", to: "Garage (Qutub Vihar)", details: "Garaging Return" },
    ],
    slipImageUrl: "/images/hero/hero-bg.webp",
    slipImageName: "duty_slip_9842.jpg",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "DS-2026-002",
    tripSheetNo: "TT-DS-9843",
    carNo: "DL 2CA 4519",
    date: "2026-08-25",
    reportedTo: "Dr. Ananya Sen",
    account: "Max Healthcare Ltd",
    reportAt: "Saket Institutional Area, New Delhi",
    garageDepartureTime: "08:00 AM",
    garageOpeningKm: "32100",
    reportingTime: "08:40 AM",
    reportingKm: "32115",
    releaseTime: "05:30 PM",
    releaseKm: "32195",
    garagingTime: "06:15 PM",
    garagingKm: "32210",
    totalHours: "10.25",
    totalKms: "110",
    remarks: "Local Medical Delegation Mobility",
    serviceFeedback: "EXCELLENT",
    parkingTollTax: "180",
    releaseDate: "2026-08-25",
    placeOfRelease: "Max Hospital Saket",
    mobile: "+91 98765 43210",
    officeTo: "Healthcare Mobility Desk",
    bookedBy: "Dr. Sen Office",
    officeFor: "Visiting Faculty Transfer",
    garageInTime: "06:15 PM",
    garageInKm: "32210",
    officeReleasePlace: "Saket Metro",
    parkingAmount: "180",
    handoverPerson: "Ramesh Chand (Chauffeur)",
    handoverDate: "2026-08-25",
    handoverTime: "06:30 PM",
    officeRemarks: "Clean vehicle and satisfactory service confirmed",
    usageTracks: [
      { id: "1", from: "Garage", to: "Saket Max Hospital", details: "Reporting" },
      { id: "2", from: "Max Hospital Saket", to: "AIIMS New Delhi", details: "Conference" },
      { id: "3", from: "AIIMS", to: "Max Hospital Saket", details: "Return" },
    ],
    slipImageUrl: "/images/hero/hero-bg.webp",
    slipImageName: "duty_slip_9843.jpg",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }
];

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search")?.toLowerCase() || "";
    const date = searchParams.get("date") || "";
    const feedback = searchParams.get("feedback") || "";

    let filtered = [...dutySlipsStore];

    if (search) {
      filtered = filtered.filter(
        (ds) =>
          ds.tripSheetNo.toLowerCase().includes(search) ||
          ds.carNo.toLowerCase().includes(search) ||
          ds.reportedTo.toLowerCase().includes(search) ||
          ds.account.toLowerCase().includes(search) ||
          ds.reportAt.toLowerCase().includes(search) ||
          ds.mobile.includes(search) ||
          ds.placeOfRelease.toLowerCase().includes(search)
      );
    }

    if (date) {
      filtered = filtered.filter((ds) => ds.date === date);
    }

    if (feedback && feedback !== "ALL") {
      filtered = filtered.filter((ds) => ds.serviceFeedback.toUpperCase() === feedback.toUpperCase());
    }

    // Sort by createdAt descending
    filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    return NextResponse.json({
      success: true,
      total: filtered.length,
      duties: filtered,
    });
  } catch (error) {
    console.error("GET /api/duties error:", error);
    return NextResponse.json({ error: "Failed to fetch duty slips" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    if (!body.tripSheetNo || !body.carNo) {
      return NextResponse.json({ error: "Trip Sheet No and Car No are required" }, { status: 400 });
    }

    const newRecord: DutySlipRecord = {
      id: `DS-${Date.now()}`,
      tripSheetNo: body.tripSheetNo || `TT-DS-${Math.floor(1000 + Math.random() * 9000)}`,
      carNo: body.carNo || "",
      date: body.date || new Date().toISOString().split("T")[0],
      reportedTo: body.reportedTo || "",
      account: body.account || "",
      reportAt: body.reportAt || "",
      
      // Time & KMs
      garageDepartureTime: body.garageDepartureTime || "",
      garageOpeningKm: body.garageOpeningKm || "0",
      reportingTime: body.reportingTime || "",
      reportingKm: body.reportingKm || "0",
      releaseTime: body.releaseTime || "",
      releaseKm: body.releaseKm || "0",
      garagingTime: body.garagingTime || "",
      garagingKm: body.garagingKm || "0",
      totalHours: body.totalHours || "0",
      totalKms: body.totalKms || "0",
      remarks: body.remarks || "",

      // Feedback & Settlement
      serviceFeedback: body.serviceFeedback || "EXCELLENT",
      parkingTollTax: body.parkingTollTax || "0",
      releaseDate: body.releaseDate || body.date || new Date().toISOString().split("T")[0],
      placeOfRelease: body.placeOfRelease || "",
      mobile: body.mobile || "",

      // Office Use
      officeTo: body.officeTo || "",
      bookedBy: body.bookedBy || "",
      officeFor: body.officeFor || "",
      garageInTime: body.garageInTime || body.garagingTime || "",
      garageInKm: body.garageInKm || body.garagingKm || "",
      officeReleasePlace: body.officeReleasePlace || body.placeOfRelease || "",
      parkingAmount: body.parkingAmount || body.parkingTollTax || "0",
      handoverPerson: body.handoverPerson || "",
      handoverDate: body.handoverDate || body.date || new Date().toISOString().split("T")[0],
      handoverTime: body.handoverTime || "",
      officeRemarks: body.officeRemarks || "",

      usageTracks: Array.isArray(body.usageTracks) ? body.usageTracks : [],

      slipImageUrl: body.slipImageUrl || "",
      slipImageName: body.slipImageName || "duty_slip_scan.jpg",

      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    dutySlipsStore.unshift(newRecord);

    return NextResponse.json({
      success: true,
      message: "Duty slip recorded successfully",
      duty: newRecord,
    }, { status: 201 });
  } catch (error) {
    console.error("POST /api/duties error:", error);
    return NextResponse.json({ error: "Failed to create duty slip" }, { status: 500 });
  }
}
