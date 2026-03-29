import type { FastifyInstance } from "fastify";
import { OidcHandler } from "../lti/oidc-handler.js";
import { MessageValidator } from "../lti/message-validator.js";
import { DeepLinking, type ContentItem } from "../lti/deep-linking.js";
import { AgsClient, type GradePayload } from "../lti/ags-client.js";
import { PlatformRegistry } from "../lti/platform-registry.js";
import { publishEvent } from "@aivo/events";
import { getConfig } from "../config.js";
import * as jose from "jose";

export class LtiService {
  private oidcHandler: OidcHandler;
  private deepLinking: DeepLinking;
  private agsClient: AgsClient;
  private registry: PlatformRegistry;

  constructor(private readonly app: FastifyInstance) {
    this.oidcHandler = new OidcHandler(app);
    this.deepLinking = new DeepLinking();
    this.agsClient = new AgsClient();
    this.registry = new PlatformRegistry(app);
  }

  async initiateLogin(params: {
    iss: string;
    login_hint: string;
    target_link_uri: string;
    client_id?: string;
    lti_message_hint?: string;
  }): Promise<string> {
    return this.oidcHandler.initiateLogin(params);
  }

  async handleLaunch(payload: Record<string, unknown>, tenantId: string) {
    const messageType = payload["https://purl.imsglobal.org/spec/lti/claim/message_type"] as string;
    const resourceLink = payload["https://purl.imsglobal.org/spec/lti/claim/resource_link"] as
      | { id: string; title?: string }
      | undefined;
    const custom = payload["https://purl.imsglobal.org/spec/lti/claim/custom"] as Record<string, string> | undefined;

    const userEmail = payload.email as string | undefined;
    const userName = payload.name as string | undefined;

    let learnerId: string | undefined;
    if (userEmail) {
      const user = await this.app.identityClient.findUserByEmail(userEmail);
      if (user) {
        learnerId = user.id;
      }
    }

    if (learnerId && resourceLink) {
      await publishEvent(this.app.nats, "integrations.lti.launch", {
        tenantId,
        learnerId,
        platformId: payload.iss as string,
        resourceLinkId: resourceLink.id,
        subject: custom?.subject,
      });
    }

    return {
      messageType,
      user: { email: userEmail, name: userName, learnerId },
      resourceLink,
      custom,
      tenantId,
    };
  }

  async handleDeepLink(
    payload: Record<string, unknown>,
    tenantId: string,
    contentItems: ContentItem[],
  ): Promise<string> {
    const clientId = typeof payload.aud === "string" ? payload.aud : (payload.aud as string[])?.[0];
    const platform = await this.registry.getByClientId(clientId ?? "");

    if (!platform) throw new Error("Unknown platform");

    const dlData = (payload["https://purl.imsglobal.org/spec/lti-dl/claim/deep_linking_settings"] as Record<string, string>)?.data ?? "";

    return this.deepLinking.buildResponse(
      { platformId: platform.platformId, clientId: platform.clientId, deploymentId: platform.deploymentId },
      contentItems,
      dlData,
    );
  }

  async postGrade(tenantId: string, lineItemUrl: string, grade: GradePayload): Promise<boolean> {
    // Find platform for this tenant
    const platforms = await this.app.db.select().from((await import("@aivo/db")).ltiPlatforms);
    const platform = platforms.find((p) => p.tenantId === tenantId);
    if (!platform) throw new Error("No LTI platform registered for tenant");

    return this.agsClient.postGrade(
      {
        id: platform.id,
        tenantId: platform.tenantId,
        name: platform.name,
        platformId: platform.platformId,
        clientId: platform.clientId,
        deploymentId: platform.deploymentId,
        authLoginUrl: platform.authLoginUrl,
        authTokenUrl: platform.authTokenUrl,
        jwksUrl: platform.jwksUrl,
      },
      lineItemUrl,
      grade,
    );
  }

  getJwks(): object {
    const config = getConfig();
    if (!config.LTI_PUBLIC_KEY) {
      return { keys: [] };
    }

    // Derive JWK components from PEM public key
    const crypto = await import("node:crypto");
    const keyObject = crypto.createPublicKey(config.LTI_PUBLIC_KEY);
    const jwk = keyObject.export({ format: "jwk" }) as { n: string; e: string };

    return {
      keys: [
        {
          kty: "RSA",
          kid: config.LTI_KID,
          use: "sig",
          alg: "RS256",
          n: jwk.n,
          e: jwk.e,
        },
      ],
    };
  }
}
