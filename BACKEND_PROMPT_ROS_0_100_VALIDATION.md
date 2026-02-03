# Backend Task: Allow ROS Percentage 0–100% (Fix "2.2%" Validation)

**From:** Frontend team  
**To:** Backend team  
**Priority:** High (blocking admin declaration in testing)  
**Date:** January 2026

**Status:** ✅ **Backend confirmed done** (January 2026). Backend already allows 0–100% and returns "ROS percentage must be between 0 and 100". This doc is kept for reference.

---

## 1. Problem Summary

When admins declare or update daily declaration returns from the admin dashboard, they can enter an ROS (Return on Stake) percentage. The **frontend** has been updated to allow **0–100%** for testing. However, when an admin enters a value above 2.2% (e.g. 25% or 100%), the **backend** rejects the request and returns an error message that still says something like:

- _"ROS percentage must be between 0 and 2.2"_, or
- _"You must declare between 0 and 2.2%"_, or similar.

As a result, admins see this message in the UI and cannot use values above 2.2%. The fix is to **update the backend** so that:

1. **Validation** allows `rosPercentage` in the range **0–100** (inclusive).
2. **Error message** says **"0 and 100"** (not "0 and 2.2") when the value is out of range.

---

## 2. Affected Endpoints

Update **all** of the following so that `rosPercentage` is validated as **0–100** and any related error message uses **"0 and 100"**:

### 2.1 Declare (single day)

- **Method:** `POST`
- **Path:** `/api/v1/admin/daily-declaration-returns/declare`
- **Request body (relevant field):**
  ```json
  {
    "date": "2026-01-30",
    "premiumPoolAmount": 500,
    "performancePoolAmount": 500,
    "rosPercentage": 25,
    "description": "optional",
    "autoDistributePools": false,
    "autoDistributeROS": false
  }
  ```
- **Change:** Allow `rosPercentage` in the range **0–100** (inclusive). If out of range, return **400** with message: **"ROS percentage must be between 0 and 100"**.

### 2.2 Update declaration

- **Method:** `PATCH`
- **Path:** `/api/v1/admin/daily-declaration-returns/:date`
- **Request body (can include):**
  ```json
  {
    "premiumPoolAmount": 500,
    "performancePoolAmount": 500,
    "rosPercentage": 25,
    "description": "optional"
  }
  ```
- **Change:** Same as above: validate `rosPercentage` as **0–100**; on validation failure return **400** with **"ROS percentage must be between 0 and 100"**.

### 2.3 Bulk declare (if implemented)

- If you have an endpoint for bulk declaration (e.g. multiple dates with the same ROS), apply the **same rule**: each declaration’s `rosPercentage` must be **0–100**, and the error message must say **"0 and 100"**, not **"2.2"**.

---

## 3. Exact Validation Rule

- **Field:** `rosPercentage`
- **Type:** number
- **Valid range:** **0 ≤ rosPercentage ≤ 100** (inclusive)
- **Invalid:** `rosPercentage < 0` OR `rosPercentage > 100`
- **Response when invalid:** HTTP **400 Bad Request**
- **Response body (message):** Use exactly (or equivalent):
  ```text
  ROS percentage must be between 0 and 100
  ```
  Do **not** return any message that mentions **"2.2"** or **"0 and 2.2"**.

---

## 4. Where to Change in Your Codebase

Search the backend codebase for:

1. **Validation of `rosPercentage`**  
   Look for:
   - Numbers like `2.2`, `2,2`
   - Strings like `"2.2"`, `"0 and 2.2"`, `"between 0 and 2.2"`
   - Validation rules or schemas (e.g. Joi, Yup, class-validator, Zod) that set max to 2.2 for ROS/declaration

2. **Error messages**  
   Look for:
   - Any message containing `2.2` or `2,2` in the context of ROS or daily declaration
   - Replace with: **"ROS percentage must be between 0 and 100"**

3. **Controllers / routes**  
   Likely places:
   - Daily declaration returns controller (e.g. `declare`, `updateDeclaration`, or similar)
   - Any middleware or DTO that validates the declare/update request body

---

## 5. Example Behaviour (Before vs After)

### Before (current – wrong for testing)

- Request: `POST .../declare` with `"rosPercentage": 25`
- Backend: validates `0 ≤ rosPercentage ≤ 2.2`
- Result: **400** with message e.g. _"ROS percentage must be between 0 and 2.2"_
- User sees: _"ROS percentage must be between 0 and 2.2"_ (or similar) in the UI

### After (required)

- Request: `POST .../declare` with `"rosPercentage": 25`
- Backend: validates `0 ≤ rosPercentage ≤ 100`
- Result: **200** (or 201), declaration saved
- User sees: success

For an invalid value:

- Request: `"rosPercentage": 150`
- Backend: validates `0 ≤ rosPercentage ≤ 100` → fails
- Result: **400** with message **"ROS percentage must be between 0 and 100"**
- User sees: _"ROS percentage must be between 0 and 100"_ in the UI

---

## 6. Checklist for Backend

- [ ] **Declare endpoint** (`POST .../declare`): `rosPercentage` allowed in **0–100**; error message says **"0 and 100"**.
- [ ] **Update endpoint** (`PATCH .../declare/:date`): same validation and message.
- [ ] **Bulk declare** (if any): same rule for every declaration.
- [ ] No validation still uses **2.2** as max for ROS in these flows.
- [ ] No error message in these flows contains **"2.2"** or **"0 and 2.2"**.
- [ ] Test with e.g. `rosPercentage: 25` and `rosPercentage: 100` → success (2xx).
- [ ] Test with `rosPercentage: 101` or `-1` → 400 with message **"ROS percentage must be between 0 and 100"**.

---

## 7. Optional: Reverting Later (Production)

When testing is over and you want to cap ROS again (e.g. back to 2.2%):

- Change validation to your production cap (e.g. 0–2.2).
- Change the error message to e.g. _"ROS percentage must be between 0 and 2.2"_.
- Frontend will then show that message; we can revert frontend max/copy to match at that time.

---

## 8. One-Sentence Summary

**Allow `rosPercentage` in the range 0–100 (inclusive) for the admin daily-declaration-returns declare and update endpoints, and return the error message "ROS percentage must be between 0 and 100" (not "2.2") when the value is out of range.**

---

If anything is unclear or your routes/validation live in a different structure, share the file names or snippets and we can align. Thank you.
