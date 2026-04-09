import { NextRequest, NextResponse } from "next/server";

const VALID_ROLES = ["parent", "learner", "teacher", "admin"];
const ROLE_REDIRECTS: Record<string, string> = {
  parent: "/parent",
  learner: "/learner",
  teacher: "/teacher",
  admin: "/admin/district",
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
  const response = NextResponse.redirect(new URL(redirect, request.url));
  response.cookies.set("user_role", role, { path: "/", maxAge: 86400 });
  return response;
}
