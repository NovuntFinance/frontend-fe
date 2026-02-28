'use client';

/**
 * Qualification Requirements modal content.
 * Theme-aware: uses --neu-bg, --neu-accent, --neu-border, etc. (light/dark from globals).
 */

import React from 'react';
import {
  Target,
  TrendingUp,
  Users,
  DollarSign,
  CheckCircle2,
  Circle,
  Star,
  Shield,
  Lock,
  Info,
} from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  useRankProgressLightweight,
  useRankProgressDetailed,
} from '@/lib/queries/rankProgressQueries';
import { LoadingStates } from '@/components/ui/loading-states';
import { UserFriendlyError } from '@/components/errors/UserFriendlyError';
import { cn, stripEmojis } from '@/lib/utils';
import type { Requirement } from '@/types/rankProgress';
import {
  getPremiumPoolDownlineRequirement,
  getPremiumPoolProgressHelperText,
} from '@/lib/utils/premiumPoolUtils';
import { neuRadius } from './neumorphicTokens';

const neuInset = 'var(--neu-shadow-inset)';
const neuRaised = 'var(--neu-shadow-raised)';
const neuProgressFillHighlight = '0 0 12px rgba(var(--neu-accent-rgb), 0.25)';

function useQualificationData() {
  const { data, isLoading, error, refetch } = useRankProgressLightweight();
  const { data: detailedData } = useRankProgressDetailed();
  const resolved = data ?? detailedData;
  const requirements = resolved?.requirements;
  const detailedRequirements = detailedData?.requirements;
  const poolQualification =
    detailedData?.pool_qualification ?? resolved?.pool_qualification;
  const currentRank = resolved?.current_rank ?? '';
  const nextRank = resolved?.next_rank ?? null;
  const isMaxRank = nextRank === null;
  const isStakeholder = currentRank === 'Stakeholder';

  const performanceProgress =
    resolved?.overall_progress_percent ?? resolved?.progress_percent ?? 0;

  let premiumProgress = 0;
  if (!isStakeholder) {
    if (detailedData?.premium_progress_percent != null) {
      premiumProgress = detailedData.premium_progress_percent;
    } else if (detailedRequirements?.lower_rank_downlines) {
      const { current = 0, required = 0 } =
        detailedRequirements.lower_rank_downlines;
      if (required > 0)
        premiumProgress = Math.min(100, Math.round((current / required) * 100));
    } else if (requirements?.lower_rank_downlines) {
      const { current = 0, required = 0 } = requirements.lower_rank_downlines;
      if (required > 0)
        premiumProgress = Math.min(100, Math.round((current / required) * 100));
    }
  }

  return {
    data: resolved,
    requirements,
    detailedRequirements,
    poolQualification,
    currentRank,
    nextRank,
    isMaxRank,
    isStakeholder,
    performanceProgress,
    premiumProgress,
    isLoading,
    error,
    refetch,
  };
}

export function QualificationRequirementsContent() {
  const {
    data,
    requirements,
    detailedRequirements,
    poolQualification,
    currentRank,
    nextRank,
    isMaxRank,
    isStakeholder,
    performanceProgress,
    premiumProgress,
    isLoading,
    error,
    refetch,
  } = useQualificationData();

  if (isLoading) {
    return (
      <div className="flex min-h-[280px] items-center justify-center">
        <LoadingStates.Card height="h-64" />
      </div>
    );
  }

  if (error) {
    return (
      <UserFriendlyError
        error={error instanceof Error ? error : new Error(String(error))}
        onRetry={() => refetch()}
        variant="card"
      />
    );
  }

  if (!data) return null;

  const current_rank_icon = data.current_rank_icon;
  const next_rank_icon = data.next_rank_icon;

  const title = isMaxRank
    ? `${stripEmojis(currentRank)} Progress`
    : nextRank
      ? `${nextRank} Progress`
      : 'Rank Progress';
  const subtitle = isMaxRank
    ? 'Highest rank achieved!'
    : nextRank
      ? `Progressing to ${nextRank}`
      : 'Your journey to the next level';

  const perfPool = poolQualification?.performance_pool;
  const premPool = poolQualification?.premium_pool;
  const premiumHelperText = getPremiumPoolProgressHelperText(currentRank);

  const hasLowerRankReq =
    (detailedRequirements?.lower_rank_downlines?.required ?? 0) > 0 ||
    (requirements?.lower_rank_downlines?.required ?? 0) > 0;
  const lrReq = getPremiumPoolDownlineRequirement(
    currentRank,
    detailedRequirements?.lower_rank_downlines?.description ||
      requirements?.lower_rank_downlines?.description
  );
  const lowerRankReq =
    detailedRequirements?.lower_rank_downlines ||
    requirements?.lower_rank_downlines;

  const performanceTooltip = (
    <>
      <p className="mb-1 font-semibold">Performance Calculation:</p>
      <ul className="list-disc space-y-1 pl-4 text-xs">
        <li>Personal Stake (1x weight)</li>
        <li>Team Stake (7x weight)</li>
        <li>Direct Downlines (2x weight)</li>
      </ul>
    </>
  );

  const premiumTooltip = (
    <>
      <p className="mb-1 font-semibold">Premium Pool:</p>
      <p className="text-xs">
        {(() => {
          const { rankType, stakeRequirement } =
            getPremiumPoolDownlineRequirement(currentRank);
          if (stakeRequirement)
            return (
              <>
                Requires 2 <strong>{rankType}</strong> downlines with{' '}
                <strong>{stakeRequirement}</strong>. You can lose this
                qualification if downlines become inactive or their stake drops
                below the required minimum.
              </>
            );
          return (
            <>
              Requires maintaining active downlines at specific ranks. You can
              lose this qualification if downlines become inactive.
            </>
          );
        })()}
      </p>
    </>
  );

  const performancePoolMessage = isStakeholder
    ? 'Stakeholders are not eligible for Performance Pool. Qualification starts from Associate Stakeholder.'
    : (perfPool?.message ?? 'Reach next rank to qualify');

  const premiumPoolMessage = isStakeholder
    ? 'Stakeholders are not eligible for Premium Pool. Qualification starts from Associate Stakeholder.'
    : lrReq.stakeRequirement
      ? `Requires 2 ${lrReq.rankType} downlines with ${lrReq.stakeRequirement}`
      : (premPool?.message ?? 'Requires lower-rank downlines');

  const blockInsetStyle = {
    background: 'var(--neu-bg)',
    boxShadow: neuInset,
    border: '1px solid var(--neu-border)',
    borderRadius: neuRadius.lg,
  };

  const rankBlock = (
    <div className="flex flex-col items-center justify-between gap-6 md:flex-row md:gap-4">
      <div className="flex flex-col items-center gap-3 text-center md:items-start md:text-left">
        <div className="relative">
          {current_rank_icon ? (
            <div
              className="flex h-20 w-20 items-center justify-center overflow-hidden"
              style={{
                ...blockInsetStyle,
                boxShadow: neuRaised,
                borderRadius: neuRadius.xl,
              }}
            >
              <img
                src={current_rank_icon}
                alt={currentRank}
                className="h-16 w-16 object-contain"
              />
            </div>
          ) : (
            <div
              className="flex h-20 w-20 items-center justify-center"
              style={{
                background: 'var(--neu-bg)',
                boxShadow: neuRaised,
                border: '1px solid var(--neu-border)',
                borderRadius: neuRadius.xl,
              }}
            >
              <span className="text-3xl" style={{ opacity: 0.9 }}>
                🏆
              </span>
            </div>
          )}
          <div
            className="absolute -right-2 -bottom-2 rounded-full px-2 py-0.5 text-[10px] font-bold tracking-wider uppercase"
            style={{
              background: 'var(--neu-bg)',
              boxShadow: neuRaised,
              border: '1px solid var(--neu-border)',
              color: 'var(--neu-accent)',
            }}
          >
            Current
          </div>
        </div>
        <p className="text-xl font-bold" style={{ color: 'var(--neu-accent)' }}>
          {stripEmojis(currentRank)}
        </p>
      </div>
      {!isMaxRank && (
        <>
          <div
            className="hidden flex-col items-center gap-1 md:flex"
            style={{ color: 'var(--neu-text-secondary)' }}
          >
            <span className="text-xs tracking-widest uppercase">Progress</span>
            <TrendingUp className="h-6 w-6" />
          </div>
          <div className="flex flex-col items-center gap-3 text-center opacity-90 md:items-end md:text-right">
            <div className="relative">
              {next_rank_icon ? (
                <div
                  className="flex h-14 w-14 items-center justify-center overflow-hidden"
                  style={{
                    ...blockInsetStyle,
                    boxShadow: neuRaised,
                    borderRadius: neuRadius.lg,
                  }}
                >
                  <img
                    src={next_rank_icon}
                    alt={nextRank ?? ''}
                    className="h-12 w-12 object-contain"
                    style={{ opacity: 0.85 }}
                  />
                </div>
              ) : (
                <div
                  className="flex h-14 w-14 items-center justify-center"
                  style={{
                    background: 'var(--neu-bg)',
                    boxShadow: neuRaised,
                    border: '1px solid var(--neu-border)',
                    borderRadius: neuRadius.lg,
                  }}
                >
                  <span className="text-2xl" style={{ opacity: 0.8 }}>
                    💎
                  </span>
                </div>
              )}
              <div
                className="absolute -bottom-2 -left-2 rounded-full px-2 py-0.5 text-[10px] font-bold tracking-wider uppercase md:-right-2 md:left-auto"
                style={{
                  background: 'var(--neu-bg)',
                  boxShadow: neuRaised,
                  border: '1px solid var(--neu-border)',
                  color: 'var(--neu-text-primary)',
                }}
              >
                Next
              </div>
            </div>
            <p
              className="text-lg font-bold"
              style={{ color: 'var(--neu-text-primary)' }}
            >
              {nextRank ? stripEmojis(nextRank) : ''}
            </p>
          </div>
        </>
      )}
    </div>
  );

  const dualBars = !isMaxRank && (
    <div className="space-y-6">
      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-2">
            <div
              className="rounded-lg p-1.5"
              style={{
                background: 'var(--neu-bg)',
                boxShadow: neuRaised,
                border: '1px solid var(--neu-border)',
                borderRadius: neuRadius.md,
              }}
            >
              <Target
                className="h-3.5 w-3.5"
                style={{ color: 'var(--neu-accent)' }}
              />
            </div>
            <span className="font-medium" style={{ color: 'var(--neu-text-primary)' }}>
              {title}
            </span>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    type="button"
                    className="rounded p-0.5 transition-opacity hover:opacity-80 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--neu-bg)]"
                    style={{ color: 'var(--neu-text-secondary)' }}
                    aria-label="Info"
                  >
                    <Info className="h-3.5 w-3.5" />
                  </button>
                </TooltipTrigger>
                <TooltipContent
                  className="max-w-xs"
                  style={{ color: 'var(--neu-text-primary)', border: '1px solid var(--neu-border)', background: 'var(--neu-bg)' }}
                >
                  {performanceTooltip}
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          <span className="font-bold" style={{ color: 'var(--neu-accent)' }}>
            {performanceProgress}%
          </span>
        </div>
        <div
          className="relative h-3 w-full overflow-hidden rounded-full"
          style={{ ...blockInsetStyle, height: 12 }}
        >
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{
              width: `${performanceProgress}%`,
              background: 'var(--neu-accent)',
              boxShadow: neuProgressFillHighlight,
            }}
          />
        </div>
      </div>
      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-2">
            <div
              className="rounded-lg p-1.5"
              style={{
                background: 'var(--neu-bg)',
                boxShadow: neuRaised,
                border: '1px solid var(--neu-border)',
                borderRadius: neuRadius.md,
              }}
            >
              <Shield
                className="h-3.5 w-3.5"
                style={{ color: 'var(--neu-accent)' }}
              />
            </div>
            <span className="font-medium" style={{ color: 'var(--neu-text-primary)' }}>
              Premium Pool Qualification
            </span>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    type="button"
                    className="rounded p-0.5 transition-opacity hover:opacity-80 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--neu-bg)]"
                    style={{ color: 'var(--neu-text-secondary)' }}
                    aria-label="Info"
                  >
                    <Info className="h-3.5 w-3.5" />
                  </button>
                </TooltipTrigger>
                <TooltipContent
                  className="max-w-xs"
                  style={{ color: 'var(--neu-text-primary)', border: '1px solid var(--neu-border)', background: 'var(--neu-bg)' }}
                >
                  {premiumTooltip}
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          {isStakeholder ? (
            <span
              className="text-xs font-medium"
              style={{ color: 'var(--neu-text-muted)' }}
            >
              Not Eligible
            </span>
          ) : (
            <span className="font-bold" style={{ color: 'var(--neu-accent)' }}>
              {premiumProgress}%
            </span>
          )}
        </div>
        <div
          className="relative h-3 w-full overflow-hidden rounded-full"
          style={{ ...blockInsetStyle, height: 12 }}
        >
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{
              width: isStakeholder ? 0 : `${premiumProgress}%`,
              background: 'var(--neu-accent)',
              boxShadow: neuProgressFillHighlight,
            }}
          />
        </div>
        {isStakeholder && (
          <p
            className="flex items-center gap-1 text-xs"
            style={{ color: 'var(--neu-text-muted)' }}
          >
            <Lock className="h-3 w-3" /> Stakeholders are not eligible for
            Premium Pool
          </p>
        )}
        {!isStakeholder && premiumProgress < 100 && premiumHelperText && (
          <p className="text-xs" style={{ color: 'var(--neu-text-secondary)' }}>
            {premiumHelperText}
          </p>
        )}
      </div>
    </div>
  );

  const requirementsSection = (
    <div className="space-y-3">
      <h4
        className="flex items-center gap-2 text-sm font-semibold"
        style={{ color: 'var(--neu-accent)' }}
      >
        <Star className="h-4 w-4" style={{ color: 'var(--neu-accent)' }} />
        Requirements
      </h4>
      <div className="space-y-2.5">
        {requirements?.personal_stake && (
          <RequirementRow
            icon={DollarSign}
            title="Personal Stake"
            requirement={requirements.personal_stake}
            unit="$"
          />
        )}
        {requirements?.team_stake && (
          <RequirementRow
            icon={Users}
            title="Team Stake"
            requirement={requirements.team_stake}
            unit="$"
          />
        )}
        {requirements?.direct_downlines && (
          <RequirementRow
            icon={Users}
            title="Direct Downlines"
            requirement={requirements.direct_downlines}
          />
        )}
        {hasLowerRankReq && lowerRankReq && (
          <div className="space-y-1">
            <RequirementRow
              icon={TrendingUp}
              title={lrReq.description}
              requirement={lowerRankReq}
            />
            {lrReq.stakeRequirement && (
              <p
                className="ml-11 text-xs"
                style={{ color: 'var(--neu-text-secondary)' }}
              >
                Each must have {lrReq.stakeRequirement} (Premium Pool
                requirement)
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );

  const poolSection = (perfPool || premPool) && (
    <div className="space-y-3">
      <h4
        className="flex items-center gap-2 text-sm font-semibold"
        style={{ color: 'var(--neu-accent)' }}
      >
        <Shield className="h-4 w-4" style={{ color: 'var(--neu-accent)' }} />
        Pool Qualifications
      </h4>
      <div className="grid gap-3">
        {perfPool && (
          <PoolRow
            title="Performance Pool"
            isQualified={
              isStakeholder ? false : (perfPool?.is_qualified ?? false)
            }
            message={performancePoolMessage}
            isStakeholder={isStakeholder}
          />
        )}
        {premPool && (
          <PoolRow
            title="Premium Pool"
            isQualified={
              isStakeholder ? false : (premPool?.is_qualified ?? false)
            }
            message={premiumPoolMessage}
            isStakeholder={isStakeholder}
          />
        )}
      </div>
    </div>
  );

  const maxRankBlock = isMaxRank && (
    <div className="p-6 text-center" style={blockInsetStyle}>
      <div className="mb-3 flex justify-center gap-2">
        <Star className="h-5 w-5" style={{ color: 'var(--neu-accent)' }} />
        <Star className="h-5 w-5" style={{ color: 'var(--neu-accent)' }} />
        <Star className="h-5 w-5" style={{ color: 'var(--neu-accent)' }} />
      </div>
      <h3
        className="mb-1 text-lg font-bold"
        style={{ color: 'var(--neu-accent)' }}
      >
        Congratulations!
      </h3>
      <p className="text-sm" style={{ color: 'var(--neu-text-secondary)' }}>
        You&apos;ve reached the highest rank:{' '}
        <strong style={{ color: 'var(--neu-text-primary)' }}>
          {stripEmojis(currentRank)}
        </strong>
      </p>
    </div>
  );

  const headerBlock = (
    <div
      className="flex items-center gap-2 rounded-xl p-3 sm:gap-3"
      style={blockInsetStyle}
    >
      <div
        className="rounded-xl p-2 sm:p-3"
        style={{
          background: 'var(--neu-bg)',
          boxShadow: neuRaised,
          border: '1px solid var(--neu-border)',
          borderRadius: neuRadius.lg,
        }}
      >
        <Target
          className="h-5 w-5 sm:h-6 sm:w-6"
          style={{ color: 'var(--neu-accent)' }}
        />
      </div>
      <div className="min-w-0 flex-1">
        <h2
          className="text-sm font-bold sm:text-base md:text-lg"
          style={{ color: 'var(--neu-accent)' }}
        >
          {title}
        </h2>
        <p
          className="text-[10px] sm:text-xs"
          style={{ color: 'var(--neu-text-secondary)' }}
        >
          {subtitle}
        </p>
      </div>
    </div>
  );

  const sectionWrapperStyle = { ...blockInsetStyle, padding: 16 };

  return (
    <>
      <div className="space-y-6 lg:hidden">
        {headerBlock}
        {rankBlock}
        {dualBars}
        {maxRankBlock}
        <div
          className="space-y-6 pt-6"
          style={{ borderTop: '1px solid var(--neu-border)' }}
        >
          <div style={sectionWrapperStyle}>{requirementsSection}</div>
          <div style={sectionWrapperStyle}>{poolSection}</div>
        </div>
      </div>

      <div className="hidden space-y-6 lg:block">
        {headerBlock}
        {rankBlock}
        {dualBars}
        {maxRankBlock}
        <div
          className="space-y-4 pt-6"
          style={{ borderTop: '1px solid var(--neu-border)' }}
        >
          <div style={sectionWrapperStyle}>{requirementsSection}</div>
          <div style={sectionWrapperStyle}>{poolSection}</div>
        </div>
      </div>
    </>
  );
}

function RequirementRow({
  icon: Icon,
  title,
  requirement,
  unit = '',
}: {
  icon: React.ElementType;
  title: string;
  requirement: Requirement;
  unit?: string;
}) {
  const { current = 0, required = 0, is_met } = requirement;
  const isMet = is_met ?? current >= required;
  if (!requirement || required === undefined) return null;

  return (
    <div
      className="flex items-center gap-3 rounded-[20px] p-3"
      style={{
        background: 'var(--neu-bg)',
        boxShadow: neuInset,
        border: '1px solid var(--neu-border)',
        borderRadius: neuRadius.xl,
      }}
    >
      <div
        className="rounded-lg p-2"
        style={{
          background: 'var(--neu-bg)',
          boxShadow: isMet ? undefined : neuRaised,
          border: '1px solid var(--neu-border)',
          borderRadius: neuRadius.md,
        }}
      >
        <Icon
          className="h-4 w-4"
          style={{ color: isMet ? 'var(--neu-accent)' : 'var(--neu-text-muted)' }}
        />
      </div>
      <div className="min-w-0 flex-1">
        <div className="mb-1 flex items-center justify-between">
          <span
            className="truncate text-sm font-medium"
            style={{ color: 'var(--neu-text-primary)' }}
          >
            {title}
          </span>
          {isMet ? (
            <CheckCircle2
              className="h-4 w-4 flex-shrink-0"
              style={{ color: 'var(--neu-accent)' }}
            />
          ) : (
            <Circle
              className="h-4 w-4 flex-shrink-0"
              style={{ color: 'var(--neu-text-muted)' }}
            />
          )}
        </div>
        <div
          className="flex items-center justify-between text-xs"
          style={{ color: 'var(--neu-text-secondary)' }}
        >
          <span>
            {unit}
            {current.toLocaleString()} / {unit}
            {required.toLocaleString()}
          </span>
          <span style={{ color: isMet ? 'var(--neu-accent)' : undefined }}>
            {isMet ? 'Completed' : 'In Progress'}
          </span>
        </div>
      </div>
    </div>
  );
}

function PoolRow({
  title,
  isQualified,
  message,
  isStakeholder = false,
}: {
  title: string;
  isQualified: boolean;
  message: string;
  isStakeholder?: boolean;
}) {
  return (
    <div
      className="flex flex-col gap-2 rounded-[20px] p-3 transition-all"
      style={{
        background: 'var(--neu-bg)',
        boxShadow: neuInset,
        border: `1px solid ${isQualified && !isStakeholder ? 'rgba(var(--neu-accent-rgb), 0.25)' : 'var(--neu-border)'}`,
        borderRadius: neuRadius.xl,
      }}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {isStakeholder ? (
            <Lock className="h-4 w-4" style={{ color: 'var(--neu-text-muted)' }} />
          ) : isQualified ? (
            <CheckCircle2
              className="h-4 w-4"
              style={{ color: 'var(--neu-accent)' }}
            />
          ) : (
            <Circle className="h-4 w-4" style={{ color: 'var(--neu-text-muted)' }} />
          )}
          <span
            className="text-sm font-medium"
            style={{ color: 'var(--neu-text-primary)' }}
          >
            {title}
          </span>
        </div>
        <span
          className="text-xs font-medium"
          style={{
            color: isStakeholder
              ? 'var(--neu-text-muted)'
              : isQualified
                ? 'var(--neu-accent)'
                : 'var(--neu-text-secondary)',
          }}
        >
          {isStakeholder
            ? 'Not Eligible'
            : isQualified
              ? 'Qualified'
              : 'Not Qualified'}
        </span>
      </div>
      <p className="pl-6 text-xs" style={{ color: 'var(--neu-text-secondary)' }}>
        {message}
      </p>
    </div>
  );
}
