import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  TUTOR_CATALOG,
  BUNDLE_SKU,
  INDIVIDUAL_SKUS,
  getSkuForSubject,
  getSubjectForSku,
} from "../data/tutor-catalog.js";
import { CatalogService } from "../services/catalog.service.js";

/* ------------------------------------------------------------------ */
/*  Mock @aivo/db so drizzle table references resolve                 */
/* ------------------------------------------------------------------ */
vi.mock("@aivo/db", () => ({
  tutorSubscriptions: {
    sku: "sku",
    learnerId: "learnerId",
    status: "status",
  },
}));

vi.mock("drizzle-orm", () => ({
  eq: vi.fn((_col, val) => ({ _op: "eq", val })),
  and: vi.fn((...conds: unknown[]) => ({ _op: "and", conds })),
  or: vi.fn((...conds: unknown[]) => ({ _op: "or", conds })),
}));

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */
function createMockApp(queryResult: unknown[] = []) {
  return {
    db: {
      select: vi.fn().mockReturnThis(),
      from: vi.fn().mockReturnThis(),
      where: vi.fn().mockReturnValue(queryResult),
    },
    log: { info: vi.fn(), error: vi.fn(), warn: vi.fn() },
  } as any;
}

/* ================================================================== */
/*  TUTOR_CATALOG static data                                         */
/* ================================================================== */
describe("TUTOR_CATALOG data", () => {
  it("contains exactly 6 items", () => {
    expect(TUTOR_CATALOG).toHaveLength(6);
  });

  it("has the correct SKUs in the expected order", () => {
    const skus = TUTOR_CATALOG.map((i) => i.sku);
    expect(skus).toEqual([
      "ADDON_TUTOR_MATH",
      "ADDON_TUTOR_ELA",
      "ADDON_TUTOR_SCIENCE",
      "ADDON_TUTOR_HISTORY",
      "ADDON_TUTOR_CODING",
      "ADDON_TUTOR_BUNDLE",
    ]);
  });

  it("individual items are priced at 4.99", () => {
    TUTOR_CATALOG.filter((i) => i.sku !== BUNDLE_SKU).forEach((item) => {
      expect(item.price).toBe(4.99);
    });
  });

  it("bundle is priced at 14.99", () => {
    const bundle = TUTOR_CATALOG.find((i) => i.sku === BUNDLE_SKU);
    expect(bundle).toBeDefined();
    expect(bundle!.price).toBe(14.99);
  });

  it("every item has required fields (sku, name, subject, persona, description, price)", () => {
    for (const item of TUTOR_CATALOG) {
      expect(item.sku).toBeTruthy();
      expect(item.name).toBeTruthy();
      expect(item.subject).toBeTruthy();
      expect(item.persona).toBeTruthy();
      expect(item.description).toBeTruthy();
      expect(typeof item.price).toBe("number");
    }
  });

  it("each item has a unique sku", () => {
    const skus = TUTOR_CATALOG.map((i) => i.sku);
    expect(new Set(skus).size).toBe(skus.length);
  });

  it("each item has a unique persona", () => {
    const personas = TUTOR_CATALOG.map((i) => i.persona);
    expect(new Set(personas).size).toBe(personas.length);
  });

  it("maps subjects to correct personas", () => {
    const expected: Record<string, string> = {
      math: "nova",
      ela: "sage",
      science: "spark",
      history: "chrono",
      coding: "pixel",
      all: "bundle",
    };
    for (const item of TUTOR_CATALOG) {
      expect(item.persona).toBe(expected[item.subject]);
    }
  });
});

/* ================================================================== */
/*  Helper constants                                                   */
/* ================================================================== */
describe("BUNDLE_SKU / INDIVIDUAL_SKUS", () => {
  it("BUNDLE_SKU is ADDON_TUTOR_BUNDLE", () => {
    expect(BUNDLE_SKU).toBe("ADDON_TUTOR_BUNDLE");
  });

  it("INDIVIDUAL_SKUS contains exactly 5 SKUs (no bundle)", () => {
    expect(INDIVIDUAL_SKUS).toHaveLength(5);
    expect(INDIVIDUAL_SKUS).not.toContain(BUNDLE_SKU);
  });

  it("INDIVIDUAL_SKUS contains all non-bundle SKUs", () => {
    expect(INDIVIDUAL_SKUS).toContain("ADDON_TUTOR_MATH");
    expect(INDIVIDUAL_SKUS).toContain("ADDON_TUTOR_ELA");
    expect(INDIVIDUAL_SKUS).toContain("ADDON_TUTOR_SCIENCE");
    expect(INDIVIDUAL_SKUS).toContain("ADDON_TUTOR_HISTORY");
    expect(INDIVIDUAL_SKUS).toContain("ADDON_TUTOR_CODING");
  });
});

/* ================================================================== */
/*  getSkuForSubject                                                   */
/* ================================================================== */
describe("getSkuForSubject", () => {
  it("returns the correct SKU for each known subject", () => {
    expect(getSkuForSubject("math")).toBe("ADDON_TUTOR_MATH");
    expect(getSkuForSubject("ela")).toBe("ADDON_TUTOR_ELA");
    expect(getSkuForSubject("science")).toBe("ADDON_TUTOR_SCIENCE");
    expect(getSkuForSubject("history")).toBe("ADDON_TUTOR_HISTORY");
    expect(getSkuForSubject("coding")).toBe("ADDON_TUTOR_CODING");
  });

  it("returns null for the bundle subject 'all'", () => {
    expect(getSkuForSubject("all")).toBeNull();
  });

  it("returns null for an unknown subject", () => {
    expect(getSkuForSubject("music")).toBeNull();
    expect(getSkuForSubject("art")).toBeNull();
    expect(getSkuForSubject("")).toBeNull();
  });
});

/* ================================================================== */
/*  getSubjectForSku                                                   */
/* ================================================================== */
describe("getSubjectForSku", () => {
  it("returns the correct subject for each known SKU", () => {
    expect(getSubjectForSku("ADDON_TUTOR_MATH")).toBe("math");
    expect(getSubjectForSku("ADDON_TUTOR_ELA")).toBe("ela");
    expect(getSubjectForSku("ADDON_TUTOR_SCIENCE")).toBe("science");
    expect(getSubjectForSku("ADDON_TUTOR_HISTORY")).toBe("history");
    expect(getSubjectForSku("ADDON_TUTOR_CODING")).toBe("coding");
    expect(getSubjectForSku("ADDON_TUTOR_BUNDLE")).toBe("all");
  });

  it("returns null for an unknown SKU", () => {
    expect(getSubjectForSku("ADDON_TUTOR_ART")).toBeNull();
    expect(getSubjectForSku("RANDOM_SKU")).toBeNull();
    expect(getSubjectForSku("")).toBeNull();
  });
});

/* ================================================================== */
/*  CatalogService                                                     */
/* ================================================================== */
describe("CatalogService", () => {
  let app: ReturnType<typeof createMockApp>;
  let service: CatalogService;

  beforeEach(() => {
    vi.clearAllMocks();
    app = createMockApp();
    service = new CatalogService(app);
  });

  describe("getCatalog", () => {
    it("returns all items with subscribed=false when no learnerId provided", async () => {
      const catalog = await service.getCatalog();

      expect(catalog).toHaveLength(6);
      for (const item of catalog) {
        expect(item.subscribed).toBe(false);
      }
      expect(app.db.select).not.toHaveBeenCalled();
    });

    it("returns all items with subscribed=false when learnerId is undefined", async () => {
      const catalog = await service.getCatalog(undefined);

      expect(catalog).toHaveLength(6);
      for (const item of catalog) {
        expect(item.subscribed).toBe(false);
      }
      expect(app.db.select).not.toHaveBeenCalled();
    });

    it("marks subscribed items correctly when learnerId is provided", async () => {
      app = createMockApp([
        { sku: "ADDON_TUTOR_MATH" },
        { sku: "ADDON_TUTOR_ELA" },
      ]);
      service = new CatalogService(app);

      const catalog = await service.getCatalog("learner-1");

      expect(app.db.select).toHaveBeenCalled();

      const math = catalog.find((i) => i.sku === "ADDON_TUTOR_MATH");
      const ela = catalog.find((i) => i.sku === "ADDON_TUTOR_ELA");
      const science = catalog.find((i) => i.sku === "ADDON_TUTOR_SCIENCE");

      expect(math!.subscribed).toBe(true);
      expect(ela!.subscribed).toBe(true);
      expect(science!.subscribed).toBe(false);
    });

    it("marks all items subscribed when learner has all SKUs", async () => {
      app = createMockApp(
        TUTOR_CATALOG.map((i) => ({ sku: i.sku })),
      );
      service = new CatalogService(app);

      const catalog = await service.getCatalog("learner-all");

      for (const item of catalog) {
        expect(item.subscribed).toBe(true);
      }
    });

    it("returns all subscribed=false when learner has no active subs", async () => {
      app = createMockApp([]);
      service = new CatalogService(app);

      const catalog = await service.getCatalog("learner-empty");

      for (const item of catalog) {
        expect(item.subscribed).toBe(false);
      }
    });

    it("preserves all original catalog fields in the result", async () => {
      const catalog = await service.getCatalog();

      for (let i = 0; i < catalog.length; i++) {
        expect(catalog[i].sku).toBe(TUTOR_CATALOG[i].sku);
        expect(catalog[i].name).toBe(TUTOR_CATALOG[i].name);
        expect(catalog[i].subject).toBe(TUTOR_CATALOG[i].subject);
        expect(catalog[i].persona).toBe(TUTOR_CATALOG[i].persona);
        expect(catalog[i].price).toBe(TUTOR_CATALOG[i].price);
        expect(catalog[i].description).toBe(TUTOR_CATALOG[i].description);
      }
    });
  });

  describe("getCatalogItem", () => {
    it("returns the catalog item for a valid SKU", () => {
      const item = service.getCatalogItem("ADDON_TUTOR_MATH");
      expect(item).not.toBeNull();
      expect(item!.sku).toBe("ADDON_TUTOR_MATH");
      expect(item!.subject).toBe("math");
    });

    it("returns null for an unknown SKU", () => {
      const item = service.getCatalogItem("ADDON_TUTOR_ART");
      expect(item).toBeNull();
    });

    it("returns the bundle item", () => {
      const item = service.getCatalogItem("ADDON_TUTOR_BUNDLE");
      expect(item).not.toBeNull();
      expect(item!.subject).toBe("all");
      expect(item!.price).toBe(14.99);
    });

    it("returns correct items for all individual SKUs", () => {
      for (const sku of INDIVIDUAL_SKUS) {
        const item = service.getCatalogItem(sku);
        expect(item).not.toBeNull();
        expect(item!.sku).toBe(sku);
        expect(item!.price).toBe(4.99);
      }
    });

    it("returns null for empty string", () => {
      expect(service.getCatalogItem("")).toBeNull();
    });
  });
});
