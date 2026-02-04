# Backend Prompt: Admin Withdrawal Approval API

**Purpose:** This document gives the backend team a complete, unambiguous specification for the **Admin Withdrawal Approval** endpoint so it works with the existing frontend and returns the information we need for a good user experience.

---

## 1. Feature context

- **User flow:** When a user withdraws an amount **above** the instant-withdrawal threshold (e.g. configurable in admin settings), the withdrawal is created in a **pending** state and requires **admin approval**.
- **Admin flow:** Admin goes to **Transaction Management** (`GET /api/v1/admin/transactions`), filters or scrolls to find transactions with `requiresAdminApproval: true` and `type: "withdrawal"`, opens the detail drawer, and clicks **Approve** or **Reject**.
- **Frontend:** The frontend calls **one** endpoint to both approve and reject: `PATCH /api/v1/admin/withdrawal/:id` with a `status` field.

We need the backend to implement (or confirm) this endpoint so the frontend can complete the flow without changes.

---

## 2. Exact HTTP contract the frontend uses

### 2.1 Request

| Item               | Value                                                                                                                                                                                                                                                                                                                                                                                                                     |
| ------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Method**         | `PATCH`                                                                                                                                                                                                                                                                                                                                                                                                                   |
| **Path**           | `/api/v1/admin/withdrawal/:id`                                                                                                                                                                                                                                                                                                                                                                                            |
| **Path parameter** | `:id` — **must be the same identifier** that the backend returns for this withdrawal in **GET /api/v1/admin/transactions** (and in **GET /api/v1/admin/transactions/:id** for the detail). The frontend uses the transaction/withdrawal `id` from the list. If your DB uses a separate “withdrawal id” vs “transaction id”, either accept the transaction id in this route or document which id the frontend should send. |
| **Headers**        | `Authorization: Bearer <admin_jwt>` (required). Optionally `Content-Type: application/json` if you rely on it.                                                                                                                                                                                                                                                                                                            |
| **Body (JSON)**    | See below.                                                                                                                                                                                                                                                                                                                                                                                                                |

**Request body (JSON):**

```json
{
  "status": "approved",
  "reason": "Optional note from admin (can be omitted or empty string)",
  "twoFACode": "123456"
}
```

- **`status`** (required, string): Exactly one of `"approved"` or `"rejected"`. The frontend sends only these two values.
- **`reason`** (optional, string): Free text from the admin (e.g. “Verified user and amount”). The frontend may omit the field or send an empty string. Backend may store it for audit.
- **`twoFACode`** (optional, string): Sent by the frontend when admin 2FA is enabled. Backend should validate it when 2FA is required for this admin and return 403 with a clear message if invalid or missing.

The frontend **never** sends any other body fields for this endpoint. Please do not require extra fields (e.g. `transactionId` in body) since the id is in the path.

---

## 3. Path parameter: which `id`?

- The frontend gets the list from **GET /api/v1/admin/transactions** and optionally **GET /api/v1/admin/transactions/:transactionId** for detail.
- The **same** `id` shown in that list/detail (e.g. `transaction.id` or `withdrawal.transactionId`) is what the frontend sends in the path: `PATCH /api/v1/admin/withdrawal/{that_id}`.
- **Action required:** Confirm whether this `id` is:
  - **(A)** Your transaction id (or withdrawal id that equals it), and the route already expects it — no change needed, or
  - **(B)** Something else (e.g. internal withdrawal id different from transaction id). In that case, please either:
  - Change the backend to accept the **transaction id** in the path and resolve the withdrawal internally, or
  - Tell the frontend which id to send (e.g. a dedicated `withdrawalId` in the transaction list/detail response) and we will adapt the frontend.

---

## 4. 2FA

- The frontend treats this PATCH as a write operation and will prompt for 2FA when the admin has 2FA enabled. The code is sent in the body as **`twoFACode`**.
- Backend should protect this route with the same 2FA middleware used for other admin write operations (e.g. `validateAdmin2FA`). If 2FA is required and missing or invalid, return **403** with a JSON body that includes a **`message`** (or similar) so the frontend can show it in a toast. Example:

```json
{
  "success": false,
  "message": "Invalid or expired 2FA code",
  "error": { "code": "INVALID_2FA" }
}
```

- The frontend reads `response.data.message` (or `error.message`) and displays it on failure.

---

## 5. Success response (what the frontend expects)

- **Status code:** `200` (or `204`; if 204, the frontend does not read a body).
- **Body (if 200):** Any JSON is acceptable. The frontend does not depend on specific fields for success; it only checks that the request did not throw and status is 2xx. For consistency and future use, a simple shape is enough, e.g.:

```json
{
  "success": true,
  "message": "Withdrawal approved",
  "data": {
    "transactionId": "...",
    "status": "approved"
  }
}
```

You can add more fields (e.g. updated withdrawal object) if useful for other clients or logs.

---

## 6. Error response (what the frontend uses)

- On **4xx/5xx**, the frontend shows a **toast** with an error message. It derives the message in this order:
  1. `response.data.message` (Axios: `err.response?.data?.message`)
  2. `response.data.error?.message` (if you nest it)
  3. `err.message` (e.g. “Network Error”)
  4. Fallback: “Failed to approve withdrawal” / “Failed to reject withdrawal”

**Please return a JSON body** with at least one of these so we can show a clear message:

```json
{
  "success": false,
  "message": "Human-readable description of what went wrong"
}
```

Optional but helpful:

```json
{
  "success": false,
  "message": "Withdrawal already processed",
  "error": {
    "code": "ALREADY_PROCESSED",
    "message": "This withdrawal has already been approved or rejected."
  }
}
```

- **Status codes** we handle: **400** (validation), **401** (unauthorized), **403** (forbidden / 2FA), **404** (withdrawal not found), **409** (conflict, e.g. already processed), **500** (server error). Please use **404** when the `:id` does not exist or does not refer to a withdrawal, so we can show “Withdrawal not found” instead of a generic error.

---

## 7. Business rules the frontend assumes

- Only transactions that are **withdrawals**, **pending**, and **requiresAdminApproval: true** show the Approve/Reject UI. The frontend does not send invalid statuses; it only sends `"approved"` or `"rejected"`.
- Backend should:
  - Validate that the withdrawal exists and belongs to the correct context.
  - Enforce that only **pending** (or equivalent) withdrawals can be approved/rejected; if already processed, return **409** (or **400**) with a clear `message`.
  - On **approved**: perform whatever steps you use to release the funds (e.g. mark completed, trigger payout).
  - On **rejected**: mark the withdrawal as rejected and optionally notify the user; do not transfer funds.
  - Store **reason** when provided for audit.

---

## 8. Checklist for backend (implement or verify)

Use this to confirm alignment with the frontend:

- [ ] **Route:** `PATCH /api/v1/admin/withdrawal/:id` is implemented and mounted under the same base path the frontend uses (e.g. `NEXT_PUBLIC_API_URL` + `/api/v1`).
- [ ] **Path param:** The `:id` is the same value the frontend gets from **GET /api/v1/admin/transactions** (and detail) for this withdrawal. If not, document which id the frontend must send.
- [ ] **Body:** Accept `status` (required, `"approved"` or `"rejected"`), `reason` (optional string), and `twoFACode` (optional string). No extra required fields.
- [ ] **2FA:** When 2FA is required for the admin, validate `twoFACode` and return **403** with a JSON `message` when invalid or missing.
- [ ] **Success:** Return **200** (or **204**). If 200, a JSON body with `success: true` is recommended.
- [ ] **Errors:** Return JSON with `message` (or `error.message`) for 400/401/403/404/409/500 so the frontend can show it in the toast.
- [ ] **404:** Return 404 when the given `:id` does not match any withdrawal (or transaction that is a withdrawal).
- [ ] **Idempotency / conflict:** When the withdrawal is already approved or rejected, return **409** (or **400**) with a clear message (e.g. “Withdrawal already processed”).

---

## 9. Information we need back from you

To close the loop and document the contract, please reply with:

1. **Confirmation** that the endpoint matches the above (or a short list of differences).
2. **Which id** the path expects: transaction id, withdrawal id, or other (and where the frontend gets it from your APIs).
3. **Exact success response shape** (status code + sample JSON) and **one sample error response** (e.g. 404, 403 invalid 2FA, 409 already processed).
4. **Any extra required headers or query params** we might have missed.
5. **If you use a different path or method** (e.g. `POST /admin/withdrawals/:id/approve` with a body), provide the exact spec and we will adapt the frontend.

---

## 10. Frontend code references (for your info)

- **API call:** `src/services/adminService.ts` — `approveWithdrawal(transactionId, status, reason?)` → `PATCH /admin/withdrawal/${transactionId}` with body `{ status, reason }`. The axios instance adds `twoFACode` to the body when 2FA is required.
- **UI:** `src/app/(admin)/admin/transactions/page.tsx` — Transaction list and detail drawer; Approve/Reject buttons call `handleApproveWithdrawal(id, 'approved' | 'rejected')`, which uses the transaction `id` from the list/detail.

---

**Document version:** 1.0  
**Last updated:** February 2025  
**Contact:** Use this prompt when implementing or verifying the Admin Withdrawal Approval API so the frontend and backend stay in sync.
