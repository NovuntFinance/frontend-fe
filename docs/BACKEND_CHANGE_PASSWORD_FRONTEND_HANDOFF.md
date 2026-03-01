# Backend handoff: Change password flow (frontend behaviour)

**Date:** March 2025  
**Purpose:** Align backend with current frontend behaviour for the change-password flow. Share this with the backend team so they can confirm or update validation/docs.

---

## Backend reply (in sync)

The backend confirmed alignment. See **backend repo** `docs/BACKEND_CHANGE_PASSWORD_FRONTEND_SYNC.md` for their reply. Summary:

- **twoFACode** is required and validated for every change-password request (controller, route, and `verifyAction2FA(..., { requireAlways: true })`).
- **Turnstile** is only on the request-OTP endpoint; change-password does **not** require Turnstile.
- **Paths:** `POST /better-auth/request-change-password-otp` and `POST /better-auth/change-password` are supported (compatibility routes + `/api/v1/...`).
- **No frontend changes needed** for paths or payloads.

---

## 1. What the frontend does (current implementation)

### Request OTP (Send OTP to my email)

| Item          | Frontend behaviour                                                                                                                                                                                                                                           |
| ------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **Path**      | `POST /better-auth/request-change-password-otp`                                                                                                                                                                                                              |
| **Auth**      | Bearer token or session (same as other protected routes)                                                                                                                                                                                                     |
| **Body**      | `{}` when no Turnstile token; `{ "cf-turnstile-response": "<token>" }` when Turnstile is completed                                                                                                                                                           |
| **Turnstile** | User must complete the Turnstile widget before clicking “Send OTP”. Frontend does not call this endpoint without a Turnstile token (and shows “Verification required” if they try). When backend has `TURNSTILE_SECRET_KEY` set, the token is sent as above. |

So the backend doc (request OTP + optional `cf-turnstile-response`) is followed.

### Change password (submit form)

| Item          | Frontend behaviour                                                                                                          |
| ------------- | --------------------------------------------------------------------------------------------------------------------------- |
| **Path**      | `POST /better-auth/change-password` (or your API base + this path)                                                          |
| **Body**      | Always sends: `currentPassword`, `newPassword`, `confirmPassword`, `emailOtp`, `twoFACode`                                  |
| **Turnstile** | Frontend does **not** send a Turnstile token on this request. The doc only mentions Turnstile for the request-OTP endpoint. |

---

## 2. Product rule: 2FA is mandatory for all users

- **2FA is ON by default at registration** and **cannot be turned off** for users.
- Therefore the frontend:
  - Always shows the 2FA code field.
  - Always requires the user to enter a 6-digit 2FA code.
  - **Always sends `twoFACode`** in the change-password request (no conditional).

So for this platform, `twoFACode` is effectively **required for every change-password request**, not “only when user has 2FA enabled.”

---

## 3. What the backend should do (recommendations)

1. **Change-password validation**
   - Treat **`twoFACode` as required** for the change-password endpoint (since 2FA is mandatory for all users).
   - If the backend currently validates `twoFACode` only when “user has 2FA enabled,” update logic so that for this app, **all users** are considered 2FA-enabled for change-password and `twoFACode` is always required and validated.
   - Return **400** (or your usual validation error) when `twoFACode` is missing or invalid.

2. **Docs**
   - In `FRONTEND_CHANGE_PASSWORD_OTP_API.md` (or equivalent), update the change-password section to state that **`twoFACode` is required** for this platform (all users have 2FA on and cannot disable it). This keeps the doc aligned with the frontend and backend behaviour.

3. **Turnstile on change-password (optional)**
   - The frontend does **not** send a Turnstile token on the change-password POST. If the backend wants Turnstile on that endpoint as well:
     - Document the expected field (e.g. `cf-turnstile-response` in body or a specific header) and that it’s required when Turnstile is configured.
     - The frontend can then be updated to send the token on submit as well.

---

## 4. Summary table (frontend → backend)

| Step            | Frontend action                                                                                                       | Backend expectation                                                                                                                                |
| --------------- | --------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------- |
| Request OTP     | `POST /better-auth/request-change-password-otp` with auth and optional `cf-turnstile-response`                        | Validate auth; when Turnstile is configured, validate token. Send 6-digit OTP to user’s email.                                                     |
| Change password | `POST /better-auth/change-password` with `currentPassword`, `newPassword`, `confirmPassword`, `emailOtp`, `twoFACode` | Require and validate all of these; validate email OTP and 2FA; update password. No Turnstile on this request unless backend adds and documents it. |

---

## 5. No breaking changes required if backend already enforces 2FA

If the backend already:

- Requires and validates `twoFACode` for every change-password request (e.g. because all users have 2FA on), and
- Accepts the same body fields (`currentPassword`, `newPassword`, `confirmPassword`, `emailOtp`, `twoFACode`),

then no backend code change is strictly necessary; only the doc update in §3 is recommended so it clearly states that `twoFACode` is required for all users.

If the backend today treats `twoFACode` as optional and only checks it when “user has 2FA enabled,” then the backend should be updated to **require and validate `twoFACode` for all users** on the change-password endpoint so it stays in line with the frontend and product rule (2FA mandatory, never off).
