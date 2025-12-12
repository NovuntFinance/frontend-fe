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
}

export function ActivityList({ activities, isLoading }: ActivityListProps) {
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
      <div className="text-muted-foreground py-8 text-center text-sm">
        No activities found
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {activities.map((activity) => (
        <ActivityCard key={activity.id} activity={activity} />
      ))}
    </div>
  );
}
