# 🚨 Login Loop - Action Items by Team

**Issue**: Continuous login reload loop on novunt.com  
**Priority**: P0 - Critical  
**Status**: Root cause identified, fixes ready to implement

---

## 👨‍💻 Frontend Team Actions

### Immediate (< 1 hour)

#### 1. Apply Emergency Fix
**File**: [`src/lib/api.ts:435-450`](src/lib/api.ts#L435-L450)

```typescript
// Comment out the clearAuth() and redirect logic
// Replace with error logging only
console.error('⚠️ [API] 401 detected but NOT clearing auth (emergency fix active)');
return Promise.reject(refreshError);
```

**Purpose**: Stops the infinite loop immediately.  
**Trade-off**: Dashboard may show errors, but login works.

See: [QUICK_FIX_LOGIN_LOOP.md](QUICK_FIX_LOGIN_LOOP.md)

---

#### 2. Add Debug Logging
**File**: [`src/lib/api.ts:310`](src/lib/api.ts#L310)

Add before 401 handler:
```typescript
console.error('🚨 [API] ERROR:', {
  status: error.response?.status,
  url: error.config?.url,
  hasAuth: !!error.config?.headers?.Authorization,
  responseData: error.response?.data,
});
```

**Purpose**: Identify which API call returns 401 first.

---

#### 3. Gather Data

Open DevTools and login:
- Screenshot Network tab
- Copy console logs
- Note which endpoint returns 401
- Check if `Authorization` header is present

Share findings in GitHub issue.

---

### Short-term (Today)

#### 4. Remove Duplicate Redirects
**File**: [`src/app/(auth)/login/page.tsx:237-255`](src/app/(auth)/login/page.tsx#L237-L255)

Delete the `checkAuthAndRedirect` recursive polling function.  
Keep only the initial redirect in onSubmit handler.

**Why**: Reduces race conditions and conflicting redirect attempts.

---

#### 5. Add Retry Logic with Backoff
**File**: [`src/lib/api.ts:310-450`](src/lib/api.ts#L310-L450)

```typescript
const retryAttempts = new Map();
const MAX_RETRIES = 2;

// Only clear auth after 2+ consecutive 401s
if (attempts >= MAX_RETRIES) {
  clearAuth(); // Now it's safe
}
```

**Why**: One 401 might be transient - don't immediately logout.

---

#### 6. Improve Dashboard Error Handling
**File**: [`src/app/(dashboard)/dashboard/page.tsx`](src/app/(dashboard)/dashboard/page.tsx)

Add error boundaries and fallback UI:
```typescript
if (error) {
  return <ErrorCard message="Unable to load data" onRetry={refetch} />;
}
```

**Why**: Show user-friendly errors instead of blank page.

---

### Medium-term (This Week)

#### 7. Implement Circuit Breaker
**File**: `src/lib/circuitBreaker.ts`

Stop retrying after N failures to prevent backend hammering.

See: [CRITICAL_LOGIN_RELOAD_LOOP_ANALYSIS.md](CRITICAL_LOGIN_RELOAD_LOOP_ANALYSIS.md#solution-3-add-circuit-breaker-for-failed-queries)

---

#### 8. Add Health Check Before Login
**File**: [`src/app/(auth)/login/page.tsx`](src/app/(auth)/login/page.tsx)

Already exists at line 54! Just needs better UI:
```typescript
if (backendStatus && !backendStatus.healthy) {
  // Show prominent warning
  return <BackendDownAlert />;
}
```

---

#### 9. Add Comprehensive Tests

Test scenarios:
- ✅ Successful login → dashboard loads
- ✅ 401 from one dashboard endpoint → show error, don't logout
- ✅ Backend down → show error message
- ✅ Token expires → graceful refresh
- ✅ Page refresh → maintains session

---

## 🖥️ Backend Team Actions

### Critical (< 1 hour)

#### 1. Check Why Dashboard Endpoints Return 401

**Test these endpoints with fresh login token**:

```bash
# Get token from frontend
const token = localStorage.getItem('accessToken');

# Test each endpoint
curl -H "Authorization: Bearer {token}" \
     https://api.novunt.com/api/v1/wallet/balance

curl -H "Authorization: Bearer {token}" \
     https://api.novunt.com/api/v1/dashboard/overview

curl -H "Authorization: Bearer {token}" \
     https://api.novunt.com/api/v1/stakes/active
```

**Expected**: 200 OK  
**If 401**: Log why (expired? invalid? malformed?)

---

#### 2. Verify CORS Configuration

```javascript
app.use(cors({
  origin: process.env.FRONTEND_URL, // Must be https://novunt.com
  credentials: true, // REQUIRED for cookies/auth headers
  allowedHeaders: ['Content-Type', 'Authorization'],
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
}));
```

**Test**: Check OPTIONS preflight response includes:
```
Access-Control-Allow-Credentials: true
Access-Control-Allow-Origin: https://novunt.com
```

---

#### 3. Add Logging for Auth Failures

```javascript
// In auth middleware
if (!isValidToken(token)) {
  console.error('[Auth] Token validation failed:', {
    reason: 'expired/invalid/expired',
    tokenPreview: token.substring(0, 20) + '...',
    endpoint: req.url,
    userId: decoded?.userId || 'none',
  });
  
  return res.status(401).json({
    success: false,
    message: 'Token validation failed',
    code: 'INVALID_TOKEN',
    debug: { reason: 'Token expired' }, // Help frontend debug
  });
}
```

---

### Short-term (Today)

#### 4. Implement/Fix Token Refresh Endpoint

**Must exist and work**:
- `POST /better-auth/refresh-token`
- OR `POST /auth/refresh`

```javascript
router.post('/better-auth/refresh-token', async (req, res) => {
  const { refreshToken } = req.body;
  
  try {
    const decoded = jwt.verify(refreshToken, JWT_SECRET);
    
    const newAccessToken = jwt.sign(
      { userId: decoded.userId, email: decoded.email },
      JWT_SECRET,
      { expiresIn: '1h' }
    );
    
    res.json({
      success: true,
      data: {
        accessToken: newAccessToken,
        refreshToken: refreshToken,
      },
    });
  } catch (error) {
    console.error('[Auth] Refresh token invalid:', error.message);
    res.status(401).json({
      success: false,
      message: 'Invalid refresh token',
      code: 'INVALID_REFRESH_TOKEN',
    });
  }
});
```

**Test**:
```bash
curl -X POST https://api.novunt.com/api/v1/better-auth/refresh-token \
     -H "Content-Type: application/json" \
     -d '{"refreshToken": "..."}'
```

---

#### 5. Check Token Expiry Time

```javascript
// Generate token
const token = jwt.sign(payload, JWT_SECRET, {
  expiresIn: '1h', // Should be reasonable (not too short)
});
```

**Recommended**: 1 hour for access token, 7 days for refresh token.

**Too short**: Will cause frequent 401s  
**Too long**: Security risk

---

#### 6. Verify All Dashboard Endpoints Exist

**Required endpoints**:
- ✅ `GET /wallet/balance`
- ✅ `GET /dashboard/overview`
- ✅ `GET /stakes/active`
- ✅ `GET /staking/streak`
- ✅ `GET /transactions` (with pagination)
- ✅ `GET /users/profile`

**Check**:
```bash
# Should NOT return 404
curl https://api.novunt.com/api/v1/wallet/balance
# Should return 401 (no auth) not 404
```

---

### Medium-term (This Week)

#### 7. Improve Error Responses

Return structured errors:
```json
{
  "success": false,
  "message": "Token has expired",
  "code": "TOKEN_EXPIRED",
  "debug": {
    "reason": "Token expired at 2026-02-15T10:30:00Z",
    "currentTime": "2026-02-15T10:35:00Z"
  }
}
```

**Don't** just return:
```json
{
  "error": "Unauthorized"
}
```

---

#### 8. Add Health Check Endpoint

```javascript
router.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    version: process.env.VERSION || '1.0.0',
  });
});
```

Frontend already checks this before login!

---

#### 9. Add Rate Limiting for Login

Prevent brute force (if loop causes spam):
```javascript
const rateLimit = require('express-rate-limit');

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 requests per window
  message: 'Too many login attempts, please try again later',
});

router.post('/login', loginLimiter, loginHandler);
```

---

## 🔄 Coordination Needed

### Both Teams: Verify Token Format

**Frontend sends**:
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Backend expects**: Same format ✅

**Check**:
1. Frontend: Log token being sent (first 30 chars)
2. Backend: Log token being received (first 30 chars)
3. **They must match**

---

### Both Teams: Verify API Base URL

**Frontend** (`src/lib/api.ts:22`):
```typescript
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;
// Should be: https://api.novunt.com/api/v1
```

**Backend**:
```javascript
app.use('/api/v1', routes);
// Must serve at: https://api.novunt.com/api/v1
```

**Test**: Ping an endpoint from frontend console:
```javascript
fetch(process.env.NEXT_PUBLIC_API_URL + '/health')
  .then(r => r.json())
  .then(console.log);
```

---

## 📊 Success Metrics

After fixes are applied:

✅ **Login success rate**: 100% (currently 0%)  
✅ **Average redirects per login**: 1 (currently infinite)  
✅ **Dashboard load time**: < 2s  
✅ **401 errors after login**: 0  
✅ **Console errors**: 0 (excluding warnings)

---

## 📞 Communication

### Daily Standup Updates

**Frontend**: "Emergency fix applied, loop stopped. Gathering data on which endpoint returns 401."

**Backend**: "Verified CORS config, checking token validation on dashboard endpoints."

---

### When to Escalate

If after 24 hours:
- Frontend applied emergency fix but dashboard still broken
- Backend can't identify why 401s are happening
- Token format mismatch can't be resolved

→ Schedule cross-team debug session with screen sharing

---

## 📚 Reference Documents

1. [CRITICAL_LOGIN_RELOAD_LOOP_ANALYSIS.md](CRITICAL_LOGIN_RELOAD_LOOP_ANALYSIS.md) - Full technical analysis
2. [QUICK_FIX_LOGIN_LOOP.md](QUICK_FIX_LOGIN_LOOP.md) - 5-minute emergency patch
3. [docs/TOKEN_MIGRATION_HTTPONLY_COOKIES.md](docs/TOKEN_MIGRATION_HTTPONLY_COOKIES.md) - Long-term auth strategy

---

**Created**: February 15, 2026  
**Last Updated**: February 15, 2026  
**Status**: Action items assigned, fixes in progress
