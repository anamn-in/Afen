import 'module-alias/register';
import { ApiServer } from './api/Server';

// Catch unhandled promise rejections — log and keep running
process.on('unhandledRejection', (reason) => {
  console.error('[UNHANDLED REJECTION]', reason);
});

// Catch unhandled exceptions — log and keep running
process.on('uncaughtException', (err) => {
  console.error('[UNCAUGHT EXCEPTION]', err.message, err.stack);
});

const server = new ApiServer();
server.start().catch(err => {
  console.error('Failed to start server:', err);
  process.exit(1);
});