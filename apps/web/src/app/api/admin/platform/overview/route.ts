import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    totalDistricts: 47,
    totalUsers: 12840,
    totalLearners: 9256,
    activeSubscriptions: 42,
    monthlyRevenue: 18750000,
    systemHealth: "healthy",
    uptime: 99.97,
    apiLatency: 42,
    recentActivity: [
      { id: "a1", action: "New district onboarded", user: "ops@aivo.com", timestamp: "2026-04-09T14:30:00Z", type: "success" },
      { id: "a2", action: "Subscription upgraded to Enterprise", user: "billing@aivo.com", timestamp: "2026-04-09T13:15:00Z", type: "info" },
      { id: "a3", action: "Content module published: Fractions Mastery", user: "content@aivo.com", timestamp: "2026-04-09T11:45:00Z", type: "info" },
      { id: "a4", action: "API rate limit exceeded for District #23", user: "system", timestamp: "2026-04-09T10:20:00Z", type: "warning" },
      { id: "a5", action: "User suspension: policy violation", user: "support@aivo.com", timestamp: "2026-04-09T09:00:00Z", type: "warning" },
      { id: "a6", action: "Monthly billing cycle completed", user: "system", timestamp: "2026-04-08T23:59:00Z", type: "success" },
    ],
    topDistricts: [
      { name: "Sunshine Valley USD", learners: 1240, mastery: 78 },
      { name: "Lakewood School District", learners: 980, mastery: 82 },
      { name: "Mountain View ISD", learners: 875, mastery: 75 },
      { name: "Riverside County Schools", learners: 720, mastery: 71 },
      { name: "Oakdale Unified", learners: 650, mastery: 84 },
    ],
  });
}
