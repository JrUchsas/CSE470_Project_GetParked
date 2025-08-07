import React, { useState } from 'react';
import '../custom-editslotmodal.css';

const EditSlotModal = ({ slot, onClose, onUpdate, onDelete, actionLoading }) => {

  const toLocalDatetime = (isoString) => {
    if (!isoString) return '';
    const date = new Date(isoString);
    const tzOffset = date.getTimezoneOffset() * 60000;
    const localISO = new Date(date - tzOffset).toISOString().slice(0,16);
    return localISO;
  };

  const [location, setLocation] = useState(slot.location || '');
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
      bookingStart: toUTCISOString(bookingStart),
      bookingEnd: toUTCISOString(bookingEnd),
    });
  };

  return (
    <div className="edit-slot-modal-overlay">
      <div className="edit-slot-modal-card">
        <button onClick={onClose} className="edit-slot-modal-close">&times;</button>
        <h3 className="text-xl font-bold mb-2">Edit Slot</h3>
        <form onSubmit={handleUpdate}>
          <label className="edit-slot-modal-label">Slot Location (e.g., A-01)</label>
          <input
            type="text"
            className="edit-slot-modal-input"
            value={location}
            onChange={e => setLocation(e.target.value)}
            required
          />
          <label className="edit-slot-modal-label mt-2">Booking Start</label>
          <input
            type="datetime-local"
            className="edit-slot-modal-input"
            value={bookingStart}
            onChange={e => setBookingStart(e.target.value)}
          />
          <label className="edit-slot-modal-label mt-2">Booking End</label>
          <input
            type="datetime-local"
            className="edit-slot-modal-input"
            value={bookingEnd}
            onChange={e => setBookingEnd(e.target.value)}
          />
          <button type="submit" className="edit-slot-modal-btn" disabled={actionLoading}>
            {actionLoading ? 'Updating...' : 'Update Slot'}
          </button>
          <button type="button" className="edit-slot-modal-btn delete" onClick={() => onDelete(slot.id)} disabled={actionLoading}>
            Delete Slot
          </button>
          <button type="button" className="edit-slot-modal-btn cancel" onClick={onClose}>
            Cancel Edit
          </button>
        </form>
      </div>
    </div>
  );
};

export default EditSlotModal;
