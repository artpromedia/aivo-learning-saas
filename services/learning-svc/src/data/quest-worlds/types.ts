export interface QuestChapterDefinition {
  number: number;
  title: string;
  hasBoss: boolean;
  xpReward: number;
}

export interface GradeBandSkills {
  skills: string[];
}

export interface QuestWorldDefinition {
  slug: string;
  title: string;
  description: string;
  subject: string;
  tutorPersona: string;
  gradeBands: Record<string, GradeBandSkills>;
  chapters: QuestChapterDefinition[];
  totalXp: number;
}

export function getGradeBand(enrolledGrade: number | null): string {
  if (enrolledGrade === null) return "K-2";
  if (enrolledGrade <= 2) return "K-2";
  if (enrolledGrade <= 5) return "3-5";
  if (enrolledGrade <= 8) return "6-8";
  return "9-12";
}

export function getChapterSkills(
  world: QuestWorldDefinition,
  chapterNumber: number,
  enrolledGrade: number | null,
): string[] {
  const band = getGradeBand(enrolledGrade);
  const bandSkills = world.gradeBands[band]?.skills ?? world.gradeBands["K-2"].skills;
  const skillsPerChapter = Math.max(1, Math.floor(bandSkills.length / world.chapters.length));
  const startIdx = (chapterNumber - 1) * skillsPerChapter;
  return bandSkills.slice(startIdx, startIdx + skillsPerChapter + 1);
}
