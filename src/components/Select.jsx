/**
 * SAL Education - College Attendance Management System
 * Select Component
 * 
 * Reusable dropdown select with consistent styling.
 * Features:
 * - Label support
 * - Error state
 * - Required indicator
 * - SAL theme styling
 * 
 * VIVA NOTE: Form components are separated for reusability
 * and consistent styling across the application.
 */

/**
 * Select Component
 * @param {string} label - Field label
 * @param {string} id - Input ID
 * @param {string} value - Selected value
 * @param {function} onChange - Change handler
 * @param {Array} options - Options array [{value, label}]
 * @param {boolean} required - Is field required
 * @param {string} error - Error message
 * @param {string} placeholder - Placeholder text
 * @param {boolean} disabled - Disable select
 */
const Select = ({
  label,
  id,
  value,
  onChange,
  options,
  required = false,
  error,
  placeholder = 'Select an option',
  disabled = false,
  className = ''
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

      {/* Select dropdown */}
      <select
        id={id}
        value={value}
        onChange={onChange}
        required={required}
        disabled={disabled}
        className={`w-full px-4 py-2.5 border rounded-lg bg-white transition-colors
          ${error 
            ? 'border-red-500 focus:ring-red-500' 
            : 'border-gray-300 focus:ring-blue-500'
          }
          ${disabled 
            ? 'bg-gray-100 cursor-not-allowed' 
            : 'focus:ring-2 focus:border-transparent'
          }
        `}
      >
        {/* Placeholder option */}
        <option value="">{placeholder}</option>
        
        {/* Options */}
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>

      {/* Error message */}
      {error && (
        <p className="mt-1 text-sm text-red-500">{error}</p>
      )}
    </div>
  );
};

export default Select;
