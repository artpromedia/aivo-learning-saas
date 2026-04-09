import type { FastifyInstance } from "fastify";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { districtZipCodes, schoolDistricts, districtCurriculumStandards } from "@aivo/db";

const zipSchema = z.string().regex(/^\d{5}$/, "ZIP must be exactly 5 digits");
const stateSchema = z.string().regex(/^[A-Z]{2}$/, "State must be a 2-letter uppercase code");

export async function districtLookupRoute(app: FastifyInstance) {
  app.get<{
    Querystring: { zip?: string; state?: string };
  }>(
    "/districts/lookup",
    async (request, reply) => {
      const { zip, state } = request.query;

      if (zip) {
        const parsed = zipSchema.safeParse(zip);
        if (!parsed.success) {
          return reply.status(400).send({ error: parsed.error.issues[0]?.message ?? "Invalid zip" });
        }

        const [match] = await app.db
          .select({
            id: schoolDistricts.id,
            name: schoolDistricts.name,
            state: schoolDistricts.state,
            ncesId: schoolDistricts.ncesId,
            curriculumFramework: schoolDistricts.curriculumFramework,
          })
          .from(districtZipCodes)
          .innerJoin(schoolDistricts, eq(districtZipCodes.districtId, schoolDistricts.id))
          .where(eq(districtZipCodes.zipCode, parsed.data))
          .limit(1);

        if (!match) {
          return reply.status(404).send({ error: "No district found for this zip code" });
        }

        const standards = await app.db
          .select({
            subject: districtCurriculumStandards.subject,
            gradeBand: districtCurriculumStandards.gradeBand,
            standards: districtCurriculumStandards.standards,
            alignments: districtCurriculumStandards.alignments,
          })
          .from(districtCurriculumStandards)
          .where(eq(districtCurriculumStandards.districtId, match.id));

        return reply.send({ district: { ...match, curriculumStandards: standards } });
      }

      if (state) {
        const parsed = stateSchema.safeParse(state.toUpperCase());
        if (!parsed.success) {
          return reply.status(400).send({ error: parsed.error.issues[0]?.message ?? "Invalid state" });
        }

        const districts = await app.db
          .select({
            id: schoolDistricts.id,
            name: schoolDistricts.name,
            state: schoolDistricts.state,
            ncesId: schoolDistricts.ncesId,
            curriculumFramework: schoolDistricts.curriculumFramework,
          })
          .from(schoolDistricts)
          .where(eq(schoolDistricts.state, parsed.data));

        return reply.send({ districts });
      }

      return reply.status(400).send({ error: "Provide zip or state query parameter" });
    },
  );
}
