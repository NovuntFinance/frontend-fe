/**
 * Live Activity Feed Component
 * Shows real-time anonymized user activity for social proof
 */

'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { TrendingUp, DollarSign, Target, Award } from 'lucide-react';

interface Activity {
  id: string;
  type: 'withdrawal' | 'profit' | 'stake' | 'signup';
  username: string; // Anonymized (e.g., "John D.")
  amount?: number;
  message: string;
  timestamp: number;
}

// Mock data generator (replace with real-time data from backend)
function generateMockActivity(): Activity {
  const firstNames = [
    'John',
    'Sarah',
    'Mike',
    'Emma',
    'David',
    'Lisa',
    'Tom',
    'Anna',
  ];
  const lastInitials = ['D', 'M', 'R', 'K', 'L', 'W', 'B', 'S'];

  const types: Activity['type'][] = ['withdrawal', 'profit', 'stake', 'signup'];
  const type = types[Math.floor(Math.random() * types.length)];

  const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
  const lastInitial =
    lastInitials[Math.floor(Math.random() * lastInitials.length)];
  const username = `${firstName} ${lastInitial}.`;

  const amount =
    type !== 'signup' ? Math.floor(Math.random() * 5000) + 100 : undefined;

  const messages = {
    withdrawal: `just withdrew $${amount?.toLocaleString()}`,
    profit: `earned $${amount?.toLocaleString()} profit`,
    stake: `staked $${amount?.toLocaleString()}`,
    signup: 'just joined Novunt',
  };

  return {
    id: `${Date.now()}-${Math.random()}`,
    type,
    username,
    amount,
    message: messages[type],
    timestamp: Date.now(),
  };
}

export function LiveActivityFeed() {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    // Add initial activity
    setActivities([generateMockActivity()]);

    // Generate new activity every 8-12 seconds
    const interval = setInterval(
      () => {
        const newActivity = generateMockActivity();

        setActivities((prev) => {
          // Keep only last 3 activities
          const updated = [newActivity, ...prev].slice(0, 3);
          return updated;
        });
      },
      Math.random() * 4000 + 8000
    ); // 8-12 seconds

    return () => clearInterval(interval);
  }, []);

  // Get icon based on activity type
  const getIcon = (type: Activity['type']) => {
    switch (type) {
      case 'withdrawal':
        return <DollarSign className="h-4 w-4" />;
      case 'profit':
        return <TrendingUp className="h-4 w-4" />;
      case 'stake':
        return <Target className="h-4 w-4" />;
      case 'signup':
        return <Award className="h-4 w-4" />;
    }
  };

  // Get color based on activity type
  const getColor = (type: Activity['type']) => {
    switch (type) {
      case 'withdrawal':
        return 'text-green-600 bg-green-50 dark:bg-green-900/20';
      case 'profit':
        return 'text-blue-600 bg-blue-50 dark:bg-blue-900/20';
      case 'stake':
        return 'text-purple-600 bg-purple-50 dark:bg-purple-900/20';
      case 'signup':
        return 'text-orange-600 bg-orange-50 dark:bg-orange-900/20';
    }
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-4 left-4 z-40 max-w-sm">
      <AnimatePresence mode="wait">
        {activities.slice(0, 1).map((activity) => (
          <motion.div
            key={activity.id}
            initial={{ opacity: 0, x: -100, scale: 0.8 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: -100, scale: 0.8 }}
            transition={{ duration: 0.3 }}
            className="mb-2"
          >
            <div className="flex items-center gap-3 rounded-lg border border-gray-200 bg-white p-3 pr-4 shadow-lg backdrop-blur-sm dark:border-gray-700 dark:bg-gray-800">
              {/* Icon */}
              <div
                className={`flex h-10 w-10 items-center justify-center rounded-full ${getColor(activity.type)}`}
              >
                {getIcon(activity.type)}
              </div>

              {/* Content */}
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-gray-900 dark:text-gray-100">
                  <span className="font-semibold">{activity.username}</span>
                </p>
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  {activity.message}
                </p>
              </div>

              {/* Close button */}
              <button
                onClick={() => setIsVisible(false)}
                className="text-xs text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                aria-label="Dismiss"
              >
                ✕
              </button>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
