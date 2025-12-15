'use client';

import React from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Eye,
  EyeOff,
  RefreshCw,
  CheckCircle2,
  TrendingUp,
  Info,
  Target,
  Share2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { motion } from 'framer-motion';
import { FaFacebook, FaInstagram, FaYoutube, FaTelegram } from 'react-icons/fa';
import { SiTiktok } from 'react-icons/si';
import { openShareModal } from '@/store/shareModalStore';

interface WelcomeBackCardProps {
  user: any;
  balanceVisible: boolean;
  setBalanceVisible: (visible: boolean) => void;
  refetch: () => void;
  isRefetching: boolean;
  totalPortfolioValue: number;
  lastWeekProfitChange: number;
  totalEarnings?: number;
}

export function WelcomeBackCard({
  user,
  balanceVisible,
  setBalanceVisible,
  refetch,
  isRefetching,
  totalPortfolioValue,
  lastWeekProfitChange,
  totalEarnings = 0,
}: WelcomeBackCardProps) {
  const greetingName = user?.firstName
    ? user.firstName.charAt(0).toUpperCase() + user.firstName.slice(1)
    : 'Stakeholder';

  // Map rank names to Cloudinary icon URLs
  const getRankIcon = (rankName: string): string => {
    const rankMap: Record<string, string> = {
      Stakeholder:
        'https://res.cloudinary.com/dfpulrssa/image/upload/v1763740099/stakeholder_e1aiiq.png',
      'Associate Stakeholder':
        'https://res.cloudinary.com/dfpulrssa/image/upload/v1763740425/associate-stakeholder_fqly9v.jpg',
      'Principal Strategist':
        'https://res.cloudinary.com/dfpulrssa/image/upload/v1763741307/principal-strategist_nlvp5f.png',
      'Elite Capitalist':
        'https://res.cloudinary.com/dfpulrssa/image/upload/v1763741307/elite-capitalist_jddpzw.png',
      'Wealth Architect':
        'https://res.cloudinary.com/dfpulrssa/image/upload/v1763741520/wealth-architect_j7v707.png',
      'Finance Titan':
        'https://res.cloudinary.com/dfpulrssa/image/upload/v1763741605/finance-titan_ejpsji.png',
    };

    return (
      rankMap[rankName] ||
      'https://res.cloudinary.com/dfpulrssa/image/upload/v1763740099/stakeholder_e1aiiq.png'
    );
  };

  const rankIconPath = getRankIcon(user?.rank || 'Stakeholder');

  return (
    <Card className="bg-card/50 group relative overflow-hidden border-0 shadow-lg backdrop-blur-sm transition-shadow duration-300 hover:shadow-xl">
      {/* Animated Gradient Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-orange-500/20 via-amber-500/10 to-transparent" />

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
        className="absolute -bottom-12 -left-12 h-24 w-24 rounded-full bg-orange-500/30 blur-2xl"
      />

      {/* Rank Icon Background - Full Card Coverage */}
      <div
        className="pointer-events-none absolute inset-0 z-0"
        style={{
          backgroundImage: `url(${rankIconPath})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          opacity: 0.08,
        }}
      />

      <CardHeader className="relative p-4 sm:p-6">
        <div className="mb-2 flex items-center gap-2 sm:gap-3">
          <motion.div
            whileHover={{ scale: 1.1, rotate: -10 }}
            className="rounded-xl bg-gradient-to-br from-orange-500/30 to-amber-500/20 p-2 shadow-lg backdrop-blur-sm sm:p-3"
          >
            <Target className="h-5 w-5 text-orange-500 sm:h-6 sm:w-6" />
          </motion.div>
          <div className="min-w-0 flex-1">
            <CardTitle className="bg-gradient-to-r from-orange-600 to-amber-600 bg-clip-text text-sm font-bold text-transparent sm:text-base md:text-lg">
              Welcome back, {greetingName}! 👋
            </CardTitle>
            <CardDescription className="text-[10px] sm:text-xs">
              Total Portfolio Value
            </CardDescription>
          </div>
          {/* Header Actions (Eye toggle and Share button) */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            {/* Share Button - Circular */}
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => {
                    openShareModal('profit', {
                      title: 'Share Your Success!',
                      message: `🎉 I'm earning on Novunt!\nJoin me and start earning too.`,
                      amount: totalEarnings,
                    });
                  }}
                  className="h-8 w-8 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg transition-all duration-200 hover:scale-110 hover:from-blue-700 hover:to-purple-700 sm:h-10 sm:w-10"
                >
                  <Share2 className="h-4 w-4 sm:h-5 sm:w-5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Share your success</p>
              </TooltipContent>
            </Tooltip>

            {/* Eye Toggle */}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setBalanceVisible(!balanceVisible)}
              className="text-muted-foreground hover:text-foreground h-8 w-8 hover:bg-white/5 sm:h-10 sm:w-10"
            >
              {balanceVisible ? (
                <Eye className="h-4 w-4 sm:h-5 sm:w-5" />
              ) : (
                <EyeOff className="h-4 w-4 sm:h-5 sm:w-5" />
              )}
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="relative p-4 pt-0 sm:p-6 sm:pt-0">
        <div className="space-y-4 sm:space-y-6">
          {/* Header Actions (Eye toggle and Share button) - Positioned absolutely */}
          <div className="absolute top-3 right-3 z-20 flex items-center gap-1.5 sm:top-6 sm:right-6 sm:gap-2">
            {/* Share Button - Circular */}
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => {
                    openShareModal('profit', {
                      title: 'Share Your Success!',
                      message: `🎉 I'm earning on Novunt!\nJoin me and start earning too.`,
                      amount: totalEarnings,
                    });
                  }}
                  className="h-10 w-10 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg transition-all duration-200 hover:scale-110 hover:from-blue-700 hover:to-purple-700"
                >
                  <Share2 className="h-5 w-5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Share your success</p>
              </TooltipContent>
            </Tooltip>

            {/* Eye Toggle */}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setBalanceVisible(!balanceVisible)}
              className="text-muted-foreground hover:text-foreground h-8 w-8 hover:bg-white/5 sm:h-10 sm:w-10"
            >
              {balanceVisible ? (
                <Eye className="h-4 w-4 sm:h-5 sm:w-5" />
              ) : (
                <EyeOff className="h-4 w-4 sm:h-5 sm:w-5" />
              )}
            </Button>
          </div>

          {/* User Status Section - Only Weekly Profit Badge */}
          {lastWeekProfitChange !== 0 && (
            <div className="mb-2 sm:mb-4">
              <Badge
                variant={
                  (lastWeekProfitChange ?? 0) >= 0 ? 'default' : 'destructive'
                }
                className={`${
                  (lastWeekProfitChange ?? 0) >= 0
                    ? 'border-emerald-500/30 bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30'
                    : 'border-red-500/30 bg-red-500/20 text-red-300 hover:bg-red-500/30'
                } px-3 py-1 text-xs font-semibold sm:text-sm`}
              >
                <TrendingUp
                  className={`mr-1.5 h-3.5 w-3.5 ${(lastWeekProfitChange ?? 0) >= 0 ? 'text-emerald-400' : 'rotate-180 text-red-400'}`}
                />
                <span className="font-bold">
                  {(lastWeekProfitChange ?? 0) >= 0 ? '+' : ''}
                  {(lastWeekProfitChange ?? 0).toFixed(2)}%
                </span>
              </Badge>
            </div>
          )}

          {/* Total Portfolio Value Section */}
          <div className="mb-2 sm:mb-4">
            {balanceVisible ? (
              <motion.div
                key="portfolio"
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.9 }}
                className="bg-gradient-to-r from-orange-600 to-amber-600 bg-clip-text text-2xl font-black text-transparent sm:text-3xl md:text-4xl lg:text-5xl"
              >
                $
                {totalPortfolioValue.toLocaleString('en-US', {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </motion.div>
            ) : (
              <motion.div
                key="hidden"
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.9 }}
                className="text-muted-foreground/50 text-2xl font-black sm:text-3xl md:text-4xl lg:text-5xl"
              >
                ••••••••
              </motion.div>
            )}
          </div>

          {/* Social Media Links Footer */}
          <div className="border-t border-white/5 pt-4 sm:pt-6">
            <p className="text-muted-foreground mb-3 text-xs sm:mb-4 sm:text-sm">
              You can also keep up with us here
            </p>
            <div className="flex items-center gap-2">
              <SocialButton
                icon={FaFacebook}
                onClick={() =>
                  window.open(
                    'https://www.facebook.com/share/16oLeHcQkH/',
                    '_blank'
                  )
                }
              />
              <SocialButton
                icon={FaInstagram}
                onClick={() =>
                  window.open(
                    'https://www.instagram.com/novunt_hq?igsh=bGxoaGV3d3B0MWd5',
                    '_blank'
                  )
                }
              />
              <SocialButton
                icon={SiTiktok}
                onClick={() =>
                  window.open(
                    'https://www.tiktok.com/@novuntofficial?_t=ZS-8ymrJsyJBk9&_r=1',
                    '_blank'
                  )
                }
              />
              <SocialButton
                icon={FaYoutube}
                onClick={() =>
                  window.open(
                    'https://youtube.com/@novunthq?si=yWDR_Qv9RE9sIam4',
                    '_blank'
                  )
                }
              />
              <SocialButton
                icon={FaTelegram}
                onClick={() => window.open('https://t.me/novunt', '_blank')}
              />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function SocialButton({
  icon: Icon,
  onClick,
}: {
  icon: React.ElementType;
  onClick: () => void;
}) {
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
        ease: 'easeInOut',
      }}
      className="text-muted-foreground hover:text-foreground flex h-9 w-9 items-center justify-center rounded-md transition-colors hover:bg-white/5"
      onClick={onClick}
    >
      <Icon className="h-4 w-4" />
    </motion.button>
  );
}
