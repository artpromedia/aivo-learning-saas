import { NextRequest, NextResponse } from "next/server";

const ROLE_REDIRECTS: Record<string, string> = {
  PARENT: "/parent",
  parent: "/parent",
  TEACHER: "/teacher",
  teacher: "/teacher",
  educator: "/teacher",
  DISTRICT_ADMIN: "/admin/district",
  admin: "/admin/district",
  PLATFORM_ADMIN: "/admin/district",
  LEARNER: "/learner",
  learner: "/learner",
  CAREGIVER: "/parent",
  caregiver: "/parent",
};

const ROLE_ALLOWED_PREFIXES: Record<string, string[]> = {
  PARENT: ["/parent", "/learner", "/notifications", "/manage", "/checkout", "/success"],
  parent: ["/parent", "/learner", "/notifications", "/manage", "/checkout", "/success"],
  TEACHER: ["/teacher"],
  teacher: ["/teacher"],
  educator: ["/teacher"],
  DISTRICT_ADMIN: ["/admin"],
  admin: ["/admin"],
  PLATFORM_ADMIN: ["/admin", "/teacher", "/parent", "/learner"],
  LEARNER: ["/learner"],
  learner: ["/learner"],
  CAREGIVER: ["/parent", "/learner", "/notifications"],
  caregiver: ["/parent", "/learner", "/notifications"],
};

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip auth/onboarding/billing/marketing and static assets
  if (
    pathname.startsWith("/login") ||
    pathname.startsWith("/register") ||
    pathname.startsWith("/forgot-password") ||
    pathname.startsWith("/reset-password") ||
    pathname.startsWith("/verify-email") ||
    pathname.startsWith("/accept-invite") ||
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname === "/" ||
    pathname === "/favicon.ico"
  ) {
    return NextResponse.next();
  }

  // Check for role cookie/header
  const roleCookie = request.cookies.get("user_role")?.value;
  if (!roleCookie) {
    return NextResponse.next();
  }

  const role = roleCookie;

  // Check if user is accessing a dashboard route
  const isDashboardRoute =
    pathname.startsWith("/parent") ||
    pathname.startsWith("/learner") ||
    pathname.startsWith("/teacher") ||
    pathname.startsWith("/admin") ||
    pathname.startsWith("/notifications");

  if (!isDashboardRoute) {
    return NextResponse.next();
  }

  // Check if role has access to this path
  const allowedPrefixes = ROLE_ALLOWED_PREFIXES[role] ?? [];
  const hasAccess = allowedPrefixes.some((prefix) => pathname.startsWith(prefix));

  if (!hasAccess) {
    // Redirect to role's default page
    const defaultPath = ROLE_REDIRECTS[role] ?? "/parent";
    const url = request.nextUrl.clone();
    url.pathname = defaultPath;
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.).*)",
  ],
};
