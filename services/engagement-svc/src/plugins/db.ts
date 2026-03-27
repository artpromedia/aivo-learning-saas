import type { FastifyInstance } from "fastify";
import fp from "fastify-plugin";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "@aivo/db";
import { getConfig } from "../config.js";

declare module "fastify" {
  interface FastifyInstance {
    db: ReturnType<typeof drizzle<typeof schema>>;
  }
}

export default fp(async (fastify: FastifyInstance) => {
  const config = getConfig();
  const client = postgres(config.DATABASE_URL);
  const db = drizzle(client, { schema });

  fastify.decorate("db", db);

  fastify.addHook("onClose", async () => {
    await client.end();
  });
});
