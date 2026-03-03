/**
 * Nova Chat Widget — Main AI Assistant Chat Interface
 *
 * Features:
 *   - Real-time conversation with Nova AI (via backend API)
 *   - Markdown rendering for rich responses
 *   - Response source indicators (FAQ instant, AI-powered, fallback)
 *   - Sentiment-based styling
 *   - Quick action buttons (navigate, FAQ browser, escalate)
 *   - Suggestion chips
 *   - FAQ browser tab
 *   - Support ticket tab
 *   - Conversation feedback
 */

'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Send,
  User,
  Loader2,
  AlertCircle,
  MessageSquare,
  HelpCircle,
  Ticket,
  RotateCcw,
  ThumbsUp,
  ThumbsDown,
  Zap,
  Bot,
  FileText,
  ExternalLink,
} from 'lucide-react';
import { useNovuntAssistant, type ChatView } from '@/hooks/useNovuntAssistant';
import { submitFeedback } from '@/services/assistantApi';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { SupportEscalationForm } from './SupportEscalationForm';
import { FAQBrowser } from './FAQBrowser';
import { UserTicketsList } from './UserTicketsList';
import type { ChatMessage, QuickAction } from '@/types/assistant';

// Lazy-loaded react-markdown (ESM-only module)
let ReactMarkdown: React.ComponentType<any> | null = null;
let remarkGfm: any = null;

// Source badge config
const sourceConfig: Record<string, { label: string; icon: React.ReactNode }> = {
  faq: { label: 'Instant answer', icon: <Zap className="h-3 w-3" /> },
  ai: { label: 'AI-powered', icon: <Bot className="h-3 w-3" /> },
  fallback: {
    label: 'Cached response',
    icon: <FileText className="h-3 w-3" />,
  },
};

// Sentiment border colours
const sentimentBorder: Record<string, string> = {
  positive: 'border-l-emerald-400',
  neutral: 'border-l-blue-400',
  negative: 'border-l-red-400',
};

interface NovuntAssistantProps {
  isOpen: boolean;
  onClose: () => void;
}

export function NovuntAssistant({ isOpen, onClose }: NovuntAssistantProps) {
  const {
    messages,
    isLoading,
    sendMessage,
    clearChat,
    messagesEndRef,
    suggestions,
    quickActions,
    conversationId,
    currentView,
    switchView,
    faqs,
    faqCategories,
    faqLoading,
    faqSearchQuery,
    selectedFaqCategory,
    searchFAQs,
    filterFAQsByCategory,
  } = useNovuntAssistant();

  const [inputValue, setInputValue] = useState('');
  const [showEscalationForm, setShowEscalationForm] = useState(false);
  const [feedbackGiven, setFeedbackGiven] = useState(false);
  const [markdownReady, setMarkdownReady] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Dynamically load react-markdown (ESM-only)
  useEffect(() => {
    if (!markdownReady) {
      Promise.all([import('react-markdown'), import('remark-gfm')])
        .then(([md, gfm]) => {
          ReactMarkdown = md.default;
          remarkGfm = gfm.default;
          setMarkdownReady(true);
        })
        .catch(() => setMarkdownReady(false));
    }
  }, [markdownReady]);

  // Focus input when panel opens
  useEffect(() => {
    if (isOpen && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  const handleSend = () => {
    if (inputValue.trim() && !isLoading) {
      sendMessage(inputValue);
      setInputValue('');
      setFeedbackGiven(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleQuickAction = useCallback(
    (action: QuickAction) => {
      switch (action.action) {
        case 'navigate':
          if (action.target) window.location.href = action.target;
          break;
        case 'faq':
          switchView('faq');
          break;
        case 'escalate':
          setShowEscalationForm(true);
          break;
      }
    },
    [switchView]
  );

  const handleFeedback = async (helpful: boolean) => {
    if (!conversationId || feedbackGiven) return;
    try {
      await submitFeedback(conversationId, helpful);
      setFeedbackGiven(true);
    } catch {
      /* silent */
    }
  };

  const handleSuggestionClick = (s: string) => {
    sendMessage(s);
    setFeedbackGiven(false);
  };

  const handleFAQQuestionClick = (question: string) => {
    switchView('chat');
    sendMessage(question);
  };

  /** Render Markdown if the library loaded, otherwise plain text */
  const renderMessageContent = (content: string, isUserMsg: boolean) => {
    if (isUserMsg) {
      return (
        <div className="text-sm leading-relaxed whitespace-pre-wrap">
          {content}
        </div>
      );
    }
    if (markdownReady && ReactMarkdown) {
      const Md = ReactMarkdown;
      return (
        <div className="nova-markdown prose prose-sm dark:prose-invert max-w-none text-sm leading-relaxed">
          <Md remarkPlugins={remarkGfm ? [remarkGfm] : []}>{content}</Md>
        </div>
      );
    }
    return (
      <div className="text-sm leading-relaxed whitespace-pre-wrap">
        {content}
      </div>
    );
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
          />

          {/* ─── Chat Window ─── */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.2 }}
            className="fixed right-4 bottom-20 z-50 flex h-[650px] w-full max-w-md flex-col overflow-hidden rounded-2xl border border-white/20 bg-gradient-to-b from-white/95 via-white/90 to-white/95 shadow-2xl backdrop-blur-2xl sm:right-6 sm:bottom-24 dark:from-slate-900/95 dark:via-slate-900/90 dark:to-slate-900/95"
          >
            {/* ─── Header ─── */}
            <div className="flex items-center justify-between border-b border-white/20 bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-pink-500/10 p-3 dark:border-white/10">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="absolute inset-0 rounded-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 opacity-20 blur-lg" />
                  <div className="relative flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-purple-600">
                    <Bot className="h-5 w-5 text-white" />
                  </div>
                </div>
                <div>
                  <h3 className="text-foreground text-sm font-semibold">
                    Nova — AI Assistant
                  </h3>
                  <p className="text-muted-foreground text-[10px]">
                    Powered by Novunt AI
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={clearChat}
                  className="h-7 w-7"
                  title="New conversation"
                >
                  <RotateCcw className="h-3.5 w-3.5" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={onClose}
                  className="h-7 w-7"
                  aria-label="Close assistant"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* ─── Tabs ─── */}
            <div className="flex border-b border-white/10 bg-white/50 dark:bg-slate-800/50">
              {[
                {
                  key: 'chat' as ChatView,
                  label: 'Chat',
                  icon: <MessageSquare className="h-3.5 w-3.5" />,
                },
                {
                  key: 'faq' as ChatView,
                  label: 'FAQs',
                  icon: <HelpCircle className="h-3.5 w-3.5" />,
                },
                {
                  key: 'tickets' as ChatView,
                  label: 'My Tickets',
                  icon: <Ticket className="h-3.5 w-3.5" />,
                },
              ].map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => switchView(tab.key)}
                  className={cn(
                    'flex flex-1 items-center justify-center gap-1.5 px-3 py-2 text-xs font-medium transition-all',
                    currentView === tab.key
                      ? 'border-b-2 border-indigo-500 text-indigo-600 dark:text-indigo-400'
                      : 'text-muted-foreground hover:text-foreground'
                  )}
                >
                  {tab.icon}
                  {tab.label}
                </button>
              ))}
            </div>

            {/* ─── Content ─── */}
            <div className="flex-1 overflow-hidden">
              {/* ── Chat view ── */}
              {currentView === 'chat' && (
                <div className="flex h-full flex-col">
                  {/* Messages */}
                  <div className="custom-scrollbar flex-1 overflow-y-auto p-4">
                    <div className="space-y-4">
                      {messages.map((msg) => (
                        <MessageBubble
                          key={msg.id}
                          message={msg}
                          renderContent={renderMessageContent}
                          onQuickAction={handleQuickAction}
                        />
                      ))}

                      {/* Quick Actions */}
                      {quickActions.length > 0 && !isLoading && (
                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="flex flex-wrap gap-2 px-2"
                        >
                          {quickActions.map((qa, i) => (
                            <button
                              key={i}
                              onClick={() => handleQuickAction(qa)}
                              className="flex items-center gap-1.5 rounded-lg border border-indigo-200/50 bg-indigo-50 px-3 py-1.5 text-xs font-medium text-indigo-700 transition-colors hover:bg-indigo-100 dark:border-indigo-500/30 dark:bg-indigo-900/20 dark:text-indigo-300 dark:hover:bg-indigo-900/40"
                            >
                              {qa.icon && (
                                <span className="text-sm">{qa.icon}</span>
                              )}
                              {qa.label}
                              {qa.action === 'navigate' && (
                                <ExternalLink className="h-3 w-3 opacity-50" />
                              )}
                            </button>
                          ))}
                        </motion.div>
                      )}

                      {/* Suggestions */}
                      {suggestions.length > 0 && !isLoading && (
                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="flex flex-wrap gap-2 px-2"
                        >
                          {suggestions.map((s, i) => (
                            <motion.button
                              key={i}
                              whileHover={{ scale: 1.02 }}
                              whileTap={{ scale: 0.98 }}
                              onClick={() => handleSuggestionClick(s)}
                              disabled={isLoading}
                              className="rounded-full border border-indigo-300/50 bg-gradient-to-r from-indigo-50 to-purple-50 px-3 py-1.5 text-xs font-medium text-indigo-700 transition-all hover:border-indigo-400/70 hover:from-indigo-100 hover:to-purple-100 disabled:opacity-50 dark:border-indigo-500/30 dark:from-indigo-900/20 dark:to-purple-900/20 dark:text-indigo-300"
                            >
                              {s}
                            </motion.button>
                          ))}
                        </motion.div>
                      )}

                      {/* Escalation prompt */}
                      {messages.length > 0 &&
                        messages[messages.length - 1]?.requiresEscalation &&
                        !isLoading && (
                          <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="rounded-lg border border-amber-200 bg-amber-50 p-3 dark:border-amber-500/30 dark:bg-amber-900/20"
                          >
                            <p className="mb-2 text-xs text-amber-800 dark:text-amber-300">
                              Need more help? Connect with our support team.
                            </p>
                            <Button
                              size="sm"
                              onClick={() => setShowEscalationForm(true)}
                              className="bg-amber-600 text-xs hover:bg-amber-700"
                            >
                              <Ticket className="mr-1.5 h-3 w-3" />
                              Talk to Support
                            </Button>
                          </motion.div>
                        )}

                      {/* Feedback */}
                      {messages.length > 1 &&
                        !isLoading &&
                        !feedbackGiven &&
                        conversationId && (
                          <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="flex items-center justify-center gap-2 pt-2"
                          >
                            <span className="text-muted-foreground text-[10px]">
                              Was this helpful?
                            </span>
                            <button
                              onClick={() => handleFeedback(true)}
                              className="text-muted-foreground transition-colors hover:text-emerald-500"
                              title="Helpful"
                              aria-label="Helpful"
                            >
                              <ThumbsUp className="h-3.5 w-3.5" />
                            </button>
                            <button
                              onClick={() => handleFeedback(false)}
                              className="text-muted-foreground transition-colors hover:text-red-500"
                              title="Not helpful"
                              aria-label="Not helpful"
                            >
                              <ThumbsDown className="h-3.5 w-3.5" />
                            </button>
                          </motion.div>
                        )}
                      {feedbackGiven && (
                        <p className="text-muted-foreground text-center text-[10px]">
                          Thanks for your feedback!
                        </p>
                      )}

                      <div ref={messagesEndRef} />
                    </div>
                  </div>

                  {/* Input */}
                  <div className="bg-background/50 border-t border-white/20 p-3 dark:border-white/10">
                    <div className="flex gap-2">
                      <Input
                        ref={inputRef}
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="Ask Nova anything..."
                        disabled={isLoading}
                        className="flex-1 text-sm"
                        maxLength={2000}
                      />
                      <Button
                        onClick={handleSend}
                        disabled={!inputValue.trim() || isLoading}
                        size="icon"
                        className="bg-gradient-to-br from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700"
                      >
                        <Send className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="mt-1.5 flex items-center justify-between">
                      <p className="text-muted-foreground text-[10px]">
                        Powered by Nova
                      </p>
                      <button
                        onClick={() => setShowEscalationForm(true)}
                        className="text-muted-foreground hover:text-foreground flex items-center gap-1 text-[10px] transition-colors"
                      >
                        <Ticket className="h-3 w-3" />
                        Create ticket
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* ── FAQ view ── */}
              {currentView === 'faq' && (
                <FAQBrowser
                  faqs={faqs}
                  categories={faqCategories}
                  loading={faqLoading}
                  searchQuery={faqSearchQuery}
                  selectedCategory={selectedFaqCategory}
                  onSearch={searchFAQs}
                  onCategorySelect={filterFAQsByCategory}
                  onQuestionClick={handleFAQQuestionClick}
                />
              )}

              {/* ── Tickets view ── */}
              {currentView === 'tickets' && (
                <UserTicketsList
                  onCreateTicket={() => setShowEscalationForm(true)}
                  conversationId={conversationId}
                />
              )}
            </div>
          </motion.div>

          {/* Escalation Form modal */}
          {showEscalationForm && (
            <SupportEscalationForm
              isOpen={showEscalationForm}
              onClose={() => setShowEscalationForm(false)}
              conversationId={conversationId || undefined}
            />
          )}
        </>
      )}
    </AnimatePresence>
  );
}

// ─── Message Bubble ──────────────────────────────────────────────────
function MessageBubble({
  message,
  renderContent,
}: {
  message: ChatMessage;
  renderContent: (content: string, isUser: boolean) => React.ReactNode;
  onQuickAction: (qa: QuickAction) => void;
}) {
  const isUser = message.role === 'user';
  const source = message.source;
  const sentiment = message.sentiment;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.15 }}
      className={cn('flex gap-2.5', isUser ? 'justify-end' : 'justify-start')}
    >
      {!isUser && (
        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-purple-600">
          <Bot className="h-3.5 w-3.5 text-white" />
        </div>
      )}

      <div className="max-w-[85%] space-y-1">
        <div
          className={cn(
            'rounded-2xl px-3.5 py-2.5 shadow-sm',
            isUser
              ? 'bg-gradient-to-br from-indigo-500 to-purple-600 text-white'
              : cn(
                  'bg-muted/50 text-foreground border-l-2',
                  sentiment
                    ? sentimentBorder[sentiment] || 'border-l-transparent'
                    : 'border-l-transparent'
                ),
            message.isLoading && 'animate-pulse',
            message.error && 'border-destructive/50 border'
          )}
        >
          {message.isLoading ? (
            <div className="flex items-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span className="text-sm">Nova is thinking...</span>
            </div>
          ) : message.error ? (
            <div className="flex items-start gap-2">
              <AlertCircle className="text-destructive mt-0.5 h-4 w-4 shrink-0" />
              <div className="text-sm">{message.content}</div>
            </div>
          ) : (
            renderContent(message.content, isUser)
          )}
        </div>

        {/* Source badge */}
        {!isUser && source && sourceConfig[source] && (
          <div className="flex items-center gap-1 px-1">
            <span className="text-muted-foreground flex items-center gap-1 text-[10px]">
              {sourceConfig[source].icon}
              {sourceConfig[source].label}
            </span>
            {message.confidence !== undefined && (
              <span className="text-muted-foreground text-[10px]">
                ({Math.round(message.confidence * 100)}% match)
              </span>
            )}
          </div>
        )}
      </div>

      {isUser && (
        <div className="bg-muted flex h-7 w-7 shrink-0 items-center justify-center rounded-full">
          <User className="text-muted-foreground h-3.5 w-3.5" />
        </div>
      )}
    </motion.div>
  );
}
