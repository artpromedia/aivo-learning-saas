import type { FastifyInstance } from "fastify";
import fp from "fastify-plugin";
import { getConfig } from "../config.js";

export interface IdentityClient {
  readonly baseUrl: string;
  sendInvitation(data: {
    invitedBy: string;
    email: string;
    role: string;
    learnerId: string;
    relationship?: string;
  }): Promise<{ invitationId: string }>;
  revokeAccess(userId: string, learnerId: string): Promise<void>;
}

declare module "fastify" {
  interface FastifyInstance {
    identityClient: IdentityClient;
  }
}

export default fp(async (fastify: FastifyInstance) => {
  const config = getConfig();
  const baseUrl = config.IDENTITY_SVC_URL;

  const identityClient: IdentityClient = {
    baseUrl,
    async sendInvitation(data) {
      const res = await fetch(`${baseUrl}/api/invitations`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error(`identity-svc sendInvitation failed: ${res.status}`);
      return res.json() as Promise<{ invitationId: string }>;
    },
    async revokeAccess(userId, learnerId) {
      const res = await fetch(`${baseUrl}/api/learners/${learnerId}/access/${userId}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error(`identity-svc revokeAccess failed: ${res.status}`);
    },
  };

  fastify.decorate("identityClient", identityClient);
});
