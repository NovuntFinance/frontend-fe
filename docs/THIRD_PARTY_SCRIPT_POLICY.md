# Third-Party Script Policy

Third-party scripts run in our origin and can read page content, cookies (non-HTTP-only), and localStorage. We allow only what is necessary and document each.

## Allowed Third Parties (and why)

| Service                     | Purpose                                  | CSP / Risk                                                                                                    |
| --------------------------- | ---------------------------------------- | ------------------------------------------------------------------------------------------------------------- |
| **Cloudflare Turnstile**    | Bot protection (e.g. login, withdrawal). | `script-src`, `frame-src`, `connect-src`: `https://challenges.cloudflare.com`. Required for CAPTCHA widget.   |
| **Sentry**                  | Error and performance monitoring.        | `connect-src`: `https://*.ingest.de.sentry.io`, `https://*.sentry.io`. Loaded via `@sentry/nextjs` (bundled). |
| **CoinGecko / Frankfurter** | Public FX/crypto rates for display only. | `connect-src` only; no script from these domains. Data is not trusted for decisions.                          |
| **Vercel**                  | Preview / analytics if used.             | `script-src` / `connect-src`: `https://*.vercel.com`, `https://vercel.live`.                                  |
| **Google Fonts**            | Typography.                              | `style-src`: `https://fonts.googleapis.com`; `font-src`: `https://fonts.gstatic.com`.                         |

## Rules

1. **Minimum set** — Do not add a new third-party script without documenting it here and updating CSP only as needed.
2. **No secrets** — Third-party config in the browser must use only public keys (e.g. Sentry DSN, Turnstile site key). No secrets in client env or JS.
3. **SRI where possible** — For any script we load via `<script src="...">` with a **stable URL**, add a `integrity` hash and use it in the tag. Sentry/Turnstile are often loaded by SDK or dynamic URLs; SRI is applied where we control the script tag and the URL is fixed.
4. **Trust boundary** — Third-party code is not trusted. No sensitive decisions (e.g. balance, permissions) must depend on third-party logic or data.

## Adding a New Third Party

1. Document: name, purpose, domains, and which CSP directives are updated.
2. Prefer `connect-src` only (API calls) over loading their script when possible.
3. If a script is required, add the minimum domains to `script-src` (and `frame-src` if embedded). Prefer nonce when we use nonce-based CSP (see [CSP_NONCE_HARDENING.md](./CSP_NONCE_HARDENING.md)).
4. Update this file and `src/lib/security-headers.ts` (and proxy CSP if used).

## References

- [CSP_NONCE_HARDENING.md](./CSP_NONCE_HARDENING.md) — Stricter CSP and third-party scripts with nonce.
- [FRONTEND_SECURITY_CHECKLIST.md](./FRONTEND_SECURITY_CHECKLIST.md) — Pre-merge checks.
