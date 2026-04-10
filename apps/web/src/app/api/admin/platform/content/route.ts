import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    totalItems: 284,
    publishedCount: 231,
    draftCount: 38,
    reviewCount: 15,
    totalUsage: 456000,
    items: [
      { id: "c1", title: "Fractions Mastery: Part 1", type: "lesson", subject: "Mathematics", gradeRange: "3-5", status: "published", usageCount: 12400, avgRating: 4.8, updatedAt: "2026-04-01" },
      { id: "c2", title: "Reading Comprehension Quest", type: "quest", subject: "English Language Arts", gradeRange: "2-4", status: "published", usageCount: 9800, avgRating: 4.6, updatedAt: "2026-03-28" },
      { id: "c3", title: "Science Explorer: Weather Systems", type: "module", subject: "Science", gradeRange: "4-6", status: "published", usageCount: 7200, avgRating: 4.7, updatedAt: "2026-03-15" },
      { id: "c4", title: "Multiplication Facts Assessment", type: "assessment", subject: "Mathematics", gradeRange: "3-4", status: "published", usageCount: 15600, avgRating: 4.5, updatedAt: "2026-04-05" },
      { id: "c5", title: "Creative Writing Adventure", type: "quest", subject: "English Language Arts", gradeRange: "5-7", status: "published", usageCount: 6300, avgRating: 4.9, updatedAt: "2026-02-20" },
      { id: "c6", title: "Geometry Basics: Shapes & Angles", type: "lesson", subject: "Mathematics", gradeRange: "4-6", status: "review", usageCount: 0, avgRating: 0, updatedAt: "2026-04-08" },
      { id: "c7", title: "Social Studies: Community Helpers", type: "module", subject: "Social Studies", gradeRange: "K-2", status: "draft", usageCount: 0, avgRating: 0, updatedAt: "2026-04-07" },
      { id: "c8", title: "Phonics Practice: Vowel Teams", type: "lesson", subject: "English Language Arts", gradeRange: "1-3", status: "published", usageCount: 18200, avgRating: 4.7, updatedAt: "2026-01-10" },
      { id: "c9", title: "Division Word Problems", type: "assessment", subject: "Mathematics", gradeRange: "4-5", status: "review", usageCount: 0, avgRating: 0, updatedAt: "2026-04-09" },
      { id: "c10", title: "Sensory-Friendly Reading Module", type: "module", subject: "Special Education", gradeRange: "K-3", status: "draft", usageCount: 0, avgRating: 0, updatedAt: "2026-04-06" },
    ],
  });
}
