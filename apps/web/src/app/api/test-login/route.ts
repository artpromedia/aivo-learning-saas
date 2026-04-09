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

const TEST_ACCOUNTS: Record<string, { email: string; password: string }> = {
  parent: { email: "parent@test.aivo.com", password: "password123" },
  teacher: { email: "rivera@school.edu", password: "password123" },
  caregiver: { email: "jamie@email.com", password: "password123" },
};

const BACKEND_URL = process.env.BACKEND_URL ?? "http://localhost:3001";

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

  const account = TEST_ACCOUNTS[role];
  if (account) {
    try {
      const loginRes = await fetch(`${BACKEND_URL}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(account),
      });

      if (loginRes.ok) {
        const data = await loginRes.json();
        if (data.accessToken) {
          response.cookies.set("access_token", data.accessToken, {
            httpOnly: true,
            secure: false,
            sameSite: "lax",
            path: "/",
            maxAge: 15 * 60,
          });
        }
        if (data.refreshToken) {
          response.cookies.set("refresh_token", data.refreshToken, {
            httpOnly: true,
            secure: false,
            sameSite: "lax",
            path: "/api/auth/refresh",
            maxAge: 7 * 24 * 60 * 60,
          });
        }
      }
    } catch {
      // Fall through — cookie-only mode still works for UI preview
    }
  }

  return response;
}
