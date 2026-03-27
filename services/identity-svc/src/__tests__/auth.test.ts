import { describe, it, expect, vi, beforeEach } from "vitest";
import { AuthService } from "../services/auth.service.js";

// Test fixture credentials — not real secrets
const MOCK_CREDENTIAL = "SecurePass123!";
const MOCK_CREDENTIAL_SHORT = "pass";
const MOCK_WRONG_CREDENTIAL = "wrong-password";

// Mock argon2
vi.mock("argon2", () => ({
  hash: vi.fn().mockResolvedValue("$argon2id$hashed"),
  verify: vi.fn().mockImplementation(async (hash: string, password: string) => {
    return password === "correct-password";
  }),
}));

// Mock nanoid
vi.mock("nanoid", () => ({
  nanoid: vi.fn().mockReturnValue("test-nano-id"),
}));

// Mock @aivo/events
vi.mock("@aivo/events", () => ({
  publishEvent: vi.fn().mockResolvedValue(undefined),
}));

function createMockApp() {
  return {
    db: {
      select: vi.fn().mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            limit: vi.fn().mockResolvedValue([]),
          }),
        }),
      }),
      insert: vi.fn().mockReturnValue({
        values: vi.fn().mockReturnValue({
          returning: vi.fn().mockResolvedValue([]),
          onConflictDoNothing: vi.fn().mockResolvedValue(undefined),
        }),
      }),
      update: vi.fn().mockReturnValue({
        set: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            returning: vi.fn().mockResolvedValue([]),
          }),
        }),
      }),
      delete: vi.fn().mockReturnValue({
        where: vi.fn().mockResolvedValue(undefined),
      }),
    },
    nats: {},
    auth: {
      signAccessToken: vi.fn().mockResolvedValue("access-token-123"),
      signRefreshToken: vi.fn().mockResolvedValue("refresh-token-123"),
      verifyAccessToken: vi.fn(),
      verifyRefreshToken: vi.fn(),
    },
  } as any;
}

describe("AuthService", () => {
  let app: ReturnType<typeof createMockApp>;
  let authService: AuthService;

  beforeEach(() => {
    app = createMockApp();
    authService = new AuthService(app);
    vi.clearAllMocks();
  });

  describe("register", () => {
    it("should create tenant, user, account, and session", async () => {
      // Mock: no existing user
      app.db.select.mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            limit: vi.fn()
              .mockResolvedValueOnce([]) // First call: check existing user
              .mockResolvedValueOnce([{ // session creation getById
                id: "user-1",
                tenantId: "tenant-1",
                email: "test@example.com",
                name: "Test User",
                role: "PARENT",
              }]),
          }),
        }),
      });

      // Mock tenant insert
      const tenant = { id: "tenant-1", name: "Test User's Family", slug: "family-test-nano-id", type: "B2C_FAMILY", status: "ACTIVE" };
      const user = { id: "user-1", tenantId: "tenant-1", email: "test@example.com", name: "Test User", role: "PARENT", status: "ACTIVE" };
      const session = { id: "session-1", userId: "user-1", token: "test-nano-id", expiresAt: new Date() };

      let insertCallCount = 0;
      app.db.insert.mockImplementation(() => ({
        values: vi.fn().mockImplementation(() => ({
          returning: vi.fn().mockImplementation(() => {
            insertCallCount++;
            switch (insertCallCount) {
              case 1: return Promise.resolve([tenant]);   // tenant insert
              case 2: return Promise.resolve([user]);      // user insert
              // case 3 is session insert (account insert doesn't call .returning())
              case 3: return Promise.resolve([session]);
              default: return Promise.resolve([]);
            }
          }),
        })),
      }));

      const result = await authService.register({
        email: "test@example.com",
        password: MOCK_CREDENTIAL,
        name: "Test User",
      });

      expect(result.user).toBeDefined();
      expect(result.tenant).toBeDefined();
      expect(result.session).toBeDefined();
      expect(app.db.insert).toHaveBeenCalled();
    });

    it("should throw 409 if email already exists", async () => {
      app.db.select.mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            limit: vi.fn().mockResolvedValue([{ id: "existing-user" }]),
          }),
        }),
      });

      await expect(
        authService.register({
          email: "existing@example.com",
          password: MOCK_CREDENTIAL,
          name: "Existing User",
        }),
      ).rejects.toThrow("Email already registered");
    });
  });

  describe("login", () => {
    it("should throw 401 if user not found", async () => {
      app.db.select.mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            limit: vi.fn().mockResolvedValue([]),
          }),
        }),
      });

      await expect(
        authService.login({ email: "none@example.com", password: MOCK_CREDENTIAL_SHORT }),
      ).rejects.toThrow("Invalid email or password");
    });

    it("should throw 403 if account suspended", async () => {
      app.db.select.mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            limit: vi.fn().mockResolvedValue([{
              id: "user-1",
              email: "suspended@example.com",
              status: "SUSPENDED",
              tenantId: "tenant-1",
              role: "PARENT",
            }]),
          }),
        }),
      });

      await expect(
        authService.login({ email: "suspended@example.com", password: MOCK_CREDENTIAL_SHORT }),
      ).rejects.toThrow("Account suspended");
    });

    it("should throw 401 on wrong password", async () => {
      const user = {
        id: "user-1",
        email: "test@example.com",
        status: "ACTIVE",
        tenantId: "tenant-1",
        role: "PARENT",
        name: "Test",
      };
      const account = {
        id: "account-1",
        userId: "user-1",
        providerId: "credential",
        accessToken: "$argon2id$hashed",
      };

      let callCount = 0;
      app.db.select.mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            limit: vi.fn().mockImplementation(() => {
              callCount++;
              if (callCount === 1) return Promise.resolve([user]);
              return Promise.resolve([account]);
            }),
          }),
        }),
      });

      await expect(
        authService.login({ email: "test@example.com", password: MOCK_WRONG_CREDENTIAL }),
      ).rejects.toThrow("Invalid email or password");
    });
  });

  describe("verifyEmail", () => {
    it("should update emailVerifiedAt on user", async () => {
      const updatedUser = {
        id: "user-1",
        email: "test@example.com",
        emailVerifiedAt: new Date(),
      };

      app.db.update.mockReturnValue({
        set: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            returning: vi.fn().mockResolvedValue([updatedUser]),
          }),
        }),
      });

      const result = await authService.verifyEmail("user-1");
      expect(result.emailVerifiedAt).toBeDefined();
    });

    it("should throw 404 if user not found", async () => {
      app.db.update.mockReturnValue({
        set: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            returning: vi.fn().mockResolvedValue([]),
          }),
        }),
      });

      await expect(authService.verifyEmail("nonexistent")).rejects.toThrow("User not found");
    });
  });

  describe("logout", () => {
    it("should delete session by token", async () => {
      await authService.logout("session-token-abc");
      expect(app.db.delete).toHaveBeenCalled();
    });
  });
});
