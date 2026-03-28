import { NextRequest, NextResponse } from "next/server";

const SUPPORTED_LOCALES = ["en", "es", "fr", "ar", "zh", "pt", "de", "ja", "ko", "hi", "sw", "ig", "yo", "ha"];
const DEFAULT_LOCALE = "en";

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

function detectLocale(request: NextRequest): string {
  // 1. Explicit cookie preference
  const cookieLocale = request.cookies.get("NEXT_LOCALE")?.value;
  if (cookieLocale && SUPPORTED_LOCALES.includes(cookieLocale)) {
    return cookieLocale;
  }

  // 2. Accept-Language header
  const acceptLanguage = request.headers.get("accept-language") ?? "";
  const preferred = acceptLanguage
    .split(",")
    .map((part) => part.split(";")[0].trim().split("-")[0])
    .find((lang) => SUPPORTED_LOCALES.includes(lang));

  if (preferred) {
    return preferred;
  }

  // 3. Default
  return DEFAULT_LOCALE;
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const response = NextResponse.next();

  // Detect and set locale
  const locale = detectLocale(request);
  response.headers.set("x-locale", locale);

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
    return response;
  }

  // Check for role cookie/header
  const roleCookie = request.cookies.get("user_role")?.value;
  if (!roleCookie) {
    return response;
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
    return response;
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

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.).*)",
  ],
};
