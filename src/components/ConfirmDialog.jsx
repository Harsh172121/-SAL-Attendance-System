/**
 * SAL Education - College Attendance Management System
 * Confirm Dialog Component
 * 
 * Reusable confirmation dialog for delete and other destructive actions.
 * Features:
 * - Customizable message
 * - Confirm/Cancel buttons
 * - Danger styling
 */

import Modal from './Modal';
import Button from './Button';

/**
 * ConfirmDialog Component
 * @param {boolean} isOpen - Controls dialog visibility
 * @param {function} onClose - Function to close dialog
 * @param {function} onConfirm - Function called on confirmation
 * @param {string} title - Dialog title
 * @param {string} message - Confirmation message
 * @param {string} confirmText - Confirm button text
 * @param {string} variant - Button variant: 'danger', 'primary'
 */
const ConfirmDialog = ({
  isOpen,
  onClose,
  onConfirm,
  title = 'Confirm Action',
  message = 'Are you sure you want to perform this action?',
  confirmText = 'Confirm',
  variant = 'danger'
}) => {
  const handleConfirm = () => {
    onConfirm();
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} size="sm">
      {/* Warning icon */}
      <div className="text-center mb-4">
        <div className={`mx-auto w-12 h-12 rounded-full flex items-center justify-center 
          ${variant === 'danger' ? 'bg-red-100' : 'bg-blue-100'}`}
        >
          {variant === 'danger' ? (
            <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          ) : (
            <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          )}
        </div>
      </div>

      {/* Message */}
      <p className="text-center text-gray-600 mb-6">{message}</p>

      {/* Action buttons */}
      <div className="flex justify-end space-x-3">
        <Button variant="outline" onClick={onClose}>
          Cancel
        </Button>
        <Button variant={variant} onClick={handleConfirm}>
          {confirmText}
        </Button>
      </div>
    </Modal>
  );
};

export default ConfirmDialog;
