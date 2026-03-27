import type { FastifyInstance } from "fastify";
import * as jose from "jose";
import { PlatformRegistry } from "./platform-registry.js";

export interface ValidatedMessage {
  payload: Record<string, unknown>;
  platformId: string;
  clientId: string;
  tenantId: string;
}

export class MessageValidator {
  private registry: PlatformRegistry;

  constructor(private readonly app: FastifyInstance) {
    this.registry = new PlatformRegistry(app);
  }

  async validate(idToken: string): Promise<ValidatedMessage> {
    // Decode without verification first to get the issuer/aud
    const decoded = jose.decodeJwt(idToken);

    const clientId = typeof decoded.aud === "string" ? decoded.aud : decoded.aud?.[0];
    if (!clientId) throw new Error("Missing audience claim");

    const platform = await this.registry.getByClientId(clientId);
    if (!platform) throw new Error(`Unknown LTI platform: ${clientId}`);

    // Fetch platform's JWKS and verify
    const jwks = jose.createRemoteJWKSet(new URL(platform.jwksUrl));
    const { payload } = await jose.jwtVerify(idToken, jwks, {
      issuer: platform.platformId,
      audience: clientId,
    });

    // Validate required LTI claims
    const messageType = payload["https://purl.imsglobal.org/spec/lti/claim/message_type"];
    if (!messageType) throw new Error("Missing LTI message type claim");

    const ltiVersion = payload["https://purl.imsglobal.org/spec/lti/claim/version"];
    if (ltiVersion !== "1.3.0") throw new Error(`Unsupported LTI version: ${ltiVersion}`);

    // Check nonce to prevent replay attacks
    const nonce = payload.nonce as string | undefined;
    if (nonce) {
      const nonceKey = `lti:nonce:${nonce}`;
      const used = await this.app.redis.get(nonceKey);
      if (used) throw new Error("Nonce already used");
      await this.app.redis.setex(nonceKey, 3600, "1");
    }

    return {
      payload: payload as Record<string, unknown>,
      platformId: platform.platformId,
      clientId: platform.clientId,
      tenantId: platform.tenantId,
    };
  }
}
