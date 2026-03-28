import type { FastifyInstance } from "fastify";
import fp from "fastify-plugin";
import { connect, type NatsConnection, StringCodec } from "nats";
import { getConfig } from "../config.js";

declare module "fastify" {
  interface FastifyInstance {
    nats: NatsConnection;
  }
}

export default fp(async (fastify: FastifyInstance) => {
  const config = getConfig();
  const nc = await connect({ servers: config.NATS_URL });
  const sc = StringCodec();

  fastify.decorate("nats", nc);

  const sub = nc.subscribe("i18n.*");
  (async () => {
    for await (const msg of sub) {
      const subject = msg.subject;
      const data = sc.decode(msg.data);
      fastify.log.info({ subject, data }, "Received NATS message");

      if (subject === "i18n.cache.invalidate") {
        fastify.log.info("Translation cache invalidation requested");
      }
    }
  })();

  fastify.addHook("onClose", async () => {
    sub.unsubscribe();
    await nc.drain();
  });
});
