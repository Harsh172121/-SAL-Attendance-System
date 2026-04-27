/**
 * Time Format Conversion Test Suite
 * Tests the 24-hour to 12-hour format conversion functionality
 */

import { formatTo12Hour, convertFrom12To24, is24HourFormat, is12HourFormat, formatTimeForDisplay } from '../timeFormat';

describe('Time Format Conversion', () => {
  describe('formatTo12Hour', () => {
    it('converts midnight to 12:00 AM', () => {
      expect(formatTo12Hour('00:00')).toBe('12:00 AM');
    });

    it('converts 12:15 AM correctly', () => {
      expect(formatTo12Hour('00:15')).toBe('12:15 AM');
    });

    it('converts morning times correctly', () => {
      expect(formatTo12Hour('09:00')).toBe('9:00 AM');
      expect(formatTo12Hour('01:30')).toBe('1:30 AM');
      expect(formatTo12Hour('11:59')).toBe('11:59 AM');
    });

    it('converts noon correctly', () => {
      expect(formatTo12Hour('12:00')).toBe('12:00 PM');
      expect(formatTo12Hour('12:45')).toBe('12:45 PM');
    });

    it('converts afternoon/evening times correctly', () => {
      expect(formatTo12Hour('13:00')).toBe('1:00 PM');
      expect(formatTo12Hour('14:30')).toBe('2:30 PM');
      expect(formatTo12Hour('23:59')).toBe('11:59 PM');
      expect(formatTo12Hour('18:15')).toBe('6:15 PM');
    });

    it('handles empty strings', () => {
      expect(formatTo12Hour('')).toBe('');
      expect(formatTo12Hour(null)).toBe('');
      expect(formatTo12Hour(undefined)).toBe('');
    });
  });

  describe('convertFrom12To24', () => {
    it('converts 12:00 AM to 00:00', () => {
      expect(convertFrom12To24('12:00 AM')).toBe('00:00');
    });

    it('converts 12:15 AM correctly', () => {
      expect(convertFrom12To24('12:15 AM')).toBe('00:15');
    });

    it('converts AM times correctly', () => {
      expect(convertFrom12To24('9:00 AM')).toBe('09:00');
      expect(convertFrom12To24('01:30 AM')).toBe('01:30');
      expect(convertFrom12To24('11:59 AM')).toBe('11:59');
    });

    it('converts 12:00 PM correctly', () => {
      expect(convertFrom12To24('12:00 PM')).toBe('12:00');
      expect(convertFrom12To24('12:45 PM')).toBe('12:45');
    });

    it('converts PM times correctly', () => {
      expect(convertFrom12To24('1:00 PM')).toBe('13:00');
      expect(convertFrom12To24('2:30 PM')).toBe('14:30');
      expect(convertFrom12To24('11:59 PM')).toBe('23:59');
      expect(convertFrom12To24('6:15 PM')).toBe('18:15');
    });

    it('handles empty strings', () => {
      expect(convertFrom12To24('')).toBe('');
    });
  });

  describe('is24HourFormat', () => {
    it('returns true for 24-hour format times', () => {
      expect(is24HourFormat('14:30')).toBe(true);
      expect(is24HourFormat('09:00')).toBe(true);
      expect(is24HourFormat('23:59')).toBe(true);
    });

    it('returns false for 12-hour format times', () => {
      expect(is12HourFormat('2:30 PM')).toBe(true);
      expect(is12HourFormat('9:00 AM')).toBe(true);
    });

    it('returns false for empty strings', () => {
      expect(is24HourFormat('')).toBe(false);
      expect(is24HourFormat(null)).toBe(false);
    });
  });

  describe('is12HourFormat', () => {
    it('returns true for 12-hour format times', () => {
      expect(is12HourFormat('2:30 PM')).toBe(true);
      expect(is12HourFormat('9:00 AM')).toBe(true);
    });

    it('returns false for 24-hour format times', () => {
      expect(is24HourFormat('14:30')).toBe(true);
    });
  });

  describe('Round-trip conversion', () => {
    it('converts 24-hour to 12-hour and back correctly', () => {
      const time24 = '14:30';
      const time12 = formatTo12Hour(time24);
      const convertedBack = convertFrom12To24(time12);
      expect(convertedBack).toBe(time24);
    });

    it('handles midnight round-trip', () => {
      const time24 = '00:00';
      const time12 = formatTo12Hour(time24);
      const convertedBack = convertFrom12To24(time12);
      expect(convertedBack).toBe(time24);
    });

    it('handles noon round-trip', () => {
      const time24 = '12:00';
      const time12 = formatTo12Hour(time24);
      const convertedBack = convertFrom12To24(time12);
      expect(convertedBack).toBe(time24);
    });
  });
});
