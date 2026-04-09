import { NextRequest, NextResponse } from "next/server";

const VALID_ROLES = ["parent", "learner", "teacher", "admin", "caregiver", "platform_admin"];
const ROLE_REDIRECTS: Record<string, string> = {
  parent: "/parent",
  learner: "/learner",
  teacher: "/teacher",
  admin: "/admin/district",
  caregiver: "/caregiver",
  platform_admin: "/admin/platform",
};

export async function GET(request: NextRequest) {
  if (process.env.NODE_ENV === "production") {
    return NextResponse.json({ error: "Not available in production" }, { status: 403 });
  }

  const role = request.nextUrl.searchParams.get("role") || "parent";
  if (!VALID_ROLES.includes(role)) {
    return NextResponse.json({ error: "Invalid role" }, { status: 400 });
  }

  const redirect = ROLE_REDIRECTS[role] || "/parent";

  const host = request.headers.get("host") || request.headers.get("x-forwarded-host") || "localhost:5000";
  const protocol = request.headers.get("x-forwarded-proto") || "https";
  const redirectUrl = new URL(redirect, `${protocol}://${host}`);

  const response = NextResponse.redirect(redirectUrl);
  response.cookies.set("user_role", role, { path: "/", maxAge: 86400 });
  return response;
}
