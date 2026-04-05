import type { FastifyRequest, FastifyReply } from "fastify";
import type Stripe from "stripe";
import { getConfig } from "../config.js";

declare module "fastify" {
  interface FastifyRequest {
    stripeEvent: Stripe.Event;
    rawBody?: string;
  }
}

export async function stripeVerify(request: FastifyRequest, reply: FastifyReply): Promise<void> {
  const config = getConfig();
  const { stripe } = request.server;

  if (!stripe) {
    return reply.status(503).send({ error: "Stripe is not configured" });
  }

  const signature = request.headers["stripe-signature"];
  if (!signature) {
    return reply.status(400).send({ error: "Missing stripe-signature header" });
  }

  try {
    const event = stripe.webhooks.constructEvent(
      request.rawBody as string,
      signature as string,
      config.STRIPE_WEBHOOK_SECRET,
    );
    request.stripeEvent = event;
  } catch (err) {
    request.log.warn({ err }, "Stripe webhook signature verification failed");
    return reply.status(400).send({ error: "Webhook signature verification failed" });
  }
}
