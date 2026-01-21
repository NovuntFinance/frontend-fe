'use client';

import { AdminUser } from '@/types/admin';
import { RANK_REQUIREMENTS } from '@/types/teamRank';

interface RankBadgeProps {
  user: AdminUser;
}

export function RankBadge({ user }: RankBadgeProps) {
  const rankInfo = user.rankInfo;
  const rankName = user.rank || rankInfo?.currentRank || 'Stakeholder';
  const isStakeholder = rankName === 'Stakeholder';

  // Get rank color based on rank name
  const getRankColor = (rank: string) => {
    const rankLower = rank.toLowerCase();
    if (rankLower.includes('titan'))
      return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
    if (rankLower.includes('architect'))
      return 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400';
    if (rankLower.includes('capitalist'))
      return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400';
    if (rankLower.includes('strategist'))
      return 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-400';
    if (rankLower.includes('associate'))
      return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
    return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
  };

  const rankColor = getRankColor(rankName);

  // Stakeholders can NEVER qualify for premium or performance pools
  // Qualification starts from Associate Stakeholder and above
  const performancePoolQualified = isStakeholder
    ? false
    : (rankInfo?.performancePoolQualified ?? false);
  const premiumPoolQualified = isStakeholder
    ? false
    : (rankInfo?.premiumPoolQualified ?? false);

  const nxpValueRaw = rankInfo?.nxp?.totalNXP as unknown;
  const nxpValue =
    typeof nxpValueRaw === 'number'
      ? nxpValueRaw
      : typeof nxpValueRaw === 'string'
        ? Number(nxpValueRaw)
        : undefined;
  const hasNxp = Number.isFinite(nxpValue);

  return (
    <div className="flex flex-col gap-1">
      <span
        className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${rankColor}`}
      >
        {rankName}
      </span>
      {rankInfo && (
        <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
          {performancePoolQualified && (
            <span
              className="flex items-center gap-1"
              title="Performance Pool Qualified"
            >
              <span className="text-blue-500">●</span>
              <span>Perf</span>
            </span>
          )}
          {premiumPoolQualified && (
            <span
              className="flex items-center gap-1"
              title="Premium Pool Qualified"
            >
              <span className="text-green-500">●</span>
              <span>Prem</span>
            </span>
          )}
          {rankInfo.nxp && hasNxp && (
            <span
              className="flex items-center gap-1"
              title={`NXP: ${nxpValue}`}
            >
              <span className="text-purple-500">★</span>
              <span>{(nxpValue as number).toLocaleString()}</span>
            </span>
          )}
        </div>
      )}
    </div>
  );
}
