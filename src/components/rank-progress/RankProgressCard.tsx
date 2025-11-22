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
    Lock,
    AlertCircle
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
                // Only update prevProgress if it changes, to avoid loops
                if (newProgress.performance !== prevProgress.performance ||
                    newProgress.premium !== prevProgress.premium) {
                    setPrevProgress(newProgress);
                }
            }
        }
    }, [data]);

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
    } = data;

    const isMaxRank = next_rank === null;
    const isStakeholder = current_rank === 'Stakeholder';

    // Check for regression
    const performanceDecreased = prevProgress && overall_progress_percent < prevProgress.performance;
    const premiumDecreased = prevProgress && premium_progress_percent < prevProgress.premium;

    return (
        <Card className="border-border/50 bg-gradient-to-br from-card via-card to-muted/20 transition-all duration-300 overflow-hidden">
            {/* Subtle Glow Background */}
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-transparent to-emerald-500/5 pointer-events-none opacity-50" />

            <CardHeader className="pb-4 relative z-10">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <motion.div
                            className="p-2.5 rounded-xl bg-gradient-to-br from-blue-500/20 to-blue-600/10 border border-blue-500/20"
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
                            <Target className="h-5 w-5 text-blue-600 dark:text-blue-500" />
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
                                            <p>Track your journey through the ranks. Progress is based on active stakes and team performance.</p>
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

            <CardContent className="space-y-8 relative z-10">
                {/* Current & Next Rank with Icons - Responsive Layout */}
                <div className="flex flex-col md:flex-row items-center justify-between gap-6 md:gap-4">
                    {/* Current Rank - Prominent */}
                    <div className="flex flex-col items-center md:items-start gap-3 text-center md:text-left">
                        <div className="relative">
                            {current_rank_icon ? (
                                <motion.img
                                    src={current_rank_icon}
                                    alt={current_rank}
                                    className="w-20 h-20 object-contain drop-shadow-xl"
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
                                        e.currentTarget.style.display = 'none';
                                    }}
                                />
                            ) : (
                                <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-400 via-blue-500 to-indigo-500 flex items-center justify-center shadow-xl">
                                    <span className="text-3xl">🏆</span>
                                </div>
                            )}
                            <div className="absolute -bottom-2 -right-2 bg-background/80 backdrop-blur-sm border border-border rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider shadow-sm">
                                Current
                            </div>
                        </div>
                        <div>
                            <p className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                                {current_rank}
                            </p>
                        </div>
                    </div>

                    {!isMaxRank && (
                        <>
                            {/* Arrow Indicator */}
                            <div className="hidden md:flex flex-col items-center gap-1 text-muted-foreground/50">
                                <span className="text-xs uppercase tracking-widest">Progress</span>
                                <TrendingUp className="h-6 w-6" />
                            </div>

                            {/* Next Rank - Target */}
                            <div className="flex flex-col items-center md:items-end gap-3 text-center md:text-right opacity-80 hover:opacity-100 transition-opacity">
                                <div className="relative">
                                    {next_rank_icon ? (
                                        <motion.img
                                            src={next_rank_icon}
                                            alt={next_rank}
                                            className="w-14 h-14 object-contain opacity-70 grayscale-[30%]"
                                            whileHover={{ scale: 1.05, opacity: 1, filter: 'grayscale(0%)' }}
                                            onError={(e) => {
                                                e.currentTarget.style.display = 'none';
                                            }}
                                        />
                                    ) : (
                                        <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-emerald-400 via-emerald-500 to-teal-500 flex items-center justify-center shadow-lg opacity-60">
                                            <span className="text-2xl">💎</span>
                                        </div>
                                    )}
                                    <div className="absolute -bottom-2 -left-2 md:left-auto md:-right-2 bg-muted/80 backdrop-blur-sm border border-border rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider shadow-sm">
                                        Next
                                    </div>
                                </div>
                                <div>
                                    <p className="text-lg font-bold text-muted-foreground">
                                        {next_rank}
                                    </p>
                                </div>
                            </div>
                        </>
                    )}
                </div>

                {/* Dual Progress Bars - Stacked Vertically */}
                {!isMaxRank && (
                    <div className="space-y-6">
                        {/* Bar A: Performance Rank (Blue Theme) */}
                        <div className="space-y-2">
                            <div className="flex justify-between items-center text-sm">
                                <div className="flex items-center gap-2">
                                    <div className="p-1 rounded-full bg-blue-500/10">
                                        <Target className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
                                    </div>
                                    <span className="font-medium text-foreground">
                                        Performance Progress
                                    </span>
                                    <TooltipProvider>
                                        <Tooltip>
                                            <TooltipTrigger>
                                                <Info className="h-3.5 w-3.5 text-muted-foreground/60 hover:text-blue-500 transition-colors" />
                                            </TooltipTrigger>
                                            <TooltipContent className="max-w-xs">
                                                <p className="font-semibold mb-1">Performance Calculation:</p>
                                                <ul className="list-disc pl-4 text-xs space-y-1">
                                                    <li>Personal Stake (1x weight)</li>
                                                    <li>Team Stake (7x weight)</li>
                                                    <li>Direct Downlines (2x weight)</li>
                                                </ul>
                                            </TooltipContent>
                                        </Tooltip>
                                    </TooltipProvider>
                                </div>
                                <div className="flex items-center gap-2">
                                    {performanceDecreased && (
                                        <Badge variant="destructive" className="text-xs gap-1 animate-pulse">
                                            <TrendingDown className="h-3 w-3" />
                                            Decreased
                                        </Badge>
                                    )}
                                    <span className={cn(
                                        "font-bold",
                                        performanceDecreased ? "text-red-500" : "text-blue-600 dark:text-blue-400"
                                    )}>
                                        {overall_progress_percent}%
                                    </span>
                                </div>
                            </div>
                            <div className="relative h-3 bg-muted rounded-full overflow-hidden">
                                <motion.div
                                    animate={{ width: `${overall_progress_percent}%` }}
                                    transition={{ duration: 0.8, ease: "easeInOut" }}
                                    className={cn(
                                        "h-full rounded-full shadow-lg transition-colors duration-500",
                                        performanceDecreased
                                            ? "bg-gradient-to-r from-red-500 to-orange-500"
                                            : "bg-gradient-to-r from-blue-500 via-blue-400 to-cyan-500"
                                    )}
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

                        {/* Bar B: Premium Rank (Green Theme) */}
                        <div className="space-y-2">
                            <div className="flex justify-between items-center text-sm">
                                <div className="flex items-center gap-2">
                                    <div className="p-1 rounded-full bg-emerald-500/10">
                                        <Shield className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                                    </div>
                                    <span className="font-medium text-foreground">
                                        Premium Pool Qualification
                                    </span>
                                    <TooltipProvider>
                                        <Tooltip>
                                            <TooltipTrigger>
                                                <Info className="h-3.5 w-3.5 text-muted-foreground/60 hover:text-emerald-500 transition-colors" />
                                            </TooltipTrigger>
                                            <TooltipContent className="max-w-xs">
                                                <p className="font-semibold mb-1">Premium Pool:</p>
                                                <p className="text-xs">Requires maintaining active downlines at specific ranks. You can lose this qualification if downlines become inactive.</p>
                                            </TooltipContent>
                                        </Tooltip>
                                    </TooltipProvider>
                                </div>
                                <div className="flex items-center gap-2">
                                    {premiumDecreased && (
                                        <Badge variant="destructive" className="text-xs gap-1 animate-pulse">
                                            <TrendingDown className="h-3 w-3" />
                                            Decreased
                                        </Badge>
                                    )}
                                    {isStakeholder ? (
                                        <span className="text-xs font-medium text-muted-foreground">Not Eligible</span>
                                    ) : (
                                        <span className={cn(
                                            "font-bold",
                                            premiumDecreased ? "text-red-500" : "text-emerald-600 dark:text-emerald-400"
                                        )}>
                                            {premium_progress_percent}%
                                        </span>
                                    )}
                                </div>
                            </div>
                            <div className="relative h-3 bg-muted rounded-full overflow-hidden">
                                {isStakeholder ? (
                                    <div className="h-full w-full bg-muted-foreground/10 flex items-center justify-center">
                                        <div className="w-full h-full bg-[url('/assets/stripe-pattern.png')] opacity-10" />
                                    </div>
                                ) : (
                                    <>
                                        <motion.div
                                            animate={{ width: `${premium_progress_percent}%` }}
                                            transition={{ duration: 0.8, ease: "easeInOut" }}
                                            className={cn(
                                                "h-full rounded-full shadow-lg transition-colors duration-500",
                                                premiumDecreased
                                                    ? "bg-gradient-to-r from-red-500 to-orange-500"
                                                    : "bg-gradient-to-r from-emerald-500 via-emerald-400 to-teal-500"
                                            )}
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
                                    </>
                                )}
                            </div>
                            {isStakeholder && (
                                <p className="text-xs text-muted-foreground flex items-center gap-1">
                                    <Lock className="h-3 w-3" /> Stakeholders are not eligible for Premium Pool
                                </p>
                            )}
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
                            <div className="space-y-6 pt-6 border-t border-border/50 mt-2">
                                {/* Requirements */}
                                <div className="space-y-3">
                                    <h4 className="text-sm font-semibold flex items-center gap-2">
                                        <Star className="h-4 w-4 text-orange-500" />
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
                                        <Shield className="h-4 w-4 text-blue-500" />
                                        Pool Qualifications
                                    </h4>
                                    <div className="grid gap-3">
                                        <PoolBadge
                                            title="Performance Pool"
                                            isQualified={pool_qualification.performance_pool.is_qualified}
                                            message={pool_qualification.performance_pool.message}
                                            type="performance"
                                        />
                                        <PoolBadge
                                            title="Premium Pool"
                                            isQualified={isStakeholder ? false : pool_qualification.premium_pool.is_qualified}
                                            message={isStakeholder ? "Stakeholders are not eligible for Premium Pool" : pool_qualification.premium_pool.message}
                                            type="premium"
                                            isStakeholder={isStakeholder}
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
    const { current, required, is_met } = requirement;

    return (
        <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50 border border-border/50 hover:bg-muted/80 transition-colors">
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
                    <span className={is_met ? "text-green-600 dark:text-green-500 font-medium" : ""}>
                        {is_met ? "Completed" : "In Progress"}
                    </span>
                </div>
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
    message,
    type,
    isStakeholder = false
}: {
    title: string;
    isQualified: boolean;
    message: string;
    type: 'performance' | 'premium';
    isStakeholder?: boolean;
}) {
    const isPerformance = type === 'performance';
    const activeColorClass = isPerformance ? "text-blue-600 dark:text-blue-400" : "text-green-600 dark:text-green-400";
    const activeBgClass = isPerformance ? "bg-blue-500/10 border-blue-500/20" : "bg-green-500/10 border-green-500/20";
    const activeBadgeClass = isPerformance ? "bg-blue-500/20 text-blue-700 dark:text-blue-400 border-blue-500/30" : "bg-green-500/20 text-green-700 dark:text-green-400 border-green-500/30";

    return (
        <div className={cn(
            "flex flex-col gap-2 p-3 rounded-lg border transition-all",
            isQualified
                ? activeBgClass
                : "bg-muted/30 border-border/50"
        )}>
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    {isStakeholder ? (
                        <Lock className="h-4 w-4 text-muted-foreground" />
                    ) : isQualified ? (
                        <CheckCircle2 className={cn("h-4 w-4", activeColorClass)} />
                    ) : (
                        <Circle className="h-4 w-4 text-muted-foreground" />
                    )}
                    <span className="text-sm font-medium">{title}</span>
                </div>
                <Badge
                    variant={isQualified ? "default" : "secondary"}
                    className={cn(
                        "text-xs",
                        isQualified && activeBadgeClass
                    )}
                >
                    {isStakeholder ? "Not Eligible" : isQualified ? "Qualified" : "Not Qualified"}
                </Badge>
            </div>
            <p className="text-xs text-muted-foreground pl-6">
                {message}
            </p>
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
                    <AlertCircle className="h-5 w-5" />
                    <div>
                        <p className="font-medium">Failed to load rank progress</p>
                        <p className="text-sm text-muted-foreground">{error}</p>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
