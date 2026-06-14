#!/usr/bin/env ts-node
import { execSync } from 'child_process';
import { existsSync } from 'fs';
import path from 'path';

const SRC_DIR = path.resolve(process.cwd(), 'src');

async function lint() {
  console.log('🔍 Linting Afen source code...\n');

  if (!existsSync(SRC_DIR)) {
    console.warn(`⚠️ Source directory not found: ${SRC_DIR}`);
    process.exit(0);
  }

  try {
    execSync('npx eslint src --ext .ts', { stdio: 'inherit' });
    console.log('\n✅ Lint passed.');
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Lint failed.');
    process.exit(1);
  }
}

lint();