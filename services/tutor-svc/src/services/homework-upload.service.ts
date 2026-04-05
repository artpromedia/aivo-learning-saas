import { eq } from "drizzle-orm";
import type { FastifyInstance } from "fastify";
import { homeworkAssignments, learners } from "@aivo/db";
import { publishEvent } from "@aivo/events";
import { BrainRelayService } from "./brain-relay.service.js";
import { SubscriptionGateService } from "./subscription-gate.service.js";
import { getHomeworkMode } from "../data/homework-modes.js";

export class HomeworkUploadService {
  private brainRelay: BrainRelayService;
  private gate: SubscriptionGateService;

  constructor(private readonly app: FastifyInstance) {
    this.brainRelay = new BrainRelayService(app);
    this.gate = new SubscriptionGateService(app);
  }

  async upload(
    learnerId: string,
    fileUrl: string,
    fileType: string,
    subject?: string,
  ) {
    // Step 1: OCR extraction
    const extraction = (await this.app.aiClient.homeworkOCR({
      learnerId,
      imageUrl: fileUrl,
      mimeType: fileType,
    })) as { detectedSubject?: string; text?: string; problems?: unknown[] };

    // Detect subject if not provided
    const detectedSubject = subject ?? extraction.detectedSubject ?? "math";

    // Step 2: Verify subscription access
    const access = await this.gate.verifyAccess(learnerId, detectedSubject);
    if (!access.allowed) {
      throw Object.assign(new Error(access.message ?? "Access denied"), {
        statusCode: 403,
        requiredSku: access.requiredSku,
      });
    }

    // Step 3: Fetch brain context for adaptation
    const brainContext = await this.brainRelay.fetchContext(learnerId);

    // Step 4: Determine homework mode from functioning level
    const [learner] = await this.app.db
      .select()
      .from(learners)
      .where(eq(learners.id, learnerId))
      .limit(1);

    const functioningLevel = learner?.functioningLevel ?? "STANDARD";
    const homeworkMode = getHomeworkMode(functioningLevel);

    // Step 5: Adapt problems using AI with brain context
    const adapted = (await this.app.aiClient.homeworkAdapt({
      learnerId,
      subject: detectedSubject,
      problems: (extraction.problems as unknown[]) ?? [],
      brainContext,
    })) as { problems?: unknown[] };

    // Step 6: Create assignment record
    const [assignment] = await this.app.db
      .insert(homeworkAssignments)
      .values({
        learnerId,
        subject: detectedSubject,
        originalFileUrl: fileUrl,
        originalFileType: fileType,
        extractedText: extraction.text,
        extractedProblems: extraction.problems,
        adaptedProblems: adapted.problems,
        homeworkMode,
        status: "READY",
      })
      .returning();

    // Step 7: Publish events
    await publishEvent(this.app.nats, "homework.uploaded", {
      learnerId,
      assignmentId: assignment.id,
      subject: detectedSubject,
      fileUrl,
    });

    await publishEvent(this.app.nats, "homework.processed", {
      learnerId,
      assignmentId: assignment.id,
      problemCount: adapted.problems?.length ?? 0,
    });

    return assignment;
  }

  async getAssignment(assignmentId: string) {
    const [assignment] = await this.app.db
      .select()
      .from(homeworkAssignments)
      .where(eq(homeworkAssignments.id, assignmentId))
      .limit(1);

    return assignment ?? null;
  }
}
