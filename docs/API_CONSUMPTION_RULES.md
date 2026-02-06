# API Consumption Rules

All backend communication must go through the **approved API layer**. No inline `fetch` or raw `axios` calls in components or feature code.

---

## Approved API Layer

- **Primary:** `src/lib/api.ts` — `apiClient`, `api.get/post/put/patch/delete`, `apiRequest<T>()`
- **Admin:** `src/lib/admin-api-base.ts` (admin API client)
- **Usage:** Services in `src/services/*` must use the above. Components and hooks must call services or React Query hooks that use the API layer; they must not construct URLs or call `fetch`/`axios` directly.

---

## Rules

1. **Explicit** — Every backend request is a named function (e.g. in a service or API module) with a clear purpose.
2. **Typed** — Request and response types are defined; use `apiRequest<T>()` or typed service methods.
3. **Centralized** — Base URL and auth come from the API client. No hardcoded backend URLs in components or random files.
4. **No inline fetch/axios** — Do not use `fetch()` or `axios.get/post()` for backend API calls outside `src/lib/api.ts` or the admin API base.

---

## Allowed Exceptions (non-backend)

- **Next.js API routes** (`/api/*`) — server-side or proxy routes may use `fetch` to backend; keep secrets on server.
- **Third-party public APIs** (e.g. CoinGecko, Frankfurter) — if required for display only and no secrets, can be called from a dedicated module; prefer server-side or a single typed module, not scattered in components.
- **Analytics/health** — e.g. `web-vitals` or health checks, from a single approved module.

---

## Audit: Direct fetch/axios Outside API Layer

Run the following to find violations (no matches in components/pages except refetch):

```bash
# From project root
rg -g "*.ts" -g "*.tsx" "fetch\(|axios\.(get|post|put|delete|patch)\(" -- src
```

**Known outliers to fix or justify:**

| File                                                  | Usage                                    | Action                                                                  |
| ----------------------------------------------------- | ---------------------------------------- | ----------------------------------------------------------------------- |
| `src/components/ui/chat-widget.tsx`                   | `fetch(apiBaseURL + '/chatbot/message')` | Route through API layer (api.post or dedicated chat service)            |
| `src/components/dashboard/LiveTradingSignalsAuto.tsx` | `fetch` to CoinGecko/Frankfurter         | External public APIs — keep in one module; document as exception        |
| `src/services/dailyProfitService.ts`                  | `axios.get`                              | Use `api.get` from `@/lib/api`                                          |
| `src/services/configService.ts`                       | `axios.get`                              | Use `api.get` from `@/lib/api`                                          |
| `src/services/adminAuthService.ts`                    | `axios.post`                             | Use admin API base or shared client                                     |
| `src/services/twoFAService.ts`                        | `axios.post`                             | Use `api.post` from `@/lib/api`                                         |
| `src/services/transferApi.ts`                         | `axios.get`                              | Use `api.get` from `@/lib/api`                                          |
| `src/services/rosApi.ts`                              | `axios.get/post`                         | Use `api.get` / `api.post` from `@/lib/api`                             |
| `src/lib/backendHealthCheck.ts`                       | `fetch(apiBaseURL + '/health')`          | Keep in one place; consider API layer wrapper                           |
| `src/lib/mutations/profileMutations.ts`               | `fetch(uploadUrl)`                       | Presigned URL upload — acceptable if URL comes from API; do not log URL |
| `src/app/api/**` (route handlers)                     | `fetch` to backend                       | Server-side only; acceptable                                            |

---

## Test

After changes, run:

```bash
npm run lint
node scripts/security-scan.js
```

And manually: search codebase for `fetch(` and `axios.` outside `src/lib/api.ts`, `src/lib/admin-api-base.ts`, and documented exceptions.
