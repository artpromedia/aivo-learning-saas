import type { FastifyInstance } from "fastify";
import { subscribeEvent, IDENTITY_SCHEMAS, BRAIN_SCHEMAS, TUTOR_SCHEMAS, HOMEWORK_SCHEMAS, ENGAGEMENT_SCHEMAS, BILLING_SCHEMAS, COMMS_SCHEMAS } from "@aivo/events";
import { eq } from "drizzle-orm";
import { users, learners } from "@aivo/db";
import { EmailService } from "../services/email.service.js";
import { NotificationService } from "../services/notification.service.js";
import { PushService } from "../services/push.service.js";
import { broadcastToUser } from "../realtime/broadcaster.js";
import { getConfig } from "../config.js";

async function getUserById(app: FastifyInstance, userId: string) {
  const [user] = await app.db.select().from(users).where(eq(users.id, userId)).limit(1);
  return user;
}

async function getLearnerWithParent(app: FastifyInstance, learnerId: string) {
  const [learner] = await app.db
    .select({
      id: learners.id,
      name: learners.name,
      parentId: learners.parentId,
    })
    .from(learners)
    .where(eq(learners.id, learnerId))
    .limit(1);

  if (!learner) return null;

  const parent = await getUserById(app, learner.parentId);
  return { learner, parent };
}

export async function setupSubscribers(app: FastifyInstance): Promise<void> {
  const nc = app.nats;
  const config = getConfig();
  const emailService = new EmailService(app);
  const notificationService = new NotificationService(app);
  const pushService = new PushService(app);

  // ─── identity.user.created → welcome + verification emails ─────────────────
  try {
    await subscribeEvent(nc, "identity.user.created", IDENTITY_SCHEMAS["identity.user.created"], async (data) => {
      try {
        const user = await getUserById(app, data.userId);
        if (!user) return;

        await emailService.sendTemplate("welcome", user.email, user.id, {
          userName: user.name,
          appUrl: config.APP_URL,
        });

        await emailService.sendTemplate("email_verification", user.email, user.id, {
          userName: user.name,
          verificationUrl: `${config.APP_URL}/verify-email?userId=${data.userId}`,
          expiresIn: "24 hours",
        });

        app.log.info({ userId: data.userId }, "Welcome + verification emails sent");
      } catch (err) {
        app.log.error({ err, data }, "Failed to process identity.user.created");
      }
    });
  } catch { app.log.warn("Could not subscribe to identity.user.created"); }

  // ─── identity.user.invited → invitation / caregiver-invite email ───────────
  try {
    await subscribeEvent(nc, "identity.user.invited", IDENTITY_SCHEMAS["identity.user.invited"], async (data) => {
      try {
        const invitedUser = await getUserById(app, data.userId);
        const inviter = await getUserById(app, data.invitedBy);
        if (!invitedUser || !inviter) return;

        if (data.role === "CAREGIVER") {
          await emailService.sendTemplate("caregiver_invite", invitedUser.email, invitedUser.id, {
            parentName: inviter.name,
            learnerName: invitedUser.name,
            acceptUrl: `${config.APP_URL}/accept-invite?userId=${data.userId}`,
          });
        } else {
          await emailService.sendTemplate("invitation", invitedUser.email, invitedUser.id, {
            inviterName: inviter.name,
            learnerName: "",
            role: data.role,
            acceptUrl: `${config.APP_URL}/accept-invite?userId=${data.userId}`,
          });
        }
      } catch (err) {
        app.log.error({ err, data }, "Failed to process identity.user.invited");
      }
    });
  } catch { app.log.warn("Could not subscribe to identity.user.invited"); }

  // ─── brain.cloned → brain-profile-reveal email + push ──────────────────────
  try {
    await subscribeEvent(nc, "brain.cloned", BRAIN_SCHEMAS["brain.cloned"], async (data) => {
      try {
        const result = await getLearnerWithParent(app, data.learnerId);
        if (!result) return;

        await emailService.sendTemplate("brain_profile_reveal", result.parent.email, result.parent.id, {
          userName: result.parent.name,
          learnerName: result.learner.name,
          profileSummary: `Brain profile created with functioning level: ${data.functioningLevel.replace(/_/g, " ")}`,
          reviewUrl: `${config.APP_URL}/parent/${result.learner.id}/brain`,
        });

        await pushService.sendToUser(result.parent.id, "brain_update", {
          learnerName: result.learner.name,
        });
      } catch (err) {
        app.log.error({ err, data }, "Failed to process brain.cloned");
      }
    });
  } catch { app.log.warn("Could not subscribe to brain.cloned"); }

  // ─── brain.recommendation.created → in-app + push + regression email + teacher_insight ─
  try {
    await subscribeEvent(nc, "brain.recommendation.created", BRAIN_SCHEMAS["brain.recommendation.created"], async (data) => {
      try {
        const result = await getLearnerWithParent(app, data.learnerId);
        if (!result) return;

        // Send regression rollback email if this is a REGRESSION_ROLLBACK_OFFER
        if (data.type === "REGRESSION_ROLLBACK_OFFER") {
          const rollbackUrl = `${config.APP_URL}/parent/${result.learner.id}/brain/rollback`;
          await emailService.sendTemplate("regression_rollback_offer", result.parent.email, result.parent.id, {
            userName: result.parent.name,
            learnerName: result.learner.name,
            domains: data.type.replace(/_/g, " "),
            dropSummary: "One or more learning domains have dropped 15% or more since the recent upgrade.",
            rollbackUrl,
            appUrl: config.APP_URL,
          });
          app.log.info({ learnerId: data.learnerId }, "Regression rollback offer email sent");
        }

        await notificationService.create({
          userId: result.parent.id,
          type: "recommendation_pending",
          title: data.type === "TEACHER_INSIGHT"
            ? "Teacher observation shared"
            : "New recommendation",
          body: data.type === "TEACHER_INSIGHT"
            ? `${result.learner.name}'s teacher shared an observation`
            : `A new ${data.type.replace(/_/g, " ").toLowerCase()} recommendation is ready for ${result.learner.name}`,
          actionUrl: `/parent/${result.learner.id}/recommendations`,
        });

        await pushService.sendToUser(result.parent.id, "recommendation_pending", {
          learnerName: result.learner.name,
          type: data.type,
        });

        broadcastToUser(app, result.parent.id, "recommendation:new", {
          type: data.type,
          data: { learnerId: data.learnerId, recommendationId: data.recommendationId },
        });

        // Send teacher insight email
        if (data.type === "TEACHER_INSIGHT" && data.teacherId) {
          const teacher = await getUserById(app, data.teacherId);
          if (teacher) {
            await emailService.sendTemplate("teacher_insight", result.parent.email, result.parent.id, {
              userName: result.parent.name,
              learnerName: result.learner.name,
              teacherName: teacher.name,
              insightText: "A teacher has shared an observation about your child's progress.",
              reviewUrl: `${config.APP_URL}/parent/${result.learner.id}/recommendations`,
            });
          }
        }
      } catch (err) {
        app.log.error({ err, data }, "Failed to process brain.recommendation.created");
      }
    });
  } catch { app.log.warn("Could not subscribe to brain.recommendation.created"); }

  // ─── brain.iep_goal.met → email + push + in-app ───────────────────────────
  try {
    await subscribeEvent(nc, "brain.iep_goal.met", BRAIN_SCHEMAS["brain.iep_goal.met"], async (data) => {
      try {
        const result = await getLearnerWithParent(app, data.learnerId);
        if (!result) return;

        await emailService.sendTemplate("iep_goal_met", result.parent.email, result.parent.id, {
          userName: result.parent.name,
          goalText: data.goalText,
          learnerName: result.learner.name,
          celebrationMsg: `This is a tremendous milestone in ${result.learner.name}'s learning journey!`,
          appUrl: config.APP_URL,
        });

        await pushService.sendToUser(result.parent.id, "iep_goal_met", {
          learnerName: result.learner.name,
          goalText: data.goalText,
        });

        await notificationService.create({
          userId: result.parent.id,
          type: "iep_goal_met",
          title: "IEP Goal Achieved!",
          body: `${result.learner.name} met an IEP goal: ${data.goalText}`,
          actionUrl: `/parent/${result.learner.id}/iep`,
        });
      } catch (err) {
        app.log.error({ err, data }, "Failed to process brain.iep_goal.met");
      }
    });
  } catch { app.log.warn("Could not subscribe to brain.iep_goal.met"); }

  // ─── brain.functioning_level.changed → email ──────────────────────────────
  try {
    await subscribeEvent(nc, "brain.functioning_level.changed", BRAIN_SCHEMAS["brain.functioning_level.changed"], async (data) => {
      try {
        const result = await getLearnerWithParent(app, data.learnerId);
        if (!result) return;

        await emailService.sendTemplate("functioning_level_change", result.parent.email, result.parent.id, {
          userName: result.parent.name,
          previousLevel: data.previousLevel,
          newLevel: data.newLevel,
          learnerName: result.learner.name,
          appUrl: config.APP_URL,
        });
      } catch (err) {
        app.log.error({ err, data }, "Failed to process brain.functioning_level.changed");
      }
    });
  } catch { app.log.warn("Could not subscribe to brain.functioning_level.changed"); }

  // ─── brain.regression.detected → urgent push ──────────────────────────────
  try {
    await subscribeEvent(nc, "brain.regression.detected", BRAIN_SCHEMAS["brain.regression.detected"], async (data) => {
      try {
        const result = await getLearnerWithParent(app, data.learnerId);
        if (!result) return;

        await pushService.sendToUser(result.parent.id, "brain_regression", {
          learnerName: result.learner.name,
          domain: data.domain,
          dropPercent: data.dropPercent.toString(),
        });

        await notificationService.create({
          userId: result.parent.id,
          type: "brain_regression",
          title: "Attention needed",
          body: `${result.learner.name} may be experiencing regression in ${data.domain} (${data.dropPercent}% drop)`,
          actionUrl: `/parent/${result.learner.id}/brain`,
        });
      } catch (err) {
        app.log.error({ err, data }, "Failed to process brain.regression.detected");
      }
    });
  } catch { app.log.warn("Could not subscribe to brain.regression.detected"); }

  // ─── tutor.addon.activated → email ─────────────────────────────────────────
  try {
    await subscribeEvent(nc, "tutor.addon.activated", TUTOR_SCHEMAS["tutor.addon.activated"], async (data) => {
      try {
        const result = await getLearnerWithParent(app, data.learnerId);
        if (!result) return;

        await emailService.sendTemplate("tutor_activated", result.parent.email, result.parent.id, {
          userName: result.parent.name,
          tutorName: `AIVO ${data.subject} Tutor`,
          subject: data.subject,
          learnerName: result.learner.name,
          appUrl: config.APP_URL,
        });
      } catch (err) {
        app.log.error({ err, data }, "Failed to process tutor.addon.activated");
      }
    });
  } catch { app.log.warn("Could not subscribe to tutor.addon.activated"); }

  // ─── tutor.addon.deactivated → email ───────────────────────────────────────
  try {
    await subscribeEvent(nc, "tutor.addon.deactivated", TUTOR_SCHEMAS["tutor.addon.deactivated"], async (data) => {
      try {
        const result = await getLearnerWithParent(app, data.learnerId);
        if (!result) return;

        const gracePeriodEnd = new Date();
        gracePeriodEnd.setDate(gracePeriodEnd.getDate() + 7);

        await emailService.sendTemplate("tutor_deactivated", result.parent.email, result.parent.id, {
          userName: result.parent.name,
          tutorName: `AIVO ${data.sku.replace("ADDON_TUTOR_", "")} Tutor`,
          subject: data.sku.replace("ADDON_TUTOR_", "").toLowerCase(),
          learnerName: result.learner.name,
          gracePeriodEnd: gracePeriodEnd.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" }),
          appUrl: config.APP_URL,
        });
      } catch (err) {
        app.log.error({ err, data }, "Failed to process tutor.addon.deactivated");
      }
    });
  } catch { app.log.warn("Could not subscribe to tutor.addon.deactivated"); }

  // ─── homework.processed → email + push ─────────────────────────────────────
  try {
    await subscribeEvent(nc, "homework.processed", HOMEWORK_SCHEMAS["homework.processed"], async (data) => {
      try {
        const result = await getLearnerWithParent(app, data.learnerId);
        if (!result) return;

        await emailService.sendTemplate("homework_ready", result.parent.email, result.parent.id, {
          userName: result.parent.name,
          learnerName: result.learner.name,
          subject: "homework",
          problemCount: data.problemCount,
          startUrl: `${config.APP_URL}/learner/homework/${data.assignmentId}`,
        });

        await pushService.sendToUser(result.parent.id, "homework_ready", {
          learnerName: result.learner.name,
          subject: "homework",
        });
      } catch (err) {
        app.log.error({ err, data }, "Failed to process homework.processed");
      }
    });
  } catch { app.log.warn("Could not subscribe to homework.processed"); }

  // ─── engagement.badge.earned → email + in-app ─────────────────────────────
  try {
    await subscribeEvent(nc, "engagement.badge.earned", ENGAGEMENT_SCHEMAS["engagement.badge.earned"], async (data) => {
      try {
        const result = await getLearnerWithParent(app, data.learnerId);
        if (!result) return;

        await emailService.sendTemplate("badge_earned", result.parent.email, result.parent.id, {
          userName: result.parent.name,
          badgeName: data.badgeSlug.replace(/-/g, " "),
          badgeIcon: "",
          learnerName: result.learner.name,
          appUrl: config.APP_URL,
        });

        await notificationService.create({
          userId: result.parent.id,
          type: "badge_earned",
          title: "Badge earned!",
          body: `${result.learner.name} earned the "${data.badgeSlug.replace(/-/g, " ")}" badge`,
          actionUrl: `/parent/${result.learner.id}/badges`,
        });

        broadcastToUser(app, result.parent.id, "badge:earned", {
          type: "badge_earned",
          data: { learnerId: data.learnerId, badgeSlug: data.badgeSlug },
        });
      } catch (err) {
        app.log.error({ err, data }, "Failed to process engagement.badge.earned");
      }
    });
  } catch { app.log.warn("Could not subscribe to engagement.badge.earned"); }

  // ─── engagement.streak.broken → email + push ──────────────────────────────
  try {
    await subscribeEvent(nc, "engagement.streak.broken", ENGAGEMENT_SCHEMAS["engagement.streak.broken"], async (data) => {
      try {
        const result = await getLearnerWithParent(app, data.learnerId);
        if (!result) return;

        await emailService.sendTemplate("streak_broken", result.parent.email, result.parent.id, {
          userName: result.parent.name,
          previousStreak: data.previousStreak,
          learnerName: result.learner.name,
          resumeUrl: `${config.APP_URL}/learner`,
        });

        await pushService.sendToUser(result.parent.id, "streak_broken", {
          learnerName: result.learner.name,
          previousStreak: data.previousStreak.toString(),
        });

        broadcastToUser(app, result.parent.id, "streak:broken", {
          type: "streak_broken",
          data: { learnerId: data.learnerId, previousStreak: data.previousStreak },
        });
      } catch (err) {
        app.log.error({ err, data }, "Failed to process engagement.streak.broken");
      }
    });
  } catch { app.log.warn("Could not subscribe to engagement.streak.broken"); }

  // ─── engagement.level.up → in-app celebration ─────────────────────────────
  try {
    await subscribeEvent(nc, "engagement.level.up", ENGAGEMENT_SCHEMAS["engagement.level.up"], async (data) => {
      try {
        const result = await getLearnerWithParent(app, data.learnerId);
        if (!result) return;

        await notificationService.create({
          userId: result.parent.id,
          type: "level_up",
          title: "Level up!",
          body: `${result.learner.name} reached level ${data.newLevel}!`,
          actionUrl: `/parent/${result.learner.id}`,
        });

        broadcastToUser(app, result.parent.id, "level:up", {
          type: "level_up",
          data: { learnerId: data.learnerId, newLevel: data.newLevel },
        });
      } catch (err) {
        app.log.error({ err, data }, "Failed to process engagement.level.up");
      }
    });
  } catch { app.log.warn("Could not subscribe to engagement.level.up"); }

  // ─── billing.subscription.created → email ──────────────────────────────────
  try {
    await subscribeEvent(nc, "billing.subscription.created", BILLING_SCHEMAS["billing.subscription.created"], async (data) => {
      try {
        const tenantUsers = await app.db.select().from(users).where(eq(users.tenantId, data.tenantId)).limit(1);
        const owner = tenantUsers[0];
        if (!owner) return;

        await emailService.sendTemplate("subscription_confirmation", owner.email, owner.id, {
          userName: owner.name,
          planName: data.planId,
          price: "See invoice for details",
          nextBillingDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" }),
          appUrl: config.APP_URL,
        });
      } catch (err) {
        app.log.error({ err, data }, "Failed to process billing.subscription.created");
      }
    });
  } catch { app.log.warn("Could not subscribe to billing.subscription.created"); }

  // ─── billing.payment.succeeded → invoice receipt email ─────────────────────
  try {
    await subscribeEvent(nc, "billing.payment.succeeded", BILLING_SCHEMAS["billing.payment.succeeded"], async (data) => {
      try {
        const tenantUsers = await app.db.select().from(users).where(eq(users.tenantId, data.tenantId)).limit(1);
        const owner = tenantUsers[0];
        if (!owner) return;

        await emailService.sendTemplate("invoice_receipt", owner.email, owner.id, {
          userName: owner.name,
          amount: `$${(data.amount / 100).toFixed(2)}`,
          invoiceId: data.invoiceId,
          date: new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" }),
          downloadUrl: `${config.APP_URL}/billing/invoices/${data.invoiceId}`,
        });
      } catch (err) {
        app.log.error({ err, data }, "Failed to process billing.payment.succeeded");
      }
    });
  } catch { app.log.warn("Could not subscribe to billing.payment.succeeded"); }

  // ─── billing.payment.failed → dunning email ───────────────────────────────
  try {
    await subscribeEvent(nc, "billing.payment.failed", BILLING_SCHEMAS["billing.payment.failed"], async (data) => {
      try {
        const tenantUsers = await app.db.select().from(users).where(eq(users.tenantId, data.tenantId)).limit(1);
        const owner = tenantUsers[0];
        if (!owner) return;

        const retryDate = new Date(data.retryAt);
        const now = new Date();
        const daysSinceFailure = Math.floor((now.getTime() - retryDate.getTime()) / (1000 * 60 * 60 * 24));

        if (daysSinceFailure >= 14) {
          // Final dunning — suspend notice
          await emailService.sendTemplate("dunning_suspend", owner.email, owner.id, {
            userName: owner.name,
            reactivateUrl: `${config.APP_URL}/billing/manage`,
          });
        } else {
          // Retry dunning
          await emailService.sendTemplate("dunning_retry", owner.email, owner.id, {
            userName: owner.name,
            retryDate: retryDate.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" }),
            updatePaymentUrl: `${config.APP_URL}/billing/manage`,
          });
        }
      } catch (err) {
        app.log.error({ err, data }, "Failed to process billing.payment.failed");
      }
    });
  } catch { app.log.warn("Could not subscribe to billing.payment.failed"); }

  // ─── comms.email.send → generic email send ─────────────────────────────────
  try {
    await subscribeEvent(nc, "comms.email.send", COMMS_SCHEMAS["comms.email.send"], async (data) => {
      try {
        const { subject, html } = (await import("../email/renderer.js")).renderTemplate(
          data.templateSlug as any,
          data.templateData as any,
        );
        await app.email.send({
          to: data.recipientEmail,
          subject,
          html,
          tags: data.tags,
        });
      } catch (err) {
        app.log.error({ err, data }, "Failed to process comms.email.send");
      }
    });
  } catch { app.log.warn("Could not subscribe to comms.email.send"); }

  // ─── comms.push.send → generic push send ───────────────────────────────────
  try {
    await subscribeEvent(nc, "comms.push.send", COMMS_SCHEMAS["comms.push.send"], async (data) => {
      try {
        await pushService.sendToUser(data.userId, "recommendation_pending", {
          title: data.title,
          body: data.body,
          ...Object.fromEntries(Object.entries(data.data).map(([k, v]) => [k, String(v)])),
        });
      } catch (err) {
        app.log.error({ err, data }, "Failed to process comms.push.send");
      }
    });
  } catch { app.log.warn("Could not subscribe to comms.push.send"); }

  // ─── comms.notification.created → create in-app notification ───────────────
  try {
    await subscribeEvent(nc, "comms.notification.created", COMMS_SCHEMAS["comms.notification.created"], async (data) => {
      try {
        await notificationService.create({
          userId: data.userId,
          type: data.type,
          title: data.title,
          body: data.body,
          actionUrl: data.actionUrl,
        });
      } catch (err) {
        app.log.error({ err, data }, "Failed to process comms.notification.created");
      }
    });
  } catch { app.log.warn("Could not subscribe to comms.notification.created"); }

  // ─── billing.subscription.grace.started → grace period email ─────────────
  try {
    await subscribeEvent(nc, "billing.subscription.grace.started", BILLING_SCHEMAS["billing.subscription.grace.started"], async (data) => {
      try {
        const tenantUsers = await app.db.select().from(users).where(eq(users.tenantId, data.tenantId)).limit(1);
        const owner = tenantUsers[0];
        if (!owner) return;

        const endsAt = data.gracePeriodEndsAt
          ? new Date(data.gracePeriodEndsAt).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })
          : "30 days from now";

        await emailService.sendTemplate("grace_period_started", owner.email, owner.id, {
          userName: owner.name,
          gracePeriodEndsAt: endsAt,
          exportUrl: `${config.APP_URL}/parent/settings`,
          resubscribeUrl: `${config.APP_URL}/billing/manage`,
        });
      } catch (err) {
        app.log.error({ err, data }, "Failed to process billing.subscription.grace.started");
      }
    });
  } catch { app.log.warn("Could not subscribe to billing.subscription.grace.started"); }

  // ─── billing.subscription.grace.warning_7day → warning email ──────────────
  try {
    await subscribeEvent(nc, "billing.subscription.grace.warning_7day", BILLING_SCHEMAS["billing.subscription.grace.warning_7day"], async (data) => {
      try {
        const tenantUsers = await app.db.select().from(users).where(eq(users.tenantId, data.tenantId)).limit(1);
        const owner = tenantUsers[0];
        if (!owner) return;

        const endsAt = data.gracePeriodEndsAt
          ? new Date(data.gracePeriodEndsAt).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })
          : "7 days";

        const daysRemaining = data.gracePeriodEndsAt
          ? Math.ceil((new Date(data.gracePeriodEndsAt).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
          : 7;

        await emailService.sendTemplate("grace_period_warning", owner.email, owner.id, {
          userName: owner.name,
          gracePeriodEndsAt: endsAt,
          daysRemaining,
          exportUrl: `${config.APP_URL}/parent/settings`,
          resubscribeUrl: `${config.APP_URL}/billing/manage`,
        });
      } catch (err) {
        app.log.error({ err, data }, "Failed to process billing.subscription.grace.warning_7day");
      }
    });
  } catch { app.log.warn("Could not subscribe to billing.subscription.grace.warning_7day"); }

  // ─── brain.export.completed → export ready email ──────────────────────────
  try {
    await subscribeEvent(nc, "brain.export.completed", BRAIN_SCHEMAS["brain.export.completed"], async (data) => {
      try {
        const result = await getLearnerWithParent(app, data.learnerId);
        if (!result) return;

        await emailService.sendTemplate("export_ready", result.parent.email, result.parent.id, {
          userName: result.parent.name,
          learnerName: result.learner.name,
          downloadUrl: data.downloadUrl,
          expiresAt: data.expiresAt
            ? new Date(data.expiresAt).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric", hour: "numeric" })
            : "72 hours",
        });
      } catch (err) {
        app.log.error({ err, data }, "Failed to process brain.export.completed");
      }
    });
  } catch { app.log.warn("Could not subscribe to brain.export.completed"); }

  app.log.info("Comms-svc NATS subscribers set up (25+ event handlers)");
}
