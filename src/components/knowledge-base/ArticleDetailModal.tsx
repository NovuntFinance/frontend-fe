'use client';

import React from 'react';
import { Clock, FileText, X } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogClose,
} from '@/components/ui/dialog';
import type { Article } from './ArticleCard';
import { sanitizeHTMLForDisplay } from '@/lib/sanitization';
import badgeStyles from '@/styles/badge-card.module.css';
import { cn } from '@/lib/utils';

interface ArticleDetailModalProps {
  article: Article | null;
  isOpen: boolean;
  onClose: () => void;
}

/**
 * Article Detail Modal
 * Neumorphic floating panel matching Achievements design system
 */
export function ArticleDetailModal({
  article,
  isOpen,
  onClose,
}: ArticleDetailModalProps) {
  if (!article) return null;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent
        className="gap-0 overflow-hidden !border-0 !bg-transparent p-0 !shadow-none sm:max-w-4xl"
        overlayClassName={badgeStyles.kbModalOverlay}
        showCloseButton={false}
      >
        <div className={cn(badgeStyles.kbModalContent, 'relative h-full')}>
          <div className="relative p-6 pt-14 sm:p-8 sm:pt-14">
            <DialogClose
              className={badgeStyles.kbModalCloseBtn}
              aria-label="Close"
            >
              <X className="h-5 w-5" strokeWidth={2} />
            </DialogClose>

            <DialogHeader className="space-y-3 text-left">
              <div className="flex items-start gap-3">
                <div
                  className={badgeStyles.kbArticleCardIcon}
                  style={{ flexShrink: 0 }}
                >
                  <FileText className="h-6 w-6" strokeWidth={2} />
                </div>
                <div className="min-w-0 flex-1">
                  <DialogTitle className={badgeStyles.kbModalTitle}>
                    {article.title}
                  </DialogTitle>
                  <DialogDescription className={badgeStyles.kbModalDescription}>
                    {article.description}
                  </DialogDescription>
                </div>
              </div>

              {/* Meta */}
              <div
                className={cn(
                  badgeStyles.kbModalDivider,
                  'mt-3 flex flex-wrap items-center gap-3 pt-3'
                )}
              >
                <div className="flex flex-wrap items-center gap-3">
                  {article.readTime && (
                    <span
                      className={badgeStyles.kbModalPill}
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 6,
                      }}
                    >
                      <Clock className="h-3.5 w-3.5" strokeWidth={2} />
                      {article.readTime} min read
                    </span>
                  )}
                  {article.category && (
                    <span
                      className={badgeStyles.kbModalPill}
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 6,
                      }}
                    >
                      <FileText className="h-3.5 w-3.5" strokeWidth={2} />
                      {article.category.replace('-', ' ')}
                    </span>
                  )}
                </div>
                {article.tags && article.tags.length > 0 && (
                  <div className="ml-auto flex flex-wrap gap-1.5">
                    {article.tags.map((tag) => (
                      <span key={tag} className={badgeStyles.kbModalPill}>
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </DialogHeader>

            {/* Article body */}
            <div
              className={cn(
                badgeStyles.kbModalBody,
                'mt-6 [&_code]:rounded [&_code]:px-1.5 [&_code]:py-0.5 [&_h1]:mt-6 [&_h1]:mb-4 [&_h2]:mt-5 [&_h2]:mb-3 [&_h3]:mt-4 [&_h3]:mb-2 [&_ol]:ml-6 [&_p]:mb-3 [&_ul]:ml-6 [&_table]:w-full [&_table]:border-collapse [&_table]:my-4 [&_td]:border [&_td]:border-[var(--neu-border)] [&_td]:px-3 [&_td]:py-2 [&_td]:text-sm [&_th]:border [&_th]:border-[var(--neu-border)] [&_th]:px-3 [&_th]:py-2 [&_th]:text-sm [&_th]:font-semibold'
              )}
            >
              {article.content ? (
                <div
                  dangerouslySetInnerHTML={{
                    __html: sanitizeHTMLForDisplay(article.content),
                  }}
                />
              ) : (
                <div className="space-y-4">
                  <p>
                    Full article content will be displayed here. This article
                    covers important information about{' '}
                    {article.title.toLowerCase()}.
                  </p>
                  <p>
                    For detailed information, please refer to the comprehensive
                    knowledge base documentation or ask the Novunt Assistant.
                  </p>
                </div>
              )}
            </div>

            {/* Footer */}
            <div
              className={cn(
                badgeStyles.kbModalFooter,
                'flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between'
              )}
            >
              <p className={badgeStyles.kbModalDescription}>
                Need more help? Try asking the Novunt Assistant.
              </p>
              <DialogClose className={badgeStyles.kbModalBtnPrimary}>
                Close
              </DialogClose>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
