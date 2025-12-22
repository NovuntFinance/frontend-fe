/**
 * Novunt Assistant Types
 * Type definitions for the AI assistant chat system
 */

export type MessageRole = 'user' | 'assistant' | 'system';

export interface ChatMessage {
  id: string;
  role: MessageRole;
  content: string;
  timestamp: Date;
  isLoading?: boolean;
  error?: string;
}

export interface AssistantContext {
  userId?: string;
  userName?: string;
  userEmail?: string;
  userRank?: string;
  accountBalance?: number;
  stakingCount?: number;
  referralCount?: number;
}

export interface SupportEscalationRequest {
  subject: string;
  description: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  category: 'technical' | 'account' | 'billing' | 'general' | 'other';
  attachments?: File[];
}

export interface AssistantResponse {
  message: string;
  conversationId: string;
  suggestions: string[]; // Always present (4 suggestions)
  requiresEscalation?: boolean;
  escalationReason?: string;
  metadata?: {
    responseTime?: number;
    model?: string;
    tokensUsed?: number;
  };
}
