import { describe, it, expect, vi, beforeEach } from "vitest";
import { LeadService } from "../services/lead.service.js";

const MOCK_UUID = "00000000-0000-4000-a000-000000000001";
const MOCK_UUID_2 = "00000000-0000-4000-a000-000000000002";
const MOCK_UUID_3 = "00000000-0000-4000-a000-000000000003";

function createMockApp() {
  return {
    db: {
      select: vi.fn().mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            orderBy: vi.fn().mockReturnValue({
              limit: vi.fn().mockReturnValue({
                offset: vi.fn().mockResolvedValue([]),
              }),
            }),
            limit: vi.fn().mockResolvedValue([]),
          }),
          orderBy: vi.fn().mockReturnValue({
            limit: vi.fn().mockReturnValue({
              offset: vi.fn().mockResolvedValue([]),
            }),
          }),
        }),
      }),
      insert: vi.fn().mockReturnValue({
        values: vi.fn().mockReturnValue({
          returning: vi.fn().mockResolvedValue([]),
        }),
      }),
      update: vi.fn().mockReturnValue({
        set: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            returning: vi.fn().mockResolvedValue([]),
          }),
        }),
      }),
    },
    nats: {
      jetstream: vi.fn().mockReturnValue({
        publish: vi.fn().mockResolvedValue(undefined),
      }),
    },
    sql: vi.fn().mockResolvedValue([]),
  } as any;
}

describe("LeadService", () => {
  let app: ReturnType<typeof createMockApp>;
  let service: LeadService;

  beforeEach(() => {
    app = createMockApp();
    service = new LeadService(app);
    vi.clearAllMocks();
  });

  describe("list", () => {
    it("should return paginated leads", async () => {
      const leadList = [
        { id: MOCK_UUID, organizationName: "School A", stage: "NEW" },
        { id: "00000000-0000-4000-a000-000000000006", organizationName: "School B", stage: "CONTACTED" },
      ];

      app.db.select
        .mockReturnValueOnce({
          from: vi.fn().mockReturnValue({
            where: vi.fn().mockReturnValue({
              orderBy: vi.fn().mockReturnValue({
                limit: vi.fn().mockReturnValue({
                  offset: vi.fn().mockResolvedValue(leadList),
                }),
              }),
            }),
          }),
        })
        .mockReturnValueOnce({
          from: vi.fn().mockReturnValue({
            where: vi.fn().mockResolvedValue([{ total: 2 }]),
          }),
        });

      const result = await service.list({});
      expect(result.items).toEqual(leadList);
      expect(result.pagination.total).toBe(2);
    });

    it("should filter by stage", async () => {
      app.db.select
        .mockReturnValueOnce({
          from: vi.fn().mockReturnValue({
            where: vi.fn().mockReturnValue({
              orderBy: vi.fn().mockReturnValue({
                limit: vi.fn().mockReturnValue({
                  offset: vi.fn().mockResolvedValue([]),
                }),
              }),
            }),
          }),
        })
        .mockReturnValueOnce({
          from: vi.fn().mockReturnValue({
            where: vi.fn().mockResolvedValue([{ total: 0 }]),
          }),
        });

      const result = await service.list({ stage: "DEMO_SCHEDULED" });
      expect(result.items).toEqual([]);
    });
  });

  describe("create", () => {
    it("should create lead and send confirmation email", async () => {
      const lead = {
        id: MOCK_UUID,
        organizationName: "New District",
        contactName: "John",
        contactEmail: "john@district.edu",
        stage: "NEW",
      };

      app.db.insert.mockReturnValue({
        values: vi.fn().mockReturnValue({
          returning: vi.fn().mockResolvedValue([lead]),
        }),
      });

      const result = await service.create({
        organizationName: "New District",
        contactName: "John",
        contactEmail: "john@district.edu",
        districtSize: 5000,
        source: "website",
      }, MOCK_UUID_2);

      expect(result.organizationName).toBe("New District");
      // Should publish comms.email.send for lead confirmation + audit log
      expect(app.nats.jetstream().publish).toHaveBeenCalled();
    });
  });

  describe("update", () => {
    it("should update lead stage", async () => {
      const lead = {
        id: MOCK_UUID,
        organizationName: "District",
        stage: "DEMO_COMPLETED",
      };

      app.db.update.mockReturnValue({
        set: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            returning: vi.fn().mockResolvedValue([lead]),
          }),
        }),
      });
      app.db.insert.mockReturnValue({
        values: vi.fn().mockReturnValue({
          returning: vi.fn().mockResolvedValue([{}]),
        }),
      });

      const result = await service.update(
        MOCK_UUID,
        { stage: "DEMO_COMPLETED" },
        MOCK_UUID_2,
      );

      expect(result.stage).toBe("DEMO_COMPLETED");
    });

    it("should reject invalid stage", async () => {
      await expect(
        service.update(MOCK_UUID, { stage: "INVALID" as any }, MOCK_UUID_2),
      ).rejects.toThrow("Invalid stage");
    });

    it("should throw 404 for missing lead", async () => {
      app.db.update.mockReturnValue({
        set: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            returning: vi.fn().mockResolvedValue([]),
          }),
        }),
      });

      await expect(
        service.update("nonexistent", { stage: "CONTACTED" }, MOCK_UUID_2),
      ).rejects.toThrow("Lead not found");
    });
  });

  describe("addNote", () => {
    it("should add a note to a lead", async () => {
      const lead = { id: MOCK_UUID, organizationName: "Test" };
      const note = { id: "00000000-0000-4000-a000-000000000004", leadId: MOCK_UUID, content: "Great demo" };

      app.db.select.mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            limit: vi.fn().mockResolvedValue([lead]),
          }),
        }),
      });
      app.db.insert.mockReturnValue({
        values: vi.fn().mockReturnValue({
          returning: vi.fn().mockResolvedValue([note]),
        }),
      });

      const result = await service.addNote(MOCK_UUID, "Great demo", MOCK_UUID_2);
      expect(result.content).toBe("Great demo");
    });

    it("should throw 404 for missing lead", async () => {
      app.db.select.mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            limit: vi.fn().mockResolvedValue([]),
          }),
        }),
      });

      await expect(
        service.addNote("nonexistent", "Note", MOCK_UUID_2),
      ).rejects.toThrow("Lead not found");
    });
  });

  describe("convert", () => {
    it("should convert lead to B2B tenant", async () => {
      const lead = {
        id: MOCK_UUID,
        organizationName: "Big District",
        contactName: "Jane",
        contactEmail: "jane@district.edu",
        stage: "NEGOTIATING",
        convertedTenantId: null,
        notes: [],
      };
      const tenant = { id: MOCK_UUID_3, name: "Big District", type: "B2B_DISTRICT", slug: "district-abc" };
      const user = { id: "00000000-0000-4000-a000-000000000005", email: "jane@district.edu", role: "DISTRICT_ADMIN" };

      // getById: select lead, then select notes
      app.db.select
        .mockReturnValueOnce({
          from: vi.fn().mockReturnValue({
            where: vi.fn().mockReturnValue({
              limit: vi.fn().mockResolvedValue([lead]),
            }),
          }),
        })
        .mockReturnValueOnce({
          from: vi.fn().mockReturnValue({
            where: vi.fn().mockReturnValue({
              orderBy: vi.fn().mockResolvedValue([]),
            }),
          }),
        });

      app.db.insert.mockReturnValue({
        values: vi.fn().mockReturnValue({
          returning: vi.fn().mockResolvedValue([tenant]),
        }),
      });

      // update lead stage
      app.db.update.mockReturnValue({
        set: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            returning: vi.fn().mockResolvedValue([{ ...lead, stage: "WON", convertedTenantId: MOCK_UUID_3 }]),
          }),
        }),
      });

      const result = await service.convert(MOCK_UUID, MOCK_UUID_2);
      expect(result.tenant.type).toBe("B2B_DISTRICT");
      expect(result.lead.stage).toBe("WON");
    });

    it("should reject already-converted lead", async () => {
      const lead = {
        id: MOCK_UUID,
        stage: "WON",
        convertedTenantId: MOCK_UUID_3,
        organizationName: "Test",
        contactName: "Jane",
        contactEmail: "jane@test.com",
        notes: [],
      };

      app.db.select
        .mockReturnValueOnce({
          from: vi.fn().mockReturnValue({
            where: vi.fn().mockReturnValue({
              limit: vi.fn().mockResolvedValue([lead]),
            }),
          }),
        })
        .mockReturnValueOnce({
          from: vi.fn().mockReturnValue({
            where: vi.fn().mockReturnValue({
              orderBy: vi.fn().mockResolvedValue([]),
            }),
          }),
        });

      await expect(
        service.convert(MOCK_UUID, MOCK_UUID_2),
      ).rejects.toThrow("Lead already converted");
    });
  });
});
