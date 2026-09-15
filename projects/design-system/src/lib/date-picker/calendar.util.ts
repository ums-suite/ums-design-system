/**
 * DSYS-9 shared, framework-free calendar math for `UmsDatePickerComponent`/
 * `UmsDateRangePickerComponent` -- exported as standalone functions (matching
 * reduced-motion.util.ts's/overlay/focus-trap.util.ts's convention) so both components render
 * the exact same month grid from one tested source rather than duplicating date arithmetic, and
 * so it's testable without booting Angular's DI.
 *
 * Dates are represented as local-midnight `Date` objects everywhere internally, and as
 * `YYYY-MM-DD` ISO strings at every component input/output boundary -- deliberately never
 * `Date.prototype.toISOString()` (which is UTC-based and shifts the calendar day for any
 * non-UTC timezone west of Greenwich).
 */

export interface CalendarDay {
  readonly date: Date;
  readonly iso: string;
  readonly dayOfMonth: number;
  readonly inCurrentMonth: boolean;
}

export function toIsoDate(date: Date): string {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, '0');
  const day = `${date.getDate()}`.padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function fromIsoDate(iso: string | null | undefined): Date | null {
  if (!iso) return null;
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso);
  if (!match) return null;
  const [, yearStr, monthStr, dayStr] = match;
  const date = new Date(Number(yearStr), Number(monthStr) - 1, Number(dayStr));
  return Number.isNaN(date.getTime()) ? null : date;
}

export function isSameDay(a: Date | null, b: Date | null): boolean {
  if (!a || !b) return false;
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

/** Date-only comparison (ignores time-of-day, which is always midnight for our own Dates anyway). */
export function compareDays(a: Date, b: Date): number {
  return (
    new Date(a.getFullYear(), a.getMonth(), a.getDate()).getTime() -
    new Date(b.getFullYear(), b.getMonth(), b.getDate()).getTime()
  );
}

export function addMonths(date: Date, delta: number): Date {
  return new Date(date.getFullYear(), date.getMonth() + delta, 1);
}

export function addDays(date: Date, delta: number): Date {
  const next = new Date(date);
  next.setDate(next.getDate() + delta);
  return next;
}

/**
 * A 6x7 grid (always 6 weeks, so the panel's height never changes month to month) covering the
 * given month plus enough leading/trailing days from adjacent months to fill every week,
 * Sunday-first.
 */
export function buildMonthMatrix(year: number, month: number): CalendarDay[][] {
  const firstOfMonth = new Date(year, month, 1);
  const startOffset = firstOfMonth.getDay();
  const gridStart = addDays(firstOfMonth, -startOffset);

  const weeks: CalendarDay[][] = [];
  let cursor = gridStart;
  for (let week = 0; week < 6; week++) {
    const days: CalendarDay[] = [];
    for (let day = 0; day < 7; day++) {
      days.push({
        date: cursor,
        iso: toIsoDate(cursor),
        dayOfMonth: cursor.getDate(),
        inCurrentMonth: cursor.getMonth() === month,
      });
      cursor = addDays(cursor, 1);
    }
    weeks.push(days);
  }
  return weeks;
}

export const WEEKDAY_LABELS: readonly string[] = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

export const MONTH_LABELS: readonly string[] = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];
