import type { FastifyInstance } from "fastify";
import { z } from "zod";
import { authenticate } from "../../middleware/authenticate.js";
import { SettingsService } from "../../services/settings.service.js";

const bodySchema = z.object({
  leaderboardOptOut: z.boolean().optional(),
  privacyMode: z.enum(["standard", "restricted"]).optional(),
});

export async function privacySettingsRoute(app: FastifyInstance) {
  app.patch(
    "/family/settings/privacy",
    { preHandler: [authenticate] },
    async (request, reply) => {
      const updates = bodySchema.parse(request.body);
      const service = new SettingsService(app);
      const settings = await service.updatePrivacy(request.user.sub, updates);
      return reply.send(settings);
    },
  );
}
