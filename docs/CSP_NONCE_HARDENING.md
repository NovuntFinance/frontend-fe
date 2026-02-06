# CSP Hardening: Removing unsafe-inline with Nonces

Currently our CSP (in `src/lib/security-headers.ts` and `next.config.ts`) allows `'unsafe-inline'` and `'unsafe-eval'` for scripts so Next.js hydration and dev tooling work. To lock down XSS further, we can use **nonces** so only our inline scripts run.

## Options

| Approach                         | Pros                             | Cons                                                            |
| -------------------------------- | -------------------------------- | --------------------------------------------------------------- |
| **Keep current (unsafe-inline)** | No perf impact, works everywhere | Weaker XSS protection                                           |
| **Nonce via Next.js Proxy**      | Strong CSP, no unsafe-inline     | All pages must be **dynamic** (no static/ISR), more server load |
| **Experimental SRI** (Next.js)   | Strict CSP + static generation   | Experimental, webpack-only, not with Turbopack                  |

## Recommended path: Nonce with Next.js Proxy

Next.js 14+ supports a **proxy** file that runs before the page is rendered. It can generate a nonce per request and set the CSP header. Next.js then injects that nonce into its own inline scripts automatically.

### Steps to enable (when you’re ready)

1. **Add a proxy file** (e.g. `src/proxy.ts` or root `proxy.ts` – see [Next.js Content Security Policy](https://nextjs.org/docs/app/building-your-application/configuring/content-security-policy)).
   - Generate a nonce per request: `Buffer.from(crypto.randomUUID()).toString('base64')`.
   - Build CSP with that nonce using `generateCSPHeaderWithNonce(nonce)` from `src/lib/security-headers.ts`.
   - Set `Content-Security-Policy` on the response and set `x-nonce` on the request headers so Next.js can apply the nonce to inline scripts.

2. **Stop setting CSP in `next.config.ts`** for the same routes the proxy covers (otherwise the proxy header should override; confirm in Next.js docs for your version).

3. **Force dynamic rendering** where needed: for pages that are statically generated, use `export const dynamic = 'force-dynamic'` or `connection()` so a nonce exists (see Next.js docs).

4. **Third-party scripts** (e.g. Sentry, Turnstile): pass the nonce from `headers().get('x-nonce')` into any `<Script nonce={nonce} />` and keep their domains in `script-src` / `connect-src`.

### Helper in this repo

- `src/lib/security-headers.ts` exports **`generateCSPHeaderWithNonce(nonce: string)`**.
- It returns a CSP string with `script-src` and `style-src` using `'nonce-${nonce}'` and **without** `'unsafe-inline'` for scripts. Use it inside your proxy to build the header.

### Trade-off

- **Performance:** Every request is rendered on the server (dynamic). No static export or ISR for those routes. Prefetch and CDN caching of HTML are limited.
- **Security:** Inline scripts without the correct nonce are blocked, reducing XSS risk.

Enable this when you need strict CSP and accept the dynamic-rendering requirement.

## References

- [Next.js: Content Security Policy](https://nextjs.org/docs/app/building-your-application/configuring/content-security-policy)
- [Next.js: Proxy file (nonce generation)](https://nextjs.org/docs/app/api-reference/file-conventions/proxy)
