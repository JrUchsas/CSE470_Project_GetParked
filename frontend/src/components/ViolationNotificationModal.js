import React from 'react';
import '../styles/custom-styles.css';

const ViolationIcon = () => (
  <span className="violation-icon">⚠️</span>
);

const ViolationNotificationModal = ({ isOpen, onClose, onNavigateToHistory }) => {
  if (!isOpen) return null;

  return (
    <div className="violation-modal-overlay" onClick={onClose}>
      <div className="violation-modal-card" onClick={(e) => e.stopPropagation()}>
        <button onClick={onClose} className="violation-modal-close-btn" aria-label="Close modal">
          &times;
        </button>

        <div className="violation-header">
          <div className="violation-icon-container">
            <ViolationIcon />
          </div>
          <h3 className="violation-title">Outstanding Violation!</h3>
          <p className="violation-subtitle">Action Required</p>
        </div>

        <div className="violation-content">
          <p className="violation-message">
            You have an unpaid parking violation. Please review your reservation history to resolve this issue.
          </p>
          <p className="violation-warning">
            Failure to pay may result in additional penalties or restrictions.
          </p>
        </div>

        <div className="violation-actions">
          <button className="violation-action-btn dismiss-btn" onClick={onClose}>
            Dismiss
          </button>
          <button className="violation-action-btn history-btn" onClick={onNavigateToHistory}>
            View History
          </button>
        </div>
      </div>
    </div>
  );
};

export default ViolationNotificationModal;