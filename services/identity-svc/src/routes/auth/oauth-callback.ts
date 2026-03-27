import type { FastifyInstance } from "fastify";
import { AuthService } from "../../services/auth.service.js";
import { EmailService } from "../../services/email.service.js";
import { getConfig } from "../../config.js";

export async function oauthCallbackRoute(app: FastifyInstance) {
  app.get<{
    Params: { provider: string };
    Querystring: { code?: string; state?: string; error?: string };
  }>("/auth/callback/:provider", async (request, reply) => {
    const { provider } = request.params;
    const { code, error } = request.query;
    const config = getConfig();

    if (error) {
      return reply.redirect(`${config.APP_URL}/auth/error?error=${encodeURIComponent(error)}`);
    }

    if (!code) {
      return reply.status(400).send({ error: "Authorization code required" });
    }

    if (!["google", "apple"].includes(provider)) {
      return reply.status(400).send({ error: "Unsupported provider" });
    }

    // Exchange code for profile (provider-specific logic)
    const profile = await exchangeCodeForProfile(provider, code, config);

    const authService = new AuthService(app);
    const { user, session, isNew } = await authService.oauthLogin(profile);

    if (isNew) {
      const emailService = new EmailService(app);
      await emailService.sendTemplate("welcome", user.email, {
        recipientName: user.name,
      });
    }

    reply
      .setCookie("access_token", session.accessToken, {
        httpOnly: true,
        secure: config.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: 15 * 60,
      })
      .setCookie("refresh_token", session.refreshToken, {
        httpOnly: true,
        secure: config.NODE_ENV === "production",
        sameSite: "lax",
        path: "/auth/refresh",
        maxAge: 7 * 24 * 60 * 60,
      });

    return reply.redirect(`${config.APP_URL}/dashboard`);
  });
}

async function exchangeCodeForProfile(
  provider: string,
  code: string,
  config: { GOOGLE_CLIENT_ID: string; GOOGLE_CLIENT_SECRET: string; APPLE_CLIENT_ID: string; APPLE_CLIENT_SECRET: string; APP_URL: string },
) {
  if (provider === "google") {
    const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        code,
        client_id: config.GOOGLE_CLIENT_ID,
        client_secret: config.GOOGLE_CLIENT_SECRET,
        redirect_uri: `${config.APP_URL}/auth/callback/google`,
        grant_type: "authorization_code",
      }),
    });

    if (!tokenResponse.ok) {
      throw Object.assign(new Error("Google OAuth token exchange failed"), { statusCode: 401 });
    }

    const tokens = (await tokenResponse.json()) as {
      access_token: string;
      refresh_token?: string;
      id_token?: string;
    };

    const userInfoResponse = await fetch("https://www.googleapis.com/oauth2/v2/userinfo", {
      headers: { Authorization: `Bearer ${tokens.access_token}` },
    });

    if (!userInfoResponse.ok) {
      throw Object.assign(new Error("Failed to fetch Google user info"), { statusCode: 401 });
    }

    const userInfo = (await userInfoResponse.json()) as {
      id: string;
      email: string;
      name: string;
      picture?: string;
    };

    return {
      providerId: "google",
      providerAccountId: userInfo.id,
      email: userInfo.email,
      name: userInfo.name,
      avatarUrl: userInfo.picture,
      accessToken: tokens.access_token,
      refreshToken: tokens.refresh_token,
      idToken: tokens.id_token,
    };
  }

  if (provider === "apple") {
    const tokenResponse = await fetch("https://appleid.apple.com/auth/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        code,
        client_id: config.APPLE_CLIENT_ID,
        client_secret: config.APPLE_CLIENT_SECRET,
        redirect_uri: `${config.APP_URL}/auth/callback/apple`,
        grant_type: "authorization_code",
      }),
    });

    if (!tokenResponse.ok) {
      throw Object.assign(new Error("Apple OAuth token exchange failed"), { statusCode: 401 });
    }

    const tokens = (await tokenResponse.json()) as {
      access_token: string;
      refresh_token?: string;
      id_token: string;
    };

    // Decode Apple ID token to get user info
    const payload = JSON.parse(
      Buffer.from(tokens.id_token.split(".")[1], "base64url").toString(),
    ) as { sub: string; email: string };

    return {
      providerId: "apple",
      providerAccountId: payload.sub,
      email: payload.email,
      name: payload.email.split("@")[0], // Apple may not provide name
      accessToken: tokens.access_token,
      refreshToken: tokens.refresh_token,
      idToken: tokens.id_token,
    };
  }

  throw Object.assign(new Error("Unsupported provider"), { statusCode: 400 });
}
