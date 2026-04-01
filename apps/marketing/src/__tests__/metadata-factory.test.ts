import { describe, it, expect } from "vitest";
import { createPageMetadata } from "@/lib/metadata-factory";

describe("createPageMetadata", () => {
  it("generates title from config", () => {
    const meta = createPageMetadata({
      title: "Pricing",
      description: "Simple pricing",
      path: "/pricing",
    });
    expect(meta.title).toBe("Pricing");
  });

  it("generates correct canonical URL", () => {
    const meta = createPageMetadata({
      title: "Test",
      description: "Test desc",
      path: "/demo",
    });
    expect(meta.alternates?.canonical).toBe("https://aivolearning.com/demo");
  });

  it("sets openGraph image", () => {
    const meta = createPageMetadata({
      title: "Test",
      description: "Test desc",
      path: "/",
    });
    const og = meta.openGraph as Record<string, unknown>;
    expect(og.images).toBeDefined();
  });

  it("uses custom ogImage when provided", () => {
    const meta = createPageMetadata({
      title: "Test",
      description: "Test",
      path: "/",
      ogImage: "https://aivolearning.com/custom-og.png",
    });
    const og = meta.openGraph as Record<string, unknown>;
    const images = og.images as Array<{ url: string }>;
    expect(images[0].url).toBe("https://aivolearning.com/custom-og.png");
  });

  it("sets noIndex when requested", () => {
    const meta = createPageMetadata({
      title: "Test",
      description: "Test",
      path: "/",
      noIndex: true,
    });
    const robots = meta.robots as Record<string, boolean>;
    expect(robots.index).toBe(false);
    expect(robots.follow).toBe(false);
  });
});
