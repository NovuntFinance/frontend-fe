/**
 * Novunt AI Assistant & Live Support — Type Definitions
 * Based on Backend Integration Guide (March 2026)
 *
 * Covers: AI Chat (Nova), FAQ System, Support Tickets, Conversations,
 *         Socket.io Events, Admin Support Panel
 */

// ── Core Enums / Unions ──────────────────────────────────────────────
export type MessageRole = 'user' | 'assistant' | 'system';
export type TicketMessageSender = 'user' | 'support';
export type TicketStatus = 'submitted' | 'in_progress' | 'resolved' | 'closed';
export type TicketPriority = 'low' | 'medium' | 'high' | 'urgent';
export type TicketCategory =
  | 'technical'
  | 'account'
  | 'billing'
  | 'general'
  | 'other';
export type ChatCategory =
  | 'staking'
  | 'wallets'
  | 'deposits'
  | 'withdrawals'
  | 'referrals'
  | 'ranks'
  | 'pools'
  | 'security'
  | 'account'
  | 'p2p'
  | 'general'
  | 'complaint';
export type Sentiment = 'positive' | 'neutral' | 'negative';
export type ResponseSource = 'faq' | 'ai' | 'fallback';

// ── Quick Action ─────────────────────────────────────────────────────
export interface QuickAction {
  label: string;
  action: 'navigate' | 'faq' | 'escalate';
  target?: string;
  icon?: string;
}

// ── Chat Message (Frontend state) ────────────────────────────────────
export interface ChatMessage {
  id: string;
  role: MessageRole;
  content: string;
  timestamp: Date;
  isLoading?: boolean;
  error?: string;
  source?: ResponseSource;
  sentiment?: Sentiment;
  category?: ChatCategory;
  confidence?: number;
  quickActions?: QuickAction[];
  suggestions?: string[];
  requiresEscalation?: boolean;
}

// ── Assistant Context ────────────────────────────────────────────────
export interface AssistantContext {
  userId?: string;
  userName?: string;
  userEmail?: string;
  userRank?: string;
  accountBalance?: number;
  stakingCount?: number;
  referralCount?: number;
}

// ── Chat Response Data (from backend) ────────────────────────────────
export interface ChatResponseData {
  message: string;
  conversationId: string;
  suggestions: string[];
  quickActions: QuickAction[];
  requiresEscalation: boolean;
  escalationReason?: string;
  category: ChatCategory;
  sentiment: Sentiment;
  relatedTopics?: string[];
  metadata: {
    responseTime: number;
    model: string;
    source: ResponseSource;
    confidence?: number;
    tokensUsed?: number;
  };
}

// ── Welcome Response Data (from backend) ─────────────────────────────
export interface WelcomeResponseData {
  message: string;
  suggestions: string[];
  quickActions: QuickAction[];
}

// ── Legacy-compatible AssistantResponse ──────────────────────────────
export interface AssistantResponse {
  message: string;
  conversationId: string;
  suggestions: string[];
  quickActions?: QuickAction[];
  requiresEscalation?: boolean;
  escalationReason?: string;
  category?: ChatCategory;
  sentiment?: Sentiment;
  metadata?: {
    responseTime?: number;
    model?: string;
    source?: ResponseSource;
    confidence?: number;
    tokensUsed?: number;
  };
}

// ── FAQ System ───────────────────────────────────────────────────────
export interface FAQEntry {
  question: string;
  answer: string;
  category: string;
  confidence?: number;
  relatedQuestions: string[];
  quickActions?: QuickAction[];
}

export interface FAQCategory {
  category: string;
  count: number;
  icon: string;
}

// ── Support Ticket (User View) ───────────────────────────────────────
export interface TicketMessage {
  from: TicketMessageSender;
  content: string;
  timestamp: string;
  senderName?: string;
}

export interface TicketListItem {
  ticketId: string;
  subject: string;
  status: TicketStatus;
  priority: TicketPriority;
  category: TicketCategory;
  createdAt: string;
  updatedAt: string;
  messageCount: number;
  lastMessage: {
    from: TicketMessageSender;
    content: string;
    timestamp: string;
  } | null;
}

export interface TicketDetail {
  ticketId: string;
  status: TicketStatus;
  subject: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
  priority: TicketPriority;
  category: TicketCategory;
  assignedTo?: string;
  messages: TicketMessage[];
}

// ── Create Ticket Request ────────────────────────────────────────────
export interface SupportEscalationRequest {
  subject: string;
  description: string;
  priority: TicketPriority;
  category: TicketCategory;
  conversationId?: string;
  attachments?: string[];
}

// ── Support Ticket (Admin View) ──────────────────────────────────────
export interface AdminUser {
  _id: string;
  fname: string;
  lname: string;
  email: string;
  username: string;
}

export interface AdminTicket {
  _id: string;
  ticketId: string;
  subject: string;
  description: string;
  status: TicketStatus;
  priority: TicketPriority;
  category: TicketCategory;
  userId: AdminUser;
  assignedTo: AdminUser | null;
  messages: TicketMessage[];
  attachments: string[];
  createdAt: string;
  updatedAt: string;
}

export interface TicketStats {
  byStatus: {
    submitted: number;
    in_progress: number;
    resolved: number;
    closed: number;
    total: number;
  };
  openByPriority: Record<string, number>;
  openByCategory: Record<string, number>;
  recentTickets: AdminTicket[];
}

// ── Pagination ───────────────────────────────────────────────────────
export interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

// ── Conversation ─────────────────────────────────────────────────────
export interface ConversationListItem {
  id: string;
  createdAt: string;
  updatedAt: string;
  messageCount: number;
  lastMessage: string;
}

export interface ConversationMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

// ── Socket.io Event Payloads ─────────────────────────────────────────
export interface SocketTicketNew {
  ticketId: string;
  subject: string;
  priority: TicketPriority;
  category: string;
  userId: string;
}

export interface SocketTicketReply {
  ticketId: string;
  message: {
    from: TicketMessageSender;
    content: string;
    timestamp: string;
    senderName?: string;
  };
}

export interface SocketTicketStatusChanged {
  ticketId: string;
  status: TicketStatus;
}

export interface SocketTicketAssigned {
  ticketId: string;
  agentId: string;
}

export interface SocketTyping {
  userId: string;
  ticketId: string;
}

// ── API Response Wrapper ─────────────────────────────────────────────
export interface AssistantApiResponse<T> {
  success: boolean;
  statusCode?: number;
  message?: string;
  data: T;
  error?: {
    code: string;
    message: string;
  };
}
