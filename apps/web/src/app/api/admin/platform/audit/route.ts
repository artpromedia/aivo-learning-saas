import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    entries: [
      { id: "al1", action: "User suspended", actor: "Elena Rodriguez", actorRole: "super_admin", target: "suspended@example.com", targetType: "user", severity: "critical", timestamp: "2026-04-09T14:30:00Z", ip: "192.168.1.100", details: "Policy violation: inappropriate content in chat" },
      { id: "al2", action: "District onboarded", actor: "Marcus Chen", actorRole: "ops_manager", target: "Willowbrook Academy", targetType: "district", severity: "info", timestamp: "2026-04-09T13:15:00Z", ip: "192.168.1.101" },
      { id: "al3", action: "Subscription upgraded", actor: "Taylor Kim", actorRole: "billing_manager", target: "Mountain View ISD", targetType: "subscription", severity: "info", timestamp: "2026-04-09T12:00:00Z", ip: "192.168.1.102", details: "Upgraded from Professional to Enterprise" },
      { id: "al4", action: "API rate limit exceeded", actor: "system", actorRole: "system", target: "District #23 API Key", targetType: "api_key", severity: "warning", timestamp: "2026-04-09T10:20:00Z", ip: "10.0.0.1", details: "Rate limit of 1000 req/min exceeded (1247 requests)" },
      { id: "al5", action: "Content published", actor: "Priya Sharma", actorRole: "content_manager", target: "Fractions Mastery: Part 1", targetType: "content", severity: "info", timestamp: "2026-04-09T09:45:00Z", ip: "192.168.1.103" },
      { id: "al6", action: "Failed login attempt (5x)", actor: "unknown", actorRole: "unknown", target: "admin@lakewood.edu", targetType: "user", severity: "critical", timestamp: "2026-04-09T08:30:00Z", ip: "203.0.113.42", details: "Account temporarily locked after 5 failed attempts" },
      { id: "al7", action: "Bulk user import", actor: "Dr. Maria Gonzalez", actorRole: "district_admin", target: "Sunshine Valley USD", targetType: "district", severity: "info", timestamp: "2026-04-08T16:00:00Z", ip: "192.168.2.50", details: "45 new student accounts created" },
      { id: "al8", action: "Maintenance window started", actor: "system", actorRole: "system", target: "Platform", targetType: "system", severity: "warning", timestamp: "2026-04-08T02:00:00Z", ip: "10.0.0.1", details: "Scheduled maintenance: database migration" },
      { id: "al9", action: "Password reset", actor: "Jordan Blake", actorRole: "support_agent", target: "teacher@school.edu", targetType: "user", severity: "info", timestamp: "2026-04-07T15:30:00Z", ip: "192.168.1.104" },
      { id: "al10", action: "SSO configuration updated", actor: "Elena Rodriguez", actorRole: "super_admin", target: "Lakewood School District", targetType: "district", severity: "warning", timestamp: "2026-04-07T11:00:00Z", ip: "192.168.1.100", details: "SAML 2.0 IdP metadata updated" },
    ],
  });
}
