import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { verifyAdmin } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const isAdmin = await verifyAdmin(req);
    if (!isAdmin) {
      return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
    }

    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // Validate mime type
    const validMimeTypes = ["image/jpeg", "image/png", "image/webp", "image/svg+xml", "image/jpg", "image/gif"];
    if (!validMimeTypes.includes(file.type)) {
      return NextResponse.json({ error: "Invalid file type. Only JPEG, PNG, WEBP, GIF, and SVG images are allowed." }, { status: 400 });
    }

    // Maximum 10MB file size
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json({ error: "File size exceeds 10MB limit" }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Create uploads directory if it doesn't exist
    const uploadsDir = path.join(process.cwd(), "public", "uploads");
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }

    // Create unique filename
    const sanitizedOriginal = file.name.replace(/[^a-zA-Z0-9.-]/g, "_");
    const filename = `img_${Date.now()}_${sanitizedOriginal}`;
    const filePath = path.join(uploadsDir, filename);

    fs.writeFileSync(filePath, buffer);

    const publicUrl = `/uploads/${filename}`;

    return NextResponse.json({ url: publicUrl, filename }, { status: 201 });
  } catch (error: any) {
    console.error("POST /api/admin/upload error:", error);
    return NextResponse.json({ error: "Failed to upload image file" }, { status: 500 });
  }
}
