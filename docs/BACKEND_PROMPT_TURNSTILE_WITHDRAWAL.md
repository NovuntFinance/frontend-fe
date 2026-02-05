# Backend Prompt: Add Cloudflare Turnstile to Withdrawal Request

**Audience:** Backend team  
**Purpose:** Specify how to protect the **withdrawal request** endpoint with Cloudflare Turnstile so the frontend can send a token and the backend can verify it. This matches the same pattern already used for login and register.

---

## 1. Context and goal

We already use **Cloudflare Turnstile** on:

- `POST /api/v1/better-auth/login`
- `POST /api/v1/better-auth/register`

We want to **add Turnstile to the withdrawal request** so that:

- **Bot abuse** on high-value withdrawal submissions is reduced.
- **UX** stays simple (Turnstile is often invisible or a single checkbox).
- **Consistency** with login/register: same secret key, same verification flow, same error contract.

**Requirement:** Before the backend processes a withdrawal request, it must receive a valid Turnstile token from the frontend. If the token is missing or invalid, the backend returns **400** with a defined JSON body and the withdrawal is **not** processed.

---

## 2. Endpoint to protect

| Method | Path (under API base) | Description |
|--------|------------------------|-------------|
| **POST** | **`/withdrawal/request`** | User submits a new withdrawal (amount, network, recipient address, etc.). |

**Full URL example:** `POST /api/v1/withdrawal/request`

- **When to enforce:** Only when **`TURNSTILE_SECRET_KEY`** is set in the backend environment (same as for login/register). If not set, skip Turnstile and process the request as today.
- **Auth:** Request is already authenticated (e.g. Bearer JWT). Turnstile runs **in addition** to auth, not instead of it.

---

## 3. How the backend should receive the token

Use the **same order and field names** as for login/register:

1. **Request body (JSON)**  
   - `cf-turnstile-response` **or** `turnstileToken`  
   (accept either key; same value.)

2. **Query string**  
   - `cf-turnstile-response`

3. **Header**  
   - `x-turnstile-response`

For the withdrawal flow, the frontend will send the token in the **JSON body** as **`turnstileToken`** (and optionally support **`cf-turnstile-response`**). So the backend should read from the body first, e.g.:

- `body['cf-turnstile-response'] || body['turnstileToken']`

---

## 4. Backend behavior

| Case | Action |
|------|--------|
| **Valid token** | Verify with Cloudflare Siteverify API (same as login/register). If verification succeeds, continue with normal withdrawal validation and processing. |
| **Missing token** | Return **400** with the error body below. Do **not** create or process the withdrawal. |
| **Invalid / expired / already-used token** | Return **400** with the error body below. Do **not** process the withdrawal. |

**Token rules (from Cloudflare):**

- Single-use.
- Short validity (e.g. ~5 minutes).
- Verification is done via Cloudflare’s Siteverify API using **`TURNSTILE_SECRET_KEY`**.

---

## 5. Error response when Turnstile fails

When verification fails (missing token, invalid, expired, or already used), the backend must return:

**Status:** `400 Bad Request`

**Body (JSON):**

```json
{
  "success": false,
  "message": "Verification failed. Please complete the security check and try again.",
  "code": "TURNSTILE_FAILED",
  "errorCodes": ["missing-input-response"]
}
```

- **`code`** must be exactly **`"TURNSTILE_FAILED"`** so the frontend can show a specific message and reset the widget.
- **`message`** can be the one above or a similar user-facing string.
- **`errorCodes`** should reflect Cloudflare’s response when available, e.g.:
  - `missing-input-response` – No token sent
  - `invalid-input-response` – Token invalid, malformed, or expired
  - `timeout-or-duplicate` – Token already used or expired
  - `internal-error` – Temporary Cloudflare/network issue

The frontend will treat any **400** with **`code: "TURNSTILE_FAILED"`** as “Turnstile check failed” and will show a clear message and reset the widget so the user can try again.

---

## 6. Request body shape (what the frontend will send)

The frontend will send the **existing withdrawal request payload** plus the Turnstile token. Example:

```json
{
  "walletType": "earnings",
  "amount": 100,
  "network": "TRC20",
  "recipientAddress": "TXYZ...",
  "twoFactorCode": "123456",
  "turnstileToken": "<token-from-turnstile-widget>"
}
```

- **Existing fields:** `walletType`, `amount`, `network`, `recipientAddress`, `twoFactorCode` (optional) — unchanged.
- **New field:** **`turnstileToken`** (or, if you prefer to accept it, **`cf-turnstile-response`**). Backend should accept at least one of these when Turnstile is enabled.

Backend should:

- Read the token from the body (e.g. `turnstileToken` or `cf-turnstile-response`).
- Verify it with Cloudflare **before** running withdrawal validation or DB logic.
- Not require the token when **`TURNSTILE_SECRET_KEY`** is not set (so existing behaviour can remain for dev/staging without the key).

---

## 7. Implementation checklist (backend)

- [ ] When **`TURNSTILE_SECRET_KEY`** is set, run Turnstile verification for **`POST /withdrawal/request`** before any withdrawal logic.
- [ ] Read token from: body **`cf-turnstile-response`** or **`turnstileToken`**, then query **`cf-turnstile-response`**, then header **`x-turnstile-response`**.
- [ ] On success: proceed with normal withdrawal validation and processing.
- [ ] On failure (missing/invalid/expired token): respond with **400** and JSON body containing **`code: "TURNSTILE_FAILED"`**, **`message`**, and **`errorCodes`** (if available).
- [ ] Reuse the same Siteverify integration and secret key used for login/register.

---

## 8. Frontend commitment

Once the backend supports this:

- The frontend will add the **Turnstile widget** to the withdrawal request form (e.g. in the withdraw modal).
- On submit, the frontend will read the token from the widget and send it in the request body as **`turnstileToken`** (and optionally **`cf-turnstile-response`** if the backend accepts both).
- On **400** with **`code: "TURNSTILE_FAILED"`**, the frontend will show a user-friendly message and reset the widget so the user can complete the challenge and retry.

---

## 9. Summary table

| Item | Detail |
|------|--------|
| **Product** | Cloudflare Turnstile |
| **Protected route** | `POST /api/v1/withdrawal/request` |
| **When active** | Only when **`TURNSTILE_SECRET_KEY`** is set |
| **Token accepted from** | Body: **`cf-turnstile-response`** or **`turnstileToken`**; or query **`cf-turnstile-response`**; or header **`x-turnstile-response`** |
| **Success** | Request proceeds to normal withdrawal validation and processing |
| **Failure** | **400**, **`code: "TURNSTILE_FAILED"`**, **`message`** and **`errorCodes`** in JSON |
| **Existing auth** | Unchanged (e.g. Bearer JWT still required) |

---

## 10. References

- Cloudflare Turnstile – [Client-side (widget)](https://developers.cloudflare.com/turnstile/get-started/client-side-rendering/)
- Cloudflare Turnstile – [Server-side verification (Siteverify)](https://developers.cloudflare.com/turnstile/get-started/server-side-validation/)
- Existing Turnstile usage in this project: login and register (same secret key and error contract).

If you need a different token field name or additional endpoints protected (e.g. cancel withdrawal), the same pattern can be extended; coordinate with the frontend team.
