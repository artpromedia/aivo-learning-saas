export interface Feature {
  icon: string;
  title: string;
  description: string;
}

export const features: Feature[] = [
  {
    icon: "Brain",
    title: "Brain Clone AI",
    description:
      "Our proprietary AI creates a digital twin of each student's learning profile, adapting in real-time to their strengths, gaps, and learning style.",
  },
  {
    icon: "Sparkles",
    title: "Adaptive Content",
    description:
      "Every lesson, quiz, and exercise is dynamically generated to match the student's current level and IEP goals. No two learning paths are alike.",
  },
  {
    icon: "FileCheck",
    title: "IEP Integration",
    description:
      "Upload existing IEP documents and watch AIVO automatically align curriculum, accommodations, and progress tracking to each student's plan.",
  },
  {
    icon: "Users",
    title: "AI Tutors",
    description:
      "Five specialized AI tutors — Nova, Sage, Spark, Chrono, and Pixel — each with unique personalities and teaching styles across every subject.",
  },
  {
    icon: "BookOpen",
    title: "Homework Helper",
    description:
      "Students can snap a photo of any assignment and get step-by-step guidance — not answers — that builds real understanding and problem-solving skills.",
  },
  {
    icon: "Trophy",
    title: "Gamification",
    description:
      "XP points, streaks, badges, and leaderboards keep students motivated. Parents and teachers can see engagement metrics in real-time dashboards.",
  },
];
