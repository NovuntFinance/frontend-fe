'use client';

import React, { useState } from 'react';
import { Users, Copy, CheckCircle, Share, AlertCircle } from 'lucide-react';
import {
  useReferralStats,
  useReferralInfo,
  useReferralTree,
  useReferralMetrics,
  useAllTeamMembers,
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
import { toast } from '@/components/ui/enhanced-toast';
import { NumberedPagination } from '@/components/ui/numbered-pagination';

/**
 * Team Page (Merged: Referrals + Team)
 * Premium design matching dashboard, wallet, and stake pages using Staking Streak template
 */
export default function TeamPage() {
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);
  const [allSearch, setAllSearch] = useState('');
  const [allPage, setAllPage] = useState(1);
  const pageSize = 30; // Match backend default

  const { data: referralStats, isLoading: statsLoading } = useReferralStats();
  const { data: referralInfo, isLoading: infoLoading } = useReferralInfo();
  const { data: referralMetrics, isLoading: metricsLoading } =
    useReferralMetrics();

  // Use new endpoint for team members with referrer info
  const { data: allTeamMembersData, isLoading: allTeamMembersLoading } =
    useAllTeamMembers(allPage, pageSize, allSearch || undefined);

  // Keep referral tree for other parts of the page (if needed)
  const { isLoading: treeLoading, error: treeError } = useReferralTree(20);

  // Log fetched data for debugging
  React.useEffect(() => {
    if (referralStats) {
      console.log('✅ [TeamPage] Successfully fetched referral stats:', {
        totalReferrals: referralStats.totalReferrals,
        activeReferrals: referralStats.activeReferrals,
        totalEarned: referralStats.totalEarned,
      });
    }
    if (referralMetrics) {
      console.log('✅ [TeamPage] Successfully fetched referral metrics:', {
        fullData: referralMetrics,
        referrals: referralMetrics.referrals,
        team: referralMetrics.team,
        totalDirect: referralMetrics.referrals?.total_direct,
        activeDirect: referralMetrics.referrals?.active_direct,
        totalMembers: referralMetrics.team?.total_members,
        activeMembers: referralMetrics.team?.active_members,
      });
    }
    if (treeError) {
      console.error('❌ [TeamPage] Error loading referral tree:', treeError);
      if ((treeError as any)?.code === 'ECONNABORTED') {
        console.warn(
          '⏱️ [TeamPage] Request timed out - showing stats only. Tree details will load if backend responds.'
        );
      }
    }
  }, [referralStats, referralMetrics, treeError]);

  // Only wait for fast endpoints (stats, info, and metrics), not slow tree
  const isLoading = statsLoading || infoLoading || metricsLoading;

  // Get referral code and link from API
  // useReferralInfo returns the data object { referralCode, referralLink, ... }
  const referralCode = referralInfo?.referralCode || '';
  const referralLink = referralInfo?.referralLink || '';

  // Use new endpoint data (already paginated and filtered by backend)
  const teamMembers = allTeamMembersData?.teamMembers || [];
  const pagination = allTeamMembersData?.pagination || {
    page: 1,
    limit: pageSize,
    total: 0,
    totalPages: 0,
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
      <div className="from-background via-background to-primary/5 min-h-screen bg-gradient-to-br">
        <div className="space-y-4 sm:space-y-6">
          <LoadingStates.Card height="h-20" className="w-full" />
          <LoadingStates.Grid
            items={3}
            columns={3}
            className="gap-3 sm:gap-4 md:gap-6"
          />
          <LoadingStates.Card height="h-64" />
        </div>
      </div>
    );
  }

  return (
    <div className="from-background via-background to-primary/5 min-h-screen bg-gradient-to-br">
      <div className="space-y-4 sm:space-y-6">
        {/* Simple Page Header */}
        <Card className="bg-card/70 border-0 shadow-md">
          <CardHeader className="flex flex-row items-center gap-3 p-4 sm:p-6">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-500/20">
              <Users className="h-5 w-5 text-purple-400" />
            </div>
            <div className="space-y-1">
              <CardTitle className="text-sm font-semibold sm:text-base md:text-lg">
                Team & Referrals
              </CardTitle>
              <CardDescription className="text-xs sm:text-sm">
                Quick overview of your referrals and earnings
              </CardDescription>
            </div>
          </CardHeader>
        </Card>

        {/* Summary Stats */}
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 md:gap-6">
          {/* Total Direct Team */}
          <Card className="bg-card/70 border-0 shadow-md">
            <CardHeader className="space-y-1 p-4 sm:p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-purple-500/20">
                    <Users className="h-4 w-4 text-purple-400" />
                  </div>
                  <div>
                    <CardTitle className="text-sm font-semibold sm:text-base">
                      Total Direct Team
                    </CardTitle>
                    <CardDescription className="text-xs sm:text-sm">
                      Level 1
                    </CardDescription>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-4 pt-0 sm:p-6 sm:pt-0">
              <p className="text-2xl font-bold sm:text-3xl">
                {referralMetrics?.referrals?.total_direct || 0}
              </p>
              <p className="text-muted-foreground mt-1 text-xs sm:text-sm">
                {referralMetrics?.referrals?.active_direct || 0} active
              </p>
            </CardContent>
          </Card>

          {/* Total Indirect Team */}
          <Card className="bg-card/70 border-0 shadow-md">
            <CardHeader className="space-y-1 p-4 sm:p-6">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-500/20">
                  <Users className="h-4 w-4 text-blue-400" />
                </div>
                <div>
                  <CardTitle className="text-sm font-semibold sm:text-base">
                    Total Indirect Team
                  </CardTitle>
                  <CardDescription className="text-xs sm:text-sm">
                    Level 2+
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-4 pt-0 sm:p-6 sm:pt-0">
              <p className="text-2xl font-bold sm:text-3xl">
                {referralMetrics?.team?.total_members || 0}
              </p>
              <p className="text-muted-foreground mt-1 text-xs sm:text-sm">
                {referralMetrics?.team?.active_members || 0} active
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Show loading indicator when tree is being fetched */}
        {treeLoading && (
          <Card className="border border-blue-500/20 bg-blue-500/10 shadow-md">
            <CardContent className="flex items-center gap-3 p-4">
              <div className="h-5 w-5 animate-spin rounded-full border-2 border-blue-500 border-t-transparent" />
              <div className="flex-1">
                <h4 className="mb-1 text-sm font-semibold">
                  Loading detailed referral information...
                </h4>
                <p className="text-muted-foreground text-xs">
                  Fetching investment details for all{' '}
                  {referralMetrics?.referrals?.total_direct || 0} direct
                  referrals
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Show warning if tree loading is slow or failed */}
        {treeError && (
          <Card className="border border-yellow-500/20 bg-yellow-500/10 shadow-md">
            <CardContent className="flex items-start gap-3 p-4">
              <AlertCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-yellow-500" />
              <div className="flex-1">
                <h4 className="mb-1 text-sm font-semibold">
                  Referral details are taking longer than expected
                </h4>
                <p className="text-muted-foreground mb-2 text-xs">
                  Your total referrals (
                  {referralMetrics?.referrals?.total_direct || 0}) and earnings
                  ({formatCurrency(referralStats?.totalEarned || 0)}) are shown
                  above, but detailed information is still loading. This can
                  happen when you have many referrals.
                </p>
                <p className="text-xs text-yellow-600 dark:text-yellow-400">
                  💡 Tip: Your stats are safely stored. The page will
                  auto-update when detailed data is ready.
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Referral Link & Code */}
        <Card className="bg-card/70 border-0 shadow-md">
          <CardHeader className="p-4 sm:p-6">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-purple-500/20">
                <Share className="h-4 w-4 text-purple-400" />
              </div>
              <div>
                <CardTitle className="text-sm font-semibold sm:text-base md:text-lg">
                  Your Referral Link
                </CardTitle>
                <CardDescription className="text-xs sm:text-sm">
                  Share this link and code to invite friends
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4 p-4 pt-0 sm:p-6 sm:pt-0">
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

        {/* All Team Members List */}
        <Card className="bg-card/70 border-0 shadow-md">
          <CardHeader className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between sm:p-6">
            <div>
              <CardTitle className="text-sm font-semibold sm:text-base">
                All Team Members
              </CardTitle>
              <CardDescription className="text-xs sm:text-sm">
                Full team across all levels
              </CardDescription>
            </div>
            <Input
              placeholder="Search by email or username"
              value={allSearch}
              onChange={(e) => {
                setAllSearch(e.target.value);
                setAllPage(1);
              }}
              className="h-8 w-full max-w-xs text-xs sm:h-9 sm:text-sm"
            />
          </CardHeader>
          <CardContent className="p-0">
            <div className="min-h-[200px] text-xs sm:text-sm">
              {allTeamMembersLoading ? (
                <div className="p-4 sm:p-6">
                  <LoadingStates.List lines={3} />
                </div>
              ) : teamMembers.length === 0 ? (
                <div className="text-muted-foreground flex h-40 items-center justify-center px-4">
                  <p>No team members found.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full text-left">
                    <thead className="border-border/50 bg-background/40 border-b">
                      <tr>
                        <th className="px-4 py-2 font-medium">Account</th>
                        <th className="px-4 py-2 font-medium">Username</th>
                        <th className="px-4 py-2 font-medium">Level</th>
                        <th className="hidden px-4 py-2 font-medium md:table-cell">
                          Personal Stake
                        </th>
                        <th className="hidden px-4 py-2 font-medium lg:table-cell">
                          Team Stake
                        </th>
                        <th className="px-4 py-2 font-medium">Joined</th>
                        <th className="px-4 py-2 font-medium">Referrer</th>
                      </tr>
                    </thead>
                    <tbody>
                      {teamMembers.map((member) => (
                        <tr
                          key={`${member.account}-${member.username}`}
                          className="border-border/20 border-b last:border-0"
                        >
                          <td className="px-4 py-2 align-middle">
                            {member.account}
                          </td>
                          <td className="px-4 py-2 align-middle">
                            {member.username || '-'}
                          </td>
                          <td className="px-4 py-2 align-middle">
                            {member.level}
                          </td>
                          <td className="hidden px-4 py-2 align-middle md:table-cell">
                            {formatCurrency(member.personalStake)}
                          </td>
                          <td className="hidden px-4 py-2 align-middle lg:table-cell">
                            {formatCurrency(member.teamStake)}
                          </td>
                          <td className="px-4 py-2 align-middle">
                            {member.joined}
                          </td>
                          <td className="px-4 py-2 align-middle">
                            {member.referrer ? (
                              <div>
                                <div className="font-medium">
                                  {member.referrer.account}
                                </div>
                                <div className="text-muted-foreground text-[10px] sm:text-xs">
                                  @{member.referrer.username}
                                </div>
                              </div>
                            ) : (
                              <span className="text-muted-foreground">N/A</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
            <div className="flex items-center justify-between px-4 py-3 text-xs sm:text-sm">
              <span className="text-muted-foreground">
                Page {pagination.page} of {pagination.totalPages} (
                {pagination.total} total)
              </span>
              <NumberedPagination
                currentPage={pagination.page}
                totalPages={pagination.totalPages}
                onPageChange={setAllPage}
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
