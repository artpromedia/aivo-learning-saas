import type { FastifyRequest, FastifyReply } from "fastify";
import { MessageValidator } from "../lti/message-validator.js";

declare module "fastify" {
  interface FastifyRequest {
    ltiPayload: Record<string, unknown>;
    ltiPlatformId: string;
  }
}

export async function ltiVerify(request: FastifyRequest, reply: FastifyReply): Promise<void> {
  const body = request.body as { id_token?: string };

  if (!body?.id_token) {
    return reply.status(400).send({ error: "Missing id_token" });
  }

  try {
    const validator = new MessageValidator(request.server);
    const result = await validator.validate(body.id_token);
    request.ltiPayload = result.payload;
    request.ltiPlatformId = result.platformId;
  } catch (err) {
    return reply.status(401).send({ error: "Invalid LTI message: " + (err as Error).message });
  }
}
