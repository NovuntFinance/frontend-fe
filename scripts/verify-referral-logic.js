/**
 * Quick verification of referral URL logic (runs with node, no Jest)
 * Run: node scripts/verify-referral-logic.js
 */

// Inline the logic to avoid needing ts-node/compilation
function getReferralCodeFromParams(params) {
  const ref = params?.ref ?? params?.referralCode ?? params?.referral;
  const refStr = Array.isArray(ref) ? ref[0] : ref;
  const trimmed = typeof refStr === 'string' ? refStr.trim() : '';
  return trimmed || null;
}

function buildSignupRedirectUrl(params) {
  const code = getReferralCodeFromParams(params);
  return code ? `/signup?ref=${encodeURIComponent(code)}` : '/signup';
}

const tests = [
  {
    name: 'ref param',
    params: { ref: 'ABC123' },
    expectUrl: '/signup?ref=ABC123',
  },
  {
    name: 'referralCode param',
    params: { referralCode: 'XYZ789' },
    expectUrl: '/signup?ref=XYZ789',
  },
  { name: 'no params', params: {}, expectUrl: '/signup' },
  { name: 'empty ref', params: { ref: '' }, expectUrl: '/signup' },
  {
    name: 'ref with spaces (trimmed)',
    params: { ref: '  TRIM  ' },
    expectUrl: '/signup?ref=TRIM',
  },
];

console.log('Running referral URL logic verification...\n');
let passed = 0;
for (const t of tests) {
  const url = buildSignupRedirectUrl(t.params);
  const ok = url === t.expectUrl;
  console.log(
    ok ? '✓' : '✗',
    t.name,
    '→',
    url,
    ok ? '' : `(expected ${t.expectUrl})`
  );
  if (ok) passed++;
}
console.log('\n' + passed + '/' + tests.length + ' passed');
process.exit(passed === tests.length ? 0 : 1);
