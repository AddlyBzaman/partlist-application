import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Apply no-cache headers for laporan pages and part-list API list
  if (
    pathname.startsWith("/dashboard/laporan") ||
    pathname === "/api/part-list-produk/list" ||
    (pathname.startsWith("/api/part-list-produk") &&
      pathname.includes("/delete"))
  ) {
    return NextResponse.next({
      headers: {
        "Cache-Control": "no-store, no-cache, must-revalidate, max-age=0",
        Pragma: "no-cache",
        Expires: "0",
        "Surrogate-Control": "no-store",
      },
    });
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/laporan/:path*", "/api/part-list-produk/:path*"],
};
