import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const profiles = await prisma.permissionProfile.findMany({
      orderBy: { name: "asc" }
    });
    return NextResponse.json({ success: true, profiles });
  } catch (error) {
    console.error("GET /api/admin/permission-profiles error:", error);
    return NextResponse.json({ error: "Failed to fetch permission profiles" }, { status: 500 });
  }
}
