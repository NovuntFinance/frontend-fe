# Backend Issues Report - Frontend Integration Problems

**Date:** 2025-01-XX  
**Frontend Version:** Next.js 15.5.4  
**Backend API:** `https://novunt-backend-uw3z.onrender.com/api/v1`  
**Status:** 🔴 Critical Issues Requiring Backend Fixes

---

## Executive Summary

The frontend is experiencing multiple critical issues when interacting with the backend API, particularly around user profile management. These issues prevent users from updating their profiles, viewing their phone numbers, and completing essential profile operations. All issues appear to be backend-related and require immediate attention.

### Quick Reference: Issues Summary

| Issue # | Priority | Status | Description |
|---------|----------|--------|-------------|
| #1 | 🔴 HIGH | ❌ Critical | Profile update returns 404 "User not found" - Missing endpoint or auth issue |
| #2 | 🔴 HIGH | ❌ Critical | Phone number not persisted from registration |
| #3 | 🔴 HIGH | ❌ Critical | Profile update endpoint missing (`PATCH /users/profile`) |
| #4 | 🟡 MEDIUM | ⚠️ Warning | Backend sleep mode on Render free tier causes delays |
| #5 | 🟡 MEDIUM | ⚠️ Warning | Backend should not generate random avatars during registration |
| #6 | 🟡 MEDIUM | ⚠️ Warning | Inconsistent field naming (`fname` vs `firstName`) |
| #7 | 🟡 MEDIUM | ⚠️ Warning | Error response format inconsistency |
| #8 | 🟢 LOW | ℹ️ Info | JWT token user ID field name not documented |

---

## 🔴 Critical Issue #1: Profile Update Returns "User Not Found" (404)

### Problem Description
When attempting to update user profile information, the backend returns a **404 "User not found"** error, even though:
- The user is authenticated (token is present and valid)
- The user can successfully fetch their profile using `GET /users/profile`
- The user ID exists in the token and profile data

### Current Frontend Behavior
- **Endpoint Called:** `PATCH /api/v1/users/profile` (falls back to `PUT /api/v1/users/profile`)
- **Authentication:** ✅ Bearer token is attached correctly
- **Request Method:** PATCH (standard for partial updates)
- **Response:** 404 Not Found with message "User not found"

### Expected Backend Behavior
The backend should:
1. Extract the user ID from the JWT token in the Authorization header
2. Find the user in the database using the token's user ID
3. Update the user's profile fields
4. Return the updated user profile

### Error Details
```
Status Code: 404
Error Message: "User not found"
Error Code: ERR_BAD_REQUEST
Response Data: { message: "User not found" }
```

### Frontend Request Example
```http
PATCH /api/v1/users/profile HTTP/1.1
Host: novunt-backend-uw3z.onrender.com
Authorization: Bearer <JWT_TOKEN>
Content-Type: application/json

{
  "fname": "John",
  "lname": "Doe",
  "phoneNumber": "+1234567890",
  "countryCode": "+1",
  "dateOfBirth": "1990-01-01",
  "gender": "male",
  "address": {
    "street": "123 Main St",
    "city": "New York",
    "state": "NY",
    "country": "USA",
    "postalCode": "10001"
  },
  "profilePhoto": "https://example.com/photo.jpg"
}
```

### Possible Root Causes
1. **Missing Endpoint:** The endpoint `PATCH /api/v1/users/profile` may not exist in the backend
2. **Token Parsing Issue:** Backend may not be correctly extracting user ID from JWT token
3. **User Lookup Failure:** Backend may be looking up user incorrectly (wrong field name, wrong database query)
4. **Authentication Middleware:** The authentication middleware may not be populating `req.user` correctly
5. **Route Configuration:** The route may not be properly configured or registered

### Recommended Backend Fixes

#### Option 1: Implement `PATCH /api/v1/users/profile` Endpoint
```javascript
// Expected route handler
router.patch('/users/profile', authenticateUser, async (req, res) => {
  try {
    // Extract user ID from token (should be in req.user._id or req.user.id)
    const userId = req.user._id || req.user.id || req.user.userId;
    
    if (!userId) {
      return res.status(401).json({ 
        success: false, 
        message: 'User ID not found in token' 
      });
    }
    
    // Find user in database
    const user = await User.findById(userId);
    
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: 'User not found' 
      });
    }
    
    if (!user.isActive) {
      return res.status(404).json({ 
        success: false, 
        message: 'User account is inactive' 
      });
    }
    
    // Update user fields
    const allowedFields = ['fname', 'lname', 'phoneNumber', 'countryCode', 
                          'dateOfBirth', 'gender', 'address', 'profilePhoto'];
    allowedFields.forEach(field => {
      if (req.body[field] !== undefined) {
        user[field] = req.body[field];
      }
    });
    
    // Handle nested profile updates
    if (req.body.dateOfBirth || req.body.gender || req.body.address || req.body.profilePhoto) {
      if (!user.profile) {
        user.profile = {};
      }
      if (req.body.dateOfBirth) user.profile.dateOfBirth = req.body.dateOfBirth;
      if (req.body.gender) user.profile.gender = req.body.gender;
      if (req.body.address) user.profile.address = req.body.address;
      if (req.body.profilePhoto) user.profile.profilePhoto = req.body.profilePhoto;
    }
    
    await user.save();
    
    return res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      data: user
    });
  } catch (error) {
    console.error('Profile update error:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Error updating profile',
      error: error.message 
    });
  }
});
```

#### Option 2: Verify Authentication Middleware
Ensure the authentication middleware correctly populates `req.user`:
```javascript
// Authentication middleware should decode JWT and attach user to req
const authenticateUser = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({ message: 'No token provided' });
    }
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId || decoded._id || decoded.id);
    
    if (!user || !user.isActive) {
      return res.status(401).json({ message: 'Invalid or inactive user' });
    }
    
    req.user = user; // Attach user to request
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Invalid token' });
  }
};
```

### Testing Checklist
- [ ] Verify `PATCH /api/v1/users/profile` endpoint exists
- [ ] Verify authentication middleware extracts user ID from token
- [ ] Verify user lookup query uses correct field (`_id`, `id`, or `userId`)
- [ ] Verify user is found in database
- [ ] Verify user `isActive` status is checked
- [ ] Test with valid JWT token
- [ ] Test with expired JWT token
- [ ] Test with invalid JWT token
- [ ] Test with missing Authorization header

---

## 🔴 Critical Issue #2: Phone Number Not Persisted from Registration

### Problem Description
Phone numbers entered during user registration are not being saved to the user profile, or are not being returned when fetching the profile. Users see only the country code (defaulted to "+1") in the profile edit form, but not their actual phone number.

### Current Behavior
- **Registration:** User enters phone number during registration
- **Profile Fetch:** `GET /api/v1/users/profile` returns user data
- **Phone Number Field:** `phoneNumber` field is either missing, empty, or contains only country code
- **Profile Edit Form:** Shows only country code, not the full phone number

### Expected Behavior
- Phone number should be saved during registration
- Phone number should be returned in `GET /api/v1/users/profile` response
- Phone number should be in E.164 format (e.g., "+1234567890") or split into `phoneNumber` and `countryCode` fields

### Frontend Request During Registration
```http
POST /api/v1/auth/register HTTP/1.1
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "SecurePass123!",
  "fname": "John",
  "lname": "Doe",
  "phoneNumber": "+1234567890",
  "countryCode": "+1"
}
```

### Expected Profile Response
```json
{
  "success": true,
  "data": {
    "userId": "507f1f77bcf86cd799439011",
    "email": "user@example.com",
    "fname": "John",
    "lname": "Doe",
    "phoneNumber": "+1234567890",
    "countryCode": "+1",
    "profile": {
      "phone": "+1234567890"
    }
  }
}
```

### Possible Root Causes
1. **Registration Endpoint:** Phone number not being saved during registration
2. **Database Schema:** Phone number field may not be included in User model
3. **Response Mapping:** Phone number may be saved but not included in profile response
4. **Field Name Mismatch:** Backend may use different field name (`phone` vs `phoneNumber`)

### Recommended Backend Fixes

#### Fix 1: Verify Registration Endpoint Saves Phone Number
```javascript
// Registration endpoint should save phoneNumber
router.post('/auth/register', async (req, res) => {
  try {
    const { email, password, fname, lname, phoneNumber, countryCode } = req.body;
    
    const user = new User({
      email,
      password: hashedPassword,
      fname,
      lname,
      phoneNumber: phoneNumber || null, // Save phone number
      countryCode: countryCode || null,  // Save country code
      // ... other fields
    });
    
    await user.save();
    
    // Return user with phoneNumber in response
    return res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: {
        userId: user._id,
        email: user.email,
        fname: user.fname,
        lname: user.lname,
        phoneNumber: user.phoneNumber, // Include in response
        countryCode: user.countryCode,  // Include in response
      }
    });
  } catch (error) {
    // Handle error
  }
});
```

#### Fix 2: Verify Profile Endpoint Returns Phone Number
```javascript
// GET /users/profile should return phoneNumber
router.get('/users/profile', authenticateUser, async (req, res) => {
  try {
    const userId = req.user._id || req.user.id;
    const user = await User.findById(userId).select('-password');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    return res.status(200).json({
      success: true,
      data: {
        userId: user._id,
        email: user.email,
        fname: user.fname,
        lname: user.lname,
        phoneNumber: user.phoneNumber || null, // Ensure phoneNumber is included
        countryCode: user.countryCode || null,  // Ensure countryCode is included
        profile: user.profile || {},
        // ... other fields
      }
    });
  } catch (error) {
    // Handle error
  }
});
```

#### Fix 3: Verify Database Schema Includes Phone Number
```javascript
// User model should include phoneNumber field
const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  fname: { type: String, required: true },
  lname: { type: String, required: true },
  phoneNumber: { type: String, default: null }, // Ensure field exists
  countryCode: { type: String, default: null },  // Ensure field exists
  profile: {
    phone: { type: String, default: null }, // Also in nested profile
    // ... other profile fields
  },
  // ... other fields
});
```

### Testing Checklist
- [ ] Verify registration endpoint saves `phoneNumber` and `countryCode`
- [ ] Verify database schema includes `phoneNumber` and `countryCode` fields
- [ ] Verify profile endpoint returns `phoneNumber` and `countryCode`
- [ ] Test registration with phone number
- [ ] Test fetching profile after registration
- [ ] Verify phone number persists across sessions

---

## 🔴 Critical Issue #3: Profile Update Endpoint Missing or Incorrect

### Problem Description
The frontend expects an endpoint `PATCH /api/v1/users/profile` that allows authenticated users to update their own profile. However, based on the documentation review, the backend may only have:
- `PATCH /api/v1/users/:id` - Requires admin role
- `PATCH /api/v1/users/user/:id/profile-picture` - Only for profile picture

There appears to be **no endpoint for regular users to update their own profile**.

### Current Backend Endpoints (from documentation)
1. `PATCH /api/v1/users/:id` - Admin only, requires user ID in path
2. `PATCH /api/v1/users/user/:id/profile-picture` - Profile picture only
3. `GET /api/v1/users/profile` - ✅ Exists (for fetching profile)

### Missing Endpoint
- `PATCH /api/v1/users/profile` - ❌ Does not exist (for updating own profile)

### Required Endpoint Specification

#### Endpoint: `PATCH /api/v1/users/profile`
- **Method:** PATCH
- **Path:** `/api/v1/users/profile`
- **Authentication:** Required (Bearer token)
- **Authorization:** User can only update their own profile (extracted from token)
- **Request Body:** Partial user profile object
- **Response:** Updated user profile

#### Request Body Schema
```json
{
  "fname": "string (optional)",
  "lname": "string (optional)",
  "phoneNumber": "string (optional, E.164 format)",
  "countryCode": "string (optional)",
  "dateOfBirth": "string (optional, YYYY-MM-DD format)",
  "gender": "string (optional, enum: male|female|other|prefer_not_to_say)",
  "address": {
    "street": "string (optional)",
    "city": "string (optional)",
    "state": "string (optional)",
    "country": "string (optional)",
    "postalCode": "string (optional)"
  },
  "profilePhoto": "string (optional, URL)"
}
```

#### Response Schema (Success - 200)
```json
{
  "success": true,
  "message": "Profile updated successfully",
  "data": {
    "userId": "string",
    "email": "string",
    "fname": "string",
    "lname": "string",
    "phoneNumber": "string",
    "countryCode": "string",
    "profile": {
      "dateOfBirth": "string",
      "gender": "string",
      "address": {
        "street": "string",
        "city": "string",
        "state": "string",
        "country": "string",
        "postalCode": "string"
      },
      "profilePhoto": "string"
    },
    "updatedAt": "ISO 8601 datetime"
  }
}
```

#### Response Schema (Error - 404)
```json
{
  "success": false,
  "message": "User not found",
  "statusCode": 404
}
```

### Implementation Requirements
1. Extract user ID from JWT token (not from request body or path)
2. Verify user exists and is active
3. Update only allowed fields
4. Handle nested profile updates (dateOfBirth, gender, address, profilePhoto)
5. Return updated user profile
6. Support partial updates (only update fields that are provided)

---

## 🟡 Issue #4: Backend Connectivity and Sleep Mode (Render Free Tier)

### Problem Description
The backend is hosted on Render's free tier, which causes the server to "sleep" after periods of inactivity. This results in:
- Initial requests timing out or failing with "Failed to fetch" errors
- Users experiencing delays of 30-60 seconds on first request after inactivity
- CORS/Network errors appearing in console

### Current Behavior
- **First Request After Inactivity:** Takes 30-60 seconds to wake up server
- **Error Messages:** "Failed to fetch", "Network Error", "CORS Error"
- **User Experience:** Users see error messages and may think the app is broken

### Expected Behavior
- Backend should respond within 1-2 seconds
- No "Failed to fetch" errors for valid requests
- Clear messaging to users if server is waking up

### Recommended Backend Fixes

#### Option 1: Upgrade to Render Paid Tier
- **Cost:** ~$7/month for always-on instance
- **Benefit:** Server never sleeps, instant responses
- **Recommendation:** ⭐ **RECOMMENDED** for production

#### Option 2: Implement Health Check Endpoint
Create a lightweight health check endpoint that can be pinged periodically:
```javascript
// GET /api/v1/health
router.get('/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});
```

#### Option 3: Add Keep-Alive Service
Implement a service that pings the backend every 5-10 minutes to prevent sleep:
- Use a cron job service (e.g., cron-job.org, EasyCron)
- Ping `/api/v1/health` endpoint every 5 minutes
- **Note:** This is a workaround, not a permanent solution

### Frontend Workaround
The frontend has implemented a health check utility that:
- Detects when backend is unavailable
- Shows user-friendly error messages
- Provides troubleshooting tips for Render free tier

**Note:** This is a temporary UX improvement, not a fix for the underlying issue.

---

## 🟡 Issue #5: Backend Should Not Generate Random Avatars

### Problem Description
The frontend does NOT send avatar/profilePicture during registration, and expects the backend to set it to `null` or `undefined`. However, the backend might be generating random avatars automatically, which is not desired.

### Expected Behavior
- **During Registration:** Backend should set `profilePicture` field to `null` or `undefined` (not generate a random avatar)
- **After Registration:** Users must explicitly choose their own avatar via the profile edit page
- **No Default Avatars:** Backend should never generate or assign random avatars

### Frontend Behavior
- Frontend does NOT send `avatar` or `profilePicture` in registration payload
- Frontend shows user initials (first letter of name/email) when no avatar is set
- Frontend provides avatar selector component for users to choose their own avatar

### Recommended Backend Fix
Ensure registration endpoint does NOT generate random avatars:

```javascript
// Registration endpoint - DO NOT generate avatar
router.post('/auth/register', async (req, res) => {
  try {
    const { firstName, lastName, email, username, password, phoneNumber, countryCode } = req.body;
    
    const user = new User({
      firstName,
      lastName,
      email,
      username,
      password: hashedPassword,
      phoneNumber,
      countryCode,
      profilePicture: null, // ✅ Explicitly set to null - DO NOT generate random avatar
      // ... other fields
    });
    
    await user.save();
    
    // Return user WITHOUT avatar
    return res.status(201).json({
      success: true,
      data: {
        userId: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        profilePicture: null, // ✅ Return null, not a generated avatar
        // ... other fields
      }
    });
  } catch (error) {
    // Handle error
  }
});
```

### Testing Checklist
- [ ] Verify registration does NOT generate random avatars
- [ ] Verify `profilePicture` is `null` or `undefined` after registration
- [ ] Verify users can set their own avatar via profile update endpoint
- [ ] Test that profile update endpoint accepts `profilePicture` field

---

## 🟡 Additional Issues Found

### Issue #6: Inconsistent Field Naming
The backend uses different field names in different contexts:
- User model: `fname`, `lname`
- Profile nested: `firstName`, `lastName` (in some responses)
- Phone: `phoneNumber` vs `phone`

**Recommendation:** Standardize field naming across all endpoints and responses.

### Issue #7: Error Response Format Inconsistency
Some errors return `{ message: "..." }` while others return `{ success: false, message: "..." }`.

**Recommendation:** Standardize error response format:
```json
{
  "success": false,
  "message": "Error message",
  "statusCode": 404,
  "errors": {} // Optional: validation errors
}
```

### Issue #8: Missing User ID in Token
The frontend attempts to decode the JWT token to extract user ID, but the token structure may not include the user ID in expected fields (`userId`, `_id`, `id`, `sub`).

**Recommendation:** Ensure JWT token includes user ID in a consistent field name, and document which field name is used.

---

## 📋 Testing Requirements

### Test Case 1: Profile Update with Valid Token
1. Register a new user
2. Login to get JWT token
3. Call `PATCH /api/v1/users/profile` with token
4. **Expected:** Profile updates successfully, returns 200 with updated data

### Test Case 2: Profile Update with Invalid Token
1. Use an invalid/expired token
2. Call `PATCH /api/v1/users/profile`
3. **Expected:** Returns 401 Unauthorized

### Test Case 3: Profile Update with Missing Token
1. Call `PATCH /api/v1/users/profile` without Authorization header
2. **Expected:** Returns 401 Unauthorized

### Test Case 4: Phone Number Persistence
1. Register user with phone number "+1234567890"
2. Fetch profile using `GET /api/v1/users/profile`
3. **Expected:** Phone number is returned in response
4. Update profile with new phone number
5. Fetch profile again
6. **Expected:** Updated phone number is returned

### Test Case 5: Partial Profile Update
1. Update only `fname` field
2. **Expected:** Only `fname` is updated, other fields remain unchanged
3. Update only `address.city` field
4. **Expected:** Only `address.city` is updated, other address fields remain unchanged

---

## 🔧 Frontend Workarounds (Temporary)

The frontend has implemented the following workarounds while waiting for backend fixes:

1. **Multiple Endpoint Attempts:** Frontend tries `PATCH /users/profile`, then `PUT /users/profile`, then `PATCH /users/user/:id` as fallback
2. **Enhanced Error Logging:** Detailed error logging to help diagnose issues
3. **Token Validation:** Frontend validates token presence and attempts to decode user ID
4. **Phone Number Formatting:** Frontend handles phone number formatting and validation

**Note:** These workarounds are temporary and should be removed once backend issues are fixed.

---

## 📞 Contact Information

For questions or clarifications about these issues, please contact the frontend development team.

---

## ✅ Priority Actions Required

1. **🔴 HIGH PRIORITY:** Implement `PATCH /api/v1/users/profile` endpoint
2. **🔴 HIGH PRIORITY:** Fix phone number persistence during registration
3. **🔴 HIGH PRIORITY:** Verify authentication middleware correctly extracts user ID from token
4. **🟡 MEDIUM PRIORITY:** Upgrade Render hosting to paid tier (or implement keep-alive) to prevent sleep mode issues
5. **🟡 MEDIUM PRIORITY:** Ensure backend does NOT generate random avatars during registration (set to null)
6. **🟡 MEDIUM PRIORITY:** Standardize field naming conventions
7. **🟡 MEDIUM PRIORITY:** Standardize error response format
8. **🟢 LOW PRIORITY:** Document JWT token structure and user ID field name
9. **🟢 LOW PRIORITY:** Implement `/api/v1/health` endpoint for monitoring

---

**Document Version:** 1.0  
**Last Updated:** 2025-01-XX  
**Status:** Awaiting Backend Team Response

