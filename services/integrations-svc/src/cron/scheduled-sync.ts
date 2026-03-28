import cron from "node-cron";
import type { FastifyInstance } from "fastify";
import { sisConnections } from "@aivo/db";
import { eq } from "drizzle-orm";
import { CleverSync } from "../sync/clever-sync.js";
import { ClassLinkSync } from "../sync/classlink-sync.js";
import { OneRosterSync } from "../sync/oneroster-sync.js";

const SYNC_LOCK_TTL = 3600; // 1 hour lock

async function acquireLock(app: FastifyInstance, connectionId: string): Promise<boolean> {
  const lockKey = `sync:lock:${connectionId}`;
  const result = await app.redis.set(lockKey, "locked", "EX", SYNC_LOCK_TTL, "NX");
  return result === "OK";
}

async function releaseLock(app: FastifyInstance, connectionId: string): Promise<void> {
  const lockKey = `sync:lock:${connectionId}`;
  await app.redis.del(lockKey);
}

async function getOneRosterToken(connection: {
  baseUrl: string | null;
  clientId: string | null;
  clientSecret: string | null;
}): Promise<string | null> {
  if (!connection.baseUrl || !connection.clientId || !connection.clientSecret) return null;
  const tokenRes = await fetch(`${connection.baseUrl}/oauth/token`, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Authorization: `Basic ${Buffer.from(`${connection.clientId}:${connection.clientSecret}`).toString("base64")}`,
    },
    body: new URLSearchParams({ grant_type: "client_credentials" }),
  });
  if (!tokenRes.ok) return null;
  const token = (await tokenRes.json()) as { access_token: string };
  return token.access_token;
}

async function syncConnection(
  app: FastifyInstance,
  connection: typeof sisConnections.$inferSelect,
  forceFull: boolean,
): Promise<void> {
  const locked = await acquireLock(app, connection.id);
  if (!locked) {
    app.log.info({ connectionId: connection.id }, "Sync already in progress, skipping");
    return;
  }

  try {
    if (!connection.accessToken && connection.provider !== "ONEROSTER") return;

    const useDelta = !forceFull && !!connection.lastSyncAt;

    switch (connection.provider) {
      case "CLEVER": {
        const sync = new CleverSync(app);
        if (useDelta) {
          await sync.deltaSync(connection.id, connection.tenantId, connection.accessToken!);
        } else {
          await sync.fullSync(connection.id, connection.tenantId, connection.accessToken!);
        }
        break;
      }
      case "CLASSLINK": {
        if (!connection.baseUrl) break;
        const clSync = new ClassLinkSync(app);
        if (useDelta) {
          await clSync.deltaSync(
            connection.id,
            connection.tenantId,
            connection.accessToken!,
            connection.baseUrl,
            connection.lastSyncAt!.toISOString(),
          );
        } else {
          await clSync.fullSync(connection.id, connection.tenantId, connection.accessToken!, connection.baseUrl);
        }
        break;
      }
      case "ONEROSTER": {
        const token = await getOneRosterToken(connection);
        if (!token || !connection.baseUrl) break;
        const orSync = new OneRosterSync(app);
        if (useDelta) {
          await orSync.deltaSync(
            connection.id,
            connection.tenantId,
            connection.baseUrl,
            token,
            connection.lastSyncAt!.toISOString(),
          );
        } else {
          await orSync.fullSync(connection.id, connection.tenantId, connection.baseUrl, token);
        }
        break;
      }
    }

    app.log.info({ connectionId: connection.id, provider: connection.provider, forceFull }, "Scheduled sync completed");
  } catch (err) {
    app.log.error({ err, connectionId: connection.id }, "Scheduled sync failed for connection");

    // Mark connection as error after persistent failure
    await app.db
      .update(sisConnections)
      .set({ lastSyncStatus: "FAILED", updatedAt: new Date() })
      .where(eq(sisConnections.id, connection.id));
  } finally {
    await releaseLock(app, connection.id);
  }
}

export function startScheduledSyncCron(app: FastifyInstance) {
  // Nightly delta sync at 2:00 AM UTC
  cron.schedule("0 2 * * *", async () => {
    try {
      app.log.info("Running nightly delta SIS sync for all connected districts");

      const connections = await app.db
        .select()
        .from(sisConnections)
        .where(eq(sisConnections.enabled, true));

      for (const connection of connections) {
        await syncConnection(app, connection, false);
      }

      app.log.info("Nightly delta SIS sync completed");
    } catch (err) {
      app.log.error(err, "Nightly delta SIS sync failed");
    }
  });

  // Weekly full sync on Sundays at 3:00 AM UTC
  cron.schedule("0 3 * * 0", async () => {
    try {
      app.log.info("Running weekly full SIS sync for all connected districts");

      const connections = await app.db
        .select()
        .from(sisConnections)
        .where(eq(sisConnections.enabled, true));

      for (const connection of connections) {
        await syncConnection(app, connection, true);
      }

      app.log.info("Weekly full SIS sync completed");
    } catch (err) {
      app.log.error(err, "Weekly full SIS sync failed");
    }
  });

  app.log.info("Scheduled SIS sync crons registered (nightly delta 2am, weekly full Sunday 3am)");
}
