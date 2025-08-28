import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import DateTimePicker from './DateTimePicker';
import { createShareRequest } from '../services/api';

const ShareRequestModal = ({ slot, requesterId, onClose }) => {
  const navigate = useNavigate();
  const [startTime, setStartTime] = useState(null);
  const [endTime, setEndTime] = useState(null);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!startTime || !endTime) {
      setError('Please select both start and end times.');
      return;
    }

    if (startTime >= endTime) {
      setError('End time must be after start time.');
      return;
    }

    try {
      const shareRequestData = {
        slotId: slot.id,
        requesterId: requesterId,
        startTime: startTime.toISOString(),
        endTime: endTime.toISOString(),
        message: message,
      };
      await createShareRequest(shareRequestData);
      onClose();
      // Optionally, navigate to a success page or show a success message
    } catch (err) {
      setError('Failed to send share request. Please try again.');
      console.error('Share request error:', err);
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
          <div className="slot-modal-header">
            <h3 className="slot-modal-title">Send Share Request</h3>
            <p className="slot-modal-subtitle">Requesting to share slot: <span className="font-semibold">{slot.location}</span></p>
          </div>

          <form onSubmit={handleSubmit} className="slot-modal-form">
            {error && <p className="text-danger" style={{ marginBottom: '1rem' }}>{error}</p>}

            <div className="form-group">
              <label htmlFor="startTime" className="slot-modal-label">Start Time:</label>
              <DateTimePicker
                selected={startTime}
                onChange={(date) => setStartTime(date)}
                showTimeSelect
                dateFormat="Pp"
                id="startTime"
                className="slot-modal-input"
              />
            </div>
            <div className="form-group">
              <label htmlFor="endTime" className="slot-modal-label">End Time:</label>
              <DateTimePicker
                selected={endTime}
                onChange={(date) => setEndTime(date)}
                showTimeSelect
                dateFormat="Pp"
                id="endTime"
                className="slot-modal-input"
              />
            </div>
            <div className="form-group">
              <label htmlFor="message" className="slot-modal-label">Message (Optional):</label>
              <textarea
                id="message"
                rows="3"
                className="slot-modal-input"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
              ></textarea>
            </div>

            <div className="slot-modal-actions">
              <div className="action-buttons-group">
                <button
                  type="submit"
                  className="slot-modal-btn primary"
                >
                  Send Request
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  className="slot-modal-btn disabled"
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

export default ShareRequestModal;
