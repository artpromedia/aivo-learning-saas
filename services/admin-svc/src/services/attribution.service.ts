import type { FastifyInstance } from "fastify";
import { leads } from "@aivo/db";
import { eq, gte, and, sql, count } from "drizzle-orm";

interface SourceMapping {
  category: string;
  label: string;
}

const SOURCE_MAP: Record<string, SourceMapping> = {
  google: { category: "PAID_SEARCH", label: "Google Ads" },
  facebook: { category: "PAID_SOCIAL", label: "Facebook Ads" },
  instagram: { category: "PAID_SOCIAL", label: "Instagram Ads" },
  linkedin: { category: "PAID_SOCIAL", label: "LinkedIn Ads" },
  twitter: { category: "PAID_SOCIAL", label: "Twitter Ads" },
  email: { category: "EMAIL", label: "Email Campaign" },
  newsletter: { category: "EMAIL", label: "Newsletter" },
};

export class AttributionService {
  constructor(private readonly app: FastifyInstance) {}

  categorizeSource(utmSource?: string, referrer?: string): SourceMapping {
    if (utmSource) {
      const mapped = SOURCE_MAP[utmSource.toLowerCase()];
      if (mapped) return mapped;
    }

    if (referrer) {
      if (referrer.includes("google.com")) return { category: "ORGANIC_SEARCH", label: "Google Organic" };
      if (referrer.includes("bing.com")) return { category: "ORGANIC_SEARCH", label: "Bing Organic" };
      if (referrer.includes("facebook.com")) return { category: "ORGANIC_SOCIAL", label: "Facebook Organic" };
      if (referrer.includes("linkedin.com")) return { category: "ORGANIC_SOCIAL", label: "LinkedIn Organic" };
      if (referrer.includes("twitter.com") || referrer.includes("x.com")) return { category: "ORGANIC_SOCIAL", label: "X Organic" };
    }

    return { category: "DIRECT", label: "Direct" };
  }

  scoreLeadFromSource(source: string, districtSize?: number, email?: string): number {
    let score = 0;

    // Source scoring
    const sourceScores: Record<string, number> = {
      demo_form: 50,
      contact_form: 30,
      exit_intent: 10,
    };
    score += sourceScores[source] ?? 5;

    // District size scoring
    if (districtSize) {
      if (districtSize >= 1000) score += 40;
      else if (districtSize >= 500) score += 30;
      else if (districtSize >= 200) score += 20;
      else if (districtSize >= 50) score += 10;
    }

    // .edu email bonus
    if (email?.endsWith(".edu")) score += 20;

    return score;
  }

  getLeadTemperature(score: number): "HOT" | "WARM" | "COLD" {
    if (score >= 100) return "HOT";
    if (score >= 50) return "WARM";
    return "COLD";
  }

  async getMarketingAnalytics(daysBack: number = 30) {
    const since = new Date();
    since.setDate(since.getDate() - daysBack);

    const leadsBySource = await this.app.db
      .select({
        source: leads.source,
        count: count(),
      })
      .from(leads)
      .where(gte(leads.createdAt, since))
      .groupBy(leads.source);

    const leadsByStage = await this.app.db
      .select({
        stage: leads.stage,
        count: count(),
      })
      .from(leads)
      .where(gte(leads.createdAt, since))
      .groupBy(leads.stage);

    const totalLeads = leadsBySource.reduce((sum, r) => sum + r.count, 0);
    const wonLeads = leadsByStage.find((r) => r.stage === "WON")?.count ?? 0;
    const conversionRate = totalLeads > 0 ? (wonLeads / totalLeads) * 100 : 0;

    return {
      period: { days: daysBack, since: since.toISOString() },
      totalLeads,
      conversionRate: Math.round(conversionRate * 100) / 100,
      bySource: leadsBySource,
      byStage: leadsByStage,
    };
  }
}
