import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    districts: [
      { id: "d1", name: "Sunshine Valley USD", state: "California", learnerCount: 1240, teacherCount: 85, avgMastery: 78, status: "active", plan: "Enterprise", createdAt: "2025-01-15" },
      { id: "d2", name: "Lakewood School District", state: "Oregon", learnerCount: 980, teacherCount: 62, avgMastery: 82, status: "active", plan: "Enterprise", createdAt: "2025-03-20" },
      { id: "d3", name: "Mountain View ISD", state: "Texas", learnerCount: 875, teacherCount: 54, avgMastery: 75, status: "active", plan: "Professional", createdAt: "2025-06-10" },
      { id: "d4", name: "Riverside County Schools", state: "Florida", learnerCount: 720, teacherCount: 48, avgMastery: 71, status: "active", plan: "Enterprise", createdAt: "2025-02-28" },
      { id: "d5", name: "Oakdale Unified", state: "Michigan", learnerCount: 650, teacherCount: 42, avgMastery: 84, status: "active", plan: "Professional", createdAt: "2025-04-15" },
      { id: "d6", name: "Willowbrook Academy", state: "New York", learnerCount: 340, teacherCount: 24, avgMastery: 79, status: "trial", plan: "Trial", createdAt: "2026-03-01" },
      { id: "d7", name: "Cedar Hills Elementary", state: "Colorado", learnerCount: 180, teacherCount: 12, avgMastery: 68, status: "trial", plan: "Trial", createdAt: "2026-03-15" },
      { id: "d8", name: "Pine Ridge School District", state: "Montana", learnerCount: 0, teacherCount: 3, avgMastery: 0, status: "suspended", plan: "Professional", createdAt: "2025-09-01" },
    ],
  });
}
