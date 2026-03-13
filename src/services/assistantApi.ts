/**
 * AI Assistant & Live Support API Service
 * Covers all endpoints: AI Chat, FAQ, Support Tickets, Conversations, Admin
 *
 * Uses the centralized Axios-based API client from @/lib/api
 * All endpoints require authentication (cookie-based BetterAuth)
 *
 * IMPORTANT: The api client's `apiRequest` function auto-unwraps responses
 * that have a `data` key. If the backend returns { success, data: {...} },
 * the api client returns just the inner `data` object.
 * We use `wrapResponse()` to normalise both wrapped & unwrapped shapes
 * into a consistent AssistantApiResponse<T> for consumers.
 */

import { api } from '@/lib/api';
import type {
  AssistantApiResponse,
  ChatResponseData,
  WelcomeResponseData,
  FAQEntry,
  FAQCategory,
  ConversationListItem,
  ConversationMessage,
  TicketListItem,
  TicketDetail,
  TicketMessage,
  TicketStatus,
  TicketPriority,
  TicketCategory,
  AdminTicket,
  TicketStats,
  Pagination,
  SupportEscalationRequest,
} from '@/types/assistant';

// ─────────────────────────────────────────────────────────────────────
// Base URL override for user-side assistant routes
// ─────────────────────────────────────────────────────────────────────
// Backend registers assistant routes at /api/assistant/... (NO /v1 prefix)
// while admin routes live at /api/v1/admin/support/... (WITH /v1 prefix).
// The shared API client's baseURL includes /api/v1, so user-side assistant
// calls need an explicit baseURL override to hit /api/assistant/... instead.
// ─────────────────────────────────────────────────────────────────────
const ASSISTANT_BASE_URL = (() => {
  const base =
    process.env.NEXT_PUBLIC_API_URL || 'https://api.novunt.com/api/v1';
  if (base.includes('/api/v1')) return base.replace('/api/v1', '/api');
  if (!base.endsWith('/api')) return base.replace(/\/?$/, '/api');
  return base;
})();

// ─────────────────────────────────────────────────────────────────────
// Helper: normalise API responses regardless of auto-unwrap behaviour
// ─────────────────────────────────────────────────────────────────────

/**
 * The centralized api client may or may not auto-unwrap `{ data }`.
 * This helper ensures a consistent `AssistantApiResponse<T>` shape.
 *
 * Case 1 – still wrapped:  { success: true, data: T }  →  pass-through
 * Case 2 – already unwrapped:  T  →  { success: true, data: T }
 */
function wrapResponse<T>(raw: unknown): AssistantApiResponse<T> {
  if (raw && typeof raw === 'object' && 'success' in raw && 'data' in raw) {
    // Still has the full wrapper shape
    return raw as AssistantApiResponse<T>;
  }
  // Already unwrapped — re-wrap
  return { success: true, data: raw as T };
}

// ─────────────────────────────────────────────────────────────────────
// 1. AI CHAT ENDPOINTS
// ─────────────────────────────────────────────────────────────────────

/**
 * Get personalized welcome message when chat opens
 * GET /api/assistant/welcome
 */
export async function getWelcomeMessage(): Promise<
  AssistantApiResponse<WelcomeResponseData>
> {
  const raw = await api.get<unknown>('/assistant/welcome', {
    baseURL: ASSISTANT_BASE_URL,
  });
  return wrapResponse<WelcomeResponseData>(raw);
}

/**
 * Send a chat message to Nova AI
 * POST /api/assistant/chat
 */
export async function sendChatMessage(
  message: string,
  conversationId: string | null = null
): Promise<AssistantApiResponse<ChatResponseData>> {
  const raw = await api.post<unknown>(
    '/assistant/chat',
    {
      message,
      conversationId,
    },
    { baseURL: ASSISTANT_BASE_URL }
  );
  return wrapResponse<ChatResponseData>(raw);
}

// ─────────────────────────────────────────────────────────────────────
// 2. FAQ ENDPOINTS
// ─────────────────────────────────────────────────────────────────────

/**
 * Get all FAQs, optionally filtered by search or category
 * GET /api/assistant/faqs
 */
export async function getFAQs(params?: {
  search?: string;
  category?: string;
}): Promise<
  AssistantApiResponse<{
    faqs?: FAQEntry[];
    results?: FAQEntry[];
    query?: string;
    total: number;
  }>
> {
  const searchParams = new URLSearchParams();
  if (params?.search) searchParams.set('search', params.search);
  if (params?.category) searchParams.set('category', params.category);

  const query = searchParams.toString();
  const url = `/assistant/faqs${query ? `?${query}` : ''}`;

  const raw = await api.get<unknown>(url, { baseURL: ASSISTANT_BASE_URL });
  return wrapResponse(raw);
}

/**
 * Get FAQ categories with counts and icons
 * GET /api/assistant/faqs/categories
 */
export async function getFAQCategories(): Promise<
  AssistantApiResponse<{ categories: FAQCategory[] }>
> {
  const raw = await api.get<unknown>('/assistant/faqs/categories', {
    baseURL: ASSISTANT_BASE_URL,
  });
  return wrapResponse(raw);
}

// ─────────────────────────────────────────────────────────────────────
// 3. SUPPORT TICKET ENDPOINTS (USER-SIDE)
// ─────────────────────────────────────────────────────────────────────

/**
 * Get support form options (categories & priorities)
 * GET /api/assistant/support/options
 */
export async function getSupportOptions(): Promise<
  AssistantApiResponse<{
    categories: Array<{ value: string; label: string }>;
    priorities: Array<{ value: string; label: string }>;
  }>
> {
  const raw = await api.get<unknown>('/assistant/support/options', {
    baseURL: ASSISTANT_BASE_URL,
  });
  return wrapResponse(raw);
}

/**
 * Create a support ticket (escalate)
 * POST /api/assistant/support/escalate
 * Request body: { subject, description, priority, category, conversationId? }
 * Success (201): { success: true, data: { ticketId, status, estimatedResponseTime, message } }
 * Error (400/500): throws; extract message from error.response.data.message or error.response.data.error?.message
 */
export async function createSupportTicket(
  data: SupportEscalationRequest
): Promise<
  AssistantApiResponse<{
    ticketId: string;
    status: string;
    estimatedResponseTime: string;
    message: string;
  }>
> {
  const raw = await api.post<unknown>('/assistant/support/escalate', data, {
    baseURL: ASSISTANT_BASE_URL,
  });
  return wrapResponse(raw);
}

/**
 * List user's tickets with optional filters
 * GET /api/assistant/support/tickets
 */
export async function getMyTickets(params?: {
  page?: number;
  limit?: number;
  status?: TicketStatus;
}): Promise<
  AssistantApiResponse<{
    tickets: TicketListItem[];
    pagination: Pagination;
  }>
> {
  const searchParams = new URLSearchParams();
  if (params?.page) searchParams.set('page', String(params.page));
  if (params?.limit) searchParams.set('limit', String(params.limit));
  if (params?.status) searchParams.set('status', params.status);

  const query = searchParams.toString();
  const url = `/assistant/support/tickets${query ? `?${query}` : ''}`;

  const raw = await api.get<unknown>(url, { baseURL: ASSISTANT_BASE_URL });
  return wrapResponse(raw);
}

/**
 * Get a single ticket's detail with full message thread
 * GET /api/assistant/support/tickets/:ticketId
 */
export async function getTicketDetail(
  ticketId: string
): Promise<AssistantApiResponse<TicketDetail>> {
  const raw = await api.get<unknown>(`/assistant/support/tickets/${ticketId}`, {
    baseURL: ASSISTANT_BASE_URL,
  });
  return wrapResponse<TicketDetail>(raw);
}

/**
 * Reply to a ticket
 * POST /api/assistant/support/tickets/:ticketId/reply
 */
export async function replyToTicket(
  ticketId: string,
  content: string
): Promise<
  AssistantApiResponse<{
    ticketId: string;
    message: TicketMessage;
    status: TicketStatus;
  }>
> {
  const raw = await api.post<unknown>(
    `/assistant/support/tickets/${ticketId}/reply`,
    { content },
    { baseURL: ASSISTANT_BASE_URL }
  );
  return wrapResponse(raw);
}

// ─────────────────────────────────────────────────────────────────────
// 4. CONVERSATION MANAGEMENT ENDPOINTS
// ─────────────────────────────────────────────────────────────────────

/**
 * List AI chat conversations
 * GET /api/assistant/conversations
 */
export async function getConversations(params?: {
  limit?: number;
  offset?: number;
}): Promise<
  AssistantApiResponse<{
    conversations: ConversationListItem[];
    total: number;
    limit: number;
    offset: number;
  }>
> {
  const searchParams = new URLSearchParams();
  if (params?.limit) searchParams.set('limit', String(params.limit));
  if (params?.offset) searchParams.set('offset', String(params.offset));

  const query = searchParams.toString();
  const url = `/assistant/conversations${query ? `?${query}` : ''}`;

  const raw = await api.get<unknown>(url, { baseURL: ASSISTANT_BASE_URL });
  return wrapResponse(raw);
}

/**
 * Get messages for a specific conversation
 * GET /api/assistant/conversations/:conversationId/messages
 */
export async function getConversationMessages(conversationId: string): Promise<
  AssistantApiResponse<{
    conversationId: string;
    messages: ConversationMessage[];
    total: number;
  }>
> {
  const raw = await api.get<unknown>(
    `/assistant/conversations/${conversationId}/messages`,
    { baseURL: ASSISTANT_BASE_URL }
  );
  return wrapResponse(raw);
}

/**
 * Rate a conversation (1-5 stars)
 * POST /api/assistant/conversations/:conversationId/rate
 */
export async function rateConversation(
  conversationId: string,
  rating: number,
  feedback?: string
): Promise<AssistantApiResponse<{ message: string }>> {
  const raw = await api.post<unknown>(
    `/assistant/conversations/${conversationId}/rate`,
    { rating, feedback },
    { baseURL: ASSISTANT_BASE_URL }
  );
  return wrapResponse(raw);
}

/**
 * Submit thumbs up/down feedback
 * POST /api/assistant/conversations/:conversationId/feedback
 */
export async function submitFeedback(
  conversationId: string,
  wasHelpful: boolean
): Promise<AssistantApiResponse<{ message: string }>> {
  const raw = await api.post<unknown>(
    `/assistant/conversations/${conversationId}/feedback`,
    { wasHelpful },
    { baseURL: ASSISTANT_BASE_URL }
  );
  return wrapResponse(raw);
}

/**
 * Mark conversation as resolved
 * POST /api/assistant/conversations/:conversationId/resolve
 */
export async function resolveConversation(
  conversationId: string
): Promise<AssistantApiResponse<{ message: string }>> {
  const raw = await api.post<unknown>(
    `/assistant/conversations/${conversationId}/resolve`,
    {},
    { baseURL: ASSISTANT_BASE_URL }
  );
  return wrapResponse(raw);
}

// ─────────────────────────────────────────────────────────────────────
// 5. ADMIN SUPPORT ENDPOINTS
// ─────────────────────────────────────────────────────────────────────

/**
 * Get support dashboard statistics
 * GET /api/v1/admin/support/stats
 */
export async function getAdminSupportStats(): Promise<
  AssistantApiResponse<TicketStats>
> {
  const raw = await api.get<unknown>('/admin/support/stats');
  return wrapResponse<TicketStats>(raw);
}

/**
 * List support agents for assign dropdown
 * GET /api/v1/admin/support/agents
 */
export async function getAdminSupportAgents(): Promise<
  AssistantApiResponse<{
    agents: Array<{
      _id: string;
      fname: string;
      lname: string;
      email: string;
      username: string;
      role: string;
      displayName: string;
    }>;
  }>
> {
  const raw = await api.get<unknown>('/admin/support/agents');
  return wrapResponse(raw);
}

/**
 * List all tickets (admin) with filters, search, pagination
 * GET /api/v1/admin/support
 */
export async function getAdminTickets(params?: {
  page?: number;
  limit?: number;
  status?: TicketStatus;
  priority?: TicketPriority;
  category?: TicketCategory;
  assignedTo?: string;
  search?: string;
  sort?: string;
}): Promise<
  AssistantApiResponse<{
    tickets: AdminTicket[];
    pagination: Pagination;
  }>
> {
  const searchParams = new URLSearchParams();
  if (params?.page) searchParams.set('page', String(params.page));
  if (params?.limit) searchParams.set('limit', String(params.limit));
  if (params?.status) searchParams.set('status', params.status);
  if (params?.priority) searchParams.set('priority', params.priority);
  if (params?.category) searchParams.set('category', params.category);
  if (params?.assignedTo) searchParams.set('assignedTo', params.assignedTo);
  if (params?.search) searchParams.set('search', params.search);
  if (params?.sort) searchParams.set('sort', params.sort);

  const query = searchParams.toString();
  const url = `/admin/support${query ? `?${query}` : ''}`;

  const raw = await api.get<unknown>(url);
  return wrapResponse(raw);
}

/**
 * Get a single ticket detail (admin view - populated user info)
 * GET /api/v1/admin/support/:ticketId
 */
export async function getAdminTicketDetail(
  ticketId: string
): Promise<AssistantApiResponse<{ ticket: AdminTicket }>> {
  const raw = await api.get<unknown>(`/admin/support/${ticketId}`);
  return wrapResponse(raw);
}

/**
 * Agent reply to a ticket
 * POST /api/v1/admin/support/:ticketId/reply
 */
export async function adminReplyToTicket(
  ticketId: string,
  content: string
): Promise<AssistantApiResponse<{ message: string }>> {
  const raw = await api.post<unknown>(`/admin/support/${ticketId}/reply`, {
    content,
  });
  return wrapResponse(raw);
}

/**
 * Assign ticket to an agent
 * PUT /api/v1/admin/support/:ticketId/assign
 */
export async function assignTicket(
  ticketId: string,
  agentId: string
): Promise<AssistantApiResponse<{ message: string }>> {
  const raw = await api.put<unknown>(`/admin/support/${ticketId}/assign`, {
    agentId,
  });
  return wrapResponse(raw);
}

/**
 * Update ticket status
 * PUT /api/v1/admin/support/:ticketId/status
 */
export async function updateTicketStatus(
  ticketId: string,
  status: TicketStatus
): Promise<AssistantApiResponse<{ message: string }>> {
  const raw = await api.put<unknown>(`/admin/support/${ticketId}/status`, {
    status,
  });
  return wrapResponse(raw);
}

/**
 * Update ticket priority
 * PUT /api/v1/admin/support/:ticketId/priority
 */
export async function updateTicketPriority(
  ticketId: string,
  priority: TicketPriority
): Promise<AssistantApiResponse<{ message: string }>> {
  const raw = await api.put<unknown>(`/admin/support/${ticketId}/priority`, {
    priority,
  });
  return wrapResponse(raw);
}
