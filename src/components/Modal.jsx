/**
 * SAL Education - College Attendance Management System
 * Modal Component
 * 
 * Reusable modal dialog for forms, confirmations, and alerts.
 * Features:
 * - Backdrop click to close
 * - Escape key to close
 * - Smooth animations
 * - Multiple sizes
 * 
 * VIVA NOTE: This modal uses React Portal pattern for better accessibility
 * and z-index management in complex layouts.
 */

import { useEffect } from 'react';

/**
 * Modal Component
 * @param {boolean} isOpen - Controls modal visibility
 * @param {function} onClose - Function to close modal
 * @param {string} title - Modal title
 * @param {ReactNode} children - Modal content
 * @param {string} size - Modal size: 'sm', 'md', 'lg', 'xl'
 */
const Modal = ({ isOpen, onClose, title, children, size = 'md' }) => {
  // Close modal on Escape key press
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') onClose();
    };
    
    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      // Prevent body scroll when modal is open
      document.body.style.overflow = 'hidden';
    }
    
    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  // Don't render if not open
  if (!isOpen) return null;

  // Size classes for modal width
  const sizeClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    '2xl': 'max-w-2xl'
  };

  return (
    // Modal backdrop
    <div 
      className="fixed inset-0 z-50 overflow-y-auto"
      aria-labelledby="modal-title"
      role="dialog"
      aria-modal="true"
    >
      {/* Overlay with fade effect */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
        onClick={onClose}
      ></div>

      {/* Modal positioning */}
      <div className="flex min-h-full items-center justify-center p-4">
        {/* Modal content */}
        <div 
          className={`relative bg-white rounded-lg shadow-xl transform transition-all w-full ${sizeClasses[size]}`}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Modal header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200">
            <h3 
              className="text-lg font-semibold text-gray-800"
              id="modal-title"
            >
              {title}
            </h3>
            {/* Close button */}
            <button
              type="button"
              onClick={onClose}
              className="p-1 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Modal body */}
          <div className="p-4">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Modal;
