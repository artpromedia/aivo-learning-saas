import cron from "node-cron";
import type { FastifyInstance } from "fastify";
import { publishEvent } from "@aivo/events";
import { LeadService } from "../services/lead.service.js";
import { AttributionService } from "../services/attribution.service.js";

interface NurtureStep {
  daysSinceContact: number;
  templateSlug: string;
  subject: string;
}

const NURTURE_SEQUENCE: NurtureStep[] = [
  { daysSinceContact: 3, templateSlug: "lead_nurture_intro", subject: "Welcome to Aivo" },
  { daysSinceContact: 7, templateSlug: "lead_nurture_value", subject: "See how districts like yours use Aivo" },
  { daysSinceContact: 14, templateSlug: "lead_nurture_case_study", subject: "Case study: Improving outcomes with Aivo" },
  { daysSinceContact: 21, templateSlug: "lead_nurture_demo", subject: "Ready for a personalized demo?" },
  { daysSinceContact: 30, templateSlug: "lead_nurture_last_chance", subject: "Last chance to explore Aivo" },
];

export function startLeadNurtureCron(app: FastifyInstance) {
  // Check for stale leads daily at 9am
  cron.schedule("0 9 * * *", async () => {
    try {
      app.log.info("Running lead nurture trigger");

      const service = new LeadService(app);
      const attribution = new AttributionService(app);
      let totalProcessed = 0;

      for (const step of NURTURE_SEQUENCE) {
        const staleLeads = await service.getStaleLeads(step.daysSinceContact);

        for (const lead of staleLeads) {
          const score = attribution.scoreLeadFromSource(
            lead.source ?? "unknown",
            lead.district_size ?? undefined,
            lead.contact_email,
          );
          const temperature = attribution.getLeadTemperature(score);

          await publishEvent(app.nats, "comms.email.send", {
            templateSlug: step.templateSlug,
            recipientEmail: lead.contact_email,
            recipientName: lead.contact_name,
            templateData: {
              organizationName: lead.organization_name,
              daysSinceContact: step.daysSinceContact,
              leadScore: score,
              leadTemperature: temperature,
              subject: step.subject,
            },
            tags: ["lead", "nurture", temperature.toLowerCase()],
          });

          app.log.info(
            { leadId: lead.id, step: step.templateSlug, score, temperature },
            "Nurture email triggered for stale lead",
          );
          totalProcessed++;
        }
      }

      app.log.info(`Lead nurture trigger completed: ${totalProcessed} leads processed`);
    } catch (err) {
      app.log.error(err, "Lead nurture trigger failed");
    }
  });

  app.log.info("Lead nurture cron scheduled (daily at 9am)");
}
