import { config as loadDotenv } from "dotenv";
import { z } from "zod";

// Load .env file in development
loadDotenv();

const configSchema = z.object({
  PORT: z.coerce.number().default(3001),
  DATABASE_URL: z.string().min(1),
  REDIS_URL: z.string().min(1).default("redis://localhost:6379"),
  NATS_URL: z.string().min(1).default("nats://localhost:4222"),
  AUTH_SECRET: z.string().min(32),
  JWT_PRIVATE_KEY: z.string().min(1),
  JWT_PUBLIC_KEY: z.string().min(1),
  GOOGLE_CLIENT_ID: z.string().default(""),
  GOOGLE_CLIENT_SECRET: z.string().default(""),
  APPLE_CLIENT_ID: z.string().default(""),
  APPLE_CLIENT_SECRET: z.string().default(""),
  OONRUMAIL_API_KEY: z.string().default(""),
  OONRUMAIL_BASE_URL: z.string().url().default("https://api.oonrumail.com/api/v1/transactional/aivolearning"),
  FAMILY_SVC_URL: z.string().url().default("http://localhost:3005"),
  BRAIN_SVC_URL: z.string().url().default("http://localhost:3002"),
  ASSESSMENT_SVC_URL: z.string().url().default("http://localhost:3012"),
  BILLING_SVC_URL: z.string().url().default("http://localhost:3008"),
  COMMS_SVC_URL: z.string().url().default("http://localhost:3007"),
  TUTOR_SVC_URL: z.string().url().default("http://localhost:3006"),
  ENGAGEMENT_SVC_URL: z.string().url().default("http://localhost:3004"),
  LEARNING_SVC_URL: z.string().url().default("http://localhost:3003"),
  ADMIN_SVC_URL: z.string().url().default("http://localhost:3009"),
  APP_URL: z.string().url().default("http://localhost:5000"),
  CORS_ORIGINS: z.string().optional(),
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
});

export type Config = z.infer<typeof configSchema>;

let _config: Config | null = null;

export function loadConfig(): Config {
  if (_config) return _config;
  _config = configSchema.parse(process.env);
  return _config;
}

export function getConfig(): Config {
  if (!_config) throw new Error("Config not loaded. Call loadConfig() first.");
  return _config;
}
