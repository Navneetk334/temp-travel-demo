import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const ADMIN_COOKIE_NAME = "temp-travel-admin-session";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Protect Admin Portal Routes
  if (pathname.startsWith("/admin") && pathname !== "/admin/login") {
    const token = request.cookies.get(ADMIN_COOKIE_NAME)?.value ||
                  request.cookies.get("next-auth.session-token")?.value ||
                  request.cookies.get("__Secure-next-auth.session-token")?.value;

    if (!token || token === "mock-admin-token") {
      const loginUrl = new URL("/admin/login", request.url);
      loginUrl.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};
