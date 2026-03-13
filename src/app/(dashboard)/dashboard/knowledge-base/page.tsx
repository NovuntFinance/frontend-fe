'use client';

import React, { useState, useMemo, useCallback } from 'react';
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
  HelpCircle as BookOpen,
  ChevronLeft,
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
    articleCount: 8,
    articles: [
      'Platform Overview',
      'Getting Started Guide',
      'Onboarding Walkthrough',
      'Understanding Your Dashboard',
      'Freebies: Your 10% Registration Bonus',
      'Social Media Verification Guide',
      'Getting Help: Novunt Assistant & Support',
      'Trading Signals Guide',
    ],
  },
  {
    id: 'wallets-finance',
    title: 'Wallets & Finance',
    description: 'Wallets, deposits, withdrawals, transfers, fees, and limits',
    icon: Wallet,
    articleCount: 8,
    articles: [
      'Two-Wallet System Explained',
      'Making a Deposit: Step-by-Step',
      'Making a Withdrawal: Step-by-Step',
      'P2P Transfers: Step-by-Step',
      'Deposits & Funding',
      'Withdrawals',
      'P2P Transfers',
      'Fees, Limits & Processing Times',
    ],
  },
  {
    id: 'staking-goals',
    title: 'Staking & Goals',
    description: 'Goal-based staking, ROS, streaks, and the ROS calendar',
    icon: TrendingUp,
    articleCount: 5,
    articles: [
      'Goal-Based Staking System',
      'Daily Profit Distribution (ROS)',
      'The ROS Calendar',
      'Staking Streak & Milestones',
      'Setting Smart Goals for Your Stakes',
    ],
  },
  {
    id: 'earning-systems',
    title: 'Earning Systems',
    description: 'Pools, referrals, bonuses, badges, tokens, and strategies',
    icon: Award,
    articleCount: 8,
    articles: [
      'Three-Tier Pool System',
      'Performance & Premium Pools',
      'Referral Bonus System',
      'Registration Bonus',
      'Achievements & Badge System',
      'NXP & NLP Tokens Explained',
      'Achievement System & NXP',
      'Maximizing Your Earnings',
    ],
  },
  {
    id: 'ranks-teams',
    title: 'Ranks & Teams',
    description:
      'All six ranks, team building, referral networks, and pool qualification',
    icon: Users,
    articleCount: 4,
    articles: [
      'Rank System & Progression',
      'The Six Ranks: Requirements & Benefits',
      'Building & Managing Your Team',
      'Profile Completion & Social Media',
    ],
  },
  {
    id: 'security-account',
    title: 'Security & Account',
    description:
      '2FA, wallet whitelist, notifications, themes, and account settings',
    icon: Shield,
    articleCount: 7,
    articles: [
      '2FA Guide',
      'Withdrawal Address & Whitelist',
      'Understanding Notifications',
      'Security & Authentication',
      'Account Settings & Preferences',
      'Theme & Display Settings',
      'Common Questions & Troubleshooting',
    ],
  },
  {
    id: 'glossary',
    title: 'Glossary & FAQ',
    description:
      'Definitions, frequently asked questions, and community channels',
    icon: BookOpen,
    articleCount: 3,
    articles: [
      'Novunt Glossary',
      'Frequently Asked Questions',
      'Community & Social Channels',
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

  const handleArticleClick = useCallback((article: Article) => {
    setSelectedArticle(article);
    setIsModalOpen(true);
  }, []);
  const handleCloseModal = useCallback(() => {
    setIsModalOpen(false);
    setSelectedArticle(null);
  }, []);
  const clearSearch = () => setSearchQuery('');
  const handleCategoryClick = useCallback((categoryId: string) => {
    setSelectedCategory(categoryId);
    setSearchQuery('');
    requestAnimationFrame(() => {
      const scrollParent = document.querySelector('.dashboard-main-scroll');
      if (scrollParent) scrollParent.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }, []);
  const clearCategoryFilter = useCallback(() => setSelectedCategory(null), []);

  const selectedCategoryData = knowledgeCategories.find(
    (cat) => cat.id === selectedCategory
  );

  const showingArticles = !!(searchQuery.trim() || selectedCategory);
  const showingCategories = !searchQuery.trim() && !selectedCategory;

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
                <button
                  type="button"
                  onClick={clearCategoryFilter}
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: 10,
                    flexShrink: 0,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: 'var(--neu-card-bg, var(--neu-bg))',
                    border: '1px solid var(--neu-border)',
                    color: 'var(--neu-accent)',
                    cursor: 'pointer',
                  }}
                  aria-label="Back to all categories"
                >
                  <ChevronLeft size={18} strokeWidth={2.5} />
                </button>
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
                All Categories
              </button>
            </div>
          </motion.div>
        )}

        {/* Search results / category articles */}
        {showingArticles && (
          <motion.section
            initial={reducedMotion ? false : { opacity: 0, y: 20 }}
            animate={reducedMotion ? false : { opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}
          >
            {searchQuery.trim() && (
              <p
                style={{
                  color: 'var(--neu-text-primary)',
                  fontSize: '0.8125rem',
                  fontWeight: 600,
                  margin: 0,
                  paddingLeft: 2,
                }}
              >
                Results for &ldquo;{searchQuery}&rdquo;
                {filteredArticles.length > 0 && (
                  <span
                    style={{ color: 'var(--neu-text-muted)', fontWeight: 400 }}
                  >
                    {' '}
                    ({filteredArticles.length})
                  </span>
                )}
              </p>
            )}

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
                <p
                  style={{
                    color: 'var(--neu-text-muted)',
                    fontSize: '0.75rem',
                    margin: 0,
                  }}
                >
                  Try different keywords or browse categories
                </p>
              </div>
            )}
          </motion.section>
        )}

        {/* Categories – only when browsing (no search, no category selected) */}
        {showingCategories && (
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
