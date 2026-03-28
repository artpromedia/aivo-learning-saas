import type { FastifyInstance } from "fastify";
import { z } from "zod";
import { eq } from "drizzle-orm";
import { locales } from "@aivo/db";

const createLocaleSchema = z.object({
  code: z.string().min(2).max(10),
  name: z.string().min(1).max(128),
  nativeName: z.string().min(1).max(128),
  direction: z.enum(["LTR", "RTL"]).default("LTR"),
  isDefault: z.boolean().default(false),
  isEnabled: z.boolean().default(true),
});

const patchLocaleSchema = z.object({
  name: z.string().min(1).max(128).optional(),
  nativeName: z.string().min(1).max(128).optional(),
  direction: z.enum(["LTR", "RTL"]).optional(),
  isDefault: z.boolean().optional(),
  isEnabled: z.boolean().optional(),
});

export async function localeRoutes(app: FastifyInstance) {
  app.get("/i18n/locales", async (_request, reply) => {
    const rows = await app.db
      .select()
      .from(locales)
      .where(eq(locales.isEnabled, true))
      .orderBy(locales.code);

    return reply.send(rows);
  });

  app.post("/i18n/locales", async (request, reply) => {
    const body = createLocaleSchema.parse(request.body);

    if (body.isDefault) {
      await app.db
        .update(locales)
        .set({ isDefault: false })
        .where(eq(locales.isDefault, true));
    }

    const [row] = await app.db
      .insert(locales)
      .values(body)
      .returning();

    return reply.status(201).send(row);
  });

  app.patch<{ Params: { code: string } }>("/i18n/locales/:code", async (request, reply) => {
    const { code } = request.params;
    const body = patchLocaleSchema.parse(request.body);

    if (body.isDefault) {
      await app.db
        .update(locales)
        .set({ isDefault: false })
        .where(eq(locales.isDefault, true));
    }

    const [row] = await app.db
      .update(locales)
      .set(body)
      .where(eq(locales.code, code))
      .returning();

    if (!row) {
      return reply.status(404).send({ error: "Locale not found" });
    }

    return reply.send(row);
  });

  app.delete<{ Params: { code: string } }>("/i18n/locales/:code", async (request, reply) => {
    const { code } = request.params;

    const existing = await app.db
      .select()
      .from(locales)
      .where(eq(locales.code, code))
      .limit(1);

    if (!existing.length) {
      return reply.status(404).send({ error: "Locale not found" });
    }

    if (existing[0].isDefault) {
      return reply.status(400).send({ error: "Cannot delete the default locale" });
    }

    await app.db.delete(locales).where(eq(locales.code, code));

    return reply.status(204).send();
  });
}
