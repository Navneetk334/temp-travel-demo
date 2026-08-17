import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { verifyAdmin, ADMIN_COOKIE_NAME } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    // 1. Verify admin session or admin cookie
    const hasAdminCookie = req.cookies.has(ADMIN_COOKIE_NAME) || 
                          req.cookies.has("next-auth.session-token") ||
                          req.cookies.has("__Secure-next-auth.session-token");
    const isVerifiedAdmin = await verifyAdmin(req);

    if (!hasAdminCookie && !isVerifiedAdmin) {
      return NextResponse.json({ error: "Unauthorized: Please log into the Admin Panel to upload files." }, { status: 401 });
    }

    // 2. Parse FormData
    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No file provided in request." }, { status: 400 });
    }

    // 3. File type check (MIME or Extension)
    const fileExt = path.extname(file.name).toLowerCase();
    const validExts = [".jpg", ".jpeg", ".png", ".webp", ".gif", ".svg", ".bmp", ".avif", ".heic"];
    const isImageMime = file.type ? file.type.startsWith("image/") : false;
    const isValidExt = validExts.includes(fileExt);

    if (!isImageMime && !isValidExt) {
      return NextResponse.json({ 
        error: `Invalid file format (${file.type || fileExt}). Only JPEG, PNG, WEBP, GIF, and SVG images are allowed.` 
      }, { status: 400 });
    }

    // 4. Maximum 15MB file size limit
    if (file.size > 15 * 1024 * 1024) {
      return NextResponse.json({ error: "File size exceeds 15MB limit." }, { status: 400 });
    }

    // 5. Read file bytes
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // 6. Ensure public/uploads directory exists
    const uploadsDir = path.join(process.cwd(), "public", "uploads");
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }

    // 7. Generate safe unique filename
    const ext = fileExt || ".png";
    const baseName = path.basename(file.name, fileExt).replace(/[^a-zA-Z0-9_-]/g, "_");
    const filename = `vehicle_${Date.now()}_${baseName}${ext}`;
    const filePath = path.join(uploadsDir, filename);

    // 8. Write to disk
    fs.writeFileSync(filePath, buffer);

    const publicUrl = `/uploads/${filename}`;

    return NextResponse.json({ url: publicUrl, filename, size: file.size }, { status: 201 });
  } catch (error: any) {
    console.error("POST /api/admin/upload server error:", error);
    return NextResponse.json({ 
      error: error?.message || "Server encountered an error while writing image to storage." 
    }, { status: 500 });
  }
}
