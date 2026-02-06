# Zero Secrets & Sensitive Data Rules

## Zero Secrets Policy

The frontend must never contain or expose:

- **In JavaScript / build output:** API keys, signing secrets, signing logic, internal service credentials.
- **In build config:** Secrets in env vars that are inlined into client bundles (e.g. `NEXT_PUBLIC_*` must never hold secrets).
- **In browser-visible env:** Only non-sensitive config (e.g. `NEXT_PUBLIC_API_URL`) is allowed. No keys, tokens, or internal identifiers that could authorize actions.

### Allowed in browser

- `NEXT_PUBLIC_API_URL` — backend base URL (no secret).
- Public feature flags or public config keys that do not grant access.
- Turnstile/Captcha site keys (public by design).

### Never in browser

- API keys, signing keys, JWT secrets.
- Internal user IDs or DB IDs used for authorization.
- Tokens in logs, error messages, or DOM.

---

## Sensitive Data Rendering Rules

- **Never display** raw internal IDs, database identifiers, or system status details in the UI.
- **Mask** sensitive values (account numbers, reference IDs) using helpers in `src/lib/sensitive-data.ts` (e.g. `maskTail`, `maskAccountNumber`, `formatIdForDisplay`).
- **Never trust** visibility based only on frontend conditions (e.g. “hide from non-admin”); the backend must enforce. Frontend masking is UX and defense in depth only.

---

## Build / Test

- **Scan build output** for tokens, keys, and internal IDs: run `node scripts/security-scan.js` (includes checks for common patterns).
- **Inspect DOM and DevTools:** Ensure no secrets or internal IDs appear in visible text or data attributes.
- **Env:** Ensure no `.env*` committed with secrets; `.env.local` and secrets stay out of repo and are not prefixed with `NEXT_PUBLIC_` unless non-sensitive.
