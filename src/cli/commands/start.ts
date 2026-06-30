import { spawn } from 'child_process';
import fs from 'fs';
import path from 'path';
import { apiClient } from '../utils/apiClient';

const HOME = process.env.HOME || process.env.USERPROFILE || '';
const AFEN_DIR = path.join(HOME, '.afen');
const PID_FILE = path.join(AFEN_DIR, 'pid');
const LOG_FILE = path.join(AFEN_DIR, 'logs', 'runtime.log');

const CONFIGS_DIR = (() => {
  try {
    return fs.realpathSync(path.resolve(__dirname, '../../..'));
  } catch {
    return path.resolve(__dirname, '../../..');
  }
})();
const SERVER_ENTRY = path.join(CONFIGS_DIR, 'dist', 'index.js');

function isRunning(pid: number): boolean {
  try {
    process.kill(pid, 0);
    return true;
  } catch {
    return false;
  }
}

async function waitForServer(timeout: number = 15000): Promise<void> {
  const start = Date.now();
  while (Date.now() - start < timeout) {
    try {
      await apiClient('GET', '/health');
      return;
    } catch {
      await new Promise(resolve => setTimeout(resolve, 500));
    }
  }
  throw new Error('Server did not become reachable within timeout');
}

export function startCommand(): void {
  try {
    if (!fs.existsSync(AFEN_DIR)) fs.mkdirSync(AFEN_DIR, { recursive: true });
    if (!fs.existsSync(path.dirname(LOG_FILE))) fs.mkdirSync(path.dirname(LOG_FILE), { recursive: true });

    if (fs.existsSync(PID_FILE)) {
      const pid = parseInt(fs.readFileSync(PID_FILE, 'utf8'), 10);
      if (isRunning(pid)) {
        console.log('✅ AFEN Runtime already running.');
        console.log(`   Address: http://127.0.0.1:8787`);
        console.log(`   PID: ${pid}`);
        process.exit(0);
      }
      fs.unlinkSync(PID_FILE);
    }

    console.log(`⏳ Starting runtime from: ${CONFIGS_DIR}`);

    // Open log file descriptor directly — no pipe through parent process
    const logFd = fs.openSync(LOG_FILE, 'a');

    const child = spawn('node', ['-r', 'module-alias/register', SERVER_ENTRY], {
      cwd: CONFIGS_DIR,
      detached: true,
      stdio: ['ignore', logFd, logFd],
    });

    child.unref();

    if (!child.pid) {
      throw new Error('Failed to start runtime: no PID returned.');
    }

    fs.writeFileSync(PID_FILE, child.pid.toString());

    console.log('⏳ Waiting for runtime to become ready...');
    waitForServer(15000).then(() => {
      console.log('✅ AFEN Runtime started.');
      console.log(`   Address: http://127.0.0.1:8787`);
      console.log(`   PID: ${child.pid}`);
      process.exit(0);
    }).catch(err => {
      console.error('❌ Runtime started but health check failed:', err.message);
      console.error(`   Check logs at: ${LOG_FILE}`);
      process.exit(1);
    });

    setTimeout(() => {
      console.error('❌ Runtime startup timed out.');
      console.error(`   Check logs at: ${LOG_FILE}`);
      process.exit(1);
    }, 20000);
  } catch (err) {
    console.error('❌', (err as Error).message);
    process.exit(1);
  }
}