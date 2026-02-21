'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { TrendingUp } from 'lucide-react';
import { useProfitHistory } from '@/lib/queries';
import { LoadingStates } from '@/components/ui/loading-states';
import { EmptyStates } from '@/components/EmptyStates';
import { pct4 } from '@/utils/formatters';

type TimeRange = '7D' | '30D' | '100D';

const timeRanges: TimeRange[] = ['7D', '30D', '100D'];

// Chart dimensions
const CHART_HEIGHT = 140;
const CHART_PADDING = { top: 8, right: 8, bottom: 24, left: 8 };
const POINT_R = 4;

/**
 * Daily ROS Performance Card
 * Line chart with area fill (smooth line + gradient under line).
 * Styled to match dashboard cards; placed under Recent Activity.
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

  const chartData = useMemo(() => {
    if (!profitHistory?.profits) return [];

    const sorted = [...profitHistory.profits]
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
        ...d,
        rosPercentage: Number(d.rosPercentage) || 0,
      }));

    return sorted;
  }, [profitHistory, limit]);

  const maxPercentage = useMemo(() => {
    if (chartData.length === 0) return 1;
    const valid = chartData
      .map((d) => d.rosPercentage)
      .filter((p) => !isNaN(p) && isFinite(p) && p >= 0);
    if (valid.length === 0) return 1;
    return Math.max(...valid) * 1.1 || 1;
  }, [chartData]);

  const averagePercentage = useMemo(() => {
    if (chartData.length === 0) return 0;
    const valid = chartData
      .map((d) => d.rosPercentage)
      .filter((p) => !isNaN(p) && isFinite(p) && p >= 0);
    if (valid.length === 0) return 0;
    return valid.reduce((a, p) => a + p, 0) / valid.length;
  }, [chartData]);

  // SVG path data: line and area (for fill)
  const { linePath, areaPath, points, xAxisLabels } = useMemo(() => {
    if (chartData.length === 0) {
      return {
        linePath: '',
        areaPath: '',
        points: [] as { x: number; y: number }[],
        xAxisLabels: [] as string[],
      };
    }

    const w = 100; // percentage-based so it scales
    const innerHeight = CHART_HEIGHT - CHART_PADDING.top - CHART_PADDING.bottom;
    const n = chartData.length;
    const stepX =
      n > 1 ? (w - CHART_PADDING.left - CHART_PADDING.right) / (n - 1) : 0;
    const baseX = CHART_PADDING.left;

    const pts = chartData.map((d, i) => {
      const x = baseX + (n > 1 ? i * stepX : stepX * 0.5);
      const pct = maxPercentage > 0 ? d.rosPercentage / maxPercentage : 0;
      const y = CHART_PADDING.top + innerHeight * (1 - pct);
      return { x, y, percentage: d.rosPercentage, date: d.date };
    });

    const linePathD = pts
      .map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`)
      .join(' ');
    const areaPathD =
      linePathD +
      ` L ${pts[pts.length - 1].x} ${CHART_HEIGHT - CHART_PADDING.bottom} L ${pts[0].x} ${CHART_HEIGHT - CHART_PADDING.bottom} Z`;

    const labels = chartData.map((d, i) => {
      const date = new Date(d.date);
      if (selectedRange === '7D') {
        return date
          .toLocaleDateString('en-US', { weekday: 'short' })
          .toUpperCase();
      }
      if (selectedRange === '30D') {
        return i % 5 === 0
          ? date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
          : '';
      }
      return i % 15 === 0
        ? date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
        : '';
    });

    return {
      linePath: linePathD,
      areaPath: areaPathD,
      points: pts.map((p) => ({ x: p.x, y: p.y })),
      xAxisLabels: labels,
    };
  }, [chartData, maxPercentage, selectedRange]);

  const rangeLabel =
    selectedRange === '7D'
      ? 'Last 7 days'
      : selectedRange === '30D'
        ? 'Last 30 days'
        : 'Last 100 days';

  return (
    <div className="lg:max-w-md">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <div
          className="rounded-2xl p-5 transition-all duration-300 sm:p-6 lg:p-5 xl:p-6"
          style={{
            background: '#0D162C',
            boxShadow: `
              inset 8px 8px 16px rgba(0, 0, 0, 0.5),
              inset -8px -8px 16px rgba(255, 255, 255, 0.05),
              inset 2px 2px 4px rgba(0, 0, 0, 0.4),
              inset -2px -2px 4px rgba(255, 255, 255, 0.1),
              0 0 0 1px rgba(255, 255, 255, 0.03)
            `,
          }}
        >
          {/* Header - same typography as other dashboard cards */}
          <div className="mb-1.5 flex items-center gap-2 sm:gap-3">
            <div
              className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg sm:h-8 sm:w-8 lg:h-7 lg:w-7"
              style={{ background: 'rgba(255, 255, 255, 0.05)' }}
            >
              <TrendingUp
                className="h-4 w-4 sm:h-5 sm:w-5 lg:h-4 lg:w-4"
                style={{ color: 'rgba(255, 255, 255, 0.95)', filter: 'none' }}
              />
            </div>
            <div className="min-w-0 flex-1">
              <p
                className="text-xs font-medium sm:text-sm lg:text-xs"
                style={{ color: 'rgba(255, 255, 255, 0.7)', filter: 'none' }}
              >
                Daily ROS Performance
              </p>
              <p
                className="text-[10px] sm:text-xs lg:text-[10px]"
                style={{ color: 'rgba(255, 255, 255, 0.5)', filter: 'none' }}
              >
                {rangeLabel}
              </p>
            </div>
            {/* Time range pills - same style as second image (pill, muted) */}
            <div
              className="flex rounded-lg p-0.5"
              style={{ background: 'rgba(255, 255, 255, 0.05)' }}
            >
              {timeRanges.map((range) => (
                <button
                  key={range}
                  type="button"
                  onClick={() => setSelectedRange(range)}
                  className="rounded-md px-2.5 py-1 text-[10px] font-medium transition-all sm:text-xs"
                  style={{
                    background:
                      selectedRange === range
                        ? 'rgba(0, 155, 242, 0.25)'
                        : 'transparent',
                    color:
                      selectedRange === range
                        ? 'rgba(255, 255, 255, 0.95)'
                        : 'rgba(255, 255, 255, 0.5)',
                    filter: 'none',
                  }}
                >
                  {range}
                </button>
              ))}
            </div>
          </div>

          {/* KPI - avg percentage */}
          <div className="mb-3 flex items-baseline gap-2">
            {isLoading ? (
              <LoadingStates.Text lines={1} className="h-7 w-24" />
            ) : (
              <>
                <span
                  className="text-xl font-black sm:text-2xl md:text-3xl lg:text-xl xl:text-2xl"
                  style={{ color: '#22c55e', filter: 'none' }}
                >
                  {isNaN(averagePercentage) || !isFinite(averagePercentage)
                    ? '0.0000'
                    : pct4(averagePercentage)}
                </span>
                <span
                  className="text-[10px] sm:text-xs lg:text-[10px]"
                  style={{ color: 'rgba(255, 255, 255, 0.5)', filter: 'none' }}
                >
                  avg in {selectedRange}
                </span>
              </>
            )}
          </div>

          {/* Line chart with area fill */}
          <div className="relative h-[180px] w-full">
            {isLoading ? (
              <LoadingStates.Text lines={3} className="h-full w-full" />
            ) : error ? (
              <div className="flex h-full items-center justify-center">
                <EmptyStates.EmptyState
                  title="Failed to load data"
                  description="Unable to fetch ROS performance data."
                />
              </div>
            ) : chartData.length === 0 ? (
              <div className="flex h-full items-center justify-center">
                <EmptyStates.EmptyState
                  title={`No data for ${selectedRange}`}
                  description="ROS data will appear once profits are declared"
                />
              </div>
            ) : (
              <svg
                viewBox={`0 0 100 ${CHART_HEIGHT}`}
                preserveAspectRatio="none"
                className="h-full w-full"
              >
                <defs>
                  <linearGradient
                    id="ros-area-fill"
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                    gradientUnits="objectBoundingBox"
                  >
                    <stop offset="0%" stopColor="#009BF2" stopOpacity="0.35" />
                    <stop offset="100%" stopColor="#009BF2" stopOpacity="0" />
                  </linearGradient>
                </defs>
                {/* Area under line */}
                <motion.path
                  d={areaPath}
                  fill="url(#ros-area-fill)"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.5 }}
                />
                {/* Line */}
                <motion.path
                  d={linePath}
                  fill="none"
                  stroke="#009BF2"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ duration: 0.6, ease: 'easeInOut' }}
                />
                {/* Data points */}
                <AnimatePresence>
                  {points.map((pt, i) => (
                    <g key={i}>
                      <motion.circle
                        cx={pt.x}
                        cy={pt.y}
                        r={POINT_R}
                        fill="#009BF2"
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.3 + i * 0.05 }}
                        onMouseEnter={() => setHoveredIndex(i)}
                        onMouseLeave={() => setHoveredIndex(null)}
                        style={{ cursor: 'pointer' }}
                      />
                      {hoveredIndex === i && chartData[i] && (
                        <motion.g
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                        >
                          <text
                            x={pt.x}
                            y={pt.y - 10}
                            textAnchor="middle"
                            fill="rgba(255,255,255,0.95)"
                            fontSize="10"
                            fontWeight="600"
                          >
                            {pct4(chartData[i].rosPercentage)}
                          </text>
                        </motion.g>
                      )}
                    </g>
                  ))}
                </AnimatePresence>
              </svg>
            )}

            {/* X-axis labels - aligned with data points */}
            {chartData.length > 0 && !isLoading && !error && (
              <div
                className="absolute right-0 bottom-0 left-0 flex text-[10px] font-medium sm:text-xs"
                style={{ color: 'rgba(255, 255, 255, 0.5)' }}
              >
                {xAxisLabels.map((label, i) => (
                  <span
                    key={i}
                    className="flex-1 truncate text-center"
                    style={{ minWidth: 0 }}
                  >
                    {label}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
}
