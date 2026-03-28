import { z } from "zod";

const configSchema = z.object({
  PORT: z.coerce.number().default(3006),
  DATABASE_URL: z.string().min(1),
  REDIS_URL: z.string().min(1),
  NATS_URL: z.string().min(1),
  JWT_PUBLIC_KEY: z.string().min(1),
  BRAIN_SVC_URL: z.string().url().default("http://localhost:3002"),
  AI_SVC_URL: z.string().url().default("http://localhost:5000"),
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
  STORAGE_BACKEND: z.enum(["local", "s3"]).default("local"),
  S3_BUCKET: z.string().optional(),
  S3_REGION: z.string().optional(),
  S3_ENDPOINT: z.string().optional(),
  APP_URL: z.string().default("http://localhost:3000"),
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
