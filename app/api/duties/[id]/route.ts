import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { 
  DutySlipRecord, 
  dutySlipsStore, 
  getCustomDutySlips, 
  saveCustomDutySlips,
  addDeletedDutySlipId 
} from "@/lib/duties";

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;

    // Check custom slips
    const customSlips = await getCustomDutySlips();
    const foundCustom = customSlips.find(d => d.id === id || d.tripSheetNo === id);
    if (foundCustom) {
      return NextResponse.json({ success: true, duty: foundCustom });
    }

    // Check runtime store
    const foundStore = dutySlipsStore.find(d => d.id === id || d.tripSheetNo === id);
    if (foundStore) {
      return NextResponse.json({ success: true, duty: foundStore });
    }

    // Check bookings
    const booking = await prisma.booking.findFirst({
      where: {
        OR: [{ id }, { bookingNumber: id }]
      },
      include: {
        customer: true,
        vehicle: {
          include: { driver: true }
        }
      }
    });

    if (booking) {
      return NextResponse.json({
        success: true,
        duty: {
          id: booking.id,
          tripSheetNo: booking.bookingNumber,
          carNo: booking.vehicle?.registrationNumber || "Pending Car",
          reportedTo: booking.customer?.name || "Customer Lead",
          date: booking.pickupDateTime.toISOString().split("T")[0],
          account: booking.type,
          reportAt: booking.pickupLocation,
          placeOfRelease: booking.dropLocation || "Drop Hub",
          mobile: booking.customer?.phone || "",
        }
      });
    }

    return NextResponse.json({ error: "Duty slip not found" }, { status: 404 });
  } catch (error) {
    console.error("GET /api/duties/[id] error:", error);
    return NextResponse.json({ error: "Failed to fetch duty slip" }, { status: 500 });
  }
}

export async function PUT(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const body = await req.json();

    // 1. Update in SiteSetting registry
    const currentList = await getCustomDutySlips();
    const existingIdx = currentList.findIndex(d => d.id === id || d.tripSheetNo === id);
    let updatedRecord: DutySlipRecord;
    if (existingIdx >= 0) {
      updatedRecord = {
        ...currentList[existingIdx],
        ...body,
        updatedAt: new Date().toISOString()
      };
      currentList[existingIdx] = updatedRecord;
    } else {
      updatedRecord = {
        id,
        ...body,
        updatedAt: new Date().toISOString()
      };
      currentList.unshift(updatedRecord);
    }

    await saveCustomDutySlips(currentList);

    return NextResponse.json({
      success: true,
      message: "Duty slip updated successfully",
      duty: updatedRecord,
    });
  } catch (error) {
    console.error("PUT /api/duties/[id] error:", error);
    return NextResponse.json({ error: "Failed to update duty slip" }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;

    // 1. Add to permanent deleted list in SiteSetting
    await addDeletedDutySlipId(id);

    // 2. Remove from custom registry in SiteSetting if present
    const customSlips = await getCustomDutySlips();
    const filteredSlips = customSlips.filter(d => d.id !== id && d.tripSheetNo !== id);
    await saveCustomDutySlips(filteredSlips);

    // 3. Remove from runtime store if present
    const storeIdx = dutySlipsStore.findIndex(d => d.id === id || d.tripSheetNo === id);
    if (storeIdx >= 0) {
      dutySlipsStore.splice(storeIdx, 1);
    }

    return NextResponse.json({
      success: true,
      message: `Duty slip ${id} deleted successfully`,
    });
  } catch (error) {
    console.error("DELETE /api/duties/[id] error:", error);
    return NextResponse.json({ error: "Failed to delete duty slip" }, { status: 500 });
  }
}
