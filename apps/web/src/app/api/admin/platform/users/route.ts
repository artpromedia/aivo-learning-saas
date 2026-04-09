import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    users: [
      { id: "u1", name: "Elena Rodriguez", email: "elena@aivo.com", role: "platform_admin", platformRole: "super_admin", status: "active", lastLoginAt: "2026-04-09T14:00:00Z", createdAt: "2024-06-01" },
      { id: "u2", name: "Marcus Chen", email: "marcus@aivo.com", role: "platform_admin", platformRole: "ops_manager", status: "active", lastLoginAt: "2026-04-09T10:30:00Z", createdAt: "2024-08-15" },
      { id: "u3", name: "Priya Sharma", email: "priya@aivo.com", role: "platform_admin", platformRole: "content_manager", status: "active", lastLoginAt: "2026-04-08T16:00:00Z", createdAt: "2025-01-10" },
      { id: "u4", name: "Jordan Blake", email: "jordan@aivo.com", role: "platform_admin", platformRole: "support_agent", status: "active", lastLoginAt: "2026-04-09T12:45:00Z", createdAt: "2025-03-20" },
      { id: "u5", name: "Taylor Kim", email: "taylor@aivo.com", role: "platform_admin", platformRole: "billing_manager", status: "active", lastLoginAt: "2026-04-07T09:00:00Z", createdAt: "2025-06-01" },
      { id: "u6", name: "Dr. Maria Gonzalez", email: "mgonzalez@sunshinevalley.edu", role: "admin", status: "active", district: "Sunshine Valley USD", lastLoginAt: "2026-04-09T08:30:00Z", createdAt: "2025-01-15" },
      { id: "u7", name: "James Wilson", email: "jwilson@lakewood.edu", role: "admin", status: "active", district: "Lakewood School District", lastLoginAt: "2026-04-08T14:00:00Z", createdAt: "2025-03-20" },
      { id: "u8", name: "Ms. Rivera", email: "rivera@sunshinevalley.edu", role: "teacher", status: "active", district: "Sunshine Valley USD", lastLoginAt: "2026-04-09T07:00:00Z", createdAt: "2025-02-01" },
      { id: "u9", name: "Sarah Johnson", email: "sarah@example.com", role: "parent", status: "active", lastLoginAt: "2026-04-09T13:00:00Z", createdAt: "2025-09-01" },
      { id: "u10", name: "Alex Johnson", email: "alex@example.com", role: "learner", status: "active", district: "Sunshine Valley USD", lastLoginAt: "2026-04-09T15:00:00Z", createdAt: "2025-09-01" },
      { id: "u11", name: "Suspended User", email: "suspended@example.com", role: "parent", status: "suspended", lastLoginAt: "2026-02-15T10:00:00Z", createdAt: "2025-11-01" },
      { id: "u12", name: "Pending Teacher", email: "pending@school.edu", role: "teacher", status: "pending", district: "Cedar Hills Elementary", lastLoginAt: "", createdAt: "2026-04-01" },
    ],
  });
}
