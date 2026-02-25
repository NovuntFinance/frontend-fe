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
import { prefersReducedMotion } from '@/lib/accessibility';
import {
  searchArticles,
  getArticlesByCategory,
} from '@/data/knowledgeBaseArticles';
import { ArticleCard } from '@/components/knowledge-base/ArticleCard';
import { ArticleDetailModal } from '@/components/knowledge-base/ArticleDetailModal';
import type { Article } from '@/components/knowledge-base/ArticleCard';
import { PageContainer } from '@/components/layout/PageContainer';
import badgeStyles from '@/styles/badge-card.module.css';

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
    <div className="from-background via-background to-primary/5 min-h-screen bg-gradient-to-br">
      <PageContainer sectionSpacing>
        <div className={badgeStyles.kbPageRoot}>
          {/* Page Header – neumorphic raised panel */}
          <motion.div
            initial={reducedMotion ? false : { opacity: 0, y: 20 }}
            animate={reducedMotion ? false : { opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className={badgeStyles.kbHeaderPanel}
          >
            <div className={badgeStyles.kbHeaderTop}>
              <div className={badgeStyles.kbHeaderIcon} aria-hidden>
                <FileText className="h-5 w-5 sm:h-6 sm:w-6" strokeWidth={2} />
              </div>
              <div>
                <h1 className={badgeStyles.kbHeaderTitle}>Knowledge Base</h1>
                <p className={badgeStyles.kbHeaderSubtitle}>
                  Learn more about Novunt platform and how to maximize your
                  earnings
                </p>
              </div>
            </div>

            {/* Search – inset neumorphic input */}
            <div className={badgeStyles.kbSearchWrap}>
              <Search
                className={badgeStyles.kbSearchIcon}
                strokeWidth={2}
                aria-hidden
              />
              <input
                type="text"
                placeholder="Search articles..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={badgeStyles.kbSearchInput}
                aria-label="Search articles"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={clearSearch}
                  className={badgeStyles.kbSearchClear}
                  aria-label="Clear search"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
          </motion.div>

          {/* Category Filter Active – neumorphic filter bar */}
          {selectedCategory && !searchQuery.trim() && (
            <motion.div
              initial={reducedMotion ? false : { opacity: 0, y: 20 }}
              animate={reducedMotion ? false : { opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
              className={badgeStyles.kbFilterBar}
            >
              <div className={badgeStyles.kbFilterBarInner}>
                <div className="flex min-w-0 flex-1 items-center gap-3">
                  {selectedCategoryData && (
                    <>
                      <div
                        className={badgeStyles.kbFilterBarIcon}
                        style={{ color: 'var(--badge-accent)' }}
                      >
                        {React.createElement(selectedCategoryData.icon, {
                          className: 'h-5 w-5 sm:h-6 sm:w-6',
                        })}
                      </div>
                      <div className="min-w-0 flex-1">
                        <h3 className={badgeStyles.kbFilterBarTitle}>
                          {selectedCategoryData.title}
                        </h3>
                        <p className={badgeStyles.kbFilterBarMeta}>
                          {filteredArticles.length}{' '}
                          {filteredArticles.length === 1
                            ? 'article'
                            : 'articles'}
                        </p>
                      </div>
                    </>
                  )}
                </div>
                <button
                  type="button"
                  onClick={clearCategoryFilter}
                  className={badgeStyles.kbFilterBarClearBtn}
                >
                  <X className="h-4 w-4" />
                  <span className="hidden sm:inline">Clear Filter</span>
                  <span className="sm:hidden">Clear</span>
                </button>
              </div>
            </motion.div>
          )}

          {/* Search Results or Category Articles – neumorphic panel */}
          {(searchQuery.trim() || selectedCategory) && (
            <motion.div
              initial={reducedMotion ? false : { opacity: 0, y: 20 }}
              animate={reducedMotion ? false : { opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className={badgeStyles.kbResultsPanel}
            >
              <div className={badgeStyles.kbResultsPanelHeader}>
                <h2 className={badgeStyles.kbResultsPanelTitle}>
                  {searchQuery.trim()
                    ? 'Search Results'
                    : selectedCategoryData
                      ? selectedCategoryData.title
                      : 'Articles'}
                  {filteredArticles.length > 0 && (
                    <span
                      className={badgeStyles.kbCategoryCardMeta}
                      style={{ marginLeft: 8, fontWeight: 400 }}
                    >
                      ({filteredArticles.length}{' '}
                      {filteredArticles.length === 1 ? 'article' : 'articles'})
                    </span>
                  )}
                </h2>
              </div>
              {filteredArticles.length > 0 ? (
                <div className={badgeStyles.kbResultsPanelGrid}>
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
                <div className={badgeStyles.kbResultsEmpty}>
                  <Search
                    className={badgeStyles.kbResultsEmptyIcon}
                    size={48}
                  />
                  <p className={badgeStyles.kbResultsEmptyText}>
                    {searchQuery.trim()
                      ? `No articles found for "${searchQuery}"`
                      : 'No articles found in this category'}
                  </p>
                  <p className={badgeStyles.kbResultsEmptyHint}>
                    {searchQuery.trim()
                      ? 'Try different keywords or browse categories below'
                      : 'Try selecting a different category'}
                  </p>
                </div>
              )}
            </motion.div>
          )}

          {/* Categories Grid – neumorphic cards, hide when searching */}
          {!searchQuery.trim() && (
            <div className={badgeStyles.badgeSectionGrid}>
              {knowledgeCategories.map((category, index) => {
                const IconComponent = category.icon;
                return (
                  <motion.div
                    key={category.id}
                    initial={reducedMotion ? false : { opacity: 0, y: 20 }}
                    animate={reducedMotion ? false : { opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 + index * 0.05 }}
                  >
                    <button
                      type="button"
                      onClick={() => handleCategoryClick(category.id)}
                      className={badgeStyles.kbCategoryCard}
                    >
                      <div className={badgeStyles.kbCategoryCardTop}>
                        <div
                          className={badgeStyles.kbCategoryCardIcon}
                          style={{ color: 'var(--badge-accent)' }}
                        >
                          <IconComponent className="h-5 w-5 sm:h-6 sm:w-6" />
                        </div>
                        <div className="min-w-0 flex-1 text-left">
                          <span className={badgeStyles.kbCategoryCardTitle}>
                            {category.title}
                          </span>
                          <p className={badgeStyles.kbCategoryCardMeta}>
                            {category.articleCount} article
                            {category.articleCount !== 1 ? 's' : ''}
                          </p>
                        </div>
                      </div>
                      <p className={badgeStyles.kbCategoryCardDesc}>
                        {category.description}
                      </p>
                      <div className={badgeStyles.kbCategoryCardBullets}>
                        {category.articles.slice(0, 3).map((article, idx) => (
                          <span
                            key={idx}
                            className={badgeStyles.kbCategoryCardBullet}
                          >
                            <span
                              className={badgeStyles.kbCategoryCardBulletDot}
                            />
                            <span className="line-clamp-1 truncate">
                              {article}
                            </span>
                          </span>
                        ))}
                        {category.articles.length > 3 && (
                          <span className={badgeStyles.kbCategoryCardMore}>
                            +{category.articles.length - 3} more
                          </span>
                        )}
                      </div>
                    </button>
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
      </PageContainer>
    </div>
  );
}
