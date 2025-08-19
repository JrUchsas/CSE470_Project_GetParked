
import React, { useState, useEffect } from 'react';
import { getVehiclesByOwner } from '../services/api';
import ErrorModal from './ErrorModal';
import { getVehicleIcon, formatVehicleType } from './VehicleIcons';
import '../custom-slotmodal.css';

// Other icon components

const ClockIcon = () => (
  <svg className="slot-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="12" cy="12" r="10"/>
    <polyline points="12,6 12,12 16,14"/>
  </svg>
);

const LocationIcon = () => (
  <svg className="slot-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
    <circle cx="12" cy="10" r="3"/>
  </svg>
);



const SlotModal = ({ slot, user, onClose, onReserve, onCancel, onCheckIn, actionLoading }) => {
  const isReserved = slot.status === 'Reserved';
  const isReservedByUser = user && slot.user && slot.user.id === user.id;
  const isAdmin = user && user.role === 'admin';

  const [error, setError] = useState('');
  const [bookingStart, setBookingStart] = useState("");
  const [bookingEnd, setBookingEnd] = useState("");
  const [userVehicles, setUserVehicles] = useState([]);
  const [selectedVehicleId, setSelectedVehicleId] = useState('');

  useEffect(() => {
    const fetchUserVehicles = async () => {
      if (user && user.id) {
        try {
          const vehicles = await getVehiclesByOwner(user.id);
          setUserVehicles(vehicles);
          if (vehicles.length > 0) {
            setSelectedVehicleId(vehicles[0].id); // Select first vehicle by default
          }
        } catch (error) {
          console.error('Failed to fetch user vehicles:', error);
        }
      }
    };
    fetchUserVehicles();
  }, [user]);

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
              {getVehicleIcon(slot.type)}
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
                  {getVehicleIcon('car', 'slot-icon')}
                  Choose Vehicle
                </label>
                <select
                  className="slot-modal-input"
                  value={selectedVehicleId}
                  onChange={(e) => setSelectedVehicleId(e.target.value)}
                  required
                >
                  {userVehicles.length > 0 ? (
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
                <label className="slot-modal-label">
                  <ClockIcon />
                  Start Time
                </label>
                <input
                  type="datetime-local"
                  className="slot-modal-input"
                  value={bookingStart}
                  onChange={e => setBookingStart(e.target.value)}
                  min={new Date().toISOString().slice(0, 16)}
                />
              </div>

              <div className="form-group">
                <label className="slot-modal-label">
                  <ClockIcon />
                  End Time
                </label>
                <input
                  type="datetime-local"
                  className="slot-modal-input"
                  value={bookingEnd}
                  onChange={e => setBookingEnd(e.target.value)}
                  min={bookingStart || new Date().toISOString().slice(0, 16)}
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
              <button className="slot-modal-btn disabled" disabled>
                Slot Reserved
              </button>
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
