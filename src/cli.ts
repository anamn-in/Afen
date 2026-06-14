#!/usr/bin/env node
import 'module-alias/register';
import { ApiServer } from './api/Server';

const PORT = parseInt(process.env.PORT || '3000', 10);
const BASE_URL = process.env.AFEN_API_URL || `http://localhost:${PORT}`;

function printHelp(): void {
  console.log(`
Afen CLI - Universal Debugging Intelligence Layer

Usage:
  afen start                          Start the Afen server
  afen send-error <json-file>         Send a test error payload to /ingest
  afen send-error --inline '<json>'   Send an inline JSON error payload
  afen query "<AQL command>"          Run an AQL query against /query
  afen --help                         Show this help message

Examples:
  afen start
  afen send-error ./sample-error.json
  afen send-error --inline '{"message":"TypeError: x is undefined","errorType":"TypeError"}'
  afen query "EXPLAIN latest"
  afen query "TRACE err_42"
`);
}

async function startServer(): Promise<void> {
  const server = new ApiServer(PORT);
  await server.start();
}

async function sendError(args: string[]): Promise<void> {
  let payload: unknown;

  if (args[0] === '--inline') {
    const jsonStr = args[1];
    if (!jsonStr) {
      console.error('Error: --inline requires a JSON string argument');
      process.exit(1);
    }
    try {
      payload = JSON.parse(jsonStr);
    } catch (err) {
      console.error('Error: invalid JSON for --inline payload:', (err as Error).message);
      process.exit(1);
    }
  } else {
    const filePath = args[0];
    if (!filePath) {
      console.error('Error: send-error requires a file path or --inline \'<json>\'');
      process.exit(1);
    }
    const fs = await import('fs');
    const path = await import('path');
    const resolved = path.resolve(process.cwd(), filePath);
    if (!fs.existsSync(resolved)) {
      console.error(`Error: file not found: ${resolved}`);
      process.exit(1);
    }
    try {
      const raw = fs.readFileSync(resolved, 'utf-8');
      payload = JSON.parse(raw);
    } catch (err) {
      console.error('Error: failed to read/parse JSON file:', (err as Error).message);
      process.exit(1);
    }
  }

  const body = payload as Record<string, unknown>;
  if (!body.message || !body.errorType) {
    console.error('Error: payload must include "message" and "errorType" fields');
    process.exit(1);
  }

  try {
    const res = await fetch(`${BASE_URL}/ingest`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!res.ok) {
      console.error(`Error: server responded with ${res.status}`);
      console.error(JSON.stringify(data, null, 2));
      process.exit(1);
    }
    console.log('✅ Error ingested successfully:');
    console.log(JSON.stringify(data, null, 2));
  } catch (err) {
    console.error(`Error: could not reach Afen server at ${BASE_URL}`);
    console.error('Is the server running? Try `afen start` first.');
    console.error((err as Error).message);
    process.exit(1);
  }
}

async function runQuery(args: string[]): Promise<void> {
  const query = args.join(' ').trim();
  if (!query) {
    console.error('Error: query requires an AQL command string');
    console.error('Example: afen query "EXPLAIN latest"');
    process.exit(1);
  }

  try {
    const res = await fetch(`${BASE_URL}/query`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query }),
    });
    const data = await res.json();
    if (!res.ok) {
      console.error(`Error: server responded with ${res.status}`);
      console.error(JSON.stringify(data, null, 2));
      process.exit(1);
    }
    console.log(JSON.stringify(data, null, 2));
  } catch (err) {
    console.error(`Error: could not reach Afen server at ${BASE_URL}`);
    console.error('Is the server running? Try `afen start` first.');
    console.error((err as Error).message);
    process.exit(1);
  }
}

async function main(): Promise<void> {
  const [command, ...args] = process.argv.slice(2);

  switch (command) {
    case 'start':
      await startServer();
      break;
    case 'send-error':
      await sendError(args);
      break;
    case 'query':
      await runQuery(args);
      break;
    case '--help':
    case '-h':
    case undefined:
      printHelp();
      break;
    default:
      console.error(`Unknown command: ${command}`);
      printHelp();
      process.exit(1);
  }
}

main().catch(err => {
  console.error('Fatal CLI error:', err);
  process.exit(1);
});