import { NextResponse } from "next/server";
import { jwtVerify } from "jose";
import type { NextRequest } from "next/server";

const adminAllowedPaths = [
  "/admin/manager",
  "/admin/consultations",
  "/admin/courses",
  "/admin/articles",
  "/admin/projects",
  "/admin/users",
  "/admin/team",
  "/admin/reports",
];

function matchesPath(pathname: string, paths: string[]) {
  return paths.some((path) => pathname === path || pathname.startsWith(`${path}/`));
}

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  if (pathname.startsWith("/uploads/videos/")) {
    const filename = pathname.slice("/uploads/videos/".length);
    const destination = request.nextUrl.clone();
    destination.pathname = `/api/course-videos/${filename}`;
    return NextResponse.rewrite(destination);
  }

  const isAdminPage = pathname.startsWith("/admin");
  const isAdminApi = pathname.startsWith("/api/admin");
  if (!isAdminPage && !isAdminApi) return NextResponse.next();

  const token = request.cookies.get("token")?.value;
  const secret = process.env.JWT_SECRET;
  if (!token || !secret) return NextResponse.redirect(new URL("/auth", request.url));

  try {
    const { payload } = await jwtVerify(token, new TextEncoder().encode(secret));
    const role = payload.role;
    if (role !== "admin" && role !== "super_admin") {
      return NextResponse.redirect(new URL("/auth", request.url));
    }
    if (isAdminPage && role === "admin" && pathname === "/admin") {
      return NextResponse.redirect(new URL("/admin/manager", request.url));
    }
    if (isAdminPage && pathname === "/admin/manager") {
      if (role === "super_admin") return NextResponse.redirect(new URL("/admin", request.url));
      const destination = request.nextUrl.clone();
      destination.pathname = "/admin";
      return NextResponse.rewrite(destination);
    }
    const allowedApiPaths = ["/api/admin/orders", "/api/admin/consultations", "/api/admin/consultation-comments", "/api/admin/projects", "/api/admin/articles", "/api/admin/upload", "/api/admin/launches", "/api/admin/users", "/api/admin/team", "/api/admin/dashboard"];
    const isAllowed = isAdminPage
      ? matchesPath(pathname, adminAllowedPaths)
      : matchesPath(pathname, allowedApiPaths);
    if (role === "admin" && !isAllowed) {
      return NextResponse.redirect(new URL("/admin/manager", request.url));
    }
    return NextResponse.next();
  } catch {
    return NextResponse.redirect(new URL("/auth", request.url));
  }
}

export const config = {
  matcher: ["/admin/:path*", "/api/admin/:path*", "/uploads/videos/:path*"],
};
