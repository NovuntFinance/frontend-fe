# Backend Handoff: Withdrawal Whitelist, Save/Update Address, Moratorium & Withdraw Flow

**Purpose:** Align the backend API with the frontend so that (1) saving and updating the withdrawal (whitelist) address works, (2) the dashboard and wallet modal show the saved address and moratorium state correctly, and (3) users can perform withdrawals using the saved address. The frontend is already built and handles all error codes below; the backend only needs to implement the contract described here.

---

**Backend status (implemented):** The backend has implemented this contract. POST default-address accepts `address`, `twoFactorCode`, `network`; 2FA from body and/or `X-2FA-Code` header; GET/POST return moratorium (first set has no cooldown, 72h on update); POST withdrawal/create uses saved address and returns `WITHDRAWAL_ADDRESS_REQUIRED` when none set. Frontend handles `WITHDRAWAL_ADDRESS_REQUIRED` and `WALLET_ADDRESS_REQUIRED` for withdrawal-create errors.

**Regression check (backend confirmation):** The backend confirmed no impact on existing behaviour. Transfer still uses email OTP; change password still uses email OTP + 2FA; password reset still uses email OTP. Other withdrawal path (`NO_WHITELISTED_ADDRESS`), profile API, withdrawal limits, and `POST /wallets/withdrawal/default-address/request-otp` are unchanged or compatible. Withdrawal create body still allows `emailOtp` (no breaking change). Only the withdrawal-whitelist set/update flow and related GET/moratorium behaviour were changed; first set no longer incorrectly triggers a 72h lock. Frontend does not call request-otp for set-address and does not send `emailOtp` on withdrawal create, so we remain fully compatible.

**“Save failed” / “Unable to connect” (CORS):** If the API root (e.g. `https://api.novunt.com`) works but POST to `/api/v1/wallets/withdrawal/default-address` fails with a generic “Unable to connect” message, the cause is usually **CORS**: the frontend sends custom headers (`Authorization`, `X-2FA-Code`, etc.), so the browser sends an **OPTIONS preflight**; if the backend’s `Access-Control-Allow-Headers` does **not** include `X-2FA-Code` (and any other custom headers we send), the browser blocks the actual POST and the frontend only sees a failed request. The backend fixed this by adding to `Access-Control-Allow-Headers`: `X-2FA-Code`, `idempotency-key`, `x-idempotency-key`, `cf-turnstile-response`, `turnstileToken`. **Action:** Deploy the backend CORS change to the live API; ensure the frontend origin (e.g. `https://app.novunt.com`) is in the backend’s allowed origins. After deploy, in DevTools → Network: OPTIONS to `.../withdrawal/default-address` should return 200 with `Access-Control-Allow-Headers` including `X-2FA-Code`; then the POST should run.

---

## 1. Overview of Frontend Flows

| Flow                         | Description                                                                                                                                                                           |
| ---------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Get default address**      | Dashboard “Welcome back” card and Wallet modal show the user’s saved BEP20 withdrawal address (or “not set”).                                                                         |
| **Set address (first time)** | User enters BEP20 address + 2FA code → backend saves it → success; optional moratorium can start.                                                                                     |
| **Update address**           | User changes address (with 2FA) → backend updates → 72h moratorium starts; frontend shows countdown and blocks further address change until moratorium ends.                          |
| **Withdraw**                 | User enters amount + 2FA (and optionally Turnstile). Backend uses the **saved default address** as recipient (frontend does not send `walletAddress` on create withdrawal).           |
| **Moratorium**               | After an address change, frontend expects `moratorium.active === true` and countdown fields; it blocks “change address” and shows “Available at: &lt;date&gt;” until moratorium ends. |

---

## 2. Endpoints and Contracts

### 2.1 GET Default Withdrawal Address

**Endpoint:** `GET /api/v1/wallets/withdrawal/default-address`  
**Auth:** User session (cookie/token as per existing auth).

**Response (200):** Either **wrapped** or **unwrapped**; frontend accepts both.

**Option A – Wrapped (recommended):**

```json
{
  "success": true,
  "data": {
    "address": "0x...",
    "hasDefaultAddress": true,
    "canChange": true,
    "network": "BEP20",
    "moratorium": {
      "active": false,
      "canChange": true,
      "hoursRemaining": 0,
      "minutesRemaining": 0,
      "canChangeAt": null,
      "canChangeAtFormatted": null,
      "moratoriumDurationHours": 72
    },
    "note": "Optional note",
    "immutable": false
  }
}
```

**Option B – Unwrapped (frontend also supports):**

```json
{
  "address": "0x...",
  "hasDefaultAddress": true,
  "canChange": true,
  "network": "BEP20",
  "moratorium": { ... }
}
```

**When user has no address yet:** Return `200` with `address: null`, `hasDefaultAddress: false`, `canChange: true`, and `moratorium.active: false` (or 404; frontend treats 404 as “no address” and shows the “Set address” state).

**Moratorium object (required in both GET and POST responses when applicable):**

| Field                     | Type           | Description                                                      |
| ------------------------- | -------------- | ---------------------------------------------------------------- |
| `active`                  | boolean        | True when user is in the cooldown period after changing address. |
| `canChange`               | boolean        | False while moratorium is active.                                |
| `hoursRemaining`          | number         | Whole hours left (e.g. 71).                                      |
| `minutesRemaining`        | number         | Minutes in the current hour (0–59).                              |
| `canChangeAt`             | string \| null | ISO 8601 date/time when address can be changed again.            |
| `canChangeAtFormatted`    | string \| null | Human-readable date/time (e.g. "Mar 5, 2026, 2:30 PM").          |
| `moratoriumDurationHours` | number         | Total duration (e.g. 72).                                        |

---

### 2.2 POST Set / Update Default Withdrawal Address (Critical for “Save failed” / “2FA required”)

**Endpoint:** `POST /api/v1/wallets/withdrawal/default-address`  
**Auth:** User session.  
**2FA:** Required. Backend must accept the 2FA code from **one** of the following (please pick one and document it):

- **Option A – Request body only**
  - Body field name: **`twoFactorCode`** (camelCase, 6-digit string).
  - Do **not** accept `twoFACode` or `walletAddress` as body fields if you use strict validation; the frontend will send **`address`**, **`twoFactorCode`**, and **`network`** only.

- **Option B – Header only**
  - Header: **`X-2FA-Code`** (6-digit string).
  - Frontend already sends this header when a code is provided.

- **Option C – Both**
  - Accept **either** body `twoFactorCode` **or** header `X-2FA-Code` (header preferred if both present).

**Request body (what the frontend sends today):**

```json
{
  "address": "0xf2129942f3952378312203958a51c49f58e5c535",
  "network": "BEP20",
  "twoFactorCode": "313526"
}
```

Plus optional header: `X-2FA-Code: 313526`.

**Important:** The frontend has previously seen:

- **“Unknown fields are not allowed”** when sending `walletAddress` or `twoFACode`. So the backend should **not** require those names; it should accept **`address`** and **`twoFactorCode`** (and optionally read 2FA from **`X-2FA-Code`**).
- **“2FA code is required for this operation”** even when a 2FA code was sent. So the backend must actually **read and validate** the 2FA code from the chosen location (body or header) and return this only when no valid code is provided.

**Success response (200):** Same shape as GET (wrapped or unwrapped). Include `moratorium` with the new state (e.g. after an update, `moratorium.active: true`, countdown fields, `canChange: false`). Optionally include `isFirstTime: true` on first save so the frontend can show “Withdrawal address set” vs “Withdrawal address updated”.

**Error responses (4xx):** Use a consistent JSON shape so the frontend can show the right message:

```json
{
  "success": false,
  "message": "Human-readable message",
  "error": {
    "code": "ERROR_CODE",
    "message": "Optional detail"
  }
}
```

**Error codes the frontend already handles:**

| Code                        | HTTP    | When to return                                       | Frontend behavior                                                                                                       |
| --------------------------- | ------- | ---------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------- |
| `2FA_CODE_REQUIRED`         | 400/403 | 2FA missing or not read from body/header             | Shows “2FA code is required for this operation.”                                                                        |
| `2FA_CODE_INVALID`          | 400/403 | 2FA invalid or expired                               | Shows “Invalid 2FA code. Please try again.”                                                                             |
| `INVALID_ADDRESS`           | 400     | Not a valid BEP20 address                            | Shows “Invalid BEP20 address. Please enter a valid BSC wallet address.”                                                 |
| `UNSUPPORTED_NETWORK`       | 400     | Network not BEP20                                    | Shows “Only BEP20 (BSC) network is supported.”                                                                          |
| `ADDRESS_MORATORIUM_ACTIVE` | 400/403 | User tried to change address while moratorium active | Shows “Address change locked” and remaining time. Optional: include `moratorium` in response so frontend can update UI. |

If the backend uses strict schema validation, **allow only** these body fields for this endpoint: **`address`**, **`twoFactorCode`**, **`network`**. Do not require `walletAddress` or `twoFACode`.

---

### 2.3 POST Create Withdrawal (Uses Saved Address)

**Endpoint:** `POST /api/v1/enhanced-transactions/withdrawal/create`  
**Auth:** User session.  
**2FA:** Required (body and/or header, same convention as above if possible).

**Request body (what the frontend sends):**

```json
{
  "amount": 100.5,
  "network": "BEP20",
  "twoFACode": "313526",
  "turnstileToken": "optional-cloudflare-turnstile-token"
}
```

**Note:** The frontend does **not** send `walletAddress` on create withdrawal. The backend must use the **user’s saved default withdrawal address** (from GET/POST default-address) as the recipient. If the user has no saved address, return a clear error (e.g. `WITHDRAWAL_ADDRESS_REQUIRED` or 400 with message) so the frontend can direct the user to set the address first.

**Withdrawal and moratorium:**

- If the user has recently **changed** their withdrawal address and is still in the 72h moratorium, the backend may either:
  - Reject the withdrawal with a code like `WITHDRAWAL_BLOCKED_MORATORIUM` and optional `moratorium` in the response, or
  - Allow withdrawal to the **previous** address until moratorium ends (product decision).
- The frontend already blocks “change address” during moratorium and shows a countdown; it can also show a message on the withdraw form if you return a moratorium-related error.

**Success response (200):** Frontend expects at least:

```json
{
  "data": {
    "transactionId": "...",
    "reference": "...",
    "amount": 100.5,
    "fee": 0,
    "netAmount": 100.5,
    "walletAddress": "0x...",
    "network": "BEP20",
    "status": "pending",
    "requiresApproval": false,
    "estimatedProcessingTime": "1-24 hours"
  }
}
```

**Error codes:** Same 2FA and validation codes as above; plus **`WITHDRAWAL_ADDRESS_REQUIRED`** (or `WALLET_ADDRESS_REQUIRED`) when the user has no saved default address—frontend shows “Withdrawal address required” and directs them to Wallet → Withdrawal Whitelist; plus any limits (e.g. daily limit) with a message so the frontend can show “Daily limit exceeded” or similar.

---

## 3. Moratorium Rules (Summary for Backend)

- **When:** Applied when the user **updates** their default withdrawal address (not necessarily on first set; product can decide).
- **Duration:** 72 hours (configurable; frontend reads `moratoriumDurationHours` for display).
- **During moratorium:**
  - `GET default-address` returns `moratorium.active: true`, `canChange: false`, and countdown fields.
  - `POST default-address` (change address) returns `ADDRESS_MORATORIUM_ACTIVE` with optional `moratorium` in the body.
- **After moratorium:** `canChange: true`, `active: false`, countdown fields 0 or omitted.

---

## 4. Checklist for Backend

- [ ] **POST /wallets/withdrawal/default-address** accepts **body** fields: **`address`**, **`twoFactorCode`**, **`network`** only (no `walletAddress` / `twoFACode` in body if using strict validation).
- [ ] **2FA:** Backend reads 2FA from **`twoFactorCode`** in body **and/or** **`X-2FA-Code`** header; validates it and returns `2FA_CODE_REQUIRED` only when code is missing, and `2FA_CODE_INVALID` when invalid.
- [ ] **GET/POST default-address** return **`moratorium`** with the shape above so the dashboard and Wallet modal can show “address set”, “can change”, and countdown when moratorium is active.
- [ ] **POST withdrawal/create** uses the **saved default address** as recipient when `walletAddress` is not sent; returns a clear error when user has no saved address.
- [ ] **Error responses** use the `error.code` values above so the frontend toasts and copy stay correct.

---

## 5. Quick Reference: Request/Response Shapes

| Endpoint          | Method | Body (key names)                                            | 2FA                                   | Response                                                             |
| ----------------- | ------ | ----------------------------------------------------------- | ------------------------------------- | -------------------------------------------------------------------- |
| Default address   | GET    | —                                                           | No                                    | `address`, `hasDefaultAddress`, `canChange`, `moratorium`, `network` |
| Default address   | POST   | `address`, `twoFactorCode`, `network`                       | Yes (body and/or `X-2FA-Code` header) | Same as GET + optional `isFirstTime`                                 |
| Create withdrawal | POST   | `amount`, `network`, `twoFACode`, optional `turnstileToken` | Yes                                   | `data.transactionId`, `data.estimatedProcessingTime`, etc.           |

Once the backend implements this contract, the existing frontend will support saving the wallet address on the dashboard, updating it with moratorium, and performing withdrawals using the saved address without further frontend changes.
