# Frontend Security Checklist

Use this before merge. The frontend is approved only if it can be **modified**, **replayed**, or **inspected** without granting extra power.

---

## Phase 1: Trust & API

- [ ] **Trust boundaries** — No permission/balance/approval decisions in frontend. See [FRONTEND_TRUST_BOUNDARIES.md](./FRONTEND_TRUST_BOUNDARIES.md).
- [ ] **API layer** — All backend calls go through `src/lib/api.ts` or admin API base. No inline `fetch`/`axios` in components. See [API_CONSUMPTION_RULES.md](./API_CONSUMPTION_RULES.md).
- [ ] Run: `node scripts/security-scan.js` (and fix reported issues).

## Phase 2: Zero Secrets & Data

- [ ] **No secrets** — No API keys, signing logic, or tokens in JS, build config, or browser-exposed env. Only non-sensitive `NEXT_PUBLIC_*` in client.
- [ ] **Sensitive data** — No raw internal IDs or DB identifiers in UI. Use `src/lib/sensitive-data.ts` for masking where needed.
- [ ] **Build scan** — Build output has no tokens, keys, or internal IDs. See [ZERO_SECRETS_AND_SENSITIVE_DATA.md](./ZERO_SECRETS_AND_SENSITIVE_DATA.md).

## Phase 3: Browser Security

- [ ] **CSP** — Content-Security-Policy applied. Inline script injection (e.g. `<script>alert(1)</script>`) must not execute in user content. For stricter CSP (no unsafe-inline), see [CSP_NONCE_HARDENING.md](./CSP_NONCE_HARDENING.md).
- [ ] **Headers** — HTTPS only, HSTS, X-Frame-Options DENY, X-Content-Type-Options nosniff, no mixed content.
- [ ] **Third-party scripts** — Only allowed, documented third parties; no new script without updating [THIRD_PARTY_SCRIPT_POLICY.md](./THIRD_PARTY_SCRIPT_POLICY.md) and CSP.
- [ ] Test with browser security/audit tools. Optional: `npm run security-smoke-test` (requires server running or set `BASE_URL`).

## Phase 4: Auth & Session

- [ ] **Tokens** — Not stored in localStorage for new code (migrate to httpOnly cookies where backend supports). Never logged; never exposed on `window`. See [TOKEN_MIGRATION_HTTPONLY_COOKIES.md](./TOKEN_MIGRATION_HTTPONLY_COOKIES.md).
- [ ] **Session** — 401/403 trigger redirect to login or clear session; no silent failure that grants access.

## Phase 5: Abuse & Errors

- [ ] **UI abuse** — Critical actions use cooldown / disabled state (e.g. `useSubmitGuard`). No reliance on UI-only protection.
- [ ] **Errors** — No raw backend messages, stack traces, or system details in UI. Use `getErrorMessageForUI` / `handleApiError`.

## Phase 6: Final Gate

- [ ] **Checklist** — All items above satisfied.
- [ ] **Verification** — Frontend can be modified, replayed, or inspected without granting extra power. All authority remains on the backend.
- [ ] **Gaps** — Known gaps and remediations documented in [SECURITY_GAPS_AND_REMEDIATIONS.md](./SECURITY_GAPS_AND_REMEDIATIONS.md).

---

## Known limitations & next steps

| Area                       | Current state                                   | How to improve                                                                                                                             |
| -------------------------- | ----------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------ |
| **Tokens in localStorage** | Still used; policy prefers HTTP-only cookies.   | Backend sets cookies; frontend stops using localStorage. See [TOKEN_MIGRATION_HTTPONLY_COOKIES.md](./TOKEN_MIGRATION_HTTPONLY_COOKIES.md). |
| **CSP unsafe-inline**      | Used so Next.js works.                          | Use nonce-based CSP when ready (dynamic rendering). See [CSP_NONCE_HARDENING.md](./CSP_NONCE_HARDENING.md).                                |
| **Live attack testing**    | Static scan + smoke test only.                  | Add `security-smoke-test` in CI against staging; consider OWASP ZAP or similar for pen-testing.                                            |
| **Third-party scripts**    | Sentry, Turnstile, etc. allowed and documented. | Keep list minimal; use SRI where we control script URL. See [THIRD_PARTY_SCRIPT_POLICY.md](./THIRD_PARTY_SCRIPT_POLICY.md).                |
| **Dependencies**           | No automated audit in loop.                     | Run `npm run security-audit` before merge; fix high/critical. Consider CI step.                                                            |

---

**Run before merge:**

```bash
npm run lint
npm run security-scan
npm run security-audit
# Optional (server must be running or set BASE_URL): npm run security-smoke-test
```
