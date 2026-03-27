import { z } from "zod";

const configSchema = z.object({
  PORT: z.coerce.number().default(3005),
  DATABASE_URL: z.string().min(1),
  REDIS_URL: z.string().min(1),
  NATS_URL: z.string().min(1),
  JWT_PUBLIC_KEY: z.string().min(1),
  BRAIN_SVC_URL: z.string().url().default("http://localhost:3002"),
  IDENTITY_SVC_URL: z.string().url().default("http://localhost:3001"),
  LEARNING_SVC_URL: z.string().url().default("http://localhost:3003"),
  ENGAGEMENT_SVC_URL: z.string().url().default("http://localhost:3004"),
  TUTOR_SVC_URL: z.string().url().default("http://localhost:3006"),
  S3_BUCKET: z.string().default("aivo-family-exports"),
  S3_REGION: z.string().default("us-east-1"),
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
