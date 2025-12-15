/**
 * Achievements Summary Card
 * Compact widget for dashboard showing NXP level, recent badges, and quick stats
 */

'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Award, ChevronRight } from 'lucide-react';
import { useRouter } from 'next/navigation';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ShimmerCard } from '@/components/ui/shimmer';
import {
  useNXPBalance,
  useEarnedBadges,
} from '@/lib/queries/achievementQueries';
import { useUpdateProfilePicture } from '@/lib/mutations/profileMutations';
import { useUser } from '@/hooks/useUser';
import { cn } from '@/lib/utils';
import { toast } from '@/lib/toast';

export function AchievementsSummaryCard() {
  const router = useRouter();
  const { user } = useUser();
  const {
    data: nxpData,
    isLoading: nxpLoading,
    error: nxpError,
  } = useNXPBalance();
  const { data: badgesData, isLoading: badgesLoading } = useEarnedBadges();
  const updateAvatarMutation = useUpdateProfilePicture(
    user?._id || user?.id || ''
  );

  const isLoading = nxpLoading || badgesLoading;
  // Use backend NXP data directly (backend migration complete)
  const nxp = nxpData?.data;
  const earnedBadges = badgesData?.data?.badges || [];
  const totalBadges = badgesData?.data?.totalBadges || 0;

  // Check if NXP is under development (for graceful error handling)
  const nxpUnderDevelopment =
    nxpError &&
    ((nxpError as any)?.message?.toLowerCase().includes('under development') ||
      (nxpError as any)?.message?.toLowerCase().includes('not implemented') ||
      (nxpError as any)?.statusCode === 501);

  // Show component even if there are errors, just with limited data
  const showComponent = !isLoading || nxp || earnedBadges.length > 0;

  // Get recent badges (last 3)
  const recentBadges = earnedBadges
    .sort((a, b) => {
      const dateA = a.awardedAt ? new Date(a.awardedAt).getTime() : 0;
      const dateB = b.awardedAt ? new Date(b.awardedAt).getTime() : 0;
      return dateB - dateA;
    })
    .slice(0, 3);

  if (isLoading && !showComponent) {
    return (
      <Card className="bg-card/50 group relative overflow-hidden border-0 shadow-lg backdrop-blur-sm transition-shadow duration-300 hover:shadow-xl">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-500/20 via-pink-500/10 to-transparent" />
        <CardHeader className="relative p-4 sm:p-6">
          <div className="mb-2 flex items-center gap-2 sm:gap-3">
            <motion.div
              whileHover={{ scale: 1.1, rotate: -10 }}
              className="rounded-xl bg-gradient-to-br from-purple-500/30 to-pink-500/20 p-2 shadow-lg backdrop-blur-sm sm:p-3"
            >
              <Award className="h-5 w-5 text-purple-500 sm:h-6 sm:w-6" />
            </motion.div>
            <div className="min-w-0 flex-1">
              <CardTitle className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-sm font-bold text-transparent sm:text-base md:text-lg">
                Achievements
              </CardTitle>
              <CardDescription className="text-[10px] sm:text-xs">
                Your progress and badges
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="relative p-4 pt-0 sm:p-6 sm:pt-0">
          <div className="space-y-3">
            <ShimmerCard className="h-16" />
            <ShimmerCard className="h-20" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-card/50 group relative overflow-hidden border-0 shadow-lg backdrop-blur-sm transition-shadow duration-300 hover:shadow-xl">
      {/* Animated Gradient Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-500/20 via-pink-500/10 to-transparent" />

      {/* Animated Floating Blob */}
      <motion.div
        animate={{
          x: [0, -15, 0],
          y: [0, 10, 0],
          scale: [1, 1.15, 1],
        }}
        transition={{
          duration: 6,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
        className="absolute -bottom-12 -left-12 h-24 w-24 rounded-full bg-purple-500/30 blur-2xl"
      />

      <CardHeader className="relative p-4 sm:p-6">
        {/* Arrow Icon - Top Right */}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => {
            router.push('/dashboard/achievements');
          }}
          className="text-muted-foreground hover:text-foreground absolute top-3 right-3 z-10 h-8 w-8 transition-colors sm:top-6 sm:right-6"
        >
          <ChevronRight className="h-5 w-5" />
        </Button>

        <div className="mb-2 flex items-center gap-2 sm:gap-3">
          <motion.div
            whileHover={{ scale: 1.1, rotate: -10 }}
            className="rounded-xl bg-gradient-to-br from-purple-500/30 to-pink-500/20 p-2 shadow-lg backdrop-blur-sm sm:p-3"
          >
            <Award className="h-5 w-5 text-purple-500 sm:h-6 sm:w-6" />
          </motion.div>
          <div className="min-w-0 flex-1">
            <CardTitle className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-sm font-bold text-transparent sm:text-base md:text-lg">
              Achievements
            </CardTitle>
            <CardDescription className="text-[10px] sm:text-xs">
              Your progress and badges
            </CardDescription>
          </div>
        </div>
      </CardHeader>

      <CardContent className="relative p-4 pt-0 sm:p-6 sm:pt-0">
        <div className="space-y-4">
          {/* NXP Level Summary - Always show, even if loading */}
          {nxp ? (
            <div className="relative flex items-center justify-between overflow-hidden rounded-xl border-2 border-purple-500/30 bg-gradient-to-br from-purple-500/10 via-blue-500/10 to-emerald-500/10 p-4 shadow-lg">
              <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-transparent opacity-50" />
              <div className="relative z-10 flex items-center gap-3">
                <div className="rounded-xl bg-purple-500/20 p-3 shadow-md">
                  <Award className="h-7 w-7 text-purple-600 drop-shadow-sm dark:text-purple-400" />
                </div>
                <div>
                  <div className="text-xs font-semibold tracking-wide text-purple-700 uppercase dark:text-purple-300">
                    NXP Level
                  </div>
                  <div className="bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-3xl font-bold text-transparent dark:from-purple-400 dark:to-blue-400">
                    Level {nxp.nxpLevel}
                  </div>
                </div>
              </div>
              <div className="relative z-10 text-right">
                <div className="text-xs font-semibold tracking-wide text-purple-700 uppercase dark:text-purple-300">
                  Total NXP
                </div>
                <div className="bg-gradient-to-r from-purple-600 to-emerald-600 bg-clip-text text-2xl font-bold text-transparent dark:from-purple-400 dark:to-emerald-400">
                  {nxp.totalNXP.toLocaleString()}
                </div>
              </div>
            </div>
          ) : nxpUnderDevelopment ? (
            <div className="bg-muted/30 border-border/50 rounded-lg border py-4 text-center">
              <Award className="text-muted-foreground mx-auto mb-2 h-8 w-8 opacity-50" />
              <p className="text-muted-foreground mb-1 text-sm font-semibold">
                NXP Coming Soon
              </p>
              <p className="text-muted-foreground text-xs">
                Experience points system launching soon!
              </p>
            </div>
          ) : (
            !isLoading &&
            nxpError && (
              <div className="text-muted-foreground py-4 text-center text-sm">
                <Award className="mx-auto mb-2 h-8 w-8 opacity-50" />
                <p>NXP data unavailable</p>
              </div>
            )
          )}

          {/* Badges Summary */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold">Badges Earned</span>
              <Badge variant="outline" className="text-xs">
                {totalBadges} total
              </Badge>
            </div>

            {/* Recent Badges - Premium Display */}
            {recentBadges.length > 0 ? (
              <div className="flex gap-2">
                {recentBadges.map((badge) => {
                  const rarityColors = {
                    common: 'from-gray-400 to-gray-600',
                    rare: 'from-blue-400 to-blue-600',
                    epic: 'from-purple-400 to-purple-600',
                    legendary: 'from-yellow-400 to-orange-600',
                  };

                  const handleSetAsProfile = async (e: React.MouseEvent) => {
                    e.stopPropagation();
                    if (!user?._id && !user?.id) {
                      toast.error('Unable to update profile picture');
                      return;
                    }

                    try {
                      await updateAvatarMutation.mutateAsync({
                        profilePicture: badge.icon,
                      });
                      toast.success(`Profile picture set to ${badge.title}!`);
                    } catch {
                      toast.error('Failed to update profile picture');
                    }
                  };

                  return (
                    <motion.div
                      key={badge.badgeType}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      whileHover={{ scale: 1.05, y: -2 }}
                      className={cn(
                        'relative flex flex-1 flex-col items-center gap-2 overflow-hidden rounded-xl border-2 p-3',
                        'bg-gradient-to-br',
                        rarityColors[badge.rarity] || rarityColors.common,
                        'border-white/20 shadow-lg',
                        'group cursor-pointer'
                      )}
                      title={`${badge.title} - Click to set as profile picture`}
                      onClick={handleSetAsProfile}
                    >
                      {/* Badge Icon as Background */}
                      <div
                        className="pointer-events-none absolute inset-0 flex items-center justify-center opacity-10"
                        style={{
                          fontSize: '120px',
                          lineHeight: 1,
                          transform: 'rotate(-5deg)',
                        }}
                      >
                        {badge.icon}
                      </div>

                      {/* Glow effect */}
                      <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent opacity-50" />
                      <div className="relative z-10 text-3xl drop-shadow-lg">
                        {badge.icon}
                      </div>
                      <div className="relative z-10 line-clamp-1 text-center text-xs font-semibold text-white drop-shadow-sm">
                        {badge.title}
                      </div>

                      {/* Set as Profile Hint */}
                      <div className="absolute inset-0 z-20 flex items-center justify-center rounded-xl bg-black/40 opacity-0 transition-opacity group-hover:opacity-100">
                        <span className="text-xs font-semibold text-white drop-shadow-lg">
                          Set as Profile
                        </span>
                      </div>

                      {/* Rarity indicator */}
                      <div
                        className={cn(
                          'absolute top-1 right-1 z-10 h-2 w-2 rounded-full',
                          badge.rarity === 'legendary' &&
                            'bg-yellow-300 shadow-lg shadow-yellow-300/50',
                          badge.rarity === 'epic' &&
                            'bg-purple-300 shadow-lg shadow-purple-300/50',
                          badge.rarity === 'rare' &&
                            'bg-blue-300 shadow-lg shadow-blue-300/50',
                          badge.rarity === 'common' &&
                            'bg-gray-300 shadow-lg shadow-gray-300/50'
                        )}
                      />
                    </motion.div>
                  );
                })}
              </div>
            ) : (
              <div className="text-muted-foreground py-4 text-center text-sm">
                <Award className="mx-auto mb-2 h-8 w-8 opacity-50" />
                <p>No badges earned yet</p>
                <p className="text-xs">
                  Start earning badges to see them here!
                </p>
              </div>
            )}
          </div>

          {/* Quick Stats */}
          {nxp && (
            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="bg-muted/30 border-border/30 rounded-lg border p-2">
                <div className="text-muted-foreground mb-1 text-xs">
                  From Badges
                </div>
                <div className="text-sm font-bold text-blue-600 dark:text-blue-400">
                  {nxp.breakdown.fromBadges.toLocaleString()}
                </div>
              </div>
              <div className="bg-muted/30 border-border/30 rounded-lg border p-2">
                <div className="text-muted-foreground mb-1 text-xs">
                  From Ranks
                </div>
                <div className="text-sm font-bold text-purple-600 dark:text-purple-400">
                  {nxp.breakdown.fromRanks.toLocaleString()}
                </div>
              </div>
              <div className="bg-muted/30 border-border/30 rounded-lg border p-2">
                <div className="text-muted-foreground mb-1 text-xs">
                  Milestones
                </div>
                <div className="text-sm font-bold text-emerald-600 dark:text-emerald-400">
                  {nxp.breakdown.fromMilestones.toLocaleString()}
                </div>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
