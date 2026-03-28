import type { FastifyInstance } from "fastify";
import { seedTranslations } from "../seed.js";

export async function seedRoutes(app: FastifyInstance) {
  app.post("/i18n/seed", async (_request, reply) => {
    try {
      await seedTranslations(app.db as Parameters<typeof seedTranslations>[0]);
      return reply.send({ status: "ok", message: "Seed data applied successfully" });
    } catch (error) {
      app.log.error(error, "Failed to seed translations");
      return reply.status(500).send({ error: "Failed to seed translations" });
    }
  });
}
