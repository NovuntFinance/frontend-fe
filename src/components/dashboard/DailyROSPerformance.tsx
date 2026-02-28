'use client';

import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp } from 'lucide-react';
import { useProfitHistory } from '@/lib/queries';
import { EmptyStates } from '@/components/EmptyStates';
import { pct4 } from '@/utils/formatters';

type TimeRange = '7D' | '30D' | '100D';

const timeRanges: TimeRange[] = ['7D', '30D', '100D'];

const MOCK_DAYS = 90; // 3 months
const MAX_ROS_PERCENT = 2.2;

/** Seeded pseudo-random 0..1 for stable mock data */
function seededRandom(seed: number): number {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
}

/** Generate 3 months of mock daily ROS data: random values in (0, 2.2] */
function useMockProfitHistory(): { date: string; rosPercentage: number }[] {
  return useMemo(() => {
    const result: { date: string; rosPercentage: number }[] = [];
    const now = new Date();
    for (let i = MOCK_DAYS - 1; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().slice(0, 10);
      const seed = d.getTime() * 0.001;
      const raw = seededRandom(seed);
      const rosPercentage = Number((raw * MAX_ROS_PERCENT).toFixed(4));
      result.push({ date: dateStr, rosPercentage });
    }
    return result;
  }, []);
}

// Bar chart dimensions
const CHART_HEIGHT = 140;
const ACCENT_BLUE = '#009BF2';
const CHART_PADDING = { top: 8, right: 8, bottom: 28, left: 8 };
const BAR_GAP_RATIO = 0.35; // gap between bars as fraction of bar width
/* Uses theme tokens (--neu-*) for dashboard light/dark */

// Dashboard card style (match Activity Feed / stake card)
const CARD_STYLE = {
  background: 'var(--neu-bg)',
  boxShadow: 'var(--neu-shadow-raised)',
  border: '1px solid var(--neu-border)',
} as const;

/**
 * Daily ROS Performance Card
 * Bar chart; design matches dashboard (#0D162C, neumorphic).
 */
export function DailyROSPerformance() {
  const [selectedRange, setSelectedRange] = useState<TimeRange>('7D');
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  const limit = useMemo(() => {
    switch (selectedRange) {
      case '7D':
        return 7;
      case '30D':
        return 30;
      case '100D':
        return 100;
      default:
        return 7;
    }
  }, [selectedRange]);

  const { data: profitHistory, isLoading, error } = useProfitHistory(limit, 0);
  const mockData = useMockProfitHistory();

  const chartData = useMemo(() => {
    // Prefer API data when available and valid
    const apiProfits = profitHistory?.profits;
    if (apiProfits && Array.isArray(apiProfits) && apiProfits.length > 0) {
      const fromApi = [...apiProfits]
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
        .slice(-limit)
        .filter((d) => {
          const ros = d.rosPercentage;
          return (
            ros !== undefined &&
            ros !== null &&
            !isNaN(ros) &&
            isFinite(ros) &&
            ros >= 0
          );
        })
        .map((d) => ({
          date: d.date,
          rosPercentage: Number(d.rosPercentage) || 0,
        }));
      if (fromApi.length > 0) return fromApi;
    }

    // Fallback: 3 months mock data, random ROS ≤ 2.2%, take last `limit` days
    const take = Math.min(limit, MOCK_DAYS);
    return mockData.slice(-take);
  }, [profitHistory, limit, mockData, selectedRange]);

  const maxPercentage = useMemo(() => {
    if (chartData.length === 0) return 1;
    const valid = chartData
      .map((d) => d.rosPercentage)
      .filter((p) => !isNaN(p) && isFinite(p) && p >= 0);
    if (valid.length === 0) return 1;
    return Math.max(...valid) * 1.1 || 1;
  }, [chartData]);

  // Bar chart layout: bar positions and heights (viewBox 0 0 100 CHART_HEIGHT)
  const { bars } = useMemo(() => {
    if (chartData.length === 0) {
      return {
        bars: [] as {
          x: number;
          width: number;
          height: number;
          y: number;
          pct: number;
          label: string;
        }[],
      };
    }
    const w = 100;
    const innerW = w - CHART_PADDING.left - CHART_PADDING.right;
    const innerH = CHART_HEIGHT - CHART_PADDING.top - CHART_PADDING.bottom;
    const n = chartData.length;
    const gap = (innerW / (n + 1)) * BAR_GAP_RATIO;
    const barWidth = (innerW - (n + 1) * gap) / n;
    const baseX = CHART_PADDING.left + gap;
    const baseY = CHART_HEIGHT - CHART_PADDING.bottom;

    const bars = chartData.map((d, i) => {
      const pct = maxPercentage > 0 ? d.rosPercentage / maxPercentage : 0;
      const height = Math.max(2, innerH * pct);
      const x = baseX + i * (barWidth + gap);
      const y = baseY - height;
      const date = new Date(d.date);
      const label = date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
      });
      return { x, width: barWidth, height, y, pct: d.rosPercentage, label };
    });

    return { bars };
  }, [chartData, maxPercentage, selectedRange]);

  const rangeLabel =
    selectedRange === '7D'
      ? 'Last 7 days'
      : selectedRange === '30D'
        ? 'Last 30 days'
        : 'Last 100 days';

  return (
    <div className="lg:w-full">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <div
          className="rounded-2xl p-5 transition-all duration-300 sm:p-6"
          style={CARD_STYLE}
        >
          {/* Header - match Daily ROS Payout card (icon + title + subtitle) */}
          <div className="mb-4 flex items-center gap-2 sm:gap-3">
            <div
              className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg sm:h-9 sm:w-9"
              style={{ background: 'rgba(0, 155, 242, 0.15)' }}
            >
              <TrendingUp
                className="h-4 w-4 sm:h-5 sm:w-5"
                style={{ color: 'var(--neu-accent)', filter: 'none' }}
              />
            </div>
            <div className="min-w-0 flex-1">
              <p
                className="text-xs font-semibold sm:text-sm"
                style={{ color: 'var(--neu-accent)', filter: 'none' }}
              >
                Daily ROS Performance
              </p>
              <p
                className="text-[10px] sm:text-xs"
                style={{
                  color: 'rgba(0, 155, 242, 0.75)',
                  filter: 'none',
                }}
              >
                {rangeLabel}
              </p>
            </div>
            {/* Time range pills - neumorphic inset */}
            <div
              className="flex rounded-xl p-1"
              style={{
                background: 'rgba(4, 8, 18, 0.5)',
                boxShadow:
                  'inset 3px 3px 8px rgba(4, 8, 18, 0.6), inset -3px -3px 8px rgba(25, 40, 72, 0.3)',
              }}
            >
              {timeRanges.map((range) => (
                <button
                  key={range}
                  type="button"
                  onClick={() => setSelectedRange(range)}
                  className="rounded-lg px-2.5 py-1 text-[10px] font-medium transition-all sm:text-xs"
                  style={{
                    background:
                      selectedRange === range
                        ? 'rgba(0, 155, 242, 0.25)'
                        : 'transparent',
                    color:
                      selectedRange === range
                        ? 'var(--app-text-primary)'
                        : 'var(--app-text-muted)',
                    boxShadow:
                      selectedRange === range
                        ? '2px 2px 6px rgba(0, 0, 0, 0.2)'
                        : 'none',
                  }}
                >
                  {range}
                </button>
              ))}
            </div>
          </div>

          {/* Bar chart - neumorphic chart area (extra bottom for vertical date labels) */}
          <div
            className="relative h-[200px] w-full overflow-hidden rounded-xl"
            style={{
              background: 'rgba(4, 8, 18, 0.4)',
              boxShadow:
                'inset 4px 4px 10px rgba(4, 8, 18, 0.5), inset -4px -4px 10px rgba(25, 40, 72, 0.25)',
            }}
          >
            {chartData.length > 0 ? (
              <svg
                viewBox={`0 0 100 ${CHART_HEIGHT}`}
                preserveAspectRatio="none"
                className="h-full w-full"
              >
                <defs>
                  <linearGradient
                    id="ros-bar-gradient"
                    x1="0"
                    y1="1"
                    x2="0"
                    y2="0"
                    gradientUnits="objectBoundingBox"
                  >
                    <stop
                      offset="0%"
                      stopColor={ACCENT_BLUE}
                      stopOpacity="0.85"
                    />
                    <stop
                      offset="100%"
                      stopColor={ACCENT_BLUE}
                      stopOpacity="1"
                    />
                  </linearGradient>
                </defs>
                {bars.map((bar, i) => (
                  <g key={i}>
                    <motion.rect
                      x={bar.x}
                      y={bar.y}
                      width={bar.width}
                      height={bar.height}
                      rx={4}
                      ry={4}
                      fill="url(#ros-bar-gradient)"
                      style={{
                        filter:
                          'drop-shadow(0 2px 6px rgba(0, 155, 242, 0.35))',
                        cursor: 'pointer',
                      }}
                      initial={{
                        height: 0,
                        y: CHART_HEIGHT - CHART_PADDING.bottom,
                      }}
                      animate={{ height: bar.height, y: bar.y }}
                      transition={{
                        duration: 0.5,
                        delay: i * 0.05,
                        ease: 'easeOut',
                      }}
                      onMouseEnter={() => setHoveredIndex(i)}
                      onMouseLeave={() => setHoveredIndex(null)}
                    />
                    {/* Date label inside bar - vertical, at bottom center */}
                    <text
                      x={bar.x + bar.width / 2}
                      y={bar.y + bar.height - 2}
                      textAnchor="middle"
                      fill="rgba(255,255,255,0.95)"
                      fontSize="7"
                      fontWeight="500"
                      transform={`rotate(-90, ${bar.x + bar.width / 2}, ${bar.y + bar.height - 2})`}
                    >
                      {bar.label}
                    </text>
                    {hoveredIndex === i && (
                      <motion.g
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                      >
                        <text
                          x={bar.x + bar.width / 2}
                          y={bar.y - 6}
                          textAnchor="middle"
                          fill="var(--app-text-primary)"
                          fontSize="9"
                          fontWeight="600"
                        >
                          {pct4(bar.pct)}
                        </text>
                      </motion.g>
                    )}
                  </g>
                ))}
              </svg>
            ) : isLoading ? (
              <div
                className="flex h-full w-full items-center justify-center"
                style={{ color: 'var(--app-text-muted)' }}
              >
                <span className="text-xs font-medium">Loading…</span>
              </div>
            ) : error ? (
              <div className="flex h-full items-center justify-center">
                <EmptyStates.EmptyState
                  title="Failed to load data"
                  description="Unable to fetch ROS performance data."
                />
              </div>
            ) : (
              <div className="flex h-full items-center justify-center">
                <EmptyStates.EmptyState
                  title={`No data for ${selectedRange}`}
                  description="ROS data will appear once profits are declared"
                />
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
}
