/**
 * SAL Education - College Attendance Management System
 * Stats Card Component
 * 
 * Dashboard statistics card with icon and change indicator.
 * Features:
 * - Customizable icon and color
 * - Change percentage display
 * - Clean card design
 */

/**
 * StatsCard Component
 * @param {string} title - Card title
 * @param {string|number} value - Main statistic value
 * @param {ReactNode} icon - Icon element
 * @param {string} bgColor - Background color class for icon
 * @param {string} change - Change percentage text
 * @param {boolean} positive - Is change positive
 */
const StatsCard = ({ 
  title, 
  value, 
  icon, 
  bgColor = 'bg-blue-500', 
  change,
  positive = true 
}) => {
  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center justify-between">
        <div>
          {/* Title */}
          <p className="text-sm font-medium text-gray-500">{title}</p>
          {/* Value */}
          <p className="text-3xl font-bold text-gray-800 mt-1">{value}</p>
          {/* Change indicator */}
          {change && (
            <p className={`text-sm mt-2 ${positive ? 'text-green-600' : 'text-red-600'}`}>
              {positive ? '↑' : '↓'} {change}
            </p>
          )}
        </div>
        {/* Icon */}
        <div className={`${bgColor} p-3 rounded-lg text-white`}>
          {icon}
        </div>
      </div>
    </div>
  );
};

export default StatsCard;
