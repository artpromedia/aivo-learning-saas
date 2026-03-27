import type { FastifyInstance } from "fastify";
import { sisConnections } from "@aivo/db";
import { eq, and } from "drizzle-orm";
import { CleverSync } from "../sync/clever-sync.js";
import { getConfig } from "../config.js";

export class CleverService {
  constructor(private readonly app: FastifyInstance) {}

  getAuthUrl(tenantId: string): string {
    const config = getConfig();
    const params = new URLSearchParams({
      response_type: "code",
      client_id: config.CLEVER_CLIENT_ID,
      redirect_uri: config.CLEVER_REDIRECT_URI,
      scope: "read:user_id read:sis",
      state: tenantId,
    });
    return `https://clever.com/oauth/authorize?${params}`;
  }

  async handleCallback(code: string, tenantId: string): Promise<string> {
    const config = getConfig();
    const response = await fetch("https://clever.com/oauth/tokens", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        code,
        grant_type: "authorization_code",
        redirect_uri: config.CLEVER_REDIRECT_URI,
      }),
      // Clever uses Basic auth for token exchange
    });

    if (!response.ok) throw new Error(`Clever token exchange failed: ${response.status}`);
    const token = (await response.json()) as { access_token: string };

    const existing = await this.app.db
      .select()
      .from(sisConnections)
      .where(and(eq(sisConnections.tenantId, tenantId), eq(sisConnections.provider, "CLEVER")))
      .limit(1);

    if (existing.length > 0) {
      await this.app.db
        .update(sisConnections)
        .set({ accessToken: token.access_token, enabled: true, updatedAt: new Date() })
        .where(eq(sisConnections.id, existing[0].id));
      return existing[0].id;
    }

    const [connection] = await this.app.db
      .insert(sisConnections)
      .values({
        tenantId,
        provider: "CLEVER",
        accessToken: token.access_token,
        clientId: config.CLEVER_CLIENT_ID,
        enabled: true,
      })
      .returning();

    return connection.id;
  }

  async triggerSync(districtId: string, tenantId: string): Promise<string> {
    const [connection] = await this.app.db
      .select()
      .from(sisConnections)
      .where(and(eq(sisConnections.tenantId, tenantId), eq(sisConnections.provider, "CLEVER")))
      .limit(1);

    if (!connection || !connection.accessToken) {
      throw Object.assign(new Error("Clever not connected for this tenant"), { statusCode: 400 });
    }

    const sync = new CleverSync(this.app);
    const isFirstSync = !connection.lastSyncAt;

    if (isFirstSync) {
      return sync.fullSync(connection.id, tenantId, connection.accessToken);
    }

    return sync.deltaSync(connection.id, tenantId, connection.accessToken);
  }

  async handleWebhook(event: { type: string; data: Record<string, unknown> }) {
    const connections = await this.app.db
      .select()
      .from(sisConnections)
      .where(eq(sisConnections.provider, "CLEVER"));

    for (const conn of connections) {
      const sync = new CleverSync(this.app);
      await sync.handleWebhookEvent(event, conn.tenantId);
    }
  }
}
