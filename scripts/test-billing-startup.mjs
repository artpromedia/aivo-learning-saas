// Step-by-step billing-svc startup test
console.log("[1] Starting step-by-step test...");
console.log("[2] Importing modules...");

const start = Date.now();
function ts() { return `[${Date.now() - start}ms]`; }

async function main() {
  try {
    console.log(ts(), "Importing dist/index.js config area...");
    // Step 1: Load config
    const { config: loadDotenv } = await import("dotenv");
    loadDotenv();
    console.log(ts(), "dotenv loaded");

    // Step 2: Test DB connection
    console.log(ts(), "Creating postgres connection...");
    const { default: postgres } = await import("postgres");
    const sql = postgres(process.env.DATABASE_URL);
    const result = await sql`SELECT 1 as test`;
    console.log(ts(), "DB connection OK:", result[0]);
    await sql.end();
    console.log(ts(), "DB closed");

    // Step 3: Test NATS connection
    console.log(ts(), "Connecting to NATS...");
    const { connect } = await import("nats");
    const nc = await connect({ servers: process.env.NATS_URL });
    console.log(ts(), "NATS connected");
    await nc.close();
    console.log(ts(), "NATS closed");

    // Step 4: Test Redis connection
    console.log(ts(), "Connecting to Redis...");
    const { default: Redis } = await import("ioredis");
    const redis = new Redis(process.env.REDIS_URL);
    await redis.ping();
    console.log(ts(), "Redis PING OK");
    await redis.quit();
    console.log(ts(), "Redis closed");

    // Step 5: Test observability import
    console.log(ts(), "Importing @aivo/observability...");
    const obs = await import("@aivo/observability");
    console.log(ts(), "Observability imported:", Object.keys(obs));

    // Step 6: Test initTracing
    console.log(ts(), "Calling initTracing...");
    const sdk = obs.initTracing({ serviceName: "test-billing", environment: "production" });
    console.log(ts(), "initTracing completed, sdk type:", typeof sdk);

    // Step 7: Test full observability plugin with Fastify
    console.log(ts(), "Creating Fastify instance...");
    const { default: Fastify } = await import("fastify");
    const app = Fastify({ logger: { level: "warn" } });
    console.log(ts(), "Fastify created");

    console.log(ts(), "Registering observabilityPlugin...");
    await app.register(obs.observabilityPlugin, {
      serviceName: "test-billing",
      environment: "production"
    });
    console.log(ts(), "observabilityPlugin registered!");

    console.log(ts(), "ALL STEPS PASSED");
    await app.close();
    await sdk.shutdown();
    process.exit(0);
  } catch (err) {
    console.error(ts(), "ERROR:", err);
    process.exit(1);
  }
}

main();
