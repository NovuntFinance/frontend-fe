#!/usr/bin/env node

/**
 * Security smoke test: checks response headers and (optionally) that no token appears in HTML.
 * Run against a deployed or local app. For CI, run against staging URL.
 *
 * Usage:
 *   node scripts/security-smoke-test.js
 *   BASE_URL=https://staging.example.com node scripts/security-smoke-test.js
 *
 * Requires the server to be running (e.g. npm run start or deploy URL).
 */

const baseUrl = process.env.BASE_URL || 'http://localhost:3000';

async function fetchWithRedirects(url, options = {}) {
  const res = await fetch(url, { redirect: 'follow', ...options });
  return res;
}

async function main() {
  let failed = false;

  console.log('\n[Security smoke test] Target:', baseUrl);

  const res = await fetchWithRedirects(baseUrl + '/', {
    headers: { Accept: 'text/html' },
  }).catch((err) => {
    console.error('  Failed to fetch:', err.message);
    console.error('  Is the server running? Try: npm run start');
    process.exit(1);
  });

  const headers = Object.fromEntries(res.headers.entries());

  // 1) Content-Security-Policy present
  const csp = headers['content-security-policy'];
  if (!csp) {
    console.warn('  ⚠ Missing Content-Security-Policy header');
    failed = true;
  } else {
    console.log('  ✓ Content-Security-Policy present');
  }

  // 2) Strict-Transport-Security (HSTS) – optional on localhost
  const hsts = headers['strict-transport-security'];
  if (!hsts && !baseUrl.includes('localhost')) {
    console.warn('  ⚠ Missing Strict-Transport-Security (HSTS)');
    failed = true;
  } else if (hsts) {
    console.log('  ✓ Strict-Transport-Security present');
  }

  // 3) X-Frame-Options
  const xfo = headers['x-frame-options'];
  if (!xfo) {
    console.warn('  ⚠ Missing X-Frame-Options');
    failed = true;
  } else {
    console.log('  ✓ X-Frame-Options present');
  }

  // 4) X-Content-Type-Options
  const xcto = headers['x-content-type-options'];
  if (!xcto || xcto.toLowerCase() !== 'nosniff') {
    console.warn(
      '  ⚠ Missing or invalid X-Content-Type-Options (expect nosniff)'
    );
    failed = true;
  } else {
    console.log('  ✓ X-Content-Type-Options: nosniff');
  }

  // 5) No token in response body (heuristic: avoid leaking token in HTML)
  const html = await res.text();
  const tokenInBody =
    /Bearer\s+eyJ[A-Za-z0-9_-]+\.eyJ[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+/.test(
      html
    ) ||
    /localStorage\.getItem\s*\(\s*['"]novunt_token['"]\s*\)\s*\)?\s*;?\s*\)?\s*\.substring\s*\(/.test(
      html
    );
  if (tokenInBody) {
    console.warn(
      '  ⚠ Token or token substring may be present in HTML (inspect manually)'
    );
    failed = true;
  } else {
    console.log('  ✓ No obvious token in HTML body');
  }

  if (failed) {
    console.log('\n❌ Security smoke test had failures.\n');
    process.exit(1);
  }

  console.log('\n✓ Security smoke test passed.\n');
  process.exit(0);
}

main();
