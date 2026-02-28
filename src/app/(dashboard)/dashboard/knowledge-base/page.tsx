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
import badgeStyles from '@/styles/badge-card.module.css';

/* Dashboard theme tokens (--neu-*) for light/dark */
const CARD_STYLE = {
  background: 'var(--neu-bg)',
  boxShadow: 'var(--neu-shadow-raised)',
  border: '1px solid var(--neu-border)',
} as const;

interface KnowledgeCategory {
  id: string;
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  articleCount: number;
  articles: string[];
}

const knowledgeCategories: KnowledgeCategory[] = [
  {
    id: 'getting-started',
    title: 'Getting Started',
    description: 'New to Novunt? Start here to learn the basics',
    icon: Star,
    articleCount: 1,
    articles: ['Platform Overview', 'Getting Started Guide'],
  },
  {
    id: 'wallets-finance',
    title: 'Wallets & Finance',
    description: 'Understanding wallets, deposits, and withdrawals',
    icon: Wallet,
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
    articleCount: 2,
    articles: ['Goal-Based Staking System', 'Daily Profit Distribution (ROS)'],
  },
  {
    id: 'earning-systems',
    title: 'Earning Systems',
    description: 'Pools, referrals, bonuses, and how to maximize earnings',
    icon: Award,
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

  const filteredArticles = useMemo(() => {
    if (searchQuery.trim()) return searchArticles(searchQuery);
    if (selectedCategory) return getArticlesByCategory(selectedCategory);
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
  const clearSearch = () => setSearchQuery('');
  const handleCategoryClick = (categoryId: string) => {
    setSelectedCategory(categoryId);
    setSearchQuery('');
  };
  const clearCategoryFilter = () => setSelectedCategory(null);

  const selectedCategoryData = knowledgeCategories.find(
    (cat) => cat.id === selectedCategory
  );

  return (
    <div
      className="min-h-screen lg:h-full lg:min-h-0"
      style={{ background: 'var(--neu-bg)' }}
    >
      <div
        className={badgeStyles.kbPageRoot}
        style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}
      >
        {/* Hero card */}
        <motion.div
          initial={reducedMotion ? false : { opacity: 0, y: 20 }}
          animate={reducedMotion ? false : { opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="rounded-2xl p-4 sm:p-6"
          style={CARD_STYLE}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              marginBottom: '14px',
            }}
          >
            <div
              style={{
                width: 48,
                height: 48,
                borderRadius: 14,
                flexShrink: 0,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'var(--neu-accent)',
                border: '1px solid var(--neu-border)',
                color: 'var(--neu-accent-foreground)',
                boxShadow: 'inset 0 1px 0 var(--neu-shadow-light)',
              }}
            >
              <FileText size={24} strokeWidth={2} />
            </div>
            <div style={{ minWidth: 0, flex: 1 }}>
              <h1
                style={{
                  color: 'var(--neu-text-primary)',
                  fontSize: '1rem',
                  fontWeight: 700,
                  margin: 0,
                  lineHeight: 1.3,
                }}
              >
                Knowledge Base
              </h1>
              <p
                style={{
                  color: 'var(--neu-text-secondary)',
                  fontSize: '0.75rem',
                  margin: '2px 0 0',
                  lineHeight: 1.4,
                }}
              >
                Learn more about the Novunt platform
              </p>
            </div>
          </div>

          {/* Search */}
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

        {/* Active category filter bar */}
        {selectedCategory && !searchQuery.trim() && selectedCategoryData && (
          <motion.div
            initial={reducedMotion ? false : { opacity: 0, y: 10 }}
            animate={reducedMotion ? false : { opacity: 1, y: 0 }}
            className="rounded-2xl p-3 sm:p-4"
            style={CARD_STYLE}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '10px',
                flexWrap: 'wrap',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  minWidth: 0,
                  flex: 1,
                }}
              >
                <div
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: 10,
                    flexShrink: 0,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: 'var(--neu-accent)',
                    border: '1px solid var(--neu-border)',
                    color: 'var(--neu-accent-foreground)',
                    boxShadow: 'inset 0 1px 0 var(--neu-shadow-light)',
                  }}
                >
                  {React.createElement(selectedCategoryData.icon, {
                    className: 'h-4 w-4',
                  })}
                </div>
                <div style={{ minWidth: 0 }}>
                  <p
                    style={{
                      color: 'var(--neu-text-primary)',
                      fontSize: '0.8125rem',
                      fontWeight: 700,
                      margin: 0,
                    }}
                  >
                    {selectedCategoryData.title}
                  </p>
                  <p
                    style={{
                      color: 'var(--neu-text-secondary)',
                      fontSize: '0.6875rem',
                      margin: 0,
                    }}
                  >
                    {filteredArticles.length}{' '}
                    {filteredArticles.length === 1 ? 'article' : 'articles'}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={clearCategoryFilter}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '6px 12px',
                  borderRadius: 10,
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  background: 'rgba(0, 155, 242, 0.15)',
                  color: 'var(--neu-accent)',
                  border: '1px solid rgba(0, 155, 242, 0.25)',
                  cursor: 'pointer',
                }}
              >
                <X size={14} />
                Clear
              </button>
            </div>
          </motion.div>
        )}

        {/* Search results / category articles */}
        {(searchQuery.trim() || selectedCategory) && (
          <motion.section
            initial={reducedMotion ? false : { opacity: 0, y: 20 }}
            animate={reducedMotion ? false : { opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}
          >
            <p
              style={{
                color: 'var(--neu-text-primary)',
                fontSize: '0.8125rem',
                fontWeight: 600,
                margin: 0,
                paddingLeft: 2,
              }}
            >
              {searchQuery.trim()
                ? `Results for "${searchQuery}"`
                : (selectedCategoryData?.title ?? 'Articles')}
              {filteredArticles.length > 0 && (
                <span style={{ color: 'var(--neu-text-muted)', fontWeight: 400 }}>
                  {' '}
                  ({filteredArticles.length})
                </span>
              )}
            </p>

            {filteredArticles.length > 0 ? (
              <div className={badgeStyles.kbCategoryGrid}>
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
              <div
                className="rounded-2xl"
                style={{
                  ...CARD_STYLE,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '10px',
                  padding: '40px 20px',
                  textAlign: 'center',
                }}
              >
                <Search
                  size={40}
                  strokeWidth={1.5}
                  style={{ color: 'var(--neu-accent)', opacity: 0.4 }}
                />
                <p
                  style={{
                    color: 'var(--neu-text-primary)',
                    fontSize: '0.8125rem',
                    fontWeight: 500,
                    margin: 0,
                  }}
                >
                  {searchQuery.trim()
                    ? `No articles found for "${searchQuery}"`
                    : 'No articles in this category'}
                </p>
                <p style={{ color: 'var(--neu-text-muted)', fontSize: '0.75rem', margin: 0 }}>
                  Try different keywords or browse categories
                </p>
              </div>
            )}
          </motion.section>
        )}

        {/* Categories */}
        {!searchQuery.trim() && (
          <section
            style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}
          >
            <p
              style={{
                color: 'var(--neu-text-primary)',
                fontSize: '0.8125rem',
                fontWeight: 600,
                margin: 0,
                paddingLeft: 2,
              }}
            >
              Browse by Category
            </p>
            <div className={badgeStyles.kbCategoryGrid}>
              {knowledgeCategories.map((category, index) => {
                const IconComponent = category.icon;
                return (
                  <motion.div
                    key={category.id}
                    initial={reducedMotion ? false : { opacity: 0, y: 20 }}
                    animate={reducedMotion ? false : { opacity: 1, y: 0 }}
                    transition={{ delay: 0.12 + index * 0.04 }}
                  >
                    <button
                      type="button"
                      onClick={() => handleCategoryClick(category.id)}
                      className={badgeStyles.kbCategoryCard}
                      style={
                        selectedCategory === category.id
                          ? { borderColor: 'rgba(0, 155, 242, 0.4)' }
                          : undefined
                      }
                    >
                      <div className={badgeStyles.kbCategoryCardTop}>
                        <div
                          className={badgeStyles.kbCategoryCardIcon}
                          style={{ color: 'var(--neu-accent)' }}
                        >
                          <IconComponent className="h-5 w-5" />
                        </div>
                        <div
                          style={{ minWidth: 0, flex: 1, textAlign: 'left' }}
                        >
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
                            <span
                              style={{
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                whiteSpace: 'nowrap',
                              }}
                            >
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
          </section>
        )}
      </div>

      <ArticleDetailModal
        article={selectedArticle}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
      />
    </div>
  );
}
