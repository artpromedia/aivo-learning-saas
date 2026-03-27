import type { RetentionPolicy, StorageType } from "nats";

export interface StreamDefinition {
  name: string;
  subjects: string[];
  retention: "limits" | "interest" | "workqueue";
  storage: "file" | "memory";
  maxAge: number; // nanoseconds
  maxBytes: number;
  duplicateWindow: number; // nanoseconds
}

const HOUR_NS = 3_600_000_000_000;
const DAY_NS = 24 * HOUR_NS;
const GB = 1_073_741_824;

export const JETSTREAM_STREAMS: StreamDefinition[] = [
  {
    name: "AIVO_ASSESSMENT",
    subjects: ["aivo.assessment.>"],
    retention: "limits",
    storage: "file",
    maxAge: 90 * DAY_NS,
    maxBytes: 10 * GB,
    duplicateWindow: 2 * 60 * 1_000_000_000, // 2 min
  },
  {
    name: "AIVO_BRAIN",
    subjects: ["aivo.brain.>"],
    retention: "limits",
    storage: "file",
    maxAge: 365 * DAY_NS,
    maxBytes: 50 * GB,
    duplicateWindow: 2 * 60 * 1_000_000_000,
  },
  {
    name: "AIVO_TUTOR",
    subjects: ["aivo.tutor.>"],
    retention: "limits",
    storage: "file",
    maxAge: 90 * DAY_NS,
    maxBytes: 10 * GB,
    duplicateWindow: 2 * 60 * 1_000_000_000,
  },
  {
    name: "AIVO_HOMEWORK",
    subjects: ["aivo.homework.>"],
    retention: "limits",
    storage: "file",
    maxAge: 90 * DAY_NS,
    maxBytes: 10 * GB,
    duplicateWindow: 2 * 60 * 1_000_000_000,
  },
  {
    name: "AIVO_LEARNING",
    subjects: ["aivo.lesson.>", "aivo.quiz.>"],
    retention: "limits",
    storage: "file",
    maxAge: 365 * DAY_NS,
    maxBytes: 50 * GB,
    duplicateWindow: 2 * 60 * 1_000_000_000,
  },
  {
    name: "AIVO_ENGAGEMENT",
    subjects: ["aivo.engagement.>", "aivo.focus.>", "aivo.break.>"],
    retention: "limits",
    storage: "file",
    maxAge: 180 * DAY_NS,
    maxBytes: 20 * GB,
    duplicateWindow: 2 * 60 * 1_000_000_000,
  },
  {
    name: "AIVO_BILLING",
    subjects: ["aivo.billing.>"],
    retention: "limits",
    storage: "file",
    maxAge: 730 * DAY_NS, // 2 years
    maxBytes: 5 * GB,
    duplicateWindow: 2 * 60 * 1_000_000_000,
  },
  {
    name: "AIVO_COMMS",
    subjects: ["aivo.comms.>"],
    retention: "workqueue",
    storage: "file",
    maxAge: 7 * DAY_NS,
    maxBytes: 2 * GB,
    duplicateWindow: 2 * 60 * 1_000_000_000,
  },
  {
    name: "AIVO_IDENTITY",
    subjects: ["aivo.identity.>"],
    retention: "limits",
    storage: "file",
    maxAge: 365 * DAY_NS,
    maxBytes: 5 * GB,
    duplicateWindow: 2 * 60 * 1_000_000_000,
  },
];
