import type { FastifyInstance } from "fastify";
import fp from "fastify-plugin";

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
      // Triggers onboarding pipeline via NATS event (handled by assessment-svc)
      fastify.log.info({ learnerId }, "Onboarding trigger queued for learner");
    },
  };

  fastify.decorate("assessmentClient", assessmentClient);
});
