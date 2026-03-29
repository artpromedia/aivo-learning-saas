import type { FastifyInstance } from "fastify";
import { z } from "zod";
import { newsletterSubscribers } from "@aivo/db";
import { eq } from "drizzle-orm";

const subscribeSchema = z.object({
  email: z.string().email().max(320),
});

export async function newsletterSubscribeRoute(app: FastifyInstance): Promise<void> {
  app.post("/comms/newsletter/subscribe", async (request, reply) => {
    const { email } = subscribeSchema.parse(request.body);
    const normalised = email.toLowerCase().trim();

    // Upsert: if already subscribed, clear any previous unsubscribe
    const existing = await app.db
      .select({ id: newsletterSubscribers.id })
      .from(newsletterSubscribers)
      .where(eq(newsletterSubscribers.email, normalised))
      .limit(1);

    if (existing.length > 0) {
      await app.db
        .update(newsletterSubscribers)
        .set({ unsubscribedAt: null, subscribedAt: new Date() })
        .where(eq(newsletterSubscribers.email, normalised));
    } else {
      await app.db
        .insert(newsletterSubscribers)
        .values({ email: normalised });
    }

    return reply.status(201).send({ success: true });
  });
}
