import type { FastifyInstance } from "fastify";
import { eq, sql, count } from "drizzle-orm";
import {
  translations,
  translationNamespaces,
  translationExports,
  locales,
} from "@aivo/db";

export async function exportRoutes(app: FastifyInstance) {
  app.get<{ Params: { locale: string }; Querystring: { format?: string } }>(
    "/i18n/export/:locale",
    async (request, reply) => {
      const { locale } = request.params;
      const format = (request.query.format ?? "json").toUpperCase();

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

      if (format === "ARB") {
        const arb: Record<string, string> = {
          "@@locale": locale,
        };
        for (const row of rows) {
          const arbKey = `${row.nsKey}_${row.key}`.replace(/\./g, "_");
          arb[arbKey] = row.value;
        }

        await app.db.insert(translationExports).values({
          localeCode: locale,
          format: "ARB",
        });

        reply.header("content-type", "application/json");
        reply.header(
          "content-disposition",
          `attachment; filename="app_${locale}.arb"`,
        );
        return reply.send(arb);
      }

      // Default: JSON format (nested by namespace)
      const json: Record<string, Record<string, string>> = {};
      for (const row of rows) {
        if (!json[row.nsKey]) {
          json[row.nsKey] = {};
        }
        json[row.nsKey][row.key] = row.value;
      }

      await app.db.insert(translationExports).values({
        localeCode: locale,
        format: "JSON",
      });

      reply.header("content-type", "application/json");
      reply.header(
        "content-disposition",
        `attachment; filename="${locale}.json"`,
      );
      return reply.send(json);
    },
  );

  app.get("/i18n/export/coverage", async (_request, reply) => {
    const allLocales = await app.db
      .select({ code: locales.code, name: locales.name })
      .from(locales)
      .where(eq(locales.isEnabled, true));

    const allNamespaces = await app.db
      .select({ id: translationNamespaces.id, key: translationNamespaces.key })
      .from(translationNamespaces);

    // Get total keys from the default locale (en) per namespace
    const defaultLocale = await app.db
      .select()
      .from(locales)
      .where(eq(locales.isDefault, true))
      .limit(1);

    const defaultCode = defaultLocale[0]?.code ?? "en";

    const totalKeysByNamespace = await app.db
      .select({
        namespaceId: translations.namespaceId,
        count: count(),
      })
      .from(translations)
      .where(eq(translations.localeCode, defaultCode))
      .groupBy(translations.namespaceId);

    const totalMap = new Map(
      totalKeysByNamespace.map((r) => [r.namespaceId, r.count]),
    );

    // Get per-locale per-namespace counts
    const perLocale = await app.db
      .select({
        localeCode: translations.localeCode,
        namespaceId: translations.namespaceId,
        count: count(),
      })
      .from(translations)
      .groupBy(translations.localeCode, translations.namespaceId);

    const coverageMap = new Map<string, Map<string, number>>();
    for (const row of perLocale) {
      if (!coverageMap.has(row.localeCode)) {
        coverageMap.set(row.localeCode, new Map());
      }
      coverageMap.get(row.localeCode)!.set(row.namespaceId, row.count);
    }

    const nsIdToKey = new Map(allNamespaces.map((ns) => [ns.id, ns.key]));

    const coverage = allLocales.map((locale) => {
      const localeNsCounts = coverageMap.get(locale.code) ?? new Map();
      let totalTranslated = 0;
      let totalKeys = 0;

      const namespaces: Record<string, { translated: number; total: number; percentage: number }> = {};

      for (const ns of allNamespaces) {
        const total = totalMap.get(ns.id) ?? 0;
        const translated = localeNsCounts.get(ns.id) ?? 0;
        totalTranslated += translated;
        totalKeys += total;

        namespaces[ns.key] = {
          translated,
          total,
          percentage: total > 0 ? Math.round((translated / total) * 100) : 0,
        };
      }

      return {
        locale: locale.code,
        name: locale.name,
        overall: totalKeys > 0 ? Math.round((totalTranslated / totalKeys) * 100) : 0,
        totalTranslated,
        totalKeys,
        namespaces,
      };
    });

    return reply.send({ coverage });
  });
}
