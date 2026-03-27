import type { FastifyInstance } from "fastify";
import { sisConnections } from "@aivo/db";
import { eq, and } from "drizzle-orm";
import { ClassLinkSync } from "../sync/classlink-sync.js";
import { getConfig } from "../config.js";

export class ClassLinkService {
  constructor(private readonly app: FastifyInstance) {}

  getAuthUrl(tenantId: string): string {
    const config = getConfig();
    const params = new URLSearchParams({
      response_type: "code",
      client_id: config.CLASSLINK_CLIENT_ID,
      redirect_uri: config.CLASSLINK_REDIRECT_URI,
      scope: "oneroster",
      state: tenantId,
    });
    return `https://launchpad.classlink.com/oauth2/v2/auth?${params}`;
  }

  async handleCallback(code: string, tenantId: string): Promise<string> {
    const config = getConfig();
    const response = await fetch("https://launchpad.classlink.com/oauth2/v2/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        code,
        grant_type: "authorization_code",
        client_id: config.CLASSLINK_CLIENT_ID,
        client_secret: config.CLASSLINK_CLIENT_SECRET,
        redirect_uri: config.CLASSLINK_REDIRECT_URI,
      }),
    });

    if (!response.ok) throw new Error(`ClassLink token exchange failed: ${response.status}`);
    const token = (await response.json()) as { access_token: string; server: string };

    const existing = await this.app.db
      .select()
      .from(sisConnections)
      .where(and(eq(sisConnections.tenantId, tenantId), eq(sisConnections.provider, "CLASSLINK")))
      .limit(1);

    if (existing.length > 0) {
      await this.app.db
        .update(sisConnections)
        .set({ accessToken: token.access_token, baseUrl: token.server, enabled: true, updatedAt: new Date() })
        .where(eq(sisConnections.id, existing[0].id));
      return existing[0].id;
    }

    const [connection] = await this.app.db
      .insert(sisConnections)
      .values({
        tenantId,
        provider: "CLASSLINK",
        accessToken: token.access_token,
        baseUrl: token.server,
        clientId: config.CLASSLINK_CLIENT_ID,
        enabled: true,
      })
      .returning();

    return connection.id;
  }

  async triggerSync(districtId: string, tenantId: string): Promise<string> {
    const [connection] = await this.app.db
      .select()
      .from(sisConnections)
      .where(and(eq(sisConnections.tenantId, tenantId), eq(sisConnections.provider, "CLASSLINK")))
      .limit(1);

    if (!connection || !connection.accessToken || !connection.baseUrl) {
      throw Object.assign(new Error("ClassLink not connected for this tenant"), { statusCode: 400 });
    }

    const sync = new ClassLinkSync(this.app);
    return sync.fullSync(connection.id, tenantId, connection.accessToken, connection.baseUrl);
  }
}
