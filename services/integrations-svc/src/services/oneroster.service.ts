import type { FastifyInstance } from "fastify";
import { sisConnections } from "@aivo/db";
import { eq, and } from "drizzle-orm";
import { OneRosterSync } from "../sync/oneroster-sync.js";

export class OneRosterService {
  constructor(private readonly app: FastifyInstance) {}

  async configureConnection(
    tenantId: string,
    config: { baseUrl: string; clientId: string; clientSecret: string },
  ): Promise<string> {
    const existing = await this.app.db
      .select()
      .from(sisConnections)
      .where(and(eq(sisConnections.tenantId, tenantId), eq(sisConnections.provider, "ONEROSTER")))
      .limit(1);

    if (existing.length > 0) {
      await this.app.db
        .update(sisConnections)
        .set({
          baseUrl: config.baseUrl,
          clientId: config.clientId,
          clientSecret: config.clientSecret,
          enabled: true,
          updatedAt: new Date(),
        })
        .where(eq(sisConnections.id, existing[0].id));
      return existing[0].id;
    }

    const [connection] = await this.app.db
      .insert(sisConnections)
      .values({
        tenantId,
        provider: "ONEROSTER",
        baseUrl: config.baseUrl,
        clientId: config.clientId,
        clientSecret: config.clientSecret,
        enabled: true,
      })
      .returning();

    return connection.id;
  }

  async triggerSync(tenantId: string): Promise<string> {
    const [connection] = await this.app.db
      .select()
      .from(sisConnections)
      .where(and(eq(sisConnections.tenantId, tenantId), eq(sisConnections.provider, "ONEROSTER")))
      .limit(1);

    if (!connection || !connection.baseUrl) {
      throw Object.assign(new Error("OneRoster not configured for this tenant"), { statusCode: 400 });
    }

    const accessToken = await this.getOAuthToken(connection.baseUrl, connection.clientId!, connection.clientSecret!);
    const sync = new OneRosterSync(this.app);
    return sync.fullSync(connection.id, tenantId, connection.baseUrl, accessToken);
  }

  private async getOAuthToken(baseUrl: string, clientId: string, clientSecret: string): Promise<string> {
    const response = await fetch(`${baseUrl}/oauth/token`, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Authorization: `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString("base64")}`,
      },
      body: new URLSearchParams({ grant_type: "client_credentials" }),
    });

    if (!response.ok) throw new Error(`OneRoster OAuth failed: ${response.status}`);
    const token = (await response.json()) as { access_token: string };
    return token.access_token;
  }
}
