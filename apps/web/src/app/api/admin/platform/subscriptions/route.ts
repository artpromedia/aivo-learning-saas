import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    totalMrr: 18750000,
    totalArr: 225000000,
    activeCount: 42,
    trialCount: 5,
    pastDueCount: 2,
    churnRate: 3.2,
    subscriptions: [
      { id: "s1", district: "Sunshine Valley USD", plan: "Enterprise", status: "active", mrr: 4500000, learners: 1240, renewsAt: "2027-01-15" },
      { id: "s2", district: "Lakewood School District", plan: "Enterprise", status: "active", mrr: 3600000, learners: 980, renewsAt: "2027-03-20" },
      { id: "s3", district: "Mountain View ISD", plan: "Professional", status: "active", mrr: 2100000, learners: 875, renewsAt: "2026-12-10" },
      { id: "s4", district: "Riverside County Schools", plan: "Enterprise", status: "active", mrr: 2700000, learners: 720, renewsAt: "2027-02-28" },
      { id: "s5", district: "Oakdale Unified", plan: "Professional", status: "active", mrr: 1500000, learners: 650, renewsAt: "2026-10-15" },
      { id: "s6", district: "Willowbrook Academy", plan: "Trial", status: "trial", mrr: 0, learners: 340, renewsAt: "2026-05-01" },
      { id: "s7", district: "Cedar Hills Elementary", plan: "Trial", status: "trial", mrr: 0, learners: 180, renewsAt: "2026-04-30" },
      { id: "s8", district: "Greenfield Schools", plan: "Professional", status: "past_due", mrr: 1800000, learners: 520, renewsAt: "2026-03-15" },
      { id: "s9", district: "Westlake Academy", plan: "Starter", status: "canceled", mrr: 0, learners: 0, renewsAt: "2026-01-01" },
    ],
  });
}
