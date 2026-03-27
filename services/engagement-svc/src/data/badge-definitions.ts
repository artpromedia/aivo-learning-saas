export interface BadgeDefinition {
  slug: string;
  name: string;
  description: string;
  category: string;
  iconUrl: string;
  criteria: BadgeCriteria;
}

export type BadgeCriteria =
  | { type: "lesson_count"; count: number }
  | { type: "streak_days"; days: number }
  | { type: "perfect_score"; count: number }
  | { type: "mastery_skills"; subject: string; count: number; threshold: number }
  | { type: "session_count"; sessionType: string; count: number; minQuality?: number }
  | { type: "quest_completed"; count: number }
  | { type: "challenge_wins"; count: number }
  | { type: "peer_helps"; count: number }
  | { type: "subjects_tried"; count: number }
  | { type: "iep_goal_met"; count: number }
  | { type: "brain_cloned" }
  | { type: "first_lesson" };

export const BADGE_DEFINITIONS: BadgeDefinition[] = [
  {
    slug: "first_steps",
    name: "First Steps",
    description: "Complete your first lesson",
    category: "milestone",
    iconUrl: "/badges/first_steps.png",
    criteria: { type: "first_lesson" },
  },
  {
    slug: "brain_activated",
    name: "Brain Activated",
    description: "Complete onboarding and activate your Brain",
    category: "milestone",
    iconUrl: "/badges/brain_activated.png",
    criteria: { type: "brain_cloned" },
  },
  {
    slug: "week_warrior",
    name: "Week Warrior",
    description: "Maintain a 7-day learning streak",
    category: "streak",
    iconUrl: "/badges/week_warrior.png",
    criteria: { type: "streak_days", days: 7 },
  },
  {
    slug: "month_master",
    name: "Month Master",
    description: "Maintain a 30-day learning streak",
    category: "streak",
    iconUrl: "/badges/month_master.png",
    criteria: { type: "streak_days", days: 30 },
  },
  {
    slug: "perfect_score",
    name: "Perfect Score",
    description: "Score 100% on any quiz",
    category: "achievement",
    iconUrl: "/badges/perfect_score.png",
    criteria: { type: "perfect_score", count: 1 },
  },
  {
    slug: "math_whiz",
    name: "Math Whiz",
    description: "Master 10 math skills",
    category: "subject",
    iconUrl: "/badges/math_whiz.png",
    criteria: { type: "mastery_skills", subject: "math", count: 10, threshold: 0.8 },
  },
  {
    slug: "bookworm",
    name: "Bookworm",
    description: "Complete 20 reading sessions",
    category: "subject",
    iconUrl: "/badges/bookworm.png",
    criteria: { type: "session_count", sessionType: "reading", count: 20 },
  },
  {
    slug: "homework_hero",
    name: "Homework Hero",
    description: "Complete 10 homework sessions with quality at least 70%",
    category: "achievement",
    iconUrl: "/badges/homework_hero.png",
    criteria: { type: "session_count", sessionType: "homework", count: 10, minQuality: 0.7 },
  },
  {
    slug: "quest_champion",
    name: "Quest Champion",
    description: "Complete any quest world",
    category: "quest",
    iconUrl: "/badges/quest_champion.png",
    criteria: { type: "quest_completed", count: 1 },
  },
  {
    slug: "social_star",
    name: "Social Star",
    description: "Win 5 multiplayer challenges",
    category: "social",
    iconUrl: "/badges/social_star.png",
    criteria: { type: "challenge_wins", count: 5 },
  },
  {
    slug: "explorer",
    name: "Explorer",
    description: "Try all 5 subjects",
    category: "milestone",
    iconUrl: "/badges/explorer.png",
    criteria: { type: "subjects_tried", count: 5 },
  },
  {
    slug: "helper",
    name: "Helper",
    description: "Help 3 peers in challenges",
    category: "social",
    iconUrl: "/badges/helper.png",
    criteria: { type: "peer_helps", count: 3 },
  },
  {
    slug: "iep_achiever",
    name: "IEP Achiever",
    description: "Meet any IEP goal",
    category: "milestone",
    iconUrl: "/badges/iep_achiever.png",
    criteria: { type: "iep_goal_met", count: 1 },
  },
];

export function getBadgeBySlug(slug: string): BadgeDefinition | undefined {
  return BADGE_DEFINITIONS.find((b) => b.slug === slug);
}
