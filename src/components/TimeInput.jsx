/**
 * TimeInput Component
 * HTML time input with helper text showing 12-hour format preview
 * Accepts and stores time in 24-hour format internally
 */

import { formatTo12Hour } from '../utils/timeFormat';

export const TimeInput = ({
  value,
  onChange,
  label,
  required = false,
  className = '',
  disabled = false,
  ...props
}) => {
  const time12 = value ? formatTo12Hour(value) : '';

  return (
    <div className={className}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {label} {required && '*'}
        </label>
      )}
      <input
        type="time"
        value={value}
        onChange={onChange}
        disabled={disabled}
        required={required}
        className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
        {...props}
      />
      {value && (
        <p className="text-xs text-gray-500 mt-1">
          Displays as: <span className="font-medium">{time12}</span>
        </p>
      )}
    </div>
  );
};

export default TimeInput;
