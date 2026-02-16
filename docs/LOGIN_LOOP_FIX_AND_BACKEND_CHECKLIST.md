# Login Redirect Loop - Fix Summary & Backend Verification Checklist

## Root Cause (Frontend)

**Primary fix:** Auth state was persisted in Zustand/localStorage but **not synced to cookies**. The middleware only reads the `authToken` cookie. Result:

1. User with valid session in localStorage visits `/dashboard` (or gets redirected there from `/login`)
2. Middleware runs on the request → no `authToken` cookie → redirect to `/login`
3. Login page loads, rehydration restores `isAuthenticated: true` from localStorage
4. Login page redirects back to `/dashboard`
5. **Loop**: Steps 2–4 repeat indefinitely

## Frontend Fixes Applied

### Localhost bypass (persistent loop)

On `localhost` and `127.0.0.1`, the middleware **skips auth checks** for protected routes. All auth is handled by `DashboardGuard`. This avoids issues where cookies are not sent reliably with RSC fetches during client-side navigation.

### 1. Cookie sync on rehydration (`src/store/authStore.ts`)

When rehydration finds a valid token in state, we now sync it to cookies so the middleware can read it:

- `auth_token`, `authToken`, `refreshToken` are set from the persisted state
- Added `Secure` flag for HTTPS (production)

### 2. Secure flag for production cookies

Cookies are set with `Secure` when `window.location.protocol === 'https:'` so they work correctly on novunt.com.

### 3. Login page redirect guard (`src/app/(auth)/login/page.tsx`)

- When `reason=auth_required` or `reason=session_expired` is present, a 2-second cooldown prevents immediate redirect back to dashboard
- Prevents rapid redirect loops
- Increased redirect delay to 300ms to allow cookie sync to complete

### 4. Console logging removed from DashboardGuard

Removed noisy logs to reduce clutter while debugging.

---

## Backend Verification Checklist

If the loop persists after the frontend changes, verify the following on the backend:

### Login endpoint

- [ ] `POST /better-auth/login` returns **200** on success
- [ ] Response includes `token` (or `accessToken`) and `user`
- [ ] Response includes `refreshToken` for token refresh

### Token verification

- [ ] Protected endpoints do **not** return **401** immediately after a successful login
- [ ] Token format matches what the frontend expects (JWT with `exp`)

### CORS & cookies

- [ ] If frontend and API are on different origins (e.g. `novunt.com` and `api.novunt.com`):
  - CORS allows credentials: `Access-Control-Allow-Credentials: true`
  - CORS allows the frontend origin: `Access-Control-Allow-Origin: https://novunt.com` (no `*` with credentials)
- [ ] Cookies (if used by the API) have correct `SameSite` and `Secure` for production

### Session persistence

- [ ] No logic that clears or rejects the session right after login
- [ ] Token verification endpoint does not invalidate the token unnecessarily

---

## DevTools Checks (If Issue Persists)

1. **Network**
   - Login request: 200?
   - Subsequent requests (e.g. current user): 401?
   - Any repeated redirects in the waterfall?

2. **Application → Cookies**
   - After login, are `authToken` and `refreshToken` set?
   - Domain and path correct for novunt.com?

3. **Console**
   - Look for `[AuthStore]` logs during rehydration
   - Any `[API] 401` or refresh/redirect messages?

4. **Application → Local Storage**
   - `novunt-auth-storage` present with `token` and `user`?
   - `accessToken` and `refreshToken` set?

---

## Quick Test After Deploy

1. Clear site data for novunt.com
2. Open an incognito window
3. Go to novunt.com → should redirect to `/login`
4. Log in with valid credentials
5. Should redirect to `/dashboard` and stay there (no loop)
6. Refresh the page → should remain on dashboard
