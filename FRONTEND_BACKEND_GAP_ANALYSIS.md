# Frontend-Backend Gap Analysis: Novunt Assistant

## 📋 Overview

This document identifies what the frontend has implemented/expects that may not be fully provided by the backend, or features that need clarification.

---

## ✅ Confirmed: Backend Provides These

### 1. Chat API Response Fields ✅

**Frontend Expects:**

- `message` (string) - AI response text
- `suggestions` (string[]) - Optional follow-up question suggestions
- `requiresEscalation` (boolean) - Flag indicating if human support needed
- `escalationReason` (string) - Reason for escalation (if required)
- `conversationId` (string) - ID for conversation tracking

**Backend Status:** ✅ **PROVIDED** (according to backend docs)

**Action Required:** None - Backend confirms these fields are returned.

---

### 2. Support Escalation Response ✅

**Frontend Expects:**

- `ticketId` (string) - Format: `TKT-YYYY-XXXXXX`
- `status` (string) - Ticket status
- `estimatedResponseTime` (string) - "24 hours"
- `message` (string) - Success message

**Backend Status:** ✅ **PROVIDED** (according to backend docs)

**Action Required:** None - Backend confirms these fields are returned.

---

## ⚠️ Potential Gaps or Clarifications Needed

### 1. Suggestions Array in Chat Response ⚠️

**Frontend Implementation:**

- Frontend has UI ready to display suggestions as clickable buttons/chips
- Currently using mock suggestions in development
- `AssistantResponse` type includes `suggestions?: string[]`

**Backend Status:** ⚠️ **NEEDS CONFIRMATION**

**Question for Backend:**

- Does the backend AI service return `suggestions` array in every response?
- Or only for specific types of queries?
- What's the expected format? (array of strings)

**Frontend Code Location:**

- `src/types/assistant.ts` - Type definition includes `suggestions?: string[]`
- `src/hooks/useNovuntAssistant.ts` - Mock responses include suggestions
- `src/components/assistant/NovuntAssistant.tsx` - UI ready but not yet displaying suggestions

**Recommendation:**

- Backend should confirm if suggestions are always included or conditional
- If conditional, specify when suggestions are provided
- Frontend can handle both cases (with/without suggestions)

---

### 2. Conversation ID Tracking ⚠️

**Frontend Implementation:**

- Frontend sends `conversationId` as optional in request
- Frontend expects `conversationId` in response
- Frontend can track conversation ID for context continuity

**Backend Status:** ⚠️ **NEEDS CLARIFICATION**

**Questions for Backend:**

- Does backend create new conversation ID on first message?
- Does backend use provided `conversationId` to continue existing conversation?
- What's the conversation ID format? (e.g., `conv-123456`, UUID, etc.)
- Should frontend store conversation ID in localStorage for persistence?

**Frontend Code Location:**

- `src/hooks/useNovuntAssistant.ts` - Currently not tracking conversationId
- Integration guide shows `conversationId` as optional in request

**Recommendation:**

- Backend should clarify conversation ID handling
- Frontend should implement conversation ID tracking if backend supports it
- Consider localStorage persistence for conversation continuity

---

### 3. Support Escalation - Conversation ID Link ⚠️

**Frontend Implementation:**

- Support escalation form can optionally include `conversationId`
- This links the ticket to the chat conversation

**Backend Status:** ⚠️ **NEEDS CONFIRMATION**

**Question for Backend:**

- Does backend store `conversationId` with support tickets?
- Can support team view the conversation context when handling tickets?
- Is this field optional or required?

**Frontend Code Location:**

- `src/components/assistant/SupportEscalationForm.tsx` - Form includes conversationId in request
- Integration guide shows it as optional

**Recommendation:**

- Backend should confirm if conversationId is stored with tickets
- If yes, frontend should always include it when escalating from chat
- If no, frontend can remove it or backend can ignore it

---

### 4. Error Response Format ⚠️

**Frontend Implementation:**

- Frontend expects error format:

```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable message",
    "details": {}
  }
}
```

**Backend Status:** ⚠️ **NEEDS VERIFICATION**

**Question for Backend:**

- Does backend return errors in this exact format?
- Are all error codes documented?
- Does `details` object contain field-specific validation errors?

**Frontend Code Location:**

- `src/hooks/useNovuntAssistant.ts` - Error handling expects this format
- `src/components/assistant/SupportEscalationForm.tsx` - Error handling expects this format

**Recommendation:**

- Backend should confirm error response format matches frontend expectations
- Provide list of all possible error codes
- Frontend can handle both this format and variations

---

### 5. Metadata in Chat Response ⚠️

**Frontend Implementation:**

- Integration guide shows optional `metadata` object:

```json
{
  "metadata": {
    "responseTime": 1.2,
    "model": "gpt-4",
    "tokensUsed": 150
  }
}
```

**Backend Status:** ⚠️ **NOT IMPLEMENTED IN FRONTEND**

**Current Status:**

- Frontend doesn't use metadata (not in `AssistantResponse` type)
- Integration guide mentions it but frontend doesn't consume it

**Recommendation:**

- **Low Priority** - Frontend doesn't need this for MVP
- Can be added later for analytics/debugging
- Backend can include it, frontend will ignore it for now

---

### 6. Conversation History Endpoints ⚠️

**Frontend Implementation:**

- Integration guide documents conversation history endpoints
- Frontend types support it but UI not implemented

**Backend Status:** ✅ **PROVIDED** (according to backend docs)

**Frontend Status:** ⚠️ **NOT IMPLEMENTED**

**Endpoints:**

- `GET /api/assistant/conversations` - List conversations
- `GET /api/assistant/conversations/:id/messages` - Get messages

**Recommendation:**

- **Future Enhancement** - Not required for MVP
- Frontend can implement this later
- Backend is ready, frontend just needs to build UI

---

### 7. Ticket Status Endpoint ⚠️

**Frontend Implementation:**

- Integration guide documents ticket status endpoint
- Frontend doesn't currently check ticket status after creation

**Backend Status:** ✅ **PROVIDED** (according to backend docs)

**Frontend Status:** ⚠️ **NOT IMPLEMENTED**

**Endpoint:**

- `GET /api/assistant/support/tickets/:ticketId` - Get ticket status

**Recommendation:**

- **Future Enhancement** - Not required for MVP
- Frontend can add ticket status checking later
- Backend is ready, frontend just needs to implement UI

---

### 8. Attachments in Support Escalation ⚠️

**Frontend Implementation:**

- `SupportEscalationRequest` type includes `attachments?: File[]`
- Frontend form doesn't have file upload UI

**Backend Status:** ⚠️ **NEEDS CLARIFICATION**

**Question for Backend:**

- Does backend support file attachments?
- What's the expected format? (base64, multipart/form-data, URLs?)
- What's the max file size?
- What file types are allowed?

**Frontend Code Location:**

- `src/types/assistant.ts` - Type includes attachments
- `src/components/assistant/SupportEscalationForm.tsx` - No file upload UI

**Recommendation:**

- **Future Enhancement** - Not required for MVP
- Backend should clarify attachment support
- Frontend can add file upload UI later if backend supports it

---

### 9. Response Formatting (Markdown) ⚠️

**Frontend Implementation:**

- Frontend has basic markdown formatting:
  - Bold text: `**text**` → `<strong>text</strong>`
  - Numbered lists: `1. item` → formatted list
- Frontend expects AI responses to use markdown

**Backend Status:** ⚠️ **NEEDS CONFIRMATION**

**Question for Backend:**

- Does the AI service return markdown-formatted text?
- What markdown features are used? (bold, lists, links, code blocks?)
- Should backend ensure consistent markdown formatting?

**Frontend Code Location:**

- `src/components/assistant/NovuntAssistant.tsx` - `formatMessage()` function

**Recommendation:**

- Backend should confirm markdown usage
- Frontend can enhance formatting if needed
- Consider supporting more markdown features (links, code blocks, etc.)

---

### 10. Rate Limiting & Error Handling ⚠️

**Frontend Implementation:**

- Frontend handles errors gracefully
- Shows user-friendly error messages
- Provides retry options

**Backend Status:** ⚠️ **NEEDS VERIFICATION**

**Questions for Backend:**

- What's the rate limit for chat requests? (requests per minute/hour?)
- What error code is returned on rate limit? (`RATE_LIMIT_EXCEEDED`?)
- Does error response include retry-after header?
- Are there different rate limits for different endpoints?

**Frontend Code Location:**

- `src/hooks/useNovuntAssistant.ts` - Error handling
- `src/components/assistant/NovuntAssistant.tsx` - Error display

**Recommendation:**

- Backend should document rate limits
- Frontend should handle rate limit errors gracefully
- Consider showing rate limit info to users

---

## 📊 Summary

### ✅ Fully Supported (No Action Needed)

1. Chat API basic response (`message` field)
2. Support escalation ticket creation
3. Authentication and authorization
4. Privacy protection

### ⚠️ Needs Clarification/Confirmation

1. **Suggestions array** - Does backend always return suggestions?
2. **Conversation ID tracking** - How does backend handle conversation continuity?
3. **Error response format** - Does it match frontend expectations exactly?
4. **Markdown formatting** - What markdown features does AI use?
5. **Rate limiting** - What are the limits and error codes?

### 🔮 Future Enhancements (Not Required for MVP)

1. Conversation history UI
2. Ticket status checking UI
3. File attachments in support tickets
4. Metadata display (response time, tokens, etc.)

---

## 🎯 Recommended Next Steps

### For Backend Team:

1. **Confirm suggestions array**: Always included or conditional?
2. **Clarify conversation ID**: How is it generated and used?
3. **Verify error format**: Does it match frontend expectations?
4. **Document rate limits**: What are the limits and error codes?
5. **Confirm markdown**: What formatting does AI use?

### For Frontend Team:

1. **Implement API integration**: Connect to real backend endpoints
2. **Add conversation ID tracking**: Store and send conversationId
3. **Enhance error handling**: Handle rate limits and specific error codes
4. **Test with backend**: Verify all response formats match
5. **Future**: Add conversation history and ticket status UI

---

## 📝 Notes

- Most gaps are **clarifications** rather than missing features
- Backend appears to have implemented all core features
- Frontend is ready to integrate but needs confirmation on some details
- Future enhancements can be added incrementally

---

**Document Version**: 1.0  
**Last Updated**: January 2025  
**Status**: Ready for backend review and clarification
