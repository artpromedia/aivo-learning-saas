import type { FastifyInstance } from "fastify";
import { eq } from "drizzle-orm";
import { learnerXp } from "@aivo/db";

export class CurrencyEngine {
  constructor(private readonly app: FastifyInstance) {}

  async getBalance(learnerId: string): Promise<number> {
    const [record] = await this.app.db
      .select()
      .from(learnerXp)
      .where(eq(learnerXp.learnerId, learnerId))
      .limit(1);

    return record?.virtualCurrency ?? 0;
  }

  async deductCoins(learnerId: string, amount: number): Promise<{
    success: boolean;
    newBalance: number;
    error?: string;
  }> {
    const [record] = await this.app.db
      .select()
      .from(learnerXp)
      .where(eq(learnerXp.learnerId, learnerId))
      .limit(1);

    if (!record) {
      return { success: false, newBalance: 0, error: "Learner XP record not found" };
    }

    if (record.virtualCurrency < amount) {
      return {
        success: false,
        newBalance: record.virtualCurrency,
        error: `Insufficient AivoCoins: have ${record.virtualCurrency}, need ${amount}`,
      };
    }

    const newBalance = record.virtualCurrency - amount;
    await this.app.db
      .update(learnerXp)
      .set({ virtualCurrency: newBalance, updatedAt: new Date() })
      .where(eq(learnerXp.id, record.id));

    return { success: true, newBalance };
  }

  async addCoins(learnerId: string, amount: number): Promise<number> {
    const [record] = await this.app.db
      .select()
      .from(learnerXp)
      .where(eq(learnerXp.learnerId, learnerId))
      .limit(1);

    if (!record) {
      const [created] = await this.app.db
        .insert(learnerXp)
        .values({ learnerId, totalXp: 0, level: 1, virtualCurrency: amount })
        .returning();
      return created.virtualCurrency;
    }

    const newBalance = record.virtualCurrency + amount;
    await this.app.db
      .update(learnerXp)
      .set({ virtualCurrency: newBalance, updatedAt: new Date() })
      .where(eq(learnerXp.id, record.id));

    return newBalance;
  }
}
