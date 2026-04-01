#!/bin/sh
cd /app
echo "=== Test 1: Just config loading ==="
timeout 3 node --input-type=module -e '
import { config } from "dotenv";
config();
console.log("Config loaded OK, PORT=", process.env.PORT);
' 2>&1
echo "EXIT=$?"

echo "=== Test 2: Fastify + db + nats (no redis/stripe/otel) ==="
timeout 8 node --input-type=module -e '
import Fastify from "fastify";
const app = Fastify({logger:false});
console.log("Fastify created");

import postgres from "postgres";
const client = postgres(process.env.DATABASE_URL);
console.log("DB client created");

import { connect } from "nats";
console.log("NATS connecting...");
const nc = await connect({ servers: process.env.NATS_URL });
console.log("NATS connected");

import Redis from "ioredis";
const redis = new Redis(process.env.REDIS_URL);
console.log("Redis created");

await app.listen({ port: 3099, host: "0.0.0.0" });
console.log("Fastify listening on 3099");
await app.close();
await nc.drain();
await redis.quit();
await client.end();
console.log("All cleaned up");
process.exit(0);
' 2>&1
echo "EXIT=$?"
