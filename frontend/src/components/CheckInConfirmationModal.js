import React from 'react';
import '../custom-slotmodal.css';

// Icon component for check-in
const CheckInIcon = () => (
  <svg className="slot-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M9 12l2 2 4-4"/>
    <path d="M21 12c0 4.97-4.03 9-9 9s-9-4.03-9-9 4.03-9 9-9c2.39 0 4.68.94 6.36 2.64"/>
  </svg>
);

const ClockIcon = () => (
  <svg className="slot-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="12" cy="12" r="10"/>
    <polyline points="12,6 12,12 16,14"/>
  </svg>
);

const formatVehicleType = (type) => {
  if (type === 'suv') {
    return 'SUV';
  }
  return type.charAt(0).toUpperCase() + type.slice(1);
};

const formatDateTime = (dateTime) => {
  if (!dateTime) return 'N/A';
  return new Date(dateTime).toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  });
};

const isTimeWithinReservation = (currentTime, bookingStart, bookingEnd) => {
  const now = new Date(currentTime);
  const start = new Date(bookingStart);
  const end = new Date(bookingEnd);
  
  // Allow check-in 15 minutes before and after the start time
  const allowedStart = new Date(start.getTime() - 15 * 60 * 1000);
  const allowedEnd = new Date(end.getTime());
  
  return now >= allowedStart && now <= allowedEnd;
};

const CheckInConfirmationModal = ({ slot, onClose, onConfirmCheckIn, actionLoading }) => {
  const currentTime = new Date();
  const isValidTime = isTimeWithinReservation(currentTime, slot.bookingStart, slot.bookingEnd);
  
  const handleConfirm = () => {
    if (isValidTime) {
      onConfirmCheckIn(slot);
    }
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
              <CheckInIcon />
            </div>
            <div className="slot-location-container">
              <div className="slot-location-with-icon">
                <span className="parking-p-icon">P</span>
                <h3 className="slot-modal-title">{slot.location}</h3>
              </div>
            </div>
            <p className="slot-modal-subtitle">
              Check-In Confirmation
            </p>
            <div className={`slot-status-badge ${isValidTime ? 'available' : 'reserved'}`}>
              {isValidTime ? 'Ready for Check-In' : 'Time Mismatch'}
            </div>
          </div>

          {/* Time Comparison Section */}
          <div className="slot-modal-details">
            <div className="reservation-info">
              <h4 className="reservation-title">Time Verification</h4>

              <div className="reservation-item">
                <span className="reservation-label">
                  <ClockIcon />
                  Current Time:
                </span>
                <span className="reservation-value">{formatDateTime(currentTime)}</span>
              </div>

              <div className="reservation-item">
                <span className="reservation-label">Reserved Start:</span>
                <span className="reservation-value">{formatDateTime(slot.bookingStart)}</span>
              </div>

              <div className="reservation-item">
                <span className="reservation-label">Reserved End:</span>
                <span className="reservation-value">{formatDateTime(slot.bookingEnd)}</span>
              </div>

              {slot.vehicle && (
                <>
                  <h4 className="reservation-title" style={{ marginTop: '1.5rem' }}>Vehicle Details</h4>
                  <div className="reservation-item">
                    <span className="reservation-label">Vehicle:</span>
                    <span className="reservation-value">{slot.vehicle.licensePlate} ({slot.vehicle.model})</span>
                  </div>
                  <div className="reservation-item">
                    <span className="reservation-label">Type:</span>
                    <span className="reservation-value">{formatVehicleType(slot.vehicle.type)}</span>
                  </div>
                </>
              )}
            </div>

            {!isValidTime && (
              <div className="error-message" style={{
                background: 'linear-gradient(135deg, #fee2e2 0%, #fecaca 100%)',
                border: '1px solid #f87171',
                borderRadius: '0.75rem',
                padding: '1rem',
                marginTop: '1rem',
                textAlign: 'center'
              }}>
                <p style={{ color: '#dc2626', fontWeight: '600', margin: 0 }}>
                  The current time is not within your reserved slot time.
                </p>
                <p style={{ color: '#7f1d1d', fontSize: '0.875rem', margin: '0.5rem 0 0 0' }}>
                  You can check in 15 minutes before your reservation starts until your reservation ends.
                </p>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="slot-modal-actions">
            <div className="action-buttons-group">
              {isValidTime ? (
                <button
                  onClick={handleConfirm}
                  className="slot-modal-btn success"
                  disabled={actionLoading}
                >
                  {actionLoading ? (
                    <>
                      <div className="loading-spinner"></div>
                      Checking In...
                    </>
                  ) : (
                    'Confirm Check-In'
                  )}
                </button>
              ) : (
                <button className="slot-modal-btn disabled" disabled>
                  Cannot Check-In Now
                </button>
              )}
              
              <button
                onClick={onClose}
                className="slot-modal-btn disabled"
                disabled={actionLoading}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckInConfirmationModal;
