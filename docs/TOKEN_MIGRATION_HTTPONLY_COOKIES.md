# Token Migration: localStorage → HTTP-only Cookies

This document describes how to move auth tokens from `localStorage` to **HTTP-only, Secure, SameSite cookies** so JavaScript cannot read them (XSS cannot steal tokens).

## Why

- **Current:** Tokens are in `localStorage` and in some cookies. Any XSS can read `localStorage`.
- **Target:** Access token and refresh token set by the **backend** as HTTP-only cookies. The frontend never sees the token value; the browser sends it automatically with `credentials: 'include'` / `withCredentials: true`.

## Backend Requirements (must be done first)

The backend must support the following.

### 1. Login / token refresh response

- **Set cookies in the response** instead of (or in addition to) returning tokens in the JSON body.
- Use the same cookie names the frontend expects (see below) so we can stop reading from `localStorage` and rely only on cookies.

Example (backend pseudocode):

```http
POST /api/v1/auth/login
Content-Type: application/json
Body: { email, password, ... }

Response:
  Set-Cookie: novunt_token=<access-token>; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=900
  Set-Cookie: novunt_refresh_token=<refresh-token>; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=604800
  Content-Type: application/json
  Body: { success: true, user: { ... } }   // no token in body
```

- **Cookie attributes:**
  - `HttpOnly` – not readable by JS.
  - `Secure` – only over HTTPS (use in production; dev may use `Secure` on localhost if supported).
  - `SameSite=Lax` (or `Strict` if you prefer).
  - Sensible `Max-Age` or `Expires` (e.g. 15 min access, 7 days refresh).

### 2. CORS and credentials

- Responses to the frontend origin must include:
  - `Access-Control-Allow-Origin: <frontend-origin>` (no `*` when using credentials).
  - `Access-Control-Allow-Credentials: true`.
- Login, refresh, and all authenticated API requests must be sent with credentials (cookies). The frontend already uses `withCredentials: true` where needed.

### 3. Cookie names (contract)

- **User auth:** `novunt_token`, `novunt_refresh_token` (same as current `localStorage` keys so middleware and API client can keep same logic).
- **Admin auth:** `adminToken` (and optionally `adminRefreshToken` if you use refresh for admin). Backend should set these on admin login.

### 4. Logout

- **Clear cookies** by sending `Set-Cookie` with the same name, `Max-Age=0` or `Expires` in the past, and `Path=/` (and `/admin` if used for admin cookie).

Example:

```http
Set-Cookie: novunt_token=; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=0
Set-Cookie: novunt_refresh_token=; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=0
```

### 5. Refresh endpoint

- Refresh should accept the refresh token **from the cookie** (not from the body). Backend reads the cookie and returns new tokens again as HTTP-only cookies (and optionally minimal user info in the body).

---

## Frontend Changes (after backend is ready)

1. **Stop writing tokens to `localStorage`**
   - In `authStore` (and any admin auth flow): remove `localStorage.setItem('novunt_token', ...)` and similar. Keep reading from cookies only for “do we have a session?” (e.g. in middleware) or remove client-side token read entirely and rely on “session” inferred from API 401.
2. **Stop reading tokens from `localStorage` for API calls**
   - API client should **not** set `Authorization: Bearer <token>` from memory or `localStorage`. It should send requests with `withCredentials: true` so the browser sends the HTTP-only cookie. Backend must accept the cookie (e.g. via same middleware that currently accepts the Bearer token).
3. **Middleware**
   - Today middleware may read `authToken` from cookies for route protection. Once backend sets that cookie name, no change needed. If backend uses a different name, update `request.cookies.get('...')` to match.
4. **Auth state**
   - “Is the user logged in?” can be derived from:
     - a 200 from a “me” or “session” endpoint that uses the cookie, or
     - 401 on the first API call meaning “no valid cookie/session”.
   - Remove any “token in memory” state if you no longer need it for API calls.

## Checklist

- [ ] Backend sets `novunt_token` and `novunt_refresh_token` as HTTP-only, Secure, SameSite cookies on login/refresh.
- [ ] Backend accepts auth via cookie (same way it currently validates Bearer token).
- [ ] Backend clears these cookies on logout.
- [ ] CORS allows the frontend origin with credentials.
- [ ] Frontend: remove all `localStorage` read/write for these tokens.
- [ ] Frontend: API client uses only `withCredentials: true` and no `Authorization` header from JS.
- [ ] Run security-scan and smoke tests; confirm no token in DOM or console.

After this, tokens are no longer in `localStorage`, and the frontend is not in possession of the token value—only the backend and the browser’s cookie store are.
