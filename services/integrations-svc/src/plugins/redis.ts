import type { FastifyInstance } from "fastify";
  import fp from "fastify-plugin";
  import Redis from "ioredis";
  import { getConfig } from "../config.js";

  declare module "fastify" {
    interface FastifyInstance {
      redis: Redis | null;
    }
  }

  export default fp(async (fastify: FastifyInstance) => {
    const config = getConfig();
    try {
      const redis = new Redis(config.REDIS_URL, {
        maxRetriesPerRequest: 3,
        lazyConnect: true,
        retryStrategy(times) {
          if (times > 3) return null;
          return Math.min(times * 200, 2000);
        },
      });

      redis.on("error", () => {});

      await redis.connect();

      fastify.decorate("redis", redis);
      fastify.addHook("onClose", async () => {
        await redis.quit().catch(() => {});
      });
    } catch {
      fastify.log.warn("Redis connection failed — running without cache");
      fastify.decorate("redis", null);
    }
  });
  