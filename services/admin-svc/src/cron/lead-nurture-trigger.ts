import cron from "node-cron";
import type { FastifyInstance } from "fastify";
import { publishEvent } from "@aivo/events";
import { LeadService } from "../services/lead.service.js";

export function startLeadNurtureCron(app: FastifyInstance) {
  // Check for stale leads daily at 9am
  cron.schedule("0 9 * * *", async () => {
    try {
      app.log.info("Running lead nurture trigger");

      const service = new LeadService(app);
      const staleLeads = await service.getStaleLeads(7);

      for (const lead of staleLeads) {
        await publishEvent(app.nats, "comms.email.send", {
          templateSlug: "lead_nurture",
          recipientEmail: lead.contact_email,
          recipientName: lead.contact_name,
          templateData: {
            organizationName: lead.organization_name,
            daysSinceContact: 7,
          },
          tags: ["lead", "nurture"],
        });

        app.log.info({ leadId: lead.id }, "Nurture email triggered for stale lead");
      }

      app.log.info(`Lead nurture trigger completed: ${staleLeads.length} leads processed`);
    } catch (err) {
      app.log.error(err, "Lead nurture trigger failed");
    }
  });

  app.log.info("Lead nurture cron scheduled (daily at 9am)");
}
