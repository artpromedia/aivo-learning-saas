import type { FastifyInstance } from "fastify";
import { z } from "zod";
import { eq } from "drizzle-orm";
import { statusSubscribers } from "@aivo/db";
import crypto from "node:crypto";

const subscribeSchema = z.object({
  email: z.string().email().max(320),
});

export async function subscriberRoutes(app: FastifyInstance) {
  app.post("/status/subscribers", async (request, reply) => {
    const { email } = subscribeSchema.parse(request.body);
    const unsubscribeToken = crypto.randomBytes(32).toString("hex");

    const [subscriber] = await app.db
      .insert(statusSubscribers)
      .values({
        email,
        unsubscribeToken,
        isVerified: true,
      })
      .onConflictDoNothing()
      .returning();

    if (!subscriber) {
      return reply.send({ message: "Already subscribed" });
    }

    return reply.status(201).send({
      message: "Subscribed to status notifications",
      subscriberId: subscriber.id,
    });
  });

  app.delete("/status/subscribers/:id", async (request, reply) => {
    const { id } = request.params as { id: string };
    const { token } = request.query as { token?: string };

    if (!token) {
      return reply.status(400).send({ error: "Unsubscribe token required" });
    }

    const [subscriber] = await app.db
      .select()
      .from(statusSubscribers)
      .where(eq(statusSubscribers.id, id))
      .limit(1);

    if (!subscriber || subscriber.unsubscribeToken !== token) {
      return reply.status(404).send({ error: "Subscriber not found" });
    }

    await app.db
      .delete(statusSubscribers)
      .where(eq(statusSubscribers.id, id));

    return reply.send({ message: "Unsubscribed successfully" });
  });
}
