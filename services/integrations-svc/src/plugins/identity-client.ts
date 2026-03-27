import type { FastifyInstance } from "fastify";
import fp from "fastify-plugin";
import { getConfig } from "../config.js";

export interface CreateUserRequest {
  tenantId: string;
  email: string;
  name: string;
  role: "PARENT" | "TEACHER" | "CAREGIVER" | "LEARNER" | "DISTRICT_ADMIN";
  status?: "ACTIVE" | "INVITED";
}

export interface CreateLearnerRequest {
  tenantId: string;
  parentId: string;
  name: string;
  enrolledGrade?: number;
  schoolName?: string;
  functioningLevel?: string;
}

export interface IdentityClient {
  createUser(data: CreateUserRequest): Promise<{ id: string; email: string }>;
  createLearner(data: CreateLearnerRequest): Promise<{ id: string }>;
  findUserByEmail(email: string): Promise<{ id: string; tenantId: string; role: string } | null>;
  sendInvitation(userId: string, invitedBy: string): Promise<void>;
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
    async createUser(data) {
      const res = await fetch(`${baseUrl}/internal/users`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error(`identity-svc createUser failed: ${res.status}`);
      return res.json() as Promise<{ id: string; email: string }>;
    },

    async createLearner(data) {
      const res = await fetch(`${baseUrl}/internal/learners`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error(`identity-svc createLearner failed: ${res.status}`);
      return res.json() as Promise<{ id: string }>;
    },

    async findUserByEmail(email) {
      const res = await fetch(`${baseUrl}/internal/users/by-email/${encodeURIComponent(email)}`);
      if (res.status === 404) return null;
      if (!res.ok) throw new Error(`identity-svc findUserByEmail failed: ${res.status}`);
      return res.json() as Promise<{ id: string; tenantId: string; role: string }>;
    },

    async sendInvitation(userId, invitedBy) {
      const res = await fetch(`${baseUrl}/internal/invitations`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, invitedBy }),
      });
      if (!res.ok) throw new Error(`identity-svc sendInvitation failed: ${res.status}`);
    },
  };

  fastify.decorate("identityClient", identityClient);
});
