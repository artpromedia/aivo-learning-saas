import type { FastifyInstance } from "fastify";
import { eq } from "drizzle-orm";
import { translations, translationNamespaces } from "@aivo/db";

export async function importRoutes(app: FastifyInstance) {
  app.post<{ Params: { locale: string } }>(
    "/i18n/import/:locale",
    async (request, reply) => {
      const { locale } = request.params;

      let data: Record<string, unknown>;

      const contentType = request.headers["content-type"] ?? "";
      if (contentType.includes("multipart")) {
        const file = await request.file();
        if (!file) {
          return reply.status(400).send({ error: "No file provided" });
        }
        const buffer = await file.toBuffer();
        data = JSON.parse(buffer.toString("utf-8"));
      } else {
        data = request.body as Record<string, unknown>;
      }

      // Detect ARB format (has @@locale key)
      const isArb = "@@locale" in data;

      let imported = 0;

      if (isArb) {
        // ARB format: flat keys like "namespace_key"
        const allNamespaces = await app.db
          .select()
          .from(translationNamespaces);
        const nsMap = new Map(allNamespaces.map((ns) => [ns.key, ns.id]));

        const values: Array<{
          namespaceId: string;
          localeCode: string;
          key: string;
          value: string;
          updatedAt: Date;
        }> = [];

        for (const [arbKey, value] of Object.entries(data)) {
          if (arbKey.startsWith("@@") || arbKey.startsWith("@") || typeof value !== "string") {
            continue;
          }

          // Find the longest matching namespace prefix
          let matchedNs: string | null = null;
          let matchedKey: string | null = null;

          for (const nsKey of nsMap.keys()) {
            if (arbKey.startsWith(`${nsKey}_`)) {
              if (!matchedNs || nsKey.length > matchedNs.length) {
                matchedNs = nsKey;
                matchedKey = arbKey.slice(nsKey.length + 1).replace(/_/g, ".");
              }
            }
          }

          if (matchedNs && matchedKey) {
            values.push({
              namespaceId: nsMap.get(matchedNs)!,
              localeCode: locale,
              key: matchedKey,
              value,
              updatedAt: new Date(),
            });
          }
        }

        if (values.length > 0) {
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
          imported = values.length;
        }
      } else {
        // JSON format: nested by namespace { "common": { "key": "value" } }
        // or flat { "key": "value" } (assigned to "common" namespace)
        const allNamespaces = await app.db
          .select()
          .from(translationNamespaces);
        const nsMap = new Map(allNamespaces.map((ns) => [ns.key, ns.id]));

        const values: Array<{
          namespaceId: string;
          localeCode: string;
          key: string;
          value: string;
          updatedAt: Date;
        }> = [];

        for (const [nsKeyOrKey, valueOrNested] of Object.entries(data)) {
          if (typeof valueOrNested === "object" && valueOrNested !== null) {
            // Nested format
            const nsId = nsMap.get(nsKeyOrKey);
            if (!nsId) continue;

            for (const [key, value] of Object.entries(valueOrNested as Record<string, string>)) {
              if (typeof value === "string") {
                values.push({
                  namespaceId: nsId,
                  localeCode: locale,
                  key,
                  value,
                  updatedAt: new Date(),
                });
              }
            }
          } else if (typeof valueOrNested === "string") {
            // Flat format, assign to "common" namespace
            const commonId = nsMap.get("common");
            if (commonId) {
              values.push({
                namespaceId: commonId,
                localeCode: locale,
                key: nsKeyOrKey,
                value: valueOrNested,
                updatedAt: new Date(),
              });
            }
          }
        }

        if (values.length > 0) {
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
          imported = values.length;
        }
      }

      return reply.send({ imported, locale });
    },
  );
}
