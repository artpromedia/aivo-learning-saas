console.log("[1] Starting step-by-step test...");
const start = Date.now();
function ts() { return "[" + (Date.now() - start) + "ms]"; }
async function main() {
  try {
    console.log(ts(), "Step 1: importing dotenv");
    const d = await import("dotenv");
    d.config();
    console.log(ts(), "Step 2: importing postgres");
    const pg = await import("postgres");
    const sql = pg.default(process.env.DATABASE_URL);
    const r = await sql.unsafe("SELECT 1 as t");
    console.log(ts(), "DB OK", r[0]);
    await sql.end();
    console.log(ts(), "Step 3: importing nats");
    const nats = await import("nats");
    const nc = await nats.connect({ servers: process.env.NATS_URL });
    console.log(ts(), "NATS OK");
    await nc.close();
    console.log(ts(), "Step 4: importing ioredis");
    const R = await import("ioredis");
    const redis = new R.default(process.env.REDIS_URL);
    await redis.ping();
    console.log(ts(), "Redis OK");
    await redis.quit();
    console.log(ts(), "Step 5: importing observability");
    const obs = await import("@aivo/observability");
    console.log(ts(), "Observability loaded", Object.keys(obs));
    console.log(ts(), "Step 6: calling initTracing");
    const sdk = obs.initTracing({ serviceName: "test", environment: "prod" });
    console.log(ts(), "initTracing done");
    console.log(ts(), "Step 7: creating Fastify app and registering plugin");
    const F = await import("fastify");
    const app = F.default({ logger: false });
    await app.register(obs.observabilityPlugin, { serviceName: "test", environment: "prod" });
    console.log(ts(), "observabilityPlugin registered!");
    console.log(ts(), "ALL PASSED");
    await app.close();
    await sdk.shutdown();
    process.exit(0);
  } catch(e) { console.error(ts(), "ERROR:", e); process.exit(1); }
}
main();
