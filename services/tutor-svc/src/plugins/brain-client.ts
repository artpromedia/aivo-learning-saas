import type { FastifyInstance } from "fastify";
import fp from "fastify-plugin";
import { getConfig } from "../config.js";

export interface BrainClient {
  getBrainContext(learnerId: string): Promise<unknown>;
  addTutor(learnerId: string, tutorId: string, tutorType: string, subject: string): Promise<unknown>;
  removeTutor(learnerId: string, tutorId: string): Promise<unknown>;
}

declare module "fastify" {
  interface FastifyInstance {
    brainClient: BrainClient;
  }
}

export default fp(async (fastify: FastifyInstance) => {
  const config = getConfig();
  const baseUrl = config.BRAIN_SVC_URL;

  const brainClient: BrainClient = {
    async getBrainContext(learnerId: string): Promise<unknown> {
      const res = await fetch(`${baseUrl}/api/brain/${learnerId}/context`);
      if (!res.ok) {
        throw new Error(`brain-svc getBrainContext failed: ${res.status} ${res.statusText}`);
      }
      return res.json();
    },

    async addTutor(learnerId: string, tutorId: string, tutorType: string, subject: string): Promise<unknown> {
      const res = await fetch(`${baseUrl}/api/brain/${learnerId}/tutors`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tutorId, tutorType, subject }),
      });
      if (!res.ok) {
        throw new Error(`brain-svc addTutor failed: ${res.status} ${res.statusText}`);
      }
      return res.json();
    },

    async removeTutor(learnerId: string, tutorId: string): Promise<unknown> {
      const res = await fetch(`${baseUrl}/api/brain/${learnerId}/tutors/${tutorId}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        throw new Error(`brain-svc removeTutor failed: ${res.status} ${res.statusText}`);
      }
      return res.json();
    },
  };

  fastify.decorate("brainClient", brainClient);
});
