import { describe, it, expect, vi } from "vitest";
import { DataExportService } from "../services/data-export.service.js";

const LEARNER_ID = "b0000000-0000-4000-a000-000000000001";
const USER_ID = "c0000000-0000-4000-a000-000000000001";

function createMockApp() {
  return {
    db: {
      select: vi.fn().mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            orderBy: vi.fn().mockResolvedValue([]),
            limit: vi.fn().mockResolvedValue([{ id: LEARNER_ID, name: "Alex", parentId: USER_ID }]),
          }),
          innerJoin: vi.fn().mockReturnValue({
            where: vi.fn().mockResolvedValue([]),
          }),
        }),
      }),
    },
    s3: {
      uploadExport: vi.fn().mockResolvedValue("https://s3.example.com/exports/test.json"),
      getSignedUrl: vi.fn().mockResolvedValue("https://s3.example.com/exports/test.json?signed=true"),
    },
    nats: {
      jetstream: vi.fn().mockReturnValue({
        publish: vi.fn().mockResolvedValue(undefined),
      }),
    },
    log: { info: vi.fn(), error: vi.fn(), warn: vi.fn(), debug: vi.fn() },
  };
}

describe("DataExportService", () => {
  describe("initiateExport", () => {
    it("collects data, uploads to S3, and returns download URL", async () => {
      const mockApp = createMockApp();
      const service = new DataExportService(mockApp as never);
      const result = await service.initiateExport(LEARNER_ID, USER_ID);

      expect(result.exportId).toBeTruthy();
      expect(result.status).toBe("ready");
      expect(result.downloadUrl).toContain("signed=true");
      expect(result.expiresAt).toBeTruthy();
      expect(mockApp.s3.uploadExport).toHaveBeenCalled();
    });

    it("notifies parent when export is ready", async () => {
      const mockApp = createMockApp();
      const service = new DataExportService(mockApp as never);
      await service.initiateExport(LEARNER_ID, USER_ID);

      const jetstream = mockApp.nats.jetstream();
      expect(jetstream.publish).toHaveBeenCalled();
    });
  });

  describe("collectAllData", () => {
    it("returns structured export with all data categories", async () => {
      const mockApp = createMockApp();
      const service = new DataExportService(mockApp as never);
      const data = await service.collectAllData(LEARNER_ID);

      expect(data.exportedAt).toBeTruthy();
      expect(data.learner).toBeDefined();
      expect(data.brain).toBeDefined();
      expect(data.learning).toBeDefined();
      expect(data.recommendations).toBeDefined();
      expect(data.iep).toBeDefined();
      expect(data.engagement).toBeDefined();
    });

    it("includes brain state, snapshots, and episodes", async () => {
      const mockApp = createMockApp();
      const service = new DataExportService(mockApp as never);
      const data = await service.collectAllData(LEARNER_ID);

      const brain = data.brain as { state: unknown; snapshots: unknown[]; episodes: unknown[] };
      expect(brain).toHaveProperty("state");
      expect(brain).toHaveProperty("snapshots");
      expect(brain).toHaveProperty("episodes");
    });

    it("includes IEP documents and goals", async () => {
      const mockApp = createMockApp();
      const service = new DataExportService(mockApp as never);
      const data = await service.collectAllData(LEARNER_ID);

      const iep = data.iep as { documents: unknown[]; goals: unknown[] };
      expect(iep).toHaveProperty("documents");
      expect(iep).toHaveProperty("goals");
    });
  });
});
