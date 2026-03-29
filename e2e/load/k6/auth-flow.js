/* global __ENV, __VU, __ITER */
import http from "k6/http";
import { check, sleep, group } from "k6";
import { Rate, Trend } from "k6/metrics";

// ─────────────────────────────────────────────
// AIVO Auth Flow Load Test
// Scenario: sign-up → sign-in → session check
// ─────────────────────────────────────────────

const BASE_URL = __ENV.BASE_URL || "http://localhost:3001";

const errorRate = new Rate("auth_errors");
const signUpDuration = new Trend("auth_signup_duration", true);
const signInDuration = new Trend("auth_signin_duration", true);
const sessionDuration = new Trend("auth_session_duration", true);

export const options = {
  stages: [
    { duration: "30s", target: parseInt(__ENV.K6_VUS || "50") },
    { duration: __ENV.K6_DURATION || "2m", target: parseInt(__ENV.K6_VUS || "50") },
    { duration: "30s", target: 0 },
  ],
  thresholds: {
    http_req_duration: ["p(95)<500"],
    http_req_failed: ["rate<0.01"],
    auth_errors: ["rate<0.01"],
    auth_signup_duration: ["p(95)<600"],
    auth_signin_duration: ["p(95)<400"],
    auth_session_duration: ["p(95)<200"],
  },
};

export default function () {
  const uniqueId = `${__VU}-${__ITER}-${Date.now()}`;
  const email = `loadtest+${uniqueId}@aivo.test`;
  const password = "LoadTest!Secure123";

  let authToken;

  group("Sign Up", () => {
    const signUpPayload = JSON.stringify({
      email: email,
      password: password,
      name: `Load Test User ${uniqueId}`,
    });

    const signUpRes = http.post(`${BASE_URL}/auth/sign-up`, signUpPayload, {
      headers: { "Content-Type": "application/json" },
      tags: { name: "POST /auth/sign-up" },
    });

    signUpDuration.add(signUpRes.timings.duration);

    const signUpOk = check(signUpRes, {
      "sign-up status is 200 or 201": (r) =>
        r.status === 200 || r.status === 201,
      "sign-up returns token or session": (r) => {
        try {
          const body = JSON.parse(r.body);
          return body.token || body.session || body.user;
        } catch {
          return false;
        }
      },
    });

    if (!signUpOk) {
      errorRate.add(1);
      return;
    }
    errorRate.add(0);
  });

  sleep(0.5);

  group("Sign In", () => {
    const signInPayload = JSON.stringify({
      email: email,
      password: password,
    });

    const signInRes = http.post(`${BASE_URL}/auth/sign-in`, signInPayload, {
      headers: { "Content-Type": "application/json" },
      tags: { name: "POST /auth/sign-in" },
    });

    signInDuration.add(signInRes.timings.duration);

    const signInOk = check(signInRes, {
      "sign-in status is 200": (r) => r.status === 200,
      "sign-in returns auth token": (r) => {
        try {
          const body = JSON.parse(r.body);
          authToken = body.token || body.session?.token;
          return !!authToken;
        } catch {
          return false;
        }
      },
    });

    if (!signInOk) {
      errorRate.add(1);
      return;
    }
    errorRate.add(0);
  });

  sleep(0.3);

  group("Session Check", () => {
    if (!authToken) {
      errorRate.add(1);
      return;
    }

    const sessionRes = http.get(`${BASE_URL}/auth/session`, {
      headers: {
        Authorization: `Bearer ${authToken}`,
        "Content-Type": "application/json",
      },
      tags: { name: "GET /auth/session" },
    });

    sessionDuration.add(sessionRes.timings.duration);

    const sessionOk = check(sessionRes, {
      "session status is 200": (r) => r.status === 200,
      "session returns user data": (r) => {
        try {
          const body = JSON.parse(r.body);
          return body.user || body.session;
        } catch {
          return false;
        }
      },
    });

    if (!sessionOk) {
      errorRate.add(1);
    } else {
      errorRate.add(0);
    }
  });

  sleep(1);
}
