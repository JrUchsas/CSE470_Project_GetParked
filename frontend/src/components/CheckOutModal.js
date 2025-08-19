import React from 'react';
import '../custom-slotmodal.css'; // Reusing styles for consistency

const CheckOutModal = ({ slot, onClose, onCheckOut }) => {
  const { parkingSession } = slot; // Destructure parkingSession from slot

  // Format check-in time
  const checkInTime = parkingSession?.checkInTime ? new Date(parkingSession.checkInTime).toLocaleString() : 'N/A';

  return (
    <div className="slot-modal-overlay">
      <div className="slot-modal-card">
        <button
          onClick={onClose}
          className="slot-modal-close"
        >
          &times;
        </button>
        <div className="flex flex-col items-center gap-1">
          <h3 className="text-2xl font-bold mb-2">Slot: {slot.location}</h3>
          <p className="mb-1 text-base text-gray-700">Status: {slot.status}</p>
          <p className="mb-1 text-base text-gray-700">Check-in Time: {checkInTime}</p>
          {parkingSession?.duration && (
            <p className="mb-1 text-base text-gray-700">Duration: {parkingSession.duration} minutes</p>
          )}
          {parkingSession?.fee && (
            <p className="mb-4 text-base text-gray-700">Fee: ${parkingSession.fee}</p>
          )}
          <button
            onClick={onCheckOut}
            className="slot-modal-btn"
          >
            Confirm Check-out
          </button>
        </div>
      </div>
    </div>
  );
};

export default CheckOutModal;
