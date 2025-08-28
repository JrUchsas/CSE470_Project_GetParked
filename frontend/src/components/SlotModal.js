
import React, { useState, useEffect } from 'react';
import { getVehiclesByOwner } from '../services/api';
import ErrorModal from './ErrorModal';
import { getVehicleIcon, formatVehicleType } from './VehicleIcons';
import DateTimePicker from './DateTimePicker';
import '../styles/custom-slotmodal.css';

// Other icon components
const SteeringWheelIcon = () => (
  <svg className="slot-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ fontSize: '24px' }}>
    <circle cx="12" cy="12" r="9"/>
    <circle cx="12" cy="12" r="3"/>
    <line x1="12" y1="3" x2="12" y2="9"/>
    <line x1="12" y1="15" x2="12" y2="21"/>
    <line x1="3" y1="12" x2="9" y2="12"/>
    <line x1="15" y1="12" x2="21" y2="12"/>
  </svg>
);

const ClockIcon = () => (
  <svg className="slot-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="12" cy="12" r="10"/>
    <polyline points="12,6 12,12 16,14"/>
  </svg>
);





const SlotModal = ({ slot, user, userVehicles, onClose, onReserve, onCancel, onCheckIn, actionLoading, onShareRequestClick }) => {
  const isReserved = slot.status === 'Reserved';
  const isReservedByUser = user && slot.user && slot.user.id === user.id;
  const isAdmin = user && user.role === 'admin';

  const [error, setError] = useState('');
  const [bookingStart, setBookingStart] = useState("");
  const [bookingEnd, setBookingEnd] = useState("");
  
  const [selectedVehicleId, setSelectedVehicleId] = useState('');

  

  const handleReserveClick = () => {

    const selectedVehicle = userVehicles.find(v => v.id === selectedVehicleId);

    if (!selectedVehicle) {
      setError('Please select a vehicle.');
      return;
    }

    // Type validation
    if (selectedVehicle.type !== slot.type) {
            setError(`This slot is for a ${formatVehicleType(slot.type)}.`
        + ` Please select a ${formatVehicleType(slot.type)} vehicle to reserve this slot.`);
      return;
    }

    onReserve(slot, bookingStart, bookingEnd, selectedVehicleId);
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
              <SteeringWheelIcon />
            </div>
            <div className="slot-location-container">
              <div className="slot-location-with-icon">
                <span className="parking-p-icon">P</span>
                <h3 className="slot-modal-title">{slot.location}</h3>
              </div>
            </div>
            <p className="slot-modal-subtitle">
              {formatVehicleType(slot.type)} Parking Slot
            </p>
            <div className={`slot-status-badge ${isReserved ? 'reserved' : 'available'}`}>
              {isReserved ? 'Reserved' : 'Available'}
            </div>
          </div>

          {/* Reservation Form */}
          {!isReserved && (
            <div className="slot-modal-form">
              <div className="form-group">
                <label className="slot-modal-label">
                  <span style={{ marginRight: '0.5rem' }}>
                    {(() => {
                      const selectedVehicle = userVehicles.find(v => v.id === selectedVehicleId);
                      return getVehicleIcon(selectedVehicle?.type || 'car', 'slot-card-icon');
                    })()}
                  </span>
                  Choose Vehicle
                </label>
                <select
                  className="slot-modal-input"
                  value={selectedVehicleId}
                  onChange={(e) => setSelectedVehicleId(e.target.value)}
                  required
                >
                  {userVehicles && userVehicles.length > 0 ? (
                    userVehicles.map((vehicle) => (
                      <option key={vehicle.id} value={vehicle.id}>
                        {vehicle.licensePlate} ({vehicle.model} - {formatVehicleType(vehicle.type)})
                      </option>
                    ))
                  ) : (
                    <option value="">No vehicles registered</option>
                  )}
                </select>
              </div>

              <div className="form-group">
                <DateTimePicker
                  value={bookingStart}
                  onChange={setBookingStart}
                  label="Start Time"
                  icon={<ClockIcon />}
                  minDateTime={new Date().toISOString()}
                  placeholder="Select start date and time"
                />
              </div>

              <div className="form-group">
                <DateTimePicker
                  value={bookingEnd}
                  onChange={setBookingEnd}
                  label="End Time"
                  icon={<ClockIcon />}
                  minDateTime={bookingStart || new Date().toISOString()}
                  placeholder="Select end date and time"
                />
              </div>
            </div>
          )}
          {/* Reservation Details */}
          {isReserved && (
            <div className="slot-modal-details">
              <div className="reservation-info">
                <h4 className="reservation-title">Reservation Details</h4>
                <div className="reservation-item">
                  <span className="reservation-label">Reserved by:</span>
                  <span className="reservation-value">{slot.user?.name || 'Unknown'}</span>
                </div>
                {slot.bookingStart && slot.bookingEnd && (
                  <>
                    <div className="reservation-item">
                      <span className="reservation-label">Start:</span>
                      <span className="reservation-value">
                        {new Date(slot.bookingStart).toLocaleString()}
                      </span>
                    </div>
                    <div className="reservation-item">
                      <span className="reservation-label">End:</span>
                      <span className="reservation-value">
                        {new Date(slot.bookingEnd).toLocaleString()}
                      </span>
                    </div>
                  </>
                )}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="slot-modal-actions">
            {!isReserved && (
              <button
                onClick={handleReserveClick}
                className="slot-modal-btn primary"
                disabled={actionLoading || !bookingStart || !bookingEnd || !selectedVehicleId}
              >
                {actionLoading ? (
                  <>
                    <div className="loading-spinner"></div>
                    Reserving...
                  </>
                ) : (
                  'Reserve Slot'
                )}
              </button>
            )}

            {isReserved && (
              <div className="action-buttons-group">
                {isReservedByUser && (
                  <button
                    onClick={() => onCheckIn(slot)}
                    className="slot-modal-btn success"
                    disabled={actionLoading}
                  >
                    {actionLoading ? (
                      <>
                        <div className="loading-spinner"></div>
                        Checking In...
                      </>
                    ) : (
                      'Check In'
                    )}
                  </button>
                )}
                {(isReservedByUser || isAdmin) && (
                  <button
                    onClick={() => onCancel(slot)}
                    className="slot-modal-btn danger"
                    disabled={actionLoading}
                  >
                    {actionLoading ? (
                      <>
                        <div className="loading-spinner"></div>
                        Cancelling...
                      </>
                    ) : (
                      'Cancel Reservation'
                    )}
                  </button>
                )}
              </div>
            )}

            {isReserved && !isReservedByUser && !isAdmin && (
              <>
                {userVehicles && userVehicles.some(v => v.type === slot.type) ? (
                  <button
                    onClick={() => onShareRequestClick(slot)}
                    className="slot-modal-btn primary" // Use a primary style for share request
                  >
                    Send Share Request
                  </button>
                ) : (
                  <button className="slot-modal-btn disabled" disabled>
                    Slot Reserved (Vehicle Mismatch)
                  </button>
                )}
              </>
            )}
          </div>
        </div>
      </div>
      {error && (
        <ErrorModal
          errorMessage={error}
          onClose={() => setError('')}
        />
      )}
    </div>
  );
};

export default SlotModal;
