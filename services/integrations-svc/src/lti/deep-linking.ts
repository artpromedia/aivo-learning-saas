import * as jose from "jose";
import { getConfig } from "../config.js";

export interface ContentItem {
  type: string;
  title: string;
  url: string;
  subject?: string;
  description?: string;
}

export class DeepLinking {
  async buildResponse(
    platformConfig: { platformId: string; clientId: string; deploymentId: string | null },
    contentItems: ContentItem[],
    data: string,
  ): Promise<string> {
    const config = getConfig();

    const items = contentItems.map((item) => ({
      type: "ltiResourceLink",
      title: item.title,
      url: item.url,
      custom: {
        subject: item.subject ?? "",
      },
    }));

    const privateKey = config.LTI_PRIVATE_KEY
      ? await jose.importPKCS8(config.LTI_PRIVATE_KEY, "RS256")
      : null;

    if (!privateKey) throw new Error("LTI private key not configured");

    const jwt = await new jose.SignJWT({
      "https://purl.imsglobal.org/spec/lti/claim/message_type": "LtiDeepLinkingResponse",
      "https://purl.imsglobal.org/spec/lti/claim/version": "1.3.0",
      "https://purl.imsglobal.org/spec/lti-dl/claim/content_items": items,
      "https://purl.imsglobal.org/spec/lti-dl/claim/data": data,
      "https://purl.imsglobal.org/spec/lti/claim/deployment_id": platformConfig.deploymentId ?? "",
    })
      .setProtectedHeader({ alg: "RS256", kid: config.LTI_KID })
      .setIssuedAt()
      .setExpirationTime("5m")
      .setIssuer(platformConfig.clientId)
      .setAudience(platformConfig.platformId)
      .setSubject(platformConfig.clientId)
      .sign(privateKey);

    return jwt;
  }
}
