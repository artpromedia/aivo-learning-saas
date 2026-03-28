import type { FastifyInstance } from "fastify";
import { authenticate } from "../../middleware/authenticate.js";
import { authorize } from "../../middleware/authorize.js";
import { EnrollmentEnrichmentService } from "../../services/enrollment-enrichment.js";

export async function iepUploadRoute(app: FastifyInstance) {
  app.post(
    "/integrations/learners/:learnerId/iep-upload",
    { preHandler: [authenticate, authorize("TEACHER", "ADMIN")] },
    async (request, reply) => {
      const { learnerId } = request.params as { learnerId: string };
      const { fileName, fileData } = request.body as { fileName: string; fileData: string };

      if (!fileName || !fileData) {
        return reply.status(400).send({ error: "fileName and fileData are required" });
      }

      const service = new EnrollmentEnrichmentService(app);
      const uploadId = await service.uploadIepForLearner(
        learnerId,
        request.user.tenantId,
        request.user.id,
        fileName,
        fileData,
      );

      return reply.status(201).send({ uploadId, status: "PENDING" });
    },
  );

  app.get(
    "/integrations/learners/:learnerId/iep-uploads",
    { preHandler: [authenticate] },
    async (request, reply) => {
      const { learnerId } = request.params as { learnerId: string };
      const service = new EnrollmentEnrichmentService(app);
      const uploads = await service.getPendingIepUploads(learnerId);
      return reply.send({ uploads });
    },
  );
}
