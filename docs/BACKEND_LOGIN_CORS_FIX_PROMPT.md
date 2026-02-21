# Backend Fix Prompt: Login / Better-Auth “Unable to Connect” (CORS & Connectivity)

**Use this as a detailed prompt for your backend team** to fix the issue where the frontend shows:

> Unable to connect to the server at https://api.novunt.com/api/v1/better-auth/login. Please check: 1. Backend server is running at https://api.novunt.com/api/v1 2. CORS is configured correctly on backend 3. Network connectivity 4. NEXT_PUBLIC_API_URL environment variable is set correctly

---

## Copy-paste prompt for backend

---

**We need the backend to be reachable and CORS-configured so the frontend can call the Better Auth API from the browser. Users are seeing “Unable to connect to the server” when logging in.**

### 1. Backend base URL and endpoints

- **Production API base URL:** `https://api.novunt.com/api/v1`
- **Login endpoint the frontend calls:** `POST https://api.novunt.com/api/v1/better-auth/login`
- **Other auth endpoints used from the browser (same origin/CORS rules apply):**
  - `POST /api/v1/better-auth/register`
  - `POST /api/v1/better-auth/verify-email`
  - `POST /api/v1/better-auth/resend-verification`
  - `POST /api/v1/better-auth/complete-registration`
  - `POST /api/v1/better-auth/login`
  - `POST /api/v1/better-auth/verify-mfa`
  - `POST /api/v1/better-auth/refresh-token`
  - `POST /api/v1/better-auth/request-password-reset`
  - `POST /api/v1/better-auth/reset-password`
  - `POST /api/v1/better-auth/logout`
  - And all other `/api/v1/*` routes the frontend calls from the browser.

The frontend sends requests **from the browser** (client-side) to this base URL. So the backend must:

1. Be **reachable** at `https://api.novunt.com/api/v1` (server running, correct host/path, SSL valid).
2. Send **correct CORS headers** so the browser allows the frontend origin to call these endpoints.

---

### 2. CORS requirements (critical)

The frontend uses **credentials** (cookies / `Authorization` header). For that to work:

- **Do not use `Access-Control-Allow-Origin: *`** when credentials are involved. The browser will reject it.
- **Use a whitelist of allowed origins** and respond with exactly one origin that matches the request’s `Origin` header.

**Allowed origins to support**

- **Production:** The exact origin where the Novunt frontend is hosted, e.g.:
  - `https://app.novunt.com`
  - or `https://www.novunt.com`
  - or `https://novunt.com`
  - (Use the exact scheme + host + port if non-default, e.g. `https://app.novunt.com:443` only if you actually use that in the URL bar.)
- **Staging / preview:** If you have staging or preview URLs (e.g. Vercel previews), add those origins too, e.g.:
  - `https://frontend-fe-xxx.vercel.app`
- **Local development:**
  - `http://localhost:3000`
  - Optionally `http://127.0.0.1:3000` if developers use that.

**Required response headers (for actual request and for OPTIONS preflight)**

For **any** request from an allowed origin to `https://api.novunt.com/api/v1/*`:

1. **`Access-Control-Allow-Origin`**
   - Value: the **exact** requesting origin (e.g. `https://app.novunt.com` or `http://localhost:3000`).
   - Must not be `*` when credentials are used.

2. **`Access-Control-Allow-Credentials: true`**
   - Required because the frontend sends cookies and may send the `Authorization` header.

3. **`Access-Control-Allow-Methods`**
   - Include at least: `GET, POST, PUT, PATCH, DELETE, OPTIONS` (or whatever methods your API actually uses).

4. **`Access-Control-Allow-Headers`**
   - Include at least: `Content-Type`, `Authorization`, `Accept`.
   - Add any other headers the frontend sends if needed.

5. **`Access-Control-Max-Age`** (optional but recommended)
   - e.g. `86400` so the browser can cache the preflight for 24 hours.

**OPTIONS preflight**

- For **cross-origin** requests, the browser sends an **OPTIONS** request first.
- The backend **must** respond to **OPTIONS** for `/api/v1/better-auth/login` (and all other `/api/v1/*` routes the frontend calls) with:
  - Status **204 No Content** or **200 OK**
  - The CORS headers above (including `Access-Control-Allow-Origin`, `Access-Control-Allow-Credentials`, `Access-Control-Allow-Methods`, `Access-Control-Allow-Headers`).
- If OPTIONS is not handled or returns an error, the browser will block the following POST and the frontend will see “Unable to connect”.

---

### 3. Request details from the frontend

- **Method:** POST (for login).
- **URL:** `https://api.novunt.com/api/v1/better-auth/login`
- **Headers the frontend sends:**
  - `Content-Type: application/json`
  - `Accept: application/json` (or similar)
  - Credentials (cookies) via `withCredentials: true` (so the browser sends cookies; backend must respond with `Access-Control-Allow-Credentials: true` and a specific `Access-Control-Allow-Origin`).
- **Body:** JSON, e.g. `{ "email": "...", "password": "..." }` (and any other fields your Better Auth login expects).

---

### 4. What “fixed” looks like

- From a **browser** on a machine that can reach the internet:
  - Open the frontend (e.g. `https://app.novunt.com` or `http://localhost:3000`).
  - Open DevTools → Network.
  - Try to log in.
  - The request to `https://api.novunt.com/api/v1/better-auth/login` should:
    - Show status **200** (or 401 if credentials are wrong), **not** “(failed)” or “CORS error”.
  - In the Console there should be **no** CORS or “blocked by CORS policy” errors.
- From **command line** (to verify backend is up and path is correct):
  - `curl -I https://api.novunt.com/api/v1/health` (or your health endpoint) returns 2xx.
  - `curl -X OPTIONS https://api.novunt.com/api/v1/better-auth/login -H "Origin: https://app.novunt.com" -v` shows CORS headers in the response and 2xx status.

---

### 5. Checklist for backend

- [ ] Server is running and reachable at `https://api.novunt.com/api/v1` (e.g. health check returns 2xx).
- [ ] CORS is configured for **all** origins the frontend uses: production, staging, and `http://localhost:3000` (and optionally `http://127.0.0.1:3000`).
- [ ] `Access-Control-Allow-Origin` is set to the **exact** request origin (not `*`).
- [ ] `Access-Control-Allow-Credentials: true` is set for routes that use cookies/auth.
- [ ] `Access-Control-Allow-Methods` includes `POST` (and GET, etc., as needed).
- [ ] `Access-Control-Allow-Headers` includes `Content-Type`, `Authorization`, `Accept`.
- [ ] **OPTIONS** requests to `/api/v1/better-auth/login` (and other `/api/v1/*` routes) return 2xx with the CORS headers above.
- [ ] SSL certificate for `api.novunt.com` is valid (no mixed content; frontend is HTTPS in production).
- [ ] No firewall or proxy in front of the API is stripping CORS headers or blocking OPTIONS.

---

### 6. Optional: curl examples to verify

**Health (backend up):**

```bash
curl -s -o /dev/null -w "%{http_code}" https://api.novunt.com/api/v1/health
# Expect: 200 or 204
```

**CORS preflight (OPTIONS) for login:**

```bash
curl -X OPTIONS "https://api.novunt.com/api/v1/better-auth/login" \
  -H "Origin: https://app.novunt.com" \
  -H "Access-Control-Request-Method: POST" \
  -H "Access-Control-Request-Headers: Content-Type,Authorization" \
  -v
```

**Expect:** Status 204 or 200, and response headers including:

- `Access-Control-Allow-Origin: https://app.novunt.com`
- `Access-Control-Allow-Credentials: true`
- `Access-Control-Allow-Methods: ...` (including POST)
- `Access-Control-Allow-Headers: ...` (including Content-Type, Authorization)

**Same from localhost origin (for local dev):**

```bash
curl -X OPTIONS "https://api.novunt.com/api/v1/better-auth/login" \
  -H "Origin: http://localhost:3000" \
  -H "Access-Control-Request-Method: POST" \
  -H "Access-Control-Request-Headers: Content-Type,Authorization" \
  -v
```

**Expect:** Same CORS headers with `Access-Control-Allow-Origin: http://localhost:3000`.

---

### 7. If the backend is behind a reverse proxy (e.g. Nginx, Cloudflare)

- Ensure the **proxy** does not remove or override CORS headers.
- If CORS is added at the **proxy** layer, it must still send:
  - `Access-Control-Allow-Origin` = exact request origin
  - `Access-Control-Allow-Credentials: true`
  - Correct `Access-Control-Allow-Methods` and `Access-Control-Allow-Headers`
- The proxy must respond to **OPTIONS** with 2xx and the same CORS headers (or forward OPTIONS to the backend and return the backend’s response).

---

Once the backend is reachable and CORS is configured as above, the frontend “Unable to connect to the server at … better-auth/login” error should go away. If it persists, the next step is to check the browser Network tab and Console for the exact failing request and CORS message.

---

## Frontend reference (for backend team)

- **API base URL used in production:** `process.env.NEXT_PUBLIC_API_URL` → `https://api.novunt.com/api/v1`
- **Credentials:** All API requests are sent with `withCredentials: true` (cookies + same-site behavior).
- **Login:** `POST {API_BASE_URL}/better-auth/login` with JSON body `{ email, password, ... }`.

No backend code changes are required on the frontend; fixing reachability and CORS on the backend is sufficient.
