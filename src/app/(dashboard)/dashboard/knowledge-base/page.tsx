'use client';

import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  FileText,
  Star,
  Wallet,
  TrendingUp,
  Award,
  Users,
  Shield,
  Search,
  X,
} from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { prefersReducedMotion } from '@/lib/accessibility';
import {
  searchArticles,
  getArticlesByCategory,
  knowledgeBaseArticles,
} from '@/data/knowledgeBaseArticles';
import { ArticleCard } from '@/components/knowledge-base/ArticleCard';
import { ArticleDetailModal } from '@/components/knowledge-base/ArticleDetailModal';
import { Button } from '@/components/ui/button';
import type { Article } from '@/components/knowledge-base/ArticleCard';

/**
 * Knowledge Base Page
 * Provides articles and documentation about Novunt platform
 */

// Knowledge Base Categories
interface KnowledgeCategory {
  id: string;
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  iconColor: string;
  gradient: string;
  articleCount: number;
  articles: string[];
}

const knowledgeCategories: KnowledgeCategory[] = [
  {
    id: 'getting-started',
    title: 'Getting Started',
    description: 'New to Novunt? Start here to learn the basics',
    icon: Star,
    iconColor: 'text-blue-500',
    gradient: 'from-blue-500/20 via-cyan-500/10 to-transparent',
    articleCount: 1,
    articles: ['Platform Overview', 'Getting Started Guide'],
  },
  {
    id: 'wallets-finance',
    title: 'Wallets & Finance',
    description: 'Understanding wallets, deposits, and withdrawals',
    icon: Wallet,
    iconColor: 'text-emerald-500',
    gradient: 'from-emerald-500/20 via-teal-500/10 to-transparent',
    articleCount: 4,
    articles: [
      'Two-Wallet System',
      'Deposits & Funding',
      'Withdrawals',
      'P2P Transfers',
    ],
  },
  {
    id: 'staking-goals',
    title: 'Staking & Goals',
    description: 'Learn how to create goals and stake effectively',
    icon: TrendingUp,
    iconColor: 'text-purple-500',
    gradient: 'from-purple-500/20 via-indigo-500/10 to-transparent',
    articleCount: 2,
    articles: ['Goal-Based Staking System', 'Daily Profit Distribution (ROS)'],
  },
  {
    id: 'earning-systems',
    title: 'Earning Systems',
    description: 'Pools, referrals, bonuses, and how to maximize earnings',
    icon: Award,
    iconColor: 'text-amber-500',
    gradient: 'from-amber-500/20 via-orange-500/10 to-transparent',
    articleCount: 4,
    articles: [
      'Three-Tier Pool System',
      'Referral Bonus System',
      'Registration Bonus',
      'Achievement System & NXP',
    ],
  },
  {
    id: 'ranks-teams',
    title: 'Ranks & Teams',
    description: 'Rank progression, team building, and leadership',
    icon: Users,
    iconColor: 'text-pink-500',
    gradient: 'from-pink-500/20 via-rose-500/10 to-transparent',
    articleCount: 2,
    articles: [
      'Rank System & Progression',
      'Profile Completion & Social Media',
    ],
  },
  {
    id: 'security-account',
    title: 'Security & Account',
    description: 'Account security, authentication, and best practices',
    icon: Shield,
    iconColor: 'text-indigo-500',
    gradient: 'from-indigo-500/20 via-blue-500/10 to-transparent',
    articleCount: 2,
    articles: [
      'Security & Authentication',
      'Common Questions & Troubleshooting',
    ],
  },
];

export default function KnowledgeBasePage() {
  const reducedMotion = prefersReducedMotion();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Filter articles based on search query or category
  const filteredArticles = useMemo(() => {
    if (searchQuery.trim()) {
      return searchArticles(searchQuery);
    }
    if (selectedCategory) {
      return getArticlesByCategory(selectedCategory);
    }
    return [];
  }, [searchQuery, selectedCategory]);

  const handleArticleClick = (article: Article) => {
    setSelectedArticle(article);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedArticle(null);
  };

  const clearSearch = () => {
    setSearchQuery('');
  };

  const handleCategoryClick = (categoryId: string) => {
    setSelectedCategory(categoryId);
    setSearchQuery(''); // Clear search when selecting category
  };

  const clearCategoryFilter = () => {
    setSelectedCategory(null);
  };

  const selectedCategoryData = knowledgeCategories.find(
    (cat) => cat.id === selectedCategory
  );

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Page Header */}
      <motion.div
        initial={reducedMotion ? false : { opacity: 0, y: 20 }}
        animate={reducedMotion ? false : { opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <Card className="bg-card/50 group relative overflow-hidden border-0 shadow-lg backdrop-blur-sm transition-shadow duration-300 hover:shadow-xl">
          {/* Animated Gradient Background */}
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/20 via-blue-500/10 to-transparent" />

          {/* Animated Floating Blob */}
          {!reducedMotion && (
            <motion.div
              animate={{
                x: [0, -15, 0],
                y: [0, 10, 0],
                scale: [1, 1.15, 1],
              }}
              transition={{
                duration: 6,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
              className="absolute -bottom-8 -left-12 h-24 w-24 rounded-full bg-indigo-500/30 blur-2xl"
            />
          )}

          <CardHeader className="relative p-4 sm:p-6">
            <div className="mb-4 flex items-center gap-2 sm:gap-3">
              <motion.div
                whileHover={{ scale: 1.1, rotate: -10 }}
                className="rounded-xl bg-gradient-to-br from-indigo-500/30 to-blue-500/20 p-2 shadow-lg backdrop-blur-sm sm:p-3"
              >
                <FileText className="h-5 w-5 text-indigo-500 sm:h-6 sm:w-6" />
              </motion.div>
              <div className="min-w-0 flex-1">
                <CardTitle className="bg-gradient-to-r from-indigo-600 to-blue-600 bg-clip-text text-sm font-bold text-transparent sm:text-base md:text-lg">
                  Knowledge Base
                </CardTitle>
                <CardDescription className="text-[10px] sm:text-xs">
                  Learn more about Novunt platform and how to maximize your
                  earnings
                </CardDescription>
              </div>
            </div>

            {/* Search Bar */}
            <div className="relative">
              <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
              <Input
                type="text"
                placeholder="Search articles..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-background/50 h-11 w-full border-white/20 pr-10 pl-10 backdrop-blur-sm focus:border-indigo-500/50"
              />
              {searchQuery && (
                <button
                  onClick={clearSearch}
                  className="text-muted-foreground hover:text-foreground absolute top-1/2 right-3 -translate-y-1/2 transition-colors"
                  aria-label="Clear search"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
          </CardHeader>
        </Card>
      </motion.div>

      {/* Category Filter Active - Show Back Button */}
      {selectedCategory && !searchQuery.trim() && (
        <motion.div
          initial={reducedMotion ? false : { opacity: 0, y: 20 }}
          animate={reducedMotion ? false : { opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
        >
          <Card className="bg-card/50 group relative overflow-hidden border-0 shadow-lg backdrop-blur-sm transition-shadow duration-300 hover:shadow-xl">
            {/* Animated Gradient Background */}
            {selectedCategoryData && (
              <div
                className={`absolute inset-0 bg-gradient-to-br ${selectedCategoryData.gradient}`}
              />
            )}
            <CardContent className="relative p-4 sm:p-6">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex min-w-0 flex-1 items-center gap-3">
                  {selectedCategoryData && (
                    <>
                      <div
                        className={`rounded-xl bg-gradient-to-br ${selectedCategoryData.gradient.replace('/20', '/30').replace('/10', '/20')} flex-shrink-0 p-2 shadow-lg backdrop-blur-sm`}
                      >
                        {React.createElement(selectedCategoryData.icon, {
                          className: `h-5 w-5 ${selectedCategoryData.iconColor} sm:h-6 sm:w-6`,
                        })}
                      </div>
                      <div className="min-w-0 flex-1">
                        <h3 className="truncate text-sm font-semibold sm:text-base">
                          {selectedCategoryData.title}
                        </h3>
                        <p className="text-muted-foreground text-xs sm:text-sm">
                          {filteredArticles.length}{' '}
                          {filteredArticles.length === 1
                            ? 'article'
                            : 'articles'}
                        </p>
                      </div>
                    </>
                  )}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={clearCategoryFilter}
                  className="h-9 flex-shrink-0"
                >
                  <X className="mr-2 h-4 w-4" />
                  <span className="hidden sm:inline">Clear Filter</span>
                  <span className="sm:hidden">Clear</span>
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Search Results or Category Articles */}
      {(searchQuery.trim() || selectedCategory) && (
        <motion.div
          initial={reducedMotion ? false : { opacity: 0, y: 20 }}
          animate={reducedMotion ? false : { opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="bg-card/50 border-0 shadow-lg backdrop-blur-sm">
            <CardHeader className="p-4 sm:p-6">
              <CardTitle className="text-sm font-semibold sm:text-base">
                {searchQuery.trim()
                  ? 'Search Results'
                  : selectedCategoryData
                    ? selectedCategoryData.title
                    : 'Articles'}
                {filteredArticles.length > 0 && (
                  <span className="text-muted-foreground ml-2 font-normal">
                    ({filteredArticles.length}{' '}
                    {filteredArticles.length === 1 ? 'article' : 'articles'})
                  </span>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-0 sm:p-6 sm:pt-0">
              {filteredArticles.length > 0 ? (
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3">
                  {filteredArticles.map((article, index) => (
                    <ArticleCard
                      key={article.id}
                      article={article}
                      onClick={() => handleArticleClick(article)}
                      index={index}
                    />
                  ))}
                </div>
              ) : (
                <div className="py-8 text-center">
                  <Search className="text-muted-foreground mx-auto mb-3 h-12 w-12 opacity-50" />
                  <p className="text-muted-foreground text-sm sm:text-base">
                    {searchQuery.trim()
                      ? `No articles found for "${searchQuery}"`
                      : 'No articles found in this category'}
                  </p>
                  <p className="text-muted-foreground/60 mt-1 text-xs sm:text-sm">
                    {searchQuery.trim()
                      ? 'Try different keywords or browse categories below'
                      : 'Try selecting a different category'}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Categories Grid - Hide when searching */}
      {!searchQuery.trim() && (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 md:grid-cols-3 md:gap-6">
          {knowledgeCategories.map((category, index) => {
            const IconComponent = category.icon;
            return (
              <motion.div
                key={category.id}
                initial={reducedMotion ? false : { opacity: 0, y: 20 }}
                animate={reducedMotion ? false : { opacity: 1, y: 0 }}
                transition={{ delay: 0.2 + index * 0.1 }}
                whileHover={reducedMotion ? {} : { y: -4, scale: 1.01 }}
                className="cursor-pointer"
                onClick={() => handleCategoryClick(category.id)}
              >
                <Card className="bg-card/50 group relative h-full overflow-hidden border-0 shadow-lg backdrop-blur-sm transition-shadow duration-300 hover:shadow-xl">
                  {/* Animated Gradient Background */}
                  <div
                    className={`absolute inset-0 bg-gradient-to-br ${category.gradient}`}
                  />

                  {/* Animated Floating Blob */}
                  {!reducedMotion && (
                    <motion.div
                      animate={{
                        x: [0, -15, 0],
                        y: [0, 10, 0],
                        scale: [1, 1.15, 1],
                      }}
                      transition={{
                        duration: 6,
                        repeat: Infinity,
                        ease: 'easeInOut',
                      }}
                      className={`absolute -bottom-8 -left-12 h-24 w-24 rounded-full bg-gradient-to-br ${category.gradient} blur-2xl`}
                    />
                  )}

                  <CardHeader className="relative p-4 sm:p-6">
                    <div className="mb-3 flex items-center gap-2 sm:gap-3">
                      <motion.div
                        whileHover={{ scale: 1.1, rotate: -10 }}
                        className={`rounded-xl bg-gradient-to-br ${category.gradient.replace('/20', '/30').replace('/10', '/20')} p-2 shadow-lg backdrop-blur-sm sm:p-3`}
                      >
                        <IconComponent
                          className={`h-5 w-5 ${category.iconColor} sm:h-6 sm:w-6`}
                        />
                      </motion.div>
                      <div className="min-w-0 flex-1">
                        <CardTitle className="bg-gradient-to-r from-indigo-600 to-blue-600 bg-clip-text text-sm font-bold text-transparent sm:text-base md:text-lg">
                          {category.title}
                        </CardTitle>
                        <CardDescription className="text-[10px] sm:text-xs">
                          {category.articleCount} article
                          {category.articleCount !== 1 ? 's' : ''}
                        </CardDescription>
                      </div>
                    </div>
                    <p className="text-muted-foreground relative text-xs sm:text-sm">
                      {category.description}
                    </p>
                  </CardHeader>
                  <CardContent className="relative p-4 pt-0 sm:p-6 sm:pt-0">
                    <div className="space-y-1.5">
                      {category.articles.slice(0, 3).map((article, idx) => (
                        <div
                          key={idx}
                          className="text-muted-foreground group-hover:text-foreground/80 flex items-center gap-2 text-xs transition-colors sm:text-sm"
                        >
                          <div className="h-1 w-1 flex-shrink-0 rounded-full bg-indigo-500" />
                          <span className="line-clamp-1 truncate">
                            {article}
                          </span>
                        </div>
                      ))}
                      {category.articles.length > 3 && (
                        <div className="text-muted-foreground/60 text-xs">
                          +{category.articles.length - 3} more
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Article Detail Modal */}
      <ArticleDetailModal
        article={selectedArticle}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
      />
    </div>
  );
}
