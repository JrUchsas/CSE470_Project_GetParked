import React from 'react';

// Icon component for check-in
const CheckInIcon = () => (
  <svg className="slot-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M9 12l2 2 4-4"/>
    <path d="M21 12c0 1.66-.41 3.22-1.14 4.58-.73 1.36-1.85 2.48-3.21 3.21C15.22 20.59 13.66 21 12 21s-3.22-.41-4.58-1.14c-1.36-.73-2.48-1.85-3.21-3.21C3.41 15.22 3 13.66 3 12s.41-3.22 1.14-4.58c.73-1.36 1.85-2.48 3.21-3.21C8.78 3.41 10.34 3 12 3s3.22.41 4.58 1.14c1.36.73 2.48 1.85 3.21 3.21C20.59 8.78 21 10.34 21 12z"/>
  </svg>
);

// Helper function to check if current time is within reservation window
const isTimeWithinReservation = (currentTime, bookingStart, bookingEnd) => {
  if (!bookingStart || !bookingEnd) return false;
  
  const current = new Date(currentTime);
  const start = new Date(bookingStart);
  const end = new Date(bookingEnd);
  
  // Allow check-in 15 minutes before reservation start
  const allowedStart = new Date(start.getTime() - 15 * 60 * 1000);
  
  return current >= allowedStart && current <= end;
};

const formatVehicleType = (type) => {
  if (!type) return 'Vehicle';
  return type.charAt(0).toUpperCase() + type.slice(1);
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

          {/* Content Section */}
          <div className="slot-modal-details">
            <div className="reservation-info">
              <h4 className="info-title">Reservation Details</h4>
              <div className="info-grid">
                <div className="info-item">
                  <span className="info-label">Reserved Time:</span>
                  <span className="info-value">
                    {slot.bookingStart && slot.bookingEnd ? (
                      <>
                        {new Date(slot.bookingStart).toLocaleString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })} - {new Date(slot.bookingEnd).toLocaleString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </>
                    ) : 'N/A'}
                  </span>
                </div>
                <div className="info-item">
                  <span className="info-label">Current Time:</span>
                  <span className="info-value">
                    {currentTime.toLocaleString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </span>
                </div>
                <div className="info-item">
                  <span className="info-label">Vehicle Type:</span>
                  <span className="info-value">{formatVehicleType(slot.type)}</span>
                </div>
              </div>
            </div>

            {!isValidTime && (
              <div className="warning-message">
                <div className="warning-icon">⚠️</div>
                <div className="warning-text">
                  <p><strong>Check-in not available</strong></p>
                  <p>You can only check in during your reservation time window (starting 15 minutes before your reserved time).</p>
                </div>
              </div>
            )}

            {isValidTime && (
              <div className="success-message">
                <div className="success-icon">✅</div>
                <div className="success-text">
                  <p><strong>Ready to check in!</strong></p>
                  <p>You're within your reservation time window. Proceed with check-in.</p>
                </div>
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
