import type { FastifyInstance, FastifyRequest, FastifyReply } from "fastify";
import { careerApplicationTemplate } from "../../email/templates/career-application.js";

const CAREERS_EMAIL = "careers@aivolearning.com";
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB
const ALLOWED_MIME_TYPES = new Set([
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
]);

export async function careersApplyRoute(app: FastifyInstance): Promise<void> {
  app.post("/comms/careers/apply", async (request: FastifyRequest, reply: FastifyReply) => {
    const data = await request.file();

    if (!data) {
      return reply.status(400).send({ error: "Resume file is required." });
    }

    // Extract fields from multipart
    const fields = data.fields as Record<string, { value?: string }>;
    const name = fields.name?.value?.trim() ?? "";
    const email = fields.email?.value?.trim().toLowerCase() ?? "";
    const position = fields.position?.value?.trim() ?? "";

    // Validate required fields
    if (!name || name.length < 2 || name.length > 200) {
      return reply.status(400).send({ error: "Name is required (2-200 characters)." });
    }
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 320) {
      return reply.status(400).send({ error: "A valid email address is required." });
    }
    if (!position || position.length > 200) {
      return reply.status(400).send({ error: "Position is required." });
    }

    // Validate file
    if (!data.mimetype || !ALLOWED_MIME_TYPES.has(data.mimetype)) {
      return reply.status(400).send({ error: "Resume must be a PDF or Word document." });
    }

    // Read file buffer
    const chunks: Buffer[] = [];
    let totalSize = 0;
    for await (const chunk of data.file) {
      totalSize += chunk.length;
      if (totalSize > MAX_FILE_SIZE) {
        return reply.status(400).send({ error: "Resume file must be under 5 MB." });
      }
      chunks.push(chunk);
    }
    const fileBuffer = Buffer.concat(chunks);

    // Sanitize filename
    const safeFilename = (data.filename ?? "resume").replaceAll(/[^a-zA-Z0-9._-]/g, "_");

    // Build email
    const template = careerApplicationTemplate({
      applicantName: name,
      applicantEmail: email,
      position,
      resumeFilename: safeFilename,
    });

    // Send email with resume attached
    await app.email.send({
      to: CAREERS_EMAIL,
      subject: template.subject,
      html: template.html,
      from: "AIVO Careers <noreply@aivolearning.com>",
      tags: ["career-application"],
      attachments: [
        {
          filename: safeFilename,
          content: fileBuffer.toString("base64"),
          contentType: data.mimetype,
        },
      ],
    });

    app.log.info({ applicantEmail: email, position }, "Career application submitted");

    return reply.status(200).send({ success: true });
  });
}
