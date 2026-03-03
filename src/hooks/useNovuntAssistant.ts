/**
 * Novunt Assistant Hook — Real Backend Integration
 * Connects to Nova AI via /api/assistant/chat and /api/assistant/welcome
 * Manages chat state, conversation continuity, FAQ, and escalation
 */

'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { useUser } from './useUser';
import { toast } from '@/lib/toast';
import {
  getWelcomeMessage,
  sendChatMessage,
  getFAQs,
  getFAQCategories,
} from '@/services/assistantApi';
import type {
  ChatMessage,
  QuickAction,
  FAQEntry,
  FAQCategory,
  ResponseSource,
  Sentiment,
} from '@/types/assistant';

const CONVERSATION_ID_KEY = 'novunt_assistant_conversation_id';

export type ChatView = 'chat' | 'faq' | 'tickets';

export function useNovuntAssistant() {
  const { user } = useUser();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [quickActions, setQuickActions] = useState<QuickAction[]>([]);
  const [currentView, setCurrentView] = useState<ChatView>('chat');
  // FAQ state
  const [faqs, setFaqs] = useState<FAQEntry[]>([]);
  const [faqCategories, setFaqCategories] = useState<FAQCategory[]>([]);
  const [faqLoading, setFaqLoading] = useState(false);
  const [faqSearchQuery, setFaqSearchQuery] = useState('');
  const [selectedFaqCategory, setSelectedFaqCategory] = useState<string | null>(
    null
  );

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const welcomeLoadedRef = useRef(false);

  // Load conversation ID from localStorage on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem(CONVERSATION_ID_KEY);
      if (stored) {
        setConversationId(stored);
      }
    }
  }, []);

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  // Load welcome message from backend when opened
  useEffect(() => {
    if (isOpen && messages.length === 0 && !welcomeLoadedRef.current) {
      welcomeLoadedRef.current = true;
      loadWelcomeMessage();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, messages.length]);

  /**
   * Load personalized welcome message from GET /api/assistant/welcome
   */
  const loadWelcomeMessage = useCallback(async () => {
    try {
      const response = await getWelcomeMessage();

      if (response?.success && response.data) {
        const welcomeMsg: ChatMessage = {
          id: `welcome-${Date.now()}`,
          role: 'assistant',
          content: response.data.message,
          timestamp: new Date(),
          quickActions: response.data.quickActions,
          suggestions: response.data.suggestions,
        };

        setMessages([welcomeMsg]);
        setSuggestions(response.data.suggestions || []);
        setQuickActions(response.data.quickActions || []);
      } else {
        setFallbackGreeting();
      }
    } catch (error) {
      console.error('[Nova] Failed to load welcome message:', error);
      setFallbackGreeting();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const setFallbackGreeting = useCallback(() => {
    const name = user?.firstName ? ` ${user.firstName}` : '';
    const greeting: ChatMessage = {
      id: `greeting-${Date.now()}`,
      role: 'assistant',
      content: `Hello${name}! 👋 I'm **Nova**, your AI assistant for Novunt.\n\nI can help you with:\n• 🎯 **Goal Staking** — creating, managing, and understanding your stakes\n• 💸 **Withdrawals & Deposits** — how to move funds\n• 🏆 **Ranks & Pools** — progression and qualification\n• 🤝 **Referrals** — building your team\n• 🔐 **Security** — 2FA, passwords, account safety\n\nWhat would you like to know?`,
      timestamp: new Date(),
    };
    setMessages([greeting]);
    setSuggestions([
      'How do I create a goal?',
      'What are the 6 ranks?',
      'How do I withdraw?',
      'How does the referral program work?',
    ]);
  }, [user?.firstName]);

  /**
   * Send a message to Nova AI backend
   * POST /api/assistant/chat with { message, conversationId }
   */
  const sendMessage = useCallback(
    async (content: string) => {
      if (!content.trim() || isLoading) return;

      setSuggestions([]);
      setQuickActions([]);

      const userMessage: ChatMessage = {
        id: `user-${Date.now()}`,
        role: 'user',
        content: content.trim(),
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, userMessage]);
      setIsLoading(true);

      const loadingMsg: ChatMessage = {
        id: `loading-${Date.now()}`,
        role: 'assistant',
        content: '',
        timestamp: new Date(),
        isLoading: true,
      };
      setMessages((prev) => [...prev, loadingMsg]);

      try {
        const response = await sendChatMessage(content.trim(), conversationId);

        if (response?.success && response.data) {
          const data = response.data;

          if (data.conversationId) {
            setConversationId(data.conversationId);
            if (typeof window !== 'undefined') {
              localStorage.setItem(CONVERSATION_ID_KEY, data.conversationId);
            }
          }

          const assistantMessage: ChatMessage = {
            id: `assistant-${Date.now()}`,
            role: 'assistant',
            content: data.message,
            timestamp: new Date(),
            source: data.metadata?.source as ResponseSource,
            sentiment: data.sentiment as Sentiment,
            category: data.category,
            confidence: data.metadata?.confidence,
            quickActions: data.quickActions,
            suggestions: data.suggestions,
            requiresEscalation: data.requiresEscalation,
          };

          setMessages((prev) =>
            prev.filter((msg) => !msg.isLoading).concat(assistantMessage)
          );
          setSuggestions(data.suggestions || []);
          setQuickActions(data.quickActions || []);
        } else {
          throw new Error(
            response?.error?.message || 'Failed to get a response'
          );
        }
      } catch (error) {
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
    [isLoading, conversationId]
  );

  /**
   * Load FAQs — optionally filtered by search or category
   */
  const loadFAQs = useCallback(
    async (search?: string, category?: string) => {
      setFaqLoading(true);
      try {
        const [faqResponse, catResponse] = await Promise.all([
          getFAQs({ search, category }),
          faqCategories.length === 0 ? getFAQCategories() : null,
        ]);

        if (faqResponse?.success && faqResponse.data) {
          const faqData =
            faqResponse.data.faqs || faqResponse.data.results || [];
          setFaqs(faqData);
        }

        if (catResponse?.success && catResponse.data) {
          setFaqCategories(catResponse.data.categories || []);
        }
      } catch (error) {
        console.error('[Nova] Failed to load FAQs:', error);
        toast.error('Failed to load FAQs');
      } finally {
        setFaqLoading(false);
      }
    },
    [faqCategories.length]
  );

  const searchFAQs = useCallback(
    async (query: string) => {
      setFaqSearchQuery(query);
      if (!query.trim()) {
        await loadFAQs(undefined, selectedFaqCategory || undefined);
        return;
      }
      await loadFAQs(query, selectedFaqCategory || undefined);
    },
    [loadFAQs, selectedFaqCategory]
  );

  const filterFAQsByCategory = useCallback(
    async (category: string | null) => {
      setSelectedFaqCategory(category);
      await loadFAQs(faqSearchQuery || undefined, category || undefined);
    },
    [loadFAQs, faqSearchQuery]
  );

  const switchView = useCallback(
    (view: ChatView) => {
      setCurrentView(view);
      if (view === 'faq' && faqs.length === 0) {
        loadFAQs();
      }
    },
    [faqs.length, loadFAQs]
  );

  const clearChat = useCallback(() => {
    setMessages([]);
    setConversationId(null);
    setSuggestions([]);
    setQuickActions([]);
    welcomeLoadedRef.current = false;
    if (typeof window !== 'undefined') {
      localStorage.removeItem(CONVERSATION_ID_KEY);
    }
  }, []);

  const toggleAssistant = useCallback(() => {
    setIsOpen((prev) => !prev);
  }, []);

  const closeAssistant = useCallback(() => {
    setIsOpen(false);
    setCurrentView('chat');
  }, []);

  return {
    messages,
    isOpen,
    isLoading,
    conversationId,
    suggestions,
    quickActions,
    messagesEndRef,
    sendMessage,
    clearChat,
    toggleAssistant,
    closeAssistant,
    currentView,
    switchView,
    faqs,
    faqCategories,
    faqLoading,
    faqSearchQuery,
    selectedFaqCategory,
    searchFAQs,
    filterFAQsByCategory,
    loadFAQs,
  };
}
