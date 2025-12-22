/**
 * Novunt Assistant Hook
 * Manages chat state and AI interactions
 */

'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { useUser } from './useUser';
import { toast } from '@/lib/toast';
import type {
  ChatMessage,
  AssistantContext,
  AssistantResponse,
} from '@/types/assistant';

const INITIAL_GREETINGS = [
  "Hello! I'm your Novunt Assistant. How can I help you today?",
  'Hi there! Welcome to Novunt. What would you like to know?',
  "Greetings! I'm here to help you succeed on Novunt. What questions do you have?",
];

const CONVERSATION_ID_KEY = 'novunt_assistant_conversation_id';

export function useNovuntAssistant() {
  const { user } = useUser();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Load conversation ID from localStorage on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem(CONVERSATION_ID_KEY);
      if (stored) {
        setConversationId(stored);
      }
    }
  }, []);

  // Build context from user data
  const getContext = useCallback((): AssistantContext => {
    return {
      userId: user?.id,
      userName: user?.firstName
        ? `${user.firstName} ${user.lastName || ''}`.trim()
        : undefined,
      userEmail: user?.email,
      userRank: user?.rank,
      // Add more context as needed from other hooks/queries
    };
  }, [user]);

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  // Initialize with greeting when opened
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      const context = getContext();
      const greeting = context.userName
        ? `Hello ${context.userName}! I'm your Novunt Assistant. How can I help you today?`
        : INITIAL_GREETINGS[
            Math.floor(Math.random() * INITIAL_GREETINGS.length)
          ];

      const greetingMessage: ChatMessage = {
        id: `greeting-${Date.now()}`,
        role: 'assistant',
        content: greeting,
        timestamp: new Date(),
      };

      setMessages([greetingMessage]);
    }
  }, [isOpen, messages.length, getContext]);

  // Generate AI response (mock implementation - replace with actual API call)
  const generateResponse = useCallback(
    async (
      userMessage: string,
      context: AssistantContext
    ): Promise<AssistantResponse> => {
      // This is a mock implementation
      // In production, this would call your AI/backend API

      const lowerMessage = userMessage.toLowerCase();
      const currentConversationId = conversationId || `conv-${Date.now()}`;

      // Platform information queries
      if (lowerMessage.includes('how') && lowerMessage.includes('work')) {
        return {
          message:
            "Novunt is a staking platform where you can grow your wealth through strategic investments. Here's how it works:\n\n" +
            '1. **Staking**: Invest your funds in staking packages to earn daily returns\n' +
            '2. **Rank System**: Progress through ranks by maintaining stakes and building your team\n' +
            '3. **Team Building**: Refer others to earn additional rewards\n' +
            '4. **Pools**: Qualify for premium pools based on your rank and team performance\n\n' +
            'Would you like more details about any specific aspect?',
          conversationId: currentConversationId,
          suggestions: [
            'What are the rank requirements?',
            'How do pools work?',
            'How do I start staking?',
            'What are the benefits of team building?',
          ],
        };
      }

      // Growth and success guidance
      if (
        lowerMessage.includes('grow') ||
        lowerMessage.includes('succeed') ||
        lowerMessage.includes('success') ||
        lowerMessage.includes('improve')
      ) {
        return {
          message:
            'To grow and succeed on Novunt, focus on these key areas:\n\n' +
            '✨ **Consistent Staking**: Maintain active stakes to earn daily returns\n' +
            '👥 **Build Your Team**: Refer active users to unlock higher ranks and pool access\n' +
            '📈 **Rank Progression**: Higher ranks unlock better rewards and pool qualifications\n' +
            '🎯 **Stay Active**: Regular activity helps maintain your rank and pool eligibility\n\n' +
            (context.userRank
              ? `You're currently at ${context.userRank} rank. Keep building!`
              : "I can help you understand your current progress if you'd like."),
          conversationId: currentConversationId,
          suggestions: [
            'How do I check my rank progress?',
            'What are the rank requirements?',
            'How do pools work?',
            'How do I build my team?',
          ],
        };
      }

      // Account information queries
      if (
        lowerMessage.includes('balance') ||
        lowerMessage.includes('account') ||
        lowerMessage.includes('my') ||
        lowerMessage.includes('wallet')
      ) {
        return {
          message:
            'I can help you understand your account information. However, for security reasons, I can only provide general guidance here.\n\n' +
            'To view your detailed account information:\n' +
            '• Check your **Wallet** page for balances and transactions\n' +
            '• Visit **Stakes** to see your active investments\n' +
            '• Go to **Team** to view your referral network\n\n' +
            "Is there something specific about your account you'd like help with?",
          conversationId: currentConversationId,
          suggestions: [
            'How do I deposit funds?',
            'How do I withdraw?',
            'How do I check my staking history?',
            'How do I view my transactions?',
          ],
        };
      }

      // Staking queries
      if (lowerMessage.includes('stake') || lowerMessage.includes('staking')) {
        return {
          message:
            "Staking is the core of Novunt! Here's what you need to know:\n\n" +
            '**How to Stake:**\n' +
            '1. Go to the Stakes page\n' +
            '2. Click "Create New Stake"\n' +
            '3. Choose your stake amount\n' +
            '4. Confirm your stake\n\n' +
            '**Benefits:**\n' +
            '• Earn daily returns (ROS - Return on Stake)\n' +
            '• Progress toward higher ranks\n' +
            '• Qualify for premium pools\n\n' +
            'Would you like to know more about stake amounts or returns?',
          conversationId: currentConversationId,
          suggestions: [
            'What stake amounts are available?',
            'How are returns calculated?',
            'What is ROS?',
            'How long do stakes last?',
          ],
        };
      }

      // Team/Referral queries
      if (
        lowerMessage.includes('team') ||
        lowerMessage.includes('referral') ||
        lowerMessage.includes('refer')
      ) {
        return {
          message:
            'Building your team is key to success on Novunt!\n\n' +
            '**How Referrals Work:**\n' +
            '• Share your unique referral link\n' +
            '• When someone signs up using your link, they become part of your team\n' +
            "• You earn rewards based on your team's activity\n\n" +
            '**Benefits:**\n' +
            '• Unlock higher ranks faster\n' +
            '• Qualify for premium pools\n' +
            '• Earn additional rewards\n\n' +
            'You can find your referral link and team stats on the Team page.',
          conversationId: currentConversationId,
          suggestions: [
            'Where do I find my referral link?',
            'How do I track my team?',
            'What rewards do I get?',
            'How do referrals help my rank?',
          ],
        };
      }

      // Default response
      return {
        message:
          'I understand you\'re asking about "' +
          userMessage +
          '". Let me help you with that.\n\n' +
          'I can assist you with:\n' +
          '• Understanding how Novunt works\n' +
          '• Guidance on growing your account\n' +
          '• General account information\n' +
          '• Platform features and benefits\n\n' +
          'Could you rephrase your question, or would you like me to help you with something specific?',
        conversationId: currentConversationId,
        suggestions: [
          'How does Novunt work?',
          'How do I grow my account?',
          'What are the ranks?',
          'How do pools work?',
        ],
        requiresEscalation: true,
        escalationReason: 'Complex query requiring human support',
      };
    },
    [conversationId]
  );

  // Send a message
  const sendMessage = useCallback(
    async (content: string) => {
      if (!content.trim() || isLoading) return;

      // Clear previous suggestions when user sends a new message
      setSuggestions([]);

      const userMessage: ChatMessage = {
        id: `user-${Date.now()}`,
        role: 'user',
        content: content.trim(),
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, userMessage]);
      setIsLoading(true);

      // Add loading message
      const loadingMessage: ChatMessage = {
        id: `loading-${Date.now()}`,
        role: 'assistant',
        content: '',
        timestamp: new Date(),
        isLoading: true,
      };

      setMessages((prev) => [...prev, loadingMessage]);

      try {
        const context = getContext();
        const response = await generateResponse(content, context);

        // Remove loading message and add response
        setMessages((prev) => {
          const withoutLoading = prev.filter((msg) => !msg.isLoading);
          const assistantMessage: ChatMessage = {
            id: `assistant-${Date.now()}`,
            role: 'assistant',
            content: response.message,
            timestamp: new Date(),
          };
          return [...withoutLoading, assistantMessage];
        });

        // Update suggestions from response
        if (response.suggestions && response.suggestions.length > 0) {
          setSuggestions(response.suggestions);
        }
      } catch (error) {
        // Remove loading message and add error
        setMessages((prev) => {
          const withoutLoading = prev.filter((msg) => !msg.isLoading);
          const errorMessage: ChatMessage = {
            id: `error-${Date.now()}`,
            role: 'assistant',
            content:
              error instanceof Error
                ? error.message
                : "I apologize, but I'm having trouble processing your request right now. Please try again, or consider escalating to human support.",
            timestamp: new Date(),
            error: error instanceof Error ? error.message : 'Unknown error',
          };
          return [...withoutLoading, errorMessage];
        });

        // Show toast for rate limit errors
        if (
          error instanceof Error &&
          error.message.includes('Too many requests')
        ) {
          toast.error('Rate limit exceeded', {
            description: 'Please wait a moment before sending another message.',
          });
        }
      } finally {
        setIsLoading(false);
      }
    },
    [isLoading, generateResponse, getContext]
  );

  // Clear chat history
  const clearChat = useCallback(() => {
    setMessages([]);
    setConversationId(null);
    setSuggestions([]);
    if (typeof window !== 'undefined') {
      localStorage.removeItem(CONVERSATION_ID_KEY);
    }
  }, []);

  // Toggle assistant
  const toggleAssistant = useCallback(() => {
    setIsOpen((prev) => !prev);
  }, []);

  const closeAssistant = useCallback(() => {
    setIsOpen(false);
  }, []);

  return {
    messages,
    isOpen,
    isLoading,
    sendMessage,
    clearChat,
    toggleAssistant,
    closeAssistant,
    messagesEndRef,
    suggestions, // Expose suggestions for UI
    conversationId, // Expose conversationId for debugging
  };
}
