import type { FastifyInstance } from "fastify";
import fp from "fastify-plugin";
import { getConfig } from "../config.js";

export interface EmailClient {
  send(params: {
    to: string;
    subject: string;
    html: string;
    from?: string;
  }): Promise<void>;
}

declare module "fastify" {
  interface FastifyInstance {
    email: EmailClient;
  }
}

class OonrumailClient implements EmailClient {
  constructor(
    private readonly apiKey: string,
    private readonly baseUrl: string,
  ) {}

  async send(params: { to: string; subject: string; html: string; from?: string }): Promise<void> {
    const response = await fetch(`${this.baseUrl}/send`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify({
        from: params.from ?? "AIVO Learning <noreply@aivolearning.com>",
        to: params.to,
        subject: params.subject,
        html: params.html,
      }),
    });

    if (!response.ok) {
      const body = await response.text();
      throw new Error(`OONRUMAIL send failed (${response.status}): ${body}`);
    }
  }
}

class ConsoleEmailClient implements EmailClient {
  async send(params: { to: string; subject: string; html: string }): Promise<void> {
    console.log("──── DEV EMAIL ────");
    console.log(`To: ${params.to}`);
    console.log(`Subject: ${params.subject}`);
    console.log(`HTML length: ${params.html.length} chars`);
    console.log("───────────────────");
  }
}

export default fp(async (fastify: FastifyInstance) => {
  const config = getConfig();

  const client: EmailClient = config.OONRUMAIL_API_KEY
    ? new OonrumailClient(config.OONRUMAIL_API_KEY, config.OONRUMAIL_BASE_URL)
    : new ConsoleEmailClient();

  fastify.decorate("email", client);
});
