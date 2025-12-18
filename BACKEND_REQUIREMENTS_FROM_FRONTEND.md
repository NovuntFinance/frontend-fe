# Backend Requirements from Frontend

## 📋 Overview

This document outlines what the backend **needs** from the frontend to ensure the Novunt Assistant feature works correctly. The backend is **production-ready** and waiting for frontend integration.

---

## ✅ What Backend Already Has (No Action Needed)

The backend team has already implemented:

- ✅ All API endpoints (`/api/assistant/chat`, `/api/assistant/support/escalate`, etc.)
- ✅ Authentication middleware (extracts user from token)
- ✅ Database schema (conversations, messages, tickets)
- ✅ AI service integration (DeepSeek R1 with knowledge base)
- ✅ Privacy protection (user data isolation)
- ✅ Error handling and validation
- ✅ Support ticket system

---

## 🔌 What Backend Needs from Frontend

### 1. **Authentication Token** ✅ CRITICAL

**Requirement**: Frontend MUST send valid authentication token in every request

**Implementation**:

```typescript
// In useNovuntAssistant.ts
const authToken = useAuthStore.getState().token;

const response = await fetch('/api/assistant/chat', {
  headers: {
    Authorization: `Bearer ${authToken}`, // REQUIRED
    'Content-Type': 'application/json',
  },
  // ...
});
```

**What Backend Does**:

- Extracts `userId` from token
- Validates token is valid and not expired
- Returns `401 Unauthorized` if token is missing/invalid

**Frontend Action**: ✅ Ensure token is always sent in Authorization header

---

### 2. **Request Body Format** ✅ REQUIRED

#### For Chat Endpoint (`POST /api/assistant/chat`)

**Required Fields**:

```json
{
  "message": "string (required, non-empty)"
}
```

**Optional Fields** (but recommended):

```json
{
  "conversationId": "string (optional, for conversation continuity)",
  "context": {
    "userId": "string (optional, backend extracts from token anyway)",
    "userName": "string (optional, helps with personalization)",
    "userRank": "string (optional, helps with personalized responses)",
    "userEmail": "string (optional)"
  }
}
```

**Note**:

- Backend **automatically extracts** `userId` from token, so you don't need to send it
- However, sending `userName` and `userRank` helps with **personalization**
- `conversationId` is optional but helps maintain conversation context

**Frontend Action**:

- ✅ Always send `message` field
- ✅ Optionally send `conversationId` for conversation continuity
- ✅ Optionally send `context` with `userName` and `userRank` for better personalization

---

#### For Support Escalation (`POST /api/assistant/support/escalate`)

**Required Fields**:

```json
{
  "subject": "string (required, non-empty)",
  "description": "string (required, min 10 characters)",
  "priority": "low" | "medium" | "high" | "urgent" (required),
  "category": "technical" | "account" | "billing" | "general" | "other" (required)
}
```

**Optional Fields**:

```json
{
  "conversationId": "string (optional, links ticket to conversation)",
  "attachments": [] // Optional: Array of file URLs or base64 strings
}
```

**Frontend Action**:

- ✅ Validate all required fields before submission
- ✅ Ensure `description` is at least 10 characters
- ✅ Send proper `priority` and `category` values

---

### 3. **Conversation ID Tracking** ⚠️ RECOMMENDED

**Requirement**: Track `conversationId` returned by backend and send it in subsequent messages

**Why It Matters**:

- Maintains conversation context
- Allows backend to retrieve conversation history
- Enables better AI responses with context

**Implementation**:

```typescript
// In useNovuntAssistant.ts
const [currentConversationId, setCurrentConversationId] = useState<string | null>(null);

// After receiving response from backend
const data = await response.json();
if (data.data.conversationId) {
  setCurrentConversationId(data.data.conversationId);
}

// In next request, include conversationId
body: JSON.stringify({
  message: userMessage,
  conversationId: currentConversationId || undefined, // Include if available
  context: context,
}),
```

**Frontend Action**:

- ⚠️ **Recommended**: Track and send `conversationId` for better context
- ✅ Not strictly required, but improves user experience

---

### 4. **Error Handling** ✅ REQUIRED

**Requirement**: Frontend MUST handle backend error responses correctly

**Backend Error Format**:

```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable error message",
    "details": {}
  }
}
```

**Common Error Codes**:

- `INVALID_REQUEST` (400) - Missing or invalid request fields
- `UNAUTHORIZED` (401) - Missing or invalid token
- `FORBIDDEN` (403) - User not authorized
- `RATE_LIMIT_EXCEEDED` (429) - Too many requests
- `AI_SERVICE_ERROR` (502) - AI service unavailable
- `INTERNAL_ERROR` (500) - Server error

**Frontend Action**:

- ✅ Check `response.ok` or `response.status`
- ✅ Parse error response: `await response.json()`
- ✅ Display user-friendly error messages
- ✅ Handle `401` by redirecting to login
- ✅ Handle `429` by showing rate limit message
- ✅ Handle `502` by suggesting escalation

---

### 5. **API Base URL Configuration** ✅ REQUIRED

**Requirement**: Frontend MUST configure correct API base URL

**Environment Variable**:

```env
# .env.local
NEXT_PUBLIC_API_URL=https://api.novunt.com
# Or for development:
# NEXT_PUBLIC_API_URL=http://localhost:5000
```

**Implementation**:

```typescript
const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || 'https://api.novunt.com';

const response = await fetch(`${API_BASE_URL}/api/assistant/chat`, {
  // ...
});
```

**Frontend Action**:

- ✅ Set `NEXT_PUBLIC_API_URL` in `.env.local`
- ✅ Use environment variable in API calls
- ✅ Don't hardcode URLs

---

### 6. **User Context Data** ⚠️ RECOMMENDED

**Requirement**: Send user context for better personalization

**What Backend Can Extract from Token**:

- ✅ `userId` (automatic)
- ✅ Basic user info (automatic)

**What Frontend Should Send** (for better personalization):

- ⚠️ `userName` - For personalized greetings ("Hello John!")
- ⚠️ `userRank` - For rank-specific guidance ("You're currently at Investor rank...")
- ⚠️ `userEmail` - Optional, backend can get from token

**Note**:

- Backend **doesn't require** this, but it improves personalization
- Backend can fetch this from database, but sending it saves a database query

**Frontend Action**:

- ⚠️ **Recommended**: Send `userName` and `userRank` in context
- ✅ Not required, but improves user experience

---

### 7. **Request Validation** ✅ REQUIRED

**Requirement**: Frontend MUST validate data before sending to backend

**Chat Endpoint Validation**:

- ✅ `message` must not be empty
- ✅ `message` should be trimmed
- ✅ `message` should have reasonable length (e.g., max 2000 characters)

**Support Escalation Validation**:

- ✅ `subject` must not be empty
- ✅ `description` must be at least 10 characters
- ✅ `priority` must be one of: `low`, `medium`, `high`, `urgent`
- ✅ `category` must be one of: `technical`, `account`, `billing`, `general`, `other`

**Frontend Action**:

- ✅ Validate all fields before API call
- ✅ Show validation errors to user
- ✅ Prevent invalid requests from being sent

---

### 8. **Response Handling** ✅ REQUIRED

**Requirement**: Frontend MUST handle backend response format correctly

**Success Response Format**:

```json
{
  "success": true,
  "data": {
    "message": "...",
    "conversationId": "...",
    "suggestions": [...],
    "requiresEscalation": false
  }
}
```

**Frontend Action**:

- ✅ Check `response.success === true`
- ✅ Access data via `response.data`
- ✅ Handle `suggestions` array (display as quick reply buttons)
- ✅ Handle `requiresEscalation` flag (show escalation prompt)
- ✅ Store `conversationId` for next request

---

### 9. **Loading States** ⚠️ RECOMMENDED

**Requirement**: Show loading indicators during API calls

**Why It Matters**:

- AI responses can take 1-3 seconds
- Users need feedback that request is processing
- Prevents duplicate submissions

**Frontend Action**:

- ⚠️ **Recommended**: Show loading spinner/indicator
- ⚠️ **Recommended**: Disable send button while loading
- ✅ Already implemented in current frontend code

---

### 10. **Rate Limiting Awareness** ⚠️ RECOMMENDED

**Requirement**: Handle rate limiting gracefully

**Backend Behavior**:

- Backend has rate limiting configured
- Returns `429 Too Many Requests` when limit exceeded
- Includes retry-after information in response

**Frontend Action**:

- ⚠️ **Recommended**: Handle `429` errors gracefully
- ⚠️ **Recommended**: Show rate limit message to user
- ⚠️ **Recommended**: Implement request throttling on frontend
- ✅ Not required, but improves UX

---

## 📊 Summary: Required vs Recommended

### ✅ **REQUIRED** (Must Implement)

1. ✅ **Authentication Token** - Send in every request
2. ✅ **Request Body Format** - Send correct fields
3. ✅ **Error Handling** - Handle all error responses
4. ✅ **API Base URL** - Configure environment variable
5. ✅ **Request Validation** - Validate before sending
6. ✅ **Response Handling** - Parse response correctly

### ⚠️ **RECOMMENDED** (Improves UX)

1. ⚠️ **Conversation ID Tracking** - Better context
2. ⚠️ **User Context Data** - Better personalization
3. ⚠️ **Loading States** - Better feedback
4. ⚠️ **Rate Limiting Awareness** - Better error handling

---

## 🔍 Backend Expectations Summary

### What Backend Expects:

1. **Valid Authentication Token**
   - In `Authorization: Bearer <token>` header
   - Token must be valid and not expired
   - Backend extracts `userId` from token automatically

2. **Correct Request Format**
   - JSON body with required fields
   - Proper content-type header
   - Valid field values

3. **Proper Error Handling**
   - Frontend handles errors gracefully
   - Shows user-friendly messages
   - Doesn't crash on errors

4. **Response Parsing**
   - Checks `success` field
   - Accesses `data` field correctly
   - Handles optional fields (`suggestions`, `conversationId`)

### What Backend Provides:

1. ✅ **User Context Extraction** - Gets user info from token
2. ✅ **Privacy Protection** - Ensures users only access their data
3. ✅ **Comprehensive Responses** - Uses 15,000+ word knowledge base
4. ✅ **Error Messages** - Clear, actionable error responses
5. ✅ **Conversation Tracking** - Maintains conversation history
6. ✅ **Support Tickets** - Creates and tracks support requests

---

## 🚀 Quick Integration Checklist

Use this checklist to ensure everything is ready:

- [ ] ✅ Authentication token is sent in all requests
- [ ] ✅ API base URL is configured in `.env.local`
- [ ] ✅ Request body includes required fields (`message`, `subject`, `description`, etc.)
- [ ] ✅ Request validation is implemented (check empty fields, length, etc.)
- [ ] ✅ Error handling is implemented (check `response.ok`, parse errors)
- [ ] ✅ Response parsing is correct (check `success`, access `data`)
- [ ] ⚠️ Conversation ID tracking (optional but recommended)
- [ ] ⚠️ User context sent (optional but recommended)
- [ ] ⚠️ Loading states shown (optional but recommended)
- [ ] ⚠️ Rate limiting handled (optional but recommended)

---

## 📞 Questions?

If you have questions about what the backend needs:

1. **Check API Documentation**: See `NOVUNT_ASSISTANT_BACKEND_INTEGRATION.md`
2. **Review Backend Docs**: See `BACKEND_READY_FOR_FRONTEND.md`
3. **Test Endpoints**: Use Postman/curl to test backend directly
4. **Check Error Responses**: Backend provides detailed error messages

---

**Document Version**: 1.0  
**Last Updated**: January 2025  
**Status**: Backend Ready ✅ | Frontend Integration Pending ⏳
