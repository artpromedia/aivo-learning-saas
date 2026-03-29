/* global __ENV, console */
import http from "k6/http";
import { check, sleep, group } from "k6";
import { Rate, Trend } from "k6/metrics";

// ─────────────────────────────────────────────
// AIVO Learner Dashboard Load Test
// Scenario: authenticate → profile → sessions → XP
// ─────────────────────────────────────────────

const IDENTITY_URL = __ENV.IDENTITY_URL || "http://localhost:3001";
const LEARNING_URL = __ENV.LEARNING_URL || "http://localhost:3003";
const ENGAGEMENT_URL = __ENV.ENGAGEMENT_URL || "http://localhost:3004";

const errorRate = new Rate("dashboard_errors");
const profileDuration = new Trend("dashboard_profile_duration", true);
const sessionsDuration = new Trend("dashboard_sessions_duration", true);
const xpDuration = new Trend("dashboard_xp_duration", true);

export const options = {
  stages: [
    { duration: "30s", target: parseInt(__ENV.K6_VUS || "50") },
    { duration: __ENV.K6_DURATION || "2m", target: parseInt(__ENV.K6_VUS || "50") },
    { duration: "30s", target: 0 },
  ],
  thresholds: {
    http_req_duration: ["p(95)<800"],
    http_req_failed: ["rate<0.05"],
    dashboard_errors: ["rate<0.05"],
    dashboard_profile_duration: ["p(95)<600"],
    dashboard_sessions_duration: ["p(95)<800"],
    dashboard_xp_duration: ["p(95)<500"],
  },
};

export function setup() {
  // Create a test user for all VUs to authenticate as
  const email = `dashboard-load-${Date.now()}@aivo.test`;
  const password = "DashLoad!Secure123";

  const signUpRes = http.post(
    `${IDENTITY_URL}/auth/sign-up`,
    JSON.stringify({
      email: email,
      password: password,
      name: "Dashboard Load Test User",
    }),
    { headers: { "Content-Type": "application/json" } }
  );

  if (signUpRes.status !== 200 && signUpRes.status !== 201) {
    console.warn(`Setup sign-up returned ${signUpRes.status}: ${signUpRes.body}`);
  }

  const signInRes = http.post(
    `${IDENTITY_URL}/auth/sign-in`,
    JSON.stringify({ email, password }),
    { headers: { "Content-Type": "application/json" } }
  );

  let token = "";
  try {
    const body = JSON.parse(signInRes.body);
    token = body.token || body.session?.token || "";
  } catch {
    console.warn("Failed to parse sign-in response during setup");
  }

  return { token, email };
}

export default function (data) {
  const authHeaders = {
    Authorization: `Bearer ${data.token}`,
    "Content-Type": "application/json",
  };

  group("Learner Profile", () => {
    const profileRes = http.get(`${LEARNING_URL}/api/learner/profile`, {
      headers: authHeaders,
      tags: { name: "GET /api/learner/profile" },
    });

    profileDuration.add(profileRes.timings.duration);

    const ok = check(profileRes, {
      "profile status is 200": (r) => r.status === 200,
      "profile has data": (r) => r.body && r.body.length > 2,
    });

    errorRate.add(ok ? 0 : 1);
  });

  sleep(0.5);

  group("Learning Sessions", () => {
    const sessionsRes = http.get(`${LEARNING_URL}/api/learner/sessions`, {
      headers: authHeaders,
      tags: { name: "GET /api/learner/sessions" },
    });

    sessionsDuration.add(sessionsRes.timings.duration);

    const ok = check(sessionsRes, {
      "sessions status is 200": (r) => r.status === 200,
      "sessions returns array": (r) => {
        try {
          const body = JSON.parse(r.body);
          return Array.isArray(body) || Array.isArray(body.sessions) || Array.isArray(body.data);
        } catch {
          return false;
        }
      },
    });

    errorRate.add(ok ? 0 : 1);
  });

  sleep(0.3);

  group("Engagement XP", () => {
    const xpRes = http.get(`${ENGAGEMENT_URL}/api/engagement/xp`, {
      headers: authHeaders,
      tags: { name: "GET /api/engagement/xp" },
    });

    xpDuration.add(xpRes.timings.duration);

    const ok = check(xpRes, {
      "xp status is 200": (r) => r.status === 200,
      "xp has data": (r) => r.body && r.body.length > 2,
    });

    errorRate.add(ok ? 0 : 1);
  });

  sleep(1);
}
