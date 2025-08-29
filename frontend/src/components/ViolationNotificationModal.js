import React from 'react';
import '../styles/custom-styles.css'; // For modal overlay and general styles

// Icon component for violation
const ViolationIcon = () => (
  <span className="text-5xl">⚠️</span>
);

const ViolationNotificationModal = ({ isOpen, onClose, onNavigateToHistory }) => {
  if (!isOpen) return null;

  return (
    <div className="modern-modal-overlay" onClick={onClose}>
      <div className="modern-modal-card" onClick={(e) => e.stopPropagation()}>
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 text-2xl font-bold"
          aria-label="Close modal"
        >
          &times;
        </button>

        <div className="p-6">
          {/* Header Section */}
          <div className="flex flex-col items-center mb-4">
            <div className="bg-red-100 rounded-full p-3 mb-4">
              <ViolationIcon />
            </div>
            <h3 className="text-2xl font-bold text-red-600 mb-2">Outstanding Violation!</h3>
            <p className="text-gray-600 text-center">Action Required</p>
          </div>

          {/* Content Section */}
          <div className="text-center mb-6">
            <p className="text-lg text-gray-700 mb-4">
              You have an unpaid parking violation. Please review your reservation history to resolve this issue.
            </p>
            <p className="text-sm text-gray-500">
              Failure to pay may result in additional penalties or restrictions.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-center space-x-4">
            <button
              className="bg-gray-200 text-gray-700 px-6 py-3 rounded-lg font-semibold hover:bg-gray-300 transition-colors duration-200"
              onClick={onClose}
            >
              Dismiss
            </button>
            <button
              className="bg-red-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-red-700 transition-colors duration-200"
              onClick={onNavigateToHistory}
            >
              View History
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ViolationNotificationModal;