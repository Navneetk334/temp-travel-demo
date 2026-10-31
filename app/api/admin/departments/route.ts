import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

const DEFAULT_DEPARTMENTS = [
  "Operations & Fleet Management",
  "Accounts & Billing",
  "Customer Relations & Dispatch",
  "Human Resources & Administration",
  "Executive Management"
];

export async function GET(req: NextRequest) {
  try {
    let departments = await prisma.department.findMany({
      orderBy: { name: "asc" }
    });

    if (!departments || departments.length === 0) {
      for (const name of DEFAULT_DEPARTMENTS) {
        await prisma.department.upsert({
          where: { name },
          update: {},
          create: { name }
        }).catch(() => {});
      }
      departments = await prisma.department.findMany({
        orderBy: { name: "asc" }
      });
    }

    if (!departments || departments.length === 0) {
      departments = DEFAULT_DEPARTMENTS.map((name, idx) => ({
        id: `dept_${idx + 1}`,
        name,
        createdAt: new Date(),
        updatedAt: new Date()
      })) as any;
    }

    return NextResponse.json({ success: true, departments });
  } catch (error) {
    console.error("GET /api/admin/departments error:", error);
    // Even if DB fails, return fallback departments so the client UI never crashes
    const fallbackDepartments = DEFAULT_DEPARTMENTS.map((name, idx) => ({
      id: `dept_${idx + 1}`,
      name,
      createdAt: new Date(),
      updatedAt: new Date()
    }));
    return NextResponse.json({ success: true, departments: fallbackDepartments });
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
