/**
 * Activity List Component
 * Displays multiple platform activities
 */

import { PlatformActivity } from '@/types/platformActivity';
import { ActivityCard } from './ActivityCard';

interface ActivityListProps {
  activities: PlatformActivity[];
  isLoading?: boolean;
}

export function ActivityList({ activities, isLoading }: ActivityListProps) {
  if (isLoading) {
    return (
      <div className="space-y-2">
        {Array.from({ length: 3 }).map((_, index) => (
          <div
            key={index}
            className="bg-card flex animate-pulse items-center gap-3 rounded-lg border p-3"
          >
            <div className="bg-muted h-10 w-10 rounded-lg" />
            <div className="flex-1 space-y-2">
              <div className="bg-muted h-3 w-3/4 rounded" />
              <div className="bg-muted h-2 w-1/2 rounded" />
            </div>
          </div>
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
