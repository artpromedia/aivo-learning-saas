import type { FastifyInstance, FastifyRequest, FastifyReply } from "fastify";
import fp from "fastify-plugin";
import { randomBytes } from "crypto";

const CSRF_COOKIE = "aivo_csrf";
const CSRF_HEADER = "x-csrf-token";

const EXEMPT_PATHS = [
  "/webhooks/",
  "/lti/",
  "/stripe/",
  "/public/",
  "/health",
];

const STATE_MUTATING_METHODS = new Set(["POST", "PUT", "PATCH", "DELETE"]);

function generateToken(): string {
  return randomBytes(32).toString("hex");
}

async function csrfProtection(app: FastifyInstance) {
  // Set CSRF token cookie on every response
  app.addHook("onRequest", async (request: FastifyRequest, reply: FastifyReply) => {
    if (!request.cookies[CSRF_COOKIE]) {
      const token = generateToken();
      reply.setCookie(CSRF_COOKIE, token, {
        path: "/",
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 86400,
      });
      (request as any)._csrfToken = token;
    }
  });

  // Validate CSRF on state-mutating requests
  app.addHook("preHandler", async (request: FastifyRequest, reply: FastifyReply) => {
    if (!STATE_MUTATING_METHODS.has(request.method)) return;

    // Skip exempt paths (webhooks, LTI, Stripe, public endpoints)
    const isExempt = EXEMPT_PATHS.some((p) => request.url.startsWith(p));
    if (isExempt) return;

    const cookieToken = request.cookies[CSRF_COOKIE];
    const headerToken = request.headers[CSRF_HEADER] as string | undefined;

    if (!cookieToken || !headerToken || cookieToken !== headerToken) {
      return reply.status(403).send({ error: "CSRF token validation failed" });
    }
  });

  // Expose CSRF token endpoint
  app.get("/csrf-token", async (request, reply) => {
    const token = request.cookies[CSRF_COOKIE] ?? generateToken();
    if (!request.cookies[CSRF_COOKIE]) {
      reply.setCookie(CSRF_COOKIE, token, {
        path: "/",
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 86400,
      });
    }
    return reply.send({ csrfToken: token });
  });
}

export const csrfPlugin = fp(csrfProtection, {
  name: "csrf-protection",
  dependencies: ["@fastify/cookie"],
});
