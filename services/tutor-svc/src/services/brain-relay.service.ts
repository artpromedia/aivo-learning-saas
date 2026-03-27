import { eq } from "drizzle-orm";
import type { FastifyInstance } from "fastify";
import { learners } from "@aivo/db";

export interface BrainContext {
  learnerId: string;
  masteryLevels: Record<string, number>;
  recentTopics: string[];
  learningPreferences: Record<string, unknown>;
  functioningLevel: string;
  communicationMode: string;
  enrolledGrade: number | null;
}

export interface AdaptedContext extends BrainContext {
  sessionParameters: {
    maxResponseLength: number;
    scaffoldingLevel: string;
    useVisualSupports: boolean;
    parentInvolvementRequired: boolean;
    simplifiedLanguage: boolean;
  };
}

export class BrainRelayService {
  constructor(private readonly app: FastifyInstance) {}

  async fetchContext(learnerId: string): Promise<BrainContext> {
    // Fetch brain context from brain service
    const brainData =
      await this.app.brainClient.getBrainContext(learnerId);

    // Also fetch learner profile for functioning level info
    const [learner] = await this.app.db
      .select()
      .from(learners)
      .where(eq(learners.id, learnerId))
      .limit(1);

    return {
      learnerId,
      masteryLevels: brainData.masteryLevels ?? {},
      recentTopics: brainData.recentTopics ?? [],
      learningPreferences: brainData.learningPreferences ?? {},
      functioningLevel: learner?.functioningLevel ?? "STANDARD",
      communicationMode: learner?.communicationMode ?? "VERBAL",
      enrolledGrade: learner?.enrolledGrade ?? null,
    };
  }

  adaptForFunctioningLevel(
    context: BrainContext,
    functioningLevel: string,
  ): AdaptedContext {
    const adaptations: Record<
      string,
      AdaptedContext["sessionParameters"]
    > = {
      STANDARD: {
        maxResponseLength: 500,
        scaffoldingLevel: "minimal",
        useVisualSupports: false,
        parentInvolvementRequired: false,
        simplifiedLanguage: false,
      },
      SUPPORTED: {
        maxResponseLength: 300,
        scaffoldingLevel: "moderate",
        useVisualSupports: true,
        parentInvolvementRequired: false,
        simplifiedLanguage: true,
      },
      LOW_VERBAL: {
        maxResponseLength: 150,
        scaffoldingLevel: "high",
        useVisualSupports: true,
        parentInvolvementRequired: true,
        simplifiedLanguage: true,
      },
      NON_VERBAL: {
        maxResponseLength: 100,
        scaffoldingLevel: "maximum",
        useVisualSupports: true,
        parentInvolvementRequired: true,
        simplifiedLanguage: true,
      },
      PRE_SYMBOLIC: {
        maxResponseLength: 80,
        scaffoldingLevel: "maximum",
        useVisualSupports: true,
        parentInvolvementRequired: true,
        simplifiedLanguage: true,
      },
    };

    const sessionParameters = adaptations[functioningLevel] ??
      adaptations.STANDARD;

    return {
      ...context,
      sessionParameters,
    };
  }
}
