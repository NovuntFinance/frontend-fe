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
import { cn, formatCurrency } from '@/lib/utils';
import { Input } from '@/components/ui/input';
import { LoadingStates } from '@/components/ui/loading-states';
import { toast } from '@/components/ui/enhanced-toast';
import { NumberedPagination } from '@/components/ui/numbered-pagination';
import { PageContainer } from '@/components/layout/PageContainer';

/** Team member row from all-team-members API */
interface TeamMemberRow {
  account: string;
  username?: string;
  level?: string;
  rank?: string;
  personalStake?: number;
  teamStake?: number;
  joined?: string;
  referrer?: { account?: string; username?: string };
}

// ─── Design tokens: mobile-first neumorphic, #0D162C / #009BF2 only ───
const NEU = {
  bg: '#0D162C',
  accent: '#009BF2',
  accent80: 'rgba(0, 155, 242, 0.8)',
  accent60: 'rgba(0, 155, 242, 0.6)',
  accent40: 'rgba(0, 155, 242, 0.4)',
  accent20: 'rgba(0, 155, 242, 0.2)',
  accent10: 'rgba(0, 155, 242, 0.1)',
  shadowDark: 'rgba(0, 0, 0, 0.5)',
  shadowLight: 'rgba(255, 255, 255, 0.04)',
  radius: { sm: 12, md: 16, lg: 20 },
  space: { xs: 8, sm: 12, md: 16, lg: 24 },
  raised: '6px 6px 12px rgba(0,0,0,0.5), -6px -6px 12px rgba(255,255,255,0.04)',
  raisedHover:
    '8px 8px 16px rgba(0,0,0,0.5), -8px -8px 16px rgba(255,255,255,0.06), 0 0 20px rgba(0,155,242,0.15)',
  inset:
    'inset 4px 4px 8px rgba(0,0,0,0.5), inset -4px -4px 8px rgba(255,255,255,0.04)',
  pressed:
    'inset 3px 3px 6px rgba(0,0,0,0.5), inset -3px -3px 6px rgba(255,255,255,0.03)',
  focusRing: '0 0 0 2px rgba(0, 155, 242, 0.4)',
} as const;

export default function TeamPage() {
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);
  const [allSearch, setAllSearch] = useState('');
  const [allPage, setAllPage] = useState(1);
  const pageSize = 30;

  const { data: referralStats } = useReferralStats();
  const { data: referralInfo, isLoading: infoLoading } = useReferralInfo();
  const { data: referralMetrics, isLoading: metricsLoading } =
    useReferralMetrics();
  const { data: allTeamMembersData, isLoading: allTeamMembersLoading } =
    useAllTeamMembers(allPage, pageSize, allSearch || undefined);
  const { isLoading: treeLoading, error: treeError } = useReferralTree(20);

  React.useEffect(() => {
    if (referralStats) {
      console.log('✅ [TeamPage] Referral stats:', referralStats);
    }
    if (referralMetrics) {
      console.log('✅ [TeamPage] Referral metrics:', referralMetrics);
    }
    if (treeError) {
      console.error('❌ [TeamPage] Referral tree error:', treeError);
    }
  }, [referralStats, referralMetrics, treeError]);

  const isLoading = metricsLoading || infoLoading;
  const referralCode = referralInfo?.referralCode || '';
  const referralLink = referralInfo?.referralLink || '';
  const teamMembers = allTeamMembersData?.teamMembers || [];
  const pagination = allTeamMembersData?.pagination || {
    page: 1,
    limit: pageSize,
    total: 0,
    totalPages: 0,
  };

  const hasUnknownLevels = (teamMembers as TeamMemberRow[]).some(
    (m) => !m.level || m.level === 'Unknown' || m.level === 'unknown'
  );
  const unknownLevelCount = (teamMembers as TeamMemberRow[]).filter(
    (m) => !m.level || m.level === 'Unknown' || m.level === 'unknown'
  ).length;

  const copyLink = async () => {
    if (!referralLink) {
      toast.error('Referral link not available');
      return;
    }
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(referralLink);
        setCopiedLink(true);
        toast.success('Link copied');
        setTimeout(() => setCopiedLink(false), 2000);
      } else {
        const ta = document.createElement('textarea');
        ta.value = referralLink;
        ta.style.position = 'fixed';
        ta.style.left = '-9999px';
        document.body.appendChild(ta);
        ta.select();
        document.execCommand('copy');
        document.body.removeChild(ta);
        setCopiedLink(true);
        setTimeout(() => setCopiedLink(false), 2000);
      }
    } catch {
      toast.error('Failed to copy');
    }
  };

  const copyCode = async () => {
    if (!referralCode) {
      toast.error('Referral code not available');
      return;
    }
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(referralCode);
        setCopiedCode(true);
        toast.success('Code copied');
        setTimeout(() => setCopiedCode(false), 2000);
      } else {
        const ta = document.createElement('textarea');
        ta.value = referralCode;
        ta.style.position = 'fixed';
        ta.style.left = '-9999px';
        document.body.appendChild(ta);
        ta.select();
        document.execCommand('copy');
        document.body.removeChild(ta);
        setCopiedCode(true);
        setTimeout(() => setCopiedCode(false), 2000);
      }
    } catch {
      toast.error('Failed to copy');
    }
  };

  // Neumorphic card (raised)
  const cardStyle = {
    background: NEU.bg,
    borderRadius: NEU.radius.md,
    boxShadow: NEU.raised,
    border: '1px solid rgba(0, 155, 242, 0.08)',
  };
  const cardStyleHover = {
    ...cardStyle,
    boxShadow: NEU.raisedHover,
  };
  // Inset input
  const inputInsetStyle = {
    background: NEU.bg,
    borderRadius: NEU.radius.sm,
    boxShadow: NEU.inset,
    border: '1px solid rgba(0, 155, 242, 0.12)',
    color: NEU.accent,
    padding: `${NEU.space.sm}px ${NEU.space.md}px`,
  };
  // Raised button (accent), pressed on active — white icon for contrast on #009BF2
  const btnRaisedStyle = {
    background: NEU.accent,
    color: '#fff',
    borderRadius: NEU.radius.sm,
    boxShadow: NEU.raised,
    border: '1px solid rgba(0, 155, 242, 0.3)',
  };

  if (isLoading) {
    return (
      <div className="min-h-screen py-4" style={{ background: NEU.bg }}>
        <PageContainer sectionSpacing>
          <div className="h-12 rounded-[16px]" style={{ ...cardStyle }} />
          <div className="grid grid-cols-2 gap-3">
            <div className="h-24 rounded-[16px]" style={{ ...cardStyle }} />
            <div className="h-24 rounded-[16px]" style={{ ...cardStyle }} />
          </div>
          <div className="h-20 rounded-[16px]" style={{ ...cardStyle }} />
          <div className="h-12 rounded-[16px]" style={{ ...cardStyle }} />
          <div className="h-48 rounded-[16px]" style={{ ...cardStyle }} />
        </PageContainer>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-4 pb-8" style={{ background: NEU.bg }}>
      <PageContainer as="main" sectionSpacing>
        {/* Stats + Share: on small = 2 cols (stats) then share full width; on large = 3 cols in one row */}
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-3">
          <div
            className="flex min-h-[100px] flex-col items-center justify-center gap-1 rounded-[16px] p-4 transition-[box-shadow] duration-200"
            style={cardStyle}
          >
            <span
              className="text-[10px] font-semibold tracking-wider uppercase"
              style={{ color: NEU.accent60 }}
            >
              Direct (L1)
            </span>
            <span
              className="text-2xl font-bold md:text-3xl"
              style={{ color: NEU.accent }}
            >
              {referralMetrics?.referrals?.total_direct ?? 0}
            </span>
            <span
              className="rounded-full px-2.5 py-0.5 text-[10px] font-semibold uppercase"
              style={{
                background: NEU.accent20,
                color: NEU.accent,
                border: '1px solid rgba(0,155,242,0.3)',
              }}
            >
              {referralMetrics?.referrals?.active_direct ?? 0} Active
            </span>
          </div>
          <div
            className="flex min-h-[100px] flex-col items-center justify-center gap-1 rounded-[16px] p-4 transition-[box-shadow] duration-200"
            style={cardStyle}
          >
            <span
              className="text-[10px] font-semibold tracking-wider uppercase"
              style={{ color: NEU.accent60 }}
            >
              Indirect (L2+)
            </span>
            <span
              className="text-2xl font-bold md:text-3xl"
              style={{ color: NEU.accent }}
            >
              {referralMetrics?.team?.total_members ?? 0}
            </span>
            <span
              className="rounded-full px-2.5 py-0.5 text-[10px] font-semibold uppercase"
              style={{
                background: NEU.accent20,
                color: NEU.accent,
                border: '1px solid rgba(0,155,242,0.3)',
              }}
            >
              {referralMetrics?.team?.active_members ?? 0} Active
            </span>
          </div>

          {/* Share referral card: full width below stats on small, same row on large */}
          <section
            className="col-span-2 rounded-[16px] p-4 transition-[box-shadow] duration-200 md:p-5 lg:col-span-1"
            style={cardStyle}
          >
            <h2
              className="mb-3 text-xs font-semibold tracking-wider uppercase"
              style={{ color: NEU.accent60 }}
            >
              Share Referral Link
            </h2>
            {infoLoading ? (
              <div
                className="h-10 w-full animate-pulse rounded-xl"
                style={{ ...inputInsetStyle }}
              />
            ) : referralLink ? (
              <div className="flex items-center gap-2">
                <input
                  readOnly
                  value={referralLink}
                  className="h-10 min-w-0 flex-1 rounded-xl font-mono text-xs transition-[box-shadow] duration-150 outline-none focus:ring-2 focus:ring-offset-0 focus:ring-offset-[#0D162C]"
                  style={{
                    ...inputInsetStyle,
                    height: 40,
                  }}
                  onFocus={(e) => {
                    e.currentTarget.style.boxShadow = `${NEU.inset}, ${NEU.focusRing}`;
                    e.currentTarget.style.borderColor = NEU.accent40;
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.boxShadow = NEU.inset;
                    e.currentTarget.style.borderColor =
                      'rgba(0, 155, 242, 0.12)';
                  }}
                />
                <button
                  type="button"
                  onClick={copyLink}
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full transition-all duration-150 hover:opacity-90 focus:ring-2 focus:ring-[rgba(0,155,242,0.5)] focus:ring-offset-2 focus:ring-offset-[#0D162C] focus:outline-none active:scale-[0.98] disabled:opacity-50"
                  style={btnRaisedStyle}
                  onMouseDown={(e) => {
                    (e.currentTarget as HTMLButtonElement).style.boxShadow =
                      NEU.pressed;
                  }}
                  onMouseUp={(e) => {
                    (e.currentTarget as HTMLButtonElement).style.boxShadow =
                      NEU.raised;
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLButtonElement).style.boxShadow =
                      NEU.raised;
                  }}
                >
                  {copiedLink ? (
                    <CheckCircle className="h-4 w-4" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </button>
              </div>
            ) : (
              <p
                className="flex items-center gap-2 text-xs"
                style={{ color: NEU.accent60 }}
              >
                <AlertCircle className="h-3.5 w-3.5" /> Link not available.
              </p>
            )}
            {referralCode && (
              <div className="mt-3 flex items-center gap-2">
                <span
                  className="shrink-0 text-[10px] uppercase"
                  style={{ color: NEU.accent60 }}
                >
                  Code
                </span>
                <input
                  readOnly
                  value={referralCode}
                  className="h-8 w-24 rounded-lg font-mono text-xs font-semibold outline-none"
                  style={inputInsetStyle}
                />
                <button
                  type="button"
                  onClick={copyCode}
                  className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full transition-all duration-150 hover:opacity-90 focus:ring-2 focus:ring-[rgba(0,155,242,0.5)] focus:ring-offset-2 focus:ring-offset-[#0D162C] focus:outline-none active:scale-[0.98]"
                  style={btnRaisedStyle}
                  onMouseDown={(e) => {
                    (e.currentTarget as HTMLButtonElement).style.boxShadow =
                      NEU.pressed;
                  }}
                  onMouseUp={(e) => {
                    (e.currentTarget as HTMLButtonElement).style.boxShadow =
                      NEU.raised;
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLButtonElement).style.boxShadow =
                      NEU.raised;
                  }}
                >
                  {copiedCode ? (
                    <CheckCircle className="h-3.5 w-3.5" />
                  ) : (
                    <Copy className="h-3.5 w-3.5" />
                  )}
                </button>
              </div>
            )}
          </section>
        </div>

        {treeLoading && (
          <div
            className="flex items-center gap-2 rounded-xl px-3 py-2 text-xs"
            style={{
              background: NEU.accent10,
              color: NEU.accent80,
              border: '1px solid rgba(0,155,242,0.15)',
            }}
          >
            <div className="h-3 w-3 animate-spin rounded-full border-2 border-[#009BF2] border-t-transparent" />
            Loading referral details…
          </div>
        )}
        {treeError && (
          <div
            className="flex items-center gap-2 rounded-xl px-3 py-2 text-xs"
            style={{
              background: NEU.accent10,
              color: NEU.accent60,
              border: '1px solid rgba(0,155,242,0.15)',
            }}
          >
            <AlertCircle className="h-3.5 w-3.5 shrink-0" />
            Referral details delayed. Stats above are current.
          </div>
        )}

        {/* 3. Search — neumorphic card with inset search input */}
        <section
          className="rounded-[16px] p-4 transition-[box-shadow] duration-200 md:p-5"
          style={cardStyle}
        >
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <h2 className="text-sm font-semibold" style={{ color: NEU.accent }}>
              Team Members
              {hasUnknownLevels && (
                <span
                  className="ml-2 text-xs font-normal"
                  style={{ color: NEU.accent60 }}
                >
                  ({unknownLevelCount} unknown level)
                </span>
              )}
            </h2>
            <input
              type="search"
              placeholder="Search by account or username"
              value={allSearch}
              onChange={(e) => {
                setAllSearch(e.target.value);
                setAllPage(1);
              }}
              className="h-10 w-full rounded-xl text-xs transition-[box-shadow] duration-150 outline-none placeholder:opacity-60 focus:ring-2 focus:ring-[rgba(0,155,242,0.4)] focus:ring-offset-0 sm:max-w-[220px]"
              style={inputInsetStyle}
            />
          </div>
        </section>

        {/* 4. Team members: stacked cards on mobile, table on md+ */}
        <section
          className="overflow-hidden rounded-[16px] transition-[box-shadow] duration-200"
          style={cardStyle}
        >
          {hasUnknownLevels && (
            <div
              className="flex items-center gap-2 px-4 py-2 text-xs"
              style={{
                background: NEU.accent10,
                borderBottom: '1px solid rgba(0,155,242,0.1)',
              }}
            >
              <AlertCircle
                className="h-3.5 w-3.5 shrink-0"
                style={{ color: NEU.accent }}
              />
              <span style={{ color: NEU.accent60 }}>
                Some members have unknown level (backend).
              </span>
            </div>
          )}

          {allTeamMembersLoading ? (
            <div className="space-y-3 p-4 md:p-6">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="h-20 animate-pulse rounded-xl"
                  style={{ ...inputInsetStyle }}
                />
              ))}
            </div>
          ) : teamMembers.length === 0 ? (
            <div
              className="flex flex-col items-center justify-center rounded-b-[16px] px-4 py-16 text-center"
              style={{ color: NEU.accent60 }}
            >
              <Users
                className="mb-2 h-10 w-10 opacity-60"
                style={{ color: NEU.accent }}
              />
              <p className="text-sm">No team members found.</p>
            </div>
          ) : (
            <>
              {/* Mobile: stacked member cards (no horizontal scroll by default) */}
              <div className="space-y-3 p-4 md:hidden">
                {(teamMembers as TeamMemberRow[]).map((member) => (
                  <div
                    key={`${member.account}-${member.username ?? ''}`}
                    className="space-y-2 rounded-xl p-4"
                    style={{
                      boxShadow: NEU.inset,
                      background: NEU.bg,
                      border: '1px solid rgba(0,155,242,0.08)',
                    }}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <span
                        className="truncate text-xs font-semibold"
                        style={{ color: NEU.accent }}
                      >
                        {member.account}
                      </span>
                      <span
                        className="shrink-0 text-[10px]"
                        style={{ color: NEU.accent60 }}
                      >
                        {member.joined}
                      </span>
                    </div>
                    <div className="text-xs" style={{ color: NEU.accent80 }}>
                      @{member.username || '–'}
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <span
                        className="rounded-md px-2 py-0.5 text-[10px] font-medium"
                        style={{ background: NEU.accent20, color: NEU.accent }}
                      >
                        {member.level === 'Unknown' || !member.level
                          ? 'Unknown'
                          : member.level}
                      </span>
                      {member.rank && (
                        <span
                          className="rounded-md px-2 py-0.5 text-[10px] font-medium"
                          style={{
                            background: NEU.accent10,
                            color: NEU.accent80,
                          }}
                        >
                          {member.rank}
                        </span>
                      )}
                    </div>
                    <div
                      className="grid grid-cols-2 gap-x-4 gap-y-1 text-[11px]"
                      style={{ color: NEU.accent60 }}
                    >
                      <span>
                        Personal: {formatCurrency(member.personalStake ?? 0)}
                      </span>
                      <span>Team: {formatCurrency(member.teamStake ?? 0)}</span>
                    </div>
                    {member.referrer && (
                      <div
                        className="border-t border-[rgba(0,155,242,0.1)] pt-1 text-[11px]"
                        style={{ color: NEU.accent60 }}
                      >
                        Referrer: {member.referrer.account}
                        {member.referrer.username
                          ? ` @${member.referrer.username}`
                          : ''}
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Desktop: table (neumorphic container, same palette) */}
              <div className="hidden overflow-x-auto md:block">
                <table className="min-w-full text-left text-sm">
                  <thead>
                    <tr
                      style={{ borderBottom: '1px solid rgba(0,155,242,0.12)' }}
                    >
                      {[
                        'Account',
                        'Username',
                        'Level',
                        'Rank',
                        'Personal Stake',
                        'Team Stake',
                        'Joined',
                        'Referrer',
                      ].map((h) => (
                        <th
                          key={h}
                          className="px-4 py-3 font-semibold"
                          style={{ color: NEU.accent60 }}
                        >
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {(teamMembers as TeamMemberRow[]).map((member) => (
                      <tr
                        key={`${member.account}-${member.username ?? ''}`}
                        style={{
                          borderBottom: '1px solid rgba(0,155,242,0.06)',
                        }}
                      >
                        <td
                          className="px-4 py-3 font-medium"
                          style={{ color: NEU.accent }}
                        >
                          {member.account}
                        </td>
                        <td
                          className="px-4 py-3"
                          style={{ color: NEU.accent80 }}
                        >
                          {member.username || '–'}
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className="rounded-md px-2 py-0.5 text-xs"
                            style={{
                              background: NEU.accent20,
                              color: NEU.accent,
                            }}
                          >
                            {member.level === 'Unknown' || !member.level
                              ? 'Unknown'
                              : member.level}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          {member.rank ? (
                            <span
                              className="rounded-md px-2 py-0.5 text-xs"
                              style={{
                                background: NEU.accent10,
                                color: NEU.accent80,
                              }}
                            >
                              {member.rank}
                            </span>
                          ) : (
                            <span style={{ color: NEU.accent60 }}>–</span>
                          )}
                        </td>
                        <td
                          className="px-4 py-3"
                          style={{ color: NEU.accent80 }}
                        >
                          {formatCurrency(member.personalStake ?? 0)}
                        </td>
                        <td
                          className="px-4 py-3"
                          style={{ color: NEU.accent80 }}
                        >
                          {formatCurrency(member.teamStake ?? 0)}
                        </td>
                        <td
                          className="px-4 py-3"
                          style={{ color: NEU.accent60 }}
                        >
                          {member.joined}
                        </td>
                        <td
                          className="px-4 py-3"
                          style={{ color: NEU.accent80 }}
                        >
                          {member.referrer
                            ? `${member.referrer.account}${member.referrer.username ? ` @${member.referrer.username}` : ''}`
                            : '–'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div
                className="flex flex-wrap items-center justify-between gap-2 px-4 py-3 text-xs"
                style={{
                  borderTop: '1px solid rgba(0,155,242,0.1)',
                  color: NEU.accent60,
                }}
              >
                <span>
                  Page {pagination.page} of {pagination.totalPages} (
                  {pagination.total} total)
                </span>
                <NumberedPagination
                  currentPage={pagination.page}
                  totalPages={pagination.totalPages}
                  onPageChange={setAllPage}
                />
              </div>
            </>
          )}
        </section>
      </PageContainer>
    </div>
  );
}
