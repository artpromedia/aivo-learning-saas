import type { FastifyInstance } from "fastify";
import NodeCache from "node-cache";
import { PLANS, getPlanById, type PlanDefinition } from "../data/plans.js";

const cache = new NodeCache({ stdTTL: 300 }); // 5 minutes

const CACHE_KEY_ALL = "plans:all";
const CACHE_KEY_PREFIX = "plans:";

export class PlanService {
  constructor(private app: FastifyInstance) {}

  listPlans(): PlanDefinition[] {
    const cached = cache.get<PlanDefinition[]>(CACHE_KEY_ALL);
    if (cached) return cached;

    cache.set(CACHE_KEY_ALL, PLANS);
    return PLANS;
  }

  getPlan(planId: string): PlanDefinition | undefined {
    const cacheKey = `${CACHE_KEY_PREFIX}${planId}`;
    const cached = cache.get<PlanDefinition>(cacheKey);
    if (cached) return cached;

    const plan = getPlanById(planId);
    if (plan) {
      cache.set(cacheKey, plan);
    }
    return plan;
  }

  clearCache(): void {
    cache.flushAll();
  }
}
