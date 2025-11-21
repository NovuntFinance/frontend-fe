/**
 * Rank Progress Card Component
 * Displays dual rank progress (Performance & Premium) with regression logic
 */

'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Target,
    TrendingUp,
    TrendingDown,
    Users,
    DollarSign,
    CheckCircle2,
    Circle,
    ChevronDown,
    ChevronUp,
    Info,
    Star,
    Shield,
    Sparkles
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from '@/components/ui/tooltip';
import { useRankProgress } from '@/lib/queries/rankProgressQueries';
import { cn } from '@/lib/utils';
import type { Requirement } from '@/types/rankProgress';

/**
 * Main Rank Progress Card
 */
export function RankProgressCard() {
    const { data, isLoading, error } = useRankProgress();
    const [isExpanded, setIsExpanded] = React.useState(false);
    const [prevProgress, setPrevProgress] = React.useState<{
        performance: number;
        premium: number;
    } | null>(null);

    // Track progress changes for regression badge
    React.useEffect(() => {
        if (data) {
            const newProgress = {
                performance: data.overall_progress_percent,
                premium: data.premium_progress_percent
            };

            if (prevProgress === null) {
                setPrevProgress(newProgress);
            } else {
                setPrevProgress(newProgress);
            }
        }
    }, [data?.overall_progress_percent, data?.premium_progress_percent]);

    if (isLoading) {
        return <RankProgressSkeleton />;
    }

    if (error) {
        return <RankProgressError error={error.message} />;
    }

    if (!data) {
        return null;
    }

    const {
        current_rank,
        current_rank_icon,
        next_rank,
        next_rank_icon,
        overall_progress_percent,
        premium_progress_percent,
        requirements,
        pool_qualification,
        details
    } = data;

    const isMaxRank = next_rank === null;

    // Check for regression
    const performanceDecreased = prevProgress && overall_progress_percent < prevProgress.performance;
    const premiumDecreased = prevProgress && premium_progress_percent < prevProgress.premium;

    return (
        <Card className="border-border/50 bg-gradient-to-br from-card via-card to-muted/20 transition-all duration-300 overflow-hidden">
            {/* Subtle Glow Background */}
            <div className="absolute inset-0 bg-gradient-to-br from-orange-500/10 via-transparent to-emerald-500/10 pointer-events-none opacity-50" />

            <CardHeader className="pb-4 relative z-10">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <motion.div
                            className="p-2.5 rounded-xl bg-gradient-to-br from-orange-500/20 to-orange-600/10 border border-orange-500/20"
                            animate={{
                                x: [0, 5, 0, -5, 0],
                                rotate: [0, 5, 0, -5, 0]
                            }}
                            transition={{
                                duration: 4,
                                repeat: Infinity,
                                ease: "easeInOut"
                            }}
                        >
                            <Target className="h-5 w-5 text-orange-600 dark:text-orange-500" />
                        </motion.div>
                        <div>
                            <div className="flex items-center gap-2">
                                <CardTitle className="text-lg">Rank Progress</CardTitle>
                                <TooltipProvider>
                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            <Info className="h-4 w-4 text-muted-foreground cursor-help" />
                                        </TooltipTrigger>
                                        <TooltipContent className="max-w-xs">
                                            <p>Progress is based on <strong>ACTIVE</strong> stakes only. When stakes expire, your progress may decrease.</p>
                                        </TooltipContent>
                                    </Tooltip>
                                </TooltipProvider>
                            </div>
                            <p className="text-sm text-muted-foreground">
                                {isMaxRank ? 'Highest rank achieved!' : 'Your journey to the next level'}
                            </p>
                        </div>
                    </div>
                    {!isMaxRank && (
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setIsExpanded(!isExpanded)}
                            className="gap-1"
                        >
                            {isExpanded ? 'Hide Details' : 'Show Details'}
                            {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                        </Button>
                    )}
                </div>
            </CardHeader>

            <CardContent className="space-y-6 relative z-10">
                {/* Current & Next Rank with Icons */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        {/* Current Rank Icon */}
                        {current_rank_icon ? (
                            <motion.img
                                src={current_rank_icon}
                                alt={current_rank}
                                className="w-14 h-14 object-contain"
                                animate={{
                                    rotate: [0, 5, -5, 0],
                                    scale: [1, 1.05, 1]
                                }}
                                transition={{
                                    duration: 3,
                                    repeat: Infinity,
                                    repeatDelay: 2,
                                    ease: "easeInOut"
                                }}
                                onError={(e) => {
                                    // Fallback to emoji if image fails to load
                                    e.currentTarget.style.display = 'none';
                                }}
                            />
                        ) : (
                            <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-yellow-400 via-yellow-500 to-orange-500 flex items-center justify-center shadow-lg">
                                <span className="text-2xl">🏆</span>
                            </div>
                        )}
                        <div>
                            <p className="text-lg font-bold bg-gradient-to-r from-yellow-600 to-orange-600 bg-clip-text text-transparent">
                                {current_rank}
                            </p>
                            <p className="text-xs text-muted-foreground">Current</p>
                        </div>
                    </div>

                    {!isMaxRank && (
                        <>
                            <TrendingUp className="h-5 w-5 text-muted-foreground flex-shrink-0" />

                            <div className="flex items-center gap-3">
                                <div className="text-right">
                                    <p className="text-lg font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
                                        {next_rank}
                                    </p>
                                    <p className="text-xs text-muted-foreground">Next</p>
                                </div>
                                {/* Next Rank Icon */}
                                {next_rank_icon ? (
                                    <motion.img
                                        src={next_rank_icon}
                                        alt={next_rank}
                                        className="w-14 h-14 object-contain opacity-60"
                                        whileHover={{ scale: 1.05, opacity: 0.8 }}
                                        onError={(e) => {
                                            e.currentTarget.style.display = 'none';
                                        }}
                                    />
                                ) : (
                                    <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-emerald-400 via-emerald-500 to-teal-500 flex items-center justify-center shadow-lg opacity-60">
                                        <span className="text-2xl">💎</span>
                                    </div>
                                )}
                            </div>
                        </>
                    )}
                </div>

                {/* Dual Progress Bars - Stacked Vertically */}
                {!isMaxRank && (
                    <div className="space-y-4">
                        {/* Bar A: Performance Rank */}
                        <div className="space-y-2">
                            <div className="flex justify-between items-center text-sm">
                                <div className="flex items-center gap-2">
                                    <span className="text-muted-foreground font-medium">
                                        Performance {next_rank}
                                    </span>
                                    <TooltipProvider>
                                        <Tooltip>
                                            <TooltipTrigger>
                                                <Info className="h-3.5 w-3.5 text-muted-foreground/60" />
                                            </TooltipTrigger>
                                            <TooltipContent>
                                                <p className="text-xs">Weighted: Personal (10%) + Team (70%) + Downlines (20%)</p>
                                            </TooltipContent>
                                        </Tooltip>
                                    </TooltipProvider>
                                </div>
                                <div className="flex items-center gap-2">
                                    {performanceDecreased && (
                                        <Badge variant="destructive" className="text-xs gap-1">
                                            <TrendingDown className="h-3 w-3" />
                                            Decreased
                                        </Badge>
                                    )}
                                    <span className="font-semibold text-orange-600 dark:text-orange-500">
                                        {overall_progress_percent}%
                                    </span>
                                </div>
                            </div>
                            <div className="relative h-3 bg-muted rounded-full overflow-hidden">
                                <motion.div
                                    animate={{ width: `${overall_progress_percent}%` }}
                                    transition={{ duration: 0.8, ease: "easeInOut" }}
                                    className="h-full bg-gradient-to-r from-orange-500 via-yellow-400 to-yellow-500 rounded-full shadow-lg"
                                />
                                {/* Shimmer effect */}
                                <motion.div
                                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
                                    initial={{ x: '-100%' }}
                                    animate={{ x: '200%' }}
                                    transition={{
                                        duration: 2.5,
                                        ease: 'easeInOut',
                                        repeat: Infinity,
                                        repeatDelay: 2,
                                    }}
                                />
                            </div>
                        </div>

                        {/* Bar B: Premium Rank */}
                        <div className="space-y-2">
                            <div className="flex justify-between items-center text-sm">
                                <div className="flex items-center gap-2">
                                    <span className="text-muted-foreground font-medium">
                                        Premium {next_rank}
                                    </span>
                                    <TooltipProvider>
                                        <Tooltip>
                                            <TooltipTrigger>
                                                <Info className="h-3.5 w-3.5 text-muted-foreground/60" />
                                            </TooltipTrigger>
                                            <TooltipContent>
                                                <p className="text-xs">Requires qualified downlines at target rank</p>
                                            </TooltipContent>
                                        </Tooltip>
                                    </TooltipProvider>
                                </div>
                                <div className="flex items-center gap-2">
                                    {premiumDecreased && (
                                        <Badge variant="destructive" className="text-xs gap-1">
                                            <TrendingDown className="h-3 w-3" />
                                            Decreased
                                        </Badge>
                                    )}
                                    <span className="font-semibold text-blue-600 dark:text-blue-500">
                                        {premium_progress_percent}%
                                    </span>
                                </div>
                            </div>
                            <div className="relative h-3 bg-muted rounded-full overflow-hidden">
                                <motion.div
                                    animate={{ width: `${premium_progress_percent}%` }}
                                    transition={{ duration: 0.8, ease: "easeInOut" }}
                                    className="h-full bg-gradient-to-r from-blue-500 via-purple-500 to-cyan-500 rounded-full shadow-lg"
                                />
                                {/* Shimmer effect */}
                                <motion.div
                                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
                                    initial={{ x: '-100%' }}
                                    animate={{ x: '200%' }}
                                    transition={{
                                        duration: 2.5,
                                        ease: 'easeInOut',
                                        repeat: Infinity,
                                        repeatDelay: 2,
                                    }}
                                />
                            </div>
                        </div>
                    </div>
                )}

                {/* Max Rank Celebration */}
                {isMaxRank && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="p-6 rounded-xl bg-gradient-to-br from-yellow-500/20 via-orange-500/10 to-transparent border border-yellow-500/20 text-center"
                    >
                        <div className="flex justify-center gap-2 mb-3">
                            <Star className="h-5 w-5 text-yellow-500" />
                            <Star className="h-5 w-5 text-yellow-500" />
                            <Star className="h-5 w-5 text-yellow-500" />
                        </div>
                        <h3 className="text-lg font-bold mb-1">Congratulations!</h3>
                        <p className="text-sm text-muted-foreground">
                            You've reached the highest rank: <strong>{current_rank}</strong>
                        </p>
                    </motion.div>
                )}

                {/* Collapsible Details Section */}
                <AnimatePresence>
                    {isExpanded && !isMaxRank && (
                        <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.3, ease: 'easeInOut' }}
                            className="overflow-hidden"
                        >
                            <div className="space-y-6 pt-2 border-t border-border/50 mt-4">
                                {/* Requirements */}
                                <div className="space-y-3">
                                    <h4 className="text-sm font-semibold flex items-center gap-2">
                                        <Star className="h-4 w-4" />
                                        Requirements
                                    </h4>
                                    <div className="space-y-2.5">
                                        <RequirementItem
                                            icon={DollarSign}
                                            title="Personal Stake"
                                            requirement={requirements.personal_stake}
                                            unit="$"
                                        />
                                        <RequirementItem
                                            icon={Users}
                                            title="Team Stake"
                                            requirement={requirements.team_stake}
                                            unit="$"
                                        />
                                        <RequirementItem
                                            icon={Users}
                                            title="Direct Downlines"
                                            requirement={requirements.direct_downlines}
                                        />
                                        {requirements.lower_rank_downlines.required > 0 && (
                                            <RequirementItem
                                                icon={TrendingUp}
                                                title={requirements.lower_rank_downlines.description}
                                                requirement={requirements.lower_rank_downlines}
                                            />
                                        )}
                                    </div>
                                </div>

                                {/* Pool Qualifications */}
                                <div className="space-y-3">
                                    <h4 className="text-sm font-semibold flex items-center gap-2">
                                        <Shield className="h-4 w-4" />
                                        Pool Qualifications
                                    </h4>
                                    <div className="grid gap-2">
                                        <PoolBadge
                                            title="Performance Pool"
                                            isQualified={pool_qualification.performance_pool.is_qualified}
                                            message={pool_qualification.performance_pool.message}
                                        />
                                        <PoolBadge
                                            title="Premium Pool"
                                            isQualified={pool_qualification.premium_pool.is_qualified}
                                            message={pool_qualification.premium_pool.message}
                                        />
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </CardContent>
        </Card>
    );
}

/**
 * Requirement Item Component
 */
function RequirementItem({
    icon: Icon,
    title,
    requirement,
    unit = ''
}: {
    icon: React.ElementType;
    title: string;
    requirement: Requirement;
    unit?: string;
}) {
    const { current, required, progress_percent, is_met } = requirement;

    return (
        <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50 border border-border/50">
            <div className={cn(
                "p-2 rounded-lg",
                is_met ? "bg-green-500/10 text-green-600 dark:text-green-500" : "bg-muted"
            )}>
                <Icon className="h-4 w-4" />
            </div>
            <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium truncate">{title}</span>
                    {is_met ? (
                        <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-500 flex-shrink-0" />
                    ) : (
                        <Circle className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                    )}
                </div>
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>
                        {unit}{current.toLocaleString()} / {unit}{required.toLocaleString()}
                    </span>
                    <span className="font-semibold">{progress_percent}%</span>
                </div>
                <Progress value={progress_percent} className="h-1 mt-1.5" />
            </div>
        </div>
    );
}

/**
 * Pool Qualification Badge
 */
function PoolBadge({
    title,
    isQualified,
    message
}: {
    title: string;
    isQualified: boolean;
    message: string;
}) {
    return (
        <div className={cn(
            "flex items-center justify-between p-3 rounded-lg border",
            isQualified
                ? "bg-green-500/10 border-green-500/20"
                : "bg-muted/50 border-border/50"
        )}>
            <div className="flex items-center gap-2">
                {isQualified ? (
                    <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-500" />
                ) : (
                    <Circle className="h-4 w-4 text-muted-foreground" />
                )}
                <span className="text-sm font-medium">{title}</span>
            </div>
            <Badge
                variant={isQualified ? "default" : "secondary"}
                className={cn(
                    "text-xs",
                    isQualified && "bg-green-500/20 text-green-700 dark:text-green-400 border-green-500/30"
                )}
            >
                {isQualified ? "Qualified" : "Not Qualified"}
            </Badge>
        </div>
    );
}

/**
 * Loading Skeleton
 */
function RankProgressSkeleton() {
    return (
        <Card className="border-border/50">
            <CardHeader className="pb-4">
                <div className="flex items-center gap-3">
                    <Skeleton className="h-10 w-10 rounded-xl" />
                    <div className="space-y-2">
                        <Skeleton className="h-5 w-32" />
                        <Skeleton className="h-4 w-48" />
                    </div>
                </div>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                    <Skeleton className="h-14 w-32" />
                    <Skeleton className="h-5 w-5" />
                    <Skeleton className="h-14 w-32" />
                </div>
                <div className="space-y-4">
                    <Skeleton className="h-3 w-full" />
                    <Skeleton className="h-3 w-full" />
                </div>
            </CardContent>
        </Card>
    );
}

/**
 * Error State
 */
function RankProgressError({ error }: { error: string }) {
    return (
        <Card className="border-destructive/50 bg-destructive/5">
            <CardContent className="pt-6">
                <div className="flex items-center gap-3 text-destructive">
                    <Info className="h-5 w-5" />
                    <div>
                        <p className="font-medium">Failed to load rank progress</p>
                        <p className="text-sm text-muted-foreground">{error}</p>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
