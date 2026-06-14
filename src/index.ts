import { ApiServer } from './api/Server';

const server = new ApiServer();
server.start().catch(err => {
  console.error('Fatal error during startup:', err);
  process.exit(1);
});