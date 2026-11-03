import prisma from "@/lib/prisma";

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

// In-Memory cache for runtime additions
export const dutySlipsStore: DutySlipRecord[] = [];

// Helper: fetch deleted duty slip IDs from database
export async function getDeletedDutySlipIds(): Promise<string[]> {
  try {
    const setting = await prisma.siteSetting.findUnique({
      where: { key: "deleted_duty_slip_ids" }
    });
    if (setting && Array.isArray(setting.value)) {
      return setting.value as unknown as string[];
    }
  } catch (e) {
    console.warn("Could not load deleted_duty_slip_ids:", e);
  }
  return ["DS-2026-001", "DS-2026-002"];
}

// Helper: add an ID to deleted list
export async function addDeletedDutySlipId(id: string): Promise<string[]> {
  const currentDeleted = await getDeletedDutySlipIds();
  const updatedDeleted = Array.from(new Set([...currentDeleted, id]));

  try {
    await prisma.siteSetting.upsert({
      where: { key: "deleted_duty_slip_ids" },
      update: { value: updatedDeleted as any },
      create: {
        key: "deleted_duty_slip_ids",
        value: updatedDeleted as any,
        description: "List of permanently deleted duty slip IDs"
      }
    });
  } catch (e) {
    console.warn("Could not save deleted_duty_slip_ids:", e);
  }

  return updatedDeleted;
}

// Helper: fetch custom manual / scanned duty slips from database
export async function getCustomDutySlips(): Promise<DutySlipRecord[]> {
  try {
    const setting = await prisma.siteSetting.findUnique({
      where: { key: "duty_slips_registry" }
    });
    if (setting && Array.isArray(setting.value)) {
      return setting.value as unknown as DutySlipRecord[];
    }
  } catch (e) {
    console.warn("Could not load duty_slips_registry:", e);
  }
  return [];
}

// Helper: save custom duty slips list
export async function saveCustomDutySlips(list: DutySlipRecord[]): Promise<void> {
  try {
    await prisma.siteSetting.upsert({
      where: { key: "duty_slips_registry" },
      update: { value: list as any },
      create: {
        key: "duty_slips_registry",
        value: list as any,
        description: "Persistent registry of manual and scanned duty slips"
      }
    });
  } catch (e) {
    console.warn("Could not persist duty_slips_registry:", e);
  }
}

