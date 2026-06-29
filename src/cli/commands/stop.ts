import fs from 'fs';
import path from 'path';

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

export function stopCommand(): void {
  try {
    if (!fs.existsSync(PID_FILE)) {
      console.log('❌ AFEN Runtime is not running.');
      process.exit(1);
    }

    const pid = parseInt(fs.readFileSync(PID_FILE, 'utf8').trim(), 10);

    if (isNaN(pid)) {
      fs.unlinkSync(PID_FILE);
      console.log('❌ AFEN Runtime is not running (invalid PID).');
      process.exit(1);
    }

    // Attempt kill regardless of isRunning check
    try {
      process.kill(pid, 'SIGKILL');
    } catch {
      // Process already gone — that's fine
    }

    // Always clean up PID file
    if (fs.existsSync(PID_FILE)) fs.unlinkSync(PID_FILE);

    console.log('✅ AFEN Runtime stopped.');
    process.exit(0);
  } catch (err) {
    console.error('❌', (err as Error).message);
    process.exit(1);
  }
}