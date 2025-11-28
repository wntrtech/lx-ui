import { describe, expect, it, vi } from 'vitest';
import {
  parseDate,
  formatJSON,
  isDateValid,
  isTimeValid,
  isTimeFullValid,
  isSameDate,
  formatDateJSON,
  formatDate,
  formatDateTime,
  formatFull,
  isLeapYear,
  getMonthNames,
  getWeekdayNames,
  formatLocalizedDate,
  getMonthYearString,
  extractTimeFromDate,
  extractMonthFromDate,
} from '@/utils/dateUtils';

process.env.TZ = 'UTC';

// Mock useLx
vi.mock('@/hooks/useLx', () => ({
  default: () => ({
    getGlobals: () => ({
      dateFormat: 'dd.MM.yyyy.',
      dateTimeFormat: 'dd.MM.yyyy. HH:mm',
      dateTimeFullFormat: 'dd.MM.yyyy. HH:mm:ss',
    }),
  }),
}));

describe('Date Utils', () => {
  describe('parseDate', () => {
    it('returns null for falsy input', () => {
      expect(parseDate(null)).toBeNull();
      expect(parseDate('')).toBeNull();
      expect(parseDate(undefined)).toBeNull();
    });

    it('parses yyyy-MM-dd string (length 10)', () => {
      const d = parseDate('2025-11-24');
      expect(d).toBeInstanceOf(Date);
      expect(d?.getFullYear()).toBe(2025);
      expect(d?.getMonth()).toBe(10);
      expect(d?.getDate()).toBe(24);
    });

    it('parses full ISO strings with parseJSON', () => {
      const d = parseDate('2025-11-24T12:00:00.000Z');
      expect(d?.toISOString()).toBe('2025-11-24T12:00:00.000Z');
    });

    it('returns Date object unchanged', () => {
      const date = new Date();
      expect(parseDate(date)).toBe(date);
    });
  });

  describe('formatJSON', () => {
    it('returns null for falsy input', () => {
      expect(formatJSON(null)).toBeNull();
    });

    it('parses local formats by string length', () => {
      expect(formatJSON('24.11.2025')?.getDate()).toBe(24);
      expect(formatJSON('24.11.2025.')?.getDate()).toBe(24);
      expect(formatJSON('24.11.2025 14:30')?.getHours()).toBe(14);
      expect(formatJSON('24.11.2025. 14:30')?.getHours()).toBe(14);
      expect(formatJSON('24.11.2025 14:30:45')?.getSeconds()).toBe(45);
      expect(formatJSON('24.11.2025. 14:30:45')?.getSeconds()).toBe(45);
    });

    it('returns RFC3339 for Date objects (always in UTC with Z)', () => {
      const date = new Date(2019, 8, 18, 19, 0, 52);
      expect(formatJSON(date)).toBe('2019-09-18T19:00:52Z');
    });
  });

  describe('isDateValid', () => {
    it('returns true for valid dates', () => {
      expect(isDateValid('2025-11-24')).toBe(true);
      expect(isDateValid(new Date())).toBe(true);
    });

    it('returns false for invalid dates', () => {
      expect(isDateValid('invalid')).toBe(false);
      expect(isDateValid('')).toBe(false);
    });
  });

  describe('isTimeValid & isTimeFullValid', () => {
    it('validates HH:mm correctly', () => {
      expect(isTimeValid('12:30')).toBe(true);
      expect(isTimeValid('23:59')).toBe(true);
      expect(isTimeValid('24:00')).toBe(false);
      expect(isTimeValid('12:60')).toBe(false);
      expect(isTimeValid('abc')).toBe(false);
    });

    it('validates HH:mm:ss correctly', () => {
      expect(isTimeFullValid('12:30:45')).toBe(true);
      expect(isTimeFullValid('23:59:59')).toBe(true);
      expect(isTimeFullValid('24:00:00')).toBe(false);
    });
  });

  describe('isSameDate', () => {
    it('returns true when dates are the same day', () => {
      const d1 = new Date('2025-11-24');
      const d2 = new Date('2025-11-24');
      expect(isSameDate(d1, d2)).toBe(true);
    });

    it('returns false for different days', () => {
      const d1 = new Date('2025-11-24');
      const d2 = new Date('2025-11-25');
      expect(isSameDate(d1, d2)).toBe(false);
    });
  });

  describe('formatDateJSON', () => {
    it('returns yyyy-MM-dd string', () => {
      expect(formatDateJSON('24.11.2025.')).toBe('2025-11-24');
      expect(formatDateJSON(new Date('2025-11-24T12:00:00Z'))).toBe('2025-11-24');
    });

    it('returns null for invalid dates', () => {
      expect(formatDateJSON('invalid')).toBeNull();
    });
  });

  describe('formatDate', () => {
    it('formats full ISO string with timezone offset correctly', () => {
      expect(formatDate('2025-11-24T11:09:40.357731+00:00')).toBe('24.11.2025.');
    });

    it('formats full ISO string with Z (UTC) correctly', () => {
      expect(formatDate('2025-11-24T11:09:40Z')).toBe('24.11.2025.');
    });

    it('formats yyyy-MM-dd string correctly', () => {
      expect(formatDate('2025-11-24')).toBe('24.11.2025.');
    });

    it('formats native Date object correctly', () => {
      const date = new Date(2025, 10, 24); // Month is 0-based → November
      expect(formatDate(date)).toBe('24.11.2025.');
    });

    it('returns empty string for null or undefined', () => {
      expect(formatDate(null)).toBe('');
      expect(formatDate(undefined)).toBe('');
      expect(formatDate('')).toBe('');
    });

    it('returns empty string for invalid date strings', () => {
      expect(formatDate('invalid')).toBe('');
      expect(formatDate('2025-13-45')).toBe('');
      expect(formatDate('abc')).toBe('');
    });
  });

  describe('formatDateTime & formatFull', () => {
    it('formats with time using mocked globals', () => {
      expect(formatDateTime('2025-11-24T14:30:00')).toBe('24.11.2025. 14:30');
      expect(formatFull('2025-11-24T14:30:45')).toBe('24.11.2025. 14:30:45');
    });
  });

  describe('isLeapYear', () => {
    it('detects leap years correctly', () => {
      expect(isLeapYear(2024)).toBe(true);
      expect(isLeapYear(2020)).toBe(true);
      expect(isLeapYear(2000)).toBe(true);
      expect(isLeapYear(1900)).toBe(false);
      expect(isLeapYear(2025)).toBe(false);
    });
  });

  describe('getMonthNames', () => {
    it('returns 12 months with correct names', () => {
      const months = getMonthNames('en-US');
      expect(months).toHaveLength(12);
      expect(months[0].fullName).toBe('January');
      expect(months[0].shortName).toBe('Jan');
    });

    it('handles locales with numeric short months (fallback)', () => {
      const months = getMonthNames('lt-LT');
      expect(months[0].shortName).toBe('saus.');
    });
  });

  describe('getWeekdayNames', () => {
    it('returns 7 weekdays starting from Monday when firstDayOfTheWeek = 2', () => {
      const days = getWeekdayNames('en-US', 2);
      expect(days[0].fullName).toBe('Monday');
      expect(days[6].fullName).toBe('Sunday');
    });
  });

  describe('formatLocalizedDate', () => {
    it('returns capitalized localized date', () => {
      const date = new Date(2025, 10, 24);
      const result = formatLocalizedDate('en-US', date);
      expect(result).toBe('Monday, November 24, 2025');
    });
  });

  describe('getMonthYearString', () => {
    it('returns localized month + year', () => {
      expect(getMonthYearString('lv-LV', 10, 2025)).toBe('2025. g. novembris');
      expect(getMonthYearString('en-US', 0, 2025)).toBe('January 2025');
    });
  });

  describe('extractTimeFromDate', () => {
    it('extracts time in locale format', () => {
      const time = extractTimeFromDate('lv-LV', '2025-11-24T14:30:45');
      expect(['14:30']).toContain(time);
      const time2 = extractTimeFromDate('en-US', '2025-11-24T14:30:45');
      expect(['02:30 PM']).toContain(time2);
    });
  });

  describe('extractMonthFromDate', () => {
    it('extracts month name, capitalized by default', () => {
      const month = extractMonthFromDate('lv-LV', '2025-11-24');
      expect(month).toBe('Novembris');

      const lower = extractMonthFromDate('lv-LV', '2025-11-24', false);
      expect(lower).toBe('novembris');
    });
  });
});
