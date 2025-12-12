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
import { ShimmerCard } from '@/components/ui/shimmer';
import { Progress } from '@/components/ui/progress';
import { toast } from 'sonner';

/**
 * Team Page (Merged: Referrals + Team)
 * Premium dark card design matching dashboard style
 */
export default function TeamPage() {
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);
  const [maxLevels, setMaxLevels] = useState(5);

  const { data: referralStats, isLoading: statsLoading } = useReferralStats();
  const { data: referralInfo, isLoading: infoLoading } = useReferralInfo();
  const { data: referralTree, isLoading: treeLoading } =
    useReferralTree(maxLevels);

  const isLoading = statsLoading || infoLoading || treeLoading;

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
      <div className="space-y-6">
        <ShimmerCard className="h-10 w-64" />
        <div className="grid gap-6 md:grid-cols-3">
          <ShimmerCard className="h-40" />
          <ShimmerCard className="h-40" />
          <ShimmerCard className="h-40" />
        </div>
        <ShimmerCard className="h-96" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Team & Referrals</h1>
        <p className="text-muted-foreground mt-1">
          Manage your referral network and view your team structure
        </p>
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
                  className="h-1.5 bg-blue-900/30"
                />
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Referrals Content */}
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
                  <ShimmerCard className="h-10 w-full" />
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
                  <ShimmerCard className="h-10 w-full" />
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

        {/* Tree Visualization Component */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          {/* Max Levels Selector */}
          <div className="mb-4 flex items-center justify-end gap-2">
            <label
              htmlFor="max-levels-select"
              className="text-muted-foreground text-sm"
            >
              Tree Depth:
            </label>
            <select
              id="max-levels-select"
              title="Select maximum tree depth to display"
              value={maxLevels}
              onChange={(e) => setMaxLevels(Number(e.target.value))}
              className="bg-background/50 rounded-lg border border-slate-500/20 px-3 py-1.5 text-sm"
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
        </motion.div>
      </div>
    </div>
  );
}
