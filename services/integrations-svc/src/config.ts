import { config as loadDotenv } from "dotenv";
import { z } from "zod";

loadDotenv();

const configSchema = z.object({
  PORT: z.coerce.number().default(3010),
  DATABASE_URL: z.string().min(1),
  REDIS_URL: z.string().min(1),
  NATS_URL: z.string().min(1),
  JWT_PUBLIC_KEY: z.string().min(1),
  LTI_PRIVATE_KEY: z.string().default(""),
  LTI_PUBLIC_KEY: z.string().default(""),
  LTI_KID: z.string().default("aivo-lti-key-1"),
  CLEVER_CLIENT_ID: z.string().default(""),
  CLEVER_CLIENT_SECRET: z.string().default(""),
  CLEVER_REDIRECT_URI: z.string().default("http://localhost:3010/integrations/clever/callback"),
  CLASSLINK_CLIENT_ID: z.string().default(""),
  CLASSLINK_CLIENT_SECRET: z.string().default(""),
  CLASSLINK_REDIRECT_URI: z.string().default("http://localhost:3010/integrations/classlink/callback"),
  IDENTITY_SVC_URL: z.string().url().default("http://localhost:3001"),
  AWS_S3_BUCKET: z.string().default("aivo-integrations"),
  AWS_REGION: z.string().default("us-east-1"),
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
