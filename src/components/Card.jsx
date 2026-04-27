/**
 * SAL Education - College Attendance Management System
 * Card Component
 * Reusable card with white background and soft shadow
 * Used throughout the application for consistent styling
 */

/**
 * Card Component
 * @param {ReactNode} children - Content to display inside the card
 * @param {string} title - Optional card title
 * @param {string} className - Additional CSS classes
 */
const Card = ({ children, title, className = '' }) => {
  return (
    <div
      className={`bg-white rounded-lg shadow-md p-6 ${className}`}
    >
      {/* Card title if provided */}
      {title && (
        <h3 className="text-lg font-semibold text-gray-800 mb-4 pb-2 border-b border-gray-200">
          {title}
        </h3>
      )}
      {/* Card content */}
      {children}
    </div>
  );
};

export default Card;
