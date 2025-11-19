'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, Calendar } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

type TimeRange = '4W' | '8W' | '12W' | '1Y';

const timeRanges: TimeRange[] = ['4W', '8W', '12W', '1Y'];

// Mock weekly ROS percentage data - in production, this would come from your staking API
const mockWeeklyROSData: Record<TimeRange, { ros: number; week: string; date: string }[]> = {
  '4W': [
    { ros: 2.5, week: 'Week 1', date: 'Nov 1' },
    { ros: 3.2, week: 'Week 2', date: 'Nov 8' },
    { ros: 2.8, week: 'Week 3', date: 'Nov 15' },
    { ros: 3.5, week: 'Week 4', date: 'Nov 22' },
  ],
  '8W': [
    { ros: 2.1, week: 'Week 1', date: 'Oct 4' },
    { ros: 2.8, week: 'Week 2', date: 'Oct 11' },
    { ros: 3.2, week: 'Week 3', date: 'Oct 18' },
    { ros: 2.5, week: 'Week 4', date: 'Oct 25' },
    { ros: 2.5, week: 'Week 5', date: 'Nov 1' },
    { ros: 3.2, week: 'Week 6', date: 'Nov 8' },
    { ros: 2.8, week: 'Week 7', date: 'Nov 15' },
    { ros: 3.5, week: 'Week 8', date: 'Nov 22' },
  ],
  '12W': [
    { ros: 1.8, week: 'Week 1', date: 'Sep 6' },
    { ros: 2.2, week: 'Week 2', date: 'Sep 13' },
    { ros: 2.5, week: 'Week 3', date: 'Sep 20' },
    { ros: 2.9, week: 'Week 4', date: 'Sep 27' },
    { ros: 2.1, week: 'Week 5', date: 'Oct 4' },
    { ros: 2.8, week: 'Week 6', date: 'Oct 11' },
    { ros: 3.2, week: 'Week 7', date: 'Oct 18' },
    { ros: 2.5, week: 'Week 8', date: 'Oct 25' },
    { ros: 2.5, week: 'Week 9', date: 'Nov 1' },
    { ros: 3.2, week: 'Week 10', date: 'Nov 8' },
    { ros: 2.8, week: 'Week 11', date: 'Nov 15' },
    { ros: 3.5, week: 'Week 12', date: 'Nov 22' },
  ],
  '1Y': [
    { ros: 1.5, week: 'Jan', date: 'Jan' },
    { ros: 1.8, week: 'Feb', date: 'Feb' },
    { ros: 2.2, week: 'Mar', date: 'Mar' },
    { ros: 2.5, week: 'Apr', date: 'Apr' },
    { ros: 2.3, week: 'May', date: 'May' },
    { ros: 2.8, week: 'Jun', date: 'Jun' },
    { ros: 3.0, week: 'Jul', date: 'Jul' },
    { ros: 2.7, week: 'Aug', date: 'Aug' },
    { ros: 2.4, week: 'Sep', date: 'Sep' },
    { ros: 2.6, week: 'Oct', date: 'Oct' },
    { ros: 3.0, week: 'Nov', date: 'Nov' },
    { ros: 3.2, week: 'Dec', date: 'Dec' },
  ],
};

/**
 * PortfolioChart Component
 * Interactive chart showing weekly ROS percentages over time
 */
export function PortfolioChart() {
  const [selectedRange, setSelectedRange] = useState<TimeRange>('4W');
  const [hoveredWeek, setHoveredWeek] = useState<number | null>(null);
  const data = mockWeeklyROSData[selectedRange];

  // Calculate stats
  const currentROS = data[data.length - 1].ros;
  const previousROS = data[0].ros;
  const change = currentROS - previousROS;
  const changePercent = previousROS !== 0 ? ((change / previousROS) * 100).toFixed(2) : '0.00';
  const isPositive = change >= 0;
  const averageROS = (data.reduce((sum, d) => sum + d.ros, 0) / data.length).toFixed(2);

  // Calculate chart dimensions with better scaling for visibility
  const maxROS = Math.max(...data.map((d) => d.ros));
  const minROS = Math.min(...data.map((d) => d.ros));
  const rosRange = maxROS - minROS || 1;
  
  // Use a baseline slightly below min to show variations better
  const chartBaseline = Math.max(0, minROS - (rosRange * 0.3));
  const chartScale = maxROS - chartBaseline;

  // Generate bar chart data
  const chartWidth = 100; // percentage
  const chartHeight = 200; // pixels
  const barWidth = chartWidth / data.length;
  const barSpacing = barWidth * 0.2;
  const actualBarWidth = barWidth - barSpacing;

  return (
    <Card className="relative overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300 border-0 bg-card/50 backdrop-blur-sm">
      {/* Gradient Background */}
      <div className={`absolute inset-0 bg-gradient-to-br ${
        isPositive ? 'from-green-500/10 via-green-500/5' : 'from-red-500/10 via-red-500/5'
      } to-transparent`} />
      
      <CardHeader className="relative z-10">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className={`p-3 rounded-xl ${
              isPositive ? 'bg-green-500/10' : 'bg-red-500/10'
            }`}>
              <TrendingUp className={`h-6 w-6 ${
                isPositive ? 'text-green-500' : 'text-red-500'
              }`} />
            </div>
            <div>
              <CardTitle className="text-xl font-bold">Weekly ROS Performance</CardTitle>
              <CardDescription>
                Track your weekly Return on Stake percentages
              </CardDescription>
            </div>
          </div>

          {/* Time range selector */}
          <div className="flex gap-1 bg-muted/50 p-1 rounded-xl border-0">
            {timeRanges.map((range) => (
              <Button
                key={range}
                variant={selectedRange === range ? 'default' : 'ghost'}
                size="sm"
                className="h-8 px-3 text-xs font-semibold"
                onClick={() => setSelectedRange(range)}
              >
                {range}
              </Button>
            ))}
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
          <div className="bg-muted/30 rounded-xl p-4">
            <p className="text-xs text-muted-foreground mb-1">Current Week</p>
            <p className="text-2xl font-bold text-green-600 dark:text-green-400">
              {currentROS.toFixed(2)}%
            </p>
          </div>
          <div className="bg-muted/30 rounded-xl p-4">
            <p className="text-xs text-muted-foreground mb-1">Average ROS</p>
            <p className="text-2xl font-bold">
              {averageROS}%
            </p>
          </div>
          <div className="bg-muted/30 rounded-xl p-4">
            <p className="text-xs text-muted-foreground mb-1">Change</p>
            <div className="flex items-center gap-2">
              <p className={`text-2xl font-bold ${isPositive ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                {isPositive ? '+' : ''}{change.toFixed(2)}%
              </p>
              <Badge
                variant={isPositive ? 'default' : 'destructive'}
                className="text-xs"
              >
                {isPositive ? (
                  <TrendingUp className="h-3 w-3 mr-1" />
                ) : (
                  <TrendingDown className="h-3 w-3 mr-1" />
                )}
                {changePercent}%
              </Badge>
            </div>
          </div>
          <div className="bg-muted/30 rounded-xl p-4">
            <p className="text-xs text-muted-foreground mb-1">Period</p>
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <p className="text-lg font-semibold">
                {data.length} {selectedRange === '1Y' ? 'months' : 'weeks'}
              </p>
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="relative z-10">
        {/* Chart */}
        <div className="relative h-64 mt-4">
          <div className="absolute inset-0 flex items-end justify-between gap-1 px-2">
            {data.map((weekData, index) => {
              // Calculate bar height with better scaling for visibility
              const barHeight = ((weekData.ros - chartBaseline) / chartScale) * 100;
              const isHovered = hoveredWeek === index;
              const isCurrent = index === data.length - 1;
              
              return (
                <div key={index} className="flex-1 flex flex-col items-center gap-2">
                  {/* Bar */}
                  <motion.div
                    initial={{ scaleY: 0 }}
                    animate={{ scaleY: 1 }}
                    transition={{ duration: 0.5, delay: index * 0.05 }}
                    onHoverStart={() => setHoveredWeek(index)}
                    onHoverEnd={() => setHoveredWeek(null)}
                    className={`
                      relative w-full rounded-t-lg cursor-pointer transition-all duration-200
                      ${isCurrent 
                        ? 'bg-gradient-to-t from-green-500 to-green-400' 
                        : 'bg-gradient-to-t from-blue-500/70 to-blue-400/70 hover:from-blue-500 hover:to-blue-400'
                      }
                      ${isHovered ? 'opacity-100 scale-105' : 'opacity-90'}
                    `}
                    style={{ 
                      height: `${barHeight}%`,
                      transformOrigin: 'bottom'
                    }}
                  >
                    {/* Tooltip on hover */}
                    {isHovered && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="absolute -top-16 left-1/2 -translate-x-1/2 bg-popover text-popover-foreground px-3 py-2 rounded-lg shadow-lg border z-10 whitespace-nowrap"
                      >
                        <p className="text-xs font-semibold">{weekData.week}</p>
                        <p className="text-lg font-bold text-green-600 dark:text-green-400">{weekData.ros.toFixed(2)}%</p>
                        <p className="text-xs text-muted-foreground">{weekData.date}</p>
                      </motion.div>
                    )}
                    
                    {/* Current week indicator */}
                    {isCurrent && (
                      <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-green-500 rounded-full ring-2 ring-background" />
                    )}
                  </motion.div>
                  
                  {/* Week label */}
                  <p className={`text-xs font-medium text-center truncate w-full ${
                    isCurrent ? 'text-green-600 dark:text-green-400 font-bold' : 'text-muted-foreground'
                  }`}>
                    {data.length > 12 ? weekData.week.split(' ')[1] || weekData.week : weekData.week.replace('Week ', 'W')}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Legend */}
        <div className="flex items-center justify-center gap-6 mt-6 pt-4 border-t">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-gradient-to-t from-blue-500/70 to-blue-400/70" />
            <span className="text-sm text-muted-foreground">Previous Weeks</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-gradient-to-t from-green-500 to-green-400" />
            <span className="text-sm font-semibold">Current Week</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
