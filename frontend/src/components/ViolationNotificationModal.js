import React from 'react';
import '../styles/custom-styles.css'; // For modal overlay and general styles

// Icon component for violation
const ViolationIcon = () => (
  <span className="text-5xl">⚠️</span>
);

const ViolationNotificationModal = ({ isOpen, onClose, onNavigateToHistory }) => {
  if (!isOpen) return null;

  return (
    <div className="slot-modal-overlay" onClick={onClose}>
      <div className="slot-modal-card shadow-lg rounded-lg border border-gray-200" onClick={(e) => e.stopPropagation()}>
        <button
          onClick={onClose}
          className="slot-modal-close"
          aria-label="Close modal"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>

        <div className="slot-modal-content">
          {/* Header Section */}
          <div className="slot-modal-header">
            <div className="slot-modal-icon-wrapper bg-red-100 rounded-full p-3">
              <ViolationIcon />
            </div>
            <div className="slot-location-container">
              <h3 className="slot-modal-title text-red-600">Outstanding Violation!</h3>
            </div>
            <p className="slot-modal-subtitle">
              Action Required
            </p>
          </div>

          {/* Content Section */}
          <div className="slot-modal-form"> {/* Using form for consistent padding/margin */}
            <p className="text-lg text-gray-700 mb-4">
              You have an unpaid parking violation. Please review your reservation history to resolve this issue.
            </p>
            <p className="text-sm text-gray-500">
              Failure to pay may result in additional penalties or restrictions.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="slot-modal-actions">
            <div className="action-buttons-group">
              <button
                className="slot-modal-btn disabled"
                onClick={onClose}
              >
                Dismiss
              </button>
              <button
                className="slot-modal-btn primary bg-red-600 hover:bg-red-700"
                onClick={onNavigateToHistory}
              >
                View History
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ViolationNotificationModal;