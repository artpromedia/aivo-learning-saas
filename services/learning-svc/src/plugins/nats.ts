import type { FastifyInstance } from "fastify";
import fp from "fastify-plugin";
import { connect, type NatsConnection } from "nats";
import { provisionStreams } from "@aivo/events";
import { getConfig } from "../config.js";

declare module "fastify" {
  interface FastifyInstance {
    nats: NatsConnection | null;
  }
}

export default fp(async (fastify: FastifyInstance) => {
  const config = getConfig();
  try {
    const nc = await connect({ servers: config.NATS_URL });
    await provisionStreams(nc);
    fastify.decorate("nats", nc);
    fastify.addHook("onClose", async () => {
      await nc.drain();
    });
  } catch {
    fastify.log.warn("NATS connection failed — running without event streaming");
    fastify.decorate("nats", null);
  }
});
