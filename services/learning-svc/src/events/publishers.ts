import type { NatsConnection } from "nats";
import { publishEvent } from "@aivo/events";

export async function publishLessonCompleted(
  nc: NatsConnection,
  data: {
    learnerId: string;
    sessionId: string;
    subject: string;
    skill: string;
    masteryDelta: number;
  },
) {
  await publishEvent(nc, "lesson.completed", data);
}

export async function publishQuizCompleted(
  nc: NatsConnection,
  data: {
    learnerId: string;
    sessionId: string;
    subject: string;
    score: number;
    totalQuestions: number;
  },
) {
  await publishEvent(nc, "quiz.completed", data);
}

export async function publishQuizPerfectScore(
  nc: NatsConnection,
  data: {
    learnerId: string;
    sessionId: string;
    subject: string;
  },
) {
  await publishEvent(nc, "quiz.perfect_score", data);
}

export async function publishXpEarned(
  nc: NatsConnection,
  data: {
    learnerId: string;
    xpAmount: number;
    activity: string;
    triggerEvent: string;
  },
) {
  await publishEvent(nc, "engagement.xp.earned", data);
}

export async function publishFocusSession30min(
  nc: NatsConnection,
  data: { learnerId: string; sessionId: string },
) {
  await publishEvent(nc, "focus.session_30min", data);
}

export async function publishFocusSession90min(
  nc: NatsConnection,
  data: { learnerId: string; sessionId: string },
) {
  await publishEvent(nc, "focus.session_90min", data);
}
