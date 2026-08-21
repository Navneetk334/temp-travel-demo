import { NextRequest, NextResponse } from "next/server";
import { MASTER_ADMIN_COOKIE_NAME } from "@/lib/auth";

export async function POST(req: NextRequest) {
  const response = NextResponse.json({ success: true, message: "Logged out from Master Admin Panel" });
  
  // Clear ONLY Master Admin Cookie, keeping Website Admin session intact
  response.cookies.set({
    name: MASTER_ADMIN_COOKIE_NAME,
    value: "",
    httpOnly: true,
    path: "/",
    maxAge: 0,
    sameSite: "lax",
  });

  return response;
}
