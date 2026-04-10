import { NextResponse } from "next/server";

const districts: Record<string, object> = {
  d1: {
    id: "d1", name: "Sunshine Valley USD", state: "California", status: "active", plan: "Enterprise",
    contactName: "Dr. Maria Gonzalez", contactEmail: "mgonzalez@sunshinevalley.edu", contactPhone: "(555) 234-5678",
    createdAt: "2025-01-15", learnerCount: 1240, teacherCount: 85, classroomCount: 42, avgMastery: 78,
    licensesUsed: 1240, licensesTotal: 1500,
    topTeachers: [
      { name: "Ms. Rivera", learners: 32, mastery: 85 },
      { name: "Mr. Chen", learners: 28, mastery: 82 },
      { name: "Mrs. Patel", learners: 30, mastery: 79 },
    ],
    recentActivity: [
      { action: "New teacher onboarded", timestamp: "2026-04-09T10:00:00Z" },
      { action: "Classroom created: 4th Grade Math", timestamp: "2026-04-08T15:30:00Z" },
    ],
  },
  d2: {
    id: "d2", name: "Lakewood School District", state: "Oregon", status: "active", plan: "Enterprise",
    contactName: "James Wilson", contactEmail: "jwilson@lakewood.edu", contactPhone: "(555) 876-5432",
    createdAt: "2025-03-20", learnerCount: 980, teacherCount: 62, classroomCount: 35, avgMastery: 82,
    licensesUsed: 980, licensesTotal: 1200,
    topTeachers: [
      { name: "Ms. Thompson", learners: 26, mastery: 88 },
      { name: "Mr. Davis", learners: 24, mastery: 84 },
    ],
    recentActivity: [
      { action: "License upgrade approved", timestamp: "2026-04-09T09:00:00Z" },
    ],
  },
};

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const district = districts[id];
  if (!district) {
    const fallback = {
      id, name: "Mountain View ISD", state: "Texas", status: "active", plan: "Professional",
      contactName: "Sarah Martinez", contactEmail: "smartinez@mountainview.edu", contactPhone: "(555) 111-2222",
      createdAt: "2025-06-10", learnerCount: 875, teacherCount: 54, classroomCount: 28, avgMastery: 75,
      licensesUsed: 875, licensesTotal: 1000,
      topTeachers: [
        { name: "Ms. Johnson", learners: 22, mastery: 80 },
        { name: "Mr. Lee", learners: 20, mastery: 77 },
      ],
      recentActivity: [
        { action: "Assessment completed", timestamp: "2026-04-08T14:00:00Z" },
      ],
    };
    return NextResponse.json(fallback);
  }
  return NextResponse.json(district);
}
