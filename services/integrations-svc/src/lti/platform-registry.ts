import type { FastifyInstance } from "fastify";
import { ltiPlatforms } from "@aivo/db";
import { eq } from "drizzle-orm";

export interface LtiPlatformConfig {
  id: string;
  tenantId: string;
  name: string;
  platformId: string;
  clientId: string;
  deploymentId: string | null;
  authLoginUrl: string;
  authTokenUrl: string;
  jwksUrl: string;
}

export class PlatformRegistry {
  constructor(private readonly app: FastifyInstance) {}

  async getByClientId(clientId: string): Promise<LtiPlatformConfig | null> {
    const cached = await this.app.redis.get(`lti:platform:${clientId}`);
    if (cached) return JSON.parse(cached);

    const [platform] = await this.app.db
      .select()
      .from(ltiPlatforms)
      .where(eq(ltiPlatforms.clientId, clientId))
      .limit(1);

    if (!platform || !platform.enabled) return null;

    const config: LtiPlatformConfig = {
      id: platform.id,
      tenantId: platform.tenantId,
      name: platform.name,
      platformId: platform.platformId,
      clientId: platform.clientId,
      deploymentId: platform.deploymentId,
      authLoginUrl: platform.authLoginUrl,
      authTokenUrl: platform.authTokenUrl,
      jwksUrl: platform.jwksUrl,
    };

    await this.app.redis.setex(`lti:platform:${clientId}`, 3600, JSON.stringify(config));
    return config;
  }

  async getByPlatformId(platformId: string): Promise<LtiPlatformConfig | null> {
    const [platform] = await this.app.db
      .select()
      .from(ltiPlatforms)
      .where(eq(ltiPlatforms.platformId, platformId))
      .limit(1);

    if (!platform || !platform.enabled) return null;

    return {
      id: platform.id,
      tenantId: platform.tenantId,
      name: platform.name,
      platformId: platform.platformId,
      clientId: platform.clientId,
      deploymentId: platform.deploymentId,
      authLoginUrl: platform.authLoginUrl,
      authTokenUrl: platform.authTokenUrl,
      jwksUrl: platform.jwksUrl,
    };
  }

  async register(data: Omit<LtiPlatformConfig, "id">) {
    const [platform] = await this.app.db
      .insert(ltiPlatforms)
      .values(data)
      .returning();
    return platform;
  }
}
