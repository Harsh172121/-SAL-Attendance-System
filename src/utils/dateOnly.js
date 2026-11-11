const CAMPUS_TIME_ZONE = import.meta.env.VITE_APP_TIMEZONE || 'Asia/Kolkata';

/** Return today's calendar date in the campus timezone as YYYY-MM-DD. */
export const getCampusDate = (date = new Date()) => {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: CAMPUS_TIME_ZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  }).formatToParts(date).reduce((result, part) => {
    result[part.type] = part.value;
    return result;
  }, {});

  return `${parts.year}-${parts.month}-${parts.day}`;
};

/** Format a DATEONLY string as a local calendar date without UTC shifting it. */
export const formatDateOnly = (value, locale, options) => {
  if (!value) return '';
  const [year, month, day] = value.split('-').map(Number);
  return new Date(year, month - 1, day).toLocaleDateString(locale, options);
};
