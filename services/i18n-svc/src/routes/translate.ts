import type { FastifyInstance } from "fastify";
import { z } from "zod";
import { eq, and, inArray } from "drizzle-orm";
import { translations, translationNamespaces } from "@aivo/db";
import { getConfig } from "../config.js";

const translateBodySchema = z.object({
  sourceLocale: z.string().min(2).max(10),
  targetLocale: z.string().min(2).max(10),
  keys: z.array(z.string()).min(1).max(500),
});

export async function translateRoutes(app: FastifyInstance) {
  app.post("/i18n/translate", async (request, reply) => {
    const body = translateBodySchema.parse(request.body);
    const config = getConfig();

    // Fetch source translations for the requested keys
    // Keys are in format "namespace.key" or just "key" (defaults to "common")
    const keysByNamespace = new Map<string, string[]>();
    for (const fullKey of body.keys) {
      const dotIdx = fullKey.indexOf(".");
      const ns = dotIdx > 0 ? fullKey.slice(0, dotIdx) : "common";
      const key = dotIdx > 0 ? fullKey.slice(dotIdx + 1) : fullKey;
      if (!keysByNamespace.has(ns)) {
        keysByNamespace.set(ns, []);
      }
      keysByNamespace.get(ns)!.push(key);
    }

    // Resolve namespace IDs
    const nsKeys = [...keysByNamespace.keys()];
    const namespaces = await app.db
      .select()
      .from(translationNamespaces)
      .where(inArray(translationNamespaces.key, nsKeys));

    const nsMap = new Map(namespaces.map((ns) => [ns.key, ns.id]));

    // Fetch source translations
    const sourceTranslations: Record<string, string> = {};
    for (const [nsKey, keys] of keysByNamespace) {
      const nsId = nsMap.get(nsKey);
      if (!nsId) continue;

      const rows = await app.db
        .select({ key: translations.key, value: translations.value })
        .from(translations)
        .where(
          and(
            eq(translations.namespaceId, nsId),
            eq(translations.localeCode, body.sourceLocale),
            inArray(translations.key, keys),
          ),
        );

      for (const row of rows) {
        sourceTranslations[`${nsKey}.${row.key}`] = row.value;
      }
    }

    if (Object.keys(sourceTranslations).length === 0) {
      return reply.status(404).send({ error: "No source translations found for the specified keys" });
    }

    // Call ai-svc for LLM translation
    const prompt = buildTranslationPrompt(
      body.sourceLocale,
      body.targetLocale,
      sourceTranslations,
    );

    let translatedValues: Record<string, string>;
    try {
      const response = await fetch(`${config.AI_SVC_URL}/api/translate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-haiku-4-5-20251001",
          prompt,
          sourceLocale: body.sourceLocale,
          targetLocale: body.targetLocale,
          translations: sourceTranslations,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        app.log.error({ status: response.status, errorText }, "AI translation request failed");
        return reply.status(502).send({ error: "Translation service unavailable" });
      }

      const result = (await response.json()) as { translations: Record<string, string> };
      translatedValues = result.translations;
    } catch (err) {
      app.log.error(err, "Failed to call AI translation service");
      return reply.status(502).send({ error: "Translation service unavailable" });
    }

    // Save translated values as unverified
    const insertValues: Array<{
      namespaceId: string;
      localeCode: string;
      key: string;
      value: string;
      isVerified: boolean;
      updatedAt: Date;
    }> = [];

    for (const [fullKey, value] of Object.entries(translatedValues)) {
      const dotIdx = fullKey.indexOf(".");
      const nsKey = dotIdx > 0 ? fullKey.slice(0, dotIdx) : "common";
      const key = dotIdx > 0 ? fullKey.slice(dotIdx + 1) : fullKey;
      const nsId = nsMap.get(nsKey);
      if (!nsId) continue;

      insertValues.push({
        namespaceId: nsId,
        localeCode: body.targetLocale,
        key,
        value,
        isVerified: false,
        updatedAt: new Date(),
      });
    }

    if (insertValues.length > 0) {
      await app.db
        .insert(translations)
        .values(insertValues)
        .onConflictDoUpdate({
          target: [translations.namespaceId, translations.localeCode, translations.key],
          set: {
            value: translations.value,
            isVerified: false,
            updatedAt: new Date(),
          },
        });
    }

    return reply.send({
      translated: Object.keys(translatedValues).length,
      translations: translatedValues,
      isVerified: false,
    });
  });
}

function buildTranslationPrompt(
  sourceLocale: string,
  targetLocale: string,
  sourceTranslations: Record<string, string>,
): string {
  const entries = Object.entries(sourceTranslations)
    .map(([key, value]) => `  "${key}": "${value}"`)
    .join(",\n");

  return `You are a professional translator for a children's educational platform (AIVO Learning).
Translate the following UI strings from ${sourceLocale} to ${targetLocale}.

Rules:
- Preserve ICU MessageFormat syntax exactly (e.g., {count, plural, one {# item} other {# items}})
- Preserve all placeholder variables in curly braces (e.g., {name}, {count})
- Keep the translations natural and age-appropriate for children aged 3-18
- Maintain the same tone and formality level as the source
- Do not translate brand names like "AIVO"
- Return ONLY a valid JSON object with the same keys and translated values

Source translations (${sourceLocale}):
{
${entries}
}

Return the translations as a JSON object with the same keys.`;
}
