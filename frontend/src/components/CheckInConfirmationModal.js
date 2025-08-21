import React from 'react';
import { getVehicleIcon } from './VehicleIcons'; // Import getVehicleIcon

// Icon component for check-in
const CheckInIcon = () => (
  <svg className="slot-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M9 12l2 2 4-4"/>
    <path d="M21 12c0 1.66-.41 3.22-1.14 4.58-.73 1.36-1.85 2.48-3.21 3.21C15.22 20.59 13.66 21 12 21s-3.22-.41-4.58-1.14c-1.36-.73-2.48-1.85-3.21-3.21C3.41 15.22 3 13.66 3 12s.41-3.22 1.14-4.58c.73-1.36 1.85-2.48 3.21-3.21C20.59 8.78 21 10.34 21 12z"/>
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
  let formattedType = type;
  switch (type) {
    case 'car':
      formattedType = 'Car';
      break;
    case 'bike':
      formattedType = 'Bike';
      break;
    case 'suv':
      formattedType = 'SUV';
      break;
    case 'van':
      formattedType = 'Van';
      break;
    case 'minibus':
      formattedType = 'Minibus';
      break;
    default:
      formattedType = type.charAt(0).toUpperCase() + type.slice(1);
  }

  if (!type) return (
    <span style={{ display: 'inline-flex', alignItems: 'center' }}>
      {getVehicleIcon('car', 'w-4 h-4 mr-1')} Vehicle
    </span>
  );
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center' }}>
      {getVehicleIcon(type, 'w-4 h-4 mr-1')} {formattedType}
    </span>
  );
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
          <div className="slot-modal-form"> {/* Changed from slot-modal-details */}
            <div className="form-group">
              <h4 className="slot-modal-label" style={{ marginBottom: '0.5rem' }}>Reservation Details</h4>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="info-item">
                  <span className="slot-modal-label">Reserved Time:</span>
                  <span className="slot-modal-input-display">
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
                  <span className="slot-modal-label">Current Time:</span>
                  <span className="slot-modal-input-display">
                    {currentTime.toLocaleString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </span>
                </div>
                <div className="info-item">
                  <span className="slot-modal-label">Vehicle Type:</span>
                  <span className="slot-modal-input-display">{formatVehicleType(slot.type)}</span>
                </div>
              </div>
            </div>

            {!isValidTime && (
              <div className="text-danger" style={{ marginTop: '1.5rem', padding: '1rem', border: '1px solid #dc3545', borderRadius: '8px', backgroundColor: '#f8d7da' }}>
                <div style={{ display: 'flex', alignItems: 'center', marginBottom: '0.5rem' }}>
                  <span style={{ fontSize: '1.5rem', marginRight: '0.5rem' }}>⚠️</span>
                  <p style={{ margin: 0, fontWeight: 'bold' }}>Check-in not available</p>
                </div>
                <p style={{ margin: 0 }}>You can only check in during your reservation time window (starting 15 minutes before your reserved time).</p>
              </div>
            )}

            {isValidTime && (
              <div className="text-success" style={{ marginTop: '1.5rem', padding: '1rem', border: '1px solid #28a745', borderRadius: '8px', backgroundColor: '#d4edda' }}>
                <div style={{ display: 'flex', alignItems: 'center', marginBottom: '0.5rem' }}>
                  <span style={{ fontSize: '1.5rem', marginRight: '0.5rem' }}>✅</span>
                  <p style={{ margin: 0, fontWeight: 'bold' }}>Ready to check in!</p>
                </div>
                <p style={{ margin: 0 }}>You're within your reservation time window. Proceed with check-in.</p>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="slot-modal-actions">
            <div className="action-buttons-group">
              {isValidTime ? (
                <button
                  onClick={handleConfirm}
                  className="slot-modal-btn primary" // Changed from success to primary for consistency
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
