import { spawn } from 'child_process';
import { existsSync, mkdirSync, writeFileSync, readFileSync, unlinkSync, openSync, closeSync } from 'fs';
import path from 'path';

const DATA_DIR = path.resolve(process.cwd(), 'data');
const PID_FILE = path.join(DATA_DIR, 'runtime.pid');
const LOG_FILE = path.join(DATA_DIR, 'runtime.log');

// Absolute path to the compiled runtime entry point
const RUNTIME_ENTRY = path.resolve(__dirname, 'index.js');

export class RuntimeManager {
  static getPidFile(): string {
    return PID_FILE;
  }

  static ensureDataDir(): void {
    if (!existsSync(DATA_DIR)) {
      mkdirSync(DATA_DIR, { recursive: true });
    }
  }

  static isRunning(): boolean {
    if (!existsSync(PID_FILE)) return false;
    try {
      const pid = parseInt(readFileSync(PID_FILE, 'utf-8').trim(), 10);
      if (isNaN(pid)) return false;
      try {
        process.kill(pid, 0);
        return true;
      } catch {
        return false;
      }
    } catch {
      return false;
    }
  }

  static getPid(): number | null {
    if (!existsSync(PID_FILE)) return null;
    try {
      const pid = parseInt(readFileSync(PID_FILE, 'utf-8').trim(), 10);
      return isNaN(pid) ? null : pid;
    } catch {
      return null;
    }
  }

  /**
   * Starts the AFEN runtime as a fully detached background process.
   * Uses absolute paths and separate log file handles to ensure
   * the daemon survives the parent CLI exit.
   */
  static start(port: number = 8787): void {
    this.ensureDataDir();
    if (this.isRunning()) {
      throw new Error(`AFEN Runtime is already running (PID ${this.getPid()}).`);
    }

    // Ensure the runtime entry exists
    if (!existsSync(RUNTIME_ENTRY)) {
      throw new Error(`Runtime entry not found: ${RUNTIME_ENTRY}. Please rebuild the project.`);
    }

    // Open log file handles for stdout/stderr
    const out = openSync(LOG_FILE, 'a');
    const err = openSync(LOG_FILE, 'a');

    const child = spawn(process.execPath, [RUNTIME_ENTRY], {
      detached: true,
      stdio: ['ignore', out, err], // Sever all terminal connections
      windowsHide: true,
      env: {
        ...process.env,
        AFEN_RUNTIME_PORT: String(port),
        NODE_ENV: 'production',
        DB_PATH: path.join(DATA_DIR, 'afen.db'), // Ensure consistent DB path
      },
    });

    // Close the file descriptors in the parent (child keeps them open)
    closeSync(out);
    closeSync(err);

    // Write PID file
    writeFileSync(PID_FILE, String(child.pid), 'utf-8');

    // Unref the child so the parent can exit independently
    child.unref();

    // The child is now running in the background.
  }

  static stop(): void {
    if (!this.isRunning()) {
      throw new Error('AFEN Runtime is not running.');
    }
    const pid = this.getPid();
    if (pid) {
      try {
        process.kill(pid, 'SIGTERM');
      } catch {
        // Process already gone
      }
    }
    // Remove PID file after a brief delay
    setTimeout(() => {
      if (existsSync(PID_FILE)) unlinkSync(PID_FILE);
    }, 500);
  }

  static status(): { running: boolean; pid?: number; port?: number } {
    const running = this.isRunning();
    const pid = this.getPid();
    const port = parseInt(process.env.AFEN_RUNTIME_PORT || '8787', 10);
    return { running, pid: pid || undefined, port };
  }
}