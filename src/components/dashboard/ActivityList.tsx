/**
 * Activity List Component
 * Displays multiple platform activities
 */

import { PlatformActivity } from '@/types/platformActivity';
import { ActivityCard } from './ActivityCard';
import { ShimmerCard } from '@/components/ui/shimmer';

interface ActivityListProps {
  activities: PlatformActivity[];
  isLoading?: boolean;
  /** default | neumorphic (light) | neumorphicDark (dark card, blue/cyan text) */
  variant?: 'default' | 'neumorphic' | 'neumorphicDark';
}

export function ActivityList({ activities, isLoading, variant = 'default' }: ActivityListProps) {
  if (isLoading) {
    return (
      <div className="space-y-2">
        {Array.from({ length: 3 }).map((_, index) => (
          <ShimmerCard key={index} className="h-20" />
        ))}
      </div>
    );
  }

  if (activities.length === 0) {
    return (
      <div className="py-8 text-center text-sm">
        <span
          className={variant === 'neumorphicDark' ? '' : 'text-muted-foreground'}
          style={variant === 'neumorphicDark' ? { color: 'rgba(0, 155, 242, 0.7)' } : undefined}
        >
          No activities found
        </span>
      </div>
    );
  }

  return (
    <div className={variant === 'neumorphicDark' ? 'space-y-1.5' : 'space-y-2'}>
      {activities.map((activity) => (
        <ActivityCard key={activity.id} activity={activity} variant={variant} />
      ))}
    </div>
  );
}
