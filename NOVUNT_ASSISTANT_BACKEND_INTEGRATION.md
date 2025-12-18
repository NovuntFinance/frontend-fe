# Novunt Assistant - Backend Integration Guide

## 📋 Table of Contents

1. [Overview](#overview)
2. [Frontend Implementation Summary](#frontend-implementation-summary)
3. [API Endpoints Required](#api-endpoints-required)
4. [Request/Response Specifications](#requestresponse-specifications)
5. [Authentication & Authorization](#authentication--authorization)
6. [Data Privacy & Security](#data-privacy--security)
7. [Support Escalation System](#support-escalation-system)
8. [Real-time Features (Optional)](#real-time-features-optional)
9. [Error Handling](#error-handling)
10. [Testing Guidelines](#testing-guidelines)
11. [Integration Steps](#integration-steps)

---

## 🎯 Overview

The **Novunt Assistant** is an AI-powered chat interface designed to serve as the single "Source of Truth" for the Novunt platform. It provides users with:

- **Personalized assistance** using user context (name, rank, account status)
- **Platform guidance** on how Novunt works, staking, ranks, teams, pools
- **Account information** queries (with privacy restrictions)
- **Growth and success guidance** tailored to user's current status
- **Human support escalation** for complex issues

### Key Design Principles

1. **Warm & Human-Centered**: Responses should feel empathetic, respectful, and natural—not robotic
2. **Privacy-First**: Users can ONLY access their own account data
3. **Context-Aware**: Uses available user information for personalized responses
4. **Premium Experience**: Feels like a high-quality customer support channel

---

## 🎨 Frontend Implementation Summary

### Components Created

#### 1. **NovuntAssistant Component** (`src/components/assistant/NovuntAssistant.tsx`)

- **Purpose**: Main chat UI interface
- **Features**:
  - Chat window with glassmorphism design
  - Message bubbles (user/assistant)
  - Loading states and error handling
  - Auto-scroll to latest messages
  - Support escalation button
  - Responsive design (mobile-friendly)
  - Keyboard shortcuts (Enter to send)

#### 2. **SupportEscalationForm Component** (`src/components/assistant/SupportEscalationForm.tsx`)

- **Purpose**: Form for escalating complex issues to human support
- **Fields**:
  - Category (Technical, Account, Billing, General, Other)
  - Priority (Low, Medium, High, Urgent)
  - Subject (required)
  - Description (required)
- **Features**:
  - Form validation
  - Success confirmation
  - 24-hour response guarantee messaging

#### 3. **useNovuntAssistant Hook** (`src/hooks/useNovuntAssistant.ts`)

- **Purpose**: Manages chat state and AI interactions
- **Current Implementation**: Mock responses for development
- **Ready for**: Backend API integration

#### 4. **Type Definitions** (`src/types/assistant.ts`)

- Complete TypeScript types for all assistant-related data structures

### Integration Points

- **Navigation**: Integrated with `HorizontalNav` component (chat icon)
- **Layout**: Added to dashboard layout via `NovuntAssistantWrapper`
- **User Context**: Uses `useUser` hook to get user information
- **Event System**: Uses custom events (`openNovuntAssistant`) for opening

---

## 🔌 API Endpoints Required

### 1. Chat Message Endpoint

**Endpoint**: `POST /api/assistant/chat`

**Purpose**: Send user message and receive AI assistant response

**Authentication**: Required (Bearer token)

**Request Body**:

```json
{
  "message": "How does staking work?",
  "conversationId": "optional-conversation-id-for-context",
  "context": {
    "userId": "user-id",
    "userName": "John Doe",
    "userRank": "Investor",
    "accountBalance": 5000.0,
    "stakingCount": 3,
    "referralCount": 12
  }
}
```

**Response (Success - 200)**:

```json
{
  "success": true,
  "data": {
    "message": "Staking is the core of Novunt! Here's what you need to know...",
    "conversationId": "conv-123456",
    "suggestions": [
      "What stake amounts are available?",
      "How are returns calculated?",
      "What is ROS?"
    ],
    "requiresEscalation": false,
    "metadata": {
      "responseTime": 1.2,
      "model": "gpt-4",
      "tokensUsed": 150
    }
  }
}
```

**Response (Requires Escalation - 200)**:

```json
{
  "success": true,
  "data": {
    "message": "I understand your concern. This requires human support...",
    "conversationId": "conv-123456",
    "requiresEscalation": true,
    "escalationReason": "Complex account issue requiring manual review",
    "suggestions": ["Submit a support ticket", "Contact support directly"]
  }
}
```

**Response (Error - 400/500)**:

```json
{
  "success": false,
  "error": {
    "code": "INVALID_REQUEST",
    "message": "Message cannot be empty",
    "details": {}
  }
}
```

---

### 2. Support Escalation Endpoint

**Endpoint**: `POST /api/assistant/support/escalate`

**Purpose**: Submit support escalation request

**Authentication**: Required (Bearer token)

**Request Body**:

```json
{
  "subject": "Unable to withdraw funds",
  "description": "I've been trying to withdraw but keep getting an error...",
  "priority": "high",
  "category": "account",
  "conversationId": "optional-conversation-id",
  "attachments": [] // Optional: Array of file URLs or base64 strings
}
```

**Response (Success - 201)**:

```json
{
  "success": true,
  "data": {
    "ticketId": "TKT-2024-001234",
    "status": "submitted",
    "estimatedResponseTime": "24 hours",
    "message": "Your support request has been submitted successfully. Ticket ID: TKT-2024-001234"
  }
}
```

**Response (Error - 400)**:

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Subject and description are required",
    "details": {
      "subject": "Subject cannot be empty",
      "description": "Description must be at least 10 characters"
    }
  }
}
```

---

### 3. Conversation History Endpoint (Optional)

**Endpoint**: `GET /api/assistant/conversations`

**Purpose**: Retrieve user's conversation history

**Authentication**: Required (Bearer token)

**Query Parameters**:

- `limit` (optional, default: 50): Number of conversations to return
- `offset` (optional, default: 0): Pagination offset
- `conversationId` (optional): Get specific conversation

**Response (Success - 200)**:

```json
{
  "success": true,
  "data": {
    "conversations": [
      {
        "id": "conv-123456",
        "createdAt": "2024-12-14T10:30:00Z",
        "updatedAt": "2024-12-14T10:35:00Z",
        "messageCount": 6,
        "lastMessage": "How do I check my rank progress?"
      }
    ],
    "total": 5,
    "limit": 50,
    "offset": 0
  }
}
```

---

### 4. Conversation Messages Endpoint (Optional)

**Endpoint**: `GET /api/assistant/conversations/:conversationId/messages`

**Purpose**: Get messages for a specific conversation

**Authentication**: Required (Bearer token)

**Response (Success - 200)**:

```json
{
  "success": true,
  "data": {
    "conversationId": "conv-123456",
    "messages": [
      {
        "id": "msg-001",
        "role": "user",
        "content": "How does staking work?",
        "timestamp": "2024-12-14T10:30:00Z"
      },
      {
        "id": "msg-002",
        "role": "assistant",
        "content": "Staking is the core of Novunt!...",
        "timestamp": "2024-12-14T10:30:05Z"
      }
    ],
    "total": 2
  }
}
```

---

## 🔐 Authentication & Authorization

### Authentication Method

- **Bearer Token**: Include `Authorization: Bearer <token>` header
- Token should be obtained from existing auth system

### Authorization Rules

1. **User Context Access**:
   - Users can ONLY access their own account data
   - Backend MUST verify `userId` from token matches requested user
   - Return 403 Forbidden if user tries to access another user's data

2. **Account Information Queries**:
   - For security, assistant should provide **general guidance** only
   - Specific account balances, transaction details should NOT be exposed in chat
   - Direct users to appropriate pages (Wallet, Stakes, etc.) for detailed info

3. **Support Escalation**:
   - All users can create support tickets
   - Tickets are automatically associated with authenticated user
   - No need to pass userId in request body (extract from token)

---

## 🔒 Data Privacy & Security

### Privacy Requirements

1. **User Data Isolation**:

   ```javascript
   // Backend MUST verify user context
   const userId = extractUserIdFromToken(authToken);
   if (userId !== requestContext.userId) {
     return 403; // Forbidden
   }
   ```

2. **Account Information Handling**:
   - **DO NOT** expose sensitive data in chat responses:
     - Exact account balances
     - Transaction IDs
     - Wallet addresses
     - Other users' information
   - **DO** provide general guidance:
     - "You can check your balance on the Wallet page"
     - "Your current rank is Investor"
     - "You have 3 active stakes"

3. **Conversation Storage**:
   - Store conversations securely
   - Encrypt sensitive data at rest
   - Implement data retention policies
   - Allow users to delete their conversation history

4. **AI Model Considerations**:
   - Ensure AI provider (OpenAI, Anthropic, etc.) has proper data handling agreements
   - Do NOT send sensitive financial data to AI models
   - Use context filtering to remove sensitive information before sending to AI

---

## 📝 Support Escalation System

### Ticket Creation Flow

1. **User submits escalation form** → Frontend sends to `/api/assistant/support/escalate`
2. **Backend creates ticket**:
   - Generate unique ticket ID (format: `TKT-YYYY-XXXXXX`)
   - Store ticket in database
   - Send confirmation email to user
   - Notify support team (email/Slack/webhook)
3. **Response guarantee**: 24 hours
4. **Status tracking**: User should be able to check ticket status

### Ticket Status Endpoint (Recommended)

**Endpoint**: `GET /api/assistant/support/tickets/:ticketId`

**Response**:

```json
{
  "success": true,
  "data": {
    "ticketId": "TKT-2024-001234",
    "status": "in_progress", // submitted, in_progress, resolved, closed
    "subject": "Unable to withdraw funds",
    "createdAt": "2024-12-14T10:30:00Z",
    "updatedAt": "2024-12-14T11:00:00Z",
    "priority": "high",
    "category": "account",
    "assignedTo": "support-agent-123",
    "messages": [
      {
        "from": "user",
        "content": "Initial request...",
        "timestamp": "2024-12-14T10:30:00Z"
      },
      {
        "from": "support",
        "content": "We're looking into this...",
        "timestamp": "2024-12-14T11:00:00Z"
      }
    ]
  }
}
```

---

## ⚡ Real-time Features (Optional)

### WebSocket Support (Future Enhancement)

If you want to add real-time typing indicators or streaming responses:

**WebSocket Endpoint**: `wss://api.novunt.com/assistant/chat`

**Message Format**:

```json
{
  "type": "message",
  "conversationId": "conv-123",
  "content": "How does staking work?",
  "timestamp": "2024-12-14T10:30:00Z"
}
```

**Streaming Response**:

```json
{
  "type": "stream",
  "conversationId": "conv-123",
  "chunk": "Staking is",
  "isComplete": false
}
```

**Current Implementation**: Frontend uses standard HTTP requests (no WebSocket needed initially)

---

## ❌ Error Handling

### Error Response Format

All errors should follow this structure:

```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable error message",
    "details": {
      // Additional error context
    }
  }
}
```

### Common Error Codes

| Code                  | HTTP Status | Description                                       |
| --------------------- | ----------- | ------------------------------------------------- |
| `INVALID_REQUEST`     | 400         | Invalid request format or missing required fields |
| `UNAUTHORIZED`        | 401         | Missing or invalid authentication token           |
| `FORBIDDEN`           | 403         | User not authorized to access resource            |
| `NOT_FOUND`           | 404         | Resource not found                                |
| `RATE_LIMIT_EXCEEDED` | 429         | Too many requests                                 |
| `AI_SERVICE_ERROR`    | 502         | AI service unavailable or error                   |
| `INTERNAL_ERROR`      | 500         | Internal server error                             |

### Frontend Error Handling

The frontend handles errors gracefully:

- Shows user-friendly error messages
- Provides retry options
- Suggests escalation for persistent errors
- Logs errors for debugging

---

## 🧪 Testing Guidelines

### Test Cases for Backend

#### 1. **Chat Endpoint Tests**

```javascript
describe('POST /api/assistant/chat', () => {
  it('should return AI response for valid message', async () => {
    const response = await request(app)
      .post('/api/assistant/chat')
      .set('Authorization', `Bearer ${validToken}`)
      .send({
        message: 'How does staking work?',
        context: { userId: 'user-123' },
      });

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data.message).toBeDefined();
  });

  it('should reject empty message', async () => {
    const response = await request(app)
      .post('/api/assistant/chat')
      .set('Authorization', `Bearer ${validToken}`)
      .send({ message: '' });

    expect(response.status).toBe(400);
    expect(response.body.error.code).toBe('INVALID_REQUEST');
  });

  it('should require authentication', async () => {
    const response = await request(app)
      .post('/api/assistant/chat')
      .send({ message: 'Test' });

    expect(response.status).toBe(401);
  });

  it('should prevent access to other users data', async () => {
    const response = await request(app)
      .post('/api/assistant/chat')
      .set('Authorization', `Bearer ${userAToken}`)
      .send({
        message: 'What is user B balance?',
        context: { userId: 'user-B' }, // Different user
      });

    expect(response.status).toBe(403);
  });
});
```

#### 2. **Support Escalation Tests**

```javascript
describe('POST /api/assistant/support/escalate', () => {
  it('should create support ticket', async () => {
    const response = await request(app)
      .post('/api/assistant/support/escalate')
      .set('Authorization', `Bearer ${validToken}`)
      .send({
        subject: 'Test issue',
        description: 'This is a test support request',
        priority: 'medium',
        category: 'general',
      });

    expect(response.status).toBe(201);
    expect(response.body.data.ticketId).toMatch(/^TKT-\d{4}-\d+$/);
  });

  it('should validate required fields', async () => {
    const response = await request(app)
      .post('/api/assistant/support/escalate')
      .set('Authorization', `Bearer ${validToken}`)
      .send({
        subject: '',
        description: '',
      });

    expect(response.status).toBe(400);
    expect(response.body.error.code).toBe('VALIDATION_ERROR');
  });
});
```

---

## 🔧 Integration Steps

### Step 1: Set Up AI Service

Choose and configure your AI provider:

- **OpenAI GPT-4** (recommended for best quality)
- **Anthropic Claude** (good privacy features)
- **Self-hosted LLM** (maximum privacy)

### Step 2: Create Database Schema

```sql
-- Conversations table
CREATE TABLE assistant_conversations (
  id VARCHAR(255) PRIMARY KEY,
  user_id VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_user_id (user_id),
  INDEX idx_updated_at (updated_at)
);

-- Messages table
CREATE TABLE assistant_messages (
  id VARCHAR(255) PRIMARY KEY,
  conversation_id VARCHAR(255) NOT NULL,
  role ENUM('user', 'assistant', 'system') NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_conversation_id (conversation_id)
);

-- Support tickets table
CREATE TABLE support_tickets (
  id VARCHAR(255) PRIMARY KEY,
  ticket_id VARCHAR(50) UNIQUE NOT NULL,
  user_id VARCHAR(255) NOT NULL,
  subject VARCHAR(500) NOT NULL,
  description TEXT NOT NULL,
  priority ENUM('low', 'medium', 'high', 'urgent') NOT NULL,
  category ENUM('technical', 'account', 'billing', 'general', 'other') NOT NULL,
  status ENUM('submitted', 'in_progress', 'resolved', 'closed') DEFAULT 'submitted',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_user_id (user_id),
  INDEX idx_status (status),
  INDEX idx_ticket_id (ticket_id)
);
```

### Step 3: Implement API Endpoints

1. **Chat Endpoint**:
   - Extract user context from token
   - Call AI service with message + context
   - Store conversation and messages
   - Return formatted response

2. **Support Escalation Endpoint**:
   - Validate request
   - Create ticket in database
   - Send notifications
   - Return ticket ID

### Step 4: Update Frontend Integration

In `src/hooks/useNovuntAssistant.ts`, replace the mock `generateResponse` function:

```typescript
const generateResponse = useCallback(
  async (
    userMessage: string,
    context: AssistantContext
  ): Promise<AssistantResponse> => {
    try {
      const response = await fetch('/api/assistant/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authToken}`, // Get from your auth system
        },
        body: JSON.stringify({
          message: userMessage,
          conversationId: currentConversationId, // Track conversation
          context: context,
        }),
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const data = await response.json();
      return data.data;
    } catch (error) {
      console.error('Assistant API error:', error);
      throw error;
    }
  },
  [authToken, currentConversationId]
);
```

### Step 5: Environment Variables

Add to your backend `.env`:

```env
# AI Service Configuration
AI_PROVIDER=openai  # or 'anthropic', 'custom'
OPENAI_API_KEY=sk-...
OPENAI_MODEL=gpt-4

# Or for Anthropic
ANTHROPIC_API_KEY=sk-ant-...
ANTHROPIC_MODEL=claude-3-opus-20240229

# Database
DATABASE_URL=postgresql://...

# Support System
SUPPORT_EMAIL=support@novunt.com
SUPPORT_WEBHOOK_URL=https://hooks.slack.com/...
```

---

## 📊 Monitoring & Analytics

### Recommended Metrics to Track

1. **Usage Metrics**:
   - Messages per user per day
   - Average response time
   - Conversation length
   - Most common questions

2. **Performance Metrics**:
   - API response time
   - AI service latency
   - Error rates
   - Rate limit hits

3. **Quality Metrics**:
   - Escalation rate (how often users need human support)
   - User satisfaction (if you add ratings)
   - Resolution rate (for escalated tickets)

---

## 🎨 Response Tone Guidelines

### DO's ✅

- Use warm, friendly language: "Hello! I'm here to help..."
- Personalize with user's name when available
- Be empathetic: "I understand your concern..."
- Provide clear, actionable guidance
- Use formatting (bullets, numbered lists) for clarity
- Acknowledge limitations: "I can help with general questions, but for specific account details..."

### DON'Ts ❌

- Don't be robotic: Avoid "As an AI assistant..."
- Don't expose sensitive data: Never share exact balances, transaction IDs
- Don't make promises you can't keep
- Don't use technical jargon without explanation
- Don't provide information about other users

---

## 🚀 Future Enhancements

1. **Conversation History**: Allow users to view past conversations
2. **Voice Input**: Add speech-to-text for voice queries
3. **Multilingual Support**: Support multiple languages
4. **Rich Media**: Support images, links, formatted responses
5. **Proactive Suggestions**: Suggest actions based on user behavior
6. **Knowledge Base Integration**: Link to documentation/articles
7. **Feedback System**: Allow users to rate responses

---

## 📞 Support

For questions or issues during integration:

1. **Frontend Issues**: Check `src/components/assistant/` components
2. **API Integration**: Review `src/hooks/useNovuntAssistant.ts`
3. **Type Definitions**: See `src/types/assistant.ts`

---

## ✅ Checklist for Backend Team

- [ ] Set up AI service (OpenAI/Anthropic/Custom)
- [ ] Create database schema for conversations and tickets
- [ ] Implement `/api/assistant/chat` endpoint
- [ ] Implement `/api/assistant/support/escalate` endpoint
- [ ] Add authentication middleware
- [ ] Implement user context extraction
- [ ] Add privacy checks (prevent cross-user data access)
- [ ] Set up support ticket notification system
- [ ] Add error handling and logging
- [ ] Write unit tests for endpoints
- [ ] Set up monitoring/analytics
- [ ] Configure rate limiting
- [ ] Test with frontend integration
- [ ] Deploy to staging environment
- [ ] Perform security audit
- [ ] Deploy to production

---

**Document Version**: 1.0  
**Last Updated**: December 14, 2024  
**Frontend Implementation**: Complete ✅  
**Backend Integration**: Pending ⏳
