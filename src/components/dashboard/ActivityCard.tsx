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
}

export function ActivityCard({ activity }: ActivityCardProps) {
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

  return (
    <div className="bg-card hover:bg-accent/50 flex items-center gap-3 rounded-lg border p-3 transition-colors">
      <div className={`rounded-lg p-2 ${getBgColorClass(activity.type)}`}>
        <Icon className={`h-4 w-4 ${colorClass}`} />
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-foreground text-sm font-medium">
            {activity.user}
          </span>
          <span className="text-muted-foreground text-sm">
            {activity.action}
          </span>
          {activity.amount !== null && (
            <span className={`text-sm font-semibold ${colorClass}`}>
              ${activity.amount.toLocaleString()}
            </span>
          )}
        </div>
        <span className="text-muted-foreground mt-0.5 block text-xs">
          {activity.timeAgo}
        </span>
      </div>
    </div>
  );
}
