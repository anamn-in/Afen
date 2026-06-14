#!/usr/bin/env ts-node
import { ApiServer } from '../src/api/Server';

async function main() {
  console.log('Starting Afen...');
  const server = new ApiServer();
  await server.start();
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});