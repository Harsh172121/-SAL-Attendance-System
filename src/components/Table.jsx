import { useEffect, useRef } from 'react';

/**
 * SAL Education - College Attendance Management System
 * Table Component
 * 
 * Reusable data table with sorting, pagination placeholder, and actions.
 * Features:
 * - Dynamic columns
 * - Action buttons (Edit, Delete)
 * - Empty state handling
 * - Responsive design
 * 
 * VIVA NOTE: This table component follows the compound component pattern
 * for flexible column configuration.
 */

/**
 * Table Component
 * @param {Array} columns - Column definitions [{key, label, render}]
 * @param {Array} data - Data array to display
 * @param {function} onEdit - Edit action handler
 * @param {function} onDelete - Delete action handler
 * @param {boolean} showActions - Show action buttons
 * @param {string} emptyMessage - Message when no data
 * @param {Array} selectedIds - IDs of selected rows
 * @param {function} onSelectionChange - Selection change handler
 */
const Table = ({ 
  columns, 
  data, 
  onEdit, 
  onDelete, 
  showActions = true,
  emptyMessage = 'No data available',
  selectedIds = [],
  onSelectionChange
}) => {
  const selectable = typeof onSelectionChange === 'function';
  const visibleIds = data.map((row, index) => row.id ?? index);
  const selectedVisibleCount = visibleIds.filter((id) => selectedIds.includes(id)).length;
  const allVisibleSelected = visibleIds.length > 0 && selectedVisibleCount === visibleIds.length;
  const selectVisibleCheckbox = useRef(null);

  useEffect(() => {
    if (selectVisibleCheckbox.current) {
      selectVisibleCheckbox.current.indeterminate = selectedVisibleCount > 0 && !allVisibleSelected;
    }
  }, [selectedVisibleCount, allVisibleSelected]);

  const toggleRow = (id) => {
    onSelectionChange(
      selectedIds.includes(id)
        ? selectedIds.filter((selectedId) => selectedId !== id)
        : [...selectedIds, id]
    );
  };

  const toggleVisibleRows = () => {
    if (allVisibleSelected) {
      onSelectionChange(selectedIds.filter((id) => !visibleIds.includes(id)));
      return;
    }

    onSelectionChange([...new Set([...selectedIds, ...visibleIds])]);
  };

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        {/* Table header */}
        <thead className="bg-gray-50">
          <tr>
            {selectable && (
              <th scope="col" className="w-12 px-4 py-3 text-left">
                <input
                  ref={selectVisibleCheckbox}
                  type="checkbox"
                  aria-label="Select all visible rows"
                  checked={allVisibleSelected}
                  disabled={visibleIds.length === 0}
                  onChange={toggleVisibleRows}
                  className="h-4 w-4 rounded border-gray-300 text-blue-700 focus:ring-blue-600"
                />
              </th>
            )}
            {columns.map((column) => (
              <th
                key={column.key}
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                {column.label}
              </th>
            ))}
            {/* Actions column header */}
            {showActions && (onEdit || onDelete) && (
              <th
                scope="col"
                className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Actions
              </th>
            )}
          </tr>
        </thead>

        {/* Table body */}
        <tbody className="bg-white divide-y divide-gray-200">
          {data.length === 0 ? (
            // Empty state
            <tr>
              <td
                colSpan={columns.length + (showActions && (onEdit || onDelete) ? 1 : 0) + (selectable ? 1 : 0)}
                className="px-6 py-12 text-center text-gray-500"
              >
                <div className="flex flex-col items-center">
                  <svg
                    className="w-12 h-12 text-gray-300 mb-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                  <p className="text-lg font-medium">{emptyMessage}</p>
                </div>
              </td>
            </tr>
          ) : (
            // Data rows
            data.map((row, rowIndex) => (
              <tr 
                key={row.id || rowIndex}
                className={`${selectedIds.includes(row.id ?? rowIndex) ? 'bg-blue-50 hover:bg-blue-100' : 'hover:bg-gray-50'} transition-colors`}
              >
                {selectable && (
                  <td className="w-12 px-4 py-4">
                    <input
                      type="checkbox"
                      aria-label={`Select ${row.name || row.enrollmentNo || row.employeeId || row.code || `row ${rowIndex + 1}`}`}
                      checked={selectedIds.includes(row.id ?? rowIndex)}
                      onChange={() => toggleRow(row.id ?? rowIndex)}
                      className="h-4 w-4 rounded border-gray-300 text-blue-700 focus:ring-blue-600"
                    />
                  </td>
                )}
                {columns.map((column) => (
                  <td
                    key={column.key}
                    className="px-6 py-4 whitespace-nowrap text-sm text-gray-900"
                  >
                    {/* Use custom render if provided, else display value */}
                    {column.render 
                      ? column.render(row[column.key], row) 
                      : row[column.key]}
                  </td>
                ))}

                {/* Action buttons */}
                {showActions && (onEdit || onDelete) && (
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                    {onEdit && (
                      <button
                        onClick={() => onEdit(row)}
                        className="text-blue-600 hover:text-blue-900 transition-colors"
                        title="Edit"
                      >
                        <svg className="w-5 h-5 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </button>
                    )}
                    {onDelete && (
                      <button
                        onClick={() => onDelete(row)}
                        className="text-red-600 hover:text-red-900 transition-colors"
                        title="Delete"
                      >
                        <svg className="w-5 h-5 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    )}
                  </td>
                )}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

export default Table;
