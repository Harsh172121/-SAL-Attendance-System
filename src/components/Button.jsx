/**
 * SAL Education - College Attendance Management System
 * Button Component
 * Reusable button with SAL theme variants
 * Supports primary (green), secondary (blue), and danger (red) variants
 */

/**
 * Button Component
 * @param {ReactNode} children - Button text/content
 * @param {string} variant - Button style: 'primary', 'secondary', 'danger', 'outline'
 * @param {string} size - Button size: 'sm', 'md', 'lg'
 * @param {boolean} disabled - Disabled state
 * @param {string} type - Button type: 'button', 'submit', 'reset'
 * @param {function} onClick - Click handler
 * @param {string} className - Additional CSS classes
 */
const Button = ({
  children,
  variant = 'primary',
  size = 'md',
  disabled = false,
  type = 'button',
  onClick,
  className = '',
}) => {
  // Base styles for all buttons
  const baseStyles =
    'font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed';

  // Variant styles - SAL theme colors
  const variantStyles = {
    primary: 'bg-green-600 text-white hover:bg-green-700 focus:ring-green-500',
    secondary: 'bg-blue-800 text-white hover:bg-blue-900 focus:ring-blue-500',
    danger: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500',
    outline:
      'border-2 border-blue-800 text-blue-800 hover:bg-blue-50 focus:ring-blue-500',
  };

  // Size styles
  const sizeStyles = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg',
  };

  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      className={`${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
    >
      {children}
    </button>
  );
};

export default Button;
