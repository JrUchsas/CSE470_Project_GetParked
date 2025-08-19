import React from 'react';
import { useNavigate } from 'react-router-dom';

// Icon component for vehicle registration
const CarPlusIcon = () => (
  <svg className="slot-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.6-1.6-1.6L18 10.5l-2-3c-.3-.5-.8-.5-1.3-.5H9.3c-.5 0-1 0-1.3.5l-2 3-2.4 1.4C2.7 11.4 2 12.1 2 13v3c0 .6.4 1 1 1h2"/>
    <circle cx="7" cy="17" r="2"/>
    <circle cx="17" cy="17" r="2"/>
    <line x1="12" y1="8" x2="12" y2="14"/>
    <line x1="9" y1="11" x2="15" y2="11"/>
  </svg>
);

const VehicleRegistrationPrompt = ({ onClose }) => {
  const navigate = useNavigate();
  const handleRegisterClick = () => {
    navigate('/vehicles');
    onClose();
  };

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
            <div className="slot-modal-icon-wrapper">
              <CarPlusIcon />
            </div>
            <h3 className="slot-modal-title">Register Your Vehicle</h3>
            <p className="slot-modal-subtitle">
              Get started with our parking services
            </p>
          </div>

          {/* Content Section */}
          <div className="slot-modal-details">
            <div className="reservation-info">
              <p style={{
                textAlign: 'center',
                color: '#64748b',
                fontSize: '1rem',
                lineHeight: '1.6',
                margin: '0'
              }}>
                It looks like you don't have any vehicles registered yet.
                Please register a vehicle to use our parking services and
                start making reservations.
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="slot-modal-actions">
            <div className="action-buttons-group">
              <button
                onClick={handleRegisterClick}
                className="slot-modal-btn primary"
              >
                Register Vehicle Now
              </button>
              <button
                onClick={onClose}
                className="slot-modal-btn disabled"
              >
                Maybe Later
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VehicleRegistrationPrompt;
