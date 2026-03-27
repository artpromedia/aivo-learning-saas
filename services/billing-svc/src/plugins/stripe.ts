import type { FastifyInstance } from "fastify";
import fp from "fastify-plugin";
import Stripe from "stripe";
import { getConfig } from "../config.js";

declare module "fastify" {
  interface FastifyInstance {
    stripe: Stripe | null;
  }
}

export default fp(async (fastify: FastifyInstance) => {
  const config = getConfig();

  if (!config.STRIPE_SECRET_KEY) {
    fastify.log.warn("STRIPE_SECRET_KEY is not set — Stripe client disabled (dev mode)");
    fastify.decorate("stripe", null);
    return;
  }

  const stripe = new Stripe(config.STRIPE_SECRET_KEY, {
    apiVersion: "2024-12-18.acacia",
  });

  fastify.decorate("stripe", stripe);
});
