import { useEffect } from 'react';
import { FiX } from 'react-icons/fi';
import Button from './Button';

const Modal = ({
  isOpen,
  onClose,
  title,
  children,
  footer,
  size = 'md',
  closeOnOverlayClick = true,
}) => {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const sizes = {
    sm: 'max-w-md',
    md: 'max-w-2xl',
    lg: 'max-w-4xl',
    xl: 'max-w-6xl',
    full: 'max-w-full mx-4',
  };

  const handleOverlayClick = (e) => {
    if (closeOnOverlayClick && e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto"
      aria-labelledby="modal-title"
      role="dialog"
      aria-modal="true"
    >
      <div
        className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0"
        onClick={handleOverlayClick}
      >
        {/* Background overlay with glassmorphism */}
        <div
          className="fixed inset-0 backdrop-blur-md bg-black/30 transition-opacity"
          aria-hidden="true"
        />

        {/* Center modal */}
        <span
          className="hidden sm:inline-block sm:align-middle sm:h-screen"
          aria-hidden="true"
        >
          &#8203;
        </span>

        {/* Modal panel with glassmorphism */}
        <div
          className={`inline-block align-bottom backdrop-blur-2xl bg-white/80 border border-white/40 rounded-2xl text-left overflow-hidden shadow-2xl transform transition-all sm:my-8 sm:align-middle w-full ${sizes[size]}`}
        >
          {/* Header */}
          {title && (
            <div className="px-6 py-4 border-b border-white/30 backdrop-blur-sm bg-white/30 flex justify-between items-center">
              <h3
                className="text-lg font-semibold text-gray-900"
                id="modal-title"
              >
                {title}
              </h3>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600 focus:outline-none backdrop-blur-sm bg-white/20 hover:bg-white/40 rounded-lg p-1 transition-all"
              >
                <FiX className="h-6 w-6" />
              </button>
            </div>
          )}

          {/* Body */}
          <div className="px-6 py-4 max-h-[calc(100vh-200px)] overflow-y-auto">
            {children}
          </div>

          {/* Footer */}
          {footer && (
            <div className="px-6 py-4 border-t border-white/30 backdrop-blur-sm bg-white/30 flex justify-end gap-3">
              {footer}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Modal;

