#!/usr/bin/env node
/**
 * Run lint, typecheck, and build; print results to console and save to validation-results.txt
 * Usage: node scripts/run-validation.js
 */
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const outPath = path.join(__dirname, '..', 'validation-results.txt');
const lines = [];

function run(name, cmd) {
  lines.push(`\n=== ${name} ===`);
  try {
    const out = execSync(cmd, {
      encoding: 'utf-8',
      cwd: path.join(__dirname, '..'),
    });
    lines.push(out || '(no output)');
    lines.push(`OK`);
    return true;
  } catch (e) {
    lines.push(e.stdout || '');
    lines.push(e.stderr || '');
    lines.push(`FAILED: ${e.message}`);
    return false;
  }
}

console.log('Running typecheck...');
const t = run('TypeScript (tsc --noEmit)', 'npx tsc --noEmit');
console.log(t ? 'Typecheck OK' : 'Typecheck FAILED');

console.log('Running lint...');
const l = run('ESLint', 'npm run lint');
console.log(l ? 'Lint OK' : 'Lint FAILED');

console.log('Running build...');
const b = run('Next.js build', 'npm run build');
console.log(b ? 'Build OK' : 'Build FAILED');

const content = lines.join('\n');
fs.writeFileSync(outPath, content, 'utf-8');
console.log(`\nResults written to ${outPath}`);

if (!t || !l || !b) process.exit(1);
process.exit(0);
