import 'module-alias/register';
import { Migrator } from '@storage/Migrator';
import { ApiServer } from './api/Server';

setInterval(() => console.log('[HEARTBEAT]', Date.now()), 1000);

process.on('unhandledRejection', (reason) => {
  console.error('[UNHANDLED REJECTION]', reason);
});

process.on('uncaughtException', (err) => {
  console.error('[UNCAUGHT EXCEPTION]', err.message, err.stack);
});

async function main() {
  await Migrator.run();
  const server = new ApiServer();
  await server.start();
}

main().catch(err => {
  console.error('Failed to start server:', err);
  process.exit(1);
});