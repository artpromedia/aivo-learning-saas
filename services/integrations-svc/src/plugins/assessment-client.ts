import type { FastifyInstance } from "fastify";
import fp from "fastify-plugin";
import { publishEvent } from "@aivo/events";

export interface AssessmentClient {
  triggerOnboarding(learnerId: string): Promise<void>;
}

declare module "fastify" {
  interface FastifyInstance {
    assessmentClient: AssessmentClient;
  }
}

export default fp(async (fastify: FastifyInstance) => {
  const assessmentClient: AssessmentClient = {
    async triggerOnboarding(learnerId: string) {
      // Publish a NATS event that assessment-svc subscribes to
      // This triggers the onboarding pipeline for a learner (e.g., after roster sync)
      await publishEvent(fastify.nats, "assessment.baseline.started", {
        learnerId,
        assessmentMode: "STANDARD" as const,
      });
      fastify.log.info({ learnerId }, "Onboarding trigger published for learner");
    },
  };

  fastify.decorate("assessmentClient", assessmentClient);
});
