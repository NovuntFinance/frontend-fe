'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Users, Copy, CheckCircle, AlertCircle, Share2 } from 'lucide-react';
import {
  useReferralStats,
  useReferralInfo,
  useReferralTree,
  useReferralMetrics,
  useAllTeamMembers,
} from '@/lib/queries';
import { formatCurrency } from '@/lib/utils';
import { toast } from '@/components/ui/enhanced-toast';
import { NumberedPagination } from '@/components/ui/numbered-pagination';
import { prefersReducedMotion } from '@/lib/accessibility';
import neuStyles from '@/styles/neumorphic.module.css';

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

// Dashboard design system: use theme tokens for consistent card shadow
const NEU_RAISED_SHADOW = 'var(--neu-shadow-raised)';
const NEU_RAISED_HOVER = 'var(--neu-shadow-raised-hover)';
const NEU_BORDER = '1px solid var(--neu-border)';
const NEU_INSET =
  'inset 4px 4px 8px rgba(0,0,0,0.5), inset -4px -4px 8px rgba(255,255,255,0.04)';

/* Theme tokens (--neu-*) for dashboard light/dark */

export default function TeamPage() {
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);
  const [allSearch, setAllSearch] = useState('');
  const [allPage, setAllPage] = useState(1);
  const pageSize = 30;
  const reducedMotion = prefersReducedMotion();

  useReferralStats();
  const { data: referralInfo, isLoading: infoLoading } = useReferralInfo();
  const { data: referralMetrics, isLoading: metricsLoading } =
    useReferralMetrics();
  const { data: allTeamMembersData, isLoading: allTeamMembersLoading } =
    useAllTeamMembers(allPage, pageSize, allSearch || undefined);
  const { isLoading: treeLoading, error: treeError } = useReferralTree(20);

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

  const cardStyle = {
    background: 'var(--neu-bg)',
    boxShadow: NEU_RAISED_SHADOW,
    border: NEU_BORDER,
  };
  const inputInsetStyle = {
    background: 'var(--neu-bg)',
    borderRadius: 12,
    boxShadow: NEU_INSET,
    border: '1px solid rgba(0, 155, 242, 0.12)',
    color: 'var(--neu-accent)',
    padding: '12px 16px',
  };
  const btnRaisedStyle = {
    background: 'var(--neu-accent)',
    color: 'var(--neu-accent-foreground)',
    borderRadius: 12,
    boxShadow: NEU_RAISED_SHADOW,
    border: '1px solid rgba(0, 155, 242, 0.3)',
  };

  if (isLoading) {
    return (
      <div
        className="min-h-screen lg:h-full lg:min-h-0"
        style={{ background: 'var(--neu-bg)' }}
      >
        <div className="flex flex-col gap-5">
          <div className="h-48 rounded-2xl" style={{ ...cardStyle }} />
          <div className="h-32 rounded-2xl" style={{ ...cardStyle }} />
          <div className="h-16 rounded-2xl" style={{ ...cardStyle }} />
          <div className="h-64 rounded-2xl" style={{ ...cardStyle }} />
        </div>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen lg:h-full lg:min-h-0"
      style={{ background: 'var(--neu-bg)' }}
    >
      <div className="flex flex-col gap-5">
        {/* 1. Welcome-style card: Team stats (Direct L1 + Indirect L2+) */}
        <motion.section
          initial={reducedMotion ? false : { opacity: 0, y: 20 }}
          animate={reducedMotion ? false : { opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="rounded-2xl p-5 transition-all duration-300 sm:p-6"
          style={{
            ...cardStyle,
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.boxShadow = NEU_RAISED_HOVER;
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.boxShadow = NEU_RAISED_SHADOW;
          }}
        >
          <div className="mb-5 flex items-center gap-3 sm:mb-6">
            <div
              className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl sm:h-14 sm:w-14"
              style={{
                background: 'var(--neu-accent)',
                border: '1px solid var(--neu-border)',
                color: 'var(--neu-accent-foreground)',
                boxShadow:
                  '0 2px 8px rgba(0,0,0,0.2), inset 0 1px 0 rgba(255,255,255,0.2)',
              }}
            >
              <Users className="h-6 w-6 sm:h-7 sm:w-7" strokeWidth={2} />
            </div>
            <div className="min-w-0">
              <h1
                className="text-base font-bold sm:text-lg"
                style={{ color: 'var(--neu-text-primary)' }}
              >
                Team
              </h1>
              <p
                className="text-xs sm:text-sm"
                style={{ color: 'var(--neu-text-secondary)' }}
              >
                Direct and indirect referrals
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:gap-4">
            <div
              className="rounded-xl p-5 transition-all duration-200 sm:p-6"
              style={{
                background: 'var(--neu-accent)',
                boxShadow: NEU_RAISED_SHADOW,
                border: '1px solid var(--neu-border)',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.boxShadow = NEU_RAISED_HOVER;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.boxShadow = NEU_RAISED_SHADOW;
              }}
            >
              <div className="mb-1 flex items-center gap-2">
                <Users
                  className="h-4 w-4 sm:h-5 sm:w-5"
                  style={{ color: 'var(--neu-accent-foreground)' }}
                  strokeWidth={2}
                />
                <p
                  className="text-[10px] font-medium tracking-wide sm:text-xs"
                  style={{ color: 'var(--neu-text-secondary)' }}
                >
                  Direct (L1)
                </p>
              </div>
              <p
                className="text-xl font-bold sm:text-2xl md:text-3xl"
                style={{ color: 'var(--neu-accent-foreground)' }}
              >
                {referralMetrics?.referrals?.total_direct ?? 0}
              </p>
              <span
                className="mt-1 inline-block rounded-full px-2.5 py-0.5 text-[10px] font-semibold uppercase"
                style={{
                  background: 'rgba(13, 22, 44, 0.15)',
                  color: 'var(--neu-accent-foreground)',
                  border: '1px solid var(--neu-border)',
                }}
              >
                {referralMetrics?.referrals?.active_direct ?? 0} Active
              </span>
            </div>

            <div
              className="rounded-xl p-5 transition-all duration-200 sm:p-6"
              style={{
                background: 'var(--neu-accent)',
                boxShadow: NEU_RAISED_SHADOW,
                border: '1px solid var(--neu-border)',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.boxShadow = NEU_RAISED_HOVER;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.boxShadow = NEU_RAISED_SHADOW;
              }}
            >
              <div className="mb-1 flex items-center gap-2">
                <Users
                  className="h-4 w-4 sm:h-5 sm:w-5"
                  style={{ color: 'var(--neu-accent-foreground)' }}
                  strokeWidth={2}
                />
                <p
                  className="text-[10px] font-medium tracking-wide sm:text-xs"
                  style={{ color: 'var(--neu-text-secondary)' }}
                >
                  Indirect (L2+)
                </p>
              </div>
              <p
                className="text-xl font-bold sm:text-2xl md:text-3xl"
                style={{ color: 'var(--neu-accent-foreground)' }}
              >
                {referralMetrics?.team?.total_members ?? 0}
              </p>
              <span
                className="mt-1 inline-block rounded-full px-2.5 py-0.5 text-[10px] font-semibold uppercase"
                style={{
                  background: 'rgba(13, 22, 44, 0.15)',
                  color: 'var(--neu-accent-foreground)',
                  border: '1px solid var(--neu-border)',
                }}
              >
                {referralMetrics?.team?.active_members ?? 0} Active
              </span>
            </div>
          </div>
        </motion.section>

        {/* 2. Share Referral Link – dashboard card style */}
        <motion.section
          initial={reducedMotion ? false : { opacity: 0, y: 20 }}
          animate={reducedMotion ? false : { opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="rounded-2xl p-5 transition-all duration-300 sm:p-6"
          style={cardStyle}
          onMouseEnter={(e) => {
            e.currentTarget.style.boxShadow = NEU_RAISED_HOVER;
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.boxShadow = NEU_RAISED_SHADOW;
          }}
        >
          <div className="mb-3 flex items-center gap-2">
            <Share2
              className="h-4 w-4 sm:h-5 sm:w-5"
              style={{ color: 'var(--neu-accent)' }}
            />
            <h2
              className="text-sm font-semibold sm:text-base"
              style={{ color: 'var(--neu-text-primary)' }}
            >
              Share Referral Link
            </h2>
          </div>
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
                aria-label="Referral link"
                className="min-w-0 flex-1 rounded-xl font-mono text-xs transition-[box-shadow] duration-150 outline-none"
                style={{
                  ...inputInsetStyle,
                  height: 40,
                }}
              />
              <button
                type="button"
                onClick={copyLink}
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full transition-all duration-150 hover:opacity-90 focus:ring-2 focus:ring-[rgba(0,155,242,0.5)] focus:ring-offset-2 focus:ring-offset-[var(--neu-bg)] focus:outline-none active:scale-[0.98]"
                style={btnRaisedStyle}
                aria-label="Copy link"
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
              style={{ color: 'var(--neu-text-secondary)' }}
            >
              <AlertCircle className="h-3.5 w-3.5" /> Link not available.
            </p>
          )}
          {referralCode && (
            <div className="mt-3 flex items-center gap-2">
              <span
                className="shrink-0 text-[10px] font-medium uppercase"
                style={{ color: 'var(--neu-text-secondary)' }}
              >
                Code
              </span>
              <input
                readOnly
                value={referralCode}
                aria-label="Referral code"
                className="h-8 w-24 rounded-lg font-mono text-xs font-semibold outline-none"
                style={inputInsetStyle}
              />
              <button
                type="button"
                onClick={copyCode}
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full transition-all duration-150 hover:opacity-90 focus:ring-2 focus:ring-[rgba(0,155,242,0.5)] focus:outline-none active:scale-[0.98]"
                style={btnRaisedStyle}
                aria-label="Copy code"
              >
                {copiedCode ? (
                  <CheckCircle className="h-3.5 w-3.5" />
                ) : (
                  <Copy className="h-3.5 w-3.5" />
                )}
              </button>
            </div>
          )}
        </motion.section>

        {treeLoading && (
          <div
            className="flex items-center gap-2 rounded-xl px-3 py-2 text-xs"
            style={{
              background: 'rgba(var(--neu-accent-rgb), 0.12)',
              color: 'var(--neu-accent)',
              border: '1px solid rgba(0,155,242,0.15)',
            }}
          >
            <div className="h-3 w-3 animate-spin rounded-full border-2 border-[var(--neu-border)] border-t-transparent" />
            Loading referral details…
          </div>
        )}
        {treeError && (
          <div
            className="flex items-center gap-2 rounded-xl px-3 py-2 text-xs"
            style={{
              background: 'rgba(var(--neu-accent-rgb), 0.12)',
              color: 'var(--neu-text-secondary)',
              border: '1px solid rgba(0,155,242,0.15)',
            }}
          >
            <AlertCircle className="h-3.5 w-3.5 shrink-0" />
            Referral details delayed. Stats above are current.
          </div>
        )}

        {/* 3. Team Members card – same layout as Transaction History on stake page (icon + title + subtitle + search) */}
        <motion.section
          initial={reducedMotion ? false : { opacity: 0, y: 20 }}
          animate={reducedMotion ? false : { opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="rounded-2xl p-5 sm:p-6"
          style={{
            background: 'var(--neu-bg)',
            boxShadow: NEU_RAISED_SHADOW,
            border: NEU_BORDER,
          }}
        >
          <div className="mb-4 flex items-center gap-3">
            <div
              className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl sm:h-14 sm:w-14"
              style={{
                background: 'var(--neu-accent)',
                border: '1px solid var(--neu-border)',
                color: 'var(--neu-accent-foreground)',
                boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.2)',
              }}
            >
              <Users className="h-6 w-6 sm:h-7 sm:w-7" />
            </div>
            <div className="min-w-0 flex-1">
              <h2
                className="text-base font-bold sm:text-lg"
                style={{ color: 'var(--neu-text-primary)' }}
              >
                Team Members
                {hasUnknownLevels && (
                  <span className="ml-2 text-xs font-normal opacity-80">
                    ({unknownLevelCount} unknown level)
                  </span>
                )}
              </h2>
              <p
                className="text-xs sm:text-sm"
                style={{ color: 'var(--neu-text-secondary)' }}
              >
                Search by account or username
              </p>
            </div>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
            <input
              type="search"
              placeholder="Search by account or username"
              value={allSearch}
              onChange={(e) => {
                setAllSearch(e.target.value);
                setAllPage(1);
              }}
              className="h-10 w-full rounded-[14px] border px-3 py-2 text-sm outline-none placeholder:opacity-60 sm:h-11 sm:max-w-[280px]"
              style={{
                background: 'rgba(0, 0, 0, 0.04)',
                border: '1px solid var(--neu-border)',
                color: 'var(--neu-text-primary)',
              }}
              aria-label="Search team members"
            />
          </div>
        </motion.section>

        {/* 4. Team members list – same as stake page: list OUTSIDE card, no wrapper (mobile) */}
        {allTeamMembersLoading ? (
          <motion.div
            initial={reducedMotion ? false : { opacity: 0, y: 20 }}
            animate={reducedMotion ? false : { opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="space-y-2 sm:space-y-2.5 md:hidden"
          >
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className={`rounded-[14px] ${neuStyles['neu-card']}`}
                style={{
                  boxShadow: NEU_RAISED_SHADOW,
                }}
              >
                <div className="h-16 animate-pulse px-3 py-2.5 sm:px-4 sm:py-3" />
              </div>
            ))}
          </motion.div>
        ) : teamMembers.length === 0 ? (
          <motion.div
            initial={reducedMotion ? false : { opacity: 0, y: 20 }}
            animate={reducedMotion ? false : { opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className={`rounded-[18px] p-6 text-center sm:p-8 md:hidden ${neuStyles['neu-card']}`}
            style={{
              boxShadow: NEU_RAISED_SHADOW,
            }}
          >
            <p
              className="text-sm sm:text-base"
              style={{ color: 'var(--neu-text-muted)' }}
            >
              No team members found.
            </p>
          </motion.div>
        ) : (
          <motion.div
            initial={reducedMotion ? false : { opacity: 0, y: 20 }}
            animate={reducedMotion ? false : { opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="space-y-2 sm:space-y-2.5 md:hidden"
          >
            {(teamMembers as TeamMemberRow[]).map((member) => (
              <div
                key={`${member.account}-${member.username ?? ''}`}
                className={`rounded-[14px] ${neuStyles['neu-card']}`}
                style={{
                  boxShadow:
                    '4px 4px 10px var(--neu-shadow-dark), -4px -4px 10px var(--neu-shadow-light)',
                }}
              >
                <div
                  className="px-3 py-2.5 transition-colors hover:bg-[rgba(0,155,242,0.03)] sm:px-4 sm:py-3"
                  style={{ borderColor: 'var(--neu-border)' }}
                >
                  <div className="flex items-baseline justify-between gap-3">
                    <p
                      className="min-w-0 truncate text-sm font-medium sm:text-base"
                      style={{ color: 'var(--neu-text-primary)' }}
                    >
                      {member.account}
                    </p>
                    <p
                      className="shrink-0 text-xs sm:text-sm"
                      style={{ color: 'var(--neu-text-muted)' }}
                    >
                      {member.joined}
                    </p>
                  </div>
                  <p
                    className="text-xs"
                    style={{ color: 'var(--neu-text-muted)' }}
                  >
                    @{member.username || '–'}
                  </p>
                  <div className="mt-1.5 flex flex-wrap gap-2">
                    <span
                      className="rounded-md px-2 py-0.5 text-[10px] font-medium"
                      style={{
                        background: 'rgba(0, 155, 242, 0.15)',
                        color: 'var(--neu-accent)',
                      }}
                    >
                      {member.level === 'Unknown' || !member.level
                        ? 'Unknown'
                        : member.level}
                    </span>
                    {member.rank && (
                      <span
                        className="rounded-md border px-2 py-0.5 text-[10px] font-medium"
                        style={{
                          borderColor: 'rgba(0, 155, 242, 0.25)',
                          color: 'var(--neu-text-secondary)',
                        }}
                      >
                        {member.rank}
                      </span>
                    )}
                  </div>
                  <div
                    className="mt-1 grid grid-cols-2 gap-x-4 text-[11px]"
                    style={{ color: 'var(--neu-text-muted)' }}
                  >
                    <span>
                      Personal: {formatCurrency(member.personalStake ?? 0)}
                    </span>
                    <span>Team: {formatCurrency(member.teamStake ?? 0)}</span>
                  </div>
                  {member.referrer && (
                    <div
                      className="mt-1 border-t border-[rgba(0,155,242,0.1)] pt-1 text-[11px]"
                      style={{ color: 'var(--neu-text-muted)' }}
                    >
                      Referrer: {member.referrer.account}
                      {member.referrer.username
                        ? ` @${member.referrer.username}`
                        : ''}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </motion.div>
        )}

        {/* 4b. Mobile: pagination (same as desktop so users can change page on small screens) */}
        {!allTeamMembersLoading &&
          teamMembers.length > 0 &&
          pagination.totalPages > 1 && (
            <motion.div
              initial={reducedMotion ? false : { opacity: 0, y: 12 }}
              animate={reducedMotion ? false : { opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
              className={`flex flex-wrap items-center justify-between gap-2 rounded-2xl px-4 py-3 text-xs md:hidden ${neuStyles['neu-card']}`}
              style={{
                color: 'var(--neu-text-secondary)',
                boxShadow: NEU_RAISED_SHADOW,
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
                maxVisiblePages={4}
              />
            </motion.div>
          )}

        {/* 5. Desktop: table inside a card */}
        <motion.section
          initial={reducedMotion ? false : { opacity: 0, y: 20 }}
          animate={reducedMotion ? false : { opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="hidden overflow-hidden rounded-2xl transition-all duration-300 md:block"
          style={cardStyle}
          onMouseEnter={(e) => {
            e.currentTarget.style.boxShadow = NEU_RAISED_HOVER;
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.boxShadow = NEU_RAISED_SHADOW;
          }}
        >
          {hasUnknownLevels && (
            <div
              className="flex items-center gap-2 px-4 py-2 text-xs"
              style={{
                background: 'rgba(var(--neu-accent-rgb), 0.12)',
                borderBottom: '1px solid rgba(0,155,242,0.1)',
              }}
            >
              <AlertCircle
                className="h-3.5 w-3.5 shrink-0"
                style={{ color: 'var(--neu-accent)' }}
              />
              <span style={{ color: 'var(--neu-text-secondary)' }}>
                Some members have unknown level (backend).
              </span>
            </div>
          )}
          {allTeamMembersLoading && (
            <div className="space-y-2 p-4">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="h-14 animate-pulse rounded-[14px]"
                  style={{ background: 'rgba(255,255,255,0.04)' }}
                />
              ))}
            </div>
          )}
          {!allTeamMembersLoading && teamMembers.length === 0 && (
            <div
              className="flex flex-col items-center justify-center px-4 py-16 text-center"
              style={{ color: 'var(--neu-text-secondary)' }}
            >
              <Users
                className="mb-2 h-10 w-10 opacity-60"
                style={{ color: 'var(--neu-accent)' }}
              />
              <p className="text-sm">No team members found.</p>
            </div>
          )}
          {!allTeamMembersLoading && teamMembers.length > 0 && (
            <>
              <div className="overflow-x-auto">
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
                          style={{ color: 'var(--neu-text-secondary)' }}
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
                          style={{ color: 'var(--neu-accent)' }}
                        >
                          {member.account}
                        </td>
                        <td className="px-4 py-3" style={{ color: 'var(--neu-text-primary)' }}>
                          {member.username || '–'}
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className="rounded-md px-2 py-0.5 text-xs"
                            style={{ background: 'rgba(var(--neu-accent-rgb), 0.12)', color: 'var(--neu-accent)' }}
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
                                background: 'rgba(0,155,242,0.08)',
                                color: 'var(--neu-text-secondary)',
                              }}
                            >
                              {member.rank}
                            </span>
                          ) : (
                            <span style={{ color: 'var(--neu-text-secondary)' }}>–</span>
                          )}
                        </td>
                        <td className="px-4 py-3" style={{ color: 'var(--neu-text-primary)' }}>
                          {formatCurrency(member.personalStake ?? 0)}
                        </td>
                        <td className="px-4 py-3" style={{ color: 'var(--neu-text-primary)' }}>
                          {formatCurrency(member.teamStake ?? 0)}
                        </td>
                        <td
                          className="px-4 py-3"
                          style={{ color: 'var(--neu-text-secondary)' }}
                        >
                          {member.joined}
                        </td>
                        <td className="px-4 py-3" style={{ color: 'var(--neu-text-primary)' }}>
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
                  color: 'var(--neu-text-secondary)',
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
        </motion.section>
      </div>
    </div>
  );
}
