import { execSync } from 'child_process';
import { existsSync, unlinkSync, writeFileSync, mkdirSync } from 'fs';
import path from 'path';
import { promisify } from 'util';

// Utility functions
const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Absolute paths
const CLI = path.resolve(__dirname, '../../configs/dist/src/cli/index.js');
const PID_FILE = path.resolve(__dirname, '../../configs/data/runtime.pid');
const FIXTURES_DIR = path.resolve(__dirname, 'fixtures');
const FIXTURE_FILE = path.join(FIXTURES_DIR, 'sample-error.json');

// Create fixture if it doesn't exist
function ensureFixture(): void {
  if (!existsSync(FIXTURES_DIR)) {
    mkdirSync(FIXTURES_DIR, { recursive: true });
  }
  if (!existsSync(FIXTURE_FILE)) {
    const payload = {
      errorType: 'TypeError',
      message: 'Cannot read properties of null',
      stackTraceRaw: 'at processUser (users.js:45:12)\nat handleRequest (server.js:23:5)',
      language: 'javascript',
    };
    writeFileSync(FIXTURE_FILE, JSON.stringify(payload, null, 2), 'utf-8');
  }
}

function run(cmd: string): string {
  // Execute the CLI command and return stdout
  try {
    const result = execSync(`node "${CLI}" ${cmd}`, {
      encoding: 'utf-8',
      timeout: 10000,
      stdio: 'pipe',
    });
    return result.toString().trim();
  } catch (e: any) {
    // Some commands (like stop when not running) may exit non-zero but still have output
    return (e.stdout || '').toString().trim() + (e.stderr || '').toString().trim();
  }
}

function runExpectFail(cmd: string): string {
  try {
    execSync(`node "${CLI}" ${cmd}`, {
      encoding: 'utf-8',
      timeout: 10000,
      stdio: 'pipe',
    });
    return '';
  } catch (e: any) {
    return (e.stdout || '').toString().trim() + (e.stderr || '').toString().trim();
  }
}

// Ensure runtime is stopped before and after the suite
beforeAll(async () => {
  ensureFixture();
  // Stop any existing runtime
  try {
    execSync(`node "${CLI}" stop`, { encoding: 'utf-8', stdio: 'ignore' });
  } catch {}
  // Delete PID file if it exists
  if (existsSync(PID_FILE)) {
    unlinkSync(PID_FILE);
  }
});

afterAll(async () => {
  // Stop runtime after tests
  try {
    execSync(`node "${CLI}" stop`, { encoding: 'utf-8', stdio: 'ignore' });
  } catch {}
  if (existsSync(PID_FILE)) {
    unlinkSync(PID_FILE);
  }
  // Clean up fixture
  if (existsSync(FIXTURE_FILE)) {
    unlinkSync(FIXTURE_FILE);
  }
});

// Helper to wait for runtime to be ready
async function waitForRuntimeReady(timeout = 5000): Promise<void> {
  const start = Date.now();
  while (Date.now() - start < timeout) {
    try {
      const status = run('status');
      if (status.includes('AFEN Runtime: Running')) {
        return;
      }
    } catch {}
    await sleep(200);
  }
  throw new Error('Runtime did not start within timeout');
}

describe('CLI End-to-End Tests', () => {
  test('afen start cold start', async () => {
    const output = run('start');
    expect(output).toContain('✅ AFEN Runtime started');
    expect(existsSync(PID_FILE)).toBe(true);
    await sleep(2000); // Give runtime time to initialize
    // Verify runtime is running
    await waitForRuntimeReady();
  });

  test('afen start when already running', async () => {
    const output = run('start');
    expect(output.toLowerCase()).toContain('already running');
  });

  test('afen status when running', async () => {
    const output = run('status');
    expect(output).toContain('AFEN Runtime: Running');
    expect(output).toContain('http://127.0.0.1:8787');
  });

  test('afen errors when running', async () => {
    const output = run('errors');
    // It may show "Found 0 errors" or list errors; we just check it's not crashing
    expect(output).toContain('Found');
  });

  test('afen ingest <file> valid file', async () => {
    const output = run(`ingest "${FIXTURE_FILE}"`);
    expect(output).toContain('✅ Ingested successfully');
    expect(output).toContain('status');
    expect(output).toContain('accepted');
  });

  test('afen ingest file not found', async () => {
    const output = runExpectFail('ingest nonexistent.json');
    expect(output).toMatch(/ENOENT|Failed/);
  });

  test('afen graph after ingest', async () => {
    const output = run('graph');
    expect(output).toContain('Graph nodes:');
  });

  test('afen root-causes after ingest', async () => {
    const output = run('root-causes');
    // Should be valid JSON array or empty
    expect(() => JSON.parse(output)).not.toThrow();
    const parsed = JSON.parse(output);
    expect(Array.isArray(parsed)).toBe(true);
  });

  test('afen query "SELECT * FROM trace"', async () => {
    const output = run('query "SELECT * FROM trace"');
    expect(output).toContain('ast');
  });

  test('afen stop', async () => {
    const output = run('stop');
    expect(output).toContain('✅ AFEN Runtime stopped');
    await sleep(1000);
    expect(existsSync(PID_FILE)).toBe(false);
  });

  test('afen stop when already stopped', async () => {
    const output = runExpectFail('stop');
    expect(output).toContain('not running');
  });

  test('afen status when runtime is down', async () => {
    // At this point runtime is stopped from previous test
    const output = run('status');
    expect(output).toContain('AFEN Runtime is not running');
  });
});