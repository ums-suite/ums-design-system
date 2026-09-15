import {
  addDays,
  addMonths,
  buildMonthMatrix,
  compareDays,
  fromIsoDate,
  isSameDay,
  toIsoDate,
} from './calendar.util';

describe('calendar.util', () => {
  describe('toIsoDate / fromIsoDate', () => {
    it('round-trips a local date through an ISO string without a timezone shift', () => {
      const date = new Date(2026, 0, 5); // 5 January 2026, local midnight
      expect(toIsoDate(date)).toBe('2026-01-05');
      expect(isSameDay(fromIsoDate('2026-01-05'), date)).toBeTrue();
    });

    it('zero-pads single-digit months and days', () => {
      expect(toIsoDate(new Date(2026, 8, 2))).toBe('2026-09-02');
    });

    it('returns null for an empty, undefined, or malformed string', () => {
      expect(fromIsoDate(null)).toBeNull();
      expect(fromIsoDate(undefined)).toBeNull();
      expect(fromIsoDate('')).toBeNull();
      expect(fromIsoDate('not-a-date')).toBeNull();
    });
  });

  describe('isSameDay', () => {
    it('is true for the same calendar day and false for a different one', () => {
      expect(isSameDay(new Date(2026, 5, 1), new Date(2026, 5, 1))).toBeTrue();
      expect(isSameDay(new Date(2026, 5, 1), new Date(2026, 5, 2))).toBeFalse();
    });

    it('is false when either argument is null', () => {
      expect(isSameDay(null, new Date())).toBeFalse();
      expect(isSameDay(new Date(), null)).toBeFalse();
    });
  });

  describe('compareDays', () => {
    it('orders earlier days before later ones, ignoring time-of-day', () => {
      const earlier = new Date(2026, 5, 1, 23, 59);
      const later = new Date(2026, 5, 2, 0, 1);
      expect(compareDays(earlier, later)).toBeLessThan(0);
      expect(compareDays(later, earlier)).toBeGreaterThan(0);
      expect(compareDays(earlier, new Date(2026, 5, 1))).toBe(0);
    });
  });

  describe('addMonths / addDays', () => {
    it('adds/subtracts whole months, normalizing to the 1st', () => {
      expect(toIsoDate(addMonths(new Date(2026, 0, 15), 1))).toBe('2026-02-01');
      expect(toIsoDate(addMonths(new Date(2026, 0, 15), -1))).toBe('2025-12-01');
    });

    it('adds/subtracts days across month/year boundaries', () => {
      expect(toIsoDate(addDays(new Date(2026, 11, 31), 1))).toBe('2027-01-01');
      expect(toIsoDate(addDays(new Date(2026, 0, 1), -1))).toBe('2025-12-31');
    });
  });

  describe('buildMonthMatrix', () => {
    it('always returns 6 weeks of 7 days', () => {
      const matrix = buildMonthMatrix(2026, 1); // February 2026
      expect(matrix.length).toBe(6);
      for (const week of matrix) {
        expect(week.length).toBe(7);
      }
    });

    it('marks only days actually within the requested month as inCurrentMonth', () => {
      const matrix = buildMonthMatrix(2026, 1); // February 2026 (28 days, starts on a Sunday)
      const flat = matrix.flat();
      const inMonth = flat.filter((day) => day.inCurrentMonth);
      expect(inMonth.length).toBe(28);
      expect(inMonth[0].iso).toBe('2026-02-01');
      expect(inMonth[inMonth.length - 1].iso).toBe('2026-02-28');
    });

    it('fills leading/trailing days from the adjacent months in consecutive date order', () => {
      const matrix = buildMonthMatrix(2026, 1);
      const flat = matrix.flat();
      for (let i = 1; i < flat.length; i++) {
        expect(toIsoDate(addDays(flat[i - 1].date, 1))).toBe(flat[i].iso);
      }
    });
  });
});
