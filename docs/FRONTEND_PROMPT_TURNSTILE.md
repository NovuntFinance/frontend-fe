# Frontend Prompt: Implement Cloudflare Turnstile (In Sync with Backend)

**Audience:** Frontend team  
**Purpose:** Complete specification to implement Turnstile on login, registration, and withdrawal forms so the frontend stays in sync with the backend.  
**Copy-paste this entire document** when briefing the frontend or assigning the task.

---

## Executive Summary

The Novunt backend **already enforces** Cloudflare Turnstile on three endpoints when `TURNSTILE_SECRET_KEY` is set. The frontend must:

1. Add the Turnstile widget to the **login**, **register**, and **withdrawal request** forms.
2. Send the token produced by the widget in **every request** to those endpoints.
3. Handle `400` responses with `code: "TURNSTILE_FAILED"` by showing a message and resetting the widget.

If the frontend does not send a valid token, the backend returns **400** and does **not** process the request.

---

## 1. Endpoints That Require Turnstile (Backend Contract)

| # | Method | Full URL | When token required |
|---|--------|----------|----------------------|
| 1 | POST | `{API_BASE}/better-auth/register` | Always (when backend has `TURNSTILE_SECRET_KEY` set) |
| 2 | POST | `{API_BASE}/better-auth/login` | Always |
| 3 | POST | `{API_BASE}/enhanced-transactions/withdrawal/create` | Always |

- **API_BASE** = your backend base URL, e.g. `https://novunt-backend-uw3z.onrender.com/api/v1` or `http://localhost:5000/api/v1`.
- If `TURNSTILE_SECRET_KEY` is **not** set on the backend (e.g. dev/staging), the backend **skips** Turnstile and accepts requests without a token. The frontend should still implement the widget and send the token so behaviour is consistent when Turnstile is enabled in production.

---

## 2. Request Body Contract (What the Backend Expects)

### 2.1 Where the token can be sent

The backend reads the Turnstile token in this order:

1. **Request body (JSON):** `cf-turnstile-response` **or** `turnstileToken`
2. **Query string:** `cf-turnstile-response`
3. **Header:** `x-turnstile-response`

**Recommended:** Send the token in the **JSON body** as `turnstileToken` (or `cf-turnstile-response`). Both keys are accepted.

### 2.2 Login

```json
{
  "email": "user@example.com",
  "password": "********",
  "turnstileToken": "<token-from-turnstile-widget>"
}
```

Or use `cf-turnstile-response` instead of `turnstileToken`. Same value.

### 2.3 Register

```json
{
  "email": "user@example.com",
  "password": "********",
  "confirmPassword": "********",
  "firstName": "John",
  "lastName": "Doe",
  "username": "johndoe",
  "phoneNumber": "1234567890",
  "countryCode": "+1",
  "turnstileToken": "<token-from-turnstile-widget>"
}
```

### 2.4 Withdrawal request

```json
{
  "amount": 100,
  "walletAddress": "TXYZ...",
  "network": "TRC20",
  "turnstileToken": "<token-from-turnstile-widget>"
}
```

- `amount` is required. Other fields depend on your existing withdrawal contract.
- Add `turnstileToken` (or `cf-turnstile-response`) to the existing payload; do not remove any existing fields.

---

## 3. Response Contract (When Turnstile Fails)

When the token is missing, invalid, expired, or already used, the backend returns:

**HTTP status:** `400 Bad Request`

**Body (JSON):**

```json
{
  "success": false,
  "message": "Verification failed. Please complete the security check and try again.",
  "code": "TURNSTILE_FAILED",
  "errorCodes": ["missing-input-response"]
}
```

- **`code`** is always `"TURNSTILE_FAILED"` when Turnstile fails. Use this to distinguish from other 400 errors (e.g. validation, invalid credentials).
- **`errorCodes`** can include: `missing-input-response`, `invalid-input-response`, `timeout-or-duplicate`, `internal-error`.
- **Frontend action:** Show `message` (or a friendly variant like "Security check failed. Please try again."), reset the Turnstile widget, and allow the user to retry.

---

## 4. Turnstile Site Key (Public)

- **Site key:** `0x4AAAAAACYFUiUbw2p7Qoh4`
- Store in frontend env, e.g. `NEXT_PUBLIC_TURNSTILE_SITE_KEY` or `VITE_TURNSTILE_SITE_KEY`, so it can change per environment.
- **Never** expose or use the secret key on the frontend.

---

## 5. Implementation Steps (Detailed)

### Step 1: Load the Turnstile script

Add the script once (e.g. in `index.html` or the root layout):

```html
<script
  src="https://challenges.cloudflare.com/turnstile/v0/api.js"
  async
  defer
></script>
```

- Use the exact URL above. Do not proxy or cache it.
- For SPAs, load it in the layout or a wrapper component that covers login, register, and withdrawal pages.

### Step 2: Add the widget to each form

**Option A – Implicit rendering (simple):**

```html
<div
  class="cf-turnstile"
  data-sitekey="0x4AAAAAACYFUiUbw2p7Qoh4"
  data-theme="light"
  data-size="normal"
></div>
```

- Place this inside the login form, register form, and withdrawal form (e.g. above the submit button).
- `data-theme`: `light` | `dark` | `auto`
- `data-size`: `normal` | `compact` | `flexible`

**Option B – Explicit rendering (more control, recommended for React/Next.js):**

Load the script with `?render=explicit`:

```html
<script src="https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit" defer></script>
```

In your component (React example):

```jsx
import { useEffect, useRef, useState } from 'react';

function TurnstileWidget({ onSuccess, onExpire }) {
  const containerRef = useRef(null);
  const widgetIdRef = useRef(null);

  useEffect(() => {
    if (!window.turnstile || !containerRef.current) return;
    widgetIdRef.current = window.turnstile.render(containerRef.current, {
      sitekey: process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY || '0x4AAAAAACYFUiUbw2p7Qoh4',
      theme: 'light',
      size: 'normal',
      callback: (token) => onSuccess?.(token),
      'expired-callback': () => onExpire?.(),
      'error-callback': () => onExpire?.(),
    });
    return () => {
      if (widgetIdRef.current && window.turnstile) {
        window.turnstile.remove(widgetIdRef.current);
      }
    };
  }, []);

  return <div ref={containerRef} />;
}

// Reset function for retry after error
export function resetTurnstile(containerRef) {
  if (window.turnstile && widgetIdRef.current) {
    window.turnstile.reset(widgetIdRef.current);
  }
}
```

### Step 3: Send the token with each request

Before submitting login, register, or withdrawal:

1. Read the current token:
   - **Implicit:** `document.querySelector('input[name="cf-turnstile-response"]')?.value`
   - **Explicit:** `window.turnstile.getResponse(widgetId)`
2. Add it to the request body as `turnstileToken` (or `cf-turnstile-response`).

**Example (login with axios):**

```js
const token = window.turnstile?.getResponse(widgetId) ?? document.querySelector('input[name="cf-turnstile-response"]')?.value;

const response = await axios.post(`${API_BASE}/better-auth/login`, {
  email: formData.email,
  password: formData.password,
  turnstileToken: token,
});
```

**Example (withdrawal with fetch):**

```js
const response = await fetch(`${API_BASE}/enhanced-transactions/withdrawal/create`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${accessToken}` },
  body: JSON.stringify({
    amount: formData.amount,
    walletAddress: formData.walletAddress,
    network: formData.network,
    turnstileToken: turnstileToken,
  }),
});
```

### Step 4: Handle 400 TURNSTILE_FAILED

On any 400 response:

1. Parse the JSON body.
2. If `response.data?.code === "TURNSTILE_FAILED"`:
   - Show a toast/message: e.g. "Security check failed. Please try again."
   - Reset the Turnstile widget: `window.turnstile.reset(widgetId)`.
   - Optionally disable submit until the widget produces a new token.
3. Do **not** treat this as "invalid credentials" or "validation error"; it is specifically a Turnstile failure.

### Step 5: Token lifetime and single use

- Tokens are valid for about **5 minutes** and are **single-use**.
- If the user waits too long or retries with the same token, the backend returns 400 with `TURNSTILE_FAILED` and often `timeout-or-duplicate` in `errorCodes`.
- Always reset the widget after a failed attempt so the user gets a fresh token before retrying.

---

## 6. Checklist (Frontend Sync with Backend)

- [x] Load Turnstile script (`https://challenges.cloudflare.com/turnstile/v0/api.js`) on pages that contain login, register, or withdrawal forms (or globally).
- [x] Add Turnstile widget to **login** form.
- [x] Add Turnstile widget to **register** form.
- [x] Add Turnstile widget to **withdrawal request** form.
- [x] For `POST /api/v1/better-auth/login`: include `turnstileToken` (or `cf-turnstile-response`) in request body.
- [x] For `POST /api/v1/better-auth/register`: include `turnstileToken` (or `cf-turnstile-response`) in request body.
- [x] For `POST /api/v1/enhanced-transactions/withdrawal/create`: include `turnstileToken` (or `cf-turnstile-response`) in request body.
- [x] On 400 with `code: "TURNSTILE_FAILED"`: show user-friendly message and reset widget.
- [x] Store site key in env (`NEXT_PUBLIC_TURNSTILE_SITE_KEY` or `VITE_TURNSTILE_SITE_KEY`); never expose secret key.

---

## 7. Quick Reference Table

| Item | Value |
|------|-------|
| **Site key** | `0x4AAAAAACYFUiUbw2p7Qoh4` |
| **Token field (body)** | `turnstileToken` or `cf-turnstile-response` |
| **Failure code** | `TURNSTILE_FAILED` |
| **Failure status** | 400 |
| **Token validity** | ~5 min, single-use |
| **Script URL** | `https://challenges.cloudflare.com/turnstile/v0/api.js` |

---

## 8. References

- [Cloudflare Turnstile – Client-side](https://developers.cloudflare.com/turnstile/get-started/client-side-rendering/)
- Backend API: `API_ROUTES_REFERENCE.md` (this repo)
- Backend Turnstile integration doc: `docs/BACKEND_PROMPT_TURNSTILE_WITHDRAWAL.md` (this repo)

---

**End of prompt.** Use this document as the single source of truth for frontend–backend sync on Turnstile. If the backend adds more protected endpoints or changes the error shape, this doc will be updated accordingly; coordinate with the backend team for changes.
