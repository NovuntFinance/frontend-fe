'use client';

import React from 'react';
import { NovuntPremiumCard } from '@/components/ui/NovuntPremiumCard';
import {
    Eye,
    EyeOff,
    RefreshCw,
    CheckCircle2,
    TrendingUp,
    Info,
    Target
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { motion } from 'framer-motion';
import { FaFacebook, FaInstagram, FaYoutube, FaTelegram } from 'react-icons/fa';
import { SiTiktok } from 'react-icons/si';

interface WelcomeBackCardProps {
    user: any;
    balanceVisible: boolean;
    setBalanceVisible: (visible: boolean) => void;
    refetch: () => void;
    isRefetching: boolean;
    totalPortfolioValue: number;
    lastWeekProfitChange: number;
}

export function WelcomeBackCard({
    user,
    balanceVisible,
    setBalanceVisible,
    refetch,
    isRefetching,
    totalPortfolioValue,
    lastWeekProfitChange
}: WelcomeBackCardProps) {

    const greetingName = user?.firstName
        ? user.firstName.charAt(0).toUpperCase() + user.firstName.slice(1)
        : 'Stakeholder';

    // Map rank names to Cloudinary icon URLs
    const getRankIcon = (rankName: string): string => {
        const rankMap: Record<string, string> = {
            'Stakeholder': 'https://res.cloudinary.com/dfpulrssa/image/upload/v1763740099/stakeholder_e1aiiq.png',
            'Associate Stakeholder': 'https://res.cloudinary.com/dfpulrssa/image/upload/v1763740425/associate-stakeholder_fqly9v.jpg',
            'Principal Strategist': 'https://res.cloudinary.com/dfpulrssa/image/upload/v1763741307/principal-strategist_nlvp5f.png',
            'Elite Capitalist': 'https://res.cloudinary.com/dfpulrssa/image/upload/v1763741307/elite-capitalist_jddpzw.png',
            'Wealth Architect': 'https://res.cloudinary.com/dfpulrssa/image/upload/v1763741520/wealth-architect_j7v707.png',
            'Finance Titan': 'https://res.cloudinary.com/dfpulrssa/image/upload/v1763741605/finance-titan_ejpsji.png'
        };

        return rankMap[rankName] || 'https://res.cloudinary.com/dfpulrssa/image/upload/v1763740099/stakeholder_e1aiiq.png';
    };

    const rankIconPath = getRankIcon(user?.rank || 'Stakeholder');

    return (
        <NovuntPremiumCard
            title={`Welcome back, ${greetingName}! 👋`}
            icon={Target}
            colorTheme="orange"
            className="h-full min-h-[400px] relative overflow-hidden"
        >
            {/* Rank Icon Background - Full Card Coverage */}
            <div
                className="absolute inset-0 pointer-events-none z-0"
                style={{
                    backgroundImage: `url(${rankIconPath})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    backgroundRepeat: 'no-repeat',
                    opacity: 0.08,
                }}
            />

            <div className="space-y-8 relative z-10">
                {/* Header Actions (Eye toggle only) - Positioned absolutely */}
                <div className="absolute top-6 right-6 flex items-center gap-2 z-20">
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setBalanceVisible(!balanceVisible)}
                        className="text-muted-foreground hover:text-foreground hover:bg-white/5"
                    >
                        {balanceVisible ? (
                            <Eye className="h-5 w-5" />
                        ) : (
                            <EyeOff className="h-5 w-5" />
                        )}
                    </Button>
                </div>

                {/* User Status Section - Only Weekly Profit Badge */}
                <div className="space-y-3">
                    {lastWeekProfitChange !== 0 && (
                        <Badge
                            variant={lastWeekProfitChange >= 0 ? "default" : "destructive"}
                            className={`${lastWeekProfitChange >= 0
                                ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/30 hover:bg-emerald-500/30"
                                : "bg-red-500/20 text-red-300 border-red-500/30 hover:bg-red-500/30"
                                } px-3 py-1 text-sm font-semibold`}
                        >
                            <TrendingUp className={`h-3.5 w-3.5 mr-1.5 ${lastWeekProfitChange >= 0 ? 'text-emerald-400' : 'text-red-400 rotate-180'}`} />
                            <span className="font-bold">
                                {lastWeekProfitChange >= 0 ? '+' : ''}{lastWeekProfitChange.toFixed(2)}%
                            </span>
                        </Badge>
                    )}
                </div>

                {/* Total Portfolio Value Section */}
                <div>
                    <p className="text-muted-foreground text-sm mb-2 flex items-center gap-2">
                        Total Portfolio Value
                        <Tooltip>
                            <TooltipTrigger>
                                <Info className="h-3.5 w-3.5 text-muted-foreground/60 hover:text-foreground" />
                            </TooltipTrigger>
                            <TooltipContent>
                                <p>Sum of deposits, transfers, earnings (registration bonus + pool earnings), and active stakes</p>
                            </TooltipContent>
                        </Tooltip>
                    </p>

                    {balanceVisible ? (
                        <motion.h2
                            key="portfolio"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight bg-gradient-to-r from-white to-white/60 bg-clip-text text-transparent"
                        >
                            ${totalPortfolioValue.toLocaleString('en-US', {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2,
                            })}
                        </motion.h2>
                    ) : (
                        <motion.div
                            key="hidden"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="text-5xl sm:text-6xl lg:text-7xl font-bold text-muted-foreground/50"
                        >
                            ••••••••
                        </motion.div>
                    )}
                </div>

                {/* Social Media Links Footer */}
                <div className="pt-6 border-t border-white/5">
                    <p className="text-muted-foreground text-xs sm:text-sm mb-4">You can also keep up with us here</p>
                    <div className="flex items-center gap-2">
                        <SocialButton
                            icon={FaFacebook}
                            onClick={() => window.open('https://www.facebook.com/share/16oLeHcQkH/', '_blank')}
                        />
                        <SocialButton
                            icon={FaInstagram}
                            onClick={() => window.open('https://www.instagram.com/novunt_hq?igsh=bGxoaGV3d3B0MWd5', '_blank')}
                        />
                        <SocialButton
                            icon={SiTiktok}
                            onClick={() => window.open('https://www.tiktok.com/@novuntofficial?_t=ZS-8ymrJsyJBk9&_r=1', '_blank')}
                        />
                        <SocialButton
                            icon={FaYoutube}
                            onClick={() => window.open('https://youtube.com/@novunthq?si=yWDR_Qv9RE9sIam4', '_blank')}
                        />
                        <SocialButton
                            icon={FaTelegram}
                            onClick={() => window.open('https://t.me/novunt', '_blank')}
                        />
                    </div>
                </div>
            </div>
        </NovuntPremiumCard>
    );
}

function SocialButton({ icon: Icon, onClick }: { icon: React.ElementType, onClick: () => void }) {
    return (
        <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            animate={{
                x: [0, 2, 0, -2, 0],
            }}
            transition={{
                duration: 3,
                repeat: Infinity,
                ease: "easeInOut"
            }}
            className="h-9 w-9 rounded-md flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-white/5 transition-colors"
            onClick={onClick}
        >
            <Icon className="h-4 w-4" />
        </motion.button>
    );
}
