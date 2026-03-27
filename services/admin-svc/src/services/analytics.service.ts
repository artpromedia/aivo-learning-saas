import type { FastifyInstance } from "fastify";

const CACHE_TTL = 3600; // 1 hour
const CACHE_PREFIX = "admin:analytics:";

export class AnalyticsService {
  constructor(private readonly app: FastifyInstance) {}

  async getOverview() {
    const cached = await this.app.redis.get(`${CACHE_PREFIX}overview`);
    if (cached) return JSON.parse(cached);

    const result = await this.computeOverview();
    await this.app.redis.setex(`${CACHE_PREFIX}overview`, CACHE_TTL, JSON.stringify(result));
    return result;
  }

  async computeOverview() {
    const [tenantStats] = await this.app.sql`
      SELECT
        count(*)::int as "totalTenants",
        count(*) FILTER (WHERE type = 'B2C_FAMILY')::int as "b2cTenants",
        count(*) FILTER (WHERE type = 'B2B_DISTRICT')::int as "b2bTenants"
      FROM tenants
      WHERE status != 'CANCELLED'
    `;

    const [learnerStats] = await this.app.sql`
      SELECT
        count(*)::int as "totalLearners",
        count(*) FILTER (WHERE EXISTS (
          SELECT 1 FROM learning_sessions ls
          WHERE ls.learner_id = learners.id
          AND ls.created_at > now() - interval '30 days'
        ))::int as "activeLearners30d"
      FROM learners
      WHERE status = 'ACTIVE'
    `;

    const [brainStats] = await this.app.sql`
      SELECT count(*)::int as "totalBrains"
      FROM brain_states
    `;

    const brainVersionDist = await this.app.sql`
      SELECT main_brain_version as version, count(*)::int as total
      FROM brain_states
      WHERE main_brain_version IS NOT NULL
      GROUP BY main_brain_version
    `;

    const brainVersion: Record<string, number> = {};
    for (const row of brainVersionDist) {
      brainVersion[row.version] = row.total;
    }

    const [revenueStats] = await this.app.sql`
      SELECT
        coalesce(sum(
          CASE
            WHEN s.plan_id LIKE '%premium%' THEN 29
            WHEN s.plan_id LIKE '%pro%' THEN 19
            ELSE 9
          END
        ), 0)::int as "mrr"
      FROM subscriptions s
      WHERE s.status = 'ACTIVE'
    `;

    const mrr = revenueStats?.mrr ?? 0;

    const [engagementStats] = await this.app.sql`
      SELECT
        count(DISTINCT learner_id) FILTER (WHERE created_at > now() - interval '1 day')::int as "dau",
        count(DISTINCT learner_id) FILTER (WHERE created_at > now() - interval '7 days')::int as "wau",
        count(DISTINCT learner_id) FILTER (WHERE created_at > now() - interval '30 days')::int as "mau"
      FROM learning_sessions
    `;

    const [avgSessions] = await this.app.sql`
      SELECT coalesce(
        round(avg(session_count)::numeric, 1), 0
      )::float as "avgSessionsPerLearnerPerWeek"
      FROM (
        SELECT learner_id, count(*)::float as session_count
        FROM learning_sessions
        WHERE created_at > now() - interval '7 days'
        GROUP BY learner_id
      ) weekly
    `;

    const functioningDist = await this.app.sql`
      SELECT functioning_level as level, count(*)::int as total
      FROM learners
      WHERE status = 'ACTIVE'
      GROUP BY functioning_level
    `;

    const functioningLevelDistribution: Record<string, number> = {};
    for (const row of functioningDist) {
      functioningLevelDistribution[row.level] = row.total;
    }

    return {
      totalTenants: tenantStats?.totalTenants ?? 0,
      b2cTenants: tenantStats?.b2cTenants ?? 0,
      b2bTenants: tenantStats?.b2bTenants ?? 0,
      totalLearners: learnerStats?.totalLearners ?? 0,
      activeLearners30d: learnerStats?.activeLearners30d ?? 0,
      totalBrains: brainStats?.totalBrains ?? 0,
      brainVersion,
      mrr,
      arr: mrr * 12,
      dau: engagementStats?.dau ?? 0,
      wau: engagementStats?.wau ?? 0,
      mau: engagementStats?.mau ?? 0,
      avgSessionsPerLearnerPerWeek: avgSessions?.avgSessionsPerLearnerPerWeek ?? 0,
      functioningLevelDistribution,
    };
  }

  async getLearnerAnalytics() {
    const cached = await this.app.redis.get(`${CACHE_PREFIX}learners`);
    if (cached) return JSON.parse(cached);

    const result = await this.computeLearnerAnalytics();
    await this.app.redis.setex(`${CACHE_PREFIX}learners`, CACHE_TTL, JSON.stringify(result));
    return result;
  }

  async computeLearnerAnalytics() {
    const [enrollment] = await this.app.sql`
      SELECT
        count(*)::int as "totalEnrolled",
        count(*) FILTER (WHERE created_at > now() - interval '30 days')::int as "newThisMonth",
        count(*) FILTER (WHERE created_at > now() - interval '7 days')::int as "newThisWeek"
      FROM learners
      WHERE status = 'ACTIVE'
    `;

    const functioningLevels = await this.app.sql`
      SELECT functioning_level as level, count(*)::int as total
      FROM learners
      WHERE status = 'ACTIVE'
      GROUP BY functioning_level
      ORDER BY total DESC
    `;

    const gradeDistribution = await this.app.sql`
      SELECT enrolled_grade as grade, count(*)::int as total
      FROM learners
      WHERE status = 'ACTIVE' AND enrolled_grade IS NOT NULL
      GROUP BY enrolled_grade
      ORDER BY enrolled_grade
    `;

    return {
      enrollment: enrollment ?? { totalEnrolled: 0, newThisMonth: 0, newThisWeek: 0 },
      functioningLevels,
      gradeDistribution,
    };
  }

  async getBrainAnalytics() {
    const cached = await this.app.redis.get(`${CACHE_PREFIX}brains`);
    if (cached) return JSON.parse(cached);

    const result = await this.computeBrainAnalytics();
    await this.app.redis.setex(`${CACHE_PREFIX}brains`, CACHE_TTL, JSON.stringify(result));
    return result;
  }

  async computeBrainAnalytics() {
    const [totals] = await this.app.sql`
      SELECT count(*)::int as "totalBrains"
      FROM brain_states
    `;

    const versionDistribution = await this.app.sql`
      SELECT main_brain_version as version, count(*)::int as total
      FROM brain_states
      WHERE main_brain_version IS NOT NULL
      GROUP BY main_brain_version
      ORDER BY version DESC
    `;

    const [snapshotStats] = await this.app.sql`
      SELECT
        count(*)::int as "totalSnapshots",
        count(*) FILTER (WHERE created_at > now() - interval '7 days')::int as "snapshotsThisWeek"
      FROM brain_state_snapshots
    `;

    return {
      totalBrains: totals?.totalBrains ?? 0,
      versionDistribution,
      snapshotStats: snapshotStats ?? { totalSnapshots: 0, snapshotsThisWeek: 0 },
    };
  }

  async getRevenueAnalytics() {
    const cached = await this.app.redis.get(`${CACHE_PREFIX}revenue`);
    if (cached) return JSON.parse(cached);

    const result = await this.computeRevenueAnalytics();
    await this.app.redis.setex(`${CACHE_PREFIX}revenue`, CACHE_TTL, JSON.stringify(result));
    return result;
  }

  async computeRevenueAnalytics() {
    const [subscriptionStats] = await this.app.sql`
      SELECT
        count(*) FILTER (WHERE status = 'ACTIVE')::int as "activeSubscriptions",
        count(*) FILTER (WHERE status = 'CANCELLED')::int as "cancelledSubscriptions",
        count(*) FILTER (WHERE status = 'PAST_DUE')::int as "pastDueSubscriptions"
      FROM subscriptions
    `;

    const planDistribution = await this.app.sql`
      SELECT plan_id, count(*)::int as total
      FROM subscriptions
      WHERE status = 'ACTIVE'
      GROUP BY plan_id
      ORDER BY total DESC
    `;

    const [mrrCalc] = await this.app.sql`
      SELECT coalesce(sum(
        CASE
          WHEN plan_id LIKE '%premium%' THEN 29
          WHEN plan_id LIKE '%pro%' THEN 19
          ELSE 9
        END
      ), 0)::int as "mrr"
      FROM subscriptions
      WHERE status = 'ACTIVE'
    `;

    const mrr = mrrCalc?.mrr ?? 0;

    const [churnRate] = await this.app.sql`
      SELECT
        CASE
          WHEN count(*) = 0 THEN 0
          ELSE round(
            (count(*) FILTER (WHERE status = 'CANCELLED' AND cancelled_at > now() - interval '30 days'))::numeric /
            GREATEST(count(*), 1) * 100, 2
          )
        END::float as "monthlyChurnRate"
      FROM subscriptions
    `;

    return {
      ...subscriptionStats,
      planDistribution,
      mrr,
      arr: mrr * 12,
      arpu: subscriptionStats?.activeSubscriptions
        ? Math.round(mrr / subscriptionStats.activeSubscriptions)
        : 0,
      monthlyChurnRate: churnRate?.monthlyChurnRate ?? 0,
    };
  }

  async getEngagementAnalytics() {
    const cached = await this.app.redis.get(`${CACHE_PREFIX}engagement`);
    if (cached) return JSON.parse(cached);

    const result = await this.computeEngagementAnalytics();
    await this.app.redis.setex(`${CACHE_PREFIX}engagement`, CACHE_TTL, JSON.stringify(result));
    return result;
  }

  async computeEngagementAnalytics() {
    const [activeUsers] = await this.app.sql`
      SELECT
        count(DISTINCT learner_id) FILTER (WHERE created_at > now() - interval '1 day')::int as "dau",
        count(DISTINCT learner_id) FILTER (WHERE created_at > now() - interval '7 days')::int as "wau",
        count(DISTINCT learner_id) FILTER (WHERE created_at > now() - interval '30 days')::int as "mau"
      FROM learning_sessions
    `;

    const sessionsByType = await this.app.sql`
      SELECT session_type as type, count(*)::int as total
      FROM learning_sessions
      WHERE created_at > now() - interval '30 days'
      GROUP BY session_type
      ORDER BY total DESC
    `;

    const [streakStats] = await this.app.sql`
      SELECT
        coalesce(avg(current_streak_days), 0)::float as "avgStreak",
        coalesce(max(longest_streak_days), 0)::int as "maxStreak",
        count(*) FILTER (WHERE current_streak_days >= 7)::int as "weekPlusStreaks"
      FROM learner_xp
    `;

    return {
      ...activeUsers,
      sessionsByType,
      streakStats: streakStats ?? { avgStreak: 0, maxStreak: 0, weekPlusStreaks: 0 },
    };
  }

  async getTutorAnalytics() {
    const cached = await this.app.redis.get(`${CACHE_PREFIX}tutors`);
    if (cached) return JSON.parse(cached);

    const result = await this.computeTutorAnalytics();
    await this.app.redis.setex(`${CACHE_PREFIX}tutors`, CACHE_TTL, JSON.stringify(result));
    return result;
  }

  async computeTutorAnalytics() {
    const [subscriptionStats] = await this.app.sql`
      SELECT
        count(*)::int as "totalSubscriptions",
        count(*) FILTER (WHERE status = 'ACTIVE')::int as "activeSubscriptions"
      FROM tutor_subscriptions
    `;

    const skuDistribution = await this.app.sql`
      SELECT sku, count(*)::int as total
      FROM tutor_subscriptions
      WHERE status = 'ACTIVE'
      GROUP BY sku
      ORDER BY total DESC
    `;

    const [sessionStats] = await this.app.sql`
      SELECT
        count(*)::int as "totalSessions",
        count(*) FILTER (WHERE created_at > now() - interval '30 days')::int as "sessionsThisMonth",
        coalesce(avg(EXTRACT(EPOCH FROM (ended_at - started_at)))::int, 0) as "avgDurationSeconds"
      FROM tutor_sessions
    `;

    return {
      ...subscriptionStats,
      skuDistribution,
      sessionStats: sessionStats ?? { totalSessions: 0, sessionsThisMonth: 0, avgDurationSeconds: 0 },
    };
  }

  async getLlmUsageAnalytics() {
    const cached = await this.app.redis.get(`${CACHE_PREFIX}llm-usage`);
    if (cached) return JSON.parse(cached);

    const result = await this.computeLlmUsageAnalytics();
    await this.app.redis.setex(`${CACHE_PREFIX}llm-usage`, CACHE_TTL, JSON.stringify(result));
    return result;
  }

  async computeLlmUsageAnalytics() {
    const [totalUsage] = await this.app.sql`
      SELECT
        coalesce(sum(tokens_used) FILTER (WHERE usage_date >= current_date), 0)::bigint as "tokensToday",
        coalesce(sum(tokens_used) FILTER (WHERE usage_date >= current_date - 7), 0)::bigint as "tokensThisWeek",
        coalesce(sum(tokens_used) FILTER (WHERE usage_date >= current_date - 30), 0)::bigint as "tokensThisMonth",
        coalesce(sum(requests_count) FILTER (WHERE usage_date >= current_date - 30), 0)::int as "requestsThisMonth"
      FROM tenant_usages
    `;

    const topTenants = await this.app.sql`
      SELECT
        tu.tenant_id,
        t.name as tenant_name,
        sum(tu.tokens_used)::bigint as total_tokens
      FROM tenant_usages tu
      JOIN tenants t ON t.id = tu.tenant_id
      WHERE tu.usage_date >= current_date - 30
      GROUP BY tu.tenant_id, t.name
      ORDER BY total_tokens DESC
      LIMIT 10
    `;

    const dailyTrend = await this.app.sql`
      SELECT
        usage_date as date,
        sum(tokens_used)::bigint as tokens,
        sum(requests_count)::int as requests
      FROM tenant_usages
      WHERE usage_date >= current_date - 30
      GROUP BY usage_date
      ORDER BY usage_date
    `;

    const costPerMillionTokens = 3.0; // average cost estimate
    const monthlyTokens = Number(totalUsage?.tokensThisMonth ?? 0);
    const estimatedMonthlyCost = Math.round((monthlyTokens / 1_000_000) * costPerMillionTokens * 100) / 100;

    return {
      tokensToday: Number(totalUsage?.tokensToday ?? 0),
      tokensThisWeek: Number(totalUsage?.tokensThisWeek ?? 0),
      tokensThisMonth: monthlyTokens,
      requestsThisMonth: totalUsage?.requestsThisMonth ?? 0,
      estimatedMonthlyCost,
      topTenants,
      dailyTrend,
    };
  }

  async refreshAllCaches() {
    const [overview, learners, brains, revenue, engagement, tutors, llmUsage] = await Promise.all([
      this.computeOverview(),
      this.computeLearnerAnalytics(),
      this.computeBrainAnalytics(),
      this.computeRevenueAnalytics(),
      this.computeEngagementAnalytics(),
      this.computeTutorAnalytics(),
      this.computeLlmUsageAnalytics(),
    ]);

    await Promise.all([
      this.app.redis.setex(`${CACHE_PREFIX}overview`, CACHE_TTL, JSON.stringify(overview)),
      this.app.redis.setex(`${CACHE_PREFIX}learners`, CACHE_TTL, JSON.stringify(learners)),
      this.app.redis.setex(`${CACHE_PREFIX}brains`, CACHE_TTL, JSON.stringify(brains)),
      this.app.redis.setex(`${CACHE_PREFIX}revenue`, CACHE_TTL, JSON.stringify(revenue)),
      this.app.redis.setex(`${CACHE_PREFIX}engagement`, CACHE_TTL, JSON.stringify(engagement)),
      this.app.redis.setex(`${CACHE_PREFIX}tutors`, CACHE_TTL, JSON.stringify(tutors)),
      this.app.redis.setex(`${CACHE_PREFIX}llm-usage`, CACHE_TTL, JSON.stringify(llmUsage)),
    ]);
  }
}
