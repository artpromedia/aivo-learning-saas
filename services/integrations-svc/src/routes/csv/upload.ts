import type { FastifyInstance } from "fastify";
import { authenticate } from "../../middleware/authenticate.js";
import { authorize } from "../../middleware/authorize.js";
import { CsvImportService } from "../../services/csv-import.service.js";

export async function csvUploadRoute(app: FastifyInstance) {
  app.post(
    "/integrations/csv/upload",
    { preHandler: [authenticate, authorize("PLATFORM_ADMIN", "DISTRICT_ADMIN")] },
    async (request, reply) => {
      const { fileName, csvContent } = request.body as {
        fileName: string;
        csvContent: string;
      };
      const { tenantId } = (request as any).user;

      const service = new CsvImportService(app);
      const jobId = await service.startImport(tenantId, fileName, csvContent, request.user.sub);

      return reply.status(201).send({ jobId });
    },
  );
}
