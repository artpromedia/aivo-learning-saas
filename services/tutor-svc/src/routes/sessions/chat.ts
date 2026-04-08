import type { FastifyInstance } from "fastify";
import { z } from "zod";
import { authenticate } from "../../middleware/authenticate.js";
import { SessionService } from "../../services/session.service.js";

const bodySchema = z.object({
  message: z.string().min(1),
  locale: z.string().min(2).max(10).optional(),
});

/**
 * SSE streaming chat endpoint for the learner dashboard.
 *
 * Accepts a JSON POST and responds with Server-Sent Events so the frontend
 * can render tokens progressively via `useTutorChat`.
 *
 * The AI backend currently returns a full response rather than a token stream,
 * so we chunk the completed response into small pieces and flush them as SSE
 * data frames.  When the AI service adds native streaming, this route can
 * switch to a true pass-through stream.
 */
export async function chatStreamRoute(app: FastifyInstance) {
  app.post(
    "/tutors/sessions/:id/chat",
    { preHandler: [authenticate] },
    async (request, reply) => {
      const { id } = request.params as { id: string };
      const body = bodySchema.parse(request.body);
      const sessionSvc = new SessionService(app);

      // Set SSE headers
      reply.raw.writeHead(200, {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      });

      try {
        const response = await sessionSvc.sendMessage(id, body.message, body.locale);

        // Chunk the response content into small pieces to simulate streaming
        const content = (response as { content: string }).content ?? "";
        const CHUNK_SIZE = 4; // characters per SSE frame

        for (let i = 0; i < content.length; i += CHUNK_SIZE) {
          const token = content.slice(i, i + CHUNK_SIZE);
          reply.raw.write(`data: ${JSON.stringify({ token })}\n\n`);
        }

        // Signal completion
        reply.raw.write("data: [DONE]\n\n");
      } catch (err) {
        const message = err instanceof Error ? err.message : "Chat failed";
        reply.raw.write(`data: ${JSON.stringify({ error: message })}\n\n`);
      } finally {
        reply.raw.end();
      }

      return reply;
    },
  );
}
