/**
 * Activity Card Component
 * Displays a single platform activity
 */

import { PlatformActivity } from '@/types/platformActivity';
import {
  ArrowDownRight,
  ArrowUpRight,
  TrendingUp,
  Users,
  DollarSign,
  Gift,
  Star,
  Send,
  Circle,
} from 'lucide-react';

interface ActivityCardProps {
  activity: PlatformActivity;
  variant?: 'default' | 'neumorphic' | 'neumorphicDark';
}

const NEU_TEXT = '#009BF2';
const NEU_TEXT_MUTED = 'rgba(0, 155, 242, 0.7)';

export function ActivityCard({ activity, variant = 'default' }: ActivityCardProps) {
  const getActivityIcon = (type: PlatformActivity['type']) => {
    const iconMap: Record<string, typeof ArrowDownRight> = {
      deposit: ArrowDownRight,
      withdraw: ArrowUpRight,
      stake: TrendingUp,
      referral: Users,
      ros: DollarSign,
      rank: Gift,
      promotion: Star,
      transfer: Send,
      registration_bonus: Gift,
      stake_completion: TrendingUp,
      bonus_activation: Star,
      new_signup: Users,
    };
    return iconMap[type] || Circle;
  };

  const getActivityColor = (type: PlatformActivity['type']) => {
    const colorMap: Record<string, string> = {
      deposit: 'text-blue-600 dark:text-blue-400',
      withdraw: 'text-purple-600 dark:text-purple-400',
      stake: 'text-emerald-600 dark:text-emerald-400',
      referral: 'text-green-600 dark:text-green-400',
      ros: 'text-green-600 dark:text-green-400',
      rank: 'text-orange-600 dark:text-orange-400',
      promotion: 'text-yellow-600 dark:text-yellow-400',
      transfer: 'text-cyan-600 dark:text-cyan-400',
      registration_bonus: 'text-green-600 dark:text-green-400',
      stake_completion: 'text-emerald-600 dark:text-emerald-400',
      bonus_activation: 'text-yellow-600 dark:text-yellow-400',
      new_signup: 'text-blue-600 dark:text-blue-400',
    };
    return colorMap[type] || 'text-foreground';
  };

  const Icon = getActivityIcon(activity.type);
  const colorClass = getActivityColor(activity.type);

  // Get background color class for icon container
  const getBgColorClass = (type: PlatformActivity['type']) => {
    const bgColorMap: Record<string, string> = {
      deposit: 'bg-blue-500/10',
      withdraw: 'bg-purple-500/10',
      stake: 'bg-emerald-500/10',
      referral: 'bg-green-500/10',
      ros: 'bg-green-500/10',
      rank: 'bg-orange-500/10',
      promotion: 'bg-yellow-500/10',
      transfer: 'bg-cyan-500/10',
      registration_bonus: 'bg-green-500/10',
      stake_completion: 'bg-emerald-500/10',
      bonus_activation: 'bg-yellow-500/10',
      new_signup: 'bg-blue-500/10',
    };
    return bgColorMap[type] || 'bg-muted';
  };

  // Display: "user" then "action $amount" (e.g. "L*h E." + "staked $362" or "earned ROS $41")
  const actionLabel =
    activity.amount !== null && activity.amount !== undefined
      ? `${activity.action} $${activity.amount.toLocaleString()}`
      : activity.action;

  const isNeumorphic = variant === 'neumorphic';
  const isNeumorphicDark = variant === 'neumorphicDark';

  const cardClassName = isNeumorphicDark
    ? 'flex items-center gap-2 rounded-lg border border-white/10 p-2 transition-colors'
    : isNeumorphic
      ? 'flex items-center gap-3 rounded-xl p-3 transition-colors bg-white shadow-[4px_4px_8px_0_rgba(203,213,225,0.5),-4px_-4px_8px_0_rgba(255,255,255,0.9)] dark:bg-slate-800/80 dark:shadow-[4px_4px_8px_0_rgba(0,0,0,0.2),-2px_-2px_6px_0_rgba(255,255,255,0.05)]'
      : 'bg-card hover:bg-accent/50 flex items-center gap-3 rounded-lg border p-3 transition-colors';

  const cardStyle = isNeumorphicDark
    ? {
        background: 'rgba(0, 0, 0, 0.2)',
        boxShadow: 'inset 2px 2px 6px rgba(0,0,0,0.3), inset -2px -2px 6px rgba(255,255,255,0.03)',
      }
    : undefined;

  const iconWrapperClass = isNeumorphicDark
    ? 'flex-shrink-0 rounded-lg p-2'
    : isNeumorphic
      ? 'flex-shrink-0 rounded-lg bg-gradient-to-br from-blue-500/20 to-cyan-500/20 p-2 dark:from-blue-500/30 dark:to-cyan-500/20'
      : `flex-shrink-0 rounded-lg p-2 ${getBgColorClass(activity.type)}`;

  const iconWrapperStyle = isNeumorphicDark ? { background: 'rgba(0, 155, 242, 0.15)' } : undefined;

  return (
    <div className={cardClassName} style={cardStyle}>
      <div className={iconWrapperClass} style={iconWrapperStyle}>
        <Icon className={`h-4 w-4 ${isNeumorphicDark ? '' : colorClass}`} style={isNeumorphicDark ? { color: NEU_TEXT } : undefined} />
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <span
            className={isNeumorphicDark ? 'text-sm font-medium' : 'text-foreground text-sm font-medium'}
            style={isNeumorphicDark ? { color: NEU_TEXT } : undefined}
          >
            {activity.user}
          </span>
          <span
            className={isNeumorphicDark ? 'text-sm' : 'text-muted-foreground text-sm'}
            style={isNeumorphicDark ? { color: NEU_TEXT_MUTED } : undefined}
          >
            {actionLabel}
          </span>
        </div>
        <span
          className={isNeumorphicDark ? 'mt-0.5 block text-xs' : 'text-muted-foreground mt-0.5 block text-xs'}
          style={isNeumorphicDark ? { color: NEU_TEXT_MUTED } : undefined}
        >
          {activity.timeAgo}
        </span>
      </div>
    </div>
  );
}
