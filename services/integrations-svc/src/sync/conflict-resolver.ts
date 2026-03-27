import type { SisStudent } from "./roster-mapper.js";

export interface ConflictResolution {
  action: "UPDATE" | "SKIP" | "MOVE";
  reason: string;
}

export class ConflictResolver {
  resolveStudentConflict(
    incoming: SisStudent,
    existing: { name: string; schoolName?: string; grade?: string },
  ): ConflictResolution {
    // If student moved schools, update them
    if (incoming.schoolName && existing.schoolName && incoming.schoolName !== existing.schoolName) {
      return {
        action: "MOVE",
        reason: `Student moved from ${existing.schoolName} to ${incoming.schoolName}`,
      };
    }

    // If name changed (legal name change), update
    const incomingName = `${incoming.firstName} ${incoming.lastName}`.trim();
    if (incomingName !== existing.name) {
      return {
        action: "UPDATE",
        reason: `Name changed from "${existing.name}" to "${incomingName}"`,
      };
    }

    // Grade changes are normal progression
    if (incoming.grade && existing.grade && incoming.grade !== existing.grade) {
      return {
        action: "UPDATE",
        reason: `Grade changed from ${existing.grade} to ${incoming.grade}`,
      };
    }

    return { action: "SKIP", reason: "No meaningful changes detected" };
  }

  resolveEmailConflict(
    sisEmail: string,
    existingEmail: string,
  ): ConflictResolution {
    // SIS is authoritative for email
    if (sisEmail !== existingEmail) {
      return {
        action: "UPDATE",
        reason: `Email updated from SIS: ${sisEmail}`,
      };
    }

    return { action: "SKIP", reason: "Emails match" };
  }
}
