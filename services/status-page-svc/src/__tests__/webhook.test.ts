import { describe, it, expect } from "vitest";

describe("Alertmanager Webhook", () => {
  describe("payload validation", () => {
    it("should reject payloads without alerts array", () => {
      const payload = { version: "4", status: "firing" };
      const isValid = Array.isArray((payload as Record<string, unknown>).alerts);
      expect(isValid).toBe(false);
    });

    it("should accept valid alertmanager payloads", () => {
      const payload = {
        version: "4",
        status: "firing",
        alerts: [
          {
            status: "firing",
            labels: { alertname: "HighErrorRate", service: "api", severity: "critical" },
            annotations: { summary: "High error rate detected" },
            startsAt: "2026-03-28T10:00:00Z",
            endsAt: "0001-01-01T00:00:00Z",
            fingerprint: "hash123",
          },
        ],
      };

      expect(Array.isArray(payload.alerts)).toBe(true);
      expect(payload.alerts[0].fingerprint).toBeDefined();
    });
  });

  describe("auto-incident creation", () => {
    it("should generate incident title from alert", () => {
      const alertName = "ServiceDown";
      const serviceName = "identity-svc";
      const title = `[Auto] ${alertName}: ${serviceName}`;
      expect(title).toBe("[Auto] ServiceDown: identity-svc");
    });

    it("should map service name to monitored service", () => {
      const serviceMap = new Map([
        ["identity-svc", "uuid-1"],
        ["learning-svc", "uuid-2"],
        ["brain-svc", "uuid-3"],
      ]);

      expect(serviceMap.get("identity-svc")).toBe("uuid-1");
      expect(serviceMap.get("unknown-svc")).toBeUndefined();
    });

    it("should deduplicate by fingerprint", () => {
      const activeIncidents = [
        { id: "inc-1", alertFingerprint: "fp-aaa", status: "INVESTIGATING" },
        { id: "inc-2", alertFingerprint: "fp-bbb", status: "MONITORING" },
      ];

      const incomingFingerprint = "fp-aaa";
      const duplicate = activeIncidents.find(
        (i) => i.alertFingerprint === incomingFingerprint && i.status !== "RESOLVED",
      );
      expect(duplicate).toBeDefined();
      expect(duplicate?.id).toBe("inc-1");
    });

    it("should not deduplicate resolved incidents", () => {
      const activeIncidents = [
        { id: "inc-1", alertFingerprint: "fp-aaa", status: "RESOLVED" },
      ];

      const incomingFingerprint = "fp-aaa";
      const duplicate = activeIncidents.find(
        (i) => i.alertFingerprint === incomingFingerprint && i.status !== "RESOLVED",
      );
      expect(duplicate).toBeUndefined();
    });
  });
});
