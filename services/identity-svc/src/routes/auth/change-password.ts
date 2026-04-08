import type { FastifyInstance } from "fastify";
import { z } from "zod";
import { eq } from "drizzle-orm";
import { hash, verify } from "argon2";
import bcrypt from "bcryptjs";
import { accounts } from "@aivo/db";
import { authenticate } from "../../middleware/authenticate.js";

const changePasswordBodySchema = z.object({
  currentPassword: z.string().min(1),
  newPassword: z.string().min(8).max(128),
});

export async function changePasswordRoute(app: FastifyInstance) {
  app.post(
    "/auth/change-password",
    { preHandler: [authenticate] },
    async (request, reply) => {
      const body = changePasswordBodySchema.parse(request.body);

      // Find credential account
      const [account] = await app.db
        .select()
        .from(accounts)
        .where(eq(accounts.userId, request.user.sub))
        .limit(1);

      if (account?.providerId !== "credential" || !account.accessToken) {
        return reply.status(400).send({
          error: "Password change is not available for OAuth accounts.",
        });
      }

      // Verify current password
      const storedHash = account.accessToken;
      const isBcrypt =
        storedHash.startsWith("$2a$") || storedHash.startsWith("$2b$");
      const valid = isBcrypt
        ? await bcrypt.compare(body.currentPassword, storedHash)
        : await verify(storedHash, body.currentPassword);

      if (!valid) {
        return reply.status(401).send({
          error: "Current password is incorrect.",
        });
      }

      // Hash and save new password
      const newHash = await hash(body.newPassword);
      await app.db
        .update(accounts)
        .set({ accessToken: newHash, updatedAt: new Date() })
        .where(eq(accounts.id, account.id));

      return reply.status(200).send({
        message: "Password changed successfully.",
      });
    },
  );
}
