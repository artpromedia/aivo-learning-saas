import type { Redis } from "ioredis";
import type { NatsConnection } from "nats";
import type { FastifyInstance } from "fastify";
import fp from "fastify-plugin";
import { FeatureFlagClient, type FeatureFlagClientOptions } from "./client.js";

declare module "fastify" {
  interface FastifyInstance {
    featureFlags: FeatureFlagClient;
    redis: Redis;
    nats: NatsConnection;
  }
}

export interface FeatureFlagPluginOptions {
  serviceName: string;
}

export const featureFlagPlugin = fp(
  async (app: FastifyInstance, opts: FeatureFlagPluginOptions) => {
    const clientOptions: FeatureFlagClientOptions = {
      redis: app.redis,
      nats: app.nats,
      serviceName: opts.serviceName,
    };

    const client = new FeatureFlagClient(clientOptions);
    client.startListening();

    app.decorate("featureFlags", client);

    app.addHook("onClose", async () => {
      client.stopListening();
    });
  },
);

export default featureFlagPlugin;
