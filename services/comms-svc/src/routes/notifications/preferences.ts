import type { FastifyInstance } from "fastify";
import { z } from "zod";
import { authenticate } from "../../middleware/authenticate.js";
import { PreferenceService } from "../../services/preference.service.js";

const updatePreferencesSchema = z.object({
  preferences: z.array(z.object({
    notificationType: z.string(),
    emailEnabled: z.boolean().optional(),
    pushEnabled: z.boolean().optional(),
    inAppEnabled: z.boolean().optional(),
  })),
});

export async function preferencesRoute(app: FastifyInstance): Promise<void> {
  // GET preferences
  app.get("/comms/notifications/preferences", {
    preHandler: [authenticate],
  }, async (request, reply) => {
    const service = new PreferenceService(app);
    const prefs = await service.getPreferences(request.user.sub);
    return reply.send({ preferences: prefs });
  });

  // PATCH preferences
  app.patch("/comms/notifications/preferences", {
    preHandler: [authenticate],
  }, async (request, reply) => {
    const body = updatePreferencesSchema.parse(request.body);
    const service = new PreferenceService(app);
    await service.updateBulkPreferences(request.user.sub, body.preferences);
    return reply.send({ success: true });
  });
}
