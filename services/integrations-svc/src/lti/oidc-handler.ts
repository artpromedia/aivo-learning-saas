import type { FastifyInstance } from "fastify";
import { nanoid } from "nanoid";
import { PlatformRegistry } from "./platform-registry.js";
import { getConfig } from "../config.js";

export class OidcHandler {
  private registry: PlatformRegistry;

  constructor(private readonly app: FastifyInstance) {
    this.registry = new PlatformRegistry(app);
  }

  async initiateLogin(params: {
    iss: string;
    login_hint: string;
    target_link_uri: string;
    client_id?: string;
    lti_message_hint?: string;
  }): Promise<string> {
    const config = getConfig();
    const clientId = params.client_id;

    let platform;
    if (clientId) {
      platform = await this.registry.getByClientId(clientId);
    } else {
      platform = await this.registry.getByPlatformId(params.iss);
    }

    if (!platform) throw new Error(`Unknown LTI platform: ${params.iss}`);

    const state = nanoid(32);
    const nonce = nanoid(32);

    // Store state for validation
    await this.app.redis.setex(`lti:state:${state}`, 600, JSON.stringify({
      platformId: platform.platformId,
      clientId: platform.clientId,
      nonce,
    }));

    const authUrl = new URL(platform.authLoginUrl);
    authUrl.searchParams.set("scope", "openid");
    authUrl.searchParams.set("response_type", "id_token");
    authUrl.searchParams.set("client_id", platform.clientId);
    authUrl.searchParams.set("redirect_uri", `${config.APP_URL}/integrations/lti/launch`);
    authUrl.searchParams.set("login_hint", params.login_hint);
    authUrl.searchParams.set("state", state);
    authUrl.searchParams.set("nonce", nonce);
    authUrl.searchParams.set("response_mode", "form_post");
    authUrl.searchParams.set("prompt", "none");

    if (params.lti_message_hint) {
      authUrl.searchParams.set("lti_message_hint", params.lti_message_hint);
    }

    return authUrl.toString();
  }

  async validateState(state: string): Promise<{ platformId: string; clientId: string; nonce: string }> {
    const stored = await this.app.redis.get(`lti:state:${state}`);
    if (!stored) throw new Error("Invalid or expired state");

    await this.app.redis.del(`lti:state:${state}`);
    return JSON.parse(stored);
  }
}
