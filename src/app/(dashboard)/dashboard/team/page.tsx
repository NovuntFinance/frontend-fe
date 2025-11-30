'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Users,
  Copy,
  CheckCircle,
  TrendingUp,
  Share,
  Star,
  ChevronRight,
  ChevronDown,
  Search,
  AlertCircle,
} from 'lucide-react';
import {
  useReferralStats,
  useReferralInfo,
  useReferralTree,
  useTeamInfo,
} from '@/lib/queries';
import { formatCurrency, formatDate } from '@/lib/utils';
import { REFERRAL_COMMISSION_RATES } from '@/types/referral';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import { toast } from 'sonner';

/**
 * Level Color Configuration
 * Each level (1-5) has unique vibrant colors for visual differentiation
 */
const LEVEL_COLORS = {
  1: {
    bg: 'from-purple-600/30 via-purple-500/20 to-purple-600/10',
    border: 'border-purple-500',
    iconBg: 'bg-purple-500/40',
    iconColor: 'text-purple-400',
    labelColor: 'text-purple-400',
    badgeBg: 'bg-purple-500',
    badgeText: 'text-white',
    avatarGradient: 'from-purple-500 to-purple-600',
    cardBg: 'bg-purple-500/15',
    hex: '#a855f7', // purple-500
  },
  2: {
    bg: 'from-blue-600/30 via-blue-500/20 to-blue-600/10',
    border: 'border-blue-500',
    iconBg: 'bg-blue-500/40',
    iconColor: 'text-blue-400',
    labelColor: 'text-blue-400',
    badgeBg: 'bg-blue-500',
    badgeText: 'text-white',
    avatarGradient: 'from-blue-500 to-blue-600',
    cardBg: 'bg-blue-500/15',
    hex: '#3b82f6', // blue-500
  },
  3: {
    bg: 'from-green-600/30 via-green-500/20 to-green-600/10',
    border: 'border-green-500',
    iconBg: 'bg-green-500/40',
    iconColor: 'text-green-400',
    labelColor: 'text-green-400',
    badgeBg: 'bg-green-500',
    badgeText: 'text-white',
    avatarGradient: 'from-green-500 to-green-600',
    cardBg: 'bg-green-500/15',
    hex: '#22c55e', // green-500
  },
  4: {
    bg: 'from-yellow-600/30 via-yellow-500/20 to-yellow-600/10',
    border: 'border-yellow-500',
    iconBg: 'bg-yellow-500/40',
    iconColor: 'text-yellow-400',
    labelColor: 'text-yellow-400',
    badgeBg: 'bg-yellow-500',
    badgeText: 'text-white',
    avatarGradient: 'from-yellow-500 to-yellow-600',
    cardBg: 'bg-yellow-500/15',
    hex: '#eab308', // yellow-500
  },
  5: {
    bg: 'from-orange-600/30 via-orange-500/20 to-orange-600/10',
    border: 'border-orange-500',
    iconBg: 'bg-orange-500/40',
    iconColor: 'text-orange-400',
    labelColor: 'text-orange-400',
    badgeBg: 'bg-orange-500',
    badgeText: 'text-white',
    avatarGradient: 'from-orange-500 to-orange-600',
    cardBg: 'bg-orange-500/15',
    hex: '#f97316', // orange-500
  },
} as const;

/**
 * Team Page (Merged: Referrals + Team)
 * Premium dark card design matching dashboard style
 */
export default function TeamPage() {
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);
  const [maxLevels, setMaxLevels] = useState(5);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRank, setSelectedRank] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'referrals' | 'team'>('referrals');
  const [expandedLevels, setExpandedLevels] = useState<Set<number>>(new Set());

  const { data: referralStats, isLoading: statsLoading } = useReferralStats();
  const { data: referralInfo, isLoading: infoLoading } = useReferralInfo();
  const { data: referralTree, isLoading: treeLoading } =
    useReferralTree(maxLevels);
  const { data: teamInfo, isLoading: teamLoading } = useTeamInfo();

  const isLoading = statsLoading || infoLoading || treeLoading || teamLoading;

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

  // Group tree entries by level
  const treeByLevel =
    referralTree?.tree?.reduce(
      (acc, entry) => {
        if (!acc[entry.level]) {
          acc[entry.level] = [];
        }
        acc[entry.level].push(entry);
        return acc;
      },
      {} as Record<number, typeof referralTree.tree>
    ) || {};

  // Filter downlines
  const filteredDownlines =
    teamInfo?.directDownlines?.filter((downline) => {
      const matchesSearch =
        !searchQuery ||
        downline.username.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesRank = !selectedRank || downline.rank === selectedRank;

      return matchesSearch && matchesRank;
    }) || [];

  // Get unique ranks for filter
  const availableRanks = Array.from(
    new Set(teamInfo?.directDownlines?.map((d) => d.rank) || [])
  );

  // Toggle level expansion
  const toggleLevel = (level: number) => {
    setExpandedLevels((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(level)) {
        newSet.delete(level);
      } else {
        newSet.add(level);
      }
      return newSet;
    });
  };

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
      <div className="space-y-6">
        <Skeleton className="h-10 w-64" />
        <div className="grid gap-6 md:grid-cols-3">
          <Skeleton className="h-40" />
          <Skeleton className="h-40" />
          <Skeleton className="h-40" />
        </div>
        <Skeleton className="h-96" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Team & Referrals</h1>
        <p className="text-muted-foreground mt-1">
          Manage your referral network and team structure
        </p>
      </div>

      {/* Tab Navigation */}
      <div className="border-border flex gap-2 border-b">
        <button
          onClick={() => setActiveTab('referrals')}
          className={`px-4 py-2 font-medium transition-colors ${
            activeTab === 'referrals'
              ? 'text-primary border-primary border-b-2'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          Referrals
        </button>
        <button
          onClick={() => setActiveTab('team')}
          className={`px-4 py-2 font-medium transition-colors ${
            activeTab === 'team'
              ? 'text-primary border-primary border-b-2'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          Team Structure
        </button>
      </div>

      {/* Stats Cards - Premium Dark Design */}
      <div className="grid gap-6 md:grid-cols-3">
        {/* Total Referrals Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="border-purple-500/20 bg-gradient-to-br from-purple-900/20 via-purple-800/10 to-transparent">
            <CardContent className="p-6">
              <div className="mb-4 flex items-center justify-between">
                <div className="rounded-xl bg-purple-500/20 p-3">
                  <Users className="h-6 w-6 text-purple-400" />
                </div>
              </div>
              <div className="space-y-2">
                <p className="text-sm font-medium text-purple-400">
                  Total Referrals
                </p>
                <p className="text-3xl font-bold text-white">
                  {referralStats?.totalReferrals || 0}
                </p>
                <p className="text-muted-foreground text-xs">
                  {referralStats?.activeReferrals || 0} active
                </p>
                <Progress
                  value={
                    referralStats?.totalReferrals
                      ? Math.min(
                          100,
                          ((referralStats.activeReferrals || 0) /
                            referralStats.totalReferrals) *
                            100
                        )
                      : 0
                  }
                  className="h-1.5 bg-purple-900/30"
                />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Total Earned Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="border-green-500/20 bg-gradient-to-br from-green-900/20 via-green-800/10 to-transparent">
            <CardContent className="p-6">
              <div className="mb-4 flex items-center justify-between">
                <div className="rounded-xl bg-green-500/20 p-3">
                  <TrendingUp className="h-6 w-6 text-green-400" />
                </div>
              </div>
              <div className="space-y-2">
                <p className="text-sm font-medium text-green-400">
                  Total Earned
                </p>
                <p className="text-3xl font-bold text-white">
                  {formatCurrency(referralStats?.totalEarned || 0)}
                </p>
                <p className="text-muted-foreground text-xs">From all levels</p>
                <Progress
                  value={
                    referralStats?.totalEarned
                      ? Math.min(100, (referralStats.totalEarned / 10000) * 100)
                      : 0
                  }
                  className="h-1.5 bg-green-900/30"
                />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Team Members Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="border-blue-500/20 bg-gradient-to-br from-blue-900/20 via-blue-800/10 to-transparent">
            <CardContent className="p-6">
              <div className="mb-4 flex items-center justify-between">
                <div className="rounded-xl bg-blue-500/20 p-3">
                  <Users className="h-6 w-6 text-blue-400" />
                </div>
              </div>
              <div className="space-y-2">
                <p className="text-sm font-medium text-blue-400">
                  Team Members
                </p>
                <p className="text-3xl font-bold text-white">
                  {teamInfo?.teamStats?.totalTeamMembers || 0}
                </p>
                <p className="text-muted-foreground text-xs">
                  {teamInfo?.teamStats?.totalDirectDownlines || 0} direct
                </p>
                <Progress
                  value={
                    teamInfo?.teamStats?.totalTeamMembers
                      ? Math.min(
                          100,
                          ((teamInfo.teamStats.totalDirectDownlines || 0) /
                            teamInfo.teamStats.totalTeamMembers) *
                            100
                        )
                      : 0
                  }
                  className="h-1.5 bg-blue-900/30"
                />
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Referrals Tab Content */}
      {activeTab === 'referrals' && (
        <div className="space-y-6">
          {/* Referral Link Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Card className="border-purple-500/20 bg-gradient-to-br from-purple-900/20 via-blue-900/10 to-transparent">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-purple-400">
                  <Share className="h-5 w-5" />
                  Your Referral Link
                </CardTitle>
                <CardDescription>
                  Share this link to earn commissions on your referrals
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Referral Link */}
                <div>
                  <label className="text-muted-foreground mb-2 block text-sm font-medium">
                    Referral Link
                  </label>
                  {infoLoading ? (
                    <Skeleton className="h-10 w-full" />
                  ) : referralLink ? (
                    <div className="flex gap-2">
                      <Input
                        value={referralLink}
                        readOnly
                        className="bg-background/50 border-purple-500/20 font-mono text-sm"
                      />
                      <Button
                        variant="outline"
                        onClick={copyLink}
                        className="border-purple-500/20"
                      >
                        {copiedLink ? (
                          <CheckCircle className="h-4 w-4 text-green-500" />
                        ) : (
                          <Copy className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  ) : (
                    <div className="text-muted-foreground flex items-center gap-2 text-sm">
                      <AlertCircle className="h-4 w-4" />
                      <span>
                        Referral link not available. Please refresh the page.
                      </span>
                    </div>
                  )}
                  {copiedLink && (
                    <p className="mt-2 text-xs text-green-500">
                      Link copied to clipboard!
                    </p>
                  )}
                </div>

                {/* Referral Code */}
                <div>
                  <label className="text-muted-foreground mb-2 block text-sm font-medium">
                    Referral Code
                  </label>
                  {infoLoading ? (
                    <Skeleton className="h-10 w-full" />
                  ) : referralCode ? (
                    <div className="flex gap-2">
                      <Input
                        value={referralCode}
                        readOnly
                        className="bg-background/50 border-purple-500/20 font-mono text-lg font-bold tracking-wider"
                      />
                      <Button
                        variant="outline"
                        onClick={copyCode}
                        className="border-purple-500/20"
                      >
                        {copiedCode ? (
                          <CheckCircle className="h-4 w-4 text-green-500" />
                        ) : (
                          <Copy className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  ) : (
                    <div className="text-muted-foreground flex items-center gap-2 text-sm">
                      <AlertCircle className="h-4 w-4" />
                      <span>
                        Referral code not available. Please refresh the page.
                      </span>
                    </div>
                  )}
                  {copiedCode && (
                    <p className="mt-2 text-xs text-green-500">
                      Code copied to clipboard!
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Referral Tree with Expand/Collapse */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <Card className="border-slate-500/20 bg-gradient-to-br from-slate-900/20 via-slate-800/10 to-transparent">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Referral Tree</CardTitle>
                    <CardDescription>
                      Your referral network structure (levels 1-5 receive
                      bonuses)
                    </CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-muted-foreground text-sm">
                      Depth:
                    </span>
                    <select
                      value={maxLevels}
                      onChange={(e) => {
                        setMaxLevels(Number(e.target.value));
                        setExpandedLevels(new Set()); // Reset expanded levels when depth changes
                      }}
                      className="bg-background/50 rounded-lg border border-slate-500/20 px-3 py-1.5 text-sm"
                    >
                      {[5, 10, 15, 20].map((level) => (
                        <option key={level} value={level}>
                          {level} levels
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {referralTree?.tree && referralTree.tree.length > 0 ? (
                  <div className="space-y-3">
                    {/* Render levels 1-5 with expand/collapse */}
                    {[1, 2, 3, 4, 5].map((level) => {
                      const entries = treeByLevel[level] || [];
                      const isExpanded = expandedLevels.has(level);
                      const colors =
                        LEVEL_COLORS[level as keyof typeof LEVEL_COLORS];
                      const hasEntries = entries.length > 0;

                      return (
                        <motion.div
                          key={level}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.6 + level * 0.1 }}
                          className={`rounded-lg border-2 ${colors.border} bg-gradient-to-br ${colors.bg} overflow-hidden shadow-lg`}
                          style={{
                            borderColor: colors.hex,
                            boxShadow: `0 4px 6px -1px ${colors.hex}20, 0 2px 4px -1px ${colors.hex}10`,
                          }}
                        >
                          {/* Level Header - Clickable */}
                          <button
                            onClick={() => hasEntries && toggleLevel(level)}
                            disabled={!hasEntries}
                            className={`flex w-full items-center justify-between p-4 transition-all ${
                              hasEntries
                                ? 'cursor-pointer hover:opacity-90'
                                : 'cursor-default opacity-60'
                            }`}
                            style={
                              hasEntries
                                ? {
                                    backgroundColor: `${colors.hex}08`,
                                  }
                                : {}
                            }
                          >
                            <div className="flex items-center gap-3">
                              <div
                                className={`rounded-xl border-2 p-3 ${colors.border}`}
                                style={{
                                  backgroundColor: `${colors.hex}30`,
                                  borderColor: colors.hex,
                                }}
                              >
                                {hasEntries && isExpanded ? (
                                  <ChevronDown
                                    className={`h-6 w-6 ${colors.iconColor}`}
                                  />
                                ) : hasEntries ? (
                                  <ChevronRight
                                    className={`h-6 w-6 ${colors.iconColor}`}
                                  />
                                ) : (
                                  <Users
                                    className={`h-6 w-6 ${colors.iconColor}`}
                                  />
                                )}
                              </div>
                              <div className="text-left">
                                <div className="flex items-center gap-2">
                                  <Badge
                                    className={`${colors.badgeBg} ${colors.badgeText} px-3 py-1 text-sm font-bold`}
                                    style={{
                                      backgroundColor: colors.hex,
                                      borderColor: colors.hex,
                                    }}
                                  >
                                    Level {level}
                                  </Badge>
                                  <span
                                    className={`text-sm font-semibold ${colors.labelColor}`}
                                  >
                                    {
                                      REFERRAL_COMMISSION_RATES[
                                        `level${level}` as keyof typeof REFERRAL_COMMISSION_RATES
                                      ]
                                    }
                                    % commission
                                  </span>
                                </div>
                                <p className="text-muted-foreground mt-1 text-xs">
                                  {entries.length} referral
                                  {entries.length !== 1 ? 's' : ''}
                                </p>
                              </div>
                            </div>
                            {hasEntries && (
                              <div
                                className={`text-sm font-bold ${colors.labelColor} rounded-lg px-3 py-1`}
                                style={{
                                  backgroundColor: `${colors.hex}30`,
                                }}
                              >
                                {isExpanded ? 'Collapse' : 'Expand'}
                              </div>
                            )}
                          </button>

                          {/* Level Content - Expandable */}
                          <AnimatePresence>
                            {isExpanded && hasEntries && (
                              <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: 'auto', opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                transition={{ duration: 0.3 }}
                                className="overflow-hidden"
                              >
                                <div className="p-4 pt-0">
                                  <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                                    {entries.map((entry, index) => (
                                      <motion.div
                                        key={entry.referral}
                                        initial={{ opacity: 0, scale: 0.95 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        transition={{ delay: index * 0.05 }}
                                        className={`rounded-lg border-2 p-3 shadow-md transition-all hover:opacity-80`}
                                        style={{
                                          backgroundColor: `${colors.hex}15`,
                                          borderColor: colors.hex,
                                          boxShadow: `0 2px 4px ${colors.hex}20`,
                                        }}
                                      >
                                        <div className="mb-2 flex items-center gap-2">
                                          <div
                                            className="h-10 w-10 rounded-full border-2 p-0.5"
                                            style={{ borderColor: colors.hex }}
                                          >
                                            <Avatar className="h-full w-full">
                                              <AvatarFallback
                                                className={`text-sm ${colors.iconColor} font-bold`}
                                                style={{
                                                  background: `linear-gradient(135deg, ${colors.hex}40, ${colors.hex}60)`,
                                                }}
                                              >
                                                {entry.username
                                                  .charAt(0)
                                                  .toUpperCase()}
                                              </AvatarFallback>
                                            </Avatar>
                                          </div>
                                          <div className="min-w-0 flex-1">
                                            <p className="truncate text-sm font-medium text-white">
                                              {entry.username}
                                            </p>
                                            <p className="text-muted-foreground truncate text-xs">
                                              {entry.email}
                                            </p>
                                          </div>
                                        </div>
                                        <div className="flex items-center justify-between text-xs">
                                          <span className="text-muted-foreground">
                                            {formatDate(
                                              new Date(entry.joinedAt)
                                            )}
                                          </span>
                                          {entry.hasQualifyingStake ? (
                                            <Badge
                                              variant="default"
                                              className="bg-green-500 text-xs"
                                            >
                                              Active
                                            </Badge>
                                          ) : (
                                            <Badge
                                              variant="outline"
                                              className="text-xs"
                                            >
                                              Inactive
                                            </Badge>
                                          )}
                                        </div>
                                      </motion.div>
                                    ))}
                                  </div>
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </motion.div>
                      );
                    })}

                    {/* Levels 6+ (if any) - No bonuses but still shown */}
                    {Object.entries(treeByLevel)
                      .filter(([level]) => Number(level) > 5)
                      .sort(([a], [b]) => Number(a) - Number(b))
                      .map(([level, entries]) => {
                        const levelNum = Number(level);
                        const isExpanded = expandedLevels.has(levelNum);
                        const hasEntries = entries.length > 0;

                        return (
                          <motion.div
                            key={level}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.6 + levelNum * 0.1 }}
                            className="overflow-hidden rounded-lg border-2 border-slate-500/20 bg-gradient-to-br from-slate-900/20 via-slate-800/10 to-transparent"
                          >
                            <button
                              onClick={() =>
                                hasEntries && toggleLevel(levelNum)
                              }
                              disabled={!hasEntries}
                              className={`flex w-full items-center justify-between p-4 transition-colors ${
                                hasEntries
                                  ? 'hover:bg-background/20 cursor-pointer'
                                  : 'cursor-default opacity-60'
                              }`}
                            >
                              <div className="flex items-center gap-3">
                                <div className="rounded-lg bg-slate-500/20 p-2">
                                  {hasEntries && isExpanded ? (
                                    <ChevronDown className="h-5 w-5 text-slate-400" />
                                  ) : hasEntries ? (
                                    <ChevronRight className="h-5 w-5 text-slate-400" />
                                  ) : (
                                    <Users className="h-5 w-5 text-slate-400" />
                                  )}
                                </div>
                                <div className="text-left">
                                  <div className="flex items-center gap-2">
                                    <Badge
                                      variant="outline"
                                      className="text-sm"
                                    >
                                      Level {level}
                                    </Badge>
                                    <span className="text-muted-foreground text-xs">
                                      (No bonus, but counts toward team stake)
                                    </span>
                                  </div>
                                  <p className="text-muted-foreground mt-1 text-xs">
                                    {entries.length} referral
                                    {entries.length !== 1 ? 's' : ''}
                                  </p>
                                </div>
                              </div>
                              {hasEntries && (
                                <div className="text-muted-foreground text-sm font-semibold">
                                  {isExpanded ? 'Collapse' : 'Expand'}
                                </div>
                              )}
                            </button>

                            <AnimatePresence>
                              {isExpanded && hasEntries && (
                                <motion.div
                                  initial={{ height: 0, opacity: 0 }}
                                  animate={{ height: 'auto', opacity: 1 }}
                                  exit={{ height: 0, opacity: 0 }}
                                  transition={{ duration: 0.3 }}
                                  className="overflow-hidden"
                                >
                                  <div className="p-4 pt-0">
                                    <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                                      {entries.map((entry, index) => (
                                        <motion.div
                                          key={entry.referral}
                                          initial={{ opacity: 0, scale: 0.95 }}
                                          animate={{ opacity: 1, scale: 1 }}
                                          transition={{ delay: index * 0.05 }}
                                          className="bg-background/50 hover:bg-background/70 rounded-lg border border-slate-500/20 p-3 transition-colors"
                                        >
                                          <div className="mb-2 flex items-center gap-2">
                                            <Avatar className="h-8 w-8">
                                              <AvatarFallback className="bg-gradient-to-br from-slate-500/20 to-slate-500/40 text-xs text-slate-400">
                                                {entry.username
                                                  .charAt(0)
                                                  .toUpperCase()}
                                              </AvatarFallback>
                                            </Avatar>
                                            <div className="min-w-0 flex-1">
                                              <p className="truncate text-sm font-medium text-white">
                                                {entry.username}
                                              </p>
                                              <p className="text-muted-foreground truncate text-xs">
                                                {entry.email}
                                              </p>
                                            </div>
                                          </div>
                                          <div className="flex items-center justify-between text-xs">
                                            <span className="text-muted-foreground">
                                              {formatDate(
                                                new Date(entry.joinedAt)
                                              )}
                                            </span>
                                            {entry.hasQualifyingStake ? (
                                              <Badge
                                                variant="default"
                                                className="bg-green-500 text-xs"
                                              >
                                                Active
                                              </Badge>
                                            ) : (
                                              <Badge
                                                variant="outline"
                                                className="text-xs"
                                              >
                                                Inactive
                                              </Badge>
                                            )}
                                          </div>
                                        </motion.div>
                                      ))}
                                    </div>
                                  </div>
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </motion.div>
                        );
                      })}

                    {referralTree.note && (
                      <div className="rounded-lg border border-blue-500/20 bg-blue-500/10 p-3">
                        <p className="text-sm text-blue-600 dark:text-blue-400">
                          {referralTree.note}
                        </p>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="py-12 text-center">
                    <Users className="text-muted-foreground mx-auto mb-3 h-12 w-12" />
                    <h3 className="mb-2 text-lg font-semibold">
                      No Referrals Yet
                    </h3>
                    <p className="text-muted-foreground mb-6 text-sm">
                      Start sharing your referral link to build your network!
                    </p>
                    <Button onClick={copyLink}>
                      <Copy className="mr-2 h-4 w-4" />
                      Copy Referral Link
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </div>
      )}

      {/* Team Tab Content */}
      {activeTab === 'team' && (
        <div className="space-y-6">
          {/* Rank Distribution */}
          {teamInfo?.teamStats?.rankDistribution &&
            Object.keys(teamInfo.teamStats.rankDistribution).length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
              >
                <Card className="border-slate-500/20 bg-gradient-to-br from-slate-900/20 via-slate-800/10 to-transparent">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Star className="h-5 w-5" />
                      Rank Distribution
                    </CardTitle>
                    <CardDescription>
                      Distribution of ranks in your team
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                      {Object.entries(teamInfo.teamStats.rankDistribution).map(
                        ([rank, count], index) => (
                          <motion.div
                            key={rank}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.5 + index * 0.1 }}
                            className="bg-background/50 flex items-center justify-between rounded-lg border border-slate-500/20 p-3"
                          >
                            <span className="font-medium">{rank}</span>
                            <Badge variant="secondary">{count} members</Badge>
                          </motion.div>
                        )
                      )}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}

          {/* Direct Downlines List */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <Card className="border-slate-500/20 bg-gradient-to-br from-slate-900/20 via-slate-800/10 to-transparent">
              <CardHeader>
                <CardTitle>Direct Downlines</CardTitle>
                <CardDescription>
                  Your direct referrals and their team statistics
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Search and Filter */}
                <div className="flex flex-col gap-3 sm:flex-row">
                  <div className="relative flex-1">
                    <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 transform" />
                    <Input
                      placeholder="Search by username..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="bg-background/50 border-slate-500/20 pl-10"
                    />
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Button
                      variant={selectedRank === null ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setSelectedRank(null)}
                    >
                      All Ranks
                    </Button>
                    {availableRanks.map((rank) => (
                      <Button
                        key={rank}
                        variant={selectedRank === rank ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setSelectedRank(rank)}
                      >
                        {rank}
                      </Button>
                    ))}
                  </div>
                </div>

                {/* Downlines List */}
                {filteredDownlines.length > 0 ? (
                  <div className="space-y-3">
                    {filteredDownlines.map((downline, index) => (
                      <motion.div
                        key={downline._id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.6 + index * 0.05 }}
                        className="bg-background/50 hover:bg-background/70 flex items-center justify-between rounded-lg border border-slate-500/20 p-4 transition-colors"
                      >
                        <div className="flex min-w-0 flex-1 items-center gap-4">
                          <Avatar className="h-12 w-12">
                            <AvatarFallback className="bg-gradient-to-br from-blue-500/20 to-blue-500/40 font-bold text-blue-400">
                              {downline.username.charAt(0).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div className="min-w-0 flex-1">
                            <div className="mb-1 flex items-center gap-2">
                              <p className="truncate font-semibold">
                                {downline.username}
                              </p>
                              <Badge variant="outline" className="text-xs">
                                {downline.rank}
                              </Badge>
                              {downline.isActive && (
                                <Badge
                                  variant="default"
                                  className="bg-green-500 text-xs"
                                >
                                  Active
                                </Badge>
                              )}
                            </div>
                            <div className="text-muted-foreground flex flex-wrap gap-4 text-sm">
                              <span>
                                Personal:{' '}
                                <span className="text-foreground font-medium">
                                  {formatCurrency(downline.personalStake)}
                                </span>
                              </span>
                              <span>
                                Team:{' '}
                                <span className="text-foreground font-medium">
                                  {formatCurrency(downline.teamStake)}
                                </span>
                              </span>
                              <span>
                                Joined:{' '}
                                <span className="text-foreground font-medium">
                                  {formatDate(new Date(downline.createdAt))}
                                </span>
                              </span>
                            </div>
                          </div>
                        </div>
                        {downline.directDownlines &&
                          downline.directDownlines.length > 0 && (
                            <div className="text-muted-foreground flex items-center gap-2 text-sm">
                              <span>
                                {downline.directDownlines.length} sub-teams
                              </span>
                              <ChevronRight className="h-4 w-4" />
                            </div>
                          )}
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  <div className="py-12 text-center">
                    <Users className="text-muted-foreground mx-auto mb-3 h-12 w-12" />
                    <h3 className="mb-2 text-lg font-semibold">
                      No Team Members Yet
                    </h3>
                    <p className="text-muted-foreground mb-6 text-sm">
                      {searchQuery || selectedRank
                        ? 'No team members match your filters'
                        : 'Start referring users to build your team!'}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </div>
      )}
    </div>
  );
}
