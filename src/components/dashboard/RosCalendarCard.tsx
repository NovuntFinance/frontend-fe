'use client';

import React, { useMemo, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useRosCalendarData } from '@/lib/queries';

/* Platform colors (match Daily ROS, Live Trading Signals, neumorphic) */
const BG = '#0D162C';
const ACCENT = '#009BF2';
const TEXT_PRIMARY = 'rgba(0, 155, 242, 0.95)';
const TEXT_MUTED = 'rgba(0, 155, 242, 0.6)';
const TEXT_WHITE = 'rgba(255, 255, 255, 0.95)';
const BORDER = 'rgba(0, 155, 242, 0.12)';
const TODAY_BG = 'rgba(0, 155, 242, 0.4)'; /* light blue for present day */
const DARK_NAVY = '#0D162C'; /* text on today */
const SHADOW_RAISED =
  '8px 8px 20px rgba(4, 8, 18, 0.7), -8px -8px 20px rgba(25, 40, 72, 0.5)';
const SHADOW_INSET =
  'inset 5px 5px 10px rgba(0, 0, 0, 0.45), inset -5px -5px 10px rgba(255, 255, 255, 0.04)';
const SHADOW_BUTTON =
  '4px 4px 8px rgba(0, 0, 0, 0.4), -2px -2px 6px rgba(255, 255, 255, 0.04)';
const MIN_ROS = 0.1;
const MAX_ROS = 2.2;

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

/** Seeded random for stable mock data */
function seededRandom(seed: number): number {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
}

/** Generate daily ROS for a date range: 0.1% - 2.2%, one decimal */
function generateMockRosByDate(start: Date, end: Date): Record<string, number> {
  const out: Record<string, number> = {};
  const d = new Date(start);
  while (d <= end) {
    const key = d.toISOString().slice(0, 10);
    const seed = d.getTime() * 0.001;
    const raw = seededRandom(seed);
    const value = MIN_ROS + raw * (MAX_ROS - MIN_ROS);
    out[key] = Number(value.toFixed(1));
    d.setDate(d.getDate() + 1);
  }
  return out;
}

/** Start from Aug 25, 2023; end = today */
const DATA_START = new Date(2023, 7, 25);

function getMonthData(
  year: number,
  month: number,
  getRos: (d: Date) => number | null
) {
  const first = new Date(year, month, 1);
  const last = new Date(year, month + 1, 0);
  const startPad = first.getDay();
  const daysInMonth = last.getDate();
  const days: (number | null)[] = [];
  for (let i = 0; i < startPad; i++) days.push(null);
  for (let d = 1; d <= daysInMonth; d++) days.push(d);
  let sum = 0;
  let count = 0;
  for (let d = 1; d <= daysInMonth; d++) {
    const ros = getRos(new Date(year, month, d));
    if (ros != null) {
      sum += ros;
      count++;
    }
  }
  const monthlyAvg = count > 0 ? sum / count : 0;
  return { days, monthlyAvg };
}

const CARD_STYLE = {
  background: BG,
  boxShadow: SHADOW_RAISED,
  border: `1px solid ${BORDER}`,
} as const;

export function RosCalendarCard() {
  const today = useMemo(() => new Date(), []);
  const dataEnd = useMemo(() => new Date(), []);
  const [viewDate, setViewDate] = useState(() => new Date());

  const { year, month } = useMemo(() => {
    const y = viewDate.getFullYear();
    const m = viewDate.getMonth();
    return { year: y, month: m };
  }, [viewDate]);

  const { data: backendData, isLoading } = useRosCalendarData(year, month);
  const backendToday = backendData?.today; // YYYY-MM-DD from backend (platform day)
  const mockRos = useMemo(
    () => generateMockRosByDate(DATA_START, dataEnd),
    [dataEnd]
  );

  const getRosForDate = useMemo(
    () => (date: Date) => {
      const key = date.toISOString().slice(0, 10);
      const calendar = backendData?.calendar;
      if (calendar && typeof calendar[key] === 'number') {
        return calendar[key];
      }
      return mockRos[key] ?? null;
    },
    [backendData?.calendar, mockRos]
  );

  const monthLabel = useMemo(
    () =>
      viewDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
    [viewDate]
  );

  const { days, monthlyAvg } = useMemo(
    () => getMonthData(year, month, getRosForDate),
    [year, month, getRosForDate]
  );

  const canGoPrev = useMemo(() => {
    const min = new Date(DATA_START.getFullYear(), DATA_START.getMonth(), 1);
    const viewFirst = new Date(viewDate.getFullYear(), viewDate.getMonth(), 1);
    return viewFirst.getTime() > min.getTime();
  }, [viewDate]);

  const canGoNext = useMemo(() => {
    const max = new Date(dataEnd.getFullYear(), dataEnd.getMonth(), 1);
    const viewFirst = new Date(viewDate.getFullYear(), viewDate.getMonth(), 1);
    return viewFirst.getTime() < max.getTime();
  }, [viewDate, dataEnd]);

  const goPrev = () => {
    setViewDate((d) => {
      const next = new Date(d);
      next.setMonth(next.getMonth() - 1);
      return next;
    });
  };

  const goNext = () => {
    setViewDate((d) => {
      const next = new Date(d);
      next.setMonth(next.getMonth() + 1);
      return next;
    });
  };

  return (
    <div className="rounded-[24px] p-4 sm:p-5" style={CARD_STYLE}>
      {/* Header: title + month nav */}
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <h3
          className="text-sm font-semibold sm:text-base"
          style={{ color: TEXT_WHITE }}
        >
          ROS Calendar
          {isLoading && (
            <span
              className="ml-2 inline-block h-1.5 w-1.5 animate-pulse rounded-full"
              style={{ background: ACCENT }}
              aria-hidden
            />
          )}
        </h3>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={goPrev}
            disabled={!canGoPrev}
            className="flex h-8 w-8 items-center justify-center rounded-xl transition-all disabled:opacity-40"
            style={{
              background: BG,
              boxShadow: SHADOW_BUTTON,
              border: `1px solid ${BORDER}`,
              color: ACCENT,
            }}
            aria-label="Previous month"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <span
            className="min-w-[120px] px-2 text-center text-sm font-medium"
            style={{ color: TEXT_WHITE }}
          >
            {monthLabel}
          </span>
          <button
            type="button"
            onClick={goNext}
            disabled={!canGoNext}
            className="flex h-8 w-8 items-center justify-center rounded-xl transition-all disabled:opacity-40"
            style={{
              background: BG,
              boxShadow: SHADOW_BUTTON,
              border: `1px solid ${BORDER}`,
              color: ACCENT,
            }}
            aria-label="Next month"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Weekday row */}
      <div className="mb-2 grid grid-cols-7 gap-1">
        {WEEKDAYS.map((day) => (
          <div
            key={day}
            className="text-center text-[10px] font-medium sm:text-xs"
            style={{ color: TEXT_MUTED }}
          >
            {day}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-1.5 sm:gap-2">
        {days.map((dayNum, i) => {
          if (dayNum === null) {
            return <div key={`empty-${i}`} className="aspect-square" />;
          }
          const date = new Date(year, month, dayNum);
          const ros = getRosForDate(date);
          const dateKey = `${year}-${String(month + 1).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
          const isToday =
            backendToday === dateKey ||
            (date.getDate() === today.getDate() &&
              date.getMonth() === today.getMonth() &&
              date.getFullYear() === today.getFullYear());
          // Multi-slot sums can exceed 2.2%; cap bar at 100%
          const barHeight =
            ros != null && ros >= 0
              ? Math.min(1, Math.max(0, (ros - MIN_ROS) / (MAX_ROS - MIN_ROS)))
              : 0;

          return (
            <div
              key={`${year}-${month}-${dayNum}`}
              className="flex aspect-square flex-col items-center justify-center rounded-[12px] p-0.5 transition-all"
              style={{
                background: isToday ? TODAY_BG : BG,
                boxShadow: isToday ? 'none' : SHADOW_BUTTON,
                border: `1px solid ${isToday ? 'rgba(0, 155, 242, 0.5)' : BORDER}`,
              }}
            >
              <span
                className="text-[10px] font-semibold sm:text-xs"
                style={{
                  color: isToday ? DARK_NAVY : TEXT_PRIMARY,
                }}
              >
                {dayNum}
              </span>
              {ros != null && (
                <>
                  <span
                    className="text-[9px] font-medium sm:text-[10px]"
                    style={{ color: isToday ? DARK_NAVY : TEXT_MUTED }}
                  >
                    {ros}%
                  </span>
                  <div
                    className="mt-0.5 h-1 w-full overflow-hidden rounded-full"
                    style={{
                      background: isToday
                        ? 'rgba(13, 22, 44, 0.2)'
                        : 'rgba(0, 155, 242, 0.15)',
                    }}
                  >
                    <div
                      className="h-full rounded-full"
                      style={{
                        width: `${Math.max(8, barHeight * 100)}%`,
                        background: isToday ? DARK_NAVY : ACCENT,
                      }}
                    />
                  </div>
                </>
              )}
            </div>
          );
        })}
      </div>

      {/* Footer: Monthly Average */}
      <div
        className="mt-4 flex items-center justify-between rounded-[16px] px-4 py-3"
        style={{
          background: BG,
          boxShadow: SHADOW_INSET,
          border: `1px solid ${BORDER}`,
        }}
      >
        <span className="text-sm font-medium" style={{ color: TEXT_WHITE }}>
          Monthly Average
        </span>
        <span className="text-lg font-bold" style={{ color: TEXT_WHITE }}>
          {monthlyAvg.toFixed(1)}%
        </span>
      </div>
    </div>
  );
}
