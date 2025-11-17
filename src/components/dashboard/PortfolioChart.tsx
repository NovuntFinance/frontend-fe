'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

type TimeRange = '7D' | '30D' | '90D' | '1Y';

const timeRanges: TimeRange[] = ['7D', '30D', '90D', '1Y'];

// Mock data - in production, this would come from your API
const mockData: Record<TimeRange, { value: number; date: string }[]> = {
  '7D': [
    { value: 50000, date: 'Mon' },
    { value: 52000, date: 'Tue' },
    { value: 51000, date: 'Wed' },
    { value: 54000, date: 'Thu' },
    { value: 56000, date: 'Fri' },
    { value: 55000, date: 'Sat' },
    { value: 58000, date: 'Sun' },
  ],
  '30D': [
    { value: 45000, date: 'Week 1' },
    { value: 48000, date: 'Week 2' },
    { value: 52000, date: 'Week 3' },
    { value: 58000, date: 'Week 4' },
  ],
  '90D': [
    { value: 35000, date: 'Month 1' },
    { value: 42000, date: 'Month 2' },
    { value: 58000, date: 'Month 3' },
  ],
  '1Y': [
    { value: 20000, date: 'Jan' },
    { value: 25000, date: 'Feb' },
    { value: 28000, date: 'Mar' },
    { value: 32000, date: 'Apr' },
    { value: 35000, date: 'May' },
    { value: 38000, date: 'Jun' },
    { value: 42000, date: 'Jul' },
    { value: 45000, date: 'Aug' },
    { value: 50000, date: 'Sep' },
    { value: 54000, date: 'Oct' },
    { value: 56000, date: 'Nov' },
    { value: 58000, date: 'Dec' },
  ],
};

/**
 * PortfolioChart Component
 * Interactive chart showing portfolio performance over time
 */
export function PortfolioChart() {
  const [selectedRange, setSelectedRange] = useState<TimeRange>('7D');
  const data = mockData[selectedRange];

  // Calculate stats
  const currentValue = data[data.length - 1].value;
  const previousValue = data[0].value;
  const change = currentValue - previousValue;
  const changePercent = ((change / previousValue) * 100).toFixed(2);
  const isPositive = change >= 0;

  // Calculate chart dimensions
  const maxValue = Math.max(...data.map((d) => d.value));
  const minValue = Math.min(...data.map((d) => d.value));
  const valueRange = maxValue - minValue;

  // Generate SVG path for the chart
  const chartWidth = 100; // percentage
  const chartHeight = 200; // pixels
  const pointWidth = chartWidth / (data.length - 1);

  const points = data.map((point, index) => {
    const x = index * pointWidth;
    const y = chartHeight - ((point.value - minValue) / valueRange) * chartHeight;
    return { x, y, value: point.value, date: point.date };
  });

  const pathD = points
    .map((point, index) => {
      if (index === 0) return `M ${point.x} ${point.y}`;
      return `L ${point.x} ${point.y}`;
    })
    .join(' ');

  // Area path (for gradient fill)
  const areaPathD = `${pathD} L ${chartWidth} ${chartHeight} L 0 ${chartHeight} Z`;

  return (
    <Card className="relative overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300 border-0 bg-card/50 backdrop-blur-sm">
      {/* Gradient Background */}
      <div className={`absolute inset-0 bg-gradient-to-br ${
        isPositive ? 'from-green-500/10 via-green-500/5' : 'from-red-500/10 via-red-500/5'
      } to-transparent`} />
      
      <CardHeader className="relative z-10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${
              isPositive ? 'bg-green-500/10' : 'bg-red-500/10'
            }`}>
              <TrendingUp className={`h-5 w-5 ${
                isPositive ? 'text-green-500' : 'text-red-500'
              }`} />
            </div>
            <div>
              <CardTitle>Portfolio Performance</CardTitle>
              <CardDescription className="text-xs">
                Track your stake growth over time
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
                className="h-8 px-3 text-xs"
                onClick={() => setSelectedRange(range)}
              >
                {range}
              </Button>
            ))}
          </div>
        </div>

        {/* Current value and change */}
        <div className="flex items-baseline gap-3 mt-6">
          <span className="text-4xl font-bold">
            ${currentValue.toLocaleString()}
          </span>
          <Badge
            className={isPositive ? 'bg-green-500 hover:bg-green-600' : 'bg-red-500 hover:bg-red-600'}
          >
            {isPositive ? (
              <TrendingUp className="h-3 w-3 mr-1" />
            ) : (
              <TrendingDown className="h-3 w-3 mr-1" />
            )}
            {isPositive ? '+' : ''}
            {changePercent}%
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="relative z-10">
        {/* Chart */}
        <div className="relative" style={{ height: `${chartHeight}px` }}>
          <svg
            className="w-full h-full"
            viewBox={`0 0 ${chartWidth} ${chartHeight}`}
            preserveAspectRatio="none"
          >
            {/* Gradient definition */}
            <defs>
              <linearGradient id="chartGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop
                  offset="0%"
                  stopColor={isPositive ? '#22c55e' : '#ef4444'}
                  stopOpacity="0.3"
                />
                <stop
                  offset="100%"
                  stopColor={isPositive ? '#22c55e' : '#ef4444'}
                  stopOpacity="0"
                />
              </linearGradient>
            </defs>

            {/* Area fill */}
            <motion.path
              d={areaPathD}
              fill="url(#chartGradient)"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
            />

            {/* Line */}
            <motion.path
              d={pathD}
              fill="none"
              stroke={isPositive ? '#22c55e' : '#ef4444'}
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 1, ease: 'easeInOut' }}
            />

            {/* Data points */}
            {points.map((point, index) => (
              <motion.circle
                key={index}
                cx={point.x}
                cy={point.y}
                r="3"
                fill={isPositive ? '#22c55e' : '#ef4444'}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.5 + index * 0.1, duration: 0.3 }}
                className="cursor-pointer hover:r-5 transition-all"
              />
            ))}
          </svg>

          {/* X-axis labels */}
          <div className="flex justify-between mt-4">
            {data.map((point, index) => (
              <span
                key={index}
                className="text-xs text-muted-foreground"
              >
                {point.date}
              </span>
            ))}
          </div>
        </div>

        {/* Chart summary */}
        <div className="grid grid-cols-3 gap-4 mt-6 pt-6 border-t border-border/50">
          <div className="p-3 rounded-xl bg-muted/50">
            <p className="text-xs text-muted-foreground mb-1">Start Value</p>
            <p className="text-lg font-bold">
              ${previousValue.toLocaleString()}
            </p>
          </div>
          <div className={`p-3 rounded-xl ${isPositive ? 'bg-green-500/10' : 'bg-red-500/10'}`}>
            <p className="text-xs text-muted-foreground mb-1">Change</p>
            <p className={`text-lg font-bold ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
              {isPositive ? '+' : ''}${Math.abs(change).toLocaleString()}
            </p>
          </div>
          <div className="p-3 rounded-xl bg-muted/50">
            <p className="text-xs text-muted-foreground mb-1">Current Value</p>
            <p className="text-lg font-bold">
              ${currentValue.toLocaleString()}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
