import { describe, it, expect } from "vitest";
import {
  organizationSchema,
  websiteSchema,
  productSchema,
  faqSchema,
  breadcrumbSchema,
  articleSchema,
} from "@/lib/structured-data";

describe("Structured Data", () => {
  it("organizationSchema returns valid JSON with required fields", () => {
    const schema = organizationSchema();
    expect(schema["@context"]).toBe("https://schema.org");
    expect(schema["@type"]).toBe("Organization");
    expect(schema.name).toBe("AIVO Learning");
    expect(schema.url).toBeDefined();
    expect(schema.logo).toBeDefined();
    expect(schema.contactPoint).toBeDefined();
    expect(schema.contactPoint.telephone).toBeDefined();
    expect(schema.contactPoint.contactType).toBe("customer service");
    // No undefined values
    expect(JSON.stringify(schema)).not.toContain("undefined");
  });

  it("websiteSchema returns valid JSON", () => {
    const schema = websiteSchema();
    expect(schema["@type"]).toBe("WebSite");
    expect(schema.potentialAction["@type"]).toBe("SearchAction");
    expect(JSON.stringify(schema)).not.toContain("undefined");
  });

  it("productSchema returns valid JSON with offers", () => {
    const schema = productSchema();
    expect(schema["@type"]).toBe("SoftwareApplication");
    expect(schema.offers.length).toBe(2);
    expect(schema.aggregateRating.ratingValue).toBe("4.9");
    expect(JSON.stringify(schema)).not.toContain("undefined");
  });

  it("faqSchema maps items correctly", () => {
    const items = [
      { question: "Q1", answer: "A1" },
      { question: "Q2", answer: "A2" },
    ];
    const schema = faqSchema(items);
    expect(schema["@type"]).toBe("FAQPage");
    expect(schema.mainEntity.length).toBe(2);
    expect(schema.mainEntity[0]["@type"]).toBe("Question");
    expect(schema.mainEntity[0].name).toBe("Q1");
    expect(schema.mainEntity[0].acceptedAnswer.text).toBe("A1");
    expect(JSON.stringify(schema)).not.toContain("undefined");
  });

  it("breadcrumbSchema generates correct itemListElement array", () => {
    const items = [
      { name: "Home", url: "https://aivolearning.com" },
      { name: "Pricing", url: "https://aivolearning.com/pricing" },
    ];
    const schema = breadcrumbSchema(items);
    expect(schema["@type"]).toBe("BreadcrumbList");
    expect(schema.itemListElement.length).toBe(2);
    expect(schema.itemListElement[0].position).toBe(1);
    expect(schema.itemListElement[0].name).toBe("Home");
    expect(schema.itemListElement[1].position).toBe(2);
    expect(JSON.stringify(schema)).not.toContain("undefined");
  });

  it("articleSchema returns valid JSON", () => {
    const article = {
      title: "Test Article",
      description: "A test",
      url: "https://aivolearning.com/blog/test",
      imageUrl: "https://aivolearning.com/blog/test.png",
      datePublished: "2025-01-01",
      dateModified: "2025-01-02",
      authorName: "John Doe",
    };
    const schema = articleSchema(article);
    expect(schema["@type"]).toBe("Article");
    expect(schema.headline).toBe("Test Article");
    expect(schema.author.name).toBe("John Doe");
    expect(JSON.stringify(schema)).not.toContain("undefined");
  });
});
