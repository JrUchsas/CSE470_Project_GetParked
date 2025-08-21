import React from 'react';
import '../styles/custom-slotmodal.css';

// Icon component for error
const ErrorIcon = () => (
  <svg className="slot-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="12" cy="12" r="10"/>
    <line x1="15" y1="9" x2="9" y2="15"/>
    <line x1="9" y1="9" x2="15" y2="15"/>
  </svg>
);

const ErrorModal = ({ errorMessage, onClose }) => {
  return (
    <div className="slot-modal-overlay" onClick={onClose}>
      <div className="slot-modal-card" onClick={(e) => e.stopPropagation()}>
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
            <div className="slot-modal-icon-wrapper" style={{
              background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
              boxShadow: '0 8px 16px rgba(239, 68, 68, 0.3)'
            }}>
              <ErrorIcon />
            </div>
            <h3 className="slot-modal-title" style={{ color: '#dc2626' }}>
              Error Occurred
            </h3>
            <p className="slot-modal-subtitle">
              Something went wrong
            </p>
          </div>

          {/* Error Message */}
          <div className="slot-modal-details">
            <div className="reservation-info" style={{
              background: 'linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%)',
              border: '1px solid #fecaca'
            }}>
              <p style={{
                textAlign: 'center',
                color: '#7f1d1d',
                fontSize: '1rem',
                lineHeight: '1.6',
                margin: '0',
                fontWeight: '500'
              }}>
                {errorMessage.split('\n').map((line, index) => (
                  <React.Fragment key={index}>
                    {line}
                    {index < errorMessage.split('\n').length - 1 && <br />}
                  </React.Fragment>
                ))}
              </p>
            </div>
          </div>

          {/* Action Button */}
          <div className="slot-modal-actions">
            <button
              onClick={onClose}
              className="slot-modal-btn danger"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ErrorModal;