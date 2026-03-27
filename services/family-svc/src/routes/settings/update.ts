import type { FastifyInstance } from "fastify";
import { z } from "zod";
import { authenticate } from "../../middleware/authenticate.js";
import { SettingsService } from "../../services/settings.service.js";

const bodySchema = z.object({
  dailyReportEmail: z.boolean().optional(),
  weeklyDigestEmail: z.boolean().optional(),
  notificationsEnabled: z.boolean().optional(),
});

export async function updateSettingsRoute(app: FastifyInstance) {
  app.patch(
    "/family/settings",
    { preHandler: [authenticate] },
    async (request, reply) => {
      const updates = bodySchema.parse(request.body);
      const service = new SettingsService(app);
      const settings = await service.updateSettings(request.user.sub, updates);
      return reply.send(settings);
    },
  );
}
