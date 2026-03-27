import type { FastifyInstance } from "fastify";
import { eq, desc, and } from "drizzle-orm";
import { iepDocuments, iepGoals } from "@aivo/db";

export class IepService {
  constructor(private readonly app: FastifyInstance) {}

  async uploadDocument(
    learnerId: string,
    uploadedBy: string,
    fileBuffer: Buffer,
    fileType: string,
    fileName: string,
  ) {
    const key = `iep/${learnerId}/${Date.now()}_${fileName}`;
    const fileUrl = await this.app.s3.uploadDocument(key, fileBuffer, fileType);

    const [doc] = await this.app.db
      .insert(iepDocuments)
      .values({
        learnerId,
        uploadedBy,
        fileUrl,
        fileType,
        parseStatus: "PENDING",
      })
      .returning();

    return doc;
  }

  async getDocuments(learnerId: string) {
    return this.app.db
      .select()
      .from(iepDocuments)
      .where(eq(iepDocuments.learnerId, learnerId))
      .orderBy(desc(iepDocuments.createdAt));
  }

  async getGoals(learnerId: string) {
    const goals = await this.app.db
      .select()
      .from(iepGoals)
      .where(eq(iepGoals.learnerId, learnerId))
      .orderBy(desc(iepGoals.createdAt));

    return goals.map((goal) => {
      const targetVal = parseFloat(goal.targetValue ?? "0");
      const currentVal = parseFloat(goal.currentValue ?? "0");
      const progressPercent = targetVal > 0 ? Math.min(100, Math.round((currentVal / targetVal) * 100)) : 0;
      const trend = this.calculateTrend(currentVal, targetVal, goal.status);

      return {
        id: goal.id,
        goalText: goal.goalText,
        domain: goal.domain,
        targetMetric: goal.targetMetric,
        targetValue: targetVal,
        currentValue: currentVal,
        progressPercent,
        status: goal.status,
        trend,
        metAt: goal.metAt?.toISOString() ?? null,
        lastObservedAt: goal.updatedAt.toISOString(),
      };
    });
  }

  async getGoalDetail(learnerId: string, goalId: string) {
    const [goal] = await this.app.db
      .select()
      .from(iepGoals)
      .where(
        and(
          eq(iepGoals.id, goalId),
          eq(iepGoals.learnerId, learnerId),
        ),
      )
      .limit(1);

    if (!goal) {
      throw Object.assign(new Error("IEP goal not found"), { statusCode: 404 });
    }

    const targetVal = parseFloat(goal.targetValue ?? "0");
    const currentVal = parseFloat(goal.currentValue ?? "0");
    const progressPercent = targetVal > 0 ? Math.min(100, Math.round((currentVal / targetVal) * 100)) : 0;

    return {
      id: goal.id,
      goalText: goal.goalText,
      domain: goal.domain,
      targetMetric: goal.targetMetric,
      targetValue: targetVal,
      currentValue: currentVal,
      progressPercent,
      status: goal.status,
      trend: this.calculateTrend(currentVal, targetVal, goal.status),
      metAt: goal.metAt?.toISOString() ?? null,
      createdAt: goal.createdAt.toISOString(),
      updatedAt: goal.updatedAt.toISOString(),
    };
  }

  async checkRefreshNeeded(learnerId: string): Promise<boolean> {
    const docs = await this.app.db
      .select()
      .from(iepDocuments)
      .where(eq(iepDocuments.learnerId, learnerId))
      .orderBy(desc(iepDocuments.createdAt))
      .limit(1);

    if (docs.length === 0) return false;

    const latestDoc = docs[0];
    const tenMonthsAgo = new Date();
    tenMonthsAgo.setMonth(tenMonthsAgo.getMonth() - 10);

    return latestDoc.createdAt < tenMonthsAgo;
  }

  private calculateTrend(currentVal: number, targetVal: number, status: string): string {
    if (status === "MET") return "achieved";
    if (targetVal === 0) return "stable";
    const pct = currentVal / targetVal;
    if (pct >= 0.8) return "on_track";
    if (pct >= 0.5) return "improving";
    return "at_risk";
  }
}
