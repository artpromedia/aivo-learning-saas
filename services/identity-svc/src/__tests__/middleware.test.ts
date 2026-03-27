import { describe, it, expect, vi, beforeEach } from "vitest";
import { authenticate } from "../middleware/authenticate.js";
import { authorize } from "../middleware/authorize.js";
import { tenantContext } from "../middleware/tenant-context.js";

function createMockRequest(overrides: Record<string, unknown> = {}) {
  return {
    cookies: {},
    headers: {},
    user: undefined,
    tenantId: undefined,
    server: {
      auth: {
        verifyAccessToken: vi.fn(),
      },
    },
    ...overrides,
  } as any;
}

function createMockReply() {
  const reply: any = {
    status: vi.fn().mockReturnThis(),
    send: vi.fn().mockReturnThis(),
  };
  return reply;
}

describe("authenticate middleware", () => {
  it("should return 401 if no token provided", async () => {
    const request = createMockRequest();
    const reply = createMockReply();

    await authenticate(request, reply);

    expect(reply.status).toHaveBeenCalledWith(401);
    expect(reply.send).toHaveBeenCalledWith({ error: "Authentication required" });
  });

  it("should extract token from cookie", async () => {
    const payload = { sub: "user-1", tenantId: "tenant-1", role: "PARENT", email: "test@test.com" };
    const request = createMockRequest({
      cookies: { access_token: "valid-token" },
    });
    request.server.auth.verifyAccessToken.mockResolvedValue(payload);
    const reply = createMockReply();

    await authenticate(request, reply);

    expect(request.user).toEqual(payload);
    expect(request.server.auth.verifyAccessToken).toHaveBeenCalledWith("valid-token");
  });

  it("should extract token from Authorization header", async () => {
    const payload = { sub: "user-1", tenantId: "tenant-1", role: "PARENT", email: "test@test.com" };
    const request = createMockRequest({
      headers: { authorization: "Bearer header-token" },
    });
    request.server.auth.verifyAccessToken.mockResolvedValue(payload);
    const reply = createMockReply();

    await authenticate(request, reply);

    expect(request.user).toEqual(payload);
    expect(request.server.auth.verifyAccessToken).toHaveBeenCalledWith("header-token");
  });

  it("should return 401 on invalid token", async () => {
    const request = createMockRequest({
      cookies: { access_token: "bad-token" },
    });
    request.server.auth.verifyAccessToken.mockRejectedValue(new Error("Invalid"));
    const reply = createMockReply();

    await authenticate(request, reply);

    expect(reply.status).toHaveBeenCalledWith(401);
    expect(reply.send).toHaveBeenCalledWith({ error: "Invalid or expired token" });
  });
});

describe("authorize middleware", () => {
  it("should return 401 if no user on request", async () => {
    const request = createMockRequest();
    const reply = createMockReply();

    const guard = authorize("PARENT");
    await guard(request, reply);

    expect(reply.status).toHaveBeenCalledWith(401);
  });

  it("should return 403 if user role not allowed", async () => {
    const request = createMockRequest({
      user: { sub: "user-1", role: "CAREGIVER", tenantId: "t1", email: "test@test.com" },
    });
    const reply = createMockReply();

    const guard = authorize("PARENT", "TEACHER");
    await guard(request, reply);

    expect(reply.status).toHaveBeenCalledWith(403);
    expect(reply.send).toHaveBeenCalledWith({ error: "Insufficient permissions" });
  });

  it("should pass through if role is allowed", async () => {
    const request = createMockRequest({
      user: { sub: "user-1", role: "PARENT", tenantId: "t1", email: "test@test.com" },
    });
    const reply = createMockReply();

    const guard = authorize("PARENT", "TEACHER");
    await guard(request, reply);

    expect(reply.status).not.toHaveBeenCalled();
  });

  it("should allow PLATFORM_ADMIN for any guard that includes it", async () => {
    const request = createMockRequest({
      user: { sub: "admin-1", role: "PLATFORM_ADMIN", tenantId: "t1", email: "admin@test.com" },
    });
    const reply = createMockReply();

    const guard = authorize("PARENT", "PLATFORM_ADMIN");
    await guard(request, reply);

    expect(reply.status).not.toHaveBeenCalled();
  });
});

describe("tenantContext middleware", () => {
  it("should extract tenant from user JWT", async () => {
    const request = createMockRequest({
      user: { sub: "user-1", tenantId: "tenant-1", role: "PARENT", email: "test@test.com" },
    });
    const reply = createMockReply();

    await tenantContext(request, reply);

    expect(request.tenantId).toBe("tenant-1");
  });

  it("should extract tenant from x-tenant-id header", async () => {
    const request = createMockRequest({
      user: null,
      headers: { "x-tenant-id": "header-tenant" },
    });
    const reply = createMockReply();

    await tenantContext(request, reply);

    expect(request.tenantId).toBe("header-tenant");
  });

  it("should return 400 if no tenant context available", async () => {
    const request = createMockRequest({ user: null });
    const reply = createMockReply();

    await tenantContext(request, reply);

    expect(reply.status).toHaveBeenCalledWith(400);
    expect(reply.send).toHaveBeenCalledWith({ error: "Tenant context required" });
  });
});
