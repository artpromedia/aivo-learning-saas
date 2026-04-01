// Debug wrapper to catch silent crashes in billing-svc
import { writeFileSync } from 'fs';

const origExit = process.exit;
process.exit = function(code) {
  const stack = new Error('process.exit called').stack;
  const msg = `EXIT CODE: ${code}\n${stack}\n`;
  writeFileSync('/tmp/debug-output.log', msg);
  writeFileSync('/dev/stderr', msg);
  origExit(code);
};

process.on('uncaughtException', (err) => {
  const msg = `UNCAUGHT: ${err.stack || err}\n`;
  writeFileSync('/tmp/debug-output.log', msg, { flag: 'a' });
  writeFileSync('/dev/stderr', msg);
});
process.on('unhandledRejection', (reason) => {
  const msg = `REJECT: ${reason?.stack || reason}\n`;
  writeFileSync('/tmp/debug-output.log', msg, { flag: 'a' });
  writeFileSync('/dev/stderr', msg);
});
process.on('exit', (code) => {
  const msg = `ON_EXIT: ${code}\n`;
  writeFileSync('/tmp/debug-output.log', msg, { flag: 'a' });
});

try {
  await import('/app/services/billing-svc/dist/index.js');
} catch (e) {
  const msg = `IMPORT CATCH: ${e.stack || e}\n`;
  writeFileSync('/tmp/debug-output.log', msg, { flag: 'a' });
  writeFileSync('/dev/stderr', msg);
}
