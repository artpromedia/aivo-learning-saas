import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema/index";

const connectionString = process.env.DATABASE_URL ?? "postgresql://aivo:aivo_dev@localhost:5432/aivo_dev";

const client = postgres(connectionString);

export const db = drizzle(client, { schema });

export type Database = typeof db;
