# Auth Flow Testing Guide

Use this guide to verify the login flow works correctly after the auth refactor.

---

## Part 1: Backend API Check (Run First)

Verifies the backend returns the response structure the frontend expects.

### Setup

1. Add test credentials to `.env.local`:

   ```env
   TEST_AUTH_EMAIL=your-test-user@example.com
   TEST_AUTH_PASSWORD=your-password
   ```

2. Ensure backend is running (local or production).

3. Run the script:
   ```bash
   node scripts/test-auth-flow.js
   ```

### Expected Output

```
✅ Login returns 200 (got 200)
✅ Response is JSON object
✅ response.success === true
✅ response.data exists
✅ response.data has token or accessToken
✅ response.data has refreshToken
✅ response.data has user
✅ response.data.user has email
✅ Refresh endpoint exists (not 404)
...
Backend auth contract OK. Next: manual browser test.
```

If any checks fail, fix the backend or API URL before testing in the browser.

---

## Part 2: Manual Browser Test

### Prerequisites

- Backend running and passing Part 1
- Frontend: `npm run dev`

### Steps

1. **Clear site data**
   - DevTools (F12) → Application → Storage → Clear site data
   - Or: Application → Local storage → clear; Cookies → clear

2. **Open the app**
   - Visit `http://localhost:3000` (or your dev URL)
   - You should land on `/login` without a loop

3. **Check for redirect loop**
   - If the page keeps flickering or reloading, the loop still exists
   - Open DevTools Console and Network tab before logging in

4. **Log in**
   - Enter valid credentials
   - Click Sign In
   - **Expected:** Redirect to `/dashboard` and stay there (no flicker, no reload)

5. **Refresh**
   - Press F5 while on dashboard
   - **Expected:** Still on dashboard, still logged in

6. **Log out**
   - Log out from the UI
   - **Expected:** Redirect to `/login` cleanly

---

## Part 3: DevTools Diagnostics (If Issues)

### Console

Look for these logs (development mode):

| Log                                      | Meaning                               |
| ---------------------------------------- | ------------------------------------- |
| `[AuthStore] ✅ Rehydration complete`    | Auth state loaded from storage        |
| `[AuthStore] ✅ Synced token to cookies` | Token written for middleware          |
| `[useLogin] Normal login successful`     | Login mutation succeeded              |
| `[API] 401`                              | Unauthorized – check if token is sent |
| `[API] Refresh failed`                   | Token refresh failed                  |

### Network Tab

1. **Login request**
   - Name: `login` or `better-auth/login`
   - Status: **200**
   - Response: `{ "success": true, "data": { "token": "...", "refreshToken": "...", "user": { ... } } }`

2. **After login**
   - Next requests (e.g. `dashboard`, `wallets/info`) should have:
   - Header: `Authorization: Bearer eyJ...`
   - Status: 200 or 404 (not 401)

3. **Redirect loop**
   - If you see repeated `login` → `dashboard` → `login` in the waterfall, the loop persists

### Application Tab

After successful login:

- **Local Storage**
  - `accessToken`: present
  - `refreshToken`: present
  - `novunt-auth-storage`: has `token`, `user`, `isAuthenticated`

- **Cookies**
  - `authToken`: present (for middleware)
  - `refreshToken`: present

---

## Part 4: Quick Checklist

- [ ] Part 1 script passes
- [ ] Clear site data
- [ ] Visit app → lands on login, no loop
- [ ] Log in → redirects to dashboard, stays
- [ ] Refresh on dashboard → remains logged in
- [ ] Log out → lands on login
- [ ] (Optional) Wait ~15 min, navigate → auto-refresh works, no redirect to login

---

## Troubleshooting

| Problem                                 | Check                                                                 |
| --------------------------------------- | --------------------------------------------------------------------- |
| Script fails: "Login request failed"    | Backend running? Correct `NEXT_PUBLIC_API_URL` in `.env.local`?       |
| Script fails: "response.data has token" | Backend returning `{ success, data: { token, refreshToken, user } }`? |
| Loop on login page                      | `hasHydrated` before redirect? See Console for `[AuthStore]`          |
| 401 after login                         | Token in localStorage? Request has `Authorization` header?            |
| Redirect to login right after dashboard | Cookie `authToken` set? Middleware bypass on localhost?               |
