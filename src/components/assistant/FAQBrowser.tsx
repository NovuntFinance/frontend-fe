/**
 * FAQ Browser — Searchable FAQ interface inside the Nova chat widget
 *
 * Features:
 *   - Category tabs with icons
 *   - Real-time search
 *   - Expandable FAQ cards with answers
 *   - "Related questions" links that fire a chat message
 */

'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  Loader2,
  ChevronDown,
  ChevronUp,
  MessageSquare,
  HelpCircle,
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import type { FAQEntry, FAQCategory } from '@/types/assistant';

interface FAQBrowserProps {
  faqs: FAQEntry[];
  categories: FAQCategory[];
  loading: boolean;
  searchQuery: string;
  selectedCategory: string | null;
  onSearch: (query: string) => void;
  onCategorySelect: (category: string | null) => void;
  onQuestionClick: (question: string) => void;
}

export function FAQBrowser({
  faqs,
  categories,
  loading,
  searchQuery,
  selectedCategory,
  onSearch,
  onCategorySelect,
  onQuestionClick,
}: FAQBrowserProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const searchRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(null);

  // Focus search on mount
  useEffect(() => {
    searchRef.current?.focus();
  }, []);

  const handleSearchChange = (value: string) => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => onSearch(value), 300);
  };

  const toggleExpand = (question: string) => {
    setExpandedId((prev) => (prev === question ? null : question));
  };

  return (
    <div className="flex h-full flex-col">
      {/* Search bar */}
      <div className="border-b border-white/10 p-3">
        <div className="relative">
          <Search className="text-muted-foreground absolute top-1/2 left-2.5 h-3.5 w-3.5 -translate-y-1/2" />
          <Input
            ref={searchRef}
            defaultValue={searchQuery}
            onChange={(e) => handleSearchChange(e.target.value)}
            placeholder="Search FAQs..."
            className="h-8 pl-8 text-xs"
          />
        </div>
      </div>

      {/* Category chips */}
      {categories.length > 0 && (
        <div className="flex gap-1.5 overflow-x-auto border-b border-white/10 px-3 py-2">
          <button
            onClick={() => onCategorySelect(null)}
            className={cn(
              'shrink-0 rounded-full px-2.5 py-1 text-[10px] font-medium transition-colors',
              !selectedCategory
                ? 'bg-indigo-500 text-white'
                : 'bg-muted text-muted-foreground hover:text-foreground'
            )}
          >
            All
          </button>
          {categories.map((cat) => (
            <button
              key={cat.category}
              onClick={() => onCategorySelect(cat.category)}
              className={cn(
                'flex shrink-0 items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-medium transition-colors',
                selectedCategory === cat.category
                  ? 'bg-indigo-500 text-white'
                  : 'bg-muted text-muted-foreground hover:text-foreground'
              )}
            >
              {cat.icon && <span>{cat.icon}</span>}
              {cat.category}
              <span className="opacity-60">({cat.count})</span>
            </button>
          ))}
        </div>
      )}

      {/* FAQ list */}
      <div className="custom-scrollbar flex-1 overflow-y-auto p-3">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <Loader2 className="text-muted-foreground mb-2 h-6 w-6 animate-spin" />
            <p className="text-muted-foreground text-xs">Loading FAQs...</p>
          </div>
        ) : faqs.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <HelpCircle className="text-muted-foreground mb-2 h-8 w-8" />
            <p className="text-muted-foreground text-sm font-medium">
              No FAQs found
            </p>
            <p className="text-muted-foreground mt-1 text-xs">
              {searchQuery
                ? 'Try a different search term'
                : 'FAQs will appear here'}
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {faqs.map((faq) => {
              const isExpanded = expandedId === faq.question;
              return (
                <div
                  key={faq.question}
                  className="overflow-hidden rounded-lg border border-white/10 bg-white/50 dark:bg-slate-800/50"
                >
                  {/* Question header */}
                  <button
                    onClick={() => toggleExpand(faq.question)}
                    className="flex w-full items-start justify-between gap-2 p-3 text-left text-xs font-medium transition-colors hover:bg-white/80 dark:hover:bg-slate-700/50"
                  >
                    <span className="flex-1">{faq.question}</span>
                    {isExpanded ? (
                      <ChevronUp className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                    ) : (
                      <ChevronDown className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                    )}
                  </button>

                  {/* Expandable answer */}
                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.15 }}
                        className="overflow-hidden"
                      >
                        <div className="border-t border-white/10 px-3 pt-2 pb-3">
                          <p className="text-muted-foreground mb-2 text-xs leading-relaxed whitespace-pre-wrap">
                            {faq.answer}
                          </p>

                          {/* Category tag */}
                          {faq.category && (
                            <span className="mb-2 inline-block rounded-full bg-indigo-100 px-2 py-0.5 text-[10px] font-medium text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300">
                              {faq.category}
                            </span>
                          )}

                          {/* Related questions */}
                          {faq.relatedQuestions &&
                            faq.relatedQuestions.length > 0 && (
                              <div className="mt-2 space-y-1">
                                <p className="text-muted-foreground text-[10px] font-medium">
                                  Related:
                                </p>
                                {faq.relatedQuestions.map((q, i) => (
                                  <button
                                    key={i}
                                    onClick={() => onQuestionClick(q)}
                                    className="flex w-full items-center gap-1.5 rounded px-2 py-1 text-left text-[10px] text-indigo-600 transition-colors hover:bg-indigo-50 dark:text-indigo-400 dark:hover:bg-indigo-900/20"
                                  >
                                    <MessageSquare className="h-3 w-3 shrink-0" />
                                    {q}
                                  </button>
                                ))}
                              </div>
                            )}

                          {/* Ask Nova button */}
                          <button
                            onClick={() => onQuestionClick(faq.question)}
                            className="mt-2 flex items-center gap-1.5 rounded-full bg-indigo-50 px-3 py-1 text-[10px] font-medium text-indigo-700 transition-colors hover:bg-indigo-100 dark:bg-indigo-900/20 dark:text-indigo-300 dark:hover:bg-indigo-900/40"
                          >
                            <MessageSquare className="h-3 w-3" />
                            Ask Nova about this
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
