// Wrapper that loads billing-svc but adds timing to each plugin registration
import { readFileSync, writeFileSync } from 'fs';
import { pathToFileURL } from 'url';

// Read the original source
const src = readFileSync('/app/services/billing-svc/dist/index.js', 'utf8');

// Add console.log before each await app2.register
const patched = src
  .replace('await app2.register(db_default)', 'console.log(">>> registering db"); await app2.register(db_default); console.log(">>> db done")')
  .replace('await app2.register(nats_default)', 'console.log(">>> registering nats"); await app2.register(nats_default); console.log(">>> nats done")')
  .replace('await app2.register(redis_default)', 'console.log(">>> registering redis"); await app2.register(redis_default); console.log(">>> redis done")')
  .replace('await app2.register(stripe_default)', 'console.log(">>> registering stripe"); await app2.register(stripe_default); console.log(">>> stripe done")')
  .replace('await app2.register(observabilityPlugin', 'console.log(">>> registering observability"); await app2.register(observabilityPlugin')
  .replace('await app2.register(healthRoutes)', 'console.log(">>> observability done"); console.log(">>> registering healthRoutes"); await app2.register(healthRoutes); console.log(">>> healthRoutes done")')
  .replace('await setupSubscribers', 'console.log(">>> all routes done"); await setupSubscribers')
  .replace('await app.listen', 'console.log(">>> calling listen"); await app.listen');

// Write patched version to the service dist dir (same ESM resolution context)
writeFileSync('/app/services/billing-svc/dist/instrumented.js', patched);

console.log('Patched file written, running...');
await import('/app/services/billing-svc/dist/instrumented.js');
