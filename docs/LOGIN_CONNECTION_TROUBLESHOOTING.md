# Login: "Unable to connect to the server" Troubleshooting

When you see:

> **Unable to connect to the server at https://api.novunt.com/api/v1/better-auth/login.** Please check: 1. Backend server is running at https://api.novunt.com/api/v1 2. CORS is configured correctly on backend 3. Network connectivity 4. NEXT_PUBLIC_API_URL environment variable is set correctly

the frontend tried to call the login API and got **no response** (network/CORS failure). The request never reached the backend or the browser blocked it.

---

## Why this happens

1. **Backend not reachable** – The server at `https://api.novunt.com` is down, restarting, or not listening on the expected path.
2. **CORS** – The backend does not allow your frontend origin. The browser blocks the request before any response, so it looks like "unable to connect."
3. **Wrong or missing env** – `NEXT_PUBLIC_API_URL` is unset or points to the wrong base URL (e.g. missing `/api/v1` or wrong host).
4. **Network / SSL** – Firewall, VPN, or invalid SSL certificate blocking or failing the request.

---

## 1. Confirm backend is up

From your machine:

```bash
curl -s -o /dev/null -w "%{http_code}" https://api.novunt.com/api/v1/health
# Or
curl -I https://api.novunt.com/api/v1/better-auth/login
```

- If you get a timeout or connection refused → backend is down or not reachable from your network.
- If you get a normal HTTP status (e.g. 200, 404, 405) → backend is up; focus on CORS and env.

---

## 2. Check CORS on the backend

The backend **must** allow your frontend origin in CORS, for example:

- **Local dev:** `http://localhost:3000` (or the port you use).
- **Production:** Your real frontend origin, e.g. `https://app.novunt.com` or `https://novunt.com`.

If the backend does not list your frontend origin, the browser will block the request and you’ll see this “Unable to connect” style error (often with a CORS error in the browser console).

Backend team should:

- Allow the correct `Origin` header for your frontend URL.
- For credentials: `Access-Control-Allow-Credentials: true` and a specific origin (not `*`).
- Allow the methods and headers used by the login request (e.g. `POST`, `Content-Type`, `Authorization` if used).

---

## 3. Verify NEXT_PUBLIC_API_URL

- **Local:** In `.env.local`:

  ```env
  NEXT_PUBLIC_API_URL=https://api.novunt.com/api/v1
  ```

  No trailing slash. Restart the dev server after changing.

- **Production (e.g. Vercel):** In the project’s environment variables, set:

  ```env
  NEXT_PUBLIC_API_URL=https://api.novunt.com/api/v1
  ```

  Redeploy so the new value is baked in.

In the browser console you should see something like:

- `🔧 API Base URL: https://api.novunt.com/api/v1`
- `🔧 NEXT_PUBLIC_API_URL: https://api.novunt.com/api/v1`

If you see `NOT SET` or a different URL, fix the env and rebuild/redeploy.

---

## 4. Use the browser to narrow it down

1. Open DevTools → **Network**.
2. Try to log in again.
3. Find the request to `better-auth/login`:
   - **Status (failed) / CORS error in console** → almost certainly CORS or backend not responding in a way the browser allows.
   - **Blocked / No request sent** → extension, firewall, or mixed content (e.g. HTTPS frontend calling HTTP API).
   - **Request sent, no response** → backend down or very slow; confirm with `curl` from the same network.

---

## Summary checklist

| Check       | Action                                                                                   |
| ----------- | ---------------------------------------------------------------------------------------- |
| Backend up? | `curl https://api.novunt.com/api/v1/health` or similar                                   |
| CORS        | Backend allows your frontend origin (localhost or production URL)                        |
| Env (local) | `.env.local` has `NEXT_PUBLIC_API_URL=https://api.novunt.com/api/v1`, restart dev server |
| Env (prod)  | Hosting env has same value, redeploy                                                     |
| Network     | Try from another network; check VPN/firewall; check SSL in browser                       |

Most often the fix is either **backend CORS** (add your frontend origin) or **backend availability** (server down or not reachable). Env is the next most common.
