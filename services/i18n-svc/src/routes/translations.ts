import type { FastifyInstance } from "fastify";
import { z } from "zod";
import { eq, and } from "drizzle-orm";
import { translations, translationNamespaces } from "@aivo/db";

const upsertBodySchema = z.record(z.string(), z.string());

const singleTranslationSchema = z.object({
  value: z.string(),
  isVerified: z.boolean().optional(),
});

export async function translationRoutes(app: FastifyInstance) {
  app.get<{ Params: { locale: string; namespace: string } }>(
    "/i18n/translations/:locale/:namespace",
    async (request, reply) => {
      const { locale, namespace } = request.params;

      const ns = await app.db
        .select()
        .from(translationNamespaces)
        .where(eq(translationNamespaces.key, namespace))
        .limit(1);

      if (!ns.length) {
        return reply.status(404).send({ error: "Namespace not found" });
      }

      const rows = await app.db
        .select({ key: translations.key, value: translations.value })
        .from(translations)
        .where(
          and(
            eq(translations.localeCode, locale),
            eq(translations.namespaceId, ns[0].id),
          ),
        );

      const result: Record<string, string> = {};
      for (const row of rows) {
        result[row.key] = row.value;
      }

      return reply.send(result);
    },
  );

  app.get<{ Params: { locale: string } }>(
    "/i18n/translations/:locale",
    async (request, reply) => {
      const { locale } = request.params;

      const rows = await app.db
        .select({
          nsKey: translationNamespaces.key,
          key: translations.key,
          value: translations.value,
        })
        .from(translations)
        .innerJoin(
          translationNamespaces,
          eq(translations.namespaceId, translationNamespaces.id),
        )
        .where(eq(translations.localeCode, locale));

      const result: Record<string, string> = {};
      for (const row of rows) {
        result[`${row.nsKey}.${row.key}`] = row.value;
      }

      return reply.send(result);
    },
  );

  app.put<{ Params: { locale: string; namespace: string } }>(
    "/i18n/translations/:locale/:namespace",
    async (request, reply) => {
      const { locale, namespace } = request.params;
      const body = upsertBodySchema.parse(request.body);

      const ns = await app.db
        .select()
        .from(translationNamespaces)
        .where(eq(translationNamespaces.key, namespace))
        .limit(1);

      if (!ns.length) {
        return reply.status(404).send({ error: "Namespace not found" });
      }

      const entries = Object.entries(body);
      if (!entries.length) {
        return reply.status(400).send({ error: "No translations provided" });
      }

      const values = entries.map(([key, value]) => ({
        namespaceId: ns[0].id,
        localeCode: locale,
        key,
        value,
        updatedAt: new Date(),
      }));

      await app.db
        .insert(translations)
        .values(values)
        .onConflictDoUpdate({
          target: [translations.namespaceId, translations.localeCode, translations.key],
          set: {
            value: translations.value,
            updatedAt: new Date(),
          },
        });

      return reply.send({ upserted: entries.length });
    },
  );

  app.post<{ Params: { locale: string; namespace: string; key: string } }>(
    "/i18n/translations/:locale/:namespace/:key",
    async (request, reply) => {
      const { locale, namespace, key } = request.params;
      const body = singleTranslationSchema.parse(request.body);

      const ns = await app.db
        .select()
        .from(translationNamespaces)
        .where(eq(translationNamespaces.key, namespace))
        .limit(1);

      if (!ns.length) {
        return reply.status(404).send({ error: "Namespace not found" });
      }

      const [row] = await app.db
        .insert(translations)
        .values({
          namespaceId: ns[0].id,
          localeCode: locale,
          key,
          value: body.value,
          isVerified: body.isVerified ?? false,
          updatedAt: new Date(),
        })
        .onConflictDoUpdate({
          target: [translations.namespaceId, translations.localeCode, translations.key],
          set: {
            value: body.value,
            isVerified: body.isVerified ?? false,
            updatedAt: new Date(),
          },
        })
        .returning();

      return reply.status(201).send(row);
    },
  );

  app.delete<{ Params: { locale: string; namespace: string; key: string } }>(
    "/i18n/translations/:locale/:namespace/:key",
    async (request, reply) => {
      const { locale, namespace, key } = request.params;

      const ns = await app.db
        .select()
        .from(translationNamespaces)
        .where(eq(translationNamespaces.key, namespace))
        .limit(1);

      if (!ns.length) {
        return reply.status(404).send({ error: "Namespace not found" });
      }

      const deleted = await app.db
        .delete(translations)
        .where(
          and(
            eq(translations.namespaceId, ns[0].id),
            eq(translations.localeCode, locale),
            eq(translations.key, key),
          ),
        )
        .returning();

      if (!deleted.length) {
        return reply.status(404).send({ error: "Translation not found" });
      }

      return reply.status(204).send();
    },
  );
}
