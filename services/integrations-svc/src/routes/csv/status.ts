import type { FastifyInstance } from "fastify";
import { authenticate } from "../../middleware/authenticate.js";
import { authorize } from "../../middleware/authorize.js";
import { CsvImportService } from "../../services/csv-import.service.js";

export async function csvJobStatusRoute(app: FastifyInstance) {
  app.get(
    "/integrations/csv/jobs/:jobId",
    { preHandler: [authenticate, authorize("PLATFORM_ADMIN", "DISTRICT_ADMIN")] },
    async (request, reply) => {
      const { jobId } = request.params as { jobId: string };
      const { tenantId } = (request as any).user;

      const service = new CsvImportService(app);
      const status = await service.getJobStatus(jobId, tenantId);

      return reply.send(status);
    },
  );
}
