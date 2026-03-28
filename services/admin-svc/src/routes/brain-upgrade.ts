import type { FastifyInstance } from "fastify";
import { z } from "zod";
import { authenticate } from "../middleware/authenticate.js";
import { adminOnly } from "../middleware/admin-only.js";
import { getConfig } from "../config.js";

const upgradeBodySchema = z.object({
  newVersion: z.string().min(1),
  dryRun: z.boolean().default(false),
});

export async function brainUpgradeRoute(app: FastifyInstance) {
  app.post(
    "/admin/brain/upgrade",
    { preHandler: [authenticate, adminOnly] },
    async (request, reply) => {
      const body = upgradeBodySchema.parse(request.body);
      const config = getConfig();

      const response = await fetch(`${config.BRAIN_SVC_URL}/brain/internal/upgrade`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          new_version: body.newVersion,
          dry_run: body.dryRun,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        app.log.error({ status: response.status, body: errorText }, "brain-svc upgrade failed");
        return reply.status(response.status).send({
          error: `Brain upgrade failed: ${response.status}`,
          detail: errorText,
        });
      }

      const stats = await response.json();

      app.log.info(
        { version: body.newVersion, dryRun: body.dryRun, stats },
        "Brain upgrade triggered",
      );

      return reply.send(stats);
    },
  );
}
