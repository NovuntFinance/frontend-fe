'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { FileText, Clock } from 'lucide-react';
import { prefersReducedMotion } from '@/lib/accessibility';
import badgeStyles from '@/styles/badge-card.module.css';

export interface Article {
  id: string;
  title: string;
  description: string;
  category: string;
  readTime?: number; // in minutes
  tags?: string[];
  content?: string; // Full article content (markdown or HTML)
}

interface ArticleCardProps {
  article: Article;
  onClick?: () => void;
  index?: number;
}

/**
 * Article Card Component
 * Neumorphic card matching Achievements design system
 */
export function ArticleCard({ article, onClick, index = 0 }: ArticleCardProps) {
  const reducedMotion = prefersReducedMotion();

  return (
    <motion.div
      initial={reducedMotion ? false : { opacity: 0, y: 20 }}
      animate={reducedMotion ? false : { opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
    >
      <button
        type="button"
        onClick={onClick}
        className={badgeStyles.kbArticleCard}
      >
        <div className="flex items-start gap-3">
          <div className={badgeStyles.kbArticleCardIcon}>
            <FileText className="h-5 w-5" strokeWidth={2} />
          </div>
          <div className="min-w-0 flex-1 text-left">
            <h3 className={badgeStyles.kbArticleCardTitle}>{article.title}</h3>
            {article.readTime && (
              <div className={badgeStyles.kbArticleCardMeta}>
                <Clock
                  className="mr-1.5 inline-block h-3.5 w-3.5"
                  strokeWidth={2}
                  aria-hidden
                />
                {article.readTime} min read
              </div>
            )}
            <p className={badgeStyles.kbArticleCardDesc}>
              {article.description}
            </p>
            {article.tags && article.tags.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-1.5">
                {article.tags.slice(0, 3).map((tag) => (
                  <span key={tag} className={badgeStyles.kbArticleCardTag}>
                    {tag}
                  </span>
                ))}
                {article.tags.length > 3 && (
                  <span className={badgeStyles.kbArticleCardTag}>
                    +{article.tags.length - 3}
                  </span>
                )}
              </div>
            )}
          </div>
        </div>
      </button>
    </motion.div>
  );
}
