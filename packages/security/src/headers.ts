import type { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import fp from "fastify-plugin";

async function securityHeaders(app: FastifyInstance) {
  app.addHook("onSend", (_request: FastifyRequest, reply: FastifyReply, payload: unknown, done: () => void) => {
    reply.header("Strict-Transport-Security", "max-age=31536000; includeSubDomains; preload");
    reply.header("X-Content-Type-Options", "nosniff");
    reply.header("X-Frame-Options", "DENY");
    reply.header("X-XSS-Protection", "0");
    reply.header("Referrer-Policy", "strict-origin-when-cross-origin");
    reply.header("Permissions-Policy", "camera=(), microphone=(), geolocation=()");
    reply.header(
      "Content-Security-Policy",
      "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self' https:;",
    );
    done();
  });
}

export const securityHeadersPlugin = fp(securityHeaders, {
  name: "security-headers",
});
