'use client';

import React, { useMemo, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useRosCalendarData } from '@/lib/queries';
import {
  formatRosPercentCompact,
  roundRosPercentStable,
} from '@/utils/formatters';

/* Platform colors – theme tokens (--neu-*) for dashboard light/dark */
const ACCENT = 'var(--neu-accent)';
const SHADOW_RAISED = 'var(--neu-shadow-raised)';
const SHADOW_INSET = 'var(--neu-shadow-inset)';
const SHADOW_BUTTON =
  '4px 4px 8px var(--neu-shadow-dark), -2px -2px 6px var(--neu-shadow-light)';
const MIN_ROS = 0.1;
const MAX_ROS = 2.2;
const DAYS_LOOKBACK = 190;

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

/** Seeded random for stable mock data */
function seededRandom(seed: number): number {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
}

/** Generate daily ROS for a date range: 0.1% - 2.2%, one decimal. Keys are YYYY-MM-DD (calendar date) to match backend. */
function generateMockRosByDate(start: Date, end: Date): Record<string, number> {
  const out: Record<string, number> = {};
  const d = new Date(start);
  while (d <= end) {
    const y = d.getFullYear(),
      m = d.getMonth(),
      day = d.getDate();
    const key = `${y}-${String(m + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    const seed = d.getTime() * 0.001;
    const raw = seededRandom(seed);
    const value = MIN_ROS + raw * (MAX_ROS - MIN_ROS);
    out[key] = Number(value.toFixed(1));
    d.setDate(d.getDate() + 1);
  }
  return out;
}

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
  const monthlyAccumulated = count > 0 ? sum : 0;
  return { days, monthlyAccumulated };
}

const CARD_STYLE = {
  background: 'rgba(0, 155, 242, 0.07)',
  backdropFilter: 'blur(16px)',
  WebkitBackdropFilter: 'blur(16px)',
  boxShadow: '0 4px 24px 0 rgba(0, 155, 242, 0.10), ' + SHADOW_RAISED,
  border: '1px solid rgba(0, 155, 242, 0.18)',
} as const;

/** Format date as YYYY-MM-DD (calendar date, no UTC shift) */
function toDateKey(date: Date): string {
  const y = date.getFullYear();
  const m = date.getMonth();
  const d = date.getDate();
  return `${y}-${String(m + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
}

export function RosCalendarCard() {
  const today = useMemo(() => new Date(), []);
  const todayKey = useMemo(() => toDateKey(today), [today]);
  const dataEnd = useMemo(() => new Date(), []);
  const dataStart = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() - DAYS_LOOKBACK);
    return d;
  }, []);
  const yesterdayEnd = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() - 1);
    return d;
  }, []);
  const [viewDate, setViewDate] = useState(() => new Date());

  const { year, month } = useMemo(() => {
    const y = viewDate.getFullYear();
    const m = viewDate.getMonth();
    return { year: y, month: m };
  }, [viewDate]);

  const { data: backendData, isLoading } = useRosCalendarData(year, month);
  const backendToday = backendData?.today; // YYYY-MM-DD from backend (platform day)
  const mockRos = useMemo(
    () => generateMockRosByDate(dataStart, yesterdayEnd),
    [dataStart, yesterdayEnd]
  );

  /** Today and future: backend only. Past (yesterday back 190 days): backend if > 0, else mock 0.1–2.2%. */
  const getRosForDate = useMemo(
    () => (date: Date) => {
      const key = toDateKey(date);
      const calendar = backendData?.calendar;
      // API may return numeric strings; calendar type is Record<string, number> but runtime can vary
      const rawCell = calendar?.[key] as number | string | undefined;
      let backendParsed: number | null = null;
      if (typeof rawCell === 'number' && Number.isFinite(rawCell)) {
        backendParsed = rawCell;
      } else if (typeof rawCell === 'string') {
        const n = Number(rawCell.trim());
        backendParsed = Number.isFinite(n) ? n : null;
      }
      const stable = (v: number | null): number | null =>
        v == null ? null : roundRosPercentStable(v);

      if (key >= todayKey) {
        return stable(backendParsed);
      }
      if (backendParsed != null && backendParsed > 0)
        return stable(backendParsed);
      const mockVal = mockRos[key];
      return mockVal != null ? stable(mockVal) : null;
    },
    [backendData?.calendar, mockRos, todayKey]
  );

  const monthLabel = useMemo(
    () =>
      viewDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
    [viewDate]
  );

  const { days, monthlyAccumulated } = useMemo(
    () => getMonthData(year, month, getRosForDate),
    [year, month, getRosForDate]
  );

  const canGoPrev = useMemo(() => {
    const min = new Date(dataStart.getFullYear(), dataStart.getMonth(), 1);
    const viewFirst = new Date(viewDate.getFullYear(), viewDate.getMonth(), 1);
    return viewFirst.getTime() > min.getTime();
  }, [viewDate, dataStart]);

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
      <div className="mb-4 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <h3
            className="text-sm font-semibold sm:text-base"
            style={{ color: 'var(--neu-text-primary)' }}
          >
            Month to Date
          </h3>
          <span
            className="rounded-lg px-2 py-0.5 text-sm font-black sm:text-base"
            style={{ color: ACCENT }}
          >
            {formatRosPercentCompact(monthlyAccumulated, 1)}%
          </span>
          {isLoading && (
            <span
              className="inline-block h-1.5 w-1.5 animate-pulse rounded-full"
              style={{ background: ACCENT }}
              aria-hidden
            />
          )}
        </div>
        <div className="ros-calendar-month-nav flex items-center gap-1">
          <button
            type="button"
            onClick={goPrev}
            disabled={!canGoPrev}
            className="flex h-8 w-8 items-center justify-center rounded-xl transition-all disabled:opacity-40"
            style={{
              background: 'var(--neu-bg)',
              boxShadow: SHADOW_BUTTON,
              border: '1px solid var(--neu-border)',
              color: 'var(--neu-accent)',
            }}
            aria-label="Previous month"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <span
            className="min-w-[90px] px-1 text-center text-xs font-medium sm:text-sm"
            style={{ color: 'var(--neu-text-primary)' }}
          >
            {monthLabel}
          </span>
          <button
            type="button"
            onClick={goNext}
            disabled={!canGoNext}
            className="flex h-8 w-8 items-center justify-center rounded-xl transition-all disabled:opacity-40"
            style={{
              background: 'var(--neu-bg)',
              boxShadow: SHADOW_BUTTON,
              border: '1px solid var(--neu-border)',
              color: 'var(--neu-accent)',
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
            style={{ color: 'var(--neu-text-muted)' }}
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
          const isPast = !isToday && date < today;
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
                background: isToday
                  ? '#f59e0b'
                  : isPast
                    ? '#009BF2'
                    : 'var(--neu-bg)',
                boxShadow: isToday || isPast ? 'none' : SHADOW_BUTTON,
                border: isPast
                  ? '1px solid #009BF2'
                  : isToday
                    ? '1px solid #f59e0b'
                    : '1px solid var(--neu-border)',
              }}
            >
              <span
                className="text-[10px] font-semibold sm:text-xs"
                style={{
                  color: isToday
                    ? 'var(--neu-accent-foreground)'
                    : isPast
                      ? '#ffffff'
                      : 'var(--neu-text-primary)',
                }}
              >
                {dayNum}
              </span>
              {ros != null && (
                <>
                  <span
                    className="text-[9px] font-medium sm:text-[10px]"
                    style={{
                      color:
                        isToday || isPast
                          ? 'rgba(255,255,255,0.85)'
                          : 'var(--neu-text-muted)',
                    }}
                  >
                    {formatRosPercentCompact(ros)}%
                  </span>
                  <div
                    className="mt-0.5 h-1 w-full overflow-hidden rounded-full"
                    style={{
                      background: isToday
                        ? 'rgba(13, 22, 44, 0.2)'
                        : isPast
                          ? 'rgba(255,255,255,0.25)'
                          : 'rgba(0, 155, 242, 0.15)',
                    }}
                  >
                    <div
                      className="h-full rounded-full"
                      style={{
                        width: `${isToday || isPast ? Math.max(8, barHeight * 100) : barHeight * 100}%`,
                        background:
                          isToday || isPast ? '#ffffff' : 'var(--neu-accent)',
                      }}
                    />
                  </div>
                </>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
