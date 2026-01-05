'use client';

import React, { useState, useMemo } from 'react';
import {
  Users,
  Copy,
  CheckCircle,
  TrendingUp,
  Share,
  AlertCircle,
} from 'lucide-react';
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
import { slideUp } from '@/design-system/animations';

/**
 * Team Page (Merged: Referrals + Team)
 * Premium design matching dashboard, wallet, and stake pages using Staking Streak template
 */
export default function TeamPage() {
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);
  const [directSearch, setDirectSearch] = useState('');
  const [allSearch, setAllSearch] = useState('');
  const [directPage, setDirectPage] = useState(1);
  const [allPage, setAllPage] = useState(1);
  const pageSize = 10;

  const { data: referralStats, isLoading: statsLoading } = useReferralStats();
  const { data: referralInfo, isLoading: infoLoading } = useReferralInfo();
  const { data: referralTree, isLoading: treeLoading } = useReferralTree(20);

  type ExtendedReferralEntry = NonNullable<
    typeof referralTree
  >['tree'][number] & {
    personalInvestment?: number;
    referralInvestmentAmount?: number;
  };

  const isLoading = statsLoading || infoLoading || treeLoading;
  const reducedMotion = prefersReducedMotion();

  // Get referral code and link from API
  // useReferralInfo returns the data object { referralCode, referralLink, ... }
  const referralCode = referralInfo?.referralCode || '';
  const referralLink = referralInfo?.referralLink || '';

  const directReferrals = useMemo(() => {
    const entries = (referralTree?.tree || []) as ExtendedReferralEntry[];
    return entries.filter((entry) => entry.level === 1);
  }, [referralTree]);

  const allReferrals = useMemo(() => {
    return (referralTree?.tree || []) as ExtendedReferralEntry[];
  }, [referralTree]);

  const filteredDirectReferrals = useMemo(() => {
    const term = directSearch.toLowerCase().trim();
    if (!term) return directReferrals;
    return directReferrals.filter((entry) => {
      const email = entry.email?.toLowerCase() || '';
      const username = entry.username?.toLowerCase() || '';
      return email.includes(term) || username.includes(term);
    });
  }, [directReferrals, directSearch]);

  const filteredAllReferrals = useMemo(() => {
    const term = allSearch.toLowerCase().trim();
    if (!term) return allReferrals;
    return allReferrals.filter((entry) => {
      const email = entry.email?.toLowerCase() || '';
      const username = entry.username?.toLowerCase() || '';
      return email.includes(term) || username.includes(term);
    });
  }, [allReferrals, allSearch]);

  const totalDirectPages = Math.max(
    1,
    Math.ceil(filteredDirectReferrals.length / pageSize)
  );
  const totalAllPages = Math.max(
    1,
    Math.ceil(filteredAllReferrals.length / pageSize)
  );

  const paginatedDirectReferrals = useMemo(() => {
    const start = (directPage - 1) * pageSize;
    return filteredDirectReferrals.slice(start, start + pageSize);
  }, [filteredDirectReferrals, directPage]);

  const paginatedAllReferrals = useMemo(() => {
    const start = (allPage - 1) * pageSize;
    return filteredAllReferrals.slice(start, start + pageSize);
  }, [filteredAllReferrals, allPage]);

  const maskAccount = (value: string) => {
    if (!value) return '';
    if (value.length <= 6) return value;
    return `${value.slice(0, 3)}***${value.slice(-3)}`;
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
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 md:grid-cols-3 md:gap-6">
          {/* Total Referrals */}
          <Card className="bg-card/70 border-0 shadow-md">
            <CardHeader className="space-y-1 p-4 sm:p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-purple-500/20">
                    <Users className="h-4 w-4 text-purple-400" />
                  </div>
                  <div>
                    <CardTitle className="text-sm font-semibold sm:text-base">
                      Total Referrals
                    </CardTitle>
                    <CardDescription className="text-xs sm:text-sm">
                      Total number of referrals
                    </CardDescription>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-4 pt-0 sm:p-6 sm:pt-0">
              <p className="text-2xl font-bold sm:text-3xl">
                {referralStats?.totalReferrals || 0}
              </p>
              <p className="text-muted-foreground mt-1 text-xs sm:text-sm">
                {referralStats?.activeReferrals || 0} active
              </p>
            </CardContent>
          </Card>

          {/* Total Earned */}
          <Card className="bg-card/70 border-0 shadow-md">
            <CardHeader className="space-y-1 p-4 sm:p-6">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/20">
                  <TrendingUp className="h-4 w-4 text-emerald-400" />
                </div>
                <div>
                  <CardTitle className="text-sm font-semibold sm:text-base">
                    Total Earned
                  </CardTitle>
                  <CardDescription className="text-xs sm:text-sm">
                    Earnings from all levels
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-4 pt-0 sm:p-6 sm:pt-0">
              <p className="text-2xl font-bold text-emerald-400 sm:text-3xl">
                {formatCurrency(referralStats?.totalEarned || 0)}
              </p>
            </CardContent>
          </Card>

          {/* Team Members */}
          <Card className="bg-card/70 border-0 shadow-md">
            <CardHeader className="space-y-1 p-4 sm:p-6">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-500/20">
                  <Users className="h-4 w-4 text-blue-400" />
                </div>
                <div>
                  <CardTitle className="text-sm font-semibold sm:text-base">
                    Team Members
                  </CardTitle>
                  <CardDescription className="text-xs sm:text-sm">
                    Active team members
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-4 pt-0 sm:p-6 sm:pt-0">
              <p className="text-2xl font-bold sm:text-3xl">
                {referralStats?.totalReferrals || 0}
              </p>
              <p className="text-muted-foreground mt-1 text-xs sm:text-sm">
                {referralStats?.activeReferrals || 0} active
              </p>
            </CardContent>
          </Card>
        </div>

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

        {/* Direct Referrals List */}
        <Card className="bg-card/70 border-0 shadow-md">
          <CardHeader className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between sm:p-6">
            <div>
              <CardTitle className="text-sm font-semibold sm:text-base">
                Direct Referrals
              </CardTitle>
              <CardDescription className="text-xs sm:text-sm">
                People who joined directly with your link or code
              </CardDescription>
            </div>
            <Input
              placeholder="Search by email or username"
              value={directSearch}
              onChange={(e) => {
                setDirectSearch(e.target.value);
                setDirectPage(1);
              }}
              className="h-8 w-full max-w-xs text-xs sm:h-9 sm:text-sm"
            />
          </CardHeader>
          <CardContent className="p-0">
            <div className="min-h-[200px] text-xs sm:text-sm">
              {treeLoading ? (
                <div className="p-4 sm:p-6">
                  <LoadingStates.List lines={3} />
                </div>
              ) : paginatedDirectReferrals.length === 0 ? (
                <div className="text-muted-foreground flex h-40 items-center justify-center px-4">
                  <p>No direct referrals yet.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full text-left">
                    <thead className="border-border/50 bg-background/40 border-b">
                      <tr>
                        <th className="px-4 py-2 font-medium">Account</th>
                        <th className="px-4 py-2 font-medium">Username</th>
                        <th className="hidden px-4 py-2 font-medium md:table-cell">
                          Personal Investment
                        </th>
                        <th className="hidden px-4 py-2 font-medium lg:table-cell">
                          Referral Investment
                        </th>
                        <th className="px-4 py-2 font-medium">Joined</th>
                      </tr>
                    </thead>
                    <tbody>
                      {paginatedDirectReferrals.map((referral) => (
                        <tr
                          key={`${referral.referral}-${referral.joinedAt}`}
                          className="border-border/20 border-b last:border-0"
                        >
                          <td className="px-4 py-2 align-middle">
                            {maskAccount(referral.email || referral.username)}
                          </td>
                          <td className="px-4 py-2 align-middle">
                            {referral.username || '-'}
                          </td>
                          <td className="hidden px-4 py-2 align-middle md:table-cell">
                            {formatCurrency(
                              (referral as any).personalInvestment ?? 0
                            )}
                          </td>
                          <td className="hidden px-4 py-2 align-middle lg:table-cell">
                            {formatCurrency(
                              (referral as any).referralInvestmentAmount ?? 0
                            )}
                          </td>
                          <td className="px-4 py-2 align-middle">
                            {new Date(referral.joinedAt).toLocaleDateString()}
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
                Page {directPage} of {totalDirectPages}
              </span>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={directPage <= 1}
                  onClick={() => setDirectPage((p) => Math.max(1, p - 1))}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={directPage >= totalDirectPages}
                  onClick={() =>
                    setDirectPage((p) => Math.min(totalDirectPages, p + 1))
                  }
                >
                  Next
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* All Referrals List */}
        <Card className="bg-card/70 border-0 shadow-md">
          <CardHeader className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between sm:p-6">
            <div>
              <CardTitle className="text-sm font-semibold sm:text-base">
                All Referrals
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
              {treeLoading ? (
                <div className="p-4 sm:p-6">
                  <LoadingStates.List lines={3} />
                </div>
              ) : paginatedAllReferrals.length === 0 ? (
                <div className="text-muted-foreground flex h-40 items-center justify-center px-4">
                  <p>No referrals yet.</p>
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
                          Personal Investment
                        </th>
                        <th className="hidden px-4 py-2 font-medium lg:table-cell">
                          Referral Investment
                        </th>
                        <th className="px-4 py-2 font-medium">Joined</th>
                      </tr>
                    </thead>
                    <tbody>
                      {paginatedAllReferrals.map((referral) => (
                        <tr
                          key={`${referral.referral}-${referral.joinedAt}`}
                          className="border-border/20 border-b last:border-0"
                        >
                          <td className="px-4 py-2 align-middle">
                            {maskAccount(referral.email || referral.username)}
                          </td>
                          <td className="px-4 py-2 align-middle">
                            {referral.username || '-'}
                          </td>
                          <td className="px-4 py-2 align-middle">
                            L{referral.level}
                          </td>
                          <td className="hidden px-4 py-2 align-middle md:table-cell">
                            {formatCurrency(
                              (referral as any).personalInvestment ?? 0
                            )}
                          </td>
                          <td className="hidden px-4 py-2 align-middle lg:table-cell">
                            {formatCurrency(
                              (referral as any).referralInvestmentAmount ?? 0
                            )}
                          </td>
                          <td className="px-4 py-2 align-middle">
                            {new Date(referral.joinedAt).toLocaleDateString()}
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
                Page {allPage} of {totalAllPages}
              </span>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={allPage <= 1}
                  onClick={() => setAllPage((p) => Math.max(1, p - 1))}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={allPage >= totalAllPages}
                  onClick={() =>
                    setAllPage((p) => Math.min(totalAllPages, p + 1))
                  }
                >
                  Next
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
