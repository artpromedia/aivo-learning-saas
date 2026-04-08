import type { FastifyInstance } from "fastify";
import { z } from "zod";
import { authenticate } from "../../middleware/authenticate.js";
import { SubscriptionService } from "../../services/subscription.service.js";
import { StripeService } from "../../services/stripe.service.js";

const querySchema = z.object({
  session_id: z.string().min(1),
});

export async function verifyCheckoutRoute(app: FastifyInstance) {
  app.get("/billing/verify-checkout", { preHandler: [authenticate] }, async (request, reply) => {
    const { session_id } = querySchema.parse(request.query);

    // Demo mode: fake session IDs are always treated as successful
    if (session_id.startsWith("fake_sess_")) {
      return reply.status(200).send({ verified: true, status: "complete" });
    }

    // Verify with Stripe that the session is complete
    const stripe = app.stripe;
    if (!stripe) {
      return reply.status(200).send({ verified: true, status: "complete" });
    }

    try {
      const session = await stripe.checkout.sessions.retrieve(session_id);

      if (session.status !== "complete") {
        return reply.status(400).send({
          verified: false,
          error: "Checkout session is not complete",
          status: session.status,
        });
      }

      return reply.status(200).send({
        verified: true,
        status: "complete",
        planId: session.metadata?.planId ?? null,
      });
    } catch {
      return reply.status(400).send({ verified: false, error: "Invalid checkout session" });
    }
  });
}
