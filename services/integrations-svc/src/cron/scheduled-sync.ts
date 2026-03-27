import cron from "node-cron";
import type { FastifyInstance } from "fastify";
import { sisConnections } from "@aivo/db";
import { eq } from "drizzle-orm";
import { CleverSync } from "../sync/clever-sync.js";
import { ClassLinkSync } from "../sync/classlink-sync.js";
import { OneRosterSync } from "../sync/oneroster-sync.js";

export function startScheduledSyncCron(app: FastifyInstance) {
  // Daily SIS sync at 2am
  cron.schedule("0 2 * * *", async () => {
    try {
      app.log.info("Running scheduled SIS sync for all connected districts");

      const connections = await app.db
        .select()
        .from(sisConnections)
        .where(eq(sisConnections.enabled, true));

      for (const connection of connections) {
        try {
          if (!connection.accessToken && connection.provider !== "ONEROSTER") continue;

          switch (connection.provider) {
            case "CLEVER": {
              const sync = new CleverSync(app);
              if (connection.lastSyncAt) {
                await sync.deltaSync(connection.id, connection.tenantId, connection.accessToken!);
              } else {
                await sync.fullSync(connection.id, connection.tenantId, connection.accessToken!);
              }
              break;
            }
            case "CLASSLINK": {
              if (!connection.baseUrl) break;
              const clSync = new ClassLinkSync(app);
              await clSync.fullSync(connection.id, connection.tenantId, connection.accessToken!, connection.baseUrl);
              break;
            }
            case "ONEROSTER": {
              if (!connection.baseUrl || !connection.clientId || !connection.clientSecret) break;
              // Get fresh token
              const tokenRes = await fetch(`${connection.baseUrl}/oauth/token`, {
                method: "POST",
                headers: {
                  "Content-Type": "application/x-www-form-urlencoded",
                  Authorization: `Basic ${Buffer.from(`${connection.clientId}:${connection.clientSecret}`).toString("base64")}`,
                },
                body: new URLSearchParams({ grant_type: "client_credentials" }),
              });
              if (!tokenRes.ok) break;
              const token = (await tokenRes.json()) as { access_token: string };
              const orSync = new OneRosterSync(app);
              await orSync.fullSync(connection.id, connection.tenantId, connection.baseUrl, token.access_token);
              break;
            }
          }

          app.log.info({ connectionId: connection.id, provider: connection.provider }, "Scheduled sync completed");
        } catch (err) {
          app.log.error({ err, connectionId: connection.id }, "Scheduled sync failed for connection");
        }
      }

      app.log.info("Scheduled SIS sync completed");
    } catch (err) {
      app.log.error(err, "Scheduled SIS sync failed");
    }
  });

  app.log.info("Scheduled SIS sync cron registered (daily at 2am)");
}
