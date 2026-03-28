import type { FastifyInstance } from "fastify";
import fp from "fastify-plugin";
import { connect, type NatsConnection } from "nats";
import { getConfig } from "../config.js";

declare module "fastify" {
  interface FastifyInstance {
    nats: NatsConnection;
  }
}

export default fp(async (fastify: FastifyInstance) => {
  const config = getConfig();
  const nc = await connect({ servers: config.NATS_URL });

  fastify.decorate("nats", nc);

  fastify.addHook("onClose", async () => {
    await nc.drain();
  });
});
