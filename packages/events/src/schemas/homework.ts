import { z } from "zod";

// ─── homework.uploaded ──────────────────────────────────────────────────────────
export const HomeworkUploadedSchema = z.object({
  learnerId: z.string().uuid(),
  assignmentId: z.string().uuid(),
  subject: z.string(),
  fileUrl: z.string().url(),
});
export type HomeworkUploaded = z.infer<typeof HomeworkUploadedSchema>;

// ─── homework.processed ─────────────────────────────────────────────────────────
export const HomeworkProcessedSchema = z.object({
  learnerId: z.string().uuid(),
  assignmentId: z.string().uuid(),
  problemCount: z.number().int().nonnegative(),
});
export type HomeworkProcessed = z.infer<typeof HomeworkProcessedSchema>;

// ─── homework.session.started ───────────────────────────────────────────────────
export const HomeworkSessionStartedSchema = z.object({
  learnerId: z.string().uuid(),
  assignmentId: z.string().uuid(),
  sessionId: z.string().uuid(),
});
export type HomeworkSessionStarted = z.infer<typeof HomeworkSessionStartedSchema>;

// ─── homework.session.completed ─────────────────────────────────────────────────
export const HomeworkSessionCompletedSchema = z.object({
  learnerId: z.string().uuid(),
  assignmentId: z.string().uuid(),
  sessionId: z.string().uuid(),
  subject: z.string(),
  completionQuality: z.number().min(0).max(1),
  problemsCompleted: z.number().int().nonnegative(),
  hintsUsed: z.number().int().nonnegative(),
  durationSeconds: z.number().int().nonnegative(),
});
export type HomeworkSessionCompleted = z.infer<typeof HomeworkSessionCompletedSchema>;

export const HOMEWORK_SUBJECTS = {
  "homework.uploaded": "aivo.homework.uploaded",
  "homework.processed": "aivo.homework.processed",
  "homework.session.started": "aivo.homework.session.started",
  "homework.session.completed": "aivo.homework.session.completed",
} as const;

export const HOMEWORK_SCHEMAS = {
  "homework.uploaded": HomeworkUploadedSchema,
  "homework.processed": HomeworkProcessedSchema,
  "homework.session.started": HomeworkSessionStartedSchema,
  "homework.session.completed": HomeworkSessionCompletedSchema,
} as const;
