import type { FastifyInstance } from "fastify";
import { subscribeEvent, LEARNING_SCHEMAS, ENGAGEMENT_SCHEMAS, BRAIN_SCHEMAS, type Subscription } from "@aivo/events";
import { XpEngine } from "../engines/xp-engine.js";
import { StreakEngine } from "../engines/streak-engine.js";
import { BadgeEngine } from "../engines/badge-engine.js";
import { LeaderboardEngine } from "../engines/leaderboard-engine.js";
import { DailyChallengeService } from "../services/daily-challenge.service.js";

export async function setupSubscribers(app: FastifyInstance): Promise<void> {
  const nc = app.nats;
  const xpEngine = new XpEngine(app);
  const streakEngine = new StreakEngine(app);
  const badgeEngine = new BadgeEngine(app);
  const leaderboardEngine = new LeaderboardEngine(app);
  const dailyService = new DailyChallengeService(app);
  const subs: Subscription[] = [];

  async function handleXpEvent(
    eventName: string,
    learnerId: string,
    metadata?: Record<string, unknown>,
  ) {
    const result = await xpEngine.processEvent(eventName, learnerId, metadata);
    if (result) {
      await leaderboardEngine.addXpToLeaderboards(learnerId, result.xpAwarded);
      await streakEngine.recordActivity(learnerId);
      await badgeEngine.evaluateAllBadges(learnerId, eventName);
    }
  }

  // lesson.completed
  try {
    const sub = await subscribeEvent(nc, "lesson.completed", LEARNING_SCHEMAS["lesson.completed"], async (data) => {
      app.log.info({ data }, "Received lesson.completed");
      await handleXpEvent("lesson.completed", data.learnerId);
      await dailyService.markCompleted(data.learnerId, "complete_lesson");
    });
    subs.push(sub);
  } catch { app.log.warn("Could not subscribe to lesson.completed"); }

  // quiz.completed
  try {
    const sub = await subscribeEvent(nc, "quiz.completed", LEARNING_SCHEMAS["quiz.completed"], async (data) => {
      app.log.info({ data }, "Received quiz.completed");
      await handleXpEvent("quiz.completed", data.learnerId);
      await dailyService.markCompleted(data.learnerId, "quiz_attempt");
    });
    subs.push(sub);
  } catch { app.log.warn("Could not subscribe to quiz.completed"); }

  // quiz.perfect_score
  try {
    const sub = await subscribeEvent(nc, "quiz.perfect_score", LEARNING_SCHEMAS["quiz.perfect_score"], async (data) => {
      app.log.info({ data }, "Received quiz.perfect_score");
      await handleXpEvent("quiz.perfect_score", data.learnerId);
    });
    subs.push(sub);
  } catch { app.log.warn("Could not subscribe to quiz.perfect_score"); }

  // focus.session_30min
  try {
    const sub = await subscribeEvent(nc, "focus.session_30min", ENGAGEMENT_SCHEMAS["focus.session_30min"], async (data) => {
      app.log.info({ data }, "Received focus.session_30min");
      await handleXpEvent("focus.session_30min", data.learnerId);
    });
    subs.push(sub);
  } catch { app.log.warn("Could not subscribe to focus.session_30min"); }

  // focus.session_90min
  try {
    const sub = await subscribeEvent(nc, "focus.session_90min", ENGAGEMENT_SCHEMAS["focus.session_90min"], async (data) => {
      app.log.info({ data }, "Received focus.session_90min");
      await handleXpEvent("focus.session_90min", data.learnerId);
    });
    subs.push(sub);
  } catch { app.log.warn("Could not subscribe to focus.session_90min"); }

  // break.completed
  try {
    const sub = await subscribeEvent(nc, "break.completed", ENGAGEMENT_SCHEMAS["break.completed"], async (data) => {
      app.log.info({ data }, "Received break.completed");
      await handleXpEvent("break.completed", data.learnerId);
      await dailyService.markCompleted(data.learnerId, "break_activity");
    });
    subs.push(sub);
  } catch { app.log.warn("Could not subscribe to break.completed"); }

  // brain.cloned
  try {
    const sub = await subscribeEvent(nc, "brain.cloned", BRAIN_SCHEMAS["brain.cloned"], async (data) => {
      app.log.info({ data }, "Received brain.cloned — awarding Brain Activated badge");
      await badgeEngine.evaluateAllBadges(data.learnerId, "brain.cloned");
    });
    subs.push(sub);
  } catch { app.log.warn("Could not subscribe to brain.cloned"); }

  // brain.iep_goal.met
  try {
    const sub = await subscribeEvent(nc, "brain.iep_goal.met", BRAIN_SCHEMAS["brain.iep_goal.met"], async (data) => {
      app.log.info({ data }, "Received brain.iep_goal.met");
      await handleXpEvent("brain.iep_goal.met", data.learnerId);
    });
    subs.push(sub);
  } catch { app.log.warn("Could not subscribe to brain.iep_goal.met"); }

  // engagement.streak.extended (for streak XP bonus)
  try {
    const sub = await subscribeEvent(nc, "engagement.streak.extended", ENGAGEMENT_SCHEMAS["engagement.streak.extended"], async (data) => {
      app.log.info({ data }, "Received engagement.streak.extended");
      await xpEngine.processEvent("engagement.streak.extended", data.learnerId, {
        currentStreak: data.currentStreak,
      });
    });
    subs.push(sub);
  } catch { app.log.warn("Could not subscribe to engagement.streak.extended"); }

  // engagement.challenge.completed
  try {
    const sub = await subscribeEvent(nc, "engagement.challenge.completed", ENGAGEMENT_SCHEMAS["engagement.challenge.completed"], async (data) => {
      app.log.info({ data }, "Received engagement.challenge.completed");
      await dailyService.markCompleted(data.learnerId, "challenge_play");
    });
    subs.push(sub);
  } catch { app.log.warn("Could not subscribe to engagement.challenge.completed"); }

  // Clean up on close
  app.addHook("onClose", async () => {
    for (const sub of subs) {
      sub.unsubscribe();
    }
  });

  app.log.info("Engagement-svc NATS subscribers set up");
}
