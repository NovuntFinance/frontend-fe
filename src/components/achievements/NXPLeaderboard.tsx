/**
 * NXP Leaderboard Component
 * Displays top users by NXP
 */

'use client';

import React from 'react';
import { Award } from 'lucide-react';
import { NovuntPremiumCard } from '@/components/ui/NovuntPremiumCard';
import { Badge } from '@/components/ui/badge';
import { useNXPLeaderboard } from '@/lib/queries/achievementQueries';
import { ShimmerCard } from '@/components/ui/shimmer';
import type { LeaderboardEntry } from '@/types/achievements';

/**
 * Get position icon
 */
function getPositionIcon(position: number) {
  if (position === 1) return <Award className="h-5 w-5 text-yellow-500" />;
  if (position === 2) return <Award className="h-5 w-5 text-gray-400" />;
  if (position === 3) return <Award className="h-5 w-5 text-orange-500" />;
  return null;
}

/**
 * Get position badge color
 */
function getPositionBadgeColor(position: number): string {
  if (position === 1)
    return 'bg-yellow-500/20 text-yellow-600 border-yellow-500/30';
  if (position === 2) return 'bg-gray-500/20 text-gray-600 border-gray-500/30';
  if (position === 3)
    return 'bg-orange-500/20 text-orange-600 border-orange-500/30';
  return 'bg-muted text-muted-foreground border-border';
}

export function NXPLeaderboard() {
  const { data, isLoading, error } = useNXPLeaderboard(10);

  if (isLoading) {
    return (
      <NovuntPremiumCard
        title="NXP Leaderboard"
        subtitle="Top users by experience points"
        icon={Award}
        colorTheme="orange"
      >
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <ShimmerCard key={i} className="h-16" />
          ))}
        </div>
      </NovuntPremiumCard>
    );
  }

  if (error) {
    const isUnderDevelopment =
      (error as any)?.message?.toLowerCase().includes('under development') ||
      (error as any)?.message?.toLowerCase().includes('not implemented') ||
      (error as any)?.statusCode === 501;

    return (
      <NovuntPremiumCard
        title="NXP Leaderboard"
        subtitle="Top users by experience points"
        icon={Award}
        colorTheme="orange"
      >
        <div className="py-8 text-center">
          {isUnderDevelopment ? (
            <>
              <Award className="text-muted-foreground mx-auto mb-3 h-12 w-12 opacity-50" />
              <h3 className="mb-2 text-lg font-semibold">Coming Soon</h3>
              <p className="text-muted-foreground mb-4 text-sm">
                The NXP leaderboard will be available soon.
              </p>
              <p className="text-muted-foreground text-xs">
                Compete with other users and see who&apos;s at the top!
              </p>
            </>
          ) : (
            <>
              <Award className="text-muted-foreground mx-auto mb-3 h-12 w-12 opacity-50" />
              <p className="text-muted-foreground text-sm">
                Unable to load leaderboard
              </p>
              <p className="text-muted-foreground mt-2 text-xs">
                Please try again later
              </p>
            </>
          )}
        </div>
      </NovuntPremiumCard>
    );
  }

  const leaderboard = data?.data?.leaderboard || [];
  const userPosition = data?.data?.userPosition;

  return (
    <NovuntPremiumCard
      title="NXP Leaderboard"
      subtitle="Top users by experience points"
      icon={Award}
      colorTheme="orange"
    >
      <div className="space-y-4">
        {leaderboard.length > 0 ? (
          <>
            <div className="space-y-2">
              {leaderboard.map((entry) => (
                <div
                  key={entry.userId}
                  className="bg-background/50 hover:bg-background/70 border-border/50 flex items-center justify-between rounded-lg border p-4 transition-colors"
                >
                  <div className="flex flex-1 items-center gap-4">
                    <div className="flex min-w-[60px] items-center gap-2">
                      {getPositionIcon(entry.position)}
                      <span className="text-lg font-bold">
                        #{entry.position}
                      </span>
                    </div>
                    <div className="flex-1">
                      <div className="mb-1 flex items-center gap-2">
                        <span className="font-semibold">
                          {entry.fname && entry.lname
                            ? `${entry.fname} ${entry.lname}`
                            : entry.username}
                        </span>
                        <Badge variant="outline" className="text-xs">
                          {entry.rank}
                        </Badge>
                      </div>
                      <div className="text-muted-foreground text-xs">
                        Level {entry.nxpLevel}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-orange-600 dark:text-orange-400">
                      {entry.totalNXP.toLocaleString()} NXP
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* User Position */}
            {userPosition !== null && userPosition !== undefined && (
              <div className="border-border/50 border-t pt-4 text-center">
                <p className="text-muted-foreground text-sm">
                  Your position:{' '}
                  <span className="font-semibold">#{userPosition}</span>
                </p>
              </div>
            )}
          </>
        ) : (
          <div className="py-12 text-center">
            <Award className="text-muted-foreground mx-auto mb-3 h-12 w-12" />
            <h3 className="mb-2 text-lg font-semibold">No Leaderboard Data</h3>
            <p className="text-muted-foreground text-sm">
              Be the first to earn NXP and appear on the leaderboard!
            </p>
          </div>
        )}
      </div>
    </NovuntPremiumCard>
  );
}
