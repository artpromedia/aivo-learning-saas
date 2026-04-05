import type { FastifyInstance } from "fastify";
import { eq, sql } from "drizzle-orm";
import { subscriptions, tenants } from "@aivo/db";
import { publishEvent } from "@aivo/events";

interface LearnerWithParent {
  learnerId: string;
  learnerName: string;
  parentId: string;
  parentEmail: string;
  parentName: string;
}

export class DistrictContractEndService {
  constructor(private readonly app: FastifyInstance) {}

  async handleContractEnd(tenantId: string, contractEndDate: string): Promise<void> {
    const now = new Date();
    const deletionDate = new Date(new Date(contractEndDate).getTime() + 30 * 24 * 60 * 60 * 1000);

    const learners = await this.getLearnersWithParents(tenantId);

    this.app.log.info(
      { tenantId, learnerCount: learners.length },
      "Processing district contract end notifications",
    );

    // Get tenant/school name
    const [tenant] = await this.app.db
      .select()
      .from(tenants)
      .where(eq(tenants.id, tenantId))
      .limit(1);

    const schoolName = tenant?.name ?? "Your school";

    for (const learner of learners) {
      try {
        // Send notification directly to parent
        await publishEvent(this.app.nats, "comms.email.send", {
          to: learner.parentEmail,
          template: "district_contract_ending",
          data: {
            parentName: learner.parentName,
            learnerName: learner.learnerName,
            schoolName,
            contractEndDate,
            dataDeletionDate: deletionDate.toISOString().split("T")[0],
            exportUrl: `${process.env.APP_URL ?? "https://app.aivo.com"}/parent/${learner.learnerId}/settings`,
            subscribeUrl: `${process.env.APP_URL ?? "https://app.aivo.com"}/billing/plans`,
          },
        });

        // Log lifecycle event per learner
        await publishEvent(this.app.nats, "brain.data.lifecycle", {
          learnerId: learner.learnerId,
          eventType: "GRACE_PERIOD_STARTED",
          metadata: {
            reason: "district_contract_ended",
            tenantId,
            contractEndDate,
            deletionDate: deletionDate.toISOString(),
          },
        });

        this.app.log.info(
          { learnerId: learner.learnerId, parentEmail: learner.parentEmail },
          "District contract end notification sent to parent",
        );
      } catch (err) {
        this.app.log.error(
          { err, learnerId: learner.learnerId },
          "Failed to send district contract end notification",
        );
      }
    }

    // Set 30-day grace period on the district subscription
    await this.app.db
      .update(subscriptions)
      .set({
        status: "GRACE_PERIOD",
        cancelledAt: now,
        gracePeriodEndsAt: deletionDate,
        updatedAt: now,
      })
      .where(eq(subscriptions.tenantId, tenantId));
  }

  private async getLearnersWithParents(tenantId: string): Promise<LearnerWithParent[]> {
    // Query learners belonging to this tenant that have parent accounts
    const result = await this.app.db.execute(
      sql`SELECT
        l.id as "learnerId",
        l.name as "learnerName",
        u.id as "parentId",
        u.email as "parentEmail",
        u.name as "parentName"
      FROM learners l
      JOIN users u ON l.parent_id = u.id
      WHERE l.tenant_id = ${tenantId}
        AND u.email IS NOT NULL
        AND u.email != ''`,
    );

    return result as unknown as LearnerWithParent[];
  }
}
