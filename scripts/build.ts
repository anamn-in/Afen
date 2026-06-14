#!/usr/bin/env ts-node
import { execSync } from 'child_process';
import { existsSync, rmSync } from 'fs';
import path from 'path';

const DIST_DIR = path.resolve(process.cwd(), 'dist');

async function build() {
  console.log('🔨 Building Afen...\n');

  if (existsSync(DIST_DIR)) {
    console.log('🧹 Cleaning previous build...');
    rmSync(DIST_DIR, { recursive: true, force: true });
  }

  try {
    execSync('npx tsc', { stdio: 'inherit' });
    execSync('npx tsc-alias', { stdio: 'inherit' });
    console.log('\n✅ Build completed successfully!');
    console.log(`📦 Output directory: ${DIST_DIR}`);
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Build failed.');
    process.exit(1);
  }
}

build();