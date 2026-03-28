import { config as loadDotenv } from "dotenv";
import { z } from "zod";

loadDotenv();

const configSchema = z.object({
  PORT: z.coerce.number().default(3008),
  DATABASE_URL: z.string().min(1),
  REDIS_URL: z.string().min(1),
  NATS_URL: z.string().min(1),
  JWT_PUBLIC_KEY: z.string().min(1),
  STRIPE_SECRET_KEY: z.string().default(""),
  STRIPE_WEBHOOK_SECRET: z.string().default(""),
  STRIPE_PUBLISHABLE_KEY: z.string().default(""),
  APP_URL: z.string().url().default("http://localhost:3000"),
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
