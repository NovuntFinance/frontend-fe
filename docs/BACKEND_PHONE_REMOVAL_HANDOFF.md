# Backend Handoff: Phone Number Removed from Registration & Platform

**Date:** February 2025  
**Context:** The frontend has removed phone number collection from registration and from the profile edit flow. This document describes exactly what changed so the backend can stay in sync.

---

## 1. Summary of Frontend Changes

| Area | Before | After |
|------|--------|--------|
| **Registration (signup)** | Required: phone number + country code (with “Required for account verification”); payload included `phoneNumber` and `countryCode`. | Phone field removed from UI and from payload. Registration payload **does not** include `phoneNumber` or `countryCode`. |
| **Profile edit** | Required phone number section; profile update payload included `phoneNumber`, `phone`, and `countryCode`. | Phone section removed from profile modal. Profile update payload **does not** include `phoneNumber`, `phone`, or `countryCode`. |
| **Validation** | Signup schema required phone (E.164). Profile schema required phone. | Phone removed from both schemas. |
| **Auth types** | `RegisterRequest` had required `phoneNumber` and `countryCode`. | Both are **optional** in the type; frontend does not send them. |
| **Onboarding** | “New user” used `!user.phoneNumber \|\| !user.firstName`. | “New user” uses only `!user.firstName`. |

The frontend no longer collects, validates, or sends phone number for **new** signups or for **profile updates**. Existing users may still have `phoneNumber`/`countryCode` in the database; the frontend does not display or edit them in the main flows (admin may still show “No phone” / “Not provided” for existing data).

---

## 2. API: Registration (Sign-Up)

### Endpoint

- **POST** `/api/v1/better-auth/register` (or your BetterAuth registration endpoint)

### Payload the frontend sends **now**

The frontend sends **only** these fields. `phoneNumber` and `countryCode` are **not** sent.

```json
{
  "firstName": "string",
  "lastName": "string",
  "email": "string",
  "username": "string",
  "password": "string",
  "confirmPassword": "string",
  "referralCode": "string (optional)",
  "turnstileToken": "string (optional)"
}
```

### What the backend should do

1. **Treat `phoneNumber` and `countryCode` as optional**
   - Do **not** require them for registration.
   - If they are present (e.g. from an old client or future use), you may store them; if absent, store `null`/empty or omit.

2. **Validation**
   - Remove any “phone number required” or “country code required” validation for registration.
   - Do not return validation errors for missing `phoneNumber` or `countryCode`.

3. **User model**
   - New users can have `phoneNumber` and `countryCode` as `null` or empty.
   - No need to enforce uniqueness on phone for new signups if you are no longer collecting it.

4. **Responses**
   - Registration success/error responses should not assume or require phone. Keep existing response shape; only relax requirements for phone/countryCode.

---

## 3. API: Profile Update

### Endpoint

- **PATCH** `/api/v1/users/profile` (primary)
- Fallback: **PATCH** `/api/v1/users/user/:userId` (if needed)

### Payload the frontend sends **now**

The profile edit modal sends **only** these fields. **No** `phoneNumber`, `phone`, or `countryCode`.

```json
{
  "firstName": "string",
  "lastName": "string",
  "fullName": "string",
  "dateOfBirth": "YYYY-MM-DD",
  "gender": "male | female | other | prefer_not_to_say",
  "address": {
    "street": "string",
    "city": "string",
    "state": "string",
    "country": "string",
    "postalCode": "string"
  },
  "profilePhoto": "string (URL, optional)"
}
```

Optional: `userId` may be sent for fallback routing but should be stripped before persisting.

### What the backend should do

1. **Do not require phone for profile update**
   - Accept PATCH payloads that omit `phoneNumber`, `phone`, and `countryCode`.
   - If the payload does not include these fields, do not overwrite existing phone data with empty values unless that is explicit product behaviour (frontend does not send them at all).

2. **Validation**
   - Remove “phone required” (or similar) validation for profile update.
   - Do not return 400/422 for missing phone on profile update.

3. **Existing users**
   - Users who already have `phoneNumber`/`countryCode` in the DB can keep them; the frontend simply does not show or edit them in the main profile flow. Backend can continue to return them in GET profile/user responses if desired.

---

## 4. API: Get Profile / Get User

### Endpoints (unchanged)

- **GET** `/api/v1/users/profile`
- Any **GET** user-by-id used by admin or other flows

### Response

- The frontend still supports optional `phoneNumber` and `countryCode` in user/profile types for backward compatibility and admin display.
- Backend may keep returning these fields when present; the frontend will not display or edit them in registration or profile edit.

No change **required** to response shape; only usage on the frontend changed (no collection, no edit).

---

## 5. TypeScript Types (for reference)

### Registration request (frontend)

```ts
interface RegisterRequest {
  firstName: string;
  lastName: string;
  email: string;
  username: string;
  password: string;
  confirmPassword: string;
  phoneNumber?: string;   // Optional — not sent by frontend
  countryCode?: string;  // Optional — not sent by frontend
  referralCode?: string;
  turnstileToken?: string;
}
```

### Profile update payload (frontend)

Phone-related fields are still defined as optional in `UpdateProfilePayload`, but the **profile edit form never sends them**. So in practice, the backend will receive no `phoneNumber`, `phone`, or `countryCode` from the main profile UI.

---

## 6. Checklist for Backend

- [ ] **Registration:** Do not require `phoneNumber` or `countryCode`; accept requests without them.
- [ ] **Registration:** Remove validation that returns an error when phone/countryCode is missing.
- [ ] **Profile update:** Do not require `phoneNumber`/`phone`/`countryCode` on PATCH `/users/profile` (or equivalent).
- [ ] **Profile update:** Accept payloads that omit phone fields; do not treat missing phone as a validation error.
- [ ] **User model:** Allow `phoneNumber` and `countryCode` to be null/empty for new users.
- [ ] **Get profile / get user:** No change required; can keep returning phone fields if present.
- [ ] **Admin / other flows:** No change required; backend can continue to store/return phone for existing data if needed.

---

## 7. Contact

If the backend team needs clarification on payloads, endpoints, or behaviour, they can refer to:

- **Registration payload:** `src/lib/mutations.ts` (useSignup), `src/app/(auth)/signup/page.tsx`
- **Profile update payload:** `src/components/profile/ProfileEditModal.tsx` (onSubmitProfile), `src/lib/userService.ts` (updateProfile)
- **Auth types:** `src/types/auth.ts` (RegisterRequest)

Frontend and backend should stay aligned so that registration and profile update work without phone number.
