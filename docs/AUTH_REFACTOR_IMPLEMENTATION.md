# Auth Refactor Implementation

**Source:** Backend handoff `FRONTEND_AUTH_HANDOFF.md`  
**API:** https://api.novunt.com  
**Status:** Implemented

## Changes Applied

### 1. No redirect while `isLoading` (per handoff)

- **DashboardGuard:** Never redirects until `_hasHydrated === true`. Shows loading until auth is known.
- **Login page:** Redirect-to-dashboard effect checks `hasHydrated` first. No redirect while store is still hydrating.

### 2. `router.replace()` instead of `window.location.href`

- **AuthSessionHandler:** New component that listens for `auth:session-lost` and calls `router.replace('/login')`.
- **API interceptor:** On 401 + refresh failure, dispatches `auth:session-lost` instead of `window.location.href`. Avoids full reload and reduces risk of loops.

### 3. Token refresh on 401

- Already implemented in axios interceptor. On 401, tries `POST /better-auth/refresh-token` first.
- Only clears auth and redirects if refresh fails.

### 4. Response parsing (`data.data.token`)

- **mutations.ts:** Login handler supports both `response.data` and `response.data.data` (handoff format: `{ success, data: { token, refreshToken, user } }`).
- Handles double-nested response when backend returns that structure.

### 5. Store both tokens

- `setTokens(token, refreshToken)` stores both in localStorage, cookies, and Zustand.

## Files Modified

- `src/components/auth/AuthSessionHandler.tsx` – new
- `src/components/auth/DashboardGuard.tsx` – simplified, no redirect while !hasHydrated
- `src/components/Providers.tsx` – mounts AuthSessionHandler
- `src/lib/api.ts` – 401 handler dispatches event, uses router via handler
- `src/lib/mutations.ts` – response parsing for data.data
- `src/app/(auth)/login/page.tsx` – hasHydrated check before redirect

## Environment

```env
NEXT_PUBLIC_API_URL=https://api.novunt.com
# Or with path: https://api.novunt.com/api/v1
```

## Testing Checklist (from handoff)

- [ ] Clear localStorage and cookies for novunt.com
- [ ] Visit site → land on login without loop
- [ ] Enter valid credentials → redirect to dashboard and stay (no reload loop)
- [ ] Refresh while logged in → stay logged in
- [ ] Logout → land on login cleanly
- [ ] Token expiry + navigate → auto-refresh, not redirect to login
