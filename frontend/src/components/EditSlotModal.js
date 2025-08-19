import React, { useState } from 'react';
import { getVehicleIcon, formatVehicleType } from './VehicleIcons';
import '../custom-slotmodal.css'; // Use the modern SlotModal styles

// Icon components for better visual appeal
const EditIcon = () => (
  <svg className="slot-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
    <path d="m18.5 2.5 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
  </svg>
);

const LocationIcon = () => (
  <svg className="slot-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
    <circle cx="12" cy="10" r="3"/>
  </svg>
);

const ClockIcon = () => (
  <svg className="slot-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="12" cy="12" r="10"/>
    <polyline points="12,6 12,12 16,14"/>
  </svg>
);

const EditSlotModal = ({ slot, onClose, onUpdate, onDelete, actionLoading }) => {
  const toLocalDatetime = (isoString) => {
    if (!isoString) return '';
    const date = new Date(isoString);
    const tzOffset = date.getTimezoneOffset() * 60000;
    const localISO = new Date(date - tzOffset).toISOString().slice(0,16);
    return localISO;
  };

  const [location, setLocation] = useState(slot.location || '');
  const [type, setType] = useState(slot.type || 'car');
  const [bookingStart, setBookingStart] = useState(toLocalDatetime(slot.bookingStart));
  const [bookingEnd, setBookingEnd] = useState(toLocalDatetime(slot.bookingEnd));


  const handleUpdate = (e) => {
    e.preventDefault();
    // Convert local datetime back to ISO string (UTC) for backend
    const toUTCISOString = (local) => {
      if (!local) return null;
      const date = new Date(local);
      return date.toISOString();
    };
    onUpdate({
      ...slot,
      location,
      type,
      bookingStart: toUTCISOString(bookingStart),
      bookingEnd: toUTCISOString(bookingEnd),
    });
  };

  const isReserved = slot.status === 'Reserved';

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
              <EditIcon />
            </div>
            <h3 className="slot-modal-title">Edit Slot</h3>
            <p className="slot-modal-subtitle">
              Modify {formatVehicleType(slot.type)} parking slot details
            </p>
            <div className={`slot-status-badge ${isReserved ? 'reserved' : 'available'}`}>
              {isReserved ? 'Reserved' : 'Available'}
            </div>
          </div>

          {/* Form Section */}
          <form onSubmit={handleUpdate} className="slot-modal-form">
            <div className="form-group">
              <label htmlFor="location" className="slot-modal-label">
                <LocationIcon />
                Slot Location
              </label>
              <input
                type="text"
                id="location"
                className="slot-modal-input"
                value={location}
                onChange={e => setLocation(e.target.value)}
                placeholder="e.g., A-01, B-15, C-03"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="type" className="slot-modal-label">
                {getVehicleIcon(type || 'car', 'slot-icon')}
                Vehicle Type
              </label>
              <select
                id="type"
                className="slot-modal-input"
                value={type}
                onChange={e => setType(e.target.value)}
                required
              >
                <option value="car">Car</option>
                <option value="bike">Bike</option>
                <option value="suv">SUV</option>
                <option value="van">Van</option>
                <option value="minibus">Minibus</option>
              </select>
            </div>

            {isReserved && (
              <>
                <div className="form-group">
                  <label htmlFor="bookingStart" className="slot-modal-label">
                    <ClockIcon />
                    Booking Start
                  </label>
                  <input
                    type="datetime-local"
                    id="bookingStart"
                    className="slot-modal-input"
                    value={bookingStart}
                    onChange={e => setBookingStart(e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="bookingEnd" className="slot-modal-label">
                    <ClockIcon />
                    Booking End
                  </label>
                  <input
                    type="datetime-local"
                    id="bookingEnd"
                    className="slot-modal-input"
                    value={bookingEnd}
                    onChange={e => setBookingEnd(e.target.value)}
                  />
                </div>
              </>
            )}

            {/* Action Buttons */}
            <div className="slot-modal-actions">
              <div className="action-buttons-group">
                <button type="submit" className="slot-modal-btn primary" disabled={actionLoading}>
                  {actionLoading ? (
                    <>
                      <div className="loading-spinner"></div>
                      Updating...
                    </>
                  ) : (
                    'Update Slot'
                  )}
                </button>

                <button
                  type="button"
                  className="slot-modal-btn danger"
                  onClick={() => onDelete(slot.id)}
                  disabled={actionLoading}
                >
                  {actionLoading ? (
                    <>
                      <div className="loading-spinner"></div>
                      Deleting...
                    </>
                  ) : (
                    'Delete Slot'
                  )}
                </button>

                <button
                  type="button"
                  className="slot-modal-btn disabled"
                  onClick={onClose}
                >
                  Cancel
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EditSlotModal;
