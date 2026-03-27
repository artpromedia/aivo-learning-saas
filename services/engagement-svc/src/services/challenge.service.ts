import type { FastifyInstance } from "fastify";
import { publishEvent } from "@aivo/events";
import { ChallengeEngine, type AnswerSubmission, type ChallengeQuestion } from "../engines/challenge-engine.js";
import { XpEngine } from "../engines/xp-engine.js";
import { calculateChallengeXp } from "../data/xp-awards.js";

export class ChallengeService {
  private readonly engine: ChallengeEngine;
  private readonly xpEngine: XpEngine;

  constructor(private readonly app: FastifyInstance) {
    this.engine = new ChallengeEngine(app);
    this.xpEngine = new XpEngine(app);
  }

  async createChallenge(
    creatorId: string,
    creatorName: string,
    subject: string,
    questions: ChallengeQuestion[],
  ) {
    return this.engine.createChallenge(creatorId, creatorName, subject, questions);
  }

  async joinChallenge(inviteCode: string, learnerId: string, learnerName: string) {
    return this.engine.joinChallenge(inviteCode, learnerId, learnerName);
  }

  async submitAnswers(challengeId: string, learnerId: string, answers: AnswerSubmission[]) {
    const result = await this.engine.submitAnswers(challengeId, learnerId, answers);

    // Check if challenge completed
    const challenge = await this.engine.getChallenge(challengeId);
    if (challenge && challenge.status === "completed") {
      const winnerId = this.engine.getWinner(challenge);

      // Award XP to all participants
      for (const player of challenge.players) {
        const won = player.learnerId === winnerId;
        const { xp, coins } = calculateChallengeXp(won);

        await this.xpEngine.awardXp(
          player.learnerId,
          "challenge_completed",
          "engagement.challenge.completed",
          xp,
          coins,
        );

        await publishEvent(this.app.nats, "engagement.challenge.completed", {
          learnerId: player.learnerId,
          challengeId,
          won,
        });

        if (won) {
          // Track wins for badge evaluation
          await this.app.redis.incr(`challenge_wins:${player.learnerId}`);
        }
      }
    }

    return result;
  }

  async getResult(challengeId: string) {
    return this.engine.getChallengeResult(challengeId);
  }

  async getActiveChallenges(learnerId: string) {
    return this.engine.getActiveChallenges(learnerId);
  }
}
