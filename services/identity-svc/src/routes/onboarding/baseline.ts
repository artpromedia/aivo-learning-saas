import type { FastifyInstance } from "fastify";
import { authenticate } from "../../middleware/authenticate.js";
import { tenantContext } from "../../middleware/tenant-context.js";
import { LearnerService } from "../../services/learner.service.js";

/**
 * Baseline assessment questions organized by grade and subject.
 * The adaptive engine picks questions starting at the learner's enrolled grade,
 * adjusting difficulty based on correct/incorrect answers.
 */
const QUESTION_BANK: Record<
  string,
  {
    id: string;
    type: "multiple_choice";
    subject: string;
    prompt: string;
    options: string[];
    answer: string;
    difficulty: number;
  }[]
> = {
  math: [
    {
      id: "m1",
      type: "multiple_choice",
      subject: "Math",
      prompt: "What is 7 + 5?",
      options: ["10", "11", "12", "13"],
      answer: "12",
      difficulty: 1,
    },
    {
      id: "m2",
      type: "multiple_choice",
      subject: "Math",
      prompt: "What is 15 − 8?",
      options: ["5", "6", "7", "8"],
      answer: "7",
      difficulty: 1,
    },
    {
      id: "m3",
      type: "multiple_choice",
      subject: "Math",
      prompt: "What is 6 × 4?",
      options: ["20", "22", "24", "26"],
      answer: "24",
      difficulty: 2,
    },
    {
      id: "m4",
      type: "multiple_choice",
      subject: "Math",
      prompt: "What is 56 ÷ 8?",
      options: ["6", "7", "8", "9"],
      answer: "7",
      difficulty: 2,
    },
    {
      id: "m5",
      type: "multiple_choice",
      subject: "Math",
      prompt: "What is 3/4 + 1/4?",
      options: ["1/2", "3/4", "1", "4/4"],
      answer: "1",
      difficulty: 3,
    },
    {
      id: "m6",
      type: "multiple_choice",
      subject: "Math",
      prompt: "Which fraction is equivalent to 0.75?",
      options: ["1/2", "2/3", "3/4", "4/5"],
      answer: "3/4",
      difficulty: 3,
    },
    {
      id: "m7",
      type: "multiple_choice",
      subject: "Math",
      prompt: "What is 12² (12 squared)?",
      options: ["124", "132", "144", "156"],
      answer: "144",
      difficulty: 4,
    },
    {
      id: "m8",
      type: "multiple_choice",
      subject: "Math",
      prompt: "Solve for x: 2x + 3 = 11",
      options: ["3", "4", "5", "6"],
      answer: "4",
      difficulty: 5,
    },
  ],
  reading: [
    {
      id: "r1",
      type: "multiple_choice",
      subject: "Reading",
      prompt: "Which word rhymes with 'cat'?",
      options: ["Dog", "Bat", "Cup", "Run"],
      answer: "Bat",
      difficulty: 1,
    },
    {
      id: "r2",
      type: "multiple_choice",
      subject: "Reading",
      prompt: "What is a synonym for 'happy'?",
      options: ["Sad", "Angry", "Joyful", "Tired"],
      answer: "Joyful",
      difficulty: 2,
    },
    {
      id: "r3",
      type: "multiple_choice",
      subject: "Reading",
      prompt: "What is the main idea of a story called?",
      options: ["Setting", "Theme", "Character", "Plot"],
      answer: "Theme",
      difficulty: 3,
    },
    {
      id: "r4",
      type: "multiple_choice",
      subject: "Reading",
      prompt: "Which word is an antonym for 'generous'?",
      options: ["Kind", "Selfish", "Brave", "Honest"],
      answer: "Selfish",
      difficulty: 3,
    },
    {
      id: "r5",
      type: "multiple_choice",
      subject: "Reading",
      prompt: "What does 'inference' mean in reading?",
      options: [
        "Reading aloud",
        "Drawing a conclusion from clues",
        "Summarizing",
        "Predicting the title",
      ],
      answer: "Drawing a conclusion from clues",
      difficulty: 4,
    },
    {
      id: "r6",
      type: "multiple_choice",
      subject: "Reading",
      prompt: "Which literary device uses 'like' or 'as' for comparison?",
      options: ["Metaphor", "Simile", "Alliteration", "Hyperbole"],
      answer: "Simile",
      difficulty: 5,
    },
  ],
};

// In-memory session state (production would use Redis)
const sessions = new Map<
  string,
  {
    queue: typeof QUESTION_BANK.math;
    currentIndex: number;
    results: { questionId: string; correct: boolean }[];
  }
>();

const TOTAL_QUESTIONS = 8;

function buildQueue(enrolledGrade: number | null = 3) {
  const grade = enrolledGrade ?? 3;
  // Map grade to starting difficulty (1-5)
  const startDifficulty = Math.min(Math.max(Math.ceil(grade / 2), 1), 5);

  const allQuestions = [...QUESTION_BANK.math, ...QUESTION_BANK.reading];

  // Sort by distance from starting difficulty, then interleave subjects
  const sorted = allQuestions.toSorted((a, b) => {
    const da = Math.abs(a.difficulty - startDifficulty);
    const db = Math.abs(b.difficulty - startDifficulty);
    return da - db;
  });

  return sorted.slice(0, TOTAL_QUESTIONS);
}

export async function baselineRoutes(app: FastifyInstance) {
  // POST /onboarding/:learnerId/baseline/start
  app.post<{ Params: { learnerId: string } }>(
    "/onboarding/:learnerId/baseline/start",
    { preHandler: [authenticate, tenantContext] },
    async (request, reply) => {
      const { learnerId } = request.params;
      const learnerService = new LearnerService(app);
      const learner = await learnerService.getById(learnerId, request.tenantId);

      const queue = buildQueue(learner.enrolledGrade ?? null);

      sessions.set(learnerId, {
        queue,
        currentIndex: 0,
        results: [],
      });

      const q = queue[0];
      return reply.send({
        question: {
          id: q.id,
          type: q.type,
          subject: q.subject,
          prompt: q.prompt,
          options: q.options,
          difficulty: q.difficulty,
        },
        progress: 0,
      });
    },
  );

  // POST /onboarding/:learnerId/baseline/answer
  app.post<{
    Params: { learnerId: string };
    Body: { questionId: string; answer: string };
  }>(
    "/onboarding/:learnerId/baseline/answer",
    { preHandler: [authenticate, tenantContext] },
    async (request, reply) => {
      const { learnerId } = request.params;
      const { questionId, answer } = request.body as {
        questionId: string;
        answer: string;
      };

      const session = sessions.get(learnerId);
      if (!session) {
        return reply
          .status(400)
          .send({ error: "No active assessment session" });
      }

      const currentQ = session.queue[session.currentIndex];
      const correct = currentQ.answer === answer;
      session.results.push({ questionId, correct });
      session.currentIndex++;

      const progress = Math.round(
        (session.currentIndex / session.queue.length) * 100,
      );
      const isComplete = session.currentIndex >= session.queue.length;

      let nextQuestion = null;
      if (!isComplete) {
        const nq = session.queue[session.currentIndex];
        nextQuestion = {
          id: nq.id,
          type: nq.type,
          subject: nq.subject,
          prompt: nq.prompt,
          options: nq.options,
          difficulty: nq.difficulty,
        };
      }

      return reply.send({
        correct,
        feedback: correct
          ? "Great job! That's correct!"
          : `Not quite. The answer was: ${currentQ.answer}`,
        nextQuestion,
        progress,
        isComplete,
      });
    },
  );

  // POST /onboarding/:learnerId/baseline/complete
  app.post<{ Params: { learnerId: string } }>(
    "/onboarding/:learnerId/baseline/complete",
    { preHandler: [authenticate, tenantContext] },
    async (request, reply) => {
      const { learnerId } = request.params;
      const session = sessions.get(learnerId);

      const totalCorrect = session
        ? session.results.filter((r) => r.correct).length
        : 0;
      const totalQuestions = session ? session.results.length : 0;

      // Clean up session
      sessions.delete(learnerId);

      // Publish NATS event for brain-svc to clone brain from seed
      try {
        const nc = (app as unknown as { nats: { nc: unknown } }).nats?.nc as
          | import("nats").NatsConnection
          | undefined;
        if (nc) {
          const { StringCodec } = await import("nats");
          const sc = StringCodec();
          nc.publish(
            "aivo.assessment.baseline.completed",
            sc.encode(
              JSON.stringify({
                learner_id: learnerId,
                total_correct: totalCorrect,
                total_questions: totalQuestions,
                accuracy: totalQuestions > 0 ? totalCorrect / totalQuestions : 0,
                completed_at: new Date().toISOString(),
              }),
            ),
          );
        }
      } catch {
        // Non-blocking — brain-svc may not be subscribed yet
      }

      return reply.send({
        completed: true,
        score: totalCorrect,
        total: totalQuestions,
        accuracy:
          totalQuestions > 0
            ? Math.round((totalCorrect / totalQuestions) * 100)
            : 0,
      });
    },
  );
}
