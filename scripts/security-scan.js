#!/usr/bin/env node

/**
 * Frontend security scan: API layer, secrets, token exposure.
 * Run: node scripts/security-scan.js
 * See docs/FRONTEND_SECURITY_CHECKLIST.md and docs/API_CONSUMPTION_RULES.md
 */

const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const srcDir = path.join(root, 'src');

const allowedDirectFetch = [
  'src/lib/api.ts',
  'src/lib/backendHealthCheck.ts',
  'src/app/api/',
  'src/lib/web-vitals.ts',
  'src/lib/mutations/profileMutations.ts',
  'src/lib/toast.tsx', // comment only
  'src/app/sentry-example-page/', // example/debug page
  'src/components/dashboard/LiveTradingSignalsAuto.tsx', // external public APIs (CoinGecko, Frankfurter)
];
const allowedAxios = [
  'src/lib/api.ts',
  'src/lib/admin-api-base.ts',
  'src/services/adminAuthService.ts', // admin auth flow with separate token management
  'src/services/rosApi.ts', // ROS endpoints use non-standard base URL (/api/ vs /api/v1/)
];

function normalizePath(filePath) {
  return filePath.replace(/\\/g, '/');
}

function isAllowed(filePath, allowedList) {
  const normalized = normalizePath(filePath);
  return allowedList.some((a) => normalized.includes(a));
}

function* walkDir(dir, exts = null) {
  if (!fs.existsSync(dir)) return;
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const e of entries) {
    const full = path.join(dir, e.name);
    if (e.isDirectory()) {
      if (e.name !== 'node_modules' && e.name !== '.next')
        yield* walkDir(full, exts);
    } else if (!exts) {
      yield full;
    } else {
      const extList = Array.isArray(exts) ? exts : [exts];
      if (extList.some((ext) => e.name.endsWith(ext))) yield full;
    }
  }
}

let failed = false;

// 1) Direct fetch/axios outside approved API layer
console.log('\n[1] Checking for direct fetch()/axios outside API layer...');
for (const file of walkDir(srcDir, ['.ts', '.tsx'])) {
  const rel = path.relative(root, file);
  const content = fs.readFileSync(file, 'utf8');
  const hasNativeFetch =
    /\bfetch\s*\(\s*[`'"]/.test(content) || /\bfetch\s*\(\s*\$\{/.test(content);
  const hasAxios = /\baxios\.(get|post|put|patch|delete)\s*\(/.test(content);
  if (hasNativeFetch && !isAllowed(rel, allowedDirectFetch)) {
    console.warn(
      `  ⚠ ${rel}: direct fetch() detected. Prefer api.get/post from @/lib/api.`
    );
    failed = true;
  }
  if (hasAxios && !isAllowed(rel, allowedAxios)) {
    console.warn(
      `  ⚠ ${rel}: direct axios usage. Use api from @/lib/api or admin API base.`
    );
    failed = true;
  }
}

// 2) Token / secret exposure on window
console.log('\n[2] Checking for token/window exposure...');
for (const file of walkDir(srcDir, ['.ts', '.tsx'])) {
  const rel = path.relative(root, file);
  const content = fs.readFileSync(file, 'utf8');
  if (
    /(window as any)\.[a-zA-Z_]+.*=.*token|window\.__[A-Z_]+__\s*=/.test(
      content
    )
  ) {
    console.warn(
      `  ⚠ ${rel}: assigns to window (token/config exposure risk).`
    );
    failed = true;
  }
}

// 3) console.log that might log token value (substring/slice of token)
console.log('\n[3] Checking for token in console.log...');
for (const file of walkDir(srcDir, ['.ts', '.tsx'])) {
  const rel = path.relative(root, file);
  const content = fs.readFileSync(file, 'utf8');
  if (
    /console\.(log|info|debug)\s*\([^)]*token\s*[^)]*substring|console\.(log|info|debug)\s*\([^)]*\.slice\s*\([^)]*token/.test(
      content
    )
  ) {
    console.warn(
      `  ⚠ ${rel}: console may log token value. Do not log tokens.`
    );
    failed = true;
  }
}

// 4) NEXT_PUBLIC_ with explicit secret-like names (avoid real secrets in client env)
const envExample = path.join(root, '.env.example');
if (fs.existsSync(envExample)) {
  const envContent = fs.readFileSync(envExample, 'utf8');
  if (/NEXT_PUBLIC_.*SECRET\s*=/.test(envContent)) {
    console.warn(
      '\n  ⚠ .env.example: Do not use NEXT_PUBLIC_* for secrets (they are sent to browser).'
    );
    failed = true;
  }
}

if (failed) {
  console.log(
    '\n❌ Security scan found issues. See docs/API_CONSUMPTION_RULES.md and docs/FRONTEND_SECURITY_CHECKLIST.md.\n'
  );
  process.exit(1);
}

console.log('\n✓ Security scan passed (no obvious violations).\n');
