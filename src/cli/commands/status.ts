import fs from 'fs';
import path from 'path';
import { apiClient } from '../utils/apiClient';

const HOME = process.env.HOME || process.env.USERPROFILE || '';
const PID_FILE = path.join(HOME, '.afen', 'pid');

function isRunning(pid: number): boolean {
  try {
    process.kill(pid, 0);
    return true;
  } catch {
    return false;
  }
}

export async function statusCommand(): Promise<void> {
  try {
    if (!fs.existsSync(PID_FILE)) {
      console.log('❌ AFEN Runtime is not running.');
      process.exit(1);
    }

    const pid = parseInt(fs.readFileSync(PID_FILE, 'utf8'), 10);
    if (!isRunning(pid)) {
      console.log('❌ AFEN Runtime is not running (stale PID).');
      fs.unlinkSync(PID_FILE);
      process.exit(1);
    }

    // Health check
    await apiClient('GET', '/health');
    console.log('✅ AFEN Runtime is running.');
    console.log(`   Address: http://127.0.0.1:8787`);
    console.log(`   PID: ${pid}`);
    process.exit(0);
  } catch {
    console.log('❌ AFEN Runtime is not running (health check failed).');
    // Optionally clean stale PID
    if (fs.existsSync(PID_FILE)) fs.unlinkSync(PID_FILE);
    process.exit(1);
  }
}