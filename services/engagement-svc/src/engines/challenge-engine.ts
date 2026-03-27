import type { FastifyInstance } from "fastify";

export interface Challenge {
  id: string;
  subject: string;
  creatorId: string;
  inviteCode: string;
  players: ChallengePlayer[];
  questions: ChallengeQuestion[];
  status: "waiting" | "in_progress" | "completed";
  maxPlayers: number;
  createdAt: string;
  completedAt: string | null;
}

export interface ChallengePlayer {
  learnerId: string;
  name: string;
  score: number;
  answeredCount: number;
  joinedAt: string;
}

export interface ChallengeQuestion {
  id: string;
  prompt: string;
  options: string[];
  correctAnswer: string;
  timeLimitMs: number;
}

export interface AnswerSubmission {
  questionId: string;
  answer: string;
  timeMs: number;
}

const CHALLENGE_PREFIX = "challenge:";
const CHALLENGE_CODE_PREFIX = "challenge_code:";
const POINTS_CORRECT = 100;
const SPEED_BONUS_MAX = 50;
const TIME_LIMIT_MS = 5000;

export class ChallengeEngine {
  constructor(private readonly app: FastifyInstance) {}

  async createChallenge(
    creatorId: string,
    creatorName: string,
    subject: string,
    questions: ChallengeQuestion[],
  ): Promise<Challenge> {
    const id = crypto.randomUUID();
    const inviteCode = this.generateInviteCode();

    const challenge: Challenge = {
      id,
      subject,
      creatorId,
      inviteCode,
      players: [
        {
          learnerId: creatorId,
          name: creatorName,
          score: 0,
          answeredCount: 0,
          joinedAt: new Date().toISOString(),
        },
      ],
      questions,
      status: "waiting",
      maxPlayers: 4,
      createdAt: new Date().toISOString(),
      completedAt: null,
    };

    await this.app.redis.set(
      `${CHALLENGE_PREFIX}${id}`,
      JSON.stringify(challenge),
      "EX",
      3600, // 1hr TTL
    );

    // Map invite code to challenge ID
    await this.app.redis.set(
      `${CHALLENGE_CODE_PREFIX}${inviteCode}`,
      id,
      "EX",
      3600,
    );

    // Track active challenges per learner
    await this.app.redis.sadd(`challenges:${creatorId}`, id);

    return challenge;
  }

  async joinChallenge(
    inviteCode: string,
    learnerId: string,
    learnerName: string,
  ): Promise<Challenge> {
    const challengeId = await this.app.redis.get(`${CHALLENGE_CODE_PREFIX}${inviteCode}`);
    if (!challengeId) {
      throw Object.assign(new Error("Invalid invite code"), { statusCode: 404 });
    }

    const challenge = await this.getChallenge(challengeId);
    if (!challenge) {
      throw Object.assign(new Error("Challenge not found"), { statusCode: 404 });
    }

    if (challenge.status !== "waiting") {
      throw Object.assign(new Error("Challenge already started"), { statusCode: 400 });
    }

    if (challenge.players.length >= challenge.maxPlayers) {
      throw Object.assign(new Error("Challenge is full"), { statusCode: 400 });
    }

    if (challenge.players.some((p) => p.learnerId === learnerId)) {
      return challenge;
    }

    challenge.players.push({
      learnerId,
      name: learnerName,
      score: 0,
      answeredCount: 0,
      joinedAt: new Date().toISOString(),
    });

    await this.saveChallenge(challenge);
    await this.app.redis.sadd(`challenges:${learnerId}`, challenge.id);

    return challenge;
  }

  async submitAnswers(
    challengeId: string,
    learnerId: string,
    answers: AnswerSubmission[],
  ): Promise<{ score: number; correctCount: number }> {
    const challenge = await this.getChallenge(challengeId);
    if (!challenge) {
      throw Object.assign(new Error("Challenge not found"), { statusCode: 404 });
    }

    const player = challenge.players.find((p) => p.learnerId === learnerId);
    if (!player) {
      throw Object.assign(new Error("Not a participant"), { statusCode: 403 });
    }

    if (challenge.status === "waiting") {
      challenge.status = "in_progress";
    }

    let totalScore = 0;
    let correctCount = 0;

    for (const answer of answers) {
      const question = challenge.questions.find((q) => q.id === answer.questionId);
      if (!question) continue;

      const correct = answer.answer === question.correctAnswer;
      if (correct) {
        correctCount++;
        const speedBonus = Math.max(0, Math.round(SPEED_BONUS_MAX * (1 - answer.timeMs / TIME_LIMIT_MS)));
        totalScore += POINTS_CORRECT + speedBonus;
      }
    }

    player.score = totalScore;
    player.answeredCount = answers.length;

    // Check if all players have submitted
    const allSubmitted = challenge.players.every((p) => p.answeredCount > 0);
    if (allSubmitted) {
      challenge.status = "completed";
      challenge.completedAt = new Date().toISOString();
    }

    await this.saveChallenge(challenge);

    return { score: totalScore, correctCount };
  }

  async getChallenge(challengeId: string): Promise<Challenge | null> {
    const raw = await this.app.redis.get(`${CHALLENGE_PREFIX}${challengeId}`);
    if (!raw) return null;
    return JSON.parse(raw) as Challenge;
  }

  async getChallengeResult(challengeId: string): Promise<{
    challenge: Challenge;
    rankings: Array<{ learnerId: string; name: string; score: number; rank: number; won: boolean }>;
  } | null> {
    const challenge = await this.getChallenge(challengeId);
    if (!challenge) return null;

    const sorted = [...challenge.players].sort((a, b) => b.score - a.score);
    const topScore = sorted[0]?.score ?? 0;

    const rankings = sorted.map((p, idx) => ({
      learnerId: p.learnerId,
      name: p.name,
      score: p.score,
      rank: idx + 1,
      won: p.score === topScore && p.score > 0,
    }));

    return { challenge, rankings };
  }

  async getActiveChallenges(learnerId: string): Promise<Challenge[]> {
    const challengeIds = await this.app.redis.smembers(`challenges:${learnerId}`);
    const challenges: Challenge[] = [];

    for (const id of challengeIds) {
      const challenge = await this.getChallenge(id);
      if (challenge) {
        challenges.push(challenge);
      }
    }

    return challenges;
  }

  getWinner(challenge: Challenge): string | null {
    if (challenge.status !== "completed") return null;
    const sorted = [...challenge.players].sort((a, b) => b.score - a.score);
    return sorted[0]?.learnerId ?? null;
  }

  private async saveChallenge(challenge: Challenge): Promise<void> {
    await this.app.redis.set(
      `${CHALLENGE_PREFIX}${challenge.id}`,
      JSON.stringify(challenge),
      "EX",
      3600,
    );
  }

  private generateInviteCode(): string {
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    let code = "";
    for (let i = 0; i < 6; i++) {
      code += chars[Math.floor(Math.random() * chars.length)];
    }
    return code;
  }
}
