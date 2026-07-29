import { NextRequest } from "next/server";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import prisma from "@/lib/prisma";

const JWT_SECRET = process.env.NEXTAUTH_SECRET || process.env.JWT_SECRET || "temp-travel-secret-key-2026-secure-admin";
export const ADMIN_COOKIE_NAME = "temp-travel-admin-session";

export interface AdminPayload {
  id: string;
  name: string;
  email: string;
  role: string;
  iat?: number;
  exp?: number;
}

/**
 * Verify a plain text password against a bcrypt hash.
 */
export async function verifyPassword(plain: string, hashed: string): Promise<boolean> {
  try {
    return await bcrypt.compare(plain, hashed);
  } catch (error) {
    console.error("verifyPassword error:", error);
    return false;
  }
}

/**
 * Hash a plain text password using bcrypt.
 */
export async function hashPassword(plain: string): Promise<string> {
  return await bcrypt.hash(plain, 12);
}

/**
 * Sign an admin payload into a secure HMAC-SHA256 session token.
 */
export function createAdminToken(payload: Omit<AdminPayload, "iat" | "exp">): string {
  const iat = Math.floor(Date.now() / 1000);
  const exp = iat + 86400 * 7; // 7 days expiration
  const fullPayload: AdminPayload = { ...payload, iat, exp };

  const base64Header = Buffer.from(JSON.stringify({ alg: "HS256", typ: "JWT" })).toString("base64url");
  const base64Payload = Buffer.from(JSON.stringify(fullPayload)).toString("base64url");
  
  const signature = crypto
    .createHmac("sha256", JWT_SECRET)
    .update(`${base64Header}.${base64Payload}`)
    .digest("base64url");

  return `${base64Header}.${base64Payload}.${signature}`;
}

/**
 * Verify and decode an HMAC-SHA256 session token.
 */
export function verifyAdminToken(token: string): AdminPayload | null {
  try {
    if (!token) return null;
    const parts = token.split(".");
    if (parts.length !== 3) return null;

    const [header, payload, signature] = parts;
    const expectedSignature = crypto
      .createHmac("sha256", JWT_SECRET)
      .update(`${header}.${payload}`)
      .digest("base64url");

    if (!crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSignature))) {
      return null;
    }

    const decoded = JSON.parse(Buffer.from(payload, "base64url").toString("utf-8")) as AdminPayload;
    
    // Check expiry
    const now = Math.floor(Date.now() / 1000);
    if (decoded.exp && decoded.exp < now) {
      return null;
    }

    return decoded;
  } catch (err) {
    return null;
  }
}

/**
 * Extract session token from cookies or Authorization header.
 */
export function getTokenFromRequest(req: NextRequest): string | null {
  // 1. Check HTTP cookie
  const cookieToken = req.cookies.get(ADMIN_COOKIE_NAME)?.value ||
                     req.cookies.get("next-auth.session-token")?.value ||
                     req.cookies.get("__Secure-next-auth.session-token")?.value;
  if (cookieToken && cookieToken !== "mock-admin-token") {
    return cookieToken;
  }

  // 2. Check Authorization Bearer header
  const authHeader = req.headers.get("authorization");
  if (authHeader && authHeader.startsWith("Bearer ")) {
    return authHeader.substring(7);
  }

  return null;
}

/**
 * Centralized verifyAdmin helper for API Routes.
 * Returns true if valid admin session, false otherwise.
 */
export async function verifyAdmin(req: NextRequest): Promise<boolean> {
  const token = getTokenFromRequest(req);
  if (!token) return false;

  const admin = verifyAdminToken(token);
  if (!admin) return false;

  // Verify role is one of valid admin roles
  const validRoles = ["SUPER_ADMIN", "MANAGER", "DISPATCHER"];
  return validRoles.includes(admin.role);
}

/**
 * Get full decoded admin user details from Request.
 */
export async function getAdminFromRequest(req: NextRequest): Promise<AdminPayload | null> {
  const token = getTokenFromRequest(req);
  if (!token) return null;
  return verifyAdminToken(token);
}
