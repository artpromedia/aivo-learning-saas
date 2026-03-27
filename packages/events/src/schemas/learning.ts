import { z } from "zod";

// ─── lesson.completed ───────────────────────────────────────────────────────────
export const LessonCompletedSchema = z.object({
  learnerId: z.string().uuid(),
  sessionId: z.string().uuid(),
  subject: z.string(),
  skill: z.string(),
  masteryDelta: z.number(),
});
export type LessonCompleted = z.infer<typeof LessonCompletedSchema>;

// ─── quiz.completed ─────────────────────────────────────────────────────────────
export const QuizCompletedSchema = z.object({
  learnerId: z.string().uuid(),
  sessionId: z.string().uuid(),
  subject: z.string(),
  score: z.number().min(0).max(1),
  totalQuestions: z.number().int().positive(),
});
export type QuizCompleted = z.infer<typeof QuizCompletedSchema>;

// ─── quiz.perfect_score ─────────────────────────────────────────────────────────
export const QuizPerfectScoreSchema = z.object({
  learnerId: z.string().uuid(),
  sessionId: z.string().uuid(),
  subject: z.string(),
});
export type QuizPerfectScore = z.infer<typeof QuizPerfectScoreSchema>;

export const LEARNING_SUBJECTS = {
  "lesson.completed": "aivo.lesson.completed",
  "quiz.completed": "aivo.quiz.completed",
  "quiz.perfect_score": "aivo.quiz.perfect_score",
} as const;

export const LEARNING_SCHEMAS = {
  "lesson.completed": LessonCompletedSchema,
  "quiz.completed": QuizCompletedSchema,
  "quiz.perfect_score": QuizPerfectScoreSchema,
} as const;
