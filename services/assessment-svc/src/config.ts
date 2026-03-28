import { z } from "zod";

const configSchema = z.object({
  PORT: z.coerce.number().default(3012),
  DATABASE_URL: z.string().min(1),
  REDIS_URL: z.string().min(1),
  NATS_URL: z.string().min(1),
  JWT_PUBLIC_KEY: z.string().min(1),
  AI_SVC_URL: z.string().url().default("http://localhost:5000"),
  UPLOAD_DIR: z.string().default("/tmp/aivo-uploads"),
  S3_BUCKET: z.string().default(""),
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

export function resetConfig(): void {
  _config = null;
}
