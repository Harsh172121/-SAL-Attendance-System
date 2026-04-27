/**
 * Time Format Conversion Utilities - Backend
 * Converts between 24-hour (HH:MM) and 12-hour (h:MM AM/PM) formats
 * Used for API responses and data display
 */

/**
 * Convert 24-hour time format to 12-hour format with AM/PM
 * @param {string} time24 - Time in 24-hour format (HH:MM or HH:MM:SS)
 * @returns {string} Time in 12-hour format (h:MM AM/PM)
 */
const formatTo12Hour = (time24) => {
  if (!time24) return '';

  const timeParts = time24.split(':');
  let hours = parseInt(timeParts[0], 10);
  const minutes = timeParts[1];

  const period = hours >= 12 ? 'PM' : 'AM';

  if (hours === 0) {
    hours = 12;
  } else if (hours > 12) {
    hours = hours - 12;
  }

  return `${hours}:${minutes} ${period}`;
};

/**
 * Convert 12-hour time format with AM/PM to 24-hour format
 * @param {string} time12 - Time in 12-hour format (h:MM AM/PM)
 * @returns {string} Time in 24-hour format (HH:MM)
 */
const convertFrom12To24 = (time12) => {
  if (!time12) return '';

  const parts = time12.trim().split(' ');
  const period = parts[parts.length - 1].toUpperCase();
  const timeParts = parts[0].split(':');
  let hours = parseInt(timeParts[0], 10);
  const minutes = timeParts[1];

  if (period === 'AM') {
    if (hours === 12) {
      hours = 0;
    }
  } else if (period === 'PM') {
    if (hours !== 12) {
      hours = hours + 12;
    }
  }

  return `${String(hours).padStart(2, '0')}:${minutes}`;
};

/**
 * Check if a time string is in 24-hour format
 * @param {string} time - Time string to check
 * @returns {boolean} True if time is in 24-hour format
 */
const is24HourFormat = (time) => {
  if (!time) return false;
  return !/\b(AM|PM|am|pm)\b/.test(time);
};

/**
 * Check if a time string is in 12-hour format
 * @param {string} time - Time string to check
 * @returns {boolean} True if time is in 12-hour format
 */
const is12HourFormat = (time) => {
  if (!time) return false;
  return /\b(AM|PM|am|pm)\b/.test(time);
};

/**
 * Format time for API response - ensures consistent 12-hour format
 * @param {string} time - Time in 24-hour format
 * @returns {string} Time in 12-hour format
 */
const formatTimeForAPI = (time) => {
  if (!time) return '';
  return formatTo12Hour(time);
};

module.exports = {
  formatTo12Hour,
  convertFrom12To24,
  is24HourFormat,
  is12HourFormat,
  formatTimeForAPI
};
