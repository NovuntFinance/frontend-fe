'use client';

import React from 'react';
import { Clock, FileText } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import type { Article } from './ArticleCard';
import { sanitizeHTMLForDisplay } from '@/lib/sanitization';

interface ArticleDetailModalProps {
  article: Article | null;
  isOpen: boolean;
  onClose: () => void;
}

/**
 * Article Detail Modal
 * Displays full article content in a modal dialog
 */
export function ArticleDetailModal({
  article,
  isOpen,
  onClose,
}: ArticleDetailModalProps) {
  if (!article) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent
        className="max-h-[90vh] max-w-4xl overflow-y-auto"
        showCloseButton={true}
      >
        <DialogHeader className="space-y-3">
          <div className="flex items-start justify-between gap-4">
            <div className="flex min-w-0 flex-1 items-center gap-3">
              <div className="flex-shrink-0 rounded-xl bg-indigo-500/10 p-3">
                <FileText className="h-6 w-6 text-indigo-500" />
              </div>
              <div className="min-w-0 flex-1">
                <DialogTitle className="text-xl font-bold sm:text-2xl">
                  {article.title}
                </DialogTitle>
                <DialogDescription className="mt-2 text-sm sm:text-base">
                  {article.description}
                </DialogDescription>
              </div>
            </div>
          </div>

          {/* Meta Information */}
          <div className="border-border/50 flex flex-wrap items-center gap-3 border-t pt-3">
            <div className="flex flex-wrap items-center gap-3">
              {article.readTime && (
                <div className="text-muted-foreground flex items-center gap-1.5 text-xs">
                  <Clock className="h-3.5 w-3.5 flex-shrink-0" />
                  <span>{article.readTime} min read</span>
                </div>
              )}
              {article.category && (
                <div className="text-muted-foreground flex items-center gap-1.5 text-xs">
                  <FileText className="h-3.5 w-3.5 flex-shrink-0" />
                  <span className="capitalize">
                    {article.category.replace('-', ' ')}
                  </span>
                </div>
              )}
            </div>
            {article.tags && article.tags.length > 0 && (
              <div className="ml-auto flex flex-wrap gap-1.5">
                {article.tags.map((tag) => (
                  <Badge
                    key={tag}
                    variant="secondary"
                    className="bg-indigo-500/10 text-xs text-indigo-700 dark:text-indigo-400"
                  >
                    {tag}
                  </Badge>
                ))}
              </div>
            )}
          </div>
        </DialogHeader>

        {/* Article Content */}
        <div className="prose prose-sm dark:prose-invert mt-6 max-w-none">
          {article.content ? (
            <div
              className="text-foreground [&_code]:bg-muted space-y-4 text-sm leading-relaxed sm:text-base [&_code]:rounded [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:text-sm [&_h1]:mt-6 [&_h1]:mb-4 [&_h1]:text-xl [&_h1]:font-bold [&_h2]:mt-5 [&_h2]:mb-3 [&_h2]:text-lg [&_h2]:font-semibold [&_h3]:mt-4 [&_h3]:mb-2 [&_h3]:text-base [&_h3]:font-semibold [&_ol]:ml-6 [&_ol]:list-decimal [&_ol]:space-y-2 [&_p]:mb-3 [&_strong]:font-semibold [&_ul]:ml-6 [&_ul]:list-disc [&_ul]:space-y-2"
              dangerouslySetInnerHTML={{
                __html: sanitizeHTMLForDisplay(article.content),
              }}
            />
          ) : (
            <div className="text-muted-foreground space-y-4 text-sm leading-relaxed sm:text-base">
              <p>
                Full article content will be displayed here. This article covers
                important information about {article.title.toLowerCase()}.
              </p>
              <p>
                For detailed information, please refer to the comprehensive
                knowledge base documentation or ask the Novunt Assistant.
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-border/50 mt-8 flex flex-col gap-3 border-t pt-6 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-muted-foreground text-xs">
            Need more help? Try asking the Novunt Assistant.
          </p>
          <button
            onClick={onClose}
            className="self-start text-xs font-medium text-indigo-600 transition-colors hover:text-indigo-700 sm:self-auto dark:text-indigo-400 dark:hover:text-indigo-300"
          >
            Close
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
