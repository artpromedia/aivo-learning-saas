import type { FastifyInstance } from "fastify";
import { z } from "zod";
import { authenticate } from "../../middleware/authenticate.js";
import { requireLearnerAccess } from "../../middleware/learner-access.js";
import { publishEvent } from "@aivo/events";

const paramsSchema = z.object({ learnerId: z.string().uuid() });
const bodySchema = z.object({ password: z.string().min(1) });

export async function deleteAllDataRoute(app: FastifyInstance) {
  app.post(
    "/family/learners/:learnerId/delete-all-data",
    { preHandler: [authenticate, requireLearnerAccess("parent")] },
    async (request, reply) => {
      const { learnerId } = paramsSchema.parse(request.params);
      const { password } = bodySchema.parse(request.body);

      // Re-authenticate: verify password via identity-svc
      const authRes = await fetch(
        `${app.identityClient.baseUrl}/auth/verify-password`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userId: request.user.sub,
            password,
          }),
        },
      );

      if (!authRes.ok) {
        return reply.status(401).send({
          error: "Password verification failed. Please enter your current password.",
        });
      }

      // Trigger deletion via brain-svc
      const deleteRes = await fetch(
        `${app.brainClient.baseUrl}/brain/${learnerId}/delete-data`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ reason: "erasure_request" }),
        },
      );

      if (!deleteRes.ok) {
        return reply.status(500).send({ error: "Data deletion failed" });
      }

      const result = await deleteRes.json();

      // Send confirmation email
      await publishEvent(app.nats, "comms.email.send", {
        templateSlug: "data_deletion_confirmation",
        recipientEmail: request.user.email,
        recipientName: request.user.name ?? "Parent",
        templateData: {
          userName: request.user.name ?? "Parent",
          learnerId,
        },
        tags: ["gdpr", "data-deletion"],
      });

      return reply.send({
        status: "completed",
        message: "All data for this learner has been permanently deleted.",
        deletion_summary: result.deletion_summary,
      });
    },
  );
}
