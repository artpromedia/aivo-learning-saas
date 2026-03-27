export interface XpAwardRule {
  event: string;
  xp: number;
  coins: number;
  dynamic?: boolean;
}

export const XP_AWARDS: Record<string, XpAwardRule> = {
  "lesson.completed": { event: "lesson.completed", xp: 10, coins: 5 },
  "quiz.completed": { event: "quiz.completed", xp: 25, coins: 10 },
  "quiz.perfect_score": { event: "quiz.perfect_score", xp: 50, coins: 25 },
  "engagement.streak.extended": { event: "engagement.streak.extended", xp: 5, coins: 3, dynamic: true },
  "focus.session_30min": { event: "focus.session_30min", xp: 20, coins: 10 },
  "focus.session_90min": { event: "focus.session_90min", xp: 50, coins: 25 },
  "brain.iep_goal.met": { event: "brain.iep_goal.met", xp: 30, coins: 20 },
  "engagement.peer_help": { event: "engagement.peer_help", xp: 15, coins: 5 },
  "engagement.shop.purchased": { event: "engagement.shop.purchased", xp: 5, coins: 0 },
  "break.completed": { event: "break.completed", xp: 5, coins: 2 },
  "quest.chapter.completed": { event: "quest.chapter.completed", xp: 100, coins: 50, dynamic: true },
  "homework.session.completed": { event: "homework.session.completed", xp: 30, coins: 15, dynamic: true },
  "tutor.session.completed": { event: "tutor.session.completed", xp: 15, coins: 8 },
  "engagement.challenge.completed": { event: "engagement.challenge.completed", xp: 30, coins: 15, dynamic: true },
  "sel.checkin.completed": { event: "sel.checkin.completed", xp: 5, coins: 2 },
} as const;

/**
 * Calculate dynamic XP for streak extension: 5 × streak_day, capped at 50.
 */
export function calculateStreakXp(streakDays: number): { xp: number; coins: number } {
  const xp = Math.min(50, 5 * streakDays);
  return { xp, coins: 3 };
}

/**
 * Calculate dynamic XP for homework: completion_quality × 30.
 */
export function calculateHomeworkXp(completionQuality: number): { xp: number; coins: number } {
  const xp = Math.round(completionQuality * 30);
  const coins = Math.round(completionQuality * 15);
  return { xp, coins };
}

/**
 * Calculate challenge XP: 30 for winner, 15 for participant.
 */
export function calculateChallengeXp(won: boolean): { xp: number; coins: number } {
  return won ? { xp: 30, coins: 15 } : { xp: 15, coins: 5 };
}
