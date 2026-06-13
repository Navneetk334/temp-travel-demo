import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export async function GET(
  request: NextRequest,
  props: { params: Promise<{ path: string[] }> }
) {
  const params = await props.params;
  const pathParts = params.path;
  const fullPathStr = pathParts.join("/");

  // Determine if it's a fleet-related image, category, or has fleet terms
  const isFleet = 
    fullPathStr.includes("fleet") || 
    fullPathStr.includes("category") || 
    fullPathStr.includes("hatchback") || 
    fullPathStr.includes("sedan") || 
    fullPathStr.includes("suv") || 
    fullPathStr.includes("luxury") || 
    fullPathStr.includes("tempo") ||
    fullPathStr.includes("vehicle") ||
    fullPathStr.includes("car");

  const fileName = isFleet ? "fleet-suv.png" : "hero-cover.png";
  const imageFilePath = path.join(process.cwd(), "public", "images", fileName);

  try {
    const fileBuffer = fs.readFileSync(imageFilePath);
    return new NextResponse(fileBuffer, {
      headers: {
        "Content-Type": "image/png",
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch (error) {
    return new NextResponse("Not Found", { status: 404 });
  }
}
