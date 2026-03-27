import type { NatsConnection } from "nats";
import { publishEvent } from "@aivo/events";

export async function publishXpEarned(
  nc: NatsConnection,
  data: { learnerId: string; xpAmount: number; activity: string; triggerEvent: string },
) {
  await publishEvent(nc, "engagement.xp.earned", data);
}

export async function publishLevelUp(
  nc: NatsConnection,
  data: { learnerId: string; newLevel: number; totalXp: number },
) {
  await publishEvent(nc, "engagement.level.up", data);
}

export async function publishBadgeEarned(
  nc: NatsConnection,
  data: { learnerId: string; badgeSlug: string },
) {
  await publishEvent(nc, "engagement.badge.earned", data);
}

export async function publishStreakExtended(
  nc: NatsConnection,
  data: { learnerId: string; currentStreak: number },
) {
  await publishEvent(nc, "engagement.streak.extended", data);
}

export async function publishStreakBroken(
  nc: NatsConnection,
  data: { learnerId: string; previousStreak: number },
) {
  await publishEvent(nc, "engagement.streak.broken", data);
}

export async function publishChallengeCompleted(
  nc: NatsConnection,
  data: { learnerId: string; challengeId: string; won: boolean },
) {
  await publishEvent(nc, "engagement.challenge.completed", data);
}

export async function publishShopPurchased(
  nc: NatsConnection,
  data: { learnerId: string; itemId: string; cost: number },
) {
  await publishEvent(nc, "engagement.shop.purchased", data);
}
