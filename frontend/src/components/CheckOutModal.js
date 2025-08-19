import React from 'react';
import '../custom-slotmodal.css';

// Icon component for check-out
const CheckOutIcon = () => (
  <svg className="slot-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M9 11l3 3L22 4"/>
    <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>
  </svg>
);

const formatVehicleType = (type) => {
  if (type === 'suv') {
    return 'SUV';
  }
  return type.charAt(0).toUpperCase() + type.slice(1);
};

const CheckOutModal = ({ slot, onClose, onCheckOut }) => {
  const { parkingSession } = slot;

  // Format check-in time
  const checkInTime = parkingSession?.checkInTime ?
    new Date(parkingSession.checkInTime).toLocaleString() : 'N/A';

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
              <CheckOutIcon />
            </div>
            <h3 className="slot-modal-title">{slot.location}</h3>
            <p className="slot-modal-subtitle">
              {formatVehicleType(slot.type)} Parking Slot Check-out
            </p>
            <div className="slot-status-badge reserved">
              {slot.status}
            </div>
          </div>

          {/* Session Details */}
          <div className="slot-modal-details">
            <div className="reservation-info">
              <h4 className="reservation-title">Parking Session Details</h4>

              <div className="reservation-item">
                <span className="reservation-label">Check-in Time:</span>
                <span className="reservation-value">{checkInTime}</span>
              </div>

              {parkingSession?.duration && (
                <div className="reservation-item">
                  <span className="reservation-label">Duration:</span>
                  <span className="reservation-value">{parkingSession.duration} minutes</span>
                </div>
              )}

              {parkingSession?.fee && (
                <div className="reservation-item">
                  <span className="reservation-label">Parking Fee:</span>
                  <span className="reservation-value" style={{
                    color: '#059669',
                    fontWeight: '700',
                    fontSize: '1.1rem'
                  }}>
                    ${parkingSession.fee}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Action Button */}
          <div className="slot-modal-actions">
            <button
              onClick={onCheckOut}
              className="slot-modal-btn success"
            >
              Confirm Check-out
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckOutModal;
