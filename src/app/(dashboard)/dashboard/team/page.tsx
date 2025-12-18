'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Users,
  Copy,
  CheckCircle,
  TrendingUp,
  Share,
  AlertCircle,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { ReferralTreeVisualization } from '@/components/referral/ReferralTreeVisualization';
import {
  useReferralStats,
  useReferralInfo,
  useReferralTree,
} from '@/lib/queries';
import { formatCurrency } from '@/lib/utils';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { LoadingStates } from '@/components/ui/loading-states';
import { UserFriendlyError } from '@/components/errors/UserFriendlyError';
import { toast } from '@/components/ui/enhanced-toast';
import { prefersReducedMotion } from '@/lib/accessibility';
import { slideUp, fadeIn, hoverAnimation } from '@/design-system/animations';

/**
 * Team Page (Merged: Referrals + Team)
 * Premium design matching dashboard, wallet, and stake pages using Staking Streak template
 */
export default function TeamPage() {
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);
  const [maxLevels, setMaxLevels] = useState(5);
  const [isTreeExpanded, setIsTreeExpanded] = useState(false);

  const { data: referralStats, isLoading: statsLoading } = useReferralStats();
  const { data: referralInfo, isLoading: infoLoading } = useReferralInfo();
  const { data: referralTree, isLoading: treeLoading } =
    useReferralTree(maxLevels);

  const isLoading = statsLoading || infoLoading || treeLoading;
  const reducedMotion = prefersReducedMotion();

  // Get referral code and link from API
  // useReferralInfo returns the data object { referralCode, referralLink, ... }
  const referralCode = referralInfo?.referralCode || '';
  const referralLink = referralInfo?.referralLink || '';

  // Debug logging
  useEffect(() => {
    console.log('[TeamPage] Referral info state:', {
      referralInfo,
      referralCode,
      referralLink,
      hasReferralCode: !!referralInfo?.referralCode,
      hasReferralLink: !!referralInfo?.referralLink,
      infoLoading,
    });
  }, [referralInfo, referralCode, referralLink, infoLoading]);

  // Debug logging for referral tree
  useEffect(() => {
    console.log('[TeamPage] Referral tree state:', {
      referralTree,
      treeEntries: referralTree?.tree,
      treeEntriesLength: referralTree?.tree?.length || 0,
      stats: referralTree?.stats,
      treeLoading,
      hasTree: !!referralTree?.tree,
      isArray: Array.isArray(referralTree?.tree),
    });
  }, [referralTree, treeLoading]);

  const copyLink = async () => {
    if (!referralLink) {
      toast.error('Referral link not available', {
        description: 'Please wait for the referral link to load.',
      });
      return;
    }

    try {
      // Try modern clipboard API first
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(referralLink);
        setCopiedLink(true);
        toast.success('Referral link copied!', {
          description: 'Share this link with your friends to earn commissions.',
        });
        setTimeout(() => setCopiedLink(false), 2000);
      } else {
        // Fallback for older browsers
        const textArea = document.createElement('textarea');
        textArea.value = referralLink;
        textArea.style.position = 'fixed';
        textArea.style.left = '-999999px';
        textArea.style.top = '-999999px';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        try {
          const successful = document.execCommand('copy');
          if (successful) {
            setCopiedLink(true);
            toast.success('Referral link copied!', {
              description:
                'Share this link with your friends to earn commissions.',
            });
            setTimeout(() => setCopiedLink(false), 2000);
          } else {
            throw new Error('execCommand failed');
          }
        } catch (err) {
          console.error('[TeamPage] Failed to copy link:', err);
          toast.error('Failed to copy', {
            description: 'Please select and copy the link manually.',
          });
        }
        document.body.removeChild(textArea);
      }
    } catch (error) {
      console.error('[TeamPage] Failed to copy referral link:', error);
      toast.error('Failed to copy', {
        description: 'Please select and copy the link manually.',
      });
    }
  };

  const copyCode = async () => {
    if (!referralCode) {
      toast.error('Referral code not available', {
        description: 'Please wait for the referral code to load.',
      });
      return;
    }

    try {
      // Try modern clipboard API first
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(referralCode);
        setCopiedCode(true);
        toast.success('Referral code copied!', {
          description: 'Share this code with your friends during signup.',
        });
        setTimeout(() => setCopiedCode(false), 2000);
      } else {
        // Fallback for older browsers
        const textArea = document.createElement('textarea');
        textArea.value = referralCode;
        textArea.style.position = 'fixed';
        textArea.style.left = '-999999px';
        textArea.style.top = '-999999px';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        try {
          const successful = document.execCommand('copy');
          if (successful) {
            setCopiedCode(true);
            toast.success('Referral code copied!', {
              description: 'Share this code with your friends during signup.',
            });
            setTimeout(() => setCopiedCode(false), 2000);
          } else {
            throw new Error('execCommand failed');
          }
        } catch (err) {
          console.error('[TeamPage] Failed to copy code:', err);
          toast.error('Failed to copy', {
            description: 'Please select and copy the code manually.',
          });
        }
        document.body.removeChild(textArea);
      }
    } catch (error) {
      console.error('[TeamPage] Failed to copy referral code:', error);
      toast.error('Failed to copy', {
        description: 'Please select and copy the code manually.',
      });
    }
  };

  if (isLoading) {
    return (
      <div className="from-background via-background to-primary/5 min-h-screen bg-gradient-to-br">
        <div className="space-y-4 sm:space-y-6">
          <LoadingStates.Card height="h-20" className="w-full" />
          <LoadingStates.Grid items={3} columns={3} className="gap-3 sm:gap-4 md:gap-6" />
          <LoadingStates.Card height="h-96" />
        </div>
      </div>
    );
  }

  return (
    <div className="from-background via-background to-primary/5 min-h-screen bg-gradient-to-br">
      <div className="space-y-4 sm:space-y-6">
        {/* Page Header - Staking Streak Template */}
        <motion.div {...slideUp(0.1)}>
          <Card className="bg-card/50 group relative overflow-hidden border-0 shadow-lg backdrop-blur-sm transition-shadow duration-300 hover:shadow-xl">
            {/* Animated Gradient Background */}
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/20 via-indigo-500/10 to-transparent" />

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
                className="absolute -bottom-12 -left-12 h-24 w-24 rounded-full bg-purple-500/30 blur-2xl"
              />
            )}

            <CardHeader className="relative p-4 sm:p-6">
              <div className="mb-2 flex items-center gap-2 sm:gap-3">
                <motion.div
                  {...hoverAnimation()}
                  className="rounded-xl bg-gradient-to-br from-purple-500/30 to-indigo-500/20 p-2 shadow-lg backdrop-blur-sm sm:p-3"
                >
                  <Users className="h-5 w-5 text-purple-500 sm:h-6 sm:w-6" />
                </motion.div>
                <div className="min-w-0 flex-1">
                  <CardTitle className="bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-sm font-bold text-transparent sm:text-base md:text-lg">
                    Team & Referrals
                  </CardTitle>
                  <CardDescription className="text-[10px] sm:text-xs">
                    Manage your referral network and view your team structure
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
          </Card>
        </motion.div>

        {/* Stats Cards - Staking Streak Template (Mobile-first grid) */}
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 md:grid-cols-3 md:gap-6">
          {/* Total Referrals Card */}
          <motion.div
            {...slideUp(0.2)}
            whileHover={{ y: -4, scale: 1.01 }}
          >
            <Card className="bg-card/50 group relative overflow-hidden border-0 shadow-lg backdrop-blur-sm transition-shadow duration-300 hover:shadow-xl">
              {/* Animated Gradient Background */}
              <div className="absolute inset-0 bg-gradient-to-br from-purple-500/20 via-indigo-500/10 to-transparent" />

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
                  className="absolute -bottom-12 -left-12 h-24 w-24 rounded-full bg-purple-500/30 blur-2xl"
                />
              )}

              <CardHeader className="relative p-4 sm:p-6">
                <div className="mb-2 flex items-center gap-2 sm:gap-3">
                  <motion.div
                    whileHover={{ scale: 1.1, rotate: -10 }}
                    className="rounded-xl bg-gradient-to-br from-purple-500/30 to-indigo-500/20 p-2 shadow-lg backdrop-blur-sm sm:p-3"
                  >
                    <Users className="h-5 w-5 text-purple-500 sm:h-6 sm:w-6" />
                  </motion.div>
                  <div className="min-w-0 flex-1">
                    <CardTitle className="truncate bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-sm font-bold text-transparent sm:text-base md:text-lg">
                      Total Referrals
                    </CardTitle>
                    <CardDescription className="truncate text-[10px] sm:text-xs">
                      Total number of referrals
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="relative p-4 pt-0 sm:p-6 sm:pt-0">
                <div className="mb-2 flex w-full min-w-0 items-baseline gap-2 sm:mb-4 sm:gap-3">
                  <motion.span
                    initial={reducedMotion ? false : { opacity: 0, scale: 0.5 }}
                    animate={reducedMotion ? false : { opacity: 1, scale: 1 }}
                    transition={{ delay: 0.9 }}
                    key={referralStats?.totalReferrals || 0}
                    className="overflow-visible bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-2xl leading-tight font-black whitespace-nowrap text-transparent sm:text-3xl md:text-4xl lg:text-5xl"
                    style={{ wordBreak: 'keep-all' }}
                  >
                    {referralStats?.totalReferrals || 0}
                  </motion.span>
                </div>
                <p className="text-muted-foreground text-xs sm:text-sm">
                  {referralStats?.activeReferrals || 0} active
                </p>
              </CardContent>
            </Card>
          </motion.div>

          {/* Total Earned Card */}
          <motion.div
            initial={reducedMotion ? false : { opacity: 0, y: 20 }}
            animate={reducedMotion ? false : { opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
            whileHover={{ y: -4, scale: 1.01 }}
          >
            <Card className="bg-card/50 group relative overflow-hidden border-0 shadow-lg backdrop-blur-sm transition-shadow duration-300 hover:shadow-xl">
              {/* Animated Gradient Background */}
              <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/20 via-green-500/10 to-transparent" />

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
                  className="absolute -bottom-12 -left-12 h-24 w-24 rounded-full bg-emerald-500/30 blur-2xl"
                />
              )}

              <CardHeader className="relative p-4 sm:p-6">
                <div className="mb-2 flex items-center gap-2 sm:gap-3">
                  <motion.div
                    whileHover={{ scale: 1.1, rotate: -10 }}
                    className="rounded-xl bg-gradient-to-br from-emerald-500/30 to-green-500/20 p-2 shadow-lg backdrop-blur-sm sm:p-3"
                  >
                    <TrendingUp className="h-5 w-5 text-emerald-500 sm:h-6 sm:w-6" />
                  </motion.div>
                  <div className="min-w-0 flex-1">
                    <CardTitle className="truncate bg-gradient-to-r from-emerald-600 to-green-600 bg-clip-text text-sm font-bold text-transparent sm:text-base md:text-lg">
                      Total Earned
                    </CardTitle>
                    <CardDescription className="truncate text-[10px] sm:text-xs">
                      Earnings from all levels
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="relative p-4 pt-0 sm:p-6 sm:pt-0">
                <div className="mb-2 flex w-full min-w-0 items-baseline gap-2 sm:mb-4 sm:gap-3">
                  <motion.span
                    initial={reducedMotion ? false : { opacity: 0, scale: 0.5 }}
                    animate={reducedMotion ? false : { opacity: 1, scale: 1 }}
                    transition={{ delay: 0.9 }}
                    key={referralStats?.totalEarned || 0}
                    className="overflow-visible bg-gradient-to-r from-emerald-600 to-green-600 bg-clip-text text-2xl leading-tight font-black whitespace-nowrap text-transparent sm:text-3xl md:text-4xl lg:text-5xl"
                    style={{ wordBreak: 'keep-all' }}
                  >
                    {formatCurrency(referralStats?.totalEarned || 0)}
                  </motion.span>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Team Members Card */}
          <motion.div
            initial={reducedMotion ? false : { opacity: 0, y: 20 }}
            animate={reducedMotion ? false : { opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            whileHover={{ y: -4, scale: 1.01 }}
          >
            <Card className="bg-card/50 group relative overflow-hidden border-0 shadow-lg backdrop-blur-sm transition-shadow duration-300 hover:shadow-xl">
              {/* Animated Gradient Background */}
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 via-cyan-500/10 to-transparent" />

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
                  className="absolute -bottom-12 -left-12 h-24 w-24 rounded-full bg-blue-500/30 blur-2xl"
                />
              )}

              <CardHeader className="relative p-4 sm:p-6">
                <div className="mb-2 flex items-center gap-2 sm:gap-3">
                  <motion.div
                    whileHover={{ scale: 1.1, rotate: -10 }}
                    className="rounded-xl bg-gradient-to-br from-blue-500/30 to-cyan-500/20 p-2 shadow-lg backdrop-blur-sm sm:p-3"
                  >
                    <Users className="h-5 w-5 text-blue-500 sm:h-6 sm:w-6" />
                  </motion.div>
                  <div className="min-w-0 flex-1">
                    <CardTitle className="truncate bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-sm font-bold text-transparent sm:text-base md:text-lg">
                      Team Members
                    </CardTitle>
                    <CardDescription className="truncate text-[10px] sm:text-xs">
                      Active team members
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="relative p-4 pt-0 sm:p-6 sm:pt-0">
                <div className="mb-2 flex w-full min-w-0 items-baseline gap-2 sm:mb-4 sm:gap-3">
                  <motion.span
                    initial={reducedMotion ? false : { opacity: 0, scale: 0.5 }}
                    animate={reducedMotion ? false : { opacity: 1, scale: 1 }}
                    transition={{ delay: 0.9 }}
                    key={referralStats?.totalReferrals || 0}
                    className="overflow-visible bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-2xl leading-tight font-black whitespace-nowrap text-transparent sm:text-3xl md:text-4xl lg:text-5xl"
                    style={{ wordBreak: 'keep-all' }}
                  >
                    {referralStats?.totalReferrals || 0}
                  </motion.span>
                </div>
                <p className="text-muted-foreground text-xs sm:text-sm">
                  {referralStats?.activeReferrals || 0} active
                </p>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Referral Link Card - Staking Streak Template */}
        <motion.div
          initial={reducedMotion ? false : { opacity: 0, y: 20 }}
          animate={reducedMotion ? false : { opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card className="bg-card/50 group relative overflow-hidden border-0 shadow-lg backdrop-blur-sm transition-shadow duration-300 hover:shadow-xl">
            {/* Animated Gradient Background */}
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/20 via-indigo-500/10 to-transparent" />

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
                className="absolute -bottom-12 -left-12 h-24 w-24 rounded-full bg-purple-500/30 blur-2xl"
              />
            )}

            <CardHeader className="relative p-4 sm:p-6">
              <div className="mb-2 flex items-center gap-2 sm:gap-3">
                <motion.div
                  {...hoverAnimation()}
                  className="rounded-xl bg-gradient-to-br from-purple-500/30 to-indigo-500/20 p-2 shadow-lg backdrop-blur-sm sm:p-3"
                >
                  <Share className="h-5 w-5 text-purple-500 sm:h-6 sm:w-6" />
                </motion.div>
                <div className="min-w-0 flex-1">
                  <CardTitle className="bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-sm font-bold text-transparent sm:text-base md:text-lg">
                    Your Referral Link
                  </CardTitle>
                  <CardDescription className="text-[10px] sm:text-xs">
                    Share this link to earn commissions on your referrals
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="relative space-y-4 p-4 pt-0 sm:p-6 sm:pt-0">
              {/* Referral Link */}
              <div>
                <label className="text-muted-foreground mb-2 block text-xs font-medium sm:text-sm">
                  Referral Link
                </label>
                {infoLoading ? (
                  <LoadingStates.Text lines={1} className="h-10 w-full" />
                ) : referralLink ? (
                  <div className="flex gap-2">
                    <Input
                      value={referralLink}
                      readOnly
                      className="bg-background/50 border-purple-500/20 font-mono text-xs sm:text-sm"
                    />
                    <Button
                      variant="outline"
                      onClick={copyLink}
                      size="sm"
                      className="h-8 border-purple-500/20 sm:h-10"
                    >
                      {copiedLink ? (
                        <CheckCircle className="h-3 w-3 text-green-500 sm:h-4 sm:w-4" />
                      ) : (
                        <Copy className="h-3 w-3 sm:h-4 sm:w-4" />
                      )}
                    </Button>
                  </div>
                ) : (
                  <div className="text-muted-foreground flex items-center gap-2 text-xs sm:text-sm">
                    <AlertCircle className="h-3 w-3 sm:h-4 sm:w-4" />
                    <span>
                      Referral link not available. Please refresh the page.
                    </span>
                  </div>
                )}
                {copiedLink && (
                  <p className="mt-2 text-xs text-green-500 sm:text-sm">
                    Link copied to clipboard!
                  </p>
                )}
              </div>

              {/* Referral Code */}
              <div>
                <label className="text-muted-foreground mb-2 block text-xs font-medium sm:text-sm">
                  Referral Code
                </label>
                {infoLoading ? (
                  <LoadingStates.Text lines={1} className="h-10 w-full" />
                ) : referralCode ? (
                  <div className="flex gap-2">
                    <Input
                      value={referralCode}
                      readOnly
                      className="bg-background/50 border-purple-500/20 font-mono text-sm font-bold tracking-wider sm:text-base md:text-lg"
                    />
                    <Button
                      variant="outline"
                      onClick={copyCode}
                      size="sm"
                      className="h-8 border-purple-500/20 sm:h-10"
                    >
                      {copiedCode ? (
                        <CheckCircle className="h-3 w-3 text-green-500 sm:h-4 sm:w-4" />
                      ) : (
                        <Copy className="h-3 w-3 sm:h-4 sm:w-4" />
                      )}
                    </Button>
                  </div>
                ) : (
                  <div className="text-muted-foreground flex items-center gap-2 text-xs sm:text-sm">
                    <AlertCircle className="h-3 w-3 sm:h-4 sm:w-4" />
                    <span>
                      Referral code not available. Please refresh the page.
                    </span>
                  </div>
                )}
                {copiedCode && (
                  <p className="mt-2 text-xs text-green-500 sm:text-sm">
                    Code copied to clipboard!
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Referral Tree Card - Staking Streak Template with Expand/Collapse */}
        <motion.div
          initial={reducedMotion ? false : { opacity: 0, y: 20 }}
          animate={reducedMotion ? false : { opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <Card className="bg-card/50 group relative overflow-hidden border-0 shadow-lg backdrop-blur-sm transition-shadow duration-300 hover:shadow-xl">
            {/* Animated Gradient Background */}
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/20 via-purple-500/10 to-transparent" />

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
                className="absolute -bottom-12 -left-12 h-24 w-24 rounded-full bg-indigo-500/30 blur-2xl"
              />
            )}

            <CardHeader className="relative p-4 sm:p-6">
              <div className="mb-2 flex items-center justify-between gap-2 sm:gap-3">
                <div className="flex items-center gap-2 sm:gap-3">
                  <motion.div
                    whileHover={{ scale: 1.1, rotate: -10 }}
                    className="rounded-xl bg-gradient-to-br from-indigo-500/30 to-purple-500/20 p-2 shadow-lg backdrop-blur-sm sm:p-3"
                  >
                    <Users className="h-5 w-5 text-indigo-500 sm:h-6 sm:w-6" />
                  </motion.div>
                  <div className="min-w-0 flex-1">
                    <CardTitle className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-sm font-bold text-transparent sm:text-base md:text-lg">
                      Referral Tree
                    </CardTitle>
                    <CardDescription className="text-[10px] sm:text-xs">
                      {referralTree?.stats
                        ? `${referralTree.stats.totalReferrals || 0} total referrals • ${referralTree.stats.activeReferrals || 0} active`
                        : 'Visualize your referral network'}
                    </CardDescription>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsTreeExpanded(!isTreeExpanded)}
                  className="h-8 w-8 shrink-0 rounded-full p-0 sm:h-10 sm:w-10"
                  aria-label={isTreeExpanded ? 'Collapse tree' : 'Expand tree'}
                >
                  {isTreeExpanded ? (
                    <ChevronUp className="h-4 w-4 text-indigo-500 sm:h-5 sm:w-5" />
                  ) : (
                    <ChevronDown className="h-4 w-4 text-indigo-500 sm:h-5 sm:w-5" />
                  )}
                </Button>
              </div>
            </CardHeader>

            {/* Preview Stats - Always Visible */}
            {referralTree?.stats && (
              <CardContent className="relative p-4 pt-0 sm:p-6 sm:pt-0">
                <div className="bg-muted/30 border-border/50 grid grid-cols-2 gap-3 rounded-lg border p-3 sm:gap-4 sm:p-4">
                  <div>
                    <p className="text-muted-foreground mb-1 text-xs sm:text-sm">
                      Total Earned
                    </p>
                    <p className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-lg font-bold text-transparent sm:text-xl">
                      {formatCurrency(referralTree.stats.totalEarned || 0)}
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground mb-1 text-xs sm:text-sm">
                      Current Balance
                    </p>
                    <p className="bg-gradient-to-r from-emerald-600 to-green-600 bg-clip-text text-lg font-bold text-transparent sm:text-xl">
                      {formatCurrency(referralTree.stats.currentBalance || 0)}
                    </p>
                  </div>
                </div>
              </CardContent>
            )}

            {/* Expanded Tree Content */}
            {isTreeExpanded && (
              <motion.div
                initial={reducedMotion ? undefined : { opacity: 0, height: 0 }}
                animate={
                  reducedMotion ? undefined : { opacity: 1, height: 'auto' }
                }
                exit={reducedMotion ? undefined : { opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
                className="relative overflow-hidden"
              >
                <CardContent className="relative space-y-4 p-4 pt-0 sm:p-6 sm:pt-0">
                  {/* Max Levels Selector */}
                  <div className="flex items-center justify-end gap-2">
                    <label
                      htmlFor="max-levels-select"
                      className="text-muted-foreground text-xs sm:text-sm"
                    >
                      Tree Depth:
                    </label>
                    <select
                      id="max-levels-select"
                      title="Select maximum tree depth to display"
                      value={maxLevels}
                      onChange={(e) => setMaxLevels(Number(e.target.value))}
                      className="bg-background/50 rounded-lg border border-slate-500/20 px-2 py-1 text-xs sm:px-3 sm:py-1.5 sm:text-sm"
                    >
                      {[5, 10, 15, 20].map((level) => (
                        <option key={level} value={level}>
                          {level} levels
                        </option>
                      ))}
                    </select>
                  </div>
                  <ReferralTreeVisualization
                    treeEntries={referralTree?.tree || []}
                    stats={referralTree?.stats}
                    isLoading={treeLoading}
                    maxLevels={maxLevels}
                  />
                </CardContent>
              </motion.div>
            )}

            {/* View More Button - Show when collapsed */}
            {!isTreeExpanded && (
              <CardContent className="relative p-4 pt-0 sm:p-6 sm:pt-0">
                <Button
                  variant="outline"
                  onClick={() => setIsTreeExpanded(true)}
                  className="w-full border-indigo-500/20 bg-indigo-500/10 text-indigo-500 hover:bg-indigo-500/20"
                >
                  <ChevronDown className="mr-2 h-4 w-4" />
                  <span className="text-xs sm:text-sm">View Full Tree</span>
                </Button>
              </CardContent>
            )}
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
