import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { verifyAdmin } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const category = searchParams.get("category") || "";
    const subcategory = searchParams.get("subcategory") || "";
    const brand = searchParams.get("brand") || "";
    const search = searchParams.get("search") || "";
    const activeOnly = searchParams.get("activeOnly") !== "false"; // default true

    const where: any = {};
    if (activeOnly) where.isActive = true;
    if (category) {
      where.category = { equals: category, mode: "insensitive" };
    }
    if (subcategory) {
      where.subcategory = { equals: subcategory, mode: "insensitive" };
    }
    if (brand) {
      where.brand = { equals: brand, mode: "insensitive" };
    }

    if (search) {
      where.OR = [
        { brand: { contains: search, mode: "insensitive" } },
        { modelName: { contains: search, mode: "insensitive" } },
        { category: { contains: search, mode: "insensitive" } },
        { subcategory: { contains: search, mode: "insensitive" } },
      ];
    }

    const models = await prisma.vehicleModel.findMany({
      where,
      orderBy: [
        { brand: "asc" },
        { modelName: "asc" },
      ],
    });

    // Extract unique brands matching current category/subcategory filters
    const brandWhere: any = {};
    if (activeOnly) brandWhere.isActive = true;
    if (category) brandWhere.category = { equals: category, mode: "insensitive" };
    if (subcategory) brandWhere.subcategory = { equals: subcategory, mode: "insensitive" };

    const matchingModelsForBrands = await prisma.vehicleModel.findMany({
      where: brandWhere,
      select: { brand: true, subcategory: true, category: true },
    });

    const uniqueBrands = Array.from(new Set(matchingModelsForBrands.map(m => m.brand))).sort();
    const uniqueSubcategories = Array.from(new Set(matchingModelsForBrands.map(m => m.subcategory))).sort();

    return NextResponse.json({
      models,
      brands: uniqueBrands,
      subcategories: uniqueSubcategories,
    }, { status: 200 });

  } catch (error) {
    console.error("GET /api/fleet/models error:", error);
    return NextResponse.json({ error: "Failed to fetch vehicle models" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const isAdmin = await verifyAdmin(req);
    if (!isAdmin) {
      return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
    }

    const body = await req.json();
    const {
      brand,
      modelName,
      category,
      subcategory,
      minSeats,
      maxSeats,
      supportedFuelTypes,
      supportedTransmissionTypes,
      isElectric,
      isActive
    } = body;

    if (!brand || !modelName || !category || !subcategory) {
      return NextResponse.json({ error: "Brand, model name, category, and subcategory are required" }, { status: 400 });
    }

    const brandTrim = brand.trim();
    const modelNameTrim = modelName.trim();

    const existing = await prisma.vehicleModel.findUnique({
      where: {
        brand_modelName: {
          brand: brandTrim,
          modelName: modelNameTrim,
        }
      }
    });

    if (existing) {
      return NextResponse.json({ error: `Vehicle model '${brandTrim} ${modelNameTrim}' already exists in database master.` }, { status: 400 });
    }

    const model = await prisma.vehicleModel.create({
      data: {
        brand: brandTrim,
        modelName: modelNameTrim,
        category: category.trim(),
        subcategory: subcategory.trim(),
        minSeats: Number(minSeats) || 4,
        maxSeats: Number(maxSeats) || 7,
        supportedFuelTypes: Array.isArray(supportedFuelTypes) && supportedFuelTypes.length > 0 ? supportedFuelTypes : ["DIESEL"],
        supportedTransmissionTypes: Array.isArray(supportedTransmissionTypes) && supportedTransmissionTypes.length > 0 ? supportedTransmissionTypes : ["MANUAL"],
        isElectric: Boolean(isElectric),
        isActive: isActive !== undefined ? Boolean(isActive) : true,
      }
    });

    return NextResponse.json(model, { status: 201 });

  } catch (error) {
    console.error("POST /api/fleet/models error:", error);
    return NextResponse.json({ error: "Failed to create vehicle model master" }, { status: 500 });
  }
}
