import type { FastifyInstance } from "fastify";
import { renderTemplate, type TemplateSlug, type TemplateDataMap } from "../email/renderer.js";
import { PreferenceService } from "./preference.service.js";

export class EmailService {
  private preferenceService: PreferenceService;

  constructor(private readonly app: FastifyInstance) {
    this.preferenceService = new PreferenceService(app);
  }

  async sendTemplate<T extends TemplateSlug>(
    templateSlug: T,
    recipientEmail: string,
    recipientUserId: string | null,
    data: TemplateDataMap[T],
    tags: string[] = [],
  ): Promise<void> {
    // Check preferences if we have a userId
    if (recipientUserId) {
      const allowed = await this.preferenceService.isChannelEnabled(
        recipientUserId,
        templateSlug,
        "email",
      );
      if (!allowed) {
        this.app.log.info({ templateSlug, recipientEmail }, "Email skipped — user opted out");
        return;
      }
    }

    const { subject, html } = renderTemplate(templateSlug, data);

    await this.app.email.send({
      to: recipientEmail,
      subject,
      html,
      tags: [templateSlug, ...tags],
    });

    this.app.log.info({ templateSlug, recipientEmail }, "Email sent");
  }

  async sendRaw(to: string, subject: string, html: string, tags: string[] = []): Promise<void> {
    await this.app.email.send({ to, subject, html, tags });
    this.app.log.info({ to, subject }, "Raw email sent");
  }
}
