/**
 * NXP Overview – Matches reference: mobile stacked (status card + progress + breakdown),
 * desktop single horizontal card (rank | balance + progress | next level) + breakdown row.
 */

'use client';

import React from 'react';
import { Shield, Award, TrendingUp, Calendar, Star } from 'lucide-react';
import walletStyles from '@/styles/wallet-page.module.css';

export type NxpData = {
  totalNxp: number;
  level: number;
  progressPercent: number;
  nextLevelNxp: number;
  nextRewardLabel: string;
  ctaText?: string;
  fromBadges: number;
  fromRanks: number;
  milestones: number;
};

const defaultNxpData: NxpData = {
  totalNxp: 3800,
  level: 7,
  progressPercent: 15,
  nextLevelNxp: 5000,
  nextRewardLabel: 'Premium Badge',
  ctaText: 'Gain 1,200 more NXP to unlock "Master Technician" rewards.',
  fromBadges: 1250,
  fromRanks: 850,
  milestones: 1700,
};

function formatNxp(n: number) {
  return n.toLocaleString('en-US');
}

interface NxpOverviewProps {
  data?: NxpData | null;
}

export function NxpOverview({ data }: NxpOverviewProps) {
  const nxp = data ?? defaultNxpData;

  const breakdownCards = [
    { label: 'From Badges', value: nxp.fromBadges, icon: Award },
    { label: 'From Ranks', value: nxp.fromRanks, icon: TrendingUp },
    { label: 'Milestones', value: nxp.milestones, icon: Calendar },
    { label: 'Total Earned', value: nxp.totalNxp, icon: Star },
  ];

  return (
    <section
      className={`${walletStyles.nxpSectionRoot} ${walletStyles.nxpBreakdownSection}`}
      aria-label="NXP Overview"
    >
      {/* Mobile: single card – status + progress + breakdown (reference image 1) */}
      <div className={walletStyles.nxpMobileOnly}>
        <div className={walletStyles.nxpMobileCard}>
          <div className={walletStyles.nxpStatusBlock}>
            <div className={walletStyles.nxpStatusIconWrap}>
              <Shield className="h-7 w-7" strokeWidth={2} />
            </div>
            <span className={walletStyles.nxpStatusLabel}>CURRENT STATUS</span>
            <div className={walletStyles.nxpTotalLine}>
              <span className={walletStyles.nxpTotalValue}>
                {formatNxp(nxp.totalNxp)} Total
              </span>
              <span className={walletStyles.nxpTotalUnit}>NXP</span>
            </div>
            <div className={walletStyles.nxpLevelBadge}>Level {nxp.level}</div>
          </div>

          <div className={walletStyles.nxpProgressBlock}>
            <div className={walletStyles.nxpProgressHeader}>
              <span className={walletStyles.nxpProgressLabel}>
                Progress to Level {nxp.level + 1}
              </span>
              <span className={walletStyles.nxpProgressPct}>
                {nxp.progressPercent}%
              </span>
            </div>
            <div className={walletStyles.nxpProgressBarTrack}>
              <div
                className={walletStyles.nxpProgressBarFill}
                style={{ width: `${Math.min(100, nxp.progressPercent)}%` }}
              />
            </div>
            <p className={walletStyles.nxpNextReward}>
              NEXT REWARD: {nxp.nextRewardLabel.toUpperCase()}
            </p>
          </div>
        </div>

        <h2 className={walletStyles.nxpBreakdownTitleMobile}>NXP BREAKDOWN</h2>
        <div className={walletStyles.nxpBreakdownGrid}>
          {breakdownCards.map(({ label, value, icon: Icon }) => (
            <div key={label} className={walletStyles.nxpBreakdownCard}>
              <Icon
                className={`h-5 w-5 ${walletStyles.nxpBreakdownCardIcon}`}
                strokeWidth={2}
              />
              <span className={walletStyles.nxpBreakdownCardLabel}>
                {label.toUpperCase()}
              </span>
              <span className={walletStyles.nxpBreakdownCardValue}>
                {formatNxp(value)}
              </span>
              <div className={walletStyles.nxpBreakdownCardAccent} />
            </div>
          ))}
        </div>
      </div>

      {/* Desktop: single horizontal overview card */}
      <div className={walletStyles.nxpDesktopOnly}>
        <div className={walletStyles.nxpOverviewCard}>
          <div className={walletStyles.nxpOverviewRank}>
            <div className={walletStyles.nxpOverviewRankCircle}>
              Lvl {nxp.level}
            </div>
            <span className={walletStyles.nxpOverviewRankLabel}>Rank</span>
          </div>

          <div className={walletStyles.nxpOverviewCenter}>
            <span className={walletStyles.nxpOverviewBalanceLabel}>
              CURRENT BALANCE
            </span>
            <div className={walletStyles.nxpOverviewBalance}>
              <span className={walletStyles.nxpOverviewBalanceValue}>
                {formatNxp(nxp.totalNxp)}
              </span>
              <span className={walletStyles.nxpOverviewBalanceUnit}>NXP</span>
            </div>
            <span className={walletStyles.nxpOverviewProgressLabel}>
              PROGRESS TO LEVEL {nxp.level + 1}
            </span>
            <div className={walletStyles.nxpProgressBarTrack}>
              <div
                className={walletStyles.nxpProgressBarFill}
                style={{ width: `${Math.min(100, nxp.progressPercent)}%` }}
              />
            </div>
            {nxp.ctaText && (
              <p className={walletStyles.nxpOverviewCta}>{nxp.ctaText}</p>
            )}
          </div>

          <div className={walletStyles.nxpOverviewRight}>
            <span className={walletStyles.nxpOverviewNextLabel}>
              Next Level Requirement
            </span>
            <div className={walletStyles.nxpOverviewNextValue}>
              <span className={walletStyles.nxpOverviewNextValueNum}>
                {formatNxp(nxp.nextLevelNxp)}
              </span>
              <span className={walletStyles.nxpOverviewNextValueUnit}>NXP</span>
            </div>
            <span className={walletStyles.nxpOverviewNextPct}>
              {nxp.progressPercent}% COMPLETE
            </span>
          </div>
        </div>
      </div>

      {/* Desktop: NXP Breakdown with View Details (reference image 2) */}
      <div
        className={`${walletStyles.nxpDesktopOnly} ${walletStyles.nxpBreakdownDesktopWrap}`}
      >
        <div className={walletStyles.nxpBreakdownHeader}>
          <h2 className={walletStyles.nxpBreakdownTitle}>
            <TrendingUp
              className={`h-5 w-5 ${walletStyles.nxpBreakdownTitleIcon}`}
              strokeWidth={2}
            />
            NXP Breakdown
          </h2>
          <button
            type="button"
            className={walletStyles.nxpViewDetails}
            onClick={() => {}}
          >
            View Details
          </button>
        </div>
        <div className={walletStyles.nxpBreakdownGrid}>
          {breakdownCards.map(({ label, value, icon: Icon }) => (
            <div key={label} className={walletStyles.nxpBreakdownCard}>
              <Icon
                className={`h-5 w-5 ${walletStyles.nxpBreakdownCardIcon}`}
                strokeWidth={2}
              />
              <span className={walletStyles.nxpBreakdownCardLabel}>
                {label.toUpperCase()}
              </span>
              <span className={walletStyles.nxpBreakdownCardValue}>
                {formatNxp(value)}
              </span>
              <div className={walletStyles.nxpBreakdownCardAccent} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
