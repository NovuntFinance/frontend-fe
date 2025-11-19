# Staking 500 Internal Server Error - Debug Request

**Date**: November 19, 2025  
**Status**: 🔴 Blocking Issue - Requires Backend Investigation

---

## Issue Summary

The validation fix for `duration: 0` has been successfully deployed and is working. However, we're now encountering a **500 Internal Server Error** when attempting to create stakes.

---

## Current Status

✅ **Validation Fixed** - The request is now passing validation (no more 400 errors)  
❌ **Execution Failing** - Something is breaking during stake creation (500 error)

---

## Request Details

### Payload Being Sent (Successfully Validated)

```json
{
  "amount": 20,
  "sourceWallet": "auto",
  "duration": 0,
  "goal": "vehicle"
}
```

### API Endpoint

```
POST /api/v1/staking/create
```

### Headers

```
Authorization: Bearer <valid_jwt_token>
Content-Type: application/json
```

---

## Error Response

### HTTP Status Code
`500 Internal Server Error`

### Response Body

```json
{
  "success": false,
  "message": "Failed to create stake",
  "error": {
    "code": "INTERNAL_SERVER_ERROR",
    "message": "Failed to create stake"
  }
}
```

### Issue with Error Message

The error message is **too generic**. It doesn't provide any details about:
- What actually failed
- Where in the code it failed
- The underlying error (database, wallet logic, etc.)

---

## User Context

| Field | Value |
|-------|-------|
| **User ID** | `69187fb8ab4c6ad4fe15332b` |
| **Email** | `donfricky45@gmail.com` |
| **Username** | `mann` |
| **Wallet Balance** | $500 in funded wallet |
| **Stake Amount** | $20 (minimum valid amount) |
| **Authentication** | ✅ Working (can fetch wallet, profile successfully) |
| **Validation** | ✅ Passing (duration: 0 now accepted) |

---

## Questions for Backend Team

### 1. Server Logs
**What is the actual error in your server logs?**

The 500 error message `"Failed to create stake"` is too generic. Please check:
- Full error stack trace
- Database error messages
- Any validation errors that weren't caught
- Console logs at the point of failure

### 2. Database Issues
**Is there a database connection or schema issue?**

Check for:
- Database connection errors
- Missing required fields in the database schema
- Foreign key constraint violations
- Duplicate key errors

### 3. Wallet Logic
**Is there a problem with the wallet deduction when `sourceWallet: "auto"`?**

Verify:
- Does the `"auto"` wallet deduction logic work correctly?
- Is it properly checking wallet balances?
- Are there any race conditions with wallet updates?
- Does the user's wallet need to be in a specific state?

### 4. Stake Creation Logic
**Where exactly is the stake creation failing?**

Check these points in the flow:
- ✅ Request validation (this is passing)
- ❓ Wallet balance check
- ❓ Wallet deduction
- ❓ Stake record creation in database
- ❓ Response formatting

### 5. Prerequisites
**Does the user need any specific setup before creating stakes?**

For example:
- Does a wallet document need to exist in the database first?
- Are there any required user profile fields?
- Does the user need to complete KYC or other verification?

---

## Expected Response Format

Please provide the following information:

### 1. Actual Error Stack Trace

```
[Example of what we need]
Error: Cannot read property 'balance' of undefined
    at createStake (src/controllers/staking.controller.ts:185)
    at async validateRequestBody (src/middlewares/validation.middleware.ts:12)
    ...
```

### 2. Database Errors (if any)

```
[Example]
MongoError: E11000 duplicate key error collection: novunt.stakes index: userId_1
```

### 3. Execution Flow Logs

Where did the request reach before failing?
- ✅ Middleware validation
- ✅ Controller function entry
- ❓ Wallet balance check
- ❓ Database transaction
- ❓ Response send

### 4. Related Code Section

Point us to the specific line/function where it's failing:
```typescript
// Example from your backend
const createStake = async (req, res, next) => {
  const { amount, sourceWallet, duration, goal } = req.body;
  
  // Does it fail here?
  const wallet = await Wallet.findOne({ userId: req.user.id });
  
  // Or here?
  const newStake = await Stake.create({ ... });
  
  // Or here?
  await wallet.deductBalance(amount, sourceWallet);
};
```

---

## Testing Information

### What We've Verified on Frontend

✅ Request payload is correctly formatted  
✅ All required fields are present  
✅ `duration: 0` is being sent as a number  
✅ `sourceWallet: "auto"` is being sent as a string  
✅ Authentication token is valid and being sent  
✅ User has sufficient wallet balance ($500 available, staking $20)

### What Backend Needs to Verify

❓ Database connection is active  
❓ Wallet document exists for this user  
❓ Stake model schema matches the data being inserted  
❓ `sourceWallet: "auto"` logic is implemented correctly  
❓ No unhandled exceptions in the stake creation flow  
❓ Error handling is catching and logging the real error

---

## Suggested Backend Debugging Steps

1. **Add detailed logging** in the `createStake` controller:
   ```typescript
   console.log('[DEBUG] 1. Received request:', req.body);
   console.log('[DEBUG] 2. User ID:', req.user.id);
   console.log('[DEBUG] 3. Finding wallet...');
   const wallet = await Wallet.findOne({ userId: req.user.id });
   console.log('[DEBUG] 4. Wallet found:', wallet);
   console.log('[DEBUG] 5. Creating stake...');
   // etc.
   ```

2. **Check for caught errors** that are being logged to console but not returned to client

3. **Verify database queries** are executing without errors

4. **Test with a database client** directly to ensure the stake can be created manually

5. **Review recent changes** to the staking controller or wallet logic

---

## Next Steps

1. Backend team investigates the actual error from server logs
2. Backend team provides the specific failure point and error details
3. We'll determine if it's a backend bug or if frontend needs to send additional data
4. Fix is implemented and tested
5. Stake creation works successfully

---

## Related Documentation

- [STAKING_VALIDATION_FIX.md](./STAKING_VALIDATION_FIX.md) - Previous fix for duration validation
- API Endpoint: `POST /api/v1/staking/create`
- Staking Documentation: `v0/staking-endpoints.json`

---

**Priority**: 🔴 HIGH - Blocking core staking functionality

**Assigned To**: Backend Team

**Reported By**: Frontend Team

**Last Updated**: November 19, 2025
