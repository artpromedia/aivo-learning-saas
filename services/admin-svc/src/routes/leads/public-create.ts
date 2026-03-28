import type { FastifyInstance } from "fastify";
import { LeadService } from "../../services/lead.service.js";

export async function publicCreateLeadRoute(app: FastifyInstance) {
  app.post(
    "/public/leads",
    {
      config: {
        rateLimit: {
          max: 5,
          timeWindow: "1 minute",
        },
      },
    },
    async (request, reply) => {
      const body = request.body as {
        organizationName?: string;
        contactName: string;
        contactEmail: string;
        contactPhone?: string;
        districtSize?: number;
        source?: string;
        stage?: string;
        message?: string;
        metadata?: Record<string, unknown>;
        utmParams?: Record<string, string>;
      };

      if (!body.contactName || !body.contactEmail) {
        return reply.status(400).send({
          error: "contactName and contactEmail are required",
        });
      }

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(body.contactEmail)) {
        return reply.status(400).send({ error: "Invalid email address" });
      }

      const service = new LeadService(app);
      const lead = await service.create({
        organizationName: body.organizationName ?? body.contactName,
        contactName: body.contactName,
        contactEmail: body.contactEmail,
        contactPhone: body.contactPhone,
        districtSize: body.districtSize,
        source: body.source ?? "website",
        metadata: {
          ...body.metadata,
          utmParams: body.utmParams,
          message: body.message,
          ipAddress: request.ip,
          userAgent: request.headers["user-agent"],
        },
      });

      return reply.status(201).send({ lead: { id: lead.id } });
    },
  );
}
