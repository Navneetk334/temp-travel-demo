import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const departments = await prisma.department.findMany({
      orderBy: { name: "asc" }
    });
    return NextResponse.json({ success: true, departments });
  } catch (error) {
    console.error("GET /api/admin/departments error:", error);
    return NextResponse.json({ error: "Failed to fetch departments" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { name } = await req.json();
    if (!name) return NextResponse.json({ error: "Name is required" }, { status: 400 });

    const dept = await prisma.department.create({ data: { name } });
    return NextResponse.json({ success: true, department: dept });
  } catch (error) {
    console.error("POST /api/admin/departments error:", error);
    return NextResponse.json({ error: "Failed to create department" }, { status: 500 });
  }
}
