# Frontend Trust Boundaries

**Document version:** 1.0  
**Scope:** Novunt frontend — presentation layer only. No trust, authority, secrets, or security-critical business logic.

---

## 1. What the Frontend Is Allowed to Do

- **Render** data returned by the backend (after the backend has enforced auth and authorization).
- **Collect** user input and send it to the backend via the **centralized API layer** only.
- **Improve UX** with client-side validation (format, length, required fields) — for feedback only; the backend is the source of truth.
- **Display** user-facing messages (success, errors) using **sanitized** messages from the API or generic safe fallbacks.
- **Enforce UX-only protections** (e.g. disable submit button during request, cooldowns) — these reduce abuse but do not replace server-side checks.
- **Redirect** to login when the backend returns 401/403 or when the session is known to be invalid (e.g. token expiry in middleware).

---

## 2. What the Frontend Is Never Allowed to Decide

- **Permissions** — who can do what. The backend decides; the frontend only shows/hides UI based on backend data.
- **Balances or financial state** — any number that affects payouts, withdrawals, or limits comes from the backend. The frontend must not compute or override it.
- **Approval of financial actions** — withdrawals, transfers, or any money-moving action are authorized only by the backend.
- **Security rules** — rate limits, 2FA requirements, account status, or eligibility are enforced on the server. The frontend must not bypass or override them.
- **Validation that matters** — all security- or business-critical validation (amounts, limits, eligibility) happens on the backend. Frontend validation is for UX only.

---

## 3. Frontend Limits and Responsibilities (Summary)

| Area             | Frontend responsibility                                                 | Never in frontend                               |
| ---------------- | ----------------------------------------------------------------------- | ----------------------------------------------- |
| Auth             | Send credentials; attach token from storage/cookie; redirect on 401/403 | Decide who is logged in; issue or verify tokens |
| Permissions      | Show/hide UI based on backend-provided roles                            | Decide permissions; enforce access              |
| Balances / money | Display values from API                                                 | Calculate or approve balances/transfers         |
| API calls        | Use centralized, typed API layer only                                   | Inline fetch/axios; hardcoded endpoints         |
| Secrets          | None in JS, env (browser), or build output                              | API keys; signing keys; internal IDs            |
| Errors           | Show sanitized, user-safe messages                                      | Raw stack traces; internal error details        |
| Sensitive data   | Mask IDs and PII in UI; never expose internal IDs                       | Show DB IDs; system status; debug data          |

---

## 4. Threat Model Assumptions

- The frontend is **untrusted**: it can be modified, replayed, or inspected.
- The **network is hostile**: assume interception and tampering; all sensitive operations and validation are server-side.
- **Failures must deny access**: on error or missing auth, the user must not gain extra privileges; redirect to login or show a generic error.

---

## 5. Approval Gate

The frontend is approved only if it can be **modified**, **replayed**, or **inspected** without granting extra power. All security-critical decisions and data live on the backend.
