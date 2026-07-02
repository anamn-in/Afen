import { execSync } from 'child_process';
import { existsSync, unlinkSync, writeFileSync, mkdirSync } from 'fs';
import path from 'path';

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const CLI = path.resolve(__dirname, '../../configs/dist/cli/index.js');
const PID_FILE = path.join(process.env.HOME || process.env.USERPROFILE || '', '.afen', 'pid');
const FIXTURES_DIR = path.resolve(__dirname, 'fixtures');
const FIXTURE_FILE = path.join(FIXTURES_DIR, 'sample-error.json');

function ensureFixture(): void {
  if (!existsSync(FIXTURES_DIR)) {
    mkdirSync(FIXTURES_DIR, { recursive: true });
  }

  const payload = {
    errorType: 'TypeError',
    message: 'Cannot read properties of null',
    stackTraceRaw: 'at processUser (users.js:45:12)\nat handleRequest (server.js:23:5)',
    language: 'javascript',
  };

  writeFileSync(FIXTURE_FILE, JSON.stringify(payload, null, 2), 'utf-8');
}

function run(cmd: string): string {
  try {
    const result = execSync(`node "${CLI}" ${cmd}`, {
      encoding: 'utf-8',
      timeout: 30000,
      stdio: 'pipe',
    });

    return result.toString().trim();
  } catch (e: any) {
    return `${(e.stdout || '').toString().trim()}${(e.stderr || '').toString().trim()}`;
  }
}

function runExpectFail(cmd: string): string {
  try {
    execSync(`node "${CLI}" ${cmd}`, {
      encoding: 'utf-8',
      timeout: 30000,
      stdio: 'pipe',
    });

    return '';
  } catch (e: any) {
    return `${(e.stdout || '').toString().trim()}${(e.stderr || '').toString().trim()}`;
  }
}

async function waitForRuntimeReady(timeout = 15000): Promise<void> {
  const start = Date.now();

  while (Date.now() - start < timeout) {
    const status = run('status');

    if (status.includes('AFEN Runtime is running')) {
      return;
    }

    await sleep(500);
  }

  throw new Error('Runtime did not start within timeout');
}

beforeAll(async () => {
  ensureFixture();

  try {
    execSync(`node "${CLI}" stop`, { encoding: 'utf-8', stdio: 'ignore' });
  } catch {}

  if (existsSync(PID_FILE)) {
    unlinkSync(PID_FILE);
  }
});

afterAll(async () => {
  try {
    execSync(`node "${CLI}" stop`, { encoding: 'utf-8', stdio: 'ignore' });
  } catch {}

  if (existsSync(PID_FILE)) {
    unlinkSync(PID_FILE);
  }

  if (existsSync(FIXTURE_FILE)) {
    unlinkSync(FIXTURE_FILE);
  }
});

describe('CLI End-to-End Tests', () => {
  test('afen start cold start', async () => {
    const output = run('start');

    expect(output).toContain('AFEN Runtime started');
    expect(output).toContain('http://127.0.0.1:8787');
    expect(existsSync(PID_FILE)).toBe(true);

    await waitForRuntimeReady();
  });

  test('afen start when already running', async () => {
    const output = run('start');

    expect(output.toLowerCase()).toContain('already running');
  });

  test('afen status when running', async () => {
    const output = run('status');

    expect(output).toContain('AFEN Runtime is running');
    expect(output).toContain('http://127.0.0.1:8787');
  });

  test('afen ingest <file> valid file', async () => {
    const output = run(`ingest "${FIXTURE_FILE}"`);

    expect(output).toContain('Ingested successfully');
    expect(output).toContain('accepted');
  });

  test('afen ingest file not found', async () => {
    const output = runExpectFail('ingest nonexistent.json');

    expect(output).toMatch(/Failed to ingest|ENOENT|no such file/i);
  });

  test('afen graph after ingest', async () => {
    const output = run('graph');

    expect(output).toContain('Graph nodes:');
  });

  test('afen root-causes after ingest', async () => {
    const output = run('root-causes');

    expect(() => JSON.parse(output)).not.toThrow();

    const parsed = JSON.parse(output);
    expect(Array.isArray(parsed)).toBe(true);
  });

  test('afen query "SELECT * FROM errors"', async () => {
    const output = run('query "SELECT * FROM errors"');

    expect(output).toContain('ast');
    expect(output).toContain('select');
  });

  test('afen stop', async () => {
    const output = run('stop');

    expect(output).toContain('AFEN Runtime stopped');

    await sleep(1000);
    expect(existsSync(PID_FILE)).toBe(false);
  });

  test('afen stop when already stopped', async () => {
    const output = runExpectFail('stop');

    expect(output).toContain('not running');
  });

  test('afen status when runtime is down', async () => {
    const output = run('status');

    expect(output).toContain('AFEN Runtime is not running');
  });
});