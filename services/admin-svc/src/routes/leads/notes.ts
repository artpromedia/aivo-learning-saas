import type { FastifyInstance } from "fastify";
import { authenticate } from "../../middleware/authenticate.js";
import { adminOnly } from "../../middleware/admin-only.js";
import { LeadService } from "../../services/lead.service.js";

export async function leadNotesRoute(app: FastifyInstance) {
  app.post(
    "/admin/leads/:id/notes",
    { preHandler: [authenticate, adminOnly] },
    async (request, reply) => {
      const { id } = request.params as { id: string };
      const body = request.body as { content: string };

      if (!body.content) {
        return reply.status(400).send({ error: "content is required" });
      }

      const service = new LeadService(app);
      const note = await service.addNote(id, body.content, request.user.sub, request.ip);
      return reply.status(201).send({ note });
    },
  );
}
