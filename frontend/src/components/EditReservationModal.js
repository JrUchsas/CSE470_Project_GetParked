import React, { useState, useEffect } from 'react';
import DateTimePicker from './DateTimePicker';
import '../styles/custom-slotmodal.css';

const EditReservationModal = ({ reservation, onClose, onUpdate }) => {
  const [formData, setFormData] = useState({
    reservedStart: '',
    reservedEnd: '',
    checkInTime: '',
    checkOutTime: '',
    duration: '',
    fee: '',
    paymentStatus: '',
    violationType: '',
    penaltyFee: '',
  });

  useEffect(() => {
    if (reservation) {
      setFormData({
        reservedStart: reservation.reservedStart || '',
        reservedEnd: reservation.reservedEnd || '',
        checkInTime: reservation.checkInTime || '',
        checkOutTime: reservation.checkOutTime || '',
        duration: reservation.duration || '',
        fee: reservation.fee || '',
        paymentStatus: reservation.paymentStatus || '',
        violationType: reservation.violationType || '',
        penaltyFee: reservation.penaltyFee || '',
      });
    }
  }, [reservation]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleDateTimeChange = (name, date) => {
    setFormData({ ...formData, [name]: date });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onUpdate({ ...reservation, ...formData });
  };

  return (
    <div className="slot-modal-overlay" onClick={onClose}>
      <div className="slot-modal-card" onClick={(e) => e.stopPropagation()}>
        <button onClick={onClose} className="slot-modal-close" aria-label="Close modal">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
        <div className="slot-modal-content">
          <h2 className="slot-modal-title">Edit Reservation</h2>
          <p className="slot-modal-subtitle">Slot: {reservation.slotLocation} | Vehicle: {reservation.vehiclePlate}</p>
          <form onSubmit={handleSubmit} className="slot-modal-form">
            <div className="form-group">
              <label htmlFor="reservedStart" className="slot-modal-label">Reserved Start</label>
              <DateTimePicker
                value={formData.reservedStart}
                onChange={(date) => handleDateTimeChange('reservedStart', date)}
                label="Reserved Start"
                placeholder="Select reserved start time"
              />
            </div>
            <div className="form-group">
              <label htmlFor="reservedEnd" className="slot-modal-label">Reserved End</label>
              <DateTimePicker
                value={formData.reservedEnd}
                onChange={(date) => handleDateTimeChange('reservedEnd', date)}
                label="Reserved End"
                placeholder="Select reserved end time"
              />
            </div>
            <div className="form-group">
              <label htmlFor="checkInTime" className="slot-modal-label">Check-in Time</label>
              <DateTimePicker
                value={formData.checkInTime}
                onChange={(date) => handleDateTimeChange('checkInTime', date)}
                label="Check-in Time"
                placeholder="Select check-in time"
              />
            </div>
            <div className="form-group">
              <label htmlFor="checkOutTime" className="slot-modal-label">Check-out Time</label>
              <DateTimePicker
                value={formData.checkOutTime}
                onChange={(date) => handleDateTimeChange('checkOutTime', date)}
                label="Check-out Time"
                placeholder="Select check-out time"
              />
            </div>
            <div className="form-group">
              <label htmlFor="duration" className="slot-modal-label">Duration (minutes)</label>
              <input
                type="number"
                name="duration"
                id="duration"
                value={formData.duration}
                onChange={handleChange}
                className="slot-modal-input"
              />
            </div>
            <div className="form-group">
              <label htmlFor="fee" className="slot-modal-label">Fee</label>
              <input
                type="number"
                name="fee"
                id="fee"
                value={formData.fee}
                onChange={handleChange}
                className="slot-modal-input"
              />
            </div>
            <div className="form-group">
              <label htmlFor="paymentStatus" className="slot-modal-label">Payment Status</label>
              <select
                name="paymentStatus"
                id="paymentStatus"
                value={formData.paymentStatus}
                onChange={handleChange}
                className="slot-modal-input"
              >
                <option value="Paid">Paid</option>
                <option value="Not Paid">Not Paid</option>
                <option value="Pending">Pending</option>
              </select>
            </div>
            <div className="form-group">
              <label htmlFor="violationType" className="slot-modal-label">Violation Type</label>
              <input
                type="text"
                name="violationType"
                id="violationType"
                value={formData.violationType}
                onChange={handleChange}
                className="slot-modal-input"
              />
            </div>
            <div className="form-group">
              <label htmlFor="penaltyFee" className="slot-modal-label">Penalty Fee</label>
              <input
                type="number"
                name="penaltyFee"
                id="penaltyFee"
                value={formData.penaltyFee}
                onChange={handleChange}
                className="slot-modal-input"
              />
            </div>
            <div className="slot-modal-actions">
              <button type="submit" className="slot-modal-btn primary">Update Reservation</button>
              <button type="button" onClick={onClose} className="slot-modal-btn disabled">Cancel</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EditReservationModal;
