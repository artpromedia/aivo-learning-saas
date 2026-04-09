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
  const cookieLocale = request.cookies.get("NEXT_LOCALE")?.value;
  if (cookieLocale && SUPPORTED_LOCALES.includes(cookieLocale)) {
    return cookieLocale;
  }

  const acceptLanguage = request.headers.get("accept-language") ?? "";
  const preferred = acceptLanguage
    .split(",")
    .map((part) => part.split(";")[0].trim().split("-")[0])
    .find((lang) => SUPPORTED_LOCALES.includes(lang));

  if (preferred) {
    return preferred;
  }

  return DEFAULT_LOCALE;
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const response = NextResponse.next();

  const locale = detectLocale(request);
  response.headers.set("x-locale", locale);

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

  const VALID_PREVIEW_ROLES = ["parent", "learner", "teacher", "admin"];
  const isPreview = request.nextUrl.searchParams.has("preview") && process.env.NODE_ENV !== "production";
  const rawPreviewRole = isPreview ? (request.nextUrl.searchParams.get("role") || "parent") : null;
  const previewRole = rawPreviewRole && VALID_PREVIEW_ROLES.includes(rawPreviewRole) ? rawPreviewRole : null;

  const roleCookie = request.cookies.get("user_role")?.value;
  const effectiveRole = roleCookie || previewRole;

  if (!effectiveRole) {
    const isDashboard =
      pathname.startsWith("/parent") ||
      pathname.startsWith("/learner") ||
      pathname.startsWith("/teacher") ||
      pathname.startsWith("/admin") ||
      pathname.startsWith("/notifications") ||
      pathname.startsWith("/manage") ||
      pathname.startsWith("/checkout") ||
      pathname.startsWith("/success");
    if (isDashboard) {
      const url = request.nextUrl.clone();
      url.pathname = "/login";
      return NextResponse.redirect(url);
    }
    return response;
  }

  const isDashboardRoute =
    pathname.startsWith("/parent") ||
    pathname.startsWith("/learner") ||
    pathname.startsWith("/teacher") ||
    pathname.startsWith("/admin") ||
    pathname.startsWith("/notifications") ||
    pathname.startsWith("/manage") ||
    pathname.startsWith("/checkout") ||
    pathname.startsWith("/success");

  if (!isDashboardRoute) {
    return response;
  }

  const allowedPrefixes = ROLE_ALLOWED_PREFIXES[effectiveRole] ?? [];
  const hasAccess = allowedPrefixes.some((prefix) => pathname.startsWith(prefix));

  if (!hasAccess) {
    const defaultPath = ROLE_REDIRECTS[effectiveRole] ?? "/parent";
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
