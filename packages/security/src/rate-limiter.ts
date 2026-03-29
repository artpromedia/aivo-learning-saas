import type { FastifyInstance, FastifyRequest } from "fastify";
import fp from "fastify-plugin";

export interface RateLimitTier {
  max: number;
  timeWindow: string;
  keyGenerator?: (request: FastifyRequest) => string;
}

export const RATE_LIMIT_TIERS = {
  auth: { max: 10, timeWindow: "1 minute" } as RateLimitTier,
  api: { max: 100, timeWindow: "1 minute" } as RateLimitTier,
  publicLead: { max: 5, timeWindow: "1 minute" } as RateLimitTier,
  admin: { max: 200, timeWindow: "1 minute" } as RateLimitTier,
  llm: { max: 30, timeWindow: "1 minute" } as RateLimitTier,
};

async function rateLimiterConfig(app: FastifyInstance) {
  app.log.info("Rate limiter tiers configured");
}

export const rateLimiterPlugin = fp(rateLimiterConfig, {
  name: "rate-limiter-config",
});
