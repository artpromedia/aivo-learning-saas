import type { FastifyInstance } from "fastify";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { districtZipCodes, schoolDistricts, districtCurriculumStandards } from "@aivo/db";

const zipSchema = z.string().regex(/^\d{5}$/, "ZIP must be exactly 5 digits");
const stateSchema = z.string().regex(/^[A-Z]{2}$/, "State must be a 2-letter uppercase code");

const STATE_TO_FRAMEWORK: Record<string, string> = {
  TX: "TEKS",
  FL: "BEST",
  NY: "NYSLS",
  VA: "SOL",
  AR: "CCAS",
};

interface ZippopotamResponse {
  "post code": string;
  country: string;
  places: Array<{
    "place name": string;
    longitude: string;
    latitude: string;
    state: string;
    "state abbreviation": string;
  }>;
}

interface CensusGeography {
  result: {
    geographies: {
      [layer: string]: Array<{
        NAME: string;
        GEOID: string;
        STATE: string;
        FUNCSTAT: string;
      }>;
    };
  };
}

async function lookupDistrictFromAPIs(zip: string): Promise<{
  name: string;
  state: string;
  ncesId: string;
} | null> {
  try {
    const zipRes = await fetch(`https://api.zippopotam.us/us/${zip}`, {
      signal: AbortSignal.timeout(5000),
    });
    if (!zipRes.ok) return null;

    const zipData: ZippopotamResponse = await zipRes.json();
    const place = zipData.places?.[0];
    if (!place) return null;

    const lon = place.longitude;
    const lat = place.latitude;
    const stateAbbr = place["state abbreviation"];

    const censusUrl = new URL("https://geocoding.geo.census.gov/geocoder/geographies/coordinates");
    censusUrl.searchParams.set("x", lon);
    censusUrl.searchParams.set("y", lat);
    censusUrl.searchParams.set("benchmark", "Public_AR_Current");
    censusUrl.searchParams.set("vintage", "Current_Current");
    censusUrl.searchParams.set("layers", "Unified School Districts,Secondary School Districts,Elementary School Districts");
    censusUrl.searchParams.set("format", "json");

    const censusRes = await fetch(censusUrl.toString(), {
      signal: AbortSignal.timeout(8000),
    });
    if (!censusRes.ok) return null;

    const censusData: CensusGeography = await censusRes.json();
    const geos = censusData.result?.geographies ?? {};

    const district =
      geos["Unified School Districts"]?.[0] ??
      geos["Secondary School Districts"]?.[0] ??
      geos["Elementary School Districts"]?.[0];

    if (!district?.NAME || !district?.GEOID) return null;

    return {
      name: district.NAME,
      state: stateAbbr,
      ncesId: district.GEOID,
    };
  } catch {
    return null;
  }
}

function inferFramework(state: string): string {
  return STATE_TO_FRAMEWORK[state] ?? (
    ["CA", "IL", "MA", "CT", "NJ", "MD", "WA", "OR", "HI", "VT", "NH", "ME", "RI", "DE", "NM", "KS", "KY", "WV", "MT", "WY", "ND", "SD", "IA"].includes(state)
      ? "COMMON_CORE"
      : "STATE_SPECIFIC"
  );
}

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

        const [localMatch] = await app.db
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

        if (localMatch) {
          const standards = await app.db
            .select({
              subject: districtCurriculumStandards.subject,
              gradeBand: districtCurriculumStandards.gradeBand,
              standards: districtCurriculumStandards.standards,
              alignments: districtCurriculumStandards.alignments,
            })
            .from(districtCurriculumStandards)
            .where(eq(districtCurriculumStandards.districtId, localMatch.id));

          return reply.send({ district: { ...localMatch, curriculumStandards: standards } });
        }

        const apiResult = await lookupDistrictFromAPIs(parsed.data);
        if (!apiResult) {
          return reply.status(404).send({ error: "No district found for this zip code" });
        }

        const framework = inferFramework(apiResult.state);

        let existingDistrict = null;
        if (apiResult.ncesId) {
          const [byNces] = await app.db
            .select({
              id: schoolDistricts.id,
              name: schoolDistricts.name,
              state: schoolDistricts.state,
              ncesId: schoolDistricts.ncesId,
              curriculumFramework: schoolDistricts.curriculumFramework,
            })
            .from(schoolDistricts)
            .where(eq(schoolDistricts.ncesId, apiResult.ncesId))
            .limit(1);
          existingDistrict = byNces ?? null;
        }

        if (!existingDistrict) {
          try {
            const [inserted] = await app.db
              .insert(schoolDistricts)
              .values({
                name: apiResult.name,
                state: apiResult.state,
                ncesId: apiResult.ncesId || null,
                curriculumFramework: framework as any,
              })
              .returning({
                id: schoolDistricts.id,
                name: schoolDistricts.name,
                state: schoolDistricts.state,
                ncesId: schoolDistricts.ncesId,
                curriculumFramework: schoolDistricts.curriculumFramework,
              });
            existingDistrict = inserted;
          } catch {
            if (apiResult.ncesId) {
              const [byNces] = await app.db
                .select({
                  id: schoolDistricts.id,
                  name: schoolDistricts.name,
                  state: schoolDistricts.state,
                  ncesId: schoolDistricts.ncesId,
                  curriculumFramework: schoolDistricts.curriculumFramework,
                })
                .from(schoolDistricts)
                .where(eq(schoolDistricts.ncesId, apiResult.ncesId))
                .limit(1);
              existingDistrict = byNces ?? null;
            }
          }
        }

        if (!existingDistrict) {
          return reply.send({
            district: {
              id: null,
              name: apiResult.name,
              state: apiResult.state,
              ncesId: apiResult.ncesId,
              curriculumFramework: framework,
              curriculumStandards: [],
              dynamic: true,
            },
          });
        }

        try {
          await app.db
            .insert(districtZipCodes)
            .values({ districtId: existingDistrict.id, zipCode: parsed.data })
            .onConflictDoNothing();
        } catch {
          // zip already cached
        }

        return reply.send({
          district: { ...existingDistrict, curriculumStandards: [], dynamic: true },
        });
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
