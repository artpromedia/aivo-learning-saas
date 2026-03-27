import type { FastifyInstance } from "fastify";
import { authenticate } from "../../middleware/authenticate.js";
import { authorize } from "../../middleware/authorize.js";
import { CsvImportService } from "../../services/csv-import.service.js";

export async function csvTemplateRoute(app: FastifyInstance) {
  app.get(
    "/integrations/csv/template",
    { preHandler: [authenticate, authorize("PLATFORM_ADMIN", "DISTRICT_ADMIN")] },
    async (_request, reply) => {
      const service = new CsvImportService(app);
      const csv = await service.getTemplate();

      return reply
        .header("content-type", "text/csv")
        .header("content-disposition", "attachment; filename=\"import-template.csv\"")
        .send(csv);
    },
  );
}
