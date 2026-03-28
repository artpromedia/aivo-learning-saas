import type { FastifyInstance } from "fastify";
import { authenticate } from "../../middleware/authenticate.js";
import { users } from "@aivo/db";
import { eq } from "drizzle-orm";

export async function sessionRoute(app: FastifyInstance) {
  app.get("/auth/session", { preHandler: [authenticate] }, async (request, reply) => {
    const [user] = await app.db
      .select({
        id: users.id,
        email: users.email,
        name: users.name,
        role: users.role,
        avatarUrl: users.avatarUrl,
        tenantId: users.tenantId,
      })
      .from(users)
      .where(eq(users.id, request.user.sub))
      .limit(1);

    if (!user) {
      return reply.status(401).send({ error: "User not found" });
    }

    return reply.status(200).send({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        avatarUrl: user.avatarUrl,
        tenantId: user.tenantId,
      },
    });
  });
}
