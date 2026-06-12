"use client";

import { useMemo, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

const WEEKDAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"] as const;

export function DateTimePicker({
  date,
  startTime,
  onDateChange,
  onTimeChange,
  timeSlots,
}: {
  date: string;
  startTime: string;
  onDateChange: (d: string) => void;
  onTimeChange: (t: string) => void;
  timeSlots: string[];
}) {
  const bounds = useMemo(() => getBookingBounds(), []);
  const parsedSelected = parseIsoDate(date);

  const [viewYear, setViewYear] = useState(
    () => parsedSelected?.getFullYear() ?? bounds.min.getFullYear()
  );
  const [viewMonth, setViewMonth] = useState(
    () => parsedSelected?.getMonth() ?? bounds.min.getMonth()
  );

  const monthLabel = new Date(viewYear, viewMonth, 1).toLocaleDateString(
    "en-GB",
    { month: "long", year: "numeric" }
  );

  const weeks = useMemo(
    () => buildMonthWeeks(viewYear, viewMonth),
    [viewYear, viewMonth]
  );

  const canPrevMonth =
    new Date(viewYear, viewMonth, 1) > startOfMonth(bounds.min);
  const canNextMonth =
    new Date(viewYear, viewMonth + 1, 0) < endOfMonth(bounds.max);

  const goPrevMonth = () => {
    if (!canPrevMonth) return;
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear((y) => y - 1);
    } else {
      setViewMonth((m) => m - 1);
    }
  };

  const goNextMonth = () => {
    if (!canNextMonth) return;
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear((y) => y + 1);
    } else {
      setViewMonth((m) => m + 1);
    }
  };

  return (
    <div className="space-y-6">
      {/* Calendar */}
      <div className="rounded-2xl border border-blush-200 bg-white p-3 shadow-soft sm:p-4">
        <div className="flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={goPrevMonth}
            disabled={!canPrevMonth}
            aria-label="Previous month"
            className="grid h-11 w-11 shrink-0 place-items-center rounded-full border border-blush-200 text-charcoal transition-colors hover:border-primary-200 hover:bg-blush-50 disabled:pointer-events-none disabled:opacity-30"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <p className="font-display text-lg text-charcoal sm:text-xl">
            {monthLabel}
          </p>
          <button
            type="button"
            onClick={goNextMonth}
            disabled={!canNextMonth}
            aria-label="Next month"
            className="grid h-11 w-11 shrink-0 place-items-center rounded-full border border-blush-200 text-charcoal transition-colors hover:border-primary-200 hover:bg-blush-50 disabled:pointer-events-none disabled:opacity-30"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>

        <div className="mt-4 grid grid-cols-7 gap-1 sm:gap-1.5">
          {WEEKDAYS.map((d) => (
            <div
              key={d}
              className="py-1 text-center text-[10px] font-semibold uppercase tracking-[0.14em] text-charcoal-light sm:text-[11px]"
            >
              {d}
            </div>
          ))}

          {weeks.flat().map((cell, i) => {
            if (!cell) {
              return <div key={`empty-${i}`} className="aspect-square" aria-hidden />;
            }

            const iso = toIsoDate(cell);
            const inMonth = cell.getMonth() === viewMonth;
            const selectable = isSelectable(cell, bounds);
            const selected = iso === date;
            const isToday = iso === toIsoDate(new Date());

            return (
              <button
                key={iso}
                type="button"
                disabled={!selectable}
                onClick={() => {
                  onDateChange(iso);
                  setViewYear(cell.getFullYear());
                  setViewMonth(cell.getMonth());
                }}
                className={cn(
                  "relative flex aspect-square min-h-[44px] w-full flex-col items-center justify-center rounded-xl text-sm font-medium transition-all sm:rounded-2xl sm:text-base",
                  !inMonth && "text-charcoal-light/40",
                  inMonth && !selectable && "cursor-not-allowed text-charcoal-light/35",
                  inMonth &&
                    selectable &&
                    !selected &&
                    "text-charcoal hover:bg-blush-50 hover:ring-1 hover:ring-primary-200",
                  selected &&
                    "bg-primary-600 text-white shadow-soft ring-2 ring-primary-400 ring-offset-1",
                  isToday && !selected && selectable && "ring-1 ring-primary-300"
                )}
              >
                <span className="font-display text-base leading-none sm:text-lg">
                  {cell.getDate()}
                </span>
              </button>
            );
          })}
        </div>

        <p className="mt-3 text-center text-[11px] text-charcoal-light">
          Tap a date from tomorrow onwards · boutique closed Sundays
        </p>
      </div>

      {/* Selected date chip (mobile-friendly summary) */}
      {date ? (
        <p className="rounded-2xl bg-blush-50/80 px-4 py-3 text-center text-sm text-charcoal">
          <span className="font-medium">
            {formatSelectedDate(date)}
          </span>
          {startTime ? (
            <span className="text-charcoal-light"> · {startTime}</span>
          ) : null}
        </p>
      ) : null}

      {/* Time slots */}
      <div>
        <p className="text-xs font-medium uppercase tracking-[0.18em] text-charcoal-light">
          Choose a time
        </p>
        <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
          {timeSlots.map((t) => {
            const selected = t === startTime;
            return (
              <button
                key={t}
                type="button"
                onClick={() => onTimeChange(t)}
                className={cn(
                  "min-h-[44px] rounded-2xl border px-3 py-3 text-sm font-medium transition-all sm:rounded-full",
                  selected
                    ? "border-primary-600 bg-primary-600 text-white shadow-soft"
                    : "border-blush-200 bg-white text-charcoal hover:border-primary-200 active:scale-[0.98]"
                )}
              >
                {t}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function getBookingBounds() {
  const min = new Date();
  min.setDate(min.getDate() + 1);
  min.setHours(0, 0, 0, 0);

  const max = new Date(min);
  max.setDate(max.getDate() + 59);

  return { min, max };
}

function buildMonthWeeks(year: number, month: number): (Date | null)[][] {
  const first = new Date(year, month, 1);
  const last = new Date(year, month + 1, 0);

  // Monday-based week (en-GB): Mon=0 … Sun=6
  let startPad = first.getDay() - 1;
  if (startPad < 0) startPad = 6;

  const cells: (Date | null)[] = [];
  for (let i = 0; i < startPad; i++) cells.push(null);

  for (let d = 1; d <= last.getDate(); d++) {
    cells.push(new Date(year, month, d));
  }

  while (cells.length % 7 !== 0) cells.push(null);

  const weeks: (Date | null)[][] = [];
  for (let i = 0; i < cells.length; i += 7) {
    weeks.push(cells.slice(i, i + 7));
  }
  return weeks;
}

function isSelectable(
  d: Date,
  bounds: { min: Date; max: Date }
): boolean {
  const day = d.getDay();
  if (day === 0) return false; // Sundays closed
  const t = d.getTime();
  return t >= bounds.min.getTime() && t <= bounds.max.getTime();
}

function parseIsoDate(iso: string): Date | null {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(iso)) return null;
  return new Date(`${iso}T12:00:00`);
}

function toIsoDate(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function startOfMonth(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), 1);
}

function endOfMonth(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth() + 1, 0);
}

function formatSelectedDate(iso: string): string {
  const d = parseIsoDate(iso);
  if (!d) return iso;
  return d.toLocaleDateString("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });
}
