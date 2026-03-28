import type { FastifyInstance } from "fastify";
import { eq, and, gte, lte, desc, sql, ne } from "drizzle-orm";
import {
  monitoredServices,
  serviceChecks,
  uptimeDaily,
  type serviceStatusEnum,
} from "@aivo/db";
import { publishEvent } from "@aivo/events";
import { getConfig } from "../config.js";

type ServiceStatus = (typeof serviceStatusEnum.enumValues)[number];

interface ServiceHealthResult {
  serviceId: string;
  serviceName: string;
  status: ServiceStatus;
  responseTimeMs: number | null;
  errorMessage: string | null;
}

const SERVICE_STATUS_PRIORITY: Record<ServiceStatus, number> = {
  OPERATIONAL: 0,
  DEGRADED: 1,
  PARTIAL_OUTAGE: 2,
  MAJOR_OUTAGE: 3,
};

export class HealthAggregator {
  private intervalHandle: ReturnType<typeof setInterval> | null = null;
  private dailyCronHandle: ReturnType<typeof setInterval> | null = null;

  constructor(private app: FastifyInstance) {}

  start(): void {
    const config = getConfig();
    this.intervalHandle = setInterval(
      () => this.runHealthChecks(),
      config.HEALTH_CHECK_INTERVAL_MS,
    );
    this.runHealthChecks();

    this.scheduleDailyCron();
  }

  stop(): void {
    if (this.intervalHandle) {
      clearInterval(this.intervalHandle);
      this.intervalHandle = null;
    }
    if (this.dailyCronHandle) {
      clearInterval(this.dailyCronHandle);
      this.dailyCronHandle = null;
    }
  }

  async runHealthChecks(): Promise<void> {
    const services = await this.app.db
      .select()
      .from(monitoredServices)
      .where(eq(monitoredServices.isEnabled, true));

    const results = await Promise.allSettled(
      services.map((svc) => this.checkService(svc)),
    );

    for (const result of results) {
      if (result.status === "fulfilled" && result.value) {
        await this.recordCheck(result.value);
      }
    }
  }

  private async checkService(
    service: typeof monitoredServices.$inferSelect,
  ): Promise<ServiceHealthResult> {
    const config = getConfig();
    const url = `http://${service.name}:${service.port}${service.healthEndpoint}`;
    const startTime = Date.now();

    try {
      const controller = new AbortController();
      const timeout = setTimeout(
        () => controller.abort(),
        config.HEALTH_CHECK_TIMEOUT_MS,
      );

      const response = await fetch(url, { signal: controller.signal });
      clearTimeout(timeout);

      const responseTimeMs = Date.now() - startTime;

      if (response.ok) {
        return {
          serviceId: service.id,
          serviceName: service.name,
          status: responseTimeMs > 2000 ? "DEGRADED" : "OPERATIONAL",
          responseTimeMs,
          errorMessage: null,
        };
      }

      return {
        serviceId: service.id,
        serviceName: service.name,
        status: "PARTIAL_OUTAGE",
        responseTimeMs,
        errorMessage: `HTTP ${response.status}`,
      };
    } catch (err) {
      return {
        serviceId: service.id,
        serviceName: service.name,
        status: "MAJOR_OUTAGE",
        responseTimeMs: Date.now() - startTime,
        errorMessage: err instanceof Error ? err.message : "Unknown error",
      };
    }
  }

  private async recordCheck(result: ServiceHealthResult): Promise<void> {
    await this.app.db.insert(serviceChecks).values({
      serviceId: result.serviceId,
      status: result.status,
      responseTimeMs: result.responseTimeMs,
      errorMessage: result.errorMessage,
    });

    const [previousCheck] = await this.app.db
      .select({ status: serviceChecks.status })
      .from(serviceChecks)
      .where(
        and(
          eq(serviceChecks.serviceId, result.serviceId),
          ne(serviceChecks.id, sql`(SELECT id FROM service_checks WHERE service_id = ${result.serviceId} ORDER BY checked_at DESC LIMIT 1)`),
        ),
      )
      .orderBy(desc(serviceChecks.checkedAt))
      .limit(1);

    if (previousCheck && previousCheck.status !== result.status) {
      await publishEvent(this.app.nats, "status.service.changed", {
        serviceId: result.serviceId,
        serviceName: result.serviceName,
        previousStatus: previousCheck.status,
        currentStatus: result.status,
        responseTimeMs: result.responseTimeMs ?? undefined,
        checkedAt: new Date().toISOString(),
      });
    }
  }

  async getAggregateStatus(): Promise<ServiceStatus> {
    const services = await this.app.db
      .select()
      .from(monitoredServices)
      .where(eq(monitoredServices.isEnabled, true));

    const latestChecks: ServiceHealthResult[] = [];

    for (const svc of services) {
      const [latest] = await this.app.db
        .select()
        .from(serviceChecks)
        .where(eq(serviceChecks.serviceId, svc.id))
        .orderBy(desc(serviceChecks.checkedAt))
        .limit(1);

      if (latest) {
        latestChecks.push({
          serviceId: svc.id,
          serviceName: svc.name,
          status: latest.status,
          responseTimeMs: latest.responseTimeMs,
          errorMessage: latest.errorMessage,
        });
      }
    }

    if (latestChecks.length === 0) return "OPERATIONAL";

    const criticalServices = services.filter((s) => s.isCritical);
    const criticalDown = latestChecks.filter(
      (c) =>
        criticalServices.some((s) => s.id === c.serviceId) &&
        (c.status === "MAJOR_OUTAGE" || c.status === "PARTIAL_OUTAGE"),
    );

    if (criticalDown.length > 1) return "MAJOR_OUTAGE";
    if (criticalDown.length === 1) return "PARTIAL_OUTAGE";

    const worstStatus = latestChecks.reduce((worst, check) => {
      return SERVICE_STATUS_PRIORITY[check.status] >
        SERVICE_STATUS_PRIORITY[worst]
        ? check.status
        : worst;
    }, "OPERATIONAL" as ServiceStatus);

    return worstStatus;
  }

  private scheduleDailyCron(): void {
    const now = new Date();
    const midnight = new Date(now);
    midnight.setHours(24, 0, 0, 0);
    const msUntilMidnight = midnight.getTime() - now.getTime();

    setTimeout(() => {
      this.computeDailyUptime();
      this.dailyCronHandle = setInterval(
        () => this.computeDailyUptime(),
        24 * 60 * 60 * 1000,
      );
    }, msUntilMidnight);
  }

  async computeDailyUptime(): Promise<void> {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const dateStr = yesterday.toISOString().split("T")[0];

    const dayStart = new Date(`${dateStr}T00:00:00.000Z`);
    const dayEnd = new Date(`${dateStr}T23:59:59.999Z`);

    const services = await this.app.db
      .select()
      .from(monitoredServices)
      .where(eq(monitoredServices.isEnabled, true));

    for (const svc of services) {
      const checks = await this.app.db
        .select()
        .from(serviceChecks)
        .where(
          and(
            eq(serviceChecks.serviceId, svc.id),
            gte(serviceChecks.checkedAt, dayStart),
            lte(serviceChecks.checkedAt, dayEnd),
          ),
        );

      if (checks.length === 0) continue;

      const successfulChecks = checks.filter(
        (c) => c.status === "OPERATIONAL" || c.status === "DEGRADED",
      ).length;

      const responseTimes = checks
        .map((c) => c.responseTimeMs)
        .filter((t): t is number => t !== null)
        .sort((a, b) => a - b);

      const avgResponseTime =
        responseTimes.length > 0
          ? Math.round(
              responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length,
            )
          : null;

      const p50 = responseTimes.length > 0
        ? responseTimes[Math.floor(responseTimes.length * 0.5)]
        : null;
      const p95 = responseTimes.length > 0
        ? responseTimes[Math.floor(responseTimes.length * 0.95)]
        : null;
      const p99 = responseTimes.length > 0
        ? responseTimes[Math.floor(responseTimes.length * 0.99)]
        : null;

      const uptimePercentage = (
        (successfulChecks / checks.length) *
        100
      ).toFixed(3);

      await this.app.db
        .insert(uptimeDaily)
        .values({
          serviceId: svc.id,
          date: dateStr,
          uptimePercentage,
          totalChecks: checks.length,
          successfulChecks,
          avgResponseTimeMs: avgResponseTime,
          p50ResponseTimeMs: p50,
          p95ResponseTimeMs: p95,
          p99ResponseTimeMs: p99,
        })
        .onConflictDoNothing();
    }
  }
}
