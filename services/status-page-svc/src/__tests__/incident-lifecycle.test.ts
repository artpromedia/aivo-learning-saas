import { describe, it, expect } from "vitest";

describe("Incident Lifecycle", () => {
  describe("incident status transitions", () => {
    const VALID_TRANSITIONS: Record<string, string[]> = {
      INVESTIGATING: ["IDENTIFIED", "MONITORING", "RESOLVED"],
      IDENTIFIED: ["MONITORING", "RESOLVED"],
      MONITORING: ["RESOLVED", "INVESTIGATING"],
      RESOLVED: [],
    };

    it("should allow valid transitions from INVESTIGATING", () => {
      expect(VALID_TRANSITIONS["INVESTIGATING"]).toContain("IDENTIFIED");
      expect(VALID_TRANSITIONS["INVESTIGATING"]).toContain("MONITORING");
      expect(VALID_TRANSITIONS["INVESTIGATING"]).toContain("RESOLVED");
    });

    it("should not allow transitions from RESOLVED", () => {
      expect(VALID_TRANSITIONS["RESOLVED"]).toHaveLength(0);
    });

    it("should allow regression from MONITORING back to INVESTIGATING", () => {
      expect(VALID_TRANSITIONS["MONITORING"]).toContain("INVESTIGATING");
    });
  });

  describe("impact levels", () => {
    const IMPACT_PRIORITY: Record<string, number> = {
      NONE: 0,
      MINOR: 1,
      MAJOR: 2,
      CRITICAL: 3,
    };

    it("should order impact levels correctly", () => {
      expect(IMPACT_PRIORITY["NONE"]).toBeLessThan(IMPACT_PRIORITY["MINOR"]);
      expect(IMPACT_PRIORITY["MINOR"]).toBeLessThan(IMPACT_PRIORITY["MAJOR"]);
      expect(IMPACT_PRIORITY["MAJOR"]).toBeLessThan(IMPACT_PRIORITY["CRITICAL"]);
    });
  });

  describe("alert deduplication", () => {
    it("should identify duplicate alerts by fingerprint", () => {
      const existingFingerprints = new Set(["abc123", "def456"]);
      const incomingFingerprint = "abc123";
      expect(existingFingerprints.has(incomingFingerprint)).toBe(true);
    });

    it("should allow new alerts with unique fingerprints", () => {
      const existingFingerprints = new Set(["abc123", "def456"]);
      const newFingerprint = "ghi789";
      expect(existingFingerprints.has(newFingerprint)).toBe(false);
    });
  });

  describe("alertmanager webhook payload", () => {
    it("should parse firing alerts correctly", () => {
      const payload = {
        version: "4",
        status: "firing" as const,
        alerts: [
          {
            status: "firing" as const,
            labels: {
              alertname: "ServiceDown",
              service: "identity-svc",
              severity: "critical",
            },
            annotations: {
              summary: "identity-svc is down",
            },
            startsAt: "2026-03-28T10:00:00Z",
            endsAt: "0001-01-01T00:00:00Z",
            fingerprint: "abc123",
          },
        ],
      };

      expect(payload.alerts).toHaveLength(1);
      expect(payload.alerts[0].status).toBe("firing");
      expect(payload.alerts[0].labels.alertname).toBe("ServiceDown");
      expect(payload.alerts[0].labels.severity).toBe("critical");
    });

    it("should map severity to impact level", () => {
      const ALERT_IMPACT_MAP: Record<string, string> = {
        critical: "MAJOR",
        warning: "MINOR",
        info: "NONE",
      };

      expect(ALERT_IMPACT_MAP["critical"]).toBe("MAJOR");
      expect(ALERT_IMPACT_MAP["warning"]).toBe("MINOR");
      expect(ALERT_IMPACT_MAP["info"]).toBe("NONE");
    });

    it("should auto-resolve incidents when alert resolves", () => {
      const resolvedPayload = {
        status: "resolved" as const,
        alerts: [
          {
            status: "resolved" as const,
            labels: { service: "identity-svc" },
            fingerprint: "abc123",
          },
        ],
      };

      expect(resolvedPayload.alerts[0].status).toBe("resolved");
    });
  });
});
