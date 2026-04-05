import type { FastifyRequest, FastifyReply } from "fastify";
import { eq, and } from "drizzle-orm";
import { tutorSubscriptions } from "@aivo/db";

const BUNDLE_SKU = "ADDON_TUTOR_BUNDLE";

/**
 * Maps a subject or SKU string to the corresponding tutor SKU.
 * Accepts either the full SKU (e.g. "ADDON_TUTOR_MATH") or a
 * short subject name (e.g. "MATH", "math").
 */
function normalizeToSku(subjectOrSku: string): string {
  const upper = subjectOrSku.toUpperCase();
  if (upper.startsWith("ADDON_TUTOR_")) {
    return upper;
  }
  return `ADDON_TUTOR_${upper}`;
}

export function subscriptionGuard(subjectOrSku: string) {
  const requiredSku = normalizeToSku(subjectOrSku);

  return async function (request: FastifyRequest, reply: FastifyReply): Promise<void> {
    const learnerId =
      (request.body as Record<string, unknown> | undefined)?.learnerId as string | undefined ??
      (request.params as Record<string, unknown> | undefined)?.learnerId as string | undefined;

    if (!learnerId) {
      return reply.status(400).send({ error: "learnerId is required" });
    }

    const activeSubs = await request.server.db
      .select({ sku: tutorSubscriptions.sku })
      .from(tutorSubscriptions)
      .where(
        and(
          eq(tutorSubscriptions.learnerId, learnerId),
          eq(tutorSubscriptions.status, "ACTIVE"),
        ),
      );

    const skus = activeSubs.map((s) => s.sku);

    if (skus.includes(BUNDLE_SKU as typeof skus[number]) || skus.includes(requiredSku as typeof skus[number])) {
      return;
    }

    return reply.status(403).send({
      error: "Tutor subscription required for this subject",
      locked: true,
      requiredSku,
    });
  };
}
