import { eq } from "drizzle-orm";
import type { FastifyInstance } from "fastify";
import { users } from "@aivo/db";

export interface UpdateProfileInput {
  name?: string;
  avatarUrl?: string;
}

export class UserService {
  constructor(private readonly app: FastifyInstance) {}

  async getById(userId: string) {
    const [user] = await this.app.db
      .select()
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    if (!user) {
      throw Object.assign(new Error("User not found"), { statusCode: 404 });
    }

    return user;
  }

  async updateProfile(userId: string, input: UpdateProfileInput) {
    const [user] = await this.app.db
      .update(users)
      .set({
        ...input,
        updatedAt: new Date(),
      })
      .where(eq(users.id, userId))
      .returning();

    if (!user) {
      throw Object.assign(new Error("User not found"), { statusCode: 404 });
    }

    return user;
  }

  async deleteAccount(userId: string) {
    const [user] = await this.app.db
      .select()
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    if (!user) {
      throw Object.assign(new Error("User not found"), { statusCode: 404 });
    }

    // Soft-delete: set status to SUSPENDED
    await this.app.db
      .update(users)
      .set({ status: "SUSPENDED", updatedAt: new Date() })
      .where(eq(users.id, userId));

    return { success: true };
  }
}
