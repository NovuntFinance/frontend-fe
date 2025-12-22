'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { FileText, Clock, ArrowRight } from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { prefersReducedMotion } from '@/lib/accessibility';

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
 * Displays a knowledge base article in a card format
 */
export function ArticleCard({ article, onClick, index = 0 }: ArticleCardProps) {
  const reducedMotion = prefersReducedMotion();

  return (
    <motion.div
      initial={reducedMotion ? false : { opacity: 0, y: 20 }}
      animate={reducedMotion ? false : { opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      whileHover={reducedMotion ? {} : { y: -2, scale: 1.01 }}
      onClick={onClick}
      className="cursor-pointer"
    >
      <Card className="bg-card/50 group relative h-full overflow-hidden border-0 shadow-md backdrop-blur-sm transition-all duration-300 hover:border-indigo-500/20 hover:shadow-lg">
        {/* Subtle gradient on hover */}
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/0 via-blue-500/0 to-transparent transition-all duration-300 group-hover:from-indigo-500/5 group-hover:via-blue-500/5" />

        <CardHeader className="relative p-4 sm:p-5">
          <div className="mb-2 flex items-start justify-between gap-2">
            <div className="flex items-center gap-2">
              <div className="rounded-lg bg-indigo-500/10 p-2 transition-colors group-hover:bg-indigo-500/20">
                <FileText className="h-4 w-4 text-indigo-500 sm:h-5 sm:w-5" />
              </div>
              <div className="min-w-0 flex-1">
                <CardTitle className="text-foreground mb-1 line-clamp-2 text-sm font-semibold sm:text-base">
                  {article.title}
                </CardTitle>
                {article.readTime && (
                  <div className="text-muted-foreground flex items-center gap-1.5 text-xs">
                    <Clock className="h-3 w-3" />
                    <span>{article.readTime} min read</span>
                  </div>
                )}
              </div>
            </div>
            <ArrowRight className="text-muted-foreground h-4 w-4 flex-shrink-0 opacity-0 transition-opacity group-hover:opacity-100 sm:h-5 sm:w-5" />
          </div>
        </CardHeader>

        <CardContent className="relative p-4 pt-0 sm:p-5 sm:pt-0">
          <CardDescription className="text-muted-foreground line-clamp-2 text-xs sm:text-sm">
            {article.description}
          </CardDescription>

          {article.tags && article.tags.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-1.5">
              {article.tags.slice(0, 3).map((tag) => (
                <Badge
                  key={tag}
                  variant="secondary"
                  className="bg-indigo-500/10 text-[10px] text-indigo-700 hover:bg-indigo-500/20 dark:text-indigo-400"
                >
                  {tag}
                </Badge>
              ))}
              {article.tags.length > 3 && (
                <Badge
                  variant="secondary"
                  className="bg-muted text-muted-foreground text-[10px]"
                >
                  +{article.tags.length - 3}
                </Badge>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}
