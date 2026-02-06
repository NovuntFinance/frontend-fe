# Security Gaps and Remediations

This document records findings from frontend security review and how they are addressed.

---

## 1. HTML injection / XSS (dangerouslySetInnerHTML)

| Location                                 | Risk                                                                                            | Remediation                                                                                                                                                   |
| ---------------------------------------- | ----------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `ArticleDetailModal.tsx`                 | `article.content` from API rendered raw.                                                        | **Done.** Content is passed through `sanitizeHTMLForDisplay()` (DOMPurify in browser, regex fallback on server).                                              |
| `NovuntAssistant.tsx`                    | `formatMessage()` builds HTML from user/API content and renders with `dangerouslySetInnerHTML`. | **Done.** Rendered output is passed through `sanitizeHTMLForDisplay()` before display.                                                                        |
| `TransactionHistory.tsx` (receipt print) | Uses `receiptContent.innerHTML` in a print window.                                              | **Accepted.** Source is app-generated receipt DOM, not user/API HTML. Ensure receipt data (e.g. from API) is not injected into that DOM without sanitization. |

**Rule:** Any HTML that comes from the backend or user must be sanitized with `sanitizeHTMLForDisplay()` (or `sanitizeUserInput()` if no HTML is allowed) before use in `dangerouslySetInnerHTML`.

---

## 2. Tokens and secrets in localStorage

| Location                                     | Item                                                             | Status                                                                                                                                                               |
| -------------------------------------------- | ---------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `authStore.ts`, `api.ts`, `token-refresh.ts` | User access/refresh tokens                                       | Still in localStorage. Policy: migrate to HTTP-only cookies when backend supports. See [TOKEN_MIGRATION_HTTPONLY_COOKIES.md](./TOKEN_MIGRATION_HTTPONLY_COOKIES.md). |
| `adminAuthService.ts`, `rosApi.ts`           | Admin token / user token for ROS                                 | Same as above; document as accepted until backend sets cookies.                                                                                                      |
| `dailyProfitService.ts`, `transferApi.ts`    | Read `accessToken` / `authToken`                                 | Same; used for API auth until cookie-based auth is in place.                                                                                                         |
| Bonus/onboarding/locale                      | `novunt_bonus_*`, `novunt-locale`, `novunt-onboarding-completed` | Non-sensitive UX state; acceptable in localStorage.                                                                                                                  |

**Rule:** No new token or secret in localStorage. Prefer HTTP-only cookies for new auth flows.

---

## 3. Environment variables

- **NEXT*PUBLIC*\*** are exposed to the browser. Only non-secret config (e.g. `NEXT_PUBLIC_API_URL`, `NEXT_PUBLIC_TURNSTILE_SITE_KEY`) are used. No `NEXT_PUBLIC_*SECRET` or keys.
- **NODE_ENV** is used only for dev-only logging/behavior.

**Rule:** Never expose secrets via `NEXT_PUBLIC_*`. See [ZERO_SECRETS_AND_SENSITIVE_DATA.md](./ZERO_SECRETS_AND_SENSITIVE_DATA.md).

---

## 4. Console logging

- Security scan enforces no token preview (e.g. `token.substring`) in console.
- Many files still have `console.log`/`console.warn`/`console.error` for errors or dev-only behavior. These must not log tokens, full responses with secrets, or PII.

**Rule:** No logging of tokens, passwords, or full API response bodies. Use `getErrorMessageForUI` for user-facing error text.

---

## 5. API consumption

- All backend calls go through approved layers (`api.ts`, `admin-api-base.ts`, `adminAuthService.ts`, `rosApi.ts`, `configService` via apiClient). Security scan enforces this.
- No hardcoded backend URLs; use `NEXT_PUBLIC_API_URL` or centralized base URL.

**Rule:** See [API_CONSUMPTION_RULES.md](./API_CONSUMPTION_RULES.md).

---

## 6. Dependencies (npm audit)

- Run `npm run security-audit` regularly. Fix high/critical issues.
- Current known issues (as of last review): apply `npm audit fix`; for Next.js major upgrades use `npm audit fix --force` only after testing.

**Rule:** Pre-merge run includes `npm run security-audit`. See [FRONTEND_SECURITY_CHECKLIST.md](./FRONTEND_SECURITY_CHECKLIST.md).

---

## 7. CSP and headers

- CSP and security headers are applied via `src/lib/security-headers.ts` and `next.config.ts`.
- `unsafe-inline` is still used for scripts to support Next.js. Stricter CSP with nonces is documented in [CSP_NONCE_HARDENING.md](./CSP_NONCE_HARDENING.md).

---

## 8. Third-party scripts

- Allowed third parties (Sentry, Turnstile, etc.) are documented in [THIRD_PARTY_SCRIPT_POLICY.md](./THIRD_PARTY_SCRIPT_POLICY.md).
- No new third-party script without updating that doc and CSP.

---

## Verification commands

```bash
npm run security-scan
npm run security-audit
# Optional (server running or BASE_URL set):
npm run security-smoke-test
```
