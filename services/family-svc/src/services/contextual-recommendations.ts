import type { RecommendationType } from "./recommendation.service.js";

/**
 * Contextual recommendation generator for the brain.cloned event.
 *
 * Analyzes domain scores, IEP goals, functioning level, and accommodations
 * to produce multiple personalized recommendations instead of a single
 * generic "review your child's Brain profile" message.
 */

interface BrainClonedData {
  learnerId: string;
  brainStateId: string;
  functioningLevel: string;
  domainScores?: Record<string, number>;
  iepGoals?: Array<{ id: string; domain: string; targetMetric?: string; text?: string }>;
  accommodations?: string[];
}

interface BrainContextData {
  masteryLevels: Record<string, Record<string, number>>;
  accommodations: string[];
  iepGoals: Array<{ id: string; text: string; domain: string }>;
  functioningLevel: string;
}

interface RecommendationInput {
  learnerId: string;
  brainStateId: string;
  type: RecommendationType;
  title: string;
  description: string;
  payload: Record<string, unknown>;
}

const DOMAIN_LABELS: Record<string, string> = {
  math: "Math",
  reading: "Reading",
  writing: "Writing",
  science: "Science",
  social_studies: "Social Studies",
  ela: "English Language Arts",
};

const FUNCTIONING_LEVEL_LABELS: Record<string, string> = {
  STANDARD: "standard",
  SUPPORTED: "supported",
  LOW_VERBAL: "low-verbal",
  NON_VERBAL: "non-verbal",
  PRE_SYMBOLIC: "pre-symbolic",
};

function domainLabel(domain: string): string {
  return DOMAIN_LABELS[domain] ?? domain.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

function thetaToGradeDescription(theta: number): string {
  if (theta <= -2.0) return "significantly below grade level";
  if (theta <= -1.0) return "below grade level";
  if (theta <= -0.3) return "slightly below grade level";
  if (theta <= 0.3) return "at grade level";
  if (theta <= 1.0) return "above grade level";
  return "well above grade level";
}

/**
 * Generate contextual initial recommendations from brain clone data.
 * Falls back to brain context API data if event payload lacks domain scores.
 */
export function generateInitialRecommendations(
  data: BrainClonedData,
  childName: string,
  brainContext?: BrainContextData | null,
): RecommendationInput[] {
  const recs: RecommendationInput[] = [];

  // Merge domain scores: prefer event payload, fall back to brain context mastery
  const domainScores = data.domainScores ?? flattenMasteryLevels(brainContext?.masteryLevels);
  const iepGoals = data.iepGoals ?? brainContext?.iepGoals ?? [];
  const accommodations = data.accommodations ?? brainContext?.accommodations ?? [];
  const functioningLevel = data.functioningLevel;

  // --- 1. Curriculum adjustments for weak domains (theta < -1.0) ---
  if (domainScores) {
    const weakDomains = Object.entries(domainScores).filter(([, score]) => score < -1.0);
    for (const [domain, score] of weakDomains) {
      const label = domainLabel(domain);
      const desc = thetaToGradeDescription(score);
      recs.push({
        learnerId: data.learnerId,
        brainStateId: data.brainStateId,
        type: "CURRICULUM_ADJUSTMENT",
        title: `Foundational support needed in ${label}`,
        description: `Based on the assessment, ${childName} scored ${desc} in ${label} (score: ${score.toFixed(1)}). ` +
          `We recommend starting with foundational activities to build confidence before advancing. ` +
          `The AI tutor will adapt lessons to ${childName}'s current level and gradually increase difficulty.`,
        payload: { domain, theta: score, level: desc },
      });
    }
  }

  // --- 2. Tutor suggestions for strong domains (theta > 0.5) ---
  if (domainScores) {
    const strongDomains = Object.entries(domainScores).filter(([, score]) => score > 0.5);
    for (const [domain, score] of strongDomains) {
      const label = domainLabel(domain);
      recs.push({
        learnerId: data.learnerId,
        brainStateId: data.brainStateId,
        type: "TUTOR_ADDON",
        title: `${childName} shows strength in ${label}!`,
        description: `${childName} is performing ${thetaToGradeDescription(score)} in ${label} (score: ${score.toFixed(1)}). ` +
          `Consider enabling the ${label} AI Tutor to provide enrichment activities and ` +
          `more challenging problems to keep ${childName} engaged and growing.`,
        payload: { domain, theta: score },
      });
    }
  }

  // --- 3. IEP goal alignment ---
  if (iepGoals.length > 0) {
    const goalSummaries = iepGoals.map((g) => {
      const label = domainLabel(g.domain);
      const target = g.targetMetric || g.text || "target metric";
      return `${label}: ${target}`;
    });

    recs.push({
      learnerId: data.learnerId,
      brainStateId: data.brainStateId,
      type: "IEP_GOAL_UPDATE",
      title: `IEP goals aligned for ${childName}`,
      description: `Based on ${childName}'s IEP, we've aligned the curriculum to target the following goals:\n\n` +
        goalSummaries.map((s) => `• ${s}`).join("\n") +
        `\n\nProgress will be tracked against these benchmarks, and you'll receive updates as ${childName} makes progress.`,
      payload: {
        goalCount: iepGoals.length,
        goals: iepGoals.map((g) => ({ id: g.id, domain: g.domain, target: g.targetMetric || g.text })),
      },
    });
  }

  // --- 4. Overall assessment summary (always included) ---
  const summaryParts: string[] = [];

  if (domainScores && Object.keys(domainScores).length > 0) {
    const scoreLines = Object.entries(domainScores)
      .sort(([, a], [, b]) => b - a)
      .map(([domain, score]) => `• ${domainLabel(domain)}: ${thetaToGradeDescription(score)} (${score.toFixed(1)})`);
    summaryParts.push(`Assessment results:\n${scoreLines.join("\n")}`);
  }

  const flLabel = FUNCTIONING_LEVEL_LABELS[functioningLevel] ?? functioningLevel;
  summaryParts.push(`Functioning level: ${flLabel}`);

  if (accommodations.length > 0) {
    summaryParts.push(`Active accommodations: ${accommodations.join(", ")}`);
  }

  summaryParts.push(
    `${childName}'s Brain profile has been initialized and the AI tutor is ready. ` +
    `Review the details above and approve to begin personalized learning, or adjust if anything needs correction.`,
  );

  recs.push({
    learnerId: data.learnerId,
    brainStateId: data.brainStateId,
    type: "ASSESSMENT_REBASELINE",
    title: `${childName}'s Brain profile is ready for review`,
    description: summaryParts.join("\n\n"),
    payload: {
      functioningLevel,
      domainScores: domainScores ?? {},
      accommodations,
      iepGoalCount: iepGoals.length,
    },
  });

  return recs;
}

/**
 * Flatten nested masteryLevels (domain → skill → score) to domain-level averages.
 */
function flattenMasteryLevels(
  masteryLevels?: Record<string, Record<string, number>>,
): Record<string, number> | undefined {
  if (!masteryLevels || Object.keys(masteryLevels).length === 0) return undefined;

  const result: Record<string, number> = {};
  for (const [domain, skills] of Object.entries(masteryLevels)) {
    const values = Object.values(skills);
    if (values.length > 0) {
      result[domain] = values.reduce((sum, v) => sum + v, 0) / values.length;
    }
  }
  return result;
}
