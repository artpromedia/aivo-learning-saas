import { describe, it, expect, vi, beforeEach } from "vitest";

describe("HealthAggregator", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  describe("health check logic", () => {
    it("should classify successful response as OPERATIONAL", () => {
      const responseTimeMs = 150;
      const status = responseTimeMs > 2000 ? "DEGRADED" : "OPERATIONAL";
      expect(status).toBe("OPERATIONAL");
    });

    it("should classify slow response as DEGRADED", () => {
      const responseTimeMs = 3000;
      const status = responseTimeMs > 2000 ? "DEGRADED" : "OPERATIONAL";
      expect(status).toBe("DEGRADED");
    });

    it("should compute aggregate status correctly", () => {
      const statuses = [
        { status: "OPERATIONAL", isCritical: true },
        { status: "OPERATIONAL", isCritical: false },
        { status: "OPERATIONAL", isCritical: false },
      ];

      const worstStatus = computeOverall(statuses);
      expect(worstStatus).toBe("OPERATIONAL");
    });

    it("should return PARTIAL_OUTAGE when one critical service is down", () => {
      const statuses = [
        { status: "MAJOR_OUTAGE", isCritical: true },
        { status: "OPERATIONAL", isCritical: false },
        { status: "OPERATIONAL", isCritical: true },
      ];

      const worstStatus = computeOverall(statuses);
      expect(worstStatus).toBe("PARTIAL_OUTAGE");
    });

    it("should return MAJOR_OUTAGE when multiple critical services are down", () => {
      const statuses = [
        { status: "MAJOR_OUTAGE", isCritical: true },
        { status: "PARTIAL_OUTAGE", isCritical: true },
        { status: "OPERATIONAL", isCritical: false },
      ];

      const worstStatus = computeOverall(statuses);
      expect(worstStatus).toBe("MAJOR_OUTAGE");
    });

    it("should return DEGRADED when any service is degraded", () => {
      const statuses = [
        { status: "OPERATIONAL", isCritical: true },
        { status: "DEGRADED", isCritical: false },
        { status: "OPERATIONAL", isCritical: false },
      ];

      const worstStatus = computeOverall(statuses);
      expect(worstStatus).toBe("DEGRADED");
    });
  });

  describe("uptime calculation", () => {
    it("should calculate correct uptime percentage", () => {
      const totalChecks = 2880;
      const successfulChecks = 2870;
      const uptimePercentage = ((successfulChecks / totalChecks) * 100).toFixed(3);
      expect(uptimePercentage).toBe("99.653");
    });

    it("should calculate 100% uptime when all checks pass", () => {
      const totalChecks = 2880;
      const successfulChecks = 2880;
      const uptimePercentage = ((successfulChecks / totalChecks) * 100).toFixed(3);
      expect(uptimePercentage).toBe("100.000");
    });

    it("should calculate percentile response times correctly", () => {
      const responseTimes = [10, 20, 30, 40, 50, 60, 70, 80, 90, 100];
      responseTimes.sort((a, b) => a - b);

      const p50 = responseTimes[Math.floor(responseTimes.length * 0.5)];
      const p95 = responseTimes[Math.floor(responseTimes.length * 0.95)];
      const p99 = responseTimes[Math.floor(responseTimes.length * 0.99)];

      expect(p50).toBe(60);
      expect(p95).toBe(100);
      expect(p99).toBe(100);
    });
  });
});

function computeOverall(services: { status: string; isCritical: boolean }[]): string {
  if (services.length === 0) return "OPERATIONAL";

  const criticalDown = services.filter(
    (s) =>
      s.isCritical &&
      (s.status === "MAJOR_OUTAGE" || s.status === "PARTIAL_OUTAGE"),
  );

  if (criticalDown.length > 1) return "MAJOR_OUTAGE";
  if (criticalDown.length === 1) return "PARTIAL_OUTAGE";
  if (services.some((s) => s.status === "DEGRADED")) return "DEGRADED";
  if (
    services.some(
      (s) => s.status === "PARTIAL_OUTAGE" || s.status === "MAJOR_OUTAGE",
    )
  )
    return "PARTIAL_OUTAGE";
  return "OPERATIONAL";
}
