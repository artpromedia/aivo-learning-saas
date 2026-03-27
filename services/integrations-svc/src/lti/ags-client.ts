import * as jose from "jose";
import { getConfig } from "../config.js";
import type { LtiPlatformConfig } from "./platform-registry.js";

export interface GradePayload {
  scoreGiven: number;
  scoreMaximum: number;
  activityProgress: "Initialized" | "Started" | "InProgress" | "Submitted" | "Completed";
  gradingProgress: "FullyGraded" | "Pending" | "PendingManual" | "Failed" | "NotReady";
  userId: string;
  comment?: string;
}

export class AgsClient {
  async postGrade(
    platform: LtiPlatformConfig,
    lineItemUrl: string,
    grade: GradePayload,
  ): Promise<boolean> {
    const accessToken = await this.getAccessToken(platform);

    const response = await fetch(`${lineItemUrl}/scores`, {
      method: "POST",
      headers: {
        "Content-Type": "application/vnd.ims.lis.v1.score+json",
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({
        timestamp: new Date().toISOString(),
        scoreGiven: grade.scoreGiven,
        scoreMaximum: grade.scoreMaximum,
        activityProgress: grade.activityProgress,
        gradingProgress: grade.gradingProgress,
        userId: grade.userId,
        comment: grade.comment,
      }),
    });

    return response.ok;
  }

  async getLineItems(
    platform: LtiPlatformConfig,
    lineItemsUrl: string,
  ): Promise<Array<{ id: string; label: string; scoreMaximum: number }>> {
    const accessToken = await this.getAccessToken(platform);

    const response = await fetch(lineItemsUrl, {
      headers: {
        Accept: "application/vnd.ims.lis.v2.lineitemcontainer+json",
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (!response.ok) throw new Error(`AGS getLineItems failed: ${response.status}`);
    return response.json() as Promise<Array<{ id: string; label: string; scoreMaximum: number }>>;
  }

  private async getAccessToken(platform: LtiPlatformConfig): Promise<string> {
    const config = getConfig();

    const privateKey = config.LTI_PRIVATE_KEY
      ? await jose.importPKCS8(config.LTI_PRIVATE_KEY, "RS256")
      : null;

    if (!privateKey) throw new Error("LTI private key not configured");

    const clientAssertion = await new jose.SignJWT({})
      .setProtectedHeader({ alg: "RS256", kid: config.LTI_KID, typ: "JWT" })
      .setIssuedAt()
      .setExpirationTime("5m")
      .setIssuer(platform.clientId)
      .setSubject(platform.clientId)
      .setAudience(platform.authTokenUrl)
      .setJti(crypto.randomUUID())
      .sign(privateKey);

    const response = await fetch(platform.authTokenUrl, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        grant_type: "client_credentials",
        client_assertion_type: "urn:ietf:params:oauth:client-assertion-type:jwt-bearer",
        client_assertion: clientAssertion,
        scope: "https://purl.imsglobal.org/spec/lti-ags/scope/score https://purl.imsglobal.org/spec/lti-ags/scope/lineitem",
      }),
    });

    if (!response.ok) throw new Error(`AGS token request failed: ${response.status}`);

    const token = (await response.json()) as { access_token: string };
    return token.access_token;
  }
}
