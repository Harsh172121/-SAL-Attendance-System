/**
 * SAL Education - College Attendance Management System
 * Input Component
 * 
 * Reusable text input with consistent styling.
 * Features:
 * - Multiple types (text, email, password, number, date)
 * - Label support
 * - Error state
 * - Required indicator
 * - SAL theme styling
 */
/**
 * Input Component
 * @param {string} label - Field label
 * @param {string} id - Input ID
 * @param {string} type - Input type
 * @param {string} value - Input value
 * @param {function} onChange - Change handler
 * @param {boolean} required - Is field required
 * @param {string} error - Error message
 * @param {string} placeholder - Placeholder text
 * @param {boolean} disabled - Disable input
 */
const Input = ({
  label,
  id,
  type = 'text',
  value,
  onChange,
  required = false,
  error,
  placeholder = '',
  disabled = false,
  className = '',
  min,
  max,
  step
}) => {
  return (
    <div className={className}>
      {/* Label */}
      {label && (
        <label
          htmlFor={id}
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}

      {/* Input field */}
      <input
        type={type}
        id={id}
        value={value}
        onChange={onChange}
        required={required}
        disabled={disabled}
        placeholder={placeholder}
        min={min}
        max={max}
        step={step}
        className={`w-full px-4 py-2.5 border rounded-lg transition-colors
          ${error 
            ? 'border-red-500 focus:ring-red-500' 
            : 'border-gray-300 focus:ring-blue-500'
          }
          ${disabled 
            ? 'bg-gray-100 cursor-not-allowed' 
            : 'focus:ring-2 focus:border-transparent'
          }
        `}
      />

      {/* Error message */}
      {error && (
        <p className="mt-1 text-sm text-red-500">{error}</p>
      )}
    </div>
  );
};

export default Input;
