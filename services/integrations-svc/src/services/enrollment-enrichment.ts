import type { FastifyInstance } from "fastify";
import { publishEvent } from "@aivo/events";

interface PendingIepUpload {
  learnerId: string;
  tenantId: string;
  uploadedBy: string;
  fileName: string;
  fileData: string;
  status: "PENDING" | "CONFIRMED" | "REJECTED";
}

export class EnrollmentEnrichmentService {
  constructor(private readonly app: FastifyInstance) {}

  async uploadIepForLearner(
    learnerId: string,
    tenantId: string,
    teacherId: string,
    fileName: string,
    fileData: string,
  ): Promise<string> {
    // Store pending IEP upload in Redis (teacher-uploaded, awaiting parent confirmation)
    const uploadId = crypto.randomUUID();
    const record: PendingIepUpload = {
      learnerId,
      tenantId,
      uploadedBy: teacherId,
      fileName,
      fileData,
      status: "PENDING",
    };

    // Store with 90-day TTL (expires if parent never onboards)
    await this.app.redis.setex(
      `pending_iep:${learnerId}:${uploadId}`,
      90 * 24 * 60 * 60,
      JSON.stringify(record),
    );

    // Also maintain an index of pending uploads per learner
    await this.app.redis.sadd(`pending_iep_index:${learnerId}`, uploadId);
    await this.app.redis.expire(`pending_iep_index:${learnerId}`, 90 * 24 * 60 * 60);

    // Notify parent via NATS event
    await publishEvent(this.app.nats, "integrations.iep.teacher_uploaded", {
      learnerId,
      tenantId,
      teacherId,
      uploadId,
      fileName,
    });

    this.app.log.info(
      { learnerId, teacherId, uploadId, fileName },
      "Teacher uploaded IEP for learner during enrollment",
    );

    return uploadId;
  }

  async getPendingIepUploads(learnerId: string): Promise<PendingIepUpload[]> {
    const uploadIds = await this.app.redis.smembers(`pending_iep_index:${learnerId}`);
    if (!uploadIds || uploadIds.length === 0) return [];

    const uploads: PendingIepUpload[] = [];
    for (const id of uploadIds) {
      const raw = await this.app.redis.get(`pending_iep:${learnerId}:${id}`);
      if (raw) {
        uploads.push(JSON.parse(raw));
      }
    }

    return uploads;
  }

  async confirmIepUpload(learnerId: string, uploadId: string): Promise<PendingIepUpload | null> {
    const key = `pending_iep:${learnerId}:${uploadId}`;
    const raw = await this.app.redis.get(key);
    if (!raw) return null;

    const upload: PendingIepUpload = JSON.parse(raw);
    upload.status = "CONFIRMED";

    await this.app.redis.setex(key, 86400, JSON.stringify(upload));
    // Remove from pending index
    await this.app.redis.srem(`pending_iep_index:${learnerId}`, uploadId);

    return upload;
  }
}
