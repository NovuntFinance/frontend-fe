/**
 * Novunt Assistant Component
 * AI-powered chat interface with warm, human-centered design
 */

'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Send,
  Bot,
  User,
  Sparkles,
  AlertCircle,
  Loader2,
  HelpCircle,
} from 'lucide-react';
import { useNovuntAssistant } from '@/hooks/useNovuntAssistant';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { slideUp } from '@/design-system/animations';
import { SupportEscalationForm } from './SupportEscalationForm';
import type { HTMLMotionProps } from 'framer-motion';

interface NovuntAssistantProps {
  isOpen: boolean;
  onClose: () => void;
}

export function NovuntAssistant({ isOpen, onClose }: NovuntAssistantProps) {
  const { messages, isLoading, sendMessage, messagesEndRef, suggestions } =
    useNovuntAssistant();
  const [inputValue, setInputValue] = useState('');
  const [showEscalationForm, setShowEscalationForm] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Focus input when opened
  useEffect(() => {
    if (isOpen && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  const handleSend = () => {
    if (inputValue.trim() && !isLoading) {
      sendMessage(inputValue);
      setInputValue('');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const formatMessage = (content: string) => {
    // Simple markdown-like formatting
    return content.split('\n').map((line, index) => {
      // Bold text
      const boldRegex = /\*\*(.*?)\*\*/g;
      let formattedLine = line.replace(boldRegex, '<strong>$1</strong>');

      // Numbered lists
      if (/^\d+\.\s/.test(formattedLine)) {
        formattedLine = formattedLine.replace(
          /^(\d+\.\s)/,
          '<span class="font-semibold text-primary">$1</span>'
        );
      }

      return (
        <React.Fragment key={index}>
          <span dangerouslySetInnerHTML={{ __html: formattedLine }} />
          {index < content.split('\n').length - 1 && <br />}
        </React.Fragment>
      );
    });
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

          {/* Chat Window */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.2 }}
            className="fixed right-4 bottom-20 z-50 flex h-[600px] w-full max-w-md flex-col overflow-hidden rounded-2xl border border-white/20 bg-gradient-to-b from-white/95 via-white/90 to-white/95 shadow-2xl backdrop-blur-2xl sm:right-6 sm:bottom-24 dark:from-slate-900/95 dark:via-slate-900/90 dark:to-slate-900/95"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-white/20 bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-pink-500/10 p-4 dark:border-white/10">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="absolute inset-0 rounded-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 opacity-20 blur-lg" />
                  <div className="relative flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-purple-600">
                    <Sparkles className="h-5 w-5 text-white" />
                  </div>
                </div>
                <div>
                  <h3 className="text-foreground font-semibold">
                    Novunt Assistant
                  </h3>
                  <p className="text-muted-foreground text-xs">
                    Always here to help
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setShowEscalationForm(true)}
                  className="h-8 w-8"
                  aria-label="Escalate to human support"
                >
                  <HelpCircle className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={onClose}
                  className="h-8 w-8"
                  aria-label="Close assistant"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Messages Area */}
            <div className="custom-scrollbar flex-1 overflow-y-auto p-4">
              <div className="space-y-4">
                {messages.map((message) => (
                  <motion.div
                    key={message.id}
                    {...(slideUp() as Partial<HTMLMotionProps<'div'>>)}
                    className={cn(
                      'flex gap-3',
                      message.role === 'user' ? 'justify-end' : 'justify-start'
                    )}
                  >
                    {message.role === 'assistant' && (
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-purple-600">
                        <Bot className="h-4 w-4 text-white" />
                      </div>
                    )}

                    <div
                      className={cn(
                        'max-w-[80%] rounded-2xl px-4 py-3 shadow-sm',
                        message.role === 'user'
                          ? 'bg-gradient-to-br from-indigo-500 to-purple-600 text-white'
                          : 'bg-muted/50 text-foreground',
                        message.isLoading && 'animate-pulse',
                        message.error && 'border-destructive/50 border'
                      )}
                    >
                      {message.isLoading ? (
                        <div className="flex items-center gap-2">
                          <Loader2 className="h-4 w-4 animate-spin" />
                          <span className="text-sm">Thinking...</span>
                        </div>
                      ) : message.error ? (
                        <div className="flex items-start gap-2">
                          <AlertCircle className="text-destructive h-4 w-4 shrink-0" />
                          <div className="text-sm">{message.content}</div>
                        </div>
                      ) : (
                        <div className="text-sm leading-relaxed">
                          {formatMessage(message.content)}
                        </div>
                      )}
                    </div>

                    {message.role === 'user' && (
                      <div className="bg-muted flex h-8 w-8 shrink-0 items-center justify-center rounded-full">
                        <User className="text-muted-foreground h-4 w-4" />
                      </div>
                    )}
                  </motion.div>
                ))}
                <div ref={messagesEndRef} />
              </div>
            </div>

            {/* Input Area */}
            <div className="bg-background/50 border-t border-white/20 p-4 dark:border-white/10">
              <div className="flex gap-2">
                <Input
                  ref={inputRef}
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Ask me anything about Novunt..."
                  disabled={isLoading}
                  className="flex-1"
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
              <p className="text-muted-foreground mt-2 text-xs">
                💡 Tip: Ask about staking, ranks, teams, or your account
              </p>
            </div>
          </motion.div>

          {/* Support Escalation Form */}
          {showEscalationForm && (
            <SupportEscalationForm
              isOpen={showEscalationForm}
              onClose={() => setShowEscalationForm(false)}
            />
          )}
        </>
      )}
    </AnimatePresence>
  );
}
