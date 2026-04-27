/**
 * Time Format Conversion Utilities
 * Converts between 24-hour (HH:MM) and 12-hour (h:MM AM/PM) formats
 */

/**
 * Convert 24-hour time format to 12-hour format with AM/PM
 * @param {string} time24 - Time in 24-hour format (HH:MM or HH:MM:SS)
 * @returns {string} Time in 12-hour format (h:MM AM/PM)
 * @example
 * formatTo12Hour('14:30') // Returns '2:30 PM'
 * formatTo12Hour('00:15') // Returns '12:15 AM'
 * formatTo12Hour('09:00') // Returns '9:00 AM'
 * formatTo12Hour('12:45') // Returns '12:45 PM'
 */
export const formatTo12Hour = (time24) => {
  if (!time24) return '';

  // Handle various input formats (HH:MM or HH:MM:SS)
  const timeParts = time24.split(':');
  let hours = parseInt(timeParts[0], 10);
  const minutes = timeParts[1];

  // Determine AM/PM
  const period = hours >= 12 ? 'PM' : 'AM';

  // Convert to 12-hour format
  if (hours === 0) {
    hours = 12; // Midnight case: 00:00 becomes 12:00 AM
  } else if (hours > 12) {
    hours = hours - 12; // Afternoon/evening: 13:00 becomes 1:00 PM
  }
  // Hours 1-12 remain the same

  return `${hours}:${minutes} ${period}`;
};

/**
 * Convert 12-hour time format with AM/PM to 24-hour format
 * @param {string} time12 - Time in 12-hour format (h:MM AM/PM or hh:MM AM/PM)
 * @returns {string} Time in 24-hour format (HH:MM)
 * @example
 * convertFrom12To24('2:30 PM') // Returns '14:30'
 * convertFrom12To24('12:15 AM') // Returns '00:15'
 * convertFrom12To24('9:00 AM') // Returns '09:00'
 * convertFrom12To24('12:45 PM') // Returns '12:45'
 */
export const convertFrom12To24 = (time12) => {
  if (!time12) return '';

  // Parse the time and period
  const parts = time12.trim().split(' ');
  const period = parts[parts.length - 1].toUpperCase(); // AM or PM
  const timeParts = parts[0].split(':');
  let hours = parseInt(timeParts[0], 10);
  const minutes = timeParts[1];

  // Convert to 24-hour format
  if (period === 'AM') {
    if (hours === 12) {
      hours = 0; // 12:XX AM becomes 00:XX
    }
  } else if (period === 'PM') {
    if (hours !== 12) {
      hours = hours + 12; // 1-11 PM becomes 13-23
    }
    // 12 PM stays as 12
  }

  // Format with leading zeros
  return `${String(hours).padStart(2, '0')}:${minutes}`;
};

/**
 * Check if a time string is in 24-hour format
 * @param {string} time - Time string to check
 * @returns {boolean} True if time is in 24-hour format
 */
export const is24HourFormat = (time) => {
  if (!time) return false;
  // 24-hour format should not contain AM/PM
  return !/\b(AM|PM|am|pm)\b/.test(time);
};

/**
 * Check if a time string is in 12-hour format
 * @param {string} time - Time string to check
 * @returns {boolean} True if time is in 12-hour format
 */
export const is12HourFormat = (time) => {
  if (!time) return false;
  // 12-hour format should contain AM/PM
  return /\b(AM|PM|am|pm)\b/.test(time);
};

/**
 * Format time for display - ensures consistent 12-hour format
 * Handles both 24-hour and 12-hour inputs
 * @param {string} time - Time in any format
 * @returns {string} Time in 12-hour format (h:MM AM/PM)
 */
export const formatTimeForDisplay = (time) => {
  if (!time) return '';

  if (is24HourFormat(time)) {
    return formatTo12Hour(time);
  }
  return time; // Already in 12-hour format
};

/**
 * Parse time input from HTML time element or string
 * HTML time input returns HH:MM in 24-hour format
 * @param {string} timeInput - Raw time from input element
 * @returns {string} Time in 24-hour format for storage/API
 */
export const parseTimeInput = (timeInput) => {
  if (!timeInput) return '';
  // HTML time input is always in 24-hour format
  return timeInput;
};

export default {
  formatTo12Hour,
  convertFrom12To24,
  is24HourFormat,
  is12HourFormat,
  formatTimeForDisplay,
  parseTimeInput
};
