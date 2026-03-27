import { z } from "zod";

// ─── comms.email.send ───────────────────────────────────────────────────────────
export const CommsEmailSendSchema = z.object({
  templateSlug: z.string(),
  recipientEmail: z.string().email(),
  recipientName: z.string(),
  templateData: z.record(z.string(), z.unknown()),
  tags: z.array(z.string()).default([]),
});
export type CommsEmailSend = z.infer<typeof CommsEmailSendSchema>;

// ─── comms.push.send ────────────────────────────────────────────────────────────
export const CommsPushSendSchema = z.object({
  userId: z.string().uuid(),
  title: z.string(),
  body: z.string(),
  data: z.record(z.string(), z.unknown()).default({}),
});
export type CommsPushSend = z.infer<typeof CommsPushSendSchema>;

// ─── comms.notification.created ─────────────────────────────────────────────────
export const CommsNotificationCreatedSchema = z.object({
  userId: z.string().uuid(),
  type: z.string(),
  title: z.string(),
  body: z.string(),
  actionUrl: z.string().optional(),
});
export type CommsNotificationCreated = z.infer<typeof CommsNotificationCreatedSchema>;

export const COMMS_SUBJECTS = {
  "comms.email.send": "aivo.comms.email.send",
  "comms.push.send": "aivo.comms.push.send",
  "comms.notification.created": "aivo.comms.notification.created",
} as const;

export const COMMS_SCHEMAS = {
  "comms.email.send": CommsEmailSendSchema,
  "comms.push.send": CommsPushSendSchema,
  "comms.notification.created": CommsNotificationCreatedSchema,
} as const;
